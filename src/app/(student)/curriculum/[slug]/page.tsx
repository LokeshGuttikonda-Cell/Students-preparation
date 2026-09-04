'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import {
  getCurriculumArticle,
  type CurriculumArticle,
} from '../../../../lib/curriculum-client';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

export default function CurriculumArticleDetailPage() {
  const routeParams = useParams<{ slug: string }>();
  const slug = routeParams?.slug || '';
  const [article, setArticle] = useState<CurriculumArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const art = await getCurriculumArticle(slug);
        setArticle(art);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // Answer locked
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    setShowExplanations((prev) => ({ ...prev, [questionId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-canvas py-16 flex flex-col items-center justify-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-700 border-t-transparent" />
        <p className="text-sm text-text-muted">Loading technical documentation...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-dvh bg-canvas py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">Guide Not Found</h1>
        <p className="text-sm text-text-muted">
          The requested technical documentation article could not be located.
        </p>
        <Link href={'/curriculum' as Route}>
          <Button variant="primary">Return to Knowledge Hub</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href={'/curriculum' as Route} className="hover:text-primary-800 transition-colors">
            Knowledge Hub
          </Link>
          <span>/</span>
          <span className="font-semibold text-text">{article.domainName}</span>
          <span>/</span>
          <span className="text-text-subtle truncate max-w-xs">{article.title}</span>
        </div>

        {/* Header Title Section */}
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700 bg-accent-50 px-2.5 py-0.5 rounded border border-accent-200">
              {article.domainName}
            </span>
            <span className="text-xs text-text-muted">
              ⏱️ {article.readTimeMinutes} min deep read
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-50 text-primary-800 border border-primary-200">
              {article.level} Level
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-900 tracking-tight leading-snug">
            {article.title}
          </h1>

          <p className="text-sm text-text-muted leading-relaxed">
            {article.summary}
          </p>

          {/* Prerequisites & Key Concepts */}
          <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-text block mb-1">Prerequisites:</span>
              <ul className="list-disc list-inside text-text-muted space-y-0.5">
                {article.prerequisites.map((prereq, idx) => (
                  <li key={idx}>{prereq}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold text-text block mb-1">Core Concepts:</span>
              <div className="flex flex-wrap gap-1">
                {article.keyConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="bg-canvas px-2 py-0.5 rounded text-text-subtle border border-border"
                  >
                    #{concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-primary-900">1. Executive Overview</h2>
          <div className="bg-surface p-6 rounded-xl border border-border text-sm text-text leading-relaxed whitespace-pre-line">
            {article.overview}
          </div>
        </div>

        {/* Theory & Implementation Sections */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-primary-900">2. Technical Invariants &amp; Architectural Theory</h2>
          {article.theorySections.map((sec, idx) => (
            <div key={idx} className="bg-surface p-6 rounded-xl border border-border space-y-4">
              <h3 className="text-base font-bold text-text">{sec.heading}</h3>
              <p className="text-sm text-text leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>

              {sec.codeSnippet && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-text-muted px-1">
                    <span className="font-mono uppercase font-bold text-primary-800">
                      {sec.codeSnippet.language}
                    </span>
                    <span>Zero External Dependencies</span>
                  </div>
                  <pre className="p-4 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800">
                    <code>{sec.codeSnippet.code}</code>
                  </pre>
                  <p className="text-xs text-text-muted italic">
                    💡 {sec.codeSnippet.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Production Traps & Anti-Patterns */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary-900">
            3. Production Anti-Patterns &amp; Recruiter Traps
          </h2>
          <div className="space-y-3">
            {article.trapsAndAntiPatterns.map((trap, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-950 space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <span>⚠️</span>
                  <span>Trap: {trap.trap}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Misconception:</strong> {trap.misconception}
                </p>
                <p className="text-xs text-emerald-900 bg-emerald-100/70 p-2.5 rounded border border-emerald-200 font-medium">
                  <strong>Architectural Remedy:</strong> {trap.correction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Practice MCQs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary-900">
              4. Socratic Concept Verification (MCQs)
            </h2>
            <span className="text-xs text-text-muted">
              {article.practiceMcqs.length} Calibrated Questions
            </span>
          </div>

          <div className="space-y-4">
            {article.practiceMcqs.map((mcq, qIdx) => {
              const selectedOpt = selectedAnswers[mcq.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === mcq.correctIndex;

              return (
                <Card key={mcq.id} className="border-border bg-surface">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-800 shrink-0">
                        Q{qIdx + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-text leading-relaxed">
                        {mcq.question}
                      </h3>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2">
                      {mcq.options.map((opt, optIdx) => {
                        let optStyle =
                          'border-border hover:bg-surface-muted cursor-pointer text-text';
                        if (isAnswered) {
                          if (optIdx === mcq.correctIndex) {
                            optStyle =
                              'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                          } else if (optIdx === selectedOpt) {
                            optStyle =
                              'border-error-500 bg-error-50 text-error-950';
                          } else {
                            optStyle = 'border-border/50 opacity-60 text-text-muted';
                          }
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(mcq.id, optIdx)}
                            className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${optStyle}`}
                          >
                            <span>
                              <strong className="mr-2 font-mono">
                                {String.fromCharCode(65 + optIdx)})
                              </strong>
                              {opt}
                            </span>
                            {isAnswered && optIdx === mcq.correctIndex && (
                              <span className="text-emerald-700 font-bold">✓ Correct</span>
                            )}
                            {isAnswered &&
                              optIdx === selectedOpt &&
                              !isCorrect && (
                                <span className="text-error-700 font-bold">✗ Incorrect</span>
                              )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showExplanations[mcq.id] && (
                      <div
                        className={`p-4 rounded-lg text-xs leading-relaxed border ${
                          isCorrect
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-neutral-50 border-border text-text'
                        }`}
                      >
                        <strong className="block font-bold mb-1">
                          {isCorrect ? '🎉 Correct Rationale:' : '💡 Detailed Rationale:'}
                        </strong>
                        {mcq.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Next Actions & Sandbox Linking */}
        <div className="bg-gradient-to-br from-primary-900 to-primary-950 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Ready to apply these concepts in code?</h3>
            <p className="text-xs text-primary-200">
              Run interactive unit tests, execute queries in the browser SQLite sandbox, and test edge cases.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/sandbox">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-primary-900 hover:bg-neutral-100 font-bold"
              >
                Launch Code &amp; SQL Lab &rarr;
              </Button>
            </Link>
            <Link href="/practice">
              <Button
                variant="primary"
                size="sm"
                className="bg-accent-600 hover:bg-accent-700 text-white font-bold border-none"
              >
                Practice Topic MCQs &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <Link href={'/curriculum' as Route} className="hover:text-primary-800 transition-colors">
            &larr; Back to Knowledge Hub
          </Link>
          <Link href="/courses" className="text-primary-800 font-semibold hover:underline">
            Explore Full Structured Courses &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
