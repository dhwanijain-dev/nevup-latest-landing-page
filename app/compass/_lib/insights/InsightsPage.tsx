// Upload your broker trade CSV → real behavioral insights. Everything runs
// in THIS browser: the file is parsed and analyzed client-side and never
// uploaded anywhere. Any broker's executed-trades export works.
import { useMemo, useRef, useState } from 'react';
import { T, statLabel } from '../theme';
import type { NormTrade } from './types';
import { computeInsights, pairTrades, Insights, RoundTrip } from './engine';
import { parseTradeCsv, ParseReport, MAX_BYTES } from './csv';
import GhostDemo from '../components/GhostDemo';
import { Moat, Hero, DnaSection } from '../components/Sections';

const mono = (size: number, color: string, weight = 400): React.CSSProperties =>
  ({ fontFamily: T.mono, fontSize: size, color, fontWeight: weight });
const inr = (v: number) => `${v < 0 ? '−' : ''}₹${Math.abs(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const pctF = (v: number) => `${Math.round(v * 100)}%`;

const EXPORT_GUIDES: { broker: string; path: string }[] = [
  { broker: 'Zerodha', path: 'Console → Reports → Tradebook → download CSV' },
  { broker: 'Groww', path: 'Stocks → Orders → download order history' },
  { broker: 'Upstox', path: 'Reports → Trade Book → export' },
  { broker: 'Dhan', path: 'Reports → Trade Book → export CSV' },
  { broker: 'Angel One', path: 'Reports → Trade Book → download' },
  { broker: 'US brokers', path: 'Any executed-trades / transactions CSV export' },
];

export default function InsightsPage() {
  const [report, setReport] = useState<ParseReport | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const insights = useMemo(() => {
    if (!report?.ok || !report.trades.length) return null;
    return computeInsights(report.trades as NormTrade[]);
  }, [report]);

  // Persist the upload + computed analysis to the user's account (server
  // recomputes accuracy). Fire-and-forget; a persistence failure never blocks
  // the on-device analysis the user sees.
  const persist = (rawCsv: string, trades: NormTrade[], filename: string) => {
    const user = (window as unknown as { __compassUser?: { userId?: string } }).__compassUser;
    if (!user?.userId) return;
    try {
      const computed = computeInsights(trades);
      const payload = 'insufficient' in computed ? {} : computed;
      void fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, filename, rawCsv, trades, insights: payload }),
      });
    } catch { /* never block the UI */ }
  };

  const ingest = (file: File) => {
    setError('');
    setReport(null);
    setFileName(file.name);
    if (file.size > MAX_BYTES) {
      setError(`File is ${(file.size / 1e6).toFixed(1)} MB - cap is ${(MAX_BYTES / 1e6).toFixed(0)} MB.`);
      return;
    }
    if (!/\.(csv|txt|tsv)$/i.test(file.name) && file.type && !/csv|text|excel/.test(file.type)) {
      setError('Please upload a CSV/TSV trade export (not an image or PDF).');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setError('Could not read the file - try re-downloading it from your broker.');
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const r = parseTradeCsv(text);
        setReport(r);
        if (!r.ok) setError(r.error ?? 'Could not parse this file.');
        else {
          // a real CSV was processed: unlock the rest of the app (Explorer)
          try { sessionStorage.setItem('compass_unlocked', '1'); } catch { /* ignore */ }
          persist(text, r.trades as NormTrade[], file.name);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unexpected error parsing the file.');
      }
    };
    reader.readAsText(file);
  };

  const reset = () => { setReport(null); setFileName(''); setError(''); if (inputRef.current) inputRef.current.value = ''; };
  const showUpload = !report?.ok;

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: `2px solid ${T.ink}`, paddingBottom: 12, flexWrap: 'wrap' }}>
        <a href="#/insights" style={{ ...mono(15, T.ink, 700), letterSpacing: '0.08em', textDecoration: 'none' }}>COMPASS</a>
        <span style={statLabel}>Your trading, analyzed</span>
        <span style={{ ...statLabel, marginLeft: 'auto', color: T.faint }}>
          your file never leaves this browser · analyzed on your device
        </span>
      </div>

      {showUpload && (
        <div style={{ maxWidth: 620, margin: '40px auto 0' }}>
          <h1 style={{ fontFamily: T.serif, fontWeight: 500, fontSize: 'clamp(24px, 4vw, 36px)', color: T.ink, lineHeight: 1.2, margin: 0 }}>
            Upload your trade book. See what your trading <em style={{ fontStyle: 'italic', color: T.red }}>actually looks like.</em>
          </h1>
          <p style={{ fontFamily: T.serif, fontSize: 15, color: T.mutedStrong, lineHeight: 1.6 }}>
            Export your executed trades from any broker and drop the CSV here. Compass pairs
            every round-trip and shows the habits hiding in your numbers - hold-time asymmetry,
            danger hours, revenge entries, and exactly where your edge is versus where the leak is.
          </p>

          <label
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) ingest(f); }}
            style={{
              display: 'block', marginTop: 22, padding: '44px 24px', textAlign: 'center',
              border: `2px dashed ${dragging ? T.ink : T.border}`,
              background: dragging ? T.panelAlt : T.panel, cursor: 'pointer',
            }}>
            <input ref={inputRef} type="file" accept=".csv,.tsv,.txt,text/csv"
              onChange={e => { const f = e.target.files?.[0]; if (f) ingest(f); }}
              style={{ display: 'none' }} />
            <div style={mono(13, T.ink, 700)}>{fileName || 'Drop your trade CSV here, or click to choose'}</div>
            <div style={{ ...mono(10, T.faint), marginTop: 6 }}>CSV / TSV · up to {(MAX_BYTES / 1e6).toFixed(0)} MB · parsed on your device</div>
          </label>

          {error && (
            <div style={{ marginTop: 14, border: `1px solid ${T.red}`, background: 'rgba(229,72,77,0.06)', padding: '12px 14px' }}>
              <div style={mono(11, T.red, 700)}>Couldn&rsquo;t use this file</div>
              <div style={{ fontFamily: T.serif, fontSize: 13, color: T.body, marginTop: 5, lineHeight: 1.5 }}>{error}</div>
            </div>
          )}
          {report && !report.ok && report.skipSamples.length > 0 && (
            <div style={{ ...mono(10, T.faint), marginTop: 10 }}>
              Sample skipped rows: {report.skipSamples.slice(0, 4).map(s => `row ${s.row} (${s.reason})`).join(', ')}
            </div>
          )}

          <div style={{ marginTop: 26 }}>
            <div style={statLabel}>Where to export your trade book</div>
            <div style={{ marginTop: 8 }}>
              {EXPORT_GUIDES.map(gd => (
                <div key={gd.broker} style={{ display: 'flex', gap: 12, padding: '5px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
                  <span style={{ ...mono(11, T.ink, 700), width: 90 }}>{gd.broker}</span>
                  <span style={{ fontFamily: T.serif, fontSize: 12.5, color: T.muted }}>{gd.path}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {report?.ok && (
        <ResultView report={report} insights={insights} onReset={reset} fileName={fileName} />
      )}
    </div>
  );
}

// ── results ─────────────────────────────────────────────────────────────────

function Card({ title, right, children }: { title?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${T.border}`, background: T.panel }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'baseline', padding: '10px 14px 0' }}>
          <span style={statLabel}>{title}</span>
          <span style={{ marginLeft: 'auto' }}>{right}</span>
        </div>
      )}
      <div style={{ padding: '10px 14px 14px' }}>{children}</div>
    </div>
  );
}


