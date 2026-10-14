export function Footer() {
  return (
    <footer
      style={{
        marginTop: "auto",
        borderTop: "1px solid var(--color-card-border)",
        padding: "24px 0",
        textAlign: "center",
        color: "var(--color-text-muted)",
        fontSize: 13,
      }}
    >
      <div className="container">
        Pastebin Lite &middot; Simple. Secure. Share.
      </div>
    </footer>
  );
}
