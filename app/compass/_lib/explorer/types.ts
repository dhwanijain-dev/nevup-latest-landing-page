// XData - everything the explorer renders for one instrument, all sections
// optional beyond the header. A section that the data source cannot supply
// is simply absent and the UI omits it (never fabricated).

export interface SearchHit {
  symbol: string; name: string; exch: string; type: string;
}

export interface FYRowX {
  label: string; endDate: string;
  revenue?: number; revenueG?: number;
  grossProfit?: number; grossPct?: number;
  ebit?: number; netIncome?: number; netPct?: number;
  eps?: number; ocf?: number; capex?: number; fcf?: number; fcfPct?: number;
  totalAssets?: number; totalDebt?: number; cash?: number;
  receivables?: number; currentRatio?: number; interestExpense?: number;
}

export interface XData {
  symbol: string; name: string; exchange: string; currency: string;
  price: number; prevClose?: number; changePct?: number;
  marketCap?: number; pe?: number; fwdPe?: number; divYield?: number; beta?: number;
  open?: number; dayLow?: number; dayHigh?: number; low52?: number; high52?: number;
  volume?: number; avgVolume?: number; epsTtm?: number;
  // valuation ratios straight from Yahoo (fill without derivation; US + .NS)
  priceToBook?: number; enterpriseValue?: number; evEbitda?: number; evRevenue?: number;
  pegRatio?: number; sharesOut?: number; bookValue?: number;

  profile?: {
    ceo?: string; employees?: number; industry?: string; sector?: string;
    country?: string; website?: string; description?: string; firstTrade?: string;
  };

  priceHistory?: { ts: number[]; close: number[] };

  consensus?: {
    strongBuy: number; buy: number; hold: number; sell: number; strongSell: number;
    key?: string; analysts?: number;
    targetLow?: number; targetMean?: number; targetMedian?: number; targetHigh?: number;
  };
  ratingsTrend?: { period: string; strongBuy: number; buy: number; hold: number; sell: number; strongSell: number }[];
  actions?: { firm: string; toGrade: string; fromGrade: string; action: string; date: string }[];

  epsHistory?: { quarter: string; est?: number; actual?: number; surprisePct?: number }[];
  nextEarnings?: string;

  fy?: FYRowX[];              // newest first
  quarterly?: FYRowX[];       // newest first, income statement only
  fwdEstimates?: { period: string; label: string; revenue?: number; revenueG?: number; eps?: number }[];

  holders?: {
    instPct?: number; insiderPct?: number; institutionsCount?: number;
    top: { name: string; pctHeld?: number; position?: number; value?: number; reportDate?: string }[];
  };

  analytics?: {
    ret1m?: number; ret6m?: number; ret1y?: number;
    vol30d?: number; maxDd1y?: number; rsi14?: number; sma50?: number; sma200?: number;
  };

  capitalAllocation?: { label: string; buyback?: number; dividends?: number }[];
  creditLatest?: {
    totalDebt?: number; totalCash?: number; ebitda?: number; netDebtEbitda?: number;
    currentRatio?: number; quickRatio?: number; debtToEquity?: number;
  };
  quality?: { label: string; accrualsPct?: number; fcfNi?: number; cfoCapex?: number; dso?: number }[];
  margins?: { gross?: number; operating?: number; profit?: number; fcfMargin?: number; roe?: number; roa?: number };

  news?: { title: string; publisher: string; link?: string; ago?: string }[];
  peers?: string[];   // competitors (Finnhub, when configured)
}
