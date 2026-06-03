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
        // DYNAMIC PADDING: Uses 5% padding on mobile, clamps to 40px maximum on desktop
        padding: "72px min(5%, 40px) 32px",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>

        {/* ULTRA-RESPONSIVE GRID MIX */}
        <div
          style={{
            display: "grid",
            // Dynamically scales column widths safely down to 150px on super tight screens
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "40px",
            paddingBottom: 56,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          {/* Brand Column: Spans 2 tracks on large screens if space allows, drops gracefully on mobile */}
          <div
            style={{
              gridColumn: "span auto",
              // Ensures text safely scales down if container gets incredibly narrow
              wordBreak: "break-word"
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Image
                src="/whitelogo.png"
                width={160}
                height={32}
                alt="NevUp"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  objectFit: "contain"
                }}
              />
            </div>
            <p style={{ fontFamily: "Funnel Display, sans-serif", fontSize: "22px", lineHeight: 1.3, color: fg, marginTop: 22, maxWidth: "100%", fontWeight: 400 }}>
              Built for clear decisions in noisy markets.
            </p>
            <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: "13px", color: fgMuted, marginTop: 18, lineHeight: 1.6, maxWidth: "100%" }}>
              NevUp AI is a behavioral intelligence layer for modern traders. Trusted by traders across crypto, forex, and equities.
            </p>
          </div>

          {/* Links Columns */}
          {footerColumns.map((column) => (
            <div key={column.title} style={{ minWidth: "0" }}>
              <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: fgGhost, fontWeight: 600 }}>
                {column.title}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
                {column.links.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    style={{
                      fontFamily: "Satoshi, sans-serif",
                      fontSize: 14,
                      color: fg,
                      textDecoration: "none",
                      opacity: 0.85,
                      wordBreak: "break-all", // Crucial for long links/emails like connect@nevup.in on mobile
                      whiteSpace: "normal"
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Copyright section */}
        <div
          style={{
            display: "flex",
            // On mobile, text centers nicely if it wraps; defaults to left-aligned on desktop
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 32,
            fontFamily: "Satoshi, sans-serif",
            fontSize: 12,
            color: fgGhost,
            flexWrap: "wrap",
            gap: 16
          }}
        >
          <span style={{ minWidth: "250px", flexGrow: 1 }}>
            © 2026 NevUp AI. All rights reserved. NevUp™ is a trademark of NevUp AI.
          </span>
        </div>

        {/* Risk Disclosure paragraph */}
        <p
          style={{
            fontFamily: "Satoshi, sans-serif",
            fontSize: 11,
            color: "rgba(255,250,226,0.3)",
            marginTop: 24,
            lineHeight: 1.6,
            maxWidth: 900,
            width: "100%"
          }}
        >
          Risk disclosure: Trading in financial markets carries a high level of risk, including the potential loss of capital. NevUp AI is a behavioral analytics and intervention tool and is not a registered investment advisor or broker-dealer. NevUp does not provide trading recommendations, execute trades, or take custody of funds. Past performance does not guarantee future results.
        </p>
      </div>
    </footer>
  );
}