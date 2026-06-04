"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Moon, Sun, X } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "./ThemeProvider";

const navLinks = [
  { label: "How it works", href: "/how" },
  { label: "For Partners", href: "/brokerage" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const darkMode = isDark;
  const logoHref = pathname === "/" ? "#top" : "/";

  const vars: Record<string, string> = isDark
    ? {
      navBg: "rgba(10,10,10,0.7)",
      navBorder: "rgba(255,250,226,0.12)",
      fg: "#fffaf2",
    }
    : {
      navBg: "rgba(247,243,237,0.8)",
      navBorder: "rgba(0,0,0,0.1)",
      fg: "#0a0a0a",
    };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: vars.navBg,
        borderBottom: `1px solid ${vars.navBorder}`,
        backdropFilter: "blur(14px) saturate(140%)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          paddingLeft: isMobile ? 20 : 40,
          paddingRight: isMobile ? 20 : 40,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 20,
          paddingBottom: 20,
          gap: 20,
        }}
      >
        <Link href={logoHref} style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/darknevuplogo.png" alt="NevUp" width={160} height={30} style={{ width: "500%", height: "500%" }} />
        </Link>

        {!isMobile ? (
          <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: vars.fg,
                  opacity: pathname === link.href ? 1 : 0.85,
                  textDecoration: "none",
                  paddingBottom: 2,
                  borderBottom: pathname === link.href ? `1.5px solid ${vars.fg}` : "1.5px solid transparent",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}

        {!isMobile ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* <button
              type="button"
              aria-label="Switch theme"
              title="Switch theme"
              onClick={toggleTheme}
              style={{
                background: "transparent",
                color: vars.fg,
                border: `1px solid ${darkMode ? "rgba(255,250,226,0.2)" : "rgba(0,0,0,0.15)"}`,
                borderRadius: 999,
                width: 38,
                height: 38,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button> */}
            <Link
              href="https://cal.com/nevup-ai/nevup-for-partners"
              style={{
                background: "transparent",
                color: vars.fg,
                border: `1px solid ${darkMode ? "rgba(255,250,226,0.2)" : "rgba(0,0,0,0.15)"}`,
                borderRadius: 8,
                padding: "10px 18px",
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Book a Call
            </Link>
            <Link
              href="/waitlist"
              style={{
                background: "#f34301",
                color: "#fffaf2",
                border: 0,
                borderRadius: 8,
                padding: "11px 18px",
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Join the Waitlist →
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              border: `1px solid ${vars.navBorder}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: vars.fg,
            }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isMobile && menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ background: vars.navBg, borderTop: `1px solid ${vars.navBorder}`, padding: 20 }}
          >
            <div
              style={{
                maxWidth: 1280,
                margin: "0 auto",
                paddingLeft: isMobile ? 20 : 40,
                paddingRight: isMobile ? 20 : 40,
                display: "grid",
                gap: 10,
              }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${vars.navBorder}`,
                    padding: "12px 14px",
                    fontFamily: "Satoshi, sans-serif",
                    fontSize: 14,
                    color: vars.fg,
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </a>
              ))}
              {/* <button
                type="button"
                onClick={toggleTheme}
                style={{
                  borderRadius: 10,
                  border: `1px solid ${vars.navBorder}`,
                  padding: "12px 14px",
                  fontFamily: "Satoshi, sans-serif",
                  fontSize: 14,
                  color: vars.fg,
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button> */}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}