import {
  CURRICULUM_DOMAINS,
  CURRICULUM_SUMMARIES,
  type CurriculumDomain,
  type CurriculumArticleSummary,
} from './curriculum-summaries';
import type { CurriculumArticle } from './curriculum-catalog';

export {
  CURRICULUM_DOMAINS,
  CURRICULUM_SUMMARIES,
  type CurriculumDomain,
  type CurriculumArticleSummary,
  type CurriculumArticle,
};

export async function getCurriculumDomains(): Promise<CurriculumDomain[]> {
  const domainsWithAccurateCounts = CURRICULUM_DOMAINS.map((d) => {
    const actualCount = CURRICULUM_SUMMARIES.filter((a) => a.domainSlug === d.slug).length;
    return {
      ...d,
      articlesCount: actualCount > 0 ? actualCount : d.articlesCount,
    };
  });
  return Promise.resolve(domainsWithAccurateCounts);
}

export async function getCurriculumArticles(domainSlug?: string): Promise<CurriculumArticleSummary[]> {
  if (!domainSlug) {
    return Promise.resolve([...CURRICULUM_SUMMARIES]);
  }
  return Promise.resolve(CURRICULUM_SUMMARIES.filter((a) => a.domainSlug === domainSlug));
}

export async function getArticlesForRole(roleSlug: string): Promise<CurriculumArticleSummary[]> {
  return Promise.resolve(CURRICULUM_SUMMARIES.filter((a) => a.relatedRoleSlugs.includes(roleSlug)));
}

export async function getCurriculumArticle(slug: string): Promise<CurriculumArticle | null> {
  const { CURRICULUM_ARTICLES } = await import('./curriculum-catalog');
  const article = CURRICULUM_ARTICLES.find((a) => a.slug === slug);
  return Promise.resolve(article || null);
}

export async function searchCurriculumArticles(query: string): Promise<CurriculumArticleSummary[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return Promise.resolve([...CURRICULUM_SUMMARIES]);

  const results = CURRICULUM_SUMMARIES.filter((a) => {
    return (
      a.title.toLowerCase().includes(clean) ||
      a.summary.toLowerCase().includes(clean) ||
      a.domainName.toLowerCase().includes(clean) ||
      a.keyConcepts.some((kc) => kc.toLowerCase().includes(clean))
    );
  });

  return Promise.resolve(results);
}

export async function getAdjacentArticles(slug: string): Promise<{
  prev: CurriculumArticleSummary | null;
  next: CurriculumArticleSummary | null;
}> {
  const index = CURRICULUM_SUMMARIES.findIndex((a) => a.slug === slug);
  if (index === -1) {
    return Promise.resolve({ prev: null, next: null });
  }
  const prev = index > 0 ? CURRICULUM_SUMMARIES[index - 1] : null;
  const next = index < CURRICULUM_SUMMARIES.length - 1 ? CURRICULUM_SUMMARIES[index + 1] : null;
  return Promise.resolve({ prev, next });
}

