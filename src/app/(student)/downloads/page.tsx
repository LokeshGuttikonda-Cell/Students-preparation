'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { ROLE_HANDBOOKS, type RoleHandbook } from '../../../lib/role-handbooks-data';
import { DOC_TRACKS, type DocTrack } from '../../../lib/docs-catalog';
import {
  generateMasterCompendiumPdf,
  generateRoleHandbookPdf,
  generatePersonalizedStudyPlanPdf,
  generateRoleHandbookMarkdown,
  downloadPdfFile,
} from '../../../lib/role-handbook-pdf';
import {
  generateCompleteEngineeringDocsPdf,
  generateTrackHandbookPdf,
} from '../../../lib/docs-pdf';
import { trackPdfDownload } from '../../../lib/telemetry-client';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { BookOpen, FileDown, CheckCircle2, Loader2, GraduationCap, Search, FileText, FileCode, ShieldCheck } from 'lucide-react';

type PublicationType = 'ALL' | 'COMPENDIUMS' | 'ROLES' | 'TRACKS' | 'STUDY_PLANS';

interface PublicationItem {
  id: string;
  type: 'COMPENDIUM' | 'ROLE' | 'TRACK';
  title: string;
  subtitle: string;
  category: string;
  levelOrTag: string;
  estimatedPages: string;
  topicsCount: number;
  highlightMeta: string[];
  roleRef?: RoleHandbook;
  trackRef?: DocTrack;
}

const DISCIPLINE_FILTERS = [
  'All Disciplines',
  'Cloud & Infrastructure',
  'Backend & Systems',
  'Full-Stack & Web',
  'Data & AI',
  'Security & QA',
  'Enterprise Systems',
  'Core Computer Science',
] as const;

