// Admin dashboard - visible ONLY to the admin Google account
// (ADMIN_EMAIL, default vatsal2077@gmail.com). Shows real, live aggregates
// from Postgres: users, uploads, insights, forecasts, fleet accuracy across
// all four models, chat volume, and I/O logs (including flagged prompt-
// injection attempts). Server-rendered; no data leaves the server unaggregated.
import { auth } from '../../auth';
import { q, dbEnabled } from '../api/_lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Compass Admin', robots: { index: false, follow: false } };

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'vatsal2077@gmail.com').toLowerCase();

const INK = '#14171d', GHOST = '#7a5af5', MUTED = '#5b6472', LINE = '#e6e8ec';
const pct = (v: number | null | undefined) => (v == null ? '-' : `${(v * 100).toFixed(1)}%`);
const num = (v: number | null | undefined, d = 0) => (v == null ? '-' : Number(v).toFixed(d));

async function one<T = Record<string, unknown>>(sql: string, p: unknown[] = []): Promise<T | null> {
  const rows = await q<T & Record<string, unknown>>(sql, p);
  return (rows[0] as T) ?? null;
}

export default async function AdminPage() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();

  if (!email) {
    return <Shell><p style={{ color: MUTED }}>Sign in required. <a href="/compass" style={{ color: GHOST }}>Go to Compass</a>.</p></Shell>;
  }
  if (email !== ADMIN_EMAIL) {
    return <Shell><h1 style={{ fontSize: 26 }}>Not authorized</h1><p style={{ color: MUTED }}>This dashboard is restricted.</p></Shell>;
  }
  if (!dbEnabled()) {
    return <Shell><h1 style={{ fontSize: 26 }}>Database not configured</h1></Shell>;
  }

  // ── aggregates (all real, live) ────────────────────────────────────────────
  const users = await one<{ n: string }>(`select count(*)::int n from users`);
  const verified = await one<{ n: string }>(`select count(*)::int n from users where email_verified`);
  const uploads = await one<{ n: string; bytes: string; rows: string }>(
    `select count(*)::int n, coalesce(sum(bytes),0)::bigint bytes, coalesce(sum(parsed_count),0)::bigint rows from uploads`);
  const insights = await one<{ n: string; avg: number }>(
    `select count(*)::int n, avg(discipline_score)::float avg from insights_snapshots`);
  const forecasts = await one<{ n: string }>(`select count(*)::int n from forecasts`);
  const evals = await one<{ n: string; dir: number; mape: number }>(
    `select count(*)::int n, avg(case when directional_hit then 1 else 0 end)::float dir, avg(mape)::float mape from forecast_evals`);
  const chats = await one<{ n: string }>(`select count(*)::int n from chat_messages`);
  const io = await one<{ n: string; inj: string }>(
    `select count(*)::int n, count(*) filter (where (req->>'flaggedInjection')::boolean)::int inj from io_log`);

  // fleet accuracy from stored per-user reports
  const fleet = await one<{
    users: string; kdir: number; kmape: number; bhold: number; dacc: number; gval: number; overall: number;
  }>(`select count(distinct user_id)::int users,
        avg(kronos_dir_acc)::float kdir, avg(kronos_mape)::float kmape,
        avg(case when behavioral_holds then 1 else 0 end)::float bhold,
        avg(debrief_accuracy)::float dacc, avg(ghost_validity)::float gval,
        avg(overall)::float overall
      from accuracy_reports`);

  const recentUsers = await q<{ email: string; name: string; created_at: string; last_seen_at: string }>(
    `select email, name, created_at, last_seen_at from users order by created_at desc limit 20`);
  const recentUploads = await q<{ email: string; filename: string; parsed_count: number; created_at: string }>(
    `select u.email, up.filename, up.parsed_count, up.created_at
       from uploads up join users u on u.id = up.user_id order by up.created_at desc limit 20`);
  const recentChats = await q<{ email: string; role: string; content: string; created_at: string }>(
    `select coalesce(u.email,'(anon)') email, c.role, c.content, c.created_at
       from chat_messages c left join users u on u.id = c.user_id order by c.created_at desc limit 20`);

  return (
    <Shell>
      <h1 style={{ fontSize: 30, fontWeight: 600, margin: '0 0 4px' }}>Compass Admin</h1>
      <p style={{ color: MUTED, margin: '0 0 28px' }}>Signed in as {email}. Live data from Azure Postgres.</p>

      <Grid>
        <Card label="Users" value={num(Number(users?.n))} sub={`${num(Number(verified?.n))} verified`} />
        <Card label="Uploads" value={num(Number(uploads?.n))} sub={`${num(Number(uploads?.rows))} trades parsed`} />
        <Card label="Insights runs" value={num(Number(insights?.n))} sub={`avg discipline ${num(insights?.avg, 0)}`} />
        <Card label="Forecasts" value={num(Number(forecasts?.n))} sub={`${num(Number(evals?.n))} scored`} />
        <Card label="Chat messages" value={num(Number(chats?.n))} sub={`${num(Number(io?.inj))} injection flags`} />
        <Card label="I/O log rows" value={num(Number(io?.n))} sub="all requests" />
      </Grid>

      <h2 style={h2}>Fleet accuracy (real, averaged across users)</h2>
      <Grid>
        <Card label="Kronos directional" value={pct(fleet?.kdir)} sub={`MAPE ${num(fleet?.kmape, 1)}%`} accent />
        <Card label="Behavioral thesis holds" value={pct(fleet?.bhold)} sub="disciplined earns more" accent />
        <Card label="Debrief accuracy" value={pct(fleet?.dacc)} sub="out-of-sample" accent />
        <Card label="Ghost validity" value={pct(fleet?.gval)} sub="assumptions borne out" accent />
        <Card label="Overall" value={pct(fleet?.overall)} sub={`${num(Number(fleet?.users))} users scored`} accent />
        <Card label="Kronos live evals" value={pct(evals?.dir)} sub={`${num(Number(evals?.n))} forecasts vs actual`} accent />
      </Grid>

      <h2 style={h2}>Recent users</h2>
      <Table cols={['Email', 'Name', 'Joined', 'Last seen']}
             rows={recentUsers.map(u => [u.email, u.name ?? '-', fmt(u.created_at), fmt(u.last_seen_at)])} />

      <h2 style={h2}>Recent uploads</h2>
      <Table cols={['User', 'File', 'Trades', 'When']}
             rows={recentUploads.map(u => [u.email, u.filename ?? '-', String(u.parsed_count ?? '-'), fmt(u.created_at)])} />

      <h2 style={h2}>Recent chat</h2>
      <Table cols={['User', 'Role', 'Message', 'When']}
             rows={recentChats.map(c => [c.email, c.role, (c.content ?? '').slice(0, 90), fmt(c.created_at)])} />
    </Shell>
  );
}

function fmt(s: string) { return s ? new Date(s).toISOString().slice(0, 16).replace('T', ' ') : '-'; }

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 600, margin: '36px 0 14px' };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100vh', background: '#fff', color: INK, padding: '40px 32px',
      fontFamily: 'Newsreader, Georgia, serif', maxWidth: 1100, margin: '0 auto',
    }}>{children}</main>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>{children}</div>;
}
function Card({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: '16px 18px', background: accent ? '#faf9ff' : '#fff' }}>
      <div style={{ fontFamily: '"Spline Sans Mono", monospace', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: MUTED }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: accent ? GHOST : INK, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function Table({ cols, rows }: { cols: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${LINE}`, borderRadius: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: '"Spline Sans Mono", monospace' }}>
        <thead>
          <tr>{cols.map(c => <th key={c} style={{ textAlign: 'left', padding: '10px 14px', borderBottom: `1px solid ${LINE}`, color: MUTED, fontWeight: 500, fontSize: 12 }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={cols.length} style={{ padding: 16, color: MUTED }}>No rows yet.</td></tr>
            : rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: '10px 14px', borderBottom: `1px solid ${LINE}`, whiteSpace: 'nowrap' }}>{c}</td>)}</tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
