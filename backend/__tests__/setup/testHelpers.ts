/**
 * Test Helpers — Factory functions for creating real DB records.
 * All helpers create REAL documents in the test MongoDB.
 * No mocking.
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

import User from "../../src/models/User.ts";
import { Admin } from "../../src/models/Admin.ts";
import TrackedProblem from "../../src/models/TrackedProblem.ts";
import Track from "../../src/models/Track.ts";
import LearningDoc from "../../src/models/LearningDoc.ts";

// Ensure env is loaded
dotenv.config({ path: ".env" });

const JWT_SECRET = process.env.JWT_SECRET || "test-secret";

let mongoServer: MongoMemoryServer;

/**
 * Connects to the test database if not already connected.
 */
export async function connectTestDB() {
  if (mongoose.connection.readyState === 0) {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }
}

/**
 * Disconnects from the test database.
 */
export async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

/**
 * Cleans all documents from all collections in the test database.
 */
export async function cleanCollections() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Creates a test user and returns the user document + a valid JWT token.
 */
export async function createTestUser(overrides: Record<string, any> = {}) {
  const userData = {
    name: "Test User",
    email: `testuser-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
    googleId: `google-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    tokenVersion: 0,
    ...overrides,
  };

  const user = await User.create(userData);

  const token = jwt.sign(
    { userId: user._id.toString(), tokenVersion: user.tokenVersion },
    JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { user, token };
}

/**
 * Creates a test admin and returns the admin document + a valid JWT token.
 * Note: Admin JWT uses { id: admin._id } (not { userId }) per adminAuthMiddleware.
 */
export async function createTestAdmin(overrides: Record<string, any> = {}) {
  const adminData = {
    name: "Test Admin",
    email: `testadmin-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
    googleId: `google-admin-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    tokenVersion: 0,
    ...overrides,
  };

  const admin = await Admin.create(adminData);

  const token = jwt.sign(
    { id: admin._id.toString() },
    JWT_SECRET,
    { expiresIn: "1d" },
  );

  return { admin, token };
}

/**
 * Creates a test tracked problem for a given user.
 */
export async function createTestProblem(
  userId: string,
  overrides: Record<string, any> = {},
) {
  const slug = `test-problem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const problemData = {
    userId,
    titleSlug: slug,
    title: `Test Problem ${slug}`,
    url: `https://leetcode.com/problems/${slug}/`,
    difficulty: "Medium" as const,
    attemptCount: 1,
    lastAttemptedDate: new Date(),
    notrack: false,
    ...overrides,
  };

  return TrackedProblem.create(problemData);
}

/**
 * Creates a test track with sample problems.
 */
export async function createTestTrack(overrides: Record<string, any> = {}) {
  const trackData = {
    title: `Test Track ${Date.now()}`,
    description: "A test track for integration testing",
    problems: [
      {
        title: "Two Sum",
        titleSlug: "two-sum",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/two-sum/",
      },
    ],
    parts: [],
    ...overrides,
  };

  return Track.create(trackData);
}

/**
 * Creates a test learning document.
 */
export async function createTestDoc(overrides: Record<string, any> = {}) {
  const docData = {
    filename: `test-doc-${Date.now()}.md`,
    title: `Test Document ${Date.now()}`,
    tags: ["test", "integration"],
    content: "---\ntitle: Test\n---\n\n# Test Document\n\nSome content here.",
    ...overrides,
  };

  return LearningDoc.create(docData);
}

/**
 * Returns the Authorization header object for a given token.
 */
export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Generates a JWT token for a non-existent user (for testing auth failures).
 */
export function generateFakeToken(userId?: string, tokenVersion?: number) {
  return jwt.sign(
    {
      userId: userId || new mongoose.Types.ObjectId().toString(),
      tokenVersion: tokenVersion ?? 0,
    },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
}

/**
 * Generates an expired JWT token.
 */
export function generateExpiredToken(userId: string) {
  return jwt.sign(
    { userId, tokenVersion: 0 },
    JWT_SECRET,
    { expiresIn: "0s" }, // Immediately expired
  );
}
