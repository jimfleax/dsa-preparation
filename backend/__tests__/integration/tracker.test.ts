import request from "supertest";
import app from "../../app.ts";
import { connectTestDB, disconnectTestDB, cleanCollections, createTestUser } from "../setup/testHelpers.ts";
import TrackedProblem from "../../src/models/TrackedProblem.ts";

describe("Tracker API", () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    await connectTestDB();
    const userData = await createTestUser();
    userToken = userData.token;
    userId = userData.user._id.toString();
  });

  afterEach(async () => {
    await cleanCollections();
    // Recreate user
    const userData = await createTestUser();
    userToken = userData.token;
    userId = userData.user._id.toString();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe("GET /api/tracker", () => {
    it("returns user's tracked problems", async () => {
      await TrackedProblem.create([
        { userId, titleSlug: "p1", title: "P1", difficulty: "Easy", url: "https://leetcode.com/problems/p1/" },
        { userId, titleSlug: "p2", title: "P2", difficulty: "Medium", url: "https://leetcode.com/problems/p2/" }
      ]);

      const response = await request(app)
        .get("/api/tracker")
        .set("Authorization", `Bearer ${userToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.problems.length).toBe(2);
    });

    it("returns 401 when unauthenticated", async () => {
      const response = await request(app).get("/api/tracker");
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/tracker", () => {
    it("creates a new tracked problem", async () => {
      // NOTE: This hits the live LeetCode API, so we use a real URL
      const response = await request(app)
        .post("/api/tracker")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          url: "https://leetcode.com/problems/two-sum/"
        });
        
      expect(response.status).toBe(201);
      expect(response.body.problem.titleSlug).toBe("two-sum");
      
      const inDb = await TrackedProblem.findOne({ userId, titleSlug: "two-sum" });
      expect(inDb).not.toBeNull();
    });

    it("requires a valid LeetCode url", async () => {
      const response = await request(app)
        .post("/api/tracker")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          url: "not-a-url"
        });
        
      expect(response.status).toBe(400);
    });

    it("returns 409 for duplicate problem for same user", async () => {
      await TrackedProblem.create({ 
        userId, titleSlug: "two-sum", title: "Two Sum", difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/" 
      });

      const response = await request(app)
        .post("/api/tracker")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          url: "https://leetcode.com/problems/two-sum/"
        });
        
      expect(response.status).toBe(409);
    });
  });

  describe("PUT /api/tracker/:id", () => {
    it("updates notes for a tracked problem", async () => {
      const p = await TrackedProblem.create({ 
        userId, titleSlug: "to-update", title: "Up", difficulty: "Easy", url: "https://leetcode.com/problems/to-update/", notes: "Old" 
      });

      const response = await request(app)
        .put(`/api/tracker/${p._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ notes: "New notes" });
        
      expect(response.status).toBe(200);
      expect(response.body.problem.notes).toBe("New notes");
    });

    it("updates attempt count", async () => {
      const p = await TrackedProblem.create({ 
        userId, titleSlug: "to-ignore", title: "Ignore", difficulty: "Easy", url: "https://leetcode.com/problems/to-ignore/", attemptCount: 1 
      });

      const response = await request(app)
        .put(`/api/tracker/${p._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ attemptCount: 3 });
        
      expect(response.status).toBe(200);
      expect(response.body.problem.attemptCount).toBe(3);
    });

    it("returns 404 for non-existent problem", async () => {
      const missingId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .put(`/api/tracker/${missingId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ notes: "test" });
        
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/tracker/:id", () => {
    it("deletes a tracked problem", async () => {
      const p = await TrackedProblem.create({ 
        userId, titleSlug: "to-delete", title: "Del", difficulty: "Easy", url: "https://leetcode.com/problems/to-delete/" 
      });

      const response = await request(app)
        .delete(`/api/tracker/${p._id}`)
        .set("Authorization", `Bearer ${userToken}`);
        
      expect(response.status).toBe(200);
      
      const inDb = await TrackedProblem.findOne({ userId, titleSlug: "to-delete" });
      expect(inDb).toBeNull();
    });

    it("returns 404 for non-existent problem", async () => {
      const missingId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/tracker/${missingId}`)
        .set("Authorization", `Bearer ${userToken}`);
        
      expect(response.status).toBe(404);
    });
  });
});
