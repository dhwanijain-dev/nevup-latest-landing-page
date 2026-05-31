import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

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
				<section style={{ position: "relative", padding: "180px 40px 100px", background: "var(--card-bg)", borderBottom: "1px solid var(--card-border)" }}>
					<div style={containerStyles}>
						<div style={{ maxWidth: 880 }}>
							<div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>Get in touch</div>
							<h1 style={{ ...headingFont, fontWeight: 500, fontSize: 84, lineHeight: 0.96, letterSpacing: "-0.03em", color: "var(--fg)", margin: "22px 0 0", textWrap: "balance" }}>Connect with NevUp.</h1>
							<p style={{ ...bodyFont, fontSize: 20, lineHeight: 1.6, color: "var(--fg-faint)", margin: "28px 0 0", textWrap: "pretty", maxWidth: 660 }}>
								Trader, partner, or just curious. We'd love to hear from you.

							</p>
						</div>
					</div>
				</section>

				<section style={{ ...sectionStyles, padding: "100px 40px 120px", position: "relative", background: "var(--bg-soft)", color: "var(--fg)" }}>
					<div style={containerStyles}>
						<div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18 }}>
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
										<div style={{ ...bodyFont, fontSize: 11, color: "rgba(255,250,226,0.7)", marginTop: 4 }}>20,000+ traders are already in line.</div>
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

							<div style={{ background: "var(--card-bg)", borderRadius: 16, padding: 36, minHeight: 480, display: "flex", flexDirection: "column", border: "1px solid var(--card-border)" }}>
								<div style={{ ...bodyFont, fontWeight: 600, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg)", opacity: 0.6 }}>For everyone else</div>
								<div style={{ ...headingFont, fontSize: 36, color: "var(--fg)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 16 }}>Say hello.</div>
								<p style={{ ...bodyFont, fontSize: 15, lineHeight: 1.6, color: "var(--fg-faint)", margin: "16px 0 0", textWrap: "pretty" }}>
									Press, hiring, research, or you&apos;ve just seen yourself in something we wrote write to us.
								</p>

								<div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
									{[
										["General", "connect@nevup"],
										["Press", "connect@nevup"],
										["Careers", "connect@nevup"],
										["Security", "connect@nevup"],
									].map(([label, value]) => (
										<div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
											<span style={{ ...bodyFont, fontSize: 12, color: "var(--fg-ghost)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
											<span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--fg)" }}>{value}</span>
										</div>
									))}
								</div>

								<div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid var(--card-border)" }}>
									{/* <div style={{ ...bodyFont, fontSize: 11, color: "var(--fg-ghost)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>Office</div> */}
									<div style={{ ...bodyFont, fontSize: 14, color: "var(--fg)", marginTop: 8, lineHeight: 1.5 }} />
								</div>
							</div>
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
