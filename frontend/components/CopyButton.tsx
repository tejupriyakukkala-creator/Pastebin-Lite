"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text?: string;
  targetElementId?: string;
  label?: string;
  className?: string;
}

export function CopyButton({
  text,
  targetElementId,
  label = "Copy",
  className = "btn-secondary",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    let contentToCopy = text;

    if (!contentToCopy && targetElementId) {
      const el = document.getElementById(targetElementId);
      if (el) {
        contentToCopy = el.textContent || "";
      }
    }

    if (contentToCopy !== undefined) {
      try {
        await navigator.clipboard.writeText(contentToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy content to clipboard", err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
      aria-label={copied ? "Copied to clipboard" : label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
      }}
    >
      {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
      <span aria-live="polite">{copied ? "Copied!" : label}</span>
    </button>
  );
}
