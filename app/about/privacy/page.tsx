import Link from "next/link";
import type { CSSProperties } from "react";

import LandingFooter from "../../components/LandingFooter";
import LandingNavbar from "../../components/LandingNavbar";

const summaryItems = [
	{
		title: "Scope",
		copy: "This policy covers the NevUp waitlist website only and not the full trading product.",
	},
	{
		title: "Data collected",
		copy: "Name, email, device and usage signals, and direct messages you send us.",
	},
	{
		title: "Retention",
		copy: "Waitlist data is kept until deletion or for up to 24 months if the product does not launch.",
	},
	{
		title: "Rights",
		copy: "Access, correction, consent withdrawal, erasure, and nomination rights are available under the DPDP Act.",
	},
];

const policySections = [
	{
		id: "collection",
		title: "1. What Data We Collect",
		items: [
			"Identity and Contact: name and email address submitted via the waitlist form.",
			"Device and Usage Data: IP address, browser type, device type, pages visited, session duration, and interactions with the Site, collected through cookies and analytics tools where you have consented.",
			"Communications: any messages or queries you send us directly.",
		],
		note: "We do not currently collect trading data, brokerage credentials, financial data, biometric data, government IDs, or payment information.",
	},
	{
		id: "use",
		title: "2. How We Use Your Data",
		items: [
			"To register and maintain your place on the NevUp AI product waitlist.",
			"To send product launch updates, announcements, and related communications where you have opted in.",
			"To respond to your queries and support requests.",
			"To analyse Site performance and improve user experience using anonymised analytics data.",
			"To detect and prevent fraud, abuse, and security threats.",
			"To comply with applicable legal obligations.",
		],
	},
	{
		id: "basis",
		title: "3. Legal Basis for Processing",
		items: [
			"Consent: you explicitly opt in to waitlist communications by submitting the form.",
			"Legitimate Interests: site analytics and security where not overridden by your data rights.",
			"Legal Obligation: compliance with applicable Indian law where required.",
		],
	},
	{
		id: "sharing",
		title: "4. Sharing Your Data",
		items: [
			"Technology Vendors: email delivery platforms, analytics providers, and cloud hosting services, all subject to data processing agreements. Current vendors will be specified on launch.",
			"Legal and Regulatory Authorities: where required by Indian law, court order, or lawful government request.",
			"Business Transfers: in the event of incorporation, merger, or acquisition, your data may transfer to the successor entity subject to the same protections.",
		],
		note: "We do not sell your personal data.",
	},
	{
		id: "retention",
		title: "5. Data Retention",
		items: [
			"Waitlist data is retained until you withdraw consent or request deletion, or for a maximum of 24 months from collection if the product does not launch, whichever is earlier.",
			"Analytics data is retained for 13 months.",
			"On a valid deletion request, we will purge your personal data within 30 days.",
		],
	},
	{
		id: "rights",
		title: "6. Your Rights",
		items: [
			"Access the personal data we hold about you.",
			"Correct inaccurate or incomplete data.",
			"Withdraw consent to communications at any time without affecting prior lawful processing.",
			"Request erasure of your personal data.",
			"Nominate a person to exercise your data rights in the event of your death or incapacity.",
		],
		note: "To exercise any right, contact connect@nevup.ai. We will respond within 30 days.",
	},
	{
		id: "security",
		title: "7. Data Security",
		copy: "We implement technical and organisational measures to protect your personal data, including encryption in transit (TLS), restricted access controls, and secure cloud infrastructure. For full details, refer to our Security Policy.",
	},
	{
		id: "transfers",
		title: "8. International Transfers",
		copy: "Your data is primarily stored on servers located in India or processed via cloud sub-processors. Where data is transferred outside India, transfers will be conducted only in compliance with the applicable framework under the DPDP Act, 2023, and only to countries or processors as permitted under applicable Central Government notifications.",
	},
	{
		id: "cookies",
		title: "9. Cookies",
		copy: "We use cookies as described in our Cookie Policy below.",
	},
	{
		id: "children",
		title: "10. Children's Privacy",
		copy: "The Site is not intended for users under 18. We do not knowingly collect data from minors. If you believe we hold data about a minor, contact connect@nevup.ai and we will delete it promptly.",
	},
	{
		id: "grievance",
		title: "11. Grievance Officer",
		items: [
			"Email: grievance@nevup.ai",
			"Grievance Officer: name to be designated upon incorporation",
			"Response timeline: acknowledgement within 48 hours; resolution within 30 days.",
		],
	},
	{
		id: "changes",
		title: "12. Changes",
		copy: "We will notify you of material changes via the email address provided at waitlist registration at least 7 days before they take effect.",
	},
	{
		id: "contact",
		title: "13. Contact",
		copy: "Privacy queries: connect@nevup.ai",
	},
];

const pageStyles: CSSProperties = {
	minHeight: "100vh",
	background:
		"radial-gradient(circle at top left, rgba(243, 67, 1, 0.16) 0%, transparent 28%), radial-gradient(circle at top right, rgba(255, 255, 255, 0.9) 0%, transparent 22%), linear-gradient(180deg, #f7f3ed 0%, #f2ece4 100%)",
	color: "#0a0a0a",
	overflowX: "hidden",
};

