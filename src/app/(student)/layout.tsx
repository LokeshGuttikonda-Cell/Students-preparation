'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

interface NavItem {
  label: string;
  href: Route;
  icon?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' as Route },
  { label: 'Practice', href: '/practice' as Route },
  { label: 'Mock Tests', href: '/mock-tests' as Route },
  { label: 'AI Interviews', href: '/interviews' as Route },
  { label: 'Courses', href: '/courses' as Route },
  { label: 'Career Roles', href: '/roles' as Route },
  { label: 'SQL & Code Lab', href: '/sandbox' as Route },
  { label: 'Credentials', href: '/credentials' as Route },
  { label: 'Cohort Analytics', href: '/analytics/cohort' as Route },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isRunner =
    (pathname?.startsWith('/practice/') && pathname !== '/practice') ||
    (pathname?.startsWith('/mock-tests/') &&
      !pathname.includes('/custom') &&
      !pathname.includes('/results')) ||
    (pathname?.startsWith('/interviews/') && !pathname.includes('/results'));

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text">
      {/* Global Student Navigation Header (suppressed in full-screen runners) */}
      {!isRunner && (
        <header className="border-b border-border bg-surface sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-bold tracking-tight text-primary-900 hover:text-primary-700 transition-colors"
              >
                <span>StudentsPrep</span>
                <span className="hidden md:inline text-[10px] uppercase font-bold tracking-wider bg-primary-100 text-primary-800 px-2 py-0.5 rounded border border-primary-200">
                  Campus
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden xl:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-800 font-bold'
                          : 'text-text-muted hover:text-text hover:bg-neutral-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User Controls / Auth */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">
                    <strong className="text-text font-medium">{user.name}</strong>
                  </span>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin">
                      <Button variant="secondary" size="sm" className="text-xs">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-error-700 hover:bg-error-50"
                    onClick={async () => {
                      await logout();
                      router.push('/login');
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="text-xs">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex xl:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 rounded-md text-text-muted hover:text-text hover:bg-neutral-100"
                aria-label="Toggle Navigation Menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Sub-nav row for medium screens (tablets / laptops) */}
          <div className="hidden md:flex xl:hidden overflow-x-auto pb-2 -mt-1 gap-1 border-t border-border pt-2 text-xs scrollbar-none">
            {navItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1 rounded whitespace-nowrap text-xs font-semibold ${
                    isActive
                      ? 'bg-primary-50 text-primary-800 font-bold'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-border bg-surface px-4 pt-3 pb-5 space-y-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-900 font-bold'
                        : 'text-text hover:bg-neutral-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    Signed in as <strong className="text-text">{user.name}</strong>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-error-700"
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await logout();
                      router.push('/login');
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full text-xs">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      )}

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
