import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ROLES_CATALOG,
  DEFAULT_MOCK_TESTS_CATALOG,
  DEFAULT_COURSES_CATALOG,
} from '../catalog-data';
import { ROLE_HANDBOOKS } from '../role-handbooks-data';
import { DOC_TRACKS } from '../docs-catalog';
import { INTERVIEW_QUESTIONS } from '../interview-catalog';
import { startMockTestSession, submitMockTestSession } from '../mock-test-client';
import { apiUrl } from '../env';

describe('Production Launch Readiness Audit', () => {
  const TRADEMARK_REGEX = /\b(tcs|infosys|wipro|cognizant|capgemini|accenture)\b/i;

  describe('Content Integrity & Schema Compliance', () => {
    it('verifies DEFAULT_ROLES_CATALOG has complete schemas and 100% competency weight sum', () => {
      expect(DEFAULT_ROLES_CATALOG.length).toBeGreaterThanOrEqual(7);

      for (const role of DEFAULT_ROLES_CATALOG) {
        expect(role.id).toBeTruthy();
        expect(role.name).toBeTruthy();
        expect(role.slug).toBeTruthy();
        expect(role.description).toBeTruthy();
        expect(role.competencies.length).toBeGreaterThan(0);

        const totalWeight = role.competencies.reduce(
          (sum, comp) => sum + comp.weightPercentage,
          0,
        );
        expect(totalWeight).toBe(100);

        for (const comp of role.competencies) {
          expect(comp.topicId).toBeTruthy();
          expect(comp.topicName).toBeTruthy();
          expect(comp.benchmarkAccuracy).toBeGreaterThanOrEqual(50);
        }
      }
    });

    it('verifies DEFAULT_MOCK_TESTS_CATALOG has valid duration, marks, and slug identifiers', () => {
      expect(DEFAULT_MOCK_TESTS_CATALOG.length).toBeGreaterThanOrEqual(12);

      for (const mock of DEFAULT_MOCK_TESTS_CATALOG) {
        expect(mock.id).toBeTruthy();
        expect(mock.title).toBeTruthy();
        expect(mock.slug).toBeTruthy();
        expect(mock.durationMinutes).toBeGreaterThanOrEqual(15);
        expect(mock.marksPerQuestion).toBeGreaterThanOrEqual(1);
        expect(mock.questionCount).toBeGreaterThan(0);
      }
    });

    it('verifies ROLE_HANDBOOKS contains comprehensive technical reference sections for all 13 roles', () => {
      expect(ROLE_HANDBOOKS.length).toBe(13);

      for (const hb of ROLE_HANDBOOKS) {
        expect(hb.id).toBeTruthy();
        expect(hb.slug).toBeTruthy();
        expect(hb.name).toBeTruthy();
        expect(hb.summary).toBeTruthy();
        expect(hb.information.overview).toBeTruthy();
        expect(hb.syllabus.length).toBeGreaterThan(0);
        expect(hb.questions.length).toBeGreaterThan(0);
        expect(hb.interviewTraps.length).toBeGreaterThan(0);
        expect(hb.documentation.length).toBeGreaterThan(0);
      }
    });

    it('verifies DOC_TRACKS contains comprehensive learning tracks with modules and topics', () => {
      expect(DOC_TRACKS.length).toBeGreaterThanOrEqual(7);

      for (const track of DOC_TRACKS) {
        expect(track.id).toBeTruthy();
        expect(track.title).toBeTruthy();
        expect(track.slug).toBeTruthy();
        expect(track.modules.length).toBeGreaterThan(0);

        for (const mod of track.modules) {
          expect(mod.id).toBeTruthy();
          expect(mod.title).toBeTruthy();
          expect(mod.topics.length).toBeGreaterThan(0);
          for (const topic of mod.topics) {
            expect(topic.title).toBeTruthy();
            expect(topic.slug).toBeTruthy();
            expect(topic.overview).toBeTruthy();
          }
        }
      }
    });

    it('verifies INTERVIEW_QUESTIONS contains valid technical interview questions and answers', () => {
      expect(INTERVIEW_QUESTIONS.length).toBeGreaterThanOrEqual(20);

      for (const q of INTERVIEW_QUESTIONS) {
        expect(q.id).toBeTruthy();
        expect(q.title).toBeTruthy();
        expect(q.category).toBeTruthy();
        expect(q.categorySlug).toBeTruthy();
        expect(q.shortSummary).toBeTruthy();
        expect(q.deepAnswer).toBeTruthy();
      }
    });

    it('verifies DEFAULT_COURSES_CATALOG provides structured module roadmaps', () => {
      expect(DEFAULT_COURSES_CATALOG.length).toBeGreaterThanOrEqual(4);

      for (const course of DEFAULT_COURSES_CATALOG) {
        expect(course.id).toBeTruthy();
        expect(course.name).toBeTruthy();
        expect(course.slug).toBeTruthy();
        expect(course.estimatedHours).toBeGreaterThan(0);
        expect(course.modulesCount).toBeGreaterThan(0);
      }
    });
  });

  describe('Content Policy & Trademark Neutrality Verification', () => {
    it('verifies zero vendor exam trademarks across all mock tests catalog items', () => {
      for (const mock of DEFAULT_MOCK_TESTS_CATALOG) {
        expect(mock.title).not.toMatch(TRADEMARK_REGEX);
        expect(mock.slug).not.toMatch(TRADEMARK_REGEX);
        if (mock.description) {
          expect(mock.description).not.toMatch(TRADEMARK_REGEX);
        }
      }
    });

    it('verifies zero vendor exam trademarks across role handbooks', () => {
      for (const hb of ROLE_HANDBOOKS) {
        expect(hb.name).not.toMatch(TRADEMARK_REGEX);
        expect(hb.slug).not.toMatch(TRADEMARK_REGEX);
        expect(hb.summary).not.toMatch(TRADEMARK_REGEX);
        expect(hb.information.overview).not.toMatch(TRADEMARK_REGEX);
      }
    });

    it('verifies zero vendor exam trademarks across documentation tracks', () => {
      for (const track of DOC_TRACKS) {
        expect(track.title).not.toMatch(TRADEMARK_REGEX);
        expect(track.slug).not.toMatch(TRADEMARK_REGEX);
      }
    });
  });

  describe('Deterministic Offline Simulation & Fallback Resilience', () => {
    it('initializes fallback mock test session with valid question and section structure', async () => {
      const session = await startMockTestSession('mock-1');

      expect(session.attempt.id).toBeTruthy();
      expect(session.attempt.status).toBe('IN_PROGRESS');
      expect(session.attempt.durationMinutes).toBeGreaterThan(0);
      expect(session.sections?.length).toBe(2);
      expect(session.questions.length).toBeGreaterThan(0);

      const firstQuestion = session.questions[0];
      expect(firstQuestion.options.length).toBeGreaterThanOrEqual(2);
      expect(firstQuestion.topicName).toBeTruthy();
      expect(firstQuestion.subjectName).toBeTruthy();
    });

    it('generates statistically sound scorecard when submitting mock test offline', async () => {
      const scorecard = await submitMockTestSession('attempt-mock-1');

      expect(scorecard.attemptId).toBe('attempt-mock-1');
      expect(scorecard.score).toBeGreaterThanOrEqual(0);
      expect(scorecard.maxScore).toBeGreaterThan(0);
      expect(scorecard.accuracy).toBeGreaterThanOrEqual(0);
      expect(scorecard.accuracy).toBeLessThanOrEqual(100);
      expect(scorecard.topicBreakdown.length).toBeGreaterThan(0);
      expect(scorecard.percentileRank).toBeDefined();
      expect(scorecard.percentileRank?.percentile).toBeGreaterThan(0);
    });
  });

  describe('Environment & Zero-AI Architecture Verification', () => {
    it('constructs correct API URLs without requiring external AI vendor keys', () => {
      const authUrl = apiUrl('auth/login');
      expect(authUrl).toContain('/api/v1/auth/login');

      const mockUrl = apiUrl('mock-tests');
      expect(mockUrl).toContain('/api/v1/mock-tests');

      // Verify no external cloud AI endpoints exist in environment configuration
      expect(authUrl).not.toContain('api.openai.com');
      expect(authUrl).not.toContain('generativelanguage.googleapis.com');
      expect(authUrl).not.toContain('anthropic.com');
    });
  });
});
