// Model-accuracy engine - REAL, out-of-sample, honest. Every metric is
// computed from the user's own data (or a real held-out backtest), gated on
// sample size, and returns `null` + a note when there isn't enough to be
// honest. Nothing here invents a number. Investors see the average of these
// across users; each user sees their own.
//
// Four models are scored, each with a ground-truth check:
//   1. Kronos forecast - walk-forward backtest: predicted vs ACTUAL prices
//                          (directional hit-rate + MAPE) on held-out candles.
//   2. Behavioral thesis - do the trades the app calls "disciplined" actually
//                          earn more than the ones it flags? (expectancy lift)
//   3. Debrief claims - derive the debrief on the FIRST half of trades,
//                          test each claim on the SECOND half (out-of-sample).
//   4. Ghost trade - are the counterfactual's assumptions (revenge is
//                          worse, oversized losers exist) borne out in reality?
import type { NormTrade } from './types';
import { pairTrades, computeInsights, type RoundTrip } from './engine';

const REVENGE_WINDOW_MIN = 30;
const MIN_TRIPS_VALIDITY = 8;   // behavioral lift needs a handful each side
const MIN_TRIPS_SPLIT = 12;     // out-of-sample split needs enough per half
const MIN_BACKTEST_WINDOWS = 5; // Kronos needs several held-out windows

const ms = (t: string) => { const v = Date.parse(t); return Number.isFinite(v) ? v : 0; };
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// ── trip classification (matches the engine's discipline lens) ───────────────

export interface TripClass {
  trip: RoundTrip;
  isRevenge: boolean;         // entered soon after a realized loss
  isOversizedLoser: boolean;  // a loss larger than the average win
  disciplined: boolean;
}

/** Label each round-trip as disciplined or not, exactly on the two levers the
 *  ghost uses: revenge entries and oversized losers. Pure, deterministic. */
export function classifyTrips(trips: RoundTrip[]): TripClass[] {
  const sorted = [...trips].sort((a, b) => ms(a.entryTs) - ms(b.entryTs));
  const wins = sorted.filter(t => t.pnl > 0).map(t => t.pnl);
  const avgWin = wins.length ? mean(wins) : 0;

  return sorted.map((trip, i) => {
    const entry = ms(trip.entryTs);
    let isRevenge = false;
    // revenge: a prior trip that LOST and exited within the window before this entry
    for (let j = 0; j < i; j++) {
      const p = sorted[j];
      if (p.pnl >= 0) continue;
      const gap = entry - ms(p.exitTs);
      if (gap >= 0 && gap <= REVENGE_WINDOW_MIN * 60_000) { isRevenge = true; break; }
    }
    const isOversizedLoser = trip.pnl < 0 && avgWin > 0 && Math.abs(trip.pnl) > avgWin;
    return { trip, isRevenge, isOversizedLoser, disciplined: !isRevenge && !isOversizedLoser };
  });
}

// ── 2. Behavioral validity - does "disciplined" actually pay? ────────────────

export interface BehavioralValidity {
  n: number;
  disciplinedTrips: number;
  flaggedTrips: number;
  disciplinedExpectancy: number;   // mean P&L per disciplined trip
  flaggedExpectancy: number;       // mean P&L per flagged trip
  lift: number;                    // disciplined − flagged (currency per trip)
  holds: boolean;                  // thesis confirmed on this user's data
  note: string;
}

export function behavioralValidity(trips: RoundTrip[]): BehavioralValidity | null {
  const cls = classifyTrips(trips);
  const disc = cls.filter(c => c.disciplined).map(c => c.trip.pnl);
  const flag = cls.filter(c => !c.disciplined).map(c => c.trip.pnl);
  if (disc.length < 3 || flag.length < 3 || cls.length < MIN_TRIPS_VALIDITY) return null;
  const de = mean(disc), fe = mean(flag);
  return {
    n: cls.length,
    disciplinedTrips: disc.length,
    flaggedTrips: flag.length,
    disciplinedExpectancy: de,
    flaggedExpectancy: fe,
    lift: de - fe,
    holds: de > fe,
    note: `Disciplined trips averaged ${de.toFixed(2)} vs ${fe.toFixed(2)} for flagged trips.`,
  };
}

