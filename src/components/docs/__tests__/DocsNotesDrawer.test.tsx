import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocsNotesDrawer } from '../DocsNotesDrawer';

describe('DocsNotesDrawer Component', () => {
  const topicId = 'top-test-architecture';
  const topicTitle = 'Distributed Consensus & Memory Model';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders collapsed by default with title and expand toggle', () => {
    render(<DocsNotesDrawer topicId={topicId} topicTitle={topicTitle} />);

    expect(screen.getByText(/Personal Engineering Notes/i)).toBeDefined();
    expect(screen.getByText(/Expand/i)).toBeDefined();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('expands when clicking the header toggle button', () => {
    render(<DocsNotesDrawer topicId={topicId} topicTitle={topicTitle} />);

    const toggleBtn = screen.getByRole('button', { name: /Personal Engineering Notes/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/Collapse/i)).toBeDefined();
    expect(screen.getByRole('textbox', { name: /Personal notes for this chapter/i })).toBeDefined();
  });

  it('preloads existing saved notes from localStorage on mount', () => {
    localStorage.setItem(`studentsprep_notes_${topicId}`, 'Invariant 1: All Raft nodes agree.');

    render(<DocsNotesDrawer topicId={topicId} topicTitle={topicTitle} />);

    // Check badge shows word count
    expect(screen.getByText(/6 words/i)).toBeDefined();

    const toggleBtn = screen.getByRole('button', { name: /Personal Engineering Notes/i });
    fireEvent.click(toggleBtn);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Invariant 1: All Raft nodes agree.');
  });

  it('updates notes and auto-saves to localStorage', async () => {
    render(<DocsNotesDrawer topicId={topicId} topicTitle={topicTitle} />);

    const toggleBtn = screen.getByRole('button', { name: /Personal Engineering Notes/i });
    fireEvent.click(toggleBtn);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Cache stampede mitigation requires probabilistic early refresh.' } });

    await waitFor(() => {
      expect(localStorage.getItem(`studentsprep_notes_${topicId}`)).toContain('probabilistic early refresh');
    }, { timeout: 1000 });
  });

  it('copies notes to clipboard when Copy Notes button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    localStorage.setItem(`studentsprep_notes_${topicId}`, 'My critical review note');

    render(<DocsNotesDrawer topicId={topicId} topicTitle={topicTitle} />);

    const toggleBtn = screen.getByRole('button', { name: /Personal Engineering Notes/i });
    fireEvent.click(toggleBtn);

    const copyBtn = screen.getByRole('button', { name: /Copy Notes/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('My critical review note'));
    });
  });

  it('clears notes from state and localStorage upon confirmed clear action', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.setItem(`studentsprep_notes_${topicId}`, 'Temporary note');

    render(<DocsNotesDrawer topicId={topicId} topicTitle={topicTitle} />);

    const toggleBtn = screen.getByRole('button', { name: /Personal Engineering Notes/i });
    fireEvent.click(toggleBtn);

    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(localStorage.getItem(`studentsprep_notes_${topicId}`)).toBeNull();
  });
});
