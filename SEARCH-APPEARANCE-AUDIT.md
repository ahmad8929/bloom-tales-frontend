# Google Search appearance audit — 2026-09-19

Implemented locally; not committed, pushed, or deployed. Production origin remains https://www.bloomtales.in.

## Findings and changes

| Area | Problem found | Implemented result / search feature |
| --- | --- | --- |
| Favicon | `/image.png` is 262×268, but duplicate metadata and manual links claimed 16/32/180/192/512 square sizes. The manifest also advertised incorrect dimensions. | App Router `/icon` serves a real 512×512 PNG; `/apple-icon` serves 180×180. Both frame the existing high-resolution `public/logo.png` artwork, without generating a new brand design. Exactly one icon and one Apple icon link are emitted. Enables a compliant favicon signal for Search. |
| Site name | No homepage `WebSite` data; inconsistent site-name defaults. | Homepage `WebSite` has name `Bloomtales`, alternateName `Bloomtales Boutique`, URL `https://www.bloomtales.in/`. `og:site_name` is Bloomtales. Supports Google's preferred site-name selection. |
| Organization | Global `OnlineStore` data included unverified Facebook/Twitter profiles and a generic, price-less in-stock offer. | One homepage Organization entity uses the existing legal name, contact details, real logo and configured Instagram profile. Removed unsupported social links, Twitter account handles and generic business offers. Supports organization/logo understanding; no Knowledge Panel is promised. |
| Products | No Product/Offer schema; visible product content loaded only in the browser. | Shared request-memoized server fetch feeds metadata, JSON-LD and initial visible product content. Actual names, descriptions, images, INR prices and identifiers are used. Supports product snippets and merchant-listing eligibility when Google accepts the data. |
| Variants | Size/stock/SKU inventory existed, but sizes could not be preselected by URL. | ProductGroup nests Product + Offer per real size, with SKU when supplied and stock-specific availability. `?size=XXL` preselects XXL, including out-of-stock sizes. Sold-out products keep the selector visible so the selected size can be seen. The base product canonical stays unchanged. Supports size-variant merchant listings. Colors are product attributes, not invented color inventory. |
| Breadcrumbs | No breadcrumb schema. | Product/category pages emit a single BreadcrumbList with Home → Products → current page. Supports breadcrumb search appearance. |
| Metadata | Homepage duplicated brand text through the title template and lacked explicit social descriptions. Three differently colored products shared the same name and description. | Homepage uses an absolute title and explicit description/social metadata. Product metadata includes actual color labels, distinguishing the existing catalog. All audited home/category/product routes have nonempty title, description, Open Graph and Twitter metadata and their own canonical. |
| Initial HTML | Redux Providers replaced the whole page with a loading screen during SSR, hiding page-level structured data. | Public pages now render during SSR using an anonymous Redux snapshot. Auth/cart initializer effects remain behind the persistence gate. Private pages retain their loading/persistence gate. Header search-parameter logic has a local Suspense boundary. |

## Exact files changed

All paths below are relative to `frontend/`:

- `src/app/icon.tsx` — new 512px App Router icon.
- `src/app/apple-icon.tsx` — new 180px Apple icon.
- `src/lib/brand-icon.tsx` — shared ImageResponse renderer using the original logo file.
- `public/manifest.json` — accurate icon endpoints, dimensions and `any` purpose; removed unsupported maskable claim.
- `src/app/layout.tsx` — removed duplicate icon links/config, global store schema and unverified Twitter handles; standardized site name and corrected inherited image dimensions.
- `src/app/page.tsx` — homepage metadata and WebSite/Organization JSON-LD.
- `src/app/products/[productId]/page.tsx` — shared server product load, metadata, ProductGroup/Product/Offer and breadcrumbs.
- `src/app/products/[productId]/PageClient.tsx` — initial server product/size/material state; avoids redundant initial browser fetch when server data exists.
- `src/app/category/[categoryId]/page.tsx` — category breadcrumbs; existing canonical retained.
- `src/lib/product-seo.ts` — shared request-scoped product fetch, color-aware titles/descriptions and size selection.
- `src/lib/structured-data.ts` — typed product input, organization/site/breadcrumb/product schema builders.
- `src/components/JsonLd.tsx` — server-rendered JSON-LD with safe escaping of catalog text.
- `src/components/Providers.tsx` — public SSR content while preserving private loading behavior.
- `src/components/ConditionalLayout.tsx` — local Header Suspense boundary.
- `src/components/product/SizeSelector.tsx` — accessible selected-size/out-of-stock state.
- `src/store/index.ts` — anonymous server snapshot for consistent hydration.
- `scripts/test-search-appearance.cjs` — structured-data and safe-serialization regression tests.
- `scripts/check-search-appearance.py` — raw-HTML, metadata, icon/crawlability and size-link checks.
- `SEARCH-APPEARANCE-AUDIT.md` — this report.

