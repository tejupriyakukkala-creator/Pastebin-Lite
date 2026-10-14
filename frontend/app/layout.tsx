import "./globals.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const metadata = {
  title: "Pastebin Lite - Simple, Secure Text & Code Sharing",
  description: "Share your text, code, or notes with a simple link. Set optional expiration time or view limits.",
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('pastebin_theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body>
        <div className="bg-blobs" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
