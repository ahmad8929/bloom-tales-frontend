const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
// Load the route itself, erasing types and resolving its source aliases.
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  new Function('require', 'module', 'exports', code)((id) => {
    if (id.startsWith('.')) return load(path.resolve(path.dirname(file), `${id}.ts`));
    if (!id.startsWith('@/')) return require(id);
    const base = path.resolve('src', id.slice(2));
    return load(fs.existsSync(`${base}.ts`) ? `${base}.ts` : `${base}/index.ts`);
  }, module, module.exports);
  return module.exports;
}
const { productData, websiteData, organizationData, breadcrumbData } = load('src/lib/structured-data.ts');
const { initialSize } = load('src/lib/product-seo.ts');
const base = { name: 'Real dress', description: 'Description', price: 1499, images: [{ url: 'https://example.com/dress.jpg' }], variants: [{ size: 'S', stock: 0, sku: 'D-S' }, { size: 'M', stock: 2, sku: 'D-M' }] };
const data = productData(base, 'id-123');
assert.equal(data['@type'], 'ProductGroup');
assert.deepEqual(data.variesBy, ['https://schema.org/size']);
assert.equal(data.hasVariant.length, 2);
assert.equal(data.hasVariant[0].offers.availability, 'https://schema.org/OutOfStock');
assert.equal(data.hasVariant[1].offers.availability, 'https://schema.org/InStock');
assert.equal(data.hasVariant[1].offers.price, 1499);
assert.equal(data.hasVariant[1].offers.priceCurrency, 'INR');
assert.equal(data.hasVariant[1].sku, 'D-M');
assert.equal(data.hasVariant[1].url, 'https://www.bloomtales.in/products/id-123?size=M');
assert.equal(initialSize(base, 'S'), 'S');
assert.equal(initialSize(base, 'invalid'), 'M');
assert.equal(initialSize(base), 'M');
for (const forbidden of ['aggregateRating', 'review', 'brand', 'gtin', 'priceValidUntil']) assert(!JSON.stringify(data).includes(`"${forbidden}"`));
assert.equal(productData({ ...base, price: NaN }, 'id'), null);
assert.equal(productData({ ...base, images: [] }, 'id'), null);
const legacy = productData({ ...base, variants: [] }, 'id');
assert.equal(legacy['@type'], 'Product');
assert.equal(legacy.offers.availability, undefined);
assert.equal(websiteData.name, 'Bloomtales');
assert.equal(websiteData.alternateName, 'Bloomtales Boutique');
assert.equal(websiteData.url, 'https://www.bloomtales.in/');
assert.deepEqual(organizationData.sameAs, ['https://www.instagram.com/bloomtales_clothing/']);
assert.equal(breadcrumbData([{ name: 'Home', path: '/' }]).itemListElement[0].position, 1);
console.log('PASS: product variants, real stock/price/SKUs, selection, invalid/missing data, no invented ratings/brands, organization and site name');

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { JsonLd } = load('src/components/JsonLd.tsx');
const hostile = { name: '</script><script>alert(1)</script>' };
const markup = renderToStaticMarkup(React.createElement(JsonLd, { data: hostile }));
assert.equal((markup.match(/<script/g) || []).length, 1);
assert(!markup.includes('<script>alert'));
assert.deepEqual(JSON.parse(markup.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '')), hostile);
console.log('PASS: JSON-LD safely escapes catalog HTML/script text');
