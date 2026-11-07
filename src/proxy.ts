import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function proxy(request: NextRequest) {
  // 1. Nuskaitome sesijos tokeną
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  const isLoggedIn = !!token;
  const isOnLoginPage = request.nextUrl.pathname.startsWith('/login');

  // 2. Jei neprisijungęs ir bando patekti ne į /login -> nukreipiame į /login
  if (!isLoggedIn && !isOnLoginPage) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // 3. Jei prisijungęs ir bando patekti į /login -> nukreipiame į /
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  // 4. Visais kitais atvejais praleidžiame
  return NextResponse.next();
}

// Nustatome, kuriems maršrutams taikyti apsaugą
export const config = {
  matcher: [
    /*
     * Apsaugome visus maršrutus, išskyrus:
     * - /api/auth (NextAuth)
     * - /_next/static, /_next/image, /favicon.ico (statiniai failai)
     * - /login (prisijungimo puslapis)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
