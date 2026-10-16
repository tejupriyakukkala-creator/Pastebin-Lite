import { headers } from "next/headers";
import type { PasteData } from "../types/paste.js";

export async function fetchPasteServer(id: string): Promise<PasteData | null> {
  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";

  const cleanUrl = backendUrl.replace(/\/+$/, "");
  const headerList = await headers();

  const forwardHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  const testNow = headerList.get("x-test-now-ms");
  if (testNow) {
    forwardHeaders["x-test-now-ms"] = testNow;
  }

  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    forwardHeaders["x-forwarded-for"] = forwardedFor;
  }

  const res = await fetch(`${cleanUrl}/api/pastes/${id}`, {
    method: "GET",
    headers: forwardHeaders,
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    return null;
  }

  return res.json();
}
