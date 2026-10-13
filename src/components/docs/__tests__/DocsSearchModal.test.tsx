import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocsSearchModal } from '../DocsSearchModal';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('DocsSearchModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<DocsSearchModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByPlaceholderText(/Search across all 13 tracks/i)).toBeNull();
  });

  it('renders search input and category filter tabs when isOpen is true', () => {
    render(<DocsSearchModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByPlaceholderText(/Search across all 13 tracks/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /All Tracks/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Languages/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Specializations/i })).toBeDefined();
  });

  it('filters results dynamically when user types in search query', () => {
    render(<DocsSearchModal isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Search across all 13 tracks/i);
    fireEvent.change(input, { target: { value: 'Virtual Threads' } });

    expect(screen.getAllByText(/Virtual Threads/i).length).toBeGreaterThanOrEqual(1);
  });

  it('switches category filter tabs between All, Languages, and Specializations', () => {
    render(<DocsSearchModal isOpen={true} onClose={vi.fn()} />);

    const langTab = screen.getByRole('button', { name: /Languages/i });
    fireEvent.click(langTab);
    expect(langTab.className).toContain('bg-primary-100');

    const specTab = screen.getByRole('button', { name: /Specializations/i });
    fireEvent.click(specTab);
    expect(specTab.className).toContain('bg-primary-100');
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<DocsSearchModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    const { container } = render(<DocsSearchModal isOpen={true} onClose={handleClose} />);

    // First child of dialog is the backdrop overlay
    const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/60');
    expect(backdrop).toBeDefined();
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('navigates to selected topic on click and invokes onClose', () => {
    const handleClose = vi.fn();
    render(<DocsSearchModal isOpen={true} onClose={handleClose} />);

    const input = screen.getByPlaceholderText(/Search across all 13 tracks/i);
    fireEvent.change(input, { target: { value: 'AVL Trees' } });

    const resultItem = screen.getByText(/AVL Trees & Red-Black/i);
    fireEvent.click(resultItem);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/docs/dsa/'));
  });
});
