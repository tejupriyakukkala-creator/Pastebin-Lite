"use client";

import { CheckCircle2, ExternalLink, Key, RotateCcw } from "lucide-react";
import { CopyButton } from "./CopyButton";
import type { PasteCreateResponse } from "../types/paste";

interface SuccessMessageProps {
  data: PasteCreateResponse;
  onReset: () => void;
}

export function SuccessMessage({ data, onReset }: SuccessMessageProps) {
  const expiresSummary = data.expires_at
    ? `Expires ${new Date(data.expires_at).toLocaleString()}`
    : "Never expires";

  const viewsSummary = data.max_views
    ? `${data.max_views} ${data.max_views === 1 ? "view max" : "views max"}`
    : "Unlimited views";

  return (
    <div
      style={{
        marginTop: 24,
        padding: 24,
        background: "var(--color-card)",
        border: "1px solid var(--color-success-border)",
        borderRadius: 14,
        boxShadow: "var(--color-card-shadow)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* Title Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--color-success-bg)",
              color: "var(--color-success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text-main)" }}>
              Paste created successfully!
            </h3>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              {expiresSummary} &middot; {viewsSummary}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="btn-secondary"
          style={{ fontSize: 13, padding: "6px 12px" }}
        >
          <RotateCcw size={14} />
          Create another
        </button>
      </div>

      {/* Shareable Link Box */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>
          SHAREABLE URL
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            readOnly
            value={data.url}
            style={{
              flex: "1 1 280px",
              height: 42,
              padding: "0 14px",
              background: "var(--color-input-bg)",
              border: "1px solid var(--color-input-border)",
              borderRadius: 8,
              fontSize: 14,
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-main)",
            }}
          />
          <CopyButton text={data.url} label="Copy Link" className="btn-primary" />
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            <ExternalLink size={15} />
            Open paste
          </a>
        </div>
      </div>

      {/* Delete Token Box */}
      <div
        style={{
          padding: "14px 16px",
          background: "var(--color-primary-light)",
          borderRadius: 10,
          border: "1px solid var(--color-card-border)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-primary)", fontWeight: 600, fontSize: 13 }}>
          <Key size={15} />
          <span>Delete Token (save this — shown once only)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <code
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--color-text-main)",
              wordBreak: "break-all",
            }}
          >
            {data.delete_token}
          </code>
          <CopyButton text={data.delete_token} label="Copy Token" className="btn-secondary" />
        </div>
      </div>
    </div>
  );
}