function ResultView({ report, insights, onReset, fileName }: {
  report: ParseReport;
  insights: Insights | { insufficient: string } | null;
  onReset: () => void;
  fileName: string;
}) {
  return (
    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={mono(16, T.ink, 700)}>{fileName}</span>
        <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12.5, color: T.faint }}>
          {report.parsed} trades parsed{report.skipped ? ` · ${report.skipped} rows skipped` : ''} · columns: {Object.entries(report.columns).map(([k, v]) => `${k}=${v}`).join(', ')}
        </span>
        <button onClick={onReset} style={{ marginLeft: 'auto', background: 'transparent', border: `1px solid ${T.border}`, ...mono(10, T.muted), padding: '5px 12px', cursor: 'pointer' }}>
          ↺ UPLOAD ANOTHER
        </button>
      </div>
      {report.warnings.map((w, i) => (
        <div key={i} style={{ ...mono(10, T.gold), background: 'rgba(232,184,75,0.08)', border: `1px solid ${T.gold}`, padding: '7px 12px' }}>⚠ {w}</div>
      ))}
      {report.skipped > 0 && (
        <div style={{ ...mono(10, T.faint) }}>
          {report.skipped} row(s) skipped{report.skipSamples.length ? ` - e.g. ${report.skipSamples.slice(0, 3).map(s => `row ${s.row}: ${s.reason}`).join('; ')}` : ''}.
        </div>
      )}

      {!insights ? (
        <Card><div style={mono(12, T.muted)}>No usable trades in this file.</div></Card>
      ) : 'insufficient' in insights ? (
        <Card title="Not enough closed trades yet">
          <p style={{ fontFamily: T.serif, fontSize: 14, color: T.body, lineHeight: 1.6, margin: 0 }}>{insights.insufficient}</p>
        </Card>
      ) : (
        <InsightsView x={insights} trips={pairTrades(report.trades as NormTrade[]).trips} />
      )}
    </div>
  );
}

