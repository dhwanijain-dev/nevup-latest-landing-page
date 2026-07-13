// Hero, stat strip, DNA excerpt with radar, moat table, waitlist, footer.
import { useState } from 'react';
import { T, kicker, statLabel } from '../theme';
import { DNA } from '../demo/script';
import { useNarrow } from '../useViewport';

interface HeroProps {
  embedded?: boolean;                     // hide the top nav bar (sidebar handles it)
  headline?: React.ReactNode;             // real headline
  sub?: string;                           // real subtext
  stats?: [string, string][];             // real stat strip
}

export function Hero({ embedded, headline, sub, stats }: HeroProps = {}) {
  const strip = stats ?? [['17', 'behavioral rules watching live'], ['9', 'feedback loops, closing in seconds'], ['90 days', 'to a Trading DNA no rival can copy']];
  return (
    <header style={{ maxWidth: 1120, margin: '0 auto', padding: embedded ? '44px 24px 10px' : '68px 24px 10px' }}>
      {!embedded && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: `2px solid ${T.ink}`, paddingBottom: 22, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 15, color: T.ink, letterSpacing: '0.08em' }}>COMPASS</span>
          <span style={{ ...kicker }}>The terminal that knows your trading psychology</span>
          <a href="#/insights" style={{
            marginLeft: 'auto', fontFamily: T.mono, fontSize: 11, color: T.ink,
            border: `1px solid ${T.ink}`, padding: '6px 15px', textDecoration: 'none',
            fontWeight: 700, letterSpacing: '0.08em',
          }}>EXPLORER →</a>
          <a href="#/insights" style={{
            fontFamily: T.mono, fontSize: 11, color: '#000',
            background: T.gold, padding: '7px 16px', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.08em',
          }}>ANALYZE MY TRADES →</a>
        </div>
      )}

      <h1 style={{
        fontFamily: T.serif, fontWeight: 500, fontSize: 'clamp(34px, 6vw, 62px)',
        lineHeight: 1.1, color: T.ink, margin: embedded ? '10px 0 0' : '44px 0 0', maxWidth: 900,
      }}>
        {headline ?? (<>Your plan made <em style={{ fontStyle: 'italic', color: T.red }}>$3,120 more</em> than you did last month.</>)}
      </h1>
      <p style={{
        fontFamily: T.serif, fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.6,
        color: T.mutedStrong, maxWidth: 660, margin: '22px 0 0',
      }}>
        {sub ?? 'Every chart platform shows you the market. None of them show you the trader. Compass runs a behavioral engine beside every trade you take - and proves, in your own numbers, exactly where your discipline breaks and what it costs.'}
      </p>
      <div style={{ display: 'flex', gap: 30, marginTop: 34, flexWrap: 'wrap' }}>
        {strip.map(([v, k]) => (
          <div key={k}>
            <div style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.ink }}>{v}</div>
            <div style={{ ...statLabel, marginTop: 4 }}>{k}</div>
          </div>
        ))}
      </div>
    </header>
  );
}

interface DnaData { headline: string; facts: [string, string][]; radar: { axis: string; v: number }[] }

export function DnaSection({ dna, caption }: { dna?: DnaData; caption?: string } = {}) {
  const d = dna ?? DNA as DnaData;
  const narrow = useNarrow();
  return (
    <section style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      <div style={statLabel}>{caption ?? 'Illustration - a Trading DNA report (upload your trades for yours)'}</div>
      <div style={{
        display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(300px, 1.2fr) minmax(260px, .8fr)',
        gap: 0, border: `1px solid ${T.border}`, background: T.panel, marginTop: 14,
      }}>
        <div style={{ padding: narrow ? '22px 20px' : '28px 30px', borderRight: narrow ? 'none' : `1px solid ${T.borderSoft}`, borderBottom: narrow ? `1px solid ${T.borderSoft}` : 'none' }}>
          <div style={{ fontFamily: T.serif, fontSize: 'clamp(19px, 2.4vw, 25px)', fontStyle: 'italic', lineHeight: 1.5, color: T.body }}>
            &ldquo;{d.headline}&rdquo;
          </div>
          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '10px 26px' }}>
            {d.facts.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontFamily: T.mono, fontSize: 12, borderBottom: `1px dashed ${T.border}`, paddingBottom: 7 }}>
                <span style={{ color: T.muted }}>{k}</span>
                <b style={{ color: T.ink, textAlign: 'right', whiteSpace: 'nowrap' }}>{v}</b>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.faint, marginTop: 18, letterSpacing: '0.06em' }}>
            {dna ? 'GENERATED FROM YOUR OWN FILLS' : 'GENERATED FROM 90 DAYS OF ONE TRADER’S OWN FILLS · A COMPETITOR STARTS AT ZERO'}
          </div>
        </div>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Radar radar={d.radar} />
        </div>
      </div>
    </section>
  );
}

