'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { getRole, RoleTrackDetail } from '../../../../lib/roles-client';
import { RoleCompetencyList } from '../../../../components/roles/RoleCompetencyList';
import { RoleInterviewTrapsSection } from '../../../../components/roles/RoleInterviewTrapsSection';
import { getArticlesForRole, type CurriculumArticleSummary } from '../../../../lib/curriculum-client';
import { Button } from '../../../../components/ui/Button';
import { BookOpen, FileDown, Library, Mic, Target, Zap, Terminal, ArrowRight } from 'lucide-react';
import { ROLE_HANDBOOKS } from '../../../../lib/role-handbooks-data';
import { generateRoleHandbookPdf, downloadPdfFile } from '../../../../lib/role-handbook-pdf';
import { RoleInterviewFlashcardsModal } from '../../../../components/roles/RoleInterviewFlashcardsModal';

export default function RoleDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [role, setRole] = useState<RoleTrackDetail | null>(null);
  const [roleArticles, setRoleArticles] = useState<CurriculumArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState(false);

  const matchingHandbook = useMemo(() => {
    if (!role && !slug) return undefined;
    const direct = ROLE_HANDBOOKS.find(
      (h) =>
        h.slug === slug ||
        h.id === role?.id ||
        h.slug === role?.slug ||
        (slug && (h.slug.includes(slug) || slug.includes(h.slug))),
    );
    if (direct) return direct;

    const rName = (role?.name || slug || '').toLowerCase();
    return ROLE_HANDBOOKS.find((h) => {
      const hName = h.name.toLowerCase();
      const hSlug = h.slug.toLowerCase();
      return (
        hName.includes(rName) ||
        rName.includes(hName) ||
        (rName.includes('backend') && hSlug.includes('backend')) ||
        (rName.includes('cloud') && hSlug.includes('cloud')) ||
        (rName.includes('devops') && hSlug.includes('devops')) ||
        (rName.includes('data') && hSlug.includes('data'))
      );
    });
  }, [role, slug]);

  useEffect(() => {
    if (!slug) return;
    async function loadRole() {
      try {
        setLoading(true);
        setError(null);
        const [data, articles] = await Promise.all([
          getRole(slug),
          getArticlesForRole(slug),
        ]);
        setRole(data);
        setRoleArticles(articles);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to load career role "${slug}". Please check your network.`,
        );
      } finally {
        setLoading(false);
      }
    }
    loadRole();
  }, [slug]);

  const formatLevel = (level: string) => {
    switch (level) {
      case 'ENTRY_LEVEL':
        return 'Entry Level / Campus Screening';
      case 'MID_LEVEL':
        return 'Mid Level (1-3 Yrs)';
      case 'SPECIALIST':
        return 'Specialist Track';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#040711] text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-content mx-auto space-y-8 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-32" />
          <div className="h-10 bg-white/10 rounded w-2/3" />
          <div className="h-24 bento-tile border-white/10" />
          <div className="h-64 bento-tile border-white/10" />
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="min-h-dvh bg-[#040711] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto p-6 rounded-2xl bento-tile border-rose-500/30 text-rose-200 space-y-4">
          <h2 className="text-lg font-display font-bold text-white">Unable to Load Career Track</h2>
          <p className="text-xs font-mono text-slate-400">{error ?? 'Role profile not found.'}</p>
          <div className="flex gap-3 pt-2">
            <Link href="/roles">
              <Button variant="secondary" size="sm">
                &larr; Back to Career Roles
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#040711] text-white selection:bg-lime-400 selection:text-black py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden font-sans">
      <div className="max-w-content mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/dashboard" className="hover:text-lime-400 transition-colors">
            Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <Link href="/roles" className="hover:text-lime-400 transition-colors">
            Career Roles
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white font-medium">{role.name}</span>
        </div>

        {/* Role Hero Card */}
        <div className="bento-tile p-6 sm:p-8 space-y-4 border-white/10 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-lime-400/10 text-lime-400 px-3 py-1 rounded border border-lime-400/20">
              {formatLevel(role.targetLevel)}
            </span>
            <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded border border-white/10">
              {role.competencies.length} Evaluated Topics
            </span>
            <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded border border-white/10">
              {role.mockTests.length}{' '}
              {role.mockTests.length === 1 ? 'Benchmark Mock' : 'Benchmark Mocks'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white">
            {role.name}
          </h1>

          {role.description && (
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
              {role.description}
            </p>
          )}

          <div className="flex items-center gap-3 pt-3 flex-wrap">
            {matchingHandbook && (
              <>
                <Link href={`/roles/handbooks/${matchingHandbook.slug}` as Route}>
                  <Button variant="primary" size="sm" className="font-bold font-mono text-xs shadow-md shadow-lime-400/20 group">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    <span>Read Online Handbook &amp; Syllabus</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const pdfBytes = generateRoleHandbookPdf(matchingHandbook);
                    downloadPdfFile(
                      pdfBytes,
                      `${matchingHandbook.slug}-engineering-handbook.pdf`,
                    );
                  }}
                  className="font-mono text-xs"
                >
                  <FileDown className="w-3.5 h-3.5 mr-1.5 text-lime-400" />
                  Download PDF
                </Button>
              </>
            )}
            <Link href={"/roles/handbooks" as Route}>
              <Button variant="ghost" size="sm" className="text-xs font-mono text-slate-400 hover:text-white">
                <Library className="w-3.5 h-3.5 mr-1.5" />
                All 12 Role Handbooks
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 1: Evaluated Syllabus Competencies */}
        <section aria-labelledby="competencies-heading" className="space-y-4">
          <RoleCompetencyList competencies={role.competencies} />
        </section>

        {/* Section 2: Recruiter Traps & Anti-Patterns */}
        <RoleInterviewTrapsSection roleSlug={role.slug} />

        {/* Section 3: Live Socratic AI Technical Interview */}
        <div className="bento-tile border-lime-500/30 bg-gradient-to-r from-[#071324] via-[#0b1c35] to-[#040a17] text-white p-6 sm:p-8 featured-glow relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-lime-400" />
                <span>Live Socratic Evaluation</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                AI Technical Scenario Interview
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Simulate a real technical screening interview for the {role.name} role.
                Answer scenario questions with live speech recognition, counter-probes, and automated rubric scoring.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href={"/interviews" as Route}>
                <Button variant="primary" className="font-bold font-mono min-h-[44px] shadow-md shadow-lime-400/20 group">
                  <span>Launch Interview Room</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href={`/roles/handbooks/${role.slug}#questions` as Route}>
                <Button variant="secondary" className="font-bold font-mono min-h-[44px] group">
                  <Target className="w-3.5 h-3.5 mr-1.5" />
                  <span>Defense Drills</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              {matchingHandbook && (
                <Button
                  variant="secondary"
                  onClick={() => setIsFlashcardsModalOpen(true)}
                  className="font-bold font-mono min-h-[44px]"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  Rapid Flashcards
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Curated Knowledge Hub Guides */}
        {roleArticles.length > 0 && (
          <section aria-labelledby="articles-heading" className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 id="articles-heading" className="text-xl font-display font-bold text-white">
                  Curated Technical Documentation
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  In-depth architectural articles, invariants, and implementation patterns mapped to this role.
                </p>
              </div>
              <Link href="/curriculum" className="text-xs font-mono font-semibold text-lime-400 hover:underline">
                View All Knowledge Hub &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleArticles.map((art) => (
                <div key={art.id} className="bento-tile p-5 hover:border-lime-400/40 hover:shadow-lg transition-all flex flex-col justify-between border-white/10 group">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-medium text-slate-400">{art.domainName}</span>
                      <span className="text-[10px] font-mono font-semibold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
                        {art.level} · {art.readTimeMinutes} min
                      </span>
                    </div>
                    <h3 className="text-base font-display font-bold text-white group-hover:text-lime-300 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                      {art.summary}
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link href={`/curriculum/${art.slug}` as Route} className="text-xs font-mono font-semibold text-lime-400 hover:underline inline-flex items-center gap-1">
                      Read Technical Guide &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Role Benchmark Mock Tests */}
        <section aria-labelledby="mock-tests-heading" className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 id="mock-tests-heading" className="text-xl font-display font-bold text-white">
                Role Benchmark Mock Tests
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Full-length timed assessments evaluating all core competencies required for this role.
              </p>
            </div>
          </div>

          {role.mockTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {role.mockTests.map((test) => (
                <div
                  key={test.id}
                  className="bento-tile hover:border-lime-400/40 hover:shadow-lg transition-all flex flex-col justify-between border-white/10 p-6 space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-display font-bold text-white leading-snug">
                        {test.title}
                      </h3>
                      <span className="text-xs font-mono font-semibold text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded border border-lime-400/20 shrink-0">
                        {test.durationMinutes} Mins
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-white/10">
                      <span>
                        Marks per question: <strong className="text-white">{test.marksPerQuestion}</strong>
                      </span>
                      {test.negativeMarking ? (
                        <span>
                          Negative: <strong className="text-rose-400">-{test.negativeMarking}</strong>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">No negative marking</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/mock-tests/${test.id}`} className="block w-full">
                      <Button variant="primary" className="w-full min-h-[44px] font-bold font-mono touch-manipulation shadow-md shadow-lime-400/20">
                        Start Role Mock Test &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4 bento-tile border-dashed border-white/10 space-y-3">
              <p className="text-sm font-display font-semibold text-white">
                No full-length mock tests assigned to this role yet
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                You can still build 100% role readiness by practicing the individual syllabus competencies listed above!
              </p>
              <div className="pt-2">
                <Link href="/practice">
                  <Button variant="secondary" size="sm">
                    Go to Topic Practice &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Section 6: Applied Code & SQL Sandbox Banner */}
        {(() => {
          const getRoleStudioTab = (roleSlug: string) => {
            switch (roleSlug) {
              case 'cloud-devops-engineer':
              case 'site-reliability-engineer':
              case 'devops-engineer':
                return { tab: 'distributed', name: 'Distributed Systems & Architecture Studio' };
              case 'cloud-solutions-architect':
              case 'system-design-architect':
              case 'enterprise-architect':
                return { tab: 'system-design', name: 'System Design Architecture Studio' };
              case 'operating-systems-engineer':
              case 'cybersecurity-specialist':
              case 'embedded-systems-engineer':
                return { tab: 'kernel', name: 'OS Kernel & Network Protocols Studio' };
              case 'python-developer':
              case 'fullstack-javascript-developer':
              case 'nodejs-developer':
                return { tab: 'concurrency', name: 'Runtime Concurrency & Event Loop Studio' };
              case 'database-administrator':
              case 'backend-systems-engineer':
                return { tab: 'tradeoff', name: 'Architecture & Storage Trade-Off Studio' };
              case 'java-backend-developer':
              case 'data-engineer':
                return { tab: 'sql', name: 'Relational SQL Query Lab' };
              case 'frontend-developer':
              case 'fullstack-engineer':
              case 'software-development-engineer':
              case 'algorithms-specialist':
                return { tab: 'visual', name: 'Visual Algorithm Stepper Studio' };
              default:
                return { tab: 'sql', name: 'Applied Engineering Laboratories' };
            }
          };

          const roleStudio = getRoleStudioTab(slug || '');

          return (
            <div className="bento-tile p-6 border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-lime-400" />
                    <span>Applied Engineering</span>
                  </span>
                  <h3 className="text-lg font-display font-bold text-white">
                    Interactive Code &amp; SQL Sandbox
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl font-sans">
                    Practice algorithm implementations, multi-tenant SQL queries, and distributed architecture models in the {roleStudio.name}.
                  </p>
                </div>
                <Link href={`/sandbox?tab=${roleStudio.tab}`} className="shrink-0">
                  <Button variant="secondary" size="sm" className="group font-mono">
                    <span>Open Sandbox</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })()}
      </div>

      {matchingHandbook && isFlashcardsModalOpen && (
        <RoleInterviewFlashcardsModal
          role={matchingHandbook}
          isOpen={isFlashcardsModalOpen}
          onClose={() => setIsFlashcardsModalOpen(false)}
        />
      )}
    </div>
  );
}

