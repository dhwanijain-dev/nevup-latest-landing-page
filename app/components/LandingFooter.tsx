"use client";

import Image from "next/image";
import { useTheme } from "./ThemeProvider";

const footerColumns = [
  {
    title: "Product",
    links: [
      ["How it works", "/how"],
      ["For Brokerages", "/brokerage"],
      ["Join the waitlist", "/waitlist"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Team", "/about/#team"],
      ["Contact", "/contact"],
      ["Newsletter", "/contact/#newsletter"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/about/privacy"],
      ["Terms of Service", "#contact"],
      ["Risk Disclosure", "#contact"],
    ],
  },
  {
    title: "Connect",
    links: [
      ["LinkedIn", "https://www.linkedin.com/company/nevup/"],
      // ["Twitter / X", "#contact"],
      // ["Press kit", "#contact"],
      ["connect@nevup.in", "mailto:connect@nevup.in"],
    ],
  },
] as const;

export default function LandingFooter() {
  const { isDark } = useTheme();

  const bg = isDark ? "#0a0a0a" : "#111111";
  const fg = "#fffaf2";
  const fgMuted = "rgba(255,250,226,0.55)";
  const fgGhost = "rgba(255,250,226,0.45)";
  const borderColor = "rgba(255,250,226,0.1)";

  return (
    <footer
      id="contact"
      style={{
        background: bg,
        color: fg,
        padding: "72px 40px 32px",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr",
            gap: 48,
            paddingBottom: 56,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Image src="/whitelogo.png" width={160} height={32} alt="NevUp" style={{ width: "100%", height: "100%" }} />
            </div>
            <p style={{ fontFamily: "Funnel Display, sans-serif", fontSize: 22, lineHeight: 1.3, color: fg, marginTop: 22, maxWidth: 320, fontWeight: 400 }}>Built for clear decisions in noisy markets.</p>
            <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 13, color: fgMuted, marginTop: 18, lineHeight: 1.6, maxWidth: 320 }}>NevUp AI is a behavioral intelligence layer for modern traders. Trusted by traders across crypto, forex, and equities.</p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: fgGhost, fontWeight: 600 }}>{column.title}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
                {column.links.map(([label, href]) => (
                  <a key={label} href={href} style={{ fontFamily: "Satoshi, sans-serif", fontSize: 14, color: fg, textDecoration: "none", opacity: 0.85 }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "start", alignItems: "center", marginTop: 32, fontFamily: "Satoshi, sans-serif", fontSize: 12, color: fgGhost, flexWrap: "wrap", gap: 12 }}>
          <span>© 2026 NevUp AI. All rights reserved. NevUp™ is a trademark of NevUp AI.</span>
          {/* <span>Trade Smarter, Not Emotional.</span> */}
        </div>

        <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, color: "rgba(255,250,226,0.3)", marginTop: 24, lineHeight: 1.6, maxWidth: 900 }}>
          Risk disclosure: Trading in financial markets carries a high level of risk, including the potential loss of capital. NevUp AI is a behavioral analytics and intervention tool and is not a registered investment advisor or broker-dealer. NevUp does not provide trading recommendations, execute trades, or take custody of funds. Past performance does not guarantee future results.
        </p>
      </div>
    </footer>
  );
}