// Live instrument loader - real data via the Compass Yahoo proxy.
// Maps quoteSummary + chart into XData; every missing upstream field stays
// undefined so the UI can omit it honestly.
import { XData, FYRowX, SearchHit } from './types';

const MODULES = [
  'price', 'summaryDetail', 'assetProfile', 'defaultKeyStatistics',
  'financialData', 'calendarEvents', 'earningsHistory', 'earningsTrend',
  'recommendationTrend', 'upgradeDowngradeHistory', 'institutionOwnership',
  'majorHoldersBreakdown', 'incomeStatementHistory',
  'incomeStatementHistoryQuarterly', 'balanceSheetHistory',
  'cashflowStatementHistory',
].join(',');

/* eslint-disable @typescript-eslint/no-explicit-any */
const n = (x: any): number | undefined => {
  if (x == null) return undefined;
  if (typeof x === 'number') return Number.isFinite(x) ? x : undefined;
  if (typeof x.raw === 'number' && Number.isFinite(x.raw)) return x.raw;
  return undefined;
};
const s = (x: any): string | undefined => (typeof x === 'string' && x ? x : undefined);
const fmtDate = (epoch?: number) =>
  epoch ? new Date(epoch * 1000).toISOString().slice(0, 10) : undefined;

let lastStale = false;
/** True when the most recent load was served from a stale cache copy
 * (upstream throttling) - surfaced in the UI, never hidden. */
export function wasStale(): boolean { return lastStale; }

async function proxy(params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`/api/yf?${qs}`);
  const body = await r.json();
  if (!body.ok) throw new Error(body.error ?? 'Data source unavailable');
  if (body.stale) lastStale = true;
  return body.data;
}
export function resetStale(): void { lastStale = false; }

export interface KronosForecast {
  ok: boolean; configured: boolean; forecast?: number[]; sigma?: number[]; error?: string;
}

/** Kronos candlestick-model forecast for the next `horizon` closes.
 * Honest: returns configured:false when no Kronos endpoint is wired. */
export async function kronosForecast(symbol: string, closes: number[], horizon = 24): Promise<KronosForecast> {
  try {
    const qs = new URLSearchParams({
      fn: 'kronos', symbol, horizon: String(horizon),
      closes: closes.slice(-256).map(c => c.toFixed(2)).join(','),
    }).toString();
    const r = await fetch(`/api/yf?${qs}`);
    return await r.json();
  } catch (e) {
    return { ok: false, configured: true, error: e instanceof Error ? e.message : 'forecast failed' };
  }
}

export async function searchInstruments(q: string): Promise<SearchHit[]> {
  const data = await proxy({ fn: 'search', q });
  const quotes: any[] = data?.quotes ?? [];
  return quotes
    .filter(x => x.symbol && (x.quoteType === 'EQUITY' || x.quoteType === 'ETF' || x.quoteType === 'INDEX'))
    .map(x => ({
      symbol: x.symbol,
      name: x.shortname ?? x.longname ?? x.symbol,
      exch: x.exchDisp ?? x.exchange ?? '',
      type: x.quoteType,
    }));
}

const TS_TYPES = [
  'annualTotalRevenue', 'annualGrossProfit', 'annualEBITDA', 'annualNetIncome',
  'annualDilutedEPS', 'annualOperatingCashFlow', 'annualCapitalExpenditure',
  'annualFreeCashFlow', 'annualTotalDebt', 'annualCashAndCashEquivalents',
  'annualTotalAssets', 'annualAccountsReceivable',
  'annualRepurchaseOfCapitalStock', 'annualCashDividendsPaid',
  'annualOperatingIncome', 'annualInterestExpense',
  'quarterlyTotalRevenue', 'quarterlyGrossProfit', 'quarterlyNetIncome',
].join(',');

// timeseries payload → { '2025-09-30': { annualTotalRevenue: 4.16e11, … } }
/* eslint-disable @typescript-eslint/no-explicit-any */
function parseTimeseries(raw: any): Map<string, Record<string, number>> {
  const out = new Map<string, Record<string, number>>();
  for (const series of raw?.timeseries?.result ?? []) {
    const key = series?.meta?.type?.[0];
    if (!key || !Array.isArray(series[key])) continue;
    for (const row of series[key]) {
      const date = row?.asOfDate;
      const v = row?.reportedValue?.raw;
      if (typeof date === 'string' && typeof v === 'number' && Number.isFinite(v)) {
        if (!out.has(date)) out.set(date, {});
        out.get(date)![key] = v;
      }
    }
  }
  return out;
}

