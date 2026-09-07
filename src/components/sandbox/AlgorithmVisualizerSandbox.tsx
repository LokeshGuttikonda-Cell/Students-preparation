'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export type VisualizerAlgorithm =
  | 'BINARY_SEARCH'
  | 'TWO_POINTER_SUM'
  | 'STACK_DELIMITERS'
  | 'SLIDING_WINDOW'
  | 'BUBBLE_SORT'
  | 'GRAPH_BFS_TRAVERSAL'
  | 'GRAPH_DFS_TRAVERSAL'
  | 'BST_INSERTION_INORDER'
  | 'AVL_TREE_ROTATIONS'
  | 'RED_BLACK_TREE'
  | 'B_TREE_SPLIT'
  | 'B_PLUS_TREE_RANGE_SCAN'
  | 'BLOOM_FILTER_HASHING';

export interface VisualizerBloomFilterState {
  bitArraySize: number;
  bits: number[];
  activeBits?: number[];
  collidedBits?: number[];
  operation: 'INITIAL' | 'INSERT' | 'QUERY';
  targetKey?: string;
  hashComputations?: Array<{
    name: string;
    formula: string;
    bitIndex: number;
    bitValue: number;
  }>;
  insertedKeys: Array<{
    key: string;
    indices: number[];
  }>;
  queryResult?: {
    isPositive: boolean;
    isFalsePositive?: boolean;
    reason: string;
  };
  filterMetrics: {
    bitsSet: number;
    saturation: number;
    theoreticalFpr: number;
    elementsCount: number;
  };
}

export interface VisualizerBTreeNode {
  id: string;
  keys: number[];
  x: number;
  y: number;
  children?: string[]; // IDs of child nodes
  nodeType?: 'ROUTER' | 'LEAF';
  isFull?: boolean;
  isOverflow?: boolean;
  isElevating?: boolean;
  activeKeyVal?: number;
  highlightedKeys?: number[];
}

export interface VisualizerBTreeState {
  order: number; // e.g. 4 (2-3-4 tree or order-4 B+ tree)
  isBPlusTree?: boolean;
  nodes: VisualizerBTreeNode[];
  activeNodeId?: string;
  targetKey?: number;
  promotedKey?: number;
  treeHeight: number;
  siblingLinks?: Array<{ from: string; to: string; active?: boolean }>;
  rangeQuery?: {
    min: number;
    max: number;
    currentKey?: number;
    results: number[];
    isTerminated?: boolean;
  };
  pageReads?: number;
  splitBanner?: {
    type: 'LEAF_SPLIT' | 'ROOT_SPLIT' | 'MEDIAN_ELEVATION' | 'RANGE_HOP' | 'RANGE_MATCH';
    title: string;
    description: string;
  };
}

export interface VisualizerGraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface VisualizerGraphEdge {
  from: string;
  to: string;
  directed?: boolean;
}

export interface VisualizerGraphState {
  nodes: VisualizerGraphNode[];
  edges: VisualizerGraphEdge[];
  visitedNodes: string[];
  activeNodeId?: string;
  frontierQueue?: string[];
  frontierLabel?: string;
  traversalOrder: string[];
  activeEdge?: { from: string; to: string };
}

export interface VisualizerTreeNode {
  id: string;
  val: number;
  x: number;
  y: number;
  left?: string;
  right?: string;
  isNew?: boolean;
  balanceFactor?: number;
  height?: number;
  isImbalanced?: boolean;
  isPivot?: boolean;
  color?: 'RED' | 'BLACK';
  blackHeight?: number;
  recolorWarning?: boolean;
}

export interface VisualizerTreeRotationBanner {
  type: 'LL' | 'RR' | 'LR' | 'RL' | 'RECOLOR' | 'ROTATION';
  title: string;
  description: string;
  pivotVal?: number;
}

export interface VisualizerTreeState {
  nodes: VisualizerTreeNode[];
  activeNodeId?: string;
  comparedNodeId?: string;
  targetVal?: number;
  traversalOrder?: number[];
  traversalLabel?: string;
  rotationBanner?: VisualizerTreeRotationBanner;
}

interface StepFrame {
  stepIndex: number;
  title: string;
  explanation: string;
  status: 'IN_PROGRESS' | 'SUCCESS' | 'MISMATCH' | 'COMPLETE';
  // Algorithm-specific state snapshots
  array?: number[];
  activeIndices?: number[];
  pointers?: Record<string, number>;
  eliminatedRange?: [number, number]; // start and end indices eliminated
  stack?: string[];
  windowRange?: [number, number];
  graphState?: VisualizerGraphState;
  treeState?: VisualizerTreeState;
  bTreeState?: VisualizerBTreeState;
  bloomFilterState?: VisualizerBloomFilterState;
  metrics?: Record<string, string | number | undefined>;
}

interface AlgorithmConfig {
  id: VisualizerAlgorithm;
  name: string;
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  generateFrames: () => StepFrame[];
}

