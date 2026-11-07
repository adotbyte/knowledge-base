import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  const isLoggedIn = !!token;
  const isOnLoginPage = request.nextUrl.pathname.startsWith('/login');

  if (!isLoggedIn && !isOnLoginPage) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
