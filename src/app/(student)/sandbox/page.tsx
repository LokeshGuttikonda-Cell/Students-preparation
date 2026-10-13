'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SqlQuerySandbox } from '../../../components/sandbox/SqlQuerySandbox';
import { CodeLogicSandbox } from '../../../components/sandbox/CodeLogicSandbox';
import { AlgorithmVisualizerSandbox } from '../../../components/sandbox/AlgorithmVisualizerSandbox';
import { MemoryCacheInspectorSandbox } from '../../../components/sandbox/MemoryCacheInspectorSandbox';
import { DistributedSystemsSandbox } from '../../../components/sandbox/DistributedSystemsSandbox';
import { KernelNetworkSandbox } from '../../../components/sandbox/KernelNetworkSandbox';
import { SystemDesignSandbox } from '../../../components/sandbox/SystemDesignSandbox';
import { ConcurrencyEventLoopSandbox } from '../../../components/sandbox/ConcurrencyEventLoopSandbox';
import { ArchitectureTradeoffSandbox } from '../../../components/sandbox/ArchitectureTradeoffSandbox';
import { AiAgentLabSandbox } from '../../../components/sandbox/AiAgentLabSandbox';
import { Button } from '../../../components/ui/Button';
import { Database, Code2, Eye, Cpu, Network, Cog, Layers, Zap, Scale, Bot } from 'lucide-react';

interface SqlChallenge {
  id: string;
  title: string;
  description: string;
  initialQuery: string;
  expectedQuery: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  functionName: string;
  initialCode: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  testCases: Array<{
    id: string;
    description: string;
    input: unknown[];
    expectedOutput: unknown;
  }>;
}

