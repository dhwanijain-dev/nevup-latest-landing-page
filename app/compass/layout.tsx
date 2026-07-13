// Isolated layout for /compass - loads Compass's fonts and a white canvas,
// independent of the landing site's theme. Tuned to work on any device that
// has a browser: phones, tablets, laptops, desktops, TVs.
import type { ReactNode } from 'react';
import type { Viewport } from 'next';

// device-width scaling + notch-safe (iPhone) + no user-scale lock issues
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function CompassLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {/* global guards: never scroll sideways, respect safe-area insets, and
          give every element a sane box model + touch behaviour */}
      <style>{`
        html, body { max-width: 100%; overflow-x: hidden; -webkit-text-size-adjust: 100%; }
        .compass-root, .compass-root * { box-sizing: border-box; }
        .compass-root { -webkit-tap-highlight-color: transparent; }
      `}</style>
      {/* No overflow on this wrapper: setting overflow here would make it a
          scroll container and break position:sticky for the sidebar + chat.
          Horizontal overflow is contained on html/body instead. */}
      <div
        className="compass-root"
        style={{
          minHeight: '100dvh',
          background: '#ffffff',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        {children}
      </div>
    </>
  );
}
