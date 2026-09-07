import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  analyzeSpeechFluency,
  analyzeConceptDensity,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
} from './speech';

describe('Speech Utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Feature Detection', () => {
    it('checks speech recognition support safely', () => {
      const supported = isSpeechRecognitionSupported();
      expect(typeof supported).toBe('boolean');
    });

    it('checks speech synthesis support safely', () => {
      const supported = isSpeechSynthesisSupported();
      expect(typeof supported).toBe('boolean');
    });
  });

  describe('Speech Synthesis Controls', () => {
    it('invokes options.onEnd gracefully when synthesis is unavailable', () => {
      const onEnd = vi.fn();
      const cancel = speakText('Hello World', { onEnd });
      expect(typeof cancel).toBe('function');
      cancel();
    });

    it('stopSpeaking executes without error', () => {
      expect(() => stopSpeaking()).not.toThrow();
    });
  });

  describe('analyzeSpeechFluency', () => {
    it('returns default exemplary score for empty or whitespace transcript', () => {
      const result = analyzeSpeechFluency('');
      expect(result.totalWords).toBe(0);
      expect(result.fillerCount).toBe(0);
      expect(result.fillerDensityPer100).toBe(0);
      expect(result.fluencyScore).toBe(100);
      expect(result.fluencyGrade).toBe('EXEMPLARY');
      expect(result.cadenceDescription).toBe('Zero Verbal Output');
    });

    it('evaluates clean technical response with 0 fillers as exemplary', () => {
      const cleanTranscript =
        'I architect microservices with idempotent endpoints and circuit breakers to handle downstream network timeouts.';
      const result = analyzeSpeechFluency(cleanTranscript, 1);

      expect(result.totalWords).toBe(14);
      expect(result.fillerCount).toBe(0);
      expect(result.fillerDensityPer100).toBe(0);
      expect(result.fluencyScore).toBe(100);
      expect(result.fluencyGrade).toBe('EXEMPLARY');
      expect(result.articulationPaceWpm).toBe(14);
      expect(result.cadenceDescription).toBe('Deliberate Cadence');
    });

    it('detects single-word and multi-word filler words accurately', () => {
      const transcriptWithFillers =
        'Um basically I like think you know that we should actually sort of partition the database.';
      // Fillers: 'um', 'basically', 'like', 'you know', 'actually', 'sort of'
      const result = analyzeSpeechFluency(transcriptWithFillers, 0.5);

      expect(result.fillerCount).toBe(6);
      expect(result.fillerBreakdown['um']).toBe(1);
      expect(result.fillerBreakdown['basically']).toBe(1);
      expect(result.fillerBreakdown['like']).toBe(1);
      expect(result.fillerBreakdown['you know']).toBe(1);
      expect(result.fillerBreakdown['actually']).toBe(1);
      expect(result.fillerBreakdown['sort of']).toBe(1);
      expect(result.fillerDensityPer100).toBeGreaterThan(30);
      expect(result.fluencyScore).toBeLessThan(80);
      expect(['CONVERSATIONAL', 'NEEDS_REVISION']).toContain(result.fluencyGrade);
    });

    it('factors in hesitation pauses to penalize excessive stalling', () => {
      const cleanTranscript =
        'The primary bottleneck in distributed transactions is the synchronous two-phase commit lock holding phase.';
      const resultWithPauses = analyzeSpeechFluency(cleanTranscript, 1, 6);

      // 6 pauses is 4 above 2 -> 8 points deduction
      expect(resultWithPauses.hesitationPauses).toBe(6);
      expect(resultWithPauses.fluencyScore).toBe(92);
      expect(resultWithPauses.fluencyGrade).toBe('EXEMPLARY');
    });

    it('calculates optimal cadence correctly for standard conversational pace', () => {
      // 120 words in 1 minute = 120 WPM (Optimal Technical Cadence)
      const words = Array.from({ length: 120 }, () => 'shard').join(' ');
      const result = analyzeSpeechFluency(words, 1);

      expect(result.articulationPaceWpm).toBe(120);
      expect(result.cadenceDescription).toBe('Optimal Technical Cadence');
    });

    it('detects rapid articulation when WPM exceeds 165', () => {
      const words = Array.from({ length: 180 }, () => 'node').join(' ');
      const result = analyzeSpeechFluency(words, 1);

      expect(result.articulationPaceWpm).toBe(180);
      expect(result.cadenceDescription).toBe('Rapid Articulation');
    });
  });

  describe('analyzeConceptDensity', () => {
    it('returns zero density and foundational tier for empty input', () => {
      const result = analyzeConceptDensity('');
      expect(result.totalWords).toBe(0);
      expect(result.uniqueConceptsCount).toBe(0);
      expect(result.densityIndex).toBe(0);
      expect(result.tier).toBe('FOUNDATIONAL_DEVELOPER');
      expect(result.coveredDomainCount).toBe(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('returns foundational tier for colloquial answers lacking architectural keywords', () => {
      const result = analyzeConceptDensity('I wrote the application code, connected it to the database, and ran it.');
      expect(result.uniqueConceptsCount).toBe(0);
      expect(result.densityIndex).toBe(0);
      expect(result.tier).toBe('FOUNDATIONAL_DEVELOPER');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('extracts multi-domain systems concepts and computes high CDI and Staff/Senior tier', () => {
      const staffResponse =
        'We configure a Raft consensus cluster with 5 nodes, requiring a quorum of 3 nodes to ensure idempotency, prevent split-brain, and maintain a write-ahead log with p99 tail latency guarantees.';
      const result = analyzeConceptDensity(staffResponse);

      expect(result.uniqueConceptsCount).toBeGreaterThanOrEqual(6);
      expect(result.coveredDomainCount).toBeGreaterThanOrEqual(3);
      expect(result.densityIndex).toBeGreaterThanOrEqual(60);
      expect(['STAFF_ARCHITECT', 'SENIOR_ENGINEER']).toContain(result.tier);

      // Verify detected concepts include specific extracted terms
      const termNames = result.detectedConcepts.map((c) => c.term);
      expect(termNames).toContain('raft');
      expect(termNames).toContain('quorum');
      expect(termNames).toContain('idempotency');
      expect(termNames).toContain('split-brain');
      expect(termNames).toContain('write-ahead log');
      expect(termNames).toContain('tail latency');
    });

    it('generates precision vocabulary recommendations for unrepresented domains', () => {
      // Input only mentions networking terms
      const networkOnly = 'We analyze TCP handshake latency, TLS handshake, reverse proxy, and p99 metrics.';
      const result = analyzeConceptDensity(networkOnly);

      expect(result.domainCoverage.NETWORKING).toBeGreaterThan(0);
      // Recommendations should target other domains (e.g. Distributed, Resilience, Storage)
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some((r) => r.includes('Quorum') || r.includes('Idempotency') || r.includes('Write-Ahead'))).toBe(true);
    });
  });
});
