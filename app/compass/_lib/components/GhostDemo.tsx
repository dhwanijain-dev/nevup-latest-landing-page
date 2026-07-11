// The centerpiece: a scripted replay of one real-shaped trade. The trader
// exits early; the ghost - the version of them that followed their own rules
// - holds to target. Every number on screen is the gap between the two.
import { useEffect, useRef, useState, useCallback } from 'react';
import { T, statLabel } from '../theme';
import {
  buildBars, SYMBOL, QTY, ENTRY, ENTRY_BAR, TRADER_EXIT, TRADER_EXIT_BAR,
  NUDGE_BAR, GHOST_EXIT, GHOST_EXIT_BAR, STOP, NUDGE, PROCESS_SCORE,
} from '../demo/script';

const ALL_BARS = buildBars();

type Phase = 'idle' | 'playing' | 'nudge' | 'done';

const BARS_PER_SEC = 6; // smooth playback cadence (fractional, rAF-driven)

const inrG = (v: number) => `${v < 0 ? '−' : ''}₹${Math.abs(Math.round(v)).toLocaleString('en-IN')}`;

// `real`, when provided, replaces the illustration's verdict numbers/line with
// the user's own computed ghost figures. The animation stays a labeled
// illustration of the mechanic; the takeaway below it is their real data.
export default function GhostDemo({ real }: { real?: { you: number; ghost: number; gap: number; line: string; trips: number } } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [speed, setSpeed] = useState(1);
  // display P&L is throttled React state; the animation itself runs on refs
  const [disp, setDisp] = useState({ you: 0, ghost: 0, cursor: ENTRY_BAR + 1 });

  const progressRef = useRef(ENTRY_BAR + 1); // fractional bar index
  const phaseRef = useRef<Phase>('idle');
  const speedRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const nudgeShownRef = useRef(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  speedRef.current = speed;

  // interpolated close at a fractional bar index → smooth ghost/you curves
  const priceAt = (p: number): number => {
    const i = Math.floor(p);
    const frac = p - i;
    const a = ALL_BARS[Math.min(i, ALL_BARS.length - 1)].c;
    const b = ALL_BARS[Math.min(i + 1, ALL_BARS.length - 1)].c;
    return a + (b - a) * frac;
  };

  const computePnls = (p: number) => {
    const price = priceAt(p);
    const you = p < TRADER_EXIT_BAR ? (price - ENTRY) * QTY : (TRADER_EXIT - ENTRY) * QTY;
    const ghost = p < GHOST_EXIT_BAR ? (price - ENTRY) * QTY : (GHOST_EXIT - ENTRY) * QTY;
    return { you: p >= ENTRY_BAR ? you : 0, ghost: p >= ENTRY_BAR ? ghost : 0 };
  };

  const draw = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    paint(ctx, w, h, progressRef.current, phaseRef.current);
  };

  const loop = (ts: number) => {
    const dt = lastTsRef.current ? (ts - lastTsRef.current) / 1000 : 0;
    lastTsRef.current = ts;
    if (phaseRef.current === 'playing') {
      progressRef.current += dt * BARS_PER_SEC * speedRef.current;
      const p = progressRef.current;
      if (p >= NUDGE_BAR && !nudgeShownRef.current) {
        nudgeShownRef.current = true;
        progressRef.current = NUDGE_BAR;
        phaseRef.current = 'nudge';
        setPhase('nudge');
      } else if (p >= ALL_BARS.length - 1) {
        progressRef.current = ALL_BARS.length - 1;
        phaseRef.current = 'done';
        setPhase('done');
      }
      const pn = computePnls(progressRef.current);
      setDisp({ you: pn.you, ghost: pn.ghost, cursor: Math.floor(progressRef.current) });
    }
    draw();
    rafRef.current = requestAnimationFrame(loop);
  };

  // mount: size canvas once (+ on resize), start the rAF loop
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = cv.clientWidth, h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxRef.current = ctx;
      sizeRef.current = { w, h };
      draw();
    };
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(cv);
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback(() => { phaseRef.current = 'playing'; setPhase('playing'); }, []);
  const pause = () => { phaseRef.current = 'idle'; setPhase('idle'); };
  const restart = () => {
    nudgeShownRef.current = false;
    progressRef.current = ENTRY_BAR + 1;
    phaseRef.current = 'idle';
    setPhase('idle');
    setDisp({ you: 0, ghost: 0, cursor: ENTRY_BAR + 1 });
  };

  const youPnl = disp.you, ghostPnl = disp.ghost, cursor = disp.cursor;
  const gap = ghostPnl - youPnl;
  const fmt = (v: number) => `${v >= 0 ? '+' : '−'}$${Math.abs(v).toFixed(0)}`;

  return (
    <section id="demo" style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      <div style={statLabel}>Illustration - how the ghost trade works</div>
      <h2 style={{
        fontFamily: T.serif, fontWeight: 500, fontSize: 'clamp(26px, 4vw, 40px)',
        lineHeight: 1.15, color: T.ink, margin: '10px 0 12px', maxWidth: 780,
      }}>
        Watch the version of you that <em style={{ fontStyle: 'italic', color: T.ghost }}>followed the plan</em> trade
        alongside the version that didn&rsquo;t.
      </h2>
      <p style={{ fontFamily: T.serif, fontSize: 14.5, color: T.mutedStrong, lineHeight: 1.55, margin: '0 0 22px', maxWidth: 720 }}>
        {real
          ? <>The chart is an illustration of the mechanic. The figures below are computed from your {real.trips} round-trips - your rule-following self netted {inrG(real.ghost)} versus your {inrG(real.you)}.</>
          : <>This is a worked example of the mechanic. <a href="#/insights" style={{ color: T.ghost, fontWeight: 600 }}>Upload your own trade export</a> to see the ghost, the debrief, and the compounding cost computed from your real trades.</>}
      </p>

      {/* chart card */}
      <div style={{ border: `1px solid ${T.border}`, background: T.panel }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
          borderBottom: `1px solid ${T.borderSoft}`, fontFamily: T.mono, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{SYMBOL}</span>
          <span style={{ fontSize: 10, color: T.green, border: `1px solid ${T.green}`, padding: '1px 7px' }}>LONG {QTY}</span>
          <span style={{ fontSize: 10, color: T.faint }}>Jun 24 · 5-min bars · opening-range break</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 22, fontSize: 12, alignItems: 'baseline' }}>
            <span style={{ color: T.muted }}>YOU <b style={{ color: T.ink, fontSize: 15 }}>{fmt(youPnl)}</b></span>
            <span style={{ color: T.ghost }}>GHOST <b style={{ fontSize: 15 }}>{fmt(ghostPnl)}</b></span>
            <span style={{ color: T.muted }}>GAP <b style={{ color: gap > 1 ? T.red : T.muted, fontSize: 15 }}>{fmt(-Math.abs(gap)).replace('+', '−')}</b></span>
          </div>
        </div>

        <div style={{ position: 'relative', height: 420 }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
          {phase === 'nudge' && <NudgeOverlay onDismiss={play} />}
          {phase === 'idle' && (
            <button onClick={play} style={{
              position: 'absolute', inset: 0, margin: 'auto', width: 220, height: 54,
              background: T.ink, color: T.inverse, border: 'none', cursor: 'pointer',
              fontFamily: T.mono, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em',
            }}>▶ PLAY THE SESSION</button>
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '11px 16px',
          borderTop: `1px solid ${T.borderSoft}`, fontFamily: T.mono,
        }}>
          <button onClick={phase === 'playing' ? pause : (phase === 'done' ? restart : play)}
            style={ctlBtn}>{phase === 'playing' ? '⏸ PAUSE' : phase === 'done' ? '↺ REPLAY' : '▶ PLAY'}</button>
          <button onClick={() => setSpeed(speed === 4 ? 1 : speed * 2)} style={ctlBtn}>{speed}×</button>
          <button onClick={restart} style={ctlBtn}>⏮ RESTART</button>
          <div style={{ flex: 1, maxWidth: 340, height: 3, background: T.border }}>
            <div style={{ width: `${(cursor / (ALL_BARS.length - 1)) * 100}%`, height: '100%', background: T.ghost }} />
          </div>
          <span style={{ fontSize: 10, color: T.muted }}>bar {cursor + 1}/{ALL_BARS.length}</span>
        </div>
      </div>

      {/* verdict */}
      {phase === 'done' && (
        <div style={{ animation: 'fadeUp .5s ease both' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'minmax(280px, 1.25fr) minmax(220px, .75fr)',
            border: `1px solid ${T.border}`, borderTop: 0, background: T.panelAlt,
          }}>
            <div style={{ padding: '20px 24px', borderRight: `1px solid ${T.borderSoft}` }}>
              <div style={statLabel}>The verdict</div>
              <div style={{
                fontFamily: T.serif, fontSize: 20, lineHeight: 1.45, fontStyle: 'italic',
                color: T.body, marginTop: 10,
              }}>
                {real
                  ? real.line
                  : `You sold a routine shakeout. The plan said hold to 2:1 - the ghost did, and collected. This is your 14th early exit this month. Running cost: $3,120.`}
              </div>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 9, justifyContent: 'center', fontFamily: T.mono }}>
              <Row k="You took" v={real ? inrG(real.you) : '+$210'} c={T.ink} />
              <Row k="The ghost took" v={real ? inrG(real.ghost) : '+$640'} c={T.ghost} />
              <div style={{ borderTop: `1px dashed ${T.border}`, margin: '4px 0' }} />
              <Row k="Left on the table" v={real ? inrG(real.gap) : '$430'} c={T.red} />
            </div>
          </div>
          <ScoreCard />
        </div>
      )}
    </section>
  );
}

