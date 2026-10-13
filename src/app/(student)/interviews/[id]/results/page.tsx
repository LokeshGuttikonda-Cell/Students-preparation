'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getInterviewSession,
  type InterviewSessionData,
} from '../../../../../lib/interview-client';
import { Button } from '../../../../../components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Search,
} from 'lucide-react';
import {
  speakText,
  isSpeechSynthesisSupported,
  analyzeSpeechFluency,
} from '../../../../../lib/speech';
import { VoiceWaveform } from '../../../../../components/interview/VoiceWaveform';
import {
  trackEvent,
  TelemetryEventType,
  triggerFeedbackPrompt,
  FeedbackContextTrigger,
} from '../../../../../lib/telemetry-client';

const SYSTEMS_ENGINEERING_KEYWORDS = [
  'idempotency', 'idempotent', 'sharding', 'shard', 'partitioning', 'partition',
  'replication', 'replica', 'consensus', 'raft', 'paxos', 'concurrency', 'mutex',
  'deadlock', 'backpressure', 'circuit breaker', 'latency', 'throughput',
  'acid', 'mvcc', 'isolation', 'durability', 'cache', 'caching', 'redis',
  'b-tree', 'lsm-tree', 'wal', 'write-ahead', 'docker', 'container',
  'kubernetes', 'canary', 'blue/green', 'observability', 'telemetry',
  'quorum', 'two-phase commit', 'bloom filter', 'hash ring', 'dns',
  'grpc', 'protobuf', 'zero-copy', 'epoll', 'event loop', 'asynchronous',
  'rate limiting', 'token bucket', 'eventual consistency', 'cap theorem',
];

