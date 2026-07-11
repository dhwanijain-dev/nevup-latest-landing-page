'use client';
// Animated ghost race - REAL data. Two cumulative P&L curves drawn trade by
// trade from the user's own round-trips: "you" (what actually happened) versus
// "the ghost" (the same trades with oversized losses capped at your average
// winner and revenge entries skipped). No invented prices - each step is a
// realized round-trip. The gap between the curves is the discipline cost.
import { useEffect, useMemo, useRef, useState } from 'react';
import { T, statLabel } from '../theme';
import type { RoundTrip } from '../insights/engine';
import { classifyTrips } from '../insights/accuracy';

const inr = (v: number) => `${v < 0 ? '-' : ''}₹${Math.abs(Math.round(v)).toLocaleString('en-IN')}`;

export default function GhostRace({ trips }: { trips: RoundTrip[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0); // 0..1 across all trips

  // per-trip cumulative curves, computed once from real trades
  const { you, ghost, gap } = useMemo(() => {
    const cls = classifyTrips(trips);
    const wins = cls.filter(c => c.trip.pnl > 0).map(c => c.trip.pnl);
    const avgWin = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
    const you: number[] = [], ghost: number[] = [];
    let cy = 0, cg = 0;
    for (const c of cls) {
      cy += c.trip.pnl;
      // ghost: skip revenge (not taken), cap oversized losers, else as-is
      const g = c.isRevenge ? 0 : (c.isOversizedLoser ? -avgWin : c.trip.pnl);
      cg += g;
      you.push(cy); ghost.push(cg);
    }
    return { you, ghost, gap: cg - cy };
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
      const x = (i: number) => padL + (n <= 1 ? 0 : (i / (n - 1)) * (w - padL - padR));
      const y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * (h - padT - padB);

      // zero line
      ctx.strokeStyle = T.borderSoft; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y(0)); ctx.lineTo(w - padR, y(0)); ctx.stroke();

      const upto = Math.max(1, Math.floor(p * n));
      const line = (arr: number[], color: string, width: number, fill?: string) => {
        ctx.beginPath();
        for (let i = 0; i < upto; i++) { const px = x(i), py = y(arr[i]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        if (fill) {
          const g = ctx.createLinearGradient(0, padT, 0, h - padB);
          g.addColorStop(0, fill); g.addColorStop(1, 'rgba(122,90,245,0)');
          ctx.save(); ctx.lineTo(x(upto - 1), y(0)); ctx.lineTo(x(0), y(0)); ctx.closePath();
          ctx.fillStyle = g; ctx.fill(); ctx.restore();
          ctx.beginPath();
          for (let i = 0; i < upto; i++) { const px = x(i), py = y(arr[i]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        }
        ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round';
        ctx.stroke();
        // head dot
        const hx = x(upto - 1), hy = y(arr[upto - 1]);
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(hx, hy, width + 1.5, 0, Math.PI * 2); ctx.fill();
      };
      line(ghost, T.ghost, 2.5, 'rgba(122,90,245,0.14)');
      line(you, T.ink, 2);
    };

    if (reduce) { setProgress(1); draw(1); ro.disconnect(); return; }

    let start = 0;
    const DURATION = 2600;
    const loop = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / DURATION);
      setProgress(p);
      draw(p);
      if (p < 1) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [you, ghost, n]);

  const upto = Math.max(1, Math.floor(progress * n));
  const youNow = you[upto - 1] ?? 0;
  const ghostNow = ghost[upto - 1] ?? 0;

  if (n < 2) return null;

  return (
    <div style={{ border: `1px solid ${T.ghost}`, borderRadius: 2, padding: '18px 20px', marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ ...statLabel, color: T.ghost }}>Ghost trade · your rule-following self</span>
        <span style={{ ...statLabel, marginLeft: 'auto', color: T.faint }}>reconstructed from your own trades · no future prices</span>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 220, display: 'block', marginTop: 12 }} />
      <div style={{ display: 'flex', gap: 28, marginTop: 10, flexWrap: 'wrap' }}>
        <Stat label="You made" value={inr(youNow)} color={youNow >= 0 ? T.green : T.red} />
        <Stat label="The ghost made" value={inr(ghostNow)} color={T.ghost} />
        <Stat label="Left on the table" value={inr(gap)} color={gap >= 0 ? T.green : T.red} />
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={statLabel}>{label}</div>
      <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}
