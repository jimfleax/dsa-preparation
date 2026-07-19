import request from "supertest";
import app from "../../app.ts";
import { connectTestDB, disconnectTestDB, cleanCollections, createTestUser } from "../setup/testHelpers.ts";
import TrackedProblem from "../../src/models/TrackedProblem.ts";

describe("Sync API", () => {
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

  describe("POST /api/sync/track", () => {
    it("successfully logs attempts for multiple problems", async () => {
      await TrackedProblem.create([
        { userId, titleSlug: "p1", title: "P1", difficulty: "Easy", url: "http://p1", attemptCount: 1 },
        { userId, titleSlug: "p2", title: "P2", difficulty: "Medium", url: "http://p2", attemptCount: 2 }
      ]);

      const now = new Date().toISOString();

      const response = await request(app)
        .post("/api/sync/track")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          submissions: [
            { titleSlug: "p1", title: "P1", status: "success", timestamp: now },
            { titleSlug: "p2", title: "P2", status: "success", timestamp: now }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const p1 = await TrackedProblem.findOne({ userId, titleSlug: "p1" });
      const p2 = await TrackedProblem.findOne({ userId, titleSlug: "p2" });
      
      expect(p1?.attemptCount).toBe(1); // Unchanged
      expect(p2?.attemptCount).toBe(2); // Unchanged
    });

    it("ignores updates for problems that user doesn't track", async () => {
      // User only tracks p1
      await TrackedProblem.create({ userId, titleSlug: "p1", title: "P1", difficulty: "Easy", url: "http://p1" });

      const response = await request(app)
        .post("/api/sync/track")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          submissions: [
            { titleSlug: "p1", title: "P1", status: "success", timestamp: new Date().toISOString() },
            { titleSlug: "missing-prob", title: "Missing", status: "success", timestamp: new Date().toISOString() } // Should ignore
          ]
        });

      expect(response.status).toBe(200);
      
      // p1 should be updated
      const p1 = await TrackedProblem.findOne({ userId, titleSlug: "p1" });
      expect(p1?.attemptCount).toBe(1);
    });

    it("returns 400 if updates array is missing", async () => {
      const response = await request(app)
        .post("/api/sync/track")
        .set("Authorization", `Bearer ${userToken}`)
        .send({}); // No submissions array

      expect(response.status).toBe(400);
    });

    it("returns 400 if updates is not an array", async () => {
      const response = await request(app)
        .post("/api/sync/track")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ submissions: "not-an-array" });

      expect(response.status).toBe(400);
    });

    it("returns 401 if unauthenticated", async () => {
      const response = await request(app)
        .post("/api/sync/track")
        .send({ submissions: [] });

      expect(response.status).toBe(401);
    });
    
    it("handles empty updates array gracefully", async () => {
      const response = await request(app)
        .post("/api/sync/track")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ submissions: [] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
