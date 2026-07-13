// Yahoo Finance proxy handler - framework-agnostic (used by the Vite dev
// middleware and the Vercel serverless function).
//
// Built for concurrent load:
//  - single-flight: N simultaneous requests for the same key → 1 upstream call
//  - per-kind TTLs matched to data volatility (statements ≠ quotes)
//  - stale-on-error: upstream throttling serves the last good copy (flagged)
//  - upstream cooldown after 429s so we never hammer a throttling host
//  - per-client token bucket to stop one abuser draining the shared budget
//  - crumb fetch is itself single-flight (no refresh stampede)
//
// Endpoints proxied:
//   fn=search      q=<text>
//   fn=chart       symbol= range=1y interval=1d
//   fn=summary     symbol= modules=a,b,c
//   fn=timeseries  symbol= types=annualX,quarterlyY

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const ALLOWED_MODULES = new Set([
  'price', 'summaryDetail', 'assetProfile', 'defaultKeyStatistics',
  'financialData', 'calendarEvents', 'earningsHistory', 'earningsTrend',
  'recommendationTrend', 'upgradeDowngradeHistory', 'institutionOwnership',
  'majorHoldersBreakdown', 'incomeStatementHistory',
  'incomeStatementHistoryQuarterly', 'balanceSheetHistory',
  'cashflowStatementHistory',
]);

// TTLs by volatility. CDN s-maxage (set in the serverless wrapper) mirrors
// these so Vercel's edge absorbs most traffic before it reaches an instance.
export const TTL_S: Record<string, number> = {
  search: 6 * 3600,      // symbol directory - barely changes
  chart: 15 * 60,        // 1d bars
  summary: 10 * 60,      // quote + fundamentals bundle
  timeseries: 24 * 3600, // annual/quarterly statements - change quarterly
};
const STALE_MAX_S = 24 * 3600; // how old a stale copy may be served on error

interface CrumbState { cookie: string; crumb: string; ts: number }
let crumbState: CrumbState | null = null;
let crumbInflight: Promise<CrumbState> | null = null;

async function fetchCrumb(): Promise<CrumbState> {
  const r1 = await fetch('https://fc.yahoo.com/', {
    headers: { 'User-Agent': UA },
    redirect: 'manual',
  });
  const cookie = (r1.headers.get('set-cookie') ?? '').split(';')[0];
  if (!cookie) throw new Error('Yahoo did not issue a session cookie');
  const r2 = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, Cookie: cookie },
  });
  const crumb = (await r2.text()).trim();
  if (!crumb || crumb.includes('<')) throw new Error('Yahoo crumb fetch failed');
  return { cookie, crumb, ts: Date.now() };
}

async function getCrumb(force = false): Promise<CrumbState> {
  if (!force && crumbState && Date.now() - crumbState.ts < 25 * 60_000) return crumbState;
  if (!crumbInflight) {
    crumbInflight = fetchCrumb()
      .then(c => { crumbState = c; return c; })
      .finally(() => { crumbInflight = null; });
  }
  return crumbInflight;
}

// ── cache + single-flight ────────────────────────────────────────────────────

interface CacheEntry { ts: number; data: unknown }
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function cacheGet(key: string, ttlS: number): unknown | undefined {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < ttlS * 1000) return hit.data;
  return undefined;
}
function cacheGetStale(key: string): unknown | undefined {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < STALE_MAX_S * 1000) return hit.data;
  return undefined;
}
function cacheSet(key: string, data: unknown): void {
  if (cache.size > 2000) {
    // drop the oldest quarter of entries
    const keys = [...cache.entries()]
      .sort((a, b) => a[1].ts - b[1].ts)
      .slice(0, 500)
      .map(([k]) => k);
    keys.forEach(k => cache.delete(k));
  }
  cache.set(key, { ts: Date.now(), data });
}

// ── upstream cooldown (throttle detection) ───────────────────────────────────

let cooldownUntil = 0;
function noteThrottle(): void {
  cooldownUntil = Date.now() + 30_000; // back off upstream for 30s
}

// ── per-client rate limit (token bucket, best-effort per instance) ──────────

const buckets = new Map<string, { tokens: number; ts: number }>();
const BUCKET_CAP = 40;         // burst ≈ 10 instrument loads back-to-back
const BUCKET_REFILL_PER_S = 3; // sustained ~3 req/s per client

