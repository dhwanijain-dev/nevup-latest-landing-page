"use client";

import { motion } from "motion/react";

const cards = [
  {
    title: "Revenge trade. Stopped.",
    body: "You just took a loss. Your next entry is 3x your normal size. NevUp flags it before execution — and shows you the last 6 times this pattern appeared in your history.",
  },
  {
    title: "FOMO entry. Flagged.",
    body: "The move already happened. You're late. NevUp recognizes the behavioral signature and surfaces your own rule: 'Never chase a breakout after the first 15 minutes.'",
  },
  {
    title: "Position-size deviation. Caught.",
    body: "You said 1% risk per trade. This one is 3.8%. NevUp doesn't block it — it asks if you meant to change your plan today, or if something else is going on.",
  },
];

export default function FeatureCards() {
  return (
    <section className="feature-cards-section section">
      <div className="container">
        <motion.h2
          className="heading-lg section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          What discipline looks like in practice.
        </motion.h2>

        <div className="cards-grid">
          {cards.map((card, i) => (
            <motion.div
              className="feature-card"
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <h3 className="heading-sm card-title">{card.title}</h3>
              <p className="card-body">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
