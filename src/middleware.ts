import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Allow static assets, internal next routes, login portals, and auth API endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/customer/auth') ||
    pathname.startsWith('/api/admin/auth') ||
    pathname.startsWith('/api/kitchen/auth') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/login') ||
    pathname.includes('.') // file requests (favicon.ico, svg, images)
  ) {
    return NextResponse.next();
  }

  // Check auth session cookies
  const authToken = request.cookies.get('hemanth_auth_token')?.value;
  const userRole = request.cookies.get('hemanth_role')?.value;

  // 1. If not authenticated at all, redirect to Portal Switcher
  if (!authToken) {
    if (pathname.startsWith('/admin')) {
      const adminLoginUrl = new URL('/login/admin', request.url);
      return NextResponse.redirect(adminLoginUrl);
    }
    if (pathname.startsWith('/kitchen')) {
      const kitchenLoginUrl = new URL('/login/kitchen', request.url);
      return NextResponse.redirect(kitchenLoginUrl);
    }
    const loginUrl = new URL('/login/customer', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname + search);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Role-Based Access Guards (RBAC)
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'ADMIN') {
      const adminLoginUrl = new URL('/login/admin', request.url);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  if (pathname.startsWith('/kitchen')) {
    if (userRole !== 'KITCHEN' && userRole !== 'ADMIN') {
      const kitchenLoginUrl = new URL('/login/kitchen', request.url);
      return NextResponse.redirect(kitchenLoginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/customer/auth|api/admin/auth|api/kitchen/auth|api/auth|_next/static|_next/image|favicon.ico).*)'],
};