const ALGORITHM_CONFIGS: AlgorithmConfig[] = [
  {
    id: 'BINARY_SEARCH',
    name: 'Binary Search (Logarithmic Range Elimination)',
    category: 'Search & Divide-and-Conquer',
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    description:
      'Search for a target value in a sorted array by repeatedly dividing the search interval in half. At each step, comparing the middle element allows eliminating half the remaining candidate values.',
    generateFrames: () => {
      const arr = [4, 9, 15, 23, 38, 47, 56, 68, 79, 88, 95];
      const target = 68;
      return [
        {
          stepIndex: 0,
          title: 'Initial State: Full Search Interval',
          explanation: `Initializing pointers: low = 0 (value ${arr[0]}), high = 10 (value ${arr[10]}). Middle index mid = floor((0 + 10) / 2) = 5 (value ${arr[5]}). Comparing arr[mid] (${arr[5]}) with target (${target}).`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { low: 0, mid: 5, high: 10 },
          activeIndices: [5],
          metrics: { Target: target, 'arr[mid]': arr[5], Subarray: '[0..10]' },
        },
        {
          stepIndex: 1,
          title: 'Eliminate Left Half: 47 < 68',
          explanation: `Because array is sorted and arr[mid] (47) < target (68), the target cannot exist at indices 0 through 5. We discard the left half and advance low = mid + 1 = 6. New mid = floor((6 + 10) / 2) = 8 (value ${arr[8]}).`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { low: 6, mid: 8, high: 10 },
          eliminatedRange: [0, 5],
          activeIndices: [8],
          metrics: { Target: target, 'arr[mid]': arr[8], Subarray: '[6..10]' },
        },
        {
          stepIndex: 2,
          title: 'Eliminate Right Half: 79 > 68',
          explanation: `arr[mid] (79) > target (68). The target cannot exist at indices 8 through 10. We discard the right partition and decrement high = mid - 1 = 7. New mid = floor((6 + 7) / 2) = 6 (value ${arr[6]}).`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { low: 6, mid: 6, high: 7 },
          eliminatedRange: [8, 10],
          activeIndices: [6],
          metrics: { Target: target, 'arr[mid]': arr[6], Subarray: '[6..7]' },
        },
        {
          stepIndex: 3,
          title: 'Narrow Interval: 56 < 68',
          explanation: `arr[mid] (56) < target (68). Advance low = mid + 1 = 7. Now low = 7, high = 7. Mid index mid = floor((7 + 7) / 2) = 7 (value ${arr[7]}).`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { low: 7, mid: 7, high: 7 },
          eliminatedRange: [0, 6],
          activeIndices: [7],
          metrics: { Target: target, 'arr[mid]': arr[7], Subarray: '[7..7]' },
        },
        {
          stepIndex: 4,
          title: 'Target Element Located!',
          explanation: `arr[mid] (${arr[7]}) strictly equals target (${target})! Binary search terminates successfully at index 7 in only 4 iterations (well within log2(11) ≈ 3.45).`,
          status: 'SUCCESS',
          array: [...arr],
          pointers: { low: 7, mid: 7, high: 7 },
          activeIndices: [7],
          metrics: { 'Target Found At': 'Index 7', Iterations: '4', Result: 'SUCCESS' },
        },
      ];
    },
  },
  {
    id: 'TWO_POINTER_SUM',
    name: 'Two-Pointer Target Sum Traversal',
    category: 'Two-Pointer Linear Scan',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    description:
      'Given a sorted array and a target sum, position two pointers at the boundaries (left at start, right at end) and move them inward based on whether the current sum is less than or greater than the target.',
    generateFrames: () => {
      const arr = [2, 5, 8, 12, 17, 23, 31, 40];
      const target = 25;
      return [
        {
          stepIndex: 0,
          title: 'Initial Extremes: left = 0, right = 7',
          explanation: `left = index 0 (value 2), right = index 7 (value 40). Current sum = 2 + 40 = 42. Since 42 > target (25), we must decrease the sum by moving right pointer inward: right = right - 1.`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { left: 0, right: 7 },
          activeIndices: [0, 7],
          metrics: { Target: target, 'arr[left]': 2, 'arr[right]': 40, 'Current Sum': 42 },
        },
        {
          stepIndex: 1,
          title: 'Decrement Right: right = 6',
          explanation: `left = 0 (2), right = 6 (31). Current sum = 2 + 31 = 33. Since 33 > target (25), decrement right again: right = 5.`,
          status: 'IN_PROGRESS',
          array: [...arr],
          pointers: { left: 0, right: 6 },
          activeIndices: [0, 6],
          metrics: { Target: target, 'arr[left]': 2, 'arr[right]': 31, 'Current Sum': 33 },
        },
        {
          stepIndex: 2,
          title: 'Complementary Pair Found!',
          explanation: `left = 0 (2), right = 5 (23). Current sum = 2 + 23 = 25, which matches target (25) exactly! Pair found at indices (0, 5) with zero auxiliary memory.`,
          status: 'SUCCESS',
          array: [...arr],
          pointers: { left: 0, right: 5 },
          activeIndices: [0, 5],
          metrics: { Target: target, 'Found Pair': 'arr[0] + arr[5] = 25', Result: 'SUCCESS' },
        },
      ];
    },
  },
  {
    id: 'STACK_DELIMITERS',
    name: 'Stack Delimiter & Parentheses Validator',
    category: 'Stack LIFO Grammar Evaluation',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    description:
      'Verify whether nested brackets in a string are syntactically valid by pushing opening brackets onto a LIFO stack and popping them when matching closing brackets are encountered.',
    generateFrames: () => {
      return [
        {
          stepIndex: 0,
          title: 'Start: Empty Stack, Scan char "{"',
          explanation: 'Stack is empty. Encountered opening bracket "{". Push "{" onto stack.',
          status: 'IN_PROGRESS',
          stack: ['{'],
          metrics: { 'Current Char': '{', StackSize: 1, Action: 'PUSH' },
        },
        {
          stepIndex: 1,
          title: 'Scan char "[": Nested Opening Bracket',
          explanation: 'Encountered opening bracket "[". Push "[" onto stack.',
          status: 'IN_PROGRESS',
          stack: ['{', '['],
          metrics: { 'Current Char': '[', StackSize: 2, Action: 'PUSH' },
        },
        {
          stepIndex: 2,
          title: 'Scan char "(": Deep Nested Opening Bracket',
          explanation: 'Encountered opening bracket "(". Push "(" onto stack.',
          status: 'IN_PROGRESS',
          stack: ['{', '[', '('],
          metrics: { 'Current Char': '(', StackSize: 3, Action: 'PUSH' },
        },
        {
          stepIndex: 3,
          title: 'Scan char ")": Pop Matching "("',
          explanation: 'Encountered closing bracket ")". Stack top is "(". They match! Pop "(" from stack.',
          status: 'IN_PROGRESS',
          stack: ['{', '['],
          metrics: { 'Current Char': ')', 'Matched Bracket': '()', Action: 'POP' },
        },
        {
          stepIndex: 4,
          title: 'Scan char "]": Pop Matching "["',
          explanation: 'Encountered closing bracket "]". Stack top is "[". They match! Pop "[" from stack.',
          status: 'IN_PROGRESS',
          stack: ['{'],
          metrics: { 'Current Char': ']', 'Matched Bracket': '[]', Action: 'POP' },
        },
        {
          stepIndex: 5,
          title: 'Scan char "}": Pop Matching "{"',
          explanation: 'Encountered closing bracket "}". Stack top is "{". They match! Pop "{" from stack.',
          status: 'IN_PROGRESS',
          stack: [],
          metrics: { 'Current Char': '}', 'Matched Bracket': '{}', Action: 'POP' },
        },
        {
          stepIndex: 6,
          title: 'Validation Complete: Perfectly Balanced!',
          explanation: 'String scanning completed and stack is completely empty. All nested syntactic scopes are balanced and valid.',
          status: 'SUCCESS',
          stack: [],
          metrics: { 'Stack Empty': 'YES', Status: 'SYNTACTICALLY_VALID' },
        },
      ];
    },
  },
  {
    id: 'SLIDING_WINDOW',
    name: 'Fixed Sliding Window Maximum Subarray (K = 3)',
    category: 'Sliding Window Optimization',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    description:
      'Find the maximum contiguous subarray sum of fixed window size K = 3 in linear time by adding the incoming element and subtracting the outgoing element, avoiding O(N*K) recomputations.',
    generateFrames: () => {
      const arr = [2, 1, 5, 1, 3, 2];
      return [
        {
          stepIndex: 0,
          title: 'Initial Window: [0..2] -> [2, 1, 5]',
          explanation: 'Calculate base sum of first K = 3 elements: 2 + 1 + 5 = 8. Initialize maxSum = 8.',
          status: 'IN_PROGRESS',
          array: [...arr],
          windowRange: [0, 2],
          activeIndices: [0, 1, 2],
          metrics: { 'Window Elements': '[2, 1, 5]', 'Window Sum': 8, 'Max Sum So Far': 8 },
        },
        {
          stepIndex: 1,
          title: 'Slide Window: [1..3] -> [1, 5, 1]',
          explanation: 'Slide window right: subtract outgoing element arr[0] (2), add incoming element arr[3] (1). New sum = 8 - 2 + 1 = 7. Since 7 < 8, maxSum remains 8.',
          status: 'IN_PROGRESS',
          array: [...arr],
          windowRange: [1, 3],
          activeIndices: [1, 2, 3],
          metrics: { 'Subtracted (out)': 2, 'Added (in)': 1, 'Window Sum': 7, 'Max Sum': 8 },
        },
        {
          stepIndex: 2,
          title: 'Slide Window: [2..4] -> [5, 1, 3] (New Optimal!)',
          explanation: 'Slide right: subtract arr[1] (1), add arr[4] (3). New sum = 7 - 1 + 3 = 9. Since 9 > 8, update maxSum = 9!',
          status: 'IN_PROGRESS',
          array: [...arr],
          windowRange: [2, 4],
          activeIndices: [2, 3, 4],
          metrics: { 'Subtracted (out)': 1, 'Added (in)': 3, 'Window Sum': 9, 'Max Sum': 9 },
        },
        {
          stepIndex: 3,
          title: 'Slide Window: [3..5] -> [1, 3, 2]',
          explanation: 'Slide right: subtract arr[2] (5), add arr[5] (2). New sum = 9 - 5 + 2 = 6. Since 6 < 9, maxSum remains 9.',
          status: 'IN_PROGRESS',
          array: [...arr],
          windowRange: [3, 5],
          activeIndices: [3, 4, 5],
          metrics: { 'Subtracted (out)': 5, 'Added (in)': 2, 'Window Sum': 6, 'Max Sum': 9 },
        },
        {
          stepIndex: 4,
          title: 'Traversal Complete: Maximum Window Sum = 9',
          explanation: 'Sliding window scan terminated across full array in O(N) linear time. Optimal window is [2..4] containing elements [5, 1, 3] with max sum 9.',
          status: 'COMPLETE',
          array: [...arr],
          windowRange: [2, 4],
          activeIndices: [2, 3, 4],
          metrics: { 'Optimal Window': '[2..4] (5, 1, 3)', 'Max Sum': 9, Runtime: 'O(N)' },
        },
      ];
    },
  },
  {
    id: 'BUBBLE_SORT',
    name: 'Bubble Sort Invariant Stepper',
    category: 'Sorting & Invariants',
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(1)',
    description:
      'Observe adjacent element pair comparisons and swaps. At the end of each pass, the largest remaining unsorted element bubbles up to its final sorted position at the end of the array.',
    generateFrames: () => {
      return [
        {
          stepIndex: 0,
          title: 'Pass 1, Compare indices [0, 1]: 64 > 25 (Swap Required)',
          explanation: 'Comparing 64 and 25. Because 64 > 25, swap them so the larger element bubbles rightward.',
          status: 'IN_PROGRESS',
          array: [25, 64, 12, 22, 11],
          activeIndices: [0, 1],
          metrics: { Comparison: '64 > 25', Action: 'SWAP', 'Pass Number': 1 },
        },
        {
          stepIndex: 1,
          title: 'Pass 1, Compare indices [1, 2]: 64 > 12 (Swap Required)',
          explanation: 'Comparing 64 and 12. Because 64 > 12, swap them.',
          status: 'IN_PROGRESS',
          array: [25, 12, 64, 22, 11],
          activeIndices: [1, 2],
          metrics: { Comparison: '64 > 12', Action: 'SWAP', 'Pass Number': 1 },
        },
        {
          stepIndex: 2,
          title: 'Pass 1, Compare indices [2, 3]: 64 > 22 (Swap Required)',
          explanation: 'Comparing 64 and 22. Swap them.',
          status: 'IN_PROGRESS',
          array: [25, 12, 22, 64, 11],
          activeIndices: [2, 3],
          metrics: { Comparison: '64 > 22', Action: 'SWAP', 'Pass Number': 1 },
        },
        {
          stepIndex: 3,
          title: 'Pass 1, Compare indices [3, 4]: 64 > 11 (Swap Required)',
          explanation: 'Comparing 64 and 11. Swap them. Element 64 has reached its final sorted position at index 4!',
          status: 'IN_PROGRESS',
          array: [25, 12, 22, 11, 64],
          activeIndices: [3, 4],
          metrics: { Comparison: '64 > 11', Action: 'SWAP', 'Sorted Partition': '[4] (64)' },
        },
        {
          stepIndex: 4,
          title: 'Pass 2-4 Completed: Array Fully Sorted',
          explanation: 'Following successive passes, smaller elements bubble leftward. Final sorted array: [11, 12, 22, 25, 64].',
          status: 'COMPLETE',
          array: [11, 12, 22, 25, 64],
          activeIndices: [0, 1, 2, 3, 4],
          metrics: { Status: 'SORTED', Array: '[11, 12, 22, 25, 64]', Complexity: 'O(N²)' },
        },
      ];
    },
  },
  {
    id: 'GRAPH_BFS_TRAVERSAL',
    name: 'Breadth-First Search (Queue Frontier & Shortest Paths)',
    category: 'Graphs & Networks',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description:
      'Explore vertices level-by-level using a FIFO queue. In unweighted graphs, BFS is guaranteed to discover the shortest hop-count path from the source vertex to any reachable destination.',
    generateFrames: () => {
      const nodes: VisualizerGraphNode[] = [
        { id: 'A', label: 'A', x: 60, y: 100 },
        { id: 'B', label: 'B', x: 160, y: 40 },
        { id: 'C', label: 'C', x: 160, y: 160 },
        { id: 'D', label: 'D', x: 270, y: 40 },
        { id: 'E', label: 'E', x: 270, y: 160 },
        { id: 'F', label: 'F', x: 370, y: 100 },
      ];
      const edges: VisualizerGraphEdge[] = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' },
        { from: 'B', to: 'E' },
        { from: 'C', to: 'E' },
        { from: 'D', to: 'F' },
        { from: 'E', to: 'F' },
      ];

      return [
        {
          stepIndex: 0,
          title: 'BFS Initialization: Enqueue Source Vertex A',
          explanation:
            'Initialize BFS with source node A at hop distance 0. Node A is pushed to the FIFO exploration queue. Visited set = {}, Queue = [A].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: [],
            activeNodeId: 'A',
            frontierQueue: ['A'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: [],
          },
          metrics: {
            'Current Level': '0',
            'Queue Length': 1,
            'Visited Count': '0 / 6',
          },
        },
        {
          stepIndex: 1,
          title: 'Dequeue A: Discover Neighbors B and C (Hop 1)',
          explanation:
            'A is dequeued and marked visited. Adjacent unvisited nodes B and C are discovered and enqueued to the FIFO queue frontier at distance 1. Visited = {A}, Queue = [B, C].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A'],
            activeNodeId: 'A',
            frontierQueue: ['B', 'C'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A'],
          },
          metrics: {
            'Current Level': '1',
            'Queue Length': 2,
            'Visited Count': '1 / 6',
          },
        },
        {
          stepIndex: 2,
          title: 'Dequeue B: Discover Neighbors D and E (Hop 2)',
          explanation:
            'B is dequeued from front of queue and marked visited. B inspects neighbors: D and E are unvisited. Both are enqueued. Queue = [C, D, E]. Traversal order: A → B.',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A', 'B'],
            activeNodeId: 'B',
            frontierQueue: ['C', 'D', 'E'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A', 'B'],
          },
          metrics: {
            'Current Level': '1 → 2',
            'Queue Length': 3,
            'Visited Count': '2 / 6',
          },
        },
        {
          stepIndex: 3,
          title: 'Dequeue C: Inspect Neighbor E (Already Enqueued)',
          explanation:
            'C is dequeued and marked visited. C inspects neighbor E, but E is already in the frontier queue (discovered via B). No new nodes added. Queue = [D, E]. Traversal order: A → B → C.',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A', 'B', 'C'],
            activeNodeId: 'C',
            frontierQueue: ['D', 'E'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A', 'B', 'C'],
          },
          metrics: {
            'Current Level': '1 Completed',
            'Queue Length': 2,
            'Visited Count': '3 / 6',
          },
        },
        {
          stepIndex: 4,
          title: 'Dequeue D: Discover Target F (Hop 3)',
          explanation:
            'D is dequeued and marked visited. D inspects unvisited neighbor F (the destination node!). F is enqueued at hop distance 3. Queue = [E, F]. Traversal order: A → B → C → D.',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A', 'B', 'C', 'D'],
            activeNodeId: 'D',
            frontierQueue: ['E', 'F'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A', 'B', 'C', 'D'],
          },
          metrics: {
            'Current Level': '2 → 3',
            'Queue Length': 2,
            'Visited Count': '4 / 6',
          },
        },
        {
          stepIndex: 5,
          title: 'Dequeue E: Inspect Neighbor F (Already Enqueued)',
          explanation:
            'E is dequeued and marked visited. E checks its edges: F is already in the queue. No new nodes added. Queue = [F]. Traversal order: A → B → C → D → E.',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A', 'B', 'C', 'D', 'E'],
            activeNodeId: 'E',
            frontierQueue: ['F'],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A', 'B', 'C', 'D', 'E'],
          },
          metrics: {
            'Current Level': '2 Completed',
            'Queue Length': 1,
            'Visited Count': '5 / 6',
          },
        },
        {
          stepIndex: 6,
          title: 'Dequeue F: Destination Reached & BFS Completed',
          explanation:
            'F is dequeued and marked visited! Destination reached with minimum hop count = 3. All reachable nodes visited. Queue is empty. Full traversal sequence: A → B → C → D → E → F.',
          status: 'SUCCESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['A', 'B', 'C', 'D', 'E', 'F'],
            activeNodeId: 'F',
            frontierQueue: [],
            frontierLabel: 'FIFO Exploration Queue',
            traversalOrder: ['A', 'B', 'C', 'D', 'E', 'F'],
          },
          metrics: {
            'Shortest Path Hops': 3,
            'Queue Length': 0,
            'Visited Count': '6 / 6 (100%)',
          },
        },
      ];
    },
  },
  {
    id: 'GRAPH_DFS_TRAVERSAL',
    name: 'Depth-First Search (Recursive Backtracking & Call Stack)',
    category: 'Graphs & Networks',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description:
      'Traverse directed graph branches to maximum depth before backtracking using a LIFO call stack. Essential for cycle detection, topological sorting, and strongly connected components.',
    generateFrames: () => {
      const nodes: VisualizerGraphNode[] = [
        { id: '1', label: '1', x: 60, y: 100 },
        { id: '2', label: '2', x: 160, y: 40 },
        { id: '3', label: '3', x: 160, y: 160 },
        { id: '4', label: '4', x: 270, y: 40 },
        { id: '5', label: '5', x: 270, y: 160 },
      ];
      const edges: VisualizerGraphEdge[] = [
        { from: '1', to: '2', directed: true },
        { from: '1', to: '3', directed: true },
        { from: '2', to: '4', directed: true },
        { from: '3', to: '5', directed: true },
        { from: '4', to: '5', directed: true },
      ];

      return [
        {
          stepIndex: 0,
          title: 'DFS Invocation: Push Node 1 to Call Stack',
          explanation:
            'Begin DFS traversal at root vertex 1. Node 1 is pushed onto the recursion call stack. Call Stack = [1]. Visited = [1].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1'],
            activeNodeId: '1',
            frontierQueue: ['1'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1'],
          },
          metrics: { 'Call Depth': 1, 'Top of Stack': '1', Visited: '1 / 5' },
        },
        {
          stepIndex: 1,
          title: 'Explore Edge (1 → 2): Descend to Node 2',
          explanation:
            'Node 1 investigates outgoing edges. First unvisited neighbor is 2. Recursive call dfs(2) invoked. Push 2 onto stack. Call Stack = [1, 2].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2'],
            activeNodeId: '2',
            frontierQueue: ['1', '2'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2'],
            activeEdge: { from: '1', to: '2' },
          },
          metrics: { 'Call Depth': 2, 'Top of Stack': '2', Visited: '2 / 5' },
        },
        {
          stepIndex: 2,
          title: 'Explore Edge (2 → 4): Descend to Node 4',
          explanation:
            'Node 2 investigates outgoing edge (2 → 4). Node 4 is unvisited. Recursive call dfs(4) invoked. Push 4 onto stack. Call Stack = [1, 2, 4].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2', '4'],
            activeNodeId: '4',
            frontierQueue: ['1', '2', '4'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2', '4'],
            activeEdge: { from: '2', to: '4' },
          },
          metrics: { 'Call Depth': 3, 'Top of Stack': '4', Visited: '3 / 5' },
        },
        {
          stepIndex: 3,
          title: 'Explore Edge (4 → 5): Deepest Vertex Reached',
          explanation:
            'Node 4 follows directed edge to node 5. Recursive call dfs(5) invoked. Push 5 onto stack. Call Stack = [1, 2, 4, 5]. Node 5 has no unvisited outgoing edges (sink node).',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2', '4', '5'],
            activeNodeId: '5',
            frontierQueue: ['1', '2', '4', '5'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2', '4', '5'],
            activeEdge: { from: '4', to: '5' },
          },
          metrics: { 'Call Depth': 4, 'Top of Stack': '5', Visited: '4 / 5' },
        },
        {
          stepIndex: 4,
          title: 'Backtrack: Pop 5, Pop 4, Pop 2 → Return to Node 1',
          explanation:
            'dfs(5), dfs(4), and dfs(2) complete their loops with all outgoing edges explored. Stack unwinds: pop 5, pop 4, pop 2. Control returns to node 1 at recursion root.',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2', '4', '5'],
            activeNodeId: '1',
            frontierQueue: ['1'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2', '4', '5'],
          },
          metrics: { 'Call Depth': 1, 'Top of Stack': '1', Status: 'Backtracked' },
        },
        {
          stepIndex: 5,
          title: 'Explore Edge (1 → 3): Branch into Node 3',
          explanation:
            'Node 1 now inspects its second outgoing edge (1 → 3). Node 3 is unvisited. Recursive call dfs(3) invoked. Push 3 onto stack. Call Stack = [1, 3].',
          status: 'IN_PROGRESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2', '4', '5', '3'],
            activeNodeId: '3',
            frontierQueue: ['1', '3'],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2', '4', '5', '3'],
            activeEdge: { from: '1', to: '3' },
          },
          metrics: { 'Call Depth': 2, 'Top of Stack': '3', Visited: '5 / 5' },
        },
        {
          stepIndex: 6,
          title: 'Cross-Edge (3 → 5) & DFS Traversal Complete',
          explanation:
            'Node 3 checks edge (3 → 5): Node 5 is already marked visited (cross-edge detected; no cycle). dfs(3) returns, pop 3. dfs(1) returns, pop 1. Entire graph traversed!',
          status: 'SUCCESS',
          graphState: {
            nodes,
            edges,
            visitedNodes: ['1', '2', '4', '5', '3'],
            activeNodeId: '1',
            frontierQueue: [],
            frontierLabel: 'Recursion Call Stack (LIFO)',
            traversalOrder: ['1', '2', '4', '5', '3'],
          },
          metrics: { 'Call Depth': 0, 'Stack Size': 0, Visited: '5 / 5 (100%)' },
        },
      ];
    },
  },
  {
    id: 'BST_INSERTION_INORDER',
    name: 'Binary Search Tree (Insertion & In-Order Sorted Walk)',
    category: 'Trees & Hierarchies',
    timeComplexity: 'Search/Insert: O(H), In-Order: O(N)',
    spaceComplexity: 'O(H)',
    description:
      'Insert key 25 into a balanced BST by comparing values down to a leaf position, preserving the BST invariant (Left < Root < Right), followed by an In-Order traversal that extracts all values in monotonically sorted ascending order.',
    generateFrames: () => {
      const baseNodes: VisualizerTreeNode[] = [
        { id: 'n40', val: 40, x: 200, y: 30, left: 'n20', right: 'n60' },
        { id: 'n20', val: 20, x: 110, y: 85, left: 'n10', right: 'n30' },
        { id: 'n60', val: 60, x: 290, y: 85, left: 'n50', right: 'n70' },
        { id: 'n10', val: 10, x: 65, y: 140 },
        { id: 'n30', val: 30, x: 155, y: 140 },
        { id: 'n50', val: 50, x: 245, y: 140 },
        { id: 'n70', val: 70, x: 335, y: 140 },
      ];

      return [
        {
          stepIndex: 0,
          title: 'Insert Key 25: Compare with Root (40)',
          explanation:
            'Target key to insert: 25. Starting at root node 40. Comparison: 25 < 40. Because 25 is smaller than root, the BST invariant requires descending into the LEFT subtree.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: baseNodes,
            activeNodeId: 'n40',
            comparedNodeId: 'n40',
            targetVal: 25,
            traversalOrder: [],
            traversalLabel: 'In-Order Traversal Buffer',
          },
          metrics: { Target: 25, 'Current Node': 40, Decision: '25 < 40 → Go Left' },
        },
        {
          stepIndex: 1,
          title: 'Compare with Node 20: 25 > 20 → Go Right',
          explanation:
            'Current node is 20. Comparison: 25 > 20. Because target key is strictly greater than 20, the BST invariant requires branching into the RIGHT subtree.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: baseNodes,
            activeNodeId: 'n20',
            comparedNodeId: 'n20',
            targetVal: 25,
            traversalOrder: [],
            traversalLabel: 'In-Order Traversal Buffer',
          },
          metrics: { Target: 25, 'Current Node': 20, Decision: '25 > 20 → Go Right' },
        },
        {
          stepIndex: 2,
          title: 'Compare with Node 30: 25 < 30 → Check Left Child',
          explanation:
            'Current node is 30. Comparison: 25 < 30. BST rule dictates branching left. Inspecting node 30’s left child: pointer is NULL (empty slot found!).',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: baseNodes,
            activeNodeId: 'n30',
            comparedNodeId: 'n30',
            targetVal: 25,
            traversalOrder: [],
            traversalLabel: 'In-Order Traversal Buffer',
          },
          metrics: { Target: 25, 'Current Node': 30, Decision: '30.left is null → Insert here' },
        },
        {
          stepIndex: 3,
          title: 'Node Inserted: 30.left = New Node(25)',
          explanation:
            'New node with key 25 is allocated and linked as the left child of 30. The binary search tree invariant (Left < Root < Right) is strictly preserved across all 8 nodes.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              ...baseNodes.map((n) => (n.id === 'n30' ? { ...n, left: 'n25' } : n)),
              { id: 'n25', val: 25, x: 125, y: 190, isNew: true },
            ],
            activeNodeId: 'n25',
            targetVal: 25,
            traversalOrder: [],
            traversalLabel: 'In-Order Traversal Buffer',
          },
          metrics: { 'Inserted Key': 25, 'Parent Node': 30, 'Tree Size': '8 Nodes' },
        },
        {
          stepIndex: 4,
          title: 'In-Order Traversal: Traverse Left Subtree',
          explanation:
            'Initiate In-Order traversal (Left → Root → Right). Recursively visit leftmost leaves: 10, then parent 20, then right child’s left child 25, then parent 30. Accumulated: [10, 20, 25, 30].',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              ...baseNodes.map((n) => (n.id === 'n30' ? { ...n, left: 'n25' } : n)),
              { id: 'n25', val: 25, x: 125, y: 190 },
            ],
            activeNodeId: 'n30',
            traversalOrder: [10, 20, 25, 30],
            traversalLabel: 'In-Order Sorted Stream: Left Subtree',
          },
          metrics: { Visited: '4 / 8', 'Stream Output': '[10, 20, 25, 30]' },
        },
        {
          stepIndex: 5,
          title: 'In-Order Traversal Complete: Monotonically Ascending',
          explanation:
            'In-order visits Root (40), then right subtree (50, 60, 70). Resulting sequence: [10, 20, 25, 30, 40, 50, 60, 70]. In-Order walk on a BST produces a strictly sorted array in O(N) linear time!',
          status: 'COMPLETE',
          treeState: {
            nodes: [
              ...baseNodes.map((n) => (n.id === 'n30' ? { ...n, left: 'n25' } : n)),
              { id: 'n25', val: 25, x: 125, y: 190 },
            ],
            traversalOrder: [10, 20, 25, 30, 40, 50, 60, 70],
            traversalLabel: 'In-Order Monotonically Sorted Sequence',
          },
          metrics: { 'Traversal Property': 'Strictly Ascending', 'Total Elements': 8, Complexity: 'O(N)' },
        },
      ];
    },
  },
  {
    id: 'AVL_TREE_ROTATIONS',
    name: 'Self-Balancing AVL Tree Rotations (Balance Factor Maintenance)',
    category: 'Self-Balancing Search Trees',
    timeComplexity: 'Lookup/Insert/Delete: O(log N), Rotation: O(1)',
    spaceComplexity: 'O(N) storage, O(log N) stack recursion',
    description:
      'Maintain the strict AVL balance invariant: for every node, the balance factor BF = height(left) - height(right) must satisfy BF ∈ {-1, 0, +1}. When an insertion causes |BF| ≥ 2, tree balance is restored in O(1) time using Single Right (LL), Single Left (RR), or Double (LR / RL) Rotations while preserving the BST ordering invariant.',
    generateFrames: () => {
      return [
        {
          stepIndex: 0,
          title: 'Initial Balanced State: AVL Invariant Satisfied',
          explanation:
            'Every node in an AVL tree satisfies the strict height-balance invariant: Balance Factor BF = height(left) - height(right) ∈ {-1, 0, +1}. Root 50 has BF = 1 - 1 = 0. Children 25 and 75 have BF = 0. Tree height is 2, guaranteeing O(log N) worst-case search and mutation.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n25', right: 'n75', balanceFactor: 0, height: 2 },
              { id: 'n25', val: 25, x: 120, y: 105, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n50',
          },
          metrics: { 'Tree State': 'Balanced AVL', 'Tree Height': 2, 'Root BF': 0, Invariant: '|BF| ≤ 1' },
        },
        {
          stepIndex: 1,
          title: 'Insert Key 15: Single Left Descent',
          explanation:
            'Key 15 is smaller than 50 and smaller than 25, inserted as 25\'s left child. Post-insertion backtracking updates node heights: node 15 (h=1, BF=0), node 25 (h=2, BF=+1), root 50 (h=3, left h=2, right h=1 → BF=+1). All balance factors remain within {-1, 0, +1}. No rotation needed.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n25', right: 'n75', balanceFactor: 1, height: 3 },
              { id: 'n25', val: 25, x: 120, y: 105, left: 'n15', balanceFactor: 1, height: 2 },
              { id: 'n15', val: 15, x: 70, y: 170, isNew: true, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n15',
            targetVal: 15,
          },
          metrics: { 'Inserted Key': 15, 'Node 25 BF': '+1', 'Root 50 BF': '+1', Status: 'Balanced' },
        },
        {
          stepIndex: 2,
          title: 'Insert Key 10: Left-Left (LL) Heavy Imbalance Triggered!',
          explanation:
            'Key 10 is inserted as 15\'s left child. Recalculating heights: node 10 has h=1, BF=0. Node 15 has h=2, BF=+1. At node 25, left height is 2, right height is 0 → BF(25) = 2 - 0 = +2! Invariant violated (|BF| ≥ 2). Since BF(25) = +2 and BF(15) = +1 (both positive), this is a classic Left-Left (LL) case requiring a Single Right Rotation.',
          status: 'MISMATCH',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n25', right: 'n75', balanceFactor: 2, height: 4 },
              { id: 'n25', val: 25, x: 120, y: 105, left: 'n15', isImbalanced: true, isPivot: true, balanceFactor: 2, height: 3 },
              { id: 'n15', val: 15, x: 70, y: 170, left: 'n10', balanceFactor: 1, height: 2 },
              { id: 'n10', val: 10, x: 35, y: 225, isNew: true, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n25',
            comparedNodeId: 'n15',
            targetVal: 10,
            rotationBanner: {
              type: 'LL',
              title: 'Single Right Rotation Required',
              description: 'BF(25) = +2 and BF(15) = +1 (LL pattern). Rotate node 15 to the right over pivot 25.',
              pivotVal: 25,
            },
          },
          metrics: { 'Violating Node': 25, 'Node 25 BF': '+2 (VIOLATION)', 'Case': 'Left-Left (LL)', Action: 'Rotate Right' },
        },
        {
          stepIndex: 3,
          title: 'Single Right Rotation Complete: Node 15 Elevated',
          explanation:
            'Right rotation around pivot 25 rebalances the subtree in O(1) pointer operations. Node 15 elevates to become root 50\'s left child. Node 25 becomes 15\'s right child, and node 10 remains 15\'s left child. Balance factors are restored: BF(10)=0, BF(25)=0, BF(15)=0. Root 50 BF drops from +2 to +1. In-order key ordering (10 < 15 < 25 < 50 < 75) is strictly preserved.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n15', right: 'n75', balanceFactor: 1, height: 3 },
              { id: 'n15', val: 15, x: 120, y: 105, left: 'n10', right: 'n25', isPivot: true, balanceFactor: 0, height: 2 },
              { id: 'n10', val: 10, x: 70, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 170, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n15',
            rotationBanner: {
              type: 'LL',
              title: 'Single Right Rotation Completed',
              description: 'Node 15 is new subtree root. BST invariant 10 < 15 < 25 < 50 < 75 preserved.',
              pivotVal: 15,
            },
          },
          metrics: { 'Subtree Root': 15, 'Node 15 BF': 0, 'Subtree Height': 2, 'Time Complexity': 'O(1)' },
        },
        {
          stepIndex: 4,
          title: 'Insert Key 85: Right Subtree Growth',
          explanation:
            'Key 85 is inserted as node 75\'s right child. Updating heights along the search path: node 85 (h=1, BF=0), node 75 (h=2, BF=-1). Root 50 now has left subtree height 2 (rooted at 15) and right subtree height 2 (rooted at 75) → BF(50) = 2 - 2 = 0. The entire tree is balanced.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n15', right: 'n75', balanceFactor: 0, height: 3 },
              { id: 'n15', val: 15, x: 120, y: 105, left: 'n10', right: 'n25', balanceFactor: 0, height: 2 },
              { id: 'n10', val: 10, x: 70, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 170, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, right: 'n85', balanceFactor: -1, height: 2 },
              { id: 'n85', val: 85, x: 350, y: 170, isNew: true, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n85',
            targetVal: 85,
          },
          metrics: { 'Inserted Key': 85, 'Node 75 BF': '-1', 'Root 50 BF': 0, Status: 'Balanced' },
        },
        {
          stepIndex: 5,
          title: 'Insert Key 95: Right-Right (RR) Heavy Imbalance Triggered!',
          explanation:
            'Key 95 is inserted as 85\'s right child. At node 75, left height is 0 and right height is 2, yielding BF(75) = 0 - 2 = -2! Balance invariant violated. Since BF(75) = -2 and child BF(85) = -1 (both negative), this is a classic Right-Right (RR) case requiring a Single Left Rotation.',
          status: 'MISMATCH',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n15', right: 'n75', balanceFactor: -1, height: 4 },
              { id: 'n15', val: 15, x: 120, y: 105, left: 'n10', right: 'n25', balanceFactor: 0, height: 2 },
              { id: 'n10', val: 10, x: 70, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 170, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n75', val: 75, x: 300, y: 105, right: 'n85', isImbalanced: true, isPivot: true, balanceFactor: -2, height: 3 },
              { id: 'n85', val: 85, x: 350, y: 165, right: 'n95', balanceFactor: -1, height: 2 },
              { id: 'n95', val: 95, x: 385, y: 220, isNew: true, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n75',
            comparedNodeId: 'n85',
            targetVal: 95,
            rotationBanner: {
              type: 'RR',
              title: 'Single Left Rotation Required',
              description: 'BF(75) = -2 and BF(85) = -1 (RR pattern). Rotate node 85 to the left over pivot 75.',
              pivotVal: 75,
            },
          },
          metrics: { 'Violating Node': 75, 'Node 75 BF': '-2 (VIOLATION)', 'Case': 'Right-Right (RR)', Action: 'Rotate Left' },
        },
        {
          stepIndex: 6,
          title: 'Single Left Rotation Complete: Node 85 Elevated',
          explanation:
            'Left rotation around pivot 75 rebalances the subtree in O(1) time. Node 85 elevates to become root 50\'s right child. Node 75 becomes 85\'s left child, and node 95 remains 85\'s right child. Recalculated balance factors: BF(75)=0, BF(95)=0, BF(85)=0. Root 50 has left height 2, right height 2 → BF(50) = 0.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n15', right: 'n85', balanceFactor: 0, height: 3 },
              { id: 'n15', val: 15, x: 120, y: 105, left: 'n10', right: 'n25', balanceFactor: 0, height: 2 },
              { id: 'n10', val: 10, x: 70, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 170, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n85', val: 85, x: 300, y: 105, left: 'n75', right: 'n95', isPivot: true, balanceFactor: 0, height: 2 },
              { id: 'n75', val: 75, x: 250, y: 170, balanceFactor: 0, height: 1 },
              { id: 'n95', val: 95, x: 350, y: 170, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n85',
            rotationBanner: {
              type: 'RR',
              title: 'Single Left Rotation Completed',
              description: 'Node 85 is new subtree root. BST order 50 < 75 < 85 < 95 preserved.',
              pivotVal: 85,
            },
          },
          metrics: { 'Subtree Root': 85, 'Node 85 BF': 0, 'Subtree Height': 2, 'Time Complexity': 'O(1)' },
        },
        {
          stepIndex: 7,
          title: 'Insert Key 18: Inner Subtree Growth',
          explanation:
            'Target key 18 is inserted: 15 < 18 < 25, placing 18 as node 25\'s left child. Heights update: node 18 (h=1, BF=0), node 25 (h=2, BF=+1). Node 15 has left child 10 (h=1) and right child 25 (h=2) → BF(15) = 1 - 2 = -1. Tree remains balanced.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 35, left: 'n15', right: 'n85', balanceFactor: 0, height: 4 },
              { id: 'n15', val: 15, x: 115, y: 85, left: 'n10', right: 'n25', balanceFactor: -1, height: 3 },
              { id: 'n10', val: 10, x: 65, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 165, y: 140, left: 'n18', balanceFactor: 1, height: 2 },
              { id: 'n18', val: 18, x: 140, y: 190, isNew: true, balanceFactor: 0, height: 1 },
              { id: 'n85', val: 85, x: 305, y: 85, left: 'n75', right: 'n95', balanceFactor: 0, height: 2 },
              { id: 'n75', val: 75, x: 260, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n95', val: 95, x: 350, y: 140, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n18',
            targetVal: 18,
          },
          metrics: { 'Inserted Key': 18, 'Node 25 BF': '+1', 'Node 15 BF': '-1', Status: 'Balanced' },
        },
        {
          stepIndex: 8,
          title: 'Insert Key 19: Left-Right (LR) Opposite-Sign Imbalance!',
          explanation:
            'Key 19 is inserted as 18\'s right child (18 < 19 < 25). Height updates: node 18 has h=2, right=19 → BF(18) = 0 - 1 = -1. At node 25, left height is 2, right height is 0 → BF(25) = +2! Because BF(25) = +2 (positive) and child BF(18) = -1 (negative), signs conflict: this is a Left-Right (LR) "elbow" case! A single right rotation would fail; a Double Rotation is required.',
          status: 'MISMATCH',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 35, left: 'n15', right: 'n85', balanceFactor: 0, height: 5 },
              { id: 'n15', val: 15, x: 115, y: 85, left: 'n10', right: 'n25', balanceFactor: -2, height: 4 },
              { id: 'n10', val: 10, x: 65, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 165, y: 140, left: 'n18', isImbalanced: true, isPivot: true, balanceFactor: 2, height: 3 },
              { id: 'n18', val: 18, x: 140, y: 185, right: 'n19', balanceFactor: -1, height: 2 },
              { id: 'n19', val: 19, x: 175, y: 225, isNew: true, balanceFactor: 0, height: 1 },
              { id: 'n85', val: 85, x: 305, y: 85, left: 'n75', right: 'n95', balanceFactor: 0, height: 2 },
              { id: 'n75', val: 75, x: 260, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n95', val: 95, x: 350, y: 140, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n25',
            comparedNodeId: 'n18',
            targetVal: 19,
            rotationBanner: {
              type: 'LR',
              title: 'Double Rotation (LR Case) Required',
              description: 'BF(25) = +2 and child BF(18) = -1. Opposite signs require Phase 1 (Left Rotation on 18) then Phase 2 (Right Rotation on 25).',
              pivotVal: 25,
            },
          },
          metrics: { 'Violating Node': 25, 'Node 25 BF': '+2', 'Child 18 BF': '-1', Case: 'Left-Right (LR)' },
        },
        {
          stepIndex: 9,
          title: 'LR Phase 1: Left Rotate Child 18 (Straighten the Elbow)',
          explanation:
            'Phase 1 of Double Rotation: Perform a Left Rotation on child node 18. Node 19 rotates upward to become node 25\'s direct left child, while node 18 becomes node 19\'s left child. The zig-zag shape (25 → 18 → 19) is straightened into a linear left-heavy chain (25 → 19 → 18). Now BF(25) = +2 and BF(19) = +1: the LR case is transformed into an LL case!',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 35, left: 'n15', right: 'n85', balanceFactor: 0, height: 5 },
              { id: 'n15', val: 15, x: 115, y: 85, left: 'n10', right: 'n25', balanceFactor: -2, height: 4 },
              { id: 'n10', val: 10, x: 65, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 165, y: 140, left: 'n19', isImbalanced: true, isPivot: true, balanceFactor: 2, height: 3 },
              { id: 'n19', val: 19, x: 140, y: 185, left: 'n18', isPivot: true, balanceFactor: 1, height: 2 },
              { id: 'n18', val: 18, x: 115, y: 225, balanceFactor: 0, height: 1 },
              { id: 'n85', val: 85, x: 305, y: 85, left: 'n75', right: 'n95', balanceFactor: 0, height: 2 },
              { id: 'n75', val: 75, x: 260, y: 140, balanceFactor: 0, height: 1 },
              { id: 'n95', val: 95, x: 350, y: 140, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n19',
            rotationBanner: {
              type: 'LR',
              title: 'Phase 1 Complete: Left Rotation on Node 18',
              description: 'Zig-zag straightened to linear chain 25 → 19 → 18. Case converted to LL.',
              pivotVal: 18,
            },
          },
          metrics: { 'Phase': '1 of 2 Complete', 'Transformed Case': 'Left-Left (LL)', 'Node 19 BF': '+1', 'Node 25 BF': '+2' },
        },
        {
          stepIndex: 10,
          title: 'LR Phase 2: Right Rotate Parent 25 (Balance Restored)',
          explanation:
            'Phase 2 of Double Rotation: Perform a Single Right Rotation on node 25 around pivot 19. Node 19 elevates to become node 15\'s right child. Node 18 remains 19\'s left child, and node 25 becomes 19\'s right child. Balance factors: BF(18)=0, BF(25)=0, BF(19)=0! Root 50 and node 15 heights and balance factors are perfectly restored. Total operations: O(1) pointer updates.',
          status: 'COMPLETE',
          treeState: {
            nodes: [
              { id: 'n50', val: 50, x: 210, y: 40, left: 'n15', right: 'n85', balanceFactor: 0, height: 3 },
              { id: 'n15', val: 15, x: 115, y: 95, left: 'n10', right: 'n19', balanceFactor: 0, height: 2 },
              { id: 'n10', val: 10, x: 65, y: 150, balanceFactor: 0, height: 1 },
              { id: 'n19', val: 19, x: 165, y: 150, left: 'n18', right: 'n25', isPivot: true, balanceFactor: 0, height: 2 },
              { id: 'n18', val: 18, x: 135, y: 205, balanceFactor: 0, height: 1 },
              { id: 'n25', val: 25, x: 195, y: 205, balanceFactor: 0, height: 1 },
              { id: 'n85', val: 85, x: 305, y: 95, left: 'n75', right: 'n95', balanceFactor: 0, height: 2 },
              { id: 'n75', val: 75, x: 260, y: 150, balanceFactor: 0, height: 1 },
              { id: 'n95', val: 95, x: 350, y: 150, balanceFactor: 0, height: 1 },
            ],
            activeNodeId: 'n19',
            rotationBanner: {
              type: 'LR',
              title: 'Double Rotation Complete: Balance Restored',
              description: 'Node 19 is now root of balanced subtree. All nodes satisfy |BF| ≤ 1.',
              pivotVal: 19,
            },
          },
          metrics: { 'Subtree Root': 19, 'Node 19 BF': 0, 'Subtree Height': 2, Status: 'Globally Balanced AVL' },
        },
      ];
    },
  },
  {
    id: 'RED_BLACK_TREE',
    name: 'Red-Black Tree Invariants (Node Recoloring & Rotations)',
    category: 'Self-Balancing Search Trees',
    timeComplexity: 'Lookup/Insert/Delete: O(log N), Max Rotations: O(1)',
    spaceComplexity: 'O(N) space, 1 bit per node color overhead',
    description:
      'Maintain the 5 canonical Red-Black tree invariants: (1) Every node is RED or BLACK, (2) Root is BLACK, (3) Leaves (NIL) are BLACK, (4) No two RED nodes can be adjacent (RED node cannot have RED child), and (5) Every simple path from any node to descendant leaves contains the exact same number of BLACK nodes (Black-Height invariant bh(x)). Violations are resolved in O(1) rotations and O(log N) recolorings.',
    generateFrames: () => {
      return [
        {
          stepIndex: 0,
          title: 'Initial State: 5 Canonical Red-Black Invariants Satisfied',
          explanation:
            'A valid Red-Black Tree satisfies 5 invariants: 1. Nodes are RED or BLACK. 2. Root is BLACK (Node 20). 3. Leaves (NIL) are BLACK. 4. Red nodes cannot have Red children (No consecutive REDs). 5. All paths from root to leaves have equal Black-Height (bh = 2). Both 10 and 30 are BLACK.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 40, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 120, y: 105, color: 'BLACK', blackHeight: 1 },
              { id: 'n30', val: 30, x: 300, y: 105, color: 'BLACK', blackHeight: 1 },
            ],
            activeNodeId: 'n20',
          },
          metrics: { 'Tree State': 'Valid RB Tree', 'Black-Height (bh)': 2, 'Root Color': 'BLACK', Invariant: 'bh(x) Equal' },
        },
        {
          stepIndex: 1,
          title: 'Insert Key 5: Inserted as RED Leaf',
          explanation:
            'New keys always insert as RED to avoid violating Invariant 5 (Black-Height). Key 5 is inserted as 10.left. Parent 10 is BLACK, so Invariant 4 (no consecutive REDs) is satisfied without modification.',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 40, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 120, y: 105, left: 'n5', color: 'BLACK', blackHeight: 1 },
              { id: 'n5', val: 5, x: 70, y: 170, color: 'RED', isNew: true },
              { id: 'n30', val: 30, x: 300, y: 105, color: 'BLACK', blackHeight: 1 },
            ],
            activeNodeId: 'n5',
            targetVal: 5,
          },
          metrics: { 'Inserted Key': 5, Color: 'RED', 'Parent 10': 'BLACK', Status: 'Valid RB Tree' },
        },
        {
          stepIndex: 2,
          title: 'Insert Key 15: Inserted as RED Leaf',
          explanation:
            'Key 15 is inserted as 10.right with color RED. Because parent 10 is BLACK, no consecutive RED violation occurs. All simple paths to leaves still pass through exactly 2 BLACK nodes (20 and 10).',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 40, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 120, y: 105, left: 'n5', right: 'n15', color: 'BLACK', blackHeight: 1 },
              { id: 'n5', val: 5, x: 70, y: 170, color: 'RED' },
              { id: 'n15', val: 15, x: 165, y: 170, color: 'RED', isNew: true },
              { id: 'n30', val: 30, x: 300, y: 105, color: 'BLACK', blackHeight: 1 },
            ],
            activeNodeId: 'n15',
            targetVal: 15,
          },
          metrics: { 'Inserted Key': 15, Color: 'RED', 'Parent 10': 'BLACK', Status: 'Valid RB Tree' },
        },
        {
          stepIndex: 3,
          title: 'Insert Key 2: Case 1 Triggered (Uncle 15 is RED)',
          explanation:
            'Key 2 is inserted as 5.left (RED). Violation: Node 2 is RED and parent 5 is RED (Consecutive RED nodes!). Uncle check: Grandparent 10 has right child 15, which is RED. Case 1 Rule: When uncle is RED, recolor parent (5) and uncle (15) to BLACK, and grandparent (10) to RED.',
          status: 'MISMATCH',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 40, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 120, y: 105, left: 'n5', right: 'n15', color: 'BLACK', blackHeight: 1 },
              { id: 'n5', val: 5, x: 70, y: 170, left: 'n2', color: 'RED', recolorWarning: true },
              { id: 'n2', val: 2, x: 35, y: 225, color: 'RED', isNew: true, recolorWarning: true },
              { id: 'n15', val: 15, x: 165, y: 170, color: 'RED' },
              { id: 'n30', val: 30, x: 300, y: 105, color: 'BLACK', blackHeight: 1 },
            ],
            activeNodeId: 'n2',
            comparedNodeId: 'n5',
            targetVal: 2,
            rotationBanner: {
              type: 'RECOLOR',
              title: 'Case 1: Uncle 15 is RED (Recolor)',
              description: 'Uncle 15 is RED. Recolor Parent 5 and Uncle 15 to BLACK. Recolor Grandparent 10 to RED.',
              pivotVal: 10,
            },
          },
          metrics: { 'Violating Nodes': '5 & 2 (RED-RED)', 'Uncle 15': 'RED', Case: 'Case 1 (Recolor)', Action: 'Flip Colors' },
        },
        {
          stepIndex: 4,
          title: 'Case 1 Complete: Colors Updated Without Rotations',
          explanation:
            'Parent 5 and Uncle 15 are recolored BLACK. Grandparent 10 is recolored RED. Root 20 is BLACK, so consecutive RED check passes. Notice: Case 1 requires 0 rotations! Black-Height along all paths through 10 is preserved.',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 40, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 120, y: 105, left: 'n5', right: 'n15', color: 'RED', blackHeight: 1 },
              { id: 'n5', val: 5, x: 70, y: 170, left: 'n2', color: 'BLACK', blackHeight: 1 },
              { id: 'n2', val: 2, x: 35, y: 225, color: 'RED' },
              { id: 'n15', val: 15, x: 165, y: 170, color: 'BLACK', blackHeight: 1 },
              { id: 'n30', val: 30, x: 300, y: 105, color: 'BLACK', blackHeight: 1 },
            ],
            activeNodeId: 'n10',
            rotationBanner: {
              type: 'RECOLOR',
              title: 'Case 1 Recolor Applied Successfully',
              description: 'Nodes 5 & 15 recolored BLACK; Node 10 recolored RED. All invariants restored in O(1) time.',
              pivotVal: 10,
            },
          },
          metrics: { 'Parent 5': 'BLACK', 'Uncle 15': 'BLACK', 'Grandparent 10': 'RED', Rotations: 0 },
        },
        {
          stepIndex: 5,
          title: 'Insert Key 35 & 32: Case 2 Triggered (Uncle is NIL & RL Triangle)',
          explanation:
            'Key 35 is inserted as 30.right (RED). Then key 32 is inserted as 35.left (RED). Consecutive RED violation: 35 and 32 are both RED! Uncle check: Node 30.left is NIL (BLACK). Since 32 is an inner child (left child of right child), this is Case 2 (RL Triangle / Zig-Zag). Case 2 Rule: Right-rotate child 32 over parent 35 to straighten into a line.',
          status: 'MISMATCH',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 35, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 115, y: 85, left: 'n5', right: 'n15', color: 'RED', blackHeight: 1 },
              { id: 'n5', val: 5, x: 65, y: 140, left: 'n2', color: 'BLACK', blackHeight: 1 },
              { id: 'n2', val: 2, x: 35, y: 195, color: 'RED' },
              { id: 'n15', val: 15, x: 140, y: 140, color: 'BLACK', blackHeight: 1 },
              { id: 'n30', val: 30, x: 305, y: 85, right: 'n35', color: 'BLACK', blackHeight: 1 },
              { id: 'n35', val: 35, x: 355, y: 140, left: 'n32', color: 'RED', recolorWarning: true },
              { id: 'n32', val: 32, x: 325, y: 195, color: 'RED', isNew: true, recolorWarning: true },
            ],
            activeNodeId: 'n32',
            comparedNodeId: 'n35',
            targetVal: 32,
            rotationBanner: {
              type: 'ROTATION',
              title: 'Case 2: Uncle is NIL (BLACK) & RL Zig-Zag',
              description: 'Uncle is NIL (BLACK). Inner child 32 forms an RL triangle. Right-rotate parent 35 around pivot 32.',
              pivotVal: 35,
            },
          },
          metrics: { 'Violating Nodes': '35 & 32 (RED-RED)', 'Uncle 30.left': 'NIL (BLACK)', Case: 'Case 2 (RL Triangle)', Action: 'Rotate Right' },
        },
        {
          stepIndex: 6,
          title: 'Case 2 Complete: Converted to Case 3 (RR Linear Chain)',
          explanation:
            'Right rotation on node 35 around pivot 32 elevates 32 as 30\'s right child. Node 35 becomes 32\'s right child. The zig-zag (30 → 35 → 32) is straightened into a linear chain (30 → 32 → 35). Both 32 and 35 are RED. This is now Case 3 (Line Case)!',
          status: 'IN_PROGRESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 35, left: 'n10', right: 'n30', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 115, y: 85, left: 'n5', right: 'n15', color: 'RED', blackHeight: 1 },
              { id: 'n5', val: 5, x: 65, y: 140, left: 'n2', color: 'BLACK', blackHeight: 1 },
              { id: 'n2', val: 2, x: 35, y: 195, color: 'RED' },
              { id: 'n15', val: 15, x: 140, y: 140, color: 'BLACK', blackHeight: 1 },
              { id: 'n30', val: 30, x: 305, y: 85, right: 'n32', color: 'BLACK', blackHeight: 1 },
              { id: 'n32', val: 32, x: 355, y: 140, right: 'n35', color: 'RED', isPivot: true, recolorWarning: true },
              { id: 'n35', val: 35, x: 385, y: 195, color: 'RED', recolorWarning: true },
            ],
            activeNodeId: 'n32',
            rotationBanner: {
              type: 'ROTATION',
              title: 'Case 2 Complete: Converted to Case 3 (RR Line)',
              description: 'Elbow straightened into 30 → 32 → 35. Case 3 requires Left Rotation on Grandparent 30 and color swap.',
              pivotVal: 32,
            },
          },
          metrics: { 'Converted Case': 'Case 3 (RR Line)', 'Linear Chain': '30 → 32 → 35', Action: 'Left Rotate 30 & Swap Colors' },
        },
        {
          stepIndex: 7,
          title: 'Case 3 Applied: Left Rotate Grandparent 30 & Color Swap',
          explanation:
            'Left rotation on grandparent 30 around pivot 32 elevates 32 to replace 30. Color Swap: Elevating node 32 is recolored BLACK; former grandparent 30 is recolored RED. Node 35 remains RED. Both children of 32 (30 and 35) are RED, but parent 32 is BLACK. Invariant 4 satisfied!',
          status: 'SUCCESS',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 35, left: 'n10', right: 'n32', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 115, y: 85, left: 'n5', right: 'n15', color: 'RED', blackHeight: 1 },
              { id: 'n5', val: 5, x: 65, y: 140, left: 'n2', color: 'BLACK', blackHeight: 1 },
              { id: 'n2', val: 2, x: 35, y: 195, color: 'RED' },
              { id: 'n15', val: 15, x: 140, y: 140, color: 'BLACK', blackHeight: 1 },
              { id: 'n32', val: 32, x: 305, y: 85, left: 'n30', right: 'n35', color: 'BLACK', isPivot: true, blackHeight: 1 },
              { id: 'n30', val: 30, x: 265, y: 140, color: 'RED' },
              { id: 'n35', val: 35, x: 355, y: 140, color: 'RED' },
            ],
            activeNodeId: 'n32',
            rotationBanner: {
              type: 'ROTATION',
              title: 'Case 3 Complete: Balanced Red-Black Subtree',
              description: 'Left rotation elevated 32 to BLACK. Node 30 swapped to RED. Invariants 4 and 5 fully satisfied!',
              pivotVal: 32,
            },
          },
          metrics: { 'Subtree Root': 32, 'Node 32 Color': 'BLACK', 'Left Child 30': 'RED', 'Right Child 35': 'RED' },
        },
        {
          stepIndex: 8,
          title: 'Global Verification: All 5 Red-Black Invariants Proven',
          explanation:
            'Final verification of the 5 canonical invariants: 1. Nodes are RED or BLACK (5 Black, 3 Red). 2. Root 20 is BLACK. 3. Leaves (NIL) are BLACK. 4. No consecutive RED nodes (all Red nodes 10, 2, 30, 35 have Black parents). 5. All paths from root 20 to any NIL leaf pass through exactly 2 BLACK nodes (e.g. 20→10→5→NIL has 20 and 5; 20→32→30→NIL has 20 and 32). Height is bounded by 2 log(N+1).',
          status: 'COMPLETE',
          treeState: {
            nodes: [
              { id: 'n20', val: 20, x: 210, y: 35, left: 'n10', right: 'n32', color: 'BLACK', blackHeight: 2 },
              { id: 'n10', val: 10, x: 115, y: 85, left: 'n5', right: 'n15', color: 'RED', blackHeight: 1 },
              { id: 'n5', val: 5, x: 65, y: 140, left: 'n2', color: 'BLACK', blackHeight: 1 },
              { id: 'n2', val: 2, x: 35, y: 195, color: 'RED' },
              { id: 'n15', val: 15, x: 140, y: 140, color: 'BLACK', blackHeight: 1 },
              { id: 'n32', val: 32, x: 305, y: 85, left: 'n30', right: 'n35', color: 'BLACK', blackHeight: 1 },
              { id: 'n30', val: 30, x: 265, y: 140, color: 'RED' },
              { id: 'n35', val: 35, x: 355, y: 140, color: 'RED' },
            ],
            activeNodeId: 'n20',
          },
          metrics: { 'Total Nodes': 8, 'Black-Height (bh)': 2, 'Consecutive REDs': '0 (None)', Status: 'Globally Valid RB Tree' },
        },
      ];
    },
  },
  {
    id: 'B_TREE_SPLIT',
    name: 'B-Tree / 2-3-4 Multi-Way Node Splitting & Elevation',
    category: 'External Memory & Multi-Way Trees',
    timeComplexity: 'Search/Insert/Delete: O(log_B N) disk block I/Os, Node split: O(B)',
    spaceComplexity: 'O(N) keys, minimum 50% storage occupancy guarantee',
    description:
      'B-Trees and 2-3-4 trees (Order M=4) maintain perfect height balance for disk-oriented databases by allowing multi-key nodes. When an insertion exceeds node capacity (M-1 = 3 keys), a preemptive split promotes the median key upward. When the root splits, the tree height increases uniformly from the top down.',
    generateFrames: () => {
      return [
        {
          stepIndex: 0,
          title: 'Initial State: Balanced 2-3-4 Multi-Way Tree (Order M=4)',
          explanation:
            'Tree order M = 4 (2-3-4 tree). Nodes contain between 1 and 3 keys (2-nodes, 3-nodes, or 4-nodes). Root node contains keys [20, 50] (a 3-node). Multi-way child intervals: Left [10] holds keys < 20; Middle [30, 40] holds keys in (20, 50); Right [60, 70, 80] holds keys > 50. Notice the Right child is already a full 4-node (3 keys). Tree height h = 1.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            nodes: [
              { id: 'n_root', keys: [20, 50], x: 230, y: 50, children: ['n_left', 'n_mid', 'n_right'] },
              { id: 'n_left', keys: [10], x: 80, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 210, y: 170 },
              { id: 'n_right', keys: [60, 70, 80], x: 360, y: 170, isFull: true },
            ],
            activeNodeId: 'n_root',
          },
          metrics: { 'Tree Height (h)': 1, 'Order M': 4, 'Max Keys/Node': 3, Status: 'Balanced' },
        },
        {
          stepIndex: 1,
          title: 'Insertion Search: Traverse Multi-Way Range for Key 75',
          explanation:
            'Inserting key 75. Search starts at root [20, 50]. Compare 75 with root keys: 75 > 20 and 75 > 50. Following the right child pointer (keys > 50) leads to leaf node [60, 70, 80]. Active node selected: n_right.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            targetKey: 75,
            nodes: [
              { id: 'n_root', keys: [20, 50], x: 230, y: 50, children: ['n_left', 'n_mid', 'n_right'] },
              { id: 'n_left', keys: [10], x: 80, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 210, y: 170 },
              { id: 'n_right', keys: [60, 70, 80], x: 360, y: 170, isFull: true },
            ],
            activeNodeId: 'n_right',
          },
          metrics: { 'Target Key': 75, 'Active Child': 'Right [60, 70, 80]', 'Key Comparison': '75 > 50' },
        },
        {
          stepIndex: 2,
          title: 'Node Overflow Detected: 4-Node Capacity Exceeded (4 Keys)',
          explanation:
            'Attempting to insert key 75 into node [60, 70, 80]. The resulting key set would be [60, 70, 75, 80] (4 keys). In order M=4, a node can hold at most M - 1 = 3 keys! An overflow condition has occurred. The node must split preemptively before the insert can proceed.',
          status: 'MISMATCH',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            targetKey: 75,
            nodes: [
              { id: 'n_root', keys: [20, 50], x: 230, y: 50, children: ['n_left', 'n_mid', 'n_right'] },
              { id: 'n_left', keys: [10], x: 80, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 210, y: 170 },
              { id: 'n_right', keys: [60, 70, 75, 80], x: 360, y: 170, isOverflow: true },
            ],
            activeNodeId: 'n_right',
            splitBanner: {
              type: 'LEAF_SPLIT',
              title: 'Node Overflow in Leaf',
              description: 'Node holds 4 keys [60, 70, 75, 80], exceeding max capacity of 3 keys.',
            },
          },
          metrics: { 'Node Keys': 4, 'Max Allowed': 3, Violation: 'Capacity Overflow', 'Action Required': 'Split Node' },
        },
        {
          stepIndex: 3,
          title: 'Preemptive Node Split: Median Key 70 Chosen for Promotion',
          explanation:
            'To resolve the overflow, the 4 keys [60, 70, 75, 80] are partitioned around the median key (index 1 = key 70). Key 70 is selected to elevate to the parent root. Keys lower than 70 ([60]) form the left sibling. Keys higher than 70 ([75, 80]) form the right sibling.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            promotedKey: 70,
            nodes: [
              { id: 'n_root', keys: [20, 50], x: 230, y: 50, children: ['n_left', 'n_mid', 'n_right'] },
              { id: 'n_left', keys: [10], x: 80, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 210, y: 170 },
              { id: 'n_right', keys: [60, 70, 75, 80], x: 360, y: 170, isElevating: true, highlightedKeys: [70] },
            ],
            activeNodeId: 'n_right',
            splitBanner: {
              type: 'MEDIAN_ELEVATION',
              title: 'Median Key 70 Selected',
              description: 'Partitioning into Left [60], Promoted Key 70, and Right [75, 80].',
            },
          },
          metrics: { 'Promoted Median': 70, 'Left Partition': '[60]', 'Right Partition': '[75, 80]' },
        },
        {
          stepIndex: 4,
          title: 'Elevation & Re-Hooking: Parent Absorbs 70, Siblings Created',
          explanation:
            'Median key 70 is inserted into parent root, which expands from [20, 50] to [20, 50, 70] (now a full 4-node). The overflowing leaf is replaced by two valid siblings: n_r1 [60] and n_r2 [75, 80]. All 4 leaves remain at exact depth 1! Perfect height balance maintained.',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            promotedKey: 70,
            nodes: [
              { id: 'n_root', keys: [20, 50, 70], x: 230, y: 50, isFull: true, children: ['n_left', 'n_mid', 'n_r1', 'n_r2'] },
              { id: 'n_left', keys: [10], x: 50, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 160, y: 170 },
              { id: 'n_r1', keys: [60], x: 280, y: 170 },
              { id: 'n_r2', keys: [75, 80], x: 395, y: 170 },
            ],
            activeNodeId: 'n_root',
            splitBanner: {
              type: 'MEDIAN_ELEVATION',
              title: 'Leaf Split Complete',
              description: 'Root now holds [20, 50, 70]. Leaf nodes [60] and [75, 80] cleanly separated.',
            },
          },
          metrics: { 'Root Keys': '[20, 50, 70]', 'Total Leaves': 4, 'Leaf Depth': 'Uniform (1)', Status: 'Balanced' },
        },
        {
          stepIndex: 5,
          title: 'Next Insertion Search: Key 35 Traversal',
          explanation:
            'Now inserting key 35. Comparing with root keys [20, 50, 70]: 20 < 35 < 50. Key 35 falls between key 20 and key 50. Following child pointer 1 brings us to middle node [30, 40].',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            targetKey: 35,
            nodes: [
              { id: 'n_root', keys: [20, 50, 70], x: 230, y: 50, isFull: true, children: ['n_left', 'n_mid', 'n_r1', 'n_r2'] },
              { id: 'n_left', keys: [10], x: 50, y: 170 },
              { id: 'n_mid', keys: [30, 40], x: 160, y: 170 },
              { id: 'n_r1', keys: [60], x: 280, y: 170 },
              { id: 'n_r2', keys: [75, 80], x: 395, y: 170 },
            ],
            activeNodeId: 'n_mid',
          },
          metrics: { 'Target Key': 35, 'Search Range': '20 < 35 < 50', 'Target Node': 'n_mid [30, 40]' },
        },
        {
          stepIndex: 6,
          title: 'Direct Leaf Insertion: Node [30, 40] Absorbs Key 35',
          explanation:
            'Node [30, 40] is a 3-node with capacity remaining (length 2 < 3). Key 35 is inserted in sorted sequence: [30, 35, 40]. The node is now a full 4-node. No split required! Insertion completes in O(1) leaf time.',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            targetKey: 35,
            nodes: [
              { id: 'n_root', keys: [20, 50, 70], x: 230, y: 50, isFull: true, children: ['n_left', 'n_mid', 'n_r1', 'n_r2'] },
              { id: 'n_left', keys: [10], x: 50, y: 170 },
              { id: 'n_mid', keys: [30, 35, 40], x: 160, y: 170, isFull: true },
              { id: 'n_r1', keys: [60], x: 280, y: 170 },
              { id: 'n_r2', keys: [75, 80], x: 395, y: 170 },
            ],
            activeNodeId: 'n_mid',
          },
          metrics: { 'Inserted Key': 35, 'Node Status': '4-node (FULL)', 'Split Triggered': 'No (Within Capacity)' },
        },
        {
          stepIndex: 7,
          title: 'Third Insertion Search: Key 25 Traversal',
          explanation:
            'Next, inserting key 25. Compare with root [20, 50, 70]: 20 < 25 < 50. Traversal routes to node [30, 35, 40]. But node [30, 35, 40] is already full! Inserting 25 causes an overflow with 4 keys: [25, 30, 35, 40].',
          status: 'MISMATCH',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            targetKey: 25,
            nodes: [
              { id: 'n_root', keys: [20, 50, 70], x: 230, y: 50, isFull: true, children: ['n_left', 'n_mid', 'n_r1', 'n_r2'] },
              { id: 'n_left', keys: [10], x: 50, y: 170 },
              { id: 'n_mid', keys: [25, 30, 35, 40], x: 160, y: 170, isOverflow: true },
              { id: 'n_r1', keys: [60], x: 280, y: 170 },
              { id: 'n_r2', keys: [75, 80], x: 395, y: 170 },
            ],
            activeNodeId: 'n_mid',
            splitBanner: {
              type: 'LEAF_SPLIT',
              title: 'Middle Leaf Overflow',
              description: 'Keys [25, 30, 35, 40] exceed capacity. Median 35 must elevate.',
            },
          },
          metrics: { 'Target Key': 25, 'Overflow Node': 'n_mid', 'Median Key': 35, Issue: 'Parent Root is Full!' },
        },
        {
          stepIndex: 8,
          title: 'Cascading Overflow: Parent Root [20, 50, 70] is Also Full!',
          explanation:
            'Middle leaf partition yields: Left [25, 30], Median key 35, Right [40]. However, when key 35 tries to elevate into the parent root [20, 50, 70], the root is ALREADY FULL (3 keys)! The root itself would overflow to [20, 35, 50, 70]. In top-down 2-3-4 trees, the root MUST split preemptively!',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            treeHeight: 1,
            promotedKey: 35,
            nodes: [
              { id: 'n_root', keys: [20, 35, 50, 70], x: 230, y: 50, isOverflow: true, children: ['n_left', 'n_mid', 'n_mid2', 'n_r1', 'n_r2'] },
              { id: 'n_left', keys: [10], x: 50, y: 170 },
              { id: 'n_mid', keys: [25, 30], x: 140, y: 170 },
              { id: 'n_mid2', keys: [40], x: 220, y: 170 },
              { id: 'n_r1', keys: [60], x: 300, y: 170 },
              { id: 'n_r2', keys: [75, 80], x: 400, y: 170 },
            ],
            activeNodeId: 'n_root',
            splitBanner: {
              type: 'ROOT_SPLIT',
              title: 'Root Node Overflows!',
              description: 'Root has 4 keys [20, 35, 50, 70]. Median 50 elevates to create a NEW root level.',
            },
          },
          metrics: { 'Root Keys': 4, 'Split Type': 'Root Split', 'New Root Key': 50, 'Height Growth': '+1' },
        },
        {
          stepIndex: 9,
          title: 'Root Split Complete: Tree Height Grows by +1 From the Top',
          explanation:
            'The root splits! Median key 50 elevates to form the NEW root [50] at level 0. The old root keys partition into two internal children: Left [20, 35] and Right [70] at level 1. All 5 leaves ([10], [25, 30], [40], [60], [75, 80]) reside at level 2. Tree height grows from h = 1 to h = 2 from the root up, guaranteeing that every single leaf remains at the exact same depth! This external memory property guarantees O(log_B N) worst-case disk I/Os.',
          status: 'COMPLETE',
          bTreeState: {
            order: 4,
            treeHeight: 2,
            promotedKey: 50,
            nodes: [
              { id: 'n_top_root', keys: [50], x: 230, y: 35, children: ['n_l1_left', 'n_l1_right'] },
              { id: 'n_l1_left', keys: [20, 35], x: 130, y: 110, children: ['n_leaf1', 'n_leaf2', 'n_leaf3'] },
              { id: 'n_l1_right', keys: [70], x: 330, y: 110, children: ['n_leaf4', 'n_leaf5'] },
              { id: 'n_leaf1', keys: [10], x: 50, y: 195 },
              { id: 'n_leaf2', keys: [25, 30], x: 135, y: 195 },
              { id: 'n_leaf3', keys: [40], x: 220, y: 195 },
              { id: 'n_leaf4', keys: [60], x: 300, y: 195 },
              { id: 'n_leaf5', keys: [75, 80], x: 390, y: 195 },
            ],
            activeNodeId: 'n_top_root',
            splitBanner: {
              type: 'ROOT_SPLIT',
              title: 'Global Balance Achieved: Height 2',
              description: 'Tree grew uniformly at root. All 5 leaf nodes reside at uniform depth 2.',
            },
          },
          metrics: { 'Tree Height (h)': 2, 'Root Key': '[50]', 'Total Leaves': 5, 'Leaf Depth': 'Uniform (Depth 2)', Status: 'Perfect Multi-Way Balance' },
        },
      ];
    },
  },
  {
    id: 'B_PLUS_TREE_RANGE_SCAN',
    name: 'B+ Tree Range Scan & Leaf Sibling Pointers',
    category: 'Database Indexing & External Memory',
    timeComplexity: 'Point: O(log_B N), Range: O(log_B N + K/B) I/Os',
    spaceComplexity: 'O(N) data in leaves, O(N/B) internal router keys',
    description:
      'In database storage engines, internal nodes store guidepost keys to route point lookups, while all records reside in leaves linked by horizontal sibling pointers. Range scans locate the starting leaf once via root traversal, then seamlessly hop along sibling pointers without repeatedly querying parent levels.',
    generateFrames: () => {
      const baseNodes: VisualizerBTreeNode[] = [
        {
          id: 'n_root',
          keys: [35, 70],
          x: 230,
          y: 60,
          nodeType: 'ROUTER',
          children: ['leaf_1', 'leaf_2', 'leaf_3'],
        },
        {
          id: 'leaf_1',
          keys: [10, 20],
          x: 75,
          y: 175,
          nodeType: 'LEAF',
        },
        {
          id: 'leaf_2',
          keys: [35, 50, 60],
          x: 230,
          y: 175,
          nodeType: 'LEAF',
        },
        {
          id: 'leaf_3',
          keys: [70, 85, 95],
          x: 385,
          y: 175,
          nodeType: 'LEAF',
        },
      ];

      return [
        {
          stepIndex: 0,
          title: 'Initial B+ Tree Topology: Internal Routers & Sibling Chains',
          explanation:
            'In a B+ Tree, internal nodes act purely as router keys (guideposts), while 100% of actual data records reside in the leaf level. Furthermore, leaf pages are chained together via bidirectional sibling pointers. This enables point lookups in O(log_B N) and sequential range queries in O(log_B N + K/B) disk I/Os without re-querying the tree root.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            rangeQuery: { min: 25, max: 80, results: [] },
            pageReads: 0,
          },
          metrics: { 'Query Range': '[25 .. 80]', 'Internal Index': '[35, 70]', 'Leaf Pages': 3, 'Page I/Os': 0 },
        },
        {
          stepIndex: 1,
          title: 'Initiate Range Query: Target Lower Bound 25',
          explanation:
            'Query requested: SELECT * WHERE key >= 25 AND key <= 80. To begin the range scan, the engine must perform ONE point lookup from the root to locate the starting leaf page containing keys >= 25.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'n_root',
            targetKey: 25,
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            rangeQuery: { min: 25, max: 80, results: [] },
            pageReads: 1,
          },
          metrics: { 'Query Range': '[25 .. 80]', 'Starting Key': 25, 'Active Node': 'Root [35, 70]', 'Page I/Os': 1 },
        },
        {
          stepIndex: 2,
          title: 'Root Routing Comparison: 25 < 35 Routes to Child 0',
          explanation:
            'Comparing target lower bound 25 with root separator keys [35, 70]. Since 25 < 35, the search engine follows left child pointer C0 down to leaf page L1. Only 1 disk I/O was consumed to route through the internal level.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'n_root',
            targetKey: 25,
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            rangeQuery: { min: 25, max: 80, results: [] },
            pageReads: 1,
          },
          metrics: { 'Separator Key': 35, Decision: '25 < 35 (Branch C0)', 'Next Hop': 'Leaf L1', 'Page I/Os': 1 },
        },
        {
          stepIndex: 3,
          title: 'Fetch First Leaf Page L1 [10, 20]: Search Lower Bound',
          explanation:
            'Leaf page L1 is fetched into the buffer pool (Page I/O: 2). Examining keys: 10 < 25 and 20 < 25. Neither key satisfies the range condition. The end of page L1 is reached without any matching keys.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_1',
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            rangeQuery: { min: 25, max: 80, currentKey: 20, results: [] },
            pageReads: 2,
          },
          metrics: { 'Current Page': 'L1 [10, 20]', 'Keys Checked': '10, 20 (Both < 25)', 'Buffer Result': 'Empty', 'Page I/Os': 2 },
        },
        {
          stepIndex: 4,
          title: 'Horizontal Leaf Sibling Hop: L1 -> L2 (Zero Root Traversal!)',
          explanation:
            'Crucial B+ Tree Optimization: Instead of performing a costly new point search through the root for the next key, the iterator follows the horizontal sibling pointer directly from L1 to L2! This circumvents internal index navigation entirely.',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_2',
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: true },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_HOP',
              title: 'Horizontal Sibling Hop: L1 → L2',
              description: 'Followed leaf-level next pointer directly. Root index bypassed.',
            },
            rangeQuery: { min: 25, max: 80, results: [] },
            pageReads: 3,
          },
          metrics: { Navigation: 'Leaf Sibling Link (L1 -> L2)', 'Traversed Root?': 'No (Bypassed)', 'Page I/Os': 3 },
        },
        {
          stepIndex: 5,
          title: 'Leaf L2 Match: Key 35 Satisfies Predicate',
          explanation:
            'Page L2 is loaded into cache (Page I/O: 3). First key 35 is evaluated: 25 <= 35 <= 80 is TRUE! Key 35 is emitted into the Range Query Result Buffer.',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_2',
            targetKey: 35,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_2' ? { ...n, highlightedKeys: [35] } : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Record Match: Key 35',
              description: '25 <= 35 <= 80: Emitted record 35 into Result Buffer.',
            },
            rangeQuery: { min: 25, max: 80, currentKey: 35, results: [35] },
            pageReads: 3,
          },
          metrics: { 'Active Key': 35, Condition: '25 <= 35 <= 80 (MATCH)', 'Result Count': 1, 'Page I/Os': 3 },
        },
        {
          stepIndex: 6,
          title: 'Leaf L2 Sequential Scan: Key 50 Satisfies Predicate',
          explanation:
            'The iterator advances sequentially to the next slot inside page L2: key 50. Condition 25 <= 50 <= 80 is TRUE! Key 50 is appended to the Result Buffer without any additional disk I/O (already in CPU buffer).',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_2',
            targetKey: 50,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_2' ? { ...n, highlightedKeys: [35, 50] } : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Record Match: Key 50',
              description: 'Sequential intra-page read: Emitted record 50 into Result Buffer.',
            },
            rangeQuery: { min: 25, max: 80, currentKey: 50, results: [35, 50] },
            pageReads: 3,
          },
          metrics: { 'Active Key': 50, Condition: '25 <= 50 <= 80 (MATCH)', 'Result Count': 2, 'Page I/Os': 3 },
        },
        {
          stepIndex: 7,
          title: 'Leaf L2 Sequential Scan: Key 60 Satisfies Predicate',
          explanation:
            'Iterator advances to the final slot of page L2: key 60. Condition 25 <= 60 <= 80 is TRUE! Key 60 is emitted. Leaf page L2 is now exhausted.',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_2',
            targetKey: 60,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_2' ? { ...n, highlightedKeys: [35, 50, 60] } : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Record Match: Key 60',
              description: 'End of page L2 reached: Emitted record 60 into Result Buffer.',
            },
            rangeQuery: { min: 25, max: 80, currentKey: 60, results: [35, 50, 60] },
            pageReads: 3,
          },
          metrics: { 'Active Key': 60, Condition: '25 <= 60 <= 80 (MATCH)', 'Result Count': 3, 'Page L2 Status': 'Exhausted' },
        },
        {
          stepIndex: 8,
          title: 'Horizontal Leaf Sibling Hop: L2 -> L3',
          explanation:
            'To continue the scan, the iterator traverses the next sibling link L2 -> L3. Page L3 is fetched into the buffer pool (Page I/O: 4). Again, no root or parent node lookups are required!',
          status: 'IN_PROGRESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_3',
            nodes: baseNodes,
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: true },
            ],
            splitBanner: {
              type: 'RANGE_HOP',
              title: 'Horizontal Sibling Hop: L2 → L3',
              description: 'Fetched next sequential page via leaf sibling pointer.',
            },
            rangeQuery: { min: 25, max: 80, results: [35, 50, 60] },
            pageReads: 4,
          },
          metrics: { Navigation: 'Leaf Sibling Link (L2 -> L3)', 'Active Page': 'L3 [70, 85, 95]', 'Page I/Os': 4 },
        },
        {
          stepIndex: 9,
          title: 'Leaf L3 Match: Key 70 Satisfies Predicate',
          explanation:
            'Inspecting first key of page L3: 70. Condition 25 <= 70 <= 80 is TRUE! Key 70 is emitted into the Result Buffer.',
          status: 'SUCCESS',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_3',
            targetKey: 70,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_3' ? { ...n, highlightedKeys: [70] } : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Record Match: Key 70',
              description: '25 <= 70 <= 80: Emitted record 70 into Result Buffer.',
            },
            rangeQuery: { min: 25, max: 80, currentKey: 70, results: [35, 50, 60, 70] },
            pageReads: 4,
          },
          metrics: { 'Active Key': 70, Condition: '25 <= 70 <= 80 (MATCH)', 'Result Count': 4, 'Page I/Os': 4 },
        },
        {
          stepIndex: 10,
          title: 'Boundary Guard Exceeded: 85 > 80 Terminates Scan!',
          explanation:
            'Iterator advances to next key in L3: 85. Checking predicate: 85 <= 80 is FALSE (85 > 80)! Because leaves are strictly sorted, ALL subsequent keys in the database are guaranteed to be > 80. The range scan halts immediately!',
          status: 'MISMATCH',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            activeNodeId: 'leaf_3',
            targetKey: 85,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_3' ? { ...n, highlightedKeys: [70] } : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Boundary Guard Exceeded (85 > 80)',
              description: 'Predicate violated: 85 exceeds upper bound 80. Iterator terminates immediately.',
            },
            rangeQuery: { min: 25, max: 80, currentKey: 85, results: [35, 50, 60, 70], isTerminated: true },
            pageReads: 4,
          },
          metrics: { 'Key Evaluated': 85, 'Upper Bound': 80, Predicate: '85 > 80 (VIOLATED)', 'Scan Action': 'EARLY_HALT' },
        },
        {
          stepIndex: 11,
          title: 'Range Scan Complete: O(log_B N + K/B) I/O Invariant Proven',
          explanation:
            'Range scan complete! Emitted records: [35, 50, 60, 70]. Total disk pages fetched: 4 (1 root page + 3 leaf pages). Without leaf sibling links, a naive B-tree would require 4 independent point lookups (4 * 2 = 8 page I/Os). The B+ tree sibling chaining reduces I/O cost to O(log_B N + K/B), enabling massive high-throughput range scans in production storage engines.',
          status: 'COMPLETE',
          bTreeState: {
            order: 4,
            isBPlusTree: true,
            treeHeight: 1,
            nodes: baseNodes.map((n) =>
              n.id === 'leaf_2'
                ? { ...n, highlightedKeys: [35, 50, 60] }
                : n.id === 'leaf_3'
                ? { ...n, highlightedKeys: [70] }
                : n
            ),
            siblingLinks: [
              { from: 'leaf_1', to: 'leaf_2', active: false },
              { from: 'leaf_2', to: 'leaf_3', active: false },
            ],
            splitBanner: {
              type: 'RANGE_MATCH',
              title: 'Range Scan Complete',
              description: 'Emitted 4 records with only 4 page reads. Optimal external memory efficiency.',
            },
            rangeQuery: { min: 25, max: 80, results: [35, 50, 60, 70], isTerminated: true },
            pageReads: 4,
          },
          metrics: { 'Total Emitted': 4, 'Total Page I/Os': 4, 'Naive B-Tree I/Os': 8, 'I/O Savings': '50% Disk Reduction', Status: 'COMPLETE' },
        },
      ];
    },
  },
  {
    id: 'BLOOM_FILTER_HASHING',
    name: 'Bloom Filter Bit-Array Hashing & False Positive Invariants',
    category: 'Probabilistic Data Structures & Distributed Caching',
    timeComplexity: 'Insert: O(k), Lookup: O(k) CPU ops',
    spaceComplexity: 'O(m) bits, independent of element key size',
    description:
      'Bloom filters are space-efficient probabilistic bit arrays used in distributed storage systems (LSM-trees, Cassandra, RocksDB, web proxies) to test set membership. They guarantee 0% false negatives (if a bit is 0, the item is definitely absent, avoiding disk seeks), while tolerating a tunable false positive rate p ≈ (1 - e^(-kn/m))^k.',
    generateFrames: () => {
      const emptyBits = Array(18).fill(0);
      const afterKey1 = [...emptyBits];
      [3, 7, 14].forEach((i) => (afterKey1[i] = 1));

      const afterKey2 = [...afterKey1];
      [7, 11, 15].forEach((i) => (afterKey2[i] = 1));

      const afterKey3 = [...afterKey2];
      [1, 14, 17].forEach((i) => (afterKey3[i] = 1));

      const registeredKeys = [
        { key: 'user:101', indices: [3, 7, 14] },
        { key: 'user:202', indices: [7, 11, 15] },
        { key: 'user:303', indices: [1, 14, 17] },
      ];

      return [
        {
          stepIndex: 0,
          title: 'Initial State: Empty Bit Array & 3 Independent Hash Functions',
          explanation:
            'A Bloom filter consists of an m-bit array initialized to all zeros and k independent, uniformly distributed hash functions. Here, m = 18 bits and k = 3 (h1: MurmurHash3, h2: FNV-1a, h3: Jenkins). At saturation S = 0%, no elements have been registered.',
          status: 'IN_PROGRESS',
          bloomFilterState: {
            bitArraySize: 18,
            bits: emptyBits,
            operation: 'INITIAL',
            insertedKeys: [],
            filterMetrics: { bitsSet: 0, saturation: 0, theoreticalFpr: 0, elementsCount: 0 },
          },
          metrics: { 'Bit Array Size (m)': 18, 'Hash Count (k)': 3, 'Inserted Items (n)': 0, 'Bits Set': 0, 'Saturation': '0.0%', 'Theoretical FPR': '0.0%' },
        },
        {
          stepIndex: 1,
          title: 'Insert Key "user:101": Compute 3 Hashes & Flip Bits',
          explanation:
            'Inserting key "user:101". The engine computes 3 independent hash functions modulo 18: h1("user:101") = 3, h2("user:101") = 7, h3("user:101") = 14. Bits at indices 3, 7, and 14 are flipped from 0 to 1. Total bits set = 3.',
          status: 'SUCCESS',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey1,
            activeBits: [3, 7, 14],
            operation: 'INSERT',
            targetKey: 'user:101',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:101") % 18', bitIndex: 3, bitValue: 1 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:101") % 18', bitIndex: 7, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:101") % 18', bitIndex: 14, bitValue: 1 },
            ],
            insertedKeys: [registeredKeys[0]],
            filterMetrics: { bitsSet: 3, saturation: 16.7, theoreticalFpr: 0.3, elementsCount: 1 },
          },
          metrics: { 'Inserted Key': '"user:101"', 'Flipped Bits': '[3, 7, 14]', 'Total Bits Set': 3, 'Saturation': '16.7%', 'Theoretical FPR': '0.3%' },
        },
        {
          stepIndex: 2,
          title: 'Insert Key "user:202": Shared Bit Collision on Index 7',
          explanation:
            'Inserting key "user:202". Hash outputs: h1("user:202") = 7, h2("user:202") = 11, h3("user:202") = 15. Notice that bit 7 was ALREADY set to 1 by "user:101"! In Bloom filters, bit collisions are expected and idempotent—bit 7 remains 1, while bits 11 and 15 are flipped to 1.',
          status: 'SUCCESS',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey2,
            activeBits: [7, 11, 15],
            collidedBits: [7],
            operation: 'INSERT',
            targetKey: 'user:202',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:202") % 18', bitIndex: 7, bitValue: 1 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:202") % 18', bitIndex: 11, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:202") % 18', bitIndex: 15, bitValue: 1 },
            ],
            insertedKeys: registeredKeys.slice(0, 2),
            filterMetrics: { bitsSet: 5, saturation: 27.8, theoreticalFpr: 1.8, elementsCount: 2 },
          },
          metrics: { 'Inserted Key': '"user:202"', 'Collided Bit': '7 (Shared with user:101)', 'New Bits Flipped': '[11, 15]', 'Total Bits Set': 5, 'Saturation': '27.8%', 'Theoretical FPR': '1.8%' },
        },
        {
          stepIndex: 3,
          title: 'Insert Key "user:303": Bit Array Saturation Increases',
          explanation:
            'Inserting key "user:303". Hashes: h1 = 1, h2 = 14, h3 = 17. Bit 14 was already 1 (set by "user:101"). Bits 1 and 17 are flipped to 1. The filter now holds 3 distinct elements across 7 set bits (saturation: 38.9%).',
          status: 'SUCCESS',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey3,
            activeBits: [1, 14, 17],
            collidedBits: [14],
            operation: 'INSERT',
            targetKey: 'user:303',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:303") % 18', bitIndex: 1, bitValue: 1 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:303") % 18', bitIndex: 14, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:303") % 18', bitIndex: 17, bitValue: 1 },
            ],
            insertedKeys: registeredKeys,
            filterMetrics: { bitsSet: 7, saturation: 38.9, theoreticalFpr: 4.5, elementsCount: 3 },
          },
          metrics: { 'Inserted Key': '"user:303"', 'Collided Bit': '14 (Shared with user:101)', 'Total Keys (n)': 3, 'Total Bits Set': 7, 'Saturation': '38.9%', 'Theoretical FPR': '4.5%' },
        },
        {
          stepIndex: 4,
          title: 'Query Key "user:101": All Bits True -> Member Detected',
          explanation:
            'Querying membership for "user:101". Hashes evaluated: h1 = 3, h2 = 7, h3 = 14. Probing bit array: B[3] = 1, B[7] = 1, B[14] = 1. Since ALL k bits are 1, the filter returns POSITIVE ("Probably in set"). The system proceeds to retrieve the user profile from cache/memory.',
          status: 'SUCCESS',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey3,
            activeBits: [3, 7, 14],
            operation: 'QUERY',
            targetKey: 'user:101',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:101") % 18', bitIndex: 3, bitValue: 1 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:101") % 18', bitIndex: 7, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:101") % 18', bitIndex: 14, bitValue: 1 },
            ],
            insertedKeys: registeredKeys,
            queryResult: {
              isPositive: true,
              isFalsePositive: false,
              reason: 'All 3 probed bits (B[3], B[7], B[14]) are 1. True member match confirmed.',
            },
            filterMetrics: { bitsSet: 7, saturation: 38.9, theoreticalFpr: 4.5, elementsCount: 3 },
          },
          metrics: { 'Query Key': '"user:101"', 'Probed Bits': 'B[3]=1, B[7]=1, B[14]=1', 'Query Result': 'POSITIVE (True Member)', 'Disk I/O Needed': 'Yes (Expected)' },
        },
        {
          stepIndex: 5,
          title: 'Query Key "user:999": Bit 4 is 0 -> Definite Non-Member (Zero False Negatives!)',
          explanation:
            'Querying non-existent key "user:999". Hashes: h1 = 4, h2 = 7, h3 = 12. Probing bit array: B[4] = 0! Because every member inserted MUST have its bits set to 1, finding even a SINGLE 0 bit mathematically GUARANTEES that "user:999" has NEVER been inserted! Result: NEGATIVE (100% confidence). The system short-circuits immediately, completely avoiding an expensive disk seek or database read!',
          status: 'MISMATCH',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey3,
            activeBits: [4, 7, 12],
            operation: 'QUERY',
            targetKey: 'user:999',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:999") % 18', bitIndex: 4, bitValue: 0 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:999") % 18', bitIndex: 7, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:999") % 18', bitIndex: 12, bitValue: 0 },
            ],
            insertedKeys: registeredKeys,
            queryResult: {
              isPositive: false,
              isFalsePositive: false,
              reason: 'Bit B[4] = 0 and B[12] = 0. Definite non-member: 0% false negative guarantee. Disk seek avoided!',
            },
            filterMetrics: { bitsSet: 7, saturation: 38.9, theoreticalFpr: 4.5, elementsCount: 3 },
          },
          metrics: { 'Query Key': '"user:999"', 'Probed Bits': 'B[4]=0, B[7]=1, B[12]=0', 'Zero Bit Found': 'Index 4 & 12', 'Query Result': 'DEFINITE NEGATIVE', 'Disk I/O Saved': '100% (Avoided)' },
        },
        {
          stepIndex: 6,
          title: 'Query Key "user:404": False Positive! Bits Overlap Across Distinct Keys',
          explanation:
            'Demonstrating the fundamental trade-off: Querying key "user:404" (which was NEVER inserted). Hashes: h1 = 3, h2 = 11, h3 = 17. Probing bit array: B[3] = 1 (set by user:101), B[11] = 1 (set by user:202), B[17] = 1 (set by user:303). Because all 3 bits happen to be 1 from OTHER keys, the filter falsely reports POSITIVE! The database performs an unnecessary disk seek only to discover "user:404" is missing. This is a False Positive with theoretical probability p ≈ 4.5%.',
          status: 'MISMATCH',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey3,
            activeBits: [3, 11, 17],
            operation: 'QUERY',
            targetKey: 'user:404',
            hashComputations: [
              { name: 'h1 (Murmur3)', formula: 'Murmur3("user:404") % 18', bitIndex: 3, bitValue: 1 },
              { name: 'h2 (FNV-1a)', formula: 'FNV1a("user:404") % 18', bitIndex: 11, bitValue: 1 },
              { name: 'h3 (Jenkins)', formula: 'Jenkins("user:404") % 18', bitIndex: 17, bitValue: 1 },
            ],
            insertedKeys: registeredKeys,
            queryResult: {
              isPositive: true,
              isFalsePositive: true,
              reason: 'B[3], B[11], B[17] are all 1, but set by different keys! False positive collision triggered.',
            },
            filterMetrics: { bitsSet: 7, saturation: 38.9, theoreticalFpr: 4.5, elementsCount: 3 },
          },
          metrics: { 'Query Key': '"user:404"', 'Probed Bits': 'B[3]=1, B[11]=1, B[17]=1', 'All Bits 1?': 'Yes (Collision)', 'Query Result': 'FALSE POSITIVE', 'Root Cause': 'Inter-key overlap' },
        },
        {
          stepIndex: 7,
          title: 'Mathematical Invariants & Optimal Sizing Formula: k = (m/n) * ln(2)',
          explanation:
            'Bloom filter invariants summary: 1) False Negative Rate = 0.00% (Guaranteed). 2) False Positive Rate p ≈ (1 - e^(-kn/m))^k. 3) To achieve a 1% false positive rate (p = 0.01), approximately 9.6 bits per element (m/n ≈ 10) and k = 7 hash functions are required. In Cassandra, RocksDB, and Bigtable, Bloom filters reside in RAM (typically 10 bits/key = ~1.2 bytes/key) to eliminate >99% of pointless disk seeks for non-existent row keys.',
          status: 'COMPLETE',
          bloomFilterState: {
            bitArraySize: 18,
            bits: afterKey3,
            operation: 'INITIAL',
            insertedKeys: registeredKeys,
            filterMetrics: { bitsSet: 7, saturation: 38.9, theoreticalFpr: 4.5, elementsCount: 3 },
          },
          metrics: { 'False Negative Rate': '0.0% (Zero)', 'Optimal k Formula': '(m/n) * ln(2)', 'Rule of Thumb': '10 bits/key for 1% FPR', 'Primary Use Case': 'LSM SSTable & Cache Filtering', 'Status': 'COMPLETE' },
        },
      ];
    },
  },
];

