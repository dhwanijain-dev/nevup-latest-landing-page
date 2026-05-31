"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronRight, Menu, Moon, Sun, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type LayerKind = "insight" | "awareness" | "execution";

const navLinks = [
  { label: "How it works", href: "/how" },
  { label: "For Partners", href: "/brokerage" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const trustPills = ["Crypto", "Forex", "Equities", "Futures", "Options"];

const problemStats = [
  {
    value: "72%",
    label: "Of traders bleed money annually",
    note: "Source: FINRA, 2023",
  },
  {
    value: "1%",
    label: "Only 1% maintain profitability over 5 years",
    note: "(Barber et al., University of California, Davis (2010)",
  },
  {
    value: "80%",
    label: "Of traders quit within two years",
    note: "(Barber et al., University of California)",
  },
];

const layers: {
  number: string;
  label: string;
  title: string;
  eyebrow: string;
  copy: string;
  kind: LayerKind;
}[] = [
  {
    number: "01",
    label: "Knows",
    title: "Insight",
    eyebrow: "Into your behavioural trading profile.",
    copy:
      "NevUp analyzes trading behavior in real time to help identify patterns in decision-making, emotional responses, and trading habits unique to you.",
    kind: "insight",
  },
  {
    number: "02",
    label: "Sees",
    title: "Awareness",
    eyebrow: "Through real-time AI behavioural monitoring.",
    copy:
      "NevUp observes trading behavior to help identify patterns like impulsive entries, overexposure, or emotionally driven decisions before they escalate.",
    kind: "awareness",
  },
  {
    number: "03",
    label: "Does",
    title: "Execution",
    eyebrow:
      "With personalised interventions designed to reduce emotionally driven decisions.",
    copy:
      "Personalized, context-aware interventions that help bring attention to moments where emotion may begin influencing execution while trading.",
    kind: "execution",
  },
];

const footerColumns = [
  {
    title: "Product",
    links: [
      ["How it works", "#how"],
      ["For Brokerages", "#brokerages"],
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
      ["Twitter / X", "#contact"],
      ["Press kit", "#contact"],
      ["connect@nevup.in", "mailto:connect@nevup.in"],
    ],
  },
] as const;

function LayerVisual({ kind }: { kind: LayerKind }) {
  if (kind === "insight") {
    return (
      <div style={{ background: "#0a0a0a", borderRadius: 14, padding: 28, border: "1px solid #1f1f1f", boxShadow: "0 40px 80px -20px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "rgba(255,250,226,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Trader Profile</p>
            <span style={{ display: "block", marginTop: 10, fontFamily: "var(--font-geist-mono)", fontSize: 64, fontWeight: 700, lineHeight: 1, color: "white" }}>847</span>
            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ background: "#1f1f1f", color: "#a78bfa", fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", padding: "4px 10px", borderRadius: 4 }}>DIAMOND TIER</span>
              <span style={{ color: "#22c55e", fontFamily: "var(--font-geist-mono)", fontSize: 12 }}>↑ +23 pts this month</span>
            </div>
          </div>
          <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,250,226,0.55)" }}>Based on 1,249 trades</p>
        </div>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["Revenge Trading", "78", "#22d3ee"],
            ["FOMO", "78", "#3b82f6"],
            ["Overtrading", "91", "#22c55e"],
            ["Panic Exit", "84", "#7c5cff"],
            ["Euphoric Sizing", "62", "#f59e0b"],
          ].map(([name, score, color]) => (
            <div key={name} style={{ display: "grid", gridTemplateColumns: "140px 1fr 50px", gap: 14, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "white" }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: color }} />
                {name}
              </div>
              <div style={{ height: 5, background: "#1f1f1f", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 999 }} />
              </div>
              <span style={{ textAlign: "right", fontFamily: "var(--font-geist-mono)", color: "white", fontSize: 12 }}>
                {score}<span style={{ color: "rgba(255,250,226,0.55)" }}>/100</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "awareness") {
    return (
      <div style={{ background: "#0a0a0a", borderRadius: 14, padding: 26, border: "1px solid #1f1f1f", boxShadow: "0 40px 80px -20px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "white", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 14 }}>Live Behavioral Feed</p>
            <p style={{ color: "rgba(255,250,226,0.45)", fontFamily: "Satoshi, sans-serif", fontSize: 11, marginTop: 2 }}>Today · Session 2 of 2 · 03:14 elapsed</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#22c55e", fontFamily: "var(--font-geist-mono)", fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            LIVE
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          {[
            ["14:31:22", "Position size deviation", "1.7× over plan on SOL", "#f59e0b"],
            ["14:24:08", "Impulsive entry flagged", "BTC long · no setup match", "#22d3ee"],
            ["14:18:47", "Held discipline", "Passed on ETH dip-buy", "#22c55e"],
            ["14:02:11", "Overexposure detected", "63% of capital in alts", "#ef4444"],
            ["13:55:30", "Calm execution", "Stopped out cleanly · −0.3R", "#22c55e"],
          ].map(([time, title, detail, color], index, arr) => (
            <div key={`${time}-${title}`} style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 12, padding: "12px 0", borderBottom: index === arr.length - 1 ? "none" : "1px solid #1f1f1f" }}>
              <span style={{ fontFamily: "var(--font-geist-mono)", color: "rgba(255,250,226,0.55)", fontSize: 11, paddingTop: 2 }}>{time}</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: color }} />
                  <span style={{ color: "white", fontFamily: "Satoshi, sans-serif", fontSize: 13, fontWeight: 600 }}>{title}</span>
                </div>
                <p style={{ color: "rgba(255,250,226,0.45)", fontFamily: "Satoshi, sans-serif", fontSize: 12, marginTop: 4 }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 14, padding: 28, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.35)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: "#f59e0b", boxShadow: "0 0 8px #f59e0b" }} />
        <div style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f59e0b", fontWeight: 700 }}>Intervention · Live · 14:32:18</div>
      </div>
      <p style={{ fontFamily: "Funnel Display, sans-serif", fontWeight: 600, fontSize: 26, lineHeight: 1.25, color: "white" }}>You&apos;re about to size 2× SOL after a winning streak.</p>
      <div style={{ marginTop: 18, padding: 16, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10 }}>
        <p style={{ color: "#f59e0b", fontFamily: "Satoshi, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Euphoric Sizing detected</p>
        <p style={{ color: "#d8d8d8", fontFamily: "Satoshi, sans-serif", fontSize: 14, lineHeight: 1.55, marginTop: 10 }}>
          The last 4 times you sized up after consecutive wins average outcome was <span style={{ color: "#ef4444", fontFamily: "var(--font-geist-mono)", fontWeight: 600 }}>−$1,240</span>.
        </p>
        <p style={{ color: "#a8a8a8", fontFamily: "Satoshi, sans-serif", fontSize: 14, marginTop: 12 }}>Hold position size flat?</p>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="button" style={{ background: "linear-gradient(#3b82f6, #1e3a8a)", color: "white", borderRadius: 8, padding: "10px 16px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 13, boxShadow: "0 0 12px rgba(59,130,246,0.25)" }}>Hold the size</button>
          <button type="button" style={{ background: "transparent", color: "rgba(255,250,226,0.55)", border: "1px solid #1f1f1f", borderRadius: 8, padding: "9px 16px", fontFamily: "Satoshi, sans-serif", fontSize: 13 }}>Override anyway</button>
        </div>
      </div>
      <p style={{ marginTop: 18, fontFamily: "Satoshi, sans-serif", color: "rgba(255,250,226,0.55)", fontSize: 12 }}>Triggered by NevUp Agent · learned from 1,249 of your trades</p>
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const isMobile = useIsMobile();

  const vars: Record<string, string> = isDark
    ? {
        bgPage: "#0a0a0a",
        bgWarm: "#111111",
        fg: "#fffaf2",
        fgFaint: "rgba(255,250,226,0.7)",
        fgGhost: "rgba(255,250,226,0.45)",
        divider: "#1f1f1f",
        navBg: "rgba(10,10,10,0.7)",
        navBorder: "rgba(255,250,226,0.12)",
      }
    : {
        bgPage: "#f7f3ed",
        bgWarm: "#f2ece4",
        fg: "#0a0a0a",
        fgFaint: "#5a5a5a",
        fgGhost: "#767676",
        divider: "rgba(0,0,0,0.12)",
        navBg: "rgba(247,243,237,0.8)",
        navBorder: "rgba(0,0,0,0.1)",
      };

  const container: CSSProperties = {
    maxWidth: 1280,
    margin: "0 auto",
    paddingLeft: isMobile ? 20 : 40,
    paddingRight: isMobile ? 20 : 40,
  };

  return (
    <div style={{ background: vars.bgPage, color: vars.fg, position: "relative", overflowX: "hidden" }}>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: vars.navBg, borderBottom: `1px solid ${vars.navBorder}`, backdropFilter: "blur(14px) saturate(140%)" }}>
        <div style={{ ...container, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, paddingBottom: 20, gap: 20 }}>
          <Link href="#top" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/logo.png" alt="NevUp" width={160} height={30} style={{width:"500%", height:"500%",  }} />
          </Link>

          {!isMobile ? (
            <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} style={{ fontFamily: "Satoshi, sans-serif", fontSize: 14, fontWeight: 500, color: vars.fg, opacity: 0.85, textDecoration: "none", paddingBottom: 2, borderBottom: "1.5px solid transparent" }}>
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}

          {!isMobile ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button type="button" aria-label="Switch theme" title="Switch theme" onClick={() => setIsDark((v) => !v)} style={{ background: "transparent", color: vars.fg, border: `1px solid ${isDark ? "rgba(255,250,226,0.2)" : "rgba(0,0,0,0.15)"}`, borderRadius: 999, width: 38, height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <Link href="/contact" style={{ background: "transparent", color: vars.fg, border: `1px solid ${isDark ? "rgba(255,250,226,0.2)" : "rgba(0,0,0,0.15)"}`, borderRadius: 8, padding: "10px 18px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Book a Call</Link>
              <Link href="/waitlist" style={{ background: "#f34301", color: "#fffaf2", border: 0, borderRadius: 8, padding: "11px 18px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Join the Waitlist →</Link>
            </div>
          ) : (
            <button type="button" onClick={() => setMenuOpen((v) => !v)} style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${vars.navBorder}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: vars.fg }}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>

        <AnimatePresence>
          {isMobile && menuOpen ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ background: vars.navBg, borderTop: `1px solid ${vars.navBorder}`, padding: 20 }}>
              <div style={{ ...container, display: "grid", gap: 10 }}>
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{ borderRadius: 10, border: `1px solid ${vars.navBorder}`, padding: "12px 14px", fontFamily: "Satoshi, sans-serif", fontSize: 14, color: vars.fg, textDecoration: "none" }}>
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main id="top">
        <section style={{ position: "relative", minHeight: 760, overflow: "hidden", padding: isMobile ? "140px 20px 80px" : "180px 40px 120px", background: "linear-gradient(125deg, rgb(230, 58, 0) 0%, rgb(243, 67, 1) 30%, rgb(242, 105, 63) 70%, rgb(248, 128, 96) 100%)" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 70% at 0% 0%, rgba(184, 40, 0, 0.45) 0%, transparent 55%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(50% 60% at 100% 100%, rgba(255, 180, 140, 0.4) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"2\"/><feColorMatrix values=\"0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\"/></svg>')", opacity: 0.35, mixBlendMode: "overlay", pointerEvents: "none" }} />

          <div style={{ ...container, position: "relative", zIndex: 2 }}>
            <div style={{ maxWidth: isMobile ? "100%" : 880 }}>
              <p style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#fffaf2", opacity: 0.85 }}>NevUp · AI Behavioral Intelligence</p>
              <h1 style={{ fontFamily: "Funnel Display, sans-serif", fontWeight: 500, fontSize: isMobile ? 52 : 104, lineHeight: 0.96, letterSpacing: "-0.035em", color: "#fffaf2", marginTop: 28, textWrap: "balance" as const }}>
                Built for clear decisions in noisy markets.
              </h1>
              <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: isMobile ? 18 : 22, lineHeight: 1.5, color: "#fffaf2", marginTop: 32, maxWidth: 620, opacity: 0.92 }}>
                Designed for the generation that won&apos;t accept a trading environment built against them.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 44, flexWrap: "wrap" }}>
                <Link href="/waitlist" style={{ background: "#0a0a0a", color: "#fffaf2", border: 0, borderRadius: 10, padding: "17px 28px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 15, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Join the Waitlist <ArrowRight size={15} />
                </Link>
                <a href="#how" style={{ background: "transparent", color: "#fffaf2", border: "1px solid rgba(255,250,226,0.5)", borderRadius: 10, padding: "16px 28px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 15, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  See how it works <ChevronRight size={15} />
                </a>
              </div>
            </div>

            {!isMobile ? (
              <div style={{ position: "absolute", right: 0, top: 80, width: 360, transform: "rotate(-1.5deg)", zIndex: 3 }}>
                <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, boxShadow: "0 40px 80px rgba(0,0,0,0.45), 0 20px 40px rgba(0,0,0,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: "#f59e0b", boxShadow: "0 0 6px #f59e0b" }} />
                    <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#f59e0b", fontWeight: 700 }}>Intervention · 14:32</span>
                  </div>
                  <p style={{ fontFamily: "Funnel Display, sans-serif", fontWeight: 600, fontSize: 18, color: "white", lineHeight: 1.3 }}>You&apos;re about to size 2× SOL after a winning streak.</p>
                  <p style={{ marginTop: 12, color: "rgba(255,255,255,0.65)", fontFamily: "Satoshi, sans-serif", fontSize: 12, lineHeight: 1.5 }}>
                    Last 4 times: average outcome <span style={{ color: "#ef4444", fontFamily: "var(--font-geist-mono)", fontWeight: 600 }}>−$1,240</span>. Hold the size?
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section style={{ background: "#0a0a0a", color: "#fffaf2", padding: isMobile ? "22px 20px" : "32px 40px" }}>
          <div style={container}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,250,226,0.55)", fontWeight: 600 }}>Trusted by traders across</p>
              <div style={{ display: "flex", gap: isMobile ? 18 : 56, alignItems: "center", flexWrap: "wrap" }}>
                {trustPills.map((pill) => (
                  <span key={pill} style={{ fontFamily: "Funnel Display, sans-serif", fontSize: 22, color: "#fffaf2", fontWeight: 500, letterSpacing: "-0.01em" }}>{pill}</span>
                ))}
              </div>
              <p style={{ fontFamily: "var(--font-geist-mono)", fontSize: 13, color: "#fffaf2", padding: "8px 14px", border: "1px solid rgba(255,250,226,0.2)", borderRadius: 999 }}>800+ waitlist signups</p>
            </div>
          </div>
        </section>

        <section id="about" style={{ padding: isMobile ? "90px 20px" : "140px 40px", background: vars.bgPage, color: vars.fg }}>
          <div style={container}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 36 : 80, alignItems: "start" }}>
              <div>
                <p style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: vars.fg, opacity: 0.6 }}></p>
                <h2 style={{ fontFamily: "Funnel Display, sans-serif", fontWeight: 500, fontSize: isMobile ? 42 : 64, lineHeight: 1.02, letterSpacing: "-0.025em", color: vars.fg, marginTop: 20, textWrap: "balance" as const }}>
                  The missing layer in every <br />
                  <span style={{ color: vars.fgFaint }}>trader&apos;s setup.</span>
                </h2>
              </div>

              <div style={{ paddingTop: isMobile ? 0 : 12 }}>
                <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 20, lineHeight: 1.6, color: vars.fgFaint }}>NevUp sits alongside every session and learns how you specifically trade.</p>
                <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 18, lineHeight: 1.6, color: vars.fgFaint, marginTop: 22 }}>
                  It learns your patterns, tracks them live, and puts your own data in front of you, bringing awareness to self-sabotaging behaviors in the moments they emerge. The longer you trade with it, the sharper it gets.

 {/* <strong style={{ color: vars.fg }}>But they show up after.</strong> They help you learn from the last mistake. They don&apos;t stop the next one. */}

                </p>
                {/* <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 18, lineHeight: 1.6, color: vars.fgFaint, marginTop: 22 }}>
                  That gap between the moment discipline breaks and the moment damage is done is what NevUp was built for.
                </p> */}
              </div>
            </div>

            <div style={{ marginTop: 80, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", borderTop: `1px solid ${vars.divider}`, borderBottom: `1px solid ${vars.divider}` }}>
              {problemStats.map((stat, index) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: index * 0.14 }} style={{ padding: "40px 36px", borderLeft: index === 0 ? "none" : `1px solid ${vars.divider}` }}>
                  <p style={{ fontFamily: "Funnel Display, sans-serif", fontWeight: 600, fontSize: isMobile ? 60 : 88, lineHeight: 1, letterSpacing: "-0.03em", color: "#f34301" }}>{stat.value}</p>
                  <p style={{ fontFamily: "Funnel Display, sans-serif", fontSize: 20, color: vars.fg, marginTop: 18, lineHeight: 1.3, fontWeight: 500, maxWidth: 280 }}>{stat.label}</p>
                  <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 12, color: vars.fgGhost, marginTop: 10, letterSpacing: "0.06em" }}>{stat.note}</p>
                </motion.div>
              ))}
            </div>

            <div style={{ margin: "96px auto 0", textAlign: "center", maxWidth: 880 }}>
              <p style={{ fontFamily: "Funnel Display, sans-serif", fontStyle: "italic", fontWeight: 500, fontSize: isMobile ? 38 : 56, lineHeight: 1.1, letterSpacing: "-0.02em", color: vars.fg }}>&quot;Awareness after the trade
is just expensive hindsight
&quot;</p>
              <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 16, lineHeight: 1.6, color: vars.fgFaint, marginTop: 24, textWrap: "pretty" as const }}>
                That is why we work in real time. 
              </p>
            </div>
          </div>
        </section>

        <section style={{ background: "#0a0a0a", padding: isMobile ? "80px 20px" : "120px 40px", color: "#fffaf2" }}>
          <div style={container}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", alignItems: "end", marginBottom: 56, gap: 60 }}>
              <div>
                {/* <p style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#fffaf2", opacity: 0.6 }}>The product · Home</p> */}
                <h2 style={{ fontFamily: "Funnel Display, sans-serif", fontWeight: 500, fontSize: isMobile ? 42 : 64, lineHeight: 1.02, letterSpacing: "-0.025em", color: "#fffaf2", marginTop: 18, textWrap: "balance" as const }}>Your portfolio, your behavior, one view.</h2>
              </div>
              <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 18, lineHeight: 1.6, color: "rgba(255,250,226,0.7)", maxWidth: 380, margin: 0 }}>
                {/* The Home screen is where you start every session positions, P&amp;L, allocation, and the live behavioral layer underneath it all. */}
              </p>
            </div>

            <div style={{ width: "100%", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 14, overflow: "hidden", boxShadow: "0 60px 120px -40px rgba(0,0,0,0.5), 0 30px 60px -20px rgba(0,0,0,0.35)" }}>
              <Image src="/launcpad3x.png" alt="NevUp Home preview" width={1920} height={1080} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "rgba(255,250,226,0.45)", flexWrap: "wrap", gap: 12 }}>
              <span>NevUp Home · v2.1 · Live preview</span>
              <span>Updated in real time every 2 seconds</span>
            </div>
          </div>
        </section>

        <section id="how" style={{ padding: isMobile ? "90px 20px" : "100px 40px", background: vars.bgWarm, color: vars.fg }}>
          <div style={container}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: isMobile ? 24 : 48, alignItems: "end", marginBottom: 80 }}>
              <h2 style={{ fontFamily: "Funnel Display, sans-serif", fontWeight: 500, fontSize: isMobile ? 42 : 64, lineHeight: 1.02, letterSpacing: "-0.025em", color: vars.fg, margin: "0 auto", textWrap: "balance" as const, textAlign: "center", width: "100%", maxWidth: isMobile ? "100%" : 1320 }}>
                Every trader knows their patterns. The hard part is seeing them in the moment they matter. That&apos;s what <span style={{ color: "#f34301" }}>NevUp</span> is built for.
              </h2>
              {/* <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 18, lineHeight: 1.6, color: vars.fgFaint, margin: 0, maxWidth: 460 }}>
                Three layers, one system. Each one builds on the last so by the time you click a position size, NevUp has already done the math you couldn&apos;t do in the moment.
              </p> */}
            </div>

            {layers.map((layer, index) => (
              <motion.div key={layer.number} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.76, ease: [0.16, 1, 0.3, 1] }} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 80, alignItems: "center", padding: "64px 0", borderTop: `1px solid ${vars.divider}` }}>
                <div style={{ order: isMobile ? 1 : index % 2 === 1 ? 2 : 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 16, color: "#f34301" }}>
                    <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, fontWeight: 600, letterSpacing: "0.05em" }}>{layer.number}</span>
                    <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: vars.fg }}>{layer.label}</span>
                  </div>
                  <h3 style={{ fontFamily: "Funnel Display, sans-serif", fontWeight: 500, fontSize: isMobile ? 42 : 64, lineHeight: 1.02, letterSpacing: "-0.025em", color: vars.fg, marginTop: 18 }}>{layer.title}</h3>
                  <p style={{ fontFamily: "Funnel Display, sans-serif", fontSize: 20, lineHeight: 1.6, color: vars.fg, marginTop: 14, fontWeight: 400 }}>{layer.eyebrow}</p>
                  <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 17, lineHeight: 1.6, color: vars.fgFaint, marginTop: 22, maxWidth: 480 }}>{layer.copy}</p>
                </div>
                <div style={{ order: isMobile ? 2 : index % 2 === 1 ? 1 : 2 }}>
                  <LayerVisual kind={layer.kind} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section
  aria-label="How cards"
  style={{
    background: "rgb(242, 236, 228)",
    padding: isMobile ? "40px 20px" : "40px 20px",
    color: "#0a0a0a",
    width: "100%",
    boxSizing: "border-box",
  }}
