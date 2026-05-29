"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ChevronRight,
  Menu,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navLinks = [
  { label: "How it works", href: "/how" },
  { label: "For brokerages", href: "/brokerage" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const trustPills = ["Crypto", "Forex", "Equities", "Futures", "Options"];

const problemStats = [
  { value: "72%", label: "of traders bleed money annually", note: "Source : FINRA 2023" },
  { value: "1%", label: "Main profitability  over 5 years", note: "The structural failure rate" },
  { value: "2000+ ", label: "In The NevUp ecosystem", note: "Waitlist Crypto Forex equities" },
];

const layers = [
  {
    number: "01",
    label: "Knows",
    title: "Insight",
    eyebrow: "Into your behavioural trading profile.",
    copy:
      "NevUp analyzes trading behavior in real time to identify patterns in decision-making, emotional responses, and habits unique to you.",
    kind: "insight" as const,
  },
  {
    number: "02",
    label: "Sees",
    title: "Awareness",
    eyebrow: "Through real-time AI behavioural monitoring.",
    copy:
      "NevUp watches the live session so it can flag impulsive entries, overexposure, and emotionally driven decisions before they snowball.",
    kind: "awareness" as const,
  },
  {
    number: "03",
    label: "Does",
    title: "Execution",
    eyebrow: "With personalised interventions designed to reduce emotionally driven decisions.",
    copy:
      "Personalized, context-aware interventions bring attention to the exact moment where emotion starts shaping execution.",
    kind: "execution" as const,
  },
];

const footerColumns = [
  {
    title: "Product",
    links: [
      ["How it works", "#how-it-works"],
      ["For brokerages", "#brokerages"],
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
      // ["Twitter / X", "https://twitter.com/nevup"],
      ["connect@nevup.in", "mailto:connect@nevup.in"],
    ],
  },
];

const pageStyles: CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  overflow: "hidden",
  backgroundColor: "#fff",
  color: "#000",
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

const eyebrowStyles: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "#f34301",
};

const cardShadow = "0 20px 50px rgba(0,0,0,0.05)";

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: 900 }}
    >
          <p style={eyebrowStyles}>{eyebrow}</p>
          <h2
        style={{
          marginTop: 16,
          fontFamily: "Funnel Display",
          fontSize: "clamp(2.3rem, 5vw, 4.4rem)",
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: "-0.05em",
              color: "#000",
        }}
      >
        {title}
      </h2>
          {description ? <p style={{ marginTop: 20, fontSize: 18, lineHeight: 1.8, color: "#c7c7cc" }}>{description}</p> : null}
    </motion.div>
  );
}

