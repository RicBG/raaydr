import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import LenisProvider from "@/components/LenisProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistCtaTracker from "@/components/WaitlistCtaTracker";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const description =
  "Your money follows the artists you actually listen to. Producers and songwriters get paid automatically. The people who find music first earn for their taste. Traceable, every month.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "RAAYDR: Music streaming is broken. We fixed it. Now everyone wins.",
  description,
  openGraph: {
    title: "RAAYDR: Music streaming is broken. We fixed it. Now everyone wins.",
    description,
    siteName: "RAAYDR",
    type: "website",
    url: "https://raaydr.com",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "RAAYDR" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RAAYDR: Music streaming is broken. We fixed it. Now everyone wins.",
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
        <WaitlistCtaTracker />
        <SpeedInsights />
        <Analytics />
        {/* Google tag (gtag.js) — GA4 analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EG7SLYLLMY"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EG7SLYLLMY');
          `}
        </Script>
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1071993162391254');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1071993162391254&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
