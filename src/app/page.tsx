'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-xs">
        <div className="max-w-content mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-primary-900">
              StudentsPrep
            </span>
            <span className="bg-primary-50 text-primary-800 text-xs px-2.5 py-0.5 rounded font-semibold border border-primary-200">
              Placement Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted hidden sm:inline">
                  Signed in as <strong className="text-text">{user.name}</strong>
                </span>
                {user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="secondary" size="sm" className="text-xs">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-xs text-error-700 hover:bg-error-50"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero & Modules */}
      <main className="flex-1 max-w-content mx-auto px-6 py-12 space-y-12 w-full">
        <div className="space-y-4 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-700">
            Engineered for Campus Placements
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary-700 leading-tight">
            Students-preparation
          </h1>
          <p className="text-xl font-semibold text-text">
            Crack Aptitude & Technical Interviews
          </p>
          <p className="text-base text-text-muted leading-relaxed">
            Practice by topic with instant step-by-step solutions, simulate
            company tests under real-time countdown constraints, and analyze your
            weak areas with actionable insights.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Practice Mode Card */}
          <Card className="hover:border-primary-700/50 hover:shadow-md transition-all">
            <CardContent className="p-8 space-y-5">
              <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-700">
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-primary-900">
                  Topic-Wise Practice
                </h2>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                  Solve assessment questions topic-by-topic. Get immediate
                  verdicts on every choice with exhaustive step-by-step
                  mathematical and logical explanations.
                </p>
              </div>

              <div className="pt-2">
                <Link href="/practice">
                  <Button variant="primary">Start Practicing &rarr;</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Timed Mock Tests Card */}
          <Card className="hover:border-accent-500/50 hover:shadow-md transition-all">
            <CardContent className="p-8 space-y-5">
              <div className="w-10 h-10 rounded-lg bg-accent-50 border border-accent-200 flex items-center justify-center text-accent-700">
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-primary-900">
                    Timed Mock Tests
                  </h2>
                  <span className="text-[11px] font-semibold uppercase bg-accent-100 text-accent-800 px-2 py-0.5 rounded border border-accent-300">
                    Full Simulation
                  </span>
                </div>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                  Experience full-length aptitude tests with server-synchronized
                  timers, palette question navigation, mark-for-review, and
                  performance scoring.
                </p>
              </div>

              <div className="pt-2">
                <Link href="/practice">
                  <Button variant="accent">Explore Modules</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Design Token System Check (Kept for regression / smoke assertions) */}
        <section
          aria-label="Design token check"
          className="rounded-lg border border-border bg-surface-muted p-6"
        >
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-subtle">
            Token check
          </h2>

          <dl className="mt-5 grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-text-subtle">
                Tabular numerals
              </dt>
              <dd className="tabular mt-1 text-3xl font-semibold text-text">
                29:00
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-subtle">
                Answer states
              </dt>
              <dd className="mt-2 flex gap-2">
                <span className="rounded-md border border-success-200 bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700">
                  Correct
                </span>
                <span className="rounded-md border border-error-200 bg-error-50 px-2.5 py-1 text-xs font-medium text-error-700">
                  Incorrect
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-subtle">
                Marked for review
              </dt>
              <dd className="mt-2">
                <span className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium text-text ring-2 ring-review">
                  Q7
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}