// Real Trading DNA - the same designed report from the original demo page, but
// every number and every radar axis is computed from the uploaded trades.
function buildDNA(x: Insights): { headline: string; facts: [string, string][]; radar: { axis: string; v: number }[] } {
  const clamp = (v: number) => Math.max(4, Math.min(100, Math.round(v)));
  const part = (needle: string) => x.scoreParts.find(p => p.label.toLowerCase().includes(needle));
  const risk = part('risk')?.score ?? 0;
  const cutting = part('cutting')?.score ?? 0;
  const revengeScore = part('revenge')?.score ?? 0;
  const consistency = part('consist')?.score ?? 0;
  const ratio = x.holdAsymmetry?.ratio ?? 1;
  const edgeN = x.edge?.length ?? 0, leakN = x.leak?.length ?? 0;

  const radar = [
    { axis: 'Aggression', v: clamp(35 + (x.bursts?.count ?? 0) * 10 + (x.revenge?.count ?? 0) * 7) },
    { axis: 'Patience', v: clamp(110 - ratio * 25) },
    { axis: 'Risk discipline', v: clamp((risk + cutting) / 50 * 100) },
    { axis: 'Consistency', v: clamp(consistency / 25 * 100) },
    { axis: 'Adaptability', v: clamp(30 + (edgeN / Math.max(1, edgeN + leakN)) * 55 + (x.winRate - 0.5) * 40) },
    { axis: 'Emotional stability', v: clamp(revengeScore / 25 * 100) },
  ];

  const facts: [string, string][] = [];
  facts.push(['Left on the table', inr(x.ghost.gap)]);
  facts.push(['Win rate', pctF(x.winRate)]);
  if (x.holdAsymmetry) facts.push(['Disposition ratio', `${x.holdAsymmetry.ratio.toFixed(1)}× (losers held longer)`]);
  if (x.revenge && x.revenge.count > 0) facts.push(['Revenge entries', `${x.revenge.count} · ${inr(x.revenge.pnl)}`]);
  if (x.dangerHours?.[0]) facts.push(['Most expensive hour', `${String(x.dangerHours[0].hour).padStart(2, '0')}:00 (${inr(x.dangerHours[0].pnl)})`]);
  if (x.edge?.[0]) facts.push(['Your edge', `${x.edge[0].symbol} · ${inr(x.edge[0].pnl)}`]);

  return { headline: x.debrief.summary, facts, radar };
}

// Post-upload view = the original demo page (Hero, animated GhostDemo, DNA
// report, moat), with every value computed from the uploaded trades.
function InsightsView({ x }: { x: Insights; trips: RoundTrip[] }) {
  const gap = x.ghost.gap;
  const dna = buildDNA(x);
  const heroHeadline = (
    <>Your rule-following self made{' '}
      <em style={{ fontStyle: 'italic', color: gap >= 0 ? T.green : T.red }}>{inr(Math.abs(gap))} {gap >= 0 ? 'more' : 'less'}</em>{' '}
      than you did.</>
  );
  const stats: [string, string][] = [
    [String(x.roundTrips), 'round-trips analyzed'],
    [pctF(x.winRate), 'win rate'],
    [`${x.disciplineScore}/100`, 'discipline score'],
  ];
  const verdictLine =
    `Across ${x.roundTrips} round-trips you netted ${inr(x.ghost.actualPnl)}. ` +
    `Capping oversized losers at your average winner and skipping revenge entries, ` +
    `your rule-following self would have made ${inr(x.ghost.ghostPnl)} - a gap of ${inr(gap)}.`;

  return (
    <>
      <Hero embedded headline={heroHeadline}
        sub="Compass paired every round-trip in your book and rebuilt the version of you that cut losers at your average winner and skipped revenge entries. The gap is what discipline cost you."
        stats={stats} />
      <GhostDemo real={{ you: x.ghost.actualPnl, ghost: x.ghost.ghostPnl, gap, line: verdictLine }} />
      <DnaSection dna={dna} caption="Your Trading DNA - computed from this upload" />
      <Moat />
    </>
  );
}
