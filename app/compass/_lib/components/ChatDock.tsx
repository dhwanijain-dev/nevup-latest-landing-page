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
          code: p => <code style={{ fontFamily: 'IBM Plex Mono, monospace', background: T.panelAlt, padding: '1px 4px', borderRadius: 3, fontSize: 12.5 }} {...p} />,
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
  const [feedbackPending, setFeedbackPending] = useState(false);
  const [fbHint, setFbHint] = useState('');
  const askedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);   // the latest user question
  const endpoint = (process.env.NEXT_PUBLIC_CHAT_ENDPOINT as string | undefined) ?? '/api/chat';

  // reset the conversation when the page/scope changes
  useEffect(() => {
    if (ctx) setMsgs([{ role: 'assistant', text: ctx.greeting }]);
  }, [ctx?.scope]); // eslint-disable-line react-hooks/exhaustive-deps

  // When a new turn arrives, pin the user's question to the TOP of the chat so
  // the answer reads from its beginning downward - never jump to the bottom.
  const lastUserIdx = msgs.map(m => m.role).lastIndexOf('user');
  useEffect(() => {
    const c = scrollRef.current, a = anchorRef.current;
    if (!c || !a) return;
    c.scrollTo({ top: Math.max(0, a.offsetTop - 12), behavior: 'smooth' });
  }, [msgs, busy]); // eslint-disable-line react-hooks/exhaustive-deps

  // Non-passive wheel handler so the cursor-in-chat wheel ALWAYS scrolls the
  // chat and never the page (React's onWheel is passive and cannot do this).
  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    const onWheel = (e: WheelEvent) => { c.scrollTop += e.deltaY; e.preventDefault(); };
    c.addEventListener('wheel', onWheel, { passive: false });
    return () => c.removeEventListener('wheel', onWheel);
  }, [ctx?.scope]); // eslint-disable-line react-hooks/exhaustive-deps

  const ask = async (q: string) => {
    if (!q.trim() || busy || !ctx) return;
    // prior turns become conversation memory so follow-ups ("yes", "why?",
    // "compare to last year") work like a real conversation
    const history = msgs.slice(-8).map(m => ({ role: m.role, content: m.text }));
    setMsgs(m => [...m, { role: 'user', text: q }]);
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
    setBusy(true);
    const user = (window as unknown as { __compassUser?: { userId?: string } }).__compassUser;
    try {
      const r = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: ctx.symbol, question: q, facts: ctx.facts, userId: user?.userId, history }),
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
    } finally {
      setBusy(false);
      // after the user's first answered prompt (in any chat, once per browser),
      // ask for one-time session feedback before they continue
      let given = false;
      try { given = localStorage.getItem('compass_feedback_given') === '1'; } catch { /* ignore */ }
      if (!given && !askedRef.current) { askedRef.current = true; setFeedbackPending(true); }
    }
  };

  const FB: { n: number; label: string; words: string[] }[] = [
    { n: 1, label: 'Could be better', words: ['couldbebetter', 'better', 'bad'] },
    { n: 2, label: 'Useful', words: ['useful'] },
    { n: 3, label: 'Good', words: ['good'] },
    { n: 4, label: "It's crazzzy", words: ['crazzzy', 'crazy', 'itscrazzzy'] },
  ];

  const sendFeedback = async (rating: number) => {
    const user = (window as unknown as { __compassUser?: { userId?: string; email?: string } }).__compassUser;
    try {
      await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.userId, email: user?.email, rating, scope: ctx?.scope }),
      });
    } catch { /* never block the user */ }
    try { localStorage.setItem('compass_feedback_given', '1'); } catch { /* ignore */ }
    setFeedbackPending(false); setFbHint(''); setInput('');
  };

  // Route the composer: while feedback is pending, only a 1-4 answer proceeds.
  const handleSend = (text: string) => {
    const t = text.trim();
    if (feedbackPending) {
      const norm = t.toLowerCase().replace(/[^a-z0-9]/g, '');
      const hit = FB.find(f => norm === String(f.n) || f.words.includes(norm));
      if (hit) { void sendFeedback(hit.n); }
      else setFbHint('Please answer 1, 2, 3 or 4 to continue.');
      return;
    }
    void ask(t);
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

      <style>{`.compass-chat-scroll::-webkit-scrollbar{width:0;height:0;display:none}`}</style>
      <div
        ref={scrollRef}
        className="compass-chat-scroll"
        tabIndex={0}
        onKeyDown={e => {
          const c = scrollRef.current; if (!c) return;
          if (e.key === 'ArrowDown') { c.scrollTop += 60; e.preventDefault(); }
          else if (e.key === 'ArrowUp') { c.scrollTop -= 60; e.preventDefault(); }
          else if (e.key === 'PageDown') { c.scrollTop += c.clientHeight * 0.9; e.preventDefault(); }
          else if (e.key === 'PageUp') { c.scrollTop -= c.clientHeight * 0.9; e.preventDefault(); }
        }}
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', scrollbarWidth: 'none', msOverflowStyle: 'none', outline: 'none', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 } as React.CSSProperties}
      >
        {msgs.map((m, i) => (
          m.role === 'user' ? (
            <div key={i} ref={i === lastUserIdx ? anchorRef : undefined} style={{ alignSelf: 'flex-end', maxWidth: '90%', background: T.ink, color: T.inverse, padding: '9px 12px', borderRadius: 8, ...mono(12, T.inverse), scrollMarginTop: 12 }}>{m.text}</div>
          ) : (
            <div key={i} style={{ alignSelf: 'stretch', maxWidth: '100%' }}><Markdown text={m.text} /></div>
          )
        ))}
        {busy && <div style={mono(11, T.muted)}>› thinking…</div>}
        {/* tail spacer so a short answer can still scroll its question to the top */}
        <div style={{ minHeight: '60vh', flexShrink: 0 }} aria-hidden />
      </div>

      <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.borderSoft}` }}>
        {feedbackPending ? (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, ...mono(11, T.ink, 700) }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.ghost, display: 'inline-block' }} />
              How is NevUp doing this session?
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {FB.map(f => (
                <button key={f.n} onClick={() => sendFeedback(f.n)} style={{
                  background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 6,
                  padding: '5px 9px', cursor: 'pointer', ...mono(10.5, T.ink, 600),
                }}><b style={{ color: T.ghost }}>{f.n}</b> {f.label}</button>
              ))}
            </div>
            <div style={{ ...mono(9, fbHint ? T.red : T.faint), marginTop: 7 }}>
              {fbHint || 'Answer with 1, 2, 3 or 4 (click above or type it) to continue.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {ctx.chips.map(cc => (
              <button key={cc} onClick={() => handleSend(cc)} disabled={busy} style={{
                background: 'transparent', border: `1px solid ${T.border}`, ...mono(9.5, T.muted),
                padding: '4px 8px', cursor: busy ? 'default' : 'pointer',
              }}>{cc}</button>
            ))}
          </div>
        )}
        <form onSubmit={e => { e.preventDefault(); handleSend(input); }} style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
          <textarea
            ref={taRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
            placeholder={feedbackPending ? 'Type 1, 2, 3 or 4 to continue…' : 'Ask Anything!'}
            rows={1}
            style={{
              flex: 1, minWidth: 0, resize: 'none', maxHeight: 140, overflowY: 'auto',
              background: '#fff', border: `1px solid ${T.border}`, borderRight: 'none',
              borderRadius: '6px 0 0 6px', padding: '9px 11px', lineHeight: 1.45,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', ...mono(12, T.ink), outline: 'none',
            }}
          />
          <button type="submit" style={{ alignSelf: 'stretch', background: T.ink, color: T.inverse, border: 'none', borderRadius: '0 6px 6px 0', padding: '0 14px', ...mono(13, T.inverse, 700), cursor: 'pointer' }}>↑</button>
        </form>
        <div style={{ ...mono(9, T.faint), marginTop: 6 }}>Compass Analyst · grounded in real data on this page</div>
      </div>
    </div>
  );
}
