import { describe, it, expect } from 'vitest';
import {
  INTERVIEW_CATEGORIES,
  INTERVIEW_QUESTIONS,
  getInterviewQuestions,
  getInterviewQuestionById,
} from './interview-catalog';

describe('Interview Catalog Data & Utility Tests', () => {
  it('contains at least 200 master technical interview questions', () => {
    expect(INTERVIEW_QUESTIONS.length).toBeGreaterThanOrEqual(200);
    expect(INTERVIEW_QUESTIONS.length).toBe(325);
  });

  it('provides complete coverage across all 8 technical disciplines', () => {
    const disciplineSlugs = INTERVIEW_CATEGORIES.filter((c) => c.slug !== 'all').map(
      (c) => c.slug,
    );
    expect(disciplineSlugs.length).toBe(8);

    for (const slug of disciplineSlugs) {
      const matchingQuestions = INTERVIEW_QUESTIONS.filter(
        (q) => q.categorySlug === slug,
      );
      expect(matchingQuestions.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('ensures every question conforms to strict editorial and structural invariants', () => {
    for (const q of INTERVIEW_QUESTIONS) {
      expect(q.id).toBeTruthy();
      expect(q.title).toBeTruthy();
      expect(q.shortSummary).toBeTruthy();
      expect(q.deepAnswer.length).toBeGreaterThan(100);
      expect(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).toContain(q.difficulty);
      expect(['VERY HIGH', 'HIGH', 'MEDIUM']).toContain(q.frequency);
      expect(q.interviewerCounterQuestions.length).toBeGreaterThanOrEqual(2);
      expect(q.keyTakeaways.length).toBeGreaterThanOrEqual(2);
      expect(q.pitfalls.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('filters questions correctly by category slug', () => {
    const dsaQuestions = getInterviewQuestions('dsa');
    expect(dsaQuestions.length).toBeGreaterThanOrEqual(7);
    for (const q of dsaQuestions) {
      expect(q.categorySlug).toBe('dsa');
    }

    const allQuestions = getInterviewQuestions('all');
    expect(allQuestions.length).toBe(INTERVIEW_QUESTIONS.length);
  });

  it('filters questions correctly by search keyword', () => {
    const results = getInterviewQuestions(undefined, 'Kafka');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('Kafka');

    const noResults = getInterviewQuestions(undefined, 'xyznonexistentterm123');
    expect(noResults.length).toBe(0);
  });

  it('fetches a single interview question by ID', () => {
    const question = getInterviewQuestionById('dsa-01');
    expect(question).toBeDefined();
    expect(question?.title).toContain('LRU');
    expect(question?.categorySlug).toBe('dsa');

    const nonExistent = getInterviewQuestionById('invalid-id-999');
    expect(nonExistent).toBeUndefined();
  });
});
