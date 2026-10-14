import { describe, it, expect } from "vitest";
import request from "supertest";
import { getTestApp } from "./helpers.js";

describe("GET /api/pastes/:id (Fetch Paste)", () => {
  it("fetches an existing unlimited paste multiple times", async () => {
    const app = getTestApp();
    const originalContent = "Original text content line 1\nLine 2";
    const createRes = await request(app)
      .post("/api/pastes")
      .send({ content: originalContent });

    const pasteId = createRes.body.id;

    // First fetch
    const fetch1 = await request(app).get(`/api/pastes/${pasteId}`);
    expect(fetch1.status).toBe(200);
    expect(fetch1.headers["content-type"]).toMatch(/application\/json/);
    expect(fetch1.headers["cache-control"]).toBe("no-store");
    expect(fetch1.body.content).toBe(originalContent);
    expect(fetch1.body.remaining_views).toBeNull();
    expect(fetch1.body.expires_at).toBeNull();

    // Second fetch
    const fetch2 = await request(app).get(`/api/pastes/${pasteId}`);
    expect(fetch2.status).toBe(200);
    expect(fetch2.body.content).toBe(originalContent);
    expect(fetch2.body.remaining_views).toBeNull();
  });

  it("enforces max_views = 1 (burn after reading)", async () => {
    const app = getTestApp();
    const createRes = await request(app)
      .post("/api/pastes")
      .send({ content: "Secret code 1234", max_views: 1 });

    const pasteId = createRes.body.id;

    // First fetch succeeds, remaining_views is 0
    const fetch1 = await request(app).get(`/api/pastes/${pasteId}`);
    expect(fetch1.status).toBe(200);
    expect(fetch1.body.content).toBe("Secret code 1234");
    expect(fetch1.body.remaining_views).toBe(0);

    // Second fetch fails with 404
    const fetch2 = await request(app).get(`/api/pastes/${pasteId}`);
    expect(fetch2.status).toBe(404);
    expect(fetch2.body.success).toBe(false);
    expect(fetch2.body.error.code).toBe("PASTE_VIEW_LIMIT_REACHED");
  });

  it("enforces max_views = 2 correctly", async () => {
    const app = getTestApp();
    const createRes = await request(app)
      .post("/api/pastes")
      .send({ content: "Two view paste", max_views: 2 });

    const pasteId = createRes.body.id;

    // View 1
    const fetch1 = await request(app).get(`/api/pastes/${pasteId}`);
    expect(fetch1.status).toBe(200);
    expect(fetch1.body.remaining_views).toBe(1);

    // View 2
    const fetch2 = await request(app).get(`/api/pastes/${pasteId}`);
    expect(fetch2.status).toBe(200);
    expect(fetch2.body.remaining_views).toBe(0);

    // View 3
    const fetch3 = await request(app).get(`/api/pastes/${pasteId}`);
    expect(fetch3.status).toBe(404);
    expect(fetch3.body.error.code).toBe("PASTE_VIEW_LIMIT_REACHED");
  });

  it("returns 404 for non-existent and malformed IDs", async () => {
    const app = getTestApp();
    const resNotFound = await request(app).get("/api/pastes/nonExistent123");
    expect(resNotFound.status).toBe(404);
    expect(resNotFound.body.error.code).toBe("PASTE_NOT_FOUND");

    const resMalformed = await request(app).get("/api/pastes/bad!id@#$");
    expect(resMalformed.status).toBe(404);
    expect(resMalformed.body.error.code).toBe("PASTE_NOT_FOUND");
  });
});
