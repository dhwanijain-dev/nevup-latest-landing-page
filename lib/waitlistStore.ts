  export type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  isTrader: boolean;
  createdAt: string;
};

// Bump the storage key to clear any old local waitlist data
const STORAGE_KEY = "nevup_waitlist_v2";
const SHEETS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwOwTAfjaF_80D6pAWWvT9ZeZFQEOadA2j--At4rmY_OWHGo1kiCpr9I4_JgqgXWjhE/exec";

export type SheetsSyncResult = {
  ok: boolean;
  status: number;
  error?: string;
};

export function getWaitlist(): WaitlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WaitlistEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function addToWaitlist(entry: Omit<WaitlistEntry, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const current = getWaitlist();

  // Basic client-side dedupe by email (case-insensitive)
  const exists = current.some(
    (e) => e.email.toLowerCase() === entry.email.toLowerCase().trim(),
  );
  if (exists) {
    return null;
  }

  const full: WaitlistEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  const next = [full, ...current];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return full;
}

export async function sendToGoogleSheets(entry: WaitlistEntry): Promise<SheetsSyncResult> {
  try {
    // Use no-cors so the browser doesn't block the request on CORS;
    // this means we can't read the response, but the data will still
    // be delivered to the Apps Script Web App.
    await fetch(SHEETS_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...entry,
        isTrade: entry.isTrader,
      }),
    });

    // Treat as success; any server-side issues can be inspected in
    // Apps Script execution logs.
    return { ok: true, status: 0 };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err?.message || "Network error",
    };
  }
}
