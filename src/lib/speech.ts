// Browser-native Speech Utilities (Speech-to-Text & Text-to-Speech)
// Designed with 100% SSR safety and graceful fallbacks.

// Type declarations for Web Speech API
type SpeechRecognitionInstance = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function speakText(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (e: unknown) => void;
  },
): () => void {
  if (!isSpeechSynthesisSupported()) {
    options?.onEnd?.();
    return () => {};
  }

  // Cancel any prior utterance
  window.speechSynthesis.cancel();

  // Strip markdown formatting symbols (*, _, #, `, backticks) for clean audio pronunciation
  const cleanText = text
    .replace(/[`#*_>~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to pick a natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('David')),
  );
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    options?.onEnd?.();
  };

  utterance.onerror = (err) => {
    options?.onError?.(err);
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
    options?.onEnd?.();
  };
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function createSpeechRecognizer(options: {
  onResult: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}): { start: () => void; stop: () => void; abort: () => void } | null {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRecognitionConstructor =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) return null;

  const recognition = new SpeechRecognitionConstructor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    options.onStart?.();
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        final += result[0].transcript;
      } else {
        interim += result[0].transcript;
      }
    }

    const transcript = (final || interim).trim();
    if (transcript) {
      options.onResult(transcript, Boolean(final));
    }
  };

  recognition.onerror = (err: { error: string }) => {
    options.onError?.(err);
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch {
        // Recognition might already be active
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // Ignore
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch {
        // Ignore
      }
    },
  };
}

export interface AudioSpectrumAnalyzerController {
  getFrequencies: (outputArray: Uint8Array) => void;
  getAverageVolume: () => number;
  stop: () => void;
}

/**
 * Creates a browser-native Web Audio API frequency spectrum analyzer from microphone stream.
 * SSR-safe, gracefully returns null if unavailable or if permissions are not granted.
 */
export async function createMicrophoneSpectrumAnalyzer(): Promise<AudioSpectrumAnalyzerController | null> {
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return null;

    const audioCtx = new AudioContextClass();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    return {
      getFrequencies: (outputArray: Uint8Array) => {
        analyser.getByteFrequencyData(outputArray as unknown as Uint8Array<ArrayBuffer>);
      },
      getAverageVolume: () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        return Math.round(sum / data.length);
      },
      stop: () => {
        stream.getTracks().forEach((track) => track.stop());
        if (audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      },
    };
  } catch {
    return null;
  }
}

export interface SpeechFluencyAnalysis {
  totalWords: number;
  fillerCount: number;
  fillerDensityPer100: number;
  fillerBreakdown: Record<string, number>;
  fluencyScore: number;
  fluencyGrade: 'EXEMPLARY' | 'PROFICIENT' | 'CONVERSATIONAL' | 'NEEDS_REVISION';
  hesitationPauses: number;
  articulationPaceWpm: number;
  cadenceDescription: string;
}

export const FILLER_WORDS: readonly string[] = [
  'you know',
  'sort of',
  'kind of',
  'i mean',
  'um',
  'uh',
  'like',
  'basically',
  'actually',
  'literally',
  'right',
];

/**
 * Analyzes conversational transcripts for verbal crutches, filler words, hesitation pauses,
 * and delivery cadence, computing a calibrated technical articulation fluency score (0 - 100).
 */
export function analyzeSpeechFluency(
  transcript: string,
  durationMinutes = 1,
  hesitationPauses = 0,
): SpeechFluencyAnalysis {
  if (!transcript || !transcript.trim()) {
    return {
      totalWords: 0,
      fillerCount: 0,
      fillerDensityPer100: 0,
      fillerBreakdown: {},
      fluencyScore: 100,
      fluencyGrade: 'EXEMPLARY',
      hesitationPauses,
      articulationPaceWpm: 0,
      cadenceDescription: 'Zero Verbal Output',
    };
  }

  let workingText = transcript.toLowerCase();
  const fillerBreakdown: Record<string, number> = {};
  let totalFillerOccurrences = 0;

  // 1. Detect multi-word phrases first
  for (const phrase of FILLER_WORDS) {
    if (phrase.includes(' ')) {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      const matches = workingText.match(regex);
      if (matches && matches.length > 0) {
        fillerBreakdown[phrase] = matches.length;
        totalFillerOccurrences += matches.length;
        workingText = workingText.replace(regex, ' ');
      }
    }
  }

  // 2. Tokenize words for single-word analysis
  const words = workingText
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const originalWordTokens = transcript
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const totalWords = originalWordTokens.length;

  for (const word of words) {
    if (FILLER_WORDS.includes(word)) {
      fillerBreakdown[word] = (fillerBreakdown[word] || 0) + 1;
      totalFillerOccurrences += 1;
    }
  }

  const fillerDensityPer100 =
    totalWords > 0 ? Number(((totalFillerOccurrences / totalWords) * 100).toFixed(1)) : 0;

  const validMinutes = Math.max(0.5, durationMinutes);
  const articulationPaceWpm = Math.round(totalWords / validMinutes);

  let cadenceDescription = 'Optimal Technical Cadence';
  if (articulationPaceWpm < 100) {
    cadenceDescription = 'Deliberate Cadence';
  } else if (articulationPaceWpm > 165) {
    cadenceDescription = 'Rapid Articulation';
  }

  let score = 100;
  if (fillerDensityPer100 > 1.0) {
    score -= Math.round((fillerDensityPer100 - 1.0) * 5);
  }
  if (hesitationPauses > 2) {
    score -= (hesitationPauses - 2) * 2;
  }
  const fluencyScore = Math.max(40, Math.min(100, score));

  let fluencyGrade: 'EXEMPLARY' | 'PROFICIENT' | 'CONVERSATIONAL' | 'NEEDS_REVISION' = 'EXEMPLARY';
  if (fluencyScore >= 90) {
    fluencyGrade = 'EXEMPLARY';
  } else if (fluencyScore >= 75) {
    fluencyGrade = 'PROFICIENT';
  } else if (fluencyScore >= 60) {
    fluencyGrade = 'CONVERSATIONAL';
  } else {
    fluencyGrade = 'NEEDS_REVISION';
  }

  return {
    totalWords,
    fillerCount: totalFillerOccurrences,
    fillerDensityPer100,
    fillerBreakdown,
    fluencyScore,
    fluencyGrade,
    hesitationPauses,
    articulationPaceWpm,
    cadenceDescription,
  };
}

// ==========================================
// Architectural Concept Density Intelligence
// ==========================================

export type SystemsDomain =
  | 'DISTRIBUTED_SYSTEMS'
  | 'RESILIENCE'
  | 'CONCURRENCY'
  | 'DATABASE_STORAGE'
  | 'NETWORKING'
  | 'OBSERVABILITY';

export interface DetectedConcept {
  term: string;
  domain: SystemsDomain;
  count: number;
}

export type ArticulationTier =
  | 'STAFF_ARCHITECT'
  | 'SENIOR_ENGINEER'
  | 'INTERMEDIATE_ENGINEER'
  | 'FOUNDATIONAL_DEVELOPER';

export interface ConceptDensityAnalysis {
  totalWords: number;
  uniqueConceptsCount: number;
  totalConceptHits: number;
  densityIndex: number; // 0 - 100
  tier: ArticulationTier;
  tierLabel: string;
  detectedConcepts: DetectedConcept[];
  domainCoverage: Record<SystemsDomain, number>;
  coveredDomainCount: number;
  recommendations: string[];
}

export const SYSTEMS_CONCEPT_DICTIONARY: readonly { term: string; domain: SystemsDomain }[] = [
  // DISTRIBUTED_SYSTEMS
  { term: 'raft', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'paxos', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'quorum', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'consensus', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'leader election', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'split brain', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'split-brain', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'vector clock', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'cap theorem', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'eventual consistency', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'strong consistency', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'linearizability', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'two-phase commit', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'two phase commit', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: '2pc', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'gossip protocol', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'consistent hashing', domain: 'DISTRIBUTED_SYSTEMS' },
  { term: 'replication factor', domain: 'DISTRIBUTED_SYSTEMS' },

  // RESILIENCE
  { term: 'circuit breaker', domain: 'RESILIENCE' },
  { term: 'backpressure', domain: 'RESILIENCE' },
  { term: 'rate limiting', domain: 'RESILIENCE' },
  { term: 'rate limiter', domain: 'RESILIENCE' },
  { term: 'token bucket', domain: 'RESILIENCE' },
  { term: 'leaky bucket', domain: 'RESILIENCE' },
  { term: 'exponential backoff', domain: 'RESILIENCE' },
  { term: 'jitter', domain: 'RESILIENCE' },
  { term: 'bulkhead', domain: 'RESILIENCE' },
  { term: 'failover', domain: 'RESILIENCE' },
  { term: 'idempotency', domain: 'RESILIENCE' },
  { term: 'idempotent', domain: 'RESILIENCE' },
  { term: 'retry storm', domain: 'RESILIENCE' },
  { term: 'graceful degradation', domain: 'RESILIENCE' },
  { term: 'health check', domain: 'RESILIENCE' },
  { term: 'dead letter queue', domain: 'RESILIENCE' },
  { term: 'fallback', domain: 'RESILIENCE' },

  // CONCURRENCY
  { term: 'race condition', domain: 'CONCURRENCY' },
  { term: 'mutex', domain: 'CONCURRENCY' },
  { term: 'semaphore', domain: 'CONCURRENCY' },
  { term: 'lock contention', domain: 'CONCURRENCY' },
  { term: 'atomicity', domain: 'CONCURRENCY' },
  { term: 'atomic', domain: 'CONCURRENCY' },
  { term: 'thread starvation', domain: 'CONCURRENCY' },
  { term: 'deadlock', domain: 'CONCURRENCY' },
  { term: 'livelock', domain: 'CONCURRENCY' },
  { term: 'optimistic locking', domain: 'CONCURRENCY' },
  { term: 'pessimistic locking', domain: 'CONCURRENCY' },
  { term: 'compare and swap', domain: 'CONCURRENCY' },
  { term: 'cas', domain: 'CONCURRENCY' },
  { term: 'thread pool', domain: 'CONCURRENCY' },
  { term: 'goroutine', domain: 'CONCURRENCY' },
  { term: 'memory barrier', domain: 'CONCURRENCY' },

  // DATABASE_STORAGE
  { term: 'write ahead log', domain: 'DATABASE_STORAGE' },
  { term: 'write-ahead log', domain: 'DATABASE_STORAGE' },
  { term: 'wal', domain: 'DATABASE_STORAGE' },
  { term: 'lsm tree', domain: 'DATABASE_STORAGE' },
  { term: 'lsm-tree', domain: 'DATABASE_STORAGE' },
  { term: 'b-tree', domain: 'DATABASE_STORAGE' },
  { term: 'b+ tree', domain: 'DATABASE_STORAGE' },
  { term: 'connection pool', domain: 'DATABASE_STORAGE' },
  { term: 'read replica', domain: 'DATABASE_STORAGE' },
  { term: 'sharding', domain: 'DATABASE_STORAGE' },
  { term: 'query planner', domain: 'DATABASE_STORAGE' },
  { term: 'acid', domain: 'DATABASE_STORAGE' },
  { term: 'isolation level', domain: 'DATABASE_STORAGE' },
  { term: 'write amplification', domain: 'DATABASE_STORAGE' },
  { term: 'compaction', domain: 'DATABASE_STORAGE' },
  { term: 'bloom filter', domain: 'DATABASE_STORAGE' },
  { term: 'cache aside', domain: 'DATABASE_STORAGE' },
  { term: 'cache-aside', domain: 'DATABASE_STORAGE' },
  { term: 'denormalization', domain: 'DATABASE_STORAGE' },

  // NETWORKING
  { term: 'tcp handshake', domain: 'NETWORKING' },
  { term: 'tail latency', domain: 'NETWORKING' },
  { term: 'p99', domain: 'NETWORKING' },
  { term: 'p95', domain: 'NETWORKING' },
  { term: 'multiplexing', domain: 'NETWORKING' },
  { term: 'grpc', domain: 'NETWORKING' },
  { term: 'tls', domain: 'NETWORKING' },
  { term: 'reverse proxy', domain: 'NETWORKING' },
  { term: 'load balancing', domain: 'NETWORKING' },
  { term: 'load balancer', domain: 'NETWORKING' },
  { term: 'head of line blocking', domain: 'NETWORKING' },
  { term: 'head-of-line blocking', domain: 'NETWORKING' },
  { term: 'keep alive', domain: 'NETWORKING' },
  { term: 'keep-alive', domain: 'NETWORKING' },
  { term: 'zero copy', domain: 'NETWORKING' },
  { term: 'zero-copy', domain: 'NETWORKING' },
  { term: 'http/2', domain: 'NETWORKING' },
  { term: 'http/3', domain: 'NETWORKING' },
  { term: 'quic', domain: 'NETWORKING' },

  // OBSERVABILITY
  { term: 'distributed tracing', domain: 'OBSERVABILITY' },
  { term: 'structured logging', domain: 'OBSERVABILITY' },
  { term: 'red method', domain: 'OBSERVABILITY' },
  { term: 'use method', domain: 'OBSERVABILITY' },
  { term: 'slo', domain: 'OBSERVABILITY' },
  { term: 'sli', domain: 'OBSERVABILITY' },
  { term: 'sla', domain: 'OBSERVABILITY' },
  { term: 'cardinality', domain: 'OBSERVABILITY' },
  { term: 'golden signals', domain: 'OBSERVABILITY' },
  { term: 'opentelemetry', domain: 'OBSERVABILITY' },
  { term: 'metrics', domain: 'OBSERVABILITY' },
  { term: 'telemetry', domain: 'OBSERVABILITY' },
];

const DOMAIN_RECOMMENDATIONS: Record<SystemsDomain, string[]> = {
  DISTRIBUTED_SYSTEMS: ['Quorum Consensus', 'Leader Election', 'Linearizability', 'Two-Phase Commit'],
  RESILIENCE: ['Idempotency', 'Circuit Breaker', 'Backpressure', 'Exponential Backoff'],
  CONCURRENCY: ['Lock Contention', 'Atomic CAS', 'Optimistic Locking', 'Thread Starvation'],
  DATABASE_STORAGE: ['Write-Ahead Log', 'LSM-Tree Compaction', 'Read Replicas', 'Sharding'],
  NETWORKING: ['Tail Latency (p99)', 'HTTP/2 Multiplexing', 'Reverse Proxy', 'Zero-Copy'],
  OBSERVABILITY: ['Distributed Tracing', 'RED Method', 'SLO / SLI Thresholds', 'Structured Logging'],
};

/**
 * Evaluates architectural and systems engineering concept density from verbal transcripts
 * or written candidate responses, computing real-time domain coverage and precision vocabulary recommendations.
 */
export function analyzeConceptDensity(text: string): ConceptDensityAnalysis {
  const initialDomainCoverage: Record<SystemsDomain, number> = {
    DISTRIBUTED_SYSTEMS: 0,
    RESILIENCE: 0,
    CONCURRENCY: 0,
    DATABASE_STORAGE: 0,
    NETWORKING: 0,
    OBSERVABILITY: 0,
  };

  if (!text || !text.trim()) {
    return {
      totalWords: 0,
      uniqueConceptsCount: 0,
      totalConceptHits: 0,
      densityIndex: 0,
      tier: 'FOUNDATIONAL_DEVELOPER',
      tierLabel: 'Foundational Developer',
      detectedConcepts: [],
      domainCoverage: initialDomainCoverage,
      coveredDomainCount: 0,
      recommendations: ['Idempotency', 'Quorum Consensus', 'Circuit Breaker', 'Tail Latency (p99)'],
    };
  }

  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const totalWords = words.length;

  const lowerText = text.toLowerCase();
  const detectedMap = new Map<string, { term: string; domain: SystemsDomain; count: number }>();
  const domainCoverage: Record<SystemsDomain, number> = { ...initialDomainCoverage };

  // Sort dictionary by term length descending so longer phrases match first
  const sortedDict = [...SYSTEMS_CONCEPT_DICTIONARY].sort((a, b) => b.term.length - a.term.length);

  for (const item of sortedDict) {
    // Escape regex characters (e.g. +, /)
    const escaped = item.term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      if (!detectedMap.has(item.term)) {
        detectedMap.set(item.term, {
          term: item.term,
          domain: item.domain,
          count: matches.length,
        });
        domainCoverage[item.domain] = (domainCoverage[item.domain] || 0) + matches.length;
      }
    }
  }

  const detectedConcepts = Array.from(detectedMap.values());
  const uniqueConceptsCount = detectedConcepts.length;
  const totalConceptHits = detectedConcepts.reduce((acc, c) => acc + c.count, 0);

  const coveredDomainCount = Object.values(domainCoverage).filter((count) => count > 0).length;

  // Concept Density Index calculation
  const baseRatio = uniqueConceptsCount / (totalWords + 12);
  const rawScore = Math.round(baseRatio * 380 + coveredDomainCount * 8 + Math.min(20, totalConceptHits * 3));
  const densityIndex = Math.max(0, Math.min(100, rawScore));

  let tier: ArticulationTier = 'FOUNDATIONAL_DEVELOPER';
  let tierLabel = 'Foundational Developer';

  if (densityIndex >= 75) {
    tier = 'STAFF_ARCHITECT';
    tierLabel = 'Staff Systems Architect';
  } else if (densityIndex >= 50) {
    tier = 'SENIOR_ENGINEER';
    tierLabel = 'Senior Systems Engineer';
  } else if (densityIndex >= 25) {
    tier = 'INTERMEDIATE_ENGINEER';
    tierLabel = 'Intermediate Engineer';
  }

  // Generate recommendations from unrepresented domains
  const recommendations: string[] = [];
  const domains: SystemsDomain[] = [
    'DISTRIBUTED_SYSTEMS',
    'RESILIENCE',
    'CONCURRENCY',
    'DATABASE_STORAGE',
    'NETWORKING',
    'OBSERVABILITY',
  ];

  for (const d of domains) {
    if (domainCoverage[d] === 0) {
      const candidates = DOMAIN_RECOMMENDATIONS[d];
      if (candidates && candidates.length > 0) {
        recommendations.push(candidates[0]);
      }
    }
  }

  // Default recommendations if all covered
  if (recommendations.length === 0) {
    recommendations.push('Zero-Copy Buffering', 'Memory Barrier', 'Graceful Degradation');
  }

  return {
    totalWords,
    uniqueConceptsCount,
    totalConceptHits,
    densityIndex,
    tier,
    tierLabel,
    detectedConcepts,
    domainCoverage,
    coveredDomainCount,
    recommendations: recommendations.slice(0, 4),
  };
}
