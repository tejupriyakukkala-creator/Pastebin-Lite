"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("pastebin_theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("pastebin_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="theme-toggle-btn"
        aria-label="Toggle color theme"
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
        }}
      >
        <Sun size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-muted)",
        border: "1px solid var(--color-card-border)",
        background: "var(--color-card)",
        transition: "all 0.15s ease",
      }}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