function Row({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: k.includes('ghost') ? T.ghost : T.muted }}>{k}</span>
      <b style={{ color: c }}>{v}</b>
    </div>
  );
}

function NudgeOverlay({ onDismiss }: { onDismiss: () => void }) {
  // The nudge card, styled like the shipped overlay: cream, serif, red bar.
  return (
    <div style={{
      position: 'absolute', top: 18, right: 18, width: 330, background: '#FAF6EE',
      border: '1px solid #E3D9C8', borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 12px 48px rgba(0,0,0,0.5)', animation: 'fadeUp .35s ease both',
    }}>
      <div style={{ height: 3, background: '#C0392B' }} />
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C0392B', animation: 'gpulse 1.6s infinite' }} />
          <span style={{ fontFamily: T.serif, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#4A4540' }}>
            COMPASS NUDGE - {NUDGE.rule.toUpperCase()}
          </span>
        </div>
        <p style={{ fontFamily: T.serif, fontSize: 13.5, lineHeight: 1.6, color: '#1A1A1A', margin: 0 }}>
          {NUDGE.message}
        </p>
        <div style={{
          marginTop: 12, padding: '9px 11px', background: 'rgba(192,57,43,0.05)',
          border: '1px solid rgba(192,57,43,0.18)', borderRadius: 10,
        }}>
          <div style={{ fontFamily: T.serif, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', color: '#7A726A', marginBottom: 5 }}>
            YOUR HISTORY WITH THIS RULE
          </div>
          <div style={{ fontFamily: T.serif, fontSize: 12, lineHeight: 1.5, color: '#1A1A1A' }}>{NUDGE.pastSelf}</div>
        </div>
        <button onClick={onDismiss} style={{
          marginTop: 12, width: '100%', padding: '8px 0', background: '#1A1A1A', color: '#FAF6EE',
          border: 'none', borderRadius: 7, fontFamily: T.serif, fontSize: 12, cursor: 'pointer',
        }}>
          Understood - stand down
        </button>
      </div>
    </div>
  );
}

function ScoreCard() {
  return (
    <div style={{ border: `1px solid ${T.border}`, borderTop: 0, background: T.panel, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <div style={statLabel}>Process score - shown before P&amp;L, always</div>
        <div style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 12, color: T.muted }}>
          outcome <b style={{ color: T.green }}>{PROCESS_SCORE.outcome}</b> · ghost <b style={{ color: T.ghost }}>{PROCESS_SCORE.ghostOutcome}</b>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 28, marginTop: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: T.mono, fontSize: 56, fontWeight: 700, color: T.gold, lineHeight: 1 }}>
          {PROCESS_SCORE.total}<span style={{ fontSize: 18, color: T.faint }}>/100</span>
        </div>
        <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PROCESS_SCORE.components.map((c) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: T.mono }}>
              <span style={{ width: 130, fontSize: 11, color: T.muted }}>{c.name}</span>
              <div style={{ flex: 1, height: 4, background: T.border }}>
                <div style={{
                  width: `${(c.score / c.max) * 100}%`, height: '100%',
                  background: c.score / c.max < 0.5 ? T.red : c.score / c.max < 0.8 ? T.gold : T.green,
                }} />
              </div>
              <span style={{ width: 46, fontSize: 11, color: T.ink, textAlign: 'right' }}>{c.score}/{c.max}</span>
              <span style={{ width: 220, fontSize: 10.5, color: T.faint }}>{c.note}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: T.mutedStrong, marginTop: 16 }}>
        A 61-point process that made money is still a 61-point process. Compass scores the decision, not the luck.
      </div>
    </div>
  );
}

