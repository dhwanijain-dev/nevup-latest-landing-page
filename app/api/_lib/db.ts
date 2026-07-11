// Postgres access for the Compass API (Azure Database for PostgreSQL).
// A single module-scoped pool is reused across warm serverless invocations.
// Everything that flows through the product is persisted here EXCEPT broker
// credentials - see sanitize() below, which strips credential-shaped fields
// before anything is written to io_log.
import { Pool, type QueryResultRow } from 'pg';

let pool: Pool | null = null;

/** Lazily build the pool. Returns null if DATABASE_URL is unset, so the app
 *  runs (degraded - no persistence) rather than crashing when unconfigured. */
export function getPool(): Pool | null {
  if (pool) return pool;
  const cs = process.env.DATABASE_URL;
  if (!cs) return null;
  pool = new Pool({
    connectionString: cs,
    ssl: { rejectUnauthorized: false }, // Azure PG public endpoint over TLS
    max: 4,                              // small - serverless fan-out friendly
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });
  return pool;
}

export const dbEnabled = (): boolean => !!process.env.DATABASE_URL;

/** Run a query; returns [] on any failure so persistence never breaks a
 *  user-facing response. Failures are logged to the server console only. */
export async function q<T extends QueryResultRow = QueryResultRow>(
  text: string, params: unknown[] = [],
): Promise<T[]> {
  const p = getPool();
  if (!p) return [];
  try {
    const res = await p.query<T>(text, params);
    return res.rows;
  } catch (e) {
    console.error('[db] query failed:', (e as Error).message);
    return [];
  }
}

// ── credential sanitizer - the ONE hard exclusion ────────────────────────────
const CREDENTIAL_KEYS = /^(password|pin|pwd|totp|twofa|twofa_value|secret|api[_-]?key|apikey|token|access[_-]?token|enctoken|request_token|client_secret|user_id|userid|client_code|dhan_token|auth|authorization)$/i;

/** Recursively strip credential-shaped fields from any object before it is
 *  persisted. Credentials must never reach the database. */
export function sanitize(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sanitize);
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (CREDENTIAL_KEYS.test(k)) { out[k] = '[redacted]'; continue; }
      out[k] = sanitize(val);
    }
    return out;
  }
  if (typeof v === 'string' && v.length > 4000) return v.slice(0, 4000) + '…';
  return v;
}
