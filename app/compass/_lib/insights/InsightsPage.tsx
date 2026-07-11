// Upload your broker trade CSV → real behavioral insights. Everything runs
// in THIS browser: the file is parsed and analyzed client-side and never
// uploaded anywhere. Any broker's executed-trades export works.
import { useMemo, useRef, useState } from 'react';
import { T, statLabel } from '../theme';
import type { NormTrade } from './types';
import { computeInsights, Insights } from './engine';
import { parseTradeCsv, ParseReport, MAX_BYTES } from './csv';

const mono = (size: number, color: string, weight = 400): React.CSSProperties =>
  ({ fontFamily: T.mono, fontSize: size, color, fontWeight: weight });
const g = (v: number) => (v >= 0 ? T.green : T.red);
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

function Metric({ k, v, sub, c }: { k: string; v: string; sub?: string; c?: string }) {
  return (
    <div>
      <div style={statLabel}>{k}</div>
      <div style={{ ...mono(18, c ?? T.ink, 700), marginTop: 3 }}>{v}</div>
      {sub && <div style={{ ...mono(9.5, T.faint), marginTop: 2 }}>{sub}</div>}
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
        <InsightsView x={insights} />
      )}
    </div>
  );
}

function InsightsView({ x }: { x: Insights }) {
  const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00–${String(h + 1).padStart(2, '0')}:00`;
  return (
    <>
      {/* headline */}
      <div style={{ border: `1px solid ${T.ink}`, background: T.panel, padding: '22px 26px' }}>
        <div style={statLabel}>{x.from} → {x.to} · {x.fills} fills · {x.roundTrips} round-trips{x.openLegs ? ` · ${x.openLegs} open legs excluded` : ''}</div>
        <div style={{ fontFamily: T.serif, fontSize: 'clamp(20px, 3vw, 28px)', color: T.ink, lineHeight: 1.35, marginTop: 10 }}>
          {x.leakPnl < 0 && x.edgePnl > 0 ? (
            <>Your edge made <b style={{ color: T.green }}>{inr(x.edgePnl)}</b>. Your leak gave <b style={{ color: T.red }}>{inr(x.leakPnl)}</b> of it back.</>
          ) : x.totalPnl >= 0 ? (
            <>Net <b style={{ color: T.green }}>{inr(x.totalPnl)}</b> over {x.roundTrips} closed trades.</>
          ) : (
            <>Net <b style={{ color: T.red }}>{inr(x.totalPnl)}</b> over {x.roundTrips} closed trades - the sections below show exactly where.</>
          )}
        </div>
      </div>

      {/* debrief + discipline score - the app's process-first read */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,1fr) minmax(220px,.62fr)', gap: 14 }}>
        <Card title="Debrief">
          <div style={{ fontFamily: T.serif, fontSize: 15, color: T.ink, lineHeight: 1.55 }}>{x.debrief.summary}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
            <div>
              <div style={{ ...statLabel, color: T.green }}>What went well</div>
              <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                {x.debrief.wentWell.map((s, i) => <li key={i} style={{ fontFamily: T.serif, fontSize: 12.5, color: T.body, lineHeight: 1.5, marginBottom: 3 }}>{s}</li>)}
              </ul>
            </div>
            <div>
              <div style={{ ...statLabel, color: T.red }}>Where it leaks</div>
              <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                {x.debrief.leaks.map((s, i) => <li key={i} style={{ fontFamily: T.serif, fontSize: 12.5, color: T.body, lineHeight: 1.5, marginBottom: 3 }}>{s}</li>)}
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 12, borderTop: `1px dashed ${T.border}`, paddingTop: 10 }}>
            <span style={{ ...statLabel, color: T.ghost }}>Tomorrow&rsquo;s focus</span>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.ink, marginTop: 4 }}>{x.debrief.focus}</div>
          </div>
        </Card>
        <Card title="Discipline score" right={<span style={mono(9.5, T.faint)}>process, not luck</span>}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ ...mono(46, x.disciplineScore >= 70 ? T.green : x.disciplineScore >= 50 ? T.gold : T.red, 700), lineHeight: 1 }}>{x.disciplineScore}</span>
            <span style={mono(14, T.faint)}>/100</span>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {x.scoreParts.map(p => (
              <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ ...mono(10.5, T.muted), width: 118 }}>{p.label}</span>
                <div style={{ flex: 1, height: 5, background: T.panelAlt }}>
                  <div style={{ width: `${(p.score / p.max) * 100}%`, height: '100%', background: p.score / p.max >= 0.7 ? T.green : p.score / p.max >= 0.5 ? T.gold : T.red }} />
                </div>
                <span style={{ ...mono(10, T.ink), width: 34, textAlign: 'right' }}>{p.score}/{p.max}</span>
              </div>
            ))}
          </div>
          <div style={{ ...mono(9, T.faint), marginTop: 10, lineHeight: 1.5 }}>
            {x.scoreParts.map(p => p.note).join(' · ')}
          </div>
        </Card>
      </div>

      {/* outcome strip */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px 22px' }}>
          <Metric k="Net P&L" v={inr(x.totalPnl)} c={g(x.totalPnl)} />
          <Metric k="Win rate" v={pctF(x.winRate)} sub={`${x.wins}W / ${x.losses}L`} />
          <Metric k="Avg win" v={inr(x.avgWin)} c={T.green} />
          <Metric k="Avg loss" v={inr(-x.avgLoss)} c={T.red} />
          {x.profitFactor != null && <Metric k="Profit factor" v={x.profitFactor.toFixed(2)} c={x.profitFactor >= 1 ? T.green : T.red} />}
          <Metric k="Longest win streak" v={String(x.streaks.maxWinStreak)} />
          <Metric k="Longest loss streak" v={String(x.streaks.maxLossStreak)} c={x.streaks.maxLossStreak >= 4 ? T.red : T.ink} />
        </div>
      </Card>

      {/* behavioral verdicts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {x.holdAsymmetry && (
          <Card title="Hold-time asymmetry - the disposition effect">
            <div style={{ display: 'flex', gap: 26 }}>
              <Metric k="Winners held" v={`${Math.round(x.holdAsymmetry.avgWinHoldMin)}m`} c={T.green} />
              <Metric k="Losers held" v={`${Math.round(x.holdAsymmetry.avgLossHoldMin)}m`} c={T.red} />
              <Metric k="Ratio" v={`${x.holdAsymmetry.ratio.toFixed(1)}×`} c={x.holdAsymmetry.ratio > 1.5 ? T.red : T.green} />
            </div>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13.5, color: T.body, lineHeight: 1.55, marginTop: 12 }}>
              {x.holdAsymmetry.ratio > 1.5
                ? `You hold losers ${x.holdAsymmetry.ratio.toFixed(1)}× longer than winners - the classic disposition effect. Cutting losers at your winners' pace is usually the single cheapest fix in a book like this.`
                : 'You cut losers about as fast as you take winners - no disposition-effect signature in this window.'}
            </div>
          </Card>
        )}
        {x.revenge && (
          <Card title={`Revenge entries - re-entry within ${x.revenge.windowMin}m of a loss, same symbol`}>
            <div style={{ display: 'flex', gap: 26 }}>
              <Metric k="Count" v={String(x.revenge.count)} c={x.revenge.count > 3 ? T.red : T.ink} />
              <Metric k="Their P&L" v={inr(x.revenge.pnl)} c={g(x.revenge.pnl)} />
              <Metric k="Their win rate" v={pctF(x.revenge.winRate)} c={x.revenge.winRate < 0.45 ? T.red : T.ink} />
            </div>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13.5, color: T.body, lineHeight: 1.55, marginTop: 12 }}>
              {x.revenge.pnl < 0
                ? `These are the trades taken while the loss was still hot. They cost ${inr(Math.abs(x.revenge.pnl))} in this window - the desktop engine blocks them live with a cooldown.`
                : 'Your quick re-entries held up in this window - worth watching, not yet a leak.'}
            </div>
          </Card>
        )}
      </div>

      {/* hours + weekdays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {(x.dangerHours?.length || x.bestHours?.length) ? (
          <Card title="Your hours - where the money moves">
            {x.dangerHours?.map(h => (
              <div key={h.hour} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
                <span style={mono(11.5, T.red, 700)}>{hourLabel(h.hour)}</span>
                <span style={mono(11, T.muted)}>{h.trades} trades · {pctF(h.winRate)} win</span>
                <span style={mono(11.5, T.red, 700)}>{inr(h.pnl)}</span>
              </div>
            ))}
            {x.bestHours?.map(h => (
              <div key={h.hour} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
                <span style={mono(11.5, T.green, 700)}>{hourLabel(h.hour)}</span>
                <span style={mono(11, T.muted)}>{h.trades} trades · {pctF(h.winRate)} win</span>
                <span style={mono(11.5, T.green, 700)}>{inr(h.pnl)}</span>
              </div>
            ))}
          </Card>
        ) : null}
        {x.byWeekday && (
          <Card title="By weekday">
            {x.byWeekday.map(d => (
              <div key={d.day} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
                <span style={mono(11.5, T.ink, 700)}>{d.day}</span>
                <span style={mono(11, T.muted)}>{d.trades} trades · {pctF(d.winRate)} win</span>
                <span style={mono(11.5, g(d.pnl), 700)}>{inr(d.pnl)}</span>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* edge vs leak */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card title={`Your edge - ${inr(x.edgePnl)}`}>
          {x.edge.length ? x.edge.slice(0, 6).map(s => (
            <div key={s.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
              <span style={mono(11.5, T.ink, 700)}>{s.symbol}</span>
              <span style={mono(10.5, T.muted)}>{s.trades}t · {pctF(s.winRate)}{s.avgHoldMin != null ? ` · ${Math.round(s.avgHoldMin)}m` : ''}</span>
              <span style={mono(11.5, T.green, 700)}>{inr(s.pnl)}</span>
            </div>
          )) : <div style={mono(11, T.faint)}>No consistently profitable symbols in this window.</div>}
        </Card>
        <Card title={`Your leak - ${inr(x.leakPnl)}`}>
          {x.leak.length ? x.leak.slice(0, 6).map(s => (
            <div key={s.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.borderSoft}` }}>
              <span style={mono(11.5, T.ink, 700)}>{s.symbol}</span>
              <span style={mono(10.5, T.muted)}>{s.trades}t · {pctF(s.winRate)}{s.avgHoldMin != null ? ` · ${Math.round(s.avgHoldMin)}m` : ''}</span>
              <span style={mono(11.5, T.red, 700)}>{inr(s.pnl)}</span>
            </div>
          )) : <div style={mono(11, T.faint)}>No consistent losers - clean book in this window.</div>}
        </Card>
      </div>

      {/* extremes + bursts */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px 22px' }}>
          {x.maxWin && <Metric k="Best trade" v={inr(x.maxWin.pnl)} sub={`${x.maxWin.symbol} · ${x.maxWin.exitTs.slice(0, 10)}`} c={T.green} />}
          {x.maxLoss && <Metric k="Worst trade" v={inr(x.maxLoss.pnl)} sub={`${x.maxLoss.symbol} · ${x.maxLoss.exitTs.slice(0, 10)}`} c={T.red} />}
          {x.bursts && <Metric k="Overtrading bursts" v={String(x.bursts.count)} sub={`${x.bursts.largest} orders inside ${x.bursts.windowMin} min at peak`} c={x.bursts.count > 2 ? T.red : T.ink} />}
        </div>
      </Card>

      {/* ghost trade - the rule-following self, from their own fills */}
      <div style={{ border: `1px solid ${T.ghost}`, background: T.panel }}>
        <div style={{ padding: '10px 14px 0' }}><span style={{ ...statLabel, color: T.ghost }}>Ghost trade - your rule-following self</span></div>
        <div style={{ padding: '10px 14px 14px' }}>
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
            <Metric k="You made" v={inr(x.ghost.actualPnl)} c={g(x.ghost.actualPnl)} />
            <Metric k="The ghost made" v={inr(x.ghost.ghostPnl)} c={T.ghost} />
            <Metric k="Left on the table" v={inr(-Math.abs(x.ghost.gap))} c={x.ghost.gap > 0 ? T.red : T.muted} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
            {x.ghost.cappedLosers.count > 0 && (
              <div style={{ border: `1px solid ${T.borderSoft}`, padding: '10px 12px' }}>
                <div style={mono(11, T.ink, 700)}>Cutting losers to 1:1 risk</div>
                <div style={{ ...mono(10.5, T.muted), marginTop: 3 }}>
                  {x.ghost.cappedLosers.count} oversized loss{x.ghost.cappedLosers.count > 1 ? 'es' : ''} capped at your avg-winner size →
                  <b style={{ color: T.green }}> {inr(x.ghost.cappedLosers.recovered)}</b> recovered
                </div>
              </div>
            )}
            {x.ghost.skippedRevenge.count > 0 && (
              <div style={{ border: `1px solid ${T.borderSoft}`, padding: '10px 12px' }}>
                <div style={mono(11, T.ink, 700)}>Skipping revenge entries</div>
                <div style={{ ...mono(10.5, T.muted), marginTop: 3 }}>
                  {x.ghost.skippedRevenge.count} revenge trade{x.ghost.skippedRevenge.count > 1 ? 's' : ''} not taken →
                  <b style={{ color: x.ghost.skippedRevenge.recovered >= 0 ? T.green : T.red }}> {inr(x.ghost.skippedRevenge.recovered)}</b> effect
                </div>
              </div>
            )}
          </div>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.body, lineHeight: 1.55, marginTop: 12 }}>
            {x.ghost.explanation}
          </div>
        </div>
      </div>

      {/* why it compounds - real extrapolation from the observed gap */}
      {x.compounding && (
        <div style={{ border: `1px solid ${T.ink}`, background: T.panelAlt, padding: '18px 22px' }}>
          <div style={statLabel}>Why it compounds - the gap at your current rate</div>
          <div style={{ fontFamily: T.serif, fontSize: 'clamp(16px,2.4vw,22px)', color: T.ink, lineHeight: 1.4, margin: '8px 0 14px' }}>
            Over {x.compounding.windowDays} days the discipline gap was <b style={{ color: T.red }}>{inr(x.ghost.gap)}</b>.
            At this rate that&rsquo;s what it costs you:
          </div>
          <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
            <Metric k="Per month" v={inr(-x.compounding.perMonth)} c={T.red} />
            <Metric k="Per quarter" v={inr(-x.compounding.perQuarter)} c={T.red} />
            <Metric k="Per year" v={inr(-x.compounding.perYear)} c={T.red} />
          </div>
          <div style={{ ...mono(9.5, T.faint), marginTop: 10 }}>
            Straight-line extrapolation of your own {x.compounding.windowDays}-day gap - not a forecast, a run-rate.
          </div>
        </div>
      )}

      {/* honest caveats */}
      {(x.notes.length > 0 || x.timestampedShare < 0.9) && (
        <div style={{ border: `1px dashed ${T.border}`, padding: '12px 16px' }}>
          <div style={statLabel}>What couldn&rsquo;t be computed, and why</div>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
            {x.timestampedShare < 0.9 && (
              <li style={{ fontFamily: T.serif, fontSize: 12.5, color: T.faint, lineHeight: 1.6 }}>
                {Math.round((1 - x.timestampedShare) * 100)}% of fills came date-only from the broker - time-of-day metrics use only the timestamped portion.
              </li>
            )}
            {x.notes.map((nn, i) => (
              <li key={i} style={{ fontFamily: T.serif, fontSize: 12.5, color: T.faint, lineHeight: 1.6 }}>{nn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* the pitch */}
      <div style={{ border: `1px solid ${T.ghost}`, background: T.panelAlt, padding: '18px 22px' }}>
        <div style={{ ...statLabel, color: T.ghost }}>This is one snapshot. The terminal watches live.</div>
        <div style={{ fontFamily: T.serif, fontSize: 15, color: T.body, lineHeight: 1.6, marginTop: 8 }}>
          Everything above was reconstructed from your broker&rsquo;s records after the fact.
          The Compass desktop terminal runs these checks <em>while you trade</em> - nudges before
          the revenge entry, a ghost of your rule-following self on the chart, and a process
          score on every close. <a href="#waitlist" style={{ color: T.ghost }}>Join the waitlist →</a>
        </div>
      </div>
    </>
  );
}
