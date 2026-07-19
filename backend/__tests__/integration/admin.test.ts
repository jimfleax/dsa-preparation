import request from "supertest";
import app from "../../app.ts";
import { connectTestDB, disconnectTestDB, cleanCollections, createTestAdmin, createTestUser } from "../setup/testHelpers.ts";
import { Admin } from "../../src/models/Admin.ts";
import Track from "../../src/models/Track.ts";
import LearningDoc from "../../src/models/LearningDoc.ts";

describe("Admin API", () => {
  let adminToken: string;

  beforeAll(async () => {
    await connectTestDB();
    const adminData = await createTestAdmin();
    adminToken = adminData.token;
  });

  afterEach(async () => {
    await cleanCollections();
    const adminData = await createTestAdmin();
    adminToken = adminData.token;
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe("Admin Auth (/api/admin/auth)", () => {
    it("rejects missing token", async () => {
      const response = await request(app).post("/api/admin/auth/google").send({});
      expect(response.status).toBe(400);
    });

    it("rejects invalid Google token", async () => {
      const response = await request(app).post("/api/admin/auth/google").send({ token: "invalid" });
      expect(response.status).toBe(401);
    });
  });

  describe("Admin Users (/api/admin/users)", () => {
    it("returns 401 without admin auth", async () => {
      const response = await request(app).get("/api/admin/users");
      expect(response.status).toBe(401);
    });

    it("lists all users", async () => {
      await createTestUser({ email: "user1@test.com" });
      await createTestUser({ email: "user2@test.com" });

      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Admin Tracks (/api/admin/tracks)", () => {
    it("returns 401 without admin auth", async () => {
      const response = await request(app).get("/api/admin/tracks");
      expect(response.status).toBe(401);
    });

    it("creates a track with valid data", async () => {
      const response = await request(app)
        .post("/api/admin/tracks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "New Track", description: "Desc", problems: [] });
        
      expect(response.status).toBe(201);
      expect(response.body.title).toBe("New Track");
    });

    it("deletes a track", async () => {
      const track = await Track.create({ title: "To Delete", description: "Desc", problems: [] });
      
      const response = await request(app)
        .delete(`/api/admin/tracks/${track._id}`)
        .set("Authorization", `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      const exists = await Track.findById(track._id);
      expect(exists).toBeNull();
    });
  });

  describe("Admin Docs (/api/admin/docs)", () => {
    it("returns 401 without admin auth", async () => {
      const response = await request(app).get("/api/admin/docs");
      expect(response.status).toBe(401);
    });

    it("creates doc with valid data", async () => {
      const response = await request(app)
        .post("/api/admin/docs")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ filename: "test.md", title: "Test", tags: [], content: "body" });
        
      expect(response.status).toBe(201);
      expect(response.body.filename).toBe("test.md");
    });
  });

  describe("Admin Analytics (/api/admin/analytics)", () => {
    it("returns analytics object", async () => {
      const response = await request(app)
        .get("/api/admin/analytics")
        .set("Authorization", `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body).toHaveProperty("content");
      expect(response.body).toHaveProperty("engagement");
    });
  });
});
