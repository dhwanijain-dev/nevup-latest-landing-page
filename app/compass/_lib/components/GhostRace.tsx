'use client';
// Animated ghost race - REAL data. Two cumulative P&L curves drawn trade by
// trade from the user's own round-trips: "you" (what actually happened) versus
// "the ghost" (the same trades with oversized losses capped at your average
// winner and revenge entries skipped). The per-trip ghost logic mirrors the
// engine EXACTLY (same-symbol revenge within the 30-min window, loss capped at
// the average winning size), so the animated curve's endpoints equal the
// authoritative x.ghost figures shown below it. No invented prices.
import { useEffect, useMemo, useRef, useState } from 'react';
import { T, statLabel } from '../theme';
import type { RoundTrip, Insights } from '../insights/engine';

const REVENGE_WINDOW_MIN = 30;
const ms = (t: string) => { const v = Date.parse(t); return Number.isFinite(v) ? v : NaN; };
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

export default function GhostRace({ trips, x }: { trips: RoundTrip[]; x: Insights }) {
  const cur = x.profile.currencySymbol || '₹';
  const inr = (v: number) => `${v < 0 ? '−' : ''}${cur}${Math.abs(Math.round(v)).toLocaleString(cur === '₹' ? 'en-IN' : 'en-US')}`;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  // per-trip cumulative curves — logic identical to engine.computeInsights ghost
  const { you, ghost } = useMemo(() => {
    const sorted = [...trips].sort((a, b) => (ms(a.entryTs) || 0) - (ms(b.entryTs) || 0));
    const wins = sorted.filter(t => t.pnl > 0);
    const avgWinAbs = wins.length ? wins.reduce((a, b) => a + b.pnl, 0) / wins.length : 0;

    const id = (t: RoundTrip) => `${t.symbol}|${t.entryTs}|${t.exitTs}`;
    const lossExits = sorted.filter(t => t.pnl < 0 && !Number.isNaN(ms(t.exitTs)))
      .map(t => ({ symbol: t.symbol, at: ms(t.exitTs) }));
    const revenge = new Set<string>();
    for (const t of sorted) {
      const entry = ms(t.entryTs);
      if (Number.isNaN(entry)) continue;
      if (lossExits.some(l => l.symbol === t.symbol && entry > l.at && entry - l.at <= REVENGE_WINDOW_MIN * 60000)) {
        revenge.add(id(t));
      }
    }

    const you: number[] = [], ghost: number[] = [];
    let cy = 0, cg = 0;
    for (const t of sorted) {
      cy += t.pnl;
      if (revenge.has(id(t))) { /* ghost never takes the revenge entry */ }
      else if (t.pnl < 0 && avgWinAbs > 0 && Math.abs(t.pnl) > avgWinAbs) cg += -avgWinAbs;
      else cg += t.pnl;
      you.push(cy); ghost.push(cg);
    }
    return { you, ghost };
  }, [trips]);

  const n = you.length;

  useEffect(() => {
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

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const all = [...you, ...ghost, 0];
    const lo = Math.min(...all), hi = Math.max(...all);
    const pad = (hi - lo) * 0.12 || 1;
    const yMin = lo - pad, yMax = hi + pad;

    const draw = (p: number) => {
      const { w, h } = sizeRef.current;
      const padL = 8, padR = 8, padT = 14, padB = 22;
      ctx.clearRect(0, 0, w, h);
      const X = (i: number) => padL + (n <= 1 ? 0 : (i / (n - 1)) * (w - padL - padR));
      const Y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * (h - padT - padB);

      ctx.strokeStyle = T.borderSoft; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(w - padR, Y(0)); ctx.stroke();

      // fractional reveal for a smooth sweep (not just whole points)
      const frac = Math.max(0, p * (n - 1));
      const upto = Math.floor(frac) + 1;
      const pointsFor = (arr: number[]): [number, number][] => {
        const pts: [number, number][] = [];
        for (let i = 0; i < Math.min(upto, n); i++) pts.push([X(i), Y(arr[i])]);
        if (upto < n) {
          const t = frac - Math.floor(frac), i = Math.floor(frac);
          pts.push([X(i) + (X(i + 1) - X(i)) * t, Y(arr[i]) + (Y(arr[i + 1]) - Y(arr[i])) * t]);
        }
        return pts;
      };
      const youPts = pointsFor(you), ghostPts = pointsFor(ghost);
      if (youPts.length < 1) return;

      // 1) the striking part: fill the BAND between the two curves (the gap =
      //    what discipline is worth), a translucent purple that grows with the sweep
      ctx.beginPath();
      ghostPts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      for (let i = youPts.length - 1; i >= 0; i--) ctx.lineTo(youPts[i][0], youPts[i][1]);
      ctx.closePath();
      ctx.fillStyle = 'rgba(122,90,245,0.18)'; ctx.fill();

      const stroke = (pts: [number, number][], color: string, width: number, glow: boolean, dots: boolean) => {
        ctx.beginPath();
        pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
        // 2) points at each revealed data node
        if (dots) {
          ctx.fillStyle = color;
          for (let i = 0; i < Math.min(upto, n); i++) { ctx.beginPath(); ctx.arc(X(i), pts[i][1], 2.4, 0, Math.PI * 2); ctx.fill(); }
        }
        // 3) glowing pulsing head
        const [hx, hy] = pts[pts.length - 1];
        if (glow) { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 14; }
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(hx, hy, width + 2.5, 0, Math.PI * 2); ctx.fill();
        if (glow) ctx.restore();
      };
      stroke(ghostPts, T.ghost, 2.5, true, true);
      stroke(youPts, T.ink, 2, true, true);
    };

    if (reduce) { setProgress(1); draw(1); ro.disconnect(); return; }
    let start = 0;
    const DURATION = 2400;
    const loop = (ts: number) => {
      if (!start) start = ts;
      const p = easeOut(Math.min(1, (ts - start) / DURATION));
      setProgress(p); draw(p);
      if (p < 1) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [you, ghost, n]); // eslint-disable-line react-hooks/exhaustive-deps

  if (n < 2) return null;

  // Authoritative endpoints (the curve lands exactly on these). Numbers count
  // up with the sweep so it reads like the mirror's ghost animation.
  const youTotal = x.ghost.actualPnl, ghostTotal = x.ghost.ghostPnl, gap = x.ghost.gap;
  const youNow = youTotal * progress, ghostNow = ghostTotal * progress, gapNow = gap * progress;

  return (
    <div style={{ border: `1px solid ${T.ghost}`, borderRadius: 10, padding: '18px 20px', marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ ...statLabel, color: T.ghost }}>Ghost trade · your rule-following self</span>
        <span style={{ ...statLabel, marginLeft: 'auto', color: T.faint }}>reconstructed from your own trades · no future prices</span>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, ...mono(10, T.muted) }}>
        <span><span style={{ color: T.ink, fontWeight: 700 }}>—</span> You</span>
        <span><span style={{ color: T.ghost, fontWeight: 700 }}>—</span> Rule-following self</span>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 220, display: 'block', marginTop: 8 }} />
      <div style={{ display: 'flex', gap: 28, marginTop: 10, flexWrap: 'wrap' }}>
        <Stat label="You made" value={inr(youNow)} color={youTotal >= 0 ? T.green : T.red} />
        <Stat label="The ghost made" value={inr(ghostNow)} color={T.ghost} />
        <Stat label="Left on the table" value={inr(gapNow)} color={gap >= 0 ? T.red : T.green} />
      </div>
    </div>
  );
}

const mono = (size: number, color: string, weight = 400): React.CSSProperties =>
  ({ fontFamily: T.mono, fontSize: size, color, fontWeight: weight });

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={statLabel}>{label}</div>
      <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}
