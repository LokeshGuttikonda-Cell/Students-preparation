import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AlgorithmVisualizerSandbox } from '../AlgorithmVisualizerSandbox';

describe('AlgorithmVisualizerSandbox', () => {
  it('renders algorithm scenarios and switches between them', () => {
    render(<AlgorithmVisualizerSandbox />);

    // Check default algorithm is Binary Search
    expect(
      screen.getByText('Binary Search (Logarithmic Range Elimination)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Time: O(log N)')).toBeInTheDocument();

    // Check that all 9 algorithms are present in the selector pills
    expect(screen.getByRole('button', { name: 'Binary Search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Two-Pointer Target Sum Traversal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stack Delimiter & Parentheses Validator' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fixed Sliding Window Maximum Subarray' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bubble Sort Invariant Stepper' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Breadth-First Search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Depth-First Search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Binary Search Tree' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Self-Balancing AVL Tree Rotations' })).toBeInTheDocument();
  });

  it('renders AVL Tree Rotations with complete Socratic step-by-step frames', () => {
    render(<AlgorithmVisualizerSandbox />);

    // Select Self-Balancing AVL Tree Rotations
    const avlButton = screen.getByRole('button', { name: 'Self-Balancing AVL Tree Rotations' });
    fireEvent.click(avlButton);

    // Verify Title & Complexity Badges
    expect(
      screen.getByRole('heading', {
        name: 'Self-Balancing AVL Tree Rotations (Balance Factor Maintenance)',
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Time: Lookup/Insert/Delete: O(log N), Rotation: O(1)')).toBeInTheDocument();
    expect(screen.getByText('Space: O(N) storage, O(log N) stack recursion')).toBeInTheDocument();

    // Verify Initial Step 1 of 11
    expect(screen.getByText('Step 1 of 11')).toBeInTheDocument();
    expect(screen.getByText('Initial Balanced State: AVL Invariant Satisfied')).toBeInTheDocument();
    expect(screen.getByText('Balanced AVL')).toBeInTheDocument();
    expect(screen.getByText('Self-Balancing AVL Tree Topology (Balance Factors & Heights)')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    const prevBtn = screen.getByRole('button', { name: /Previous Step/i });
    const resetBtn = screen.getByRole('button', { name: /Reset Stepper/i });

    // Step 2: Insert Key 15
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 2 of 11')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 15: Single Left Descent')).toBeInTheDocument();

    // Step 3: Insert Key 10 (LL Imbalance Triggered)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 3 of 11')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 10: Left-Left (LL) Heavy Imbalance Triggered!')).toBeInTheDocument();
    expect(screen.getByText('LL ROTATION')).toBeInTheDocument();
    expect(screen.getByText('Single Right Rotation Required')).toBeInTheDocument();

    // Step 4: Single Right Rotation Complete
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 4 of 11')).toBeInTheDocument();
    expect(screen.getByText('Single Right Rotation Complete: Node 15 Elevated')).toBeInTheDocument();
    expect(screen.getByText('Single Right Rotation Completed')).toBeInTheDocument();

    // Step 5: Insert Key 85 (Right Subtree Growth)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 5 of 11')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 85: Right Subtree Growth')).toBeInTheDocument();

    // Step 6: Insert Key 95 (RR Imbalance Triggered)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 6 of 11')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 95: Right-Right (RR) Heavy Imbalance Triggered!')).toBeInTheDocument();
    expect(screen.getByText('RR ROTATION')).toBeInTheDocument();
    expect(screen.getByText('Single Left Rotation Required')).toBeInTheDocument();

    // Step 7: Single Left Rotation Complete
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 7 of 11')).toBeInTheDocument();
    expect(screen.getByText('Single Left Rotation Complete: Node 85 Elevated')).toBeInTheDocument();
    expect(screen.getByText('Single Left Rotation Completed')).toBeInTheDocument();

    // Step 8: Insert Key 18 (Inner Subtree Growth)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 8 of 11')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 18: Inner Subtree Growth')).toBeInTheDocument();

    // Step 9: Insert Key 19 (LR Opposite-Sign Imbalance)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 9 of 11')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 19: Left-Right (LR) Opposite-Sign Imbalance!')).toBeInTheDocument();
    expect(screen.getByText('LR ROTATION')).toBeInTheDocument();
    expect(screen.getByText('Double Rotation (LR Case) Required')).toBeInTheDocument();

    // Step 10: LR Phase 1 (Left Rotate Child 18)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 10 of 11')).toBeInTheDocument();
    expect(screen.getByText('LR Phase 1: Left Rotate Child 18 (Straighten the Elbow)')).toBeInTheDocument();

    // Step 11: LR Phase 2 (Right Rotate Parent 25 - Complete)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 11 of 11')).toBeInTheDocument();
    expect(screen.getByText('LR Phase 2: Right Rotate Parent 25 (Balance Restored)')).toBeInTheDocument();
    expect(screen.getByText('Globally Balanced AVL')).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();

    // Test Previous Step
    fireEvent.click(prevBtn);
    expect(screen.getByText('Step 10 of 11')).toBeInTheDocument();

    // Test Reset Stepper
    fireEvent.click(resetBtn);
    expect(screen.getByText('Step 1 of 11')).toBeInTheDocument();
    expect(screen.getByText('Initial Balanced State: AVL Invariant Satisfied')).toBeInTheDocument();
  });
});
