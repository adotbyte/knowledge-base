import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' as const },
  callbacks: {
    session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
  providers: [], // provider'iai pridedami auth.ts faile
} satisfies NextAuthConfig;
