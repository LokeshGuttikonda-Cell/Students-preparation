import {
  CURRICULUM_DOMAINS,
  CURRICULUM_ARTICLES,
  type CurriculumDomain,
  type CurriculumArticle,
} from './curriculum-catalog';

export {
  CURRICULUM_DOMAINS,
  CURRICULUM_ARTICLES,
  type CurriculumDomain,
  type CurriculumArticle,
};

export async function getCurriculumDomains(): Promise<CurriculumDomain[]> {
  const domainsWithAccurateCounts = CURRICULUM_DOMAINS.map((d) => {
    const actualCount = CURRICULUM_ARTICLES.filter((a) => a.domainSlug === d.slug).length;
    return {
      ...d,
      articlesCount: actualCount > 0 ? actualCount : d.articlesCount,
    };
  });
  return Promise.resolve(domainsWithAccurateCounts);
}

export async function getCurriculumArticles(domainSlug?: string): Promise<CurriculumArticle[]> {
  if (!domainSlug) {
    return Promise.resolve([...CURRICULUM_ARTICLES]);
  }
  return Promise.resolve(CURRICULUM_ARTICLES.filter((a) => a.domainSlug === domainSlug));
}

export async function getArticlesForRole(roleSlug: string): Promise<CurriculumArticle[]> {
  return Promise.resolve(CURRICULUM_ARTICLES.filter((a) => a.relatedRoleSlugs.includes(roleSlug)));
}

export async function getCurriculumArticle(slug: string): Promise<CurriculumArticle | null> {
  const article = CURRICULUM_ARTICLES.find((a) => a.slug === slug);
  return Promise.resolve(article || null);
}

export async function searchCurriculumArticles(query: string): Promise<CurriculumArticle[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return Promise.resolve([...CURRICULUM_ARTICLES]);

  const results = CURRICULUM_ARTICLES.filter((a) => {
    return (
      a.title.toLowerCase().includes(clean) ||
      a.summary.toLowerCase().includes(clean) ||
      a.domainName.toLowerCase().includes(clean) ||
      a.keyConcepts.some((kc) => kc.toLowerCase().includes(clean))
    );
  });

  return Promise.resolve(results);
}

