import mongoose from "mongoose";
import User from "../../src/models/User.ts";
import { connectTestDB, disconnectTestDB, cleanCollections } from "../setup/testHelpers.ts";

describe("User Model", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await cleanCollections();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it("creates a user with valid data", async () => {
    const user = new User({
      name: "Test User",
      email: "test@example.com",
    });
    const savedUser = await user.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe("Test User");
    expect(savedUser.email).toBe("test@example.com");
    expect(savedUser.tokenVersion).toBe(0); // Default
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  it("requires name and email", async () => {
    const user = new User({});
    
    let error;
    try {
      await user.save();
    } catch (e: any) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  it("enforces unique email", async () => {
    await User.create({
      name: "User One",
      email: "duplicate@example.com",
    });

    const duplicateUser = new User({
      name: "User Two",
      email: "duplicate@example.com",
    });

    let error;
    try {
      await duplicateUser.save();
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });

  it("lowercases and trims email", async () => {
    const user = new User({
      name: "Test User",
      email: "  MIXEDcase@Example.com  ",
    });
    const savedUser = await user.save();
    
    expect(savedUser.email).toBe("mixedcase@example.com");
  });

  it("allows sparse unique googleId (multiple users can have no googleId)", async () => {
    await User.create({
      name: "User One",
      email: "one@example.com",
      // No googleId
    });

    await User.create({
      name: "User Two",
      email: "two@example.com",
      // No googleId
    });

    const usersCount = await User.countDocuments();
    expect(usersCount).toBe(2);
  });
  
  it("enforces unique googleId if provided", async () => {
    await User.create({
      name: "User One",
      email: "one@example.com",
      googleId: "12345",
    });

    const userTwo = new User({
      name: "User Two",
      email: "two@example.com",
      googleId: "12345", // Duplicate
    });

    let error;
    try {
      await userTwo.save();
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Duplicate key
  });
});
