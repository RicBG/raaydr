import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Human Plus · Marketing",
  description: "Weekly and monthly marketing readout for Human Plus.",
  // Internal dashboard behind Vercel Authentication — keep it out of indexes.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1B1D22",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
