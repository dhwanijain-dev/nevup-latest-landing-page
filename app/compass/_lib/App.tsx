'use client';
import { useEffect, useRef, useState } from 'react';
import { T } from './theme';
import Explorer, { SearchBox } from './explorer/Explorer';
import InsightsPage from './insights/InsightsPage';
import Portfolio from './Portfolio';
import ChatDock from './components/ChatDock';
import { ChatProvider } from './chatContext';
import { useNarrow } from './useViewport';

// Terminal shell, tryinvesti-style, on the white theme:
//   [ left rail: nav + Explorer workspace + user ] [ top doc tabs + active view ] [ analyst chat ]
// A "document" is either the Insights analysis or an open instrument. The top
// tab bar holds every open document; the left rail hosts app nav plus the
// Explorer workspace (search + open instruments); the right panel is one
// analyst chat that follows the active document.

const isUnlocked = () => { try { return localStorage.getItem('compass_unlocked') === '1'; } catch { return false; } };
const ADMIN_EMAIL = 'vatsal2077@gmail.com';

type Doc = 'insights' | 'portfolio' | { sym: string };
const isSym = (d: Doc): d is { sym: string } => typeof d !== 'string';

export default function App() {
  const [active, setActive] = useState<Doc>('insights');
  const [openSyms, setOpenSyms] = useState<string[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const seededKey = useRef('');
  const narrow = useNarrow();

  useEffect(() => {
    const sync = () => {
      setUnlocked(isUnlocked());
      const u = (window as unknown as { __compassUser?: { email?: string } }).__compassUser;
      setEmail(u?.email ?? '');
      // Seed the Explorer list from the uploaded CSV ONCE per stored set, so a
      // tab the user closes does not keep reopening. Reseeds only on a new upload
      // (when the stored symbol set actually changes).
      try {
        const raw = localStorage.getItem('compass_symbols') ?? '';
        if (raw && raw !== seededKey.current) {
          seededKey.current = raw;
          const csvSyms: string[] = JSON.parse(raw);
          if (Array.isArray(csvSyms) && csvSyms.length) {
            setOpenSyms(list => Array.from(new Set([...csvSyms, ...list])));
          }
        } else if (!raw) {
          seededKey.current = '';
        }
      } catch { /* ignore */ }
    };
    sync();
    const iv = setInterval(sync, 800);
    return () => clearInterval(iv);
  }, []);

  // keep the hash in sync so deep-links / reloads land on the right doc
  useEffect(() => {
    window.location.hash = isSym(active) ? '#/explorer' : active === 'portfolio' ? '#/portfolio' : '#/insights';
  }, [active]);

  const openSymbol = (sym: string) => {
    const s = sym.toUpperCase();
    setOpenSyms(list => (list.includes(s) ? list : [...list, s]));
    setActive({ sym: s });
  };
  const closeSymbol = (sym: string) => {
    setOpenSyms(list => {
      const next = list.filter(s => s !== sym);
      if (isSym(active) && active.sym === sym) setActive(next.length ? { sym: next[next.length - 1] } : 'insights');
      return next;
    });
  };
  const openExplorer = () => {
    if (!unlocked) return;
    if (openSyms.length) setActive({ sym: openSyms[openSyms.length - 1] });
    else openSymbol('AAPL');
  };

  const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
  const activeSym = isSym(active) ? active.sym : null;
  const isInsights = active === 'insights';
  const isPortfolio = active === 'portfolio';

  // ── left rail ──────────────────────────────────────────────────────────────
  const rail = (
    <>
      <style>{`@keyframes compassBlink{0%,100%{opacity:1}50%{opacity:0.15}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: narrow ? 0 : '2px 10px 16px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nevup-emblem.png" alt="NevUp" style={{ height: 20, width: 'auto', display: 'block' }} />
        <span style={{ fontFamily: T.mono, fontSize: 14.5, fontWeight: 700, letterSpacing: '0.04em', color: T.ink, whiteSpace: 'nowrap' }}>NevUp Compass</span>
      </div>
      <RailItem
        icon={<span style={{ width: 8, height: 8, borderRadius: '50%', background: T.ink, display: 'inline-block', animation: 'compassBlink 1.4s ease-in-out infinite' }} />}
        label="My Insights" active={isInsights} onClick={() => setActive('insights')} />
      <RailItem icon="▦" label="Portfolio" active={isPortfolio} onClick={() => setActive('portfolio')} />
      {/* on phones there is no room for the full workspace - keep a compact Explorer entry */}
      {narrow && <RailItem icon="◈" label="Explorer" active={isSym(active)} disabled={!unlocked} onClick={openExplorer} />}

      {!narrow && unlocked && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '18px 10px 6px' }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', color: T.faint }}>EXPLORER</span>
            <button onClick={openExplorer} title="Open an instrument" style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: T.muted, fontFamily: T.mono, fontSize: 15, lineHeight: 1, padding: 0 }}>+</button>
          </div>
          <SearchBox onPick={openSymbol} placeholder="Search companies…" leadingIcon />
          <div style={{ marginTop: 4 }}>
            {openSyms.map(s => (
              <div key={s} onClick={() => setActive({ sym: s })} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', cursor: 'pointer',
                background: activeSym === s ? T.panelAlt : 'transparent',
                borderLeft: activeSym === s ? `2px solid ${T.ghost}` : '2px solid transparent',
              }}>
                <span style={{ color: activeSym === s ? T.ghost : T.faint, fontSize: 12 }} aria-hidden>🏛</span>
                <span style={{ fontFamily: T.mono, fontSize: 11.5, fontWeight: activeSym === s ? 700 : 400, color: T.ink }}>{s}</span>
                <span onClick={e => { e.stopPropagation(); closeSymbol(s); }} style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 12, color: T.faint, cursor: 'pointer' }}>×</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* upload-another sits just above the user block */}
      {unlocked && !narrow && (
        <div style={{ marginTop: 'auto', borderTop: `1px solid ${T.borderSoft}`, paddingTop: 6 }}>
          <RailItem icon="↺" label="Upload another CSV" onClick={() => {
            setActive('insights');
            window.dispatchEvent(new Event('compass:reset'));
          }} />
        </div>
      )}
      {unlocked && narrow && (
        <RailItem icon="↺" label="Upload CSV" onClick={() => { setActive('insights'); window.dispatchEvent(new Event('compass:reset')); }} />
      )}

      {/* user block, bottom */}
      <div style={{ marginTop: narrow ? 0 : 8, marginLeft: narrow ? 'auto' : 0, position: 'relative' }}>
        {userOpen && (isAdmin || email) && (
          <div style={{ position: 'absolute', bottom: narrow ? 'auto' : '110%', top: narrow ? '110%' : 'auto', right: 0, left: narrow ? 'auto' : 0, background: '#fff', border: `1px solid ${T.border}`, boxShadow: '0 10px 30px rgba(20,23,29,0.12)', zIndex: 40 }}>
            {isAdmin && <a href="/admin" style={{ display: 'block', padding: '9px 12px', ...linkStyle }}>Admin dashboard</a>}
            <a href="/api/auth/signout" style={{ display: 'block', padding: '9px 12px', borderTop: isAdmin ? `1px solid ${T.borderSoft}` : 'none', ...linkStyle }}>Sign out</a>
          </div>
        )}
        <button onClick={() => setUserOpen(o => !o)} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: narrow ? 'auto' : '100%', padding: '8px 10px',
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.ghost, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: T.mono, fontSize: 11, fontWeight: 700 }}>
            {(email[0] ?? 'U').toUpperCase()}
          </span>
          {!narrow && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email || 'account'}</span>}
          {!narrow && <span style={{ marginLeft: 'auto', color: T.faint, fontSize: 10 }}>⌄</span>}
        </button>
      </div>
    </>
  );

  // ── top document tabs ────────────────────────────────────────────────────────
  const docTabs = (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 1, background: T.panelAlt, borderBottom: `1px solid ${T.border}`, overflowX: 'auto' }}>
      <DocTab icon="◉" label="My Insights" active={isInsights} onClick={() => setActive('insights')} />
      <DocTab icon="▦" label="Portfolio" active={isPortfolio} onClick={() => setActive('portfolio')} />
      {openSyms.map(s => (
        <DocTab key={s} icon="▤" label={s} active={activeSym === s} onClick={() => setActive({ sym: s })} onClose={() => closeSymbol(s)} />
      ))}
      {unlocked && (
        <button onClick={openExplorer} title="Open an instrument" style={{ padding: '0 12px', background: 'transparent', border: 'none', color: T.muted, fontFamily: T.mono, fontSize: 15, cursor: 'pointer' }}>+</button>
      )}
    </div>
  );

  // ── main content ─────────────────────────────────────────────────────────────
  const main = activeSym
    ? (unlocked ? <Explorer symbol={activeSym} onOpen={openSymbol} /> : <Gate onUpload={() => setActive('insights')} />)
    : isPortfolio ? <Portfolio />
    : <InsightsPage />;

  return (
    <ChatProvider>
      <div style={{ display: 'flex', flexDirection: narrow ? 'column' : 'row', minHeight: '100vh', background: T.bg, color: T.ink }}>
        <aside style={narrow ? {
          order: 1, borderBottom: `1px solid ${T.border}`, padding: '8px 12px', display: 'flex', alignItems: 'center',
          gap: 8, flexWrap: 'wrap', position: 'sticky', top: 0, background: T.bg, zIndex: 20,
        } : {
          order: 1, width: 210, flexShrink: 0, borderRight: `1px solid ${T.border}`, padding: '18px 8px 12px',
          position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto',
        }}>
          {rail}
        </aside>

        <main style={{ order: 2, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {docTabs}
          <div style={{ flex: 1, minWidth: 0 }}>{main}</div>
        </main>

        {/* analyst chat on every page except the Portfolio teaser */}
        {!isPortfolio && (
          <aside style={narrow
            ? { order: 3, borderTop: `1px solid ${T.border}`, height: '78vh', overflow: 'hidden', overscrollBehavior: 'contain' }
            : { order: 3, width: 372, flexShrink: 0, borderLeft: `1px solid ${T.border}`, position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', overscrollBehavior: 'contain' }}>
            <ChatDock />
          </aside>
        )}
      </div>
    </ChatProvider>
  );
}

const linkStyle: React.CSSProperties = { fontFamily: 'Quicksand, system-ui, sans-serif', fontSize: 11, color: '#14171d', textDecoration: 'none' };

function RailItem({ icon, label, active, disabled, onClick }:
  { icon: React.ReactNode; label: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', width: '100%', textAlign: 'left',
      background: active ? T.panelAlt : 'transparent', border: 'none',
      borderLeft: `2px solid ${active ? T.ghost : 'transparent'}`,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
      fontFamily: T.mono, fontSize: 12.5, color: active ? T.ink : T.muted, fontWeight: active ? 700 : 500,
    }}>
      <span style={{ fontSize: 12, color: active ? T.ghost : T.faint }}>{icon}</span>
      {label}
    </button>
  );
}

function DocTab({ icon, label, active, onClick, onClose }:
  { icon: string; label: string; active?: boolean; onClick: () => void; onClose?: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 7, padding: '9px 13px', cursor: 'pointer',
      background: active ? T.bg : 'transparent',
      borderTop: `2px solid ${active ? T.ghost : 'transparent'}`,
      borderRight: `1px solid ${T.border}`,
      fontFamily: T.mono, fontSize: 11, color: active ? T.ink : T.muted, fontWeight: active ? 700 : 400, whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 11, color: active ? T.ghost : T.faint }}>{icon}</span>
      {label}
      {onClose && <span onClick={e => { e.stopPropagation(); onClose(); }} style={{ marginLeft: 4, color: T.faint, fontSize: 12 }}>×</span>}
    </div>
  );
}

function Gate({ onUpload }: { onUpload: () => void }) {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, textAlign: 'center', border: `1px solid ${T.border}`, borderRadius: 4, padding: '34px 30px', background: T.panel }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ghost }}>Explorer locked</div>
        <h2 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 500, color: T.ink, margin: '12px 0 8px', lineHeight: 1.25 }}>Please upload your trading CSV first</h2>
        <p style={{ fontFamily: T.serif, fontSize: 15, color: T.mutedStrong, lineHeight: 1.6, margin: '0 0 22px' }}>
          The Explorer opens once Compass has processed your trade book. Upload your broker CSV as proof of trading to unlock it.
        </p>
        <button onClick={onUpload} style={{ background: T.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 22px', fontFamily: T.mono, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Upload trade CSV</button>
      </div>
    </div>
  );
}
