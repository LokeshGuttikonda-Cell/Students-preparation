import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

describe('Next.js Subdomain Middleware', () => {
  it('rewrites root "/" to "/admin" when accessed via admin subdomain', () => {
    const req = new NextRequest('http://admin.studentsprep.org/');
    const res = middleware(req);

    expect(res.headers.get('x-middleware-rewrite')).toContain('/admin');
  });

  it('rewrites "/users" to "/admin/users" when accessed via admin subdomain', () => {
    const req = new NextRequest('http://admin.studentsprep.org/users');
    const res = middleware(req);

    expect(res.headers.get('x-middleware-rewrite')).toContain('/admin/users');
  });

  it('preserves existing "/admin/courses" path when accessed via admin subdomain', () => {
    const req = new NextRequest('http://admin.studentsprep.org/admin/courses');
    const res = middleware(req);

    // When already /admin/..., next() is returned (no rewrite header)
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('passes normal student requests through on main domain', () => {
    const req = new NextRequest('http://studentsprep.org/dashboard');
    const res = middleware(req);

    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('whitelists "/login" on admin subdomain without rewriting to /admin/login', () => {
    const req = new NextRequest('http://admin.studentsprep.org/login');
    const res = middleware(req);

    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('whitelists "/logout" and "/api/*" routes on admin subdomain', () => {
    const reqLogout = new NextRequest('http://admin.studentsprep.org/logout');
    const resLogout = middleware(reqLogout);
    expect(resLogout.headers.get('x-middleware-rewrite')).toBeNull();

    const reqApi = new NextRequest('http://admin.studentsprep.org/api/v1/health');
    const resApi = middleware(reqApi);
    expect(resApi.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('redirects "/register" on admin subdomain to main student site', () => {
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://studentsprep.org';

    const req = new NextRequest('http://admin.studentsprep.org/register');
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://studentsprep.org/register');

    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it('redirects /admin to external admin subdomain if NEXT_PUBLIC_ADMIN_URL is configured', () => {
    const originalAdminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
    process.env.NEXT_PUBLIC_ADMIN_URL = 'https://admin.studentsprep.org';

    const req = new NextRequest('http://studentsprep.org/admin/users');
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://admin.studentsprep.org/users');

    process.env.NEXT_PUBLIC_ADMIN_URL = originalAdminUrl;
  });
});