export async function loadInstrument(symbol: string): Promise<XData> {
  const [sumRaw, chartRaw, newsRaw, tsRaw] = await Promise.all([
    proxy({ fn: 'summary', symbol, modules: MODULES }),
    proxy({ fn: 'chart', symbol, range: '1y', interval: '1d' }).catch(() => null),
    proxy({ fn: 'search', q: symbol }).catch(() => null),
    proxy({ fn: 'timeseries', symbol, types: TS_TYPES }).catch(() => null),
  ]);
  const ts = parseTimeseries(tsRaw);
  const r = sumRaw?.quoteSummary?.result?.[0];
  if (!r) throw new Error(`No data returned for ${symbol}`);

  const price = r.price ?? {};
  const sd = r.summaryDetail ?? {};
  const ks = r.defaultKeyStatistics ?? {};
  const fin = r.financialData ?? {};
  const prof = r.assetProfile ?? {};

  const x: XData = {
    symbol: s(price.symbol) ?? symbol,
    name: s(price.longName) ?? s(price.shortName) ?? symbol,
    exchange: s(price.exchangeName) ?? '',
    currency: s(price.currency) ?? 'USD',
    price: n(price.regularMarketPrice) ?? 0,
    prevClose: n(price.regularMarketPreviousClose),
    changePct: n(price.regularMarketChangePercent) != null
      ? (n(price.regularMarketChangePercent)! * 100) : undefined,
    marketCap: n(price.marketCap),
    pe: n(sd.trailingPE),
    fwdPe: n(ks.forwardPE),
    divYield: n(sd.dividendYield) != null ? n(sd.dividendYield)! * 100 : undefined,
    beta: n(sd.beta) ?? n(ks.beta),
    open: n(price.regularMarketOpen),
    dayLow: n(price.regularMarketDayLow),
    dayHigh: n(price.regularMarketDayHigh),
    low52: n(sd.fiftyTwoWeekLow),
    high52: n(sd.fiftyTwoWeekHigh),
    volume: n(price.regularMarketVolume),
    avgVolume: n(sd.averageVolume),
    epsTtm: n(ks.trailingEps),
  };

  // profile
  const officers: any[] = prof.companyOfficers ?? [];
  const ceo = officers.find(o => /ceo|chief exec/i.test(o.title ?? ''));
  x.profile = {
    ceo: s(ceo?.name),
    employees: n(prof.fullTimeEmployees),
    industry: s(prof.industry),
    sector: s(prof.sector),
    country: s(prof.country),
    website: s(prof.website)?.replace(/^https?:\/\/(www\.)?/, ''),
    description: s(prof.longBusinessSummary),
  };

  // price history + computed analytics
  const chart = chartRaw?.chart?.result?.[0];
  if (chart?.timestamp && chart?.indicators?.quote?.[0]?.close) {
    const ts: number[] = [];
    const close: number[] = [];
    chart.timestamp.forEach((t: number, i: number) => {
      const c = chart.indicators.quote[0].close[i];
      if (typeof c === 'number' && Number.isFinite(c)) { ts.push(t); close.push(c); }
    });
    if (close.length > 30) {
      x.priceHistory = { ts, close };
      x.analytics = computeAnalytics(close);
    }
    const ft = chart.meta?.firstTradeDate;
    if (ft && x.profile) x.profile.firstTrade = fmtDate(ft);
  }

  // consensus
  const trend: any[] = r.recommendationTrend?.trend ?? [];
  const cur = trend.find(t => t.period === '0m') ?? trend[0];
  if (cur) {
    x.consensus = {
      strongBuy: n(cur.strongBuy) ?? 0, buy: n(cur.buy) ?? 0, hold: n(cur.hold) ?? 0,
      sell: n(cur.sell) ?? 0, strongSell: n(cur.strongSell) ?? 0,
      key: s(fin.recommendationKey),
      analysts: n(fin.numberOfAnalystOpinions),
      targetLow: n(fin.targetLowPrice), targetMean: n(fin.targetMeanPrice),
      targetMedian: n(fin.targetMedianPrice), targetHigh: n(fin.targetHighPrice),
    };
    x.ratingsTrend = trend.map(t => ({
      period: s(t.period) ?? '',
      strongBuy: n(t.strongBuy) ?? 0, buy: n(t.buy) ?? 0, hold: n(t.hold) ?? 0,
      sell: n(t.sell) ?? 0, strongSell: n(t.strongSell) ?? 0,
    })).reverse();
  }

  // analyst actions
  const ud: any[] = r.upgradeDowngradeHistory?.history ?? [];
  if (ud.length) {
    x.actions = ud.slice(0, 12).map(a => ({
      firm: s(a.firm) ?? ' - ',
      toGrade: s(a.toGrade) ?? ' - ',
      fromGrade: s(a.fromGrade) ?? '',
      action: s(a.action) ?? '',
      date: fmtDate(n(a.epochGradeDate)) ?? '',
    }));
  }

  // EPS history + next earnings
  const eh: any[] = r.earningsHistory?.history ?? [];
  if (eh.length) {
    x.epsHistory = eh.map(e => ({
      quarter: fmtDate(n(e.quarter)) ?? s(e.period) ?? '',
      est: n(e.epsEstimate), actual: n(e.epsActual),
      surprisePct: n(e.surprisePercent) != null ? n(e.surprisePercent)! * 100 : undefined,
    }));
  }
  const ed = r.calendarEvents?.earnings?.earningsDate;
  if (Array.isArray(ed) && ed.length) x.nextEarnings = fmtDate(n(ed[0]));

  // annual statements → FY rows. Primary source: fundamentals-timeseries
  // (the current Yahoo statements API); the legacy quoteSummary statement
  // modules only reliably carry the income statement, used as fallback.
  const inc: any[] = r.incomeStatementHistory?.incomeStatementHistory ?? [];
  const annualDates = [...ts.keys()]
    .filter(d => Object.keys(ts.get(d)!).some(k => k.startsWith('annual')))
    .sort()
    .reverse();
  if (annualDates.length) {
    x.fy = annualDates.map((end, i) => {
      const t = ts.get(end)!;
      const legacy = inc.find(row => fmtDate(n(row.endDate)) === end) ?? {};
      const prevT = annualDates[i + 1] ? ts.get(annualDates[i + 1])! : undefined;
      const rev = t.annualTotalRevenue ?? n(legacy.totalRevenue);
      const prevRev = prevT?.annualTotalRevenue;
      const ni = t.annualNetIncome ?? n(legacy.netIncome);
      const ocf = t.annualOperatingCashFlow;
      const capex = t.annualCapitalExpenditure;
      const fcf = t.annualFreeCashFlow ??
        (ocf != null && capex != null ? ocf + capex : undefined);
      const gp = t.annualGrossProfit ?? n(legacy.grossProfit);
      return {
        label: end.slice(0, 4), endDate: end,
        revenue: rev,
        revenueG: rev != null && prevRev ? ((rev - prevRev) / prevRev) * 100 : undefined,
        grossProfit: gp,
        grossPct: gp != null && rev ? (gp / rev) * 100 : undefined,
        ebit: t.annualOperatingIncome ?? n(legacy.ebit) ?? n(legacy.operatingIncome),
        netIncome: ni,
        netPct: ni != null && rev ? (ni / rev) * 100 : undefined,
        eps: t.annualDilutedEPS,
        ocf, capex, fcf,
        fcfPct: fcf != null && rev ? (fcf / rev) * 100 : undefined,
        totalAssets: t.annualTotalAssets,
        totalDebt: t.annualTotalDebt,
        cash: t.annualCashAndCashEquivalents,
        receivables: t.annualAccountsReceivable,
        interestExpense: t.annualInterestExpense ?? n(legacy.interestExpense),
      } as FYRowX;
    }).filter(f => f.revenue != null || f.netIncome != null || f.fcf != null);
  } else if (inc.length) {
    // legacy fallback: income statement only
    x.fy = inc.map((row, i) => {
      const end = fmtDate(n(row.endDate)) ?? '';
      const rev = n(row.totalRevenue);
      const prevRev = n(inc[i + 1]?.totalRevenue);
      const ni = n(row.netIncome);
      const gp = n(row.grossProfit);
      return {
        label: end.slice(0, 4), endDate: end,
        revenue: rev,
        revenueG: rev != null && prevRev ? ((rev - prevRev) / prevRev) * 100 : undefined,
        grossProfit: gp, grossPct: gp != null && rev ? (gp / rev) * 100 : undefined,
        ebit: n(row.ebit) ?? n(row.operatingIncome),
        netIncome: ni, netPct: ni != null && rev ? (ni / rev) * 100 : undefined,
        interestExpense: n(row.interestExpense),
      } as FYRowX;
    });
  }

  // earnings quality per FY - all real ratios, only when inputs exist
  if (x.fy?.length) {
    const qual = x.fy
      .filter(f => f.netIncome != null && f.ocf != null)
      .map(f => ({
        label: f.label,
        accrualsPct: f.totalAssets ? ((f.netIncome! - f.ocf!) / f.totalAssets) * 100 : undefined,
        fcfNi: f.fcf != null && f.netIncome ? f.fcf / f.netIncome : undefined,
        cfoCapex: f.capex ? f.ocf! / Math.abs(f.capex) : undefined,
        dso: f.receivables != null && f.revenue ? (f.receivables / f.revenue) * 365 : undefined,
      }));
    if (qual.length) x.quality = qual;
  }

  // quarterly income - timeseries primary, legacy fallback
  const qDates = [...ts.keys()]
    .filter(d => ts.get(d)!.quarterlyTotalRevenue != null)
    .sort()
    .reverse();
  const incQ: any[] = r.incomeStatementHistoryQuarterly?.incomeStatementHistory ?? [];
  if (qDates.length) {
    x.quarterly = qDates.map((end, i) => {
      const t = ts.get(end)!;
      const rev = t.quarterlyTotalRevenue;
      const prevRev = qDates[i + 1] ? ts.get(qDates[i + 1])!.quarterlyTotalRevenue : undefined;
      const ni = t.quarterlyNetIncome;
      const gp = t.quarterlyGrossProfit;
      return {
        label: end.slice(0, 7), endDate: end,
        revenue: rev,
        revenueG: rev != null && prevRev ? ((rev - prevRev) / prevRev) * 100 : undefined,
        grossProfit: gp, grossPct: gp != null && rev ? (gp / rev) * 100 : undefined,
        netIncome: ni, netPct: ni != null && rev ? (ni / rev) * 100 : undefined,
      } as FYRowX;
    });
  } else if (incQ.length) {
    x.quarterly = incQ.map((row, i) => {
      const rev = n(row.totalRevenue);
      const prevRev = n(incQ[i + 1]?.totalRevenue);
      const ni = n(row.netIncome);
      const gp = n(row.grossProfit);
      return {
        label: fmtDate(n(row.endDate))?.slice(0, 7) ?? '', endDate: fmtDate(n(row.endDate)) ?? '',
        revenue: rev,
        revenueG: rev != null && prevRev ? ((rev - prevRev) / prevRev) * 100 : undefined,
        grossProfit: gp, grossPct: gp != null && rev ? (gp / rev) * 100 : undefined,
        netIncome: ni, netPct: ni != null && rev ? (ni / rev) * 100 : undefined,
      } as FYRowX;
    });
  }

  // forward estimates
  const et: any[] = r.earningsTrend?.trend ?? [];
  const fwd = et.filter(t => ['0y', '+1y'].includes(t.period));
  if (fwd.length) {
    x.fwdEstimates = fwd.map(t => ({
      period: s(t.period) ?? '',
      label: s(t.endDate)?.slice(0, 4) ?? (t.period === '0y' ? 'FY (cur)' : 'FY (next)'),
      revenue: n(t.revenueEstimate?.avg),
      revenueG: n(t.revenueEstimate?.growth) != null ? n(t.revenueEstimate.growth)! * 100 : undefined,
      eps: n(t.epsEstimate?.avg),
    }));
  }

  // holders
  const mh = r.majorHoldersBreakdown ?? {};
  const io: any[] = r.institutionOwnership?.ownershipList ?? [];
  if (io.length || n(mh.institutionsPercentHeld) != null) {
    x.holders = {
      instPct: n(mh.institutionsPercentHeld) != null ? n(mh.institutionsPercentHeld)! * 100 : undefined,
      insiderPct: n(mh.insidersPercentHeld) != null ? n(mh.insidersPercentHeld)! * 100 : undefined,
      institutionsCount: n(mh.institutionsCount),
      top: io.slice(0, 12).map(h => ({
        name: s(h.organization) ?? ' - ',
        pctHeld: n(h.pctHeld) != null ? n(h.pctHeld)! * 100 : undefined,
        position: n(h.position),
        value: n(h.value),
        reportDate: fmtDate(n(h.reportDate)),
      })),
    };
  }

  // margins / returns from financialData (TTM, real)
  x.margins = {
    gross: n(fin.grossMargins) != null ? n(fin.grossMargins)! * 100 : undefined,
    operating: n(fin.operatingMargins) != null ? n(fin.operatingMargins)! * 100 : undefined,
    profit: n(fin.profitMargins) != null ? n(fin.profitMargins)! * 100 : undefined,
    roe: n(fin.returnOnEquity) != null ? n(fin.returnOnEquity)! * 100 : undefined,
    roa: n(fin.returnOnAssets) != null ? n(fin.returnOnAssets)! * 100 : undefined,
    fcfMargin: n(fin.freeCashflow) != null && n(fin.totalRevenue)
      ? (n(fin.freeCashflow)! / n(fin.totalRevenue)!) * 100 : undefined,
  };

  // credit snapshot (TTM, real)
  const totalDebt = n(fin.totalDebt);
  const totalCash = n(fin.totalCash);
  const ebitda = n(fin.ebitda);
  x.creditLatest = {
    totalDebt, totalCash, ebitda,
    netDebtEbitda: totalDebt != null && totalCash != null && ebitda
      ? (totalDebt - totalCash) / ebitda : undefined,
    currentRatio: n(fin.currentRatio),
    quickRatio: n(fin.quickRatio),
    debtToEquity: n(fin.debtToEquity),
  };

  // capital allocation from timeseries cash-flow items (buybacks + dividends)
  const caRows = annualDates
    .map(end => {
      const t = ts.get(end)!;
      return {
        label: end.slice(0, 4),
        buyback: t.annualRepurchaseOfCapitalStock != null
          ? Math.abs(t.annualRepurchaseOfCapitalStock) : undefined,
        dividends: t.annualCashDividendsPaid != null
          ? Math.abs(t.annualCashDividendsPaid) : undefined,
      };
    })
    .filter(c => c.buyback != null || c.dividends != null)
    .reverse();
  if (caRows.length) x.capitalAllocation = caRows;

  // news from the search endpoint
  const newsArr: any[] = newsRaw?.news ?? [];
  if (newsArr.length) {
    x.news = newsArr.slice(0, 6).map(nn => ({
      title: s(nn.title) ?? '',
      publisher: s(nn.publisher) ?? '',
      link: s(nn.link),
      ago: nn.providerPublishTime
        ? relTime(nn.providerPublishTime * 1000) : undefined,
    })).filter(nn => nn.title);
  }

  return x;
}