Existing `package-lock.json` modifications are unrelated and untouched. No backend files changed.

## Validation

- `npm run typecheck` and `npm run build`: passed with Next.js 16.1.2.
- `node scripts/test-search-appearance.cjs`: passed real price/currency/stock/SKU mapping, variants, size selection, missing-data omission, no invented brands/ratings, website/organization data, and script-injection escaping.
- `node scripts/test-seo.cjs`: existing sitemap/API failure regression tests passed.
- `python3 scripts/check-search-appearance.py` against production `next start`: passed for homepage + all 3 categories + all 21 products. Initial raw HTML contains actual JSON-LD scripts and visible product headings; metadata fields are nonempty, descriptions distinct, and canonicals self-referencing. Three size deep links retain canonical and preselect the corresponding size in server HTML.
- `/icon` and `/apple-icon`, including Next.js-generated fingerprinted link URLs: HTTP 200, image/png, correct 512/180 square dimensions, permitted by robots for Googlebot-Image. Inspected the rendered brand icon visually. Stable route paths are also referenced by the manifest and Organization logo; Next.js adds its normal asset fingerprint to generated head links.
- `python3 scripts/check-seo-http.py`: all 33 sitemap pages retain exactly one matching canonical/og:url, and private-page noindex checks pass. Sitemap and robots return HTTP 200.
- Headless Chrome browser smoke test: home, category, product, login and cart render without hydration/page errors; sold-out XXL preselection and JSON-LD survive hydration. Browser API reads were relayed to the real backend within the test harness because its CORS policy excludes local port 3100; no backend policy changes were made.
- `git diff --check`: passed. Sitemap, robots, canonical helper, catalog transport, middleware, Next.js config and BRAND.domain have no changes.
- Live non-www homepage returns 308 to https://www.bloomtales.in/; no redirect changes needed.

## Data boundaries and deployment follow-up

No product-specific review/rating data or manufacturer brand field exists in the current model, so no ratings, review stars, GTINs or manufacturer brand claims are emitted. Bloomtales is identified as the seller. Legacy products without authoritative stock omit availability; products without valid name/image/price omit rich-result schema rather than inventing data. API failures retain fallback metadata and the existing browser retry UI, without fabricated Product offers.

The three Shehnaz Farshi Suit Set records have identical descriptions referring to ivory fabric despite different stored colors. Metadata now distinguishes them using their actual color fields; the original catalog copy is preserved and should be corrected by the merchant if inaccurate.

Category social images currently use the existing brand image; product social images use the primary/first real product image. There are no fabricated category photos. No dedicated favicon.ico is necessary because App Router emits a valid PNG icon link; no conflicting favicon.ico or static app/icon/apple-icon assets exist.

Local checks are not a Google Rich Results Test result. After deployment, test the homepage and representative in-stock/out-of-stock product URLs in Google's Rich Results Test and URL Inspection, request recrawling, and monitor Search Console. Shipping/return policy enhancements were not added without reconciled policy data. Google decides whether/when to display favicons, site names or rich results; implementation does not guarantee display.

References:
- https://developers.google.com/search/docs/appearance/favicon-in-search
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/structured-data/product-variants
- https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
