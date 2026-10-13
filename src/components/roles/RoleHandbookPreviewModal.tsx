'use client';

import React, { useState, useEffect } from 'react';
import type { RoleHandbook } from '../../lib/role-handbooks-data';
import {
  generateRoleHandbookPdf,
  generateRoleHandbookMarkdown,
  downloadPdfFile,
  downloadMarkdownFile,
} from '../../lib/role-handbook-pdf';
import { Button } from '../ui/Button';
import {
  Info,
  ListChecks,
  HelpCircle,
  AlertTriangle,
  Library,
  FileDown,
  Printer,
  FileCode,
  X,
} from 'lucide-react';

export interface RoleHandbookPreviewModalProps {
  role: RoleHandbook | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (role: RoleHandbook) => void;
}

type PreviewTab = 'info' | 'syllabus' | 'questions' | 'traps' | 'docs';

export function RoleHandbookPreviewModal({
  role,
  isOpen,
  onClose,
  onPrint,
}: RoleHandbookPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('info');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingMd, setIsDownloadingMd] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset tab on role change
  useEffect(() => {
    setActiveTab('info');
  }, [role?.id]);

  if (!isOpen || !role) return null;

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      const pdfBytes = generateRoleHandbookPdf(role);
      downloadPdfFile(pdfBytes, `${role.slug}-engineering-handbook.pdf`);
    } finally {
      setIsDownloadingPdf(false);
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

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="handbook-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-surface flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-primary-100 text-primary-900 px-2 py-0.5 rounded border border-primary-200">
                {role.category}
              </span>
              <span className="text-xs text-text-muted">
                Level: {role.targetLevel} • ~{role.pageEstimate} pages •{' '}
                {role.estimatedReadTime} read
              </span>
            </div>
            <h2
              id="handbook-preview-title"
              className="text-xl sm:text-2xl font-bold text-primary-900"
            >
              {role.name} — Technical Handbook Preview
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="text-xs font-semibold"
            >
              {isDownloadingPdf ? 'Generating...' : '📥 Download PDF'}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-text-muted hover:text-text p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border bg-surface-muted px-6 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'info', label: 'Role Information', icon: Info },
            { id: 'syllabus', label: 'Syllabus & Projects', icon: ListChecks },
            { id: 'questions', label: 'Questions & Counter-Probes', icon: HelpCircle },
            { id: 'traps', label: 'Interview Traps', icon: AlertTriangle },
            { id: 'docs', label: 'Architecture Docs', icon: Library },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as PreviewTab)}
                className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'border-primary-700 text-primary-800'
                    : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-text">
          {/* TAB 1: INFORMATION */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-base font-bold text-primary-900">
                  Role Overview & Mission
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {role.information.overview}
                </p>
                <div className="p-3 bg-primary-50 border border-primary-200 rounded-md text-xs text-primary-900">
                  <strong>Engineering Mission:</strong> {role.information.mission}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-primary-900">
                  Typical Day-in-the-Life
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-text-muted">
                  {role.information.dayInTheLife.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-primary-900">
                  Core Engineering Responsibilities
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-text-muted">
                  {role.information.coreResponsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-primary-900">
                  Senior Career Progression Ladder
                </h3>
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-surface-muted border-b border-border text-text-muted font-semibold">
                      <tr>
                        <th className="p-2.5">Level</th>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5">Typical Experience</th>
                        <th className="p-2.5">Architectural Responsibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {role.information.careerProgression.map((p, i) => (
                        <tr key={i} className="hover:bg-neutral-50/50">
                          <td className="p-2.5 font-bold text-primary-800">
                            {p.level}
                          </td>
                          <td className="p-2.5 font-medium text-text">
                            {p.title}
                          </td>
                          <td className="p-2.5 text-text-muted">
                            {p.typicalExperience}
                          </td>
                          <td className="p-2.5 text-text-muted">{p.focus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-primary-900">
                  Market Compensation Benchmarks
                </h3>
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-surface-muted border-b border-border text-text-muted font-semibold">
                      <tr>
                        <th className="p-2.5">Region</th>
                        <th className="p-2.5">Entry Tier (L1)</th>
                        <th className="p-2.5">Mid-Senior (L2/L3)</th>
                        <th className="p-2.5">Staff/Principal (L4+)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {role.information.compensationBands.map((c, i) => (
                        <tr key={i} className="hover:bg-neutral-50/50">
                          <td className="p-2.5 font-bold text-text">
                            {c.region}
                          </td>
                          <td className="p-2.5 text-text-muted">{c.entryLevel}</td>
                          <td className="p-2.5 text-text-muted">{c.midSenior}</td>
                          <td className="p-2.5 font-semibold text-accent-700">
                            {c.staffPrincipal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-primary-900">
                  Core Toolchain & Technologies
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
              </section>
            </div>
          )}

          {/* TAB 2: SYLLABUS */}
          {activeTab === 'syllabus' && (
            <div className="space-y-6">
              {role.syllabus.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-5 border border-border rounded-xl bg-surface space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700">
                        {tier.tier} ({tier.durationWeeks} Weeks)
                      </span>
                      <h4 className="text-base font-bold text-text">
                        {tier.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="space-y-3">
                    <span className="text-xs font-bold text-text uppercase tracking-wider">
                      Evaluated Competencies:
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {tier.competencies.map((comp, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 bg-canvas rounded-lg border border-border/60 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-text">
                              {comp.topic}
                            </span>
                            <span className="text-text-muted">
                              Exam Weight: {comp.weightPercentage}% • Target
                              Accuracy: {comp.benchmarkAccuracy}%
                            </span>
                          </div>
                          <ul className="list-disc pl-4 text-[11px] text-text-muted space-y-0.5">
                            {comp.coreInvariants.map((inv, iIdx) => (
                              <li key={iIdx}>Invariant: {inv}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {tier.handsOnProjects && tier.handsOnProjects.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">
                        Capstone Project Specification:
                      </span>
                      {tier.handsOnProjects.map((proj, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-3 bg-primary-50/50 rounded-lg border border-primary-200/60 space-y-1 text-xs"
                        >
                          <strong className="block text-primary-900">
                            {proj.title}
                          </strong>
                          <p className="text-text-muted">{proj.spec}</p>
                          <div className="pt-1 text-[11px] text-text-muted">
                            <strong>Deliverables:</strong>{' '}
                            {proj.deliverables.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {role.questions.map((q, i) => (
                <div
                  key={q.id}
                  className="p-5 border border-border rounded-xl bg-surface space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-primary-800">
                      Scenario #{i + 1} — {q.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        q.difficulty === 'HARD' || q.difficulty === 'EXPERT'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-text">{q.title}</h4>
                  <p className="text-xs font-medium text-text bg-surface-muted p-3 rounded border border-border">
                    {q.questionText}
                  </p>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-accent-800 uppercase tracking-wider">
                      Model Architectural Answer:
                    </span>
                    <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line bg-canvas p-3 rounded border border-border/60">
                      {q.modelAnswer}
                    </p>
                  </div>

                  {q.counterQuestions.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-xs font-bold text-primary-900 uppercase tracking-wider">
                        Interviewer Follow-Up Counter-Probes:
                      </span>
                      <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
                        {q.counterQuestions.map((cq, idx) => (
                          <li key={idx}>{cq}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {q.criticalPitfalls.length > 0 && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 space-y-0.5">
                      <strong>Candidate Rejection Pitfalls:</strong>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {q.criticalPitfalls.map((pf, idx) => (
                          <li key={idx}>{pf}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: TRAPS */}
          {activeTab === 'traps' && (
            <div className="space-y-4">
              {role.interviewTraps.map((trap, idx) => (
                <div
                  key={idx}
                  className="p-5 border border-rose-200 bg-rose-50/20 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-rose-950">
                      ⚠️ {trap.title}
                    </h4>
                    <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300">
                      Danger: {trap.dangerLevel}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                      Candidate Anti-Pattern:
                    </span>
                    <p className="text-xs text-text-muted p-2.5 bg-rose-50 rounded border border-rose-200/80">
                      {trap.antiPattern}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-accent-800 uppercase tracking-wider">
                      Textbook-Grade Correct Approach:
                    </span>
                    <p className="text-xs text-text-muted p-2.5 bg-accent-50/40 rounded border border-accent-200/80">
                      {trap.correctApproach}
                    </p>
                  </div>

                  <div className="text-[11px] text-text-muted">
                    <strong>Screening Context:</strong> {trap.interviewContext}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: ARCHITECTURE DOCS */}
          {activeTab === 'docs' && (
            <div className="space-y-6">
              {role.documentation.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-4">
                  <div className="border-b border-border pb-2">
                    <h4 className="text-base font-bold text-primary-900">
                      {sec.sectionTitle}
                    </h4>
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
                      <div className="p-2.5 bg-surface-muted rounded font-mono text-xs text-primary-950 border border-border">
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
                    <div className="space-y-3">
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
                          <pre className="p-3 bg-neutral-900 text-neutral-100 text-[11px] font-mono overflow-x-auto">
                            <code>{ex.code}</code>
                          </pre>
                          <div className="p-2 bg-surface text-[11px] text-text-muted border-t border-border">
                            {ex.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-muted border-t border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="text-xs font-semibold flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? 'Generating...' : 'Download PDF Handbook'}</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPrint(role)}
              className="text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadMd}
              disabled={isDownloadingMd}
              className="text-xs flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Download Markdown</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-text-muted hover:text-text"
          >
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
