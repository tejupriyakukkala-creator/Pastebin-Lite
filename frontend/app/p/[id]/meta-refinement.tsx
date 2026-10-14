"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MetaRefinement() {
  const pathname = usePathname();
  const [specificReason, setSpecificReason] = useState<string | null>(null);

  useEffect(() => {
    // Extract ID from path segment: /p/<id>
    const match = pathname.match(/\/p\/([^/]+)/);
    if (!match || !match[1]) return;

    const id = match[1];

    fetch(`/api/pastes/${id}/meta`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 404) {
          const data = await res.json().catch(() => null);
          const code = data?.error?.code;
          if (code === "PASTE_EXPIRED") {
            setSpecificReason("This paste has expired.");
          } else if (code === "PASTE_VIEW_LIMIT_REACHED") {
            setSpecificReason("This paste has reached its maximum view limit.");
          } else {
            setSpecificReason("This paste does not exist.");
          }
        }
      })
      .catch(() => {
        // Fallback to generic message
      });
  }, [pathname]);

  if (!specificReason) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: 12,
        padding: "8px 14px",
        background: "var(--color-danger-bg)",
        border: "1px solid var(--color-danger-border)",
        borderRadius: 8,
        color: "var(--color-danger)",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      Reason: {specificReason}
    </div>
  );
}
