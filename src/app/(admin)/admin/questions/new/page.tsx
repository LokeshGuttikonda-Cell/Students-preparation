'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createAdminQuestion,
  getAdminTopics,
  type TopicItem,
} from '../../../../../lib/admin-client';
import { Button } from '../../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/Card';
import { Field } from '../../../../../components/ui/Field';
import { Input } from '../../../../../components/ui/Input';
import { Select } from '../../../../../components/ui/Select';

export default function NewQuestionPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [topicId, setTopicId] = useState('');
  const [body, setBody] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [source, setSource] = useState<'ORIGINAL_HUMAN' | 'AI_DRAFTED'>('ORIGINAL_HUMAN');

  // 4 standard options
  const [options, setOptions] = useState([
    { body: '', isCorrect: true, orderIndex: 0 },
    { body: '', isCorrect: false, orderIndex: 1 },
    { body: '', isCorrect: false, orderIndex: 2 },
    { body: '', isCorrect: false, orderIndex: 3 },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAdminTopics().then((data) => {
      setTopics(data);
      if (data.length > 0) setTopicId(data[0].id);
    });
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!body.trim()) {
      setError('Question body cannot be empty.');
      return;
    }
    if (!explanation.trim()) {
      setError('Step-by-step explanation is mandatory for learning.');
      return;
    }
    if (options.some((o) => !o.body.trim())) {
      setError('All 4 option choices must have content.');
      return;
    }
    if (!options.some((o) => o.isCorrect)) {
      setError('Exactly one option must be marked as correct.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createAdminQuestion({
        topicId,
        body,
        explanation,
        difficulty,
        source,
        options,
      });
      router.push('/admin/questions');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-900">
            Create Question
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Author an assessment item with 4 choices and explanation
          </p>
        </div>
        <Link href="/admin/questions">
          <Button variant="secondary">Cancel</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 text-sm text-error-700 bg-error-50 border border-error-500/30 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata & Context</CardTitle>
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

              <Field
                label="Content Source"
                htmlFor="q-source"
                hint="Mandatory per Content Policy"
                required
              >
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
          <CardContent className="space-y-4">
            <Field
              label="Question Text (Markdown supported)"
              htmlFor="q-body"
              required
            >
              <textarea
                id="q-body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="State the problem clearly. Include any code snippet or mathematical formulation..."
                className="w-full px-3.5 py-2 text-base bg-surface border border-border rounded-md transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                required
              />
            </Field>
          </CardContent>
        </Card>

        {/* 4 Options Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Answer Choices (4 Required)
            </CardTitle>
            <p className="text-xs text-text-muted mt-1">
              Select the radio button next to the correct answer choice.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {options.map((opt, idx) => (
              <div
                key={idx}
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
            <CardTitle className="text-base">
              Explanation & Solution Walkthrough
            </CardTitle>
            <p className="text-xs text-text-muted mt-1">
              Mandatory for publication. Shown to students only after test
              evaluation.
            </p>
          </CardHeader>
          <CardContent>
            <Field
              label="Detailed Explanation"
              htmlFor="q-exp"
              required
            >
              <textarea
                id="q-exp"
                rows={4}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain why the correct answer is right and why the distractors are wrong..."
                className="w-full px-3.5 py-2 text-base bg-surface border border-border rounded-md transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                required
              />
            </Field>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/questions')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            isLoading={isSubmitting}
          >
            Save Draft Question
          </Button>
        </div>
      </form>
    </div>
  );
}
