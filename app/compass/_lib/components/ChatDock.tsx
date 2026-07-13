'use client';
// The one analyst chat for the whole terminal. It reads the active page's
// grounding from chat context (Insights -> your trading; Explorer -> the loaded
// instrument + your history on it) and answers strictly from those real
// figures via /api/chat. Every message is persisted server-side.
import { useEffect, useRef, useState } from 'react';
import { T, statLabel } from '../theme';
import { useChat } from '../chatContext';

const mono = (size: number, color: string, weight = 400): React.CSSProperties =>
  ({ fontFamily: T.mono, fontSize: size, color, fontWeight: weight });

interface Msg { role: 'user' | 'assistant'; text: string; sources?: string[] }

export default function ChatDock() {
  const { ctx } = useChat();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endpoint = (process.env.NEXT_PUBLIC_CHAT_ENDPOINT as string | undefined) ?? '/api/chat';

  // reset the conversation when the page/scope changes
  useEffect(() => {
    if (ctx) setMsgs([{ role: 'assistant', text: ctx.greeting }]);
  }, [ctx?.scope]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [msgs, busy]);

  const ask = async (q: string) => {
    if (!q.trim() || busy || !ctx) return;
    setMsgs(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setBusy(true);
    const user = (window as unknown as { __compassUser?: { userId?: string } }).__compassUser;
    try {
      const r = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: ctx.symbol, question: q, facts: ctx.facts, userId: user?.userId }),
      });
      const data = await r.json();
      if (data?.ok && data.text) {
        setMsgs(m => [...m, { role: 'assistant', text: data.text, sources: data.sources }]);
      } else {
        setMsgs(m => [...m, { role: 'assistant', text: data?.error
          ? `Analyst unavailable: ${data.error}` : 'The analyst could not answer that from the data on this page.' }]);
      }
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: 'Analyst unreachable - try again.' }]);
    } finally { setBusy(false); }
  };

  if (!ctx) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', background: T.panel, height: '100%', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ ...mono(10, T.faint), textAlign: 'center', lineHeight: 1.6 }}>Ask-your-analyst chat appears here once a page has data.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: T.panel, height: '100%', minHeight: 0 }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.borderSoft}` }}>
        <div style={mono(11, T.ink, 700)}>{ctx.title}</div>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11.5, color: T.faint, marginTop: 3 }}>{ctx.subtitle}</div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'stretch', maxWidth: m.role === 'user' ? '90%' : '100%' }}>
            <div style={{
              background: m.role === 'user' ? T.ink : 'transparent',
              color: m.role === 'user' ? T.inverse : T.body,
              padding: m.role === 'user' ? '9px 12px' : 0,
              fontFamily: m.role === 'user' ? T.mono : T.serif,
              fontSize: m.role === 'user' ? 12 : 14, lineHeight: 1.6,
            }}>{m.text}</div>
            {m.sources && m.sources.length > 0 && (
              <div style={{ marginTop: 8, borderLeft: `2px solid ${T.border}`, paddingLeft: 10 }}>
                {m.sources.map((sc, j) => <div key={j} style={{ ...mono(9.5, T.muted), padding: '2px 0' }}>◦ {sc}</div>)}
              </div>
            )}
          </div>
        ))}
        {busy && <div style={mono(11, T.muted)}>› thinking…</div>}
      </div>

      <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.borderSoft}` }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {ctx.chips.map(cc => (
            <button key={cc} onClick={() => ask(cc)} disabled={busy} style={{
              background: 'transparent', border: `1px solid ${T.border}`, ...mono(9.5, T.muted),
              padding: '4px 8px', cursor: busy ? 'default' : 'pointer',
            }}>{cc}</button>
          ))}
        </div>
        <form onSubmit={e => { e.preventDefault(); ask(input); }} style={{ display: 'flex' }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your analyst…"
            style={{ flex: 1, background: '#fff', border: `1px solid ${T.border}`, borderRight: 'none', padding: '9px 11px', ...mono(12, T.ink), outline: 'none' }} />
          <button type="submit" style={{ background: T.ink, color: T.inverse, border: 'none', padding: '9px 14px', ...mono(11, T.inverse, 700), cursor: 'pointer' }}>↑</button>
        </form>
        <div style={{ ...mono(9, T.faint), marginTop: 6 }}>Compass Analyst · grounded in real data on this page</div>
      </div>
    </div>
  );
}
