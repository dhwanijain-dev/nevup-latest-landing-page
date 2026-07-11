'use client';
import { useEffect, useState } from 'react';
import { T } from './theme';
import GhostDemo from './components/GhostDemo';
import { Hero, DnaSection, Moat, Waitlist, Footer } from './components/Sections';
import Explorer from './explorer/Explorer';
import InsightsPage from './insights/InsightsPage';

function useRoute(): string {
  const [route, setRoute] = useState(window.location.hash || '#/');
  useEffect(() => {
    const on = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export default function App() {
  const route = useRoute();
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink }}>
      {route.startsWith('#/explorer') ? (
        <Explorer />
      ) : route.startsWith('#/insights') ? (
        <InsightsPage />
      ) : (
        <>
          <Hero />
          <GhostDemo />
          <DnaSection />
          <Moat />
          <Waitlist />
          <Footer />
        </>
      )}
    </div>
  );
}
