// Analyst answerer: computes answers from the loaded instrument's REAL data
// (XData from the live feed), citing the figures used. Questions whose
// underlying data is missing get an honest "not available", never a guess.
// With VITE_CHAT_ENDPOINT set, questions go to a real LLM backend instead.
import { XData } from './types';

export interface Answer { text: string; sources: string[] }

const f = (v: number, d = 1) => v.toFixed(d);
const pct = (v: number, d = 1) => `${v >= 0 ? '+' : ''}${v.toFixed(d)}%`;
const big = (v: number, cur: string) => {
  const sym = cur === 'INR' ? '₹' : cur === 'USD' ? '$' : `${cur} `;
  const a = Math.abs(v);
  if (a >= 1e12) return `${sym}${(v / 1e12).toFixed(2)}T`;
  if (a >= 1e9) return `${sym}${(v / 1e9).toFixed(1)}B`;
  if (a >= 1e7 && cur === 'INR') return `${sym}${(v / 1e7).toFixed(1)}Cr`;
  if (a >= 1e6) return `${sym}${(v / 1e6).toFixed(1)}M`;
  return `${sym}${v.toFixed(0)}`;
};

const NA = (what: string): Answer => ({
  text: `${what} isn't available from the data source for this instrument — nothing to compute from, so no answer rather than a guess.`,
  sources: [],
});

