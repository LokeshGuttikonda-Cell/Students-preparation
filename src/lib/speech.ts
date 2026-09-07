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

