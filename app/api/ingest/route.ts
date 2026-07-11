// Ingest a user's uploaded trade book: persist the raw CSV, the parsed trades,
// the computed insights snapshot, and a freshly computed accuracy report. The
// insights arrive already computed on the client; the accuracy report (the
// behavioral/debrief/ghost validity) is recomputed here on the server from the
// trades so it cannot be spoofed by the client. Nothing here touches
// credentials. Everything lands in the admin dashboard.
import { q, dbEnabled } from '../_lib/db';
import { accuracyReport } from '../../compass/_lib/insights/accuracy';
import type { NormTrade } from '../../compass/_lib/insights/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_TRADES = 5000;
const MAX_CSV = 8 * 1024 * 1024;

interface IngestBody {
  userId?: string;
  filename?: string;
  rawCsv?: string;
  trades?: NormTrade[];
  insights?: Record<string, unknown>;
}

export async function POST(req: Request) {
  if (!dbEnabled()) return Response.json({ ok: false, error: 'DB not configured' }, { status: 200 });

  let body: IngestBody = {};
  try { body = await req.json(); } catch { /* empty */ }
  const userId = body.userId;
  if (!userId) return Response.json({ ok: false, error: 'Not signed in' }, { status: 401 });

  const rawCsv = (body.rawCsv ?? '').slice(0, MAX_CSV);
  const trades = (body.trades ?? []).slice(0, MAX_TRADES);
  const insights = body.insights ?? {};
  if (!trades.length) return Response.json({ ok: false, error: 'No trades' }, { status: 400 });

  // 1. upload (full raw CSV)
  const up = await q<{ id: string }>(
    `insert into uploads (user_id, filename, raw_csv, bytes, row_count, parsed_count)
       values ($1,$2,$3,$4,$5,$6) returning id`,
    [userId, body.filename ?? null, rawCsv, Buffer.byteLength(rawCsv), trades.length, trades.length],
  );
  const uploadId = up[0]?.id;
  if (!uploadId) return Response.json({ ok: false, error: 'Upload insert failed' }, { status: 500 });

  // 2. trades (bulk parameterized insert)
  const vals: string[] = [], params: unknown[] = [];
  trades.forEach((t, i) => {
    const b = i * 8;
    vals.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8})`);
    params.push(uploadId, userId, t.symbol, t.side, t.qty, t.price,
      t.hasTime ? t.ts : (t.ts ? t.ts.slice(0, 10) : null), t.hasTime);
  });
  await q(
    `insert into trades (upload_id, user_id, symbol, side, qty, price, ts, has_time) values ${vals.join(',')}`,
    params,
  );

  // 3. insights snapshot
  await q(
    `insert into insights_snapshots (user_id, upload_id, discipline_score, total_pnl, round_trips, payload)
       values ($1,$2,$3,$4,$5,$6)`,
    [userId, uploadId,
     (insights.disciplineScore as number) ?? null,
     (insights.totalPnl as number) ?? null,
     (insights.roundTrips as number) ?? null,
     JSON.stringify(insights)],
  );

  // 4. accuracy report - recomputed server-side from the trades (real, honest)
  const report = accuracyReport(trades, null);
  await q(
    `insert into accuracy_reports
       (user_id, kronos_dir_acc, kronos_mape, behavioral_holds, behavioral_lift,
        debrief_accuracy, ghost_validity, overall, covered, payload)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [userId,
     report.kronos?.directionalAccuracy ?? null,
     report.kronos?.mape ?? null,
     report.behavioral?.holds ?? null,
     report.behavioral?.lift ?? null,
     report.debrief?.accuracy ?? null,
     report.ghost?.validity ?? null,
     report.overall ?? null,
     report.covered,
     JSON.stringify(report)],
  );

  void q(
    `insert into io_log (user_id, route, method, status, req, latency_ms) values ($1,'/api/ingest','POST',200,$2,0)`,
    [userId, JSON.stringify({ filename: body.filename, trades: trades.length })],
  );

  return Response.json({ ok: true, uploadId, accuracy: report },
    { headers: { 'Cache-Control': 'no-store' } });
}
