'use client';
import { useEffect, useState } from 'react';

// Returns true when the viewport is narrower than `bp` (default tablet width).
// Used to switch multi-column layouts to stacked ones on phones/tablets.
export function useNarrow(bp = 860): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < bp);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return narrow;
}
