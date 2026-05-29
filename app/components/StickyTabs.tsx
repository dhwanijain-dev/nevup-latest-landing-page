"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const tabs = [
  {
    id: "knows",
    label: "KNOWS",
    subtitle: "Your Behavioral Profile",
    body: "We analyze your full trading history to build a model of you specifically. When you break. Under what pressure. What patterns precede the mistake. Not a generic risk score. A map of your personal failure modes.",
  },
  {
    id: "sees",
    label: "SEES",
    subtitle: "Real-Time AI Monitoring",
    body: "Proprietary small language models watch your live behavior and flag emotional states as they form: FOMO entries, revenge trades, position-size deviations. Biometric integration (HRV monitoring) on the near-term roadmap.",
  },
  {
    id: "does",
    label: "DOES",
    subtitle: "Personalized Intervention",
    body: "Every trade is checked against your own stated plan. When something is off, you get a nudge grounded in your specific history and this specific moment. Not a warning. A mirror.",
  },
];

export default function StickyTabs() {
  const [activeTab, setActiveTab] = useState("knows");
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    tabs.forEach((tab, i) => {
      const el = panelRefs.current[i];
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveTab(tab.id);
          }
        },
        { threshold: 0.4, rootMargin: `-${72 + 62}px 0px -40% 0px` }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollToPanel = (index: number) => {
    panelRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="sticky-tabs-section" id="how-it-works">
      <div className="sticky-tabs-nav">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            className={`sticky-tab-btn${activeTab === tab.id ? " active" : ""}`}
            onClick={() => scrollToPanel(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, i) => (
        <div
          className="tab-panel"
          key={tab.id}
          id={`tab-${tab.id}`}
          ref={(el) => { panelRefs.current[i] = el; }}
        >
            <div className="container">
              <motion.div
                className={`tab-panel-content${i % 2 === 0 ? " reverse" : ""}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="tab-image-placeholder" aria-hidden="true">
                  <span>Placeholder Image</span>
                </div>

                <div className="tab-copy">
                  <p className="tab-label">{tab.label}</p>
                  <h2 className="heading-lg">{tab.subtitle}</h2>
                  <p className="body-lg">{tab.body}</p>
                </div>
              </motion.div>
            </div>
        </div>
      ))}
    </section>
  );
}