// ── 3. Debrief accuracy - derive on first half, test on second half ──────────

export interface ClaimCheck {
  claim: string;
  predicted: string;
  observed: string;
  holds: boolean;
}
export interface DebriefAccuracy {
  checks: ClaimCheck[];
  held: number;
  total: number;
  accuracy: number;   // fraction of first-half claims that held out-of-sample
  note: string;
}

/** Split fills chronologically; build claims from the first half, verify each
 *  on the unseen second half. This is a true out-of-sample test - no claim is
 *  graded against the data that produced it. */
export function debriefAccuracy(fills: NormTrade[]): DebriefAccuracy | null {
  const byTime = [...fills].sort((a, b) => ms(a.ts) - ms(b.ts));
  const { trips } = pairTrades(byTime);
  if (trips.length < MIN_TRIPS_SPLIT) return null;

  // split on trip midpoint, mapped back to the fills that compose each half
  const mid = byTime[Math.floor(byTime.length / 2)];
  const midMs = ms(mid.ts);
  const first = byTime.filter(f => ms(f.ts) <= midMs);
  const second = byTime.filter(f => ms(f.ts) > midMs);

  const a = computeInsights(first);
  const b = computeInsights(second);
  if ('insufficient' in a || 'insufficient' in b) return null;

  const checks: ClaimCheck[] = [];

  // claim A: disposition effect (holds losers longer than winners)
  if (a.holdAsymmetry && b.holdAsymmetry) {
    const predicted = a.holdAsymmetry.ratio > 1;
    const observed = b.holdAsymmetry.ratio > 1;
    if (predicted) checks.push({
      claim: 'Holds losers longer than winners (disposition effect)',
      predicted: `ratio ${a.holdAsymmetry.ratio.toFixed(2)}`,
      observed: `ratio ${b.holdAsymmetry.ratio.toFixed(2)}`,
      holds: observed,
    });
  }

  // claim B: revenge trades underperform
  if (a.revenge && a.revenge.count > 0) {
    const bc = classifyTrips(pairTrades(second).trips);
    const rev = bc.filter(c => c.isRevenge).map(c => c.trip.pnl);
    const non = bc.filter(c => !c.isRevenge).map(c => c.trip.pnl);
    if (rev.length && non.length) checks.push({
      claim: 'Revenge entries underperform normal entries',
      predicted: `first-half revenge win-rate ${(a.revenge.winRate * 100).toFixed(0)}%`,
      observed: `second-half revenge avg ${mean(rev).toFixed(2)} vs ${mean(non).toFixed(2)}`,
      holds: mean(rev) < mean(non),
    });
  }

  // claim C: danger hours stay danger hours
  if (a.dangerHours?.length && b.byWeekday) {
    const dh = new Set(a.dangerHours.map(h => h.hour));
    const secondByHour = new Map<number, number[]>();
    const bt = pairTrades(second).trips;
    for (const t of bt) {
      const h = new Date(ms(t.exitTs)).getUTCHours();
      if (!secondByHour.has(h)) secondByHour.set(h, []);
      secondByHour.get(h)!.push(t.pnl);
    }
    const overall = mean(bt.map(t => t.pnl));
    let hourChecks = 0, hourHeld = 0;
    for (const h of dh) {
      const bucket = secondByHour.get(h);
      if (bucket && bucket.length >= 2) { hourChecks++; if (mean(bucket) < overall) hourHeld++; }
    }
    if (hourChecks > 0) checks.push({
      claim: 'Flagged danger hours keep losing',
      predicted: `${dh.size} danger hour(s) in first half`,
      observed: `${hourHeld}/${hourChecks} still below-average in second half`,
      holds: hourHeld > hourChecks / 2,
    });
  }

  if (!checks.length) return null;
  const held = checks.filter(c => c.holds).length;
  return {
    checks, held, total: checks.length,
    accuracy: held / checks.length,
    note: `${held} of ${checks.length} first-half findings held on unseen later trades.`,
  };
}

