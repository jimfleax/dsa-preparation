import request from "supertest";
import app from "../../app.ts";
import { connectTestDB, disconnectTestDB } from "../setup/testHelpers.ts";
import mongoose from "mongoose";

describe("Health Check API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe("GET /api/health", () => {
    it("returns 200 OK and database status", async () => {
      const response = await request(app).get("/api/health");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "healthy");
      expect(response.body).toHaveProperty("dbConnected");
      expect(response.body.dbConnected).toBe(true);
      expect(response.body).toHaveProperty("timestamp");
    });
  });
});
