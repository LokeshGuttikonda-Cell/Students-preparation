'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import { getDocTrack, type DocTrack } from '../../../../lib/docs-client';
import { generateTrackHandbookPdf, downloadPdfFile } from '../../../../lib/docs-pdf';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { TechIcon } from '../../../../components/ui/TechIcon';
import { ArrowRight, GraduationCap, FileDown, Loader2, Award } from 'lucide-react';
import { TrackMasteryModal } from '../../../../components/docs/TrackMasteryModal';

export default function TrackSyllabusPage() {
  const routeParams = useParams<{ track: string }>();
  const trackSlug = routeParams?.track || '';
  const [track, setTrack] = useState<DocTrack | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [masteryData, setMasteryData] = useState<{ score: number; completedAt: string } | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const refreshMastery = useCallback(() => {
    try {
      const key = 'studentsprep_mastered_tracks';
      const existing = localStorage.getItem(key);
      if (existing) {
        const list: Array<{ trackSlug: string; score: number; completedAt: string }> = JSON.parse(existing);
        const found = list.find((item) => item.trackSlug === trackSlug);
        if (found) setMasteryData(found);
      }
    } catch {
      // ignore
    }
  }, [trackSlug]);

  useEffect(() => {
    refreshMastery();
  }, [refreshMastery]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getDocTrack(trackSlug);
        setTrack(data || null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trackSlug]);

  const handleDownloadPdf = () => {
    if (!track) return;
    setIsDownloadingPdf(true);
    try {
      const pdfBytes = generateTrackHandbookPdf(track);
      downloadPdfFile(pdfBytes, `${track.slug}-engineering-handbook.pdf`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-canvas py-16 flex flex-col items-center justify-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-700 border-t-transparent" />
        <p className="text-sm text-text-muted">Loading track syllabus...</p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-dvh bg-canvas py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">Track Not Found</h1>
        <p className="text-sm text-text-muted">
          The requested documentation track &ldquo;{trackSlug}&rdquo; could not be found.
        </p>
        <Link href={'/docs' as Route}>
          <Button variant="primary">Return to All Tutorials</Button>
        </Link>
      </div>
    );
  }

  const firstTopic = track.modules[0]?.topics[0];

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href={'/docs' as Route} className="hover:text-primary-800 transition-colors">
            Documentation Hub
          </Link>
          <span>/</span>
          <span className="font-semibold text-text">{track.title}</span>
        </div>

        {/* Track Banner */}
        <div className="p-8 rounded-3xl bg-surface border border-border shadow-xs space-y-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center shadow-xs">
                <TechIcon name={track.slug} size={36} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                    {track.category === 'PROGRAMMING_LANGUAGE' ? 'Programming Language Track' : 'Computer Science Specialization'}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200">
                    {track.badge}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-primary-950 mt-1">
                  {track.title}
                </h1>
                <p className="text-sm font-semibold text-accent-800 mt-0.5">
                  {track.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {firstTopic && (
                <Link href={`/docs/${track.slug}/${firstTopic.slug}` as Route}>
                  <Button variant="primary" size="md" className="font-bold shadow-xs flex items-center gap-2">
                    <span>Start Tutorial</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsExamModalOpen(true)}
                className="font-bold shadow-xs text-xs flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-primary-700" />
                <span>{masteryData ? 'Retake Mastery Exam' : 'Take Track Mastery Exam'}</span>
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="font-bold shadow-xs text-xs flex items-center gap-2"
                aria-label={`Download PDF handbook for ${track.title}`}
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-700" />
                ) : (
                  <FileDown className="w-4 h-4 text-primary-700" />
                )}
                <span>{isDownloadingPdf ? 'Generating...' : 'Download Handbook (PDF)'}</span>
              </Button>
            </div>
          </div>

          {masteryData && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-green-50/90 border border-green-200 dark:bg-green-950/30 dark:border-green-800 text-green-900 dark:text-green-200 text-xs">
              <Award className="w-5 h-5 text-green-700 shrink-0" />
              <div>
                <strong className="font-bold block">Verified Track Mastery Achieved ({masteryData.score}%)</strong>
                <span className="text-green-800/80 dark:text-green-300/80 text-[11px]">
                  Completed on {new Date(masteryData.completedAt).toLocaleDateString()} • All core invariants verified
                </span>
              </div>
            </div>
          )}

          <p className="text-sm text-text-muted max-w-3xl leading-relaxed">
            {track.description}
          </p>

          <div className="pt-4 border-t border-border flex items-center gap-6 text-xs text-text-subtle">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-text">{track.modulesCount}</span>
              <span>Modules</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-text">{track.topicsCount}</span>
              <span>In-Depth Chapters</span>
            </div>
            <div className="flex items-center gap-1.5 text-accent-700 font-semibold">
              <span>✓ Verified Architectural Invariants</span>
            </div>
          </div>
        </div>

        {/* Modules & Topics Syllabus Breakdown */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-text">
            Complete Curriculum Syllabus &amp; Roadmap
          </h2>

          <div className="space-y-6">
            {track.modules.map((mod, modIdx) => (
              <Card key={mod.id} className="border-border bg-surface overflow-hidden shadow-xs">
                <div className="p-5 bg-surface-muted border-b border-border flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                      Module {modIdx + 1}
                    </span>
                    <h3 className="text-base font-bold text-text">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {mod.description}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-text-subtle">
                    {mod.topics.length} Topic{mod.topics.length > 1 ? 's' : ''}
                  </span>
                </div>

                <CardContent className="p-0 divide-y divide-border">
                  {mod.topics.map((topic, topicIdx) => (
                    <Link
                      key={topic.id}
                      href={`/docs/${track.slug}/${topic.slug}` as Route}
                      className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors group block"
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-text-subtle">
                            {modIdx + 1}.{topicIdx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-text group-hover:text-primary-800 transition-colors">
                            {topic.title}
                          </h4>
                        </div>
                        <p className="text-xs text-text-muted line-clamp-1 pl-6">
                          {topic.shortDescription}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-surface-muted text-text-muted border border-border">
                          {topic.difficulty}
                        </span>
                        <span className="text-xs font-mono text-text-subtle">
                          {topic.readTimeMinutes} min read
                        </span>
                        <span className="text-primary-700 font-bold group-hover:translate-x-1 transition-transform">
                          &rarr;
                        </span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Track Mastery Exam Modal */}
      <TrackMasteryModal
        track={track}
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        onMasteryAchieved={refreshMastery}
      />
    </div>
  );
}
