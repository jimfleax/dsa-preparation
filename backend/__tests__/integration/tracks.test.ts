import request from "supertest";
import app from "../../app.ts";
import { connectTestDB, disconnectTestDB, cleanCollections, createTestUser } from "../setup/testHelpers.ts";
import Track from "../../src/models/Track.ts";

describe("Tracks API", () => {
  let userToken: string;

  beforeAll(async () => {
    await connectTestDB();
    const userData = await createTestUser();
    userToken = userData.token;
  });

  afterEach(async () => {
    await cleanCollections();
    const userData = await createTestUser();
    userToken = userData.token;
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe("GET /api/tracks", () => {
    it("returns all tracks", async () => {
      await Track.create([
        { title: "Track 1", description: "Desc 1", problems: [] },
        { title: "Track 2", description: "Desc 2", problems: [] }
      ]);

      const response = await request(app)
        .get("/api/tracks")
        .set("Authorization", `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tracks.length).toBe(2);
      
      const titles = response.body.tracks.map((t: any) => t.title);
      expect(titles).toContain("Track 1");
      expect(titles).toContain("Track 2");
    });
  });
});
