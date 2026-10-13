import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for Subdomain Routing
 *
 * Supports deploying the Admin Panel on a dedicated subdomain (e.g. admin.studentsprep.org)
 * or operating in unified single-port mode (e.g. localhost:3000/admin).
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || url.hostname || '';

  // Configured admin domain or prefix (e.g. "admin.studentsprep.org" or "admin.localhost")
  const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || '';
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || '';

  const isAdminHost =
    hostname.startsWith('admin.') ||
    url.hostname.startsWith('admin.') ||
    (adminDomain.length > 0 && (hostname.includes(adminDomain) || url.hostname.includes(adminDomain)));

  // 1. Handle requests arriving at the Admin Subdomain (e.g. admin.studentsprep.org)
  if (isAdminHost) {
    // If accessing root "/" on admin subdomain, rewrite to "/admin"
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/admin', request.url));
    }

    // Whitelist auth and API routes so sign-in flow and API proxies work natively without /admin prefix
    if (
      url.pathname === '/login' ||
      url.pathname === '/logout' ||
      url.pathname.startsWith('/api/')
    ) {
      return NextResponse.next();
    }

    // Student registration must not occur on the admin control plane; redirect to student portal
    if (url.pathname === '/register') {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (siteUrl) {
        return NextResponse.redirect(new URL('/register', siteUrl));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If accessing "/users", "/courses", etc. without "/admin" prefix, rewrite to "/admin/users", etc.
    const isAlreadyAdminPath = url.pathname.startsWith('/admin');
    if (!isAlreadyAdminPath) {
      return NextResponse.rewrite(new URL(`/admin${url.pathname}`, request.url));
    }

    return NextResponse.next();
  }

  // 2. Handle requests arriving at the Main Student Domain (e.g. studentsprep.org)
  // If an external admin URL is explicitly configured and user visits /admin, redirect them to the subdomain
  if (adminUrl && (url.pathname === '/admin' || url.pathname.startsWith('/admin/'))) {
    const targetSubPath = url.pathname.replace(/^\/admin/, '') || '/';
    const destination = new URL(targetSubPath, adminUrl);
    return NextResponse.redirect(destination);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static public files with extensions (.svg, .png, .jpg, .pdf, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[\\w]+$).*)',
  ],
};
