import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye, Clock, Calendar, ArrowLeft, Plus, AlertCircle } from "lucide-react";
import { fetchPasteServer } from "../../../lib/api";
import { CodePanel } from "../../../components/CodePanel";
import { CopyButton } from "../../../components/CopyButton";
import { Countdown } from "../../../components/Countdown";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pastebin Lite - View Paste",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewPastePage({ params }: PageProps) {
  const { id } = await params;
  const paste = await fetchPasteServer(id);

  if (!paste) {
    notFound();
  }

  const isExhausted = paste.remaining_views === 0;

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>
      {/* Back link */}
      <div style={{ marginBottom: 18 }}>
        <Link
          href="/"
          className="btn-secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
        >
          <ArrowLeft size={15} />
          Back to Home
        </Link>
      </div>

      {/* Burned / Exhausted Banner */}
      {isExhausted && (
        <div
          role="alert"
          style={{
            marginBottom: 20,
            padding: "14px 18px",
            background: "var(--color-danger-bg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: 12,
            color: "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <AlertCircle size={20} />
          <span>That was the last view. This paste is now gone.</span>
        </div>
      )}

      {/* Paste Card */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Header & Meta Chips */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            paddingBottom: 16,
            borderBottom: "1px solid var(--color-card-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-main)" }}>
              Paste
            </h1>
            <code
              style={{
                fontFamily: "var(--font-mono)",
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
                padding: "3px 10px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {id}
            </code>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <CopyButton targetElementId="paste-content" label="Copy Content" className="btn-primary" />
            <Link href="/" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Plus size={16} />
              New Paste
            </Link>
          </div>
        </div>

        {/* Metadata Chips Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 13 }}>
          {/* Expiration Chip */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "var(--color-input-bg)",
              border: "1px solid var(--color-card-border)",
              borderRadius: 8,
              color: "var(--color-text-muted)",
            }}
          >
            <Clock size={15} color="#F43F5E" />
            <span>
              Expires:{" "}
              {paste.expires_at ? (
                <>
                  <span title={paste.expires_at}>{new Date(paste.expires_at).toLocaleString()}</span>{" "}
                  (<Countdown targetDateIso={paste.expires_at} />)
                </>
              ) : (
                <strong>Never</strong>
              )}
            </span>
          </div>

          {/* Views Remaining Chip */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "var(--color-input-bg)",
              border: "1px solid var(--color-card-border)",
              borderRadius: 8,
              color: "var(--color-text-muted)",
            }}
          >
            <Eye size={15} color="#10B981" />
            <span>
              Remaining views:{" "}
              <strong>{paste.remaining_views === null ? "Unlimited" : paste.remaining_views}</strong>
            </span>
          </div>
        </div>

        {/* Code Panel Display */}
        <CodePanel value={paste.content} readOnly contentId="paste-content" />
      </div>
    </div>
  );
}
