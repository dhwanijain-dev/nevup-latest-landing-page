'use client';
import { useEffect, useState } from 'react';
import { T } from './theme';
import Explorer from './explorer/Explorer';
import InsightsPage from './insights/InsightsPage';

// The product has no marketing/demo page. The entry is always the upload
// screen; the Explorer (and any analysis view) only unlocks once the trader has
// actually uploaded a CSV and Compass has processed it. The old hardcoded hero
// with illustrative data is not routed here at all.

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

export default function App() {
  const route = useRoute();
  const wantsExplorer = route.startsWith('#/explorer');
  const unlocked = isUnlocked();

  // Guard: Explorer is reachable only after a real upload. Anything else, or an
  // explorer request before upload, lands on the upload/insights screen.
  useEffect(() => {
    if (wantsExplorer && !unlocked) window.location.hash = '#/insights';
  }, [wantsExplorer, unlocked]);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink }}>
      {wantsExplorer && unlocked ? <Explorer /> : <InsightsPage />}
    </div>
  );
}