export default function InterviewResultsPage() {
  const params = useParams();
  const interviewId = params.id as string;

  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [stopAudioFn, setStopAudioFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAudio = (messageId: string, text: string) => {
    if (!isSpeechSynthesisSupported()) return;

    if (playingMessageId === messageId) {
      stopAudioFn?.();
      setPlayingMessageId(null);
      setStopAudioFn(null);
      return;
    }
    stopAudioFn?.();
    const stop = speakText(text, {
      onStart: () => setPlayingMessageId(messageId),
      onEnd: () => {
        setPlayingMessageId(null);
        setStopAudioFn(null);
      },
      onError: () => {
        setPlayingMessageId(null);
        setStopAudioFn(null);
      },
    });
    setStopAudioFn(() => stop);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getInterviewSession(interviewId);
        setSession(data);
        void trackEvent(TelemetryEventType.INTERVIEW_COMPLETED, {
          interviewId,
          roleSlug: data.roleTrack?.slug || 'software-engineer',
          score: data.overallScore ?? 0,
        });
        triggerFeedbackPrompt(FeedbackContextTrigger.MOCK_INTERVIEW, {
          interviewId,
          roleSlug: data.roleTrack?.slug || 'software-engineer',
          score: data.overallScore ?? 0,
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load interview evaluation results',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [interviewId]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#040711] text-slate-100">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(163,230,53,0.3)]" />
          <p className="text-sm font-semibold text-slate-400 font-mono tracking-wider">
            Generating Technical Interview Evaluation Scorecard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#040711] p-6">
        <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4 backdrop-blur-xl shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-100">Scorecard Not Found</h2>
          <p className="text-sm text-slate-400">
            {error || 'Unable to retrieve this interview session.'}
          </p>
          <Link href="/interviews">
            <Button variant="primary" className="bg-lime-400 hover:bg-lime-300 text-black font-bold shadow-[0_0_15px_rgba(163,230,53,0.3)] border-0">
              Return to Interviews Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const overallScore = session.overallScore ?? 0;
  const technicalScore = session.technicalScore ?? 0;
  const clarityScore = session.clarityScore ?? 0;
  const isPassed = overallScore >= 75;

  // Stages breakdown
  const stageWeights: Record<string, number> = {
    INTRODUCTION: 25,
    TECHNICAL_DRILL: 50,
    SCENARIO_DESIGN: 75,
    WRAPUP: 100,
  };
  const stageCompletionScore = stageWeights[session.currentStage] ?? 50;

  // Turns
  const candidateTurns = session.messages.filter((m) => m.sender === 'CANDIDATE');
  const filteredMessages = session.messages.filter((m) => {
    if (filterStage === 'ALL') return true;
    if (filterStage === 'FEEDBACK_ONLY') {
      return m.sender === 'CANDIDATE' && !!m.technicalFeedback;
    }
    return m.stage === filterStage;
  });

  // Speech & Acoustic Diagnostics
  const candidateWordCount = candidateTurns.reduce((acc, m) => {
    const words = m.content.trim().split(/\s+/).filter(Boolean).length;
    return acc + words;
  }, 0);

  const startMs = new Date(session.startedAt).getTime();
  const endMs = session.completedAt
    ? new Date(session.completedAt).getTime()
    : startMs + (session.targetDurationMinutes || 15) * 60000;
  const elapsedMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));
  const speakingPaceWpm = Math.max(1, Math.round(candidateWordCount / elapsedMinutes));

  let cadenceRating = 'Optimal Technical Cadence';
  let cadenceColor = 'text-lime-300 bg-lime-400/10 border-lime-400/30';
  if (speakingPaceWpm < 100) {
    cadenceRating = 'Deliberate / Paused';
    cadenceColor = 'text-amber-300 bg-amber-500/15 border-amber-500/30';
  } else if (speakingPaceWpm > 165) {
    cadenceRating = 'Rapid Delivery';
    cadenceColor = 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30';
  }

  const avgWordsPerTurn = candidateTurns.length > 0
    ? Math.round(candidateWordCount / candidateTurns.length)
    : 0;

  const candidateFullText = candidateTurns.map((t) => t.content.toLowerCase()).join(' ');
  const detectedKeyphrases = SYSTEMS_ENGINEERING_KEYWORDS.filter((kw) => {
    const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    return new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, 'i').test(candidateFullText);
  });

  const fluencyAnalysis = analyzeSpeechFluency(candidateFullText, elapsedMinutes);

  let fluencyBadgeColor = 'text-lime-300 bg-lime-400/15 border-lime-400/30';
  if (fluencyAnalysis.fluencyGrade === 'PROFICIENT') {
    fluencyBadgeColor = 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30';
  } else if (fluencyAnalysis.fluencyGrade === 'CONVERSATIONAL') {
    fluencyBadgeColor = 'text-amber-300 bg-amber-500/15 border-amber-500/30';
  } else if (fluencyAnalysis.fluencyGrade === 'NEEDS_REVISION') {
    fluencyBadgeColor = 'text-rose-300 bg-rose-500/15 border-rose-500/30';
  }

  interface TurnArticulationTelemetry {
    turnNumber: number;
    turnId: string;
    stage: string;
    wordCount: number;
    fillerCount: number;
    fillerWords: string[];
    keywords: string[];
    turnSummaryTip: string;
  }

  const turnTelemetryList: TurnArticulationTelemetry[] = candidateTurns.map((turn, idx) => {
    const textLower = turn.content.toLowerCase();
    const words = turn.content.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Detect fillers in this specific turn
    const detectedFillers: string[] = [];
    const fillerPatterns = [
      /\b(basically)\b/gi,
      /\b(actually)\b/gi,
      /\b(literally)\b/gi,
      /\b(like)\b/gi,
      /\b(you know)\b/gi,
      /\b(i mean)\b/gi,
      /\b(sort of)\b/gi,
      /\b(kind of)\b/gi,
      /\b(um+)\b/gi,
      /\b(uh+)\b/gi,
    ];
    for (const pat of fillerPatterns) {
      const matches = turn.content.match(pat);
      if (matches) {
        for (const m of matches) {
          detectedFillers.push(m.toLowerCase());
        }
      }
    }

    // Detect keywords in this specific turn
    const turnKeywords = SYSTEMS_ENGINEERING_KEYWORDS.filter((kw) => {
      const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      return new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, 'i').test(textLower);
    });

    let tip = 'Optimal concise technical delivery';
    if (detectedFillers.length > 2) {
      tip = 'High filler concentration: recommend deliberate pauses before answering';
    } else if (detectedFillers.length > 0) {
      tip = `Minor filler usage (${detectedFillers.length}): replace conversational filler with concrete facts`;
    } else if (turnKeywords.length >= 2) {
      tip = 'High-density systems terminology with zero fillers: exemplary technical eloquence';
    } else if (wordCount < 15) {
      tip = 'Concise answer: consider elaborating on production edge cases or trade-offs';
    }

    return {
      turnNumber: turn.turnNumber || idx + 1,
      turnId: turn.id,
      stage: turn.stage,
      wordCount,
      fillerCount: detectedFillers.length,
      fillerWords: detectedFillers,
      keywords: turnKeywords,
      turnSummaryTip: tip,
    };
  });

  return (
    <div className="min-h-dvh flex flex-col bg-[#040711] text-slate-100">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#060b18]/80 backdrop-blur-xl sticky top-0 z-30 shadow-lg">
        <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/interviews"
              className="text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Hub</span>
            </Link>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {session.roleTrack.name} — Technical Interview Scorecard
              </h1>
              <span className="text-xs font-mono font-bold text-lime-300 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/30">
                Socratic Evaluation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/interviews">
              <Button variant="primary" size="sm" className="bg-lime-400 hover:bg-lime-300 text-black font-bold shadow-[0_0_15px_rgba(163,230,53,0.3)] border-0">
                Start New Interview
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-content mx-auto px-6 py-8 w-full space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-lime-400 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/interviews" className="hover:text-lime-400 transition-colors">
            Technical Interviews
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Evaluation Scorecard</span>
        </div>

        {/* Hero Performance Card */}
        <section className="bg-[#0a0f1d]/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                    isPassed
                      ? 'bg-lime-400/15 text-lime-300 border-lime-400/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {isPassed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                      <span>Technical Screening Cleared</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Revision Recommended</span>
                    </>
                  )}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Conducted on {new Date(session.startedAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                {session.roleTrack.name} Performance Evaluation
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                {session.feedbackSummary ||
                  `Socratic assessment evaluating core engineering capabilities, architectural triage, and verbal problem-solving for the ${session.roleTrack.name} career track.`}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                  Target Duration: <strong className="text-slate-200 font-mono">{session.targetDurationMinutes} mins</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                  Candidate Turns: <strong className="text-slate-200 font-mono">{candidateTurns.length} turns</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                  Stage Reached: <strong className="text-slate-200 font-mono">{session.currentStage}</strong>
                </span>
              </div>
            </div>

            {/* Score Radial / Badge */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#060b18] border border-white/10 min-w-[200px] text-center shrink-0 shadow-lg">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1 font-mono">
                Overall Rating
              </span>
              <div
                className={`text-5xl font-black tracking-tight tabular-nums ${
                  isPassed ? 'text-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.2)]' : 'text-amber-400'
                }`}
              >
                {overallScore}%
              </div>
              <span className="text-xs font-semibold text-slate-400 mt-2">
                {isPassed ? 'Role-Ready Benchmark' : 'Needs Practice'}
              </span>
            </div>
          </div>
        </section>

        {/* Multi-Axis Rubrics Matrix */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100">
            Multi-Axis Technical Competency Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Axis 1: Technical Domain Accuracy */}
            <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Domain Accuracy
                </span>
                <span className="text-base font-bold text-cyan-400 tabular-nums font-mono">
                  {technicalScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)] rounded-full transition-all duration-500"
                  style={{ width: `${technicalScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates correct identification of runtime internals, memory constraints, and failure modes.
              </p>
            </div>

            {/* Axis 2: Communication & Clarity */}
            <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Articulation Clarity
                </span>
                <span className="text-base font-bold text-lime-400 tabular-nums font-mono">
                  {clarityScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)] rounded-full transition-all duration-500"
                  style={{ width: `${clarityScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Measures precision, structured trade-off reasoning, and verbal clarity under evaluator probing.
              </p>
            </div>

            {/* Axis 3: Stage Progression & Socratic Depth */}
            <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Socratic Depth
                </span>
                <span className="text-base font-bold text-emerald-400 tabular-nums font-mono">
                  {stageCompletionScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] rounded-full transition-all duration-500"
                  style={{ width: `${stageCompletionScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Indicates completion through high-scale architectural design and wrap-up triage rounds.
              </p>
            </div>

            {/* Axis 4: Speech Delivery & Cadence */}
            <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Speech Cadence
                </span>
                <span className="text-base font-bold text-purple-400 tabular-nums font-mono">
                  {speakingPaceWpm} WPM
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((speakingPaceWpm / 180) * 100))}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cadenceRating} ({avgWordsPerTurn} words/turn average across {candidateTurns.length} turns).
              </p>
            </div>
          </div>
        </section>

        {/* Verbal Articulation & Systems Vocabulary Telemetry */}
        <section className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-5 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.5)]" />
              <h3 className="font-bold text-base text-slate-100">
                Verbal Articulation & Systems Vocabulary Telemetry
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-full font-bold border ${cadenceColor}`}>
                {cadenceRating} ({speakingPaceWpm} WPM)
              </span>
              <span className="px-2.5 py-1 rounded-full font-bold bg-white/5 border border-white/10 text-slate-400 font-mono">
                {candidateWordCount} Total Words
              </span>
            </div>
          </div>

          {/* Articulation Fluency & Filler-Word Diagnostic Subcard */}
          <div className="p-4 rounded-xl bg-[#060b18] border border-white/10 space-y-3 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Articulation Fluency Score:
                </span>
                <span className="text-sm font-bold text-slate-200 tabular-nums font-mono">
                  {fluencyAnalysis.fluencyScore}%
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${fluencyBadgeColor}`}>
                  {fluencyAnalysis.fluencyGrade}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Filler Density:{' '}
                <strong className="text-slate-200 font-mono">
                  {fluencyAnalysis.fillerDensityPer100} per 100 words
                </strong>{' '}
                ({fluencyAnalysis.fillerCount} total)
              </div>
            </div>

            {Object.keys(fluencyAnalysis.fillerBreakdown).length > 0 ? (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  Detected Conversational Filler Phrases:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(fluencyAnalysis.fillerBreakdown).map(([phrase, count]) => (
                    <span
                      key={phrase}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    >
                      <span>&ldquo;{phrase}&rdquo;</span>
                      <span className="font-bold tabular-nums font-mono">×{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-lime-300 font-medium flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <span>Zero conversational fillers detected. Excellent technical eloquence!</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">
              Identified Core Systems Engineering Terms & Concepts ({detectedKeyphrases.length}):
            </span>
            {detectedKeyphrases.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {detectedKeyphrases.map((term) => (
                  <span
                    key={term}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-200 hover:border-cyan-400/40 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {term}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Reinforce verbal usage of academic systems terminology during scenario explanations.
              </p>
            )}
          </div>

          {/* Turn-by-Turn Articulation & Cadence Progression Telemetry */}
          {turnTelemetryList.length > 0 && (
            <div
              data-testid="turn-articulation-progression-hud"
              className="p-4 rounded-xl bg-[#060b18] border border-white/10 space-y-4 shadow-inner"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    Turn-by-Turn Articulation &amp; Cadence Progression
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-400">Turns Evaluated:</span>
                  <span className="font-bold text-slate-200 tabular-nums font-mono">{turnTelemetryList.length}</span>
                  <span className="text-white/20">|</span>
                  <span className="text-slate-400">Filler Trajectory:</span>
                  <span className="font-bold text-lime-300 bg-lime-400/10 border border-lime-400/30 px-2 py-0.5 rounded text-[11px] font-mono">
                    Turn 1 ({turnTelemetryList[0].fillerCount}) → Turn {turnTelemetryList.length} ({turnTelemetryList[turnTelemetryList.length - 1].fillerCount})
                  </span>
                </div>
              </div>

              {/* Visual SVG Turn Cadence & Filler Progression Spark-Chart */}
              <div className="w-full bg-[#040711] border border-white/10 rounded-lg p-3 overflow-x-auto shadow-inner">
                <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                  <span>Candidate Verbal Output (Bars = Words, Points = Filler Count)</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Words / Turn
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Fillers
                    </span>
                  </div>
                </div>

                <svg viewBox="0 0 500 120" className="w-full min-w-[360px] h-28 select-none font-sans">
                  {/* Horizontal Grid lines */}
                  <line x1="30" y1="20" x2="480" y2="20" stroke="#1e293b" strokeWidth="1" />
                  <line x1="30" y1="55" x2="480" y2="55" stroke="#1e293b" strokeWidth="1" />
                  <line x1="30" y1="90" x2="480" y2="90" stroke="#334155" strokeWidth="1" />

                  {/* Draw each turn */}
                  {(() => {
                    const maxWords = Math.max(1, ...turnTelemetryList.map((t) => t.wordCount));
                    const maxFillers = Math.max(1, ...turnTelemetryList.map((t) => t.fillerCount));
                    const chartWidth = 430;
                    const stepX = chartWidth / Math.max(1, turnTelemetryList.length);

                    return (
                      <g>
                        {/* Connecting line for filler count progression */}
                        {turnTelemetryList.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray="3 2"
                            points={turnTelemetryList
                              .map((t, idx) => {
                                const cx = 45 + idx * stepX + 10;
                                const cy = 90 - (t.fillerCount / maxFillers) * 65;
                                return `${cx},${cy}`;
                              })
                              .join(' ')}
                          />
                        )}

                        {turnTelemetryList.map((t, idx) => {
                          const barX = 35 + idx * stepX;
                          const barWidth = Math.max(16, Math.min(36, stepX - 16));
                          const barHeight = Math.max(8, (t.wordCount / maxWords) * 70);
                          const barY = 90 - barHeight;

                          const fillerCy = 90 - (t.fillerCount / maxFillers) * 65;
                          const fillerCx = barX + barWidth / 2;

                          return (
                            <g key={t.turnId}>
                              {/* Word volume bar */}
                              <rect
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                rx="3"
                                fill="#06b6d4"
                                opacity="0.85"
                              />
                              <text
                                x={barX + barWidth / 2}
                                y={barY - 4}
                                textAnchor="middle"
                                className="text-[9px] font-mono font-bold fill-cyan-300 select-none"
                              >
                                {t.wordCount}w
                              </text>

                              {/* Filler count dot */}
                              <circle
                                cx={fillerCx}
                                cy={fillerCy}
                                r={t.fillerCount > 0 ? '5' : '3'}
                                fill={t.fillerCount > 0 ? '#f59e0b' : '#a3e635'}
                                stroke="#040711"
                                strokeWidth="1.5"
                              />
                              {t.fillerCount > 0 && (
                                <text
                                  x={fillerCx}
                                  y={fillerCy - 7}
                                  textAnchor="middle"
                                  className="text-[8px] font-bold fill-amber-400 select-none"
                                >
                                  {t.fillerCount}f
                                </text>
                              )}

                              {/* Turn label on x-axis */}
                              <text
                                x={barX + barWidth / 2}
                                y="105"
                                textAnchor="middle"
                                className="text-[9px] font-mono font-semibold fill-slate-400 select-none"
                              >
                                T{t.turnNumber}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Turn-by-Turn Detailed Telemetry Breakdown Cards */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Dialogue Turn Telemetry Breakdown:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {turnTelemetryList.map((t) => (
                    <div
                      key={t.turnId}
                      className="p-2.5 rounded-lg bg-[#0a0f1d] border border-white/10 space-y-1.5 text-xs shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-lime-300 bg-lime-400/10 border border-lime-400/30 px-1.5 py-0.5 rounded text-[11px]">
                            Turn #{t.turnNumber}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {t.stage.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 tabular-nums font-mono">
                          {t.wordCount} words
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        <span
                          className={`px-1.5 py-0.5 rounded font-medium border inline-flex items-center gap-1 ${
                            t.fillerCount === 0
                              ? 'bg-lime-400/15 text-lime-300 border-lime-400/30 font-bold'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {t.fillerCount === 0 ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-lime-400" />
                              <span>0 fillers</span>
                            </>
                          ) : (
                            <span>{t.fillerCount} filler{t.fillerCount > 1 ? 's' : ''}</span>
                          )}
                        </span>

                        {t.keywords.length > 0 && (
                          <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-medium">
                            {t.keywords.length} systems term{t.keywords.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {t.fillerWords.length > 0 && (
                        <div className="text-[10px] text-amber-400 flex items-center gap-1 flex-wrap">
                          <span>Fillers:</span>
                          {t.fillerWords.map((fw, fwIdx) => (
                            <span key={fwIdx} className="font-semibold italic">&ldquo;{fw}&rdquo;</span>
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400 italic leading-relaxed pt-0.5">
                        {t.turnSummaryTip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Strengths & Targeted Growth Areas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Strengths */}
          <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.5)]" />
              <h3 className="font-bold text-base text-slate-100">
                Demonstrated Engineering Strengths
              </h3>
            </div>
            {session.strengths && session.strengths.length > 0 ? (
              <ul className="space-y-2.5 text-xs text-slate-200">
                {session.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">
                Continue practicing technical drills to establish consistent strengths.
              </p>
            )}
          </div>

          {/* Growth Areas */}
          <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <h3 className="font-bold text-base text-slate-100">
                Targeted Areas for Technical Revision
              </h3>
            </div>
            {session.growthAreas && session.growthAreas.length > 0 ? (
              <div className="space-y-3">
                <ul className="space-y-2.5 text-xs text-slate-200">
                  {session.growthAreas.map((ga, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed text-amber-200">{ga}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 flex items-center gap-3">
                  <Link href="/practice">
                    <Button variant="secondary" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                      <span>Revise in Practice Mode</span>
                      <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                    </Button>
                  </Link>
                  <Link href={`/roles/${session.roleTrack.slug}`}>
                    <Button variant="secondary" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                      <span>View Role Syllabus</span>
                      <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No immediate critical gaps identified. Keep reinforcing advanced concepts!
              </p>
            )}
          </div>
        </section>

        {/* Turn-by-Turn Socratic Dialogue Review */}
        <section className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Turn-by-Turn Socratic Dialogue Review
              </h3>
              <p className="text-xs text-slate-400">
                Inspect every conversational turn, evaluator critique, and senior-level benchmark model answers.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#060b18] border border-white/10 rounded-xl text-xs overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Turns' },
                { id: 'FEEDBACK_ONLY', label: 'Evaluator Insights Only' },
                { id: 'INTRODUCTION', label: 'Intro' },
                { id: 'TECHNICAL_DRILL', label: 'Drill' },
                { id: 'SCENARIO_DESIGN', label: 'Scenario' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterStage(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    filterStage === f.id
                      ? 'bg-lime-400 text-black font-bold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dialogue Stream */}
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400 bg-[#0a0f1d] border border-white/10 rounded-2xl">
                No turns matching the selected filter.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isAi = msg.sender === 'AI_INTERVIEWER';

                return (
                  <div
                    key={msg.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isAi
                        ? 'bg-[#0d1527]/90 border-white/10 shadow-lg'
                        : 'bg-[#060b18]/90 border-lime-400/30 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-md ${
                            isAi ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' : 'bg-lime-400 text-black'
                          }`}
                        >
                          {isAi ? 'AI' : 'You'}
                        </span>
                        <span className="font-bold text-xs text-slate-200">
                          {isAi ? 'Socratic Evaluator' : 'Candidate Response'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono">
                          {msg.stage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleAudio(msg.id, msg.content)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-white/5 border border-white/10 hover:border-lime-400/40 hover:text-lime-300 transition-colors cursor-pointer text-slate-300"
                          title={playingMessageId === msg.id ? 'Stop Turn Audio' : 'Listen to Turn Audio'}
                          aria-label={playingMessageId === msg.id ? 'Stop Turn Audio' : 'Listen to Turn Audio'}
                        >
                          {playingMessageId === msg.id ? (
                            <>
                              <span className="w-2 h-2 rounded-xs bg-rose-500 animate-pulse" />
                              <span className="text-rose-400 font-semibold">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-lime-400" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                        <span className="text-[11px] text-slate-400 tabular-nums font-mono">
                          Turn #{msg.turnNumber}
                        </span>
                      </div>
                    </div>

                    {playingMessageId === msg.id && (
                      <div className="mb-3 pl-8">
                        <VoiceWaveform state="speaking" showTelemetry={false} className="h-6" />
                      </div>
                    )}

                    <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap pl-8">
                      {msg.content}
                    </div>

                    {/* Socratic Feedback and Benchmark for Candidate Turns */}
                    {!isAi && (msg.technicalFeedback || msg.suggestedBetterAnswer) && (
                      <div className="mt-4 ml-8 p-4 rounded-xl bg-[#040711] border border-lime-400/30 space-y-2 text-xs">
                        {msg.technicalFeedback && (
                          <div className="space-y-1">
                            <span className="font-bold text-lime-300 flex items-center gap-1.5">
                              <Search className="w-3.5 h-3.5 text-lime-400" />
                              <span>Evaluator Feedback</span>
                            </span>
                            <p className="text-slate-300 leading-relaxed">
                              {msg.technicalFeedback}
                            </p>
                          </div>
                        )}

                        {msg.suggestedBetterAnswer && (
                          <div className="pt-2 border-t border-white/10">
                            <details className="cursor-pointer">
                              <summary className="font-bold text-lime-300 hover:underline">
                                View Socratic Benchmark Ideal Response Pointer
                              </summary>
                              <div className="mt-2 p-3 rounded-lg bg-[#0a0f1d] border border-white/10 text-slate-200 leading-relaxed">
                                {msg.suggestedBetterAnswer}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Bottom Actions CTA */}
        <section className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Evaluation stored permanently in candidate profile.
          </div>
          <div className="flex items-center gap-3">
            <Link href="/interviews">
              <Button variant="secondary" size="md" className="bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                <span>Interviews Hub</span>
              </Button>
            </Link>
            <Link href="/practice">
              <Button variant="primary" size="md" className="bg-lime-400 hover:bg-lime-300 text-black font-bold shadow-[0_0_15px_rgba(163,230,53,0.3)] border-0">
                <span>Practice Target Topics</span>
                <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
