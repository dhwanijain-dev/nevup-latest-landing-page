import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

const navLinks = [
     { label: "How it works", href: "/how" },
     { label: "For Brokerages", href: "/brokerage" },
     { label: "About", href: "/about", active: true },
     { label: "Contact", href: "/contact" },
];

const team = [
     {
          name: "Anshh Tiwari",
          role: "Founder & CEO",
          blurb: "Trader turned founder. Built NevUp out of the moments he kept losing money to not the strategy, but the click.",
          initials: "AT",
          gradient: "linear-gradient(135deg, rgba(243,67,1,0.28), rgba(10,10,10,0.92))",
          border: "rgba(255,250,226,0.15)",
          link: "https://linkedin.com/in/anshhtiwari",
     },
     {
          name: "Yashasvi Gupta",
          role: "Co-founder & COO",
          blurb: "Operator, economist, behaviorist. Builds the half of trading nobody has built for: people, pressure, and the patterns they keep repeating.",
          initials: "YG",
          gradient: "linear-gradient(135deg, rgba(242,105,63,0.28), rgba(10,10,10,0.92))",
          border: "rgba(255,250,226,0.15)",
          link: "https://www.linkedin.com/in/yashasvisgupta/",
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
               { label: "Contact", href: "/waitlist" },
               { label: "Newsletter", href: "/waitlist" },
          ],
     },
     {
          title: "Legal",
          links: [
               { label: "Privacy Policy", href: "/waitlist" },
               { label: "Terms of Service", href: "/waitlist" },
               { label: "Risk Disclosure", href: "/waitlist" },
               { label: "Cookie Policy", href: "/waitlist" },
               { label: "Security", href: "/waitlist" },
          ],
     },
     {
          title: "Connect",
          links: [
               { label: "LinkedIn", href: "https://www.linkedin.com/company/nevup/", external: true },
               { label: "Twitter / X", href: "https://twitter.com/nevup", external: true },
               { label: "Press kit", href: "/waitlist" },
               { label: "hello@nevup.in", href: "mailto:connect@nevup.in", external: true },
          ],
     },
];

const pageStyles: CSSProperties = {
     minHeight: "100vh",
     background: "var(--bg-page)",
     color: "var(--fg)",
     overflow: "hidden",
};

const containerStyles: CSSProperties = {
     width: "100%",
     maxWidth: 1280,
     margin: "0 auto",
     paddingLeft: 40,
     paddingRight: 40,
};

const sectionStyles: CSSProperties = {
     width: "100%",
};

const headingFont: CSSProperties = {
     fontFamily: "Funnel Display, sans-serif",
};

const bodyFont: CSSProperties = {
     fontFamily: "Satoshi, sans-serif",
};

function LinkedInMark() {
     return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
               <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.33-2.36 4.63 0 5.49 3.05 5.49 7.02V22h-4.57v-6.18c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.36 1.6-2.36 3.25V22H7.72V8z" />
          </svg>
     );
}

