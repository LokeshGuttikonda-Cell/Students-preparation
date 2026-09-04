'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SqlQuerySandbox } from '../../../components/sandbox/SqlQuerySandbox';
import { CodeLogicSandbox } from '../../../components/sandbox/CodeLogicSandbox';
import { Button } from '../../../components/ui/Button';

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
];

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<'SQL' | 'CODE'>('SQL');
  const [selectedSqlIndex, setSelectedSqlIndex] = useState(0);
  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);

  const currentSql = SQL_CHALLENGES[selectedSqlIndex] || SQL_CHALLENGES[0];
  const currentCode = CODE_CHALLENGES[selectedCodeIndex] || CODE_CHALLENGES[0];

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                Applied Technical Lab
              </span>
              <span className="text-[11px] font-semibold bg-primary-50 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
                Interactive Code &amp; SQL Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">
              SQL &amp; Code Logic Validation Sandbox
            </h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Real engineering screening tests your applied execution. Practice running SQL queries
              and algorithmic code against live test scenarios with sub-millisecond in-memory verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="secondary" size="md">
                ← Back to Career Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-border gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('SQL')}
            className={`min-h-[44px] px-5 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'SQL'
                ? 'border-primary-700 text-primary-800'
                : 'border-transparent text-text-muted hover:text-text hover:border-border'
            }`}
          >
            <span>🗄️</span>
            <span>Relational SQL Query Lab</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CODE')}
            className={`min-h-[44px] px-5 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'CODE'
                ? 'border-primary-700 text-primary-800'
                : 'border-transparent text-text-muted hover:text-text hover:border-border'
            }`}
          >
            <span>💻</span>
            <span>Algorithmic Code Logic Lab</span>
          </button>
        </div>

        {/* Challenge Selection Pills */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Select Applied Challenge:
            </span>
            <span className="text-xs text-primary-700 font-medium">
              {activeTab === 'SQL' ? `${SQL_CHALLENGES.length} Relational Exercises` : `${CODE_CHALLENGES.length} Algorithmic Exercises`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeTab === 'SQL'
              ? SQL_CHALLENGES.map((ch, idx) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedSqlIndex(idx)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedSqlIndex === idx
                        ? 'bg-primary-50 text-primary-900 border-primary-400 shadow-xs'
                        : 'bg-canvas text-text-muted border-border hover:text-text hover:border-border-hover'
                    }`}
                  >
                    <span>{idx + 1}.</span>
                    <span>{ch.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      ch.difficulty === 'EASY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ch.difficulty === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {ch.difficulty}
                    </span>
                  </button>
                ))
              : CODE_CHALLENGES.map((ch, idx) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedCodeIndex(idx)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedCodeIndex === idx
                        ? 'bg-primary-50 text-primary-900 border-primary-400 shadow-xs'
                        : 'bg-canvas text-text-muted border-border hover:text-text hover:border-border-hover'
                    }`}
                  >
                    <span>{idx + 1}.</span>
                    <span>{ch.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      ch.difficulty === 'EASY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ch.difficulty === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {ch.difficulty}
                    </span>
                  </button>
                ))}
          </div>
        </div>

        {/* Active Sandbox Workspace */}
        {activeTab === 'SQL' ? (
          <div key={currentSql.id} className="space-y-6">
            <SqlQuerySandbox
              title={currentSql.title}
              taskDescription={currentSql.description}
              initialQuery={currentSql.initialQuery}
              expectedQuery={currentSql.expectedQuery}
            />
          </div>
        ) : (
          <div key={currentCode.id} className="space-y-6">
            <CodeLogicSandbox
              title={currentCode.title}
              problemDescription={currentCode.description}
              functionName={currentCode.functionName}
              initialCode={currentCode.initialCode}
              testCases={currentCode.testCases}
            />
          </div>
        )}
      </div>
    </div>
  );
}
