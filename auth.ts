// Google onboarding for Compass (Auth.js v5). Users sign in with Google; we
// require a VERIFIED Google email (real-user validation) and upsert their
// contact info into the Postgres `users` table. JWT sessions — no adapter, so
// the sign-in callback is the single place a user row is written.
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { q } from './app/api/_lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    // real-user gate: reject unverified Google emails
    async signIn({ profile }) {
      return !!profile?.email && profile.email_verified !== false;
    },
    // on sign-in, upsert the user and carry our UUID on the token
    async jwt({ token, profile }) {
      if (profile?.sub) {
        const rows = await q<{ id: string }>(
          `insert into users (google_sub, email, email_verified, name, picture)
             values ($1,$2,$3,$4,$5)
           on conflict (google_sub) do update set
             email = excluded.email,
             email_verified = excluded.email_verified,
             name = excluded.name,
             picture = excluded.picture,
             last_seen_at = now()
           returning id`,
          [profile.sub, profile.email, profile.email_verified ?? false,
           profile.name ?? null, (profile as { picture?: string }).picture ?? null],
        );
        if (rows[0]) token.uid = rows[0].id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) session.user.id = token.uid as string;
      return session;
    },
  },
});
