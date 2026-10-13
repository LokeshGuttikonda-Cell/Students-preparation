import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CURATED_PULL_REQUESTS,
  evaluateCodeReview,
  generateCodeReviewReportMarkdown,
  exportCodeReviewReportPdf,
  downloadFile,
  loadSavedCodeReviewState,
  saveCodeReviewRecord,
  CODE_REVIEW_STORAGE_KEY,
  type UserInlineComment,
  type SavedCodeReviewRecord,
} from '../code-review-client';

describe('code-review-client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Curated Pull Requests Catalog', () => {
    it('contains exactly 6 enterprise pull requests covering various languages and architectures', () => {
      expect(CURATED_PULL_REQUESTS).toHaveLength(6);

      const languages = CURATED_PULL_REQUESTS.map((pr) => pr.language);
      expect(languages).toContain('TypeScript');
      expect(languages).toContain('Python');
      expect(languages).toContain('Go');
      expect(languages).toContain('Java');
      expect(languages).toContain('SQL');
    });

    it('ensures each PR has at least one file, non-empty diff lines, and golden flaws', () => {
      for (const pr of CURATED_PULL_REQUESTS) {
        expect(pr.id).toBeTruthy();
        expect(pr.title).toBeTruthy();
        expect(pr.author).toBeTruthy();
        expect(pr.targetService).toBeTruthy();
        expect(pr.files.length).toBeGreaterThan(0);
        expect(pr.goldenFlaws.length).toBeGreaterThan(0);
        expect(pr.hints.length).toBeGreaterThan(0);

        for (const file of pr.files) {
          expect(file.filename).toBeTruthy();
          expect(file.diffLines.length).toBeGreaterThan(0);
        }

        for (const flaw of pr.goldenFlaws) {
          expect(flaw.id).toBeTruthy();
          expect(flaw.lineNumber).toBeGreaterThan(0);
          expect(flaw.explanation).toBeTruthy();
          expect(flaw.recommendedFixCode).toBeTruthy();
          expect(['CRITICAL', 'MAJOR', 'MINOR', 'NITPICK']).toContain(flaw.severity);
          expect([
            'SECURITY',
            'PERFORMANCE',
            'CONCURRENCY',
            'CORRECTNESS',
            'MAINTAINABILITY',
          ]).toContain(flaw.category);
        }
      }
    });
  });

  describe('evaluateCodeReview', () => {
    const pr = CURATED_PULL_REQUESTS[0]; // distributed-payment-auth

    it('grades S (Staff Level) when all flaws are spotted with precise comments and REQUEST_CHANGES verdict', () => {
      const comments: UserInlineComment[] = pr.goldenFlaws.map((f, idx) => ({
        id: `c-${idx}`,
        fileIndex: f.fileIndex,
        lineNumber: f.lineNumber,
        commentText: `Found flaw: ${f.title}`,
        severity: f.severity,
        category: f.category,
        createdAt: new Date().toISOString(),
      }));

      const evalResult = evaluateCodeReview(pr, comments, 'REQUEST_CHANGES');

      expect(evalResult.recallPercent).toBe(100);
      expect(evalResult.precisionPercent).toBe(100);
      expect(evalResult.verdictAccuracyScore).toBe(100);
      expect(evalResult.grade).toBe('S');
      expect(evalResult.overallScore).toBeGreaterThanOrEqual(90);
      expect(evalResult.detectedFlawIds).toHaveLength(pr.goldenFlaws.length);
      expect(evalResult.missedFlawIds).toHaveLength(0);
      expect(evalResult.earnedBadges).toContain('STAFF_LEVEL_REVIEWER');
      expect(evalResult.earnedBadges).toContain('FLAW_SWEEPER');
      expect(evalResult.earnedBadges).toContain('SECURITY_HAWK');
      expect(evalResult.earnedBadges).toContain('CONCURRENCY_GURU');
    });

    it('matches comments within +/- 2 lines tolerance', () => {
      const firstFlaw = pr.goldenFlaws[0];
      const commentNear: UserInlineComment = {
        id: 'c-near',
        fileIndex: firstFlaw.fileIndex,
        lineNumber: firstFlaw.lineNumber + 2, // 2 lines away
        commentText: 'Race condition here',
        severity: 'CRITICAL',
        category: 'CONCURRENCY',
        createdAt: new Date().toISOString(),
      };

      const evalResult = evaluateCodeReview(pr, [commentNear], 'REQUEST_CHANGES');
      expect(evalResult.detectedFlawIds).toContain(firstFlaw.id);
    });

    it('penalizes catastrophically (Score 0 on verdict) if candidate approves a PR with critical vulnerabilities', () => {
      const evalResult = evaluateCodeReview(pr, [], 'APPROVE');

      expect(evalResult.verdictAccuracyScore).toBe(0);
      expect(evalResult.recallPercent).toBe(0);
      expect(evalResult.grade).toBe('F');
      expect(evalResult.overallScore).toBeLessThan(50);
      expect(evalResult.feedbackSummary).toContain('Substandard review');
    });

    it('calculates precision drop when spurious comments are posted', () => {
      const firstFlaw = pr.goldenFlaws[0];
      const comments: UserInlineComment[] = [
        {
          id: 'c-valid',
          fileIndex: firstFlaw.fileIndex,
          lineNumber: firstFlaw.lineNumber,
          commentText: 'Valid bug found',
          severity: 'CRITICAL',
          category: 'CONCURRENCY',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'c-spurious-1',
          fileIndex: 0,
          lineNumber: 100, // way off
          commentText: 'Spurious nitpick',
          severity: 'NITPICK',
          category: 'MAINTAINABILITY',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'c-spurious-2',
          fileIndex: 0,
          lineNumber: 200,
          commentText: 'Another spurious comment',
          severity: 'NITPICK',
          category: 'MAINTAINABILITY',
          createdAt: new Date().toISOString(),
        },
      ];

      const evalResult = evaluateCodeReview(pr, comments, 'REQUEST_CHANGES');
      expect(evalResult.spuriousCommentCount).toBe(2);
      expect(evalResult.precisionPercent).toBe(33); // 1 / 3 = 33%
    });
  });

  describe('Reporting & Exporters', () => {
    const pr = CURATED_PULL_REQUESTS[1]; // user-feed-service
    const comments: UserInlineComment[] = [
      {
        id: 'c-feed-1',
        fileIndex: 0,
        lineNumber: 13,
        commentText: 'N+1 query in loop',
        severity: 'CRITICAL',
        category: 'PERFORMANCE',
        createdAt: new Date().toISOString(),
      },
    ];
    const evaluation = evaluateCodeReview(pr, comments, 'REQUEST_CHANGES');

    it('generates valid Markdown report with scorecard, detected flaws, and comments', () => {
      const md = generateCodeReviewReportMarkdown(
        pr,
        evaluation,
        comments,
        'Please address the N+1 performance bug prior to merging.',
      );

      expect(md).toContain('# Code Review Audit & Calibration Report');
      expect(md).toContain(pr.title);
      expect(md).toContain('Review Calibration Scorecard');
      expect(md).toContain('Spotted Vulnerabilities');
      expect(md).toContain('N+1 Database Query Anti-Pattern');
      expect(md).toContain('Reviewer Inline Comments Log');
      expect(md).toContain('Please address the N+1 performance bug');
    });

    it('exports PDF report cleanly without throwing errors', () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      const createObjectURLSpy = vi.fn().mockReturnValue('blob:test-pdf-url');
      const revokeObjectURLSpy = vi.fn();

      window.URL.createObjectURL = createObjectURLSpy;
      window.URL.revokeObjectURL = revokeObjectURLSpy;

      expect(() =>
        exportCodeReviewReportPdf(
          pr,
          evaluation,
          comments,
          'Test executive summary for PDF export',
        ),
      ).not.toThrow();

      expect(clickSpy).toHaveBeenCalled();
      expect(createObjectURLSpy).toHaveBeenCalled();
    });

    it('safely handles downloadFile in non-browser environment', () => {
      const originalCreate = window.URL.createObjectURL;
      // @ts-expect-error simulating missing function
      delete window.URL.createObjectURL;

      expect(() => downloadFile('sample.txt', 'hello', 'text/plain')).not.toThrow();

      window.URL.createObjectURL = originalCreate;
    });
  });

  describe('LocalStorage Persistence', () => {
    it('saves and loads code review state accurately', () => {
      expect(loadSavedCodeReviewState()).toEqual({});

      const record: SavedCodeReviewRecord = {
        prId: 'distributed-payment-auth',
        comments: [
          {
            id: 'c-test',
            fileIndex: 0,
            lineNumber: 13,
            commentText: 'Race condition found',
            severity: 'CRITICAL',
            category: 'CONCURRENCY',
            createdAt: '2026-09-21T12:00:00.000Z',
          },
        ],
        verdict: 'REQUEST_CHANGES',
        summaryText: 'Must fix Redis idempotency',
        lastUpdated: '2026-09-21T12:00:00.000Z',
      };

      saveCodeReviewRecord(record);

      const loaded = loadSavedCodeReviewState();
      expect(loaded['distributed-payment-auth']).toBeDefined();
      expect(loaded['distributed-payment-auth'].comments).toHaveLength(1);
      expect(loaded['distributed-payment-auth'].verdict).toBe('REQUEST_CHANGES');
      expect(loaded['distributed-payment-auth'].summaryText).toBe(
        'Must fix Redis idempotency',
      );
    });

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem(CODE_REVIEW_STORAGE_KEY, '{invalid json');
      expect(loadSavedCodeReviewState()).toEqual({});
    });
  });
});
