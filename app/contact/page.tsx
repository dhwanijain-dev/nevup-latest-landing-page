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

function SocialMark() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
			<path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.33-2.36 4.63 0 5.49 3.05 5.49 7.02V22h-4.57v-6.18c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.36 1.6-2.36 3.25V22H7.72V8z" />
		</svg>
	);
}

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
				padding: 36,
				minHeight: 480,
				display: "flex",
				flexDirection: "column",
				position: "relative",
				overflow: "hidden",
				border,
			}}
		>
			<div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
				<div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>{eyebrow}</div>
				<div style={{ ...headingFont, fontSize: 36, color: accent, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 16 }}>{title}</div>
				<p style={{ ...bodyFont, fontSize: 15, lineHeight: 1.6, color: copy.includes("rgba") ? copy : "inherit", margin: "16px 0 0", textWrap: "pretty" }}>{copy}</p>

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

			<div className="page-fade">
				<section style={{ position: "relative", padding: "180px 40px 20px", background: "var(--card-bg)", borderBottom: "1px solid var(--card-border)" }}>
					<div style={containerStyles}>
						<div style={{ maxWidth: 880 }}>
							<div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>Get in touch</div>
							<h1 style={{ ...headingFont, fontWeight: 500, fontSize: 84, lineHeight: 0.96, letterSpacing: "-0.03em", color: "var(--fg)", margin: "22px 0 0", textWrap: "balance" }}>Connect with <span style={{ color: "#f34301" }}>NevUp!</span></h1>
							<p style={{ ...bodyFont, fontSize: 20, lineHeight: 1.6, color: "var(--fg-faint)", margin: "28px 0 0", textWrap: "pretty", maxWidth: 660 }}>
								Trader, partner, or just curious. We&apos;d love to hear from you.

							</p>
						</div>
					</div>
				</section>

				<section style={{ ...sectionStyles, padding: "100px 40px 0px", position: "relative", background: "var(--bg-soft)", color: "var(--fg)" }}>
					<div style={containerStyles}>
						<div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
							<div style={{ background: "linear-gradient(160deg, rgb(243, 67, 1) 0%, rgb(190, 95, 35) 100%)", color: "rgb(255,250,226)", borderRadius: 16, padding: 36, display: "flex", flexDirection: "column", minHeight: 480, position: "relative", overflow: "hidden" }}>
								<div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, opacity: 0.18, pointerEvents: "none" }}>
									<Image src="/logo.png" width={200} height={200} alt="NevUp" style={{ display: "inline-block", width: "100%", height: "100%", objectFit: "contain" }} />
								</div>
								<div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
									<div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgb(255,250,226)", opacity: 0.85 }}>For traders</div>
									<div style={{ ...headingFont, fontSize: 36, color: "rgb(255,250,226)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 16 }}>Join the waitlist.</div>
									<p style={{ ...bodyFont, fontSize: 15, lineHeight: 1.6, color: "rgba(255,250,226,0.9)", margin: "16px 0 0", textWrap: "pretty" }}>
										Share your details and be the first to hear and access when NevUp is ready. No spam, just updates.
									</p>
									<form style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
										<input type="email" placeholder="you@email.com" required className="ne-input-light" style={{ background: "rgba(255,250,226,0.12)", border: "1px solid rgba(255,250,226,0.3)", color: "rgb(255,250,226)", padding: "14px 16px", borderRadius: 10, outline: "none", fontFamily: "Satoshi, sans-serif", fontSize: 14 }} />
										<button type="button" style={{ background: "rgb(10,10,10)", color: "rgb(255,250,226)", border: 0, borderRadius: 10, padding: "14px 18px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%" }}>
											Join the Waitlist →
										</button>
										<div style={{ ...bodyFont, fontSize: 11, color: "rgba(255,250,226,0.7)", marginTop: 4 }}>800+ traders are already in line.</div>
									</form>
								</div>
							</div>

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
<div style={{ background: "var(--card-bg)", borderRadius: 16, padding: 36, display: "flex", alignItems:"center",flexDirection: "column", border: "1px solid var(--card-border)" }}>
								<div style={{ ...headingFont, fontSize: 36, color: "var(--fg)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 16 }}>For Any Queries</div>
								
								<p style={{ ...bodyFont, fontSize: 20, lineHeight: 1.6, color: "var(--fg-faint)", margin: "28px 0 0", textWrap: "pretty", maxWidth: 660 }}>
								feel free to reach out on <span style={{color:"#f34301", fontStyle:"italic"}}>connect@nevup.in</span>

							</p>

								<div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid var(--card-border)" }}>
									<div style={{ ...bodyFont, fontSize: 14, color: "var(--fg)", marginTop: 8, lineHeight: 1.5 }} />
								</div>
							</div>
						<div>
							
						</div>
					</div>
				</section>

				<section id="newsletter" style={{ padding: "100px 40px 120px", position: "relative", background: "var(--bg-page)", color: "var(--fg)" }}>
					<div style={containerStyles}>
						<div style={{ background: "rgb(10,10,10)", color: "rgb(255,250,226)", borderRadius: 20, padding: "64px 56px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 60, alignItems: "center", position: "relative", overflow: "hidden" }}>
							<div style={{ position: "absolute", top: -100, right: -80, width: 380, height: 380, opacity: 0.06, pointerEvents: "none" }}>
								<Image src="/logo.png" width={380} height={380} alt="NevUp" style={{ display: "inline-block", width: "100%", height: "100%", objectFit: "contain" }} />
							</div>

							<div style={{ position: "relative", zIndex: 1 }}>
								<div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgb(255,250,226)", opacity: 0.55 }}>Newsletter</div>
								<h2 style={{ ...headingFont, fontWeight: 500, fontSize: 48, lineHeight: 1.02, letterSpacing: "-0.025em", color: "rgb(255,250,226)", margin: "18px 0 0", textWrap: "balance" }}>Sign up for our newsletter here.</h2>
								<p style={{ ...bodyFont, fontSize: 16, lineHeight: 1.6, color: "rgba(255,250,226,0.7)", margin: "22px 0 0", textWrap: "pretty", maxWidth: 460 }}>
									One email a month. Behavioral research notes, market psychology reads, and what we&apos;re shipping next. No promotions.
								</p>
							</div>

							<div style={{ position: "relative", zIndex: 1 }}>
								<form style={{ display: "flex", flexDirection: "column", gap: 10 }}>
									<input type="email" placeholder="you@email.com" required className="ne-input-light" style={{ background: "rgba(255,250,226,0.06)", border: "1px solid rgba(255,250,226,0.18)", color: "rgb(255,250,226)", padding: "16px 18px", borderRadius: 10, outline: "none", fontFamily: "Satoshi, sans-serif", fontSize: 15 }} />
									<button type="button" style={{ background: "var(--accent)", color: "rgb(255,250,226)", border: 0, borderRadius: 10, padding: "16px 18px", fontFamily: "Satoshi, sans-serif", fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "background 160ms, transform 80ms", width: "100%" }}>
										Subscribe →
									</button>
									<div style={{ ...bodyFont, fontSize: 12, color: "rgba(255,250,226,0.5)", marginTop: 4 }}>Unsubscribe anytime. Read our privacy policy.</div>
								</form>
							</div>
						</div>
					</div>
				</section>

					 <LandingFooter  />
				
			</div>
		</div>
	);
}
