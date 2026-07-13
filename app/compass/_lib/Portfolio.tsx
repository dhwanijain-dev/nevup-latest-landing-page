'use client';
// Portfolio - a teaser for the full NevUp trading terminal. Shows a preview of
// the terminal behind a translucent glass overlay, with an invite to opt in.
import { useState } from 'react';
import { T } from './theme';

export default function Portfolio() {
  const [choice, setChoice] = useState<'yes' | 'no' | null>(null);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 42px)', overflow: 'hidden' }}>
      {/* full-bleed terminal preview */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/terminal-preview.png" alt="NevUp trading terminal preview"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

      {/* translucent glass overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{
          maxWidth: 780, width: '100%', background: '#fff',
          border: `1px solid ${T.border}`, borderRadius: 14,
          boxShadow: '0 24px 60px rgba(20,23,29,0.18)',
          display: 'flex', flexWrap: 'wrap', overflow: 'hidden',
        }}>
          {/* deck image beside the text */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/deckcards.jpeg" alt="NevUp"
            style={{ width: 240, flex: '1 1 220px', minWidth: 200, objectFit: 'cover', maxHeight: 360 }} />

          <div style={{ flex: '2 1 320px', padding: '30px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.16em', color: T.ghost, textTransform: 'uppercase' }}>
              Coming soon
            </div>
            <h2 style={{ fontFamily: T.serif, fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600, color: T.ink, lineHeight: 1.25, margin: '12px 0 10px' }}>
              We are building the next-gen trading terminal.
            </h2>
            <p style={{ fontFamily: T.serif, fontSize: 15.5, color: T.mutedStrong, lineHeight: 1.6, margin: 0 }}>
              Built around you and your trading. No one comes in between. Would you like to use it?
            </p>

            {choice === null ? (
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={() => setChoice('yes')} style={{
                  background: T.ink, color: '#fff', border: 'none', borderRadius: 9,
                  padding: '12px 26px', fontFamily: T.mono, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>Yesss</button>
                <button onClick={() => setChoice('no')} style={{
                  background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: 9,
                  padding: '12px 26px', fontFamily: T.mono, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>No</button>
              </div>
            ) : (
              <div style={{ marginTop: 22, fontFamily: T.serif, fontSize: 15, color: choice === 'yes' ? T.green : T.muted, lineHeight: 1.6 }}>
                {choice === 'yes'
                  ? 'Love it. You are on the early list, we will let you know the moment it opens.'
                  : 'No problem. It will be here whenever you are ready.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
