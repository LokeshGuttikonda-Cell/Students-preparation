'use client';

import React, { useEffect, useState } from 'react';
import {
  createAdminSubject,
  getAdminSubjects,
  type SubjectItem,
} from '../../../../lib/admin-client';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
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

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubjects = async () => {
    try {
      const data = await getAdminSubjects();
      setSubjects(data);
    } catch {
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

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
      await createAdminSubject({
        name,
        slug,
        description: description || undefined,
        orderIndex: Number(orderIndex),
      });
      setShowModal(false);
      setName('');
      setSlug('');
      setDescription('');
      setOrderIndex(0);
      await fetchSubjects();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-900">
            Subjects
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Top level of the assessment content tree
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Subject
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Order</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Slug</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-text-muted">
                    Loading subjects...
                  </TableCell>
                </TableRow>
              ) : subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-text-muted">
                    No subjects created yet.
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-semibold tabular">{sub.orderIndex}</TableCell>
                    <TableCell className="font-medium text-primary-900">{sub.name}</TableCell>
                    <TableCell className="text-text-muted font-mono text-xs">{sub.slug}</TableCell>
                    <TableCell>
                      {sub.isActive ? (
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

      {/* Create Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Create New Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-error-700 bg-error-50 border border-error-500/30 rounded-md">
                    {error}
                  </div>
                )}

                <Field label="Subject Name" htmlFor="sub-name" required>
                  <Input
                    id="sub-name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Quantitative Aptitude"
                    required
                  />
                </Field>

                <Field label="URL Slug" htmlFor="sub-slug" required>
                  <Input
                    id="sub-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="quantitative-aptitude"
                    required
                  />
                </Field>

                <Field label="Description (Optional)" htmlFor="sub-desc">
                  <Input
                    id="sub-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description for student orientation"
                  />
                </Field>

                <Field label="Display Order" htmlFor="sub-order">
                  <Input
                    id="sub-order"
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
                    Create Subject
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
