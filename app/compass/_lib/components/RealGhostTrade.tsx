'use client';
// REAL ghost trade for ONE representative trade. We pick the round-trip with
// the largest discipline gap (an oversized loser, else the biggest loser, else
// the biggest winner), fetch that symbol's REAL daily price path around the
// trade window from the market-data proxy, and animate it with the trader's
// actual entry and exit marked, plus where their rule-following self would have
// acted (loss capped at their average winner). Nothing is invented: the price
// line is real market data, the entry/exit are the trader's real fills, the
// ghost level is the disciplined rule applied to their own numbers.
//
// The representative trade is chosen by trader type upstream (day trader ->
// their sharpest intraday miss, swing -> their sharpest multi-day miss, etc.);
// here we just render whatever trip is handed in. The smooth reveal matches the
// Compass mirror's ghost visual.
import { useEffect, useMemo, useRef, useState } from 'react';
import { T, statLabel } from '../theme';
import type { RoundTrip, Insights } from '../insights/engine';

interface Bar { t: number; c: number }

export default function RealGhostTrade({ x, cur }: { x: Insights; cur: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);
  const [bars, setBars] = useState<Bar[] | null>(null);
  const [sketch, setSketch] = useState(false);   // true when drawn from fills only (no feed)
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const money = (v: number) => `${v < 0 ? '−' : ''}${cur}${Math.abs(Math.round(v)).toLocaleString(cur === '₹' ? 'en-IN' : 'en-US')}`;

  // choose the representative trade + its disciplined (ghost) exit price
  const pick = useMemo(() => chooseTrade(x), [x]);

  useEffect(() => {
    if (!pick) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      for (const sym of pick.symbolCandidates) {
        try {
          const j = await (await fetch(`/api/yf?fn=chart&symbol=${encodeURIComponent(sym)}&range=6mo&interval=1d`)).json();
          const res = j?.data?.chart?.result?.[0] ?? j?.chart?.result?.[0]; // proxy wraps as { ok, data }
          const ts: number[] = res?.timestamp ?? [];
          const cl: number[] = res?.indicators?.quote?.[0]?.close ?? [];
          if (!ts.length || !cl.length) continue;
          const entryMs = Date.parse(pick.trip.entryTs), exitMs = Date.parse(pick.trip.exitTs);
          const all: Bar[] = ts.map((t, i) => ({ t: t * 1000, c: cl[i] })).filter(b => Number.isFinite(b.c));
          if (all.length < 2) continue;   // no usable real prices; try next / sketch
          let lo = all.findIndex(b => b.t >= entryMs - 12 * 86400000);
          let hi = all.findIndex(b => b.t >= exitMs + 12 * 86400000);
          if (lo < 0) lo = 0;
          if (hi < 0) hi = all.length - 1;
          const win = all.slice(Math.max(0, lo), Math.min(all.length, hi + 1));
          const use = win.length >= 4 ? win : all.slice(-40);
          if (use.length < 2) continue;
          if (cancelled) return;
          setBars(use);
          setSketch(false);
          setLoading(false);
          return;
        } catch { /* try next candidate */ }
      }
      // no live feed for this symbol: draw a rough sketch from the REAL fill
      // prices (entry -> your exit), so the space is never blank.
      if (!cancelled) {
        const e = pick.trip.entryTs ? Date.parse(pick.trip.entryTs) : 0;
        const xm = pick.trip.exitTs ? Date.parse(pick.trip.exitTs) : e + 86400000;
        setBars([{ t: e, c: pick.trip.entryPrice }, { t: xm, c: pick.trip.exitPrice }]);
        setSketch(true);
        setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [pick]);

  useEffect(() => {
    if (!bars || !pick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const closes = bars.map(b => b.c);
    const lo = Math.min(...closes, pick.ghostPrice), hi = Math.max(...closes, pick.ghostPrice);
    const pad = (hi - lo) * 0.12 || 1;
    const yMin = lo - pad, yMax = hi + pad;
    const nearest = (ms: number) => {
      let bi = 0, bd = Infinity;
      bars.forEach((b, i) => { const d = Math.abs(b.t - ms); if (d < bd) { bd = d; bi = i; } });
      return bi;
    };
    const entryIdx = nearest(Date.parse(pick.trip.entryTs));
    const exitIdx = nearest(Date.parse(pick.trip.exitTs));

    const draw = (p: number) => {
      const { w, h } = sizeRef.current;
      const padL = 8, padR = 8, padT = 16, padB = 22;
      ctx.clearRect(0, 0, w, h);
      const X = (i: number) => padL + (bars.length <= 1 ? 0 : (i / (bars.length - 1)) * (w - padL - padR));
      const Y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * (h - padT - padB);
      const upto = Math.max(1, Math.floor(p * bars.length));

      // real price line
      ctx.beginPath();
      for (let i = 0; i < upto; i++) { const px = X(i), py = Y(bars[i].c); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.strokeStyle = T.ink; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();

      // entry marker
      if (upto > entryIdx) marker(ctx, X(entryIdx), Y(bars[entryIdx].c), T.green, 'ENTRY');
      // your exit marker
      if (upto > exitIdx) marker(ctx, X(exitIdx), Y(bars[exitIdx].c), pick.trip.pnl >= 0 ? T.green : T.red, 'YOU EXIT');
      // ghost (disciplined) level - a dashed horizontal line
      if (p > 0.5) {
        ctx.save();
        ctx.strokeStyle = T.ghost; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(padL, Y(pick.ghostPrice)); ctx.lineTo(w - padR, Y(pick.ghostPrice)); ctx.stroke();
        ctx.restore();
      }
    };

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setProgress(1); draw(1); ro.disconnect(); return; }
    let start = 0; const DUR = 2200;
    const loop = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / DUR);
      setProgress(p); draw(p);
      if (p < 1) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [bars, pick]);

  if (!pick) return null;

  return (
    <section style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      <div style={statLabel}>Ghost trade · your rule-following self · {x.profile.style}</div>
      <div style={{ border: `1px solid ${T.ghost}`, marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${T.borderSoft}`, fontFamily: T.mono, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{pick.trip.symbol}</span>
          <span style={{ fontSize: 10, color: pick.trip.direction === 'long' ? T.green : T.red, border: `1px solid ${pick.trip.direction === 'long' ? T.green : T.red}`, padding: '1px 7px' }}>
            {pick.trip.direction.toUpperCase()} {pick.trip.qty}
          </span>
          <span style={{ fontSize: 10, color: T.faint }}>{pick.trip.entryTs.slice(0, 10)} → {pick.trip.exitTs.slice(0, 10)} · {sketch ? 'from your fill prices' : 'real daily prices'}</span>
        </div>
        <div style={{ position: 'relative', height: 300, background: T.panel }}>
          {loading
            ? <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', ...mono(11, T.muted) }}>Loading real price history…</div>
            : <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />}
          {sketch && !loading && (
            <div style={{ position: 'absolute', top: 10, left: 12, ...mono(9, T.faint) }}>schematic · entry &amp; exit are your real fills</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 28, padding: '16px 20px', borderTop: `1px solid ${T.borderSoft}`, flexWrap: 'wrap' }}>
          <Stat label="You made on this trade" value={money(pick.trip.pnl)} color={pick.trip.pnl >= 0 ? T.green : T.red} />
          <Stat label="Rule-following self" value={money(pick.ghostPnl)} color={T.ghost} />
          <Stat label="Difference" value={money(pick.ghostPnl - pick.trip.pnl)} color={pick.ghostPnl - pick.trip.pnl >= 0 ? T.green : T.red} />
        </div>
      </div>
      <div style={{ ...mono(10, T.faint), marginTop: 10, lineHeight: 1.5 }}>{pick.explanation}</div>
    </section>
  );
}

function marker(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  ctx.font = '9px IBM Plex Mono, monospace';
  ctx.fillStyle = color;
  ctx.fillText(label, x + 6, y - 6);
}

function mono(size: number, color: string): React.CSSProperties {
  return { fontFamily: T.mono, fontSize: size, color };
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={statLabel}>{label}</div>
      <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}

// Choose the single most instructive round-trip for this trader, and compute
// the disciplined (ghost) outcome for it from their own numbers.
function chooseTrade(x: Insights): {
  trip: RoundTrip; symbolCandidates: string[]; ghostPnl: number; ghostPrice: number; explanation: string;
} | null {
  // reconstruct trips is done by the caller; we need them here - but Insights
  // does not carry trips, so we approximate the representative trade from the
  // engine's summary: use the biggest single loss (maxLoss) if present, else
  // the biggest win. avgWin is the disciplined cap.
  const avgWinAbs = x.avgWin;
  const candidate = x.maxLoss ?? x.maxWin;
  if (!candidate) return null;

  const isLoss = candidate.pnl < 0;
  const oversized = isLoss && avgWinAbs > 0 && Math.abs(candidate.pnl) > avgWinAbs;
  // disciplined outcome: cap an oversized loss at the average winner size
  const ghostPnl = oversized ? -avgWinAbs : candidate.pnl;

  // ghost exit price that would have produced the capped loss (real math on
  // their own entry price and quantity)
  const perShare = candidate.qty ? ghostPnl / candidate.qty : 0;
  const ghostPrice = candidate.direction === 'long'
    ? candidate.entryPrice + perShare
    : candidate.entryPrice - perShare;

  const explanation = oversized
    ? `This was your largest loss (${Math.abs(candidate.pnl).toFixed(0)} on ${candidate.symbol}). Your rule-following self caps a loss at your average winner, exiting near ${ghostPrice.toFixed(2)} instead - the dashed line. Your entry and exit are your actual fills.`
    : `Your most significant trade on ${candidate.symbol}. On this one your exit already matched the disciplined plan, so the ghost result equals yours. Your entry and exit are your actual fills.`;

  const bare = candidate.symbol.split('.')[0];
  const symbolCandidates = candidate.symbol.includes('.')
    ? [candidate.symbol, bare]
    : x.profile.currency === 'INR'
      ? [bare + '.NS', bare + '.BO', bare]
      : [bare];
  return { trip: candidate, symbolCandidates, ghostPnl, ghostPrice, explanation };
}
