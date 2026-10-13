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
import {
  Volume2,
  VolumeX,
  RotateCcw,
  PenTool,
  Lightbulb,
  Search,
  Sparkles,
  Mic,
  AlertTriangle,
  CheckCircle2,
  Timer,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
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
      <div className="min-h-dvh flex items-center justify-center bg-[#040711] text-slate-100">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(163,230,53,0.3)]" />
          <p className="text-sm font-semibold text-slate-400 font-mono tracking-wider">
            Connecting to Live Socratic Interview Room...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#040711] p-6 text-center">
        <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl space-y-4">
          <h2 className="text-xl font-bold text-slate-100">Interview Session Not Found</h2>
          <p className="text-sm text-slate-400">
            {error || 'This session could not be retrieved.'}
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

  return (
    <div className="min-h-dvh flex flex-col bg-[#040711] text-slate-100">
      {/* Top Session Header */}
      <header className="border-b border-white/10 bg-[#060b18]/80 backdrop-blur-xl sticky top-0 z-30 shadow-lg">
        <div className="max-w-content mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/interviews"
              className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:border-lime-400/40 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Room</span>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-100">
                  {session.roleTrack.name}
                </span>
                <span className="text-[11px] font-mono font-bold text-lime-300 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/30">
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
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-white/5 text-slate-200 border-white/10'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-lime-400" />
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
                className="bg-lime-400 hover:bg-lime-300 text-black font-bold shadow-[0_0_15px_rgba(163,230,53,0.3)] border-0"
              >
                {isCompleting ? 'Finishing...' : 'Complete Interview'}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Stage Stepper */}
        <div className="lg:hidden border-t border-white/10 px-4 py-2 bg-[#060b18] overflow-x-auto">
          <StageStepper currentStage={session.currentStage} />
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-content mx-auto px-4 sm:px-6 py-6 w-full grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar: Interviewer Persona & Voice Control */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-lime-400 text-black flex items-center justify-center font-extrabold text-base shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
                AI
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-100">Socratic Interviewer</h2>
                <p className="text-[11px] text-slate-400">
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
              <div className="text-center text-[10px] font-semibold text-slate-400">
                {isAiSpeaking
                  ? 'AI Interviewer is speaking...'
                  : isListening
                  ? 'Listening to candidate voice...'
                  : 'Voice Ready (Standby)'}
              </div>
            </div>

            {/* Voice Controls */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (!isVoiceMuted) stopSpeaking();
                  setIsVoiceMuted(!isVoiceMuted);
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isVoiceMuted
                    ? 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
                    : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                }`}
              >
                {isVoiceMuted ? (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
                <span>{isVoiceMuted ? 'Voice Audio: Muted' : 'Voice Audio: Active'}</span>
              </button>

              <button
                type="button"
                onClick={handleReplayLastAiMessage}
                disabled={isAiSpeaking}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Replay Last Question</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWhiteboardOpen(true)}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-lime-300 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 text-center flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5 text-lime-400" />
                <span>Architecture Whiteboard</span>
              </button>
            </div>
          </div>

          {/* Stage Tips Card */}
          <div className="bg-[#0a0f1d]/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 text-xs backdrop-blur-xl">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Stage Advisory</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
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
        <div className="lg:col-span-3 flex flex-col bg-[#0a0f1d]/80 border border-white/10 rounded-2xl shadow-xl overflow-hidden h-[75vh] backdrop-blur-xl">
          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#060b18]/50">
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                      isAi
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                        : 'bg-lime-400 text-black'
                    }`}
                  >
                    {isAi ? 'AI' : 'You'}
                  </div>

                  <div className="space-y-1.5">
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                        isAi
                          ? 'bg-[#0d1527]/90 border border-white/10 text-slate-200'
                          : 'bg-gradient-to-r from-lime-400 to-emerald-400 text-black font-medium shadow-[0_0_20px_rgba(163,230,53,0.15)]'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Turn Feedback (for candidate messages) */}
                    {!isAi && msg.technicalFeedback && (
                      <div className="p-3 rounded-xl bg-[#060b18]/90 border border-lime-400/30 text-xs text-lime-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Search className="w-3.5 h-3.5 text-lime-400" />
                          <span>Evaluator Insight</span>
                        </div>
                        <p className="text-slate-300">{msg.technicalFeedback}</p>
                        {msg.suggestedBetterAnswer && (
                          <details className="mt-1 text-[11px] text-slate-400 cursor-pointer">
                            <summary className="font-semibold text-lime-300 hover:underline">
                              View Socratic Benchmark Pointer
                            </summary>
                            <p className="mt-1 p-2 rounded bg-[#0a0f1d] border border-white/10 text-slate-200">
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
          <div className="p-4 border-t border-white/10 bg-[#060b18]/90 space-y-3">
            {error && (
              <div className="text-xs text-rose-400 font-medium px-2">{error}</div>
            )}

            {session.status === 'COMPLETED' ? (
              <div className="p-4 rounded-xl bg-lime-400/10 border border-lime-400/30 text-center space-y-2">
                <p className="text-sm font-bold text-lime-300 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-lime-400" />
                  <span>Interview simulation has been completed!</span>
                </p>
                <p className="text-xs text-slate-300">
                  Overall Score: <strong className="text-lime-300 font-bold">{session.overallScore}%</strong> · Technical: {session.technicalScore}% · Clarity: {session.clarityScore}%
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-1">
                  <Link href={`/interviews/${session.id}/results`}>
                    <Button variant="primary" size="sm" className="bg-lime-400 hover:bg-lime-300 text-black font-bold shadow-[0_0_15px_rgba(163,230,53,0.3)] border-0">
                      <span>View Evaluation Scorecard &amp; Review</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
                    </Button>
                  </Link>
                  <Link href="/interviews">
                    <Button variant="secondary" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
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
                    className="px-2.5 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300 hover:bg-lime-400/20 text-[11px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    <PenTool className="w-3 h-3 text-lime-400" />
                    <span>Architecture Whiteboard</span>
                  </button>
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
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
                      className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-lime-400/40 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>

                {/* Real-Time Articulation Telemetry HUD */}
                {liveFluency && (
                  <div
                    data-testid="live-articulation-telemetry-hud"
                    className="p-2.5 rounded-xl bg-[#0a0f1d] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs transition-all shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <Mic className="w-3.5 h-3.5 text-lime-400" />
                        <span>{liveFluency.totalWords} words</span>
                        <span className="text-slate-500">·</span>
                        <span className="tabular-nums font-mono text-cyan-300">{liveFluency.articulationPaceWpm} WPM</span>
                        <span className="text-[11px] font-normal text-slate-400 hidden md:inline">
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
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            {liveFluency.fillerCount} filler{liveFluency.fillerCount > 1 ? 's' : ''}:{' '}
                            {Object.entries(liveFluency.fillerBreakdown)
                              .map(([w, c]) => `“${w}” ×${c}`)
                              .join(', ')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-lime-400/15 border border-lime-400/30 text-lime-300 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                          <span>0 Fillers Detected</span>
                        </div>
                      )}
                    </div>

                    {/* Socratic Articulation Coaching Tip */}
                    {liveCoachingTip && (
                      <div
                        data-testid="live-articulation-coaching-tip"
                        className="w-full mt-1 pt-2 border-t border-white/10 flex items-start gap-2 text-[11px] text-slate-400"
                      >
                        <span className="text-lime-400 font-bold shrink-0 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Articulation Tip:</span>
                        </span>
                        <span className="text-slate-200 font-medium leading-relaxed">
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
                      className="w-full p-3 pr-10 text-sm bg-[#040711] border border-white/10 text-slate-100 placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/50 resize-none transition-all"
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
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-2 ring-rose-400/50'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:border-lime-400/40 hover:text-lime-300'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
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
                    className="h-11 px-5 bg-lime-400 hover:bg-lime-300 text-black font-bold shadow-[0_0_15px_rgba(163,230,53,0.3)] border-0"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
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