function LayerVisual({ kind }: { kind: (typeof layers)[number]["kind"] }) {
  if (kind === "insight") {
    return (
      <div style={{ borderRadius: 28, border: "1px solid rgba(0,0,0,0.1)", background: "#fcf7f1", padding: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: "#71717a" }}>Trader Profile</p>
            <p style={{ marginTop: 4, fontSize: 36, fontWeight: 600, color: "#0f1115" }}>847</p>
          </div>
          <div style={{ borderRadius: 999, background: "#0f1115", padding: "6px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "white" }}>Diamond tier</div>
        </div>
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {[
            ["Revenge trading", "78/100"],
            ["FOMO", "78/100"],
            ["Overtrading", "91/100"],
            ["Panic exit", "84/100"],
            ["Euphoric sizing", "62/100"],
          ].map(([name, score], index) => (
            <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderRadius: 20, border: "1px solid rgba(0,0,0,0.08)", background: "white", padding: "12px 16px" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#171717" }}>{name}</p>
                <div style={{ marginTop: 8, height: 8, width: 160, overflow: "hidden", borderRadius: 999, background: "rgba(0,0,0,0.06)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${54 + index * 7}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.08 * index, ease: "easeOut" }}
                    style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #f34301, #f2693f, #f47250)" }}
                  />
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f1115" }}>{score}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "awareness") {
    return (
      <div style={{ borderRadius: 28, border: "1px solid rgba(0,0,0,0.1)", background: "#0f1115", padding: 20, color: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)" }}>Live behavioral feed</p>
            <p style={{ marginTop: 4, fontSize: 14, color: "rgba(255,255,255,0.75)" }}>Today · Session 2 of 2 · 03:14 elapsed</p>
          </div>
          <div style={{ borderRadius: 999, border: "1px solid rgba(255,106,54,0.3)", background: "rgba(255,106,54,0.15)", padding: "6px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffb08c" }}>Live</div>
        </div>
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {[
            ["14:31:22", "Position size deviation", "1.7× over plan on SOL"],
            ["14:24:08", "Impulsive entry flagged", "BTC long · no setup match"],
            ["14:18:47", "Held discipline", "Passed on ETH dip-buy"],
            ["14:02:11", "Overexposure detected", "63% of capital in alts"],
            ["13:55:30", "Calm execution", "Stopped out cleanly · −0.3R"],
          ].map(([time, title, detail]) => (
            <div key={`${time}-${title}`} style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 12, borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", padding: "12px 16px" }}>
              <p style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{time}</p>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{title}</p>
                <p style={{ marginTop: 4, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 28, border: "1px solid rgba(0,0,0,0.1)", background: "#f7efe6", padding: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.08)" }}>
      <div style={{ borderRadius: 24, background: "#0f1115", padding: 20, color: "white", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.4)" }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)" }}>Intervention · Live · 14:32:18</p>
        <p style={{ marginTop: 16, fontSize: 20, fontWeight: 600, lineHeight: 1.25 }}>You&apos;re about to size 2× SOL after a winning streak.</p>
        <div style={{ marginTop: 20, borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", padding: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#ffb08c" }}>Euphoric sizing detected</p>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.72)" }}>The last 4 times you sized up after consecutive wins, average outcome was −$1,240.</p>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <button type="button" style={{ border: "none", borderRadius: 999, background: "white", padding: "10px 16px", color: "#0f1115", fontWeight: 700, cursor: "pointer" }}>Hold the size</button>
            <button type="button" style={{ borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", padding: "10px 16px", color: "rgba(255,255,255,0.8)", fontWeight: 700, cursor: "pointer" }}>Override anyway</button>
          </div>
        </div>
        <p style={{ marginTop: 16, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.45)" }}>Triggered by NevUp Agent · learned from 1,249 of your trades</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div style={pageStyles}>
      <div aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "-10%", top: "-8%", height: 512, width: 512, borderRadius: 999, background: "radial-gradient(circle, rgba(243,67,1,0.22) 0%, rgba(243,67,1,0.08) 35%, transparent 72%)", filter: "blur(48px)" }} />
        <div style={{ position: "absolute", right: "-6%", top: "12%", height: 416, width: 416, borderRadius: 999, background: "radial-gradient(circle, rgba(250,180,126,0.28) 0%, rgba(250,180,126,0.08) 42%, transparent 75%)", filter: "blur(48px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "18%", height: 352, width: 352, borderRadius: 999, background: "radial-gradient(circle, rgba(15,17,21,0.12) 0%, rgba(15,17,21,0.04) 38%, transparent 76%)", filter: "blur(48px)" }} />
      </div>

      <header style={{ position: "fixed", insetInline: 0, top: 0, zIndex: 50, borderBottom: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,250,245,0.8)", backdropFilter: "blur(24px)" }}>
        <div style={{ ...containerStyles, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, paddingBottom: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <Image src="/logo.png" alt="NevUp" width={1920} height={1080} priority style={{ display: "block", width: 104, height: 32 }} />
            {!isMobile ? <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: "#737373" }}></span> : null}
          </Link>

          {!isMobile ? (
            <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href} style={{ fontSize: 14, color: "#5f646c", textDecoration: "none" }}>{item.label}</Link>
              ))}
            </nav>
          ) : null}

          {!isMobile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/contact" style={{ borderRadius: 999, border: "1px solid rgba(0,0,0,0.1)", padding: "10px 16px", fontSize: 14, fontWeight: 700, color: "#3f3f46", textDecoration: "none" }}>Book a call</Link>
              <Link href="/waitlist" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, background: "#0f1115", padding: "10px 20px", fontSize: 14, fontWeight: 700, color: "white", textDecoration: "none", boxShadow: "0 14px 30px rgba(0,0,0,0.18)" }}>Join the waitlist <ArrowRight size={16} /></Link>
            </div>
          ) : (
            <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation menu" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 999, border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", color: "#292929" }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

        <AnimatePresence>
          {isMobile && menuOpen ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25, ease: "easeOut" }} style={{ borderTop: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,250,245,0.95)", padding: 20, backdropFilter: "blur(24px)" }}>
              <div style={{ ...containerStyles, display: "flex", flexDirection: "column", gap: 12 }}>
                {navLinks.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", background: "white", padding: "14px 16px", fontSize: 14, fontWeight: 500, color: "#3f3f46", textDecoration: "none" }}>{item.label}</Link>
                ))}
                <Link href="/waitlist" onClick={() => setMenuOpen(false)} style={{ borderRadius: 18, background: "#0f1115", padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "white", textAlign: "center", textDecoration: "none" }}>Join the waitlist</Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main id="top" style={{ position: "relative"}}>
        <section style={{ ...sectionStyles, paddingTop: 32, paddingBottom: 40,    background: "linear-gradient(125deg, rgb(230, 58, 0) 0%, rgb(243, 67, 1) 30%, rgb(242, 105, 63) 70%, rgb(248, 128, 96) 100%)" }}>
          <div style={{ ...containerStyles, display: "grid", gap: 32, alignItems: "center", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ maxWidth: 760 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.75)", padding: "8px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#5f646c", boxShadow: "0 12px 30px rgba(0,0,0,0.05)", backdropFilter: "blur(6px)" }}>
                <Sparkles size={14} color="#f34301" /> NevUp · The intervention layer
              </div>
              <h1 style={{ marginTop: 24, fontFamily: "Funnel Display", fontSize: "clamp(3rem, 7vw, 6.5rem)", fontWeight: 600, lineHeight: 0.95, letterSpacing: "-0.05em", color: "#ffffff" }}>
                Built for clear decisions in noisy markets.
              </h1>
              <p style={{ marginTop: 24, maxWidth: 720, fontSize: "clamp(1.05rem, 2vw, 1.2rem)", lineHeight: 1.8, color: "#ffffff", fontFamily: "var(--font-inter)" }}>
                Designed for the generation that won&apos;t accept a trading environment built against them.
              </p>
              <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 16 }}>
                <Link href="/waitlist" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, background: "#000000", padding: "12px 24px", fontSize: 14, fontWeight: 700, color: "white", textDecoration: "none", boxShadow: "0 18px 40px rgba(243,67,1,0.28)" }}>Join the waitlist <ArrowRight size={16} /></Link>
                <a href="#how-it-works" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.75)", padding: "12px 24px", fontSize: 14, fontWeight: 700, color: "#3f3f46", textDecoration: "none" }}>See how it works <ChevronRight size={16} /></a>
              </div>
            </motion.div>  
          </div>
        </section>

        <section style={{ ...sectionStyles,  background: "#0f1115" }}>
          <div style={{ width: "100%", paddingLeft: 24, paddingRight: 24 }}>
            <div style={{ width: "100%", background: "#0f1115", padding: 24, boxShadow: cardShadow, backdropFilter: "blur(6px)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.65)" }}>Trusted by traders across</p>
              <div style={{   display: "flex", flexWrap: "wrap",justifyContent:"center", alignItems:"center", gap: 12 }}>{trustPills.map((pill) => <span key={pill} style={{  display:"block",padding: "8px 14px", fontSize: 14, fontWeight: 500, color: "white" }}>{pill}</span>)}</div>

                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>20,000+ on the waitlist</p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="about" style={{ ...sectionStyles, paddingTop: 48, paddingBottom: 48 ,fontFamily: "Funnel Display" }}>
          <div style={{ ...containerStyles, display: "grid", gap: 32, alignItems: "start", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            <SectionTitle eyebrow="The problem"  title="You already know what to do. The problem is the moment you don't do it." />
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ fontSize: 18, lineHeight: 1.8, color: "#5f646c" }}>
              <p>A loss hits. Pressure builds. Judgment tilts. Every journal, every analytics tool, every post-session review helps you understand what went wrong.</p>
              <p style={{ marginTop: 16 }}><span style={{ fontWeight: 700, color: "#0f1115" }}>But they show up after.</span> They help you learn from the last mistake. They don&apos;t stop the next one.</p>
              <p style={{ marginTop: 16 }}>That gap between the moment discipline breaks and the moment damage is done is what NevUp was built for.</p>
            </motion.div>
          </div>

          <div style={{ ...containerStyles, marginTop: 32, display: "grid",  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {problemStats.map((stat, index) => (
              <motion.div
                key={stat.value}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "rgba(255,255,255,0.8)",
                  padding: 24,
                  // boxShadow: cardShadow,
                  borderLeft: index == 0 ? "none": "1px solid rgba(0,0,0,0.08)",
                  borderRight: index == problemStats.length - 1 ? "none": "1px solid rgba(0,0,0,0.08)",

                }}
              >
                <p style={{ fontFamily: "var(--font-outfit)", fontSize: 40, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.05em", color: "#f34301" }}>{stat.value}</p>
                <p style={{ marginTop: 16, fontSize: 18, fontWeight: 500, color: "#0f1115" }}>{stat.label}</p>
                <p style={{ marginTop: 8, fontSize: 14, color: "#737373" }}>{stat.note}</p>
              </motion.div>
            ))}
          </div>
          

          <div style={{ ...containerStyles, marginTop: 32 }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{    background: "transparent", padding: 24, color: "white", }}>
              <div style={{ display: "flex", flexWrap: "wrap", flexDirection:"column",alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: "#000" }}>What traders say</p>
                  <p style={{ marginTop: 8, fontSize: 50  ,color:"#000", fontWeight: 600 }}>&quot;That was me last Tuesday.&quot;</p>
                </div>
                <p style={{ maxWidth: 480, fontSize: 14, lineHeight: 1.7, color: "rgb(41, 41, 41)" }}>The demo lands because it catches the feeling that every trader knows too late: the instinct was visible before the loss was.</p>
              </div>
            </motion.div>
          </div>
        </section>
<section style={{ minHeight: "100vh", background:"rgb(10,10,10)", display: "flex", flexDirection: "column", width: "100%", paddingTop: 96, paddingBottom: 96, paddingLeft: 400, paddingRight: 400, gap: 48 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, width: "100%", flexWrap: "wrap" }}>
                <p style={{ margin: 0, maxWidth: 800, fontSize: 72, fontWeight: 700, lineHeight: 1.1, color: "rgb(255, 250, 226)" ,fontFamily: "Funnel Display"}}>Your portfolio, your behavior, one view.</p>  
                <p style={{ margin: 0, maxWidth: 420, fontSize: 18, lineHeight: 1.8, color: "rgb(255, 250, 226,0.72)", textAlign: "left" }}>The Home screen is where you start every session positions, P&amp;L, allocation, and the live behavioral layer underneath it all.</p>
              </div>
          <Image src="/launcpad3x.png" width={1920} height={1080} alt="Hero Image" />
        </section>
        <section id="how-it-works" style={{ ...sectionStyles, paddingTop: 48, paddingBottom: 48 }}>
          <div style={containerStyles}>
            <SectionTitle eyebrow="The product" title="Knows you. Sees the moment. Acts before it costs you." description="Three layers, one system. Each one builds on the last so by the time you click a position size, NevUp has already done the math you couldn't do in the moment." />
            <div style={{ marginTop: 40, display: "grid", gap: 24 }}>
              {layers.map((layer, index) => (
                <motion.div key={layer.number} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ display: "grid", gap: 24, borderRadius: 32, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", padding: 20, boxShadow: cardShadow, backdropFilter: "blur(6px)", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", alignItems: "center" }}>
                  <div style={{ order: index % 2 === 1 ? 2 : 0, maxWidth: 560 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#737373" }}>
                      <span style={{ borderRadius: 999, background: "#0f1115", padding: "6px 12px", color: "white" }}>{layer.number}</span>
                      <span>{layer.label}</span>
                    </div>
                    <h3 style={{ marginTop: 20, fontFamily: "var(--font-outfit)", fontSize: "clamp(2rem, 3.6vw, 3.2rem)", fontWeight: 600, lineHeight: 1.02, letterSpacing: "-0.05em", color: "#0f1115" }}>{layer.title}</h3>
                    <p style={{ marginTop: 16, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#f34301" }}>{layer.eyebrow}</p>
                    <p style={{ marginTop: 16, fontSize: 18, lineHeight: 1.8, color: "#5f646c" }}>{layer.copy}</p>
                  </div>
                  <div style={{ order: index % 2 === 1 ? 0 : 2 }}>
                    <LayerVisual kind={layer.kind} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="brokerages" style={{ ...sectionStyles, paddingTop: 48, paddingBottom: 48 }}>
          <div style={containerStyles}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ display: "grid", gap: 24, borderRadius: 36, border: "1px solid rgba(0,0,0,0.08)", background: "linear-gradient(135deg, rgba(243,67,1,0.96), rgba(242,105,63,0.94), rgba(244,114,80,0.92))", padding: 24, color: "white", boxShadow: "0 28px 80px rgba(243,67,1,0.22)", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)" }}>Trade smarter, not emotional.</p>
                <h2 style={{ marginTop: 16, fontFamily: "var(--font-outfit)", fontSize: "clamp(2.4rem, 4.8vw, 4.5rem)", fontWeight: 600, lineHeight: 1.02, letterSpacing: "-0.05em", color: "white" }}>Get early access before it opens.</h2>
                <p style={{ marginTop: 20, maxWidth: 720, fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.8)" }}>Share your details and be the first to he  ar and access when NevUp is ready.</p>
                <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 16 }}>
                  <Link href="/waitlist" style={{ borderRadius: 999, background: "white", padding: "12px 24px", fontSize: 14, fontWeight: 700, color: "#fff", backgroundColor: "#000", textDecoration: "none" }}>Join the waitlist <ArrowRight size={16} /></Link>
                  <a href="#how-it-works" style={{ borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", padding: "12px 24px", fontSize: 14, fontWeight: 700, color: "white", textDecoration: "none" }}>See how it works</a>
                </div>
              </div>

              <div style={{ borderRadius: 28, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.1)", padding: 20, backdropFilter: "blur(6px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 18, background: "white", color: "#f34301" }}><ShieldAlert size={20} /></div>
                  <div>
                    <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.6)" }}>Promise</p>
                    <p style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: "white" }}>Behavioral intervention without noise</p>
                  </div>
                </div>
                <div style={{ marginTop: 20, display: "grid", gap: 12, fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.78)" }}>
                  <p style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.08)", padding: 14 }}>Real-time alerts, not after-the-fact commentary.</p>
                  <p style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.08)", padding: 14 }}>Context-aware interventions tied to live session behavior.</p>
                  <p style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.08)", padding: 14 }}>A view built to help you hold discipline when the market tries to break it.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="contact" style={{ ...sectionStyles,  }}>
          <div >
            <footer style={{ border: "1px solid rgba(0,0,0,0.08)", background: "#0f1115", padding: "100px 400px" , color: "white", width: "100vw" }}>
              <div style={{ display: "grid", gap: 0, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Image src="/whitelogo.png" alt="NevUp" width={1920} height={1080} style={{ display: "block", width: 112, height: 34 }} />
                  </div>
                  <p style={{ marginTop: 16, maxWidth: 640, fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.72)" }}>NevUp AI is a behavioral intelligence layer for modern traders. Trusted by traders across crypto, forex, and equities.</p>
                  <p style={{ marginTop: 16, maxWidth: 760, fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>Trading in financial markets carries a high level of risk, including the potential loss of capital. NevUp AI is a behavioral analytics and intervention tool and is not a registered investment advisor or broker-dealer.</p>
                </div>

                <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
                  {footerColumns.map((column) => (
                    <div key={column.title}>
                      <p style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)" }}>{column.title}</p>
                      <div style={{ marginTop: 16, display: "grid", gap: 12, fontSize: 14, color: "rgba(255,255,255,0.72)" }}>
                        {column.links.map(([label, href]) => <a key={label} href={href} style={{ color: "inherit", textDecoration: "none" }}>{label}</a>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, justifyContent: "space-between" }}>
                  <p>© 2026 NevUp AI, Inc. All rights reserved. NevUp™ is a trademark of NevUp AI, Inc.</p>
                  <p style={{ fontWeight: 700, color: "rgba(255,255,255,0.72)" }}>Trade Smarter, Not Emotional.</p>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}