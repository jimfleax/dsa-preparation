import request from "supertest";
import app from "../../app.ts";
import { connectTestDB, disconnectTestDB, createTestUser, generateFakeToken, generateExpiredToken } from "../setup/testHelpers.ts";

describe("Middleware Integration", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe("Auth Middleware (requireAuth)", () => {
    it("returns 401 with no token", async () => {
      const response = await request(app).get("/api/user/settings");
      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/not authorized, no token/i);
    });

    it("returns 401 with malformed Authorization header", async () => {
      const response = await request(app).get("/api/user/settings").set("Authorization", "token-without-bearer");
      expect(response.status).toBe(401);
    });

    it("returns 401 for expired JWT", async () => {
      const expiredToken = generateExpiredToken("fake-id");
      const response = await request(app).get("/api/user/settings").set("Authorization", `Bearer ${expiredToken}`);
      expect(response.status).toBe(401);
    });

    it("returns 401 for non-existent userId", async () => {
      const fakeToken = generateFakeToken();
      const response = await request(app).get("/api/user/settings").set("Authorization", `Bearer ${fakeToken}`);
      expect(response.status).toBe(401);
    });

    it("passes through for valid JWT", async () => {
      const { token } = await createTestUser();
      const response = await request(app).get("/api/user/settings").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
    });
  });

  describe("Validation Middleware & Error Handler", () => {
    it("returns 400 with Zod errors array for missing required fields", async () => {
      // POST /api/admin/docs requires { filename, title, content }
      const { token } = await createTestUser();
      // Wait, admin docs requires admin auth, but the validator runs before auth in some cases, 
      // or we can test another route like POST /api/sync/track
      const response = await request(app)
        .post("/api/sync/track")
        .set("Authorization", `Bearer ${token}`)
        .send({ submissions: [{ titleSlug: 123 }] }); // Invalid titleSlug type to trigger Zod
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("returns 400 for invalid ObjectId format", async () => {
      const { token } = await createTestUser();
      const response = await request(app)
        .get("/api/tracker/not-an-object-id")
        .set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/invalid id format/i);
    });
  });
});
