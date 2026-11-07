import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma';
import { authConfig } from '@/auth.config';

const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = isProduction
  ? { httpOnly: true, sameSite: 'lax' as const, secure: true, path: '/' }
  : { httpOnly: true, sameSite: 'lax' as const, secure: false, path: '/' };

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  trustHost: true,
  cookies: {
    csrfToken: {
      name: isProduction ? '__Secure-authjs.csrf-token' : 'authjs.csrf-token',
      options: cookieOptions,
    },
    sessionToken: {
      name: isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: cookieOptions,
    },
    callbackUrl: {
      name: isProduction ? '__Secure-authjs.callback-url' : 'authjs.callback-url',
      options: cookieOptions,
    },
  },
  // ✅ CALLBACKS TURI BŪTI ČIA, NextAuth({ ... }) VIDUJE
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
