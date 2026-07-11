-- Compass persistence schema (Azure Database for PostgreSQL 16).
-- Stores EVERYTHING that flows through the product — uploaded CSVs, parsed
-- trades, computed insights, every forecast in/out, every chat message,
-- per-user + fleet accuracy — with ONE hard exclusion: broker credentials are
-- NEVER stored (they live in memory for a single call and are discarded). The
-- io_log.req column is sanitized before insert; credential fields never reach it.

-- gen_random_uuid() is built into PostgreSQL 16 core — no extension needed.

-- ── identity (Google onboarding) ────────────────────────────────────────────
create table if not exists users (
  id             uuid primary key default gen_random_uuid(),
  google_sub     text unique not null,          -- Google's stable subject id
  email          text not null,
  email_verified boolean not null default false, -- real-user validation
  name           text,
  picture        text,
  trader_style   text,           -- classified from their uploaded trades
  market         text,
  currency       text,
  instrument     text,
  profile        jsonb,          -- full TraderProfile
  created_at     timestamptz not null default now(),
  last_seen_at   timestamptz not null default now()
);

-- ── uploads — the raw CSV, stored in full ───────────────────────────────────
create table if not exists uploads (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  filename     text,
  raw_csv      text not null,        -- complete original file content
  bytes        integer not null,
  row_count    integer,
  parsed_count integer,
  created_at   timestamptz not null default now()
);
create index if not exists idx_uploads_user on uploads(user_id, created_at desc);

-- ── parsed trades ───────────────────────────────────────────────────────────
create table if not exists trades (
  id        bigserial primary key,
  upload_id uuid not null references uploads(id) on delete cascade,
  user_id   uuid not null references users(id) on delete cascade,
  symbol    text not null,
  side      text not null check (side in ('BUY','SELL')),
  qty       double precision not null,
  price     double precision not null,
  ts        timestamptz,
  has_time  boolean not null default false,
  segment   text
);
create index if not exists idx_trades_user on trades(user_id);
create index if not exists idx_trades_upload on trades(upload_id);

-- ── computed insights (behavioral + debrief + ghost + compounding) ──────────
create table if not exists insights_snapshots (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  upload_id        uuid references uploads(id) on delete cascade,
  discipline_score integer,
  total_pnl        double precision,
  round_trips      integer,
  payload          jsonb not null,   -- full Insights object
  created_at       timestamptz not null default now()
);
create index if not exists idx_insights_user on insights_snapshots(user_id, created_at desc);

-- ── Kronos forecasts — every input and output ───────────────────────────────
create table if not exists forecasts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users(id) on delete set null,
  symbol          text not null,
  horizon         integer not null,
  input_closes    jsonb not null,
  output_forecast jsonb not null,
  model           text not null default 'kronos',
  backend         text,             -- 'kronos' | 'fallback' etc.
  created_at      timestamptz not null default now()
);
create index if not exists idx_forecasts_symbol on forecasts(symbol, created_at desc);

-- ground truth: actual prices vs the forecast (directional hit + MAPE)
create table if not exists forecast_evals (
  id              uuid primary key default gen_random_uuid(),
  forecast_id     uuid not null references forecasts(id) on delete cascade,
  actual_prices   jsonb not null,
  directional_hit boolean,
  mape            double precision,
  evaluated_at    timestamptz not null default now()
);

-- ── per-user accuracy report (all four models) ──────────────────────────────
create table if not exists accuracy_reports (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  kronos_dir_acc   double precision,
  kronos_mape      double precision,
  behavioral_holds boolean,
  behavioral_lift  double precision,
  debrief_accuracy double precision,
  ghost_validity   double precision,
  overall          double precision,
  covered          text[],
  payload          jsonb not null,   -- full AccuracyReport
  created_at       timestamptz not null default now()
);
create index if not exists idx_accuracy_user on accuracy_reports(user_id, created_at desc);

-- ── Explorer chat — every message in and out ────────────────────────────────
create table if not exists chat_messages (
  id         bigserial primary key,
  user_id    uuid references users(id) on delete cascade,
  symbol     text,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  sources    jsonb,
  model      text,
  created_at timestamptz not null default now()
);
create index if not exists idx_chat_user on chat_messages(user_id, created_at desc);

-- ── generic I/O log — every request/response (credentials sanitized out) ────
create table if not exists io_log (
  id           bigserial primary key,
  user_id      uuid references users(id) on delete set null,
  route        text not null,
  method       text not null,
  status       integer,
  req          jsonb,               -- SANITIZED: never contains credentials
  resp_summary jsonb,
  latency_ms   integer,
  created_at   timestamptz not null default now()
);
create index if not exists idx_iolog_created on io_log(created_at desc);