function TeamCard({ name, role, blurb, initials, gradient, border, link }: (typeof team)[number]) {
     return (
          <div
               style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${border}`,
                    borderRadius: 28,
                    padding: 24,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.14)",
               }}
          >
               <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                    <div
                         aria-hidden="true"
                         style={{
                              width: 96,
                              height: 96,
                              borderRadius: "50%",
                              background: `${gradient}`,
                              border: `1px solid ${border}`,
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                              color: "rgb(255,250,226)",
                              fontFamily: "Funnel Display, sans-serif",
                              fontSize: 30,
                              fontWeight: 600,
                              letterSpacing: "-0.04em",
                         }}
                    >
                         {initials}
                    </div>
                    <div style={{ paddingTop: 8 }}>
                         <div style={{ ...headingFont, fontSize: 32, color: "var(--fg)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{name}</div>
                         <div style={{ ...bodyFont, fontSize: 12, color: "var(--fg-faint)", marginTop: 6, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>{role}</div>
                         <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                   display: "inline-flex",
                                   alignItems: "center",
                                   gap: 8,
                                   marginTop: 12,
                                   padding: "6px 0",
                                   color: "rgb(10,102,194)",
                                   fontFamily: "Satoshi, sans-serif",
                                   fontSize: 13,
                                   fontWeight: 600,
                                   textDecoration: "none",
                              }}
                         >
                              <LinkedInMark />
                              <span>LinkedIn</span>
                         </a>
                    </div>
               </div>
               <p style={{ ...bodyFont, fontSize: 17, lineHeight: 1.55, color: "var(--fg-muted)", margin: "22px 0 0", textWrap: "pretty", maxWidth: 520 }}>{blurb}</p>
          </div>
     );
}

export default function Page() {
     return (
          <div id="root" data-screen-label="/about" style={pageStyles}>
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
                         padding: "20px 40px",
                         background: "var(--nav-bg)",
                         borderBottom: "1px solid var(--nav-border-soft)",
                         backdropFilter: "blur(14px) saturate(140%)",
                    }}
               >
                    <Link href="/" style={{ textDecoration: "none", opacity: 1 }}>
                         <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "rgb(0,0,0)" }}>
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
                                        color: "rgb(0,0,0)",
                                        opacity: item.active ? 1 : 0.85,
                                        textDecoration: "none",
                                        paddingBottom: 2,
                                        borderBottom: item.active ? "1.5px solid rgb(0,0,0)" : "1.5px solid transparent",
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
                                   color: "rgb(0,0,0)",
                                   border: "1px solid rgba(0,0,0,0.15)",
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
                         <button type="button" style={{ background: "transparent", color: "rgb(0,0,0)", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "10px 18px", ...bodyFont, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                              Book a Call
                         </button>
                         <Link href="/waitlist" style={{ background: "var(--accent)", color: "rgb(255,250,226)", border: 0, borderRadius: 8, padding: "11px 18px", ...bodyFont, fontWeight: 600, fontSize: 13, cursor: "pointer", textDecoration: "none" }}>
                              Join the Waitlist →
                         </Link>
                    </div>
               </header>

               <div className="page-fade">
                    <main style={{ position: "relative" }}>
                         <section
                              style={{
                                   position: "relative",
                                   padding: "200px 40px 140px",
                                   overflow: "hidden",
                                   background: "linear-gradient(135deg, rgb(243,67,1) 0%, rgb(242,105,63) 50%, rgb(255,250,226) 100%)",
                                   color: "rgb(255,250,226)",
                              }}
                         >
                              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(45% 55% at 0% 0%, rgba(190,40,0,0.35) 0%, transparent 60%)", pointerEvents: "none" }} />
                              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(55% 65% at 100% 100%, rgba(255,250,226,0.5) 0%, transparent 60%)", pointerEvents: "none" }} />
                              <div style={{ position: "absolute", bottom: -120, left: -100, width: 580, height: 580, opacity: 0.18, pointerEvents: "none" }}>
                                   <Image src="/logo.png" width={580} height={580} alt="NevUp" style={{ display: "inline-block", width: "100%", height: "100%", objectFit: "contain" }} />
                              </div>

                              <div style={{ ...containerStyles, position: "relative", zIndex: 2 }}>
                                   <div style={{ maxWidth: 920 }}>
                                        <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgb(255,250,226)", opacity: 0.85 }}>
                                             About NevUp
                                        </div>
                                        <h1 style={{ ...headingFont, fontWeight: 500, fontSize: 88, lineHeight: 0.96, letterSpacing: "-0.03em", color: "rgb(255,250,226)", margin: "24px 0 0", textWrap: "balance" }}>
                                             A behavioral intelligence layer for high-noise modern markets.
                                        </h1>
                                        <p style={{ ...headingFont, fontSize: 22, lineHeight: 1.4, color: "rgb(255,250,226)", margin: "32px 0 0", textWrap: "pretty", maxWidth: 720, opacity: 0.95, fontWeight: 400 }}>
                                             Every trader faces two battles: the market, and their own behavior within it.
                                        </p>
                                   </div>
                              </div>
                         </section>

                         <section style={{ ...sectionStyles, padding: "140px 40px", position: "relative", background: "var(--bg-page)", color: "var(--fg)" }}>
                              <div style={containerStyles}>
                                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
                                        <div>
                                             <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>
                                                  The thesis
                                             </div>
                                             <h2 style={{ ...headingFont, fontWeight: 500, fontSize: 52, lineHeight: 1.02, letterSpacing: "-0.025em", color: "var(--fg)", margin: "20px 0 0", textWrap: "balance" }}>
                                                  The industry built endlessly for the first.
                                                  <br />
                                                  <span style={{ color: "var(--fg-faint)" }}>Almost nothing for the second.</span>
                                             </h2>
                                        </div>
                                        <div style={{ paddingTop: 12 }}>
                                             <p style={{ ...bodyFont, fontSize: 18, lineHeight: 1.6, color: "var(--fg-muted)", margin: 0, textWrap: "pretty" }}>
                                                  NevUp introduces a behavioral intelligence layer designed to help identify behavioral patterns, execution drift, and moments where emotion may begin influencing trading behavior.
                                             </p>
                                             <p style={{ ...bodyFont, fontSize: 18, lineHeight: 1.6, color: "var(--fg-faint)", margin: "22px 0 0", textWrap: "pretty" }}>
                                                  Because trading performance is rarely defined by strategy alone. It&apos;s also defined by behavior when the strategy is tested.
                                             </p>
                                             <p style={{ ...bodyFont, fontSize: 18, lineHeight: 1.6, color: "var(--fg-faint)", margin: "22px 0 0", textWrap: "pretty" }}>
                                                  We are the cool head when the user is hot. The intervention layer that trades with you.
                                             </p>
                                        </div>
                                   </div>
                              </div>
                         </section>

                         <section id="team" style={{ ...sectionStyles, padding: "120px 40px 140px", position: "relative", background: "var(--bg-warm)", color: "var(--fg)" }}>
                              <div style={containerStyles}>
                                   <div style={{ maxWidth: 880, marginBottom: 80 }}>
                                        <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>
                                             The team
                                        </div>
                                        <h2 style={{ ...headingFont, fontWeight: 500, fontSize: 60, lineHeight: 1.02, letterSpacing: "-0.025em", color: "var(--fg)", margin: "20px 0 0", textWrap: "balance" }}>
                                             Built by traders, researchers and systems thinkers.
                                        </h2>
                                        <p style={{ ...bodyFont, fontSize: 18, lineHeight: 1.6, color: "var(--fg-muted)", margin: "28px 0 0", textWrap: "pretty", maxWidth: 760 }}>
                                             NevUp is being built by a team working at the intersection of <strong>markets, behavioral science, AI, and systems engineering</strong> with contributors, collaborators, and advisors from IITs, Ivy League institutions, and high-performance trading environments.
                                        </p>
                                   </div>

                                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, paddingTop: 60, borderTop: "1px solid var(--divider-soft)" }}>
                                        {team.map((member) => (
                                             <TeamCard key={member.name} {...member} />
                                        ))}
                                   </div>
                              </div>
                         </section>
                    </main>

                    <footer style={{ background: "rgb(10,10,10)", color: "rgb(255,250,226)", padding: "72px 40px 32px" }}>
                         <div style={containerStyles}>
                              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", gap: 48, paddingBottom: 56, borderBottom: "1px solid rgba(255,250,226,0.1)" }}>
                                   <div>
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "rgb(255,255,255)" }}>
                                             <Image src="/whitelogo.png" width={32} height={32} alt="NevUp" style={{ display: "inline-block", width: 32, height: 32, objectFit: "contain", flexShrink: 0 }} />
                                             <span style={{ ...headingFont, fontWeight: 700, fontSize: 24.96, letterSpacing: "-0.025em", color: "rgb(255,255,255)", lineHeight: 1 }}>NevUp</span>
                                        </div>
                                        <div style={{ ...headingFont, fontSize: 22, lineHeight: 1.3, color: "rgb(255,250,226)", marginTop: 22, maxWidth: 320, fontWeight: 400 }}>
                                             Built for clear decisions in noisy markets.
                                        </div>
                                        <div style={{ ...bodyFont, fontSize: 13, color: "rgba(255,250,226,0.55)", marginTop: 18, lineHeight: 1.6, maxWidth: 320 }}>
                                             NevUp AI is a behavioral intelligence layer for modern traders. Trusted by traders across crypto, forex, and equities.
                                        </div>
                                   </div>

                                   {footerColumns.map((column) => (
                                        <div key={column.title}>
                                             <div style={{ ...bodyFont, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,250,226,0.45)", fontWeight: 600 }}>{column.title}</div>
                                             <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
                                                  {column.links.map((item) =>
                                                       item.external ? (
                                                            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{ ...bodyFont, fontSize: 14, color: "rgb(255,250,226)", textDecoration: "none", opacity: 0.85 }}>
                                                                 {item.label}
                                                            </a>
                                                       ) : (
                                                            <Link key={item.label} href={item.href} style={{ ...bodyFont, fontSize: 14, color: "rgb(255,250,226)", textDecoration: "none", opacity: 0.85 }}>
                                                                 {item.label}
                                                            </Link>
                                                       ),
                                                  )}
                                             </div>
                                        </div>
                                   ))}
                              </div>

                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "rgba(255,250,226,0.45)", flexWrap: "wrap", gap: 12 }}>
                                   <span>© 2026 NevUp AI, Inc. All rights reserved. NevUp™ is a trademark of NevUp AI, Inc.</span>
                                   <span>Trade Smarter, Not Emotional.</span>
                              </div>

                              <div style={{ ...bodyFont, fontSize: 11, color: "rgba(255,250,226,0.3)", marginTop: 24, lineHeight: 1.6, maxWidth: 900 }}>
                                   Risk disclosure Trading in financial markets carries a high level of risk, including the potential loss of capital. NevUp AI is a behavioral analytics and intervention tool and is not a registered investment advisor or broker-dealer. NevUp does not provide trading recommendations, execute trades, or take custody of funds. Past performance does not guarantee future results.
                              </div>
                         </div>
                    </footer>
               </div>
          </div>
     );
}