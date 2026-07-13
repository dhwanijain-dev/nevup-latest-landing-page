// Instrument Explorer - LIVE data for any US or Indian listed instrument
// via the Compass market-data proxy (Yahoo Finance). Sections whose data the
// source cannot supply are omitted, never fabricated.
import { useCallback, useEffect, useRef, useState } from 'react';
import { T, statLabel } from '../theme';
import { XData, SearchHit, FYRowX } from './types';
import { searchInstruments, loadInstrument, wasStale, resetStale, kronosForecast, KronosForecast } from './live';
import type { NormTrade } from '../insights/types';
import { pairTrades } from '../insights/engine';
import { useNarrow } from '../useViewport';
import { usePublishChat } from '../chatContext';
import { computeValuation } from './valuation';

// The trader's OWN executed trades on the viewed instrument, from the CSV they
// uploaded (stashed in sessionStorage). Matched on the base symbol (ignoring
// exchange suffix). Returns null if they never traded it - so the chat can
// personalize: what THEY did vs what the stock is doing. All real, from the CSV.
function userSymbolContext(symbol: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem('compass_trades');
    if (!raw) return null;
    const all = JSON.parse(raw) as NormTrade[];
    const base = symbol.split('.')[0].toUpperCase();
    const mine = all.filter(t => (t.symbol || '').split('.')[0].toUpperCase() === base);
    if (!mine.length) return null;
    const { trips } = pairTrades(mine);
    const net = trips.reduce((a, t) => a + t.pnl, 0);
    const wins = trips.filter(t => t.pnl > 0).length;
    const holds = trips.filter(t => t.holdMinutes != null).map(t => t.holdMinutes as number);
    return {
      youTradedThisSymbol: true,
      fills: mine.length,
      roundTrips: trips.length,
      netPnl: Math.round(net),
      winRate: trips.length ? Math.round((wins / trips.length) * 100) : null,
      avgHoldMinutes: holds.length ? Math.round(holds.reduce((a, b) => a + b, 0) / holds.length) : null,
      trades: mine.slice(0, 25).map(t => ({ side: t.side, qty: t.qty, price: t.price, ts: t.ts })),
    };
  } catch { return null; }
}

const TABS = ['Overview', 'Financials', 'Earnings', 'Holders', 'Analysis', 'Analytics'] as const;
type Tab = typeof TABS[number];

const mono = (size: number, color: string, weight = 400): React.CSSProperties =>
  ({ fontFamily: T.mono, fontSize: size, color, fontWeight: weight });

const g = (v: number) => (v >= 0 ? T.green : T.red);
const sgn = (v: number, d = 1) => `${v >= 0 ? '+' : ''}${v.toFixed(d)}%`;

function curSym(c: string): string {
  return c === 'INR' ? '₹' : c === 'USD' ? '$' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : `${c} `;
}
function big(v: number | undefined, c: string): string {
  if (v == null) return ' - ';
  const sym = curSym(c);
  const a = Math.abs(v);
  if (a >= 1e12) return `${sym}${(v / 1e12).toFixed(2)}T`;
  if (a >= 1e9) return `${sym}${(v / 1e9).toFixed(1)}B`;
  if (c === 'INR' && a >= 1e7) return `${sym}${(v / 1e7).toFixed(1)}Cr`;
  if (a >= 1e6) return `${sym}${(v / 1e6).toFixed(1)}M`;
  return `${sym}${v.toFixed(0)}`;
}
const px = (v: number | undefined, c: string, d = 2) => (v == null ? ' - ' : `${curSym(c)}${v.toFixed(d)}`);
const numF = (v: number | undefined, suffix = '', d = 1) => (v == null ? ' - ' : `${v.toFixed(d)}${suffix}`);

// Behavioral sample notes for the pitch panel - clearly labeled sample.
const COMPASS_SAMPLES: Record<string, string> = {
  AAPL: 'Sample: 23 trades, 61% win rate, process score 72. Your edge is early - 5 of 6 losses came after 13:00.',
  NVDA: 'Sample: 31 trades, 48% win rate. 9 entries within 60s of social exposure - win rate on those: 22%.',
  TSLA: 'Sample: 41 trades, biggest leak −$2,340. 17 revenge entries; the engine cools you 30min after any TSLA loss.',
  MSFT: 'Sample: 9 trades, 78% win rate, process score 84 - your calmest ticker. The DNA report says size these up.',
};

