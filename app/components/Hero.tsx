"use client";
// import Grainient from ';
import { motion } from "motion/react";
import Grainient from "./Granient";
import GradualBlur from "./GradualBlur";

export default function Hero() {
  return (

    <section className="hero" id="hero">

      <motion.div
        className="hero-box "
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-gradient-bg scale-150" >
          <Grainient
            color1="#F56C48"
            color2="#F04936"
            color3="#F68849"
            timeSpeed={0.5}
            colorBalance={0.09}
            warpStrength={1.25}
            warpFrequency={3.9}
            warpSpeed={0.7}
            warpAmplitude={18}
            blendAngle={0}
            blendSoftness={0}
            rotationAmount={130}
            noiseScale={2}
            grainAmount={0}
            grainScale={2.8}
            grainAnimated={false}
            contrast={1}
            gamma={1}
            saturation={1.1}
            centerX={0.24}
            centerY={0}
            zoom={0.9}

          />
        </div>
        <motion.h1
          className="heading-xl text-white hero-headline"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
        >
          <span className="text-white">The trade wasn&apos;t wrong.</span>
          <br />
          <span className="text-white">You were.</span>
        </motion.h1>

        <motion.p
          className=" body-lg hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7, ease: "easeOut" }}

          style={{color:"#fff"}}
        >
          Your strategy was sound. Your rules were clear. Then the loss hit — and
          everything changed. NevUp AI intercepts the moment discipline breaks
          down, before the damage is done.
        </motion.p>

        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6, ease: "easeOut" }}
        >
          <a href="/waitlist" className="btn btn-primary">
            Join the Waitlist
          </a>
          <a href="#how-it-works" 
          style={{color:"#fff"}}
          
          className="btn btn-secondary ">
            
            See How It Works
          </a>
        </motion.div>

        <motion.p
          className="body-sm hero-trust"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          style={{color:"#fff"}}

        >
          Trusted by traders across crypto, forex, and equities.
        </motion.p>
      </motion.div>

      <motion.div
        className="hero-stats"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7, ease: "easeOut" }}
      >
        <div className="hero-stat-item">
          <div className="hero-stat-number">1,000+</div>
          <p className="hero-stat-description">
            Traders on the waitlist across crypto, forex, and equities.
          </p>
        </div>

        <div className="hero-stat-item">
          <div className="hero-stat-number">72%</div>
          <p className="hero-stat-description">
            of day traders lose money annually — not from bad strategies, but from behavioral failure.
          </p>
          <p className="stat-source">FINRA, 2023</p>
        </div>

        <div className="hero-stat-item">
          <div className="hero-stat-number">That was me<br />last Tuesday.</div>
          <p className="hero-stat-description">
            What traders consistently say after seeing the NevUp demo.
          </p>
        </div>
      </motion.div>
       <GradualBlur 
    target="page"
    position="bottom"
    height="7rem"
    strength={2}
    divCount={5}
    curve="bezier"
    exponential
    opacity={1}
  />
    </section>
  );
}
