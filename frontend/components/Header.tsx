"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clipboard, Home, Code, FileText } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "var(--header-height)",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-card-border)",
        display: "flex",
        alignItems: "center",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
      className="site-header"
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand / Logo */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#3B5BFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              boxShadow: "0 2px 8px rgba(59, 91, 255, 0.3)",
            }}
          >
            <Clipboard size={20} />
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "var(--color-text-main)" }}>Pastebin</span>{" "}
            <span style={{ color: "#3B5BFF" }}>Lite</span>
          </span>
        </Link>

        {/* Navigation & Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <nav
            style={{ display: "flex", alignItems: "center", gap: 8 }}
            aria-label="Main Navigation"
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                fontSize: 14,
                fontWeight: 600,
                color: pathname === "/" ? "var(--color-primary)" : "var(--color-text-muted)",
                borderBottom: pathname === "/" ? "2px solid var(--color-primary)" : "2px solid transparent",
                transition: "color 0.15s ease, border-color 0.15s ease",
              }}
            >
              <Home size={17} />
              <span className="nav-label">Home</span>
            </Link>

            <Link
              href="/view"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                fontSize: 14,
                fontWeight: 600,
                color: pathname === "/view" ? "var(--color-primary)" : "var(--color-text-muted)",
                borderBottom: pathname === "/view" ? "2px solid var(--color-primary)" : "2px solid transparent",
                transition: "color 0.15s ease, border-color 0.15s ease",
              }}
            >
              <Code size={17} />
              <span className="nav-label">View Paste</span>
            </Link>
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
