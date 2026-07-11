// Compass broker connect — stateless credential relay. POST only, no-store.
import { handleBroker } from '../_lib/brokerHandler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { broker?: string; creds?: Record<string, string> } = {};
  try { body = await req.json(); } catch { /* empty */ }
  const out = await handleBroker(body);
  return Response.json(out, {
    status: out.ok ? 200 : 400,
    headers: { 'Cache-Control': 'no-store' },
  });
}
