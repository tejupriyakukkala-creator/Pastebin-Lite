"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ExternalLink } from "lucide-react";

const ID_REGEX = /^[A-Za-z0-9_-]{8,64}$/;

export default function OpenPastePage() {
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError("Please enter a paste link or ID.");
      return;
    }

    let pasteId = trimmed;

    // If it's a URL or contains /p/
    if (trimmed.includes("/p/")) {
      const parts = trimmed.split("/p/");
      pasteId = parts[parts.length - 1].split(/[?#]/)[0].trim();
    } else if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      pasteId = parts[parts.length - 1].split(/[?#]/)[0].trim();
    }

    if (!ID_REGEX.test(pasteId)) {
      setError("Invalid paste ID format. Paste IDs must be 8-64 alphanumeric characters (including _ or -).");
      return;
    }

    // Direct client navigation - NO API call made here so no view is consumed!
    router.push(`/p/${pasteId}`);
  };

  return (
    <div
      className="container"
      style={{
        paddingTop: 60,
        paddingBottom: 80,
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="icon-tile icon-tile-blue">
            <Search size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-main)" }}>
              Open a Paste
            </h1>
            <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginTop: 2 }}>
              Paste a full shareable link or paste ID to view the content.
            </p>
          </div>
        </div>

        <form onSubmit={handleOpen} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              htmlFor="paste-link-input"
              style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-main)" }}
            >
              Paste Link or ID
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                id="paste-link-input"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="https://.../p/abc123xyz or raw ID"
                style={{
                  flex: "1 1 280px",
                  height: 44,
                  padding: "0 14px",
                  background: "var(--color-input-bg)",
                  border: "1px solid var(--color-input-border)",
                  borderRadius: 8,
                  fontSize: 14,
                  color: "var(--color-text-main)",
                  outline: "none",
                }}
              />
              <button type="submit" className="btn-primary" style={{ height: 44 }}>
                <span>Open Paste</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: "10px 14px",
                background: "var(--color-danger-bg)",
                border: "1px solid var(--color-danger-border)",
                borderRadius: 8,
                color: "var(--color-danger)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