function allowClient(id: string): boolean {
  if (!id) return true;
  const now = Date.now();
  let b = buckets.get(id);
  if (!b) { b = { tokens: BUCKET_CAP, ts: now }; buckets.set(id, b); }
  b.tokens = Math.min(BUCKET_CAP, b.tokens + ((now - b.ts) / 1000) * BUCKET_REFILL_PER_S);
  b.ts = now;
  if (buckets.size > 5000) buckets.clear();
  if (b.tokens < 1) return false;
  b.tokens -= 1;
  return true;
}

// ── upstream fetch ───────────────────────────────────────────────────────────

const SYM_RE = /^[A-Za-z0-9.^&\-=]{1,20}$/;

async function yget(url: string, withCrumb: boolean): Promise<unknown> {
  const headers: Record<string, string> = { 'User-Agent': UA };
  let full = url;
  if (withCrumb) {
    const c = await getCrumb();
    headers.Cookie = c.cookie;
    full += `${url.includes('?') ? '&' : '?'}crumb=${encodeURIComponent(c.crumb)}`;
  }
  let r = await fetch(full, { headers });
  if (withCrumb && (r.status === 401 || r.status === 403)) {
    const c = await getCrumb(true);
    headers.Cookie = c.cookie;
    full = `${url}${url.includes('?') ? '&' : '?'}crumb=${encodeURIComponent(c.crumb)}`;
    r = await fetch(full, { headers });
  }
  if (r.status === 429 || r.status === 999) {
    noteThrottle();
    throw new Error(`Yahoo throttling (HTTP ${r.status})`);
  }
  if (!r.ok) throw new Error(`Yahoo upstream HTTP ${r.status}`);
  return r.json();
}

/** Cached, single-flight, stale-on-error upstream call. */
async function cachedCall(
  key: string, kind: keyof typeof TTL_S,
  fetcher: () => Promise<unknown>,
): Promise<{ data: unknown; stale: boolean }> {
  const fresh = cacheGet(key, TTL_S[kind]);
  if (fresh !== undefined) return { data: fresh, stale: false };

  // upstream cooling down → serve stale immediately if we have it
  if (Date.now() < cooldownUntil) {
    const stale = cacheGetStale(key);
    if (stale !== undefined) return { data: stale, stale: true };
  }

  let p = inflight.get(key);
  if (!p) {
    p = fetcher()
      .then(data => { cacheSet(key, data); return data; })
      .finally(() => { inflight.delete(key); });
    inflight.set(key, p);
  }
  try {
    return { data: await p, stale: false };
  } catch (e) {
    const stale = cacheGetStale(key);
    if (stale !== undefined) return { data: stale, stale: true };
    throw e;
  }
}

export interface ProxyResult { ok: boolean; data?: unknown; error?: string; stale?: boolean }

