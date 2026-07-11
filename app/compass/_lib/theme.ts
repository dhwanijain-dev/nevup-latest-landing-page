// Design tokens lifted from the Compass app mirror (Ghost Page.dc.html) - // black editorial terminal: Newsreader serif voice, Spline Sans Mono data.
// White "ink on paper" edition - light tokens from the mirror's ink mocks
// (premarket-ink): paper background, near-black ink, same serif/mono voice.
export const T = {
  bg: '#ffffff',
  panel: '#fbfcfe',
  panelAlt: '#f4f6fa',
  border: '#d9dde6',
  borderSoft: '#e9ecf2',
  ink: '#14171d',
  body: '#2b2f40',
  mutedStrong: '#4a5060',
  muted: '#6a7185',
  faint: '#9aa3b2',
  red: '#e5484d',
  green: '#1f9d6b',
  ghost: '#7a5af5',
  gold: '#E8B84B',
  serif: "'Newsreader', Georgia, serif",
  mono: "'Spline Sans Mono', ui-monospace, monospace",
  inverse: '#ffffff',
} as const;

export const kicker: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.22em',
  color: T.muted,
  fontFamily: T.mono,
  textTransform: 'uppercase',
};

export const statLabel: React.CSSProperties = {
  fontSize: 9.5,
  letterSpacing: '0.18em',
  color: T.muted,
  fontFamily: T.mono,
  textTransform: 'uppercase',
};

import type React from 'react';
