import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const protectedPaths = [
  '/cart',
  '/checkout',
  '/admin',
  '/api/cart',
  '/api/orders',
];

// Admin-only paths
const adminPaths = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;

  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Token exists:', !!token);
  console.log('Middleware - User role:', userRole);

  // Check if current path requires authentication
  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));
  const requiresAdmin = adminPaths.some(path => pathname.startsWith(path));

  // Allow public access to non-protected paths
  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!token) {
    console.log('Middleware - No token, redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set({
      name: 'redirect-url',
      value: pathname,
      httpOnly: true,
      path: '/',
    });
    return response;
  }

  // For admin routes, check if user has admin role
  if (requiresAdmin && userRole !== 'admin') {
    console.log('Middleware - Not admin, redirecting to home');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If we have a token and proper role, allow access
  console.log('Middleware - Access granted');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/cart', 
    '/checkout',
    '/api/cart/:path*',
    '/api/orders/:path*'
  ],
};