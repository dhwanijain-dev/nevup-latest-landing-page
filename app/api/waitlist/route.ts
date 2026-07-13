// Portfolio opt-in -> shared waitlist (deduped by email). Both Yesss and No
// register interest so we know who engaged; the first action (this or chat
// feedback) wins, no duplicates.
import { addToWaitlist, dbEnabled } from '../_lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { userId?: string; email?: string; choice?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  if (dbEnabled()) {
    await addToWaitlist(body.userId, body.email, 'portfolio', body.choice);
  }
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