export default function DownloadsCenterPage() {
  const [activeType, setActiveType] = useState<PublicationType>('ALL');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All Disciplines');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Personalized Study Plan Interactive Selector
  const [studyPlanRoleSlug, setStudyPlanRoleSlug] = useState<string>(ROLE_HANDBOOKS[0].slug);
  const [masteredTopicsCount, setMasteredTopicsCount] = useState<number>(0);
  const [masteredTopicsList, setMasteredTopicsList] = useState<string[]>([]);

  // Update mastered topics count whenever selected role changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`studentsprep_handbook_progress_${studyPlanRoleSlug}`);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setMasteredTopicsList(parsed);
        setMasteredTopicsCount(parsed.length);
      } else {
        setMasteredTopicsList([]);
        setMasteredTopicsCount(0);
      }
    } catch {
      setMasteredTopicsList([]);
      setMasteredTopicsCount(0);
    }
  }, [studyPlanRoleSlug]);

  const selectedStudyPlanRole = useMemo(() => {
    return ROLE_HANDBOOKS.find((r) => r.slug === studyPlanRoleSlug) || ROLE_HANDBOOKS[0];
  }, [studyPlanRoleSlug]);

  const totalSelectedStudyPlanTopics = useMemo(() => {
    return selectedStudyPlanRole.syllabus.reduce((acc, tier) => acc + tier.competencies.length, 0);
  }, [selectedStudyPlanRole]);

  // Unified list of all downloadable publications
  const allPublications = useMemo<PublicationItem[]>(() => {
    const list: PublicationItem[] = [];

    // 1. Master Compendiums
    list.push({
      id: 'master-it-roles-compendium',
      type: 'COMPENDIUM',
      title: '12 IT Roles Master Engineering Handbook & Curriculum Compendium',
      subtitle:
        'Comprehensive compendium containing all 12 IT roles, executive profiles, career ladders, multi-tier syllabi, screening questions, recruiter traps, and production invariants.',
      category: 'Enterprise Publications',
      levelOrTag: '12 Roles (L1 to L4+)',
      estimatedPages: '75+ Pages',
      topicsCount: ROLE_HANDBOOKS.reduce(
        (acc, r) => acc + r.syllabus.reduce((sa, t) => sa + t.competencies.length, 0),
        0,
      ),
      highlightMeta: [
        '12 IT Engineering Handbooks',
        'Multi-Tier Evaluated Syllabi',
        'Technical Counter-Probes & Pitfalls',
        '100% Vector PDF 1.4',
      ],
    });

    list.push({
      id: 'master-cs-compendium',
      type: 'COMPENDIUM',
      title: 'Master Computer Science & Software Engineering Compendium',
      subtitle:
        'Consolidated 13-track engineering textbook spanning modern system design, distributed consensus, operating systems, compilers, web performance, and core languages.',
      category: 'Core Computer Science',
      levelOrTag: '13 Specialized Tracks',
      estimatedPages: '100+ Pages',
      topicsCount: DOC_TRACKS.reduce((acc, t) => acc + t.topicsCount, 0),
      highlightMeta: [
        '13 Specialized Tracks',
        '80 Deep-Dive Chapters',
        '96 Uniform Evaluated MCQs',
        'Production Invariants & Traps',
      ],
    });

    // 2. Individual IT Role Handbooks
    for (const role of ROLE_HANDBOOKS) {
      const topicCount = role.syllabus.reduce((acc, t) => acc + t.competencies.length, 0);
      list.push({
        id: `role-${role.slug}`,
        type: 'ROLE',
        title: `${role.name} -- Engineering Handbook`,
        subtitle: role.summary,
        category: role.category,
        levelOrTag: role.targetLevel,
        estimatedPages: '12-16 Pages',
        topicsCount: topicCount,
        highlightMeta: [
          `${role.syllabus.length} Syllabus Tiers`,
          `${role.questions.length} Interview Questions`,
          `${role.interviewTraps.length} Recruiter Traps`,
          `Est. Study: ${role.estimatedReadTime}`,
        ],
        roleRef: role,
      });
    }

    // 3. Individual Technical Tracks
    for (const track of DOC_TRACKS) {
      list.push({
        id: `track-${track.id}`,
        type: 'TRACK',
        title: `${track.title} Engineering Handbook`,
        subtitle: track.tagline,
        category:
          track.category === 'PROGRAMMING_LANGUAGE' ? 'Backend & Systems' : 'Core Computer Science',
        levelOrTag: `${track.modules.length} Modules`,
        estimatedPages: '8-14 Pages',
        topicsCount: track.topicsCount,
        highlightMeta: [
          `${track.modules.length} Specialized Modules`,
          `${track.topicsCount} Evaluated Topics`,
          'Interactive Vector Diagrams',
          'Exam Review Invariants',
        ],
        trackRef: track,
      });
    }

    return list;
  }, []);

  // Filter publications based on search query, type, and discipline
  const filteredPublications = useMemo(() => {
    return allPublications.filter((item) => {
      // Type filter
      if (activeType === 'COMPENDIUMS' && item.type !== 'COMPENDIUM') return false;
      if (activeType === 'ROLES' && item.type !== 'ROLE') return false;
      if (activeType === 'TRACKS' && item.type !== 'TRACK') return false;

      // Discipline filter
      if (selectedDiscipline !== 'All Disciplines') {
        const itemCategory = item.category.toLowerCase();
        const filterCategory = selectedDiscipline.toLowerCase();
        if (itemCategory !== filterCategory) return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSub = item.subtitle.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesMeta = item.highlightMeta.some((m) => m.toLowerCase().includes(q));
        const matchesTools =
          item.roleRef?.information.keyToolsAndTechnologies.some((t) =>
            t.toLowerCase().includes(q),
          ) ?? false;

        return matchesTitle || matchesSub || matchesCategory || matchesMeta || matchesTools;
      }

      return true;
    });
  }, [allPublications, activeType, selectedDiscipline, searchQuery]);

  // Download handlers
  const handleDownloadMasterRoles = () => {
    setDownloadingId('master-it-roles-compendium');
    try {
      trackPdfDownload('Master IT Roles Compendium (All 12 Tracks)', 'COMPENDIUM');
      const pdfBytes = generateMasterCompendiumPdf(ROLE_HANDBOOKS);
      downloadPdfFile(pdfBytes, 'studentsprep-all-12-roles-master-compendium.pdf');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadMasterCS = () => {
    setDownloadingId('master-cs-compendium');
    try {
      trackPdfDownload('Master Computer Science Compendium', 'COMPENDIUM');
      const pdfBytes = generateCompleteEngineeringDocsPdf(DOC_TRACKS);
      downloadPdfFile(pdfBytes, 'studentsprep-master-engineering-compendium.pdf');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadRole = (role: RoleHandbook) => {
    setDownloadingId(`role-${role.slug}`);
    try {
      trackPdfDownload(role.name, 'ROLE_HANDBOOK');
      const pdfBytes = generateRoleHandbookPdf(role);
      downloadPdfFile(pdfBytes, `${role.slug}-engineering-handbook.pdf`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadTrack = (track: DocTrack) => {
    setDownloadingId(`track-${track.id}`);
    try {
      trackPdfDownload(`${track.title} Engineering Handbook`, 'TRACK_HANDBOOK');
      const pdfBytes = generateTrackHandbookPdf(track);
      downloadPdfFile(pdfBytes, `${track.id}-engineering-handbook.pdf`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadPersonalizedPlan = () => {
    setDownloadingId('personalized-study-plan');
    try {
      trackPdfDownload(`${selectedStudyPlanRole.name} Personalized Study Plan`, 'STUDY_PLAN');
      const pdfBytes = generatePersonalizedStudyPlanPdf(
        selectedStudyPlanRole,
        masteredTopicsList,
      );
      downloadPdfFile(
        pdfBytes,
        `${selectedStudyPlanRole.slug}-personalized-study-plan.pdf`,
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportMarkdown = (role: RoleHandbook) => {
    const md = generateRoleHandbookMarkdown(role);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${role.slug}-syllabus.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/dashboard" className="hover:text-primary-700 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/roles/handbooks" className="hover:text-primary-700 transition-colors">
            Handbooks
          </Link>
          <span>/</span>
          <span className="text-text font-medium">Official PDF Download Center</span>
        </div>

        {/* Hero Section */}
        <div className="border-b border-border pb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-900 px-3 py-1 rounded border border-primary-200 inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary-700" />
              <span>Official Publishing House</span>
            </span>
            <span className="text-xs text-text-muted bg-surface-muted px-2.5 py-1 rounded border border-border">
              Vector PDF 1.4 Engine
            </span>
            <span className="text-xs text-accent-700 bg-accent-50 px-2.5 py-1 rounded border border-accent-200 font-semibold">
              Zero Trademarks • 100% Technical Signal
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text">
              Curriculum PDF Download Center
            </h1>
            <p className="text-sm sm:text-base text-text-muted max-w-4xl leading-relaxed">
              Download complete, publication-grade engineering handbooks, multi-tier syllabi,
              architectural invariants, and interview counter-probes. Generated dynamically
              client-side in vector PDF 1.4 format for high-resolution offline reading and print.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-surface p-3 rounded-lg border border-border shadow-xs">
              <span className="text-xs text-text-muted block">IT Roles Compendium</span>
              <span className="text-lg font-bold text-primary-800">12 Role Handbooks</span>
            </div>
            <div className="bg-surface p-3 rounded-lg border border-border shadow-xs">
              <span className="text-xs text-text-muted block">CS Engineering Tracks</span>
              <span className="text-lg font-bold text-accent-800">13 Deep Tracks</span>
            </div>
            <div className="bg-surface p-3 rounded-lg border border-border shadow-xs">
              <span className="text-xs text-text-muted block">Curriculum Depth</span>
              <span className="text-lg font-bold text-text">80 Modules &amp; Chapters</span>
            </div>
            <div className="bg-surface p-3 rounded-lg border border-border shadow-xs">
              <span className="text-xs text-text-muted block">Exam Uniformity</span>
              <span className="text-lg font-bold text-secondary-800">96 Uniform MCQs</span>
            </div>
          </div>
        </div>

        {/* Featured Master Compendiums Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Master 12 IT Roles Compendium */}
          <Card className="border-2 border-primary-300 bg-gradient-to-br from-primary-50/70 via-surface to-surface overflow-hidden shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary-800 text-white px-2.5 py-0.5 rounded">
                      Consolidated Master Work
                    </span>
                    <span className="text-xs font-semibold text-primary-900">75+ Pages</span>
                  </div>
                  <h2 className="text-xl font-bold text-primary-950 pt-1">
                    All 12 IT Roles Master Engineering Compendium
                  </h2>
                </div>
                <BookOpen className="w-8 h-8 text-primary-700 shrink-0" aria-hidden="true" />
              </div>

              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                The definitive all-in-one IT curriculum volume. Contains complete executive missions,
                compensation ladders, multi-tier competency syllabi, technical interview counter-probes,
                and architectural recruiter traps for all 12 IT career disciplines.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-text-muted pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                  <span>12 Complete Handbooks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                  <span>36 Syllabus Tiers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                  <span>48+ Screening Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                  <span>Architectural Invariants</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  className="font-bold gap-2 text-xs shadow-sm"
                  onClick={handleDownloadMasterRoles}
                  disabled={downloadingId === 'master-it-roles-compendium'}
                >
                  {downloadingId === 'master-it-roles-compendium' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" />
                      <span>Compiling Vector PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 mr-1.5" />
                      <span>Download 12 Roles Compendium (PDF)</span>
                    </>
                  )}
                </Button>
                <Link href={'/roles/handbooks' as Route}>
                  <Button variant="secondary" size="md" className="text-xs font-medium">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5 text-primary-700" />
                    <span>Browse Handbooks Hub</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Master CS & Engineering Compendium */}
          <Card className="border-2 border-accent-300 bg-gradient-to-br from-accent-50/70 via-surface to-surface overflow-hidden shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-accent-800 text-white px-2.5 py-0.5 rounded">
                      Complete Textbook Edition
                    </span>
                    <span className="text-xs font-semibold text-accent-900">100+ Pages</span>
                  </div>
                  <h2 className="text-xl font-bold text-accent-950 pt-1">
                    Master Computer Science &amp; Engineering Compendium
                  </h2>
                </div>
                <BookOpen className="w-8 h-8 text-accent-700 shrink-0" aria-hidden="true" />
              </div>

              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Textbook-grade reference manual covering all 13 specialized computer science tracks.
                Spans distributed consensus, Linux virtual memory, compiler internals, system design,
                and probabilistic storage data structures with 96 uniform MCQs.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-text-muted pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-700 shrink-0" />
                  <span>13 Specialized Tracks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-700 shrink-0" />
                  <span>80 Deep-Dive Chapters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-700 shrink-0" />
                  <span>96 Uniform MCQs (25.00%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-700 shrink-0" />
                  <span>Verified Vector Diagrams</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-accent-800 hover:bg-accent-900 text-white font-bold gap-2 text-xs shadow-sm"
                  onClick={handleDownloadMasterCS}
                  disabled={downloadingId === 'master-cs-compendium'}
                >
                  {downloadingId === 'master-cs-compendium' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white mr-1.5" />
                      <span>Compiling Vector PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 mr-1.5" />
                      <span>Download CS Master Compendium (PDF)</span>
                    </>
                  )}
                </Button>
                <Link href={'/docs' as Route}>
                  <Button variant="secondary" size="md" className="text-xs font-medium">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5 text-accent-700" />
                    <span>Open Documentation Hub</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personalized Candidate Study Plan Generator Widget */}
        <Card className="border border-border bg-surface-muted/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary-800 bg-secondary-50 px-2.5 py-0.5 rounded border border-secondary-200">
                    Candidate Customization Engine
                  </span>
                  <span className="text-xs text-text-muted">Dynamic Gap Analysis</span>
                </div>
                <h3 className="text-lg font-bold text-text">
                  Generate Your Personalized Role Study Plan (PDF)
                </h3>
                <p className="text-xs sm:text-sm text-text-muted">
                  Stamps your live checklist progress, highlights unmastered competencies sorted by
                  exam weight, and estimates remaining preparation time.
                </p>
              </div>

              {/* Role Selector & Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <select
                  value={studyPlanRoleSlug}
                  onChange={(e) => setStudyPlanRoleSlug(e.target.value)}
                  className="text-xs font-medium bg-surface text-text border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                  aria-label="Select role for personalized study plan"
                >
                  {ROLE_HANDBOOKS.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name} ({r.category})
                    </option>
                  ))}
                </select>

                <Button
                  variant="secondary"
                  size="md"
                  className="font-bold text-xs gap-2 shrink-0"
                  onClick={handleDownloadPersonalizedPlan}
                  disabled={downloadingId === 'personalized-study-plan'}
                >
                  {downloadingId === 'personalized-study-plan' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-primary-700" />
                      <span>Export Study Plan (PDF)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Live Progress Preview Pill */}
            <div className="flex items-center gap-3 bg-surface p-3 rounded-md border border-border text-xs">
              <span className="text-text-muted">
                Candidate Progress for <strong>{selectedStudyPlanRole.name}</strong>:
              </span>
              <span className="font-bold text-primary-800">
                {masteredTopicsCount} of {totalSelectedStudyPlanTopics} Competencies Mastered (
                {totalSelectedStudyPlanTopics > 0
                  ? Math.round((masteredTopicsCount / totalSelectedStudyPlanTopics) * 100)
                  : 0}
                %)
              </span>
              <span className="text-text-muted hidden sm:inline">
                • {totalSelectedStudyPlanTopics - masteredTopicsCount} Pending Targets
              </span>
              <Link
                href={`/roles/handbooks/${selectedStudyPlanRole.slug}` as Route}
                className="ml-auto text-primary-700 hover:underline font-semibold"
              >
                Track in Reader →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Search, Discipline & Publication Type Filtering Toolbar */}
        <div className="space-y-4 pt-4">
          {/* Keyword Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search publications by title, role, track, tools (e.g., Rust, Distributed, Linux, Backend, Security)..."
              className="w-full px-4 py-3 pl-11 rounded-lg border border-border bg-surface text-text text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500 shadow-xs"
              aria-label="Search Publications"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text"
              >
                Clear
              </button>
            )}
          </div>

          {/* Publication Type Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            {(
              [
                { id: 'ALL', label: 'All Publications', count: allPublications.length },
                {
                  id: 'COMPENDIUMS',
                  label: 'Master Compendiums',
                  count: 2,
                },
                {
                  id: 'ROLES',
                  label: 'IT Career Roles',
                  count: ROLE_HANDBOOKS.length,
                },
                {
                  id: 'TRACKS',
                  label: 'CS Engineering Tracks',
                  count: DOC_TRACKS.length,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeType === tab.id
                    ? 'bg-primary-900 text-white'
                    : 'bg-surface text-text-muted hover:text-text border border-border'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeType === tab.id ? 'bg-primary-700 text-white' : 'bg-neutral-100 text-text-muted'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Discipline Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-text-muted font-medium mr-1">Discipline:</span>
            {DISCIPLINE_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedDiscipline(cat)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  selectedDiscipline === cat
                    ? 'bg-primary-100 text-primary-900 font-bold border border-primary-200'
                    : 'text-text-muted hover:text-text bg-surface border border-border/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Publications Grid */}
        {/* Publications Grid */}
        {filteredPublications.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-xl border border-dashed border-border space-y-4">
            <FileText className="w-10 h-10 text-text-muted mx-auto" aria-hidden="true" />
            <h3 className="text-base font-bold text-text">No publications match your criteria</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Try adjusting your search query or reset the discipline and publication type filters.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs font-semibold"
              onClick={() => {
                setSearchQuery('');
                setActiveType('ALL');
                setSelectedDiscipline('All Disciplines');
              }}
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((item) => {
              const isDownloadingThis = downloadingId === item.id;

              return (
                <Card
                  key={item.id}
                  className="flex flex-col justify-between border border-border bg-surface hover:border-primary-300 transition-colors shadow-xs"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header Chips */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-text-muted px-2 py-0.5 rounded border border-border">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                        {item.estimatedPages}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-text leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Meta highlights */}
                    <div className="space-y-1 pt-1 border-t border-border/60">
                      {item.highlightMeta.slice(0, 3).map((meta, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] text-text-muted flex items-center gap-1.5"
                        >
                          <span className="text-primary-600 font-bold">•</span>
                          <span>{meta}</span>
                        </div>
                      ))}
                    </div>

                    {/* Key Tools / Technologies for Role */}
                    {item.roleRef && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.roleRef.information.keyToolsAndTechnologies
                          .slice(0, 4)
                          .map((tool, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-canvas text-text-muted px-1.5 py-0.5 rounded border border-border font-mono"
                            >
                              {tool}
                            </span>
                          ))}
                      </div>
                    )}
                  </CardContent>

                  {/* Card Actions Footer */}
                  <div className="p-5 pt-0 border-t border-border/60 flex items-center gap-2 mt-auto">
                    {/* PDF Download CTA */}
                    {item.type === 'COMPENDIUM' && item.id === 'master-it-roles-compendium' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full text-xs font-bold gap-1.5"
                        onClick={handleDownloadMasterRoles}
                        disabled={isDownloadingThis}
                      >
                        {isDownloadingThis ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            <span>Compiling...</span>
                          </>
                        ) : (
                          <>
                            <FileDown className="w-3.5 h-3.5 mr-1" />
                            <span>Download PDF</span>
                          </>
                        )}
                      </Button>
                    )}

                    {item.type === 'COMPENDIUM' && item.id === 'master-cs-compendium' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full text-xs font-bold gap-1.5 bg-accent-800 hover:bg-accent-900"
                        onClick={handleDownloadMasterCS}
                        disabled={isDownloadingThis}
                      >
                        {isDownloadingThis ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            <span>Compiling...</span>
                          </>
                        ) : (
                          <>
                            <FileDown className="w-3.5 h-3.5 mr-1" />
                            <span>Download PDF</span>
                          </>
                        )}
                      </Button>
                    )}

                    {item.type === 'ROLE' && item.roleRef && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 text-xs font-bold gap-1"
                          onClick={() => handleDownloadRole(item.roleRef!)}
                          disabled={isDownloadingThis}
                        >
                          {isDownloadingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <FileDown className="w-3.5 h-3.5 mr-1" />
                              <span>PDF</span>
                            </>
                          )}
                        </Button>
                        <Link
                          href={`/roles/handbooks/${item.roleRef.slug}` as Route}
                          className="flex-1"
                        >
                          <Button variant="secondary" size="sm" className="w-full text-xs font-medium">
                            <BookOpen className="w-3.5 h-3.5 mr-1 text-primary-700" />
                            <span>Read</span>
                          </Button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleExportMarkdown(item.roleRef!)}
                          title="Export Markdown syllabus"
                          className="p-1.5 text-xs text-text-muted hover:text-text rounded border border-border hover:bg-neutral-100 flex items-center justify-center"
                          aria-label="Export Markdown"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {item.type === 'TRACK' && item.trackRef && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 text-xs font-bold gap-1"
                          onClick={() => handleDownloadTrack(item.trackRef!)}
                          disabled={isDownloadingThis}
                        >
                          {isDownloadingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <FileDown className="w-3.5 h-3.5 mr-1" />
                              <span>PDF</span>
                            </>
                          )}
                        </Button>
                        <Link
                          href={`/docs/${item.trackRef.slug}` as Route}
                          className="flex-1"
                        >
                          <Button variant="secondary" size="sm" className="w-full text-xs font-medium">
                            <BookOpen className="w-3.5 h-3.5 mr-1 text-accent-700" />
                            <span>Read</span>
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Publication Invariants & Content Policy Card */}
        <div className="bg-surface p-6 rounded-xl border border-border text-xs text-text-muted space-y-2">
          <div className="flex items-center gap-2 text-text font-bold">
            <ShieldCheck className="w-4 h-4 text-primary-700" />
            <span>Publishing Standards &amp; Content Policy Compliance</span>
          </div>
          <p className="leading-relaxed">
            All curriculum publications, handbooks, and compendiums generated by StudentsPrep are
            produced in pure vector PDF 1.4 format using client-side TypeScript engines. All content
            strictly adheres to our technical content policy: zero proprietary vendor advertising,
            zero product placements, and 100% architectural engineering signal.
          </p>
        </div>
      </div>
    </div>
  );
}
