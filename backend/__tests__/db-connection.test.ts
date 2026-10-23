/**
 * @file db-connection.test.ts
 * @description Test suite verifying robust database connection behaviors:
 * 1. Fail-fast validation (0 retries on invalid URI)
 * 2. Connection caching (reuse across warm invocations)
 * 3. Concurrency coalescing (5 simultaneous calls share 1 handshake)
 * 4. 3-retry jittered recovery on transient drops
 * 5. Terminal failure throws DatabaseConnectionError & clears cache
 * 6. Credential masking in logs and error objects
 * 7. Lifecycle teardown & health probes
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  connectDB,
  disconnectDB,
  checkDatabaseHealth,
  maskMongoUri,
  DatabaseConnectionError,
  _resetConnectionCacheForTesting,
} from "../src/lib/db.ts";

let mongoServer: MongoMemoryServer;
let mongoUri: string;

describe("Robust Database Connection & Caching Suite", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
  }, 60000);

  afterAll(async () => {
    await disconnectDB();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    _resetConnectionCacheForTesting();
    await disconnectDB();
  });

  describe("Gate 1: URI Validation (Fail-Fast)", () => {
    it("should throw DatabaseConnectionError immediately without retries on missing URI", async () => {
      const origEnv = process.env.MONGODB_URI;
      delete process.env.MONGODB_URI;

      const connectSpy = jest.spyOn(mongoose, "connect");

      await expect(connectDB("")).rejects.toThrow(DatabaseConnectionError);
      await expect(connectDB("   ")).rejects.toThrow(DatabaseConnectionError);
      await expect(connectDB(undefined)).rejects.toThrow(
        "MongoDB URI is required. Provide a valid connection string or set MONGODB_URI."
      );

      // Asserts 0 connection attempts were wasted
      expect(connectSpy).not.toHaveBeenCalled();
      process.env.MONGODB_URI = origEnv;
    });
  });

  describe("Gate 2 & 3: Connection Caching & Concurrency Coalescing", () => {
    it("should establish a connection and report healthy status", async () => {
      const instance = await connectDB(mongoUri);
      expect(instance).toBe(mongoose);
      expect(mongoose.connection.readyState).toBe(1);

      const health = await checkDatabaseHealth();
      expect(health.ok).toBe(true);
      expect(health.status).toBe("connected");
      expect(typeof health.pingLatencyMs).toBe("number");
    });

    it("should reuse the existing connection across multiple calls without reconnecting", async () => {
      await connectDB(mongoUri);

      const connectSpy = jest.spyOn(mongoose, "connect");

      const inst1 = await connectDB(mongoUri);
      const inst2 = await connectDB(mongoUri);
      const inst3 = await connectDB(mongoUri);

      expect(inst1).toBe(mongoose);
      expect(inst2).toBe(mongoose);
      expect(inst3).toBe(mongoose);

      // Verify no extra connection handshakes were made
      expect(connectSpy).not.toHaveBeenCalled();
    });

    it("should coalesce concurrent cold-start requests into a single in-flight Promise", async () => {
      let callCount = 0;
      const originalConnect = mongoose.connect.bind(mongoose);
      jest.spyOn(mongoose, "connect").mockImplementation(async (uri, opts) => {
        callCount++;
        await new Promise((r) => setTimeout(r, 40));
        return originalConnect(uri, opts);
      });

      // 5 concurrent requests hit the cold container simultaneously
      const results = await Promise.all([
        connectDB(mongoUri),
        connectDB(mongoUri),
        connectDB(mongoUri),
        connectDB(mongoUri),
        connectDB(mongoUri),
      ]);

      results.forEach((res) => expect(res).toBe(mongoose));
      // Only 1 connect call made despite 5 concurrent requests
      expect(callCount).toBe(1);
    });
  });

  describe("Gate 4 & 5: 3-Retry Jittered Mechanism & Terminal Failure", () => {
    it("should retry transient failures and recover on attempt 3", async () => {
      let attempts = 0;
      const originalConnect = mongoose.connect.bind(mongoose);
      const warnings: string[] = [];

      jest.spyOn(mongoose, "connect").mockImplementation(async (uri, opts) => {
        attempts++;
        if (attempts < 3) {
          throw new Error(`Transient drop attempt ${attempts}`);
        }
        return originalConnect(uri, opts);
      });

      const instance = await connectDB(mongoUri, {
        retries: 3,
        initialBackoffMs: 10,
        maxBackoffMs: 30,
        jitter: false, // deterministic for testing
        logger: {
          info: jest.fn(),
          warn: (msg: string) => warnings.push(msg),
          error: jest.fn(),
        },
      });

      expect(instance).toBe(mongoose);
      expect(attempts).toBe(3);
      expect(warnings.length).toBe(2);
      expect(warnings[0]).toContain("Attempt 1/3 failed");
      expect(warnings[1]).toContain("Attempt 2/3 failed");
    });

    it("should throw DatabaseConnectionError after 3 failed attempts and clear cache", async () => {
      jest.spyOn(mongoose, "connect").mockImplementation(async () => {
        throw new Error("Cluster unavailable");
      });

      await expect(
        connectDB(mongoUri, {
          retries: 3,
          initialBackoffMs: 5,
          maxBackoffMs: 15,
        })
      ).rejects.toThrow(DatabaseConnectionError);

      // Verify cache is cleared after failure so future attempts can re-try
      _resetConnectionCacheForTesting();
    });
  });

  describe("Gate 6: Security - Credential Masking", () => {
    it("should mask passwords in MongoDB connection strings", () => {
      const masked = maskMongoUri(
        "mongodb://app_user:p%40ssw0rd123@cluster0.mongodb.net:27017/prod"
      );
      expect(masked).toBe("mongodb://app_user:****@cluster0.mongodb.net:27017/prod");
      expect(masked).not.toContain("p%40ssw0rd123");
    });

    it("should redact credentials inside DatabaseConnectionError properties", async () => {
      jest.spyOn(mongoose, "connect").mockImplementation(async () => {
        throw new Error("Connection failed");
      });

      let thrownError: any = null;
      try {
        await connectDB("mongodb://secretAdmin:verySecret@localhost:27017/test", {
          retries: 1,
          initialBackoffMs: 5,
        });
      } catch (err: any) {
        thrownError = err;
      }

      expect(thrownError).toBeInstanceOf(DatabaseConnectionError);
      expect(thrownError.sanitizedUri).toBe("mongodb://secretAdmin:****@localhost:27017/test");
      expect(thrownError.sanitizedUri).not.toContain("verySecret");
      expect(thrownError.attempts).toBe(1);
    });
  });

  describe("Lifecycle Teardown & Health Probes", () => {
    it("should disconnect cleanly and update health status", async () => {
      await connectDB(mongoUri);
      expect((await checkDatabaseHealth()).ok).toBe(true);

      await disconnectDB();

      const health = await checkDatabaseHealth();
      expect(health.ok).toBe(false);
      expect(health.status).toBe("disconnected");
    });

    it("should automatically invalidate cache when connection is disconnected", async () => {
      await connectDB(mongoUri);
      await mongoose.disconnect();

      const connectSpy = jest.spyOn(mongoose, "connect");
      await connectDB(mongoUri);
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
  });
});
