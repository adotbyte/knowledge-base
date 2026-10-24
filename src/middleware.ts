export const runtime = 'nodejs';
import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname.startsWith("/login");

  // 1. If not logged in and trying to access a protected page
  if (!isLoggedIn && !isOnLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in and trying to access the login page
  if (isLoggedIn && isOnLoginPage) {
    const homeUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(homeUrl);
  }

  // 3. Otherwise, let the request pass through
  return NextResponse.next();
});

// Keep the matcher, but make sure it explicitly ignores API routes and static files
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};