import { describe, it, expect } from "vitest";
import request from "supertest";
import { getTestApp } from "./helpers.js";

describe("Deterministic Time and TTL Testing (x-test-now-ms)", () => {
  const baseTimeMs = 1700000000000;

  it("handles expiry boundary: 200 before, 404 at exact boundary, 404 after", async () => {
    const app = getTestApp();
    const createRes = await request(app)
      .post("/api/pastes")
      .set("x-test-now-ms", String(baseTimeMs))
      .send({ content: "Timed paste content", ttl_seconds: 60 });

    expect(createRes.status).toBe(201);
    const pasteId = createRes.body.id;
    const expiresAtMs = baseTimeMs + 60 * 1000;

    // 1 second before expiry -> 200
    const beforeRes = await request(app)
      .get(`/api/pastes/${pasteId}`)
      .set("x-test-now-ms", String(expiresAtMs - 1000));
    expect(beforeRes.status).toBe(200);
    expect(beforeRes.body.content).toBe("Timed paste content");

    // At exact boundary -> 404 PASTE_EXPIRED
    const exactRes = await request(app)
      .get(`/api/pastes/${pasteId}`)
      .set("x-test-now-ms", String(expiresAtMs));
    expect(exactRes.status).toBe(404);
    expect(exactRes.body.error.code).toBe("PASTE_EXPIRED");

    // After expiry -> 404 PASTE_EXPIRED
    const afterRes = await request(app)
      .get(`/api/pastes/${pasteId}`)
      .set("x-test-now-ms", String(expiresAtMs + 5000));
    expect(afterRes.status).toBe(404);
    expect(afterRes.body.error.code).toBe("PASTE_EXPIRED");
  });

  it("rejects invalid x-test-now-ms headers with 400 INVALID_TEST_TIME", async () => {
    const app = getTestApp();
    for (const badHeader of ["abc", "-500", "123.45", ""]) {
      const res = await request(app)
        .post("/api/pastes")
        .set("x-test-now-ms", badHeader)
        .send({ content: "test content" });

      if (badHeader === "") {
        continue;
      }
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INVALID_TEST_TIME");
    }
  });

  it("triggers unavailable as soon as whichever constraint triggers first (TTL vs Views)", async () => {
    const app = getTestApp();
    const createRes = await request(app)
      .post("/api/pastes")
      .set("x-test-now-ms", String(baseTimeMs))
      .send({ content: "Dual constraint paste", ttl_seconds: 100, max_views: 2 });

    const pasteId = createRes.body.id;

    // View 1 before expiry -> 200
    const res1 = await request(app)
      .get(`/api/pastes/${pasteId}`)
      .set("x-test-now-ms", String(baseTimeMs + 10000));
    expect(res1.status).toBe(200);

    // After expiry, before 2nd view consumed -> 404 PASTE_EXPIRED
    const resExpired = await request(app)
      .get(`/api/pastes/${pasteId}`)
      .set("x-test-now-ms", String(baseTimeMs + 150000));
    expect(resExpired.status).toBe(404);
    expect(resExpired.body.error.code).toBe("PASTE_EXPIRED");
  });

  it("supports purgeAt independence: paste created with fake past time is fetchable under matching fake time", async () => {
    const app = getTestApp();
    const pastTimeMs = baseTimeMs - 31536000 * 1000;
    const createRes = await request(app)
      .post("/api/pastes")
      .set("x-test-now-ms", String(pastTimeMs))
      .send({ content: "Past simulation paste", ttl_seconds: 3600 });

    const pasteId = createRes.body.id;

    // Fetch under matching simulated past time
    const fetchRes = await request(app)
      .get(`/api/pastes/${pasteId}`)
      .set("x-test-now-ms", String(pastTimeMs + 500));
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.content).toBe("Past simulation paste");
  });
});
