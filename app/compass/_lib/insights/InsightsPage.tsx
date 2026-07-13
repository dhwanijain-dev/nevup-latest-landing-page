// Upload your broker trade CSV → real behavioral insights. Everything runs
// in THIS browser: the file is parsed and analyzed client-side and never
// uploaded anywhere. Any broker's executed-trades export works.
import { useEffect, useMemo, useRef, useState } from 'react';
import { T, statLabel } from '../theme';
import type { NormTrade } from './types';
import { computeInsights, pairTrades, Insights, RoundTrip } from './engine';
import { parseTradeCsv, ParseReport, MAX_BYTES } from './csv';
import GhostRace from '../components/GhostRace';
import { Hero, DnaSection } from '../components/Sections';
import { usePublishChat } from '../chatContext';

const mono = (size: number, color: string, weight = 400): React.CSSProperties =>
  ({ fontFamily: T.mono, fontSize: size, color, fontWeight: weight });
// currency symbol is set per-upload from the detected market; default ₹ until known
let CUR = '₹';
const setCur = (s: string) => { CUR = s || '₹'; };
const locale = () => (CUR === '₹' ? 'en-IN' : 'en-US');
const inr = (v: number) => `${v < 0 ? '−' : ''}${CUR}${Math.abs(v).toLocaleString(locale(), { maximumFractionDigits: 0 })}`;
const pctF = (v: number) => `${Math.round(v * 100)}%`;

// Trader's first name for personalization: prefer the Google profile name,
// else derive from the email local-part. Empty string if we truly have nothing.
// Unique tradeable symbols from the parsed trades (add .NS for Indian) - used
// to auto-populate the Explorer workspace with the trader's own instruments.
function storeTradedSymbols(r: ParseReport): void {
  try {
    const suffix = r.marketHint === 'INR' ? '.NS' : '';
    const syms = Array.from(new Set(
      (r.trades as NormTrade[]).map(t => {
        const base = (t.symbol || '').toUpperCase();
        return base.includes('.') ? base : (base ? base + suffix : '');
      }).filter(Boolean),
    )).slice(0, 20);
    localStorage.setItem('compass_symbols', JSON.stringify(syms));
  } catch { /* ignore */ }
}

function traderFirstName(): string {
  try {
    const saved = (localStorage.getItem('compass_display_name') ?? '').trim().split(/\s+/)[0];
    if (saved) return saved;
    const u = (window as unknown as { __compassUser?: { name?: string; email?: string } }).__compassUser;
    const fromName = (u?.name ?? '').trim().split(/\s+/)[0];
    if (fromName) return fromName;
    const local = (u?.email ?? '').split('@')[0];
    const token = local.split(/[.\-_0-9]+/).filter(Boolean)[0] ?? '';
    return token ? token.charAt(0).toUpperCase() + token.slice(1) : '';
  } catch { return ''; }
}

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

  // Rehydrate on load: if a CSV was uploaded earlier this session, re-parse the
  // stored raw file so a page reload keeps the analysis instead of resetting.
  useEffect(() => {
    if (report) return;
    try {
      const raw = localStorage.getItem('compass_csv');
      const name = localStorage.getItem('compass_csv_name') ?? 'your upload';
      if (raw) {
        const r = parseTradeCsv(raw);
        if (r.ok) { setReport(r); setFileName(name); storeTradedSymbols(r); }
      }
    } catch { /* ignore */ }
  }, [report]);

  const insights = useMemo(() => {
    if (!report?.ok || !report.trades.length) return null;
    const r = computeInsights(report.trades as NormTrade[], report.marketHint);
    if (!('insufficient' in r)) setCur(r.profile.currencySymbol);
    return r;
  }, [report]);

  // Persist the upload + computed analysis to the user's account (server
  // recomputes accuracy). Fire-and-forget; a persistence failure never blocks
  // the on-device analysis the user sees.
  const persist = (rawCsv: string, trades: NormTrade[], filename: string, marketHint?: string) => {
    const user = (window as unknown as { __compassUser?: { userId?: string } }).__compassUser;
    if (!user?.userId) return;
    try {
      const computed = computeInsights(trades, marketHint);
      const payload = 'insufficient' in computed ? {} : computed;
      void fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, filename, rawCsv, trades, insights: payload, marketHint }),
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
          try {
            localStorage.setItem('compass_unlocked', '1');
            // stash the parsed trades so the Explorer chat can personalize per
            // symbol (skip if unusually large to stay within storage limits)
            const packed = JSON.stringify(r.trades);
            if (packed.length < 3_000_000) localStorage.setItem('compass_trades', packed);
            // auto-open the instruments the trader actually traded in Explorer
            storeTradedSymbols(r);
            // stash the raw file so a reload keeps the analysis (persistence)
            if (text.length < 6_000_000) {
              localStorage.setItem('compass_csv', text);
              localStorage.setItem('compass_csv_name', file.name);
            }
          } catch { /* ignore */ }
          persist(text, r.trades as NormTrade[], file.name, r.marketHint);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unexpected error parsing the file.');
      }
    };
    reader.readAsText(file);
  };

  const reset = () => {
    setReport(null); setFileName(''); setError('');
    if (inputRef.current) inputRef.current.value = '';
    try {
      ['compass_csv', 'compass_csv_name', 'compass_trades', 'compass_unlocked', 'compass_symbols'].forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
  };

  // the left-nav "Upload another" fires this window event
  useEffect(() => {
    const on = () => reset();
    window.addEventListener('compass:reset', on);
    return () => window.removeEventListener('compass:reset', on);
  }, []);

  // re-render when the trader changes their display name (from the sidebar)
  const [, setNameTick] = useState(0);
  useEffect(() => {
    const on = () => setNameTick(t => t + 1);
    window.addEventListener('compass:namechange', on);
    return () => window.removeEventListener('compass:namechange', on);
  }, []);
  const showUpload = !report?.ok;

  if (showUpload) {
    return (
      <UploadScreen
        onChoose={() => inputRef.current?.click()}
        dragging={dragging} setDragging={setDragging}
        onDrop={f => ingest(f)} inputRef={inputRef} onInput={ingest} error={error}
      />
    );
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 20px 80px' }}>
      <ResultView report={report!} insights={insights} />
    </div>
  );
}