const containerStyles: CSSProperties = {
	maxWidth: 1280,
	margin: "0 auto",
	paddingLeft: 40,
	paddingRight: 40,
};

const headingFont: CSSProperties = {
	fontFamily: "Funnel Display, sans-serif",
};

const bodyFont: CSSProperties = {
	fontFamily: "Satoshi, sans-serif",
};

function SectionCard({ title, items, copy, note }: { title: string; items?: string[]; copy?: string; note?: string }) {
	return (
		<section style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(10,10,10,0.08)", borderRadius: 24, padding: 28, boxShadow: "0 24px 60px rgba(0,0,0,0.05)" }}>
			<h2 style={{ ...headingFont, fontWeight: 600, fontSize: 30, lineHeight: 1.08, letterSpacing: "-0.02em", color: "#0a0a0a", margin: 0 }}>{title}</h2>
			{copy ? (
				<p style={{ ...bodyFont, fontSize: 16, lineHeight: 1.7, color: "#4f5560", margin: "16px 0 0", textWrap: "pretty" }}>{copy}</p>
			) : null}
			{items ? (
				<ul style={{ margin: "16px 0 0", paddingLeft: 20, display: "grid", gap: 10 }}>
					{items.map((item) => (
						<li key={item} style={{ ...bodyFont, fontSize: 16, lineHeight: 1.7, color: "#28313b" }}>
							{item}
						</li>
					))}
				</ul>
			) : null}
			{note ? (
				<p style={{ ...bodyFont, fontSize: 14, lineHeight: 1.7, color: "#66707a", margin: "14px 0 0" }}>{note}</p>
			) : null}
		</section>
	);
}

export default function Page() {
	return (
		<div style={pageStyles}>
			<LandingNavbar />

			<main id="top" style={{ position: "relative" }}>
				<section style={{ padding: "180px 40px 88px" }}>
					<div style={containerStyles}>
						<div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 32, alignItems: "start" }}>
							<div>
								<p style={{ ...bodyFont, fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f34301" }}>Privacy Policy</p>
								<h1 style={{ ...headingFont, fontWeight: 500, fontSize: "clamp(3.4rem, 7vw, 6rem)", lineHeight: 0.94, letterSpacing: "-0.04em", color: "#0a0a0a", margin: "18px 0 0", textWrap: "balance" }}>How NevUp handles your data.</h1>
								<p style={{ ...bodyFont, fontSize: 19, lineHeight: 1.7, color: "#4f5560", margin: "24px 0 0", maxWidth: 760, textWrap: "pretty" }}>
									Effective Date: June 2026 | Last Updated: June 2026 | <www className="nevup in"></www>
								</p>
								<p style={{ ...bodyFont, fontSize: 17, lineHeight: 1.75, color: "#4f5560", margin: "18px 0 0", maxWidth: 840, textWrap: "pretty" }}>
									This Privacy Policy explains how NevUp AI collects, uses, stores, and shares your personal data when you visit our website and join our product waitlist. It is drafted in compliance with India's Information Technology Act, 2000, the IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023 (DPDP Act).
								</p>
								<p style={{ ...bodyFont, fontSize: 17, lineHeight: 1.75, color: "#4f5560", margin: "18px 0 0", maxWidth: 840, textWrap: "pretty" }}>
									This policy applies to the waitlist website only. A comprehensive privacy policy covering the full product, brokerage integrations, behavioural analytics, and AI features will be published upon formal incorporation and product launch.
								</p>
							</div>

							<div style={{ background: "#0a0a0a", color: "#fffaf2", borderRadius: 24, padding: 24, boxShadow: "0 30px 80px rgba(0,0,0,0.18)" }}>
								<p style={{ ...bodyFont, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,250,242,0.65)", fontWeight: 700 }}>Quick Summary</p>
								<div style={{ display: "grid", gap: 14, marginTop: 18 }}>
									{summaryItems.map((item) => (
										<div key={item.title} style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,250,242,0.08)" }}>
											<p style={{ ...headingFont, fontWeight: 600, fontSize: 20, margin: 0, color: "#fffaf2" }}>{item.title}</p>
											<p style={{ ...bodyFont, fontSize: 14, lineHeight: 1.6, margin: "8px 0 0", color: "rgba(255,250,242,0.72)" }}>{item.copy}</p>
										</div>
									))}
								</div>
								<div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255,250,242,0.1)", display: "grid", gap: 10 }}>
									
									
								</div>
							</div>
						</div>
					</div>
				</section>

				<section style={{ padding: "0 40px 96px" }}>
					<div style={{ ...containerStyles, display: "grid", gap: 18 }}>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
							{policySections.map((section) => (
								<a key={section.id} href={`#${section.id}`} style={{ ...bodyFont, fontSize: 13, textDecoration: "none", color: "#0a0a0a", border: "1px solid rgba(10,10,10,0.12)", background: "rgba(255,255,255,0.7)", borderRadius: 999, padding: "10px 14px" }}>
									{section.title}
								</a>
							))}
						</div>

						{policySections.map((section) => (
							<div key={section.id} id={section.id} style={{ scrollMarginTop: 120 }}>
								<SectionCard title={section.title} items={section.items} copy={section.copy} note={section.note} />
							</div>
						))}
					</div>
				</section>
			</main>

			<LandingFooter />
		</div>
	);
}
