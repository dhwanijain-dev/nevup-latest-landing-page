// Isolated layout for /compass — loads Compass's fonts and a white canvas,
// independent of the landing site's theme.
import type { ReactNode } from 'react';

export default function CompassLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500;1,6..72,600&family=Spline+Sans+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>{children}</div>
    </>
  );
}
