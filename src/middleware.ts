/**
 * Middleware for route protection and session validation
 * @rule 060 "API standards for authentication middleware"
 * @rule 009 "Security considerations for route protection"
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    console.log('🛡️ Checking admin authentication for:', pathname);

    const session = await getSessionFromRequest(request);

    if (!session || session.type !== 'admin') {
      console.log('❌ Unauthorized admin access attempt');
      
      // Redirect to login page
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    console.log('✅ Admin access authorized:', session.email);
  }

  // Protect survey routes (will implement in Phase 3)
  if (pathname.startsWith('/survey/') && pathname !== '/survey/success') {
    // TODO: Implement survey session validation
    console.log('🔍 Survey route accessed:', pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/survey/:path*',
  ],
};
