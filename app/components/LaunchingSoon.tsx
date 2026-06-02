"use client";

import React, { useEffect, useRef, useState } from "react";

export default function LaunchingSoon(): React.ReactElement {
  const getLaunchTarget = (): number => {
    const now = new Date();
    let year = now.getFullYear();
    // Target: June 3 at 15:00 (3pm) local time
    let target = new Date(year, 5, 3, 15, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target = new Date(year + 1, 5, 3, 15, 0, 0);
    }
    return target.getTime();
  };

  const launchDateRef = useRef<number>(getLaunchTarget());
  const [time, setTime] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const [flipSec, setFlipSec] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    function pad(n: number) { return String(n).padStart(2, "0"); }

    function update() {
      const now = Date.now();
      const diff = launchDateRef.current - now;
      if (diff <= 0) {
        setTime({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const newSec = pad(seconds);
      if (newSec !== time.seconds) {
        setFlipSec(true);
        setTimeout(() => setFlipSec(false), 150);
      }

      setTime({ days: pad(days), hours: pad(hours), minutes: pad(minutes), seconds: newSec });
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [time.seconds]);

  function handleNotify(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
  }

  return (
    <div className="launch-root">
      <div className="status-bar" />
      

      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <img className="bg-logo" src="/logo.png" alt="NevUp logo" />

      <div className="corner corner--tl">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 40 L2 2 L40 2" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" />
          <circle cx="2" cy="2" r="2" fill="#c8a96e" />
        </svg>
      </div>
      <div className="corner corner--tr">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 40 L2 2 L40 2" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" />
          <circle cx="2" cy="2" r="2" fill="#c8a96e" />
        </svg>
      </div>
      <div className="corner corner--bl">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 40 L2 2 L40 2" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" />
          <circle cx="2" cy="2" r="2" fill="#c8a96e" />
        </svg>
      </div>
      <div className="corner corner--br">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 40 L2 2 L40 2" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" />
          <circle cx="2" cy="2" r="2" fill="#c8a96e" />
        </svg>
      </div>

      <main className="container">
        {/* <div className="brand"><span className="mark">nevup</span></div> */}
        <div className="badge">
          <span className="badge-dot" />
          Something extraordinary is being crafted
        </div>

        <h1>We're<br /><em>almost</em><br />ready</h1>
        <p className="headline-sub">Good things take time.</p>

        <div className="divider">
          <div className="divider-line" />
          <svg className="divider-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 1L12.2 7.8H19.5L13.6 11.9L15.8 18.7L10 14.6L4.2 18.7L6.4 11.9L0.5 7.8H7.8L10 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
          </svg>
          <div className="divider-line" />
        </div>

        <div className="countdown">
          <div className="time-unit"><div className="time-number">{time.days}</div><div className="time-label">Days</div></div>
          <div className="time-unit"><div className="time-number">{time.hours}</div><div className="time-label">Hours</div></div>
          <div className="time-unit"><div className="time-number">{time.minutes}</div><div className="time-label">Minutes</div></div>
          <div className="time-unit"><div className={`time-number ${flipSec ? 'flip' : ''}`}>{time.seconds}</div><div className="time-label">Seconds</div></div>
        </div>

        {/* {!subscribed ? (
          <form className="notify-form" onSubmit={handleNotify}>
            <input className="notify-input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="notify-btn" type="submit">Notify Me</button>
          </form>
        ) : (
          <div className="success-msg visible"><div className="success-check">
            <svg viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3 6L7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>You're on the list — we'll be in touch</div>
        )} */}

        {/* <div className="social-links"><a href="#" className="social-link">Twitter</a><a href="#" className="social-link">Instagram</a><a href="#" className="social-link">LinkedIn</a></div> */}
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

        :root {
          --cream: #f7f8fb; /* background base */
          --warm-white: #ffffff;
          --ink: #0a0a0a; /* foreground */
          --ink-soft: #222222;
          --ink-muted: #6b6b6b;
          --gold: #f34301; /* brand accent */
          --gold-light: rgba(243,67,1,0.12);
          --gold-pale: rgba(243,67,1,0.06);
          --border: rgba(10,10,10,0.06);
          --border-strong: rgba(10,10,10,0.12);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #__next { height: 100%; }

        body {
          background: var(--cream);
          color: var(--ink);
          font-family: 'DM Mono', monospace;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        /* grid background removed as requested */

        body::after {
          content: '';
          position: fixed;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 800px; height: 600px;
          background: radial-gradient(ellipse, rgba(200,169,110,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .corner { position: fixed; width: 80px; height: 80px; z-index: 1; opacity: 0; animation: fadeIn 1.2s ease forwards; }
        .corner svg { width: 100%; height: 100%; }
        .corner--tl { top: 32px; left: 32px; animation-delay: 0.2s; }
        .corner--tr { top: 32px; right: 32px; transform: scaleX(-1); animation-delay: 0.3s; }
        .corner--bl { bottom: 32px; left: 32px; transform: scaleY(-1); animation-delay: 0.4s; }
        .corner--br { bottom: 32px; right: 32px; transform: scale(-1); animation-delay: 0.5s; }

        .status-bar { position: fixed; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); z-index: 10; animation: shimmer 3s ease-in-out infinite; }

        @keyframes shimmer { 0%,100%{opacity:.4}50%{opacity:1} }

        .container { position: relative; z-index: 2; text-align: center; max-width: 680px; width: 100%; padding: 48px 40px; }

        .brand { position: absolute; left: 24px; top: 24px; font-family: 'DM Mono', monospace; font-weight: 700; color: var(--ink); letter-spacing: .08em; background: transparent; padding: 6px 10px; border-radius: 6px; border: 1px solid transparent; }
        .brand .mark { color: var(--gold); font-weight: 800; margin-right: 8px; }

        .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border: 1px solid var(--border-strong); background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); border-radius: 100px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 48px; opacity: 0; animation: slideDown 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s forwards; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.7} }

        h1 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(56px,8vw,96px); line-height: .95; letter-spacing: -.02em; color: var(--ink); margin-bottom:8px; opacity:0; animation: slideUp 1s cubic-bezier(0.16,1,0.3,1) 0.6s forwards; }
        h1 em { font-style: italic; color: var(--gold); }
        .headline-sub { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: clamp(20px,3vw,32px); color: var(--ink-muted); margin-bottom: 48px; opacity:0; animation: slideUp 1s cubic-bezier(0.16,1,0.3,1) 0.75s forwards; }

        .divider { display:flex; align-items:center; gap:16px; margin-bottom:48px; opacity:0; animation: fadeIn 1s ease 1s forwards; }
        .divider-line { flex:1; height:1px; background: linear-gradient(90deg, transparent, var(--border-strong)); }
        .divider-line:last-child { background: linear-gradient(90deg, var(--border-strong), transparent); }
        .divider-icon { width:20px; height:20px; color:var(--gold); }

        .countdown { display:flex; justify-content:center; gap:0; margin-bottom:56px; opacity:0; animation: slideUp 1s cubic-bezier(0.16,1,0.3,1) 0.9s forwards; }
        .time-unit { display:flex; flex-direction:column; align-items:center; padding:20px 28px; position:relative; }
        .time-unit + .time-unit::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:1px; background:var(--border-strong); }
        .time-number { font-family: 'Cormorant Garamond', serif; font-weight:300; font-size: clamp(36px,5vw,52px); color:var(--ink); line-height:1; min-width:2ch; text-align:center; transition: all .3s ease; }
        .time-number.flip { transform: translateY(-4px); opacity: .6; }
        .time-label { font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--ink-muted); margin-top:8px; }

        .notify-form { display:flex; align-items:center; gap:0; max-width:420px; margin:0 auto 32px; border:1px solid var(--border-strong); border-radius:4px; background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); overflow:hidden; opacity:0; animation: slideUp 1s cubic-bezier(0.16,1,0.3,1) 1.1s forwards; transition: border-color .3s, box-shadow .3s; }
        .notify-form:focus-within { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-pale); }
        .notify-input { flex:1; background:transparent; border:none; outline:none; padding:14px 20px; font-family:'DM Mono',monospace; font-size:12px; color:var(--ink); letter-spacing:.02em; }
        .notify-input::placeholder { color:var(--ink-muted); }
        .notify-btn { background:var(--ink); color:var(--cream); border:none; outline:none; padding:14px 24px; font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.15em; text-transform:uppercase; cursor:pointer; transition: background .2s, transform .1s; white-space:nowrap; }
        .notify-btn:hover { background: var(--gold); }
        .notify-btn:active { transform: scale(.98); }

        .success-msg { display:none; align-items:center; justify-content:center; gap:10px; font-size:11px; letter-spacing:.12em; color:var(--ink-muted); text-transform:uppercase; margin-bottom:32px; opacity:0; animation: fadeIn .6s ease forwards; }
        .success-msg.visible { display:flex; }
        .success-check { width:16px; height:16px; border:1.5px solid var(--gold); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .success-check svg { width:8px; height:8px; color:var(--gold); }

        .social-links { display:flex; justify-content:center; gap:24px; opacity:0; animation: fadeIn 1s ease 1.3s forwards; }
        .social-link { font-size:10px; letter-spacing:.15em; text-transform:uppercase; color:var(--ink-muted); text-decoration:none; position:relative; transition: color .2s; }
        .social-link::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:1px; background:var(--gold); transform: scaleX(0); transition: transform .3s; }
        .social-link:hover { color:var(--ink); }
        .social-link:hover::after { transform: scaleX(1); }

        .orb { position: fixed; border-radius: 50%; filter: blur(60px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 300px; height: 300px; background: rgba(200,169,110,0.08); top: -100px; right: 10%; animation: float1 12s ease-in-out infinite; }
        .orb-2 { width: 200px; height: 200px; background: rgba(200,169,110,0.06); bottom: 10%; left: 5%; animation: float2 16s ease-in-out infinite; }
        @keyframes float1 { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(-30px,40px) rotate(120deg)} 66%{transform:translate(20px,-20px) rotate(240deg)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-60px)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0; transform: translateY(24px)} to{opacity:1; transform: translateY(0)} }
        @keyframes slideDown { from{opacity:0; transform: translateY(-16px)} to{opacity:1; transform: translateY(0)} }

        /* scanline removed */

        .bg-logo { position: fixed; right: 5%; bottom: 6%; width: 420px; max-width: 42vw; opacity: 0.08; pointer-events: none; z-index: 0; transform-origin: center; }
      `}</style>
    </div>
  );
}
