"use client";

import { useRef, useMemo, ChangeEvent, UIEvent } from "react";

interface CodePanelProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  contentId?: string;
}

export function CodePanel({
  value,
  onChange,
  readOnly = false,
  placeholder = "Paste your text, code, or notes here...",
  contentId = "paste-content",
}: CodePanelProps) {
  const gutterRef = useRef<HTMLPreElement>(null);
  const scrollContainerRef = useRef<HTMLTextAreaElement & HTMLPreElement>(null);

  // Calculate line numbers string as a single joined block
  const gutterNumbers = useMemo(() => {
    const lineCount = value.split("\n").length;
    // Pre-join line numbers separated by newline
    let res = "";
    for (let i = 1; i <= lineCount; i++) {
      res += (i === 1 ? "" : "\n") + i;
    }
    return res;
  }, [value]);

  const handleScroll = (e: UIEvent<HTMLTextAreaElement | HTMLPreElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        background: "var(--color-code-bg)",
        border: "1px solid var(--color-code-gutter)",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Line Numbers Gutter */}
      <pre
        ref={gutterRef}
        aria-hidden="true"
        style={{
          width: 52,
          padding: "16px 12px 16px 8px",
          background: "transparent",
          color: "var(--color-code-gutter-text)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          lineHeight: "22px",
          textAlign: "right",
          userSelect: "none",
          overflow: "hidden",
          borderRight: "1px solid var(--color-code-gutter)",
          margin: 0,
        }}
      >
        {gutterNumbers}
      </pre>

      {/* Editor or Viewer Content */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        {readOnly ? (
          <pre
            id={contentId}
            ref={scrollContainerRef as any}
            onScroll={handleScroll}
            style={{
              padding: "16px 18px",
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: "22px",
              color: "var(--color-code-text)",
              overflow: "auto",
              whiteSpace: "pre",
              wordWrap: "normal",
              minHeight: 240,
              maxHeight: 650,
            }}
          >
            {value}
          </pre>
        ) : (
          <textarea
            id={contentId}
            ref={scrollContainerRef as any}
            value={value}
            onChange={handleChange}
            onScroll={handleScroll}
            placeholder={placeholder}
            spellCheck={false}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 240,
              padding: "16px 18px",
              background: "transparent",
              color: "var(--color-code-text)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: "22px",
              border: "none",
              outline: "none",
              resize: "vertical",
              overflow: "auto",
              whiteSpace: "pre",
              wordWrap: "normal",
            }}
          />
        )}
      </div>
    </div>
  );
}