// Controlled single-instrument view. The terminal shell owns the tab bar, the
// search, and the open-instrument list; this component just loads and renders
// the stock view for whichever `symbol` it is handed, and publishes that
// instrument's real figures to the shared analyst chat.
export default function Explorer({ symbol, onOpen }: { symbol: string; onOpen?: (s: string) => void }) {
  const [x, setX] = useState<XData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [tab, setTab] = useState<Tab>('Overview');
  const loadSeq = useRef(0);

  useEffect(() => {
    const seq = ++loadSeq.current;
    setLoading(true); setError(null); resetStale();
    (async () => {
      try {
        const data = await loadInstrument(symbol);
        if (seq !== loadSeq.current) return;
        setX(data); setStale(wasStale()); setTab('Overview');
      } catch (e) {
        if (seq !== loadSeq.current) return;
        setError(e instanceof Error ? e.message : 'Load failed');
      } finally {
        if (seq === loadSeq.current) setLoading(false);
      }
    })();
  }, [symbol]);

  usePublishChat(x ? {
    scope: `explorer:${x.symbol}`,
    title: `ASK ABOUT ${x.symbol}`,
    subtitle: 'Grounded in this page’s live data and your own trades on this stock.',
    symbol: x.symbol,
    greeting: `Ask me anything about ${x.name} (${x.symbol}) - answers are computed from the live data on this page and your own history on it.`,
    chips: ['Revenue trend?', 'EPS beats?', 'Who owns it?', 'How did I do on this?', 'How volatile is it?'],
    facts: {
      symbol: x.symbol, name: x.name, exchange: x.exchange, currency: x.currency,
      price: x.price, prevClose: x.prevClose, changePct: x.changePct,
      marketCap: x.marketCap, dayRange: [x.dayLow, x.dayHigh], range52w: [x.low52, x.high52],
      volume: x.volume, avgVolume: x.avgVolume, beta: x.beta, epsTtm: x.epsTtm, divYield: x.divYield,
      // company (so the chat can answer "what does it do", sector, size, etc.)
      company: x.profile ? {
        sector: x.profile.sector, industry: x.profile.industry, employees: x.profile.employees,
        country: x.profile.country, ceo: x.profile.ceo, website: x.profile.website,
        description: x.profile.description?.slice(0, 900),
      } : null,
      // statements + estimates + quality (real)
      fiscalYears: x.fy, quarterly: x.quarterly, forwardEstimates: x.fwdEstimates,
      margins: x.margins, creditLatest: x.creditLatest, quality: x.quality, capitalAllocation: x.capitalAllocation,
      // ownership
      holders: x.holders?.top, institutionalPct: x.holders?.instPct, insiderPct: x.holders?.insiderPct,
      // analysts + earnings
      consensus: x.consensus, ratingsTrend: x.ratingsTrend, ratingActions: x.actions?.slice(0, 8),
      epsHistory: x.epsHistory, nextEarnings: x.nextEarnings,
      // technicals + news
      analytics: x.analytics,
      priceStats: x.priceHistory?.close.length ? {
        closes: x.priceHistory.close.length, last: x.priceHistory.close.at(-1),
        low: Math.min(...x.priceHistory.close), high: Math.max(...x.priceHistory.close),
      } : null,
      news: x.news?.slice(0, 8).map(nw => ({ title: nw.title, publisher: nw.publisher, ago: nw.ago })),
      peers: x.peers,
      // precomputed valuation + the trader's own history on this symbol
      valuation: computeValuation(x),
      yourHistoryOnThisSymbol: userSymbolContext(x.symbol),
    },
  } : null);

  return (
    <div style={{ minWidth: 0 }}>
      {loading && <div style={{ padding: 60, textAlign: 'center', ...mono(12, T.muted) }}>Loading live data…</div>}
      {!loading && error && (
        <div style={{ padding: 40 }}>
          <div style={{ ...mono(12, T.red, 700) }}>Data source unavailable</div>
          <div style={{ fontFamily: T.serif, fontSize: 14, color: T.body, marginTop: 8, maxWidth: 480 }}>
            {error}. Nothing is shown rather than showing stale or invented numbers - retry in a moment.
          </div>
        </div>
      )}
      {!loading && !error && x && (
        <>
          {stale && (
            <div style={{ ...mono(10, T.gold, 700), background: 'rgba(232,184,75,0.1)', borderBottom: `1px solid ${T.gold}`, padding: '6px 22px' }}>
              ⚠ Data source is throttling - showing the last good snapshot (may be up to a day old).
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '16px 22px 10px', flexWrap: 'wrap' }}>
            <span style={mono(20, T.ink, 700)}>{x.name}</span>
            <span style={mono(11, T.muted)}>{x.symbol} · {x.exchange}</span>
            <span style={{ marginLeft: 'auto', ...mono(20, T.ink, 700) }}>{px(x.price, x.currency)}</span>
            {x.changePct != null && <span style={mono(12, g(x.changePct), 700)}>{sgn(x.changePct, 2)} today</span>}
          </div>
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, overflowX: 'auto', padding: '0 12px' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '9px 14px', background: 'transparent', border: 'none',
                borderBottom: tab === t ? `2px solid ${T.gold}` : '2px solid transparent',
                ...mono(11, tab === t ? T.ink : T.muted, tab === t ? 700 : 400),
                letterSpacing: '0.06em', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{t}</button>
            ))}
          </div>
          {x.peers && x.peers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '10px 22px 0' }}>
              <span style={statLabel}>Peers</span>
              {x.peers.slice(0, 8).map(p => (
                <button key={p} onClick={() => onOpen?.(p)} style={{
                  background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 6,
                  padding: '3px 9px', cursor: 'pointer', ...mono(11, T.ink, 600),
                }}>{p}</button>
              ))}
            </div>
          )}
          <div style={{ padding: '16px 22px' }}>
            {tab === 'Overview' && <Overview x={x} />}
            {tab === 'Financials' && <Financials x={x} />}
            {tab === 'Earnings' && <Earnings x={x} />}
            {tab === 'Holders' && <Holders x={x} />}
            {tab === 'Analysis' && <Analysis x={x} />}
            {tab === 'Analytics' && <Analytics x={x} />}
          </div>
        </>
      )}
    </div>
  );
}

