import { describe, it, expect } from "vitest";
import request from "supertest";
import { getTestApp } from "./helpers.js";

describe("Additive Features: Metadata and Delete Token", () => {
  it("GET /api/pastes/:id/meta returns status without consuming views", async () => {
    const app = getTestApp();
    const createRes = await request(app)
      .post("/api/pastes")
      .send({ content: "Meta check content", max_views: 1 });

    const pasteId = createRes.body.id;

    // Check metadata multiple times
    const meta1 = await request(app).get(`/api/pastes/${pasteId}/meta`);
    expect(meta1.status).toBe(200);
    expect(meta1.body.status).toBe("available");
    expect(meta1.body.remaining_views).toBe(1);

    const meta2 = await request(app).get(`/api/pastes/${pasteId}/meta`);
    expect(meta2.status).toBe(200);
    expect(meta2.body.remaining_views).toBe(1);

    // Regular fetch consumes the view
    const fetchRes = await request(app).get(`/api/pastes/${pasteId}`);
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.remaining_views).toBe(0);

    // Now meta returns 404 PASTE_VIEW_LIMIT_REACHED
    const meta3 = await request(app).get(`/api/pastes/${pasteId}/meta`);
    expect(meta3.status).toBe(404);
    expect(meta3.body.error.code).toBe("PASTE_VIEW_LIMIT_REACHED");
  });

  it("DELETE /api/pastes/:id with valid Bearer token deletes paste", async () => {
    const app = getTestApp();
    const createRes = await request(app)
      .post("/api/pastes")
      .send({ content: "Delete me later" });

    const pasteId = createRes.body.id;
    const token = createRes.body.delete_token;

    // Delete with invalid token -> 403
    const badDelete = await request(app)
      .delete(`/api/pastes/${pasteId}`)
      .set("Authorization", "Bearer invalid-token-1234");
    expect(badDelete.status).toBe(403);
    expect(badDelete.body.error.code).toBe("FORBIDDEN");

    // Delete with valid token -> 200
    const goodDelete = await request(app)
      .delete(`/api/pastes/${pasteId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(goodDelete.status).toBe(200);
    expect(goodDelete.body.success).toBe(true);

    // Subsequent fetch -> 404 PASTE_NOT_FOUND
    const fetchAfter = await request(app).get(`/api/pastes/${pasteId}`);
    expect(fetchAfter.status).toBe(404);
    expect(fetchAfter.body.error.code).toBe("PASTE_NOT_FOUND");
  });
});
