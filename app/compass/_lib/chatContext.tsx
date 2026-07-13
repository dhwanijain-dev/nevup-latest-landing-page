'use client';
// Shared chat context. Whatever page is active (Insights or Explorer) publishes
// its real grounding here; the single right-side ChatDock in the terminal shell
// reads it. This keeps one analyst chat that is always about what you are
// currently looking at, grounded in real data.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface ChatCtx {
  scope: string;                 // stable key; resets the conversation when it changes
  title: string;                 // header line
  subtitle: string;              // small italic line under the header
  symbol?: string;               // passed to /api/chat (drives DB personalization)
  greeting: string;              // first assistant message
  chips: string[];               // suggested questions
  facts: Record<string, unknown>; // the real figures the model is grounded on
}

interface Store { ctx: ChatCtx | null; set: (c: ChatCtx | null) => void }
const Ctx = createContext<Store>({ ctx: null, set: () => {} });

export function ChatProvider({ children }: { children: ReactNode }) {
  const [ctx, set] = useState<ChatCtx | null>(null);
  const value = useMemo(() => ({ ctx, set }), [ctx]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useChat = () => useContext(Ctx);

/** A page calls this to publish its current grounding. Cleared on unmount. */
export function usePublishChat(ctx: ChatCtx | null) {
  const { set } = useChat();
  const key = ctx ? ctx.scope : '';
  useEffect(() => {
    set(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
