'use client';

import React, { useEffect, useState } from 'react';
import {
  createAdminTopic,
  getAdminSubjects,
  getAdminTopics,
  type SubjectItem,
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
import { Badge } from '../../../../components/ui/Badge';
import { Field } from '../../../../components/ui/Field';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formSubjectId, setFormSubjectId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [subs, tops] = await Promise.all([
        getAdminSubjects(),
        getAdminTopics(selectedSubjectId || undefined),
      ]);
      setSubjects(subs);
      setTopics(tops);
      if (subs.length > 0 && !formSubjectId) {
        setFormSubjectId(subs[0].id);
      }
    } catch {
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSubjectId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createAdminTopic({
        subjectId: formSubjectId,
        name,
        slug,
        orderIndex: Number(orderIndex),
      });
      setShowModal(false);
      setName('');
      setSlug('');
      setOrderIndex(0);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-900">
            Topics
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Unit of assessment and weak-area analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-48 text-sm"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </Select>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Add Topic
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Order</TableHeaderCell>
                <TableHeaderCell>Topic Name</TableHeaderCell>
                <TableHeaderCell>Subject</TableHeaderCell>
                <TableHeaderCell>Slug</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-text-muted">
                    Loading topics...
                  </TableCell>
                </TableRow>
              ) : topics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-text-muted">
                    No topics found.
                  </TableCell>
                </TableRow>
              ) : (
                topics.map((top) => (
                  <TableRow key={top.id}>
                    <TableCell className="font-semibold tabular">{top.orderIndex}</TableCell>
                    <TableCell className="font-medium text-primary-900">{top.name}</TableCell>
                    <TableCell className="text-text-muted text-xs">
                      {top.subject?.name || '—'}
                    </TableCell>
                    <TableCell className="text-text-muted font-mono text-xs">{top.slug}</TableCell>
                    <TableCell>
                      {top.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Topic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-primary-900">
                Create New Topic
              </h3>
            </div>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-error-700 bg-error-50 border border-error-500/30 rounded-md">
                    {error}
                  </div>
                )}

                <Field label="Parent Subject" htmlFor="topic-sub" required>
                  <Select
                    id="topic-sub"
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    required
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Topic Name" htmlFor="topic-name" required>
                  <Input
                    id="topic-name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Number Systems"
                    required
                  />
                </Field>

                <Field label="URL Slug" htmlFor="topic-slug" required>
                  <Input
                    id="topic-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="number-systems"
                    required
                  />
                </Field>

                <Field label="Display Order" htmlFor="topic-order">
                  <Input
                    id="topic-order"
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    min={0}
                  />
                </Field>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  >
                    Create Topic
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
