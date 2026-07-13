'use client';
// The one analyst chat for the whole terminal. It reads the active page's
// grounding from chat context (Insights -> your trading; Explorer -> the loaded
// instrument + your history on it) and answers strictly from those real
// figures via /api/chat. Every message is persisted server-side.
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { T, statLabel } from '../theme';
import { useChat } from '../chatContext';

const mono = (size: number, color: string, weight = 400): React.CSSProperties =>
  ({ fontFamily: T.mono, fontSize: size, color, fontWeight: weight });

interface Msg { role: 'user' | 'assistant'; text: string; sources?: string[] }

// Render the assistant's markdown (tables, headings, bold, lists) styled for
// the white theme + Quicksand. This is what turns raw "**315.32**" and pipe
// tables into the polished, tryinvesti-grade output.
function Markdown({ text }: { text: string }) {
  return (
    <div style={{ fontFamily: T.serif, fontSize: 13.5, color: T.body, lineHeight: 1.6 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: p => <h3 style={{ fontSize: 16, fontWeight: 700, color: T.ink, margin: '14px 0 6px' }} {...p} />,
          h2: p => <h3 style={{ fontSize: 15, fontWeight: 700, color: T.ink, margin: '14px 0 6px' }} {...p} />,
          h3: p => <h4 style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, margin: '12px 0 5px' }} {...p} />,
          p: p => <p style={{ margin: '0 0 9px' }} {...p} />,
          strong: p => <strong style={{ color: T.ink, fontWeight: 700 }} {...p} />,
          ul: p => <ul style={{ margin: '0 0 9px', paddingLeft: 18 }} {...p} />,
          ol: p => <ol style={{ margin: '0 0 9px', paddingLeft: 18 }} {...p} />,
          li: p => <li style={{ margin: '2px 0' }} {...p} />,
          a: p => <a style={{ color: T.ghost }} {...p} />,
          code: p => <code style={{ fontFamily: 'Quicksand, monospace', background: T.panelAlt, padding: '1px 4px', borderRadius: 3, fontSize: 12.5 }} {...p} />,
          hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${T.borderSoft}`, margin: '12px 0' }} />,
          table: p => (
            <div style={{ overflowX: 'auto', margin: '4px 0 12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }} {...p} />
            </div>
          ),
          thead: p => <thead {...p} />,
          th: p => <th style={{ textAlign: 'left', padding: '7px 9px', borderBottom: `1px solid ${T.border}`, background: T.panelAlt, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap' }} {...p} />,
          td: p => <td style={{ padding: '7px 9px', borderBottom: `1px solid ${T.borderSoft}`, color: T.body, verticalAlign: 'top' }} {...p} />,
          blockquote: p => <blockquote style={{ borderLeft: `2px solid ${T.ghost}`, paddingLeft: 10, margin: '0 0 9px', color: T.mutedStrong }} {...p} />,
        }}
      >{text}</ReactMarkdown>
    </div>
  );
}

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
          m.role === 'user' ? (
            <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '90%', background: T.ink, color: T.inverse, padding: '9px 12px', borderRadius: 8, ...mono(12, T.inverse) }}>{m.text}</div>
          ) : (
            <div key={i} style={{ alignSelf: 'stretch', maxWidth: '100%' }}><Markdown text={m.text} /></div>
          )
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
