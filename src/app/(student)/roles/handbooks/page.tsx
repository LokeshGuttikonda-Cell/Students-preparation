'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { ROLE_HANDBOOKS, type RoleHandbook } from '../../../../lib/role-handbooks-data';
import {
  generateMasterCompendiumPdf,
  downloadPdfFile,
} from '../../../../lib/role-handbook-pdf';
import { RoleHandbookCard } from '../../../../components/roles/RoleHandbookCard';
import { RoleHandbookPreviewModal } from '../../../../components/roles/RoleHandbookPreviewModal';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { BookOpen, Sparkles, FileDown, DownloadCloud, ArrowRight, Search } from 'lucide-react';

const CATEGORIES = [
  'All Disciplines',
  'Cloud & Infrastructure',
  'Backend & Systems',
  'Full-Stack & Web',
  'Data & AI',
  'Security & QA',
  'Enterprise Systems',
] as const;

export default function RoleHandbooksPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Disciplines');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewRole, setPreviewRole] = useState<RoleHandbook | null>(null);
  const [isDownloadingMaster, setIsDownloadingMaster] = useState(false);
  const [printRole, setPrintRole] = useState<RoleHandbook | null>(null);

  // Filter roles based on category and search query
  const filteredRoles = useMemo(() => {
    return ROLE_HANDBOOKS.filter((role) => {
      const matchesCategory =
        selectedCategory === 'All Disciplines' || role.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const nameMatch = role.name.toLowerCase().includes(q);
      const summaryMatch = role.summary.toLowerCase().includes(q);
      const toolMatch = role.information.keyToolsAndTechnologies.some((t) =>
        t.toLowerCase().includes(q),
      );
      const topicMatch = role.syllabus.some((tier) =>
        tier.competencies.some((c) => c.topic.toLowerCase().includes(q)),
      );

      return nameMatch || summaryMatch || toolMatch || topicMatch;
    });
  }, [selectedCategory, searchQuery]);

  const handleDownloadMasterCompendium = () => {
    setIsDownloadingMaster(true);
    try {
      const pdfBytes = generateMasterCompendiumPdf(ROLE_HANDBOOKS);
      downloadPdfFile(pdfBytes, 'studentsprep-all-12-roles-master-compendium.pdf');
    } finally {
      setIsDownloadingMaster(false);
    }
  };

  const handlePrintRole = (role: RoleHandbook) => {
    setPrintRole(role);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-content mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/dashboard" className="hover:text-primary-700 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/roles" className="hover:text-primary-700 transition-colors">
            Career Roles
          </Link>
          <span>/</span>
          <span className="text-text font-medium">PDF Handbooks & Syllabi</span>
        </div>

        {/* Hero Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-900 px-3 py-1 rounded border border-primary-200 inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary-700" />
              <span>Official Curriculum Publication</span>
            </span>
            <span className="text-xs text-text-muted bg-surface-muted px-2.5 py-1 rounded border border-border">
              {ROLE_HANDBOOKS.length} Engineering Handbooks
            </span>
            <span className="text-xs text-text-muted bg-surface-muted px-2.5 py-1 rounded border border-border">
              100% Technical Signal (Zero Trademarks)
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-900">
              IT Roles Engineering Handbooks &amp; Syllabi
            </h1>
            <p className="text-base text-text-muted max-w-3xl leading-relaxed">
              Download publication-grade, vendor-neutral engineering handbooks for all {ROLE_HANDBOOKS.length} IT roles.
              Each handbook includes role mission, multi-tier curriculum syllabi, real-world technical interview questions, candidate rejection traps, and deep-dive architectural invariants.
            </p>
          </div>
        </div>

        {/* Master Compendium Download Banner */}
        <Card className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 text-white p-6 sm:p-8 border border-primary-800 shadow-lg relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-300">
                <Sparkles className="w-3.5 h-3.5 text-accent-300" />
                <span>All-in-One Master Publication</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Download Master Engineering Compendium (All {ROLE_HANDBOOKS.length} Roles PDF)
              </h2>
              <p className="text-sm text-primary-100/90 leading-relaxed">
                A single unified 60+ page reference manual compiling every IT role, complete syllabus roadmap, technical interview scenario, interviewer counter-probe, recruiter trap, and production system invariant.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="white"
                size="lg"
                onClick={handleDownloadMasterCompendium}
                disabled={isDownloadingMaster}
                className="font-extrabold shadow-md min-h-[48px] px-6 text-sm"
              >
                <FileDown className="w-4 h-4 mr-2 text-primary-700" />
                <span>
                  {isDownloadingMaster
                    ? 'Compiling 12 Handbooks...'
                    : 'Download Master Compendium (PDF)'}
                </span>
              </Button>
              <Link href={'/downloads' as Route}>
                <Button
                  variant="outline-white"
                  size="lg"
                  className="font-bold min-h-[48px] px-5 text-sm group"
                >
                  <DownloadCloud className="w-4 h-4 mr-2" />
                  <span>Full PDF Download Center</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Filters and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary-900 text-white shadow-xs'
                      : 'bg-surface border border-border text-text-muted hover:text-text hover:bg-neutral-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 shrink-0 relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role, skill, or topic..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          <div className="text-xs text-text-muted">
            Showing <strong className="text-text">{filteredRoles.length}</strong> of{' '}
            <strong className="text-text">{ROLE_HANDBOOKS.length}</strong> Engineering Handbooks
          </div>
        </div>

        {/* Handbooks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <RoleHandbookCard
              key={role.id}
              role={role}
              onPreview={(r) => setPreviewRole(r)}
              onPrint={handlePrintRole}
            />
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <Card className="p-12 text-center border-dashed border-border">
            <p className="text-sm text-text-muted">
              No role handbooks match your filter &ldquo;{searchQuery}&rdquo;. Try clearing your search or selecting &ldquo;All Disciplines&rdquo;.
            </p>
          </Card>
        )}

        {/* Bottom Help Callout */}
        <Card className="p-6 bg-surface-muted border border-border">
          <CardContent className="p-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-primary-900">
                Looking for Interactive Mock Tests & Technical Defense Drills?
              </h3>
              <p className="text-xs text-text-muted">
                Each handbook is backed by timed benchmark assessments and live scenario defense drills on StudentsPrep.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/roles">
                <Button variant="secondary" size="sm" className="text-xs">
                  View Role Profiles &rarr;
                </Button>
              </Link>
              <Link href={"/mock-tests" as Route}>
                <Button variant="primary" size="sm" className="text-xs">
                  Take Benchmark Mock &rarr;
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive In-Situ Preview Modal */}
      <RoleHandbookPreviewModal
        role={previewRole}
        isOpen={Boolean(previewRole)}
        onClose={() => setPreviewRole(null)}
        onPrint={handlePrintRole}
      />

      {/* Hidden Print Container for Native High-Res Browser Printing */}
      {printRole && (
        <div className="hidden print:block print:p-8 print:max-w-full text-black bg-white">
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-container,
              .print-container * {
                visibility: visible;
              }
              .print-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
              }
              @page {
                size: A4;
                margin: 15mm;
              }
            }
          `}</style>

          <div className="print-container space-y-6 text-zinc-900">
            <div className="border-b-2 border-black pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                StudentsPrep Engineering Handbook
              </span>
              <h1 className="text-2xl font-bold text-black uppercase">
                {printRole.name}
              </h1>
              <div className="text-xs text-zinc-600 mt-1">
                Discipline: {printRole.category} • Target Level: {printRole.targetLevel} • 100% Technical Signal
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-black border-b border-zinc-300 pb-1">
                1. Role Mission & Profile
              </h2>
              <p className="text-xs leading-relaxed">{printRole.information.overview}</p>
              <p className="text-xs italic">
                <strong>Mission:</strong> {printRole.information.mission}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-black border-b border-zinc-300 pb-1">
                2. Evaluated Syllabus Roadmap
              </h2>
              {printRole.syllabus.map((tier, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <strong className="block text-zinc-900">
                    {tier.tier}: {tier.title} ({tier.durationWeeks} Weeks)
                  </strong>
                  <p className="text-zinc-600">{tier.description}</p>
                  <ul className="list-disc pl-5">
                    {tier.competencies.map((comp, cIdx) => (
                      <li key={cIdx}>
                        <strong>{comp.topic}</strong> (Weight: {comp.weightPercentage}%, Benchmark: {comp.benchmarkAccuracy}%)
                        — Invariants: {comp.coreInvariants.join('; ')}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-black border-b border-zinc-300 pb-1">
                3. Technical Interview Questions & Evaluations
              </h2>
              {printRole.questions.map((q, qIdx) => (
                <div key={q.id} className="space-y-1 text-xs pb-2">
                  <strong>
                    Q{qIdx + 1}: {q.title} [{q.difficulty}]
                  </strong>
                  <p className="italic">{q.questionText}</p>
                  <p>
                    <strong>Model Answer:</strong> {q.modelAnswer}
                  </p>
                </div>
              ))}
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-black border-b border-zinc-300 pb-1">
                4. Recruiter Traps & Anti-Patterns
              </h2>
              {printRole.interviewTraps.map((t, tIdx) => (
                <div key={tIdx} className="text-xs space-y-0.5">
                  <strong className="text-red-700">
                    [HAZARD] {t.title} (Danger: {t.dangerLevel})
                  </strong>
                  <p>
                    <strong>Anti-Pattern:</strong> {t.antiPattern}
                  </p>
                  <p>
                    <strong>Correct Approach:</strong> {t.correctApproach}
                  </p>
                </div>
              ))}
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-black border-b border-zinc-300 pb-1">
                5. Architectural Documentation & Invariants
              </h2>
              {printRole.documentation.map((d, dIdx) => (
                <div key={dIdx} className="text-xs space-y-1">
                  <strong>{d.sectionTitle}</strong>
                  <p>{d.overview}</p>
                  {d.architecturalInvariants.map((inv, iIdx) => (
                    <div key={iIdx} className="pl-3 border-l-2 border-zinc-400">
                      <strong>{inv.title}:</strong> {inv.formulaOrInvariant}
                      <p>{inv.explanation}</p>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
