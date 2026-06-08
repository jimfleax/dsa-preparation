import mongoose from "mongoose";

/**
 * Redacts a MongoDB URI for safe console logging.
 * Masks the password portion while keeping host/db visible for diagnostics.
 * e.g. "mongodb+srv://user:p4ssw0rd@cluster.mongodb.net/mydb" → "mongodb+srv://user:****@cluster.mongodb.net/mydb"
 */
function redactUri(uri: string): string {
  try {
    return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
  } catch {
    return "(unable to parse URI)";
  }
}

/**
 * Attempts to connect to MongoDB Atlas.
 * Non-fatal: the server will start even if the DB is unavailable.
 * Problem-tracking routes will fail gracefully when there's no connection.
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("[DB] ⚠ MONGODB_URI is not set.");
    console.warn(
      "[DB]   Problem tracking, user settings, and sync features will be unavailable.",
    );
    console.warn(
      "[DB]   Set MONGODB_URI in .env or environment variables to enable database features.",
    );
    return;
  }

  // Basic URI format check before attempting connection
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    console.error(
      '[DB] ✗ MONGODB_URI has invalid format — must start with "mongodb://" or "mongodb+srv://".',
    );
    console.error(`[DB]   Received prefix: "${uri.substring(0, 20)}..."`);
    console.warn("[DB]   Server will continue without MongoDB.");
    return;
  }

  console.log(`[DB] Connecting to ${redactUri(uri)} ...`);

  try {
    const conn = await mongoose.connect(uri);
    console.log(
      `[DB] ✓ MongoDB Connected: ${conn.connection.host} (db: ${conn.connection.name})`,
    );

    // ── Post-connection migration: drop stale Clerk-era indexes ──
    // MongoDB does NOT auto-drop indexes when the Mongoose schema changes.
    // The old Clerk schema had a unique index on `clerkUserId`, which now
    // causes E11000 duplicate key errors because every new user has null.
    // Similarly, problemprogresses may have a stale unique index on titleSlug
    // alone (not compound with userId), blocking multi-tenant tracking.
    try {
      const db = conn.connection.db;
      if (db) {
        // Clean users collection
        const usersCollection = db.collection("users");
        const userIndexes = await usersCollection.indexes();
        const staleUserIndexes = ["clerkUserId_1"];
        for (const idx of userIndexes) {
          if (staleUserIndexes.includes(idx.name)) {
            await usersCollection.dropIndex(idx.name);
            console.log(
              `[DB] ✓ Migration: dropped stale index "${idx.name}" from users collection.`,
            );
          }
        }

        // Clean problemprogresses collection
        const problemsCollection = db.collection("problemprogresses");
        try {
          const problemIndexes = await problemsCollection.indexes();
          console.log(
            "[DB] Current problemprogresses indexes:",
            problemIndexes
              .map(
                (i) =>
                  `${i.name} (${JSON.stringify(i.key)}${i.unique ? ", unique" : ""})`,
              )
              .join(", "),
          );

          // Drop any unique index on titleSlug alone — it should only be unique
          // as part of the compound {userId, titleSlug} index for multi-tenancy.
          const staleProblemIndexes = ["titleSlug_1"];
          for (const idx of problemIndexes) {
            if (staleProblemIndexes.includes(idx.name) && idx.unique) {
              await problemsCollection.dropIndex(idx.name);
              console.log(
                `[DB] ✓ Migration: dropped stale index "${idx.name}" from problemprogresses collection.`,
              );
            }
          }
        } catch (e: any) {
          // Collection may not exist yet — that's fine
          if (!e.message?.includes("ns not found")) {
            console.warn(`[DB] ⚠ problemprogresses migration: ${e.message}`);
          }
        }
      }
    } catch (migrationErr: any) {
      // Non-fatal: log and continue — index may already be gone
      if (!migrationErr.message?.includes("index not found")) {
        console.warn(`[DB] ⚠ Migration warning: ${migrationErr.message}`);
      }
    }
  } catch (error) {
    const err = error as Error;
    console.error("[DB] ✗ MongoDB Connection Failed");
    console.error(`[DB]   Error: ${err.message}`);

    // Log specific diagnostic hints based on common failure patterns
    if (
      err.message.includes("ENOTFOUND") ||
      err.message.includes("getaddrinfo")
    ) {
      console.error(
        "[DB]   Hint: DNS resolution failed. Check your cluster hostname in MONGODB_URI.",
      );
    } else if (
      err.message.includes("Authentication failed") ||
      err.message.includes("auth")
    ) {
      console.error(
        "[DB]   Hint: Authentication rejected. Verify username/password in MONGODB_URI.",
      );
    } else if (err.message.includes("ECONNREFUSED")) {
      console.error(
        "[DB]   Hint: Connection refused. Ensure MongoDB is running and the port is correct.",
      );
    } else if (
      err.message.includes("timed out") ||
      err.message.includes("ETIMEOUT")
    ) {
      console.error(
        "[DB]   Hint: Connection timed out. Check network/firewall rules and IP whitelist on Atlas.",
      );
    }

    console.error(`[DB]   Target: ${redactUri(uri)}`);
    console.warn(
      "[DB]   Server will continue without MongoDB. Database features will be unavailable.",
    );
    return;
  }

  // Runtime error listener — logs errors without crashing
  mongoose.connection.on("error", (err) => {
    console.error("[DB] ✗ MongoDB runtime error:", err.message || err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn(
      "[DB] ⚠ MongoDB connection lost. Attempting automatic reconnect...",
    );
  });

  mongoose.connection.on("reconnected", () => {
    console.log("[DB] ✓ MongoDB reconnected successfully.");
  });
};

// Graceful shutdown: close DB connection on process termination signals
const gracefulShutdown = async (signal: string) => {
  if (mongoose.connection.readyState === 1) {
    console.log(`\n[DB] ${signal} received. Closing MongoDB connection...`);
    await mongoose.connection.close();
    console.log("[DB] MongoDB disconnected on app termination.");
  }
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
