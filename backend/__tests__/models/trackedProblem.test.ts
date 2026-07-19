import mongoose from "mongoose";
import TrackedProblem from "../../src/models/TrackedProblem.ts";
import { connectTestDB, disconnectTestDB, cleanCollections } from "../setup/testHelpers.ts";

describe("TrackedProblem Model", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await cleanCollections();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it("creates a problem with valid data", async () => {
    const problem = new TrackedProblem({
      userId: "user_123",
      titleSlug: "two-sum",
      title: "Two Sum",
      url: "https://leetcode.com/problems/two-sum/",
      difficulty: "Easy",
    });
    
    const saved = await problem.save();
    
    expect(saved._id).toBeDefined();
    expect(saved.userId).toBe("user_123");
    expect(saved.titleSlug).toBe("two-sum");
    expect(saved.attemptCount).toBe(1); // Default
    expect(saved.notrack).toBe(false); // Default
    expect(saved.lastAttemptedDate).toBeDefined(); // Default to now
    expect(saved.createdAt).toBeDefined();
  });

  it("requires userId, titleSlug, and title", async () => {
    const problem = new TrackedProblem({});
    
    let error;
    try {
      await problem.save();
    } catch (e: any) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.userId).toBeDefined();
    expect(error.errors.titleSlug).toBeDefined();
    expect(error.errors.title).toBeDefined();
  });

  it("enforces compound unique { userId, titleSlug }", async () => {
    await TrackedProblem.create({
      userId: "user_123",
      titleSlug: "two-sum",
      title: "Two Sum",
    });

    const duplicate = new TrackedProblem({
      userId: "user_123", // Same user
      titleSlug: "two-sum", // Same problem
      title: "Two Sum Again",
    });

    let error;
    try {
      await duplicate.save();
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Duplicate key
  });

  it("allows same titleSlug for different userIds", async () => {
    await TrackedProblem.create({
      userId: "user_123",
      titleSlug: "two-sum",
      title: "Two Sum",
    });

    const differentUser = new TrackedProblem({
      userId: "user_456", // Different user
      titleSlug: "two-sum", // Same problem
      title: "Two Sum",
    });

    // Should not throw error
    const saved = await differentUser.save();
    expect(saved._id).toBeDefined();
  });

  it("validates difficulty enum", async () => {
    const problem = new TrackedProblem({
      userId: "user_123",
      titleSlug: "two-sum",
      title: "Two Sum",
      difficulty: "SuperHard", // Invalid
    });

    let error;
    try {
      await problem.save();
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.difficulty).toBeDefined();
  });

  it("enforces attemptCount min 1", async () => {
    const problem = new TrackedProblem({
      userId: "user_123",
      titleSlug: "two-sum",
      title: "Two Sum",
      attemptCount: 0, // Invalid
    });

    let error;
    try {
      await problem.save();
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.attemptCount).toBeDefined();
  });

  it("enforces notes maxlength 2000", async () => {
    const longNotes = "A".repeat(2001);
    const problem = new TrackedProblem({
      userId: "user_123",
      titleSlug: "two-sum",
      title: "Two Sum",
      notes: longNotes, // Invalid
    });

    let error;
    try {
      await problem.save();
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.notes).toBeDefined();
  });
});