// Debounced instrument search, exported for the terminal shell's left rail.
export function SearchBox({ onPick, placeholder = 'Search any instrument…', leadingIcon = false }:
  { onPick: (s: string) => void; placeholder?: string; leadingIcon?: boolean }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // close the dropdown on any click/tap outside, or on Escape
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const run = (text: string) => {
    setQ(text);
    if (timer.current) clearTimeout(timer.current);
    if (!text.trim()) { setHits([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        // matches company names AND tickers; results show the ticker + name
        const res = await searchInstruments(text);
        setHits(res);
        setOpen(true);
      } catch { setHits([]); }
    }, 280);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative', padding: '4px 12px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leadingIcon && (
          <span style={{ position: 'absolute', left: 9, display: 'inline-flex', color: T.faint, pointerEvents: 'none' }} aria-hidden>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
          </span>
        )}
        <input
          value={q}
          onChange={e => run(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%', boxSizing: 'border-box', background: '#fff',
            border: `1px solid ${T.border}`, borderRadius: 6,
            padding: leadingIcon ? '9px 10px 9px 28px' : '9px 10px',
            ...mono(11.5, T.ink), outline: 'none',
          }}
        />
      </div>
      {open && hits.length > 0 && (
        <div style={{
          position: 'absolute', left: 12, right: 12, top: 44, zIndex: 30,
          background: '#fff', border: `1px solid ${T.ink}`, boxShadow: '0 10px 30px rgba(20,23,29,0.12)',
          maxHeight: 320, overflowY: 'auto',
        }}>
          {hits.map(h => (
            <button key={h.symbol} onClick={() => { onPick(h.symbol); setOpen(false); setQ(''); }} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px',
              background: 'transparent', border: 'none', borderBottom: `1px solid ${T.borderSoft}`, cursor: 'pointer',
            }}>
              <span aria-hidden style={{ color: T.faint, fontSize: 12 }}>🏛</span>
              <span style={{ minWidth: 0 }}>
                <span style={mono(11.5, T.ink, 700)}>{h.symbol}</span>
                <span style={{ ...mono(9.5, T.faint), marginLeft: 8 }}>{h.exch}</span>
                <div style={{ ...mono(10, T.muted), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── shared ──────────────────────────────────────────────────────────────────

function Card({ title, right, children }: { title?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${T.border}`, background: T.panel, minWidth: 0, overflow: 'hidden' }}>
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

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, borderBottom: `1px solid ${T.borderSoft}`, padding: '6px 0' }}>
      <span style={mono(11, T.muted)}>{k}</span>
      <b style={{ ...mono(11.5, T.ink, 700), textAlign: 'right' }}>{v}</b>
    </div>
  );
}

function Metric({ k, v, sub, c }: { k: string; v: string; sub?: string; c?: string }) {
  return (
    <div>
      <div style={statLabel}>{k}</div>
      <div style={{ ...mono(16, c ?? T.ink, 700), marginTop: 3 }}>{v}</div>
      {sub && <div style={{ ...mono(9.5, T.faint), marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Missing({ what }: { what: string }) {
  return (
    <div style={{ border: `1px dashed ${T.border}`, padding: '14px 16px', fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.faint }}>
      {what} isn&rsquo;t published by the data source for this instrument - omitted rather than estimated.
    </div>
  );
}

// ── Overview ────────────────────────────────────────────────────────────────

function PriceChart({ x }: { x: XData }) {
  const ph = x.priceHistory!;
  const w = 560, h = 200, pad = 6;
  const data = ph.close;
  const lo = Math.min(...data), hi = Math.max(...data);
  const pts = data.map((v, i) =>
    `${pad + (i / (data.length - 1)) * (w - pad * 2)},${pad + (1 - (v - lo) / (hi - lo || 1)) * (h - pad * 2)}`).join(' ');
  const up = data[data.length - 1] >= data[0];
  const col = up ? T.green : T.red;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={mono(22, T.ink, 700)}>{px(data[data.length - 1], x.currency)}</span>
        <span style={mono(12, col, 700)}>{sgn(((data[data.length - 1] - data[0]) / data[0]) * 100)} past year</span>
        <span style={{ marginLeft: 'auto', ...mono(9.5, T.faint) }}>{data.length} trading days · 1D bars</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block', marginTop: 6 }}>
        <polyline points={pts} fill="none" stroke={col} strokeWidth={1.5} />
        <polygon points={`${pts} ${w - pad},${h - pad} ${pad},${h - pad}`} fill={up ? 'rgba(31,157,107,0.06)' : 'rgba(229,72,77,0.06)'} />
      </svg>
    </div>
  );
}

// Kronos candlestick-model forecast - real when a KRONOS_ENDPOINT is wired,
// honest "not connected" otherwise. Draws the projected path off the last close.
function KronosCard({ x }: { x: XData }) {
  const [state, setState] = useState<KronosForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    if (!x.priceHistory) return;
    setLoading(true);
    setState(await kronosForecast(x.symbol, x.priceHistory.close, 24));
    setLoading(false);
  };
  const hist = x.priceHistory!.close.slice(-40);
  const fc = state?.forecast ?? [];
  const all = [...hist, ...fc];
  const lo = Math.min(...all), hi = Math.max(...all);
  const w = 560, h = 90, pad = 4;
  const X = (i: number) => pad + (i / (all.length - 1)) * (w - pad * 2);
  const Y = (v: number) => pad + (1 - (v - lo) / (hi - lo || 1)) * (h - pad * 2);
  const line = (arr: number[], off: number) =>
    arr.map((v, i) => `${X(i + off)},${Y(v)}`).join(' ');
  return (
    <div style={{ marginTop: 12, borderTop: `1px solid ${T.borderSoft}`, paddingTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={statLabel}>Kronos forecast</span>
        <span style={{ ...mono(9, T.faint) }}>candlestick foundation model · next 24 bars</span>
        <button onClick={run} disabled={loading} style={{
          marginLeft: 'auto', background: 'transparent', border: `1px solid ${T.border}`,
          ...mono(9.5, T.muted), padding: '3px 10px', cursor: loading ? 'default' : 'pointer',
        }}>{loading ? 'forecasting…' : state ? 'refresh' : 'forecast'}</button>
      </div>
      {state?.ok && fc.length ? (
        <>
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block', marginTop: 6 }}>
            <polyline points={line(hist, 0)} fill="none" stroke={T.muted} strokeWidth={1.3} />
            <polyline points={line(fc, hist.length - 1 >= 0 ? hist.length : 0)} fill="none" stroke={T.ghost} strokeWidth={1.6} strokeDasharray="5 3" />
          </svg>
          <div style={{ ...mono(10, fc[fc.length - 1] >= hist[hist.length - 1] ? T.green : T.red), marginTop: 2 }}>
            Projected {fc[fc.length - 1] >= hist[hist.length - 1] ? 'up' : 'down'} {(((fc[fc.length - 1] - hist[hist.length - 1]) / hist[hist.length - 1]) * 100).toFixed(1)}% over the window · zero-shot, no fine-tuning
          </div>
        </>
      ) : state && !state.configured ? (
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11.5, color: T.faint, marginTop: 6, lineHeight: 1.5 }}>
          {state.error} Kronos is the open-source candlestick model (12B records, 45 exchanges); connecting a model server lights this up.
        </div>
      ) : state && !state.ok ? (
        <div style={{ ...mono(10, T.red), marginTop: 6 }}>{state.error}</div>
      ) : (
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11.5, color: T.faint, marginTop: 6 }}>
          Zero-shot next-bars projection from the live price series.
        </div>
      )}
    </div>
  );
}

function Overview({ x }: { x: XData }) {
  const c = x.currency;
  const p = x.profile;
  const sample = COMPASS_SAMPLES[x.symbol];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 14 }}>
        <Card>
          {x.priceHistory ? <PriceChart x={x} /> : <Missing what="Price history" />}
          {x.priceHistory && <KronosCard x={x} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '2px 22px', marginTop: 12 }}>
            <KV k="Prev Close" v={px(x.prevClose, c)} />
            <KV k="Market Cap" v={big(x.marketCap, c)} />
            <KV k="Open" v={px(x.open, c)} />
            <KV k="P/E Ratio" v={numF(x.pe, '', 2)} />
            <KV k="Day Range" v={x.dayLow != null && x.dayHigh != null ? `${x.dayLow.toFixed(2)} – ${x.dayHigh.toFixed(2)}` : ' - '} />
            <KV k="Div Yield" v={numF(x.divYield, '%', 2)} />
            <KV k="52W Range" v={x.low52 != null && x.high52 != null ? `${x.low52.toFixed(2)} – ${x.high52.toFixed(2)}` : ' - '} />
            <KV k="EPS (TTM)" v={numF(x.epsTtm, '', 2)} />
            <KV k="Volume" v={x.volume != null ? Intl.NumberFormat('en', { notation: 'compact' }).format(x.volume) : ' - '} />
          </div>
        </Card>
        <Card>
          <KV k="Symbol" v={x.symbol} />
          {p?.firstTrade && <KV k="First Traded" v={p.firstTrade} />}
          {p?.ceo && <KV k="CEO" v={p.ceo} />}
          {p?.employees != null && <KV k="Employees" v={p.employees.toLocaleString()} />}
          {p?.sector && <KV k="Sector" v={p.sector} />}
          {p?.industry && <KV k="Industry" v={p.industry} />}
          {p?.country && <KV k="Country" v={p.country} />}
          <KV k="Exchange" v={x.exchange} />
          {p?.website && <KV k="Website" v={p.website} />}
          {p?.description && (
            <p style={{ fontFamily: T.serif, fontSize: 12.5, lineHeight: 1.55, color: T.body, margin: '10px 0 0', maxHeight: 150, overflowY: 'auto' }}>
              {p.description}
            </p>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 14 }}>
        {x.consensus ? <ConsensusCard x={x} /> : <Missing what="Analyst consensus" />}
        {x.epsHistory?.some(e => e.est != null && e.actual != null)
          ? <EpsScatter x={x} /> : <Missing what="EPS estimate history" />}
      </div>

      {x.margins && (x.margins.gross != null || x.margins.operating != null) ? (
        <Card title="Operating quality - trailing twelve months">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px 22px' }}>
            {x.margins.gross != null && <Metric k="Gross margin" v={`${x.margins.gross.toFixed(1)}%`} />}
            {x.margins.operating != null && <Metric k="Operating margin" v={`${x.margins.operating.toFixed(1)}%`} />}
            {x.margins.profit != null && <Metric k="Net margin" v={`${x.margins.profit.toFixed(1)}%`} />}
            {x.margins.fcfMargin != null && <Metric k="FCF margin" v={`${x.margins.fcfMargin.toFixed(1)}%`} />}
            {x.margins.roe != null && <Metric k="ROE" v={`${x.margins.roe.toFixed(1)}%`} />}
            {x.margins.roa != null && <Metric k="ROA" v={`${x.margins.roa.toFixed(1)}%`} />}
            {x.creditLatest?.currentRatio != null && <Metric k="Current ratio" v={`${x.creditLatest.currentRatio.toFixed(2)}x`} />}
            {x.beta != null && <Metric k="Beta" v={x.beta.toFixed(2)} />}
          </div>
        </Card>
      ) : null}

      {x.news && x.news.length > 0 && (
        <Card title={`Latest news · ${x.news.length}`}>
          {x.news.map((nn, i) => (
            <a key={i} href={nn.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', borderBottom: i < x.news!.length - 1 ? `1px solid ${T.borderSoft}` : 'none', padding: '9px 0' }}>
              <div style={{ display: 'flex', gap: 10, ...mono(9.5, T.faint) }}>
                <span style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>{nn.publisher}</span>
                {nn.ago && <span>{nn.ago}</span>}
              </div>
              <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 600, color: T.ink, marginTop: 3 }}>{nn.title}</div>
            </a>
          ))}
        </Card>
      )}

      <div style={{ border: `1px solid ${T.ghost}`, background: T.panelAlt, padding: '14px 18px' }}>
        <div style={{ ...statLabel, color: T.ghost }}>Compass only - your history with {x.symbol}</div>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.55, color: T.body, marginTop: 8 }}>
          {sample
            ? `${sample} (Sample data - the desktop terminal builds this panel from your own fills.)`
            : 'The desktop terminal fills this panel from your own trades on this instrument: win rate, process score, best window, and your specific behavioral leaks. No history here on the web demo - that data never leaves your machine.'}
        </div>
      </div>
    </div>
  );
}

function ConsensusCard({ x }: { x: XData }) {
  const c = x.consensus!;
  const buyish = c.strongBuy + c.buy;
  const sellish = c.sell + c.strongSell;
  const total = Math.max(buyish + c.hold + sellish, 1);
  const label = c.key ? c.key.replace('_', ' ').toUpperCase() : buyish > c.hold + sellish ? 'BUY' : 'HOLD';
  const hasTargets = c.targetLow != null && c.targetHigh != null && c.targetMean != null && c.targetHigh > c.targetLow;
  const pos = (v: number) => `${Math.min(Math.max(((v - c.targetLow!) / (c.targetHigh! - c.targetLow!)) * 100, 0), 100)}%`;
  return (
    <Card title="Analyst consensus" right={<span style={mono(10, T.muted)}>{c.analysts ?? total} analysts</span>}>
      <span style={{ ...mono(10, buyish > sellish ? T.green : T.muted, 700), border: `1px solid ${buyish > sellish ? T.green : T.muted}`, padding: '2px 8px' }}>{label}</span>
      <div style={{ display: 'flex', gap: 2, margin: '12px 0 4px' }}>
        {Array.from({ length: 40 }, (_, i) => {
          const frac = i / 40;
          const col = frac < sellish / total ? T.red : frac < (sellish + c.hold) / total ? T.faint : T.green;
          return <span key={i} style={{ flex: 1, height: 8, background: col, opacity: 0.85 }} />;
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...mono(9.5, T.muted) }}>
        <span style={{ color: T.red }}>{sellish} Bearish</span><span>{c.hold} Neutral</span><span style={{ color: T.green }}>{buyish} Bullish</span>
      </div>
      <div style={{ display: 'flex', border: `1px solid ${T.border}`, marginTop: 12 }}>
        {[['STR. SELL', c.strongSell, T.red], ['SELL', c.sell, T.red], ['HOLD', c.hold, T.ink], ['BUY', c.buy, T.green], ['STR. BUY', c.strongBuy, T.green]].map(([l, v, col], i) => (
          <div key={l as string} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderLeft: i ? `1px solid ${T.borderSoft}` : 'none' }}>
            <div style={mono(14, col as string, 700)}>{v as number}</div>
            <div style={{ ...mono(8, T.faint), letterSpacing: '0.08em' }}>{l as string}</div>
          </div>
        ))}
      </div>
      {hasTargets && (
        <>
          <div style={{ position: 'relative', height: 38, marginTop: 18 }}>
            <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 4, background: `linear-gradient(to right, ${T.red}, ${T.panelAlt} 45%, ${T.green})` }} />
            {[{ v: x.price, l: 'Current', col: T.ink, hollow: true }, { v: c.targetMean!, l: `Avg ${sgn(((c.targetMean! - x.price) / x.price) * 100)}`, col: T.green, hollow: false }].map(m => (
              <div key={m.l} style={{ position: 'absolute', left: pos(m.v), transform: 'translateX(-50%)', top: 2 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: m.hollow ? T.bg : m.col, border: `2px solid ${m.col}`, margin: '0 auto' }} />
                <div style={{ ...mono(8.5, m.col), whiteSpace: 'nowrap', marginTop: 3 }}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...mono(10, T.muted), marginTop: 4 }}>
            <span>● Low {c.targetLow!.toFixed(0)}</span>
            <span style={{ color: T.ink }}>○ Current {x.price.toFixed(2)}</span>
            <span style={{ color: T.green }}>● High {c.targetHigh!.toFixed(0)}</span>
          </div>
        </>
      )}
    </Card>
  );
}

function EpsScatter({ x }: { x: XData }) {
  const eh = x.epsHistory!.filter(e => e.est != null && e.actual != null);
  const w = 420, h = 180, padL = 44, padB = 24, padT = 12;
  const all = eh.flatMap(e => [e.est!, e.actual!]);
  const lo = Math.min(...all) * 0.9, hi = Math.max(...all) * 1.08 || 1;
  const X = (i: number) => padL + (i / Math.max(eh.length - 1, 1)) * (w - padL - 16);
  const Y = (v: number) => padT + (1 - (v - lo) / (hi - lo || 1)) * (h - padT - padB);
  return (
    <Card title="Earnings history" right={<span style={mono(10, T.gold, 700)}>EPS</span>}>
      <div style={{ display: 'flex', gap: 14, ...mono(9.5, T.muted), marginBottom: 4 }}>
        <span>○ Estimate</span><span style={{ color: T.green }}>● Beat</span><span style={{ color: T.red }}>● Miss</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {[lo, (lo + hi) / 2, hi].map(v => (
          <g key={v}>
            <line x1={padL} y1={Y(v)} x2={w - 10} y2={Y(v)} stroke={T.borderSoft} strokeWidth={1} />
            <text x={4} y={Y(v) + 3} fontSize={9} fill={T.faint} fontFamily={T.mono}>{v.toFixed(2)}</text>
          </g>
        ))}
        {eh.map((e, i) => (
          <g key={i}>
            <circle cx={X(i)} cy={Y(e.est!)} r={5} fill={T.bg} stroke={T.muted} strokeWidth={1.5} />
            <circle cx={X(i)} cy={Y(e.actual!)} r={5} fill={e.actual! >= e.est! ? T.green : T.red} />
            <text x={X(i)} y={h - 6} fontSize={8.5} fill={T.faint} fontFamily={T.mono} textAnchor="middle">{e.quarter.slice(0, 7)}</text>
          </g>
        ))}
      </svg>
    </Card>
  );
}

// ── Financials ──────────────────────────────────────────────────────────────

function Financials({ x }: { x: XData }) {
  const c = x.currency;
  const fy = x.fy ?? [];
  if (!fy.length) return <Missing what="Annual financial statements" />;
  const cols = [...(x.fwdEstimates ?? []).slice().reverse().map(e => ({ est: true as const, e })), ...fy.map(f => ({ est: false as const, f }))];
  const withFcf = fy.filter(f => f.fcf != null).reverse();
  const withEps = fy.filter(f => f.netIncome != null).reverse();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 14 }}>
        {withFcf.length > 1 ? (
          <MiniBars title="Free cash flow" bars={withFcf.map(f => ({ label: f.label, v: f.fcf! }))} fmt={v => big(v, c)} />
        ) : <Missing what="Cash-flow history" />}
        {withEps.length > 1 ? (
          <MiniBars title="Net income" bars={withEps.map(f => ({ label: f.label, v: f.netIncome! }))} fmt={v => big(v, c)} />
        ) : <Missing what="Net income history" />}
      </div>

      <Card title="Key stats · annual + street estimates">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.ink}` }}>
                <th style={{ ...mono(9.5, T.muted), textAlign: 'left', padding: '6px 8px', letterSpacing: '0.12em', fontWeight: 400 }}>{c}</th>
                {cols.map((col, i) => (
                  <th key={i} style={{ ...mono(10, col.est ? T.faint : T.ink, 700), textAlign: 'right', padding: '6px 8px', whiteSpace: 'nowrap' }}>
                    {col.est ? `◷ ${col.e.label}E` : `FY${col.f.label}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <FinRow name="Revenue" cols={cols} get={f => f.revenue} sub={f => f.revenueG} fmt={v => big(v, c)} strong />
              <FinRow name="Gross Profit" cols={cols} get={f => f.grossProfit} sub={f => f.grossPct} subIsMargin fmt={v => big(v, c)} />
              <FinRow name="EBIT" cols={cols} get={f => f.ebit} fmt={v => big(v, c)} />
              <FinRow name="Net Income" cols={cols} get={f => f.netIncome} sub={f => f.netPct} subIsMargin fmt={v => big(v, c)} />
              <FinRow name="Operating Cash Flow" cols={cols} get={f => f.ocf} fmt={v => big(v, c)} />
              <FinRow name="Capital Expenditure" cols={cols} get={f => f.capex} fmt={v => big(v, c)} />
              <FinRow name="Free Cash Flow" cols={cols} get={f => f.fcf} sub={f => f.fcfPct} subIsMargin fmt={v => big(v, c)} strong />
              <FinRow name="Total Debt" cols={cols} get={f => f.totalDebt} fmt={v => big(v, c)} />
              <FinRow name="Cash" cols={cols} get={f => f.cash} fmt={v => big(v, c)} />
              {/* estimate-only rows */}
              <tr style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
                <td style={{ ...mono(11, T.body), padding: '7px 8px' }}>Street revenue est.</td>
                {cols.map((col, i) => (
                  <td key={i} style={{ ...mono(11, T.muted), textAlign: 'right', padding: '7px 8px' }}>
                    {col.est && col.e.revenue != null ? big(col.e.revenue, c) : ' - '}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ ...mono(11, T.body), padding: '7px 8px' }}>Street EPS est.</td>
                {cols.map((col, i) => (
                  <td key={i} style={{ ...mono(11, T.muted), textAlign: 'right', padding: '7px 8px' }}>
                    {col.est && col.e.eps != null ? col.e.eps.toFixed(2) : ' - '}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ ...mono(9, T.faint), marginTop: 8 }}>◷ = street estimates (earningsTrend). Blank cells: not published by the source.</div>
      </Card>
    </div>
  );
}

function FinRow({ name, cols, get, sub, subIsMargin, fmt, strong }: {
  name: string;
  cols: ({ est: true; e: NonNullable<XData['fwdEstimates']>[number] } | { est: false; f: FYRowX })[];
  get: (f: FYRowX) => number | undefined;
  sub?: (f: FYRowX) => number | undefined;
  subIsMargin?: boolean;
  fmt: (v: number) => string;
  strong?: boolean;
}) {
  return (
    <tr style={{ borderBottom: `1px solid ${T.borderSoft}`, background: strong ? T.panelAlt : 'transparent' }}>
      <td style={{ ...mono(11, strong ? T.ink : T.body, strong ? 700 : 400), padding: '7px 8px', whiteSpace: 'nowrap' }}>{name}</td>
      {cols.map((col, i) => {
        if (col.est) return <td key={i} style={{ ...mono(11, T.faint), textAlign: 'right', padding: '7px 8px' }}> - </td>;
        const v = get(col.f);
        const sv = sub?.(col.f);
        return (
          <td key={i} style={{ textAlign: 'right', padding: '7px 8px' }}>
            <div style={mono(11, T.ink, strong ? 700 : 400)}>{v != null ? fmt(v) : ' - '}</div>
            {sv != null && <div style={mono(9, subIsMargin ? T.faint : g(sv))}>{subIsMargin ? `${sv.toFixed(1)}%` : sgn(sv)}</div>}
          </td>
        );
      })}
    </tr>
  );
}

function MiniBars({ title, bars, fmt }: { title: string; bars: { label: string; v: number }[]; fmt: (v: number) => string }) {
  const maxV = Math.max(...bars.map(b => Math.abs(b.v))) || 1;
  return (
    <Card title={title} right={<span style={mono(12, T.ink, 700)}>{fmt(bars[bars.length - 1].v)}</span>}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 120, paddingTop: 6 }}>
        {bars.map(b => (
          <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '60%', height: `${(Math.abs(b.v) / maxV) * 82}%`, background: b.v >= 0 ? T.panelAlt : 'rgba(229,72,77,0.15)', border: `1px solid ${b.v >= 0 ? T.border : T.red}` }} />
            <div style={{ ...mono(9, T.faint), marginTop: 4 }}>{b.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Earnings ────────────────────────────────────────────────────────────────

function Earnings({ x }: { x: XData }) {
  const eh = (x.epsHistory ?? []).filter(e => e.est != null && e.actual != null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card title="Next report">
        <div style={mono(16, T.ink, 700)}>{x.nextEarnings ?? 'Not scheduled / not published'}</div>
      </Card>
      {eh.length ? (
        <Card title="Reported quarters - EPS vs estimate">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {eh.map((e, i) => {
              const beat = e.actual! >= e.est!;
              const surprise = e.surprisePct ?? ((e.actual! - e.est!) / Math.abs(e.est! || 1)) * 100;
              return (
                <div key={i} style={{ border: `1px solid ${beat ? T.green : T.red}`, padding: '10px 14px', minWidth: 120 }}>
                  <div style={mono(10, T.muted)}>{e.quarter}</div>
                  <div style={{ ...mono(17, beat ? T.green : T.red, 700), margin: '4px 0' }}>{e.actual!.toFixed(2)}</div>
                  <div style={mono(9.5, T.muted)}>est {e.est!.toFixed(2)}</div>
                  <div style={mono(9.5, g(surprise))}>{sgn(surprise)} surprise</div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : <Missing what="EPS estimate history" />}
      {x.quarterly && x.quarterly.length > 0 && (
        <Card title="Quarterly income statement">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.ink}` }}>
                {['Quarter end', 'Revenue', 'QoQ', 'Gross margin', 'Net income', 'Net margin'].map((h, i) => (
                  <th key={h} style={{ ...mono(9, T.muted), letterSpacing: '0.1em', textAlign: i ? 'right' : 'left', padding: '5px 6px', fontWeight: 400 }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {x.quarterly.map(qr => (
                <tr key={qr.endDate} style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
                  <td style={{ ...mono(11, T.ink, 700), padding: 6 }}>{qr.label}</td>
                  <td style={{ ...mono(11, T.body), textAlign: 'right', padding: 6 }}>{big(qr.revenue, x.currency)}</td>
                  <td style={{ ...mono(10.5, qr.revenueG != null ? g(qr.revenueG) : T.faint), textAlign: 'right', padding: 6 }}>{qr.revenueG != null ? sgn(qr.revenueG) : ' - '}</td>
                  <td style={{ ...mono(11, T.body), textAlign: 'right', padding: 6 }}>{numF(qr.grossPct, '%')}</td>
                  <td style={{ ...mono(11, T.body), textAlign: 'right', padding: 6 }}>{big(qr.netIncome, x.currency)}</td>
                  <td style={{ ...mono(11, T.body), textAlign: 'right', padding: 6 }}>{numF(qr.netPct, '%')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ── Holders ─────────────────────────────────────────────────────────────────

function Holders({ x }: { x: XData }) {
  const h = x.holders;
  if (!h) return <Missing what="Ownership data" />;
  const maxPct = Math.max(...h.top.map(t => t.pctHeld ?? 0), 0.01);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
          {h.instPct != null && <Metric k="Institutional" v={`${h.instPct.toFixed(2)}%`} />}
          {h.insiderPct != null && <Metric k="Insider" v={`${h.insiderPct.toFixed(2)}%`} />}
          {h.institutionsCount != null && <Metric k="Institutions" v={h.institutionsCount.toLocaleString()} />}
        </div>
      </Card>
      {h.top.length ? (
        <Card title="Top institutional holders (13F)">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.ink}` }}>
                  {['Manager', '% held', 'Shares', 'Value', 'Reported'].map((hh, i) => (
                    <th key={hh} style={{ ...mono(9.5, T.muted), letterSpacing: '0.1em', textAlign: i ? 'right' : 'left', padding: '6px 8px', fontWeight: 400 }}>{hh.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {h.top.map((t, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
                    <td style={{ padding: 8, minWidth: 180 }}>
                      <div style={mono(11, T.ink, 700)}>{t.name}</div>
                      {t.pctHeld != null && (
                        <div style={{ height: 3, background: T.panelAlt, marginTop: 4 }}>
                          <div style={{ width: `${(t.pctHeld / maxPct) * 100}%`, height: '100%', background: T.ink, opacity: 0.6 }} />
                        </div>
                      )}
                    </td>
                    <td style={{ ...mono(11, T.ink, 700), textAlign: 'right', padding: 8 }}>{t.pctHeld != null ? `${t.pctHeld.toFixed(2)}%` : ' - '}</td>
                    <td style={{ ...mono(11, T.body), textAlign: 'right', padding: 8 }}>{t.position != null ? Intl.NumberFormat('en', { notation: 'compact' }).format(t.position) : ' - '}</td>
                    <td style={{ ...mono(11, T.body), textAlign: 'right', padding: 8 }}>{t.value != null ? big(t.value, x.currency) : ' - '}</td>
                    <td style={{ ...mono(10, T.faint), textAlign: 'right', padding: 8 }}>{t.reportDate ?? ' - '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : <Missing what="13F holder detail" />}
    </div>
  );
}

// ── Analysis ────────────────────────────────────────────────────────────────

function Analysis({ x }: { x: XData }) {
  const rt = x.ratingsTrend ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {x.consensus ? <ConsensusCard x={x} /> : <Missing what="Analyst consensus" />}
      {rt.length > 1 ? (
        <Card title="Ratings trend - monthly mix">
          <div style={{ display: 'flex', gap: 8, height: 110 }}>
            {rt.map(m => {
              const total = Math.max(m.strongBuy + m.buy + m.hold + m.sell + m.strongSell, 1);
              return (
                <div key={m.period} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ flex: (m.strongBuy + m.buy) / total, background: T.green, opacity: 0.75 }} />
                  <div style={{ flex: Math.max(m.hold / total, 0.02), background: T.faint, opacity: 0.3 }} />
                  <div style={{ flex: Math.max((m.sell + m.strongSell) / total, 0.02), background: T.red, opacity: 0.75 }} />
                  <div style={{ ...mono(9, T.faint), textAlign: 'center' }}>{m.period}</div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}
      {x.fwdEstimates?.length ? (
        <Card title="Street estimates">
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
            {x.fwdEstimates.map(e => (
              <div key={e.period}>
                <div style={statLabel}>{e.label} ({e.period === '0y' ? 'current FY' : 'next FY'})</div>
                <div style={{ ...mono(15, T.ink, 700), marginTop: 4 }}>{e.revenue != null ? big(e.revenue, x.currency) : ' - '} rev</div>
                {e.revenueG != null && <div style={mono(10, g(e.revenueG))}>{sgn(e.revenueG)} growth</div>}
                {e.eps != null && <div style={mono(10, T.muted)}>EPS est {e.eps.toFixed(2)}</div>}
              </div>
            ))}
          </div>
        </Card>
      ) : <Missing what="Forward estimates" />}
      {x.actions?.length ? (
        <Card title={`Analyst actions · ${x.actions.length} recent`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.ink}` }}>
                  {['Firm', 'Rating', 'From', 'Action', 'Date'].map((h, i) => (
                    <th key={h} style={{ ...mono(9.5, T.muted), letterSpacing: '0.1em', textAlign: i >= 3 ? 'right' : 'left', padding: '6px 8px', fontWeight: 400 }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {x.actions.map((a, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
                    <td style={{ ...mono(11, T.ink, 700), padding: 8 }}>{a.firm}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{ ...mono(9.5, /buy|out|over|strong|accum/i.test(a.toGrade) ? T.green : /hold|neutral|equal|market/i.test(a.toGrade) ? T.muted : T.red, 700), border: `1px solid ${T.borderSoft}`, padding: '2px 8px' }}>{a.toGrade}</span>
                    </td>
                    <td style={{ ...mono(10.5, a.fromGrade ? T.faint : T.faint), padding: 8 }}>{a.fromGrade || ' - '}</td>
                    <td style={{ ...mono(10.5, /down/i.test(a.action) ? T.red : /up/i.test(a.action) ? T.green : T.body), textAlign: 'right', padding: 8, textTransform: 'capitalize' }}>{a.action}</td>
                    <td style={{ ...mono(10, T.faint), textAlign: 'right', padding: 8 }}>{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : <Missing what="Upgrade/downgrade history" />}
    </div>
  );
}

// ── Analytics ───────────────────────────────────────────────────────────────

function Analytics({ x }: { x: XData }) {
  const a = x.analytics;
  const cl = x.creditLatest;
  const c = x.currency;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {a ? (
        <Card title="Price-derived analytics - computed from the actual series">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px 22px' }}>
            {a.ret1m != null && <Metric k="1-month return" v={sgn(a.ret1m)} c={g(a.ret1m)} />}
            {a.ret6m != null && <Metric k="6-month return" v={sgn(a.ret6m)} c={g(a.ret6m)} />}
            {a.ret1y != null && <Metric k="1-year return" v={sgn(a.ret1y)} c={g(a.ret1y)} />}
            {a.vol30d != null && <Metric k="Realized vol (30d, ann.)" v={`${a.vol30d.toFixed(1)}%`} />}
            {a.maxDd1y != null && <Metric k="Max drawdown (1y)" v={`${a.maxDd1y.toFixed(1)}%`} c={T.red} />}
            {a.rsi14 != null && <Metric k="RSI (14)" v={String(a.rsi14)} c={a.rsi14 > 70 ? T.red : a.rsi14 < 30 ? T.green : T.ink} />}
            {a.sma50 != null && <Metric k="50-day avg" v={px(a.sma50, c)} sub={x.price > a.sma50 ? 'price above' : 'price below'} />}
            {a.sma200 != null && <Metric k="200-day avg" v={px(a.sma200, c)} sub={x.price > a.sma200 ? 'price above' : 'price below'} />}
            {x.beta != null && <Metric k="Beta" v={x.beta.toFixed(2)} />}
          </div>
        </Card>
      ) : <Missing what="Price history for computed analytics" />}

      {cl && (cl.totalDebt != null || cl.currentRatio != null) ? (
        <Card title="Credit & liquidity - trailing twelve months">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px 22px' }}>
            {cl.totalDebt != null && <Metric k="Total debt" v={big(cl.totalDebt, c)} />}
            {cl.totalCash != null && <Metric k="Total cash" v={big(cl.totalCash, c)} />}
            {cl.ebitda != null && <Metric k="EBITDA" v={big(cl.ebitda, c)} />}
            {cl.netDebtEbitda != null && <Metric k="Net debt / EBITDA" v={`${cl.netDebtEbitda.toFixed(2)}x`} c={cl.netDebtEbitda > 3 ? T.red : T.ink} />}
            {cl.currentRatio != null && <Metric k="Current ratio" v={`${cl.currentRatio.toFixed(2)}x`} />}
            {cl.quickRatio != null && <Metric k="Quick ratio" v={`${cl.quickRatio.toFixed(2)}x`} />}
            {cl.debtToEquity != null && <Metric k="Debt / equity" v={`${cl.debtToEquity.toFixed(1)}%`} />}
          </div>
        </Card>
      ) : null}

      {x.quality?.length ? (
        <Card title="Earnings quality - from reported statements">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.ink}` }}>
                {['Period', 'Accruals % assets', 'FCF / NI', 'CFO / Capex', 'DSO'].map((h, i) => (
                  <th key={h} style={{ ...mono(9, T.muted), letterSpacing: '0.1em', textAlign: i ? 'right' : 'left', padding: '5px 6px', fontWeight: 400 }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {x.quality.map(qr => (
                <tr key={qr.label} style={{ borderBottom: `1px solid ${T.borderSoft}` }}>
                  <td style={{ ...mono(11, T.ink, 700), padding: 6 }}>{qr.label}</td>
                  <td style={{ ...mono(11, qr.accrualsPct != null ? (qr.accrualsPct > 0 ? T.red : T.green) : T.faint), textAlign: 'right', padding: 6 }}>{numF(qr.accrualsPct, '%')}</td>
                  <td style={{ ...mono(11, T.body), textAlign: 'right', padding: 6 }}>{qr.fcfNi != null ? `${qr.fcfNi.toFixed(2)}x` : ' - '}</td>
                  <td style={{ ...mono(11, T.body), textAlign: 'right', padding: 6 }}>{qr.cfoCapex != null ? `${qr.cfoCapex.toFixed(1)}x` : ' - '}</td>
                  <td style={{ ...mono(11, T.body), textAlign: 'right', padding: 6 }}>{qr.dso != null ? `${Math.round(qr.dso)}d` : ' - '}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}

      {x.capitalAllocation?.some(ca => ca.buyback != null || ca.dividends != null) ? (
        <Card title="Capital allocation - from cash-flow statements">
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 100 }}>
            {(() => {
              const rows = x.capitalAllocation!.filter(ca => ca.buyback != null || ca.dividends != null);
              const maxV = Math.max(...rows.map(r => (r.buyback ?? 0) + (r.dividends ?? 0)), 1);
              return rows.map(r => (
                <div key={r.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ height: `${((r.dividends ?? 0) / maxV) * 75}%`, background: T.green, opacity: 0.7 }} />
                  <div style={{ height: `${((r.buyback ?? 0) / maxV) * 75}%`, background: T.panelAlt, border: `1px solid ${T.border}`, borderTop: 'none' }} />
                  <div style={{ ...mono(8.5, T.faint), textAlign: 'center', marginTop: 3 }}>{r.label}</div>
                  <div style={{ ...mono(8, T.muted), textAlign: 'center' }}>{big((r.buyback ?? 0) + (r.dividends ?? 0), c)}</div>
                </div>
              ));
            })()}
          </div>
          <div style={{ ...mono(9, T.faint), marginTop: 6 }}>▪ Buybacks <span style={{ color: T.green }}>▪ Dividends</span></div>
        </Card>
      ) : null}
    </div>
  );
}

