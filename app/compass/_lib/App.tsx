'use client';
import { useEffect, useState } from 'react';
import { T } from './theme';
import Explorer from './explorer/Explorer';
import InsightsPage from './insights/InsightsPage';

// Post-onboarding shell: a left sidebar with two tabs (Insights, Explorer) and
// the active view on the right. The entry is always Insights (the upload +
// real analysis). Explorer unlocks only once a CSV has been uploaded and
// processed. There is no marketing/demo page in the product.

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
  try { return sessionStorage.getItem('compass_unlocked') === '1'; }
  catch { return false; }
};

const ADMIN_EMAIL = 'vatsal2077@gmail.com';

export default function App() {
  const route = useRoute();
  const wantsExplorer = route.startsWith('#/explorer');
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');

  // read client-side state after mount (unlock flag + signed-in user)
  useEffect(() => {
    setUnlocked(isUnlocked());
    const u = (window as unknown as { __compassUser?: { email?: string } }).__compassUser;
    setEmail(u?.email ?? '');
    const iv = setInterval(() => setUnlocked(isUnlocked()), 800); // pick up unlock after upload
    return () => clearInterval(iv);
  }, [route]);

  // Explorer is reachable only after a real upload
  useEffect(() => {
    if (wantsExplorer && !unlocked) window.location.hash = '#/insights';
  }, [wantsExplorer, unlocked]);

  const go = (hash: string) => { window.location.hash = hash; };
  const showExplorer = wantsExplorer && unlocked;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, color: T.ink }}>
      <aside style={{
        width: 190, flexShrink: 0, borderRight: `1px solid ${T.border}`,
        padding: '22px 16px', position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: T.ink, marginBottom: 22 }}>
          COMPASS
        </div>

        <NavItem label="Insights" active={!showExplorer} onClick={() => go('#/insights')} />
        <NavItem label="Explorer" active={showExplorer} locked={!unlocked}
          onClick={() => unlocked && go('#/explorer')} />

        <div style={{ marginTop: 'auto', fontFamily: T.mono, fontSize: 10, color: T.faint, lineHeight: 1.6 }}>
          {email && <div style={{ wordBreak: 'break-all' }}>{email}</div>}
          {email.toLowerCase() === ADMIN_EMAIL && (
            <a href="/admin" style={{ color: T.ghost, textDecoration: 'none', display: 'block', marginTop: 6 }}>Admin dashboard →</a>
          )}
          {!unlocked && <div style={{ marginTop: 8 }}>Upload a CSV to unlock Explorer.</div>}
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        {showExplorer ? <Explorer /> : <InsightsPage />}
      </main>
    </div>
  );
}

function NavItem({ label, active, locked, onClick }:
  { label: string; active?: boolean; locked?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      style={{
        textAlign: 'left', background: active ? T.panelAlt : 'transparent',
        border: 'none', borderLeft: `2px solid ${active ? T.ghost : 'transparent'}`,
        padding: '9px 12px', cursor: locked ? 'not-allowed' : 'pointer',
        fontFamily: T.mono, fontSize: 12, letterSpacing: '0.04em',
        color: locked ? T.faint : (active ? T.ink : T.muted), fontWeight: active ? 700 : 500,
        opacity: locked ? 0.6 : 1,
      }}
    >
      {label}{locked ? ' 🔒' : ''}
    </button>
  );
}
