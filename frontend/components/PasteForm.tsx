"use client";

import { useState } from "react";
import { Plus, ChevronRight, Loader2, Sparkles, FilePlus2 } from "lucide-react";
import { CodePanel } from "./CodePanel";
import { ExpirationSelector } from "./ExpirationSelector";
import { ViewLimitSelector } from "./ViewLimitSelector";
import { ErrorMessage } from "./ErrorMessage";
import { SuccessMessage } from "./SuccessMessage";
import type { PasteCreateResponse, ApiErrorResponse } from "../types/paste";

const MAX_CONTENT_CHARS = 1000000;

export function PasteForm() {
  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState<number | null>(null);
  const [maxViews, setMaxViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<Array<{ field: string; message: string }> | undefined>(undefined);
  const [successData, setSuccessData] = useState<PasteCreateResponse | null>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CONTENT_CHARS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorDetails(undefined);

    if (content.trim().length === 0) {
      setErrorMsg("Content is required and cannot be empty or whitespace only.");
      return;
    }

    if (isOverLimit) {
      setErrorMsg(`Content exceeds maximum allowed limit of ${MAX_CONTENT_CHARS.toLocaleString()} characters.`);
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, any> = { content };
      if (ttlSeconds !== null) payload.ttl_seconds = ttlSeconds;
      if (maxViews !== null) payload.max_views = maxViews;

      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Response is not valid JSON (e.g., 502/504 Bad Gateway or 404 from proxy)
      }

      if (res.ok && data) {
        setSuccessData(data);
      } else if (data?.error?.message) {
        const errResp = data as ApiErrorResponse;
        setErrorMsg(errResp.error.message);
        setErrorDetails(errResp.error.details);
      } else {
        setErrorMsg(
          res.status === 502 || res.status === 504 || res.status === 404
            ? `API server returned HTTP ${res.status}. Please ensure the backend server is running.`
            : "Failed to create paste. Please check your inputs."
        );
      }
    } catch {
      setErrorMsg("Network error connecting to API server. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContent("");
    setTtlSeconds(null);
    setMaxViews(null);
    setErrorMsg(null);
    setErrorDetails(undefined);
    setSuccessData(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="card">
        {/* Header Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div className="icon-tile icon-tile-blue">
            <FilePlus2 size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-main)" }}>
              Create a New Paste
            </h2>
            <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginTop: 2 }}>
              Write or paste your content below and get a shareable link.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Content Label + Live Counter */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label
                htmlFor="paste-content"
                style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-main)" }}
              >
                Content *
              </label>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                  color: isOverLimit ? "var(--color-danger)" : "var(--color-text-muted)",
                }}
              >
                {charCount.toLocaleString()} / {MAX_CONTENT_CHARS.toLocaleString()}
              </span>
            </div>

            {/* Code Panel Editor */}
            <CodePanel
              value={content}
              onChange={setContent}
              contentId="paste-content"
              placeholder="Paste your text, code, or notes here..."
            />
          </div>

          {/* Controls: Expiration and View Limit side-by-side */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <ExpirationSelector value={ttlSeconds} onChange={setTtlSeconds} />
            <ViewLimitSelector value={maxViews} onChange={setMaxViews} />
          </div>

          {/* Submit Button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="submit"
              disabled={loading || isOverLimit || content.trim().length === 0}
              className="btn-primary"
              style={{ width: "100%", maxWidth: 220 }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin-animation" />
                  Creating&hellip;
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Create Paste</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Inline Error alert */}
        {errorMsg && <ErrorMessage message={errorMsg} details={errorDetails} />}
      </div>

      {/* Success State directly under the form */}
      {successData && <SuccessMessage data={successData} onReset={handleReset} />}
    </div>
  );
}