export function AlgorithmVisualizerSandbox() {
  const [selectedAlgoId, setSelectedAlgoId] = useState<VisualizerAlgorithm>('BINARY_SEARCH');
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200); // ms per step

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedAlgo =
    ALGORITHM_CONFIGS.find((a) => a.id === selectedAlgoId) || ALGORITHM_CONFIGS[0];
  const frames = selectedAlgo.generateFrames();
  const currentFrame = frames[currentFrameIndex] || frames[0];

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, frames.length, playbackSpeed]);

  const handleSelectAlgo = (id: VisualizerAlgorithm) => {
    setIsPlaying(false);
    setSelectedAlgoId(id);
    setCurrentFrameIndex(0);
  };

  const handleStepForward = () => {
    if (currentFrameIndex < frames.length - 1) {
      setCurrentFrameIndex((prev) => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  return (
    <Card className="p-5 sm:p-7 border-border shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
            Interactive State Stepper &amp; Memory Inspector
          </span>
          <h3 className="text-xl font-bold text-text">
            {selectedAlgo.name}
          </h3>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            {selectedAlgo.description}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="text-xs font-mono bg-primary-50 text-primary-800 border border-primary-200 px-2.5 py-1 rounded-md font-semibold">
            Time: {selectedAlgo.timeComplexity}
          </span>
          <span className="text-xs font-mono bg-canvas text-text-muted border border-border px-2.5 py-1 rounded-md font-semibold">
            Space: {selectedAlgo.spaceComplexity}
          </span>
        </div>
      </div>

      {/* Algorithm Selection Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Choose Algorithm Scenario:
        </span>
        <div className="flex flex-wrap gap-2">
          {ALGORITHM_CONFIGS.map((algo) => {
            const isSelected = algo.id === selectedAlgoId;
            return (
              <button
                key={algo.id}
                type="button"
                onClick={() => handleSelectAlgo(algo.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary-50 text-primary-900 border-primary-400 shadow-xs'
                    : 'bg-canvas text-text-muted border-border hover:text-text hover:border-border-hover'
                }`}
              >
                {algo.name.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visualizer Stage */}
      <div className="bg-canvas border border-border rounded-xl p-5 space-y-5 min-h-[220px] flex flex-col justify-center">
        {/* Frame / Array Display */}
        {currentFrame.array && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Array Memory Buffer (Elements &amp; Indices)</span>
              <span>Total Length: {currentFrame.array.length}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 overflow-x-auto py-3">
              {currentFrame.array.map((val, idx) => {
                const isActive = currentFrame.activeIndices?.includes(idx);
                const isEliminated =
                  currentFrame.eliminatedRange &&
                  idx >= currentFrame.eliminatedRange[0] &&
                  idx <= currentFrame.eliminatedRange[1];

                const isWindow =
                  currentFrame.windowRange &&
                  idx >= currentFrame.windowRange[0] &&
                  idx <= currentFrame.windowRange[1];

                let boxClass = 'bg-surface border-border text-text';
                if (isActive) {
                  boxClass =
                    currentFrame.status === 'SUCCESS'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold scale-105 shadow-sm'
                      : 'bg-primary-100 border-primary-500 text-primary-950 font-bold scale-105 shadow-sm';
                } else if (isWindow) {
                  boxClass = 'bg-accent-50 border-accent-400 text-accent-950 font-semibold';
                } else if (isEliminated) {
                  boxClass = 'bg-neutral-100 border-neutral-200 text-neutral-400 line-through opacity-60';
                }

                // Identify pointers pointing here
                const pointerNames = currentFrame.pointers
                  ? Object.entries(currentFrame.pointers)
                      .filter(([, pIdx]) => pIdx === idx)
                      .map(([pName]) => pName)
                  : [];

                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    {/* Value Tile */}
                    <div
                      className={`w-12 h-12 rounded-lg border flex items-center justify-center font-mono text-base transition-all duration-200 ${boxClass}`}
                    >
                      {val}
                    </div>

                    {/* Index */}
                    <span className="text-[10px] font-mono text-text-muted">
                      [{idx}]
                    </span>

                    {/* Pointer Badges */}
                    {pointerNames.length > 0 && (
                      <div className="flex flex-col gap-0.5">
                        {pointerNames.map((pName) => (
                          <span
                            key={pName}
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-primary-800 text-white font-mono"
                          >
                            {pName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stack Display (for STACK_DELIMITERS) */}
        {currentFrame.stack !== undefined && (
          <div className="flex flex-col items-center space-y-3">
            <span className="text-xs text-text-muted font-semibold">
              LIFO Call Stack (Bottom → Top)
            </span>
            <div className="w-48 min-h-[120px] max-h-[160px] border-2 border-dashed border-border rounded-lg p-2 flex flex-col-reverse items-center gap-1.5 bg-surface">
              {currentFrame.stack.length === 0 ? (
                <span className="text-xs text-text-muted my-auto italic">
                  Stack is empty
                </span>
              ) : (
                currentFrame.stack.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full py-1.5 rounded-md bg-primary-100 border border-primary-300 text-center font-mono font-bold text-primary-900 shadow-2xs"
                  >
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Graph Display (for GRAPH_BFS_TRAVERSAL & GRAPH_DFS_TRAVERSAL) */}
        {currentFrame.graphState && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-semibold">Interactive Graph Topology &amp; Frontier</span>
              <span className="font-mono">
                Visited: {currentFrame.graphState.visitedNodes.length} /{' '}
                {currentFrame.graphState.nodes.length} Vertices
              </span>
            </div>

            <div className="w-full flex justify-center overflow-x-auto py-2">
              <svg
                viewBox="0 0 420 200"
                className="w-full max-w-[500px] h-48 bg-surface rounded-lg border border-border shadow-2xs"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="22"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="8"
                    markerHeight="6"
                    refX="22"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
                  </marker>
                </defs>

                {/* Edges */}
                {currentFrame.graphState.edges.map((edge, idx) => {
                  const fromNode = currentFrame.graphState!.nodes.find((n) => n.id === edge.from);
                  const toNode = currentFrame.graphState!.nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const isActiveEdge =
                    currentFrame.graphState!.activeEdge &&
                    currentFrame.graphState!.activeEdge.from === edge.from &&
                    currentFrame.graphState!.activeEdge.to === edge.to;

                  return (
                    <line
                      key={`edge-${idx}`}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isActiveEdge ? '#2563eb' : '#94a3b8'}
                      strokeWidth={isActiveEdge ? 3 : 2}
                      strokeDasharray={isActiveEdge ? '4 2' : undefined}
                      markerEnd={
                        edge.directed
                          ? isActiveEdge
                            ? 'url(#arrowhead-active)'
                            : 'url(#arrowhead)'
                          : undefined
                      }
                    />
                  );
                })}

                {/* Nodes */}
                {currentFrame.graphState.nodes.map((node) => {
                  const isActive = currentFrame.graphState!.activeNodeId === node.id;
                  const isVisited = currentFrame.graphState!.visitedNodes.includes(node.id);
                  const isInFrontier = currentFrame.graphState!.frontierQueue?.includes(node.id);

                  let fill = '#ffffff';
                  let stroke = '#cbd5e1';
                  let textFill = '#1e293b';

                  if (isActive) {
                    fill = '#2563eb';
                    stroke = '#1d4ed8';
                    textFill = '#ffffff';
                  } else if (isVisited) {
                    fill = '#059669';
                    stroke = '#047857';
                    textFill = '#ffffff';
                  } else if (isInFrontier) {
                    fill = '#f59e0b';
                    stroke = '#d97706';
                    textFill = '#ffffff';
                  }

                  return (
                    <g key={node.id} className="transition-all duration-200">
                      {isActive && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="24"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          opacity="0.6"
                          className="animate-pulse"
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="18"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2.5"
                      />
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dy=".32em"
                        fill={textFill}
                        className="text-xs font-bold font-mono select-none"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Frontier Queue/Stack & Traversal Sequence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-surface border border-border rounded-lg p-3 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  {currentFrame.graphState.frontierLabel || 'Frontier Queue'}:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
                  {currentFrame.graphState.frontierQueue &&
                  currentFrame.graphState.frontierQueue.length > 0 ? (
                    currentFrame.graphState.frontierQueue.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">Empty</span>
                  )}
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-3 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Traversal Order / Visited Path:
                </span>
                <div className="flex items-center gap-1 flex-wrap min-h-[28px]">
                  {currentFrame.graphState.traversalOrder.length > 0 ? (
                    currentFrame.graphState.traversalOrder.map((nodeId, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {nodeId}
                        </span>
                        {idx < currentFrame.graphState!.traversalOrder.length - 1 && (
                          <span className="text-text-muted text-xs">→</span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">None visited yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tree Display (for BST_INSERTION_INORDER & AVL_TREE_ROTATIONS) */}
        {currentFrame.treeState && (
          <div className="space-y-4">
            {/* AVL Rotation Alert Banner */}
            {currentFrame.treeState.rotationBanner && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold px-2 py-0.5 rounded bg-amber-600 text-white text-[11px] font-mono shrink-0">
                    {currentFrame.treeState.rotationBanner.type} ROTATION
                  </span>
                  <span className="font-bold text-text">
                    {currentFrame.treeState.rotationBanner.title}
                  </span>
                </div>
                <span className="text-text-muted text-xs">
                  {currentFrame.treeState.rotationBanner.description}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-semibold">
                {selectedAlgoId === 'AVL_TREE_ROTATIONS'
                  ? 'Self-Balancing AVL Tree Topology (Balance Factors & Heights)'
                  : selectedAlgoId === 'RED_BLACK_TREE'
                  ? 'Red-Black Tree Topology (Color Invariants & Black-Height)'
                  : 'Binary Search Tree Layout'}
              </span>
              <span className="font-mono">Total Nodes: {currentFrame.treeState.nodes.length}</span>
            </div>

            <div className="w-full flex justify-center overflow-x-auto py-2">
              <svg
                viewBox="0 0 420 255"
                className="w-full max-w-[520px] h-60 bg-surface rounded-lg border border-border shadow-2xs"
              >
                {/* Tree Edges */}
                {currentFrame.treeState.nodes.map((node) => {
                  const leftChild = currentFrame.treeState!.nodes.find((n) => n.id === node.left);
                  const rightChild = currentFrame.treeState!.nodes.find((n) => n.id === node.right);

                  return (
                    <g key={`edges-${node.id}`}>
                      {leftChild && (
                        <line
                          x1={node.x}
                          y1={node.y}
                          x2={leftChild.x}
                          y2={leftChild.y}
                          stroke="#94a3b8"
                          strokeWidth="2"
                        />
                      )}
                      {rightChild && (
                        <line
                          x1={node.x}
                          y1={node.y}
                          x2={rightChild.x}
                          y2={rightChild.y}
                          stroke="#94a3b8"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Tree Nodes */}
                {currentFrame.treeState.nodes.map((node) => {
                  const isActive = currentFrame.treeState!.activeNodeId === node.id;
                  const isCompared = currentFrame.treeState!.comparedNodeId === node.id;
                  const isNew = node.isNew;
                  const isImbalanced = node.isImbalanced;
                  const isPivot = node.isPivot;
                  const isRecolorWarning = node.recolorWarning;

                  let fill = '#ffffff';
                  let stroke = '#cbd5e1';
                  let textFill = '#1e293b';

                  if (node.color === 'RED') {
                    fill = '#ef4444';
                    stroke = '#b91c1c';
                    textFill = '#ffffff';
                  } else if (node.color === 'BLACK') {
                    fill = '#1e293b';
                    stroke = '#0f172a';
                    textFill = '#ffffff';
                  } else if (isImbalanced) {
                    fill = '#fee2e2';
                    stroke = '#ef4444';
                    textFill = '#b91c1c';
                  } else if (isPivot) {
                    fill = '#ede9fe';
                    stroke = '#8b5cf6';
                    textFill = '#6d28d9';
                  } else if (isNew) {
                    fill = '#10b981';
                    stroke = '#059669';
                    textFill = '#ffffff';
                  } else if (isActive) {
                    fill = '#2563eb';
                    stroke = '#1d4ed8';
                    textFill = '#ffffff';
                  } else if (isCompared) {
                    fill = '#f59e0b';
                    stroke = '#d97706';
                    textFill = '#ffffff';
                  }

                  return (
                    <g key={node.id} className="transition-all duration-200">
                      {/* Pulse ring for active nodes */}
                      {isActive && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="22"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          opacity="0.6"
                          className="animate-pulse"
                        />
                      )}

                      {/* Imbalance warning ring */}
                      {isImbalanced && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="24"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      )}

                      {/* Consecutive RED violation warning ring */}
                      {isRecolorWarning && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="25"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                          className="animate-pulse"
                        />
                      )}

                      {/* Pivot highlight ring */}
                      {isPivot && !isImbalanced && !isRecolorWarning && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="23"
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="2"
                          opacity="0.7"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="16"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2.5"
                      />

                      {/* Node Value Text */}
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dy=".32em"
                        fill={textFill}
                        className="text-xs font-bold font-mono select-none"
                      >
                        {node.val}
                      </text>

                      {/* Balance Factor Pill Badge */}
                      {node.balanceFactor !== undefined && (
                        <g>
                          <rect
                            x={node.x - 18}
                            y={node.y - 30}
                            width="36"
                            height="13"
                            rx="3"
                            fill={
                              isImbalanced
                                ? '#ef4444'
                                : Math.abs(node.balanceFactor) > 0
                                ? '#d97706'
                                : '#10b981'
                            }
                          />
                          <text
                            x={node.x}
                            y={node.y - 20}
                            textAnchor="middle"
                            className="text-[9px] font-bold font-mono fill-white select-none"
                          >
                            BF:{node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}
                          </text>
                        </g>
                      )}

                      {/* Red-Black Tree Node Color & Black-Height Badge */}
                      {node.color !== undefined && (
                        <g>
                          <rect
                            x={node.x - 16}
                            y={node.y - 30}
                            width="32"
                            height="13"
                            rx="3"
                            fill={node.color === 'RED' ? '#b91c1c' : '#0f172a'}
                          />
                          <text
                            x={node.x}
                            y={node.y - 20}
                            textAnchor="middle"
                            className="text-[9px] font-bold font-mono fill-white select-none"
                          >
                            {node.color === 'RED' ? 'RED' : 'BLK'}
                          </text>
                        </g>
                      )}

                      {/* Node Height Indicator */}
                      {node.height !== undefined && (
                        <text
                          x={node.x + 18}
                          y={node.y + 13}
                          className="text-[9px] font-mono font-bold fill-slate-500 select-none"
                        >
                          h={node.height}
                        </text>
                      )}

                      {/* Black-Height Indicator */}
                      {node.blackHeight !== undefined && (
                        <text
                          x={node.x + 18}
                          y={node.y + 13}
                          className="text-[9px] font-mono font-bold fill-slate-500 select-none"
                        >
                          bh={node.blackHeight}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* In-Order Traversal Output Stream */}
            {currentFrame.treeState.traversalOrder && (
              <div className="bg-surface border border-border rounded-lg p-3 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  {currentFrame.treeState.traversalLabel || 'In-Order Traversal Stream (Sorted)'}:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
                  {currentFrame.treeState.traversalOrder.length > 0 ? (
                    currentFrame.treeState.traversalOrder.map((val, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs"
                      >
                        {val}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">No nodes emitted yet</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Multi-Way B-Tree / 2-3-4 Tree Display */}
        {currentFrame.bTreeState && (
          <div className="space-y-4">
            {/* Split / Elevation Alert Banner */}
            {currentFrame.bTreeState.splitBanner && (
              <div
                className={`border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  currentFrame.bTreeState.splitBanner.type === 'RANGE_MATCH'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : currentFrame.bTreeState.splitBanner.type === 'RANGE_HOP'
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      currentFrame.bTreeState.splitBanner.type === 'RANGE_MATCH'
                        ? 'text-emerald-900 dark:text-emerald-300'
                        : currentFrame.bTreeState.splitBanner.type === 'RANGE_HOP'
                        ? 'text-cyan-900 dark:text-cyan-300'
                        : 'text-amber-900 dark:text-amber-300'
                    }`}
                  >
                    {currentFrame.bTreeState.splitBanner.type === 'LEAF_SPLIT'
                      ? '⚡ Node Split'
                      : currentFrame.bTreeState.splitBanner.type === 'ROOT_SPLIT'
                      ? '🌲 Root Split (Tree Height +1)'
                      : currentFrame.bTreeState.splitBanner.type === 'RANGE_HOP'
                      ? '➡️ Leaf Sibling Hop'
                      : currentFrame.bTreeState.splitBanner.type === 'RANGE_MATCH'
                      ? '🎯 Range Scan Match'
                      : '⬆️ Median Elevation'}:
                  </span>
                  <span className="font-semibold text-text">
                    {currentFrame.bTreeState.splitBanner.title}
                  </span>
                </div>
                <span className="text-text-muted text-[11px]">
                  {currentFrame.bTreeState.splitBanner.description}
                </span>
              </div>
            )}

            {/* SVG Canvas for Multi-Way B-Tree & B+ Tree */}
            <div className="w-full flex justify-center bg-surface/50 border border-border rounded-xl p-3 overflow-x-auto">
              <svg
                viewBox="0 0 460 250"
                className="w-full max-w-2xl h-64 select-none font-sans"
              >
                {/* Connection lines from parents to children */}
                {currentFrame.bTreeState.nodes.map((node) => {
                  if (!node.children || node.children.length === 0) return null;
                  const nodeWidth = Math.max(60, node.keys.length * 36 + 16);
                  const nodeHeight = 32;

                  return (
                    <g key={`links-${node.id}`}>
                      {node.children.map((childId, childIdx) => {
                        const childNode = currentFrame.bTreeState!.nodes.find((n) => n.id === childId);
                        if (!childNode) return null;
                        const totalSlots = node.children!.length;
                        const startX = node.x - nodeWidth / 2 + (nodeWidth / (totalSlots + 1)) * (childIdx + 1);
                        const startY = node.y + nodeHeight / 2;
                        const endX = childNode.x;
                        const endY = childNode.y - nodeHeight / 2;

                        return (
                          <line
                            key={`link-${node.id}-${childId}`}
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke="#94a3b8"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Leaf Horizontal Sibling Pointer Chains (for B+ Tree) */}
                {currentFrame.bTreeState.siblingLinks &&
                  currentFrame.bTreeState.siblingLinks.map((link, lIdx) => {
                    const fromNode = currentFrame.bTreeState!.nodes.find((n) => n.id === link.from);
                    const toNode = currentFrame.bTreeState!.nodes.find((n) => n.id === link.to);
                    if (!fromNode || !toNode) return null;
                    const fromWidth = Math.max(60, fromNode.keys.length * 36 + 16);
                    const toWidth = Math.max(60, toNode.keys.length * 36 + 16);
                    const startX = fromNode.x + fromWidth / 2;
                    const startY = fromNode.y;
                    const endX = toNode.x - toWidth / 2;
                    const endY = toNode.y;

                    return (
                      <g key={`sibling-${lIdx}`}>
                        <line
                          x1={startX + 3}
                          y1={startY}
                          x2={endX - 8}
                          y2={endY}
                          stroke={link.active ? '#06b6d4' : '#64748b'}
                          strokeWidth={link.active ? 3 : 1.5}
                          strokeDasharray={link.active ? '4 2' : '2 2'}
                        />
                        {/* Traversal Arrowhead */}
                        <polygon
                          points={`${endX - 3},${endY} ${endX - 9},${endY - 4} ${endX - 9},${endY + 4}`}
                          fill={link.active ? '#06b6d4' : '#64748b'}
                        />
                        {link.active && (
                          <text
                            x={(startX + endX) / 2}
                            y={startY - 9}
                            textAnchor="middle"
                            className="text-[9px] font-mono font-bold fill-cyan-600 select-none"
                          >
                            SIBLING HOP
                          </text>
                        )}
                      </g>
                    );
                  })}

                {/* B-Tree / B+ Tree Segmented Nodes */}
                {currentFrame.bTreeState.nodes.map((node) => {
                  const isActive = currentFrame.bTreeState!.activeNodeId === node.id;
                  const isFull = node.isFull;
                  const isOverflow = node.isOverflow;
                  const isElevating = node.isElevating;
                  const nodeWidth = Math.max(60, node.keys.length * 36 + 16);
                  const nodeHeight = 32;

                  let borderColor = '#cbd5e1';
                  let bgColor = '#ffffff';

                  if (isOverflow) {
                    borderColor = '#ef4444';
                    bgColor = '#fef2f2';
                  } else if (isElevating) {
                    borderColor = '#8b5cf6';
                    bgColor = '#f5f3ff';
                  } else if (isActive) {
                    borderColor = '#3b82f6';
                    bgColor = '#eff6ff';
                  } else if (isFull) {
                    borderColor = '#f59e0b';
                    bgColor = '#fffbeb';
                  } else if (node.nodeType === 'ROUTER') {
                    borderColor = '#6366f1';
                    bgColor = '#f8fafc';
                  }

                  return (
                    <g key={node.id} className="transition-all duration-200">
                      {/* Pulse ring for active or overflowing nodes */}
                      {isActive && (
                        <rect
                          x={node.x - nodeWidth / 2 - 4}
                          y={node.y - nodeHeight / 2 - 4}
                          width={nodeWidth + 8}
                          height={nodeHeight + 8}
                          rx="10"
                          fill="none"
                          stroke={isOverflow ? '#ef4444' : '#3b82f6'}
                          strokeWidth="2"
                          strokeDasharray={isOverflow ? '4 2' : undefined}
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Box */}
                      <rect
                        x={node.x - nodeWidth / 2}
                        y={node.y - nodeHeight / 2}
                        width={nodeWidth}
                        height={nodeHeight}
                        rx="6"
                        fill={bgColor}
                        stroke={borderColor}
                        strokeWidth="2"
                      />

                      {/* Internal Key Slots */}
                      {node.keys.map((keyVal, keyIdx) => {
                        const slotWidth = 32;
                        const slotHeight = 24;
                        const slotX =
                          node.x - nodeWidth / 2 + 8 + keyIdx * 36;
                        const slotY = node.y - slotHeight / 2;

                        const isTarget = currentFrame.bTreeState!.targetKey === keyVal;
                        const isPromoted = currentFrame.bTreeState!.promotedKey === keyVal;
                        const isKeyHighlighted = node.highlightedKeys?.includes(keyVal);

                        let keyBg = '#f1f5f9';
                        let keyText = '#0f172a';
                        let keyBorder = '#e2e8f0';

                        if (isPromoted) {
                          keyBg = '#8b5cf6';
                          keyText = '#ffffff';
                          keyBorder = '#7c3aed';
                        } else if (isTarget) {
                          keyBg = '#10b981';
                          keyText = '#ffffff';
                          keyBorder = '#059669';
                        } else if (isKeyHighlighted) {
                          keyBg = '#f59e0b';
                          keyText = '#ffffff';
                          keyBorder = '#d97706';
                        }

                        return (
                          <g key={`key-${node.id}-${keyIdx}`}>
                            <rect
                              x={slotX}
                              y={slotY}
                              width={slotWidth}
                              height={slotHeight}
                              rx="4"
                              fill={keyBg}
                              stroke={keyBorder}
                              strokeWidth="1.5"
                            />
                            <text
                              x={slotX + slotWidth / 2}
                              y={slotY + slotHeight / 2}
                              textAnchor="middle"
                              dy=".32em"
                              fill={keyText}
                              className="text-xs font-bold font-mono select-none"
                            >
                              {keyVal}
                            </text>
                          </g>
                        );
                      })}

                      {/* Node Status Tag (Full / 2-node / 3-node / 4-node / Router / Leaf) */}
                      <g>
                        <text
                          x={node.x}
                          y={node.y + nodeHeight / 2 + 12}
                          textAnchor="middle"
                          className="text-[9px] font-mono font-semibold fill-slate-500 select-none"
                        >
                          {node.nodeType === 'ROUTER'
                            ? 'ROUTER (INDEX)'
                            : node.nodeType === 'LEAF'
                            ? 'DATA LEAF PAGE'
                            : node.keys.length === 1
                            ? '2-node'
                            : node.keys.length === 2
                            ? '3-node'
                            : node.keys.length === 3
                            ? '4-node (FULL)'
                            : 'OVERFLOW'}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Range Query Buffer & Disk Page I/O HUD (for B+ Tree) */}
            {currentFrame.bTreeState.rangeQuery && (
              <div className="bg-surface border border-border rounded-lg p-3 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                      Query Filter:
                    </span>
                    <span className="font-mono font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded text-xs">
                      SELECT records WHERE key &gt;= {currentFrame.bTreeState.rangeQuery.min} AND key &lt;= {currentFrame.bTreeState.rangeQuery.max}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-semibold text-text-muted">Page I/Os:</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {currentFrame.bTreeState.pageReads ?? 0} Disk Fetches
                    </span>
                    {currentFrame.bTreeState.rangeQuery.isTerminated && (
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        ✓ Range Scan Halted
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Range Query Result Stream:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap min-h-[28px]">
                    {currentFrame.bTreeState.rangeQuery.results.length > 0 ? (
                      currentFrame.bTreeState.rangeQuery.results.map((keyVal, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs"
                        >
                          key: {keyVal}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-muted italic">Result buffer empty (locating start leaf...)</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Invariant Properties Summary */}
            <div className="bg-surface border border-border rounded-lg p-3 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                <span className="uppercase tracking-wider">
                  {currentFrame.bTreeState.isBPlusTree
                    ? 'B+ Tree Indexing & External Memory Invariant Properties:'
                    : 'B-Tree / 2-3-4 Order M=4 Invariant Properties:'}
                </span>
                <span>
                  {currentFrame.bTreeState.isBPlusTree
                    ? 'O(log_B N + K/B) Range I/Os'
                    : 'Max Capacity: 3 Keys, 4 Children'}
                </span>
              </div>
              <p className="text-text-muted text-[11px] leading-relaxed">
                {currentFrame.bTreeState.isBPlusTree
                  ? 'All actual record keys reside strictly in leaf pages linked by horizontal sibling pointers. Internal index pages store only separator keys to guide point search down to the initial leaf. Once reached, sequential scans traverse sibling pointers directly with zero root re-traversals.'
                  : `Internal nodes with k keys have exactly k + 1 children. All leaf nodes reside at uniform tree height h=${currentFrame.bTreeState.treeHeight}. Overflow triggers preemptive median promotion, growing tree height from root down.`}
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Bloom Filter Bit-Array Hashing Display */}
        {currentFrame.bloomFilterState && (
          <div className="space-y-4">
            {/* Top Status & Probabilistic HUD */}
            <div className="bg-surface border border-border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    currentFrame.bloomFilterState.operation === 'INSERT'
                      ? 'bg-primary-100 text-primary-900 border border-primary-300'
                      : currentFrame.bloomFilterState.operation === 'QUERY'
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                      : 'bg-canvas text-text-muted border border-border'
                  }`}
                >
                  OP: {currentFrame.bloomFilterState.operation}
                </span>

                {currentFrame.bloomFilterState.targetKey && (
                  <span className="font-semibold text-text">
                    Target: <code className="bg-canvas px-1.5 py-0.5 rounded border border-border text-primary-700 font-mono">{currentFrame.bloomFilterState.targetKey}</code>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Saturation:</span>
                  <span className="font-mono font-bold text-text">
                    {currentFrame.bloomFilterState.filterMetrics.bitsSet} / {currentFrame.bloomFilterState.bitArraySize} ({currentFrame.bloomFilterState.filterMetrics.saturation}%)
                  </span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted">Theoretical FPR:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                    p ≈ {currentFrame.bloomFilterState.filterMetrics.theoreticalFpr}%
                  </span>
                </div>
              </div>
            </div>

            {/* Query Result / False Positive Alert Banner */}
            {currentFrame.bloomFilterState.queryResult && (
              <div
                className={`border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  currentFrame.bloomFilterState.queryResult.isFalsePositive
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : currentFrame.bloomFilterState.queryResult.isPositive
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-indigo-500/10 border-indigo-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold ${
                      currentFrame.bloomFilterState.queryResult.isFalsePositive
                        ? 'text-amber-900 dark:text-amber-300'
                        : currentFrame.bloomFilterState.queryResult.isPositive
                        ? 'text-emerald-900 dark:text-emerald-300'
                        : 'text-indigo-900 dark:text-indigo-300'
                    }`}
                  >
                    {currentFrame.bloomFilterState.queryResult.isFalsePositive
                      ? '⚠️ False Positive Detected'
                      : currentFrame.bloomFilterState.queryResult.isPositive
                      ? '✓ Probable Member Match'
                      : '🛡️ Definite Negative (Zero False Negatives!)'}:
                  </span>
                  <span className="text-text font-medium">
                    {currentFrame.bloomFilterState.queryResult.reason}
                  </span>
                </div>
              </div>
            )}

            {/* Bloom Filter Bit Array Grid */}
            <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
                <span>Bit Array ($m = {currentFrame.bloomFilterState.bitArraySize}$ bits in RAM):</span>
                <span>Active Probes Highlighted</span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-18 gap-1.5 pt-1">
                {currentFrame.bloomFilterState.bits.map((bitVal, bitIdx) => {
                  const isActive = currentFrame.bloomFilterState!.activeBits?.includes(bitIdx);
                  const isCollided = currentFrame.bloomFilterState!.collidedBits?.includes(bitIdx);

                  let cellBg = 'bg-surface border-border text-slate-400';
                  if (bitVal === 1) {
                    cellBg = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                  }

                  return (
                    <div
                      key={bitIdx}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all duration-200 ${cellBg} ${
                        isActive
                          ? isCollided
                            ? 'ring-2 ring-purple-500 scale-105 shadow-xs'
                            : 'ring-2 ring-cyan-500 scale-105 shadow-xs'
                          : ''
                      }`}
                    >
                      <span className="text-[9px] font-mono text-text-muted select-none">
                        [{bitIdx}]
                      </span>
                      <span className="text-base font-mono font-extrabold select-none">
                        {bitVal}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3 Hash Function Pipelines */}
            {currentFrame.bloomFilterState.hashComputations &&
              currentFrame.bloomFilterState.hashComputations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {currentFrame.bloomFilterState.hashComputations.map((h, hIdx) => (
                    <div
                      key={hIdx}
                      className="p-3 rounded-lg bg-surface border border-border space-y-1.5 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text font-mono text-[11px]">
                          {h.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                            h.bitValue === 1
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          B[{h.bitIndex}] = {h.bitValue}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-text-muted truncate">
                        {h.formula}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            {/* Registered Elements Registry & Math Invariants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-surface border border-border rounded-lg p-3 space-y-1.5 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Registered Keys in Filter ({currentFrame.bloomFilterState.insertedKeys.length}):
                </span>
                <div className="space-y-1 min-h-[40px]">
                  {currentFrame.bloomFilterState.insertedKeys.length > 0 ? (
                    currentFrame.bloomFilterState.insertedKeys.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between font-mono text-[11px] bg-canvas px-2 py-1 rounded border border-border"
                      >
                        <span className="font-semibold text-primary-700">{item.key}</span>
                        <span className="text-text-muted text-[10px]">
                          bits: [{item.indices.join(', ')}]
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted italic">No keys inserted yet</span>
                  )}
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                  <span className="uppercase tracking-wider">Bloom Filter Mathematical Invariants:</span>
                  <span>k = (m/n) · ln(2)</span>
                </div>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  False Negative Rate is strictly <strong className="text-emerald-600">0.00%</strong>. If any hash bit is 0, the key was never inserted. False positive probability follows <code className="text-primary-600 font-mono">p ≈ (1 - e^(-kn/m))^k</code>. 10 bits/key achieves &lt;1% FPR in LSM storage engines (Cassandra, RocksDB).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metric Key-Value Badges */}
        {currentFrame.metrics && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-border">
            {Object.entries(currentFrame.metrics)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => (
                <div
                  key={k}
                  className="text-xs bg-surface border border-border px-3 py-1 rounded-md flex items-center gap-1.5"
                >
                  <span className="font-semibold text-text-muted">{k}:</span>
                  <span className="font-mono font-bold text-text">{v}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Socratic Step Explanation */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-800 font-mono">
              Step {currentFrameIndex + 1} of {frames.length}
            </span>
            <h4 className="text-sm font-bold text-text">
              {currentFrame.title}
            </h4>
          </div>

          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              currentFrame.status === 'SUCCESS' || currentFrame.status === 'COMPLETE'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {currentFrame.status}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          {currentFrame.explanation}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            aria-label="Reset Stepper"
          >
            ↺ Reset
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleStepBackward}
            disabled={currentFrameIndex === 0}
            aria-label="Previous Step"
          >
            ← Previous Step
          </Button>

          <Button
            variant={isPlaying ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleStepForward}
            disabled={currentFrameIndex === frames.length - 1}
            aria-label="Next Step"
          >
            Next Step →
          </Button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Speed:</span>
          {[
            { label: '0.5x', ms: 2000 },
            { label: '1x', ms: 1200 },
            { label: '2x', ms: 600 },
          ].map((sp) => (
            <button
              key={sp.label}
              type="button"
              onClick={() => setPlaybackSpeed(sp.ms)}
              className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer border ${
                playbackSpeed === sp.ms
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-surface text-text-muted border-border hover:text-text'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
