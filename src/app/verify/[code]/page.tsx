'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  verifyCredential,
  type PublicVerificationItem,
} from '../../../lib/credentials-client';

export default function PublicCredentialVerifyPage() {
  const params = useParams();
  const code = (params?.code as string) || '';

  const [verification, setVerification] = useState<PublicVerificationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkCredential() {
      if (!code) return;
      try {
        setIsLoading(true);
        const data = await verifyCredential(code);
        setVerification(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Credential not found or invalid verification code',
        );
      } finally {
        setIsLoading(false);
      }
    }

    checkCredential();
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors flex items-center gap-1.5"
          >
            ← Back to Platform
          </Link>
          <span className="text-xs font-mono text-slate-400">
            Registry Lookup: {code}
          </span>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600 font-medium">
              Verifying cryptographic record...
            </p>
          </div>
        ) : error || !verification?.isValid ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-rose-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-2xl font-bold">
              ✕
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Credential Verification Failed
            </h1>
            <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
              The credential code <span className="font-mono font-bold text-slate-800">&quot;{code}&quot;</span> could not be verified against the official platform registry. It may be malformed, expired, or revoked.
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Top Verification Banner */}
            <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡</span>
                <span className="font-bold text-sm tracking-wide">
                  AUTHENTIC & CRYPTOGRAPHICALLY VERIFIED
                </span>
              </div>
              <span className="text-xs text-emerald-100 font-mono">
                Code: {verification.credentialCode}
              </span>
            </div>

            {/* Certificate Body */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* Header Title */}
              <div className="text-center space-y-2">
                <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">
                  Autonomous Technical Assessment Authority
                </p>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  {verification.title}
                </h1>
                <p className="text-xs text-slate-500">
                  Career Readiness & Technical Proficiency Certification
                </p>
              </div>

              {/* Recipient Details */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  Verified Candidate
                </span>
                <div className="text-2xl font-bold text-primary-900">
                  {verification.recipientName}
                </div>
                <div className="inline-flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Grade: {verification.grade}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-900 border border-primary-200">
                    Composite: {verification.compositeScore.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Performance Breakdown Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-white">
                  <span className="text-xs text-slate-400 block mb-1">
                    Timed Assessment Clearance
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Standardized Mock Test
                    </span>
                    <span className="text-base font-bold text-emerald-700">
                      ✓ {verification.mockTestScore.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-white">
                  <span className="text-xs text-slate-400 block mb-1">
                    Socratic AI Screening Clearance
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Technical Dialogue
                    </span>
                    <span className="text-base font-bold text-emerald-700">
                      ✓ {verification.interviewScore.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Competencies */}
              {verification.competencies && verification.competencies.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Validated Engineering Competencies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {verification.competencies.map((comp, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                      >
                        ✓ {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tamper-Evident Security Footer */}
              <div className="pt-6 border-t border-slate-100 space-y-2 text-xs text-slate-400">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                  <span>
                    Issuance Timestamp:{' '}
                    <strong className="text-slate-600">
                      {new Date(verification.issuedAt).toUTCString()}
                    </strong>
                  </span>
                  <span className="font-mono text-[10px]">
                    SHA-256 HMAC Verified
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-[10px] text-slate-500 break-all border border-slate-100">
                  Fingerprint: {verification.verificationHash}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
