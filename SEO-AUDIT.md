# Pre-deployment SEO audit — 2026-09-19

Production origin: https://www.bloomtales.in

## 404 finding

The live sitemap returned HTTP 404 during this audit. Both src/app/sitemap.ts and src/app/robots.ts were untracked in the frontend repository at the start. They were therefore absent from its committed HEAD. This explains why a deployment from that HEAD cannot serve them; the deployed revision and hosting configuration were not available to verify independently. No local rewrite, middleware matcher, or Next.js setting blocks these paths. Include all new files when committing, and deploy the frontend directory as the Next.js application.

The sitemap follows the App Router metadata convention, exports a default async function with Promise<MetadataRoute.Sitemap>, and appears as /sitemap.xml in the production route table. See https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap.

## Changes

- Kept the canonical origin in BRAND.domain and metadataBase.
- Removed inherited and manually rendered homepage canonicals, hardcoded homepage Open Graph tags, conflicting hardcoded crawler directives, and the placeholder Google verification value.
- Added server page wrappers for client-rendered home, shop, product and category pages. Every public route now supplies its own canonical and Open Graph URL. Products use bounded API fetching for names, descriptions and images; categories use their route parameter. Query-string shop filters canonicalize to /products; there are no separate collection routes beyond /category/[categoryId].
- Added noindex metadata for admin, cart, checkout (including payment success), orders, profile, login, signup, verification and password-reset flows. Expanded robots exclusions and retained the absolute production sitemap reference.
- Sitemap includes the nine public static routes and paginated product/category URLs, deduplicates URLs, encodes segments, rejects invalid identifiers and omits invalid or fabricated modification timestamps.
- Replaced browser API-client usage in server SEO with unauthenticated, bounded requests. The sitemap uses an eight-second overall deadline, preserves available entries on failures, and retries catalog discovery on the next request instead of permanently caching an empty build-time result. Product metadata has a five-second timeout and fallback metadata. Optional server-only CATALOG_API_URL overrides the existing backend origin.
- Removed old domain references from frontend README and backend CORS/email configuration/docs. Backend email defaults use the existing brand email bloomtalesclothing@gmail.com; deployment environment overrides remain outside this source audit.
- Removed the unsupported Next.js 16 eslint configuration key. Existing package-lock changes were left alone.

## Validation

- npm run typecheck: passed.
- npm run build: passed on Next.js 16.1.2. Both metadata routes registered.
- node scripts/test-seo.cjs: passed pagination, deduplication, bad IDs/dates, offline, HTTP 503, malformed JSON/schema and actual timeout scenarios.
- python3 scripts/check-seo-http.py against next start on port 3100: passed. Sitemap returned HTTP 200 application/xml, with nine static + 21 product + three category URLs. Robots returned HTTP 200 text/plain and the production sitemap URL. All 33 pages had exactly one self-canonical and matching og:url; tested private pages emitted noindex without conflicting robots tags.
- A second production server with CATALOG_API_URL pointing at an unreachable address returned sitemap HTTP 200 and all nine static URLs.
- git diff --check passed in both repositories. Old domain references were removed from searched source/docs.

## Deployment notes

Nothing was pushed or deployed. Frontend and backend are separate Git repositories; include the new server wrappers, client component files, SEO helpers, layouts and metadata routes in the frontend commit, plus backend changes in its own commit. After deployment, verify both public endpoints return 200, then resubmit https://www.bloomtales.in/sitemap.xml in Search Console.

API outages can temporarily omit unavailable catalog URLs; the sitemap remains valid and retries on its next request. The build still reports existing non-blocking middleware-convention deprecation and outdated Browserslist data warnings. This audit covers SEO and build readiness, not a full application security review.
