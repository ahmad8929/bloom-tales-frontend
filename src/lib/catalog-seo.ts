// Server metadata requests must never use the browser client's authentication/retries.
const API_ORIGIN = process.env.CATALOG_API_URL || 'https://orange-llama-692113.hostingersite.com';

export async function catalogData(path: string, signal = AbortSignal.timeout(5000)) {
  try {
    const response = await fetch(`${API_ORIGIN.replace(/\/$/, '')}/api${path}`, {
      signal,
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    if (!body || body.status !== 'success' || !body.data) throw new Error('Invalid catalog response');
    return body.data;
  } catch (error) {
    console.warn(`[SEO] Catalog unavailable: ${path}`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}