const ctlBtn: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${T.border}`, color: T.ink,
  fontFamily: T.mono, fontSize: 11, padding: '5px 12px', cursor: 'pointer',
};

// ── canvas painter - fractional progress, smooth ghost overlay ──────────────
// Matches the desktop app's ghost: a translucent purple track the trader's
// rule-following self walks, diverging from where they actually exited.
function paint(ctx: CanvasRenderingContext2D, w: number, h: number,
               progress: number, phase: Phase) {
  const visible = Math.min(Math.floor(progress) + 2, ALL_BARS_CACHE.length);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = T.panel;
  ctx.fillRect(0, 0, w, h);

  const pad = { l: 10, r: 64, t: 18, b: 16 };
  const seen = ALL_BARS_CACHE.slice(0, visible);
  const lo = Math.min(...seen.map(b => b.l)) - 0.4;
  const hi = Math.max(...seen.map(b => b.h)) + 0.4;
  const x = (i: number) => pad.l + (i / (ALL_BARS_CACHE.length - 1)) * (w - pad.l - pad.r);
  const y = (p: number) => pad.t + (1 - (p - lo) / (hi - lo)) * (h - pad.t - pad.b);
  const priceAt = (p: number) => {
    const i = Math.floor(p), frac = p - i;
    const a = ALL_BARS_CACHE[Math.min(i, ALL_BARS_CACHE.length - 1)].c;
    const b = ALL_BARS_CACHE[Math.min(i + 1, ALL_BARS_CACHE.length - 1)].c;
    return a + (b - a) * frac;
  };

  ctx.font = `9px ${T.mono.split(',')[0].replace(/'/g, '')}`;
  for (let gp = Math.ceil(lo); gp <= hi; gp += 2) {
    ctx.strokeStyle = '#eef1f6';
    ctx.beginPath(); ctx.moveTo(pad.l, y(gp)); ctx.lineTo(w - pad.r, y(gp)); ctx.stroke();
    ctx.fillStyle = T.faint;
    ctx.fillText(gp.toFixed(0), w - pad.r + 8, y(gp) + 3);
  }

  dash(ctx, y(STOP), pad.l, w - pad.r, T.red); label(ctx, 'STOP', w - pad.r + 8, y(STOP), T.red);
  dash(ctx, y(GHOST_EXIT), pad.l, w - pad.r, T.green); label(ctx, '2:1', w - pad.r + 8, y(GHOST_EXIT), T.green);

  // candles up to the fractional cursor (last one partially revealed)
  const bw = Math.max((w - pad.l - pad.r) / ALL_BARS_CACHE.length - 3, 2.5);
  seen.forEach((b, i) => {
    const partial = i === visible - 1 ? Math.min(progress - i + 1, 1) : 1;
    if (partial <= 0) return;
    const cx = x(i);
    const up = b.c >= b.o;
    ctx.globalAlpha = i === visible - 1 ? Math.max(partial, 0.3) : 1;
    ctx.strokeStyle = up ? T.green : T.red;
    ctx.fillStyle = up ? T.green : T.red;
    ctx.beginPath(); ctx.moveTo(cx, y(b.h)); ctx.lineTo(cx, y(b.l)); ctx.stroke();
    ctx.fillRect(cx - bw / 2, y(Math.max(b.o, b.c)), bw, Math.max(Math.abs(y(b.o) - y(b.c)), 1));
  });
  ctx.globalAlpha = 1;

  if (progress < ENTRY_BAR) return;

  const ghostEnd = Math.min(progress, GHOST_EXIT_BAR);
  const youEnd = Math.min(progress, TRADER_EXIT_BAR);

  // translucent ghost track (entry → current ghost point) with fill to entry
  const ghostPts: [number, number][] = [];
  for (let i = ENTRY_BAR; i <= Math.floor(ghostEnd); i++) ghostPts.push([x(i), y(ALL_BARS_CACHE[i].c)]);
  ghostPts.push([x(ghostEnd), y(priceAt(ghostEnd))]);
  // soft fill under the ghost line
  ctx.beginPath();
  ctx.moveTo(ghostPts[0][0], y(ENTRY));
  ghostPts.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.lineTo(ghostPts[ghostPts.length - 1][0], y(ENTRY));
  ctx.closePath();
  ctx.fillStyle = 'rgba(122,90,245,0.10)';
  ctx.fill();
  // ghost line
  ctx.strokeStyle = T.ghost;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ghostPts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 1;

  // your realized track (entry → your exit), solid ink; flat after you sold
  ctx.strokeStyle = T.ink;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x(ENTRY_BAR), y(ENTRY));
  for (let i = ENTRY_BAR; i <= Math.floor(youEnd); i++) ctx.lineTo(x(i), y(ALL_BARS_CACHE[i].c));
  ctx.lineTo(x(youEnd), y(priceAt(youEnd)));
  if (progress >= TRADER_EXIT_BAR) ctx.lineTo(x(progress), y(TRADER_EXIT)); // flat: you're out
  ctx.stroke();
  ctx.lineWidth = 1;

  // glowing ghost head while it's still running
  if (ghostEnd < GHOST_EXIT_BAR && phase !== 'idle') {
    const gx = x(ghostEnd), gy = y(priceAt(ghostEnd));
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 9);
    grad.addColorStop(0, 'rgba(122,90,245,0.55)');
    grad.addColorStop(1, 'rgba(122,90,245,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(gx, gy, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = T.ghost;
    ctx.beginPath(); ctx.arc(gx, gy, 3.5, 0, Math.PI * 2); ctx.fill();
  }

  // markers appear as their moment is reached
  if (progress >= ENTRY_BAR) marker(ctx, x(ENTRY_BAR), y(ENTRY), T.green, 'ENTRY 623.40');
  if (progress >= TRADER_EXIT_BAR) marker(ctx, x(TRADER_EXIT_BAR), y(TRADER_EXIT), T.ink, 'YOU SOLD +$210');
  if (progress >= GHOST_EXIT_BAR) marker(ctx, x(GHOST_EXIT_BAR), y(GHOST_EXIT), T.ghost, 'GHOST EXIT +$640');
  if (progress >= NUDGE_BAR) marker(ctx, x(NUDGE_BAR), y(ALL_BARS_CACHE[NUDGE_BAR].h) - 8, '#C0392B', 'NUDGE');
}

const ALL_BARS_CACHE = buildBars();

function dash(ctx: CanvasRenderingContext2D, yy: number, x1: number, x2: number, color: string) {
  ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 5]);
  ctx.beginPath(); ctx.moveTo(x1, yy); ctx.lineTo(x2, yy); ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha = 1;
}
function label(ctx: CanvasRenderingContext2D, txt: string, xx: number, yy: number, color: string) {
  ctx.fillStyle = color; ctx.fillText(txt, xx, yy + 3);
}
function marker(ctx: CanvasRenderingContext2D, xx: number, yy: number, color: string, txt: string) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(xx, yy, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.font = `700 9px 'Spline Sans Mono'`;
  const tw = ctx.measureText(txt).width;
  const tx = Math.min(xx + 8, ctx.canvas.clientWidth - tw - 70);
  ctx.fillText(txt, tx, yy - 7);
}
