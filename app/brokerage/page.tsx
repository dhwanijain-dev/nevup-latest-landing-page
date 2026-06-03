import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";

const navLinks = [
  { label: "How it works", href: "/how" },
  { label: "For Partners", href: "/brokerage", active: true },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const partnerStats = [
  {
    value: "$487B",
    copy: "Lost annually by retail traders to behavioral errors",
  },
  {
    value: "70%",
    copy: "Of prop firm accounts blown on a behavior, not a strategy",
  },
  {
    value: "~2 wks",
    copy: "Average integration time, drop-in API",
  },
  {
    value: "Zero",
    copy: "Migration · NevUp sits on top of your existing stack",
  },
];

const integrationBullets = [
  "No replatforming sits on top of your OMS",
  "Branded white-label option for your terminal",
  "SOC 2-ready · data residency configurable",
  "Behavioral debrief reports for your retention team",
];

const partnerBenefits = [
  {
    tag: "Retention",
    title: "Traders who manage their behavior stay on your books longer.",
    copy: "Behavioral interventions reduce account blow-ups. Lower churn means higher lifetime value per funded trader.",
  },
  {
    tag: "Consistency",
    title: "Smoother trader equity curves, less catastrophic loss.",
    copy: "When the worst days are caught early, payout volatility drops and your firm's risk profile improves.",
  },
  {
    tag: "Selection",
    title: "Behavioral data signals which traders graduate.",
    copy: "Beyond P&L, our pattern scoring helps you identify the disciplined operators before the rest of the market does.",
  },
  {
    tag: "Trust",
    title: "A platform that protects traders earns their loyalty.",
    copy: "The generation entering markets now expects behavioral safety as a baseline not a premium feature.",
  },
];

const headingFont: CSSProperties = {
  fontFamily: "Funnel Display, sans-serif",
};

const bodyFont: CSSProperties = {
  fontFamily: "Satoshi, sans-serif",
};

const containerStyles: CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto",
  width: "100%", // Ensures it scales down below 1280px screen widths
};

export default function Page() {
  return (
    <div id="root" data-screen-label="/brokerage" style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--fg)", width: "100%", overflowX: "hidden" }}>
      <LandingNavbar />

      <div className="page-fade" style={{ width: "100%" }}>
        {/* HERO SECTION */}
        <section 
          style={{ 
            // 40px padding on desktop, drops smoothly down to a safe 5% gutter on tiny mobile devices
            padding: "180px min(5%, 40px) 80px", 
            position: "relative", 
            background: "var(--bg-page)", 
            color: "var(--fg)" 
          }}
        >
          <div style={containerStyles}>
            <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>
              For Brokerages &amp; Prop Firms
            </div>
            <h1 
              style={{ 
                ...headingFont, 
                fontWeight: 500, 
                // Clamped text: maintains exactly 80px on desktop viewports, shrinks down smoothly on mobile phones
                fontSize: "min(80px, 12vw)", 
                lineHeight: 0.96, 
                letterSpacing: "-0.03em", 
                color: "var(--fg)", 
                margin: "20px 0 0", 
                textWrap: "balance" 
              }}
            >
              Behavioral intelligence, embedded in your infrastructure.
            </h1>
            <p style={{ ...bodyFont, fontSize: "min(20px, 5vw)", lineHeight: 1.6, color: "var(--fg-muted)", margin: "28px 0 0", textWrap: "pretty", maxWidth: 720 }}>
              NevUp integrates directly into your existing platform. No migration, no disruption. Purpose-built behavioral models, personalized to each trader, running live during every session. Available for platforms, funds, and firms ready to give their traders a genuine edge.
            </p>
          </div>
        </section>

        {/* PARTNER CALL TO ACTION (CTA) SECTION */}
        <section 
          style={{ 
            padding: "100px min(5%, 40px)", 
            position: "relative", 
            background: "var(--bg-warm)", 
            color: "var(--fg)" 
          }}
        >
          <div style={{ maxWidth: 920, margin: "0 auto", textAlign: "center", width: "100%" }}>
            <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>
              Partner with NevUp
            </div>
            <h2 
              style={{ 
                ...headingFont, 
                fontWeight: 500, 
                // Exactly 56px on desktop, naturally downscales on mobile viewports
                fontSize: "min(56px, 9.5vw)", 
                lineHeight: 1.02, 
                letterSpacing: "-0.025em", 
                color: "var(--fg)", 
                margin: "20px 0 0", 
                textWrap: "balance" 
              }}
            >
              Book a partnership conversation.
            </h2>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40, flexWrap: "wrap", width: "100%" }}>
              <a
                href="https://cal.com/nevup-ai/nevup-for-partners"
                style={{
                  background: "var(--accent)",
                  color: "rgb(255, 250, 226)",
                  border: 0,
                  borderRadius: 10,
                  padding: "17px 30px",
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "background 160ms, transform 80ms",
                  textDecoration: "none",
                  textAlign: "center",
                  // Full button width on small screens, stays bounded on desktop layouts
                  width: "calc(100% - 60px)",
                  maxWidth: "320px"
                }}
              >
                Book a Partnership Call →
              </a>
            </div>
          </div>
        </section>
      </div>

      <LandingFooter />
    </div>
  );
}