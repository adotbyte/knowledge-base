import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ✅ Dabar createMiddleware priima tik vieną argumentą (routing)
const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // ✅ 1. PATIKRINAME, AR TAI GOOGLEBOT
  const isGooglebot = userAgent.includes('Googlebot');

  // ✅ 2. JEI TAI GOOGLEBOT, PRALEIDŽIAME JĮ (leidžiame matyti turinį)
  // Svarbu: čia galite nurodyti tik viešus puslapius, kuriuos norite rodyti Google
  if (isGooglebot) {
    // Leidžiame Googlebot matyti pagrindinį puslapį ir kitus viešus puslapius
    if (pathname === '/' || pathname === '/lt' || pathname === '/en') {
      // Grąžiname next-intl middleware atsakymą, bet ne peradresuojame į login
      return intlMiddleware(request);
    }
    // Kitur Googlebot vis tiek bus nukreiptas (jei norite, kad matytų tik pagrindinį)
  }

  const isPublicRoute =
    pathname.includes('/login') ||
    pathname.includes('/demo') ||
    pathname.includes('/public') ||
    pathname.includes('/privacy') ||
    pathname.includes('/code-review') ||
    pathname.includes('/config-generator') ||
    pathname.includes('/explainer') ||
    pathname.includes('/_next') ||
    pathname.includes('/api') ||
    pathname.includes('/llms.txt') ||
    pathname.includes('/.well-known');

  if (isPublicRoute) {
    return intlMiddleware(request);
  }

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
