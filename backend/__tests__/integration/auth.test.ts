import request from "supertest";
import app from "../../app.ts";
import { connectTestDB, disconnectTestDB, cleanCollections } from "../setup/testHelpers.ts";
import User from "../../src/models/User.ts";

describe("Authentication API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await cleanCollections();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe("POST /api/auth/google", () => {
    it("returns 400 if token is missing", async () => {
      const response = await request(app)
        .post("/api/auth/google")
        .send({}); // No token
        
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/invalid input.*token/i);
    });

    it("returns 401 if Google token is invalid", async () => {
      const response = await request(app)
        .post("/api/auth/google")
        .send({ token: "fake-invalid-token" });
        
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/invalid or expired google token/i);
    });
  });


});
