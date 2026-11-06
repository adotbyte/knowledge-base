// auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  trustHost: true,
  providers: [], // <-- Pridėta tuščia masyvas, kad atitiktų tipą
  callbacks: {
    session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
