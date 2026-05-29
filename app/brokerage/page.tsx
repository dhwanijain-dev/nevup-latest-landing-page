import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

const navLinks = [
  { label: "How it works", href: "/how" },
  { label: "For Brokerages", href: "/brokerage", active: true },
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
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 40px",
          background: "var(--nav-bg-scrolled)",
          borderBottom: "1px solid var(--nav-border)",
          backdropFilter: "blur(14px) saturate(140%)",
          transition: "padding 200ms, background 200ms, border-color 200ms",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", opacity: 1, transition: "opacity 200ms" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "rgb(0, 0, 0)" }}>
            <Image src="/logo.png" width={1920} height={1080} alt="NevUp" style={{ display: "inline-block", width: 100, height: 20, objectFit: "contain", flexShrink: 0 }} />
          </div>
        </Link>

        <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...bodyFont,
                fontSize: 14,
                fontWeight: 500,
                color: "rgb(0, 0, 0)",
                opacity: item.active ? 1 : 0.85,
                textDecoration: "none",
                paddingBottom: 2,
                borderBottom: item.active ? "1.5px solid rgb(0, 0, 0)" : "1.5px solid transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            aria-label="Switch to dark mode"
            title="Switch to dark mode"
            type="button"
            style={{
              background: "transparent",
              color: "rgb(0, 0, 0)",
              border: "1px solid rgba(0, 0, 0, 0.15)",
              borderRadius: 999,
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </button>
          <button
            type="button"
            style={{
              background: "transparent",
              color: "rgb(0, 0, 0)",
              border: "1px solid rgba(0, 0, 0, 0.15)",
              borderRadius: 8,
              padding: "10px 18px",
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Book a Call
          </button>
          <Link
            href="/waitlist"
            style={{
              background: "var(--accent)",
              color: "rgb(255, 250, 226)",
              border: 0,
              borderRadius: 8,
              padding: "11px 18px",
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Join the Waitlist →
          </Link>
        </div>
      </header>

      <div className="page-fade">
        <section style={{ padding: "180px 40px 80px", position: "relative", background: "var(--bg-page)", color: "var(--fg)" }}>
          <div style={containerStyles}>
            <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>For Brokerages &amp; Prop Firms</div>
            <h1 style={{ ...headingFont, fontWeight: 500, fontSize: 80, lineHeight: 0.96, letterSpacing: "-0.03em", color: "var(--fg)", margin: "20px 0 0", textWrap: "balance" }}>
              Your best traders blow accounts. Not from bad reads. From bad moments.
            </h1>
            <p style={{ ...bodyFont, fontSize: 20, lineHeight: 1.6, color: "var(--fg-muted)", margin: "28px 0 0", textWrap: "pretty", maxWidth: 720 }}>
              NevUp integrates into your trading infrastructure as a behavioral intelligence layer. No platform migration. No friction at onboarding. Traders who manage their behavior retain longer, trade more consistently, and stay on your books.
            </p>
          </div>
        </section>

        <section style={{ padding: "80px 40px", position: "relative", background: "var(--bg-soft)", color: "var(--fg)" }}>
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
        </section>

        <section style={{ padding: "140px 40px", position: "relative", background: "rgb(10, 10, 10)", color: "rgb(255, 255, 255)" }}>
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
        </section>

        <section style={{ padding: "140px 40px", position: "relative", background: "var(--bg-page)", color: "var(--fg)" }}>
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
        </section>

        <section style={{ padding: "100px 40px", position: "relative", background: "var(--bg-warm)", color: "var(--fg)" }}>
          <div style={{ maxWidth: 920, margin: "0 auto", textAlign: "center" }}>
            <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>Partner with NevUp</div>
            <h2 style={{ ...headingFont, fontWeight: 500, fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.025em", color: "var(--fg)", margin: "20px 0 0", textWrap: "balance" }}>Book a partnership conversation.</h2>
            <p style={{ ...bodyFont, fontSize: 18, lineHeight: 1.6, color: "var(--fg-faint)", margin: "22px auto 0", textWrap: "pretty", maxWidth: 580 }}>
              Tell us about your trader base, your retention curve, and the behaviors costing you the most. We'll show you what NevUp could catch.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
              <a
                href="mailto:partnerships@nevup.in"
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
              <Link
                href="/#how"
                style={{
                  background: "transparent",
                  color: "var(--fg)",
                  border: "1px solid rgba(0, 0, 0, 0.18)",
                  borderRadius: 10,
                  padding: "16px 30px",
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                See the product
              </Link>
            </div>
          </div>
        </section>
      </div>

      <footer style={{ background: "rgb(10, 10, 10)", color: "rgb(255, 250, 226)", padding: "72px 40px 32px" }}>
        <div style={containerStyles}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", gap: 48, paddingBottom: 56, borderBottom: "1px solid rgba(255, 250, 226, 0.1)" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "rgb(255, 255, 255)" }}>
                <Image src="/whitelogo.png" width={32} height={32} alt="NevUp" style={{ display: "inline-block", width: 32, height: 32, objectFit: "contain", flexShrink: 0 }} />
                <span style={{ fontFamily: "Funnel Display, Satoshi, sans-serif", fontWeight: 700, fontSize: 24.96, letterSpacing: "-0.025em", color: "rgb(255, 255, 255)", lineHeight: 1 }}>NevUp</span>
              </div>
              <div style={{ ...headingFont, fontSize: 22, lineHeight: 1.3, color: "rgb(255, 250, 226)", marginTop: 22, maxWidth: 320, fontWeight: 400 }}>Built for clear decisions in noisy markets.</div>
              <div style={{ ...bodyFont, fontSize: 13, color: "rgba(255, 250, 226, 0.55)", marginTop: 18, lineHeight: 1.6, maxWidth: 320 }}>NevUp AI is a behavioral intelligence layer for modern traders. Trusted by traders across crypto, forex, and equities.</div>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <div style={{ ...bodyFont, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255, 250, 226, 0.45)", fontWeight: 600 }}>{column.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
                  {column.links.map((item) =>
                    item.external ? (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{ ...bodyFont, fontSize: 14, color: "rgb(255, 250, 226)", textDecoration: "none", opacity: 0.85 }}>
                        {item.label}
                      </a>
                    ) : (
                      <Link key={item.label} href={item.href} style={{ ...bodyFont, fontSize: 14, color: "rgb(255, 250, 226)", textDecoration: "none", opacity: 0.85 }}>
                        {item.label}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "rgba(255, 250, 226, 0.45)", flexWrap: "wrap", gap: 12 }}>
            <span>© 2026 NevUp AI, Inc. All rights reserved. NevUp™ is a trademark of NevUp AI, Inc.</span>
            <span>Trade Smarter, Not Emotional.</span>
          </div>

          <div style={{ ...bodyFont, fontSize: 11, color: "rgba(255, 250, 226, 0.3)", marginTop: 24, lineHeight: 1.6, maxWidth: 900 }}>
            Risk disclosure Trading in financial markets carries a high level of risk, including the potential loss of capital. NevUp AI is a behavioral analytics and intervention tool and is not a registered investment advisor or broker-dealer. NevUp does not provide trading recommendations, execute trades, or take custody of funds. Past performance does not guarantee future results.
          </div>
        </div>
      </footer>
    </div>
  );
}
