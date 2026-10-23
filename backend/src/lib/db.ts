/**
 * @file db.ts
 * @description Framework-agnostic MongoDB/Mongoose connection manager.
 * Features:
 *   - Global connection caching via globalThis (survives serverless warm starts)
 *   - Single-flight coalescing (concurrent calls share one in-flight connect)
 *   - 3-retry exponential backoff with Full Jitter
 *   - Credential masking in all logs and error objects
 *   - Fail-fast URI validation (no retries wasted on invalid config)
 *   - Connection lifecycle event listeners with cache invalidation
 *   - Post-connection index migrations for Clerk-era schema cleanups
 *   - Health probes (liveness and ping-based readiness)
 *   - Test helper to reset cache between test runs
 */

import mongoose from "mongoose";

// ─── Types ───────────────────────────────────────────────────────────

export interface ConnectDBOptions {
  retries?: number;             // Default: 3
  initialBackoffMs?: number;    // Default: 1000ms
  maxBackoffMs?: number;        // Default: 5000ms
  jitter?: boolean;             // Default: true (Full Jitter)
  mongooseOptions?: mongoose.ConnectOptions;
  logger?: {
    info?: (msg: string) => void;
    warn?: (msg: string) => void;
    error?: (msg: string | Error, ...args: any[]) => void;
  };
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// ─── Global Cache ────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __dsaMongooseCache: MongooseCache | undefined;
}

const getCache = (): MongooseCache => {
  if (!globalThis.__dsaMongooseCache) {
    globalThis.__dsaMongooseCache = { conn: null, promise: null };
  }
  return globalThis.__dsaMongooseCache;
};

// ─── Custom Error ────────────────────────────────────────────────────

export class DatabaseConnectionError extends Error {
  public readonly attempts: number;
  public readonly sanitizedUri?: string;

