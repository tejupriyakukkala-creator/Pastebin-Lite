import { describe, it, expect } from "vitest";
import request from "supertest";
import { getTestApp } from "./helpers.js";
import { Paste } from "../src/models/paste.model.js";

describe("Concurrency and Race Condition Prevention", () => {
  it("handles 50 concurrent GETs on a paste with max_views = 5: exactly 5 succeed, 45 fail", async () => {
    const app = getTestApp();
    const createRes = await request(app)
      .post("/api/pastes")
      .send({ content: "Concurrent test secret content", max_views: 5 });

    expect(createRes.status).toBe(201);
    const pasteId = createRes.body.id;

    // Launch 50 concurrent requests simultaneously
    const requests = Array.from({ length: 50 }, () =>
      request(app).get(`/api/pastes/${pasteId}`)
    );

    const responses = await Promise.all(requests);

    const successResponses = responses.filter((r) => r.status === 200);
    const notFoundResponses = responses.filter((r) => r.status === 404);

    expect(successResponses.length).toBe(5);
    expect(notFoundResponses.length).toBe(45);

    // Verify all 404s have proper error code
    for (const r of notFoundResponses) {
      expect(r.body.error.code).toBe("PASTE_VIEW_LIMIT_REACHED");
    }

    // Verify database document state
    const doc = await Paste.findOne({ pasteId });
    expect(doc).not.toBeNull();
    expect(doc?.views).toBe(5);
  });
});
