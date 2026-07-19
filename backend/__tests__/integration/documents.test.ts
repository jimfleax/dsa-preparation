import request from "supertest";
import app from "../../app.ts";
import { connectTestDB, disconnectTestDB, cleanCollections } from "../setup/testHelpers.ts";
import LearningDoc from "../../src/models/LearningDoc.ts";

describe("Documents API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await cleanCollections();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe("GET /api/documents", () => {
    it("returns all documents with metadata only", async () => {
      await LearningDoc.create([
        { filename: "doc1.md", title: "Doc 1", tags: ["a"], content: "---\ntitle: Doc 1\n---\nContent 1" },
        { filename: "doc2.md", title: "Doc 2", tags: ["b"], content: "---\ntitle: Doc 2\n---\nContent 2" }
      ]);

      const response = await request(app).get("/api/documents");
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.documents.length).toBe(2);
      expect(response.body.documents[0].filename).toBeDefined();
      expect(response.body.documents[0].title).toBeDefined();
    });

    it("does not leak content in list", async () => {
      await LearningDoc.create({ filename: "secret.md", title: "Secret", content: "Super secret body" });

      const response = await request(app).get("/api/documents");
      expect(response.body.documents[0].content).toBeUndefined();
    });

    it("returns empty array when no docs exist", async () => {
      const response = await request(app).get("/api/documents");
      expect(response.status).toBe(200);
      expect(response.body.documents).toEqual([]);
    });
  });

  describe("GET /api/document", () => {
    it("fetches single document by filename", async () => {
      await LearningDoc.create({ 
        filename: "test.md", 
        title: "Test Doc", 
        tags: ["test"], 
        content: "---\ntitle: Test\n---\n\nBody here" 
      });

      const response = await request(app).get("/api/document?filename=test.md");
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.metadata.filename).toBe("test.md");
      expect(response.body.content).toContain("Body here");
    });

    it("strips YAML frontmatter from content", async () => {
      await LearningDoc.create({ 
        filename: "frontmatter.md", 
        title: "Frontmatter", 
        content: "---\ntitle: Ignore Me\n---\nReal Content" 
      });

      const response = await request(app).get("/api/document?filename=frontmatter.md");
      
      expect(response.body.content).toBe("Real Content");
      expect(response.body.content).not.toContain("Ignore Me");
    });

    it("returns 400 for missing filename param", async () => {
      const response = await request(app).get("/api/document");
      expect(response.status).toBe(400);
    });

    it("returns 404 for non-existent filename", async () => {
      const response = await request(app).get("/api/document?filename=nope.md");
      expect(response.status).toBe(404);
    });

    it("sanitizes malicious filename chars", async () => {
      const response = await request(app).get("/api/document?filename=../../etc/passwd");
      expect(response.status).toBe(404);
    });
  });
});
