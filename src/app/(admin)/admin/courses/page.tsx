'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getAdminCourses,
  getAdminCourse,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  addAdminCourseModule,
  deleteAdminCourseModule,
  reorderAdminCourseModules,
  type AdminCourseItem,
  type AdminCourseDetail,
  type TopicItem,
  getAdminTopics,
} from '../../../../lib/admin-client';
import { getRoles, type RoleTrackItem } from '../../../../lib/roles-client';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const [roles, setRoles] = useState<RoleTrackItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');

  // Course Modal state (Create / Edit)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    name: '',
    slug: '',
    description: '',
    level: 'BEGINNER',
    estimatedHours: 10,
    roleTrackId: '',
    status: 'DRAFT',
  });
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // Module Management Drawer state
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<AdminCourseDetail | null>(null);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [newModuleForm, setNewModuleForm] = useState({
    title: '',
    description: '',
    topicId: '',
    estimatedMinutes: 60,
  });
  const [isAddingModule, setIsAddingModule] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesData, rolesData, topicsData] = await Promise.all([
        getAdminCourses(),
        getRoles().catch(() => []),
        getAdminTopics().catch(() => []),
      ]);
      setCourses(coursesData);
      setRoles(rolesData);
      setTopics(topicsData);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Course Modal for Create
  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    setCourseForm({
      name: '',
      slug: '',
      description: '',
      level: 'BEGINNER',
      estimatedHours: 10,
      roleTrackId: '',
      status: 'DRAFT',
    });
    setIsCourseModalOpen(true);
  };

  // Open Course Modal for Edit
  const handleOpenEditModal = (course: AdminCourseItem) => {
    setEditingCourseId(course.id);
    setCourseForm({
      name: course.name,
      slug: course.slug,
      description: course.description || '',
      level: course.level || 'BEGINNER',
      estimatedHours: course.estimatedHours || 10,
      roleTrackId: course.roleTrackId || '',
      status: course.status,
    });
    setIsCourseModalOpen(true);
  };

  // Save Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingCourse(true);
      if (editingCourseId) {
        await updateAdminCourse(editingCourseId, {
          name: courseForm.name,
          slug: courseForm.slug,
          description: courseForm.description,
          level: courseForm.level,
          estimatedHours: Number(courseForm.estimatedHours),
          roleTrackId: courseForm.roleTrackId || null,
          status: courseForm.status,
        });
      } else {
        await createAdminCourse({
          name: courseForm.name,
          slug: courseForm.slug,
          description: courseForm.description,
          level: courseForm.level,
          estimatedHours: Number(courseForm.estimatedHours),
          roleTrackId: courseForm.roleTrackId || null,
          status: courseForm.status,
        });
      }
      setIsCourseModalOpen(false);
      await loadData();
      setIsSavingCourse(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save course');
      setIsSavingCourse(false);
    }
  };

  // Toggle Publication status
  const handleTogglePublish = async (course: AdminCourseItem) => {
    const nextStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await updateAdminCourse(course.id, { status: nextStatus });
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update publication status');
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to archive course "${courseName}"?`)) return;
    try {
      await deleteAdminCourse(courseId);
      if (selectedCourseDetail?.id === courseId) {
        setSelectedCourseDetail(null);
      }
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  // Open Module Management Drawer
  const handleOpenModuleDrawer = async (courseId: string) => {
    try {
      setIsLoadingModules(true);
      const detail = await getAdminCourse(courseId);
      setSelectedCourseDetail(detail);
      setNewModuleForm({
        title: '',
        description: '',
        topicId: '',
        estimatedMinutes: 60,
      });
      setIsLoadingModules(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to load course modules');
      setIsLoadingModules(false);
    }
  };

  // Add Module
  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseDetail) return;
    try {
      setIsAddingModule(true);
      await addAdminCourseModule(selectedCourseDetail.id, {
        title: newModuleForm.title,
        description: newModuleForm.description || undefined,
        topicId: newModuleForm.topicId || null,
        estimatedMinutes: Number(newModuleForm.estimatedMinutes),
        orderIndex: selectedCourseDetail.modules.length,
      });
      const updatedDetail = await getAdminCourse(selectedCourseDetail.id);
      setSelectedCourseDetail(updatedDetail);
      setNewModuleForm({
        title: '',
        description: '',
        topicId: '',
        estimatedMinutes: 60,
      });
      await loadData();
      setIsAddingModule(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add module');
      setIsAddingModule(false);
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId: string) => {
    if (!selectedCourseDetail) return;
    try {
      await deleteAdminCourseModule(selectedCourseDetail.id, moduleId);
      const updatedDetail = await getAdminCourse(selectedCourseDetail.id);
      setSelectedCourseDetail(updatedDetail);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete module');
    }
  };

  // Move Module Up/Down
  const handleMoveModule = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!selectedCourseDetail) return;
    const modules = [...selectedCourseDetail.modules];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    // Swap
    const temp = modules[index];
    modules[index] = modules[targetIndex];
    modules[targetIndex] = temp;

    const moduleIds = modules.map((m) => m.id);
    try {
      const updated = await reorderAdminCourseModules(selectedCourseDetail.id, moduleIds);
      setSelectedCourseDetail(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reorder modules');
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.roleTrack && c.roleTrack.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Course &amp; Curriculum Studio</h1>
          <p className="text-sm text-text-muted mt-1">
            Author role-based curriculum tracks, manage sequential modules, and map syllabus topics.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>
          + Create Course Track
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-error-50 border border-error-500/30 text-error-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="border border-border bg-surface">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search by course name, slug, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2 text-sm border border-border rounded-lg bg-canvas w-full sm:w-80 focus:outline-hidden focus:ring-2 focus:ring-primary-700"
          />

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

      {/* Courses Table */}
      <Card className="border border-border bg-surface overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-700 border-t-transparent" />
            <p className="text-sm mt-2">Loading course catalog...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <p className="font-semibold text-sm">No courses match your query.</p>
            <p className="text-xs text-text-muted mt-1">Create your first course track to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-text-muted text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Role Track</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Modules</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-text">{c.name}</span>
                        <div className="text-xs text-text-muted font-mono">{c.slug}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-accent-800 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                        {c.roleTrack?.name || 'General Engineering'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-text-subtle">
                        {c.level} · {c.estimatedHours}h
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-text">
                        {c._count.modules} modules
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          c.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : c.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-surface-muted text-text-subtle border-border'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenModuleDrawer(c.id)}
                        >
                          Modules ({c._count.modules})
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(c)}
                        >
                          {c.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(c)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error-600 hover:text-error-700"
                          onClick={() => handleDeleteCourse(c.id, c.name)}
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

      {/* Course Modal (Create/Edit) */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-text">
                {editingCourseId ? 'Edit Course Track' : 'Create Course Track'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                className="text-text-muted hover:text-text text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCourseForm((prev) => ({
                      ...prev,
                      name,
                      slug: editingCourseId
                        ? prev.slug
                        : name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)+/g, ''),
                    }));
                  }}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas focus:ring-2 focus:ring-primary-700"
                  placeholder="e.g. AWS Cloud Foundations"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Slug (URL Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.slug}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas font-mono focus:ring-2 focus:ring-primary-700"
                  placeholder="e.g. aws-cloud-foundations"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas focus:ring-2 focus:ring-primary-700"
                  placeholder="Detailed curriculum overview..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Level
                  </label>
                  <select
                    value={courseForm.level}
                    onChange={(e) =>
                      setCourseForm((prev) => ({ ...prev, level: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={courseForm.estimatedHours}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        estimatedHours: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Target Role Track
                  </label>
                  <select
                    value={courseForm.roleTrackId}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        roleTrackId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas"
                  >
                    <option value="">-- General / None --</option>
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
                    value={courseForm.status}
                    onChange={(e) =>
                      setCourseForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-canvas"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCourseModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSavingCourse}>
                  {isSavingCourse ? 'Saving...' : editingCourseId ? 'Save Changes' : 'Create Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Management Drawer */}
      {selectedCourseDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="bg-surface border-l border-border w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">
                  Curriculum Module Roadmap
                </span>
                <h3 className="text-xl font-bold text-text">
                  {selectedCourseDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseDetail(null)}
                className="text-text-muted hover:text-text text-xl"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingModules ? (
                <div className="p-12 text-center text-text-muted">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-700 border-t-transparent" />
                </div>
              ) : selectedCourseDetail.modules.length === 0 ? (
                <div className="p-8 text-center text-text-muted border border-dashed border-border rounded-lg">
                  <p className="font-semibold text-sm">No modules created yet.</p>
                  <p className="text-xs text-text-muted mt-1">
                    Add sequential curriculum units below.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Sequential Modules ({selectedCourseDetail.modules.length})
                  </h4>
                  {selectedCourseDetail.modules.map((mod, index) => (
                    <div
                      key={mod.id}
                      className="p-4 border border-border rounded-lg bg-canvas flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-900 font-black text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <h5 className="font-bold text-sm text-text">{mod.title}</h5>
                          <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                            <span>{mod.estimatedMinutes} mins</span>
                            {mod.topic && (
                              <span className="bg-surface px-2 py-0.5 rounded border border-border text-accent-800 font-medium">
                                Topic: {mod.topic.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveModule(index, 'UP')}
                          className="p-1 text-xs border border-border rounded hover:bg-surface disabled:opacity-30"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === selectedCourseDetail.modules.length - 1}
                          onClick={() => handleMoveModule(index, 'DOWN')}
                          className="p-1 text-xs border border-border rounded hover:bg-surface disabled:opacity-30"
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(mod.id)}
                          className="p-1 text-xs text-error-600 hover:text-error-700 ml-2"
                          title="Delete Module"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Module Form */}
              <div className="border-t border-border pt-6 space-y-4">
                <h4 className="text-sm font-bold text-text">+ Add Syllabus Module</h4>
                <form onSubmit={handleAddModule} className="space-y-3 bg-surface-muted p-4 rounded-lg border border-border">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                      Module Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newModuleForm.title}
                      onChange={(e) =>
                        setNewModuleForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 text-sm border border-border rounded bg-canvas"
                      placeholder="e.g. AWS VPC, Subnets & Routing"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                        Syllabus Topic Link
                      </label>
                      <select
                        value={newModuleForm.topicId}
                        onChange={(e) =>
                          setNewModuleForm((prev) => ({ ...prev, topicId: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 text-sm border border-border rounded bg-canvas"
                      >
                        <option value="">-- None / Reading --</option>
                        {topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                        Duration (Mins)
                      </label>
                      <input
                        type="number"
                        min={5}
                        value={newModuleForm.estimatedMinutes}
                        onChange={(e) =>
                          setNewModuleForm((prev) => ({
                            ...prev,
                            estimatedMinutes: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-1.5 text-sm border border-border rounded bg-canvas"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="sm" disabled={isAddingModule}>
                    {isAddingModule ? 'Adding...' : 'Add Module'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
