import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StructPaddingVisualizer } from '../StructPaddingVisualizer';

describe('StructPaddingVisualizer Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <StructPaddingVisualizer isOpen={false} onClose={onCloseMock} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal title, presets, KPI cards, and byte grid when isOpen is true', () => {
    render(<StructPaddingVisualizer isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText('Struct Memory Layout & Padding Inspector')).toBeInTheDocument();
    expect(screen.getByText('Total Struct Size')).toBeInTheDocument();
    expect(screen.getByText('Data Payload')).toBeInTheDocument();
    expect(screen.getByText('Padding Holes')).toBeInTheDocument();
    expect(screen.getByText('Max Natural Align')).toBeInTheDocument();
    expect(screen.getByText('L1 Cache Lines')).toBeInTheDocument();
    expect(screen.getByText(/Memory Byte Map/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⚡ Auto-Optimize Layout/i })).toBeInTheDocument();
  });

  it('switches between presets and updates struct layout', () => {
    render(<StructPaddingVisualizer isOpen={true} onClose={onCloseMock} />);

    const concurrentBtn = screen.getByRole('button', { name: /Concurrent Ring Buffer Node/i });
    fireEvent.click(concurrentBtn);

    // Shows false sharing warning for concurrent ring buffer
    expect(screen.getByText(/False Sharing Vulnerability Detected:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/read_index/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/write_index/i).length).toBeGreaterThan(0);
  });

  it('auto-optimizes unoptimized packet struct to reduce padding bytes', () => {
    render(<StructPaddingVisualizer isOpen={true} onClose={onCloseMock} />);

    // Default preset has padding holes
    const autoOptimizeBtn = screen.getByRole('button', { name: /⚡ Auto-Optimize Layout/i });
    fireEvent.click(autoOptimizeBtn);

    expect(screen.getByText(/Optimized! Reordered fields saved/i)).toBeInTheDocument();
  });

  it('allows adding and removing fields from the struct', () => {
    render(<StructPaddingVisualizer isOpen={true} onClose={onCloseMock} />);

    const addBtn = screen.getByRole('button', { name: /\+ Add Field/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('extra_data')).toBeInTheDocument();

    const removeBtn = screen.getByLabelText('Remove field extra_data');
    fireEvent.click(removeBtn);

    expect(screen.queryByText('extra_data')).toBeNull();
  });

  it('switches code language and copies definition to clipboard', async () => {
    render(<StructPaddingVisualizer isOpen={true} onClose={onCloseMock} />);

    const rustBtn = screen.getByRole('button', { name: 'RUST' });
    fireEvent.click(rustBtn);

    expect(screen.getByText(/#\[repr\(C\)\]/i)).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: 'Copy' });
    await React.act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('closes on close button click and on Escape key', () => {
    render(<StructPaddingVisualizer isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByLabelText('Close memory inspector');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });
});
