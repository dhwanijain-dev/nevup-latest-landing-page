// Behavioral insights engine — pure functions over the trader's own fills.
// Ports the desktop engine's core math: FIFO round-trip pairing, hold-time
// asymmetry (Odean disposition effect), danger hours, revenge-entry
// detection, overtrading bursts, edge-vs-leak P&L attribution.
//
// Honest gating throughout: any metric whose inputs are missing (e.g. no
// intraday timestamps → no danger-hour heatmap) is returned undefined with
// the reason, never estimated.
import type { NormTrade } from './types';

export interface RoundTrip {
  symbol: string;
  qty: number;
  entryPrice: number;
  exitPrice: number;
  entryTs: string;
  exitTs: string;
  pnl: number;
  holdMinutes?: number;    // only when both fills carry time
  direction: 'long' | 'short';
}

export interface HourBucket { hour: number; trades: number; pnl: number; winRate: number }
export interface SymbolStat {
  symbol: string; trades: number; wins: number; pnl: number; winRate: number;
  avgHoldMin?: number;
}

export interface Insights {
  // coverage
  fills: number;
  roundTrips: number;
  openLegs: number;
  from?: string; to?: string;
  timestampedShare: number;      // 0..1 of fills carrying intraday time

  // outcomes
  totalPnl: number;
  wins: number; losses: number; winRate: number;
  avgWin: number; avgLoss: number; profitFactor?: number;
  maxWin: RoundTrip | null; maxLoss: RoundTrip | null;

  // behavior
  holdAsymmetry?: { avgWinHoldMin: number; avgLossHoldMin: number; ratio: number };
  dangerHours?: HourBucket[];
  bestHours?: HourBucket[];
  revenge?: { count: number; pnl: number; winRate: number; windowMin: number };
  bursts?: { count: number; largest: number; windowMin: number };
  streaks: { maxWinStreak: number; maxLossStreak: number; current: number };

  // attribution
  bySymbol: SymbolStat[];
  edge: SymbolStat[];            // profitable symbols
  leak: SymbolStat[];            // losing symbols
  edgePnl: number; leakPnl: number;

  // day-of-week (works from date-only data)
  byWeekday?: { day: string; trades: number; pnl: number; winRate: number }[];

  // discipline score (0–100) + narrative debrief — the app's process-first lens
  disciplineScore: number;
  scoreParts: { label: string; score: number; max: number; note: string }[];
  debrief: { summary: string; wentWell: string[]; leaks: string[]; focus: string };

  // ghost trade — the rule-following version of the trader, reconstructed
  // from THEIR OWN trades (cap losers at avg-win size, skip revenge entries).
  // No price paths needed; purely counterfactual on realized fills.
  ghost: {
    actualPnl: number; ghostPnl: number; gap: number;
    cappedLosers: { count: number; recovered: number };
    skippedRevenge: { count: number; recovered: number };
    explanation: string;
  };

  // why it compounds — the gap extrapolated at the observed rate (labeled)
  compounding: { windowDays: number; perMonth: number; perQuarter: number; perYear: number } | null;

  notes: string[];               // honest caveats about what couldn't be computed
}

const MIN_TRIPS = 5;
const REVENGE_WINDOW_MIN = 30;
const BURST_WINDOW_MIN = 10;
const BURST_N = 4;

function parseTs(t: NormTrade): number {
  const ms = Date.parse(t.ts);
  return Number.isFinite(ms) ? ms : 0;
}

