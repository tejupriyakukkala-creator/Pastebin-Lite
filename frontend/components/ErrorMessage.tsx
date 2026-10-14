import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export function ErrorMessage({ message, details }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 18px",
        background: "var(--color-danger-bg)",
        border: "1px solid var(--color-danger-border)",
        borderRadius: 10,
        color: "var(--color-danger)",
        fontSize: 14,
        marginTop: 16,
      }}
    >
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontWeight: 600 }}>{message}</span>
        {details && details.length > 0 && (
          <ul style={{ margin: "4px 0 0 18px", fontSize: 13 }}>
            {details.map((d, i) => (
              <li key={i}>
                <strong>{d.field}:</strong> {d.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
