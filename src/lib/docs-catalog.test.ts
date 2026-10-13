import { describe, it, expect } from 'vitest';
import {
  DOC_TRACKS,
  getDocTracks,
  getDocTrack,
  getDocTopic,
  getAdjacentDocTopics,
} from './docs-catalog';
import { searchDocTopics } from './docs-client';

describe('Documentation & Tutorials Catalog Tests', () => {
  it('contains at least 10 comprehensive documentation tracks across languages and specializations', () => {
    expect(DOC_TRACKS.length).toBeGreaterThanOrEqual(10);
    expect(DOC_TRACKS.length).toBe(14);
    expect(getDocTracks().length).toBe(14);
  });

  it('guarantees unique IDs and slugs across all documentation tracks', () => {
    const trackIds = new Set(DOC_TRACKS.map((t) => t.id));
    expect(trackIds.size).toBe(DOC_TRACKS.length);

    const trackSlugs = new Set(DOC_TRACKS.map((t) => t.slug));
    expect(trackSlugs.size).toBe(DOC_TRACKS.length);
  });

  it('guarantees unique topic IDs across all tracks and modules', () => {
    const topicIds = new Set<string>();
    let totalTopics = 0;

    for (const track of DOC_TRACKS) {
      for (const mod of track.modules) {
        for (const topic of mod.topics) {
          totalTopics++;
          expect(topicIds.has(topic.id)).toBe(false);
          topicIds.add(topic.id);
        }
      }
    }

    expect(totalTopics).toBeGreaterThanOrEqual(35);
    expect(totalTopics).toBe(90);
  });

  it('guarantees every track has at least 2 topics and complete curricula', () => {
    for (const track of DOC_TRACKS) {
      const topicCount = track.modules.reduce((sum, m) => sum + m.topics.length, 0);
      expect(topicCount).toBeGreaterThanOrEqual(2);
    }
  });

  it('verifies the Modern Java track contains deep textbook-grade coverage across 7 core modules', () => {
    const javaTrack = getDocTrack('java');
    expect(javaTrack).toBeDefined();
    expect(javaTrack?.title).toContain('Java');
    expect(javaTrack?.modules.length).toBe(7);

    const moduleSlugs = javaTrack?.modules.map((m) => m.slug);
    expect(moduleSlugs).toContain('fundamentals');
    expect(moduleSlugs).toContain('oop-architecture');
    expect(moduleSlugs).toContain('memory-management-and-gc');
    expect(moduleSlugs).toContain('collections-framework');
    expect(moduleSlugs).toContain('concurrency-and-loom');
    expect(moduleSlugs).toContain('functional-programming-and-streams');
    expect(moduleSlugs).toContain('io-networking-persistence');
  });

  it('ensures every topic contains valid invariants, short description, and practice MCQs', () => {
    for (const track of DOC_TRACKS) {
      for (const mod of track.modules) {
        for (const topic of mod.topics) {
          expect(topic.id).toBeTruthy();
          expect(topic.slug).toBeTruthy();
          expect(topic.title).toBeTruthy();
          expect(topic.shortDescription).toBeTruthy();
          expect(topic.readTimeMinutes).toBeGreaterThan(0);
          expect(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).toContain(topic.difficulty);
          expect(topic.invariants.length).toBeGreaterThanOrEqual(2);
          expect(topic.practiceMcqs.length).toBeGreaterThanOrEqual(1);

          for (const mcq of topic.practiceMcqs) {
            expect(mcq.question).toBeTruthy();
            expect(mcq.options.length).toBe(4);
            expect(mcq.correctIndex).toBeGreaterThanOrEqual(0);
            expect(mcq.correctIndex).toBeLessThanOrEqual(3);
            expect(mcq.explanation.length).toBeGreaterThan(20);
          }
        }
      }
    }
  });

  it('retrieves specific topic with track and module context', () => {
    const result = getDocTopic('java', 'jvm-architecture-and-bytecode-lifecycle');
    expect(result).toBeDefined();
    expect(result?.track.slug).toBe('java');
    expect(result?.module.slug).toBe('fundamentals');
    expect(result?.topic.title).toContain('JVM Architecture');
    expect(result?.topic.interactivePlayground).toBeDefined();
  });

  it('resolves adjacent topics for linear chapter-by-chapter progression', () => {
    const adj = getAdjacentDocTopics('java', 'jvm-architecture-and-bytecode-lifecycle');
    expect(adj.prev).toBeNull();
    expect(adj.next).toBeDefined();
    expect(adj.next?.topicSlug).toBe('primitive-types-operators-and-pattern-matching');
  });

  it('verifies uniform MCQ option distribution and content policy compliance', () => {
    const distribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let totalMcqs = 0;
    const forbiddenTerms = [
      /\bAmazon\b/i,
      /\bAWS\b/i,
      /\bGoogle Cloud\b/i,
      /\bGCP\b/i,
      /\bMicrosoft Azure\b/i,
      /\bNetflix\b/i,
      /\bMeta\b/i,
      /\bFacebook\b/i,
      /\bUber\b/i,
      /\bApple\b/i,
    ];

    for (const track of DOC_TRACKS) {
      for (const mod of track.modules) {
        for (const topic of mod.topics) {
          // Check content policy on titles, overviews, invariants
          for (const term of forbiddenTerms) {
            expect(term.test(topic.title)).toBe(false);
            expect(term.test(topic.overview)).toBe(false);
          }

          for (const mcq of topic.practiceMcqs) {
            totalMcqs++;
            distribution[mcq.correctIndex] = (distribution[mcq.correctIndex] || 0) + 1;

            for (const term of forbiddenTerms) {
              expect(term.test(mcq.question)).toBe(false);
              for (const opt of mcq.options) {
                expect(term.test(opt)).toBe(false);
              }
            }
          }
        }
      }
    }

    expect(totalMcqs).toBe(120);

    // Verify exact uniform balance across A, B, C, D (exactly 30 for each option, 25.00%)
    for (let i = 0; i < 4; i++) {
      expect(distribution[i]).toBe(30);
      const proportion = distribution[i] / totalMcqs;
      expect(proportion).toBe(0.25);
    }
  });

  it('searches topics across all tracks by keyword', () => {
    const results = searchDocTopics('Virtual Threads');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].topicTitle).toContain('Virtual Threads');

    const emptyResults = searchDocTopics('nonexistentterm999xyz');
    expect(emptyResults.length).toBe(0);
  });
});


