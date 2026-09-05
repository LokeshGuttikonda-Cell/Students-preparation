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
  | 'BST_INSERTION_INORDER';

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
}

export interface VisualizerTreeState {
  nodes: VisualizerTreeNode[];
  activeNodeId?: string;
  comparedNodeId?: string;
  targetVal?: number;
  traversalOrder?: number[];
  traversalLabel?: string;
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

        {/* Tree Display (for BST_INSERTION_INORDER) */}
        {currentFrame.treeState && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-semibold">Binary Search Tree Layout</span>
              <span className="font-mono">Total Nodes: {currentFrame.treeState.nodes.length}</span>
            </div>

            <div className="w-full flex justify-center overflow-x-auto py-2">
              <svg
                viewBox="0 0 400 220"
                className="w-full max-w-[480px] h-52 bg-surface rounded-lg border border-border shadow-2xs"
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

                  let fill = '#ffffff';
                  let stroke = '#cbd5e1';
                  let textFill = '#1e293b';

                  if (isNew) {
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
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="16"
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
                        {node.val}
                      </text>
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
