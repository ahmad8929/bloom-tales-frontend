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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('require', 'module', 'exports', code)((id) => {
    if (id.startsWith('.')) return load(path.resolve(path.dirname(file), `${id}.ts`));
    if (!id.startsWith('@/')) return require(id);
    const base = path.resolve('src', id.slice(2));
    return load(fs.existsSync(`${base}.ts`) ? `${base}.ts` : `${base}/index.ts`);
  }, module, module.exports);
  return module.exports;
}
const sitemap = load('src/app/sitemap.ts').default;
const reply = data => ({ ok: true, json: async () => ({ status: 'success', data }) });
(async () => {
  const requests = [];
  global.fetch = async url => {
    requests.push(url);
    if (url.includes('categories')) return reply({ categories: [{ slug: 'western-dress' }, null, {}] });
    if (url.includes('page=1')) return reply({ products: [{ _id: 'one', updatedAt: 'invalid' }, null, {}, { _id: 'one' }], pagination: { hasNext: true } });
    return reply({ products: [{ _id: 'two', updatedAt: '2026-01-01' }], pagination: { hasNext: false } });
  };
  let entries = await sitemap();
  assert.equal(entries.length, 12);
  assert(entries.some(e => e.url.endsWith('/products/two')));
  assert.equal(entries.find(e => e.url.endsWith('/products/one')).lastModified, undefined);
  assert(requests.some(url => url.includes('page=2')));
  assert(entries.every(e => e.url.startsWith('https://www.bloomtales.in')));
  for (const fetcher of [
    async () => { throw new Error('offline'); },
    async () => ({ ok: false, status: 503 }),
    async () => ({ ok: true, json: async () => { throw new Error('invalid JSON'); } }),
    async () => reply({ products: {}, categories: {} }),
  ]) {
    global.fetch = fetcher;
    assert.equal((await sitemap()).length, 9);
  }
  global.fetch = async (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true });
  });
  // Keep Node alive while testing the real unref'ed AbortSignal deadline.
  const keepAlive = setInterval(() => {}, 1000);
  const start = Date.now();
  try { assert.equal((await sitemap()).length, 9); }
  finally { clearInterval(keepAlive); }
  assert(Date.now() - start < 9500);
  const robots = load('src/app/robots.ts').default();
  assert.equal(robots.sitemap, 'https://www.bloomtales.in/sitemap.xml');
  console.log('PASS: pagination, deduplication, invalid records/dates, offline/503/JSON/schema failures, timeout, robots');
})().catch(error => { console.error(error); process.exitCode = 1; });
