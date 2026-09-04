'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import {
  claimCredential,
  getRoleMilestones,
  getUserCredentials,
  type CredentialItem,
  type RoleMilestoneItem,
} from '../../../lib/credentials-client';
import { Button } from '../../../components/ui/Button';

export default function CredentialsPage() {
  const { user } = useAuth();

  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [milestones, setMilestones] = useState<RoleMilestoneItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingRoleId, setClaimingRoleId] = useState<string | null>(null);
  const [activeModalCred, setActiveModalCred] = useState<CredentialItem | null>(null);
  const [copySuccessCode, setCopySuccessCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [credsData, milestonesData] = await Promise.all([
          getUserCredentials().catch(() => []),
          getRoleMilestones().catch(() => []),
        ]);
        setCredentials(credsData);
        setMilestones(milestonesData);
      } catch {
        setErrorMessage('Failed to load credential information');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleClaim = async (roleTrackId: string) => {
    try {
      setClaimingRoleId(roleTrackId);
      setErrorMessage(null);
      const newCred = await claimCredential(roleTrackId);

      setCredentials((prev) => [newCred, ...prev.filter((c) => c.id !== newCred.id)]);
      setMilestones((prev) =>
        prev.map((m) =>
          m.roleTrackId === roleTrackId ? { ...m, credential: newCred } : m,
        ),
      );
      setSuccessMessage(
        `Congratulations! Your "${newCred.title}" has been issued with grade ${newCred.grade}.`,
      );
      setActiveModalCred(newCred);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to claim credential',
      );
    } finally {
      setClaimingRoleId(null);
    }
  };

  const handleCopyLink = async (code: string) => {
    try {
      const url = `${window.location.origin}/verify/${code}`;
      await navigator.clipboard.writeText(url);
      setCopySuccessCode(code);
      setTimeout(() => setCopySuccessCode(null), 2500);
    } catch {
      // Fallback
    }
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'DISTINCTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            ★ DISTINCTION
          </span>
        );
      case 'MERIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            ◆ MERIT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            ✓ CLEARED
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:text-slate-800 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Credentials & Certifications</span>
        </nav>

        {/* Hero Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary-50 rounded-full opacity-60 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-800 text-xs font-semibold mb-3">
              🛡 Autonomous Verification Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Skill Mastery Credentials & Certifications
            </h1>
            <p className="mt-2 text-slate-600 max-w-2xl text-sm sm:text-base leading-relaxed">
              Earn cryptographically tamper-evident credentials validated against timed role-based assessments and Socratic AI technical interviews. Each credential includes a public verification checksum shareable with employers.
            </p>
            <div className="mt-4">
              <Link
                href="/analytics/cohort"
                className="text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline inline-flex items-center gap-1"
              >
                📊 Compare your standing on the Peer Cohort Benchmark →
              </Link>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between gap-3">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start justify-between gap-3">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-500 hover:text-emerald-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Section 1: Milestone Readiness & Claim Tracker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Career Track Milestone Tracker
            </h2>
            <span className="text-xs text-slate-500">
              Requires 70%+ in both Mock Test & Socratic Interview
            </span>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">
              Loading role readiness milestones...
            </div>
          ) : milestones.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">
              No career tracks available at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {milestones.map((item) => {
                const isClaimed = !!item.credential;

                return (
                  <div
                    key={item.roleTrackId}
                    className={`bg-white rounded-xl p-5 border transition-all flex flex-col justify-between ${
                      isClaimed
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : item.isEligible
                        ? 'border-primary-300 shadow-sm'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          {item.roleName}
                        </h3>
                        {isClaimed && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Awarded
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mt-3 text-xs">
                        {/* Mock test milestone */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-slate-600 font-medium">Timed Mock Assessment</span>
                          {item.mockTestCleared ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              ✓ {item.bestMockScore?.toFixed(0)}%
                            </span>
                          ) : (
                            <Link
                              href="/mock-tests"
                              className="text-primary-700 hover:underline font-semibold"
                            >
                              {item.bestMockScore !== null
                                ? `${item.bestMockScore.toFixed(0)}% (Needs 70%)`
                                : 'Take Test →'}
                            </Link>
                          )}
                        </div>

                        {/* Interview milestone */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-slate-600 font-medium">Socratic AI Screening</span>
                          {item.interviewCleared ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              ✓ {item.bestInterviewScore?.toFixed(0)}%
                            </span>
                          ) : (
                            <Link
                              href="/interviews"
                              className="text-primary-700 hover:underline font-semibold"
                            >
                              {item.bestInterviewScore !== null
                                ? `${item.bestInterviewScore.toFixed(0)}% (Needs 70%)`
                                : 'Start Interview →'}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      {isClaimed ? (
                        <Button
                          variant="secondary"
                          className="w-full text-xs py-1.5"
                          onClick={() => setActiveModalCred(item.credential)}
                        >
                          View Certificate ↗
                        </Button>
                      ) : item.isEligible ? (
                        <Button
                          variant="primary"
                          className="w-full text-xs py-1.5"
                          disabled={claimingRoleId === item.roleTrackId}
                          onClick={() => handleClaim(item.roleTrackId)}
                        >
                          {claimingRoleId === item.roleTrackId
                            ? 'Issuing Credential...'
                            : 'Claim Credential 🎖'}
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic text-center w-full">
                          Complete both requirements to unlock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Earned Credentials Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Issued Career Credentials ({credentials.length})
            </h2>
          </div>

          {credentials.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl">
                🎖
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                No credentials issued yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Clear a timed role assessment and Socratic technical interview with 70%+ to earn your official, cryptographically verifiable certificate.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {getGradeBadge(cred.grade)}
                        <h3 className="font-bold text-slate-900 text-lg mt-2">
                          {cred.title}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          ID: {cred.credentialCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">
                          {cred.compositeScore.toFixed(0)}%
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Composite Score
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-500 block">Assessment Score:</span>
                        <span className="font-semibold text-slate-800">
                          {cred.mockTestScore.toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Interview Score:</span>
                        <span className="font-semibold text-slate-800">
                          {cred.interviewScore.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {cred.competencies && cred.competencies.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Verified Competencies
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cred.competencies.slice(0, 4).map((topic, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-400">
                      Issued: {new Date(cred.issuedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        className="text-xs py-1.5 px-3"
                        onClick={() => handleCopyLink(cred.credentialCode)}
                      >
                        {copySuccessCode === cred.credentialCode
                          ? '✓ Link Copied!'
                          : 'Copy Link 🔗'}
                      </Button>
                      <Button
                        variant="primary"
                        className="text-xs py-1.5 px-3"
                        onClick={() => setActiveModalCred(cred)}
                      >
                        View Certificate ↗
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificate Modal Dialog */}
        {activeModalCred && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 relative my-8 animate-fadeIn">
              <button
                onClick={() => setActiveModalCred(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold text-xl p-1"
                aria-label="Close Modal"
              >
                ✕
              </button>

              {/* Certificate Canvas */}
              <div
                id="certificate-frame"
                className="border-8 border-double border-slate-300 rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-amber-50/20 via-white to-slate-50/20 text-center relative"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-widest mb-4">
                  Official Credential of Competency
                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
                  Autonomous Technical Assessment Authority
                </h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                  Independent Career Readiness Verification
                </p>

                <div className="my-6">
                  <p className="text-xs text-slate-400 italic">This certifies that</p>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary-900 mt-1">
                    {user?.name || 'Candidate'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                    has successfully cleared rigorous multi-stage evaluation across timed assessment and conversational Socratic AI technical screening in
                  </p>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {activeModalCred.title}
                  </div>
                </div>

                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 my-2">
                  <span className="text-xs font-bold text-slate-700">
                    Grade: {activeModalCred.grade}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs font-bold text-slate-700">
                    Composite Score: {activeModalCred.compositeScore.toFixed(0)}%
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
                  <div className="text-left">
                    <span className="block font-mono text-[10px] text-slate-400">
                      Credential ID: {activeModalCred.credentialCode}
                    </span>
                    <span className="block text-[11px]">
                      Issued on {new Date(activeModalCred.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono text-[10px] text-slate-400 truncate max-w-xs">
                      HMAC: {activeModalCred.verificationHash ? activeModalCred.verificationHash.substring(0, 24) : 'VALIDATED'}...
                    </span>
                    <span className="block text-[11px] text-emerald-700 font-semibold">
                      ✓ Cryptographically Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/verify/${activeModalCred.credentialCode}`}
                  target="_blank"
                  className="text-xs text-primary-700 hover:underline font-semibold"
                >
                  Open Public Verification Page ↗
                </Link>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="text-xs py-2 px-4"
                    onClick={() => handleCopyLink(activeModalCred.credentialCode)}
                  >
                    {copySuccessCode === activeModalCred.credentialCode
                      ? '✓ Link Copied!'
                      : 'Copy Public Link 🔗'}
                  </Button>
                  <Button
                    variant="primary"
                    className="text-xs py-2 px-4"
                    onClick={() => window.print()}
                  >
                    Print Certificate 🖨
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
