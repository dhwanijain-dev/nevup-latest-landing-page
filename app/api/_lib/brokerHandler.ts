// Broker connect — credential login flows. Users type their broker login
// (ID + password/PIN + TOTP); app keys where required are COMPASS-owned,
// registered once, supplied via env — users never see or provide API keys.
//
// STATELESS: credentials arrive in the request body, are used for the
// upstream login + pull, and are never stored, logged, or cached. The
// response carries only normalized trades; the client computes insights.
//
// Honest coverage matrix (what each broker's systems actually return):
//   zerodha  — credential login (enctoken) → Console tradebook: 90 DAYS
//              (date-level) + today's fills with exact timestamps
//   angelone — client code + PIN + TOTP via Compass SmartAPI app key →
//              today's tradebook + holdings (SmartAPI has no history API)
//   upstox   — OAuth: user logs in with credentials ON UPSTOX'S PAGE →
//              90-day trade report (Compass app key, env)
//   dhan     — partner consent flow (env) → 90-day trade history
//   groww    — no credential/OAuth API exists; honest guidance returned

export interface NormTrade {
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  price: number;
  ts: string;        // ISO; date-only when the broker omits time
  hasTime: boolean;
  segment?: string;
}

export interface BrokerResult {
  ok: boolean;
  broker?: string;
  trades?: NormTrade[];
  coverage?: string;
  warnings?: string[];
  error?: string;
  needsTotp?: boolean;
  loginUrl?: string;   // OAuth brokers: redirect the user here to log in
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };

/* eslint-disable @typescript-eslint/no-explicit-any */
const num = (v: any): number => {
  const x = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(x) ? x : 0;
};
const str = (v: any): string => (typeof v === 'string' ? v : '');
const pickSide = (v: string): 'BUY' | 'SELL' => (/^s/i.test(v) ? 'SELL' : 'BUY');

// ── minimal cookie jar (Node fetch has none) ────────────────────────────────

class Jar {
  private cookies = new Map<string, string>();
  absorb(res: Response): void {
    const set = (res.headers as any).getSetCookie?.() as string[] | undefined
      ?? (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);
    for (const line of set) {
      const [pair] = line.split(';');
      const eq = pair.indexOf('=');
      if (eq > 0) this.cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  }
  get(name: string): string | undefined { return this.cookies.get(name); }
  header(): string {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

// ── TOTP (RFC 6238, HMAC-SHA1) — matches the desktop app's pyotp behavior ────
// Users supply their 2FA *secret* (base32) once; the code is generated here,
// exactly as NevUp Desk does. A live 6-digit code is also accepted as-is.
function base32Decode(s: string): Uint8Array {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = s.replace(/[=\s]/g, '').toUpperCase();
  let bits = '';
  for (const c of clean) {
    const idx = alpha.indexOf(c);
    if (idx < 0) continue;
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return new Uint8Array(bytes);
}

async function totpNow(secret: string): Promise<string> {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / 30);
  const msg = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) { msg[i] = c & 0xff; c = Math.floor(c / 256); }
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key as unknown as ArrayBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, msg as unknown as ArrayBuffer));
  const offset = sig[sig.length - 1] & 0x0f;
  const bin = ((sig[offset] & 0x7f) << 24) | (sig[offset + 1] << 16)
    | (sig[offset + 2] << 8) | sig[offset + 3];
  return (bin % 1_000_000).toString().padStart(6, '0');
}

/** Resolve a 2FA field that may be a live 6-digit code or a base32 secret. */
async function resolveTotp(raw: string | undefined): Promise<string> {
  const v = (raw ?? '').replace(/\s/g, '');
  if (!v) return '';
  if (/^\d{6}$/.test(v)) return v;              // already a live code
  try { return await totpNow(v); }              // treat as base32 secret
  catch { return v; }
}

async function jfetch(url: string, init: RequestInit): Promise<any> {
  const r = await fetch(url, init);
  const text = await r.text();
  let body: any;
  try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 200) }; }
  if (!r.ok) {
    const msg = body?.message ?? body?.error ?? body?.errors?.[0]?.message
      ?? body?.raw ?? `HTTP ${r.status}`;
    throw new Error(typeof msg === 'string' ? msg.slice(0, 200) : `HTTP ${r.status}`);
  }
  return body;
}

// ── Zerodha — credential login → enctoken → Console tradebook (90 days) ─────