/** FIFO round-trip pairing per symbol; supports longs and shorts. */
export function pairTrades(fills: NormTrade[]): { trips: RoundTrip[]; openLegs: number } {
  const bySym = new Map<string, NormTrade[]>();
  const sorted = [...fills].sort((a, b) => parseTs(a) - parseTs(b));
  for (const f of sorted) {
    if (!f.symbol || f.qty <= 0 || f.price <= 0) continue;
    if (!bySym.has(f.symbol)) bySym.set(f.symbol, []);
    bySym.get(f.symbol)!.push(f);
  }
  const trips: RoundTrip[] = [];
  let openLegs = 0;
  for (const [symbol, rows] of bySym) {
    // inventory of open lots: positive qty = long lots, negative = short lots
    const lots: { qty: number; price: number; ts: string; hasTime: boolean }[] = [];
    for (const f of rows) {
      let remaining = f.qty;
      const closingSide = f.side === 'SELL' ? 1 : -1; // SELL closes longs (+), BUY closes shorts (−)
      while (remaining > 0 && lots.length && Math.sign(lots[0].qty) === closingSide) {
        const lot = lots[0];
        const take = Math.min(remaining, Math.abs(lot.qty));
        const dir = lot.qty > 0 ? 'long' : 'short';
        const pnl = dir === 'long'
          ? (f.price - lot.price) * take
          : (lot.price - f.price) * take;
        const bothTimed = lot.hasTime && f.hasTime;
        trips.push({
          symbol, qty: take,
          entryPrice: lot.price, exitPrice: f.price,
          entryTs: lot.ts, exitTs: f.ts,
          pnl,
          holdMinutes: bothTimed
            ? Math.max((Date.parse(f.ts) - Date.parse(lot.ts)) / 60000, 0)
            : undefined,
          direction: dir,
        });
        remaining -= take;
        if (Math.abs(lot.qty) <= take) lots.shift();
        else lot.qty -= closingSide > 0 ? take : -take;
      }
      if (remaining > 0) {
        lots.push({
          qty: f.side === 'BUY' ? remaining : -remaining,
          price: f.price, ts: f.ts, hasTime: f.hasTime,
        });
      }
    }
    openLegs += lots.length;
  }
  trips.sort((a, b) => Date.parse(a.exitTs) - Date.parse(b.exitTs));
  return { trips, openLegs };
}

