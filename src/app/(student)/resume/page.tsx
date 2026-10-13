'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DEFAULT_ROLES_CATALOG } from '../../../lib/catalog-data';
import { triggerBrowserFileDownload } from '../../../lib/admin-database-client';
import {
  analyzeResumeAts,
  generateSampleResume,
  getSavedResume,
  saveResume,
  exportResumeAsLatex,
  exportResumeAsMarkdown,
  exportResumeAsPdf,
  type StudentResume,
  type AtsAnalysis,
} from '../../../lib/resume-client';

export default function ResumeBuilderPage() {
  const [resume, setResume] = useState<StudentResume>(() =>
    generateSampleResume(DEFAULT_ROLES_CATALOG[0].slug)
  );
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'credentials'>('contact');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Load saved resume from localStorage on mount
  useEffect(() => {
    const loaded = getSavedResume(DEFAULT_ROLES_CATALOG[0].slug);
    setResume(loaded);
    setIsClientLoaded(true);
  }, []);

  // Save to localStorage when resume state changes
  useEffect(() => {
    if (isClientLoaded) {
      saveResume(resume);
    }
  }, [resume, isClientLoaded]);

  // Real-time ATS Analysis
  const ats: AtsAnalysis = useMemo(() => {
    return analyzeResumeAts(resume);
  }, [resume]);

  // Handlers for Role Switch & Sample Generation
  const handleRoleChange = (roleSlug: string) => {
    setResume((prev) => ({
      ...prev,
      targetRoleSlug: roleSlug,
    }));
  };

  const handleLoadSample = () => {
    const sample = generateSampleResume(resume.targetRoleSlug);
    setResume(sample);
  };

  const handleReset = () => {
    const emptyResume: StudentResume = {
      id: 'resume_custom_' + Date.now(),
      targetRoleSlug: resume.targetRoleSlug,
      contact: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
      },
      summary: '',
      skills: {
        languages: [],
        frameworks: [],
        databases: [],
        toolsAndCloud: [],
        coreConcepts: [],
      },
      experience: [],
      projects: [],
      education: [],
      credentials: [],
      lastModified: new Date().toISOString(),
    };
    setResume(emptyResume);
  };

  // Export triggers
  const handleDownloadPdf = () => {
    exportResumeAsPdf(resume);
  };

  const handleExportLatex = () => {
    const latexCode = exportResumeAsLatex(resume);
    const filename = `${(resume.contact.fullName || 'resume').toLowerCase().replace(/\s+/g, '-')}.tex`;
    triggerBrowserFileDownload(filename, latexCode, 'application/x-tex');
  };

  const handleExportMarkdown = () => {
    const mdCode = exportResumeAsMarkdown(resume);
    const filename = `${(resume.contact.fullName || 'resume').toLowerCase().replace(/\s+/g, '-')}.md`;
    triggerBrowserFileDownload(filename, mdCode, 'text/markdown');
  };

  // Add missing keyword to skills
  const handleAddKeyword = (keyword: string) => {
    setResume((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        coreConcepts: [...prev.skills.coreConcepts, keyword],
      },
    }));
    setCopiedNotification(`Added "${keyword}" to Technical Skills`);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Dynamic Item Mutators
  const handleAddExperience = () => {
    const newExp = {
      id: 'exp_' + Date.now(),
      company: 'Enterprise Software Inc.',
      roleTitle: 'Software Engineer',
      location: 'Remote',
      startDate: 'Jun 2025',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        'Engineered scalable microservices processing 5,000 req/s with 99.9% uptime.',
      ],
    };
    setResume((prev) => ({
      ...prev,
      experience: [newExp, ...prev.experience],
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  const handleAddProject = () => {
    const newProj = {
      id: 'proj_' + Date.now(),
      title: 'High-Throughput Distributed Cache',
      techStack: ['TypeScript', 'Redis', 'Docker'],
      liveUrl: 'https://demo.example.com',
      githubUrl: 'https://github.com/example/cache',
      bullets: [
        'Architected in-memory LRU cache reducing database lookups by 65%.',
      ],
    };
    setResume((prev) => ({
      ...prev,
      projects: [newProj, ...prev.projects],
    }));
  };

  const handleRemoveProject = (id: string) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  return (
    <div className="min-h-screen bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Breadcrumbs & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
              <Link href={'/dashboard' as Route} className="hover:underline">
                Dashboard
              </Link>
              <span>/</span>
              <span>Resume Builder</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
              ATS Technical Resume Builder & Role Fit Engine
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Real-time ATS keyword matching, impact metrics analysis, and single-column typographic exporter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Target Role Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="target-role" className="text-xs font-bold text-neutral-700">
                Target Role:
              </label>
              <select
                id="target-role"
                aria-label="Target Role Selection"
                value={resume.targetRoleSlug}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="text-xs font-medium border border-border rounded-md px-2.5 py-1.5 bg-surface text-neutral-800 shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
              >
                {DEFAULT_ROLES_CATALOG.map((role) => (
                  <option key={role.slug} value={role.slug}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Load Sample Button */}
            <Button
              variant="secondary"
              size="sm"
              aria-label="Load Sample Resume"
              onClick={handleLoadSample}
              className="text-xs font-semibold"
            >
              Load Sample
            </Button>

            {/* PDF Export */}
            <Button
              variant="primary"
              size="sm"
              aria-label="Download PDF"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1 text-xs font-bold shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </Button>

            {/* LaTeX Export */}
            <Button
              variant="secondary"
              size="sm"
              aria-label="Export LaTeX"
              onClick={handleExportLatex}
              className="text-xs font-semibold"
            >
              Export .tex
            </Button>

            {/* Markdown Export */}
            <Button
              variant="secondary"
              size="sm"
              aria-label="Export Markdown"
              onClick={handleExportMarkdown}
              className="text-xs font-semibold"
            >
              Export .md
            </Button>

            {/* Reset */}
            <Button
              variant="ghost"
              size="sm"
              aria-label="Reset Resume"
              onClick={handleReset}
              className="text-xs text-neutral-500 hover:text-error-600"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Notification Toast */}
        {copiedNotification && (
          <div className="bg-primary-50 border border-primary-200 text-primary-800 text-xs px-4 py-2.5 rounded-md flex items-center justify-between shadow-xs">
            <span className="font-semibold">{copiedNotification}</span>
            <button onClick={() => setCopiedNotification(null)} className="text-primary-600 hover:text-primary-800">✕</button>
          </div>
        )}

        {/* ATS Match Diagnostics Scorecard Banner */}
        <div
          className={`rounded-xl border p-5 shadow-xs transition-colors ${
            ats.tier === 'HIGH_INTERVIEW_CHANCE'
              ? 'bg-success-50/50 border-success-200'
              : ats.tier === 'BORDERLINE'
              ? 'bg-accent-50/40 border-accent-200'
              : 'bg-primary-50/30 border-primary-200'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* ATS Circular Score Gauge */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-neutral-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      ats.tier === 'HIGH_INTERVIEW_CHANCE'
                        ? 'text-success-600'
                        : ats.tier === 'BORDERLINE'
                        ? 'text-accent-600'
                        : 'text-primary-600'
                    }
                    strokeDasharray={`${ats.overallScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black text-neutral-900 tracking-tight">
                    {ats.overallScore}%
                  </span>
                  <span className="text-[9px] uppercase font-bold text-neutral-500">ATS Match</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-neutral-900">
                    ATS Role Alignment: {ats.roleName}
                  </h2>
                  <Badge
                    variant={
                      ats.tier === 'HIGH_INTERVIEW_CHANCE'
                        ? 'success'
                        : ats.tier === 'BORDERLINE'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {ats.tierLabel}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 mt-1.5">
                  <span>
                    Keywords: <strong className="text-neutral-900">{ats.matchedKeywords.length} matched</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Action Verbs: <strong className="text-neutral-900">{ats.actionVerbCount} detected</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Quantified Metrics: <strong className="text-neutral-900">{ats.quantifiedMetricCount} metrics</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Keyword Chips */}
            <div className="max-w-md w-full space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-neutral-500 font-semibold">
                <span>Domain Keywords ({ats.matchedKeywords.length} matched, {ats.missingKeywords.length} missing):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {ats.matchedKeywords.slice(0, 5).map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-100 text-success-800"
                  >
                    ✓ {kw}
                  </span>
                ))}
                {ats.missingKeywords.slice(0, 5).map((kw) => (
                  <button
                    key={kw}
                    onClick={() => handleAddKeyword(kw)}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-100 text-accent-800 hover:bg-accent-200 transition-colors cursor-pointer"
                    title="Click to add to skills"
                  >
                    + {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Suggestions */}
          {ats.suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/60 text-xs text-neutral-600 flex flex-wrap gap-x-6 gap-y-1">
              {ats.suggestions.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-primary-600 font-bold">💡</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dual-Pane Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Editor */}
          <div className="lg:col-span-6 space-y-4">
            <Card>
              {/* Navigation Tabs */}
              <div className="flex border-b border-border text-xs font-semibold text-neutral-600 overflow-x-auto">
                {(['contact', 'summary', 'skills', 'experience', 'projects', 'education', 'credentials'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 capitalize whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-primary-600 text-primary-700 bg-primary-50/20'
                        : 'border-transparent hover:text-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <CardContent className="p-6">
                {/* 1. Contact Info */}
                {activeTab === 'contact' && (
                  <div className="space-y-4 text-xs">
                    <h3 className="font-bold text-sm text-neutral-900">Personal Contact & Links</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={resume.contact.fullName}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, fullName: e.target.value },
                            }))
                          }
                          aria-label="Full Name"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">Email</label>
                        <input
                          type="email"
                          value={resume.contact.email}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, email: e.target.value },
                            }))
                          }
                          aria-label="Email Address"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">Phone</label>
                        <input
                          type="text"
                          value={resume.contact.phone}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, phone: e.target.value },
                            }))
                          }
                          aria-label="Phone Number"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">Location</label>
                        <input
                          type="text"
                          value={resume.contact.location}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, location: e.target.value },
                            }))
                          }
                          aria-label="Location"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">GitHub URL</label>
                        <input
                          type="text"
                          value={resume.contact.githubUrl}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, githubUrl: e.target.value },
                            }))
                          }
                          aria-label="GitHub Profile URL"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">LinkedIn URL</label>
                        <input
                          type="text"
                          value={resume.contact.linkedinUrl}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, linkedinUrl: e.target.value },
                            }))
                          }
                          aria-label="LinkedIn Profile URL"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Professional Summary */}
                {activeTab === 'summary' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-neutral-900">Professional Summary</h3>
                      <button
                        onClick={() => {
                          const sample = generateSampleResume(resume.targetRoleSlug);
                          setResume((prev) => ({ ...prev, summary: sample.summary }));
                        }}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-800"
                      >
                        Auto-Generate for Role
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={resume.summary}
                      onChange={(e) =>
                        setResume((prev) => ({ ...prev, summary: e.target.value }))
                      }
                      aria-label="Professional Summary"
                      className="w-full border border-border rounded-md p-3 text-xs bg-surface leading-relaxed"
                      placeholder="Enter a concise technical summary highlighting target role, core achievements, and quantifiable results..."
                    />
                    <span className="text-neutral-400 block text-right">
                      {resume.summary.length} characters (aim for 150-300)
                    </span>
                  </div>
                )}

                {/* 3. Technical Skills */}
                {activeTab === 'skills' && (
                  <div className="space-y-4 text-xs">
                    <h3 className="font-bold text-sm text-neutral-900">Categorized Technical Skills</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">
                          Programming Languages (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={resume.skills.languages.join(', ')}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              skills: {
                                ...prev.skills,
                                languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              },
                            }))
                          }
                          aria-label="Programming Languages"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">
                          Frameworks & Libraries (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={resume.skills.frameworks.join(', ')}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              skills: {
                                ...prev.skills,
                                frameworks: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              },
                            }))
                          }
                          aria-label="Frameworks and Libraries"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">
                          Databases & Storage (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={resume.skills.databases.join(', ')}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              skills: {
                                ...prev.skills,
                                databases: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              },
                            }))
                          }
                          aria-label="Databases"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">
                          Tools & Cloud Infrastructure (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={resume.skills.toolsAndCloud.join(', ')}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              skills: {
                                ...prev.skills,
                                toolsAndCloud: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              },
                            }))
                          }
                          aria-label="Tools and Cloud"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-1">
                          Core Architectural Concepts (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={resume.skills.coreConcepts.join(', ')}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              skills: {
                                ...prev.skills,
                                coreConcepts: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              },
                            }))
                          }
                          aria-label="Core Concepts"
                          className="w-full border border-border rounded-md px-3 py-1.5 text-xs bg-surface"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Experience */}
                {activeTab === 'experience' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-neutral-900">Work Experience & Internships</h3>
                      <button
                        onClick={handleAddExperience}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-800"
                      >
                        + Add Position
                      </button>
                    </div>

                    {resume.experience.map((exp, idx) => (
                      <div key={exp.id} className="border border-border rounded-lg p-3 space-y-3 bg-canvas">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-neutral-800">Position #{idx + 1}</span>
                          <button
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="text-error-600 hover:underline text-[11px]"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => {
                              const val = e.target.value;
                              setResume((prev) => ({
                                ...prev,
                                experience: prev.experience.map((item) =>
                                  item.id === exp.id ? { ...item, company: val } : item
                                ),
                              }));
                            }}
                            className="border border-border rounded-md px-2.5 py-1 text-xs bg-surface"
                          />
                          <input
                            type="text"
                            placeholder="Role Title"
                            value={exp.roleTitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setResume((prev) => ({
                                ...prev,
                                experience: prev.experience.map((item) =>
                                  item.id === exp.id ? { ...item, roleTitle: val } : item
                                ),
                              }));
                            }}
                            className="border border-border rounded-md px-2.5 py-1 text-xs bg-surface"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-neutral-600 block">Bullet Points</label>
                          {exp.bullets.map((bullet, bIdx) => (
                            <textarea
                              key={bIdx}
                              rows={2}
                              value={bullet}
                              onChange={(e) => {
                                const val = e.target.value;
                                setResume((prev) => ({
                                  ...prev,
                                  experience: prev.experience.map((item) =>
                                    item.id === exp.id
                                      ? {
                                          ...item,
                                          bullets: item.bullets.map((b, i) =>
                                            i === bIdx ? val : b
                                          ),
                                        }
                                      : item
                                  ),
                                }));
                              }}
                              className="w-full border border-border rounded-md p-2 text-xs bg-surface mb-1"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Projects */}
                {activeTab === 'projects' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-neutral-900">Technical Projects</h3>
                      <button
                        onClick={handleAddProject}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-800"
                      >
                        + Add Project
                      </button>
                    </div>

                    {resume.projects.map((proj, idx) => (
                      <div key={proj.id} className="border border-border rounded-lg p-3 space-y-3 bg-canvas">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-neutral-800">Project #{idx + 1}</span>
                          <button
                            onClick={() => handleRemoveProject(proj.id)}
                            className="text-error-600 hover:underline text-[11px]"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Project Title"
                            value={proj.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setResume((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p) =>
                                  p.id === proj.id ? { ...p, title: val } : p
                                ),
                              }));
                            }}
                            className="border border-border rounded-md px-2.5 py-1 text-xs bg-surface"
                          />
                          <input
                            type="text"
                            placeholder="Tech Stack (comma-separated)"
                            value={proj.techStack.join(', ')}
                            onChange={(e) => {
                              const val = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                              setResume((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p) =>
                                  p.id === proj.id ? { ...p, techStack: val } : p
                                ),
                              }));
                            }}
                            className="border border-border rounded-md px-2.5 py-1 text-xs bg-surface"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-neutral-600 block">Bullet Points</label>
                          {proj.bullets.map((bullet, bIdx) => (
                            <textarea
                              key={bIdx}
                              rows={2}
                              value={bullet}
                              onChange={(e) => {
                                const val = e.target.value;
                                setResume((prev) => ({
                                  ...prev,
                                  projects: prev.projects.map((p) =>
                                    p.id === proj.id
                                      ? {
                                          ...p,
                                          bullets: p.bullets.map((b, i) =>
                                            i === bIdx ? val : b
                                          ),
                                        }
                                      : p
                                  ),
                                }));
                              }}
                              className="w-full border border-border rounded-md p-2 text-xs bg-surface mb-1"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 6. Education */}
                {activeTab === 'education' && (
                  <div className="space-y-4 text-xs">
                    <h3 className="font-bold text-sm text-neutral-900">Education Details</h3>
                    {resume.education.map((ed, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-3 space-y-2 bg-canvas">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Institution / College"
                            value={ed.institution}
                            onChange={(e) => {
                              const val = e.target.value;
                              setResume((prev) => ({
                                ...prev,
                                education: prev.education.map((item, i) =>
                                  i === idx ? { ...item, institution: val } : item
                                ),
                              }));
                            }}
                            aria-label="Institution"
                            className="border border-border rounded-md px-2.5 py-1 text-xs bg-surface"
                          />
                          <input
                            type="text"
                            placeholder="Degree & Major"
                            value={ed.degree}
                            onChange={(e) => {
                              const val = e.target.value;
                              setResume((prev) => ({
                                ...prev,
                                education: prev.education.map((item, i) =>
                                  i === idx ? { ...item, degree: val } : item
                                ),
                              }));
                            }}
                            aria-label="Degree"
                            className="border border-border rounded-md px-2.5 py-1 text-xs bg-surface"
                          />
                          <input
                            type="text"
                            placeholder="Field of Study"
                            value={ed.fieldOfStudy}
                            onChange={(e) => {
                              const val = e.target.value;
                              setResume((prev) => ({
                                ...prev,
                                education: prev.education.map((item, i) =>
                                  i === idx ? { ...item, fieldOfStudy: val } : item
                                ),
                              }));
                            }}
                            aria-label="Field of Study"
                            className="border border-border rounded-md px-2.5 py-1 text-xs bg-surface"
                          />
                          <input
                            type="text"
                            placeholder="GPA"
                            value={ed.gpa}
                            onChange={(e) => {
                              const val = e.target.value;
                              setResume((prev) => ({
                                ...prev,
                                education: prev.education.map((item, i) =>
                                  i === idx ? { ...item, gpa: val } : item
                                ),
                              }));
                            }}
                            aria-label="GPA"
                            className="border border-border rounded-md px-2.5 py-1 text-xs bg-surface"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 7. Verified Credentials */}
                {activeTab === 'credentials' && (
                  <div className="space-y-4 text-xs">
                    <h3 className="font-bold text-sm text-neutral-900">Verified Platform Credentials</h3>
                    <p className="text-neutral-500">
                      Credentials claimed from the Placement Readiness Profiler or Mock Exams.
                    </p>
                    {resume.credentials.map((cred) => (
                      <div key={cred.id} className="border border-border rounded-lg p-3 bg-canvas flex items-center justify-between">
                        <div>
                          <span className="font-bold text-neutral-900 block">{cred.title}</span>
                          <span className="text-[11px] font-mono text-neutral-500">Code: {cred.code}</span>
                        </div>
                        <Badge variant="success">Verified</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Typographic Standard ATS Preview */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="bg-surface">
              <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-neutral-700">
                  Live Typographic ATS Preview
                </CardTitle>
                <span className="text-[11px] font-semibold text-neutral-400">
                  Standard Single-Column Layout
                </span>
              </CardHeader>
              <CardContent className="p-6 overflow-x-auto">
                {/* Paper Representation */}
                <div className="bg-white text-zinc-900 rounded-sm border border-zinc-300 p-8 shadow-sm space-y-4 font-sans text-xs leading-relaxed max-w-2xl mx-auto">
                  {/* Header */}
                  <div className="text-center border-b border-zinc-300 pb-3 space-y-1">
                    <h2 className="text-xl font-bold tracking-tight uppercase text-zinc-900">
                      {resume.contact.fullName || 'YOUR NAME'}
                    </h2>
                    <div className="text-[11px] text-zinc-600 flex flex-wrap justify-center gap-x-2">
                      {resume.contact.location && <span>{resume.contact.location}</span>}
                      {resume.contact.phone && <span>• {resume.contact.phone}</span>}
                      {resume.contact.email && <span>• {resume.contact.email}</span>}
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium flex flex-wrap justify-center gap-x-3">
                      {resume.contact.githubUrl && <span>GitHub</span>}
                      {resume.contact.linkedinUrl && <span>LinkedIn</span>}
                      {resume.contact.portfolioUrl && <span>Portfolio</span>}
                    </div>
                  </div>

                  {/* Professional Summary */}
                  {resume.summary && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-0.5">
                        Professional Summary
                      </h3>
                      <p className="text-[11px] text-zinc-700 leading-normal">
                        {resume.summary}
                      </p>
                    </div>
                  )}

                  {/* Technical Skills */}
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-0.5">
                      Technical Skills
                    </h3>
                    <div className="text-[11px] space-y-0.5 text-zinc-700">
                      {resume.skills.languages.length > 0 && (
                        <div>
                          <strong className="text-zinc-900">Languages:</strong> {resume.skills.languages.join(', ')}
                        </div>
                      )}
                      {resume.skills.frameworks.length > 0 && (
                        <div>
                          <strong className="text-zinc-900">Frameworks &amp; Libraries:</strong> {resume.skills.frameworks.join(', ')}
                        </div>
                      )}
                      {resume.skills.databases.length > 0 && (
                        <div>
                          <strong className="text-zinc-900">Databases:</strong> {resume.skills.databases.join(', ')}
                        </div>
                      )}
                      {resume.skills.toolsAndCloud.length > 0 && (
                        <div>
                          <strong className="text-zinc-900">Tools &amp; Cloud:</strong> {resume.skills.toolsAndCloud.join(', ')}
                        </div>
                      )}
                      {resume.skills.coreConcepts.length > 0 && (
                        <div>
                          <strong className="text-zinc-900">Core Concepts:</strong> {resume.skills.coreConcepts.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  {resume.experience.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-0.5">
                        Experience
                      </h3>
                      {resume.experience.map((exp) => (
                        <div key={exp.id} className="space-y-0.5 text-[11px]">
                          <div className="flex justify-between font-bold text-zinc-900">
                            <span>{exp.roleTitle}</span>
                            <span className="font-normal text-zinc-600">
                              {exp.startDate} – {exp.endDate}
                            </span>
                          </div>
                          <div className="flex justify-between italic text-zinc-700">
                            <span>{exp.company}</span>
                            <span>{exp.location}</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-zinc-700 mt-1 pl-1">
                            {exp.bullets.map((b, idx) => (
                              <li key={idx} className="leading-snug">{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {resume.projects.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-0.5">
                        Technical Projects
                      </h3>
                      {resume.projects.map((proj) => (
                        <div key={proj.id} className="space-y-0.5 text-[11px]">
                          <div className="flex justify-between font-bold text-zinc-900">
                            <span>
                              {proj.title}{' '}
                              <span className="font-normal italic text-zinc-600">
                                | {proj.techStack.join(', ')}
                              </span>
                            </span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-zinc-700 mt-1 pl-1">
                            {proj.bullets.map((b, idx) => (
                              <li key={idx} className="leading-snug">{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {resume.education.length > 0 && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-0.5">
                        Education
                      </h3>
                      {resume.education.map((ed, idx) => (
                        <div key={idx} className="text-[11px] space-y-0.5">
                          <div className="flex justify-between font-bold text-zinc-900">
                            <span>{ed.institution}</span>
                            <span className="font-normal text-zinc-600">
                              {ed.startDate} – {ed.endDate}
                            </span>
                          </div>
                          <div className="flex justify-between text-zinc-700">
                            <span>{ed.degree} in {ed.fieldOfStudy}</span>
                            <span>GPA: {ed.gpa}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Verified Credentials */}
                  {resume.credentials.length > 0 && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-0.5">
                        Verified Platform Credentials
                      </h3>
                      {resume.credentials.map((cred) => (
                        <div key={cred.id} className="text-[11px] flex justify-between text-zinc-700">
                          <span><strong className="text-zinc-900">{cred.title}</strong> [Code: {cred.code}]</span>
                          <span className="text-zinc-500">{cred.issueDate}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
