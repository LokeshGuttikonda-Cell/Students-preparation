import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConcurrencyEventLoopSandbox } from '../ConcurrencyEventLoopSandbox';

describe('ConcurrencyEventLoopSandbox Component', () => {
  it('renders title, description, and initial Node.js event loop architecture queues', () => {
    render(<ConcurrencyEventLoopSandbox />);

    expect(
      screen.getByRole('heading', {
        name: /Runtime Concurrency & Event Loop Simulator/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('Call Stack (LIFO)')).toBeInTheDocument();
    expect(screen.getByText('process.nextTick Queue')).toBeInTheDocument();
    expect(screen.getByText('Promise Microtasks')).toBeInTheDocument();
    expect(screen.getByText('1. Timers Phase (setTimeout)')).toBeInTheDocument();
    expect(screen.getByText('2. Poll Phase (I/O Callbacks)')).toBeInTheDocument();
    expect(screen.getByText('3. Check Phase (setImmediate)')).toBeInTheDocument();
  });

  it('steps forward on clicking Step Forward button and updates execution trace', () => {
    render(<ConcurrencyEventLoopSandbox />);

    const stepBtn = screen.getByRole('button', { name: /Step Forward/i });
    fireEvent.click(stepBtn);

    // Execution trace should now show an entry
    expect(
      screen.getByText(/1\. Synchronous script start/i),
    ).toBeInTheDocument();
  });

  it('detects nextTick recursive starvation hazard preset', () => {
    render(<ConcurrencyEventLoopSandbox />);

    // Click on Starvation scenario
    const starvationBtn = screen.getByRole('button', {
      name: /NextTick Recursive Starvation/i,
    });
    fireEvent.click(starvationBtn);

    // Step forward several times to trigger starvation warning
    const stepBtn = screen.getByRole('button', { name: /Step Forward/i });
    fireEvent.click(stepBtn);
    fireEvent.click(stepBtn);
    fireEvent.click(stepBtn);
    fireEvent.click(stepBtn);

    // Starvation hazard warning should appear
    expect(screen.getByText(/Starvation Hazard Detected/i)).toBeInTheDocument();
  });

  it('switches to Go GMP model and renders logical processors P0, P1, and global runqueue', () => {
    render(<ConcurrencyEventLoopSandbox />);

    const goModelBtn = screen.getByRole('button', { name: /Go \(GMP\)/i });
    fireEvent.click(goModelBtn);

    expect(screen.getByText(/Logical Processor P0/i)).toBeInTheDocument();
    expect(screen.getByText(/Logical Processor P1/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Runqueue \(Mutex Locked\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Network Poller/i)).toBeInTheDocument();

    // Step forward in Go model
    const stepBtn = screen.getByRole('button', { name: /Step Forward/i });
    fireEvent.click(stepBtn);

    expect(
      screen.getByText(/Stole \d+ goroutine\(s\) from P1/i),
    ).toBeInTheDocument();
  });

  it('switches to Python asyncio model and advances cooperative loop ticks', () => {
    render(<ConcurrencyEventLoopSandbox />);

    const pyModelBtn = screen.getByRole('button', { name: /Python \(asyncio\)/i });
    fireEvent.click(pyModelBtn);

    expect(screen.getByText(/Active Running Coroutine Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready Queue \(Runnable Tasks\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Sleeping Futures/i)).toBeInTheDocument();

    // Step forward
    const stepBtn = screen.getByRole('button', { name: /Step Forward/i });
    fireEvent.click(stepBtn);

    expect(screen.getByText(/yielded via 'await asyncio\.sleep\(0\)'/i)).toBeInTheDocument();
    expect(screen.getByText(/Loop Tick #1/i)).toBeInTheDocument();
  });

  it('toggles autoplay and resets state', () => {
    render(<ConcurrencyEventLoopSandbox />);

    const playBtn = screen.getByRole('button', { name: /Auto Play/i });
    fireEvent.click(playBtn);
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();

    // Pause
    fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
    expect(screen.getByRole('button', { name: /Auto Play/i })).toBeInTheDocument();

    // Reset
    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);
  });
});
