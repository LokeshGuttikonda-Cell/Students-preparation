'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  getAdminQuestions,
  getAdminTopics,
  type AdminQuestionItem,
  type TopicItem,
} from '../../../../lib/admin-client';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent } from '../../../../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../../../components/ui/Table';
import { StatusBadge, DifficultyBadge, Badge } from '../../../../components/ui/Badge';
import { Select } from '../../../../components/ui/Select';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<AdminQuestionItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [qData, tData] = await Promise.all([
        getAdminQuestions({
          status: statusFilter || undefined,
          topicId: topicFilter || undefined,
          pageSize: 50,
        }),
        getAdminTopics(),
      ]);
      setQuestions(qData.items);
      setTopics(tData);
    } catch {
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, topicFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-900">
            Review Queue & Question Bank
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Peer review, draft creation, and publication status
          </p>
        </div>
        <Link href="/admin/questions/new">
          <Button variant="accent">Create Question</Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-surface p-4 border border-border rounded-lg">
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm"
          >
            <option value="">All Statuses</option>
            <option value="IN_REVIEW">In Review (Pending)</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>

        <div className="w-56">
          <Select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="text-sm"
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>

        {(statusFilter || topicFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('');
              setTopicFilter('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Question</TableHeaderCell>
                <TableHeaderCell>Topic</TableHeaderCell>
                <TableHeaderCell>Difficulty</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Source</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                    Loading question bank...
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                    No questions found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="max-w-md">
                      <p className="font-medium text-text line-clamp-2">{q.body}</p>
                      <span className="text-xs text-text-muted font-mono">
                        {q.options.length} options · By {q.author?.name || 'Admin'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-text-muted">
                      {q.topic?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={q.status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" className="text-[10px]">
                        {q.source === 'ORIGINAL_HUMAN' ? 'Human' : 'AI Drafted'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/questions/${q.id}/edit` as Route}>
                        <Button
                          variant={q.status === 'IN_REVIEW' ? 'accent' : 'secondary'}
                          size="sm"
                        >
                          {q.status === 'IN_REVIEW' ? 'Review & Publish' : 'Edit'}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
