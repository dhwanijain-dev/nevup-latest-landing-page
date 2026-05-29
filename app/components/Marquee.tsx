"use client";

import { motion } from "motion/react";

const logos = [
  "Binance", "OANDA", "Coinbase", "TopStep",
  "FTMO", "Interactive Brokers", "Kraken", "MetaTrader",
];

// import LogoLoop from "./Logoloop";

// const techLogos = [
//   { node: <SiReact />, title: "React", href: "https://react.dev" },
//   { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
//   { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
//   { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
// ];

// const imageLogos = [
//   { src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
//   { src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
//   { src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
// ];

export default function Marquee() {
  const doubled = [...logos, ...logos];

  return (
    <section className="marquee-section">
      <div className="marquee-track">
        {doubled.map((name, i) => (
          <span className="marquee-item" key={`${name}-${i}`}>
            {name}
          </span>
        ))}
      </div>

      <div className="container">
        <div className="stats-bar">
          <motion.div
            className="stat-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p>
              72% of day traders lose money annually — not from bad strategies,
              but from behavioral failure.
            </p>
            <p className="stat-source">FINRA</p>
          </motion.div>

          <motion.div
            className="stat-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p>
              41% of Gen Z and millennials would allow an AI system to manage
              their investments.
            </p>
            <p className="stat-source">WEF, 2024</p>
          </motion.div>


           {/* <LogoLoop
        logos={techLogos}
        speed={100}
        direction="left"
        logoHeight={60}
        gap={60}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="#ffffff"
        ariaLabel="Technology partners"
      /> */}
        </div>
      </div>
    </section>
  );
}
