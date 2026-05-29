"use client";

import { motion } from "motion/react";
import Grainient from "./Granient";
import BorderGlow from "./Borderglow";
// import Granient from "../components/Gra"
export default function MeetFounder() {
  return (
    <section className="meet-founder-section section" id="founder">
      <div className="meet-founder-bg-placeholder overflow-hidden" aria-hidden="true">
        
  <Grainient
    color1="#FF9FFC"
    color2="#5227FF"
    color3="#B497CF"
    timeSpeed={0.25}
    colorBalance={0}
    warpStrength={1}
    warpFrequency={5}
    warpSpeed={2}
    warpAmplitude={50}
    blendAngle={0}
    blendSoftness={0.05}
    rotationAmount={500}
    noiseScale={2}
    grainAmount={0.1}
    grainScale={2}
    grainAnimated={false}
    contrast={1.5}
    gamma={1}
    saturation={1}
    centerX={0}
    centerY={0}
    zoom={0.9}
  />

      </div>
      <div className="container">
        <motion.div
          className="meet-founder-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="meet-founder-copy">
            <h2 className="heading-lg"
            
          style={{color:"#fff"}}
            >
              This problem wasn&apos;t studied.
              <br />
              It was lived.
            </h2>
            <p className="body-md"
            
          style={{color:"#fff"}}
            >
              The team behind NevUp has spent years in live markets, trading
              psychology, and behavioral research before there was a product to
              sell.
            </p>
          </div>
          <div className="meet-founder-cards">
            {/* <article className="meet-founder-card">
              <h3 className="heading-sm">ansh tiwari</h3>
              <p className="meet-founder-role">Founder</p>
              <p className="body-sm">
                Six years in live markets across crypto and forex. Had a
                system. It worked on paper. It broke under pressure. One
                conversation with a mentor reframed it: the problem wasn&apos;t the
                trade it was the trader pulling the trigger. That became NevUp.
                Before that: Money Spirit, a trading psychology practice where
                Ansh coached 50+ traders through the part every curriculum
                skips. Then a proprietary arbitrage system at SkyBan
                Technologies.
              </p>
            </article>
            <article className="meet-founder-card">
              <h3 className="heading-sm">yashasvi</h3>
              <p className="meet-founder-role">COO</p>
              <p className="body-sm">
                Formal training in Economics, Psychology, and Public
                Administration applied directly to the behavioral science at
                NevUp&apos;s core. Built the fundraising and operational
                infrastructure from scratch, before capital, before
                product-market fit. She chose to build before there was
                anything to build on.
              </p>
            </article> */}

            <BorderGlow
  edgeSensitivity={30}
  glowColor="40 80 80"
  backgroundColor="#120F17"
  borderRadius={28}
  glowRadius={40}
  glowIntensity={1}
  coneSpread={25}
  animated={false}
  colors={['#c084fc', '#f472b6', '#38bdf8']}
>
  <div style={{ padding: '2em' }}>
    <h2 className="text-4xl font-medium">Ansh Tiwari</h2>
    <p className="mb-10">Founder  </p>
    <p> Six years in live markets across crypto and forex. Had a
                system. It worked on paper. It broke under pressure. One
                conversation with a mentor reframed it: the problem wasn&apos;t the
                trade it was the trader pulling the trigger. That became NevUp.
                Before that: Money Spirit, a trading psychology practice where
                Ansh coached 50+ traders through the part every curriculum
                skips. Then a proprietary arbitrage system at SkyBan
                Technologies.</p>
  </div>
</BorderGlow>
<BorderGlow
  edgeSensitivity={30}
  glowColor="40 80 80"
  backgroundColor="#120F17"
  borderRadius={28}
  glowRadius={40}
  glowIntensity={1}
  coneSpread={25}
  animated={false}
  colors={['#c084fc', '#f472b6', '#38bdf8']}
>
  <div style={{ padding: '2em' }}>
    <h2 className="text-4xl font-medium">Yashasvi</h2>
    <p className="mb-10">COO</p>
    <p>  Formal training in Economics, Psychology, and Public
                Administration applied directly to the behavioral science at
                NevUp&apos;s core. Built the fundraising and operational
                infrastructure from scratch, before capital, before
                product-market fit. She chose to build before there was
                anything to build on.</p>
  </div>
</BorderGlow>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
