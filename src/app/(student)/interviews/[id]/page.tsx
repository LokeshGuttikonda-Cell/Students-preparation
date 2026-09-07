'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getInterviewSession,
  sendInterviewMessage,
  completeInterviewSession,
  type InterviewSessionData,
} from '../../../../lib/interview-client';
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  createMicrophoneSpectrumAnalyzer,
  isSpeechRecognitionSupported,
  analyzeSpeechFluency,
  type AudioSpectrumAnalyzerController,
} from '../../../../lib/speech';
import { VoiceWaveform, type WaveformState } from '../../../../components/interview/VoiceWaveform';
import { StageStepper } from '../../../../components/interview/StageStepper';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { ArchitectureWhiteboard } from '../../../../components/interview/ArchitectureWhiteboard';
import { ConceptDensityHUD } from '../../../../components/interview/ConceptDensityHUD';

export default function LiveInterviewRoomPage() {
  const params = useParams();
  const interviewId = params.id as string;

  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio / Voice state
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micFrequencyData, setMicFrequencyData] = useState<number[] | undefined>(undefined);

  // Countdown timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(20 * 60);

  // Architecture Whiteboard Studio state
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

  const handleWhiteboardExport = (exportedText: string) => {
    setInputText((prev) => (prev ? `${prev}\n\n${exportedText}` : exportedText));
    setIsWhiteboardOpen(false);
  };

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const speechRecognizerRef = useRef<ReturnType<typeof createSpeechRecognizer> | null>(null);
  const micAnalyzerRef = useRef<AudioSpectrumAnalyzerController | null>(null);
  const micAnimFrameRef = useRef<number | null>(null);

  const stopMicSpectrum = useCallback(() => {
    if (micAnimFrameRef.current !== null) {
      cancelAnimationFrame(micAnimFrameRef.current);
      micAnimFrameRef.current = null;
    }
    if (micAnalyzerRef.current) {
      micAnalyzerRef.current.stop();
      micAnalyzerRef.current = null;
    }
    setMicFrequencyData(undefined);
  }, []);

  const startMicSpectrum = useCallback(async () => {
    try {
      const analyzer = await createMicrophoneSpectrumAnalyzer();
      if (!analyzer) return;
      micAnalyzerRef.current = analyzer;

      const buffer = new Uint8Array(10);
      const updateFrequencies = () => {
        if (!micAnalyzerRef.current) return;
        micAnalyzerRef.current.getFrequencies(buffer);
        setMicFrequencyData(Array.from(buffer));
        micAnimFrameRef.current = requestAnimationFrame(updateFrequencies);
      };
      micAnimFrameRef.current = requestAnimationFrame(updateFrequencies);
    } catch {
      // Gracefully falls back to dynamic sine formant harmonics in VoiceWaveform
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Initialize Speech recognition & load session
  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());

    async function loadSession() {
      try {
        setIsLoading(true);
        const data = await getInterviewSession(interviewId);
        setSession(data);
        setTimeLeftSeconds(data.targetDurationMinutes * 60);

        // Speak opening greeting if in progress
        if (
          data.status === 'IN_PROGRESS' &&
          data.messages.length > 0 &&
          data.messages[0].sender === 'AI_INTERVIEWER'
        ) {
          speakText(data.messages[0].content, {
            onStart: () => setIsAiSpeaking(true),
            onEnd: () => setIsAiSpeaking(false),
          });
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load interview session',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();

    return () => {
      stopSpeaking();
      stopMicSpectrum();
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.abort();
      }
    };
  }, [interviewId, stopMicSpectrum]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, scrollToBottom]);

  // Timer countdown
  useEffect(() => {
    if (!session || session.status !== 'IN_PROGRESS') return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  // Toggle Microphone recording (Speech-to-Text)
  const toggleListening = () => {
    if (isListening) {
      speechRecognizerRef.current?.stop();
      stopMicSpectrum();
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setIsAiSpeaking(false);
    startMicSpectrum();

    const recognizer = createSpeechRecognizer({
      onStart: () => setIsListening(true),
      onEnd: () => {
        setIsListening(false);
        stopMicSpectrum();
      },
      onError: () => {
        setIsListening(false);
        stopMicSpectrum();
      },
      onResult: (transcript) => {
        setInputText((prev) => {
          const prefix = prev.trim() ? `${prev.trim()} ` : '';
          return `${prefix}${transcript}`;
        });
      },
    });

    if (recognizer) {
      speechRecognizerRef.current = recognizer;
      recognizer.start();
    }
  };

  // Send candidate turn
  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending || !session) return;

    if (isListening) {
      speechRecognizerRef.current?.stop();
      stopMicSpectrum();
      setIsListening(false);
    }
    stopSpeaking();
    setIsAiSpeaking(false);

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const res = await sendInterviewMessage(session.id, textToSend);

      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentStage: res.currentStage,
          messages: [...prev.messages, res.candidateMessage, res.aiMessage],
        };
      });

      // Speak AI response if voice audio not muted
      if (!isVoiceMuted) {
        speakText(res.aiMessage.content, {
          onStart: () => setIsAiSpeaking(true),
          onEnd: () => setIsAiSpeaking(false),
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setInputText(textToSend); // Restore text on failure
    } finally {
      setIsSending(false);
    }
  };

  // Complete interview
  const handleCompleteInterview = async () => {
    if (!session || isCompleting) return;

    stopSpeaking();
    if (isListening) {
      speechRecognizerRef.current?.stop();
    }

    try {
      setIsCompleting(true);
      const updated = await completeInterviewSession(session.id);
      setSession(updated);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to complete interview session',
      );
    } finally {
      setIsCompleting(false);
    }
  };

  // Replay AI audio
  const handleReplayLastAiMessage = () => {
    if (!session) return;
    const aiMessages = session.messages.filter((m) => m.sender === 'AI_INTERVIEWER');
    if (aiMessages.length === 0) return;

    const lastAiMsg = aiMessages[aiMessages.length - 1];
    speakText(lastAiMsg.content, {
      onStart: () => setIsAiSpeaking(true),
      onEnd: () => setIsAiSpeaking(false),
    });
  };

  // Determine waveform state
  let waveformState: WaveformState = 'idle';
  if (isListening) waveformState = 'listening';
  else if (isAiSpeaking) waveformState = 'speaking';

  // Format timer
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const isTimeLow = timeLeftSeconds < 180 && timeLeftSeconds > 0;

  // Real-time speech & articulation telemetry for candidate's active response
  const liveFluency = React.useMemo(() => {
    if (!inputText.trim()) return null;
    const elapsedMinutes = Math.max(0.5, (20 * 60 - timeLeftSeconds) / 60);
    return analyzeSpeechFluency(inputText, elapsedMinutes);
  }, [inputText, timeLeftSeconds]);

  // Real-time Socratic articulation coaching tip
  const liveCoachingTip = React.useMemo(() => {
    if (!liveFluency) return null;

    // 1. High-priority filler word remediation
    if (liveFluency.fillerCount > 0) {
      const topFiller = Object.entries(liveFluency.fillerBreakdown).sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0];

      if (topFiller === 'basically') {
        return {
          type: 'FILLER' as const,
          message:
            'Consider replacing “basically” with “Fundamentally” or “At the architectural core”.',
        };
      }
      if (topFiller === 'like') {
        return {
          type: 'FILLER' as const,
          message:
            'Consider replacing “like” with “For instance”, “Specifically”, or a direct concrete metric.',
        };
      }
      if (topFiller === 'you know' || topFiller === 'i mean') {
        return {
          type: 'FILLER' as const,
          message:
            'Replace conversational checks (“you know”, “i mean”) with authoritative affirmations like “To illustrate” or “More precisely”.',
        };
      }
      if (topFiller === 'actually' || topFiller === 'literally') {
        return {
          type: 'FILLER' as const,
          message:
            `Consider replacing “${topFiller}” with “In production”, “Empirically”, or “By system design”.`,
        };
      }
      if (topFiller === 'sort of' || topFiller === 'kind of') {
        return {
          type: 'FILLER' as const,
          message:
            `Consider replacing “${topFiller}” with “Approximately”, “Effectively”, or precise system metrics.`,
        };
      }
      if (topFiller === 'um' || topFiller === 'uh') {
        return {
          type: 'FILLER' as const,
          message:
            'Substitute verbalized hesitations (“um”, “uh”) with a deliberate 1-second pause. Silence conveys executive poise.',
        };
      }
      return {
        type: 'FILLER' as const,
        message:
          `Detected verbal crutch “${topFiller}”. Try pruning it to heighten technical authority.`,
      };
    }

    // 2. Articulation pacing coaching
    if (liveFluency.totalWords >= 12) {
      if (liveFluency.articulationPaceWpm < 100) {
        return {
          type: 'PACING' as const,
          message:
            'Deliberate delivery (<100 WPM). Strong composure; ensure you delve deeply into concurrency or fault domains before concluding.',
        };
      }
      if (liveFluency.articulationPaceWpm > 165) {
        return {
          type: 'PACING' as const,
          message:
            'Rapid articulation (>165 WPM). Moderating your pace slightly gives the evaluator time to absorb key trade-offs.',
        };
      }
      return {
        type: 'EXCELLENCE' as const,
        message:
          'Optimal technical delivery (100–165 WPM) with 0 verbal fillers. Clear executive articulation!',
      };
    }

    return null;
  }, [liveFluency]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas text-text">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-text-muted">
            Connecting to Live Socratic Interview Room...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-canvas p-6 text-center">
        <h2 className="text-xl font-bold text-text mb-2">Interview Session Not Found</h2>
        <p className="text-sm text-text-muted mb-6">
          {error || 'This session could not be retrieved.'}
        </p>
        <Link href="/interviews">
          <Button variant="primary">Return to Interviews Hub</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text">
      {/* Top Session Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-xs">
        <div className="max-w-content mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/interviews"
              className="text-xs font-bold text-text-muted hover:text-text px-2 py-1 rounded-md border border-border bg-canvas"
            >
              ← Exit Room
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-text">
                  {session.roleTrack.name}
                </span>
                <span className="text-[11px] font-semibold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                  {session.status}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper (Center on desktop) */}
          <div className="hidden lg:block">
            <StageStepper currentStage={session.currentStage} />
          </div>

          {/* Timer & Finish */}
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-lg border font-mono text-xs font-bold tabular-nums flex items-center gap-1.5 ${
                isTimeLow
                  ? 'bg-error-50 text-error-700 border-error-300 animate-pulse'
                  : 'bg-canvas text-text border-border'
              }`}
            >
              <span>⏱</span>
              <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            {session.status === 'IN_PROGRESS' && (
              <Button
                variant="primary"
                size="sm"
                disabled={isCompleting}
                onClick={handleCompleteInterview}
              >
                {isCompleting ? 'Finishing...' : 'Complete Interview'}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Stage Stepper */}
        <div className="lg:hidden border-t border-border px-4 py-2 bg-surface overflow-x-auto">
          <StageStepper currentStage={session.currentStage} />
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-content mx-auto px-4 sm:px-6 py-6 w-full grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar: Interviewer Persona & Voice Control */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                AI
              </div>
              <div>
                <h2 className="font-bold text-sm text-text">Socratic Interviewer</h2>
                <p className="text-[11px] text-text-muted">
                  {session.roleTrack.name} Evaluator
                </p>
              </div>
            </div>

            {/* Audio Waveform */}
            <div className="space-y-1">
              <VoiceWaveform
                state={waveformState}
                frequencyData={isListening ? micFrequencyData : undefined}
              />
              <div className="text-center text-[10px] font-semibold text-text-muted">
                {isAiSpeaking
                  ? 'AI Interviewer is speaking...'
                  : isListening
                  ? 'Listening to candidate voice...'
                  : 'Voice Ready (Standby)'}
              </div>
            </div>

            {/* Voice Controls */}
            <div className="pt-2 border-t border-border space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (!isVoiceMuted) stopSpeaking();
                  setIsVoiceMuted(!isVoiceMuted);
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  isVoiceMuted
                    ? 'bg-canvas text-text-muted border-border'
                    : 'bg-primary-50 text-primary-800 border-primary-200'
                }`}
              >
                <span>{isVoiceMuted ? '🔇' : '🔊'}</span>
                <span>{isVoiceMuted ? 'Voice Audio: Muted' : 'Voice Audio: Active'}</span>
              </button>

              <button
                type="button"
                onClick={handleReplayLastAiMessage}
                disabled={isAiSpeaking}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-text-muted hover:text-text border border-border bg-canvas hover:bg-canvas/80 text-center"
              >
                ↺ Replay Last Question
              </button>

              <button
                type="button"
                onClick={() => setIsWhiteboardOpen(true)}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-primary-900 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-center flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <span>📐</span>
                <span>Architecture Whiteboard</span>
              </button>
            </div>
          </div>

          {/* Stage Tips Card */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-2 text-xs">
            <h3 className="font-bold text-text flex items-center gap-1.5">
              <span>💡</span>
              <span>Stage Advisory</span>
            </h3>
            <p className="text-text-muted leading-relaxed">
              {session.currentStage === 'INTRODUCTION' &&
                'Articulate your overall background, technical toolchain, and typical operational lifecycle.'}
              {session.currentStage === 'TECHNICAL_DRILL' &&
                'Dive into low-level runtime mechanics, memory models, failure modes, and edge cases.'}
              {session.currentStage === 'SCENARIO_DESIGN' &&
                'Break down real-world high-throughput architectures, telemetry signals, and triage steps.'}
              {session.currentStage === 'WRAPUP' &&
                'Review your completed responses or ask closing technical questions about the role.'}
            </p>
          </div>
        </div>

        {/* Right Column: Dialogue Stream & Input Area */}
        <div className="lg:col-span-3 flex flex-col bg-surface border border-border rounded-2xl shadow-xs overflow-hidden h-[75vh]">
          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-canvas/30">
            {session.messages.map((msg) => {
              const isAi = msg.sender === 'AI_INTERVIEWER';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-2xl ${
                    isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                      isAi
                        ? 'bg-primary-800 text-white'
                        : 'bg-accent-700 text-white'
                    }`}
                  >
                    {isAi ? 'AI' : 'You'}
                  </div>

                  <div className="space-y-1.5">
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                        isAi
                          ? 'bg-surface border border-border text-text'
                          : 'bg-primary-700 text-white'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Turn Feedback (for candidate messages) */}
                    {!isAi && msg.technicalFeedback && (
                      <div className="p-2.5 rounded-xl bg-primary-50/70 border border-primary-200 text-xs text-primary-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>🔍</span>
                          <span>Evaluator Insight</span>
                        </div>
                        <p className="text-primary-800">{msg.technicalFeedback}</p>
                        {msg.suggestedBetterAnswer && (
                          <details className="mt-1 text-[11px] text-text-muted cursor-pointer">
                            <summary className="font-semibold text-primary-700 hover:underline">
                              View Socratic Benchmark Pointer
                            </summary>
                            <p className="mt-1 p-2 rounded bg-surface border border-border text-text">
                              {msg.suggestedBetterAnswer}
                            </p>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>

          {/* Bottom Input Console */}
          <div className="p-4 border-t border-border bg-surface space-y-3">
            {error && (
              <div className="text-xs text-error-700 font-medium px-2">{error}</div>
            )}

            {session.status === 'COMPLETED' ? (
              <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-center space-y-2">
                <p className="text-sm font-bold text-success-900">
                  🎉 Interview simulation has been completed!
                </p>
                <p className="text-xs text-success-800">
                  Overall Score: <strong>{session.overallScore}%</strong> · Technical: {session.technicalScore}% · Clarity: {session.clarityScore}%
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-1">
                  <Link href={`/interviews/${session.id}/results`}>
                    <Button variant="primary" size="sm">
                      View Evaluation Scorecard &amp; Review →
                    </Button>
                  </Link>
                  <Link href="/interviews">
                    <Button variant="secondary" size="sm">
                      Start Another Simulation
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Clarification Chips */}
                <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsWhiteboardOpen(true)}
                    className="px-2.5 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-900 hover:bg-primary-100 text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                  >
                    <span>📐</span>
                    <span>Architecture Whiteboard</span>
                  </button>
                  <span className="text-[11px] font-semibold text-text-muted shrink-0">
                    Quick Prompts:
                  </span>
                  {[
                    'Could you specify the scale and latency requirements?',
                    'Let me explain the trade-offs between consistency and speed...',
                    'In production, I would mitigate failure modes by...',
                  ].map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => setInputText((prev) => `${prev} ${phrase}`.trim())}
                      className="px-2.5 py-1 rounded-full bg-canvas border border-border text-text-muted hover:text-text hover:border-primary-300 text-[11px] whitespace-nowrap transition-colors"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>

                {/* Real-Time Articulation Telemetry HUD */}
                {liveFluency && (
                  <div
                    data-testid="live-articulation-telemetry-hud"
                    className="p-2.5 rounded-xl bg-canvas border border-border flex flex-wrap items-center justify-between gap-2 text-xs transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-semibold text-text">
                        <span className="text-primary-600">🎙️</span>
                        <span>{liveFluency.totalWords} words</span>
                        <span className="text-text-muted">·</span>
                        <span className="tabular-nums">{liveFluency.articulationPaceWpm} WPM</span>
                        <span className="text-[11px] font-normal text-text-muted hidden md:inline">
                          ({liveFluency.cadenceDescription})
                        </span>
                      </div>
                      <Badge
                        variant={
                          liveFluency.fluencyGrade === 'EXEMPLARY'
                            ? 'success'
                            : liveFluency.fluencyGrade === 'PROFICIENT'
                            ? 'primary'
                            : liveFluency.fluencyGrade === 'CONVERSATIONAL'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {liveFluency.fluencyGrade}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {liveFluency.fillerCount > 0 ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-50 border border-accent-300 text-accent-900 font-medium text-[11px]">
                          <span>⚠️</span>
                          <span>
                            {liveFluency.fillerCount} filler{liveFluency.fillerCount > 1 ? 's' : ''}:{' '}
                            {Object.entries(liveFluency.fillerBreakdown)
                              .map(([w, c]) => `“${w}” ×${c}`)
                              .join(', ')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-50 border border-success-500/30 text-success-700 font-medium text-[11px]">
                          <span>✓</span>
                          <span>0 Fillers Detected</span>
                        </div>
                      )}
                    </div>

                    {/* Socratic Articulation Coaching Tip */}
                    {liveCoachingTip && (
                      <div
                        data-testid="live-articulation-coaching-tip"
                        className="w-full mt-1 pt-2 border-t border-border flex items-start gap-2 text-[11px] text-text-muted"
                      >
                        <span className="text-primary-600 font-bold shrink-0">
                          💡 Articulation Tip:
                        </span>
                        <span className="text-text font-medium leading-relaxed">
                          {liveCoachingTip.message}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Real-Time Architectural Concept Density & Socratic Vocabulary HUD */}
                <ConceptDensityHUD
                  inputText={inputText}
                  isListening={isListening}
                  onInjectRecommendation={(term) => {
                    setInputText((prev) => (prev ? `${prev} ${term}` : term));
                  }}
                />

                {/* Textarea & Mic Action */}
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your technical response, or click the microphone to speak... (Press Ctrl+Enter to send)"
                      rows={2}
                      className="w-full p-3 pr-10 text-sm bg-canvas border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden resize-none"
                    />
                  </div>

                  {/* Speech-to-Text Mic Button */}
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      title={isListening ? 'Stop Recording' : 'Speak Verbal Response'}
                      aria-label={isListening ? 'Stop Recording' : 'Speak Verbal Response'}
                      className={`h-11 px-3.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isListening
                          ? 'bg-error-500 text-white border-error-600 animate-pulse ring-2 ring-error-300'
                          : 'bg-canvas text-text border-border hover:border-primary-400'
                      }`}
                    >
                      <span>🎤</span>
                      <span className="hidden sm:inline text-xs font-semibold">
                        {isListening ? 'Listening...' : 'Voice'}
                      </span>
                    </button>
                  )}

                  {/* Send Button */}
                  <Button
                    variant="primary"
                    size="md"
                    disabled={!inputText.trim() || isSending}
                    onClick={handleSendMessage}
                    className="h-11 px-5"
                  >
                    {isSending ? 'Sending...' : 'Send →'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Architecture Whiteboard Studio Modal */}
      {isWhiteboardOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Architecture Whiteboard Studio Modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <ArchitectureWhiteboard
              onClose={() => setIsWhiteboardOpen(false)}
              onExportToText={handleWhiteboardExport}
            />
          </div>
        </div>
      )}
    </div>
  );
}
