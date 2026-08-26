import { NextRequest, NextResponse } from "next/server";

// Rotas que exigem autenticação
const PROTECTED_ROUTES = ["/dashboard"];
// Rotas de auth (redirecionar se já logado)
const AUTH_ROUTES = ["/auth/signin", "/auth/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar sessão via cookie simples (token)
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("lexai_session")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirecionar para login se não autenticado em rota protegida
  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Headers de segurança em todas as respostas
  const response = NextResponse.next();

  // Segurança: prevenir clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // Segurança: prevenir MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Segurança: XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Segurança: Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Segurança: CSP básico
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
