import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname.startsWith("/login");

  // 1. Jei neprisijungęs IR bando eiti į bet kokį puslapį, IŠSKYRUS /login
  if (!isLoggedIn && !isOnLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 2. Jei PRISIJUNGĘS IR bando eiti į /login, nukreipiame į pradžią
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 3. VISOMS KITOMS SITUACIJOMS – PRALEIDŽIAME (tai sustabdo ciklą!)
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};