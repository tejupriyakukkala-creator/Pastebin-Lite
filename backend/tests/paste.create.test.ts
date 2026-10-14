import { describe, it, expect } from "vitest";
import request from "supertest";
import { getTestApp } from "./helpers.js";

describe("POST /api/pastes (Create Paste)", () => {
  it("creates a paste with content only", async () => {
    const app = getTestApp();
    const res = await request(app)
      .post("/api/pastes")
      .send({ content: "Hello world paste content" });

    expect(res.status).toBe(201);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.body.id).toBeDefined();
    expect(typeof res.body.id).toBe("string");
    expect(res.body.url).toBe(`https://your-frontend.example.com/p/${res.body.id}`);
    expect(res.body.expires_at).toBeNull();
    expect(res.body.max_views).toBeNull();
    expect(res.body.delete_token).toBeDefined();
  });

  it("creates a paste with ttl_seconds and max_views", async () => {
    const app = getTestApp();
    const res = await request(app)
      .post("/api/pastes")
      .send({
        content: "Temporary paste with limits",
        ttl_seconds: 120,
        max_views: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.max_views).toBe(10);
    expect(res.body.expires_at).toBeDefined();
    const expiry = new Date(res.body.expires_at);
    expect(isNaN(expiry.getTime())).toBe(false);
  });

  it("accepts null for ttl_seconds and max_views", async () => {
    const app = getTestApp();
    const res = await request(app)
      .post("/api/pastes")
      .send({
        content: "Paste with explicit null constraints",
        ttl_seconds: null,
        max_views: null,
      });

    expect(res.status).toBe(201);
    expect(res.body.expires_at).toBeNull();
    expect(res.body.max_views).toBeNull();
  });

  it("rejects empty or whitespace-only content with 400 INVALID_INPUT", async () => {
    const app = getTestApp();
    const emptyRes = await request(app).post("/api/pastes").send({ content: "" });
    expect(emptyRes.status).toBe(400);
    expect(emptyRes.body.success).toBe(false);
    expect(emptyRes.body.error.code).toBe("INVALID_INPUT");

    const wsRes = await request(app).post("/api/pastes").send({ content: "   \n\t  " });
    expect(wsRes.status).toBe(400);
    expect(wsRes.body.error.code).toBe("INVALID_INPUT");
  });

  it("rejects non-string content with 400 INVALID_INPUT", async () => {
    const app = getTestApp();
    const res = await request(app).post("/api/pastes").send({ content: 12345 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_INPUT");
  });

  it("rejects invalid ttl_seconds (float, negative, 0, string)", async () => {
    const app = getTestApp();
    for (const invalidTtl of [0, -5, 1.5, "60", true]) {
      const res = await request(app)
        .post("/api/pastes")
        .send({ content: "valid content", ttl_seconds: invalidTtl });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INVALID_INPUT");
    }
  });

  it("rejects invalid max_views (float, negative, 0, string)", async () => {
    const app = getTestApp();
    for (const invalidViews of [0, -1, 2.5, "10", false]) {
      const res = await request(app)
        .post("/api/pastes")
        .send({ content: "valid content", max_views: invalidViews });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INVALID_INPUT");
    }
  });

  it("rejects malformed JSON with 400 INVALID_JSON", async () => {
    const app = getTestApp();
    const res = await request(app)
      .post("/api/pastes")
      .set("Content-Type", "application/json")
      .send("{ malformed json }");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });
});