const SQL_CHALLENGES: SqlChallenge[] = [
  {
    id: 'sql-dept-agg',
    title: 'Department Headcount & Average Compensation',
    description: 'Calculate the total employee count and average salary per department, ordered from highest average salary to lowest.',
    initialQuery: `SELECT d.name AS department, COUNT(e.id) AS total_employees, AVG(e.salary) AS avg_salary
FROM departments d
JOIN employees e ON d.id = e.department_id
GROUP BY d.name
ORDER BY avg_salary DESC;`,
    expectedQuery: `SELECT d.name AS department, COUNT(e.id) AS total_employees, AVG(e.salary) AS avg_salary
FROM departments d
JOIN employees e ON d.id = e.department_id
GROUP BY d.name
ORDER BY avg_salary DESC;`,
    difficulty: 'EASY',
  },
  {
    id: 'sql-top-earner',
    title: 'Top Earner per Department (Window Ranking)',
    description: 'Retrieve the top-earning employee for each department using the DENSE_RANK() window function.',
    initialQuery: `SELECT name, department, salary
FROM (
  SELECT e.name, d.name AS department, e.salary,
         DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rank
  FROM employees e
  JOIN departments d ON e.department_id = d.id
) ranked
WHERE rank = 1;`,
    expectedQuery: `SELECT name, department, salary
FROM (
  SELECT e.name, d.name AS department, e.salary,
         DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rank
  FROM employees e
  JOIN departments d ON e.department_id = d.id
) ranked
WHERE rank = 1;`,
    difficulty: 'MEDIUM',
  },
  {
    id: 'sql-payroll-spread',
    title: 'Department Total Payroll & Salary Spread',
    description: 'Find all departments where total payroll expense exceeds $150,000, calculating the spread between maximum and minimum salary.',
    initialQuery: `SELECT d.name AS department, SUM(e.salary) AS total_payroll,
       (MAX(e.salary) - MIN(e.salary)) AS salary_spread
FROM departments d
JOIN employees e ON d.id = e.department_id
GROUP BY d.name
HAVING SUM(e.salary) > 150000;`,
    expectedQuery: `SELECT d.name AS department, SUM(e.salary) AS total_payroll,
       (MAX(e.salary) - MIN(e.salary)) AS salary_spread
FROM departments d
JOIN employees e ON d.id = e.department_id
GROUP BY d.name
HAVING SUM(e.salary) > 150000;`,
    difficulty: 'HARD',
  },
  {
    id: 'sql-senior-filter',
    title: 'Cross-Department Senior Compensation Filter',
    description: 'Identify all active employees earning above $85,000 across Cloud and Engineering departments.',
    initialQuery: `SELECT e.name, d.name AS department, e.salary, e.hire_date
FROM employees e
JOIN departments d ON e.department_id = d.id
WHERE e.salary > 85000
ORDER BY e.salary DESC;`,
    expectedQuery: `SELECT e.name, d.name AS department, e.salary, e.hire_date
FROM employees e
JOIN departments d ON e.department_id = d.id
WHERE e.salary > 85000
ORDER BY e.salary DESC;`,
    difficulty: 'EASY',
  },
  {
    id: 'sql-seniority-rank',
    title: 'Seniority Ranking by Hire Date',
    description: 'Assign a sequential seniority ranking to all employees based on their hire date, ordered from earliest hire to most recent.',
    initialQuery: `SELECT id, name, salary, hire_date,
       ROW_NUMBER() OVER (ORDER BY hire_date ASC) AS seniority_rank
FROM employees
ORDER BY seniority_rank ASC;`,
    expectedQuery: `SELECT id, name, salary, hire_date,
       ROW_NUMBER() OVER (ORDER BY hire_date ASC) AS seniority_rank
FROM employees
ORDER BY seniority_rank ASC;`,
    difficulty: 'MEDIUM',
  },
  {
    id: 'sql-cumulative-payroll',
    title: 'Cumulative Running Total Payroll',
    description: 'Calculate the cumulative running total of employee salaries ordered by employee id.',
    initialQuery: `SELECT id, name, salary,
       SUM(salary) OVER (ORDER BY id ASC) AS running_payroll
FROM employees;`,
    expectedQuery: `SELECT id, name, salary,
       SUM(salary) OVER (ORDER BY id ASC) AS running_payroll
FROM employees;`,
    difficulty: 'MEDIUM',
  },
  {
    id: 'sql-salary-quartiles',
    title: 'Employee Salary Quartile Segmentation',
    description: 'Partition employees into four compensation quartiles (1 to 4) ordered by salary descending using NTILE(4).',
    initialQuery: `SELECT id, name, salary,
       NTILE(4) OVER (ORDER BY salary DESC) AS compensation_quartile
FROM employees
ORDER BY salary DESC;`,
    expectedQuery: `SELECT id, name, salary,
       NTILE(4) OVER (ORDER BY salary DESC) AS compensation_quartile
FROM employees
ORDER BY salary DESC;`,
    difficulty: 'HARD',
  },
  {
    id: 'sql-above-dept-avg',
    title: 'Employees Earning Above Department Average',
    description: 'Identify employees whose compensation exceeds the average salary within their department using a correlated subquery or window partition.',
    initialQuery: `SELECT e.name, d.name AS department, e.salary
FROM employees e
JOIN departments d ON e.department_id = d.id
WHERE e.salary > (
  SELECT AVG(salary) FROM employees WHERE department_id = e.department_id
)
ORDER BY e.salary DESC;`,
    expectedQuery: `SELECT e.name, d.name AS department, e.salary
FROM employees e
JOIN departments d ON e.department_id = d.id
WHERE e.salary > (
  SELECT AVG(salary) FROM employees WHERE department_id = e.department_id
)
ORDER BY e.salary DESC;`,
    difficulty: 'MEDIUM',
  },
  {
    id: 'sql-dept-salary-gap',
    title: 'Department Lead Compensation Gap Analysis',
    description: 'Calculate the salary differential between each employee and the maximum earner within their department using MAX() OVER (PARTITION BY).',
    initialQuery: `SELECT e.name, d.name AS department, e.salary,
       (MAX(e.salary) OVER (PARTITION BY e.department_id) - e.salary) AS gap_to_max
FROM employees e
JOIN departments d ON e.department_id = d.id
ORDER BY department ASC, gap_to_max ASC;`,
    expectedQuery: `SELECT e.name, d.name AS department, e.salary,
       (MAX(e.salary) OVER (PARTITION BY e.department_id) - e.salary) AS gap_to_max
FROM employees e
JOIN departments d ON e.department_id = d.id
ORDER BY department ASC, gap_to_max ASC;`,
    difficulty: 'HARD',
  },
];

