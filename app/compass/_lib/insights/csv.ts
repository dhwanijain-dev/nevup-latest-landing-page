// CSV trade-book parser - turns any broker's export into NormTrade[].
// Runs entirely in the browser (the file never leaves the user's machine).
//
// Built to survive real-world broker CSVs: BOMs, preamble/title rows,
// comma/semicolon/tab delimiters, quoted fields, thousands separators,
// currency symbols, split or combined date+time, and a wide vocabulary of
// column names (Zerodha, Groww, Upstox, Dhan, Angel One, generic exports).
//
// Every failure is caught and reported; a genuine trade CSV parses, a
// garbage upload is rejected with a specific reason.
import type { NormTrade } from './types';

export interface ParseReport {
  ok: boolean;
  trades: NormTrade[];
  error?: string;                 // fatal reason (nothing usable)
  totalRows: number;              // data rows seen
  parsed: number;                 // rows turned into trades
  skipped: number;
  skipSamples: { row: number; reason: string }[];
  columns: Record<string, string>; // resolved field → source header
  delimiter: string;
  warnings: string[];
}

export const MAX_BYTES = 8 * 1024 * 1024;   // 8 MB
export const MAX_ROWS = 200_000;

// ── field vocabulary (lowercased, punctuation-stripped for matching) ────────
const NORM = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const SYNONYMS: Record<keyof FieldMap, string[]> = {
  symbol: ['symbol', 'tradingsymbol', 'scrip', 'scripname', 'scripcode', 'instrument',
    'instrumentname', 'contract', 'contractdescription', 'stock', 'ticker', 'security',
    'securityname', 'name', 'company', 'symbolname', 'underlying'],
  side: ['side', 'tradetype', 'transactiontype', 'buysell', 'bs', 'buyorsell',
    'ordertype', 'type', 'action', 'txntype', 'trantype', 'direction'],
  qty: ['qty', 'quantity', 'filledqty', 'filledquantity', 'tradedqty', 'tradedquantity',
    'tradeqty', 'tradequantity', 'shares', 'units', 'lotsize', 'executedqty', 'fillqty'],
  price: ['price', 'avgprice', 'averageprice', 'avgtradeprice', 'tradeprice', 'tradedprice',
    'fillprice', 'rate', 'executedprice', 'avgexecutionprice', 'orderprice', 'nettradeprice'],
  // datetime-carrying columns first so they win over a date-only column
  date: ['orderexecutiontime', 'datetime', 'timestamp', 'exchangetime', 'filltime',
    'tradetime', 'exchtime', 'tradedate', 'orderdate', 'orderexecutiondate',
    'transactiondate', 'date', 'time'],
  time: ['time', 'ordertime', 'tradetime', 'filltime', 'exchangetime', 'executiontime'],
};

interface FieldMap { symbol: string; side: string; qty: string; price: string; date: string; time: string }

