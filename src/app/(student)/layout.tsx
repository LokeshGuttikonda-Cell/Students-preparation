'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { getAdminUrl } from '../../lib/env';
import {
  BookOpen,
  GraduationCap,
  Briefcase,
  CheckSquare,
  Cpu,
  Award,
  ChevronDown,
  Layers,
  FileCode2,
  Terminal,
  FileText,
  BarChart3,
  Network,
  ShieldAlert,
  Database,
  Radio,
  Clock,
  Sparkles,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react';

interface SubNavItem {
  label: string;
  href: Route;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: SubNavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'learn',
    label: 'Learn & Hub',
    items: [
      {
        label: 'Knowledge Hub',
        href: '/curriculum' as Route,
        description: '15 CS & IT engineering disciplines with 180+ deep-dive guides',
        icon: BookOpen,
        badge: '15 Tracks',
      },
      {
        label: 'Docs & Tutorials',
        href: '/docs' as Route,
        description: 'Visual system architectures, memory layouts & hands-on tutorials',
        icon: FileText,
      },
      {
        label: 'Role Handbooks',
        href: '/roles/handbooks' as Route,
        description: 'Career engineering roadmaps, recruiter traps & printable PDFs',
        icon: Layers,
      },
      {
        label: 'PDF Library',
        href: '/downloads' as Route,
        description: 'Downloadable offline cheatsheets, architecture blueprints & guides',
        icon: Award,
      },
    ],
  },
  {
    id: 'career',
    label: 'Career & Placement',
    items: [
      {
        label: 'Courses & AI Tracks',
        href: '/courses' as Route,
        description: 'Comprehensive software engineering, systems & cutting-edge AI courses',
        icon: GraduationCap,
        badge: 'AI Added',
      },
      {
        label: 'Career Roles',
        href: '/roles' as Route,
        description: 'Role competency matrices, weightage breakdown & salary levels',
        icon: Briefcase,
      },
      {
        label: 'Readiness Profiler',
        href: '/readiness' as Route,
        description: 'Diagnostic radar profiling and personalized skill gap analysis',
        icon: BarChart3,
      },
      {
        label: 'Placement Drives',
        href: '/drives' as Route,
        description: 'Campus & lateral recruitment drives, eligibility rules & rounds',
        icon: Network,
      },
      {
        label: 'Offer & Compensation',
        href: '/compensation' as Route,
        description: 'Salary benchmarking, equity/ESOP breakdown & counter-offer scripts',
        icon: Award,
      },
      {
        label: 'Resume Builder',
        href: '/resume' as Route,
        description: 'ATS-tailored technical resume templates and keyword optimization',
        icon: FileText,
      },
    ],
  },
  {
    id: 'practice',
    label: 'Practice & Tests',
    items: [
      {
        label: 'Topic Practice',
        href: '/practice' as Route,
        description: '200+ topics with Socratic hints and instant architectural feedback',
        icon: CheckSquare,
      },
      {
        label: 'Mock Tests Suite',
        href: '/mock-tests' as Route,
        description: 'Timed section-aware benchmark exams and custom test generator',
        icon: Clock,
      },
      {
        label: 'Technical Interviews',
        href: '/interviews' as Route,
        description: 'Live interactive whiteboard room with AI speech interview simulations',
        icon: Radio,
        badge: 'Audio/Voice',
      },
      {
        label: 'Verifiable Credentials',
        href: '/credentials' as Route,
        description: 'Publicly verifiable digital certificates of engineering mastery',
        icon: Award,
      },
      {
        label: 'Cohort Analytics',
        href: '/analytics/cohort' as Route,
        description: 'Longitudinal peer velocity tracking and cohort percentiles',
        icon: BarChart3,
      },
    ],
  },
  {
    id: 'labs',
    label: 'Engineering Studios',
    items: [
      {
        label: 'Applied Sandbox',
        href: '/sandbox' as Route,
        description: '9 zero-setup interactive browser algorithmic & system simulators',
        icon: Terminal,
        badge: '9 Labs',
      },
      {
        label: 'System Design Studio',
        href: '/architecture' as Route,
        description: 'Distributed topology throughput, sharding & queuing latency simulator',
        icon: Network,
      },
      {
        label: 'Code Review Lab',
        href: '/code-review' as Route,
        description: 'Enterprise code quality review, diff inspection & security auditing',
        icon: FileCode2,
      },
      {
        label: 'SQL Optimizer',
        href: '/sql-optimizer' as Route,
        description: 'Query execution plans, B-Tree vs Hash index tuning & EXPLAIN analysis',
        icon: Database,
      },
      {
        label: 'Cache Lab',
        href: '/cache-lab' as Route,
        description: 'LRU/LFU cache eviction, stampede mitigation & write strategies',
        icon: Cpu,
      },
      {
        label: 'Streaming Lab',
        href: '/stream-lab' as Route,
        description: 'Event-driven partitions, consumer lag & backpressure buffers',
        icon: Radio,
      },
      {
        label: 'Rate Limiter Studio',
        href: '/rate-limiter' as Route,
        description: 'Token bucket, sliding window counter & leaky bucket algorithms',
        icon: Clock,
      },
      {
        label: 'Transaction Lab',
        href: '/transaction-lab' as Route,
        description: 'ACID transaction isolation, phantom reads & 2-phase commit state',
        icon: ShieldAlert,
      },
    ],
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loginAsDemoStudent } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isRunner =
    (pathname?.startsWith('/practice/') && pathname !== '/practice') ||
    (pathname?.startsWith('/mock-tests/') &&
      !pathname.includes('/custom') &&
      !pathname.includes('/results')) ||
    (pathname?.startsWith('/interviews/') && !pathname.includes('/results'));

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = (groupId: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(groupId);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text">
      {/* Global Student Navigation Header (suppressed in full-screen runners) */}
      {!isRunner && (
        <header className="border-b border-white/10 bg-[#040711]/90 sticky top-0 z-40 shadow-xs backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16" ref={navRef}>
              {/* Logo & Brand */}
              <div className="flex items-center gap-6 shrink-0">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-white hover:opacity-90 transition-opacity group"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-lime-400 via-emerald-400 to-cyan-400 text-slate-950 shadow-md shadow-lime-400/25 font-black text-sm group-hover:scale-105 transition-transform">
                    ⚡
                  </span>
                  <div className="flex flex-col">
                    <span className="leading-tight font-display text-white">
                      StudentsPrep<span className="text-lime-400">.Bento</span>
                    </span>
                    <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400">
                      Frontier AI Arena
                    </span>
                  </div>
                </Link>

                {/* Direct Dashboard Link */}
                <Link
                  href="/dashboard"
                  className={`hidden lg:inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors font-mono ${
                    pathname === '/dashboard'
                      ? 'bg-lime-400/10 text-lime-400 font-bold border border-lime-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Dropdown Navigation Groups */}
                <nav className="hidden lg:flex items-center gap-1 font-mono">
                  {NAV_GROUPS.map((group) => {
                    const isGroupActive = group.items.some((item) =>
                      pathname?.startsWith(item.href)
                    );
                    const isOpen = activeDropdown === group.id;

                    return (
                      <div
                        key={group.id}
                        className="relative"
                        onMouseEnter={() => handleMouseEnter(group.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setActiveDropdown((prev) => (prev === group.id ? null : group.id))
                          }
                          aria-expanded={isOpen}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            isGroupActive || isOpen
                              ? 'bg-lime-400/10 text-lime-400 font-bold border border-lime-400/30'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>{group.label}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-lime-400' : 'text-slate-400'
                            }`}
                          />
                        </button>

                        {/* Dropdown Menu Panel */}
                        {isOpen && (
                          <div className="absolute top-full left-0 mt-1.5 w-80 sm:w-96 rounded-2xl bg-[#091122]/95 border border-white/10 shadow-2xl p-3 grid gap-1 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100">
                            {group.items.map((item) => {
                              const isItemActive = pathname?.startsWith(item.href);
                              const Icon = item.icon;

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all group ${
                                    isItemActive
                                      ? 'bg-lime-400/10 border border-lime-400/30 text-lime-300'
                                      : 'hover:bg-white/5 text-slate-200'
                                  }`}
                                >
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                      isItemActive
                                        ? 'bg-lime-400 text-slate-950 font-bold'
                                        : 'bg-white/5 text-lime-400 group-hover:bg-lime-400/20'
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <span
                                        className={`text-xs font-bold leading-tight font-sans ${
                                          isItemActive
                                            ? 'text-lime-300 font-extrabold'
                                            : 'text-slate-100 group-hover:text-white'
                                        }`}
                                      >
                                        {item.label}
                                      </span>
                                      {item.badge && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-accent-50 text-accent-700 border border-accent-200 shrink-0">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5 leading-normal">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Right Side Controls / User Profile */}
              <div className="hidden sm:flex items-center gap-2.5 shrink-0">
                {user ? (
                  <div className="flex items-center gap-2.5 font-mono text-xs">
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black uppercase shadow-xs shadow-lime-400/30">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                        {user.name}
                      </span>
                    </div>

                    {user.role === 'ADMIN' && (
                      <a href={`${getAdminUrl()}/admin`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs font-semibold flex items-center gap-1 border-white/10 text-slate-200 hover:text-white"
                        >
                          <Shield className="w-3.5 h-3.5 text-lime-400" />
                          <span>Admin Panel</span>
                        </Button>
                      </a>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 font-mono"
                      onClick={async () => {
                        await logout();
                        router.push('/login');
                      }}
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="text-xs font-bold text-primary-900 border-primary-300 hover:bg-primary-50 hidden md:inline-flex items-center gap-1 shadow-2xs"
                      onClick={() => {
                        loginAsDemoStudent();
                        router.push('/dashboard');
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-accent-600" />
                      <span>Demo Mode</span>
                    </Button>

                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-xs font-semibold">
                        Sign In
                      </Button>
                    </Link>

                    <Link href="/register">
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs font-bold shadow-xs hover:shadow-md transition-shadow"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle */}
              <div className="flex lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-neutral-100 transition-colors"
                  aria-label="Toggle Navigation Menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-text" />
                  ) : (
                    <Menu className="w-6 h-6 text-text" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Accordion Drawer */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-border bg-surface px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-bold ${
                  pathname === '/dashboard'
                    ? 'bg-primary-50 text-primary-900 border border-primary-200'
                    : 'text-text hover:bg-neutral-100'
                }`}
              >
                Dashboard
              </Link>

              {NAV_GROUPS.map((group) => {
                const isExpanded = mobileExpandedGroup === group.id;

                return (
                  <div key={group.id} className="border-t border-border/60 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpandedGroup((prev) => (prev === group.id ? null : group.id))
                      }
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text cursor-pointer"
                    >
                      <span>{group.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="pl-2 space-y-1 mt-1">
                        {group.items.map((item) => {
                          const isItemActive = pathname?.startsWith(item.href);
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                isItemActive
                                  ? 'bg-primary-50 text-primary-900 font-bold border border-primary-200/60'
                                  : 'text-text hover:bg-neutral-100'
                              }`}
                            >
                              <Icon className="w-4 h-4 text-primary-700 shrink-0" />
                              <span className="truncate">{item.label}</span>
                              {item.badge && (
                                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded bg-accent-50 text-accent-700 border border-accent-200 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-3 text-xs text-text-muted">
                      <div className="w-6 h-6 rounded-full bg-primary-700 text-white flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span>
                        Signed in as <strong className="text-text">{user.name}</strong>
                      </span>
                    </div>

                    {user.role === 'ADMIN' && (
                      <a href={`${getAdminUrl()}/admin`} className="block">
                        <Button variant="secondary" size="sm" className="w-full text-xs font-bold">
                          Go to Admin Panel
                        </Button>
                      </a>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-error-700 hover:bg-error-50"
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
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs font-bold text-primary-900 border-primary-300"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        loginAsDemoStudent();
                        router.push('/dashboard');
                      }}
                    >
                      One-Click Demo Instant Access
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="secondary" size="sm" className="w-full text-xs">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="primary" size="sm" className="w-full text-xs">
                          Get Started
                        </Button>
                      </Link>
                    </div>
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