// ── 4. Ghost validity - are the counterfactual's assumptions real? ───────────

export interface GhostValidity {
  revengeWorse: boolean;              // revenge expectancy < non-revenge
  revengeExpectancyGap: number;      // non-revenge mean − revenge mean
  oversizedLosersExist: boolean;     // there ARE losses bigger than avg win
  oversizedLoserCount: number;
  assumptionsHeld: number;
  assumptionsTotal: number;
  validity: number;                  // fraction of assumptions borne out
  note: string;
}

/** The ghost caps losers at avg-win size and skips revenge entries. Those two
 *  moves only make sense if, in the user's REAL data, revenge is actually worse
 *  and oversized losers actually occur. Verify both - no hindsight on outcomes. */
export function ghostValidity(trips: RoundTrip[]): GhostValidity | null {
  if (trips.length < MIN_TRIPS_VALIDITY) return null;
  const cls = classifyTrips(trips);
  const rev = cls.filter(c => c.isRevenge).map(c => c.trip.pnl);
  const non = cls.filter(c => !c.isRevenge).map(c => c.trip.pnl);
  const oversized = cls.filter(c => c.isOversizedLoser);

  const assumptions: { ok: boolean }[] = [];
  const revengeWorse = rev.length > 0 && non.length > 0 && mean(rev) < mean(non);
  if (rev.length > 0) assumptions.push({ ok: revengeWorse });
  const oversizedLosersExist = oversized.length > 0;
  assumptions.push({ ok: oversizedLosersExist });

  if (!assumptions.length) return null;
  const held = assumptions.filter(a => a.ok).length;
  return {
    revengeWorse,
    revengeExpectancyGap: rev.length && non.length ? mean(non) - mean(rev) : 0,
    oversizedLosersExist,
    oversizedLoserCount: oversized.length,
    assumptionsHeld: held,
    assumptionsTotal: assumptions.length,
    validity: held / assumptions.length,
    note: `${held}/${assumptions.length} ghost assumptions confirmed on real trades.`,
  };
}

// ── 1. Kronos backtest - walk-forward, predicted vs ACTUAL ───────────────────

export interface KronosBacktest {
  windows: number;
  directionalAccuracy: number;  // fraction of correct up/down calls at horizon
  mape: number;                 // mean abs % error across all predicted points
  note: string;
}
export type ForecastFn = (closes: number[], horizon: number) => Promise<number[] | null>;

/** Walk forward over a real price history: at each step forecast the next
 *  `horizon` closes from only the past, then score against the actual future
 *  closes that the model never saw. Fully out-of-sample. */
export async function kronosBacktest(
  closes: number[], horizon: number, forecast: ForecastFn,
  opts: { minHistory?: number; step?: number } = {},
): Promise<KronosBacktest | null> {
  const minHistory = opts.minHistory ?? 60;
  const step = opts.step ?? Math.max(1, Math.floor(horizon / 2));
  if (closes.length < minHistory + horizon + MIN_BACKTEST_WINDOWS) return null;

  const dirHits: number[] = [];
  const apes: number[] = [];
  let windows = 0;

  for (let k = minHistory; k + horizon <= closes.length; k += step) {
    const past = closes.slice(0, k);
    const actual = closes.slice(k, k + horizon);
    const f = await forecast(past, horizon);
    if (!f || f.length < horizon) continue;
    windows++;
    const base = past[past.length - 1];
    const predDir = Math.sign(f[horizon - 1] - base);
    const actDir = Math.sign(actual[horizon - 1] - base);
    if (predDir !== 0) dirHits.push(predDir === actDir ? 1 : 0);
    for (let i = 0; i < horizon; i++) {
      if (actual[i] !== 0) apes.push(Math.abs(f[i] - actual[i]) / Math.abs(actual[i]));
    }
  }
  if (windows < MIN_BACKTEST_WINDOWS) return null;
  return {
    windows,
    directionalAccuracy: dirHits.length ? mean(dirHits) : 0,
    mape: apes.length ? mean(apes) * 100 : 0,
    note: `${windows} walk-forward windows; ${dirHits.length} directional calls scored.`,
  };
}

