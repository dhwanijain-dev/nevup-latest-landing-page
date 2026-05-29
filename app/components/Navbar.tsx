"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);

  const links = [
    { label: "How It Works", href: "/how" },
    { label: "For Brokerages", href: "/brokerage" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav className="navbar" id="navbar">
        <div className="container">
          <Link href="/" className="nav-logo">
            <Image
              src="/logo.png"
              alt="NevUp Logo"
              width={100}
              height={100}
              style={{ width: "auto", height: "auto" }}
              loading="eager"
              priority
            />
          </Link>

          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>

          <Link href="/waitlist" className="btn btn-primary nav-cta">
            Join the Waitlist
          </Link>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={toggle}
            aria-label="Toggle menu"
          >
            <motion.span
              className="hamburger-bar"
              animate={
                open
                  ? { rotate: 45, y: 0, width: 24 }
                  : { rotate: 0, y: -6, width: 24 }
              }
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ position: "absolute" }}
            />
            <motion.span
              className="hamburger-bar"
              animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              style={{ position: "absolute" }}
            />
            <motion.span
              className="hamburger-bar"
              animate={
                open
                  ? { rotate: -45, y: 0, width: 24 }
                  : { rotate: 0, y: 6, width: 24 }
              }
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ position: "absolute" }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu open"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
              >
                {l.label}
              </motion.a>
            ))}
            <motion.a
              href="/waitlist"
              className="btn btn-primary"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              Join the Waitlist
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
