import mongoose from "mongoose";
import LearningDoc from "../../src/models/LearningDoc.ts";
import { connectTestDB, disconnectTestDB, cleanCollections } from "../setup/testHelpers.ts";

describe("LearningDoc Model", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await cleanCollections();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it("creates a doc with valid data", async () => {
    const doc = new LearningDoc({
      filename: "test.md",
      title: "Test Document",
      content: "# Hello World",
      tags: ["test", "jest"],
    });
    
    const saved = await doc.save();
    
    expect(saved._id).toBeDefined();
    expect(saved.filename).toBe("test.md");
    expect(saved.title).toBe("Test Document");
    expect(saved.content).toBe("# Hello World");
    expect(saved.tags).toEqual(["test", "jest"]);
    expect(saved.createdAt).toBeDefined();
  });

  it("requires filename, title, and content", async () => {
    const doc = new LearningDoc({});
    
    let error;
    try {
      await doc.save();
    } catch (e: any) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.filename).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.content).toBeDefined();
  });

  it("enforces unique filename", async () => {
    await LearningDoc.create({
      filename: "unique.md",
      title: "Doc 1",
      content: "Content 1",
    });

    const duplicate = new LearningDoc({
      filename: "unique.md",
      title: "Doc 2",
      content: "Content 2",
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

  it("defaults tags to empty array", async () => {
    const doc = new LearningDoc({
      filename: "no-tags.md",
      title: "Doc",
      content: "Content",
    });
    
    const saved = await doc.save();
    expect(saved.tags).toEqual([]);
  });
});
