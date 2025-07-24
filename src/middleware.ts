import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/google',
];

// Paths that require admin role
const adminPaths = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token');
  const userRole = request.cookies.get('user-role')?.value;

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // Redirect to home if already authenticated
    if (token && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!token) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set({
      name: 'redirect-url',
      value: pathname,
      httpOnly: true,
      path: '/',
    });
    return response;
  }

  // Check admin access
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication endpoints)
     * 2. /_next/* (Next.js internals)
     * 3. /static/* (static files)
     * 4. /favicon.ico, /robots.txt (static files)
     */
    '/((?!api/auth/|_next/|static/|favicon.ico|robots.txt).*)',
  ],
}; 