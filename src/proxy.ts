import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  const isLoggedIn = !!token;
  const pathname = request.nextUrl.pathname;

  // 1. Nurodome puslapius, kurie prieinami BE prisijungimo
  const isPublicRoute =
    pathname.startsWith('/demo') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/code-review') ||
    pathname.startsWith('/config-generator') ||
    pathname.startsWith('/explainer') ||
    pathname.startsWith('/login');

  // 2. Jei neprisijungęs ir bando patekti į apsaugotą puslapį -> į login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // 3. Jei prisijungęs ir bando patekti į /login -> į pradžią
  if (isLoggedIn && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|llms.txt|\\.well-known).*)'],
};
