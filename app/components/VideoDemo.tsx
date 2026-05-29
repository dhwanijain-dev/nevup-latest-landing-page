"use client";

import { motion } from "motion/react";

export default function VideoDemo() {
  return (
    <section className="video-section section" id="demo">
      <div className="container">
        <motion.h2
          className="heading-lg section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          Watch a revenge trade get stopped before it lands.
        </motion.h2>

        <motion.div
          className="video-container"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <button className="play-btn" aria-label="Play demo video">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </motion.div>

        <motion.p
          className="body-sm video-caption"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Traders tell us the same thing: &ldquo;That was me last Tuesday.&rdquo;
        </motion.p>
      </div>
    </section>
  );
}
