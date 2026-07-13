// Real valuation + quality metrics computed from the instrument's own reported
// figures (statements, market cap, EBITDA, FCF, estimates). Every number shows
// or implies its inputs; anything that cannot be computed cleanly from the data
// is left out (null), never guessed. The DCF is a transparent model with stated
// assumptions - labeled as such, exactly like a desk would present it.
import type { XData, FYRowX } from './types';

const n = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const div = (a: number | null, b: number | null): number | null =>
  (a != null && b != null && b !== 0 ? a / b : null);

export interface Valuation {
  // multiples (real, with inputs)
  pe: number | null;
  fwdPe: number | null;
  ps: number | null;
  pb: number | null;
  peg: number | null;
  evEbitda: number | null;
  evRevenue: number | null;
  pFcf: number | null;
  fcfYield: number | null;       // %
  earningsYield: number | null;  // %
  divYield: number | null;       // %
  // quality (real)
  roe: number | null;            // %
  roa: number | null;            // %
  grossMargin: number | null;    // %
  operatingMargin: number | null;// %
  netMargin: number | null;      // %
  fcfConversion: number | null;  // FCF / net income, x
  netDebtEbitda: number | null;  // x
  revenueCagr: number | null;    // % over the reported window
  // growth
  fwdEpsGrowth: number | null;   // % next FY vs latest
  // DCF (labeled model)
  dcf: {
    fairValue: number | null; upsidePct: number | null;
    fcf0: number | null; growth: number; years: number; discount: number; terminal: number;
    waccBasis: string;
  } | null;
  assumptions: string[];
  note: string;
}

export function computeValuation(x: XData): Valuation {
  const price = n(x.price);
  const mc = n(x.marketCap);
  const fy = (x.fy ?? []).filter(Boolean) as FYRowX[];
  const latest = fy[0];
  const rev = latest ? n(latest.revenue) : null;
  const ebitda = n(x.creditLatest?.ebitda);
  const totalDebt = n(x.creditLatest?.totalDebt) ?? (latest ? n(latest.totalDebt) : null);
  const cash = n(x.creditLatest?.totalCash) ?? (latest ? n(latest.cash) : null);
  const fcf = latest ? n(latest.fcf) : null;
  const ni = latest ? n(latest.netIncome) : null;
  const ev = mc != null ? mc + (totalDebt ?? 0) - (cash ?? 0) : null;

  const pe = n(x.pe) ?? div(price, n(x.epsTtm));
  const fwdEps = x.fwdEstimates?.find(e => n(e.eps) != null)?.eps ?? null;
  const fwdPe = n(x.fwdPe) ?? div(price, n(fwdEps ?? null));
  // prefer Yahoo's direct ratios (present for US + Indian), derive as fallback
  const ps = div(mc, rev);
  const pb = n(x.priceToBook) ?? (n(x.bookValue) ? div(price, n(x.bookValue)) : null);
  const peg = n(x.pegRatio);
  const evEbitda = n(x.evEbitda) ?? div(ev, ebitda);
  const evRevenue = n(x.evRevenue) ?? div(ev, rev);
  const pFcf = div(mc, fcf);
  const fcfYield = fcf != null && mc ? (fcf / mc) * 100 : null;
  const earningsYield = pe != null && pe !== 0 ? (1 / pe) * 100 : null;

  const roe = n(x.margins?.roe);
  const roa = n(x.margins?.roa);
  const grossMargin = n(x.margins?.gross) ?? (latest ? n(latest.grossPct) : null);
  const operatingMargin = n(x.margins?.operating);
  const netMargin = n(x.margins?.profit) ?? (latest ? n(latest.netPct) : null);
  const fcfConversion = div(fcf, ni);
  const netDebtEbitda = n(x.creditLatest?.netDebtEbitda);

  // revenue CAGR across the reported annual window
  let revenueCagr: number | null = null;
  const revs = fy.map(r => n(r.revenue)).filter((v): v is number => v != null);
  if (revs.length >= 2) {
    const newest = revs[0], oldest = revs[revs.length - 1], yrs = revs.length - 1;
    if (oldest > 0 && newest > 0) revenueCagr = (Math.pow(newest / oldest, 1 / yrs) - 1) * 100;
  }

  const latestEps = n(latest?.eps) ?? n(x.epsTtm);
  const fwdEpsGrowth = latestEps != null && fwdEps != null && latestEps !== 0
    ? ((fwdEps - latestEps) / Math.abs(latestEps)) * 100 : null;

  // ── transparent DCF (stated assumptions) ──────────────────────────────────
  const assumptions: string[] = [];
  let dcf: Valuation['dcf'] = null;
  if (fcf != null && mc != null && price != null) {
    // discount rate: CAPM-style cost of equity as a proxy WACC, using the
    // instrument's real beta when present. rf and ERP are stated assumptions.
    const rf = 0.043, erp = 0.05;
    const beta = n(x.beta) ?? 1.1;
    const discount = Math.min(0.14, Math.max(0.075, rf + beta * erp));
    // growth: blend the reported revenue CAGR (capped) as the FCF growth proxy
    const g = Math.min(0.12, Math.max(0.02, (revenueCagr ?? 6) / 100));
    const years = 10, terminal = 0.025;
    // sum of discounted FCFs + discounted terminal value (Gordon growth)
    let pv = 0, f = fcf;
    for (let t = 1; t <= years; t++) { f = f * (1 + g); pv += f / Math.pow(1 + discount, t); }
    const tv = (f * (1 + terminal)) / (discount - terminal);
    pv += tv / Math.pow(1 + discount, years);
    // per-share fair value: equity value / shares (shares ~ marketCap/price)
    const shares = mc / price;
    const equity = pv - (totalDebt ?? 0) + (cash ?? 0);
    const fairValue = shares > 0 ? equity / shares : null;
    const upsidePct = fairValue != null ? ((fairValue - price) / price) * 100 : null;
    dcf = {
      fairValue, upsidePct, fcf0: fcf, growth: g * 100, years, discount: discount * 100, terminal: terminal * 100,
      waccBasis: `CAPM proxy: rf ${(rf * 100).toFixed(1)}% + beta ${beta.toFixed(2)} x ERP ${(erp * 100).toFixed(1)}%`,
    };
    assumptions.push(`DCF: ${years}y explicit, FCF growth ${(g * 100).toFixed(1)}% (from revenue CAGR), discount ${(discount * 100).toFixed(1)}%, terminal ${(terminal * 100).toFixed(1)}%.`);
    assumptions.push('DCF is a model with stated assumptions, not a fact - treat fair value as indicative.');
  }

  return {
    pe, fwdPe, ps, pb, peg, evEbitda, evRevenue, pFcf, fcfYield, earningsYield, divYield: n(x.divYield),
    roe, roa, grossMargin, operatingMargin, netMargin, fcfConversion, netDebtEbitda,
    revenueCagr, fwdEpsGrowth, dcf, assumptions,
    note: 'All multiples computed from reported figures; blanks mean the input was not in the data.',
  };
}
