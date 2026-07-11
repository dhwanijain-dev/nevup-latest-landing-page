'use client';
// Compass is a hash-routed SPA (reads window.location.hash on mount) with no
// SSR value — it's noindex. Load it client-only so Next never prerenders it
// on the server (which has no `window`). The signed-in user is stashed on a
// window global so the app's API calls (chat, uploads) can attach the userId.
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const CompassApp = dynamic(() => import('./App'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '100vh', background: '#ffffff' }} />,
});

export interface CompassUser { userId: string; email: string; name: string }

export default function ClientApp(user: CompassUser) {
  useEffect(() => {
    (window as unknown as { __compassUser?: CompassUser }).__compassUser = user;
  }, [user]);
  return <CompassApp />;
}
