"use client";

import { motion } from "motion/react";

const badges = [
  "Proprietary SLM",
  "Biometric Integration — Roadmap",
  "Broker API Ready",
];

export default function BuiltOn() {
  return (
    <section className="built-section section" id="brokerages">
      <div className="container">
        <div className="built-top">
          <motion.h2
            className="heading-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            Built for the generation that won&apos;t accept a trading
            environment built against them.
          </motion.h2>

          <motion.p
            className="body-lg section-body"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            NevUp is built on a foundation of proprietary technology designed to
            scale with the modern trader.
          </motion.p>
        </div>

        <motion.div
          className="b2b-split"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="b2b-copy">
            <h3 className="heading-md">For brokerages and prop firms</h3>
            <p className="body-md">
              Traders who don&apos;t blow their accounts stay on your platform
              longer. NevUp integrates as a behavioral intelligence layer — no
              platform migration, no friction at onboarding. Tiered B2B SaaS
              licensing. Billed to active traders. Recurring from day one.
            </p>
            <a href="#contact" className="btn btn-primary">
              Book a Partnership Call →
            </a>
          </div>

          <div className="b2b-image-placeholder" aria-hidden="true">
            <span>Image Placeholder</span>
          </div>
        </motion.div>

        
      </div>
    </section>
  );
}
