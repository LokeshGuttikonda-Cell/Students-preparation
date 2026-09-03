'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../../context/AuthContext';
import {
  getAdminQuestion,
  getAdminTopics,
  publishAdminQuestion,
  submitQuestionForReview,
  updateAdminQuestion,
  type AdminQuestionItem,
  type TopicItem,
} from '../../../../../../lib/admin-client';
import { Button } from '../../../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../components/ui/Card';
import { StatusBadge, DifficultyBadge } from '../../../../../../components/ui/Badge';
import { Field } from '../../../../../../components/ui/Field';
import { Input } from '../../../../../../components/ui/Input';
import { Select } from '../../../../../../components/ui/Select';

export default function EditQuestionPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();

  const [question, setQuestion] = useState<AdminQuestionItem | null>(null);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [topicId, setTopicId] = useState('');
  const [body, setBody] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [source, setSource] = useState<'ORIGINAL_HUMAN' | 'AI_DRAFTED'>('ORIGINAL_HUMAN');
  const [options, setOptions] = useState<
    { id?: string; body: string; isCorrect: boolean; orderIndex: number }[]
  >([]);

  const [reviewNotes, setReviewNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadQuestionData = React.useCallback(async () => {
    try {
      const [q, t] = await Promise.all([
        getAdminQuestion(params.id),
        getAdminTopics(),
      ]);
      setQuestion(q);
      setTopics(t);
      setTopicId(q.topicId);
      setBody(q.body);
      setExplanation(q.explanation);
      setDifficulty(q.difficulty);
      setSource(q.source);
      setOptions(q.options);
      setReviewNotes(q.reviewNotes || '');
    } catch {
      setError('Failed to load question details');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      loadQuestionData();
    }
  }, [params.id, loadQuestionData]);

  const handleOptionChange = (index: number, text: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, body: text } : opt)),
    );
  };

  const handleSetCorrect = (index: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({ ...opt, isCorrect: i === index })),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);

    try {
      const updated = await updateAdminQuestion(params.id, {
        topicId,
        body,
        explanation,
        difficulty,
        source,
        options,
        reviewNotes,
      });
      setQuestion(updated);
      setSuccessMsg('Question changes saved successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await submitQuestionForReview(params.id);
      setQuestion(updated);
      setSuccessMsg('Question submitted to review queue.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  const handlePublish = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsPublishing(true);

    try {
      const updated = await publishAdminQuestion(params.id, reviewNotes);
      setQuestion(updated);
      setSuccessMsg('Question successfully published to live bank!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Publication failed');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-text-muted">
        Loading question editor...
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-8 text-center text-error-700">Question not found.</div>
    );
  }

  const isAuthor = user?.id === question.authorId;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-primary-900">
              Edit Question
            </h1>
            <StatusBadge status={question.status} />
            <DifficultyBadge difficulty={question.difficulty} />
          </div>
          <p className="text-xs text-text-muted">
            Authored by {question.author?.name || 'Admin'} · Last updated{' '}
            {new Date(question.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/questions">
            <Button variant="secondary">Back to Queue</Button>
          </Link>
          {question.status === 'DRAFT' && (
            <Button variant="accent" onClick={handleSubmitReview}>
              Submit for Review
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-error-700 bg-error-50 border border-error-500/30 rounded-md">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 text-sm text-success-700 bg-success-50 border border-success-500/30 rounded-md">
          {successMsg}
        </div>
      )}

      {/* Reviewer Invariant Approval Box */}
      {question.status === 'IN_REVIEW' && (
        <Card className="border-accent-300 bg-accent-50/20">
          <CardHeader>
            <CardTitle className="text-base text-accent-900 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-accent-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
                  clipRule="evenodd"
                />
              </svg>
              Peer Review & Publication Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthor ? (
              <div className="p-3 text-xs text-text-muted bg-neutral-100 border border-neutral-300 rounded-md">
                <strong>Publication Invariant Protection (D-018):</strong> You
                authored this question. In accordance with the Content Policy, a
                peer administrator must review and approve publication.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-muted">
                  As peer reviewer, verify question originality, 4 unambiguous
                  choices, and comprehensive explanation before approving.
                </p>
                <Field label="Review Notes / Verification Remarks" htmlFor="rev-notes">
                  <Input
                    id="rev-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Verified calculations, correct distractor rationale."
                  />
                </Field>
                <Button
                  variant="accent"
                  onClick={handlePublish}
                  isLoading={isPublishing}
                  className="w-full sm:w-auto"
                >
                  Approve & Publish to Live Question Bank
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Topic" htmlFor="q-topic" required>
                <Select
                  id="q-topic"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  required
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject?.name || 'Subject'})
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Difficulty" htmlFor="q-diff" required>
                <Select
                  id="q-diff"
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD')
                  }
                  required
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </Select>
              </Field>

              <Field label="Content Source" htmlFor="q-source" required>
                <Select
                  id="q-source"
                  value={source}
                  onChange={(e) =>
                    setSource(
                      e.target.value as 'ORIGINAL_HUMAN' | 'AI_DRAFTED',
                    )
                  }
                  required
                >
                  <option value="ORIGINAL_HUMAN">Original Human Authored</option>
                  <option value="AI_DRAFTED">AI Drafted (Supervised)</option>
                </Select>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              id="q-body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2 text-base bg-surface border border-border rounded-md transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
              required
            />
          </CardContent>
        </Card>

        {/* 4 Choices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Answer Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {options.map((opt, idx) => (
              <div
                key={opt.id || idx}
                className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                  opt.isCorrect
                    ? 'border-success-500/50 bg-success-50/30 ring-1 ring-success-500/20'
                    : 'border-border bg-surface'
                }`}
              >
                <input
                  type="radio"
                  name="correct-option"
                  id={`opt-radio-${idx}`}
                  checked={opt.isCorrect}
                  onChange={() => handleSetCorrect(idx)}
                  className="w-4 h-4 text-primary-700 focus:ring-primary-700 cursor-pointer"
                />
                <label
                  htmlFor={`opt-radio-${idx}`}
                  className="font-mono font-bold text-sm text-text-muted w-6"
                >
                  {String.fromCharCode(65 + idx)}.
                </label>
                <Input
                  value={opt.body}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option choice ${String.fromCharCode(65 + idx)}`}
                  required
                  className="flex-1"
                />
                {opt.isCorrect && (
                  <span className="text-xs font-semibold text-success-700 uppercase">
                    Correct
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              id="q-exp"
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-3.5 py-2 text-base bg-surface border border-border rounded-md transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
              required
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
