import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageEvolutionModal } from '../LanguageEvolutionModal';

describe('LanguageEvolutionModal Component', () => {
  it('does not render when isOpen is false', () => {
    const handleClose = vi.fn();
    render(<LanguageEvolutionModal isOpen={false} onClose={handleClose} />);

    expect(screen.queryByText(/Language Evolution/i)).toBeNull();
  });

  it('renders modal title, language tabs, and version diff cards when isOpen is true', () => {
    const handleClose = vi.fn();
    render(<LanguageEvolutionModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Language Evolution & Modern Idiom Migration')).toBeDefined();
    expect(screen.getByText('All Languages')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Java' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Python' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'C++' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Rust' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'TypeScript' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Go' })).toBeDefined();

    // Verify presence of LTS feature title
    expect(
      screen.getByText('Thread-Per-Request to Virtual Threads (Project Loom)')
    ).toBeDefined();
  });

  it('filters cards when switching language tabs', () => {
    const handleClose = vi.fn();
    render(<LanguageEvolutionModal isOpen={true} onClose={handleClose} />);

    // Click Go tab
    const goTab = screen.getByRole('button', { name: 'Go' });
    fireEvent.click(goTab);

    expect(
      screen.getByText('Empty Interfaces to Generics & Per-Iteration Loop Scoping')
    ).toBeDefined();
    expect(
      screen.queryByText('Thread-Per-Request to Virtual Threads (Project Loom)')
    ).toBeNull();
  });

  it('copies modern code snippet to clipboard on click', async () => {
    const handleClose = vi.fn();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<LanguageEvolutionModal isOpen={true} onClose={handleClose} />);

    // Find and click the first copy button
    const copyButtons = screen.getAllByRole('button', { name: /copy/i });
    expect(copyButtons.length).toBeGreaterThan(0);

    await React.act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    expect(writeTextMock).toHaveBeenCalled();
  });

  it('closes when clicking close button or pressing Escape key', () => {
    const handleClose = vi.fn();
    render(<LanguageEvolutionModal isOpen={true} onClose={handleClose} />);

    // Click top close button
    const closeBtn = screen.getByRole('button', { name: 'Close modal' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
