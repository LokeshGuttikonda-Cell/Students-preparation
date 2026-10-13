import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocsHubPage from '../(student)/docs/page';
import TrackSyllabusPage from '../(student)/docs/[track]/page';
import DocTopicReaderPage from '../(student)/docs/[track]/[slug]/page';

// Mock next/navigation
let mockParams = { track: 'java', slug: 'jvm-architecture-and-bytecode-lifecycle' };

vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/docs/java',
}));

describe('Documentation Pages Integration Tests', () => {
  beforeEach(() => {
    mockParams = { track: 'java', slug: 'jvm-architecture-and-bytecode-lifecycle' };
  });

  it('renders DocsHubPage with track grid and filter buttons', () => {
    render(<DocsHubPage />);

    expect(screen.getByText(/Technical Documentation & Concept Guides/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Search across all languages/i)).toBeDefined();

    // Verify tracks are rendered
    expect(screen.getByText(/Modern Java & JVM Internals/i)).toBeDefined();
    expect(screen.getByText(/Python Deep Internals/i)).toBeDefined();
    expect(screen.getByText(/Data Structures/i)).toBeDefined();

    // Filter by Languages
    const langBtn = screen.getByRole('button', { name: /Languages \(7\)/i });
    fireEvent.click(langBtn);

    expect(screen.getByText(/Modern Java & JVM Internals/i)).toBeDefined();
  });

  it('renders TrackSyllabusPage for Java track with syllabus breakdown', async () => {
    mockParams = { track: 'java', slug: '' };
    render(<TrackSyllabusPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Modern Java & JVM Internals/i).length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByRole('button', { name: /Start Tutorial/i })).toBeDefined();
    expect(screen.getByText(/Complete Curriculum Syllabus/i)).toBeDefined();
    expect(screen.getByText(/Language Fundamentals/i)).toBeDefined();
  });

  it('renders DocTopicReaderPage with 3-column architecture, overview, code playground, and quiz', async () => {
    mockParams = { track: 'java', slug: 'jvm-architecture-and-bytecode-lifecycle' };
    render(<DocTopicReaderPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/JVM Architecture, ClassLoader Subsystem/i).length).toBeGreaterThanOrEqual(1);
    });

    // Verify sections rendered
    expect(screen.getAllByText(/Overview & Architectural Context/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Architectural Invariants & Core Guarantees/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Asymptotic Complexity & Hardware Bounds/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Interactive Code Playground/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Verification MCQ Checkpoint/i).length).toBeGreaterThanOrEqual(1);

    // Verify TOC
    expect(screen.getByText('On This Page')).toBeDefined();
  });
});
