import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromCookie, isAllowedRole, type UserRole } from '@/lib/auth';

const protectedRoutes: Record<string, UserRole | UserRole[]> = {
  '/admin': 'admin',
  '/admin/protected': 'admin',
  '/seller': ['seller', 'admin'],
  '/dashboard': ['buyer', 'seller', 'admin'],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const routeRole = protectedRoutes[pathname] || Object.entries(protectedRoutes).find(([route]) => pathname.startsWith(route + '/'))?.[1];

  if (!routeRole) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('mada-market-session')?.value ?? null;
  const user = getSessionFromCookie(sessionCookie);

  if (!user || !isAllowedRole(user, routeRole)) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/seller', '/dashboard'],
};
