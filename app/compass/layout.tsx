// Isolated layout for /compass - loads Compass's fonts and a white canvas,
// independent of the landing site's theme.
import type { ReactNode } from 'react';

export default function CompassLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>{children}</div>
    </>
  );
}
