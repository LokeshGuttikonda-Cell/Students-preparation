import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocsSidebar } from '../DocsSidebar';
import { DocsCodeTabs } from '../DocsCodeTabs';
import { DocsPlayground } from '../DocsPlayground';
import { DocsQuizCard } from '../DocsQuizCard';
import { DocsTableOfContents } from '../DocsTableOfContents';
import { getDocTrack, getDocTopic } from '../../../lib/docs-catalog';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/docs/java',
}));

describe('Documentation Interactive UI Components', () => {
  const javaTrack = getDocTrack('java')!;
  const javaTopicData = getDocTopic('java', 'jvm-architecture-and-bytecode-lifecycle')!;

  it('renders DocsSidebar with track title, search filter, and module accordions', () => {
    render(
      <DocsSidebar
        currentTrack={javaTrack}
        currentTopicSlug={javaTopicData.topic.slug}
      />
    );

    expect(screen.getByText(/Modern Java & JVM Internals/i)).toBeDefined();
    expect(screen.getByPlaceholderText('Filter current track...')).toBeDefined();

    // Verify module titles are displayed
    expect(screen.getByText(/Language Fundamentals/i)).toBeDefined();
    expect(screen.getByText(/Module 2: Object-Oriented Architecture/i)).toBeDefined();

    // Verify topic title is rendered
    expect(screen.getByText(/JVM Architecture, ClassLoader Subsystem/i)).toBeDefined();
  });

  it('filters topics dynamically when typing into the sidebar search input', () => {
    render(
      <DocsSidebar
        currentTrack={javaTrack}
        currentTopicSlug={javaTopicData.topic.slug}
      />
    );

    const searchInput = screen.getByPlaceholderText('Filter current track...');
    fireEvent.change(searchInput, { target: { value: 'Virtual Threads' } });

    // Topic matching search should remain
    expect(screen.getAllByText(/Virtual Threads/i).length).toBeGreaterThanOrEqual(1);

    // Non-matching topic should be filtered out
    expect(screen.queryByText(/JVM Architecture, ClassLoader/i)).toBeNull();
  });

  it('renders DocsCodeTabs and allows switching between language snippets and copying', () => {
    const multiSnippets = [
      { language: 'java' as const, label: 'Java 21', code: 'record Point(int x, int y) {}' },
      { language: 'python' as const, label: 'Python 3.13', code: 'p = (10, 20)' },
      { language: 'cpp' as const, label: 'Modern C++20', code: 'struct Point { int x, y; };' },
    ];

    render(<DocsCodeTabs multiSnippets={multiSnippets} />);

    expect(screen.getByText('Java 21')).toBeDefined();
    expect(screen.getByText('Python 3.13')).toBeDefined();
    expect(screen.getByText('Modern C++20')).toBeDefined();

    // Active tab shows Java code
    expect(screen.getByText('record Point(int x, int y) {}')).toBeDefined();

    // Switch tab to Python
    fireEvent.click(screen.getByText('Python 3.13'));
    expect(screen.getByText('p = (10, 20)')).toBeDefined();

    // Test copy button
    const copyBtn = screen.getByRole('button', { name: /Copy code to clipboard/i });
    expect(copyBtn).toBeDefined();
  });

  it('renders DocsPlayground and simulates code execution with output console', async () => {
    const playground = {
      initialCode: 'System.out.println("Hello World");',
      language: 'java',
      expectedOutput: 'Hello World',
      explanation: 'Compiles and runs a basic program',
    };

    render(<DocsPlayground playground={playground} />);

    expect(screen.getByText(/Interactive Code Playground/i)).toBeDefined();
    const runBtn = screen.getByRole('button', { name: /Run Code/i });
    expect(runBtn).toBeDefined();

    fireEvent.click(runBtn);

    // After async simulation completes
    await waitFor(
      () => {
        expect(screen.getByText('Hello World')).toBeDefined();
      },
      { timeout: 1500 }
    );
  });

  it('renders DocsQuizCard and provides Socratic feedback upon option selection', () => {
    const questions = [
      {
        id: 'q-test-1',
        question: 'What is the primary memory area for all Java objects?',
        options: ['Java Heap', 'Call Stack', 'Native Stack', 'PC Register'],
        correctIndex: 0,
        explanation: 'All Java class instances and arrays are allocated strictly on the Heap.',
      },
    ];

    render(<DocsQuizCard questions={questions} />);

    expect(screen.getByText(/Verification MCQ Checkpoint/i)).toBeDefined();
    expect(screen.getByText('What is the primary memory area for all Java objects?')).toBeDefined();

    // Click option A ('Java Heap' or its shuffled equivalent)
    const heapOptionBtn = screen.getByText('Java Heap').closest('button')!;
    fireEvent.click(heapOptionBtn);

    // Verified correct assessment
    expect(screen.getByText(/Correct Assessment/i)).toBeDefined();
    expect(screen.getByText(/All Java class instances and arrays are allocated strictly on the Heap/i)).toBeDefined();
  });

  it('renders DocsTableOfContents with section outline and sandbox launcher link', () => {
    render(<DocsTableOfContents topic={javaTopicData.topic} />);

    expect(screen.getByText('On This Page')).toBeDefined();
    expect(screen.getByText('Overview & Fundamentals')).toBeDefined();
    expect(screen.getByText('Architectural Invariants')).toBeDefined();
    expect(screen.getAllByText(/Lab/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /Open .* Lab/i })).toBeDefined();
  });
});
