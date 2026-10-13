'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import {
  ROLE_HANDBOOKS,
  type RoleHandbook,
} from '../../../../../lib/role-handbooks-data';
import {
  generateRoleHandbookPdf,
  generatePersonalizedStudyPlanPdf,
  generateRoleHandbookMarkdown,
  downloadPdfFile,
  downloadMarkdownFile,
} from '../../../../../lib/role-handbook-pdf';
import { Card, CardContent } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { FileDown, GraduationCap, Printer, FileText, Zap, Target, AlertTriangle, Clock } from 'lucide-react';
import { RoleInterviewDrillModal } from '../../../../../components/roles/RoleInterviewDrillModal';
import { RoleInterviewFlashcardsModal } from '../../../../../components/roles/RoleInterviewFlashcardsModal';

export default function RoleHandbookDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const role: RoleHandbook | undefined = useMemo(() => {
    return ROLE_HANDBOOKS.find((r) => r.slug === slug || r.id === slug);
  }, [slug]);

  // Mastered competencies tracker with localStorage persistence
  const [masteredTopics, setMasteredTopics] = useState<string[]>([]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingPlan, setIsDownloadingPlan] = useState(false);
  const [isDownloadingMd, setIsDownloadingMd] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Technical interview drill modal state
  const [isDrillModalOpen, setIsDrillModalOpen] = useState(false);
  const [drillTargetIndex, setDrillTargetIndex] = useState(0);

  // Technical interview flashcards modal state
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState(false);

  const storageKey = role ? `studentsprep_handbook_progress_${role.slug}` : '';

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMasteredTopics(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [storageKey]);

  const toggleTopic = (topic: string) => {
    setMasteredTopics((prev) => {
      const next = prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic];
      if (typeof window !== 'undefined' && storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // Ignore write errors
        }
      }
      return next;
    });
  };

  const resetProgress = () => {
    setMasteredTopics([]);
    if (typeof window !== 'undefined' && storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Ignore
      }
    }
  };

  const allCompetencies = useMemo(() => {
    return role ? role.syllabus.flatMap((s) => s.competencies) : [];
  }, [role]);

  const completionRate = useMemo(() => {
    if (allCompetencies.length === 0) return 0;
    const completed = allCompetencies.filter((c) =>
      masteredTopics.includes(c.topic),
    ).length;
    return Math.round((completed / allCompetencies.length) * 100);
  }, [allCompetencies, masteredTopics]);

  if (!role) {
    return (
      <div className="min-h-dvh bg-canvas py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-2xl font-bold text-primary-900">
            Handbook Not Found
          </h1>
          <p className="text-sm text-text-muted">
            The engineering handbook for &ldquo;{slug}&rdquo; could not be located in our curriculum catalog.
          </p>
          <Link href={"/roles/handbooks" as Route}>
            <Button variant="primary" size="sm">
              &larr; Return to All Role Handbooks
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      const pdfBytes = generateRoleHandbookPdf(role);
      downloadPdfFile(pdfBytes, `${role.slug}-engineering-handbook.pdf`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadStudyPlan = () => {
    setIsDownloadingPlan(true);
    try {
      const pdfBytes = generatePersonalizedStudyPlanPdf(role, masteredTopics);
      downloadPdfFile(pdfBytes, `${role.slug}-personalized-study-plan.pdf`);
    } finally {
      setIsDownloadingPlan(false);
    }
  };

  const handleDownloadMd = () => {
    setIsDownloadingMd(true);
    try {
      const mdContent = generateRoleHandbookMarkdown(role);
      downloadMarkdownFile(mdContent, `${role.slug}-engineering-handbook.md`);
    } finally {
      setIsDownloadingMd(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
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
          <Link href={"/roles/handbooks" as Route} className="hover:text-primary-700 transition-colors">
            PDF Handbooks &amp; Syllabi
          </Link>
          <span>/</span>
          <span className="text-text font-medium">{role.name}</span>
        </div>

        {/* Hero Header */}
        <Card className="border border-border bg-surface shadow-xs">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-900 px-3 py-1 rounded border border-primary-200">
                  {role.category}
                </span>
                <span className="text-xs text-text-muted bg-surface-muted px-2.5 py-1 rounded border border-border">
                  Target Level: {role.targetLevel}
                </span>
                <span className="text-xs text-text-muted bg-surface-muted px-2.5 py-1 rounded border border-border">
                  ~{role.pageEstimate} Publication Pages
                </span>
                <span className="text-xs text-text-muted bg-surface-muted px-2.5 py-1 rounded border border-border inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary-600" />
                  <span>{role.estimatedReadTime} Read</span>
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="text-xs font-semibold"
                >
                  <FileDown className="w-3.5 h-3.5 mr-1.5 text-white" />
                  <span>{isDownloadingPdf ? 'Generating...' : 'Download PDF Handbook'}</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadStudyPlan}
                  disabled={isDownloadingPlan}
                  className="text-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-primary-700" />
                  <span>{isDownloadingPlan ? 'Compiling Plan...' : 'Download Study Plan (PDF)'}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handlePrint} className="text-xs">
                  <Printer className="w-3.5 h-3.5 mr-1.5 text-text-muted" />
                  <span>Print View</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadMd}
                  disabled={isDownloadingMd}
                  className="text-xs"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-text-muted" />
                  <span>Markdown</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-900">
                {role.name} — Engineering Handbook &amp; Syllabus
              </h1>
              <p className="text-base text-text-muted max-w-4xl leading-relaxed">
                {role.summary}
              </p>
            </div>

            {/* Interactive Syllabus Progress Gauge */}
            <div className="p-4 bg-surface-muted rounded-xl border border-border/80 space-y-3">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary-900">
                    Syllabus Mastery Progress:
                  </span>
                  <span className="text-text font-semibold">
                    {allCompetencies.filter((c) => masteredTopics.includes(c.topic)).length} of{' '}
                    {allCompetencies.length} Competencies Mastered ({completionRate}%)
                  </span>
                </div>
                {masteredTopics.length > 0 && (
                  <button
                    type="button"
                    onClick={resetProgress}
                    className="text-[11px] text-text-muted hover:text-rose-700 underline"
                  >
                    Reset Progress
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-border/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-700 transition-all duration-300 rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>
                  Check off topics below as you study to track preparation readiness.
                </span>
                <button
                  type="button"
                  onClick={handleDownloadStudyPlan}
                  className="text-primary-700 hover:underline font-semibold"
                >
                  Export Personalized Plan PDF &rarr;
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-Column Layout: Sticky Sidebar TOC + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-20 bg-surface border border-border rounded-xl p-4 space-y-4 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border pb-2">
                Handbook Sections
              </h2>
              <nav className="space-y-1.5 text-xs">
                <a
                  href="#overview"
                  className="block p-2 rounded hover:bg-neutral-100 font-medium text-text-muted hover:text-primary-800 transition-colors"
                >
                  1. Executive Profile &amp; Mission
                </a>
                <a
                  href="#ladder"
                  className="block p-2 rounded hover:bg-neutral-100 font-medium text-text-muted hover:text-primary-800 transition-colors"
                >
                  2. Career Ladder &amp; Salaries
                </a>
                <a
                  href="#syllabus"
                  className="block p-2 rounded hover:bg-neutral-100 font-medium text-text-muted hover:text-primary-800 transition-colors"
                >
                  3. Evaluated Syllabus Roadmap
                </a>
                <a
                  href="#questions"
                  className="block p-2 rounded hover:bg-neutral-100 font-medium text-text-muted hover:text-primary-800 transition-colors"
                >
                  4. Technical Interview Scenarios
                </a>
                <a
                  href="#traps"
                  className="block p-2 rounded hover:bg-neutral-100 font-medium text-text-muted hover:text-primary-800 transition-colors"
                >
                  5. Recruiter Traps &amp; Anti-Patterns
                </a>
                <a
                  href="#documentation"
                  className="block p-2 rounded hover:bg-neutral-100 font-medium text-text-muted hover:text-primary-800 transition-colors"
                >
                  6. Architectural Documentation
                </a>
              </nav>

              {/* Action Buttons in Sidebar */}
              <div className="pt-3 border-t border-border space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadPdf}
                  className="w-full text-xs"
                >
                  <FileDown className="w-3.5 h-3.5 mr-1.5" />
                  <span>Download PDF</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadStudyPlan}
                  className="w-full text-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-primary-700" />
                  <span>Study Plan (PDF)</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsFlashcardsModalOpen(true)}
                  className="w-full text-xs font-semibold text-primary-900 border-primary-200 hover:bg-primary-50"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  <span>Rapid Flashcards</span>
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Handbook Content */}
          <main className="lg:col-span-3 space-y-10">
            {/* SECTION 1: ROLE MISSION & EXECUTIVE PROFILE */}
            <section id="overview" className="space-y-4 scroll-mt-20">
              <div className="border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                  Section 1
                </span>
                <h2 className="text-2xl font-bold text-primary-900">
                  Role Mission &amp; Executive Profile
                </h2>
              </div>

              <div className="space-y-4 text-sm text-text">
                <p className="leading-relaxed text-text-muted">
                  {role.information.overview}
                </p>

                <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg text-xs text-primary-950">
                  <strong>Engineering Mission:</strong> {role.information.mission}
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-bold text-text">
                    Typical Day-in-the-Life &amp; Engineering Focus
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-text-muted">
                    {role.information.dayInTheLife.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-bold text-text">
                    Core Engineering Responsibilities
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-text-muted">
                    {role.information.coreResponsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-bold text-text">
                    Core Toolchain &amp; Technologies
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {role.information.keyToolsAndTechnologies.map((tool, i) => (
                      <span
                        key={i}
                        className="text-xs bg-surface-muted text-text px-2.5 py-1 rounded border border-border"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: CAREER PROGRESSION & COMPENSATION */}
            <section id="ladder" className="space-y-4 scroll-mt-20">
              <div className="border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                  Section 2
                </span>
                <h2 className="text-2xl font-bold text-primary-900">
                  Career Ladder &amp; Market Compensation
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-text">
                    Senior Engineering Career Progression Ladder
                  </h3>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-surface-muted border-b border-border text-text-muted font-semibold">
                        <tr>
                          <th className="p-3">Level</th>
                          <th className="p-3">Title</th>
                          <th className="p-3">Experience</th>
                          <th className="p-3">Core Architectural Responsibility</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {role.information.careerProgression.map((tier, i) => (
                          <tr key={i} className="hover:bg-neutral-50/50">
                            <td className="p-3 font-bold text-primary-800">{tier.level}</td>
                            <td className="p-3 font-medium text-text">{tier.title}</td>
                            <td className="p-3 text-text-muted">{tier.typicalExperience}</td>
                            <td className="p-3 text-text-muted">{tier.focus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-text">
                    Market Compensation Benchmarks by Tier
                  </h3>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-surface-muted border-b border-border text-text-muted font-semibold">
                        <tr>
                          <th className="p-3">Region</th>
                          <th className="p-3">Entry Tier (L1)</th>
                          <th className="p-3">Mid-Senior (L2/L3)</th>
                          <th className="p-3">Staff/Principal (L4+)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {role.information.compensationBands.map((comp, i) => (
                          <tr key={i} className="hover:bg-neutral-50/50">
                            <td className="p-3 font-bold text-text">{comp.region}</td>
                            <td className="p-3 text-text-muted">{comp.entryLevel}</td>
                            <td className="p-3 text-text-muted">{comp.midSenior}</td>
                            <td className="p-3 font-semibold text-accent-700">{comp.staffPrincipal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: EVALUATED SYLLABUS & CHECKLIST */}
            <section id="syllabus" className="space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                    Section 3
                  </span>
                  <h2 className="text-2xl font-bold text-primary-900">
                    Evaluated Syllabus Roadmap &amp; Progress Checklist
                  </h2>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadStudyPlan}
                  className="text-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-primary-700" />
                  <span>Export Stamped Study Plan (PDF)</span>
                </Button>
              </div>

              <div className="space-y-6">
                {role.syllabus.map((tier, idx) => (
                  <Card key={idx} className="border border-border">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3 flex-wrap">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                            {tier.tier} ({tier.durationWeeks} Weeks)
                          </span>
                          <h3 className="text-lg font-bold text-text">
                            {tier.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-text-muted leading-relaxed">
                        {tier.description}
                      </p>

                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-text uppercase tracking-wider">
                          Competencies Checklist:
                        </span>
                        <div className="space-y-3">
                          {tier.competencies.map((comp, cIdx) => {
                            const isMastered = masteredTopics.includes(comp.topic);
                            return (
                              <div
                                key={cIdx}
                                onClick={() => toggleTopic(comp.topic)}
                                className={`p-4 rounded-lg border transition-all cursor-pointer select-none space-y-2 ${
                                  isMastered
                                    ? 'bg-primary-50/60 border-primary-300'
                                    : 'bg-canvas border-border/70 hover:border-primary-400'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isMastered}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleTopic(comp.topic);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 rounded text-primary-700 focus:ring-primary-600 cursor-pointer"
                                      aria-label={`Mark ${comp.topic} as mastered`}
                                    />
                                    <span
                                      className={`text-sm font-bold ${
                                        isMastered
                                          ? 'text-primary-950 line-through'
                                          : 'text-text'
                                      }`}
                                    >
                                      {comp.topic}
                                    </span>
                                  </div>
                                  <div className="text-xs text-text-muted shrink-0 text-right">
                                    <span>Weight: {comp.weightPercentage}%</span> •{' '}
                                    <span>Cutoff: {comp.benchmarkAccuracy}%</span>
                                  </div>
                                </div>

                                <ul className="list-disc pl-9 text-xs text-text-muted space-y-0.5">
                                  {comp.coreInvariants.map((inv, iIdx) => (
                                    <li key={iIdx}>
                                      <strong>Invariant:</strong> {inv}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {tier.handsOnProjects && tier.handsOnProjects.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-border/60">
                          <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">
                            Capstone Project Specifications:
                          </span>
                          {tier.handsOnProjects.map((proj, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-3.5 bg-surface-muted rounded-lg border border-border/80 space-y-1 text-xs"
                            >
                              <strong className="text-text block text-sm font-bold">
                                {proj.title}
                              </strong>
                              <p className="text-text-muted leading-relaxed">
                                {proj.spec}
                              </p>
                              <div className="text-[11px] text-text-muted pt-1">
                                <strong>Deliverables:</strong>{' '}
                                {proj.deliverables.join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* SECTION 4: TECHNICAL INTERVIEW SCENARIOS */}
            <section id="questions" className="space-y-4 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                    Section 4
                  </span>
                  <h2 className="text-2xl font-bold text-primary-900">
                    Technical Interview Questions &amp; Counter-Probes
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0 self-start sm:self-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 text-xs font-bold shadow-xs text-primary-900 border-primary-300 hover:bg-primary-50"
                    onClick={() => setIsFlashcardsModalOpen(true)}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rapid Flashcards</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5 text-xs font-bold shadow-xs"
                    onClick={() => {
                      setDrillTargetIndex(0);
                      setIsDrillModalOpen(true);
                    }}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Launch Defense Drill Simulator</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {role.questions.map((q, idx) => (
                  <Card key={q.id} className="border border-border">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-primary-800">
                          Scenario #{idx + 1} — {q.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              q.difficulty === 'HARD' || q.difficulty === 'EXPERT'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs font-semibold py-1 px-2.5 h-auto text-primary-800 hover:bg-primary-50 flex items-center gap-1"
                            onClick={() => {
                              setDrillTargetIndex(idx);
                              setIsDrillModalOpen(true);
                            }}
                          >
                            <Target className="w-3 h-3 text-accent-700" />
                            <span>Drill Scenario</span>
                          </Button>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-text">{q.title}</h3>
                      <div className="p-3.5 bg-surface-muted rounded-lg border border-border text-xs font-medium text-text">
                        {q.questionText}
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-accent-800 uppercase tracking-wider">
                          Model Architectural Answer:
                        </span>
                        <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line bg-canvas p-3.5 rounded border border-border/70">
                          {q.modelAnswer}
                        </p>
                      </div>

                      {q.counterQuestions.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-xs font-bold text-primary-900 uppercase tracking-wider">
                            Interviewer Follow-Up Counter-Questions:
                          </span>
                          <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
                            {q.counterQuestions.map((cq, i) => (
                              <li key={i}>{cq}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {q.criticalPitfalls.length > 0 && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 space-y-1">
                          <strong>Candidate Rejection Pitfalls:</strong>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {q.criticalPitfalls.map((pf, i) => (
                              <li key={i}>{pf}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* SECTION 5: RECRUITER TRAPS & ANTI-PATTERNS */}
            <section id="traps" className="space-y-4 scroll-mt-20">
              <div className="border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Section 5
                </span>
                <h2 className="text-2xl font-bold text-rose-950">
                  Recruiter Traps &amp; Candidate Anti-Patterns
                </h2>
              </div>

              <div className="space-y-4">
                {role.interviewTraps.map((trap, idx) => (
                  <Card key={idx} className="border border-rose-200 bg-rose-50/20">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-rose-950 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{trap.title}</span>
                        </h3>
                        <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2.5 py-1 rounded border border-rose-300">
                          Danger Level: {trap.dangerLevel}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                          Candidate Anti-Pattern:
                        </span>
                        <p className="text-xs text-text-muted p-3 bg-rose-50 rounded border border-rose-200/80 leading-relaxed">
                          {trap.antiPattern}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-accent-800 uppercase tracking-wider">
                          Textbook-Grade Correct Approach:
                        </span>
                        <p className="text-xs text-text-muted p-3 bg-accent-50/40 rounded border border-accent-200/80 leading-relaxed">
                          {trap.correctApproach}
                        </p>
                      </div>

                      <div className="text-xs text-text-muted pt-1">
                        <strong>Screening Context:</strong> {trap.interviewContext}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* SECTION 6: ARCHITECTURAL DOCUMENTATION & INVARIANTS */}
            <section id="documentation" className="space-y-4 scroll-mt-20">
              <div className="border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                  Section 6
                </span>
                <h2 className="text-2xl font-bold text-primary-900">
                  Architectural Documentation &amp; Production Invariants
                </h2>
              </div>

              <div className="space-y-6">
                {role.documentation.map((sec, sIdx) => (
                  <Card key={sIdx} className="border border-border">
                    <CardContent className="p-6 space-y-4">
                      <div className="border-b border-border/60 pb-2">
                        <h3 className="text-lg font-bold text-primary-900">
                          {sec.sectionTitle}
                        </h3>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          {sec.overview}
                        </p>
                      </div>

                      {sec.architecturalInvariants.map((inv, iIdx) => (
                        <div
                          key={iIdx}
                          className="p-4 bg-canvas rounded-lg border border-border/80 space-y-2"
                        >
                          <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                            Invariant: {inv.title}
                          </span>
                          <div className="p-3 bg-surface-muted rounded font-mono text-xs text-primary-950 border border-border">
                            {inv.formulaOrInvariant}
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed">
                            {inv.explanation}
                          </p>
                          <div className="text-[11px] text-text-muted">
                            <strong>Trade-offs:</strong> {inv.tradeoffs}
                          </div>
                        </div>
                      ))}

                      {sec.codeExamples && sec.codeExamples.length > 0 && (
                        <div className="space-y-3 pt-2">
                          {sec.codeExamples.map((ex, cIdx) => (
                            <div
                              key={cIdx}
                              className="border border-border rounded-lg overflow-hidden"
                            >
                              <div className="bg-surface-muted p-2.5 border-b border-border flex items-center justify-between text-xs">
                                <span className="font-bold text-text">
                                  {ex.title} ({ex.language})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyCode(ex.code, cIdx)}
                                  className="text-[11px] font-semibold text-primary-700 hover:underline"
                                >
                                  {copiedIndex === cIdx ? 'Copied!' : 'Copy Code'}
                                </button>
                              </div>
                              <pre className="p-3.5 bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto">
                                <code>{ex.code}</code>
                              </pre>
                              <div className="p-2.5 bg-surface text-[11px] text-text-muted border-t border-border">
                                {ex.explanation}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Bottom Assessment Callout */}
            <div className="bento-tile p-6 sm:p-8 bg-[#0a0f1d]/85 border border-white/10 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-lime-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <h3 className="text-lg font-display font-bold text-white">
                    Ready to Test Your Readiness for {role.name}?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Attempt the official timed benchmark mock assessment or launch an AI-evaluated Socratic technical interview room.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={"/mock-tests" as Route}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-lime-400 hover:bg-lime-300 text-black font-mono font-bold border-0 text-xs shadow-sm"
                    >
                      Take Benchmark Mock &rarr;
                    </Button>
                  </Link>
                  <Link href={"/interviews" as Route}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-white border-white/10 bg-white/5 hover:bg-white/10 font-mono text-xs"
                    >
                      Interview Room &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Technical Interview Drill Defense Simulator Modal */}
      {role && isDrillModalOpen && (
        <RoleInterviewDrillModal
          role={role}
          isOpen={isDrillModalOpen}
          onClose={() => setIsDrillModalOpen(false)}
          initialQuestionIndex={drillTargetIndex}
        />
      )}

      {/* Role Rapid-Fire Flashcards Modal */}
      {role && isFlashcardsModalOpen && (
        <RoleInterviewFlashcardsModal
          role={role}
          isOpen={isFlashcardsModalOpen}
          onClose={() => setIsFlashcardsModalOpen(false)}
        />
      )}
    </div>
  );
}
