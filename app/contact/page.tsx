import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";

const navLinks = [
    { label: "How it works", href: "/how" },
    { label: "For Partners", href: "/brokerage" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact", active: true },
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
            { label: "connect@nevup", href: "mailto:connect@nevup", external: true },
        ],
    },
];

const pageStyles: CSSProperties = {
    minHeight: "100vh",
    background: "var(--bg-page)",
    color: "var(--fg)",
    overflowX: "hidden", // Ironclad horizontal scroll block prevention
    width: "100%"
};

const containerStyles: CSSProperties = {
    width: "100%",
    maxWidth: 1280,
    margin: "0 auto",
    paddingLeft: "min(5%, 40px)",  // Scales gutters downward smoothly on mobile screens
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

function EmailCard({
    eyebrow,
    title,
    copy,
    accent,
    background,
    border,
    footer,
    actionLabel,
    actionHref,
    actionBackground,
}: {
    eyebrow: string;
    title: string;
    copy: string;
    accent: string;
    background: string;
    border: string;
    footer?: string;
    actionLabel: string;
    actionHref: string;
    actionBackground: string;
}) {
    return (
        <div
            style={{
                background,
                color: accent,
                borderRadius: 16,
                padding: "min(36px, 6%)", // Fluid padding interior
                minHeight: 480,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                border,
                boxSizing: "border-box",
                width: "100%"
            }}
        >
            <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>{eyebrow}</div>
                <div style={{ ...headingFont, fontSize: "min(36px, 9vw)", color: accent, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 16 }}>{title}</div>
                <p style={{ ...bodyFont, fontSize: 15, lineHeight: 1.6, color: copy.includes("rgba") ? copy : "inherit", margin: "16px 0 24px", textWrap: "pretty" }}>{copy}</p>

                {footer ? (
                    <div style={{ marginTop: 28, padding: 18, borderRadius: 10, background: "rgb(15,15,15)", border: "1px solid rgb(31,31,31)" }}>
                        <div style={{ ...bodyFont, fontSize: 11, color: "var(--fg-ghost)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>Direct line</div>
                        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 15, color: accent, marginTop: 8 }}>{footer}</div>
                    </div>
                ) : null}

                {actionHref.startsWith("/") ? (
                    <Link
                        href={actionHref}
                        style={{
                            marginTop: "auto",
                            background: actionBackground,
                            color: "rgb(255,255,255)",
                            border: 0,
                            borderRadius: 10,
                            padding: "14px 18px",
                            fontFamily: "Satoshi, sans-serif",
                            fontWeight: 600,
                            fontSize: 14,
                            width: "100%",
                            cursor: "pointer",
                            boxShadow: actionBackground.includes("blue") ? "rgba(59,130,246,0.25) 0 0 16px" : "none",
                            textDecoration: "none",
                            textAlign: "center",
                            boxSizing: "border-box"
                        }}
                    >
                        {actionLabel} →
                    </Link>
                ) : (
                    <a
                        href={actionHref}
                        style={{
                            marginTop: "auto",
                            background: actionBackground,
                            color: "rgb(255,255,255)",
                            border: 0,
                            borderRadius: 10,
                            padding: "14px 18px",
                            fontFamily: "Satoshi, sans-serif",
                            fontWeight: 600,
                            fontSize: 14,
                            width: "100%",
                            cursor: "pointer",
                            boxShadow: actionBackground.includes("blue") ? "rgba(59,130,246,0.25) 0 0 16px" : "none",
                            textDecoration: "none",
                            textAlign: "center",
                            boxSizing: "border-box"
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {actionLabel} →
                    </a>
                )}
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <div id="root" data-screen-label="/contact" style={pageStyles}>
            <LandingNavbar />

            <div className="page-fade" style={{ width: "100%" }}>
                
                {/* HERO TITLE HEADER */}
                <section style={{ position: "relative", padding: "180px min(5%, 40px) 20px", background: "var(--bg-page)", boxSizing: "border-box" }}>
                    <div style={containerStyles}>
                        <div style={{ maxWidth: 880 }}>
                            <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>Get in touch</div>
                            <h1 style={{ ...headingFont, fontWeight: 500, fontSize: "min(84px, 12vw)", lineHeight: 0.96, letterSpacing: "-0.03em", color: "var(--fg)", margin: "22px 0 0", textWrap: "balance" }}>
                                Connect with <span style={{ color: "#f34301" }}>NevUp!</span>
                            </h1>
                            <p style={{ ...bodyFont, fontSize: "min(20px, 5.5vw)", lineHeight: 1.6, color: "var(--fg-faint)", margin: "28px 0 0", textWrap: "pretty", maxWidth: 660 }}>
                                Trader, partner, or just curious. We&apos;d love to hear from you.
                            </p>
                        </div>
                    </div>
                </section>

                {/* DOUBLE CARDS SUBSECTION */}
                <section style={{ ...sectionStyles, padding: "100px min(5%, 40px) 0px", position: "relative", background: "var(--bg-page)", color: "var(--fg)", boxSizing: "border-box" }}>
                    <div style={{ ...containerStyles, display: "grid", gap: 24 }}>
                        
                        {/* THE CARD TRACK GRID */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 18, width: "100%" }}>
                            
                            {/* Waitlist Form Card */}
                            <div style={{ background: "linear-gradient(160deg, rgb(243, 67, 1) 0%, rgb(190, 95, 35) 100%)", color: "rgb(255,250,226)", borderRadius: 16, padding: "min(36px, 6%)", display: "flex", flexDirection: "column", minHeight: 480, position: "relative", overflow: "hidden", boxSizing: "border-box", width: "100%" }}>
                                <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
                                    <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgb(255,250,226)", opacity: 0.85 }}>For traders</div>
                                    <div style={{ ...headingFont, fontSize: "min(36px, 9vw)", color: "rgb(255,250,226)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 16 }}>Join the waitlist.</div>
                                    <p style={{ ...bodyFont, fontSize: 15, lineHeight: 1.6, color: "rgba(255,250,226,0.9)", margin: "16px 0 24px", textWrap: "pretty" }}>
                                        Share your details and be the first to hear and access when NevUp is ready. No spam, just updates.
                                    </p>
                                    <form style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                                        <input type="email" placeholder="you@email.com" required style={{ background: "rgba(255,250,226,0.12)", border: "1px solid rgba(255,250,226,0.3)", color: "rgb(255,250,226)", padding: "14px 16px", borderRadius: 10, outline: "none", fontFamily: "Satoshi, sans-serif", fontSize: 14, width: "100%", boxSizing: "border-box" }} />
                                        <button type="button" style={{ background: "rgb(10,10,10)", color: "rgb(255,250,226)", border: 0, borderRadius: 10, padding: "14px 18px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%", boxSizing: "border-box" }}>
                                            Join the Waitlist →
                                        </button>
                                        <div style={{ ...bodyFont, fontSize: 11, color: "rgba(255,250,226,0.7)", marginTop: 4 }}>800+ traders are already in line.</div>
                                    </form>
                                </div>
                            </div>

                            {/* Partnership Card component */}
                            <EmailCard
                                eyebrow="For brokerages & prop firms"
                                title="Book a partnership call."
                                copy="Walk through your trader base, your retention curve, and the behaviors costing your firm the most. 30 minutes, low pressure."
                                accent="rgb(255,250,226)"
                                background="rgb(10,10,10)"
                                border="1px solid rgb(31,31,31)"
                                actionLabel="Book a Partnership Call"
                                actionHref="https://cal.com/nevup-ai/nevup-for-partners"
                                actionBackground="linear-gradient(rgb(59, 130, 246), rgb(30, 58, 138))"
                            />
                        </div>

                        {/* General Queries Center Card Banner */}
                        <div style={{ background: "var(--card-bg)", borderRadius: 16, padding: "min(36px, 6%)", display: "flex", alignItems: "center", flexDirection: "column", border: "1px solid var(--card-border)", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
                            <div style={{ ...headingFont, fontSize: "min(36px, 9vw)", color: "var(--fg)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05 }}>For Any Queries</div>
                            <p style={{ ...bodyFont, fontSize: "min(20px, 5.5vw)", lineHeight: 1.6, color: "var(--fg-faint)", margin: "16px 0 0", textWrap: "pretty", maxWidth: 660, wordBreak: "break-all" }}>
                                feel free to reach out on <span style={{ color: "#f34301", fontStyle: "italic" }}>connect@nevup.in</span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* NEWSLETTER NEWSLETTER FOOTER SECTION */}
                <section id="newsletter" style={{ padding: "100px min(5%, 40px) 120px", position: "relative", background: "var(--bg-page)", color: "var(--fg)", boxSizing: "border-box", width: "100%" }}>
                    <div style={containerStyles}>
                        <div 
                            style={{ 
                                background: "rgb(10,10,10)", 
                                color: "rgb(255,250,226)", 
                                borderRadius: 20, 
                                padding: "min(64px, 7%) min(56px, 6%)", 
                                display: "grid", 
                                // Changes dynamically from side-by-side to stacked forms on mobile phones
                                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", 
                                gap: "40px 60px", 
                                alignItems: "center", 
                                position: "relative", 
                                overflow: "hidden",
                                width: "100%",
                                boxSizing: "border-box"
                            }}
                        >
                            <div style={{ position: "absolute", top: -100, right: -80, width: 380, height: 380, opacity: 0.06, pointerEvents: "none" }}>
                                <Image src="/logo.png" width={380} height={380} alt="NevUp" style={{ display: "inline-block", width: "100%", height: "100%", objectFit: "contain" }} />
                            </div>

                            <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
                                <div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgb(255,250,226)", opacity: 0.55 }}>Newsletter</div>
                                <h2 style={{ ...headingFont, fontWeight: 500, fontSize: "min(48px, 9vw)", lineHeight: 1.05, letterSpacing: "-0.025em", color: "rgb(255,250,226)", margin: "18px 0 0", textWrap: "balance" }}>Sign up for our newsletter here.</h2>
                            </div>

                            <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
                                <form style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                                    <input type="email" placeholder="you@email.com" required style={{ background: "rgba(255,250,226,0.06)", border: "1px solid rgba(255,250,226,0.18)", color: "rgb(255,250,226)", padding: "16px 18px", borderRadius: 10, outline: "none", fontFamily: "Satoshi, sans-serif", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
                                    <button type="button" style={{ background: "var(--accent)", color: "rgb(255,250,226)", border: 0, borderRadius: 10, padding: "16px 18px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer", width: "100%", boxSizing: "border-box" }}>
                                        Subscribe →
                                    </button>
                                    <div style={{ ...bodyFont, fontSize: 12, color: "rgba(255,250,226,0.5)", marginTop: 4 }}>Unsubscribe anytime. Read our privacy policy.</div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                <LandingFooter />
            </div>
        </div>
    );
}