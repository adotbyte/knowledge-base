import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // ✅ 1. GOOGLEBOT
  const isGooglebot = userAgent.includes('Googlebot');
  if (isGooglebot) {
    if (pathname === '/' || pathname === '/lt' || pathname === '/en') {
      return intlMiddleware(request);
    }
  }

  // ✅ 2. VIEŠI MARŠRUTAI
  const isPublicRoute =
    pathname.includes('/login') ||
    pathname.includes('/demo') ||
    pathname.includes('/public') ||
    pathname.includes('/privacy') ||
    pathname.includes('/code-review') ||
    pathname.includes('/config-generator') ||
    pathname.includes('/explainer') ||
    pathname.includes('/api/system-stats') ||
    pathname.includes('/manifest.json') ||
    pathname.includes('/icon.svg') ||
    pathname.includes('/_next') ||
    pathname.includes('/api') ||
    pathname.includes('/llms.txt') ||
    pathname.includes('/.well-known');

  if (isPublicRoute) {
    // ✅ APEINAME intlMiddleware manifest.json ir api/system-stats
    if (pathname.includes('/manifest.json') || pathname.includes('/api/system-stats')) {
      return NextResponse.next();
    }
    return intlMiddleware(request);
  }

  // ✅ 3. PRIVATŪS MARŠRUTAI
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  if (!token) {
    const loginUrl = new URL('/login', request.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|llms.txt|\\.well-known|sitemap.xml).*)',
  ],
};
