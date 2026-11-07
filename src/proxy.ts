import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Nustatome, ar tai viešas puslapis (be kalbos prefikso)
  const isPublicRoute =
    pathname.includes('/login') ||
    pathname.includes('/demo') ||
    pathname.includes('/public') ||
    pathname.includes('/code-review') ||
    pathname.includes('/config-generator') ||
    pathname.includes('/explainer') ||
    pathname.includes('/_next') ||
    pathname.includes('/api') ||
    pathname.includes('/llms.txt') ||
    pathname.includes('/.well-known');

  // 2. Jei tai viešas puslapis, leidžiame next-intl jį apdoroti (nukreipti į /lt arba /en)
  if (isPublicRoute) {
    return intlMiddleware(request);
  }

  // 3. Jei tai privatus puslapis, tikriname sesiją
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  if (!token) {
    return NextResponse.redirect(new URL('/lt/login', request.nextUrl));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|llms.txt|\\.well-known|sitemap.xml).*)',
  ],
};
