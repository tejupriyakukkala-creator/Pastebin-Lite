import Link from "next/link";
import { AlertTriangle, Home, Plus } from "lucide-react";
import { MetaRefinement } from "./meta-refinement";

export default function PasteNotFound() {
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
      <div
        className="card"
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "40px 32px",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--color-danger-bg)",
            color: "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text-main)" }}>
          Paste Unavailable
        </h1>

        <p style={{ fontSize: 15, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          It may not exist, may have expired, or may have reached its view limit.
        </p>

        {/* Client side non-consuming refinement check */}
        <MetaRefinement />

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>
            <Home size={16} />
            Back to Home
          </Link>
          <Link href="/" className="btn-secondary" style={{ textDecoration: "none" }}>
            <Plus size={16} />
            Create a New Paste
          </Link>
        </div>
      </div>
    </div>
  );
}