export function computeInsights(fills: NormTrade[]): Insights | { insufficient: string } {
  const { trips, openLegs } = pairTrades(fills);
  if (trips.length < MIN_TRIPS) {
    return {
      insufficient: `Only ${trips.length} completed round-trips found (need ${MIN_TRIPS}+). `
        + `${fills.length} fills pulled, ${openLegs} still-open position legs excluded — `
        + 'insights on open positions would be guesses.',
    };
  }
  const notes: string[] = [];
  const timed = trips.filter(t => t.holdMinutes != null);
  const timestampedShare = fills.length
    ? fills.filter(f => f.hasTime).length / fills.length : 0;

  // outcomes
  const wins = trips.filter(t => t.pnl > 0);
  const losses = trips.filter(t => t.pnl < 0);
  const totalPnl = trips.reduce((s, t) => s + t.pnl, 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

  // hold asymmetry — needs timestamps
  let holdAsymmetry: Insights['holdAsymmetry'];
  const timedWins = timed.filter(t => t.pnl > 0);
  const timedLosses = timed.filter(t => t.pnl < 0);
  if (timedWins.length >= 3 && timedLosses.length >= 3) {
    const aw = timedWins.reduce((s, t) => s + t.holdMinutes!, 0) / timedWins.length;
    const al = timedLosses.reduce((s, t) => s + t.holdMinutes!, 0) / timedLosses.length;
    holdAsymmetry = { avgWinHoldMin: aw, avgLossHoldMin: al, ratio: aw > 0 ? al / aw : 0 };
  } else {
    notes.push('Hold-time asymmetry needs 3+ timed wins and losses — '
      + (timestampedShare < 0.5 ? 'this broker reports most fills date-only.' : 'not enough timed round-trips yet.'));
  }

  // hourly buckets — needs timestamps
  let dangerHours: HourBucket[] | undefined;
  let bestHours: HourBucket[] | undefined;
  if (timed.length >= 10) {
    const buckets = new Map<number, { trades: number; pnl: number; wins: number }>();
    for (const t of timed) {
      const h = new Date(t.exitTs).getHours();
      const b = buckets.get(h) ?? { trades: 0, pnl: 0, wins: 0 };
      b.trades++; b.pnl += t.pnl; if (t.pnl > 0) b.wins++;
      buckets.set(h, b);
    }
    const rows: HourBucket[] = [...buckets.entries()]
      .filter(([, b]) => b.trades >= 3)
      .map(([hour, b]) => ({ hour, trades: b.trades, pnl: b.pnl, winRate: b.wins / b.trades }))
      .sort((a, b) => a.pnl - b.pnl);
    if (rows.length >= 2) {
      dangerHours = rows.filter(r => r.pnl < 0).slice(0, 3);
      bestHours = rows.filter(r => r.pnl > 0).slice(-3).reverse();
    }
  } else {
    notes.push('Danger-hour heatmap needs 10+ timed round-trips with 3+ per hour bucket.');
  }

  // revenge entries: new entry in the same symbol within N minutes of a loss
  let revenge: Insights['revenge'];
  if (timed.length >= 5) {
    const lossExits = timed.filter(t => t.pnl < 0)
      .map(t => ({ symbol: t.symbol, ms: Date.parse(t.exitTs) }));
    const rev = timed.filter(t => lossExits.some(l =>
      l.symbol === t.symbol
      && Date.parse(t.entryTs) > l.ms
      && Date.parse(t.entryTs) - l.ms <= REVENGE_WINDOW_MIN * 60000));
    if (rev.length) {
      revenge = {
        count: rev.length,
        pnl: rev.reduce((s, t) => s + t.pnl, 0),
        winRate: rev.filter(t => t.pnl > 0).length / rev.length,
        windowMin: REVENGE_WINDOW_MIN,
      };
    }
  }

  // overtrading bursts: N+ entries inside a rolling window
  let bursts: Insights['bursts'];
  const timedEntries = fills.filter(f => f.hasTime).map(parseTs).sort((a, b) => a - b);
  if (timedEntries.length >= BURST_N) {
    let count = 0, largest = 0;
    for (let i = 0; i + BURST_N - 1 < timedEntries.length; i++) {
      const span = timedEntries[i + BURST_N - 1] - timedEntries[i];
      if (span <= BURST_WINDOW_MIN * 60000) {
        count++;
        let j = i + BURST_N - 1;
        while (j + 1 < timedEntries.length
          && timedEntries[j + 1] - timedEntries[i] <= BURST_WINDOW_MIN * 60000) j++;
        largest = Math.max(largest, j - i + 1);
      }
    }
    if (count) bursts = { count, largest, windowMin: BURST_WINDOW_MIN };
  }

  // streaks (chronological by exit)
  let cur = 0, maxW = 0, maxL = 0;
  for (const t of trips) {
    if (t.pnl > 0) { cur = cur > 0 ? cur + 1 : 1; maxW = Math.max(maxW, cur); }
    else if (t.pnl < 0) { cur = cur < 0 ? cur - 1 : -1; maxL = Math.max(maxL, -cur); }
  }

  // per-symbol attribution
  const symMap = new Map<string, SymbolStat & { holdSum: number; holdN: number }>();
  for (const t of trips) {
    const s = symMap.get(t.symbol)
      ?? { symbol: t.symbol, trades: 0, wins: 0, pnl: 0, winRate: 0, holdSum: 0, holdN: 0 };
    s.trades++; s.pnl += t.pnl; if (t.pnl > 0) s.wins++;
    if (t.holdMinutes != null) { s.holdSum += t.holdMinutes; s.holdN++; }
    symMap.set(t.symbol, s);
  }
  const bySymbol: SymbolStat[] = [...symMap.values()].map(s => ({
    symbol: s.symbol, trades: s.trades, wins: s.wins, pnl: s.pnl,
    winRate: s.wins / s.trades,
    avgHoldMin: s.holdN ? s.holdSum / s.holdN : undefined,
  })).sort((a, b) => b.pnl - a.pnl);
  const edge = bySymbol.filter(s => s.pnl > 0 && s.trades >= 2);
  const leak = bySymbol.filter(s => s.pnl < 0 && s.trades >= 2).reverse();

  // weekday split — works with date-only data
  let byWeekday: Insights['byWeekday'];
  const wd = new Map<number, { trades: number; pnl: number; wins: number }>();
  for (const t of trips) {
    const d = new Date(t.exitTs).getDay();
    const b = wd.get(d) ?? { trades: 0, pnl: 0, wins: 0 };
    b.trades++; b.pnl += t.pnl; if (t.pnl > 0) b.wins++;
    wd.set(d, b);
  }
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const wdRows = [...wd.entries()]
    .filter(([, b]) => b.trades >= 3)
    .map(([d, b]) => ({ day: dayNames[d], trades: b.trades, pnl: b.pnl, winRate: b.wins / b.trades }))
    .sort((a, b) => a.pnl - b.pnl);
  if (wdRows.length >= 2) byWeekday = wdRows;

  const tsSorted = fills.map(f => f.ts).filter(Boolean).sort();
  const winRate = trips.length ? wins.length / trips.length : 0;
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : undefined;
  const edgePnl = edge.reduce((s, x) => s + x.pnl, 0);
  const leakPnl = leak.reduce((s, x) => s + x.pnl, 0);

  // ── discipline score (0–100), the app's process-first lens ─────────────────
  // Rewards behavior, not luck: R:R capture, cutting losers, avoiding revenge,
  // not overtrading, not bleeding in one leak symbol.
  const scoreParts: Insights['scoreParts'] = [];
  const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

  const rr = profitFactor ?? (grossLoss === 0 ? 2 : 0);
  const rrScore = clamp((rr / 2) * 25);
  scoreParts.push({ label: 'Risk / reward', score: Math.round(rrScore), max: 25,
    note: profitFactor != null ? `profit factor ${profitFactor.toFixed(2)}` : 'no losses in window' });

  let cutScore = 20;
  if (holdAsymmetry) {
    cutScore = clamp(25 - Math.max(holdAsymmetry.ratio - 1, 0) * 12, 0, 25);
    scoreParts.push({ label: 'Cutting losers', score: Math.round(cutScore), max: 25,
      note: `losers held ${holdAsymmetry.ratio.toFixed(1)}× winners` });
  } else {
    scoreParts.push({ label: 'Cutting losers', score: 18, max: 25, note: 'no intraday times to judge holds' });
    cutScore = 18;
  }

  let revScore = 25;
  if (revenge) {
    revScore = clamp(25 - revenge.count * 3 - (revenge.pnl < 0 ? 8 : 0), 0, 25);
  }
  scoreParts.push({ label: 'No revenge trading', score: Math.round(revScore), max: 25,
    note: revenge ? `${revenge.count} revenge entries` : 'none detected' });

  const overtradePenalty = bursts ? Math.min(bursts.count * 3, 15) : 0;
  const concentration = leakPnl < 0 && totalPnl !== 0 ? Math.min(Math.abs(leakPnl) / (Math.abs(totalPnl) + Math.abs(leakPnl)) * 25, 25) : 0;
  const behaveScore = clamp(25 - overtradePenalty - concentration * 0.4);
  scoreParts.push({ label: 'Consistency', score: Math.round(behaveScore), max: 25,
    note: bursts ? `${bursts.count} overtrading burst(s)` : 'steady cadence' });

  const disciplineScore = Math.round(rrScore + cutScore + revScore + behaveScore);

  // ── narrative debrief — synthesized from the real signals ──────────────────
  const wentWell: string[] = [];
  const leaks: string[] = [];
  const money = (v: number) => `${v < 0 ? '−' : ''}₹${Math.abs(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  if (winRate >= 0.5) wentWell.push(`Win rate ${Math.round(winRate * 100)}% across ${trips.length} closed trades.`);
  if (profitFactor && profitFactor >= 1.3) wentWell.push(`Profit factor ${profitFactor.toFixed(2)} — winners meaningfully outrun losers.`);
  if (edge.length) wentWell.push(`${edge[0].symbol} is your standout: ${money(edge[0].pnl)} over ${edge[0].trades} trades.`);
  if (holdAsymmetry && holdAsymmetry.ratio <= 1.2) wentWell.push('You cut losers about as fast as winners — no disposition drag.');
  if (!wentWell.length) wentWell.push(`You closed ${trips.length} round-trips in the window — enough to read the patterns below.`);

  if (holdAsymmetry && holdAsymmetry.ratio > 1.5) leaks.push(`You hold losers ${holdAsymmetry.ratio.toFixed(1)}× longer than winners (${Math.round(holdAsymmetry.avgLossHoldMin)}m vs ${Math.round(holdAsymmetry.avgWinHoldMin)}m) — the disposition effect.`);
  if (revenge && revenge.pnl < 0) leaks.push(`${revenge.count} revenge entries within ${revenge.windowMin}m of a loss cost ${money(revenge.pnl)}.`);
  if (leak.length) leaks.push(`${leak[0].symbol} is your biggest leak: ${money(leak[0].pnl)} over ${leak[0].trades} trades.`);
  if (dangerHours && dangerHours.length) leaks.push(`Your worst window is ${String(dangerHours[0].hour).padStart(2, '0')}:00–${String(dangerHours[0].hour + 1).padStart(2, '0')}:00 (${money(dangerHours[0].pnl)}).`);
  if (bursts && bursts.count > 1) leaks.push(`${bursts.count} overtrading bursts — up to ${bursts.largest} orders inside ${bursts.windowMin} minutes.`);
  if (!leaks.length) leaks.push('No structural leak stands out in this window — a clean book.');

  const summary = totalPnl >= 0
    ? `Net ${money(totalPnl)} over ${trips.length} closed trades, discipline ${disciplineScore}/100. `
      + (leakPnl < 0 ? `Your edge earned ${money(edgePnl)} while a leak returned ${money(leakPnl)} of it.` : 'The book is broadly clean.')
    : `Net ${money(totalPnl)} over ${trips.length} closed trades, discipline ${disciplineScore}/100 — the leaks below are where it went.`;

  const focus = leaks[0]?.startsWith('You hold losers')
    ? 'Set and honor a time-stop: cut losers at the pace you cut winners.'
    : revenge && revenge.pnl < 0
      ? 'Impose a cooldown after any loss — the revenge re-entries are the clearest fixable leak.'
      : dangerHours && dangerHours.length
        ? `Sit out ${String(dangerHours[0].hour).padStart(2, '0')}:00–${String(dangerHours[0].hour + 1).padStart(2, '0')}:00 for two weeks and re-measure.`
        : leak.length
          ? `Cut size (or stop) on ${leak[0].symbol} until the process there improves.`
          : 'Keep the process; size up where your edge is proven.';

  // ── ghost trade: the rule-following self, from their own fills ─────────────
  // Two concrete disciplines applied counterfactually (no future prices, no
  // guessing about unrealized upside — only realized numbers):
  //   1. cap every loss at the trader's own average winning size (1:1 risk)
  //   2. skip revenge entries (already flagged from the data)
  const avgWinAbs = wins.length ? grossWin / wins.length : 0;
  const revengeSet = new Set<string>();
  if (revenge) {
    const lossExits = timed.filter(t => t.pnl < 0).map(t => ({ symbol: t.symbol, ms: Date.parse(t.exitTs) }));
    for (const t of timed) {
      if (lossExits.some(l => l.symbol === t.symbol
        && Date.parse(t.entryTs) > l.ms
        && Date.parse(t.entryTs) - l.ms <= REVENGE_WINDOW_MIN * 60000)) {
        revengeSet.add(`${t.symbol}|${t.entryTs}|${t.exitTs}`);
      }
    }
  }
  let ghostPnl = 0, cappedCount = 0, cappedRecovered = 0, skippedRevengeCount = 0, skippedRevengePnl = 0;
  for (const t of trips) {
    const id = `${t.symbol}|${t.entryTs}|${t.exitTs}`;
    if (revengeSet.has(id)) { skippedRevengeCount++; skippedRevengePnl += t.pnl; continue; } // ghost never takes it
    if (t.pnl < 0 && avgWinAbs > 0 && Math.abs(t.pnl) > avgWinAbs) {
      cappedCount++;
      cappedRecovered += Math.abs(t.pnl) - avgWinAbs;
      ghostPnl += -avgWinAbs;                 // disciplined stop at 1:1
    } else {
      ghostPnl += t.pnl;
    }
  }
  const ghostGap = ghostPnl - totalPnl;
  const ghost = {
    actualPnl: totalPnl, ghostPnl, gap: ghostGap,
    cappedLosers: { count: cappedCount, recovered: cappedRecovered },
    skippedRevenge: { count: skippedRevengeCount, recovered: -skippedRevengePnl },
    explanation:
      'Your rule-following self caps every loss at the size of your average winner '
      + '(1:1 risk) and skips revenge re-entries. Both are computed from your own '
      + 'realized trades — no future prices assumed.',
  };

  // ── compounding: the gap at the observed rate (honest extrapolation) ───────
  let compounding: Insights['compounding'] = null;
  const dFrom = tsSorted[0] ? Date.parse(tsSorted[0]) : NaN;
  const dTo = tsSorted[tsSorted.length - 1] ? Date.parse(tsSorted[tsSorted.length - 1]) : NaN;
  const windowDays = Number.isFinite(dFrom) && Number.isFinite(dTo)
    ? Math.max((dTo - dFrom) / 86400000, 1) : 0;
  if (windowDays >= 5 && ghostGap > 0) {
    const perDay = ghostGap / windowDays;
    compounding = {
      windowDays: Math.round(windowDays),
      perMonth: perDay * 30, perQuarter: perDay * 91, perYear: perDay * 365,
    };
  }

  return {
    fills: fills.length, roundTrips: trips.length, openLegs,
    from: tsSorted[0]?.slice(0, 10), to: tsSorted[tsSorted.length - 1]?.slice(0, 10),
    timestampedShare,
    totalPnl,
    wins: wins.length, losses: losses.length,
    winRate,
    avgWin: wins.length ? grossWin / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    profitFactor,
    maxWin: wins.length ? wins.reduce((a, b) => (a.pnl > b.pnl ? a : b)) : null,
    maxLoss: losses.length ? losses.reduce((a, b) => (a.pnl < b.pnl ? a : b)) : null,
    holdAsymmetry, dangerHours, bestHours, revenge, bursts,
    streaks: { maxWinStreak: maxW, maxLossStreak: maxL, current: cur },
    bySymbol, edge, leak, edgePnl, leakPnl,
    byWeekday,
    disciplineScore, scoreParts,
    debrief: { summary, wentWell, leaks, focus },
    ghost, compounding,
    notes,
  };
}
