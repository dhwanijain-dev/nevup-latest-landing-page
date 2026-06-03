"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/* ── colour tokens ───────────────────────────────────────── */
const LIGHT = {
  "--bg-page": "#f7f3ed",
  "--bg-warm": "#f2ece4",
  "--bg-soft": "#eee8e0",
  "--fg": "#0a0a0a",
  "--fg-muted": "#3a3a3a",
  "--fg-faint": "#5a5a5a",
  "--fg-ghost": "#767676",
  "--card-bg": "#ffffff",
  "--card-border": "rgba(0,0,0,0.08)",
  "--divider": "rgba(0,0,0,0.12)",
  "--divider-soft": "rgba(0,0,0,0.08)",
} as const;

const DARK = {
  "--bg-page": "#0a0a0a",
  "--bg-warm": "#111111",
  "--bg-soft": "#151515",
  "--fg": "#fffaf2",
  "--fg-muted": "rgba(255,250,226,0.85)",
  "--fg-faint": "rgba(255,250,226,0.7)",
  "--fg-ghost": "rgba(255,250,226,0.45)",
  "--card-bg": "rgba(255,255,255,0.04)",
  "--card-border": "rgba(255,250,226,0.1)",
  "--divider": "#1f1f1f",
  "--divider-soft": "rgba(255,250,226,0.08)",
} as const;

const STORAGE_KEY = "nevup-theme";

/* ── context ─────────────────────────────────────────────── */
type ThemeCtx = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  isDark: false,
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/* ── provider ────────────────────────────────────────────── */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* Initialise from localStorage → system preference */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") {
      setIsDark(true);
    } else if (stored === "light") {
      setIsDark(false);
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    setMounted(true);
  }, []);

  /* Apply CSS custom properties whenever isDark changes */
  useEffect(() => {
    if (!mounted) return;
    const tokens = isDark ? DARK : LIGHT;
    const root = document.documentElement;

    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark, mounted]);

  const toggleTheme = useCallback(() => setIsDark((v) => !v), []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
