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

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "For Brokerages", href: "/brokerage" },
      { label: "Join the waitlist", href: "/waitlist" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Team", href: "/about#team" },
      { label: "Contact", href: "/contact" },
      { label: "Newsletter", href: "/contact#newsletter" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/contact" },
      { label: "Terms of Service", href: "/contact" },
      { label: "Risk Disclosure", href: "/contact" },
      { label: "Cookie Policy", href: "/contact" },
      { label: "Security", href: "/contact" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/company/nevup/", external: true },
      { label: "Twitter / X", href: "https://twitter.com/nevup", external: true },
      { label: "Press kit", href: "/contact" },
      { label: "hello@nevup.in", href: "mailto:connect@nevup.in", external: true },
    ],
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
};

export default function Page() {
  return (
    <div id="root" data-screen-label="/brokerage" style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--fg)" }}>
      <LandingNavbar />

      <div className="page-fade">
        <section style={{ padding: "180px 40px 80px", position: "relative", background: "var(--bg-page)", color: "var(--fg)" }}>
          <div style={containerStyles}>
            <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>For Brokerages &amp; Prop Firms</div>
            <h1 style={{ ...headingFont, fontWeight: 500, fontSize: 80, lineHeight: 0.96, letterSpacing: "-0.03em", color: "var(--fg)", margin: "20px 0 0", textWrap: "balance" }}>
              Behavioral intelligence, embedded in your infrastructure.
            </h1>
            <p style={{ ...bodyFont, fontSize: 20, lineHeight: 1.6, color: "var(--fg-muted)", margin: "28px 0 0", textWrap: "pretty", maxWidth: 720 }}>
             NevUp integrates directly into your existing platform. No migration, no disruption. Purpose-built behavioral models, personalized to each trader, running live during every session. Available for platforms, funds, and firms ready to give their traders a genuine edge.

            </p>
          </div>
        </section>

        {/* <section style={{ padding: "80px 40px", position: "relative", background: "var(--bg-soft)", color: "var(--fg)" }}>
          <div style={containerStyles}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
              {partnerStats.map((item) => (
                <div key={item.value}>
                  <div style={{ ...headingFont, fontWeight: 600, fontSize: 56, lineHeight: 1, color: "var(--accent)", letterSpacing: "-0.025em" }}>{item.value}</div>
                  <div style={{ ...bodyFont, fontSize: 14, color: "var(--fg-muted)", marginTop: 14, lineHeight: 1.45 }}>{item.copy}</div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* <section style={{ padding: "140px 40px", position: "relative", background: "rgb(10, 10, 10)", color: "rgb(255, 255, 255)" }}>
          <div style={containerStyles}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
              <div>
                <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgb(255, 250, 226)", opacity: 0.6 }}>Integration</div>
                <h2 style={{ ...headingFont, fontWeight: 500, fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.025em", color: "rgb(255, 250, 226)", margin: "18px 0 0", textWrap: "balance" }}>Drop in. Don't migrate.</h2>
                <p style={{ ...bodyFont, fontSize: 17, lineHeight: 1.6, color: "rgba(255, 250, 226, 0.75)", margin: "24px 0 0", textWrap: "pretty" }}>
                  NevUp connects to your existing order management and trader terminal through a clean API. Your traders keep their platform; NevUp adds the behavioral layer underneath.
                </p>
                <p style={{ ...bodyFont, fontSize: 17, lineHeight: 1.6, color: "rgba(255, 250, 226, 0.75)", margin: "18px 0 0", textWrap: "pretty" }}>
                  Our success is structurally tied to yours traders who manage their behavior retain longer, trade more consistently, and stay on your books.
                </p>

                <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 10, maxWidth: 460 }}>
                  {integrationBullets.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2693F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }} aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ ...bodyFont, fontSize: 15, color: "rgba(255, 250, 226, 0.85)", lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgb(13, 13, 13)", border: "1px solid rgb(31, 31, 31)", borderRadius: 16, padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div style={{ ...bodyFont, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--fg-ghost)", fontWeight: 600 }}>Integration · ~2 weeks</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgb(34, 197, 94)", fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgb(34, 197, 94)", boxShadow: "0 0 8px rgb(34, 197, 94)" }} />
                    API live
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ padding: 22, borderRadius: 12, background: "rgb(22, 22, 22)", border: "1px solid rgb(31, 31, 31)" }}>
                    <div style={{ ...headingFont, fontSize: 22, fontWeight: 500, color: "rgb(255, 255, 255)" }}>Your existing OMS</div>
                    <div style={{ ...bodyFont, fontSize: 13, color: "rgb(138, 138, 138)", marginTop: 6 }}>Trade signals in no change to your stack</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", color: "var(--fg-faint)", fontSize: 14, fontFamily: "JetBrains Mono, monospace" }}>↓</div>

                  <div style={{ padding: 22, borderRadius: 12, background: "linear-gradient(rgb(243, 67, 1) 0%, rgb(190, 95, 35) 100%)", border: "1px solid rgba(255, 250, 226, 0.3)" }}>
                    <div style={{ ...headingFont, fontSize: 22, fontWeight: 500, color: "rgb(255, 250, 226)" }}>NevUp Behavioral Layer</div>
                    <div style={{ ...bodyFont, fontSize: 13, color: "rgba(255, 250, 226, 0.85)", marginTop: 6 }}>Pattern detection · intervention · debrief</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", color: "var(--fg-faint)", fontSize: 14, fontFamily: "JetBrains Mono, monospace" }}>↓</div>

                  <div style={{ padding: 22, borderRadius: 12, background: "rgb(22, 22, 22)", border: "1px solid rgb(31, 31, 31)" }}>
                    <div style={{ ...headingFont, fontSize: 22, fontWeight: 500, color: "rgb(255, 255, 255)" }}>Your trader's terminal</div>
                    <div style={{ ...bodyFont, fontSize: 13, color: "rgb(138, 138, 138)", marginTop: 6 }}>Same UI · zero migration friction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* <section style={{ padding: "140px 40px", position: "relative", background: "var(--bg-page)", color: "var(--fg)" }}>
          <div style={containerStyles}>
            <div style={{ marginBottom: 60, maxWidth: 720 }}>
              <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>What partners get</div>
              <h2 style={{ ...headingFont, fontWeight: 500, fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.025em", color: "var(--fg)", margin: "18px 0 0", textWrap: "balance" }}>Aligned by design.</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {partnerBenefits.map((item) => (
                <div
                  key={item.tag}
                  style={{
                    opacity: 1,
                    transform: "translateY(0px)",
                    transition: "transform 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 760ms cubic-bezier(0.16, 1, 0.3, 1)",
                    willChange: "opacity, transform",
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 14,
                    padding: 32,
                  }}
                >
                  <div style={{ ...bodyFont, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700 }}>{item.tag}</div>
                  <div style={{ ...headingFont, fontWeight: 500, fontSize: 26, color: "var(--fg)", marginTop: 14, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{item.title}</div>
                  <p style={{ ...bodyFont, fontSize: 15, lineHeight: 1.6, color: "var(--fg-faint)", margin: "14px 0 0", textWrap: "pretty" }}>{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        <section style={{ padding: "100px 40px", position: "relative", background: "var(--bg-warm)", color: "var(--fg)" }}>
          <div style={{ maxWidth: 920, margin: "0 auto", textAlign: "center" }}>
            <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>Partner with NevUp</div>
            <h2 style={{ ...headingFont, fontWeight: 500, fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.025em", color: "var(--fg)", margin: "20px 0 0", textWrap: "balance" }}>Book a partnership conversation.</h2>
            {/* <p style={{ ...bodyFont, fontSize: 18, lineHeight: 1.6, color: "var(--fg-faint)", margin: "22px auto 0", textWrap: "pretty", maxWidth: 580 }}>
              Tell us about your trader base, your retention curve, and the behaviors costing you the most. We'll show you what NevUp could catch.
            </p> */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
              <a
                href=" https://cal.com/nevup-ai/nevup-for-partners"
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
                }}
              >
                Book a Partnership Call →
              </a>
              
            </div>
          </div>
        </section>
      </div>

     <LandingFooter  />
    </div>
  );
}