export function answer(q: string, x: XData): Answer {
  const s = q.toLowerCase();
  const cur = x.currency;

  if (/(revenue|sales|top ?line)/.test(s)) {
    const fy = x.fy?.filter(r => r.revenue != null) ?? [];
    if (!fy.length) return NA('Revenue history');
    const latest = fy[0];
    const lines = fy.slice(0, 4).map(r =>
      `${r.label}: ${big(r.revenue!, cur)}${r.revenueG != null ? ` (${pct(r.revenueG)})` : ''}`);
    const qLatest = x.quarterly?.find(r => r.revenue != null);
    return {
      text: `${x.symbol} revenue — FY${latest.label}: ${big(latest.revenue!, cur)}${latest.revenueG != null ? `, ${pct(latest.revenueG)} YoY` : ''}.` +
        (qLatest ? ` Latest quarter (${qLatest.label}): ${big(qLatest.revenue!, cur)}${qLatest.grossPct != null ? `, gross margin ${f(qLatest.grossPct)}%` : ''}.` : ''),
      sources: lines,
    };
  }
  if (/(margin|profitab)/.test(s)) {
    const m = x.margins;
    if (!m || (m.gross == null && m.operating == null && m.profit == null)) return NA('Margin data');
    const parts: string[] = [];
    if (m.gross != null) parts.push(`gross ${f(m.gross)}%`);
    if (m.operating != null) parts.push(`operating ${f(m.operating)}%`);
    if (m.profit != null) parts.push(`net ${f(m.profit)}%`);
    if (m.fcfMargin != null) parts.push(`FCF ${f(m.fcfMargin)}%`);
    return {
      text: `${x.symbol} trailing-twelve-month margins: ${parts.join(', ')}.` +
        (m.roe != null ? ` Return on equity ${f(m.roe)}%.` : ''),
      sources: parts.map(p => `financialData (TTM) — ${p}`),
    };
  }
  if (/(eps|earnings per|beat|miss|surprise)/.test(s)) {
    const eh = x.epsHistory?.filter(e => e.est != null && e.actual != null) ?? [];
    if (!eh.length) return NA('EPS estimate history');
    const beats = eh.filter(e => e.actual! >= e.est!).length;
    const lastE = eh[eh.length - 1];
    return {
      text: `${x.symbol} beat EPS estimates in ${beats} of the last ${eh.length} reported quarters. Most recent: actual ${f(lastE.actual!, 2)} vs ${f(lastE.est!, 2)} est${lastE.surprisePct != null ? ` (${pct(lastE.surprisePct)} surprise)` : ''}.` +
        (x.nextEarnings ? ` Next report: ${x.nextEarnings}.` : ''),
      sources: eh.map(e => `${e.quarter}: est ${f(e.est!, 2)} → actual ${f(e.actual!, 2)}`),
    };
  }
  if (/(earnings|report|when)/.test(s) && /(next|when|date|report)/.test(s)) {
    if (!x.nextEarnings) return NA('The next earnings date');
    return {
      text: `${x.symbol} reports next on ${x.nextEarnings}.`,
      sources: [`calendarEvents — ${x.nextEarnings}`],
    };
  }
  if (/(hold|institut|insider|own|13f)/.test(s)) {
    const h = x.holders;
    if (!h || (!h.top.length && h.instPct == null)) return NA('Ownership data');
    const top = h.top.slice(0, 3)
      .map(t => `${t.name}${t.pctHeld != null ? ` ${f(t.pctHeld, 2)}%` : ''}`).join(', ');
    return {
      text: `${x.symbol}:${h.instPct != null ? ` ${f(h.instPct)}% institutional` : ''}${h.insiderPct != null ? `, ${f(h.insiderPct, 2)}% insider` : ''} ownership.` +
        (top ? ` Largest 13F holders: ${top}.` : ''),
      sources: h.top.slice(0, 5).map(t => `${t.name}${t.pctHeld != null ? ` — ${f(t.pctHeld, 2)}%` : ''}`),
    };
  }
  if (/(analyst|rating|target|upgrade|downgrade|consensus)/.test(s)) {
    const c = x.consensus;
    if (!c) return NA('Analyst coverage');
    const parts = [`${c.strongBuy + c.buy} buy`, `${c.hold} hold`, `${c.sell + c.strongSell} sell`];
    let tgt = '';
    if (c.targetMean != null) {
      const up = ((c.targetMean - x.price) / x.price) * 100;
      tgt = ` Mean target ${big(c.targetMean, cur)} (${pct(up)} vs current)${c.targetLow != null && c.targetHigh != null ? `, range ${f(c.targetLow, 0)}–${f(c.targetHigh, 0)}` : ''}.`;
    }
    return {
      text: `${parts.join(' / ')}${c.analysts ? ` across ${c.analysts} analysts` : ''}.${tgt}`,
      sources: [
        `recommendationTrend — ${parts.join(' · ')}`,
        ...(c.targetMean != null ? [`targets: low ${c.targetLow} · mean ${c.targetMean} · high ${c.targetHigh}`] : []),
      ],
    };
  }
  if (/(valuation|p\/?e|expensive|cheap|multiple|market cap)/.test(s)) {
    const parts: string[] = [];
    if (x.pe != null) parts.push(`${f(x.pe)}× trailing`);
    if (x.fwdPe != null) parts.push(`${f(x.fwdPe)}× forward`);
    if (!parts.length && x.marketCap == null) return NA('Valuation data');
    return {
      text: `${x.symbol}${parts.length ? ` trades at ${parts.join(' / ')} earnings` : ''}${x.marketCap != null ? `, market cap ${big(x.marketCap, cur)}` : ''}${x.divYield != null ? `. Dividend yield ${f(x.divYield, 2)}%` : ''}.`,
      sources: [
        ...(x.pe != null ? [`trailing P/E ${f(x.pe)}`] : []),
        ...(x.fwdPe != null ? [`forward P/E ${f(x.fwdPe)}`] : []),
        ...(x.marketCap != null ? [`market cap ${big(x.marketCap, cur)}`] : []),
      ],
    };
  }
  if (/(volatil|risk|beta|drawdown)/.test(s)) {
    const a = x.analytics;
    if (!a) return NA('Price-derived risk metrics');
    return {
      text: `${x.symbol}: 30-day realized volatility ${a.vol30d != null ? f(a.vol30d) : '—'}% (annualized)${x.beta != null ? `, beta ${f(x.beta, 2)}` : ''}${a.maxDd1y != null ? `, max drawdown over the last year ${f(a.maxDd1y)}%` : ''}. Computed from the actual price series.`,
      sources: [
        ...(a.vol30d != null ? [`vol30d ${f(a.vol30d)}%`] : []),
        ...(a.maxDd1y != null ? [`maxDD ${f(a.maxDd1y)}%`] : []),
      ],
    };
  }
  if (/(trend|momentum|rsi|moving average|sma|technical)/.test(s)) {
    const a = x.analytics;
    if (!a) return NA('Technical data');
    const bits: string[] = [];
    if (a.sma200 != null) bits.push(`${x.price > a.sma200 ? 'above' : 'below'} its 200-day (${f(a.sma200)})`);
    if (a.sma50 != null) bits.push(`${x.price > a.sma50 ? 'above' : 'below'} its 50-day (${f(a.sma50)})`);
    return {
      text: `${x.symbol} at ${f(x.price)} is ${bits.join(' and ')}. RSI-14: ${a.rsi14 ?? '—'}. Returns: 1m ${a.ret1m != null ? pct(a.ret1m) : '—'}, 6m ${a.ret6m != null ? pct(a.ret6m) : '—'}, 1y ${a.ret1y != null ? pct(a.ret1y) : '—'}.`,
      sources: [`computed from ${x.priceHistory?.close.length ?? 0} daily closes`],
    };
  }
  if (/(cash ?flow|fcf|buyback|dividend|capital)/.test(s)) {
    const fy = x.fy?.filter(r => r.fcf != null) ?? [];
    const ca = x.capitalAllocation?.filter(c => c.buyback != null || c.dividends != null) ?? [];
    if (!fy.length && !ca.length) return NA('Cash flow data');
    const latest = fy[0];
    const caLatest = ca[ca.length - 1];
    return {
      text: `${x.symbol}${latest ? ` generated ${big(latest.fcf!, cur)} free cash flow in FY${latest.label}${latest.fcfPct != null ? ` (${f(latest.fcfPct)}% of revenue)` : ''}` : ''}.` +
        (caLatest ? ` FY${caLatest.label} capital returns:${caLatest.buyback != null ? ` buybacks ${big(caLatest.buyback, cur)}` : ''}${caLatest.dividends != null ? `, dividends ${big(caLatest.dividends, cur)}` : ''}.` : ''),
      sources: fy.slice(0, 3).map(r => `FY${r.label}: FCF ${big(r.fcf!, cur)}`),
    };
  }
  if (/(what|who|about|overview|describe|company|business)/.test(s)) {
    const p = x.profile;
    return {
      text: `${x.name} (${x.exchange}: ${x.symbol})${p?.sector ? ` — ${p.sector}${p.industry ? ` / ${p.industry}` : ''}` : ''}. ${p?.description ? p.description.split('. ').slice(0, 2).join('. ') + '.' : ''} Price ${f(x.price, 2)}${x.changePct != null ? ` (${pct(x.changePct, 2)} today)` : ''}${x.marketCap != null ? `, market cap ${big(x.marketCap, cur)}` : ''}.`,
      sources: [`assetProfile · price`],
    };
  }
  return {
    text: `I answer from ${x.symbol}'s loaded live data: revenue, margins, EPS beats, next earnings, holders, analyst targets, valuation, volatility, trend, cash flow. Try "how were margins" or "who owns it".`,
    sources: [],
  };
}