// ── upload screen (matches the marketing mockup) ─────────────────────────────
const ORANGE = '#f15a24';
const ORANGE_SOFT = '#fff5ef';

const FEATURES: [React.ReactNode, string, string][] = [
  ['🛡', 'Parsed locally', 'on your device'],
  ['🔒', 'Never leaves', 'your browser'],
  ['🗄', 'No API access', 'or logins'],
  ['⚡', 'Takes ~10', 'seconds'],
];

const UNLOCK: { title: string; body: React.ReactNode; tag?: string }[] = [
  { title: 'Execution Score', tag: 'Good', body: <><b style={{ fontSize: 30, color: T.ink }}>72</b><span style={{ ...mono(11, T.faint) }}>/100</span><div style={{ ...mono(10, T.muted), marginTop: 8 }}>Your overall execution discipline score.</div></> },
  { title: 'Disciplined You', body: <><div style={{ ...mono(10, T.muted) }}>You left</div><div style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 700, color: ORANGE }}>₹1.4L</div><div style={{ ...mono(10, T.muted) }}>on the table.</div></> },
  { title: 'Biggest Money Leak', body: <><div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: ORANGE }}>2-3 PM</div><div style={{ ...mono(10, T.muted), marginTop: 4 }}>is your worst hour. 42% of losses happen here.</div></> },
  { title: 'Trader Profile', body: <><div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: ORANGE }}>Swing Trader</div><div style={{ ...mono(10, T.muted), marginTop: 4 }}>89% confidence</div></> },
  { title: 'Your Costliest Mistake', body: <><div style={{ ...mono(11, T.ink, 700) }}>BANKNIFTY</div><div style={{ ...mono(10, T.muted), marginTop: 4 }}>Cost you</div><div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: ORANGE }}>₹23,600</div><div style={{ ...mono(10, T.muted) }}>vs disciplined exit</div></> },
];

const BROKERS: { name: string; path: string; color: string }[] = [
  { name: 'Zerodha', path: 'Console → Reports → Tradebook → CSV', color: '#387ed1' },
  { name: 'Groww', path: 'Stocks → Orders → Download Order History', color: '#00b386' },
  { name: 'Upstox', path: 'Reports → Trade Book → Export', color: '#6f42c1' },
  { name: 'Dhan', path: 'Reports → Trade Book → CSV', color: '#1a9e6c' },
  { name: 'Angel One', path: 'Reports → Trade Book → Download', color: '#e23744' },
  { name: 'US Brokers', path: 'Any executed trades / transactions CSV export', color: '#5b6472' },
];

