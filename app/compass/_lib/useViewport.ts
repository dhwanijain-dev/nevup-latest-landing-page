'use client';
import { useEffect, useState } from 'react';

// Returns true when the viewport is narrower than `bp` (default tablet width).
// Used to switch multi-column layouts to stacked ones on phones/tablets.
// Stack the terminal below ~1000px so phones and most tablets (portrait) get
// the single-column layout; the 3-pane terminal needs the wider space.
export function useNarrow(bp = 1000): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < bp);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return narrow;
}
