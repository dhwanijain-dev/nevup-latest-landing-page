import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";

const navLinks = [
     { label: "How it works", href: "/how" },
     { label: "For Partners", href: "/brokerage" },
     { label: "About", href: "/about", active: true },
     { label: "Contact", href: "/contact" },
];

const team = [
     {
          name: "Anshh Tiwari",
          role: "Founder & CEO",
          blurb: "Anshh began trading early and spent years studying the psychology behind decision-making, risk, and discipline in the markets. His experience navigating volatility, refining systems, and understanding trader behavior became the foundation for NevUp AI : a product designed to help traders stay consistent under pressure.",
          initials: "AT",
          image: "/ansh.png",
          gradient: "linear-gradient(135deg, rgba(243,67,1,0.28), rgba(10,10,10,0.92))",
          border: "rgba(255,250,226,0.15)",
          link: "https://linkedin.com/in/anshhtiwari",
     },
     {
          name: "Yashasvi Gupta",
          role: "COO",
          blurb: "Yashasvi Gupta grew up around business operations and community-driven environments, shaping her understanding of people, execution and decision making from an early stage. With a background spanning psychology and economics, she combines operation rigour with deep insight into human psychology, crucial to building NevUp.",
          initials: "YG",
          image: "/yashasvi.png",
          gradient: "linear-gradient(135deg, rgba(242,105,63,0.28), rgba(10,10,10,0.92))",
          border: "rgba(255,250,226,0.15)",
          link: "https://www.linkedin.com/in/yashasvisgupta/",
     },
];

const pageStyles: CSSProperties = {
     minHeight: "100vh",
     background: "var(--bg-page)",
     color: "var(--fg)",
     overflowX: "hidden", // Ironclad prevention against accidental layout shifting sideways
     width: "100%"
};

const containerStyles: CSSProperties = {
     width: "100%",
     maxWidth: 1280,
     margin: "0 auto",
     // Drops side cushions gently down to 5% instead of cropping out text on tiny screens
     paddingLeft: "min(5%, 40px)",
     paddingRight: "min(5%, 40px)",
     boxSizing: "border-box"
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

function TeamCard({ name, role, blurb, initials, gradient, border, link, image }: (typeof team)[number]) {
     return (
          <div
               style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${border}`,
                    borderRadius: 28,
                    padding: "min(24px, 5%)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.14)",
                    minWidth: 0,
                    width: "100%",
                    boxSizing: "border-box"
               }}
          >
               {/* Flexbox wrapper handles avatar stack swapping dynamically on tiny screens */}
               <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ width: 96, height: 96, flexShrink: 0, borderRadius: "50%", overflow: "hidden", display: "block" }}>
                         <Image src={image} width={96} height={96} alt={name} style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "50%", border: `1px solid ${border}` }} />
                    </div>
                    <div style={{ paddingTop: 8, minWidth: "200px", flex: "1 1 auto" }}>
                         <div style={{ ...headingFont, fontSize: "min(32px, 8.5vw)", color: "var(--fg)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{name}</div>
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
               <LandingNavbar />

               <div className="page-fade" style={{ width: "100%" }}>
                    <main style={{ position: "relative", width: "100%" }}>
                         {/* HERO SECTION */}
                         <section
                              style={{
                                   position: "relative",
                                   padding: "200px min(5%, 40px) 140px",
                                   overflow: "hidden",
                                   background: "linear-gradient(135deg, rgb(243,67,1) 0%, rgb(242,105,63) 50%, rgb(255,250,226) 100%)",
                                   color: "rgb(255,250,226)",
                                   width: "100%",
                                   boxSizing: "border-box"
                              }}
                         >
                              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(45% 55% at 0% 0%, rgba(190,40,0,0.35) 0%, transparent 60%)", pointerEvents: "none" }} />
                              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(55% 65% at 100% 100%, rgba(255,250,226,0.5) 0%, transparent 60%)", pointerEvents: "none" }} />
                               
                              <div style={{ ...containerStyles, position: "relative", zIndex: 2 }}>
                                   <div style={{ maxWidth: 920 }}>
                                        <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgb(255,250,226)", opacity: 0.85 }}>
                                             About NevUp
                                        </div>
                                        <h1 
                                             style={{ 
                                                  ...headingFont, 
                                                  fontWeight: 500, 
                                                  // Caps out at 88px on large desktops, automatically folds cleanly on small phones
                                                  fontSize: "min(88px, 12vw)", 
                                                  lineHeight: 0.96, 
                                                  letterSpacing: "-0.03em", 
                                                  color: "rgb(255,250,226)", 
                                                  margin: "24px 0 0", 
                                                  textWrap: "balance" 
                                             }}
                                        >
                                             A behavioral intelligence layer for high-noise modern markets.
                                        </h1>
                                        <p style={{ ...headingFont, fontSize: "min(22px, 5.5vw)", lineHeight: 1.4, color: "rgb(255,250,226)", margin: "32px 0 0", textWrap: "pretty", maxWidth: 720, opacity: 0.95, fontWeight: 400 }}>
                                             Every trader faces two battles: the market, and their own behavior within it.
                                        </p>
                                   </div>
                              </div>
                         </section>

                         {/* TEAM SECTION */}
                         <section 
                              id="team" 
                              style={{ 
                                   ...sectionStyles, 
                                   padding: "120px min(5%, 40px) 140px", 
                                   position: "relative", 
                                   background: "var(--bg-warm)", 
                                   color: "var(--fg)",
                                   boxSizing: "border-box"
                              }}
                         >
                              <div style={containerStyles}>
                                   <div style={{ maxWidth: 880, marginBottom: 80 }}>
                                        <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>
                                             The team
                                        </div>
                                        <h2 
                                             style={{ 
                                                  ...headingFont, 
                                                  fontWeight: 500, 
                                                  fontSize: "min(60px, 9.5vw)", 
                                                  lineHeight: 1.02, 
                                                  letterSpacing: "-0.025em", 
                                                  color: "var(--fg)", 
                                                  margin: "20px 0 0", 
                                                  textWrap: "balance" 
                                             }}
                                        >
                                             Built by traders, researchers and systems thinkers.
                                        </h2>
                                        <p style={{ ...bodyFont, fontSize: 18, lineHeight: 1.6, color: "var(--fg-muted)", margin: "28px 0 0", textWrap: "pretty", maxWidth: 760 }}>
                                             NevUp is being built by a team with experience across <strong>financial markets, behavioral science, artificial intelligence, </strong> and <strong>systems engineering</strong>, supported by contributors, collaborators, and advisors from <strong> leading academic institutions </strong>and <strong>trading ecosystems.</strong>
                                        </p>
                                   </div>

                                   {/* RESPONSIVE TEAM GRID: Uses auto-fit. Perfectly 2 columns on desktop, drops smoothly to 1 stack on mobile */}
                                   <div 
                                        style={{ 
                                             display: "grid", 
                                             gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", 
                                             gap: "60px 80px", 
                                             paddingTop: 60, 
                                             borderTop: "1px solid var(--divider-soft)" 
                                        }}
                                        className="team-grid-wrapper"
                                   >
                                        {team.map((member) => (
                                             <TeamCard key={member.name} {...member} />
                                        ))}
                                   </div>
                              </div>
                         </section>
                    </main>

                    <LandingFooter />
               </div>
          </div>
     );
}