function UploadScreen({ onChoose, dragging, setDragging, onDrop, inputRef, onInput, error }: {
  onChoose: () => void;
  dragging: boolean; setDragging: (v: boolean) => void;
  onDrop: (f: File) => void; inputRef: React.RefObject<HTMLInputElement | null>;
  onInput: (f: File) => void; error: string;
}) {
  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '22px 28px 40px' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${T.borderSoft}`, paddingBottom: 16, flexWrap: 'wrap' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nevup-emblem.png" alt="NevUp" style={{ height: 22 }} />
        <span style={{ ...mono(15, T.ink, 700), letterSpacing: '0.06em' }}>COMPASS</span>
        <span style={{ ...statLabel }}>Your trading, analyzed</span>
        <span style={{ marginLeft: 'auto', ...mono(11, T.muted) }}>
          <span style={{ color: ORANGE }}>🛡</span> Your file never leaves this browser · Analyzed on your device
        </span>
      </div>

      {/* hero + upload card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 40, marginTop: 34 }}>
        <div>
          <h1 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 'clamp(30px, 4.2vw, 52px)', color: T.ink, lineHeight: 1.12, margin: 0 }}>
            Upload your trade book. See what your trading <em style={{ fontStyle: 'italic', color: ORANGE }}>actually looks like.</em>
          </h1>
          <div style={{ display: 'flex', gap: 26, marginTop: 30, flexWrap: 'wrap' }}>
            {FEATURES.map(([icon, a, b]) => (
              <div key={a} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 15, color: ORANGE }}>{icon}</span>
                <div>
                  <div style={{ ...mono(11.5, T.ink, 700) }}>{a}</div>
                  <div style={{ ...mono(10, T.muted) }}>{b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <label
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) onDrop(f); }}
          style={{
            display: 'block', textAlign: 'center', cursor: 'pointer',
            border: `2px dashed ${dragging ? ORANGE : '#f3c9b3'}`, borderRadius: 18,
            background: ORANGE_SOFT, padding: '34px 30px',
          }}>
          <input ref={inputRef} type="file" accept=".csv,.tsv,.txt,text/csv"
            onChange={e => { const f = e.target.files?.[0]; if (f) onInput(f); }} style={{ display: 'none' }} />
          <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#fde6da', margin: '0 auto', display: 'grid', placeItems: 'center', fontSize: 24, color: ORANGE }}>⬆</div>
          <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.ink, marginTop: 14 }}>Upload your trade book</div>
          <div style={{ ...mono(11, T.muted), marginTop: 6 }}>CSV / TSV · up to {(MAX_BYTES / 1e6).toFixed(0)} MB</div>
          <button type="button" onClick={e => { e.preventDefault(); onChoose(); }} style={{
            marginTop: 18, background: ORANGE, color: '#fff', border: 'none', borderRadius: 10,
            padding: '13px 28px', ...mono(14, '#fff', 700), cursor: 'pointer',
          }}>⬇ Choose CSV file</button>
          <div style={{ ...mono(11, T.muted), margin: '16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, height: 1, background: '#f0d8c9' }} />or drag and drop your file here<span style={{ flex: 1, height: 1, background: '#f0d8c9' }} />
          </div>
          <div style={{ background: '#fff', border: `1px solid #f3ddd0`, borderRadius: 30, padding: '10px 14px', ...mono(11, T.mutedStrong) }}>
            <span style={{ color: ORANGE }}>🛡</span> We support all major brokers and any CSV export
          </div>
          {error && (
            <div style={{ marginTop: 14, ...mono(11, T.red, 700) }}>{error}</div>
          )}
        </label>
      </div>

      {/* what you'll unlock */}
      <div style={{ marginTop: 44 }}>
        <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: T.ink }}>What you&rsquo;ll unlock</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: 16, marginTop: 14 }}>
          {UNLOCK.map(c => (
            <div key={c.title} style={{ border: `1px solid ${T.borderSoft}`, borderRadius: 12, background: '#fff', padding: '16px 16px 40px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...mono(11, T.ink, 700) }}>{c.title}</span>
                {c.tag && <span style={{ marginLeft: 'auto', ...mono(9, '#1f9d6b'), background: '#e8f6ef', borderRadius: 4, padding: '2px 6px' }}>{c.tag} ●</span>}
              </div>
              <div style={{ marginTop: 12 }}>{c.body}</div>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, textAlign: 'center', ...mono(10, ORANGE, 700) }}>🔒 Upload to reveal</div>
            </div>
          ))}
        </div>
      </div>

      {/* supported brokers */}
      <div style={{ marginTop: 40 }}>
        <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: T.ink }}>Supported brokers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14, marginTop: 14 }}>
          {BROKERS.map(b => (
            <div key={b.name} style={{ border: `1px solid ${T.borderSoft}`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: 5, background: b.color, color: '#fff', display: 'grid', placeItems: 'center', ...mono(11, '#fff', 700) }}>{b.name[0]}</span>
                <span style={{ ...mono(12.5, T.ink, 700) }}>{b.name}</span>
              </div>
              <div style={{ ...mono(10, T.muted), marginTop: 8, lineHeight: 1.5 }}>{b.path}</div>
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ textAlign: 'center', marginTop: 40, ...mono(11, T.muted) }}>
        <span style={{ color: ORANGE }}>🛡</span> Your privacy is our priority. Your data is <span style={{ color: ORANGE, fontWeight: 700 }}>never stored, shared, or uploaded.</span>
      </div>
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


function ResultView({ report, insights }: {
  report: ParseReport;
  insights: Insights | { insufficient: string } | null;
}) {
  const valid = insights && !('insufficient' in insights);
  return (
    <div>
      {/* warnings only when present - the hero is the visual starting point */}
      {report.warnings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
          {report.warnings.map((w, i) => (
            <div key={i} style={{ ...mono(10, T.gold), background: 'rgba(232,184,75,0.08)', border: `1px solid ${T.gold}`, padding: '7px 12px' }}>⚠ {w}</div>
          ))}
        </div>
      )}

      {/* analysis - block flow so every section aligns to the same width */}
      {!insights ? (
        <div style={{ marginTop: 14 }}><Card><div style={mono(12, T.muted)}>No usable trades in this file.</div></Card></div>
      ) : !valid ? (
        <div style={{ marginTop: 14 }}><Card title="Not enough closed trades yet">
          <p style={{ fontFamily: T.serif, fontSize: 14, color: T.body, lineHeight: 1.6, margin: 0 }}>{(insights as { insufficient: string }).insufficient}</p>
        </Card></div>
      ) : (
        <InsightsView x={insights as Insights} trips={pairTrades(report.trades as NormTrade[]).trips} />
      )}
    </div>
  );
}

