"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navLinks = [
  { label: "How it works", href: "/how" },
  { label: "For Brokerages", href: "/brokerage" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const problemStats = [
  { value: "72%", label: "of traders bleed money annually", note: "Source: FINRA 2023" },
  { value: "1%", label: "main profitability over 5 years", note: "The structural failure rate" },
  { value: "2000+", label: "in the NevUp ecosystem", note: "Waitlist crypto forex equities" },
];

const behaviorPatterns = [
  { title: "Revenge Trading", copy: "Doubling down to recover from a loss.", dot: "#22d3ee" },
  { title: "FOMO", copy: "Chasing a green candle you didn't plan for.", dot: "#3b82f6" },
  { title: "Overtrading", copy: "Entering when nothing in your system says so.", dot: "#22c55e" },
  { title: "Panic Exit", copy: "Closing a winning position on a tick of volatility.", dot: "#7c5cff" },
  { title: "Euphoric Sizing", copy: "Adding size after wins, breaking your risk rules.", dot: "#f59e0b" },
  { title: "Social Influence", copy: "Trading what you saw in the group chat.", dot: "#facc15" },
  { title: "Loss Spiral", copy: "Three losses in, you can't stop pulling the trigger.", dot: "#ef4444" },
  { title: "Averaging Down", copy: "Adding to a losing position instead of cutting.", dot: "#ec4899" },
];

const steps = [
  { number: "01", title: "Detect", copy: "The model recognizes a behavioral pattern forming: sizing, timing, and sequence of trades." },
  { number: "02", title: "Surface", copy: "An intervention appears in the moment, grounded in your specific history with that pattern." },
  { number: "03", title: "Decide", copy: "You choose to hold, modify, or override. NevUp learns from what you do next." },
];

const heatmapAssets = [
  ["BTC", "$54.2k", "+5.12%", "#0f8374"],
  ["ETH", "$3,082", "+2.84%", "#064e3b"],
  ["SOL", "$208", "+7.32%", "#16a34a"],
  ["AVAX", "$41.30", "-2.18%", "#3a0e0e"],
  ["BNB", "$612", "+0.94%", "#064e3b"],
  ["TON", "$7.14", "+4.20%", "#0f8374"],
  ["LINK", "$18.40", "-0.55%", "#3a0e0e"],
  ["DOT", "$8.12", "-3.65%", "#a64d47"],
  ["ARB", "$1.42", "-6.40%", "#dc2626"],
  ["OP", "$2.21", "-4.10%", "#a64d47"],
  ["AAVE", "$176", "+3.55%", "#0f8374"],
  ["MKR", "$1,820", "+1.20%", "#064e3b"],
  ["NEAR", "$5.86", "+6.12%", "#16a34a"],
  ["RNDR", "$9.42", "+8.05%", "#16a34a"],
  ["MATIC", "$0.62", "-7.95%", "#dc2626"],
  ["ATOM", "$10.12", "-1.85%", "#3a0e0e"],
  ["FET", "$1.85", "+9.22%", "#16a34a"],
  ["INJ", "$31.40", "+2.40%", "#064e3b"],
  ["TIA", "$8.40", "-2.95%", "#3a0e0e"],
];

const footerColumns = [
  {
    title: "Product",
    links: [
      ["How it works", "/how"],
      ["For Brokerages", "/brokerage"],
      ["Join the waitlist", "/waitlist"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "#about"],
      ["Team", "#about"],
      ["Contact", "#contact"],
      ["Newsletter", "#contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "#contact"],
      ["Terms of Service", "#contact"],
      ["Risk Disclosure", "#contact"],
      ["Cookie Policy", "#contact"],
      ["Security", "#contact"],
    ],
  },
  {
    title: "Connect",
    links: [
      ["LinkedIn", "https://www.linkedin.com/company/nevup/"],
      ["Twitter / X", "https://twitter.com/nevup"],
      ["hello@nevup.in", "mailto:connect@nevup.in"],
    ],
  },
];

const pageStyles: CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  overflow: "hidden",
  backgroundColor: "#ffffff",
  color: "#0f1115",
};

const containerStyles: CSSProperties = {
  width: "100%",
  maxWidth: 1280,
  margin: "0 auto",
  paddingLeft: 24,
  paddingRight: 24,
};

const sectionStyles: CSSProperties = {
  width: "100%",
};

const headingFont = { fontFamily: "Funnel Display, sans-serif" } as CSSProperties;
const bodyFont = { fontFamily: "Satoshi, sans-serif" } as CSSProperties;
const accent = "#f34301";

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div style={{ maxWidth: 900 }}>
      <p style={{ ...bodyFont, fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: accent }}>{eyebrow}</p>
      <h2 style={{ ...headingFont, marginTop: 18, fontWeight: 500, fontSize: "clamp(2.4rem, 5vw, 4.2rem)", lineHeight: 1.02, letterSpacing: "-0.03em", color: "#0f1115", textWrap: "balance" }}>
        {title}
      </h2>
      {description ? <p style={{ ...bodyFont, marginTop: 22, fontSize: 18, lineHeight: 1.7, color: "#5f646c", maxWidth: 720, textWrap: "pretty" }}>{description}</p> : null}
    </div>
  );
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div id="root" data-screen-label="/how" style={pageStyles}>
      <div aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "-10%", top: "-8%", height: 512, width: 512, borderRadius: 999, background: "radial-gradient(circle, rgba(243,67,1,0.22) 0%, rgba(243,67,1,0.08) 35%, transparent 72%)", filter: "blur(48px)" }} />
        <div style={{ position: "absolute", right: "-6%", top: "12%", height: 416, width: 416, borderRadius: 999, background: "radial-gradient(circle, rgba(250,180,126,0.28) 0%, rgba(250,180,126,0.08) 42%, transparent 75%)", filter: "blur(48px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "18%", height: 352, width: 352, borderRadius: 999, background: "radial-gradient(circle, rgba(15,17,21,0.12) 0%, rgba(15,17,21,0.04) 38%, transparent 76%)", filter: "blur(48px)" }} />
      </div>

      <header style={{ position: "fixed", insetInline: 0, top: 0, zIndex: 50, borderBottom: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,250,245,0.84)", backdropFilter: "blur(14px) saturate(140%)" }}>
        <div style={{ ...containerStyles, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingBottom: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/logo.png" width={1920} height={1080} alt="NevUp" style={{ display: "inline-block", width: 100, height: 20, objectFit: "contain", flexShrink: 0 }} />
          </Link>

          {!isMobile ? (
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {navLinks.map((item) => (
                <a key={item.href} href={item.href} style={{ ...bodyFont, fontSize: 14, fontWeight: 500, color: "#000", opacity: item.href === "#how" ? 1 : 0.85, textDecoration: "none", paddingBottom: 2, borderBottom: item.href === "#how" ? "1.5px solid #000" : "1.5px solid transparent" }}>
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}

          {!isMobile ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button aria-label="Switch to dark mode" title="Switch to dark mode" style={{ background: "transparent", color: "#000", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 999, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
              </button>
              <button style={{ background: "transparent", color: "#000", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "10px 18px", ...bodyFont, fontWeight: 600, fontSize: 13, cursor: "pointer" }} type="button">Book a Call</button>
              <Link href="/waitlist" style={{ background: accent, color: "rgb(255,250,226)", border: 0, borderRadius: 8, padding: "11px 18px", ...bodyFont, fontWeight: 600, fontSize: 13, cursor: "pointer", textDecoration: "none" }}>Join the Waitlist →</Link>
            </div>
          ) : (
            <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation menu" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 999, border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", color: "#292929" }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

        {isMobile && menuOpen ? (
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,250,245,0.95)", padding: 20, backdropFilter: "blur(24px)" }}>
            <div style={{ ...containerStyles, display: "flex", flexDirection: "column", gap: 12 }}>
              {navLinks.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "white", padding: "14px 16px", fontSize: 14, fontWeight: 500, color: "#3f3f46", textDecoration: "none" }}>
                  {item.label}
                </a>
              ))}
              <Link href="/waitlist" onClick={() => setMenuOpen(false)} style={{ borderRadius: 18, background: "#0f1115", padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "white", textAlign: "center", textDecoration: "none" }}>
                Join the waitlist
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main id="top" style={{ position: "relative" }}>
        <section style={{ ...sectionStyles, paddingTop: 180, paddingBottom: 80, paddingLeft: 40, paddingRight: 40, background: "linear-gradient(180deg, #fff7ef 0%, #fff4eb 100%)", color: "#0f1115" }}>
          <div style={{ ...containerStyles }}>
            <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#0f1115", opacity: 0.6 }}>How it works</div>
            <h1 style={{ ...headingFont, fontWeight: 500, fontSize: "clamp(3.5rem, 7vw, 5rem)", lineHeight: 0.96, letterSpacing: "-0.03em", color: "#0f1115", margin: "20px 0 0", maxWidth: 980, textWrap: "balance" }}>
              Three layers between you and the next bad click.
            </h1>
            <p style={{ ...bodyFont, fontSize: 20, lineHeight: 1.6, color: "#5f646c", margin: "28px 0 0", maxWidth: 720, textWrap: "pretty" }}>
              NevUp is not a journal or a coach. It is an intervention layer that sits in your trading flow, learns your behavior, and acts in the moment before the cost is paid.
            </p>
          </div>
        </section>

        <section id="about" style={{ ...sectionStyles, padding: "120px 40px", background: "#ffffff", color: "#0f1115" }}>
          <div style={{ ...containerStyles, marginBottom: 64 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "end" }}>
              <h2 style={{ ...headingFont, fontWeight: 500, fontSize: "clamp(3rem, 5vw, 4.2rem)", lineHeight: 1.02, letterSpacing: "-0.025em", color: "#0f1115", margin: 0, textWrap: "balance" }}>
                Name the moment.
                <br />
                <span style={{ color: "#8b8b8b" }}>That's how you stop it.</span>
              </h2>
              <p style={{ ...bodyFont, fontSize: 18, lineHeight: 1.6, color: "#6b7280", margin: 0, maxWidth: 480, paddingBottom: 8, textWrap: "pretty" }}>
                NevUp tracks behavioral patterns with the same vocabulary across your product, your debriefs, and your dashboard. The more you see them named, the faster you recognize them yourself.
              </p>
            </div>
          </div>

          <div style={{ ...containerStyles, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {behaviorPatterns.map((item, index) => (
              <motion.div key={item.title} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} style={{ background: "#fafafa", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 24, minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "default", boxShadow: "0 20px 50px rgba(0,0,0,0.04)" }}>
                <div>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.dot, marginBottom: 22 }} />
                  <div style={{ ...headingFont, fontWeight: 500, fontSize: 22, color: "#0f1115", letterSpacing: "-0.015em", lineHeight: 1.15 }}>{item.title}</div>
                </div>
                <div style={{ ...bodyFont, fontSize: 13.5, color: "#6b7280", lineHeight: 1.55, marginTop: 14 }}>{item.copy}</div>
              </motion.div>
            ))}
          </div>

          <div style={{ ...containerStyles, marginTop: 96, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            {steps.map((step, index) => (
              <div key={step.number} style={{ padding: "40px 32px", borderLeft: index === 0 ? "none" : "1px solid rgba(0,0,0,0.08)" }}>
                <span style={{ ...bodyFont, color: accent, fontSize: 13, letterSpacing: "0.06em" }}>{step.number}</span>
                <div style={{ ...headingFont, fontWeight: 500, fontSize: 32, color: "#0f1115", marginTop: 8 }}>{step.title}</div>
                <p style={{ ...bodyFont, fontSize: 15, lineHeight: 1.6, color: "#6b7280", margin: "16px 0 0", maxWidth: 300 }}>{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "140px 40px", background: "#0a0a0a", color: "rgb(255,250,226)" }}>
          <div style={containerStyles}>
            <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto 56px" }}>
              <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgb(255,250,226)", opacity: 0.6 }}>See it work</div>
              <h2 style={{ ...headingFont, fontWeight: 500, fontSize: "clamp(2.75rem, 5vw, 4rem)", lineHeight: 1.02, letterSpacing: "-0.025em", color: "rgb(255,250,226)", margin: "18px 0 0" }}>
                Watch a <span style={{ color: "#f5a80b", fontStyle: "italic", display: "inline-block", minWidth: 220, textAlign: "center" }}>FOMO</span> trade get intervened in real time before execution.
              </h2>
              <p style={{ ...bodyFont, fontSize: 19, lineHeight: 1.6, color: "rgba(255,250,226,0.7)", margin: "22px auto 0", maxWidth: 640, textWrap: "pretty" }}>
                The Home screen is your portfolio. The Agent overlays a behavioral layer on top of it. When patterns are detected, the intervention surfaces inline.
              </p>
            </div>

            <div style={{ width: "100%", background: "#0a0a0a", border: "1px solid rgb(31,31,31)", borderRadius: 14, overflow: "hidden", boxShadow: "rgba(0,0,0,0.5) 0 60px 120px -40px, rgba(0,0,0,0.35) 0 30px 60px -20px", display: "flex", minHeight: 680, position: "relative" }}>
              <aside style={{ width: 76, minWidth: 76, background: "#000", borderRight: "1px solid rgb(31,31,31)", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
                <div style={{ marginBottom: 24 }}>
                  <Image src="/logo.png" alt="NevUp" width={22} height={22} style={{ display: "inline-block", width: 22, height: 22, objectFit: "contain", flexShrink: 0 }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", padding: "0 8px" }}>
                  {["Home", "Sessions", "Patterns", "Debriefs"].map((label, index) => (
                    <div key={label} style={{ padding: "10px 0", borderRadius: 8, background: index === 0 ? "rgb(22,22,22)" : "transparent", display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center", ...bodyFont, fontSize: 9.5, color: index === 0 ? "rgb(255,250,226)" : "rgb(107,107,109)" }}>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </aside>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid rgb(31,31,31)", background: "#0a0a0a" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "rgb(15,15,15)", border: "1px solid rgb(31,31,31)", borderRadius: 8, width: 320 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6B6D" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                      <span style={{ color: "rgb(107,107,109)", ...bodyFont, fontSize: 12 }}>Search assets, patterns, sessions…</span>
                      <span style={{ marginLeft: "auto", color: "rgb(68,68,68)", ...bodyFont, fontSize: 10, padding: "2px 6px", border: "1px solid rgb(31,31,31)", borderRadius: 4 }}>⌘K</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "rgba(47,107,255,0.08)", border: "1px solid rgba(47,107,255,0.3)", borderRadius: 999 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "rgb(59,130,246)", boxShadow: "rgb(59,130,246) 0 0 6px" }} />
                      <span style={{ color: "rgb(168,195,255)", ...bodyFont, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>Agent Mode</span>
                    </div>
                    <div style={{ padding: "6px 12px", background: "rgb(15,15,15)", border: "1px solid rgb(31,31,31)", borderRadius: 8, ...bodyFont, fontSize: 11, color: "rgb(167,139,250)", fontWeight: 600, letterSpacing: "0.08em" }}>PRO</div>
                  </div>
                </header>

                <div style={{ padding: "20px 24px 28px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ ...headingFont, color: "rgb(255,255,255)", fontSize: 24, fontWeight: 600 }}>Home</div>
                      <div style={{ color: "rgb(138,138,138)", ...bodyFont, fontSize: 12, marginTop: 2 }}>Your portfolio at a glance · Updated 2s ago</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {["1D", "1W", "1M", "3M", "6M", "1Y", "All"].map((period) => (
                        <div key={period} style={{ background: period === "1M" ? "rgb(22,22,22)" : "transparent", color: "rgb(138,138,138)", border: "1px solid rgb(31,31,31)", padding: "6px 12px", borderRadius: 6, ...bodyFont, fontSize: 11 }}>{period}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "rgb(13,13,13)", border: "1px solid rgb(31,31,31)", borderRadius: 12, padding: 22 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr auto auto", gap: 24, alignItems: "baseline" }}>
                      <div>
                        <div style={{ color: "rgb(90,90,90)", ...bodyFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Total Value</div>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontVariantNumeric: "tabular-nums", color: "rgb(255,255,255)", fontSize: 34, fontWeight: 700, display: "block", marginTop: 6 }}>$230,846.12</span>
                        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ background: "rgba(34,197,94,0.12)", color: "rgb(34,197,94)", padding: "3px 9px", borderRadius: 4, ...bodyFont, fontSize: 11, fontWeight: 600 }}>↑ +$28,540 · +14.12%</span>
                          <span style={{ color: "rgb(107,107,109)", ...bodyFont, fontSize: 11 }}>Last 30 days</span>
                        </div>
                      </div>
                      <div><div style={{ color: "rgb(90,90,90)", ...bodyFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Total Invested</div><span style={{ fontFamily: "JetBrains Mono, monospace", fontVariantNumeric: "tabular-nums", color: "rgb(255,255,255)", fontSize: 17, fontWeight: 600, display: "block", marginTop: 8 }}>$202,305.94</span></div>
                      <div><div style={{ color: "rgb(90,90,90)", ...bodyFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Total Profit</div><span style={{ fontFamily: "JetBrains Mono, monospace", fontVariantNumeric: "tabular-nums", color: "rgb(34,197,94)", fontSize: 17, fontWeight: 600, display: "block", marginTop: 8 }}>+$28,540.18</span></div>
                      <div><div style={{ color: "rgb(90,90,90)", ...bodyFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Realized P&amp;L</div><span style={{ fontFamily: "JetBrains Mono, monospace", fontVariantNumeric: "tabular-nums", color: "rgb(34,197,94)", fontSize: 17, fontWeight: 600, display: "block", marginTop: 8 }}>+$12,418.30</span></div>
                      <div><div style={{ color: "rgb(90,90,90)", ...bodyFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>All-Time Return</div><span style={{ fontFamily: "JetBrains Mono, monospace", fontVariantNumeric: "tabular-nums", color: "rgb(34,197,94)", fontSize: 17, fontWeight: 600, display: "block", marginTop: 8 }}>+45.6%</span></div>
                      <div style={{ background: "linear-gradient(rgb(59,130,246), rgb(30,58,138))", color: "rgb(255,255,255)", border: "1px solid rgba(96,165,250,0.5)", padding: "10px 16px", borderRadius: 8, ...bodyFont, fontWeight: 600, fontSize: 13 }}>+ Deposit</div>
                      <div style={{ background: "rgb(15,15,15)", color: "rgb(255,255,255)", border: "1px solid rgb(31,31,31)", padding: "10px 16px", borderRadius: 8, ...bodyFont, fontSize: 13 }}>Withdraw ↓</div>
                    </div>

                    <div style={{ marginTop: 18 }}>
                      <svg viewBox="0 0 1200 200" preserveAspectRatio="none" style={{ width: "100%", height: 200, display: "block" }}>
                        <defs>
                          <linearGradient id="phGrnFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,200 L0,162.58 L75,151.61 L150,157.09 L225,146.13 L300,132.42 L375,140.65 L450,124.19 L525,113.23 L600,121.45 L675,102.26 L750,85.81 L825,91.29 L900,69.35 L975,52.90 L1050,58.39 L1125,36.45 L1200,20 L1200,200 Z" fill="url(#phGrnFill)" />
                        <path d="M0,162.58 L75,151.61 L150,157.09 L225,146.13 L300,132.42 L375,140.65 L450,124.19 L525,113.23 L600,121.45 L675,102.26 L750,85.81 L825,91.29 L900,69.35 L975,52.90 L1050,58.39 L1125,36.45 L1200,20" fill="none" stroke="#22C55E" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {[["Crypto", "$142,820", "61.9% of portfolio", "rgb(34,197,94)"], ["Stocks", "$58,920", "25.5% of portfolio", "rgb(59,130,246)"], ["DeFi", "$18,106", "7.8% of portfolio", "rgb(124,92,255)"], ["Cash & Stable", "$11,000", "4.8% of portfolio", "rgb(245,158,11)"]].map(([label, value, note, tone]) => (
                      <div key={label as string} style={{ background: "rgb(15,15,15)", border: "1px solid rgb(31,31,31)", borderRadius: 12, padding: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: tone as string }} />
                          <span style={{ color: "rgb(138,138,138)", ...bodyFont, fontSize: 12 }}>{label as string}</span>
                        </div>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontVariantNumeric: "tabular-nums", color: "rgb(255,255,255)", fontSize: 24, fontWeight: 700, display: "block", marginTop: 10 }}>{value as string}</span>
                        <div style={{ color: "rgb(90,90,90)", ...bodyFont, fontSize: 11, marginTop: 4 }}>{note as string}</div>
                        <div style={{ height: 4, background: "rgb(31,31,31)", borderRadius: 999, marginTop: 12, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: label === "Crypto" ? "61.9%" : label === "Stocks" ? "25.5%" : label === "DeFi" ? "7.8%" : "4.8%", background: tone as string }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ position: "absolute", right: 28, top: 110, width: 320, background: "rgb(16,16,16)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 12, padding: 18, boxShadow: "rgba(0,0,0,0.55) 0 40px 80px, rgba(245,158,11,0.18) 0 0 40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "rgb(245,158,11)", boxShadow: "rgb(245,158,11) 0 0 6px" }} />
                  <span style={{ color: "rgb(245,158,11)", ...bodyFont, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>Intervention · Live · 14:32</span>
                </div>
                <div style={{ ...headingFont, fontWeight: 600, fontSize: 17, color: "rgb(255,255,255)", lineHeight: 1.3 }}>You're about to size 2× SOL after a winning streak.</div>
                <div style={{ color: "rgb(168,168,168)", ...bodyFont, fontSize: 12, lineHeight: 1.5, marginTop: 10 }}>
                  The last 4 times you did this, average outcome was <span style={{ fontFamily: "JetBrains Mono, monospace", fontVariantNumeric: "tabular-nums", color: "rgb(239,68,68)", fontWeight: 600 }}>−$1,240</span>. Hold the size flat?
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                  <div style={{ background: "linear-gradient(rgb(59,130,246), rgb(30,58,138))", color: "rgb(255,255,255)", borderRadius: 8, padding: "7px 12px", ...bodyFont, fontWeight: 600, fontSize: 11 }}>Hold the size</div>
                  <div style={{ background: "transparent", color: "rgb(138,138,138)", border: "1px solid rgb(31,31,31)", borderRadius: 8, padding: "6px 12px", ...bodyFont, fontSize: 11 }}>Override</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, ...bodyFont, fontSize: 12, color: "rgba(255,250,226,0.45)", flexWrap: "wrap", gap: 12 }}>
              <span>NevUp Home · with live intervention overlay</span>
              <span>Agent Mode · v2.1 · 1,249 trades indexed</span>
            </div>
          </div>
        </section>

        <section style={{ padding: "140px 40px", background: "#111111", color: "rgb(255,250,226)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "end", marginBottom: 56 }}>
              <div>
                <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgb(255,250,226)", opacity: 0.6 }}>Market context</div>
                <h2 style={{ ...headingFont, fontWeight: 500, fontSize: "clamp(3rem, 5vw, 4.2rem)", lineHeight: 1.02, letterSpacing: "-0.025em", color: "rgb(255,250,226)", margin: "18px 0 0" }}>Behavior is shaped by what the market is doing.</h2>
              </div>
              <p style={{ ...bodyFont, fontSize: 18, lineHeight: 1.6, color: "rgba(255,250,226,0.7)", margin: 0, maxWidth: 480 }}>The Patterns dashboard pairs your behavioral score with the live market environment so the intervention engine knows whether you're trading into a green tape, a red flush, or something stranger in between.</p>
            </div>

            <div style={{ background: "rgb(13,13,13)", border: "1px solid rgb(31,31,31)", borderRadius: 14, padding: 26, boxShadow: "rgba(0,0,0,0.4) 0 40px 80px -20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ ...headingFont, fontWeight: 600, fontSize: 22, color: "rgb(255,255,255)" }}>Market Heatmap</div>
                  <div style={{ ...bodyFont, fontSize: 12, color: "rgb(138,138,138)", marginTop: 4 }}>Performance by asset · last 24h · sized by market cap</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridTemplateRows: "repeat(4, 80px)", gap: 5 }}>
                {heatmapAssets.map((asset, index) => (
                  <div key={`${asset[0]}-${index}`} style={{ background: asset[3] as string, color: "rgb(255,250,226)", padding: 14, borderRadius: 6, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 60, position: "relative", overflow: "hidden", gridColumn: index === 0 ? "span 2" : index === 1 ? "span 2" : index === 12 ? "span 2" : "span 1", gridRow: index < 2 ? "span 2" : index === 12 ? "span 2" : "span 1" }}>
                    <div style={{ ...headingFont, fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "rgb(255,250,226)" }}>{asset[0] as string}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "rgba(255,250,226,0.78)" }}>{asset[1] as string}</span>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 600, color: "rgb(255,250,226)" }}>{asset[2] as string}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "140px 40px", background: "#fff7ef", color: "#0f1115" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 80, alignItems: "start" }}>
              <div>
                <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#0f1115", opacity: 0.6 }}>The foundation</div>
                <h2 style={{ ...headingFont, fontWeight: 500, fontSize: "clamp(3rem, 5vw, 4.2rem)", lineHeight: 1.02, letterSpacing: "-0.025em", color: "#0f1115", margin: "18px 0 0" }}>Built to scale with the modern trader.</h2>
                <p style={{ ...bodyFont, fontSize: 18, lineHeight: 1.6, color: "#5f646c", margin: "24px 0 0", maxWidth: 540 }}>NevUp is built on a foundation of proprietary technology designed to scale with the modern trader: purpose-built models for behavioral pattern detection, a personalization layer that adapts to your specific history, and an intervention engine that runs in the moment with zero workflow friction.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ["Behavioral models", "Purpose-built, not generic LLMs", "Small, specialized models trained on trader behavioral patterns. Fast enough to run inline. Specific enough to recognize your patterns."],
                  ["Personalization", "Trained on your history", "The model uses your stated plan, your past trades, and the moments you have broken before so every intervention is grounded in lived context, not theory."],
                  ["Intervention engine", "In-the-moment, not after", "Interventions surface inline at the moment of decision never as a daily report, never as a post-session debrief."],
                  ["Roadmap", "HRV & biometric integration", "Heart-rate variability monitoring and other biometric signals are on the near-term roadmap as an additional input to behavioral state detection."],
                ].map(([tag, title, copy]) => (
                  <div key={tag as string} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 22, display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, alignItems: "start" }}>
                    <div style={{ ...bodyFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, fontWeight: 700, padding: "6px 10px", border: "1px solid rgba(243,67,1,0.4)", borderRadius: 6, width: "fit-content", whiteSpace: "nowrap", height: "fit-content" }}>{tag as string}</div>
                    <div>
                      <div style={{ ...headingFont, fontSize: 22, color: "#0f1115", fontWeight: 500, letterSpacing: "-0.015em" }}>{title as string}</div>
                      <p style={{ ...bodyFont, fontSize: 15, lineHeight: 1.6, color: "#5f646c", margin: "8px 0 0" }}>{copy as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" style={{ background: "#0a0a0a", color: "rgb(255,250,226)", padding: "72px 40px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", gap: 48, paddingBottom: 56, borderBottom: "1px solid rgba(255,250,226,0.1)" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "rgb(255,255,255)" }}>
                <Image src="/whitelogo.png" alt="NevUp" width={32} height={32} style={{ display: "inline-block", width: 32, height: 32, objectFit: "contain", flexShrink: 0 }} />
                <span style={{ ...headingFont, fontWeight: 700, fontSize: 25, letterSpacing: "-0.025em", color: "rgb(255,255,255)", lineHeight: 1 }}>NevUp</span>
              </div>
              <div style={{ ...headingFont, fontSize: 22, lineHeight: 1.3, color: "rgb(255,250,226)", marginTop: 22, maxWidth: 320, fontWeight: 400 }}>Built for clear decisions in noisy markets.</div>
              <div style={{ ...bodyFont, fontSize: 13, color: "rgba(255,250,226,0.55)", marginTop: 18, lineHeight: 1.6, maxWidth: 320 }}>NevUp AI is a behavioral intelligence layer for modern traders. Trusted by traders across crypto, forex, and equities.</div>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <div style={{ ...bodyFont, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,250,226,0.45)", fontWeight: 600 }}>{column.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
                  {column.links.map(([label, href]) => (
                    <a key={label as string} href={href as string} style={{ ...bodyFont, fontSize: 14, color: "rgb(255,250,226)", textDecoration: "none", opacity: 0.85 }}>
                      {label as string}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, ...bodyFont, fontSize: 12, color: "rgba(255,250,226,0.45)", flexWrap: "wrap", gap: 12 }}>
            <span>© 2026 NevUp AI, Inc. All rights reserved. NevUp™ is a trademark of NevUp AI, Inc.</span>
            <span>Trade Smarter, Not Emotional.</span>
          </div>

          <div style={{ ...bodyFont, fontSize: 11, color: "rgba(255,250,226,0.3)", marginTop: 24, lineHeight: 1.6, maxWidth: 900 }}>
            Risk disclosure: Trading in financial markets carries a high level of risk, including the potential loss of capital. NevUp AI is a behavioral analytics and intervention tool and is not a registered investment advisor or broker-dealer. NevUp does not provide trading recommendations, execute trades, or take custody of funds. Past performance does not guarantee future results.
          </div>
        </div>
      </footer>
    </div>
  );
}
