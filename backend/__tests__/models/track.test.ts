import mongoose from "mongoose";
import Track from "../../src/models/Track.ts";
import { connectTestDB, disconnectTestDB, cleanCollections } from "../setup/testHelpers.ts";

describe("Track Model", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await cleanCollections();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it("creates a track with valid data", async () => {
    const track = new Track({
      title: "Blind 75",
      description: "The classic 75 problems",
      problems: [
        {
          title: "Two Sum",
          titleSlug: "two-sum",
          difficulty: "Easy",
          url: "https://leetcode.com/problems/two-sum/",
        }
      ],
    });
    
    const saved = await track.save();
    
    expect(saved._id).toBeDefined();
    expect(saved.title).toBe("Blind 75");
    expect(saved.problems.length).toBe(1);
    expect(saved.createdAt).toBeDefined();
  });

  it("requires title and description", async () => {
    const track = new Track({});
    
    let error;
    try {
      await track.save();
    } catch (e: any) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.description).toBeDefined();
  });

  it("validates nested ProblemSchema fields", async () => {
    const track = new Track({
      title: "Blind 75",
      description: "Desc",
      problems: [
        {
          title: "Missing fields",
          // Missing titleSlug, difficulty, url
        }
      ],
    });

    let error;
    try {
      await track.save();
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors["problems.0.titleSlug"]).toBeDefined();
    expect(error.errors["problems.0.difficulty"]).toBeDefined();
    expect(error.errors["problems.0.url"]).toBeDefined();
  });

  it("validates difficulty enum in problems", async () => {
    const track = new Track({
      title: "Blind 75",
      description: "Desc",
      problems: [
        {
          title: "Two Sum",
          titleSlug: "two-sum",
          difficulty: "InvalidDifficulty",
          url: "https://leetcode.com/problems/two-sum/",
        }
      ],
    });

    let error;
    try {
      await track.save();
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors["problems.0.difficulty"]).toBeDefined();
  });

  it("supports parts with nested problems", async () => {
    const track = new Track({
      title: "NeetCode 150",
      description: "Extended blind 75",
      problems: [],
      parts: [
        {
          title: "Arrays & Hashing",
          description: "Part 1",
          problems: [
            {
              title: "Contains Duplicate",
              titleSlug: "contains-duplicate",
              difficulty: "Easy",
              url: "https://leetcode.com/problems/contains-duplicate/",
            }
          ]
        }
      ]
    });

    const saved = await track.save();
    expect(saved.parts?.length).toBe(1);
    expect(saved.parts![0].title).toBe("Arrays & Hashing");
    expect(saved.parts![0].problems.length).toBe(1);
    expect(saved.parts![0].problems[0].title).toBe("Contains Duplicate");
  });
});
