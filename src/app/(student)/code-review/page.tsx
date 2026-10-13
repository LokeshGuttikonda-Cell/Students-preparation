'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../components/ui/Card';
import {
  CURATED_PULL_REQUESTS,
  evaluateCodeReview,
  generateCodeReviewReportMarkdown,
  exportCodeReviewReportPdf,
  downloadFile,
  loadSavedCodeReviewState,
  saveCodeReviewRecord,
  type PullRequestItem,
  type UserInlineComment,
  type ReviewVerdict,
  type ReviewEvaluation,
  type FlawSeverity,
  type FlawCategory,
} from '../../../lib/code-review-client';

export default function CodeReviewPage() {
  const [selectedPrId, setSelectedPrId] = useState<string>(
    CURATED_PULL_REQUESTS[0].id,
  );
  const [comments, setComments] = useState<UserInlineComment[]>([]);
  const [verdict, setVerdict] = useState<ReviewVerdict>('REQUEST_CHANGES');
  const [summaryText, setSummaryText] = useState<string>('');
  const [evaluation, setEvaluation] = useState<ReviewEvaluation | null>(null);

  // Active inline comment editor state
  const [activeCommentLine, setActiveCommentLine] = useState<{
    fileIndex: number;
    lineNumber: number;
  } | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentSeverity, setNewCommentSeverity] =
    useState<FlawSeverity>('CRITICAL');
  const [newCommentCategory, setNewCommentCategory] =
    useState<FlawCategory>('CONCURRENCY');

  // Progressive Socratic hints
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(-1);
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);

  // Current PR object
  const currentPr = useMemo<PullRequestItem>(() => {
    return (
      CURATED_PULL_REQUESTS.find((p) => p.id === selectedPrId) ||
      CURATED_PULL_REQUESTS[0]
    );
  }, [selectedPrId]);

  // Load saved state on mount or PR switch
  useEffect(() => {
    const savedState = loadSavedCodeReviewState();
    const prRecord = savedState[currentPr.id];
    if (prRecord) {
      setComments(prRecord.comments || []);
      setVerdict(prRecord.verdict || 'REQUEST_CHANGES');
      setSummaryText(prRecord.summaryText || '');
      setEvaluation(prRecord.evaluation || null);
    } else {
      setComments([]);
      setVerdict('REQUEST_CHANGES');
      setSummaryText('');
      setEvaluation(null);
    }
    setActiveCommentLine(null);
    setRevealedHintIndex(-1);
    setShowScoreModal(false);
  }, [currentPr.id]);

  // Handle adding an inline comment
  const handleSaveInlineComment = () => {
    if (!activeCommentLine || !newCommentText.trim()) return;

    const newComment: UserInlineComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fileIndex: activeCommentLine.fileIndex,
      lineNumber: activeCommentLine.lineNumber,
      commentText: newCommentText.trim(),
      severity: newCommentSeverity,
      category: newCommentCategory,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);

    // Persist
    saveCodeReviewRecord({
      prId: currentPr.id,
      comments: updatedComments,
      verdict,
      summaryText,
      evaluation,
      lastUpdated: new Date().toISOString(),
    });

    setActiveCommentLine(null);
    setNewCommentText('');
  };

  // Handle deleting an inline comment
  const handleDeleteInlineComment = (commentId: string) => {
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);

    saveCodeReviewRecord({
      prId: currentPr.id,
      comments: updated,
      verdict,
      summaryText,
      evaluation,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Handle submitting review for calibration
  const handleSubmitReview = () => {
    const evalResult = evaluateCodeReview(currentPr, comments, verdict);
    setEvaluation(evalResult);
    setShowScoreModal(true);

    saveCodeReviewRecord({
      prId: currentPr.id,
      comments,
      verdict,
      summaryText,
      evaluation: evalResult,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Exporters
  const handleExportMarkdown = () => {
    if (!evaluation) return;
    const md = generateCodeReviewReportMarkdown(
      currentPr,
      evaluation,
      comments,
      summaryText,
    );
    downloadFile(`code-review-${currentPr.id}-report.md`, md, 'text/markdown');
  };

  const handleExportPdf = () => {
    if (!evaluation) return;
    exportCodeReviewReportPdf(currentPr, evaluation, comments, summaryText);
  };

  // Difficulty badge variant mapping
  const getDifficultyBadgeVariant = (diff: string) => {
    switch (diff) {
      case 'Expert':
        return 'error';
      case 'Advanced':
        return 'primary';
      default:
        return 'warning';
    }
  };

  // Severity badge variant mapping
  const getSeverityBadgeVariant = (sev: FlawSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'error';
      case 'MAJOR':
        return 'warning';
      case 'MINOR':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & PR Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Code Review & PR Anti-Pattern Lab
            </h1>
            <Badge variant="primary">Industrial Mode</Badge>
            <Badge variant="neutral">$0.00 Local Compute</Badge>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Review realistic pull requests from tier-1 engineering loops. Detect
            vulnerabilities, race conditions, and performance bottlenecks.
          </p>
        </div>

        {/* PR Selection Dropdown */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="pr-select"
            className="text-xs font-semibold text-text-muted uppercase tracking-wider"
          >
            Pull Request:
          </label>
          <select
            id="pr-select"
            value={selectedPrId}
            onChange={(e) => setSelectedPrId(e.target.value)}
            className="px-3 py-1.5 text-sm font-medium bg-surface border border-border rounded-md shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-text"
          >
            {CURATED_PULL_REQUESTS.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.language} | {pr.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PR Metadata Banner */}
      <Card className="bg-surface border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-text-muted">
                  #{currentPr.id}
                </span>
                <h2 className="text-lg font-bold text-text">{currentPr.title}</h2>
                <Badge variant={getDifficultyBadgeVariant(currentPr.difficulty)}>
                  {currentPr.difficulty}
                </Badge>
                <Badge variant="neutral">{currentPr.language}</Badge>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {currentPr.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                <span>
                  <strong>Target Service:</strong> {currentPr.targetService}
                </span>
                <span>
                  <strong>Author:</strong> {currentPr.author} ({currentPr.authorRole})
                </span>
                <span>
                  <strong>Branch:</strong>{' '}
                  <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800">
                    {currentPr.branch}
                  </code>
                </span>
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <div className="px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200 text-center">
                <span className="text-[10px] text-text-muted block uppercase font-bold">
                  Files
                </span>
                <span className="text-sm font-bold text-text">
                  {currentPr.files.length}
                </span>
              </div>
              <div className="px-3 py-2 bg-emerald-50 rounded-md border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-700 block uppercase font-bold">
                  Lines Added
                </span>
                <span className="text-sm font-bold text-emerald-800">
                  +
                  {currentPr.files.reduce(
                    (acc, f) =>
                      acc + f.diffLines.filter((l) => l.type === 'ADD').length,
                    0,
                  )}
                </span>
              </div>
              <div className="px-3 py-2 bg-primary-50 rounded-md border border-primary-200 text-center">
                <span className="text-[10px] text-primary-700 block uppercase font-bold">
                  Your Comments
                </span>
                <span className="text-sm font-bold text-primary-800">
                  {comments.length}
                </span>
              </div>

              {evaluation && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowScoreModal(true)}
                  className="text-xs font-semibold"
                >
                  View Calibration ({evaluation.grade} - {evaluation.overallScore}%)
                </Button>
              )}
            </div>
          </div>

          {/* Socratic Hints Collapsible */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-warning-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Socratic Review Guidance (Tier-1 Hiring Bar)
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary-700"
                onClick={() =>
                  setRevealedHintIndex((prev) =>
                    prev < currentPr.hints.length - 1 ? prev + 1 : prev,
                  )
                }
                disabled={revealedHintIndex >= currentPr.hints.length - 1}
              >
                {revealedHintIndex < currentPr.hints.length - 1
                  ? `Reveal Hint (${revealedHintIndex + 2}/${currentPr.hints.length})`
                  : 'All Hints Revealed'}
              </Button>
            </div>

            {revealedHintIndex >= 0 && (
              <div className="mt-2 space-y-1.5">
                {currentPr.hints.slice(0, revealedHintIndex + 1).map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-warning-50/70 border border-warning-200 rounded-md text-xs text-warning-900 flex items-start gap-2"
                  >
                    <span className="font-bold text-warning-800">Hint {i + 1}:</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Diff Reviewer */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text">
            Changed Files & Line-by-Line Unified Diff
          </h2>
          <span className="text-xs text-text-muted">
            Tip: Click any line number to leave an inline code review comment.
          </span>
        </div>

        {currentPr.files.map((file, fileIdx) => (
          <div
            key={file.filename}
            className="border border-border rounded-lg overflow-hidden bg-surface shadow-xs"
          >
            {/* Diff File Header */}
            <div className="bg-neutral-100 px-4 py-2.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-neutral-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-mono text-xs font-bold text-text">
                  {file.filename}
                </span>
              </div>
              <span className="text-xs text-text-muted">
                {file.diffLines.length} lines in view
              </span>
            </div>

            {/* Diff Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-mono text-xs">
                <tbody>
                  {file.diffLines.map((line, lineIdx) => {
                    const lineComments = comments.filter(
                      (c) =>
                        c.fileIndex === fileIdx &&
                        c.lineNumber === (line.newLineNumber || line.oldLineNumber),
                    );
                    const isFormActive =
                      activeCommentLine?.fileIndex === fileIdx &&
                      activeCommentLine?.lineNumber ===
                        (line.newLineNumber || line.oldLineNumber);

                    let rowBg = 'hover:bg-neutral-50';
                    let symbol = ' ';
                    if (line.type === 'ADD') {
                      rowBg = 'bg-emerald-50/60 hover:bg-emerald-50 text-emerald-950';
                      symbol = '+';
                    } else if (line.type === 'DEL') {
                      rowBg = 'bg-rose-50/60 hover:bg-rose-50 text-rose-950';
                      symbol = '-';
                    }

                    const targetLineNum = line.newLineNumber || line.oldLineNumber || lineIdx + 1;

                    return (
                      <React.Fragment key={lineIdx}>
                        <tr className={`border-b border-neutral-100 ${rowBg} transition-colors group`}>
                          {/* Old line number */}
                          <td className="w-12 py-1 px-2 text-right text-[11px] text-neutral-400 select-none border-r border-neutral-200">
                            {line.oldLineNumber || ''}
                          </td>
                          {/* New line number (Clickable) */}
                          <td
                            onClick={() =>
                              setActiveCommentLine(
                                isFormActive
                                  ? null
                                  : {
                                      fileIndex: fileIdx,
                                      lineNumber: targetLineNum,
                                    },
                              )
                            }
                            title="Click to add review comment"
                            className="w-12 py-1 px-2 text-right text-[11px] text-neutral-400 select-none border-r border-neutral-200 cursor-pointer group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors"
                          >
                            <span className="group-hover:hidden">
                              {line.newLineNumber || ''}
                            </span>
                            <span className="hidden group-hover:inline font-bold">
                              +
                            </span>
                          </td>
                          {/* Diff Symbol */}
                          <td className="w-6 py-1 px-1 text-center font-bold text-neutral-500 select-none">
                            {symbol}
                          </td>
                          {/* Code Content */}
                          <td className="py-1 px-3 whitespace-pre overflow-x-auto text-text">
                            {line.content || ' '}
                          </td>
                        </tr>

                        {/* Inline Comments on this line */}
                        {lineComments.map((c) => (
                          <tr key={c.id} className="bg-primary-50/30 border-b border-primary-200">
                            <td colSpan={4} className="p-3 pl-20">
                              <div className="bg-surface border border-primary-200 rounded-md p-3 shadow-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={getSeverityBadgeVariant(c.severity)}>
                                      {c.severity}
                                    </Badge>
                                    <Badge variant="neutral">{c.category}</Badge>
                                    <span className="text-[11px] text-text-muted">
                                      Line {c.lineNumber}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-error-700 hover:bg-error-50 h-6 px-2"
                                    onClick={() => handleDeleteInlineComment(c.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                                <p className="text-xs text-text whitespace-pre-wrap">
                                  {c.commentText}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* Active Inline Comment Form */}
                        {isFormActive && (
                          <tr className="bg-primary-50/40 border-b border-primary-300">
                            <td colSpan={4} className="p-4 pl-20">
                              <div className="bg-surface border border-primary-300 rounded-lg p-4 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-text">
                                    Leave Review Comment on Line {targetLineNum}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    {/* Severity Dropdown */}
                                    <div className="flex items-center gap-1.5">
                                      <label className="text-[11px] font-semibold text-text-muted">
                                        Severity:
                                      </label>
                                      <select
                                        value={newCommentSeverity}
                                        onChange={(e) =>
                                          setNewCommentSeverity(
                                            e.target.value as FlawSeverity,
                                          )
                                        }
                                        className="text-xs px-2 py-1 bg-surface border border-border rounded text-text"
                                      >
                                        <option value="CRITICAL">
                                          CRITICAL (Blocker)
                                        </option>
                                        <option value="MAJOR">MAJOR (High)</option>
                                        <option value="MINOR">MINOR (Normal)</option>
                                        <option value="NITPICK">
                                          NITPICK (Cosmetic)
                                        </option>
                                      </select>
                                    </div>

                                    {/* Category Dropdown */}
                                    <div className="flex items-center gap-1.5">
                                      <label className="text-[11px] font-semibold text-text-muted">
                                        Category:
                                      </label>
                                      <select
                                        value={newCommentCategory}
                                        onChange={(e) =>
                                          setNewCommentCategory(
                                            e.target.value as FlawCategory,
                                          )
                                        }
                                        className="text-xs px-2 py-1 bg-surface border border-border rounded text-text"
                                      >
                                        <option value="SECURITY">SECURITY</option>
                                        <option value="CONCURRENCY">
                                          CONCURRENCY
                                        </option>
                                        <option value="PERFORMANCE">
                                          PERFORMANCE
                                        </option>
                                        <option value="CORRECTNESS">
                                          CORRECTNESS
                                        </option>
                                        <option value="MAINTAINABILITY">
                                          MAINTAINABILITY
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                <textarea
                                  value={newCommentText}
                                  onChange={(e) => setNewCommentText(e.target.value)}
                                  placeholder="Describe the issue, potential vulnerability, or recommended pattern..."
                                  rows={3}
                                  className="w-full text-xs font-sans p-2.5 border border-border rounded-md bg-canvas text-text focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                                />

                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setActiveCommentLine(null);
                                      setNewCommentText('');
                                    }}
                                    className="text-xs"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveInlineComment}
                                    disabled={!newCommentText.trim()}
                                    className="text-xs"
                                  >
                                    Add Comment
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Review Submission & Verdict Bar */}
      <Card className="bg-surface border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">Submit Review Verdict</CardTitle>
          <p className="text-xs text-text-muted mt-1">
            Select your review action and provide an executive summary for the PR author.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Executive Summary */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text">
              Reviewer Executive Summary:
            </label>
            <textarea
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="e.g. Please address the concurrency race condition in the idempotency check and mask card details before merging."
              rows={2}
              className="w-full text-xs p-2.5 border border-border rounded-md bg-canvas text-text focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
            />
          </div>

          {/* Verdict Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <label
              className={`p-4 border rounded-lg cursor-pointer flex flex-col justify-between transition-all ${
                verdict === 'REQUEST_CHANGES'
                  ? 'border-error-500 bg-error-50/40 ring-2 ring-error-400'
                  : 'border-border hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="review-verdict"
                  value="REQUEST_CHANGES"
                  checked={verdict === 'REQUEST_CHANGES'}
                  onChange={() => setVerdict('REQUEST_CHANGES')}
                  className="text-error-600 focus:ring-error-500"
                />
                <span className="text-sm font-bold text-error-800">
                  Request Changes
                </span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Block merge until critical security, correctness, or performance flaws are resolved.
              </p>
            </label>

            <label
              className={`p-4 border rounded-lg cursor-pointer flex flex-col justify-between transition-all ${
                verdict === 'COMMENT'
                  ? 'border-primary-500 bg-primary-50/40 ring-2 ring-primary-400'
                  : 'border-border hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="review-verdict"
                  value="COMMENT"
                  checked={verdict === 'COMMENT'}
                  onChange={() => setVerdict('COMMENT')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-bold text-primary-800">Comment</span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Submit general review feedback without an explicit approval or blocking stance.
              </p>
            </label>

            <label
              className={`p-4 border rounded-lg cursor-pointer flex flex-col justify-between transition-all ${
                verdict === 'APPROVE'
                  ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400'
                  : 'border-border hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="review-verdict"
                  value="APPROVE"
                  checked={verdict === 'APPROVE'}
                  onChange={() => setVerdict('APPROVE')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-emerald-800">
                  Approve (LGTM)
                </span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Authorize merge into production branch. Warning: Approving bugs results in immediate score deduction!
              </p>
            </label>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-text-muted">
              {comments.length} inline comment{comments.length === 1 ? '' : 's'}{' '}
              recorded
            </span>
            <Button
              variant="primary"
              onClick={handleSubmitReview}
              className="text-xs font-bold"
            >
              Submit Review & Calibrate Scorecard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Scorecard Modal / Results Drawer */}
      {showScoreModal && evaluation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-text">
                  Code Review Calibration Scorecard
                </h3>
                <p className="text-xs text-text-muted">
                  Peer Review Quality Analysis for #{currentPr.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScoreModal(false)}
                className="text-text-muted hover:text-text p-1 rounded-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scorecard Hero */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-canvas rounded-lg border border-border text-center">
                <span className="text-[10px] text-text-muted uppercase font-bold block">
                  Grade
                </span>
                <span
                  className={`text-3xl font-black ${
                    evaluation.grade === 'S' || evaluation.grade === 'A'
                      ? 'text-emerald-700'
                      : evaluation.grade === 'B'
                      ? 'text-primary-700'
                      : 'text-error-700'
                  }`}
                >
                  {evaluation.grade}
                </span>
                <span className="text-[10px] text-text-muted block mt-1">
                  Score: {evaluation.overallScore}%
                </span>
              </div>

              <div className="p-4 bg-canvas rounded-lg border border-border text-center">
                <span className="text-[10px] text-text-muted uppercase font-bold block">
                  Flaw Recall
                </span>
                <span className="text-2xl font-bold text-text">
                  {evaluation.recallPercent}%
                </span>
                <span className="text-[10px] text-text-muted block mt-1">
                  {evaluation.detectedFlawIds.length}/{currentPr.goldenFlaws.length}{' '}
                  Caught
                </span>
              </div>

              <div className="p-4 bg-canvas rounded-lg border border-border text-center">
                <span className="text-[10px] text-text-muted uppercase font-bold block">
                  Precision
                </span>
                <span className="text-2xl font-bold text-text">
                  {evaluation.precisionPercent}%
                </span>
                <span className="text-[10px] text-text-muted block mt-1">
                  {comments.length} Comments Made
                </span>
              </div>

              <div className="p-4 bg-canvas rounded-lg border border-border text-center">
                <span className="text-[10px] text-text-muted uppercase font-bold block">
                  Verdict Accuracy
                </span>
                <span className="text-2xl font-bold text-text">
                  {evaluation.verdictAccuracyScore}%
                </span>
                <span className="text-[10px] text-text-muted block mt-1">
                  {evaluation.verdict}
                </span>
              </div>
            </div>

            {/* Badges Earned */}
            {evaluation.earnedBadges.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-text">
                  Badges Earned:
                </span>
                <div className="flex flex-wrap gap-2">
                  {evaluation.earnedBadges.map((badge) => (
                    <Badge key={badge} variant="success">
                      🏆 {badge.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluation Summary */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-text leading-relaxed">
              <strong>Evaluation Feedback:</strong> {evaluation.feedbackSummary}
            </div>

            {/* Golden Flaw Resolution Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Production Flaws & Industrial Solutions
              </h4>
              <div className="space-y-3">
                {currentPr.goldenFlaws.map((flaw) => {
                  const isCaught = evaluation.detectedFlawIds.includes(flaw.id);
                  return (
                    <div
                      key={flaw.id}
                      className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                        isCaught
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-error-200 bg-error-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              isCaught ? 'text-emerald-800' : 'text-error-800'
                            }`}
                          >
                            {isCaught ? '✓ SPOTTED' : '✕ MISSED'}
                          </span>
                          <Badge variant={getSeverityBadgeVariant(flaw.severity)}>
                            {flaw.severity}
                          </Badge>
                          <Badge variant="neutral">{flaw.category}</Badge>
                          <span className="font-semibold text-text">
                            {flaw.title} (Line {flaw.lineNumber})
                          </span>
                        </div>
                      </div>

                      <p className="text-text-muted">{flaw.explanation}</p>

                      <div className="bg-surface p-2.5 rounded border border-border font-mono text-[11px] text-text whitespace-pre-wrap overflow-x-auto">
                        <span className="text-[10px] text-text-muted block font-sans font-bold uppercase mb-1">
                          Recommended Industrial Fix:
                        </span>
                        {flaw.recommendedFixCode}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportPdf}
                  className="text-xs"
                >
                  Download Audit (PDF)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportMarkdown}
                  className="text-xs"
                >
                  Export Markdown
                </Button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowScoreModal(false)}
                className="text-xs"
              >
                Close & Return to Code
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