// Real Trading DNA - the same designed report from the original demo page, but
// every number and every radar axis is computed from the uploaded trades.
function buildDNA(x: Insights): { headline: string; facts: [string, string][]; radar: { axis: string; v: number }[] } {
  // Every radar axis is a direct percentage computed from the real trades - no
  // proxy scores, no invented constants. Each is a genuine ratio of real values.
  const pctClamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const radar: { axis: string; v: number }[] = [];

  // 1. Win rate: winning round-trips / all round-trips
  radar.push({ axis: 'Win rate', v: pctClamp(x.winRate * 100) });

  // 2. Reward:risk: average winner as a share of (avg winner + avg loser)
  const rr = x.avgWin + x.avgLoss;
  radar.push({ axis: 'Reward:risk', v: pctClamp(rr > 0 ? (x.avgWin / rr) * 100 : 0) });

  // 3. Loss control: share of losing trades that were NOT oversized
  //    (oversized = a loss larger than the average winner; engine-counted)
  const oversized = x.ghost.cappedLosers.count;
  radar.push({ axis: 'Loss control', v: pctClamp(x.losses > 0 ? ((x.losses - oversized) / x.losses) * 100 : 100) });

  // 4. Revenge-free: share of round-trips that were not revenge entries
  const rev = x.revenge?.count ?? 0;
  radar.push({ axis: 'Revenge-free', v: pctClamp(x.roundTrips > 0 ? ((x.roundTrips - rev) / x.roundTrips) * 100 : 100) });

  // 5. Winner holding (anti-disposition): time spent in winners vs total hold
  if (x.holdAsymmetry) {
    const w = x.holdAsymmetry.avgWinHoldMin, l = x.holdAsymmetry.avgLossHoldMin;
    radar.push({ axis: 'Winner holding', v: pctClamp(w + l > 0 ? (w / (w + l)) * 100 : 50) });
  }

  // 6. Edge focus: profit from edge symbols as a share of gross moved P&L
  const denom = x.edgePnl + Math.abs(x.leakPnl);
  radar.push({ axis: 'Edge focus', v: pctClamp(denom > 0 ? (x.edgePnl / denom) * 100 : 0) });

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
function InsightsView({ x, trips }: { x: Insights; trips: RoundTrip[] }) {
  const gap = x.ghost.gap;
  const dna = buildDNA(x);

  // publish this analysis to the shared analyst chat (Insights context)
  const firstName = traderFirstName();
  usePublishChat({
    scope: `insights:${x.roundTrips}:${Math.round(x.totalPnl)}`,
    title: 'NevUp AI',
    subtitle: 'Ask about your trading behaviour, psychology, and process execution. NevUp has analyzed everything for you.',
    greeting: firstName
      ? `Hey ${firstName}, I have been through all ${x.roundTrips} of your round-trips. What do you want to look at first?`
      : `I have been through all ${x.roundTrips} of your round-trips. What do you want to look at first?`,
    chips: ['Where do I leak money?', 'What are my worst hours?', 'How disciplined am I?', 'What should I fix first?'],
    facts: {
      profile: x.profile,
      roundTrips: x.roundTrips, winRate: x.winRate, totalPnl: x.totalPnl,
      avgWin: x.avgWin, avgLoss: x.avgLoss, profitFactor: x.profitFactor,
      disciplineScore: x.disciplineScore, scoreParts: x.scoreParts,
      holdAsymmetry: x.holdAsymmetry, revenge: x.revenge, dangerHours: x.dangerHours, bestHours: x.bestHours,
      edge: x.edge, leak: x.leak, byWeekday: x.byWeekday,
      ghost: x.ghost, compounding: x.compounding, debrief: x.debrief,
      currency: x.profile.currency,
    },
  });
  const heroHeadline = (
    <>{firstName ? <>Hey {firstName}, your</> : 'Your'} rule-following self made{' '}
      <em style={{ fontStyle: 'italic', color: gap >= 0 ? T.green : T.red }}>{inr(Math.abs(gap))} {gap >= 0 ? 'more' : 'less'}</em>{' '}
      than you did.</>
  );
  const stats: [string, string][] = [
    [String(x.roundTrips), 'round-trips analyzed'],
    [pctF(x.winRate), 'win rate'],
    [`${x.disciplineScore}/100`, 'discipline score'],
  ];
  const p = x.profile;
  const chips = [
    p.style,
    `${p.market}`,
    p.instrument,
    p.currency,
  ];
  return (
    <>
      <Hero embedded headline={heroHeadline}
        sub="Compass paired every round-trip in your book and rebuilt the version of you that cut losers at your average winner and skipped revenge entries. The gap is what discipline cost you."
        stats={stats} />
      {/* trader profile - classified from the real trades */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '4px 24px 0', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {chips.map((c, i) => (
          <span key={i} style={{
            fontFamily: T.mono, fontSize: 11, letterSpacing: '0.04em',
            color: i === 0 ? '#fff' : T.ink, background: i === 0 ? T.ghost : T.panelAlt,
            border: `1px solid ${i === 0 ? T.ghost : T.border}`, borderRadius: 3, padding: '4px 10px',
          }}>{c}</span>
        ))}
        <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.faint }}>{p.styleReason}</span>
      </div>
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '30px 24px 0' }}>
        <GhostRace trips={trips} x={x} />
      </section>
      <DnaSection dna={dna} caption="Your Trading DNA - computed from this upload" />
      <Compounding x={x} />
    </>
  );
}