function relTime(ms: number): string {
  const h = Math.floor((Date.now() - ms) / 3_600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function computeAnalytics(close: number[]): NonNullable<XData['analytics']> {
  const last = close[close.length - 1];
  const at = (daysBack: number) => close[Math.max(close.length - 1 - daysBack, 0)];
  const ret = (daysBack: number) => ((last - at(daysBack)) / at(daysBack)) * 100;

  // 30d realized vol, annualized
  const rets: number[] = [];
  for (let i = Math.max(close.length - 31, 1); i < close.length; i++) {
    rets.push(Math.log(close[i] / close[i - 1]));
  }
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1));
  const vol30d = sd * Math.sqrt(252) * 100;

  // max drawdown over the series
  let peak = close[0], maxDd = 0;
  for (const c of close) {
    peak = Math.max(peak, c);
    maxDd = Math.min(maxDd, (c - peak) / peak);
  }

  // RSI-14 (Wilder)
  let gain = 0, loss = 0;
  const start = Math.max(close.length - 15, 1);
  for (let i = start; i < close.length; i++) {
    const d = close[i] - close[i - 1];
    if (d >= 0) gain += d; else loss -= d;
  }
  const rsi14 = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);

  const sma = (k: number) => {
    const seg = close.slice(-k);
    return seg.length === k ? seg.reduce((a, b) => a + b, 0) / k : undefined;
  };

  return {
    ret1m: ret(21), ret6m: ret(126), ret1y: ret(close.length - 1),
    vol30d, maxDd1y: maxDd * 100, rsi14: Math.round(rsi14),
    sma50: sma(50), sma200: sma(200),
  };
}
