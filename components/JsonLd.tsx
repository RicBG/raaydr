// Emits a JSON-LD script tag. Used for the site-wide Organization and WebSite
// entities in the root layout, BlogPosting + FAQPage on each post, and Blog on
// the Pulse index. JSON.stringify escapes the payload; we additionally guard
// the closing-tag sequence so the script cannot be broken out of.
export default function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
