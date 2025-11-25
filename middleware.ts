import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for route protection
 *
 * This middleware runs before every request and protects routes based on authentication status.
 *
 * Protected Routes:
 * - /admin/* - Requires authentication
 *
 * Public Routes:
 * - /auth/* - Login, register, etc.
 * - /participate/* - Survey participation (uses backend cookie)
 * - / - Home page
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or localStorage (we'll check localStorage in the client)
  // For server-side middleware, we can only check cookies
  // Since we're using localStorage for tokens, we'll rely on client-side checks
  // and use middleware primarily for redirecting already authenticated users away from auth pages

  // Define protected routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/auth');

  // Check for access token in cookies (if you decide to also store in cookies)
  // For now, we'll use a simpler approach: let the auth context handle protection
  // and use middleware mainly for public route optimization

  // If user is on auth route and has a token, redirect to admin
  // This check would require token to be in cookies, which we're not doing yet
  // So we'll keep this minimal for now

  // Allow all requests to proceed
  // The AuthContext will handle client-side protection
  return NextResponse.next();
}

/**
 * Matcher configuration
 * Specify which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
