'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  ROLE_HANDBOOKS,
  type RoleHandbook,
} from '../../lib/role-handbooks-data';
import {
  generatePersonalizedStudyPlanPdf,
  generateMasterCompendiumPdf,
  downloadPdfFile,
} from '../../lib/role-handbook-pdf';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { BookOpen, GraduationCap, Library, FileDown, ArrowRight } from 'lucide-react';

export interface RoleHandbookProgressWidgetProps {
  targetRoleId?: string;
}

export function RoleHandbookProgressWidget({ targetRoleId }: RoleHandbookProgressWidgetProps) {
  const [activeRoleSlug, setActiveRoleSlug] = useState<string | null>(null);
  const [masteredTopics, setMasteredTopics] = useState<string[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Find role with targetRoleId or first role with non-empty progress
      let matchedSlug: string | null = null;
      let matchedTopics: string[] = [];

      if (targetRoleId) {
        const matching = ROLE_HANDBOOKS.find((r) => r.id === targetRoleId || r.slug === targetRoleId);
        if (matching) {
          const key = `studentsprep_handbook_progress_${matching.slug}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            matchedSlug = matching.slug;
            matchedTopics = JSON.parse(saved);
          }
        }
      }

      if (!matchedSlug) {
        // Scan for any role that has progress
        for (const role of ROLE_HANDBOOKS) {
          const key = `studentsprep_handbook_progress_${role.slug}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              matchedSlug = role.slug;
              matchedTopics = parsed;
              break;
            }
          }
        }
      }

      if (matchedSlug) {
        setActiveRoleSlug(matchedSlug);
        setMasteredTopics(matchedTopics);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [targetRoleId]);

  const activeRole: RoleHandbook | undefined = useMemo(() => {
    if (!activeRoleSlug) return undefined;
    return ROLE_HANDBOOKS.find((r) => r.slug === activeRoleSlug);
  }, [activeRoleSlug]);

  const totalCompetencies = useMemo(() => {
    return activeRole ? activeRole.syllabus.flatMap((s) => s.competencies).length : 0;
  }, [activeRole]);

  const completionPercentage = useMemo(() => {
    if (totalCompetencies === 0) return 0;
    return Math.round((masteredTopics.length / totalCompetencies) * 100);
  }, [totalCompetencies, masteredTopics]);

  const handleDownloadPlan = () => {
    if (!activeRole) return;
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = generatePersonalizedStudyPlanPdf(activeRole, masteredTopics);
      downloadPdfFile(pdfBytes, `${activeRole.slug}-personalized-study-plan.pdf`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadCompendium = () => {
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = generateMasterCompendiumPdf(ROLE_HANDBOOKS);
      downloadPdfFile(pdfBytes, 'studentsprep-12-it-roles-master-compendium.pdf');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // State A: Active Role with saved progress
  if (activeRole && totalCompetencies > 0) {
    const remainingCount = totalCompetencies - masteredTopics.length;

    return (
      <Card className="border border-border bg-surface shadow-xs overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-900 px-2.5 py-0.5 rounded border border-primary-200">
                Active Career Track
              </span>
              <span className="text-xs text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
                {activeRole.category}
              </span>
            </div>
            <div className="text-xs text-text-muted">
              <span>Target Level: {activeRole.targetLevel}</span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-primary-950">
              {activeRole.name} — Syllabus Mastery
            </h3>
            <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
              {activeRole.summary}
            </p>
          </div>

          {/* Progress Bar & HUD */}
          <div className="p-3.5 bg-surface-muted rounded-xl border border-border/70 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text">
                {masteredTopics.length} of {totalCompetencies} Competencies Mastered
              </span>
              <span className="font-bold text-primary-800">
                {completionPercentage}% Complete
              </span>
            </div>

            <div className="w-full h-2 bg-border/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-700 transition-all duration-300 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-muted">
              <span>
                {remainingCount > 0
                  ? `${remainingCount} high-yield competencies remaining to cover`
                  : 'All syllabus competencies mastered! Ready for senior screening.'}
              </span>
              <span className="font-medium">
                ~{activeRole.pageEstimate} Page Handbook
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <div className="flex items-center gap-2">
              <Link href={`/roles/handbooks/${activeRole.slug}` as Route}>
                <Button variant="primary" size="sm" className="text-xs font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Resume Handbook Reader</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadPlan}
                disabled={isGeneratingPdf}
                className="text-xs flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-primary-600" />
                <span>{isGeneratingPdf ? 'Generating...' : 'Export Study Plan (PDF)'}</span>
              </Button>
            </div>

            <Link href={"/roles/handbooks" as Route}>
              <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5">
                <Library className="w-3.5 h-3.5" />
                <span>All 12 Handbooks</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // State B: Default Showcase Card
  return (
    <Card className="border border-border bg-surface shadow-xs overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-accent-50 text-accent-900 px-2.5 py-0.5 rounded border border-accent-200">
              Technical Career Resources
            </span>
            <span className="text-xs text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
              12 IT Engineering Roles
            </span>
          </div>
          <span className="text-xs text-text-muted">Vector PDF 1.4 Handbooks</span>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-primary-950">
            IT Roles Engineering Handbooks &amp; Syllabi Portal
          </h3>
          <p className="text-xs text-text-muted leading-relaxed max-w-3xl">
            Prepare for technical campus placements and senior engineering screenings with publication-grade handbooks. Each role includes executive mission profiles, multi-tier evaluated syllabi with exam weights, scenario screening questions with interviewer counter-probes, recruiter traps, and production invariants.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Link href={"/roles/handbooks" as Route}>
              <Button variant="primary" size="sm" className="text-xs font-semibold flex items-center gap-1.5">
                <Library className="w-3.5 h-3.5" />
                <span>Browse All 12 Handbooks</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadCompendium}
              disabled={isGeneratingPdf}
              className="text-xs flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Compiling...' : 'Download Master Compendium (PDF)'}</span>
            </Button>
          </div>

          <span className="text-[11px] text-text-muted">
            100% Free • Offline Vector PDF Downloads
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
