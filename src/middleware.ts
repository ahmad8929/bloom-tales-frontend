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

// Helper function to verify if token is valid (basic check)
function isValidToken(token: string): boolean {
  if (!token || token.length < 10) return false;
  // Add more validation if needed (e.g., JWT parsing)
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;

  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Token exists:', !!token);
  console.log('Middleware - Token length:', token?.length || 0);
  console.log('Middleware - User role:', userRole);

  // Check if current path requires authentication
  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));
  const requiresAdmin = adminPaths.some(path => pathname.startsWith(path));

  // Allow public access to non-protected paths
  if (!requiresAuth) {
    console.log('Middleware - Public path, allowing access');
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!token || !isValidToken(token)) {
    console.log('Middleware - Invalid/missing token, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    
    // Add return URL as query parameter
    loginUrl.searchParams.set('returnUrl', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    
    // Clear invalid cookies
    response.cookies.set({
      name: 'auth-token',
      value: '',
      path: '/',
      expires: new Date(0),
    });
    response.cookies.set({
      name: 'user-role',
      value: '',
      path: '/',
      expires: new Date(0),
    });
    
    return response;
  }

  // For admin routes, check if user has admin role
  if (requiresAdmin && userRole !== 'admin') {
    console.log('Middleware - Not admin, redirecting to home');
    return NextResponse.redirect(new URL('/?error=access-denied', request.url));
  }

  // If we have a valid token and proper role, allow access
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