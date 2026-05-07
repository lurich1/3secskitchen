import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/manager") && pathname !== "/manager/login") {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/manager/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/manager/:path*"],
};