// ── delimiter sniff ──────────────────────────────────────────────────────────
function sniffDelimiter(sample: string): string {
  const cands = [',', ';', '\t', '|'];
  const lines = sample.split(/\r?\n/).filter(l => l.trim()).slice(0, 20);
  let best = ',', bestScore = -1;
  for (const d of cands) {
    // score = median column count, penalize inconsistency
    const counts = lines.map(l => splitLine(l, d).length);
    if (!counts.length) continue;
    const max = Math.max(...counts);
    if (max < 2) continue;
    const consistent = counts.filter(c => c === max).length;
    const score = max * 10 + consistent;
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}

// ── one line → fields (RFC-4180 quoting) ────────────────────────────────────
function splitLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

// ── value coercion ───────────────────────────────────────────────────────────
function toNumber(raw: string): number | null {
  if (!raw) return null;
  // strip currency symbols, thousands separators, spaces, parentheses (neg)
  let s = raw.replace(/[₹$€£,\s]/g, '').trim();
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (s.endsWith('-')) { neg = true; s = s.slice(0, -1); }
  if (s === '' || s === '-') return null;
  const v = parseFloat(s);
  if (!Number.isFinite(v)) return null;
  return neg ? -v : v;
}

function toSide(raw: string): 'BUY' | 'SELL' | null {
  const s = NORM(raw);
  if (!s) return null;
  if (/^(b|buy|bot|bought|purchase|long|p)/.test(s)) return 'BUY';
  if (/^(s|sell|sld|sold|short)/.test(s)) return 'SELL';
  if (s.includes('buy')) return 'BUY';
  if (s.includes('sell')) return 'SELL';
  return null;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Parse a broad range of date(+time) strings → { iso, hasTime }. */
function parseDate(dateRaw: string, timeRaw?: string): { iso: string; hasTime: boolean } | null {
  let s = (dateRaw ?? '').trim();
  if (!s) return null;
  // ISO / datetime already?
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})([ T](\d{2}):(\d{2})(:\d{2})?)?/);
  if (isoMatch) {
    const ymd = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    if (isoMatch[4]) return { iso: `${ymd}T${isoMatch[5]}:${isoMatch[6]}${isoMatch[7] ?? ':00'}`, hasTime: true };
    // date-only ISO - fold in a separate time column if provided
    const tr = (timeRaw ?? '').match(/(\d{1,2}):(\d{2})(:(\d{2}))?/);
    if (tr) return { iso: `${ymd}T${tr[1].padStart(2, '0')}:${tr[2]}:${tr[4] ?? '00'}`, hasTime: true };
    return { iso: ymd, hasTime: false };
  }
  // extract embedded time if present
  let timePart = '';
  const tEmbed = s.match(/(\d{1,2}):(\d{2})(:(\d{2}))?/);
  if (tEmbed) {
    timePart = `${tEmbed[1].padStart(2, '0')}:${tEmbed[2]}:${tEmbed[4] ?? '00'}`;
    s = s.replace(tEmbed[0], '').trim();
  } else if (timeRaw) {
    const tr = timeRaw.match(/(\d{1,2}):(\d{2})(:(\d{2}))?/);
    if (tr) timePart = `${tr[1].padStart(2, '0')}:${tr[2]}:${tr[4] ?? '00'}`;
  }
  s = s.replace(/[T,]/g, ' ').trim();

  let y = 0, mo = 0, d = 0;
  // DD-Mon-YYYY / DD Mon YYYY
  const mon = s.match(/^(\d{1,2})[-/\s]([A-Za-z]{3,})[-/\s](\d{2,4})$/);
  if (mon) {
    d = +mon[1]; mo = MONTHS[mon[2].slice(0, 3).toLowerCase()] ?? -1; y = +mon[3];
    if (mo < 0) return null;
  } else {
    const parts = s.split(/[-/.]/).map(p => p.trim()).filter(Boolean);
    if (parts.length !== 3) return null;
    const nums = parts.map(Number);
    if (nums.some(n => !Number.isFinite(n))) return null;
    if (nums[0] > 31) { [y, mo, d] = [nums[0], nums[1] - 1, nums[2]]; }        // YYYY-MM-DD
    else if (nums[2] > 31) {                                                    // DD-MM-YYYY / MM-DD-YYYY
      y = nums[2];
      // day > 12 disambiguates; else assume DD-MM (Indian brokers)
      if (nums[0] > 12) { d = nums[0]; mo = nums[1] - 1; }
      else if (nums[1] > 12) { mo = nums[0] - 1; d = nums[1]; }
      else { d = nums[0]; mo = nums[1] - 1; }
    } else return null;
  }
  if (y < 100) y += 2000;
  if (mo < 0 || mo > 11 || d < 1 || d > 31 || y < 1990 || y > 2100) return null;
  const mm = String(mo + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  if (timePart) return { iso: `${y}-${mm}-${dd}T${timePart}`, hasTime: true };
  return { iso: `${y}-${mm}-${dd}`, hasTime: false };
}

// ── header resolution ────────────────────────────────────────────────────────
function resolveHeaders(headers: string[]): { map: Partial<FieldMap>; cols: Record<string, string> } {
  const normed = headers.map(NORM);
  const map: Partial<FieldMap> = {};
  const cols: Record<string, string> = {};
  (Object.keys(SYNONYMS) as (keyof FieldMap)[]).forEach(field => {
    // exact synonym match first, then contains
    let idx = normed.findIndex(h => SYNONYMS[field].includes(h));
    if (idx < 0) idx = normed.findIndex(h => SYNONYMS[field].some(syn => h.includes(syn) && syn.length >= 4));
    if (idx >= 0 && !Object.values(cols).includes(headers[idx])) {
      map[field] = headers[idx];
      cols[field] = headers[idx];
    }
  });
  return { map, cols };
}

/** Find the header row: the first row (within the first 30) that resolves
 *  symbol + side + qty + price. Broker CSVs prepend title/blank rows. */
function findHeaderRow(rows: string[][]): { headerIdx: number; map: Partial<FieldMap>; cols: Record<string, string> } | null {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const { map, cols } = resolveHeaders(rows[i]);
    if (map.symbol && map.side && map.qty && map.price) return { headerIdx: i, map, cols };
  }
  return null;
}

