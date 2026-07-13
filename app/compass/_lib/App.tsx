'use client';
import { useEffect, useState } from 'react';
import { T } from './theme';
import Explorer from './explorer/Explorer';
import InsightsPage from './insights/InsightsPage';
import ChatDock from './components/ChatDock';
import { ChatProvider } from './chatContext';
import { useNarrow } from './useViewport';

// Terminal shell: a left nav (Insights, Explorer), the active page in the
// centre, and one analyst chat on the right that follows whichever page is
// open. Entry is always Insights (upload + real analysis); Explorer unlocks
// once a CSV has been uploaded and processed.

function useRoute(): string {
  const [route, setRoute] = useState(window.location.hash || '#/insights');
  useEffect(() => {
    const on = () => setRoute(window.location.hash || '#/insights');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

const isUnlocked = () => {
  try { return localStorage.getItem('compass_unlocked') === '1'; }
  catch { return false; }
};

const ADMIN_EMAIL = 'vatsal2077@gmail.com';

export default function App() {
  const route = useRoute();
  const wantsExplorer = route.startsWith('#/explorer');
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const narrow = useNarrow();

  useEffect(() => {
    setUnlocked(isUnlocked());
    const u = (window as unknown as { __compassUser?: { email?: string } }).__compassUser;
    setEmail(u?.email ?? '');
    const iv = setInterval(() => setUnlocked(isUnlocked()), 800);
    return () => clearInterval(iv);
  }, [route]);

  const go = (hash: string) => { window.location.hash = hash; };
  const isAdmin = email.toLowerCase() === ADMIN_EMAIL;

  const nav = (
    <>
      <NavItem label="Insights" hint="your trades, analyzed" active={!wantsExplorer} onClick={() => go('#/insights')} narrow={narrow} />
      <NavItem label="Explorer" hint="research + analyst" active={wantsExplorer} onClick={() => go('#/explorer')} narrow={narrow} />
    </>
  );

  const main = wantsExplorer
    ? (unlocked ? <Explorer /> : <ExplorerGate onUpload={() => go('#/insights')} />)
    : <InsightsPage />;

  return (
    <ChatProvider>
      <div style={{ display: 'flex', flexDirection: narrow ? 'column' : 'row', minHeight: '100vh', background: T.bg, color: T.ink }}>
        {/* left nav */}
        <aside style={narrow ? {
          borderBottom: `1px solid ${T.border}`, padding: '10px 14px', display: 'flex',
          alignItems: 'center', gap: 10, flexWrap: 'wrap', position: 'sticky', top: 0, background: T.bg, zIndex: 20,
        } : {
          width: 184, flexShrink: 0, borderRight: `1px solid ${T.border}`, padding: '20px 14px',
          position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: T.ink, marginBottom: narrow ? 0 : 20, marginRight: narrow ? 6 : 0 }}>
            COMPASS
          </div>
          {nav}
          <div style={narrow
            ? { marginLeft: 'auto', fontFamily: T.mono, fontSize: 10, color: T.faint }
            : { marginTop: 'auto', fontFamily: T.mono, fontSize: 10, color: T.faint, lineHeight: 1.7 }}>
            {email && !narrow && <div style={{ wordBreak: 'break-all' }}>{email}</div>}
            {isAdmin && <a href="/admin" style={{ color: T.ghost, textDecoration: 'none', display: 'block', marginTop: narrow ? 0 : 6 }}>Admin →</a>}
            {!unlocked && !narrow && <div style={{ marginTop: 8 }}>Upload a CSV to unlock Explorer.</div>}
          </div>
        </aside>

        {/* main */}
        <main style={{ flex: 1, minWidth: 0, order: narrow ? 2 : 1 }}>{main}</main>

        {/* right analyst chat - present on both pages */}
        <aside style={narrow
          ? { order: 3, borderTop: `1px solid ${T.border}`, height: '72vh' }
          : { width: 360, flexShrink: 0, borderLeft: `1px solid ${T.border}`, position: 'sticky', top: 0, height: '100vh' }}>
          <ChatDock />
        </aside>
      </div>
    </ChatProvider>
  );
}

function ExplorerGate({ onUpload }: { onUpload: () => void }) {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, textAlign: 'center', border: `1px solid ${T.border}`, borderRadius: 4, padding: '34px 30px', background: T.panel }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.ghost }}>Explorer locked</div>
        <h2 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 500, color: T.ink, margin: '12px 0 8px', lineHeight: 1.25 }}>Please upload your trading CSV first</h2>
        <p style={{ fontFamily: T.serif, fontSize: 15, color: T.mutedStrong, lineHeight: 1.6, margin: '0 0 22px' }}>
          The Explorer opens once Compass has processed your trade book. Upload your broker CSV as proof of trading to unlock it.
        </p>
        <button onClick={onUpload} style={{ background: T.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 22px', fontFamily: T.mono, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          Upload trade CSV
        </button>
      </div>
    </div>
  );
}

function NavItem({ label, hint, active, onClick, narrow }:
  { label: string; hint: string; active?: boolean; onClick: () => void; narrow: boolean }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', background: active ? T.panelAlt : 'transparent', border: 'none',
      borderLeft: narrow ? 'none' : `2px solid ${active ? T.ghost : 'transparent'}`,
      borderBottom: narrow && active ? `2px solid ${T.ghost}` : 'none',
      padding: narrow ? '6px 10px' : '9px 12px', cursor: 'pointer',
      fontFamily: T.mono, fontSize: 12, letterSpacing: '0.04em',
      color: active ? T.ink : T.muted, fontWeight: active ? 700 : 500,
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <span>{label}</span>
      {!narrow && <span style={{ fontSize: 9, color: T.faint, fontWeight: 400 }}>{hint}</span>}
    </button>
  );
}
