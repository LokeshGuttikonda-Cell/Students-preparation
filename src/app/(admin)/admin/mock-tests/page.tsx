'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  getAdminMockTests,
  createAdminMockTest,
  updateAdminMockTest,
  deleteAdminMockTest,
  type AdminMockTestItem,
} from '../../../../lib/admin-client';
import { getRoles, type RoleTrackItem } from '../../../../lib/roles-client';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

export default function AdminMockTestsPage() {
  const [tests, setTests] = useState<AdminMockTestItem[]>([]);
  const [roles, setRoles] = useState<RoleTrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    durationMinutes: 60,
    marksPerQuestion: 1,
    negativeMarking: 0.25,
    roleTrackId: '',
    status: 'DRAFT',
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [testsData, rolesData] = await Promise.all([
        getAdminMockTests(),
        getRoles().catch(() => []),
      ]);
      setTests(testsData);
      setRoles(rolesData);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load mock tests');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingTestId(null);
    setForm({
      title: '',
      slug: '',
      description: '',
      durationMinutes: 60,
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      roleTrackId: '',
      status: 'DRAFT',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (test: AdminMockTestItem) => {
    setEditingTestId(test.id);
    setForm({
      title: test.title,
      slug: test.slug,
      description: test.description || '',
      durationMinutes: test.durationMinutes,
      marksPerQuestion: test.marksPerQuestion,
      negativeMarking: test.negativeMarking !== null && test.negativeMarking !== undefined ? Number(test.negativeMarking) : 0,
      roleTrackId: test.roleTrackId || '',
      status: test.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (editingTestId) {
        await updateAdminMockTest(editingTestId, {
          title: form.title,
          slug: form.slug,
          description: form.description,
          durationMinutes: Number(form.durationMinutes),
          marksPerQuestion: Number(form.marksPerQuestion),
          negativeMarking: form.negativeMarking ? Number(form.negativeMarking) : null,
          roleTrackId: form.roleTrackId || null,
          status: form.status,
        });
      } else {
        await createAdminMockTest({
          title: form.title,
          slug: form.slug,
          description: form.description,
          durationMinutes: Number(form.durationMinutes),
          marksPerQuestion: Number(form.marksPerQuestion),
          negativeMarking: form.negativeMarking ? Number(form.negativeMarking) : null,
          roleTrackId: form.roleTrackId || null,
          status: form.status,
        });
      }
      setIsModalOpen(false);
      await loadData();
      setIsSaving(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save mock test');
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (test: AdminMockTestItem) => {
    const nextStatus = test.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await updateAdminMockTest(test.id, { status: nextStatus });
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle publication status');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to archive assessment "${title}"?`)) return;
    try {
      await deleteAdminMockTest(id);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete mock test');
    }
  };

  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || t.roleTrackId === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Mock Tests &amp; Multi-Section Blueprint Studio</h1>
          <p className="text-sm text-text-muted mt-1">
            Author role-based screening assessments, multi-section blueprints, cutoffs, and question allocations.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Create Mock Test
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-error-50 border border-error-500/30 text-error-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="border border-border bg-surface">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <input
              type="text"
              placeholder="Search by test title, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2 text-sm border border-border rounded-lg bg-canvas w-full sm:w-72 focus:outline-hidden focus:ring-2 focus:ring-primary-700"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-canvas"
            >
              <option value="ALL">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-lg border border-border">
            {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                  statusFilter === st
                    ? 'bg-primary-700 text-white'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tests Table */}
      <Card className="border border-border bg-surface overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-700 border-t-transparent" />
            <p className="text-sm mt-2">Loading mock tests catalog...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <p className="font-semibold text-sm">No mock tests match your criteria.</p>
            <p className="text-xs text-text-muted mt-1">Create your first role simulation to begin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-text-muted text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Test Title</th>
                  <th className="py-3 px-4">Role Track</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Sections</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTests.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-text">{t.title}</span>
                        <div className="text-xs text-text-muted font-mono">{t.slug}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-accent-800 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                        {t.roleTrack?.name || 'General Assessment'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-text-subtle">
                        {t.durationMinutes}m · +{t.marksPerQuestion} / -{t.negativeMarking ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-text">
                        {t._count.sections} sections
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-text">
                        {t._count.questions} Qs
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          t.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : t.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-surface-muted text-text-subtle border-border'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link href={`/admin/mock-tests/${t.id}` as Route}>
                          <Button variant="secondary" size="sm">
                            Blueprint Studio &rarr;
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(t)}
                        >
                          {t.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(t)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error-600 hover:text-error-700"
                          onClick={() => handleDelete(t.id, t.title)}
                        >
                          Archive
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-text">
                {editingTestId ? 'Edit Mock Test Assessment' : 'Create Mock Test Assessment'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Test Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      title,
                      slug: editingTestId
                        ? prev.slug
                        : title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)+/g, ''),
                    }));
                  }}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas focus:ring-2 focus:ring-primary-700"
                  placeholder="e.g. Cloud & DevOps Screening Simulation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Slug (URL Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas font-mono focus:ring-2 focus:ring-primary-700"
                  placeholder="e.g. cloud-devops-simulation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas focus:ring-2 focus:ring-primary-700"
                  placeholder="Overview of syllabus, duration, and target competency..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.durationMinutes}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Marks / Q
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.marksPerQuestion}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, marksPerQuestion: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Neg. Marking
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min={0}
                    value={form.negativeMarking}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, negativeMarking: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Role Track Alignment
                  </label>
                  <select
                    value={form.roleTrackId}
                    onChange={(e) => setForm((prev) => ({ ...prev, roleTrackId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas"
                  >
                    <option value="">-- General Assessment --</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingTestId ? 'Save Changes' : 'Create Test'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
