import { NextResponse, type NextRequest } from "next/server";

function decodeJwtPayload(token: string | undefined) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    // In the proxy (Node) runtime Buffer is available
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? null;
  const cookieToken = request.cookies.get('taskflow-token')?.value ?? null;

  // prefer Authorization header (Bearer <token>) when present
  const tokenFromHeader =
    authHeader && authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.split(' ')[1]
      : null;

  const token = tokenFromHeader ?? cookieToken;
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname === '/login';
  const isProtectedRoute =
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/audit-logs') ||
    pathname.startsWith('/profile');

  if (!token) {
    // Client stores JWT in localStorage. For navigations without an Authorization header
    // we avoid server-side redirects so the client-side guard (useAuthInit) can validate
    // the token and perform navigation/redirects. This keeps SSR friendly while supporting
    // localStorage JWT usage.
    return NextResponse.next();
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear cookie if present (client-side token is authoritative)
    response.cookies.set('taskflow-token', '', { path: '/', expires: new Date(0) });
    return response;
  }

  const userRole = payload.role ?? payload.user?.role ?? null;

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  if (userRole === 'USER' && (pathname.startsWith('/users') || pathname.startsWith('/audit-logs'))) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};