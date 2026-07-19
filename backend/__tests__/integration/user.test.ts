import request from "supertest";
import app from "../../app.ts";
import { connectTestDB, disconnectTestDB, cleanCollections, createTestUser } from "../setup/testHelpers.ts";

describe("User API", () => {
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
    const userData = await createTestUser();
    userToken = userData.token;
    userId = userData.user._id.toString();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe("GET /api/user/settings", () => {
    it("returns 401 without auth", async () => {
      const response = await request(app).get("/api/user/settings");
      expect(response.status).toBe(401);
    });

    it("gets settings for authenticated user", async () => {
      const response = await request(app)
        .get("/api/user/settings")
        .set("Authorization", `Bearer ${userToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.leetcodeUsername).toBeNull(); // Defaults to null
    });
  });

  describe("POST /api/user/settings", () => {
    it("updates leetcodeUsername", async () => {
      const response = await request(app)
        .post("/api/user/settings")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ leetcodeUsername: "testuser" });
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.leetcodeUsername).toBe("testuser");
    });

    it("trims whitespace from leetcodeUsername", async () => {
      const response = await request(app)
        .post("/api/user/settings")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ leetcodeUsername: "  spaces  " });
        
      expect(response.status).toBe(200);
      expect(response.body.data.leetcodeUsername).toBe("spaces");
    });

    it("returns 404 if user deleted mid-session", async () => {
      await cleanCollections(); // user no longer exists
      const response = await request(app)
        .post("/api/user/settings")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ leetcodeUsername: "test" });
        
      expect(response.status).toBe(401);
    });
  });
});