async function pullZerodha(creds: Record<string, string>): Promise<BrokerResult> {
  const { user_id, password, totp } = creds;
  if (!user_id || !password) return { ok: false, error: 'Zerodha user ID and password required' };

  const jar = new Jar();
  const common = { 'User-Agent': UA, 'X-Kite-Version': '3' };

  // step 1: password
  const loginRes = await fetch('https://kite.zerodha.com/api/login', {
    method: 'POST',
    headers: { ...common, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ user_id, password }).toString(),
  });
  jar.absorb(loginRes);
  const loginBody = await loginRes.json().catch(() => ({}));
  if (!loginRes.ok || !loginBody?.data?.request_id) {
    const msg = str(loginBody?.message);
    if (/captcha/i.test(msg)) {
      return {
        ok: false,
        error: 'Zerodha is asking this login for a CAPTCHA, which a server '
          + 'cannot solve. Use the official Kite Connect sign-in (one tap on '
          + 'Zerodha’s own page) — being provisioned for launch. Angel One '
          + 'password connect works today.',
      };
    }
    return { ok: false, error: msg || 'Zerodha login rejected — check user ID and password' };
  }

  // step 2: TOTP — accepts a live 6-digit code or a stored base32 2FA secret
  const code = await resolveTotp(totp);
  if (!code) return { ok: false, needsTotp: true, error: 'Enter your 2FA code or authenticator secret key' };
  const twofaRes = await fetch('https://kite.zerodha.com/api/twofa', {
    method: 'POST',
    headers: { ...common, 'Content-Type': 'application/x-www-form-urlencoded', Cookie: jar.header() },
    body: new URLSearchParams({
      user_id, request_id: loginBody.data.request_id,
      twofa_value: code, twofa_type: 'totp',
    }).toString(),
  });
  jar.absorb(twofaRes);
  const twofaBody = await twofaRes.json().catch(() => ({}));
  if (!twofaRes.ok || twofaBody?.status !== 'success') {
    return { ok: false, error: twofaBody?.message ?? 'Two-factor code rejected' };
  }
  const enctoken = jar.get('enctoken');
  if (!enctoken) return { ok: false, error: 'Zerodha session token missing after 2FA' };

  const warnings: string[] = [];
  const trades: NormTrade[] = [];

  // today's fills with exact timestamps (OMS)
  try {
    const oms = await jfetch('https://kite.zerodha.com/oms/trades', {
      headers: { ...common, Authorization: `enctoken ${enctoken}` },
    });
    for (const t of oms?.data ?? []) {
      trades.push({
        symbol: str(t.tradingsymbol),
        side: pickSide(str(t.transaction_type)),
        qty: num(t.quantity),
        price: num(t.average_price),
        ts: str(t.fill_timestamp ?? t.exchange_timestamp).replace(' ', 'T'),
        hasTime: true,
        segment: str(t.exchange),
      });
    }
  } catch (e) {
    warnings.push(`today's fills: ${e instanceof Error ? e.message : 'failed'}`);
  }

  // Console tradebook — 90 days, date-level (Console reports carry the
  // trade date; intraday time is not part of the report)
  try {
    // establish the Console session off the kite cookies (SSO redirect chain)
    let url = 'https://console.zerodha.com/api/user/profile';
    let hops = 0;
    let res = await fetch('https://console.zerodha.com/', {
      headers: { 'User-Agent': UA, Cookie: jar.header() },
      redirect: 'manual',
    });
    jar.absorb(res);
    while (res.status >= 300 && res.status < 400 && hops < 6) {
      const loc = res.headers.get('location');
      if (!loc) break;
      url = loc.startsWith('http') ? loc : `https://console.zerodha.com${loc}`;
      res = await fetch(url, {
        headers: { 'User-Agent': UA, Cookie: jar.header() },
        redirect: 'manual',
      });
      jar.absorb(res);
      hops++;
    }
    const csrf = jar.get('public_token') ?? jar.get('csrftoken') ?? '';
    const seen = new Set(trades.map(t => `${t.symbol}|${t.ts}|${t.qty}|${t.price}`));
    for (const segment of ['EQ', 'FO']) {
      const tb = await jfetch(
        `https://console.zerodha.com/api/reports/tradebook?segment=${segment}&from_date=${daysAgo(90)}&to_date=${iso(new Date())}&page=1`,
        {
          headers: {
            'User-Agent': UA, Cookie: jar.header(),
            'x-csrftoken': csrf, Accept: 'application/json',
          },
        });
      for (const t of tb?.data?.result ?? tb?.data ?? []) {
        if (!t || typeof t !== 'object') continue;
        const ts = str(t.trade_date ?? t.order_execution_time ?? '');
        const row: NormTrade = {
          symbol: str(t.tradingsymbol ?? t.symbol),
          side: pickSide(str(t.trade_type ?? t.transaction_type)),
          qty: num(t.quantity),
          price: num(t.price ?? t.average_price),
          ts: ts.includes(' ') ? ts.replace(' ', 'T') : ts,
          hasTime: ts.includes(':'),
          segment,
        };
        const key = `${row.symbol}|${row.ts}|${row.qty}|${row.price}`;
        if (row.symbol && !seen.has(key)) { seen.add(key); trades.push(row); }
      }
    }
  } catch (e) {
    warnings.push(`90-day tradebook (Console): ${e instanceof Error ? e.message : 'failed'} — today's fills still included`);
  }

  return {
    ok: true, broker: 'zerodha', trades,
    coverage: trades.some(t => !t.hasTime)
      ? 'Zerodha Console tradebook — last 90 days (date-level) + today with exact timestamps'
      : "Zerodha — today's fills (Console 90-day report unavailable this session)",
    warnings: warnings.length ? warnings : undefined,
  };
}

