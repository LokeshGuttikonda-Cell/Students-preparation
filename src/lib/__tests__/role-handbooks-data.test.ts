import { describe, it, expect } from 'vitest';
import { ROLE_HANDBOOKS } from '../role-handbooks-data';

describe('ROLE_HANDBOOKS Catalog & Content Policy Integrity', () => {
  it('should contain exactly 13 IT roles', () => {
    expect(ROLE_HANDBOOKS).toHaveLength(13);
  });

  it('should have unique IDs and slugs across all roles', () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();

    for (const role of ROLE_HANDBOOKS) {
      expect(ids.has(role.id)).toBe(false);
      expect(slugs.has(role.slug)).toBe(false);
      ids.add(role.id);
      slugs.add(role.slug);
    }
  });

  it('should contain all 13 required canonical IT roles', () => {
    const expectedSlugs = [
      'aws-cloud-engineer',
      'azure-cloud-engineer',
      'devops-engineer',
      'java-backend-developer',
      'python-developer',
      'fullstack-javascript-developer',
      'data-analyst',
      'crm-specialist',
      'data-engineer',
      'ml-ai-engineer',
      'cybersecurity-specialist',
      'qa-automation-engineer',
      'ai-agent-engineer',
    ];

    const actualSlugs = ROLE_HANDBOOKS.map((r) => r.slug);
    for (const slug of expectedSlugs) {
      expect(actualSlugs).toContain(slug);
    }
  });

  it('should have comprehensive role information for every role', () => {
    for (const role of ROLE_HANDBOOKS) {
      expect(role.name.trim().length).toBeGreaterThan(5);
      expect(role.summary.trim().length).toBeGreaterThan(20);
      expect(role.estimatedReadTime).toMatch(/\d+\s+min/);
      expect(role.pageEstimate).toBeGreaterThan(5);

      const info = role.information;
      expect(info.overview.length).toBeGreaterThan(50);
      expect(info.mission.length).toBeGreaterThan(20);
      expect(info.dayInTheLife.length).toBeGreaterThanOrEqual(3);
      expect(info.coreResponsibilities.length).toBeGreaterThanOrEqual(3);
      expect(info.careerProgression.length).toBeGreaterThanOrEqual(3);
      expect(info.compensationBands.length).toBeGreaterThanOrEqual(2);
      expect(info.keyToolsAndTechnologies.length).toBeGreaterThanOrEqual(4);
      expect(info.industryDemandRationale.length).toBeGreaterThan(20);
    }
  });

  it('should have multi-tier syllabus with topic weights and invariants for every role', () => {
    for (const role of ROLE_HANDBOOKS) {
      expect(role.syllabus.length).toBeGreaterThanOrEqual(1);

      for (const tier of role.syllabus) {
        expect(tier.tier).toMatch(/Tier\s+\d+/i);
        expect(tier.title.length).toBeGreaterThan(5);
        expect(tier.durationWeeks).toBeGreaterThan(0);
        expect(tier.competencies.length).toBeGreaterThanOrEqual(2);

        for (const comp of tier.competencies) {
          expect(comp.topic.length).toBeGreaterThan(3);
          expect(comp.weightPercentage).toBeGreaterThan(0);
          expect(comp.benchmarkAccuracy).toBeGreaterThanOrEqual(50);
          expect(comp.coreInvariants.length).toBeGreaterThanOrEqual(1);
        }

        if (tier.handsOnProjects) {
          for (const proj of tier.handsOnProjects) {
            expect(proj.title.length).toBeGreaterThan(5);
            expect(proj.spec.length).toBeGreaterThan(20);
            expect(proj.deliverables.length).toBeGreaterThanOrEqual(1);
          }
        }
      }
    }
  });

  it('should have technical interview questions with model answers and counter-probes for every role', () => {
    for (const role of ROLE_HANDBOOKS) {
      expect(role.questions.length).toBeGreaterThanOrEqual(1);

      for (const q of role.questions) {
        expect(q.title.length).toBeGreaterThan(5);
        expect(q.questionText.length).toBeGreaterThan(20);
        expect(q.modelAnswer.length).toBeGreaterThan(50);
        expect(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).toContain(q.difficulty);
        expect(q.counterQuestions.length).toBeGreaterThanOrEqual(1);
        expect(q.criticalPitfalls.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('should have recruiter traps with anti-patterns and correct approaches for every role', () => {
    for (const role of ROLE_HANDBOOKS) {
      expect(role.interviewTraps.length).toBeGreaterThanOrEqual(1);

      for (const trap of role.interviewTraps) {
        expect(trap.title.length).toBeGreaterThan(5);
        expect(trap.antiPattern.length).toBeGreaterThan(15);
        expect(trap.correctApproach.length).toBeGreaterThan(15);
        expect(['HIGH', 'CRITICAL']).toContain(trap.dangerLevel);
        expect(trap.interviewContext.length).toBeGreaterThan(5);
      }
    }
  });

  it('should have architectural documentation and invariants for every role', () => {
    for (const role of ROLE_HANDBOOKS) {
      expect(role.documentation.length).toBeGreaterThanOrEqual(1);

      for (const doc of role.documentation) {
        expect(doc.sectionTitle.length).toBeGreaterThan(5);
        expect(doc.overview.length).toBeGreaterThan(20);
        expect(doc.architecturalInvariants.length).toBeGreaterThanOrEqual(1);

        for (const inv of doc.architecturalInvariants) {
          expect(inv.title.length).toBeGreaterThan(3);
          expect(inv.formulaOrInvariant.length).toBeGreaterThan(3);
          expect(inv.explanation.length).toBeGreaterThan(15);
          expect(inv.tradeoffs.length).toBeGreaterThan(10);
        }

        if (doc.codeExamples) {
          for (const code of doc.codeExamples) {
            expect(code.title.length).toBeGreaterThan(3);
            expect(code.language.length).toBeGreaterThan(1);
            expect(code.code.length).toBeGreaterThan(20);
            expect(code.explanation.length).toBeGreaterThan(10);
          }
        }
      }
    }
  });

  it('should strictly adhere to CONTENT_POLICY.md: zero commercial trademarks in text content', () => {
    const forbiddenTrademarks = [
      /\bAWS\b/,
      /\bAmazon Web Services\b/i,
      /\bGCP\b/,
      /\bGoogle Cloud\b/i,
      /\bAzure\b/i,
      /\bNetflix\b/i,
      /\bMeta\b(?!-?data)/i,
      /\bFacebook\b/i,
      /\bUber\b/i,
    ];

    for (const role of ROLE_HANDBOOKS) {
      const textToScan = [
        role.name,
        role.summary,
        role.information.overview,
        role.information.mission,
        ...role.information.dayInTheLife,
        ...role.information.coreResponsibilities,
        ...role.information.careerProgression.map((p) => `${p.title} ${p.focus}`),
        ...role.syllabus.flatMap((s) => [
          s.title,
          s.description,
          ...s.competencies.flatMap((c) => [c.topic, ...c.coreInvariants]),
          ...(s.handsOnProjects?.flatMap((p) => [p.title, p.spec, ...p.deliverables]) || []),
        ]),
        ...role.questions.flatMap((q) => [
          q.title,
          q.questionText,
          q.modelAnswer,
          ...q.counterQuestions,
          ...q.criticalPitfalls,
        ]),
        ...role.interviewTraps.flatMap((t) => [
          t.title,
          t.antiPattern,
          t.correctApproach,
          t.interviewContext,
        ]),
        ...role.documentation.flatMap((d) => [
          d.sectionTitle,
          d.overview,
          ...d.architecturalInvariants.flatMap((i) => [i.title, i.explanation, i.tradeoffs]),
          ...(d.codeExamples?.flatMap((c) => [c.title, c.explanation]) || []),
        ]),
      ].join(' ');

      for (const pattern of forbiddenTrademarks) {
        expect(textToScan).not.toMatch(pattern);
      }
    }
  });
});
