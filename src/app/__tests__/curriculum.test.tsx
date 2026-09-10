import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CurriculumHubPage from '../(student)/curriculum/page';
import CurriculumArticleDetailPage from '../(student)/curriculum/[slug]/page';
import {
  getCurriculumDomains,
  getCurriculumArticles,
  getCurriculumArticle,
  searchCurriculumArticles,
} from '../../lib/curriculum-client';

// Mock navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/curriculum',
  useParams: () => ({ slug: 'binary-search-trees-and-avl-balancing' }),
}));

describe('Curriculum & Knowledge Base Client Tests', () => {
  it('retrieves curriculum domains and articles with complete domain coverage', async () => {
    const domains = await getCurriculumDomains();
    expect(domains.length).toBe(14);

    const articles = await getCurriculumArticles();
    expect(articles.length).toBe(142);

    // Assert that every domain has at least 2 master articles
    for (const domain of domains) {
      const domainArticles = articles.filter((a) => a.domainSlug === domain.slug);
      expect(domainArticles.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('filters articles by search query', async () => {
    const results = await searchCurriculumArticles('binary search');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title.toLowerCase()).toContain('binary search');
  });

  it('fetches a single article by slug', async () => {
    const article = await getCurriculumArticle('binary-search-trees-and-avl-balancing');
    expect(article).not.toBeNull();
    expect(article?.domainSlug).toBe('data-structures-algorithms');
    expect(article?.practiceMcqs.length).toBeGreaterThan(0);
  });
});

describe('CurriculumHubPage Component', () => {
  it('renders technical documentation heading and domain filter buttons', async () => {
    render(<CurriculumHubPage />);

    await waitFor(() => {
      expect(screen.getByText(/Technical Documentation & Concept Guides/i)).toBeDefined();
    });

    expect(screen.getByText(/All Disciplines/i)).toBeDefined();
  });

  it('filters articles dynamically when typing in search input', async () => {
    render(<CurriculumHubPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search concepts, algorithms/i)).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Search concepts, algorithms/i);
    fireEvent.change(searchInput, { target: { value: 'Docker' } });

    await waitFor(() => {
      expect(screen.getByText(/Production Docker Multi-Stage Builds/i)).toBeDefined();
    });
  });
});

describe('CurriculumArticleDetailPage Component', () => {
  it('renders article overview, theory, and allows interactive MCQ answering', async () => {
    render(<CurriculumArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Binary Search Trees/i).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/1. Executive Overview/i)).toBeDefined();
    expect(screen.getByText(/4. Socratic Concept Verification/i)).toBeDefined();

    // Click the correct MCQ option (Option B) for Q1
    const optionBLabel = screen.getAllByText(/^B\)/i)[0];
    const optionBCard = optionBLabel.closest('div')!;
    fireEvent.click(optionBCard);

    await waitFor(() => {
      expect(screen.getByText(/Correct Rationale/i)).toBeDefined();
    });

    // Check TOC section jump links
    expect(screen.getByText('1. Overview')).toBeDefined();
    expect(screen.getByText('2. Theory & Code')).toBeDefined();
    expect(screen.getByText('⚡ Applied Labs')).toBeDefined();

    // Check Previous/Next guide navigation cards
    expect(screen.getByText(/Next Guide →/i)).toBeDefined();
  });
});
