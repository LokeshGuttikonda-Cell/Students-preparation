'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { RoleHandbook } from '../../lib/role-handbooks-data';
import {
  generateRoleHandbookPdf,
  generateRoleHandbookMarkdown,
  downloadPdfFile,
  downloadMarkdownFile,
} from '../../lib/role-handbook-pdf';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  CheckCircle2,
  FileText,
  Clock,
  BookOpen,
  FileDown,
  Eye,
  Printer,
  FileCode,
} from 'lucide-react';

export interface RoleHandbookCardProps {
  role: RoleHandbook;
  onPreview: (role: RoleHandbook) => void;
  onPrint: (role: RoleHandbook) => void;
}

export function RoleHandbookCard({
  role,
  onPreview,
  onPrint,
}: RoleHandbookCardProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingMd, setIsGeneratingMd] = useState(false);
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  const totalCompetencies = role.syllabus.flatMap((s) => s.competencies).length;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(`studentsprep_handbook_progress_${role.slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedCount(parsed.length);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [role.slug]);

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = generateRoleHandbookPdf(role);
      downloadPdfFile(pdfBytes, `${role.slug}-engineering-handbook.pdf`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadMd = () => {
    setIsGeneratingMd(true);
    try {
      const mdContent = generateRoleHandbookMarkdown(role);
      downloadMarkdownFile(mdContent, `${role.slug}-engineering-handbook.md`);
    } finally {
      setIsGeneratingMd(false);
    }
  };

  // Collect unique competencies for chip preview
  const previewTopics = role.syllabus
    .flatMap((s) => s.competencies)
    .slice(0, 3)
    .map((c) => c.topic);

  return (
    <Card className="border border-border bg-surface hover:border-primary-600/50 hover:shadow-md transition-all flex flex-col justify-between">
      <CardContent className="p-6 space-y-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase bg-primary-50 text-primary-800 px-2.5 py-1 rounded border border-primary-200">
              {role.category}
            </span>
            {completedCount !== null && completedCount > 0 && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{completedCount}/{totalCompetencies} ({Math.round((completedCount / totalCompetencies) * 100)}%)</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3 h-3 text-text-muted" />
              <span>~{role.pageEstimate} pages</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-text-muted" />
              <span>{role.estimatedReadTime}</span>
            </span>
          </div>
        </div>

        {/* Title & Summary */}
        <div className="space-y-2">
          <Link href={`/roles/handbooks/${role.slug}` as Route} className="group block">
            <h3 className="text-xl font-bold text-primary-900 group-hover:text-primary-700 transition-colors flex items-center justify-between">
              <span>{role.name}</span>
              <span className="text-xs font-normal text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Read &rarr;
              </span>
            </h3>
          </Link>
          <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
            {role.summary}
          </p>
        </div>

        {/* Syllabus Highlights */}
        <div className="space-y-1.5 pt-2 border-t border-border/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Evaluated Syllabus Core:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {previewTopics.map((topic, i) => (
              <span
                key={i}
                className="text-[11px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200/80"
              >
                {topic}
              </span>
            ))}
            {role.syllabus.flatMap((s) => s.competencies).length > 3 && (
              <span className="text-[11px] text-text-muted py-0.5">
                +{role.syllabus.flatMap((s) => s.competencies).length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center text-xs">
          <div className="bg-canvas p-2 rounded border border-border/40">
            <span className="block font-bold text-text">
              {role.syllabus.length} Tiers
            </span>
            <span className="text-[10px] text-text-muted">Curriculum</span>
          </div>
          <div className="bg-canvas p-2 rounded border border-border/40">
            <span className="block font-bold text-primary-700">
              {role.questions.length} Probes
            </span>
            <span className="text-[10px] text-text-muted">Interview Q&As</span>
          </div>
          <div className="bg-canvas p-2 rounded border border-border/40">
            <span className="block font-bold text-accent-700">
              {role.interviewTraps.length} Traps
            </span>
            <span className="text-[10px] text-text-muted">Anti-Patterns</span>
          </div>
        </div>
      </CardContent>

      {/* Action Footer */}
      <div className="p-4 bg-surface-muted border-t border-border flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Link href={`/roles/handbooks/${role.slug}` as Route}>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs font-semibold text-primary-800 border-primary-300 hover:bg-primary-50 flex items-center gap-1.5"
              aria-label={`Read full handbook for ${role.name}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study</span>
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="text-xs font-semibold flex items-center gap-1.5"
            aria-label={`Download PDF handbook for ${role.name}`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPreview(role)}
            className="text-xs flex items-center gap-1.5"
            aria-label={`Preview handbook for ${role.name}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPrint(role)}
            className="p-1.5 text-xs text-text-muted hover:text-primary-800 rounded hover:bg-neutral-200 transition-colors flex items-center gap-1"
            title="Print-Ready View / Save as PDF"
            aria-label={`Print-ready view for ${role.name}`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadMd}
            disabled={isGeneratingMd}
            className="p-1.5 text-xs text-text-muted hover:text-primary-800 rounded hover:bg-neutral-200 transition-colors flex items-center gap-1"
            title="Download Markdown (.md)"
            aria-label={`Download Markdown for ${role.name}`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>MD</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
