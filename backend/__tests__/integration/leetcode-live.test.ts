import request from "supertest";
import app from "../../app.ts";

describe("LeetCode Live API Endpoints", () => {
  describe("POST /api/problems/scrape-title", () => {
    it("scrapes title for valid LeetCode URL", async () => {
      const response = await request(app)
        .post("/api/problems/scrape-title")
        .send({ url: "https://leetcode.com/problems/two-sum/" });
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.title).toBe("Two Sum");
      expect(response.body.titleSlug).toBe("two-sum");
      expect(response.body.difficulty).toBeDefined();
    });

    it("rejects invalid URL format", async () => {
      const response = await request(app)
        .post("/api/problems/scrape-title")
        .send({ url: "not-a-url" });
        
      expect(response.status).toBe(400);
    });

    it("rejects non-LeetCode URL", async () => {
      const response = await request(app)
        .post("/api/problems/scrape-title")
        .send({ url: "https://google.com/problems/two-sum/" });
        
      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/leetcode/calendar/:username", () => {
    it("fetches calendar for a user", async () => {
      // Testing with a known user (can be flaky if user doesn't exist, but 'jimfleax' is the author)
      const response = await request(app).get("/api/leetcode/calendar/jimfleax");
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // We don't strictly assert the content because live API changes, but check for data object
      expect(response.body.data).toBeDefined();
    });
  });
});