// Real compounding: the observed discipline gap extrapolated at its own
// run-rate (straight-line, honestly labeled - not a forecast). Null when the
// window is too short or there is no gap to project.
function Compounding({ x }: { x: Insights }) {
  const c = x.compounding;
  if (!c) return null;
  const rows: [string, number][] = [
    [`This window · ${c.windowDays} days`, x.ghost.gap],
    ['Projected · 1 month', c.perMonth],
    ['Projected · 1 quarter', c.perQuarter],
    ['Projected · 1 year', c.perYear],
  ];
  return (
    <section style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      <div style={statLabel}>Why it compounds - your discipline gap at this run-rate</div>
      <div style={{ border: `1px solid ${T.border}`, marginTop: 14 }}>
        {rows.map(([label, v], i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 18, padding: '14px 20px',
            borderBottom: i < rows.length - 1 ? `1px solid ${T.borderSoft}` : 'none',
            background: i === rows.length - 1 ? T.panelAlt : 'transparent',
          }}>
            <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: i === rows.length - 1 ? T.ghost : T.ink }}>{label}</span>
            <span style={{ marginLeft: 'auto', fontFamily: T.num, fontSize: 18, fontWeight: 700, color: T.red, whiteSpace: 'nowrap' }}>{inr(-Math.abs(v))}</span>
          </div>
        ))}
      </div>
      <div style={{ ...mono(10, T.faint), marginTop: 10 }}>
        Straight-line extrapolation of your own {c.windowDays}-day gap - a run-rate, not a forecast.
      </div>
    </section>
  );
}
