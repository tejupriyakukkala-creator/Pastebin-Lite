#!/usr/bin/env node

/**
 * End-to-end verification script for Pastebin Lite.
 * Simulates automated grader checks against a running instance.
 * Usage: node scripts/verify.mjs <baseUrl>
 */

const targetUrl = process.argv[2];

if (!targetUrl) {
  console.error("Error: Target base URL must be provided.");
  console.error("Usage: node scripts/verify.mjs <baseUrl>");
  process.exit(1);
}

const baseUrl = targetUrl.replace(/\/+$/, "");

let passedCount = 0;
let failedCount = 0;

async function runCheck(name, fn) {
  process.stdout.write(`• Checking: ${name}... `);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    await fn(controller.signal);
    clearTimeout(timeout);
    console.log("\x1b[32mPASSED\x1b[0m");
    passedCount++;
  } catch (err) {
    console.log("\x1b[31mFAILED\x1b[0m");
    console.error(`  Error details: ${err.message || err}`);
    failedCount++;
  }
}

async function verifyAll() {
  console.log(`\n========================================`);
  console.log(`Pastebin Lite Automated Verification`);
  console.log(`Target: ${baseUrl}`);
  console.log(`========================================\n`);

  // 1. Health check
  await runCheck("GET /api/healthz returns 200 and valid JSON", async (signal) => {
    const res = await fetch(`${baseUrl}/api/healthz`, { signal, cache: "no-store" });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("application/json")) throw new Error(`Expected application/json, got ${ctype}`);
    const body = await res.json();
    if (body.ok !== true) throw new Error(`Expected { ok: true }, got ${JSON.stringify(body)}`);
  });

  // 2. Health alias check
  await runCheck("GET /api/health alias returns 200 and valid JSON", async (signal) => {
    const res = await fetch(`${baseUrl}/api/health`, { signal, cache: "no-store" });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const body = await res.json();
    if (body.ok !== true) throw new Error(`Expected { ok: true }`);
  });

  // 3. Create paste returns id and matching url
  let createdPasteId = "";
  await runCheck("POST /api/pastes creates paste returning id and url pointing to /p/:id", async (signal) => {
    const res = await fetch(`${baseUrl}/api/pastes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Hello grader verification content" }),
      signal,
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const body = await res.json();
    if (!body.id || typeof body.id !== "string") throw new Error("Missing or invalid id");
    createdPasteId = body.id;
    if (!body.url || !body.url.includes(`/p/${createdPasteId}`)) {
      throw new Error(`URL ${body.url} does not contain /p/${createdPasteId}`);
    }
  });

  // 4. Fetch paste returns content
  await runCheck("GET /api/pastes/:id returns original content", async (signal) => {
    const res = await fetch(`${baseUrl}/api/pastes/${createdPasteId}`, { signal, cache: "no-store" });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const body = await res.json();
    if (body.content !== "Hello grader verification content") {
      throw new Error(`Content mismatch: ${body.content}`);
    }
  });

  // 5. HTML viewer at /p/:id returns 200
  await runCheck("GET /p/:id returns HTML 200 containing paste content", async (signal) => {
    const res = await fetch(`${baseUrl}/p/${createdPasteId}`, { signal, cache: "no-store" });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const text = await res.text();
    if (!text.includes("Hello grader verification content")) {
      throw new Error("HTML body does not contain expected paste content");
    }
  });

  // 6. Max views = 1 (burn after reading)
  await runCheck("max_views = 1: first fetch 200, second fetch 404", async (signal) => {
    const create = await fetch(`${baseUrl}/api/pastes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Burn after reading secret", max_views: 1 }),
      signal,
    });
    const { id } = await create.json();

    const f1 = await fetch(`${baseUrl}/api/pastes/${id}`, { signal, cache: "no-store" });
    if (f1.status !== 200) throw new Error(`Fetch 1 expected 200, got ${f1.status}`);

    const f2 = await fetch(`${baseUrl}/api/pastes/${id}`, { signal, cache: "no-store" });
    if (f2.status !== 404) throw new Error(`Fetch 2 expected 404, got ${f2.status}`);
    const errBody = await f2.json();
    if (errBody?.error?.code !== "PASTE_VIEW_LIMIT_REACHED") {
      throw new Error(`Expected PASTE_VIEW_LIMIT_REACHED, got ${errBody?.error?.code}`);
    }
  });

  // 7. Max views = 2
  await runCheck("max_views = 2: two 200s, third is 404", async (signal) => {
    const create = await fetch(`${baseUrl}/api/pastes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Two view secret", max_views: 2 }),
      signal,
    });
    const { id } = await create.json();

    const f1 = await fetch(`${baseUrl}/api/pastes/${id}`, { signal, cache: "no-store" });
    if (f1.status !== 200) throw new Error(`Fetch 1 expected 200, got ${f1.status}`);

    const f2 = await fetch(`${baseUrl}/api/pastes/${id}`, { signal, cache: "no-store" });
    if (f2.status !== 200) throw new Error(`Fetch 2 expected 200, got ${f2.status}`);

    const f3 = await fetch(`${baseUrl}/api/pastes/${id}`, { signal, cache: "no-store" });
    if (f3.status !== 404) throw new Error(`Fetch 3 expected 404, got ${f3.status}`);
  });

  // 8. Time-to-live before and after expiry using x-test-now-ms
  await runCheck("TTL before expiry returns 200, after expiry returns 404", async (signal) => {
    const baseTime = 1750000000000;
    const create = await fetch(`${baseUrl}/api/pastes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-test-now-ms": String(baseTime),
      },
      body: JSON.stringify({ content: "Expiring secret text", ttl_seconds: 60 }),
      signal,
    });
    const { id } = await create.json();

    // 10s before expiry -> 200
    const f1 = await fetch(`${baseUrl}/api/pastes/${id}`, {
      headers: { "x-test-now-ms": String(baseTime + 50000) },
      signal,
      cache: "no-store",
    });
    if (f1.status !== 200) throw new Error(`Before expiry expected 200, got ${f1.status}`);

    // After expiry -> 404
    const f2 = await fetch(`${baseUrl}/api/pastes/${id}`, {
      headers: { "x-test-now-ms": String(baseTime + 70000) },
      signal,
      cache: "no-store",
    });
    if (f2.status !== 404) throw new Error(`After expiry expected 404, got ${f2.status}`);
  });

  // 9. Combined constraints: whichever triggers first
  await runCheck("Combined TTL and max_views triggers whichever constraint hits first", async (signal) => {
    const baseTime = 1750000000000;
    const create = await fetch(`${baseUrl}/api/pastes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-test-now-ms": String(baseTime),
      },
      body: JSON.stringify({ content: "Dual constraints", ttl_seconds: 100, max_views: 2 }),
      signal,
    });
    const { id } = await create.json();

    // View 1 -> 200
    const f1 = await fetch(`${baseUrl}/api/pastes/${id}`, {
      headers: { "x-test-now-ms": String(baseTime + 1000) },
      signal,
      cache: "no-store",
    });
    if (f1.status !== 200) throw new Error(`View 1 expected 200, got ${f1.status}`);

    // Time expires before 2nd view
    const f2 = await fetch(`${baseUrl}/api/pastes/${id}`, {
      headers: { "x-test-now-ms": String(baseTime + 120000) },
      signal,
      cache: "no-store",
    });
    if (f2.status !== 404) throw new Error(`Expected 404 on expired paste, got ${f2.status}`);
  });

  // 10. Invalid input returns 4xx JSON
  await runCheck("Invalid inputs return 4xx JSON error", async (signal) => {
    const res = await fetch(`${baseUrl}/api/pastes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "   ", ttl_seconds: -1 }),
      signal,
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const body = await res.json();
    if (body.success !== false || !body.error) throw new Error(`Invalid error body: ${JSON.stringify(body)}`);
  });

  // 11. Unavailable HTML returns 404
  await runCheck("Visiting unavailable /p/:id returns HTTP 404", async (signal) => {
    const res = await fetch(`${baseUrl}/p/nonExistentId999`, { signal, cache: "no-store" });
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // 12. Concurrency test: 30 concurrent GETs on max_views=5
  await runCheck("30 concurrent fetches on max_views=5 -> exactly 5 succeed", async (signal) => {
    const create = await fetch(`${baseUrl}/api/pastes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Concurrency test content", max_views: 5 }),
      signal,
    });
    const { id } = await create.json();

    const fetches = Array.from({ length: 30 }, () =>
      fetch(`${baseUrl}/api/pastes/${id}`, { signal, cache: "no-store" })
    );

    const responses = await Promise.all(fetches);
    const successCount = responses.filter((r) => r.status === 200).length;
    const failCount = responses.filter((r) => r.status === 404).length;

    if (successCount !== 5) {
      throw new Error(`Expected exactly 5 successful fetches, got ${successCount}`);
    }
    if (failCount !== 25) {
      throw new Error(`Expected exactly 25 failed fetches, got ${failCount}`);
    }
  });

  // 13. Script tag is escaped in HTML
  await runCheck("<script>alert(1)</script> is safely escaped in HTML response", async (signal) => {
    const scriptPayload = "<script>alert(1)</script>";
    const create = await fetch(`${baseUrl}/api/pastes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: scriptPayload }),
      signal,
    });
    const { id } = await create.json();

    const res = await fetch(`${baseUrl}/p/${id}`, { signal, cache: "no-store" });
    const html = await res.text();

    if (!html.includes("&lt;script&gt;alert(1)&lt;/script&gt;") && !html.includes("&lt;script&gt;")) {
      // Must not execute or appear unescaped in script contexts
      if (html.includes("<script>alert(1)</script>")) {
        throw new Error("Raw unescaped <script> tag found in HTML");
      }
    }
  });

  console.log(`\n========================================`);
  console.log(`Verification Summary:`);
  console.log(`Total checks: ${passedCount + failedCount}`);
  console.log(`Passed: \x1b[32m${passedCount}\x1b[0m`);
  console.log(`Failed: \x1b[31m${failedCount}\x1b[0m`);
  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

verifyAll().catch((err) => {
  console.error("Fatal verification error:", err);
  process.exit(1);
});