function Radar({ radar = DNA.radar }: { radar?: { axis: string; v: number }[] }) {
  const S = 260, cx = S / 2, cy = S / 2, R = 92;
  const step = (2 * Math.PI) / Math.max(3, radar.length);
  const pts = (f: number) => radar.map((_, i) => {
    const a = step * i - Math.PI / 2;
    return `${cx + R * f * Math.cos(a)},${cy + R * f * Math.sin(a)}`;
  }).join(' ');
  const poly = radar.map((d, i) => {
    const a = step * i - Math.PI / 2;
    const f = d.v / 100;
    return `${cx + R * f * Math.cos(a)},${cy + R * f * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg viewBox="-80 -44 420 348" width="100%" style={{ maxWidth: 340, height: 'auto', overflow: 'visible' }}
      role="img" aria-label="Behavioral trait radar">
      {[0.33, 0.66, 1].map(f => (
        <polygon key={f} points={pts(f)} fill="none" stroke={T.border} strokeWidth={1} />
      ))}
      <polygon points={poly} fill="rgba(122,90,245,0.16)" stroke={T.ghost} strokeWidth={2} />
      {radar.map((d, i) => {
        const a = step * i - Math.PI / 2;
        const lx = cx + (R + 22) * Math.cos(a);
        const ly = cy + (R + 18) * Math.sin(a);
        const anchor = Math.cos(a) > 0.25 ? 'start' : Math.cos(a) < -0.25 ? 'end' : 'middle';
        return (
          <text key={d.axis} x={lx} y={ly} textAnchor={anchor} fontFamily={T.mono}
            fontSize={11} fill={T.ink} fontWeight={600}>
            {d.axis} <tspan fill={T.ghost} fontWeight={700}>{d.v}</tspan>
          </text>
        );
      })}
    </svg>
  );
}

export function Moat() {
  const rows: [string, string][] = [
    ['1 week', 'Nothing significant'],
    ['1 month', 'Your rules, your watchlists, the first shape of your behavioral profile'],
    ['3 months', 'Your Trading DNA report, your setup vocabulary, your danger hours'],
    ['6 months', 'Your personal edge, quantified - process scores, override accuracy, ghost-trade ledger'],
    ['1 year', 'A digital twin of your trading psychology. A competitor starts cold.'],
  ];
  return (
    <section style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
      <div style={statLabel}>Why this compounds - what you&rsquo;d lose by leaving</div>
      <div style={{ border: `1px solid ${T.border}`, marginTop: 14 }}>
        {rows.map(([t, w], i) => (
          <div key={t} style={{
            display: 'grid', gridTemplateColumns: '120px 1fr', gap: 18,
            padding: '15px 20px', borderBottom: i < rows.length - 1 ? `1px solid ${T.borderSoft}` : 'none',
            background: i === rows.length - 1 ? T.panelAlt : 'transparent',
          }}>
            <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: i === rows.length - 1 ? T.ghost : T.ink }}>{t}</span>
            <span style={{ fontFamily: T.serif, fontSize: 15, fontStyle: i === rows.length - 1 ? 'italic' : 'normal', color: T.body, lineHeight: 1.5 }}>{w}</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: T.mutedStrong, marginTop: 18, maxWidth: 720 }}>
        Charts and order forms can be copied. Twelve months of your own recorded psychology cannot - that is the moat, and it deepens every session.
      </div>
    </section>
  );
}

export function Waitlist() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const endpoint = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT as string | undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    if (!endpoint) {
      window.location.href = `mailto:early-access@nevup.in?subject=Compass early access&body=${encodeURIComponent(email)}`;
      return;
    }
    setState('sending');
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'compass-web' }),
      });
      setState(r.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  };

  return (
    <section id="waitlist" style={{ maxWidth: 1120, margin: '0 auto', padding: '50px 24px 30px' }}>
      <div style={{ border: `1px solid ${T.ink}`, background: T.panel, padding: 'clamp(28px, 5vw, 52px)', textAlign: 'center' }}>
        <div style={statLabel}>Early access - US launch</div>
        <h2 style={{ fontFamily: T.serif, fontWeight: 500, fontSize: 'clamp(24px, 4vw, 38px)', color: T.ink, margin: '12px auto 6px', maxWidth: 640, lineHeight: 1.2 }}>
          Find out what <em style={{ fontStyle: 'italic', color: T.red }}>your</em> discipline is costing you.
        </h2>
        <p style={{ fontFamily: T.serif, fontSize: 15, color: T.muted, margin: '0 0 26px' }}>
          The full terminal - charts, one broker connection, and the behavioral engine - opens to the waitlist first.
        </p>
        {state === 'done' ? (
          <div style={{ fontFamily: T.mono, fontSize: 14, color: T.green }}>You&rsquo;re on the list. Watch your inbox.</div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', gap: 0, justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: 'min(340px, 70vw)', background: '#ffffff', border: `1px solid ${T.border}`,
                borderRight: 'none', padding: '13px 16px', color: T.ink, fontFamily: T.mono,
                fontSize: 13, outline: 'none',
              }}
            />
            <button type="submit" disabled={state === 'sending'} style={{
              background: T.gold, color: '#000', border: 'none', padding: '13px 26px',
              fontFamily: T.mono, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
            }}>
              {state === 'sending' ? '…' : 'JOIN THE WAITLIST'}
            </button>
          </form>
        )}
        {state === 'error' && (
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.red, marginTop: 10 }}>
            Something failed - email us at early-access@nevup.in
          </div>
        )}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer style={{ maxWidth: 1120, margin: '0 auto', padding: '10px 24px 60px' }}>
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 18, display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.faint }}>© 2026 NevUp · Compass</span>
        <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.faint, marginLeft: 'auto', maxWidth: 620, textAlign: 'right' }}>
          Compass reflects your own trading history back to you. It never recommends a security,
          never originates a strategy, and never promises a return. The demo above is a replayed,
          representative session; every mechanic shown ships in the product.
        </span>
      </div>
    </footer>
  );
}
