// Explorer chat — grounded Azure OpenAI (gpt-5.4-mini). The model is given
// ONLY the real, already-computed figures for the loaded instrument and is
// instructed to answer strictly from them, saying "not available" when a fact
// is absent. It cannot invent numbers: the prompt carries the data, and the
// model is told the data is the sole source of truth. Every message in and out
// is persisted to chat_messages (no credentials involved here).
import { q, sanitize, dbEnabled } from '../_lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatBody {
  question?: string;
  symbol?: string;
  facts?: Record<string, unknown>;  // real computed figures from the client
  userId?: string;                   // set once auth is wired
}

const SYSTEM = `You are Compass's equity analyst assistant. You answer ONLY from the JSON figures provided in the user message under "DATA". Rules:
- Use only numbers present in DATA. Never estimate, extrapolate, or recall figures from memory.
- If DATA lacks what's asked, reply exactly that it's not available from the data source for this instrument — do not guess.
- Be concise (1–3 sentences). Cite the specific figures you used.
- Never give buy/sell advice or price targets; describe what the data shows.`;

export async function POST(req: Request) {
  const t0 = Date.now();
  let body: ChatBody = {};
  try { body = await req.json(); } catch { /* empty */ }
  const question = (body.question ?? '').trim();
  const facts = body.facts ?? {};
  if (!question) {
    return Response.json({ ok: false, error: 'Empty question' }, { status: 400 });
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? '2024-10-21';
  if (!endpoint || !key || !deployment) {
    // honest gate — never pretend the LLM answered
    return Response.json({
      ok: false, configured: false,
      error: 'Chat model not configured. Set AZURE_OPENAI_ENDPOINT / _KEY / _DEPLOYMENT.',
    }, { status: 200 });
  }

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  let text = '', modelUsed = deployment;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': key },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Question: ${question}\n\nDATA (${body.symbol ?? 'instrument'}):\n${JSON.stringify(facts).slice(0, 12_000)}` },
        ],
        max_completion_tokens: 8000,
      }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message ?? `HTTP ${r.status}`);
    text = j?.choices?.[0]?.message?.content?.trim() ?? '';
    modelUsed = j?.model ?? deployment;
    if (!text) throw new Error('Empty completion');
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message.slice(0, 200) }, { status: 502 });
  }

  // persist both turns (fire-and-forget; failure never blocks the reply)
  if (dbEnabled()) {
    const uid = body.userId ?? null;
    void q(
      `insert into chat_messages (user_id, symbol, role, content, model) values ($1,$2,'user',$3,$4)`,
      [uid, body.symbol ?? null, question.slice(0, 4000), modelUsed],
    );
    void q(
      `insert into chat_messages (user_id, symbol, role, content, sources, model) values ($1,$2,'assistant',$3,$4,$5)`,
      [uid, body.symbol ?? null, text, JSON.stringify(sanitize(facts)), modelUsed],
    );
    void q(
      `insert into io_log (user_id, route, method, status, req, latency_ms) values ($1,'/api/chat','POST',200,$2,$3)`,
      [uid, JSON.stringify(sanitize({ question, symbol: body.symbol })), Date.now() - t0],
    );
  }

  return Response.json({ ok: true, text, model: modelUsed, sources: Object.keys(facts) },
    { headers: { 'Cache-Control': 'no-store' } });
}
