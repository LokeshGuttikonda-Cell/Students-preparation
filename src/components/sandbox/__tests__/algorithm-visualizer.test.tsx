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
    expect(screen.getByRole('button', { name: 'Red-Black Tree Invariants' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B-Tree / 2-3-4 Multi-Way Node Splitting & Elevation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B+ Tree Range Scan & Leaf Sibling Pointers' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bloom Filter Bit-Array Hashing & False Positive Invariants' })).toBeInTheDocument();
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

  it('renders Red-Black Tree Invariants with Case 1 (Recoloring), Case 2 (Triangle), and Case 3 (Line) rotations', () => {
    render(<AlgorithmVisualizerSandbox />);

    // Select Red-Black Tree Invariants
    const rbButton = screen.getByRole('button', { name: 'Red-Black Tree Invariants' });
    fireEvent.click(rbButton);

    // Verify Title & Complexity Badges
    expect(
      screen.getByRole('heading', {
        name: 'Red-Black Tree Invariants (Node Recoloring & Rotations)',
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Time: Lookup/Insert/Delete: O(log N), Max Rotations: O(1)')).toBeInTheDocument();
    expect(screen.getByText('Space: O(N) space, 1 bit per node color overhead')).toBeInTheDocument();

    // Verify Initial Step 1 of 9
    expect(screen.getByText('Step 1 of 9')).toBeInTheDocument();
    expect(screen.getByText('Initial State: 5 Canonical Red-Black Invariants Satisfied')).toBeInTheDocument();
    expect(screen.getByText('Valid RB Tree')).toBeInTheDocument();
    expect(screen.getByText('Red-Black Tree Topology (Color Invariants & Black-Height)')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });

    // Step 2: Insert Key 5 (RED Leaf)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 2 of 9')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 5: Inserted as RED Leaf')).toBeInTheDocument();

    // Step 3: Insert Key 15 (RED Leaf)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 15: Inserted as RED Leaf')).toBeInTheDocument();

    // Step 4: Insert Key 2 (Case 1 Triggered: Uncle 15 is RED)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 4 of 9')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 2: Case 1 Triggered (Uncle 15 is RED)')).toBeInTheDocument();
    expect(screen.getByText('RECOLOR ROTATION')).toBeInTheDocument();
    expect(screen.getByText('Case 1: Uncle 15 is RED (Recolor)')).toBeInTheDocument();

    // Step 5: Case 1 Complete
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 5 of 9')).toBeInTheDocument();
    expect(screen.getByText('Case 1 Complete: Colors Updated Without Rotations')).toBeInTheDocument();

    // Step 6: Case 2 Triggered (RL Triangle)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 6 of 9')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 35 & 32: Case 2 Triggered (Uncle is NIL & RL Triangle)')).toBeInTheDocument();
    expect(screen.getByText('ROTATION ROTATION')).toBeInTheDocument();
    expect(screen.getByText('Case 2: Uncle is NIL (BLACK) & RL Zig-Zag')).toBeInTheDocument();

    // Step 7: Case 2 Complete (Converted to Case 3 Line)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 7 of 9')).toBeInTheDocument();
    expect(screen.getByText('Case 2 Complete: Converted to Case 3 (RR Linear Chain)')).toBeInTheDocument();

    // Step 8: Case 3 Complete (Grandparent Rotation + Color Swap)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 8 of 9')).toBeInTheDocument();
    expect(screen.getByText('Case 3 Applied: Left Rotate Grandparent 30 & Color Swap')).toBeInTheDocument();

    // Step 9: Global Verification
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 9 of 9')).toBeInTheDocument();
    expect(screen.getByText('Global Verification: All 5 Red-Black Invariants Proven')).toBeInTheDocument();
    expect(screen.getByText('Globally Valid RB Tree')).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();
  });

  it('renders B-Tree / 2-3-4 Multi-Way Node Splitting & Elevation stepping through leaf overflow, median elevation, and root split', () => {
    render(<AlgorithmVisualizerSandbox />);

    // Select B-Tree / 2-3-4 Multi-Way Node Splitting
    const btreeBtn = screen.getByRole('button', { name: 'B-Tree / 2-3-4 Multi-Way Node Splitting & Elevation' });
    fireEvent.click(btreeBtn);

    // Verify Title & Complexity Badges
    expect(
      screen.getByRole('heading', {
        name: 'B-Tree / 2-3-4 Multi-Way Node Splitting & Elevation',
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/O\(log_B N\) disk block I\/Os/)).toBeInTheDocument();

    // Verify Initial Step 1 of 10
    expect(screen.getByText('Step 1 of 10')).toBeInTheDocument();
    expect(screen.getByText('Initial State: Balanced 2-3-4 Multi-Way Tree (Order M=4)')).toBeInTheDocument();
    expect(screen.getByText('B-Tree / 2-3-4 Order M=4 Invariant Properties:')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });

    // Step 2: Insertion search for 75
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 2 of 10')).toBeInTheDocument();
    expect(screen.getByText(/Traverse Multi-Way Range for Key 75/)).toBeInTheDocument();

    // Step 3: Leaf Overflow detected
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 3 of 10')).toBeInTheDocument();
    expect(screen.getByText(/Node Overflow in Leaf/)).toBeInTheDocument();

    // Step 4: Median 70 chosen for promotion
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 4 of 10')).toBeInTheDocument();
    expect(screen.getByText(/Median Key 70 Chosen for Promotion/)).toBeInTheDocument();

    // Step 5: Elevation & Re-Hooking (Root holds 20, 50, 70)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 5 of 10')).toBeInTheDocument();
    expect(screen.getByText(/Elevation & Re-Hooking: Parent Absorbs 70/)).toBeInTheDocument();

    // Fast forward to Step 9 (Root overflow)
    fireEvent.click(nextBtn); // Step 6
    fireEvent.click(nextBtn); // Step 7
    fireEvent.click(nextBtn); // Step 8
    fireEvent.click(nextBtn); // Step 9
    expect(screen.getByText('Step 9 of 10')).toBeInTheDocument();
    expect(screen.getByText(/Root Node Overflows!/)).toBeInTheDocument();

    // Step 10: Root split complete (Height grows to 2)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 10 of 10')).toBeInTheDocument();
    expect(screen.getByText(/Root Split Complete: Tree Height Grows by \+1/)).toBeInTheDocument();
    expect(screen.getByText('Global Balance Achieved: Height 2')).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();
  });

  it('renders B+ Tree Range Scan stepping through root routing, leaf sibling hops, buffer emissions, and early termination guard', () => {
    render(<AlgorithmVisualizerSandbox />);

    // Select B+ Tree Range Scan
    const bplusBtn = screen.getByRole('button', { name: 'B+ Tree Range Scan & Leaf Sibling Pointers' });
    fireEvent.click(bplusBtn);

    // Verify Heading and Complexity Badges
    expect(
      screen.getByRole('heading', {
        name: 'B+ Tree Range Scan & Leaf Sibling Pointers',
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Time: Point: O(log_B N), Range: O(log_B N + K/B) I/Os')).toBeInTheDocument();

    // Verify Step 1 of 12 (Initial B+ Tree Topology)
    expect(screen.getByText('Step 1 of 12')).toBeInTheDocument();
    expect(screen.getByText('Initial B+ Tree Topology: Internal Routers & Sibling Chains')).toBeInTheDocument();
    expect(screen.getByText('SELECT records WHERE key >= 25 AND key <= 80')).toBeInTheDocument();
    expect(screen.getByText('0 Disk Fetches')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });

    // Step 2: Initiate Range Query
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 2 of 12')).toBeInTheDocument();
    expect(screen.getByText('Initiate Range Query: Target Lower Bound 25')).toBeInTheDocument();
    expect(screen.getByText('1 Disk Fetches')).toBeInTheDocument();

    // Step 3: Root Routing Comparison
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 3 of 12')).toBeInTheDocument();
    expect(screen.getByText('Root Routing Comparison: 25 < 35 Routes to Child 0')).toBeInTheDocument();

    // Step 4: Fetch First Leaf Page L1 [10, 20]
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 4 of 12')).toBeInTheDocument();
    expect(screen.getByText('Fetch First Leaf Page L1 [10, 20]: Search Lower Bound')).toBeInTheDocument();
    expect(screen.getByText('2 Disk Fetches')).toBeInTheDocument();

    // Step 5: Horizontal Leaf Sibling Hop: L1 -> L2
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 5 of 12')).toBeInTheDocument();
    expect(screen.getByText('Horizontal Leaf Sibling Hop: L1 -> L2 (Zero Root Traversal!)')).toBeInTheDocument();
    expect(screen.getByText('Horizontal Sibling Hop: L1 → L2')).toBeInTheDocument();
    expect(screen.getByText('SIBLING HOP')).toBeInTheDocument();

    // Step 6: Leaf L2 Match: Key 35
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 6 of 12')).toBeInTheDocument();
    expect(screen.getByText('Leaf L2 Match: Key 35 Satisfies Predicate')).toBeInTheDocument();
    expect(screen.getByText('key: 35')).toBeInTheDocument();

    // Step 7: Leaf L2 Sequential Scan: Key 50
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 7 of 12')).toBeInTheDocument();
    expect(screen.getByText('Leaf L2 Sequential Scan: Key 50 Satisfies Predicate')).toBeInTheDocument();
    expect(screen.getByText('key: 50')).toBeInTheDocument();

    // Step 8: Leaf L2 Sequential Scan: Key 60
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 8 of 12')).toBeInTheDocument();
    expect(screen.getByText('Leaf L2 Sequential Scan: Key 60 Satisfies Predicate')).toBeInTheDocument();
    expect(screen.getByText('key: 60')).toBeInTheDocument();

    // Step 9: Horizontal Leaf Sibling Hop: L2 -> L3
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 9 of 12')).toBeInTheDocument();
    expect(screen.getByText('Horizontal Leaf Sibling Hop: L2 -> L3')).toBeInTheDocument();
    expect(screen.getByText('Horizontal Sibling Hop: L2 → L3')).toBeInTheDocument();

    // Step 10: Leaf L3 Match: Key 70
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 10 of 12')).toBeInTheDocument();
    expect(screen.getByText('Leaf L3 Match: Key 70 Satisfies Predicate')).toBeInTheDocument();
    expect(screen.getByText('key: 70')).toBeInTheDocument();

    // Step 11: Boundary Guard Exceeded (85 > 80)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 11 of 12')).toBeInTheDocument();
    expect(screen.getByText('Boundary Guard Exceeded: 85 > 80 Terminates Scan!')).toBeInTheDocument();
    expect(screen.getByText('Boundary Guard Exceeded (85 > 80)')).toBeInTheDocument();
    expect(screen.getByText('✓ Range Scan Halted')).toBeInTheDocument();

    // Step 12: Range Scan Complete
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 12 of 12')).toBeInTheDocument();
    expect(screen.getByText('Range Scan Complete: O(log_B N + K/B) I/O Invariant Proven')).toBeInTheDocument();
    expect(screen.getByText('50% Disk Reduction')).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();
  });

  it('renders Bloom Filter Bit-Array Hashing stepping through insertions, collisions, definite negative short-circuit, and false positive', () => {
    render(<AlgorithmVisualizerSandbox />);

    // Select Bloom Filter
    const bloomBtn = screen.getByRole('button', { name: 'Bloom Filter Bit-Array Hashing & False Positive Invariants' });
    fireEvent.click(bloomBtn);

    // Verify Title & Complexity Badges
    expect(
      screen.getByRole('heading', {
        name: 'Bloom Filter Bit-Array Hashing & False Positive Invariants',
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Time: Insert: O(k), Lookup: O(k) CPU ops')).toBeInTheDocument();

    // Verify Step 1 of 8 (Initial Empty State)
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
    expect(screen.getByText('Initial State: Empty Bit Array & 3 Independent Hash Functions')).toBeInTheDocument();
    expect(screen.getByText('OP: INITIAL')).toBeInTheDocument();
    expect(screen.getAllByText('Saturation:').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/0 \/ 18/)).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });

    // Step 2: Insert "user:101"
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 2 of 8')).toBeInTheDocument();
    expect(screen.getByText('Insert Key "user:101": Compute 3 Hashes & Flip Bits')).toBeInTheDocument();
    expect(screen.getByText('OP: INSERT')).toBeInTheDocument();
    expect(screen.getByText('h1 (Murmur3)')).toBeInTheDocument();
    expect(screen.getByText(/3 \/ 18/)).toBeInTheDocument();

    // Step 3: Insert "user:202" (Shared bit collision on 7)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 3 of 8')).toBeInTheDocument();
    expect(screen.getByText('Insert Key "user:202": Shared Bit Collision on Index 7')).toBeInTheDocument();
    expect(screen.getByText(/5 \/ 18/)).toBeInTheDocument();

    // Step 4: Insert "user:303"
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 4 of 8')).toBeInTheDocument();
    expect(screen.getByText('Insert Key "user:303": Bit Array Saturation Increases')).toBeInTheDocument();
    expect(screen.getByText(/7 \/ 18/)).toBeInTheDocument();

    // Step 5: Query "user:101" (Member Match)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 5 of 8')).toBeInTheDocument();
    expect(screen.getByText('Query Key "user:101": All Bits True -> Member Detected')).toBeInTheDocument();
    expect(screen.getByText('OP: QUERY')).toBeInTheDocument();
    expect(screen.getByText(/Probable Member Match/)).toBeInTheDocument();

    // Step 6: Query "user:999" (Definite Non-Member)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 6 of 8')).toBeInTheDocument();
    expect(screen.getByText('Query Key "user:999": Bit 4 is 0 -> Definite Non-Member (Zero False Negatives!)')).toBeInTheDocument();
    expect(screen.getByText(/Definite Negative \(Zero False Negatives!\)/)).toBeInTheDocument();

    // Step 7: Query "user:404" (False Positive Collision)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 7 of 8')).toBeInTheDocument();
    expect(screen.getByText('Query Key "user:404": False Positive! Bits Overlap Across Distinct Keys')).toBeInTheDocument();
    expect(screen.getByText(/False Positive Detected/)).toBeInTheDocument();

    // Step 8: Mathematical Invariants & Sizing Formula
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 8 of 8')).toBeInTheDocument();
    expect(screen.getByText('Mathematical Invariants & Optimal Sizing Formula: k = (m/n) * ln(2)')).toBeInTheDocument();
    expect(screen.getByText('0.0% (Zero)')).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();
  });
});
