export function JsonLd({ data }: { data: unknown }) {
  // Catalog text is untrusted: prevent it from closing the script element.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