// ── composite per-user report ────────────────────────────────────────────────

export interface AccuracyReport {
  kronos: KronosBacktest | null;
  behavioral: BehavioralValidity | null;
  debrief: DebriefAccuracy | null;
  ghost: GhostValidity | null;
  overall: number | null;   // mean of available sub-scores, 0..1 - labeled composite
  covered: string[];        // which models actually had enough data to score
  notes: string[];
}

/** Assemble the per-user report. `overall` averages only the sub-scores that
 *  are real (enough data); models without data are omitted, never zero-filled. */
export function accuracyReport(
  fills: NormTrade[],
  kronos: KronosBacktest | null = null,
): AccuracyReport {
  const { trips } = pairTrades([...fills].sort((a, b) => ms(a.ts) - ms(b.ts)));
  const behavioral = behavioralValidity(trips);
  const debrief = debriefAccuracy(fills);
  const ghost = ghostValidity(trips);

  const parts: number[] = [];
  const covered: string[] = [];
  const notes: string[] = [];

  if (kronos) { parts.push(kronos.directionalAccuracy); covered.push('kronos'); }
  else notes.push('Kronos backtest not run (needs a price history).');

  if (behavioral) { parts.push(behavioral.holds ? 1 : 0); covered.push('behavioral'); }
  else notes.push('Behavioral validity needs more trades (≥8, with both disciplined and flagged).');

  if (debrief) { parts.push(debrief.accuracy); covered.push('debrief'); }
  else notes.push('Debrief accuracy needs ≥12 round trips to split out-of-sample.');

  if (ghost) { parts.push(ghost.validity); covered.push('ghost'); }
  else notes.push('Ghost validity needs ≥8 round trips.');

  return {
    kronos, behavioral, debrief, ghost,
    overall: parts.length ? mean(parts) : null,
    covered, notes,
  };
}

// ── fleet average across users (for the investor view) ───────────────────────

export interface FleetAccuracy {
  users: number;
  kronosDirectionalAccuracy: number | null;
  kronosMape: number | null;
  behavioralHoldRate: number | null;     // share of users where the thesis held
  debriefAccuracy: number | null;
  ghostValidity: number | null;
  overall: number | null;
  note: string;
}

/** Average the real per-user reports. Each field averages only over users that
 *  actually had that model scored - no user is counted where the data was thin. */
export function fleetAccuracy(reports: AccuracyReport[]): FleetAccuracy {
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const kd = reports.map(r => r.kronos?.directionalAccuracy).filter((v): v is number => v != null);
  const km = reports.map(r => r.kronos?.mape).filter((v): v is number => v != null);
  const bh = reports.map(r => r.behavioral?.holds).filter((v): v is boolean => v != null).map(v => (v ? 1 : 0));
  const da = reports.map(r => r.debrief?.accuracy).filter((v): v is number => v != null);
  const gv = reports.map(r => r.ghost?.validity).filter((v): v is number => v != null);
  const ov = reports.map(r => r.overall).filter((v): v is number => v != null);
  return {
    users: reports.length,
    kronosDirectionalAccuracy: avg(kd),
    kronosMape: avg(km),
    behavioralHoldRate: avg(bh),
    debriefAccuracy: avg(da),
    ghostValidity: avg(gv),
    overall: avg(ov),
    note: `Averaged over ${reports.length} user report(s); each metric counts only users with enough data.`,
  };
}