// ── main ─────────────────────────────────────────────────────────────────────
export function parseTradeCsv(text: string): ParseReport {
  const base: ParseReport = {
    ok: false, trades: [], totalRows: 0, parsed: 0, skipped: 0,
    skipSamples: [], columns: {}, delimiter: ',', warnings: [],
  };

  if (!text || !text.trim()) return { ...base, error: 'The file is empty.' };
  // strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const delimiter = sniffDelimiter(text);
  const lines = text.split(/\r?\n/);
  const rows = lines.map(l => splitLine(l, delimiter)).filter(r => r.some(c => c !== ''));
  if (rows.length < 2) return { ...base, delimiter, error: 'No data rows found - this doesn\'t look like a trade export.' };

  const header = findHeaderRow(rows);
  if (!header) {
    return {
      ...base, delimiter,
      error: 'Could not find the trade columns. A trade CSV needs recognizable '
        + 'symbol, buy/sell, quantity and price columns - this file has none of them. '
        + `Headers seen: ${rows[0].slice(0, 8).join(', ')}`,
    };
  }
  const { headerIdx, map, cols } = header;
  const headerRow = rows[headerIdx];
  const colIndex = (h?: string) => (h ? headerRow.indexOf(h) : -1);
  const iSym = colIndex(map.symbol), iSide = colIndex(map.side);
  const iQty = colIndex(map.qty), iPrice = colIndex(map.price);
  const iDate = colIndex(map.date), iTime = colIndex(map.time);

  const dataRows = rows.slice(headerIdx + 1);
  if (dataRows.length > MAX_ROWS) {
    return { ...base, delimiter, columns: cols, error: `Too many rows (${dataRows.length.toLocaleString()}). Cap is ${MAX_ROWS.toLocaleString()}.` };
  }

  const trades: NormTrade[] = [];
  const skipSamples: { row: number; reason: string }[] = [];
  let skipped = 0;
  let noDate = 0;

  dataRows.forEach((r, i) => {
    const rowNo = headerIdx + 2 + i; // 1-based, human
    try {
      // ignore repeated header rows / total/summary rows brokers append
      const first = (r[0] ?? '').toLowerCase();
      if (/^(total|grand total|net|summary| - |-)$/.test(first.trim())) return;

      const sym = (r[iSym] ?? '').trim();
      const side = toSide(r[iSide] ?? '');
      const qty = toNumber(r[iQty] ?? '');
      const price = toNumber(r[iPrice] ?? '');

      if (!sym) { skipped++; if (skipSamples.length < 8) skipSamples.push({ row: rowNo, reason: 'no symbol' }); return; }
      if (!side) { skipped++; if (skipSamples.length < 8) skipSamples.push({ row: rowNo, reason: `unrecognized side "${(r[iSide] ?? '').slice(0, 12)}"` }); return; }
      if (qty == null || qty === 0) { skipped++; if (skipSamples.length < 8) skipSamples.push({ row: rowNo, reason: `bad quantity "${(r[iQty] ?? '').slice(0, 12)}"` }); return; }
      if (price == null || price <= 0) { skipped++; if (skipSamples.length < 8) skipSamples.push({ row: rowNo, reason: `bad price "${(r[iPrice] ?? '').slice(0, 12)}"` }); return; }

      let ts = '', hasTime = false;
      const parsed = iDate >= 0 ? parseDate(r[iDate] ?? '', iTime >= 0 ? r[iTime] : undefined) : null;
      if (parsed) { ts = parsed.iso; hasTime = parsed.hasTime; }
      else { noDate++; }

      trades.push({
        symbol: sym.toUpperCase(),
        side,
        qty: Math.abs(qty),
        price: Math.abs(price),
        ts, hasTime,
      });
    } catch (e) {
      skipped++;
      if (skipSamples.length < 8) skipSamples.push({ row: rowNo, reason: e instanceof Error ? e.message : 'parse error' });
    }
  });

  const warnings: string[] = [];
  if (noDate > 0) warnings.push(`${noDate} row(s) had no readable date - those trades count toward totals but not time-based metrics.`);
  // trades without any timestamp can't be chronologically paired reliably;
  // synthesize a stable order by preserving file order for undated rows
  if (trades.every(t => !t.ts)) {
    warnings.push('No dates found in this file - round-trips are paired in file order and time-of-day insights are unavailable.');
    trades.forEach((t, i) => { t.ts = `1970-01-01T00:${String(Math.floor(i / 60) % 60).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`; });
  }

  if (!trades.length) {
    return {
      ...base, delimiter, columns: cols, totalRows: dataRows.length, skipped, skipSamples,
      error: 'Found the columns, but no row had a valid symbol + side + quantity + price. '
        + 'Check that this is an executed-trades export (not an orders or holdings file).',
    };
  }

  return {
    ok: true, trades, delimiter, columns: cols,
    totalRows: dataRows.length, parsed: trades.length, skipped, skipSamples, warnings,
  };
}
