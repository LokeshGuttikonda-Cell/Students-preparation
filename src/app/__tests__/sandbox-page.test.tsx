import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SandboxPage from '../(student)/sandbox/page';

vi.mock('../../components/sandbox/SqlQuerySandbox', () => ({
  SqlQuerySandbox: ({ title, taskDescription }: { title: string; taskDescription?: string }) => (
    <div data-testid="sql-sandbox-mock">
      <h4>{title}</h4>
      <p>{taskDescription}</p>
    </div>
  ),
}));

vi.mock('../../components/sandbox/CodeLogicSandbox', () => ({
  CodeLogicSandbox: ({ title, problemDescription }: { title: string; problemDescription?: string }) => (
    <div data-testid="code-sandbox-mock">
      <h4>{title}</h4>
      <p>{problemDescription}</p>
    </div>
  ),
}));

describe('SandboxPage', () => {
  it('renders SQL challenges by default with challenge pills', () => {
    render(<SandboxPage />);

    expect(screen.getByText('Interactive Code & SQL Studio')).toBeInTheDocument();
    expect(screen.getByTestId('sql-sandbox-mock')).toBeInTheDocument();
    expect(screen.getAllByText('Department Headcount & Average Compensation').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /Employees Earning Above Department Average/i })).toBeInTheDocument();
  });

  it('switches active SQL challenge when clicking a challenge button', () => {
    render(<SandboxPage />);

    const aboveAvgBtn = screen.getByRole('button', { name: /Employees Earning Above Department Average/i });
    fireEvent.click(aboveAvgBtn);

    const mockSandbox = screen.getByTestId('sql-sandbox-mock');
    expect(mockSandbox).toHaveTextContent('Employees Earning Above Department Average');
    expect(mockSandbox).toHaveTextContent('Identify employees whose compensation exceeds the average salary');
  });

  it('switches to Code tab and renders code challenges including Dynamic Programming and Prefix Search', () => {
    render(<SandboxPage />);

    const codeTabBtn = screen.getByRole('button', { name: /Algorithmic Code Logic Lab/i });
    fireEvent.click(codeTabBtn);

    expect(screen.getByTestId('code-sandbox-mock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Two-Sum Linear Search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Minimum Coins for Change/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prefix Matching & Lexicographical Ordering/i })).toBeInTheDocument();

    // Select Minimum Coins for Change
    const coinChangeBtn = screen.getByRole('button', { name: /Minimum Coins for Change/i });
    fireEvent.click(coinChangeBtn);

    const mockSandbox = screen.getByTestId('code-sandbox-mock');
    expect(mockSandbox).toHaveTextContent('Minimum Coins for Change (Dynamic Programming)');
    expect(mockSandbox).toHaveTextContent('Find the minimum number of coins needed to make up a given amount');
  });

  it('switches to Visual Algorithm Stepper tab and interacts with visual stepper controls', () => {
    render(<SandboxPage />);

    const visualizerTabBtn = screen.getByRole('button', { name: /Visual Algorithm Stepper/i });
    fireEvent.click(visualizerTabBtn);

    expect(screen.getByText('Interactive State Stepper & Memory Inspector')).toBeInTheDocument();
    expect(screen.getByText('Binary Search (Logarithmic Range Elimination)')).toBeInTheDocument();

    // Step forward
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Eliminate Left Half: 47 < 68')).toBeInTheDocument();

    // Switch to Two-Pointer algorithm
    const twoPointerBtn = screen.getByRole('button', { name: /Two-Pointer Target Sum Traversal/i });
    fireEvent.click(twoPointerBtn);

    expect(screen.getByText('Initial Extremes: left = 0, right = 7')).toBeInTheDocument();
  });
});
