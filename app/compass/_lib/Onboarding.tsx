// Onboarding gate for /compass. Unauthenticated visitors land here and must
// continue with Google before the app renders. The form uses an Auth.js
// server action, so no client JS is needed to start the OAuth redirect.
import { signIn } from '../../../auth';

const INK = '#14171d';
const GHOST = '#7a5af5';
const MUTED = '#5b6472';

export default function Onboarding() {
  return (
    <main style={{
      minHeight: '100vh', background: '#ffffff', color: INK,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      fontFamily: 'Quicksand, system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/nevup-ai-banner.png"
          alt="NevUp AI"
          style={{ width: '100%', height: 'auto', borderRadius: 14, marginBottom: 28, display: 'block' }}
        />
        <h1 style={{ fontSize: 34, lineHeight: 1.15, fontWeight: 600, margin: '0 0 14px' }}>
          Your trading behavior, analyzed.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.5, color: MUTED, margin: '0 0 32px' }}>
          Continue with Google to begin.
        </p>

        <form action={async () => {
          'use server';
          await signIn('google', { redirectTo: '/compass' });
        }}>
          <button type="submit" style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: INK, color: '#fff', border: 'none', borderRadius: 10,
            padding: '14px 26px', fontSize: 16, fontFamily: 'inherit', cursor: 'pointer',
            fontWeight: 500,
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.3 5.3C41.4 36.4 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}
