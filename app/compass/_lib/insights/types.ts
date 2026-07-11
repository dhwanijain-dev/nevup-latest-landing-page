export interface NormTrade {
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  price: number;
  ts: string;
  hasTime: boolean;
  segment?: string;
}

export interface BrokerResponse {
  ok: boolean;
  broker?: string;
  trades?: NormTrade[];
  coverage?: string;
  warnings?: string[];
  error?: string;
  needsTotp?: boolean;
  loginUrl?: string;
}
