import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PROTECTED = ["/account", "/checkout", "/vendor", "/admin"];
const VENDOR_ONLY = ["/vendor"];
const ADMIN_ONLY = ["/admin"];

function parseJwtRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return (decoded.role as string) ?? null;
  } catch {
    return null;
  }
}

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);

  const raw = request.cookies.get("souk-auth")?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix for path matching (/fr/checkout → /checkout)
  const stripped = pathname.replace(/^\/[a-z]{2}/, "") || "/";

  const isProtected = PROTECTED.some((p) => stripped.startsWith(p));

  if (isProtected) {
    const token = getTokenFromRequest(request);

    if (!token) {
      const loginUrl = new URL(
        `/fr/auth/login?from=${encodeURIComponent(pathname)}`,
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }

    const role = parseJwtRole(token);

    if (VENDOR_ONLY.some((p) => stripped.startsWith(p)) && role !== "VENDOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/403", request.url));
    }

    if (ADMIN_ONLY.some((p) => stripped.startsWith(p)) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
