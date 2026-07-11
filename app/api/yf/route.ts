// Compass market-data proxy (Yahoo Finance) + Kronos forecast passthrough.
// Same handler the standalone app used; Next serverless route.
import { handle, TTL_S, kronosForecast } from '../_lib/yahooHandler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p: Record<string, string | undefined> = {};
  url.searchParams.forEach((v, k) => { p[k] = v; });

  if (p.fn === 'kronos') {
    const closes = (p.closes ?? '').split(',').map(Number).filter(Number.isFinite);
    const out = await kronosForecast(p.symbol ?? '', closes, Number(p.horizon) || 24);
    return Response.json(out, {
      status: out.ok ? 200 : out.configured ? 502 : 200,
      headers: { 'Cache-Control': out.ok ? 's-maxage=600' : 's-maxage=10' },
    });
  }

  const fwd = req.headers.get('x-forwarded-for') ?? '';
  const clientId = fwd.split(',')[0].trim();
  const out = await handle(p, clientId);
  const ttl = TTL_S[p.fn ?? ''] ?? 120;
  return Response.json(out, {
    status: out.ok ? 200 : 502,
    headers: {
      'Cache-Control': out.ok
        ? `s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`
        : 's-maxage=10',
    },
  });
}
