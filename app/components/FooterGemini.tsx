"use client";

import { motion } from 'motion/react';
import Link from 'next/link';

const FooterSection = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  return (
    <footer className="footer flex justify-center" aria-labelledby="footer-heading" style={{ paddingTop: '96px', paddingBottom: '96px' }}>
      <div className="container" style={{ paddingLeft: 'var(--container-px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <motion.div
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.05 }}
          className="text-center"
        >
          <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
            Get Early Access
          </div>

          <motion.h2
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.12 }}
            className="heading-lg"
            style={{ marginBottom: 16 }}
          >
            Get early access before it opens.
          </motion.h2>

          <motion.p
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.22 }}
            className="body-md"
            style={{ margin: '0 auto 28px', maxWidth: 720 }}
          >
            1,000+ traders are already in line. If you&apos;ve ever closed a position you knew you shouldn&apos;t have opened — NevUp was built for that moment.
          </motion.p>

          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.32 }} style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/waitlist" className="btn btn-primary">Join the Waitlist →</Link>
            <a href="#partnership" className="btn btn-secondary">Book a Partnership Call</a>
          </motion.div>
        </motion.div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="footer-logo">NevUp AI</div>
            </div>

            <nav>
              <ul style={{ display: 'flex', gap: 18, listStyle: 'none', padding: 0, margin: 0, justifyContent: 'center', alignItems: 'center' }}>
                <li><Link href="#">How It Works</Link></li>
                <li><Link href="#">For Prop Firms</Link></li>
                <li><Link href="#">About</Link></li>
                <li><Link href="#">Contact</Link></li>
              </ul>
            </nav>

            <div className="footer-legal">NevUp AI — Pre-Seed, 2026.</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;