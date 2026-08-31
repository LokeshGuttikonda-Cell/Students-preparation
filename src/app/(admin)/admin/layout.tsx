'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <p className="text-text-muted font-medium">Checking admin access...</p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-4 bg-canvas text-center">
        <div className="bg-surface border border-error-500/30 rounded-lg p-8 max-w-md shadow-sm">
          <h2 className="text-xl font-bold text-error-700 mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-text-muted mb-6">
            You must be signed in with an Administrator account to view the Admin
            Panel.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => router.push('/')}>
              Return Home
            </Button>
            <Button variant="primary" onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin' as const },
    { label: 'Review Queue', href: '/admin/questions' as const },
    { label: 'Subjects', href: '/admin/subjects' as const },
    { label: 'Topics', href: '/admin/topics' as const },
  ];

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-canvas">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-r border-border flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-primary-900">
                Admin Panel
              </span>
              <span className="bg-primary-50 text-primary-800 text-xs px-2 py-0.5 rounded font-semibold border border-primary-200">
                PaaS
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">Content Management</p>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-900 font-semibold'
                      : 'text-text hover:bg-neutral-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-border bg-neutral-50/50">
          <div className="mb-3">
            <p className="text-xs font-semibold text-text truncate">{user.name}</p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="w-1/2">
              <Button variant="secondary" size="sm" className="w-full text-xs">
                Student App
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-1/2 text-xs text-error-700 hover:bg-error-50"
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl">
        {children}
      </main>
    </div>
  );
}
