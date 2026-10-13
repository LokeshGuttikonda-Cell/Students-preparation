import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventLoopSimulator } from '../EventLoopSimulator';

describe('EventLoopSimulator Component', () => {
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
      <EventLoopSimulator isOpen={false} onClose={onCloseMock} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal title, runtime model buttons, preset selector, and queues when isOpen is true', () => {
    render(<EventLoopSimulator isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText('Asynchronous Event Loop & Concurrency Simulator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Node\.js \(libuv/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Go \(GMP/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Python \(asyncio\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⚡ Step Forward/i })).toBeInTheDocument();
    expect(screen.getByText(/Call Stack \(LIFO\)/i)).toBeInTheDocument();
    expect(screen.getByText(/process.nextTick Queue/i)).toBeInTheDocument();
  });

  it('steps through Node.js loop draining call stack, nextTick queue, and microtasks', () => {
    render(<EventLoopSimulator isOpen={true} onClose={onCloseMock} />);

    const stepBtn = screen.getByRole('button', { name: /⚡ Step Forward/i });
    
    // Step 1: Drain Call Stack
    fireEvent.click(stepBtn);
    expect(screen.getByText(/\[CallStack\] Executed synchronous/i)).toBeInTheDocument();

    // Step 2: Drain nextTick queue
    fireEvent.click(stepBtn);
    expect(screen.getByText(/\[NextTickQueue\] Drained process.nextTick/i)).toBeInTheDocument();
  });

  it('switches to Go GMP model and simulates work-stealing when P0 is idle', () => {
    render(<EventLoopSimulator isOpen={true} onClose={onCloseMock} />);

    const goBtn = screen.getByRole('button', { name: /^Go \(GMP/i });
    fireEvent.click(goBtn);

    expect(screen.getByText(/Processor P0 \(Thread M0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Processor P1 \(Thread M1\)/i)).toBeInTheDocument();

    // Step to trigger work stealing
    const stepBtn = screen.getByRole('button', { name: /⚡ Step Forward/i });
    fireEvent.click(stepBtn);

    expect(screen.getByText(/\[Work-Stealing\] P0 was idle! Stole/i)).toBeInTheDocument();
  });

  it('switches to Python asyncio model and simulates cooperative coroutine yielding', () => {
    render(<EventLoopSimulator isOpen={true} onClose={onCloseMock} />);

    const pyBtn = screen.getByRole('button', { name: /^Python \(asyncio\)/i });
    fireEvent.click(pyBtn);

    expect(screen.getByText(/Single-Threaded Event Loop/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready Queue \(FIFO\):/i)).toBeInTheDocument();

    // Step to trigger coroutine yield
    const stepBtn = screen.getByRole('button', { name: /⚡ Step Forward/i });
    fireEvent.click(stepBtn);

    expect(screen.getByText(/\[Asyncio\] Task A \(worker_a\) yielded via 'await asyncio.sleep\(0\)'/i)).toBeInTheDocument();
  });

  it('copies code scenario snippet to clipboard', async () => {
    render(<EventLoopSimulator isOpen={true} onClose={onCloseMock} />);

    const copyBtn = screen.getByRole('button', { name: 'Copy' });
    await React.act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('closes on close button click and on Escape key', () => {
    render(<EventLoopSimulator isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByLabelText('Close event loop simulator');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });
});