>

  <div style={container}>
    <h2 style={{
      fontFamily: "Funnel Display, sans-serif",
      fontWeight: 600,
      fontSize: isMobile ? 28 : 40,
      lineHeight: 1.04,
      letterSpacing: "-0.02em",
      color: vars.fg,
      textAlign: "center",
      margin: "0 auto 28px",
      maxWidth: isMobile ? "100%" : 920,
    }}>How it works</h2>
    <div
    style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: 24,
      alignItems: "stretch",
      width: "100%",
    }}
  >
    <div
      style={{
        background: "#ffffff",
        padding: 32,
        borderRadius: 16,
        border: "1px solid rgba(10,10,10,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h3
  style={{
    fontFamily: "Funnel Display, sans-serif",
    fontWeight: 700,
    fontSize: 24,
    color: "#f34301",
    margin: 0,
  }}
>
        Your behavioral profile
      </h3>
      <p
        style={{
          fontFamily: "Satoshi, sans-serif",
          fontSize: 15,
          lineHeight: 1.6,
          color: "#0a0a0a",
          margin: 0,
        }}
      >
        NevUp analyzes trading behavior in real time to help identify patterns
        in decision-making, emotional responses, and trading habits unique to
        you.
      </p>
    </div>

    <div
      style={{
        background: "#ffffff",
        padding: 32,
        borderRadius: 16,
        border: "1px solid rgba(10,10,10,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h3
  style={{
    fontFamily: "Funnel Display, sans-serif",
    fontWeight: 700,
    fontSize: 24,
    color: "#f34301",
    margin: 0,
  }}
>
        Real time AI monitoring
      </h3>
      <p
        style={{
          fontFamily: "Satoshi, sans-serif",
          fontSize: 15,
          lineHeight: 1.6,
          color: "#0a0a0a",
          margin: 0,
        }}
      >
        NevUp observes trading behavior in real time to help identify patterns
        like impulsive entries, overexposure, or emotionally driven decisions
        before they escalate.
      </p>
    </div>

    <div
      style={{
        background: "#ffffff",
        padding: 32,
        borderRadius: 16,
        border: "1px solid rgba(10,10,10,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h3
  style={{
    fontFamily: "Funnel Display, sans-serif",
    fontWeight: 700,
    fontSize: 24,
    color: "#f34301",
    margin: 0,
  }}
>
        Personalized intervention
      </h3>
      <p
        style={{
          fontFamily: "Satoshi, sans-serif",
          fontSize: 15,
          lineHeight: 1.6,
          color: "#0a0a0a",
          margin: 0,
        }}
      >
        Personalized, context-aware interventions that help bring attention to
        moments where emotion may begin influencing execution while trading.
      </p>
    </div>
  </div>
  </div>

</section>

        <section id="brokerages" style={{ padding: isMobile ? "90px 20px" : "120px 40px", background: vars.bgPage, color: vars.fg }}>
          <div style={{ maxWidth: 920, margin: "0 auto", textAlign: "center" }}>
            {/* <p style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: vars.fg, opacity: 0.6 }}>Trade Smarter, Not Emotional.</p> */}
            <h2 style={{ fontFamily: "Funnel Display, sans-serif", fontWeight: 500, fontSize: isMobile ? 42 : 64, lineHeight: 1.02, letterSpacing: "-0.025em", color: vars.fg, marginTop: 22 }}>Get early access</h2>
            <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 19, lineHeight: 1.6, color: vars.fgFaint, margin: "24px auto 0", maxWidth: 600 }}>
              Join NevUp's first user cohort and get access before public launch.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 44, flexWrap: "wrap" }}>
              <Link href="/waitlist" style={{ background: "#f34301", color: "#fffaf2", border: 0, borderRadius: 10, padding: "17px 30px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 16, textDecoration: "none", display: "inline-flex", gap: 8, alignItems: "center" }}>
                Join the Waitlist <ArrowRight size={16} />
              </Link>
              <a href="#how" style={{ background: "transparent", color: vars.fg, border: "1px solid rgba(0,0,0,0.18)", borderRadius: 10, padding: "16px 30px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
                See how it works
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" style={{ background: "#0a0a0a", color: "#fffaf2", padding: isMobile ? "64px 20px 24px" : "72px 40px 32px" }}>
        <div style={container}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr 1fr 1fr 1fr", gap: 48, paddingBottom: 56, borderBottom: "1px solid rgba(255,250,226,0.1)" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <Image src="/whitelogo.png" width={160} height={32} alt="NevUp" style={{ width: "100%", height: "100%" }} />
              </div>
              <p style={{ fontFamily: "Funnel Display, sans-serif", fontSize: 22, lineHeight: 1.3, color: "#fffaf2", marginTop: 22, maxWidth: 320, fontWeight: 400 }}>Built for clear decisions in noisy markets.</p>
              <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 13, color: "rgba(255,250,226,0.55)", marginTop: 18, lineHeight: 1.6, maxWidth: 320 }}>NevUp AI is a behavioral intelligence layer for modern traders. Trusted by traders across crypto, forex, and equities.</p>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,250,226,0.45)", fontWeight: 600 }}>{column.title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
                  {column.links.map(([label, href]) => (
                    <a key={label} href={href} style={{ fontFamily: "Satoshi, sans-serif", fontSize: 14, color: "#fffaf2", textDecoration: "none", opacity: 0.85 }}>
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "rgba(255,250,226,0.45)", flexWrap: "wrap", gap: 12 }}>
            <span>© 2026 NevUp AI, Inc. All rights reserved. NevUp™ is a trademark of NevUp AI, Inc.</span>
            <span>Trade Smarter, Not Emotional.</span>
          </div>

          <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,250,226,0.3)", marginTop: 24, lineHeight: 1.6, maxWidth: 900 }}>
            Risk disclosure: Trading in financial markets carries a high level of risk, including the potential loss of capital. NevUp AI is a behavioral analytics and intervention tool and is not a registered investment advisor or broker-dealer. NevUp does not provide trading recommendations, execute trades, or take custody of funds. Past performance does not guarantee future results.
          </p>
        </div>
      </footer>
    </div>
  );
}