const CODE_CHALLENGES: CodeChallenge[] = [
  {
    id: 'code-two-sum',
    title: 'Two-Sum Linear Search',
    description: 'Given an array of integers and a target value, determine if any two distinct elements add up to exactly the target value in O(n) time.',
    functionName: 'findTargetSum',
    initialCode: `function findTargetSum(nums, target) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(target - n)) return true;
    seen.add(n);
  }
  return false;
}`,
    difficulty: 'EASY',
    testCases: [
      { id: 'tc-1', description: 'Finds complementary pair', input: [[10, 15, 3, 7], 17], expectedOutput: true },
      { id: 'tc-2', description: 'No pair sums to target', input: [[1, 2, 3, 4], 20], expectedOutput: false },
      { id: 'tc-3', description: 'Empty array returns false', input: [[], 5], expectedOutput: false },
    ],
  },
  {
    id: 'code-palindrome',
    title: 'Valid Palindrome Alphanumeric Verifier',
    description: 'Determine whether a string is a palindrome considering only alphanumeric characters and ignoring case.',
    functionName: 'isPalindrome',
    initialCode: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
    difficulty: 'EASY',
    testCases: [
      { id: 'tc-pal-1', description: 'Complex sentence with punctuation', input: ['A man, a plan, a canal: Panama'], expectedOutput: true },
      { id: 'tc-pal-2', description: 'Non-palindrome string', input: ['race a car'], expectedOutput: false },
      { id: 'tc-pal-3', description: 'Whitespace only', input: ['   '], expectedOutput: true },
    ],
  },
  {
    id: 'code-longest-substr',
    title: 'Longest Substring Without Repeating Characters',
    description: 'Find the length of the longest substring without repeating characters using a sliding window in O(n) time.',
    functionName: 'lengthOfLongestSubstring',
    initialCode: `function lengthOfLongestSubstring(s) {
  let maxLen = 0;
  let start = 0;
  const charMap = new Map();
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (charMap.has(char) && charMap.get(char) >= start) {
      start = charMap.get(char) + 1;
    }
    charMap.set(char, i);
    maxLen = Math.max(maxLen, i - start + 1);
  }
  return maxLen;
}`,
    difficulty: 'MEDIUM',
    testCases: [
      { id: 'tc-ls-1', description: 'String with repeating cycle', input: ['abcabcbb'], expectedOutput: 3 },
      { id: 'tc-ls-2', description: 'All identical characters', input: ['bbbbb'], expectedOutput: 1 },
      { id: 'tc-ls-3', description: 'Internal unique substring', input: ['pwwkew'], expectedOutput: 3 },
    ],
  },
  {
    id: 'code-merge-sorted',
    title: 'Merge Two Pre-Sorted Lists',
    description: 'Merge two ascending sorted numeric arrays into a single sorted array in O(n + m) linear time.',
    functionName: 'mergeSorted',
    initialCode: `function mergeSorted(a, b) {
  const result = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      result.push(a[i++]);
    } else {
      result.push(b[j++]);
    }
  }
  return result.concat(a.slice(i)).concat(b.slice(j));
}`,
    difficulty: 'MEDIUM',
    testCases: [
      { id: 'tc-ms-1', description: 'Two interleaved arrays', input: [[1, 3, 5], [2, 4, 6]], expectedOutput: [1, 2, 3, 4, 5, 6] },
      { id: 'tc-ms-2', description: 'One empty array', input: [[], [1, 2]], expectedOutput: [1, 2] },
      { id: 'tc-ms-3', description: 'Single element array', input: [[5], []], expectedOutput: [5] },
    ],
  },
  {
    id: 'code-binary-search',
    title: 'Binary Search on Sorted Array',
    description: 'Find the index of target in a sorted integer array in O(log n) time. Return -1 if target does not exist.',
    functionName: 'binarySearch',
    initialCode: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    difficulty: 'EASY',
    testCases: [
      { id: 'tc-bs-1', description: 'Target present in middle', input: [[-1, 0, 3, 5, 9, 12], 9], expectedOutput: 4 },
      { id: 'tc-bs-2', description: 'Target not in array', input: [[-1, 0, 3, 5, 9, 12], 2], expectedOutput: -1 },
      { id: 'tc-bs-3', description: 'Single element match', input: [[5], 5], expectedOutput: 0 },
    ],
  },
  {
    id: 'code-valid-parens',
    title: 'Valid Parentheses Bracket Verifier',
    description: 'Given a string containing only parentheses characters (), {}, [], determine if the input string is valid.',
    functionName: 'isValid',
    initialCode: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);
    } else {
      if (stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
    difficulty: 'EASY',
    testCases: [
      { id: 'tc-vp-1', description: 'Nested mixed brackets', input: ['({[]})'], expectedOutput: true },
      { id: 'tc-vp-2', description: 'Mismatched closing bracket', input: ['(]'], expectedOutput: false },
      { id: 'tc-vp-3', description: 'Unclosed opening bracket', input: ['(()'], expectedOutput: false },
    ],
  },
  {
    id: 'code-kadane-max-subarray',
    title: "Maximum Subarray Sum (Kadane's Algorithm)",
    description: 'Find the contiguous subarray with the largest sum in O(n) linear time and return its sum.',
    functionName: 'maxSubArray',
    initialCode: `function maxSubArray(nums) {
  if (nums.length === 0) return 0;
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}`,
    difficulty: 'MEDIUM',
    testCases: [
      { id: 'tc-kd-1', description: 'Mixed positive and negative values', input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expectedOutput: 6 },
      { id: 'tc-kd-2', description: 'All negative values returns maximum element', input: [[-1, -2, -3]], expectedOutput: -1 },
      { id: 'tc-kd-3', description: 'Single element array', input: [[10]], expectedOutput: 10 },
    ],
  },
  {
    id: 'code-climb-stairs',
    title: 'Distinct Ways to Climb Stairs (Dynamic Programming)',
    description: 'Count the number of distinct ways to climb n stairs taking 1 or 2 steps at a time in O(n) time and O(1) space.',
    functionName: 'climbStairs',
    initialCode: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}`,
    difficulty: 'EASY',
    testCases: [
      { id: 'tc-cs-1', description: 'Three stairs gives 3 ways', input: [3], expectedOutput: 3 },
      { id: 'tc-cs-2', description: 'Four stairs gives 5 ways', input: [4], expectedOutput: 5 },
      { id: 'tc-cs-3', description: 'Five stairs gives 8 ways', input: [5], expectedOutput: 8 },
    ],
  },
  {
    id: 'code-coin-change',
    title: 'Minimum Coins for Change (Dynamic Programming)',
    description: 'Find the minimum number of coins needed to make up a given amount, or return -1 if impossible.',
    functionName: 'coinChange',
    initialCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (i - c >= 0 && dp[i - c] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - c] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    difficulty: 'MEDIUM',
    testCases: [
      { id: 'tc-cc-1', description: 'Standard coin denomination mix', input: [[1, 2, 5], 11], expectedOutput: 3 },
      { id: 'tc-cc-2', description: 'Impossible amount returns -1', input: [[2], 3], expectedOutput: -1 },
      { id: 'tc-cc-3', description: 'Zero target requires zero coins', input: [[1], 0], expectedOutput: 0 },
      { id: 'tc-cc-4', description: 'Greedy choice fails, DP finds optimal 2 coins', input: [[1, 3, 4], 6], expectedOutput: 2 },
    ],
  },
  {
    id: 'code-prefix-search',
    title: 'Prefix Matching & Lexicographical Ordering',
    description: 'Filter an array of strings by a search prefix and return all matches sorted alphabetically in ascending order.',
    functionName: 'findWordsWithPrefix',
    initialCode: `function findWordsWithPrefix(words, prefix) {
  return words
    .filter((w) => w.startsWith(prefix))
    .sort((a, b) => a.localeCompare(b));
}`,
    difficulty: 'EASY',
    testCases: [
      { id: 'tc-ps-1', description: 'Prefix matching multiple words', input: [['apple', 'app', 'application', 'banana', 'apricot'], 'app'], expectedOutput: ['app', 'apple', 'application'] },
      { id: 'tc-ps-2', description: 'Technical prefix matching', input: [['database', 'data', 'datum', 'disk'], 'dat'], expectedOutput: ['data', 'database', 'datum'] },
      { id: 'tc-ps-3', description: 'Prefix with no matches returns empty array', input: [['cloud', 'server', 'network'], 'xyz'], expectedOutput: [] },
    ],
  },
];

export type SandboxTab =
  | 'SQL'
  | 'CODE'
  | 'VISUALIZER'
  | 'MEMORY'
  | 'DISTRIBUTED'
  | 'KERNEL_NETWORK'
  | 'SYSTEM_DESIGN'
  | 'CONCURRENCY'
  | 'TRADEOFF'
  | 'AI_AGENT';

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<SandboxTab>('SQL');
  const [selectedSqlIndex, setSelectedSqlIndex] = useState(0);
  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);

  // Sync tab with URL query parameter or localStorage on mount (?tab=kernel, ?tab=system-design, ?tab=concurrency, etc.)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab')?.toUpperCase().replace(/-/g, '_');
    if (tabParam) {
      if (tabParam === 'SQL') setActiveTab('SQL');
      else if (tabParam === 'CODE') setActiveTab('CODE');
      else if (tabParam === 'VISUAL' || tabParam === 'VISUALIZER' || tabParam === 'ALGORITHM') setActiveTab('VISUALIZER');
      else if (tabParam === 'MEMORY' || tabParam === 'CACHE') setActiveTab('MEMORY');
      else if (tabParam === 'DISTRIBUTED' || tabParam === 'SYSTEMS') setActiveTab('DISTRIBUTED');
      else if (tabParam === 'KERNEL' || tabParam === 'NETWORK' || tabParam === 'KERNEL_NETWORK') setActiveTab('KERNEL_NETWORK');
      else if (tabParam === 'SYSTEM_DESIGN' || tabParam === 'DESIGN' || tabParam === 'TOPOLOGY') setActiveTab('SYSTEM_DESIGN');
      else if (tabParam === 'CONCURRENCY' || tabParam === 'EVENT_LOOP' || tabParam === 'ASYNC') setActiveTab('CONCURRENCY');
      else if (tabParam === 'TRADEOFF' || tabParam === 'STORAGE' || tabParam === 'CONSISTENCY') setActiveTab('TRADEOFF');
      else if (tabParam === 'AI' || tabParam === 'AI_AGENT' || tabParam === 'LLM' || tabParam === 'AGENT') setActiveTab('AI_AGENT');
    } else {
      try {
        const savedTab = localStorage.getItem('studentsprep_sandbox_active_tab') as SandboxTab | null;
        if (
          savedTab &&
          [
            'SQL',
            'CODE',
            'VISUALIZER',
            'MEMORY',
            'DISTRIBUTED',
            'KERNEL_NETWORK',
            'SYSTEM_DESIGN',
            'CONCURRENCY',
            'TRADEOFF',
            'AI_AGENT',
          ].includes(savedTab)
        ) {
          setActiveTab(savedTab);
        }
      } catch {}
    }
  }, []);

  const handleTabChange = (newTab: SandboxTab) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('studentsprep_sandbox_active_tab', newTab);
      } catch {}
      if (window.history?.replaceState) {
        const url = new URL(window.location.href);
        let tabSlug = 'sql';
        if (newTab === 'CODE') tabSlug = 'code';
        else if (newTab === 'VISUALIZER') tabSlug = 'visual';
        else if (newTab === 'MEMORY') tabSlug = 'memory';
        else if (newTab === 'DISTRIBUTED') tabSlug = 'distributed';
        else if (newTab === 'KERNEL_NETWORK') tabSlug = 'kernel';
        else if (newTab === 'SYSTEM_DESIGN') tabSlug = 'system-design';
        else if (newTab === 'CONCURRENCY') tabSlug = 'concurrency';
        else if (newTab === 'TRADEOFF') tabSlug = 'tradeoff';
        else if (newTab === 'AI_AGENT') tabSlug = 'ai-agent';
        url.searchParams.set('tab', tabSlug);
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  const currentSql = SQL_CHALLENGES[selectedSqlIndex] || SQL_CHALLENGES[0];
  const currentCode = CODE_CHALLENGES[selectedCodeIndex] || CODE_CHALLENGES[0];

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20">
                Applied Technical Lab
              </span>
              <span className="text-[11px] font-mono font-semibold bg-cyan-400/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
                Interactive Code &amp; SQL Studio
              </span>
              <span className="text-[11px] font-mono font-semibold bg-emerald-400/10 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                9 Applied Studios
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              SQL &amp; Code Logic Validation Sandbox
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-mono leading-relaxed">
              Real engineering screening tests applied first-principles execution across 9 specialized laboratories:
              Relational SQL, Algorithmic Code Logic, Visual State Steppers, Memory &amp; Cache Coherence,
              Distributed Systems, OS Kernel Protocols, Multi-Tier System Design Architecture,
              Runtime Concurrency &amp; Event Loops, and Storage Engine &amp; Quorum Consistency Trade-Offs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="secondary" size="md" className="font-mono text-xs">
                ← Back to Career Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="border-b border-white/10">
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => handleTabChange('SQL')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-xl ${
                activeTab === 'SQL'
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-4 h-4 text-lime-400" />
              <span>Relational SQL Query Lab</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('CODE')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-xl ${
                activeTab === 'CODE'
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Code2 className={`w-4 h-4 ${activeTab === 'CODE' ? 'text-lime-400' : 'text-slate-400'}`} />
              <span>Algorithmic Code Logic Lab</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('VISUALIZER')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-xl ${
                activeTab === 'VISUALIZER'
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Eye className={`w-4 h-4 ${activeTab === 'VISUALIZER' ? 'text-lime-400' : 'text-slate-400'}`} />
              <span>Visual Algorithm Stepper</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('MEMORY')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-xl ${
                activeTab === 'MEMORY'
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className={`w-4 h-4 ${activeTab === 'MEMORY' ? 'text-lime-400' : 'text-slate-400'}`} />
              <span>Memory &amp; Cache Hierarchy Lab</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('DISTRIBUTED')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-xl ${
                activeTab === 'DISTRIBUTED'
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Network className={`w-4 h-4 ${activeTab === 'DISTRIBUTED' ? 'text-lime-400' : 'text-slate-400'}`} />
              <span>Distributed Systems &amp; Architecture Lab</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('KERNEL_NETWORK')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-xl ${
                activeTab === 'KERNEL_NETWORK'
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cog className={`w-4 h-4 ${activeTab === 'KERNEL_NETWORK' ? 'text-lime-400' : 'text-slate-400'}`} />
              <span>OS Kernel &amp; Network Protocols Lab</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('SYSTEM_DESIGN')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-xl ${
                activeTab === 'SYSTEM_DESIGN'
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'SYSTEM_DESIGN' ? 'text-lime-400' : 'text-slate-400'}`} />
              <span>System Design Architecture Lab</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('CONCURRENCY')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-xl ${
                activeTab === 'CONCURRENCY'
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'CONCURRENCY' ? 'text-lime-400' : 'text-slate-400'}`} />
              <span>Concurrency &amp; Event Loop Lab</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('TRADEOFF')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-xl ${
                activeTab === 'TRADEOFF'
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Scale className={`w-4 h-4 ${activeTab === 'TRADEOFF' ? 'text-lime-400' : 'text-slate-400'}`} />
              <span>Architecture &amp; Storage Trade-Offs Lab</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('AI_AGENT')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 rounded-t-xl ${
                activeTab === 'AI_AGENT'
                  ? 'border-lime-400 text-lime-300 bg-lime-400/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className={`w-4 h-4 ${activeTab === 'AI_AGENT' ? 'text-lime-400' : 'text-slate-400'}`} />
              <span>AI Agent &amp; LLM Systems Lab</span>
            </button>
          </div>
        </div>

        {/* Challenge Selection Pills for SQL and CODE */}
        {(activeTab === 'SQL' || activeTab === 'CODE') && (
          <div className="bg-[#0a0f1d]/85 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Select Applied Challenge:
              </span>
              <span className="text-xs font-mono text-lime-400 font-medium">
                {activeTab === 'SQL'
                  ? `${SQL_CHALLENGES.length} Relational Exercises`
                  : `${CODE_CHALLENGES.length} Algorithmic Exercises`}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeTab === 'SQL'
                ? SQL_CHALLENGES.map((ch, idx) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedSqlIndex(idx)}
                      className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedSqlIndex === idx
                          ? 'bg-lime-400/15 text-lime-300 border-lime-400/40 shadow-xs ring-1 ring-lime-400/20'
                          : 'bg-[#060b18] text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span>{idx + 1}.</span>
                      <span>{ch.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          ch.difficulty === 'EASY'
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                            : ch.difficulty === 'MEDIUM'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                        }`}
                      >
                        {ch.difficulty}
                      </span>
                    </button>
                  ))
                : CODE_CHALLENGES.map((ch, idx) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedCodeIndex(idx)}
                      className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedCodeIndex === idx
                          ? 'bg-lime-400/15 text-lime-300 border-lime-400/40 shadow-xs ring-1 ring-lime-400/20'
                          : 'bg-[#060b18] text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span>{idx + 1}.</span>
                      <span>{ch.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          ch.difficulty === 'EASY'
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                            : ch.difficulty === 'MEDIUM'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                        }`}
                      >
                        {ch.difficulty}
                      </span>
                    </button>
                  ))}
            </div>
          </div>
        )}

        {/* Active Sandbox Workspace */}
        {activeTab === 'SQL' ? (
          <div key={currentSql.id} className="space-y-6">
            <SqlQuerySandbox
              challengeId={currentSql.id}
              title={currentSql.title}
              taskDescription={currentSql.description}
              initialQuery={currentSql.initialQuery}
              expectedQuery={currentSql.expectedQuery}
            />
          </div>
        ) : activeTab === 'CODE' ? (
          <div key={currentCode.id} className="space-y-6">
            <CodeLogicSandbox
              challengeId={currentCode.id}
              title={currentCode.title}
              problemDescription={currentCode.description}
              functionName={currentCode.functionName}
              initialCode={currentCode.initialCode}
              testCases={currentCode.testCases}
            />
          </div>
        ) : activeTab === 'VISUALIZER' ? (
          <div className="space-y-6">
            <AlgorithmVisualizerSandbox />
          </div>
        ) : activeTab === 'MEMORY' ? (
          <div className="space-y-6">
            <MemoryCacheInspectorSandbox />
          </div>
        ) : activeTab === 'DISTRIBUTED' ? (
          <div className="space-y-6">
            <DistributedSystemsSandbox />
          </div>
        ) : activeTab === 'KERNEL_NETWORK' ? (
          <div className="space-y-6">
            <KernelNetworkSandbox />
          </div>
        ) : activeTab === 'SYSTEM_DESIGN' ? (
          <div className="space-y-6">
            <SystemDesignSandbox />
          </div>
        ) : activeTab === 'CONCURRENCY' ? (
          <div className="space-y-6">
            <ConcurrencyEventLoopSandbox />
          </div>
        ) : activeTab === 'TRADEOFF' ? (
          <div className="space-y-6">
            <ArchitectureTradeoffSandbox />
          </div>
        ) : (
          <div className="space-y-6">
            <AiAgentLabSandbox />
          </div>
        )}
      </div>
    </div>
  );
}