// ── Angel One — client creds against the Compass SmartAPI app key ───────────

async function pullAngelOne(creds: Record<string, string>): Promise<BrokerResult> {
  const apiKey = process.env.COMPASS_SMARTAPI_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: 'Angel One connect is being provisioned (Compass SmartAPI app '
        + 'registration pending). Zerodha connect is live today.',
    };
  }
  const { client_code, pin, totp } = creds;
  if (!client_code || !pin) return { ok: false, error: 'Angel One client code and PIN required' };
  const code = await resolveTotp(totp);
  if (!code) return { ok: false, needsTotp: true, error: 'Enter your 2FA code or authenticator secret key' };

  const base = 'https://apiconnect.angelone.in';
  const common = {
    'Content-Type': 'application/json', Accept: 'application/json',
    'X-UserType': 'USER', 'X-SourceID': 'WEB',
    'X-ClientLocalIP': '127.0.0.1', 'X-ClientPublicIP': '127.0.0.1',
    'X-MACAddress': '00:00:00:00:00:00', 'X-PrivateKey': apiKey,
  };
  const login = await jfetch(`${base}/rest/auth/angelbroking/user/v1/loginByPassword`, {
    method: 'POST', headers: common,
    body: JSON.stringify({ clientcode: client_code, password: pin, totp: code }),
  });
  const jwt = login?.data?.jwtToken;
  if (!jwt) return { ok: false, error: login?.message ?? 'Angel One login failed' };
  const auth = { ...common, Authorization: `Bearer ${jwt}` };

  const today = iso(new Date());
  const tb = await jfetch(`${base}/rest/secure/angelbroking/order/v1/getTradeBook`, { headers: auth });
  const trades: NormTrade[] = (tb?.data ?? []).map((t: any) => {
    const time = str(t.filltime ?? t.tradetime ?? '');
    return {
      symbol: str(t.tradingsymbol),
      side: pickSide(str(t.transactiontype)),
      qty: num(t.fillsize) || num(t.tradedquantity),
      price: num(t.fillprice) || num(t.tradeprice),
      ts: time ? `${str(t.filldate) || today}T${time}` : today,
      hasTime: !!time,
      segment: str(t.exchange),
    };
  });
  return {
    ok: true, broker: 'angelone', trades,
    coverage: "Angel One SmartAPI — TODAY's fills (SmartAPI exposes no historical tradebook). Reconnect on trading days to build history; the desktop app accumulates automatically.",
  };
}

// ── Upstox — OAuth (user logs in with credentials on Upstox's page) ─────────

function upstoxLoginUrl(): string | null {
  const key = process.env.UPSTOX_API_KEY;
  const redirect = process.env.UPSTOX_REDIRECT_URI;
  if (!key || !redirect) return null;
  return `https://api.upstox.com/v2/login/authorization/dialog?client_id=${encodeURIComponent(key)}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code`;
}

