"use client";

import { motion } from "motion/react";

const markets = ["Crypto", "Forex", "Equities"];

export default function EveryTrade() {
  return (
    <section className="every-trade-section section" id="about">
      <div className="container">
        <motion.h2
          className="heading-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          Every trade. Every trader. Every moment.
        </motion.h2>

        <motion.p
          className="body-lg section-body"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          NevUp sits between your decision and your execution — across crypto,
          forex, and equities. Not to block you. To show you who you are in this
          moment, and whether that matches who you said you&apos;d be.
        </motion.p>

        <div className="market-pills">
          {markets.map((m, i) => (
            <motion.span
              className="market-pill"
              key={m}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
            >
              → {m}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
