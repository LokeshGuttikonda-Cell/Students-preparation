/**
 * Client-side and server-side data accessors for the Documentation & Tutorials Catalog.
 */

import {
  DOC_TRACKS,
  type DocTrack,
  type DocModule,
  type DocTopic,
  getDocTracks as getCatalogTracks,
  getDocTrack as getCatalogTrack,
  getDocTopic as getCatalogTopic,
  getAdjacentDocTopics as getCatalogAdjacent,
} from './docs-catalog';

export type {
  DocTrack,
  DocModule,
  DocTopic,
  DocTheorySection,
  DocCodeSnippet,
  DocMultiLanguageSnippet,
  DocPlayground,
  DocInterviewerGotcha,
  DocMcq,
  DocTopicComplexity,
} from './docs-catalog';

export async function getDocTracks(): Promise<DocTrack[]> {
  return getCatalogTracks();
}

export async function getDocTrack(slug: string): Promise<DocTrack | undefined> {
  return getCatalogTrack(slug);
}

export async function getDocTopic(
  trackSlug: string,
  topicSlug: string,
): Promise<{ track: DocTrack; module: DocModule; topic: DocTopic } | undefined> {
  return getCatalogTopic(trackSlug, topicSlug);
}

export async function getAdjacentDocTopics(
  trackSlug: string,
  topicSlug: string,
): Promise<{
  prev: { trackSlug: string; topicSlug: string; title: string } | null;
  next: { trackSlug: string; topicSlug: string; title: string } | null;
}> {
  return getCatalogAdjacent(trackSlug, topicSlug);
}

export interface DocSearchResult {
  trackSlug: string;
  trackTitle: string;
  trackIcon: string;
  moduleTitle: string;
  topicSlug: string;
  topicTitle: string;
  shortDescription: string;
  difficulty: string;
  readTimeMinutes: number;
}

export function searchDocTopics(
  query: string,
  filterTrackSlug?: string,
): DocSearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: DocSearchResult[] = [];

  for (const track of DOC_TRACKS) {
    if (filterTrackSlug && filterTrackSlug !== 'all' && track.slug !== filterTrackSlug) {
      continue;
    }

    for (const mod of track.modules) {
      for (const topic of mod.topics) {
        const matches =
          topic.title.toLowerCase().includes(q) ||
          topic.shortDescription.toLowerCase().includes(q) ||
          topic.overview.toLowerCase().includes(q) ||
          topic.invariants.some((inv) => inv.toLowerCase().includes(q));

        if (matches) {
          results.push({
            trackSlug: track.slug,
            trackTitle: track.title,
            trackIcon: track.icon,
            moduleTitle: mod.title,
            topicSlug: topic.slug,
            topicTitle: topic.title,
            shortDescription: topic.shortDescription,
            difficulty: topic.difficulty,
            readTimeMinutes: topic.readTimeMinutes,
          });
        }
      }
    }
  }

  return results;
}
