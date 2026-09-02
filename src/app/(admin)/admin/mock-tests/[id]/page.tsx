'use client';

import React, { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  getAdminMockTest,
  updateAdminMockTest,
  createAdminTestSection,
  deleteAdminTestSection,
  assignAdminMockQuestions,
  getAdminQuestions,
  type AdminMockTestDetail,
  type AdminQuestionItem,
} from '../../../../../lib/admin-client';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';

export default function AdminMockTestBlueprintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: testId } = use(params);

  const [test, setTest] = useState<AdminMockTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Section creator modal
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: '',
    durationMinutes: 20,
    cutoffScore: 10,
  });
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Question Picker modal
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTargetSectionId, setPickerTargetSectionId] = useState<string>('');
  const [availableQuestions, setAvailableQuestions] = useState<AdminQuestionItem[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [isLoadingPicker, setIsLoadingPicker] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const detail = await getAdminMockTest(testId);
      setTest(detail);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load test blueprint');
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create section
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSection(true);
      await createAdminTestSection(testId, {
        title: sectionForm.title,
        description: sectionForm.description || undefined,
        durationMinutes: sectionForm.durationMinutes ? Number(sectionForm.durationMinutes) : undefined,
        cutoffScore: sectionForm.cutoffScore ? Number(sectionForm.cutoffScore) : undefined,
        orderIndex: test?.sections.length || 0,
      });
      setIsSectionModalOpen(false);
      setSectionForm({
        title: '',
        description: '',
        durationMinutes: 20,
        cutoffScore: 10,
      });
      await loadData();
      setIsSavingSection(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create section');
      setIsSavingSection(false);
    }
  };

  // Delete section
  const handleDeleteSection = async (sectionId: string, title: string) => {
    if (!window.confirm(`Delete section "${title}"? Questions in this section will become unassigned.`)) return;
    try {
      await deleteAdminTestSection(testId, sectionId);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete section');
    }
  };

  // Open Question Picker
  const handleOpenPicker = async (sectionId?: string) => {
    setPickerTargetSectionId(sectionId || '');
    setIsPickerOpen(true);
    try {
      setIsLoadingPicker(true);
      const questionsRes = await getAdminQuestions({ status: 'PUBLISHED', pageSize: 50 });
      setAvailableQuestions(questionsRes.items);
      // Pre-select questions already in this test
      const assignedIds = new Set((test?.questions || []).map((q) => q.questionId));
      setSelectedQuestionIds(assignedIds);
      setIsLoadingPicker(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to load question pool');
      setIsLoadingPicker(false);
    }
  };

  // Toggle selection in question picker
  const handleToggleQuestionSelect = (qId: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  // Save assigned questions
  const handleSaveQuestions = async () => {
    if (!test) return;
    try {
      const currentMapping = new Map(test.questions.map((q) => [q.questionId, q.sectionId]));
      const newQuestionList: Array<{
        questionId: string;
        sectionId?: string | null;
        orderIndex: number;
      }> = [];

      let order = 0;
      selectedQuestionIds.forEach((qId) => {
        // If question was already in exam, preserve its section; otherwise assign to pickerTargetSectionId
        const sectionId = currentMapping.has(qId)
          ? currentMapping.get(qId)
          : pickerTargetSectionId || null;

        newQuestionList.push({
          questionId: qId,
          sectionId,
          orderIndex: order++,
        });
      });

      await assignAdminMockQuestions(testId, newQuestionList);
      setIsPickerOpen(false);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to assign questions');
    }
  };

  // Remove single question from exam
  const handleRemoveQuestion = async (qId: string) => {
    if (!test) return;
    try {
      const updatedList = test.questions
        .filter((q) => q.questionId !== qId)
        .map((q, idx) => ({
          questionId: q.questionId,
          sectionId: q.sectionId,
          orderIndex: idx,
        }));
      await assignAdminMockQuestions(testId, updatedList);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to remove question');
    }
  };

  // Toggle Publish
  const handleTogglePublish = async () => {
    if (!test) return;
    const nextStatus = test.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await updateAdminMockTest(test.id, { status: nextStatus });
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update publication status');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-text-muted">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-700 border-t-transparent" />
        <p className="text-sm mt-3">Loading assessment blueprint...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <Link href={'/admin/mock-tests' as Route} className="text-xs text-primary-700 font-semibold hover:underline">
          &larr; Back to Mock Tests
        </Link>
        <div className="p-6 bg-error-50 border border-error-500/30 text-error-700 rounded-lg text-sm">
          {error || 'Assessment blueprint not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link href={'/admin/mock-tests' as Route} className="text-xs text-primary-700 font-semibold hover:underline">
            &larr; Back to Mock Tests
          </Link>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-2xl font-bold text-text">{test.title}</h1>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                test.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {test.status}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1 font-mono">{test.slug}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleTogglePublish}>
            {test.status === 'PUBLISHED' ? 'Unpublish Assessment' : 'Publish Assessment'}
          </Button>
          <Button variant="primary" onClick={() => handleOpenPicker()}>
            + Add Questions Pool
          </Button>
        </div>
      </div>

      {/* Overview Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-border bg-surface p-4">
          <span className="text-xs text-text-muted uppercase font-semibold">Duration</span>
          <p className="text-xl font-bold text-text mt-1">{test.durationMinutes} Minutes</p>
        </Card>
        <Card className="border border-border bg-surface p-4">
          <span className="text-xs text-text-muted uppercase font-semibold">Scoring Rule</span>
          <p className="text-xl font-bold text-text mt-1">
            +{test.marksPerQuestion} / -{test.negativeMarking ?? 0}
          </p>
        </Card>
        <Card className="border border-border bg-surface p-4">
          <span className="text-xs text-text-muted uppercase font-semibold">Sections</span>
          <p className="text-xl font-bold text-text mt-1">{test.sections.length} Sections</p>
        </Card>
        <Card className="border border-border bg-surface p-4">
          <span className="text-xs text-text-muted uppercase font-semibold">Total Questions</span>
          <p className="text-xl font-bold text-text mt-1">{test.questions.length} Questions</p>
        </Card>
      </div>

      {/* Sections Architecture */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text">Sections Architecture</h2>
            <p className="text-xs text-text-muted">
              Divide your assessment into distinct timed competency sections (e.g. Aptitude, Core Domain, Advanced).
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsSectionModalOpen(true)}>
            + Add Section
          </Button>
        </div>

        {test.sections.length === 0 ? (
          <Card className="p-8 text-center text-text-muted border border-dashed border-border">
            <p className="text-sm font-semibold">No competency sections configured.</p>
            <p className="text-xs text-text-muted mt-1">
              Add sections like &quot;Section 1: General Aptitude&quot; or &quot;Section 2: Domain Technical&quot;.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {test.sections.map((sec, idx) => {
              const secQuestions = test.questions.filter((q) => q.sectionId === sec.id);
              return (
                <Card key={sec.id} className="border border-border bg-surface p-5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">
                        Section {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id, sec.title)}
                        className="text-text-subtle hover:text-error-600 text-xs"
                        title="Delete Section"
                      >
                        ✕
                      </button>
                    </div>
                    <h4 className="font-bold text-sm text-text">{sec.title}</h4>
                    {sec.description && (
                      <p className="text-xs text-text-muted">{sec.description}</p>
                    )}
                    <div className="pt-2 text-xs text-text-subtle space-y-0.5">
                      <div>Duration: <strong className="text-text">{sec.durationMinutes ? `${sec.durationMinutes}m` : 'Shared'}</strong></div>
                      {sec.cutoffScore && <div>Cutoff Score: <strong className="text-text">{sec.cutoffScore} marks</strong></div>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-text">
                      {secQuestions.length} Questions
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPicker(sec.id)}
                    >
                      + Add Questions
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Questions Allocated Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-text">Questions Allocated ({test.questions.length})</h2>
          <p className="text-xs text-text-muted">
            Sequential question delivery order for students during the timed test.
          </p>
        </div>

        <Card className="border border-border bg-surface overflow-hidden">
          {test.questions.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              <p className="text-sm font-semibold">No questions assigned to this assessment yet.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => handleOpenPicker()}
              >
                Open Question Pool &rarr;
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-muted text-text-muted text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Question Prompt</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Section Assignment</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {test.questions.map((q, idx) => (
                    <tr key={q.questionId} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-text-muted">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <p className="text-xs font-medium text-text line-clamp-2">
                          {q.question.body}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-text-muted">
                          {q.question.topic.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium bg-surface px-2 py-0.5 rounded border border-border text-accent-800">
                          {q.section?.title || 'Unassigned / Global'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-subtle">
                          {q.question.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.questionId)}
                          className="text-xs text-error-600 hover:text-error-700 font-semibold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Create Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-text">Add Exam Section</h3>
              <button
                type="button"
                onClick={() => setIsSectionModalOpen(false)}
                className="text-text-muted hover:text-text text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  required
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-canvas"
                  placeholder="e.g. Section 1: Core Domain Technical"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={sectionForm.description}
                  onChange={(e) =>
                    setSectionForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-canvas"
                  placeholder="Competency scope..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Section Time (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sectionForm.durationMinutes}
                    onChange={(e) =>
                      setSectionForm((prev) => ({
                        ...prev,
                        durationMinutes: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded bg-canvas"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Cutoff Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sectionForm.cutoffScore}
                    onChange={(e) =>
                      setSectionForm((prev) => ({
                        ...prev,
                        cutoffScore: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded bg-canvas"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsSectionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSavingSection}>
                  {isSavingSection ? 'Saving...' : 'Add Section'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-text">Select Questions for Exam</h3>
                <p className="text-xs text-text-muted">
                  Check questions to assign to this mock assessment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="text-text-muted hover:text-text text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingPicker ? (
                <div className="p-8 text-center text-text-muted">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-700 border-t-transparent" />
                </div>
              ) : availableQuestions.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">
                  No published questions available in pool.
                </p>
              ) : (
                availableQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.has(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`p-3 border rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-primary-600 bg-primary-50/30'
                          : 'border-border bg-canvas hover:bg-surface-muted/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleQuestionSelect(q.id)}
                        className="mt-1 h-4 w-4 rounded border-border text-primary-700 focus:ring-primary-700"
                      />
                      <div className="space-y-1 flex-1">
                        <p className="text-xs font-semibold text-text">{q.body}</p>
                        <div className="flex items-center gap-2 text-[11px] text-text-muted">
                          <span>Topic: {q.topic?.name || 'General'}</span>
                          <span>·</span>
                          <span className="font-bold">{q.difficulty}</span>
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 shrink-0">
              <span className="text-xs font-semibold text-text-muted">
                {selectedQuestionIds.size} questions selected
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsPickerOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveQuestions}>
                  Apply Selection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
