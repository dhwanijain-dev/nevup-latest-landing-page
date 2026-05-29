"use client";

import { motion } from "motion/react";

export default function GradientCTA() {
  return (
    <section className="gradient-cta-section section" id="waitlist">
      <div className="gradient-cta-bg" />
      <div className="container">
        <motion.div
          className="gradient-cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="gradient-cta-copy">
            <h2 className="heading-lg">
              A superintelligence layer for
              <br />
              every trader who traded
              <br />
              against themselves.
            </h2>
            <p className="body-md">
              Every trader has two opponents: the market, and their own
              behavior under pressure. We&apos;ve built a lot of tools for the
              first. Almost nothing for the second.
            </p>
            <p className="body-md">
              NevUp is the beginning of a system where AI doesn&apos;t just execute
              alongside you — it understands you. Your patterns. Your pressure
              points. Your version of discipline at 2am after a drawdown.
            </p>
            <p className="body-md">
              The market doesn&apos;t care about your strategy. It cares what you do
              when the strategy is being tested. That&apos;s the problem we&apos;re
              solving.
            </p>
          </div>
          <div className="gradient-cta-image-placeholder" aria-hidden="true">
            Image Placeholder
          </div>
        </motion.div>
      </div>
    </section>
  );
}
