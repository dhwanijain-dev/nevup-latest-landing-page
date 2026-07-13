// Records one-time session feedback on the analyst chat (rating 1-4).
import { q, dbEnabled } from '../_lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LABELS: Record<number, string> = {
  1: 'Could be better', 2: 'Useful', 3: 'Good', 4: "It's crazzzy",
};

export async function POST(req: Request) {
  let body: { userId?: string; rating?: number; scope?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  const rating = Number(body.rating);
  if (!(rating >= 1 && rating <= 4)) {
    return Response.json({ ok: false, error: 'rating must be 1-4' }, { status: 400 });
  }
  if (dbEnabled()) {
    await q(
      `insert into chat_feedback (user_id, rating, label, scope) values ($1,$2,$3,$4)`,
      [body.userId ?? null, rating, LABELS[rating], body.scope ?? null],
    );
  }
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
