import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// MAINTENANCE MODE: Redirect all routes to home page which will show maintenance page
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and API routes to pass through (optional - you can block these too)
  // For now, we'll redirect everything except static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/image') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Redirect all other routes to home page (which will show maintenance page)
  if (pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
};