  constructor(message: string, options?: { cause?: unknown; attempts?: number; uri?: string }) {
    super(message);
    this.name = "DatabaseConnectionError";
    this.attempts = options?.attempts ?? 0;
    this.sanitizedUri = options?.uri;
    if (options?.cause) this.cause = options.cause;
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
}

// ─── Credential Masking ──────────────────────────────────────────────

export function maskMongoUri(uri?: string): string {
  if (!uri || typeof uri !== "string") return "";
  try {
    return uri.replace(/\/\/(.*?)@/, (_match, creds) => {
      const parts = creds.split(":");
      return parts.length >= 2 ? `//${parts[0]}:****@` : `//****@`;
    });
  } catch {
    return "mongodb://[masked]";
  }
}

// ─── Post-Connection Index Migrations ─────────────────────────────────

async function runPostConnectionMigrations(conn: typeof mongoose, logger: any) {
  try {
    const db = conn.connection.db;
    if (!db) return;

    // 1. Clean users collection: drop stale clerkUserId index
    try {
      const usersCollection = db.collection("users");
      const userIndexes = await usersCollection.indexes();
      const staleUserIndexes = ["clerkUserId_1"];
      for (const idx of userIndexes) {
        if (staleUserIndexes.includes(idx.name)) {
          await usersCollection.dropIndex(idx.name);
          if (process.env.NODE_ENV !== "production") {
            logger.info?.(
              `[DB] ✓ Migration: dropped stale index "${idx.name}" from users collection.`
            );
          }
        }
      }
    } catch (userErr: unknown) {
      const msg = userErr instanceof Error ? userErr.message : String(userErr);
      if (!msg.includes("ns not found") && !msg.includes("ns does not exist")) {
        logger.warn?.(`[DB] ⚠ users migration warning: ${msg}`);
      }
    }

    // 2. Clean problemprogresses collection: drop stale unique titleSlug index
    try {
      const problemsCollection = db.collection("problemprogresses");
      const problemIndexes = await problemsCollection.indexes();
      const staleProblemIndexes = ["titleSlug_1"];
      for (const idx of problemIndexes) {
        if (staleProblemIndexes.includes(idx.name) && idx.unique) {
          await problemsCollection.dropIndex(idx.name);
          if (process.env.NODE_ENV !== "production") {
            logger.info?.(
              `[DB] ✓ Migration: dropped stale index "${idx.name}" from problemprogresses collection.`
            );
          }
        }
      }
    } catch (problemErr: unknown) {
      const msg = problemErr instanceof Error ? problemErr.message : String(problemErr);
      if (!msg.includes("ns not found") && !msg.includes("ns does not exist")) {
        logger.warn?.(`[DB] ⚠ problemprogresses migration: ${msg}`);
      }
    }
  } catch (migrationErr: unknown) {
    const message = migrationErr instanceof Error ? migrationErr.message : String(migrationErr);
    if (!message.includes("index not found")) {
      logger.warn?.(`[DB] ⚠ Migration warning: ${message}`);
    }
  }
}

// ─── Connection Lifecycle Listeners ──────────────────────────────────

let listenersAttached = false;
let activeLogger: any = console;

function setupConnectionListeners(logger: any) {
  activeLogger = logger;
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("connected", () => {
    activeLogger.info?.("[MongoDB] Connection established successfully.");
  });
  mongoose.connection.on("error", (err: any) => {
    activeLogger.error?.("[MongoDB] Runtime connection error:", err?.message || err);
  });
  mongoose.connection.on("disconnected", () => {
    activeLogger.warn?.("[MongoDB] Connection lost. Invalidating cache.");
    const cache = getCache();
    cache.conn = null;
    cache.promise = null;
  });
  mongoose.connection.on("reconnected", () => {
    activeLogger.info?.("[MongoDB] Reconnected successfully.");
  });
}

// ─── Connect (with retry, caching, coalescing) ──────────────────────

export async function connectDB(
  uri?: string,
  optionsOrRetries: ConnectDBOptions | number = 3
): Promise<typeof mongoose> {
  const options: ConnectDBOptions =
    typeof optionsOrRetries === "number" ? { retries: optionsOrRetries } : optionsOrRetries || {};
  const targetUri = uri || process.env.MONGODB_URI;

  // Fail-fast: validate URI before any retry attempts
  if (!targetUri || typeof targetUri !== "string" || targetUri.trim() === "") {
    throw new DatabaseConnectionError(
      "MongoDB URI is required. Provide a valid connection string or set MONGODB_URI.",
      { attempts: 0, uri: "" }
    );
  }

  const cache = getCache();
  const logger = options.logger ?? console;

  // 1. Reuse existing connection if active
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;
  if (mongoose.connection.readyState === 1) {
    cache.conn = mongoose;
    return mongoose;
  }

  // 2. Coalesce concurrent connection attempts (single-flight pattern)
  if (cache.promise) return cache.promise;

  // 3. Initiate retry mechanism with Full Jitter backoff
  const retries = options.retries ?? 3;
  const initialBackoffMs = options.initialBackoffMs ?? 1000;
  const maxBackoffMs = options.maxBackoffMs ?? 5000;
  const useJitter = options.jitter ?? true;

  setupConnectionListeners(logger);

  cache.promise = (async () => {
    let lastError: unknown;

    // Detect runtime model for pool tuning
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const defaultOptions: mongoose.ConnectOptions = {
          maxPoolSize: isServerless ? 5 : 10,
          minPoolSize: isServerless ? 0 : 2,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: isServerless ? 30000 : 45000,
          bufferCommands: false, // CRITICAL: fail-fast, never queue in frozen containers
          ...options.mongooseOptions,
        };

        const conn = await mongoose.connect(targetUri, defaultOptions);
        cache.conn = conn;

        // Run post-connection migrations asynchronously
        await runPostConnectionMigrations(conn, logger);

        return conn;
      } catch (err) {
        lastError = err;
        cache.conn = null;

        if (attempt < retries) {
          const expDelay = Math.min(initialBackoffMs * 2 ** (attempt - 1), maxBackoffMs);
          const delay = useJitter ? Math.floor(Math.random() * expDelay) + 50 : expDelay;
          logger.warn?.(
            `[MongoDB] Attempt ${attempt}/${retries} failed: ${(err as Error)?.message || String(err)}. Retrying in ${delay}ms...`
          );
          await new Promise((r) => setTimeout(r, delay));
        } else {
          logger.error?.(
            `[MongoDB] Connection failed after ${retries} attempts: ${(err as Error)?.message || String(err)}`
          );
        }
      }
    }

    cache.promise = null;
    throw new DatabaseConnectionError(
      `Failed to connect to MongoDB after ${retries} attempts. Cause: ${(lastError as Error)?.message || String(lastError)}`,
      { cause: lastError, attempts: retries, uri: maskMongoUri(targetUri) }
    );
  })();

  try {
    return await cache.promise;
  } catch (error) {
    cache.promise = null;
    cache.conn = null;
    throw error;
  }
}

// ─── Disconnect ──────────────────────────────────────────────────────

export async function disconnectDB(): Promise<void> {
  const cache = getCache();
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } finally {
    cache.conn = null;
    cache.promise = null;
  }
}

// ─── Health Check ────────────────────────────────────────────────────

export async function checkDatabaseHealth(): Promise<{
  ok: boolean;
  readyState: number;
  status: string;
  pingLatencyMs?: number;
  error?: string;
}> {
  const state = mongoose.connection.readyState;
  const statusNames = ["disconnected", "connected", "connecting", "disconnecting"];
  const status = statusNames[state] || "unknown";

  if (state !== 1 || !mongoose.connection.db) {
    return { ok: false, readyState: state, status };
  }

  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    return { ok: true, readyState: state, status, pingLatencyMs: Date.now() - start };
  } catch (err: any) {
    return { ok: false, readyState: state, status, error: err.message };
  }
}

// ─── Test Helper ─────────────────────────────────────────────────────

export function _resetConnectionCacheForTesting(): void {
  const cache = getCache();
  cache.conn = null;
  cache.promise = null;
}