async function pullUpstox(creds: Record<string, string>): Promise<BrokerResult> {
  const key = process.env.UPSTOX_API_KEY;
  const secret = process.env.UPSTOX_API_SECRET;
  const redirect = process.env.UPSTOX_REDIRECT_URI;
  if (!key || !secret || !redirect) {
    return {
      ok: false,
      error: 'Upstox connect is being provisioned (Compass app registration '
        + 'pending). Zerodha connect is live today.',
    };
  }
  // arrive without a code → send the user to Upstox's own login page
  if (!creds.code && !creds.access_token) {
    return { ok: false, loginUrl: upstoxLoginUrl()!, error: 'Login on the Upstox page to continue' };
  }
  let token = creds.access_token;
  if (!token) {
    const form = new URLSearchParams({
      code: creds.code, client_id: key, client_secret: secret,
      redirect_uri: redirect, grant_type: 'authorization_code',
    });
    const sess = await jfetch('https://api.upstox.com/v2/login/authorization/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: form.toString(),
    });
    token = sess?.access_token;
  }
  if (!token) return { ok: false, error: 'Upstox session not established' };

  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
  const trades: NormTrade[] = [];
  const warnings: string[] = [];
  for (const segment of ['EQ', 'FO']) {
    try {
      for (let page = 1; page <= 20; page++) {
        const body = await jfetch(
          `https://api.upstox.com/v2/charges/historical-trades?segment=${segment}&start_date=${daysAgo(90)}&end_date=${iso(new Date())}&page_no=${page}&page_size=500`,
          { headers });
        const rows: any[] = body?.data ?? [];
        if (!rows.length) break;
        for (const t of rows) {
          const date = str(t.trade_date ?? t.date);
          trades.push({
            symbol: str(t.symbol ?? t.scrip_name),
            side: pickSide(str(t.transaction_type ?? t.trade_type)),
            qty: num(t.quantity),
            price: num(t.price),
            ts: date, hasTime: date.includes(':'),
            segment,
          });
        }
        if (rows.length < 500) break;
      }
    } catch (e) {
      warnings.push(`${segment}: ${e instanceof Error ? e.message : 'failed'}`);
    }
  }
  return {
    ok: true, broker: 'upstox', trades,
    coverage: 'Upstox trade report — last 90 days (EQ + F&O)',
    warnings: warnings.length ? warnings : undefined,
  };
}

// ── Dhan / Groww — honest gating ─────────────────────────────────────────────

async function pullDhan(creds: Record<string, string>): Promise<BrokerResult> {
  // Dhan's consent (partner) flow needs a Compass partner registration; a
  // user-side access token also works if one is supplied.
  const token = creds.access_token?.trim();
  if (!token) {
    return {
      ok: false,
      error: 'Dhan password login requires the Compass partner registration '
        + '(in progress). Zerodha connect is live today.',
    };
  }
  const trades: NormTrade[] = [];
  for (let page = 0; page < 20; page++) {
    const rows: any[] = await jfetch(
      `https://api.dhan.co/v2/trades/${daysAgo(90)}/${iso(new Date())}/${page}`,
      { headers: { 'access-token': token, Accept: 'application/json' } });
    if (!Array.isArray(rows) || !rows.length) break;
    for (const t of rows) {
      const tsRaw = str(t.exchangeTime) || str(t.tradedDate);
      trades.push({
        symbol: str(t.customSymbol) || str(t.tradingSymbol) || str(t.securityId),
        side: pickSide(str(t.transactionType)),
        qty: num(t.tradedQuantity) || num(t.quantity),
        price: num(t.tradedPrice) || num(t.price),
        ts: tsRaw.includes(' ') ? tsRaw.replace(' ', 'T') : tsRaw,
        hasTime: tsRaw.includes(':'),
        segment: str(t.exchangeSegment),
      });
    }
    if (rows.length < 100) break;
  }
  return { ok: true, broker: 'dhan', trades, coverage: 'Dhan Trade History — last 90 days with exchange timestamps' };
}

async function pullGroww(): Promise<BrokerResult> {
  return {
    ok: false,
    error: 'Groww has no password-login or OAuth API — their Trade API only '
      + 'issues tokens inside the Groww app settings. Being pursued as a '
      + 'partner integration; Zerodha connect is live today.',
  };
}

// ── entry ────────────────────────────────────────────────────────────────────

export async function handleBroker(body: {
  broker?: string;
  creds?: Record<string, string>;
}): Promise<BrokerResult> {
  try {
    const broker = (body.broker ?? '').toLowerCase();
    const creds = body.creds ?? {};
    switch (broker) {
      case 'zerodha': return await pullZerodha(creds);
      case 'angelone': return await pullAngelOne(creds);
      case 'upstox': return await pullUpstox(creds);
      case 'dhan': return await pullDhan(creds);
      case 'groww': return await pullGroww();
      default: return { ok: false, error: `Unknown broker '${broker}'` };
    }
  } catch (e) {
    // Never echo credentials; upstream message only.
    return { ok: false, error: e instanceof Error ? e.message : 'Broker connect failed' };
  }
}
