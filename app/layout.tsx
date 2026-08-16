import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import LenisProvider from "@/components/LenisProvider";
import RouteTransition from "@/components/RouteTransition";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistCtaTracker from "@/components/WaitlistCtaTracker";
import JsonLd from "@/components/JsonLd";
import JoinedModal from "@/components/JoinedModal";
import AttributionCapture from "@/components/AttributionCapture";
import ConsentBanner from "@/components/ConsentBanner";
import { JOINED_PREPAINT_SCRIPT } from "@/lib/joined";
import { CONSENT_PREPAINT_SCRIPT, META_PIXEL_SCRIPT } from "@/lib/consent";
import { organizationSchema, pageMetadata, websiteSchema } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// metadataBase belongs here and nowhere else: every page's canonical and
// og:url is a relative path resolved against it.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    title: "RAAYDR: Music streaming is broken. We fixed it. Now everyone wins.",
    path: "/",
  }),
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
        {/* Runs before first paint. Stamps the document when a role page is
            opened with the post-signup flag so the cover in globals.css is on
            screen from the first frame, and the confirmation modal never
            arrives after a flash of the page underneath it. Deliberately a raw
            inline script, not next/script: every loading strategy runs after
            paint, which is exactly the flash this prevents. */}
        <script dangerouslySetInnerHTML={{ __html: JOINED_PREPAINT_SCRIPT }} />
        {/* Consent Mode v2 defaults. MUST stay above the Google tag below and
            must stay a raw inline script in <head>: Consent Mode only binds if
            the default command reaches the dataLayer before gtag.js
            initialises. Set it any later and the tag has already written its
            cookies, which is precisely what the banner exists to prevent. */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_PREPAINT_SCRIPT }} />
      </head>
      <body>
        {/* Site-wide entity markup. Per-page FAQPage blocks are emitted by the
            FAQ accordion and are untouched by these. */}
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <div className="grain-overlay" aria-hidden="true" />
        <LenisProvider>
          <Nav />
          <RouteTransition>{children}</RouteTransition>
          <Footer />
        </LenisProvider>
        <WaitlistCtaTracker />
        <AttributionCapture />
        {/* Mounted once here rather than on each role page, so the role pages
            themselves are untouched and any page can receive the handoff. */}
        <JoinedModal />
        <ConsentBanner />
        {/* Vercel Analytics and Speed Insights are cookieless and set no
            identifier, so they are outside PECR's consent requirement and are
            not gated. If either is ever configured to identify visitors, it
            moves behind the banner with the rest. */}
        <SpeedInsights />
        <Analytics />
        {/* Google tag (gtag.js) — GA4 analytics.
            Loads unconditionally but starts fully denied via the Consent Mode
            defaults set in <head>. Denied means no cookies and no identifiers,
            while still letting GA4 model conversions for visitors who decline,
            which is why the tag is held closed rather than withheld. */}
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
        {/* Meta Pixel. Revoked before init, so no _fbp cookie is set until the
            visitor accepts; see META_PIXEL_SCRIPT for why the order matters. */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {META_PIXEL_SCRIPT("1071993162391254")}
        </Script>
        {/* The <noscript> tracking pixel that used to sit here has been
            removed. It fired an unconditional PageView to Meta from an <img>,
            which no script can gate — and consent cannot be obtained without
            JavaScript in the first place, so it could only ever have tracked
            people who had no way to agree. */}
      </body>
    </html>
  );
}
