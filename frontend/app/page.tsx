import { Shield, Zap, Link as LinkIcon, Sparkles, Clock, Eye, Smartphone, Send } from "lucide-react";
import { PasteForm } from "../components/PasteForm";

export default function HomePage() {
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      {/* Hero Section */}
      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
          marginBottom: 48,
        }}
      >
        <div style={{ flex: "1 1 560px" }}>
          {/* Badge */}
          <div style={{ marginBottom: 16 }}>
            <span className="pill-badge">
              <Shield size={14} />
              Fast &middot; Secure &middot; Reliable
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: 16,
              color: "var(--color-text-main)",
            }}
          >
            Pastebin <span style={{ color: "var(--color-primary)" }}>Lite</span>
          </h1>

          {/* Tagline & Subline */}
          <p
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: "var(--color-text-main)",
              marginBottom: 8,
              lineHeight: 1.4,
            }}
          >
            Share your text, code, or notes with a simple link.
          </p>
          <p
            style={{
              fontSize: 15,
              color: "var(--color-text-muted)",
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            Create a paste, set an expiration time or view limit, and get a shareable URL.
          </p>

          {/* Inline Chips */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "var(--color-input-bg)",
                border: "1px solid var(--color-card-border)",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text-muted)",
              }}
            >
              <Zap size={14} color="#F59E0B" />
              Fast &amp; Simple
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "var(--color-input-bg)",
                border: "1px solid var(--color-card-border)",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text-muted)",
              }}
            >
              <Shield size={14} color="#3B5BFF" />
              Secure
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "var(--color-input-bg)",
                border: "1px solid var(--color-card-border)",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text-muted)",
              }}
            >
              <LinkIcon size={14} color="#10B981" />
              No Account Required
            </span>
          </div>
        </div>

        {/* Decorative Pure SVG/CSS Illustration */}
        <div
          aria-hidden="true"
          className="hero-illustration"
          style={{
            flex: "0 0 380px",
            position: "relative",
            perspective: 1000,
          }}
        >
          <div
            style={{
              width: 360,
              height: 230,
              background: "#111827",
              borderRadius: 14,
              border: "1px solid #374151",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4)",
              transform: "rotateY(-8deg) rotateX(6deg)",
              transformStyle: "preserve-3d",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Window Dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
            </div>

            {/* Code Lines */}
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#9CA3AF",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginTop: 8,
              }}
            >
              <span style={{ color: "#3B82F6" }}>// Share ideas</span>
              <span style={{ color: "#10B981" }}>// Share code</span>
              <span style={{ color: "#EC4899" }}>// Share anything</span>
            </div>

            {/* Floating Paper Plane & Copy Badge */}
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  background: "#3B5BFF",
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 6,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Copy Link
              </div>
              <Send size={18} color="#60A5FA" />
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Row: Create Form + How It Works */}
      <section
        className="main-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          gap: 28,
          alignItems: "start",
          marginBottom: 60,
        }}
      >
        {/* Left: Create Paste Form Card */}
        <div>
          <PasteForm />
        </div>

        {/* Right: How It Works Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="icon-tile icon-tile-purple">
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-main)" }}>
              How It Works
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Step 1 */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                1
              </div>
              <div>
                <strong style={{ fontSize: 14, color: "var(--color-text-main)" }}>Paste your content</strong>
                <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>
                  Add your text, code or notes in the editor.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                2
              </div>
              <div>
                <strong style={{ fontSize: 14, color: "var(--color-text-main)" }}>Set options (optional)</strong>
                <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>
                  Choose an expiration time or view limit for your paste.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                3
              </div>
              <div>
                <strong style={{ fontSize: 14, color: "var(--color-text-main)" }}>Create and share</strong>
                <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>
                  Get a unique link and share it with anyone.
                </p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--color-card-border)", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-muted)" }}>
              <LinkIcon size={14} />
              <span>Your paste will be available at</span>
            </div>
            <code
              style={{
                display: "inline-block",
                marginTop: 6,
                padding: "4px 8px",
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
                borderRadius: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              /p/&#123;pasteId&#125;
            </code>
          </div>
        </div>
      </section>

      {/* Feature Row (4 tiles) */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        <div className="card" style={{ padding: 22 }}>
          <div className="icon-tile icon-tile-pink" style={{ marginBottom: 14 }}>
            <Clock size={20} />
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-main)", marginBottom: 6 }}>
            Time-Based Expiration
          </h4>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
            Automatically expire pastes when you need to.
          </p>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="icon-tile icon-tile-green" style={{ marginBottom: 14 }}>
            <Eye size={20} />
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-main)", marginBottom: 6 }}>
            View Count Limits
          </h4>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
            Control how many times your paste can be viewed.
          </p>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="icon-tile icon-tile-blue" style={{ marginBottom: 14 }}>
            <Shield size={20} />
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-main)", marginBottom: 6 }}>
            Secure &amp; Reliable
          </h4>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
            Built with modern security best practices.
          </p>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="icon-tile icon-tile-purple" style={{ marginBottom: 14 }}>
            <Smartphone size={20} />
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-main)", marginBottom: 6 }}>
            Works Everywhere
          </h4>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
            Access your pastes on any device, anytime.
          </p>
        </div>
      </section>

    </div>
  );
}
