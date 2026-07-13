import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtected = pathname.startsWith('/candidate') ||
    pathname.startsWith('/recruiter') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/settings');

  if (isProtected) {
    const token = request.cookies.get('token')?.value;

    // Validate JWT expiry
    if (token) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload.exp * 1000 < Date.now()) {
          // Token expired - redirect to sign-in
          const signInUrl = new URL('/sign-in', request.url);
          signInUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(signInUrl);
        }
        // Token is valid - allow access
        return NextResponse.next();
      } catch {
        // Invalid token format - redirect to sign-in
        const signInUrl = new URL('/sign-in', request.url);
        return NextResponse.redirect(signInUrl);
      }
    }

    // No token found - redirect to sign-in with return URL
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run middleware on dashboard routes
    '/candidate/:path*',
    '/recruiter/:path*',
    '/admin/:path*',
    '/users/:path*',
    '/settings/:path*',
  ],
};