export async function handle(
  params: Record<string, string | undefined>,
  clientId = '',
): Promise<ProxyResult> {
  try {
    if (!allowClient(clientId)) {
      return { ok: false, error: 'Rate limit - slow down and retry shortly' };
    }
    const fn = params.fn ?? '';

    if (fn === 'search') {
      const q = (params.q ?? '').slice(0, 60);
      if (!q.trim()) return { ok: false, error: 'Empty query' };
      const key = `s:${q.toLowerCase()}`;
      const { data, stale } = await cachedCall(key, 'search', () => yget(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=6`,
        false));
      return { ok: true, data, stale };
    }

    if (fn === 'chart') {
      const symbol = params.symbol ?? '';
      if (!SYM_RE.test(symbol)) return { ok: false, error: 'Invalid symbol' };
      const range = ['1d', '5d', '1mo', '6mo', '1y', '5y'].includes(params.range ?? '') ? params.range : '1y';
      const interval = ['1m', '15m', '1d', '1wk'].includes(params.interval ?? '') ? params.interval : '1d';
      const key = `c:${symbol}:${range}:${interval}`;
      const { data, stale } = await cachedCall(key, 'chart', () => yget(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&events=div%2Csplit`,
        false));
      return { ok: true, data, stale };
    }

    // ── Finnhub: free second source (peers, analyst recommendation, metrics) ──
    // Activates when FINNHUB_KEY is set. Complements Yahoo, especially peers/
    // competitors which Yahoo does not provide. Only a small allowlist of
    // read-only endpoints is proxied.
    if (fn === 'finnhub') {
      const fkey = process.env.FINNHUB_KEY;
      if (!fkey) return { ok: false, error: 'Finnhub not configured' };
      const symbol = params.symbol ?? '';
      if (!SYM_RE.test(symbol)) return { ok: false, error: 'Invalid symbol' };
      const EP: Record<string, string> = {
        peers: 'stock/peers', recommendation: 'stock/recommendation',
        metric: 'stock/metric?metric=all', profile: 'stock/profile2', quote: 'quote',
      };
      const epKey = params.ep ?? '';
      if (!EP[epKey]) return { ok: false, error: 'Bad finnhub endpoint' };
      const sep = EP[epKey].includes('?') ? '&' : '?';
      const key = `fh:${epKey}:${symbol}`;
      const { data, stale } = await cachedCall(key, 'summary', () => yget(
        `https://finnhub.io/api/v1/${EP[epKey]}${sep}symbol=${encodeURIComponent(symbol)}&token=${fkey}`,
        false));
      return { ok: true, data, stale };
    }

    if (fn === 'timeseries') {
      const symbol = params.symbol ?? '';
      if (!SYM_RE.test(symbol)) return { ok: false, error: 'Invalid symbol' };
      const types = (params.types ?? '')
        .split(',')
        .filter(t => /^(annual|quarterly)[A-Za-z]{1,60}$/.test(t))
        .slice(0, 40);
      if (!types.length) return { ok: false, error: 'No valid types' };
      const key = `t:${symbol}:${types.join(',')}`;
      const p2 = Math.floor(Date.now() / 1000);
      const p1 = p2 - 8 * 365 * 86400;
      const { data, stale } = await cachedCall(key, 'timeseries', () => yget(
        `https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(symbol)}?type=${types.join(',')}&period1=${p1}&period2=${p2}`,
        false));
      return { ok: true, data, stale };
    }

    if (fn === 'summary') {
      const symbol = params.symbol ?? '';
      if (!SYM_RE.test(symbol)) return { ok: false, error: 'Invalid symbol' };
      const modules = (params.modules ?? '')
        .split(',')
        .filter(m => ALLOWED_MODULES.has(m));
      if (!modules.length) return { ok: false, error: 'No valid modules' };
      const key = `q:${symbol}:${modules.join(',')}`;
      const { data, stale } = await cachedCall(key, 'summary', () => yget(
        `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules.join(',')}`,
        true));
      return { ok: true, data, stale };
    }

    return { ok: false, error: `Unknown fn '${fn}'` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Proxy failure' };
  }
}

// ── Kronos candlestick forecast (env-gated) ─────────────────────────────────
// Kronos (open-source candlestick foundation model, HuggingFace) needs a
// model-serving endpoint. Set KRONOS_ENDPOINT to a server exposing
// POST { symbol, closes:number[], horizon } → { forecast:number[], sigma? }.
// Without it, we honestly report the feature as unconfigured - never faked.
export interface KronosResult {
  ok: boolean; configured: boolean;
  forecast?: number[]; sigma?: number[]; horizon?: number; error?: string;
}

export async function kronosForecast(symbol: string, closes: number[], horizon = 24): Promise<KronosResult> {
  const endpoint = process.env.KRONOS_ENDPOINT;
  if (!endpoint) {
    return {
      ok: false, configured: false,
      error: 'Kronos forecasting is not connected yet - set KRONOS_ENDPOINT to a '
        + 'Kronos model server. The chart and analytics above are live regardless.',
    };
  }
  if (!SYM_RE.test(symbol) || !Array.isArray(closes) || closes.length < 32) {
    return { ok: false, configured: true, error: 'Need at least 32 closes to forecast' };
  }
  const key = `k:${symbol}:${horizon}:${closes.length}:${Math.round(closes[closes.length - 1])}`;
  const cached = cacheGet(key, 600) as KronosResult | undefined;
  if (cached) return cached;
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.KRONOS_API_KEY ? { Authorization: `Bearer ${process.env.KRONOS_API_KEY}` } : {}),
      },
      body: JSON.stringify({ symbol, closes: closes.slice(-512), horizon }),
    });
    if (!r.ok) throw new Error(`Kronos server HTTP ${r.status}`);
    const data = await r.json();
    const forecast = (data.forecast ?? data.predictions ?? []).map(Number).filter(Number.isFinite);
    if (!forecast.length) throw new Error('Kronos returned no forecast');
    const out: KronosResult = {
      ok: true, configured: true, forecast, horizon,
      sigma: Array.isArray(data.sigma) ? data.sigma.map(Number) : undefined,
    };
    cacheSet(key, out);
    return out;
  } catch (e) {
    return { ok: false, configured: true, error: e instanceof Error ? e.message : 'Kronos call failed' };
  }
}
