import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCustomMockTest,
  startMockTestSession,
  submitMockTestSession,
  getMockTestScorecard,
  customMockRegistry,
  getRegisteredCustomMock,
} from '../mock-test-client';

describe('custom-mock-test-persistence', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    customMockRegistry.clear();
  });

  describe('createCustomMockTest', () => {
    it('registers fallback custom test in customMockRegistry when network fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const customPayload = {
        title: 'Distributed Systems & Concurrency Deep Dive',
        topicIds: ['topic-concurrency', 'topic-distributed-tx'],
        questionCount: 25,
        durationMinutes: 45,
      };

      const result = await createCustomMockTest(customPayload);

      expect(result.id).toMatch(/^custom-mock-/);
      expect(result.title).toBe('Distributed Systems & Concurrency Deep Dive');
      expect(result.durationMinutes).toBe(45);
      expect(result.questionCount).toBe(25);

      const registered = getRegisteredCustomMock(result.id);
      expect(registered).toBeDefined();
      expect(registered?.title).toBe('Distributed Systems & Concurrency Deep Dive');
      expect(registered?.topicIds).toEqual(['topic-concurrency', 'topic-distributed-tx']);
    });

    it('registers server-returned custom test in customMockRegistry when backend succeeds', async () => {
      const serverItem = {
        id: 'mock-custom-srv-99',
        slug: 'distributed-systems-eval',
        title: 'Server-Synthesized Custom Benchmark',
        durationMinutes: 60,
        questionCount: 30,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => serverItem,
      } as Response);

      const result = await createCustomMockTest({
        title: 'Server-Synthesized Custom Benchmark',
        topicIds: ['topic-os', 'topic-dbms'],
        durationMinutes: 60,
        questionCount: 30,
      });

      expect(result.id).toBe('mock-custom-srv-99');
      expect(result.title).toBe('Server-Synthesized Custom Benchmark');

      const registered = getRegisteredCustomMock('mock-custom-srv-99');
      expect(registered).toBeDefined();
      expect(registered?.slug).toBe('distributed-systems-eval');
      expect(registered?.topicIds).toEqual(['topic-os', 'topic-dbms']);
    });
  });

  describe('startMockTestSession with custom mock fallback', () => {
    it('uses registered custom mock metadata to instantiate offline session with custom title and duration', async () => {
      // Register a custom mock first
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('API offline'));
      const customMock = await createCustomMockTest({
        title: 'Reliability Engineering Rigor Assessment',
        topicIds: ['topic-sre'],
        questionCount: 20,
        durationMinutes: 50,
      });

      // Now start session for that custom mock (backend offline)
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('API offline'));
      const session = await startMockTestSession(customMock.id);

      expect(session.attempt.mockTestId).toBe(customMock.id);
      expect(session.attempt.title).toBe('Reliability Engineering Rigor Assessment');
      expect(session.attempt.durationMinutes).toBe(50);
      expect(session.questions.length).toBeGreaterThan(0);
      expect(session.sections?.length).toBe(2);
    });
  });

  describe('submitMockTestSession and scorecard preservation', () => {
    it('preserves custom mock title in scorecard when submitted offline', async () => {
      // Register custom mock
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('API offline'));
      const customMock = await createCustomMockTest({
        title: 'Advanced Query Optimization Benchmark',
        topicIds: ['topic-sql'],
        questionCount: 15,
        durationMinutes: 30,
      });

      // Submit session offline
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('API offline'));
      const scorecard = await submitMockTestSession(`attempt-${customMock.id}`);

      expect(scorecard.mockTestId).toBe(customMock.id);
      expect(scorecard.title).toBe('Advanced Query Optimization Benchmark');
      expect(scorecard.accuracy).toBeGreaterThan(0);
      expect(scorecard.topicBreakdown.length).toBeGreaterThan(0);
    });

    it('preserves custom mock title when viewing scorecard results offline', async () => {
      // Register custom mock
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('API offline'));
      const customMock = await createCustomMockTest({
        title: 'Microservices & Event Sourcing Benchmark',
        topicIds: ['topic-events'],
        questionCount: 10,
        durationMinutes: 25,
      });

      // View scorecard results offline
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('API offline'));
      const scorecard = await getMockTestScorecard(`attempt-${customMock.id}`);

      expect(scorecard.mockTestId).toBe(customMock.id);
      expect(scorecard.title).toBe('Microservices & Event Sourcing Benchmark');
      expect(scorecard.sectionBreakdown?.length).toBe(2);
    });
  });
});
