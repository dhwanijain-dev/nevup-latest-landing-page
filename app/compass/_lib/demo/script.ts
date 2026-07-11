// Deterministic demo session — one real-shaped trade, replayed.
// Numbers mirror the engine's actual outputs (ghost trades, process score,
// past-self reminder); the price path is seeded so every demo is identical.

export interface Bar {
  t: number; o: number; h: number; l: number; c: number; v: number;
}

// Mulberry32 — tiny seeded PRNG, deterministic across runs
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SYMBOL = 'SPY';
export const QTY = 100;
export const ENTRY_BAR = 18;
export const TRADER_EXIT_BAR = 38;
export const NUDGE_BAR = 44;
export const GHOST_EXIT_BAR = 74;
export const N_BARS = 84;

export const ENTRY = 623.4;
export const TRADER_EXIT = 625.5;   // +$210 on 100 shares
export const GHOST_EXIT = 629.8;    // +$640 — the 2:1 target per the rules
export const STOP = 620.9;

export function buildBars(): Bar[] {
  const r = rng(20260710);
  const bars: Bar[] = [];
  let price = 622.1;
  const start = Date.UTC(2026, 5, 24, 13, 30) / 1000; // 09:30 ET session
  for (let i = 0; i < N_BARS; i++) {
    // drift schedule shapes the story: quiet open → rally → shakeout that
    // scares the early exit → grind to target → drift after
    let drift = 0.02;
    if (i >= ENTRY_BAR && i < 34) drift = 0.09;
    else if (i >= 34 && i < TRADER_EXIT_BAR) drift = -0.16; // the shakeout
    else if (i >= TRADER_EXIT_BAR && i < GHOST_EXIT_BAR) drift = 0.135;
    else if (i >= GHOST_EXIT_BAR) drift = -0.03;
    const noise = (r() - 0.5) * 0.42;
    const o = price;
    const c = Math.max(o + drift + noise, 619.5);
    const h = Math.max(o, c) + r() * 0.24;
    const l = Math.min(o, c) - r() * 0.24;
    const v = Math.round(400_000 + r() * 900_000 * (i >= ENTRY_BAR - 2 && i <= ENTRY_BAR + 2 ? 2.2 : 1));
    bars.push({ t: start + i * 300, o, h, l, c, v });
    price = c;
  }
  // pin the narrative prices exactly
  bars[ENTRY_BAR].c = ENTRY; bars[ENTRY_BAR].h = Math.max(bars[ENTRY_BAR].h, ENTRY + 0.1);
  bars[TRADER_EXIT_BAR].c = TRADER_EXIT;
  bars[GHOST_EXIT_BAR].c = GHOST_EXIT;
  bars[GHOST_EXIT_BAR].h = Math.max(bars[GHOST_EXIT_BAR].h, GHOST_EXIT + 0.05);
  return bars;
}

export const NUDGE = {
  rule: 'Immediate re-entry',
  message:
    'You closed this position 6 minutes ago and you are typing a new order in the ' +
    'same symbol. Your plan calls for one confirmed setup per session leg. ' +
    'This entry has no signal behind it.',
  pastSelf:
    'Your history with this rule: May 28 — re-entry on SPY four minutes after a ' +
    'stop-out. Result: −$412, three times your average loss. That session ended −$980.',
};

export const PROCESS_SCORE = {
  total: 61,
  components: [
    { name: 'Entry quality', score: 9, max: 10, note: 'clean break, volume confirmed' },
    { name: 'Position size', score: 10, max: 10, note: 'exactly 1R per your rules' },
    { name: 'Stop placement', score: 8, max: 10, note: 'at structure, slightly tight' },
    { name: 'Exit', score: 3, max: 10, note: 'sold the shakeout — plan said hold to 2:1' },
    { name: 'Rule adherence', score: 31, max: 60, note: 'early exit + attempted re-entry' },
  ],
  outcome: '+$210',
  ghostOutcome: '+$640',
};

export const DNA = {
  headline:
    'You are a momentum trader whose edge lives in the first 90 minutes. ' +
    'You exit winners 40% early and this month it has cost you $3,120.',
  facts: [
    ['Early exits this month', '14'],
    ['Left on the table', '$3,120'],
    ['Win rate when you follow the plan', '64%'],
    ['Win rate when you deviate', '38%'],
    ['Most expensive hour', '11:00–12:00 (−$1,840)'],
    ['Best setup', 'Opening-range break · 2.1R avg'],
  ],
  radar: [
    { axis: 'Aggression', v: 72 },
    { axis: 'Patience', v: 38 },
    { axis: 'Risk discipline', v: 81 },
    { axis: 'Consistency', v: 55 },
    { axis: 'Adaptability', v: 60 },
    { axis: 'Emotional stability', v: 47 },
  ],
};
