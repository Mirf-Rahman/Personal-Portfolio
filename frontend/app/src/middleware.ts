import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware handles admin route protection
// i18n locale is handled via cookies read in i18n/request.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Check for session cookie
    const sessionCookie = request.cookies.get('better-auth.session_token');
    
    if (!sessionCookie) {
      // No session - redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // TODO: Verify session with auth-service
    // For now, allow if cookie exists
    // In production, validate the session server-side
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Only match admin routes for protection
    '/admin/:path*',
  ],
};

