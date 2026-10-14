import { describe, it, expect } from "vitest";
import request from "supertest";
import { getTestApp } from "./helpers.js";

describe("Health API", () => {
  it("GET /api/healthz returns 200 and ok: true with JSON content-type", async () => {
    const app = getTestApp();
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.body.ok).toBe(true);
  });

  it("GET /api/health serves as alias to healthz", async () => {
    const app = getTestApp();
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("Unknown /api route returns 404 JSON with NOT_FOUND code", async () => {
    const app = getTestApp();
    const res = await request(app).get("/api/non-existent-route");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
