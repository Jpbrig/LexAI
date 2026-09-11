import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";


const PUBLIC_API_PATHS = new Set([
  "/api/health",
  "/api/ready",
  // POST /api/user is the public account-registration endpoint.
  // GET and PATCH remain protected by their route-level auth guard.
  "/api/user",
]);

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  const scriptSources = process.env.NODE_ENV === "production"
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-eval' 'unsafe-inline'";
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src ${scriptSources}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api-publica.datajud.cnj.jus.br https://generativelanguage.googleapis.com https://api.openai.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );

  return response;
}

function isPrivateApi(pathname: string) {
  return pathname.startsWith("/api/")
    && !pathname.startsWith("/api/auth/")
    && !PUBLIC_API_PATHS.has(pathname);
}

function isProtectedPage(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isAuthPage(pathname: string) {
  return pathname === "/auth/signin" || pathname === "/auth/signup";
}

export default auth((request) => {
  const { pathname, search } = request.nextUrl;
  const session = request.auth as {
    user?: { id?: string | null; email?: string | null; platformRole?: string };
    sessionId?: string | null;
    workspaceId?: string | null;
  } | undefined;
  const user = session?.user;
  const hasSession = Boolean(
    user?.id &&
    session?.sessionId &&
    session?.workspaceId
  );

  if ((isProtectedPage(pathname) || isPrivateApi(pathname)) && !hasSession) {
    if (isPrivateApi(pathname)) {
      return addSecurityHeaders(
        NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
      );
    }

    const loginUrl = new URL("/auth/signin", request.url);
    const callbackUrl = `${pathname}${search}`;
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // Admin Master Protection for /dashboard/admin
  if (pathname.startsWith("/dashboard/admin")) {
    const adminEmail = process.env.PLATFORM_ADMIN_EMAIL?.trim().toLowerCase();
    const isEnvAdmin = adminEmail && user?.email?.trim().toLowerCase() === adminEmail;
    const isPlatformAdmin = isEnvAdmin || user?.platformRole === "PLATFORM_ADMIN";

    if (!isPlatformAdmin) {
      return addSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
    }
  }

  if (isAuthPage(pathname) && hasSession) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  return addSecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

export type ProxyRequest = NextRequest;
