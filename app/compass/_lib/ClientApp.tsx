'use client';
// Compass is a hash-routed SPA (reads window.location.hash on mount) with no
// SSR value — it's noindex. Load it client-only so Next never prerenders it
// on the server (which has no `window`).
import dynamic from 'next/dynamic';

const CompassApp = dynamic(() => import('./App'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', background: '#ffffff' }} />
  ),
});

export default function ClientApp() {
  return <CompassApp />;
}
