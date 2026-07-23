import type { Metadata, Viewport } from "next";
import LenisProvider from "@/components/LenisProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const description =
  "Your money follows the artists you actually listen to. Producers and songwriters get paid automatically. The people who find music first earn for their taste. Traceable, every month.";

export const metadata: Metadata = {
  metadataBase: new URL("https://raaydr.com"),
  title: "RAAYDR: Music streaming is broken. We fixed it. Everyone wins.",
  description,
  openGraph: {
    title: "RAAYDR: Music streaming is broken. We fixed it. Everyone wins.",
    description,
    siteName: "RAAYDR",
    type: "website",
    url: "https://raaydr.com",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "RAAYDR" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RAAYDR: Music streaming is broken. We fixed it. Everyone wins.",
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F2EC",
};

// Only the two fonts painting above the fold; Space Mono arrives with the
// stylesheet and swaps in on small below-the-display text.
const preloadFonts = [
  "/fonts/ClashDisplay-Semibold.woff2",
  "/fonts/GeneralSans-Regular.woff2",
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {preloadFonts.map((href) => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body>
        <div className="grain-overlay" aria-hidden="true" />
        <LenisProvider>
          <Nav />
          {children}
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
