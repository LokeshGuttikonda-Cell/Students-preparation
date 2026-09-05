'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export type VisualizerAlgorithm =
  | 'BINARY_SEARCH'
  | 'TWO_POINTER_SUM'
  | 'STACK_DELIMITERS'
  | 'SLIDING_WINDOW'
  | 'BUBBLE_SORT';

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
