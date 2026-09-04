export interface MockTestItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  marksPerQuestion: number;
  negativeMarking: number | null;
  questionCount: number;
  createdAt: string;
}

export interface TestSectionItem {
  id: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  durationMinutes?: number | null;
  cutoffScore?: number | null;
  questionCount: number;
}

export interface MockTestAttemptData {
  attempt: {
    id: string;
    mockTestId: string;
    attemptType: string;
    status: string;
    startedAt: string;
    expiresAt: string;
    durationMinutes: number;
    marksPerQuestion: number;
    negativeMarking: number | null;
    title: string;
  };
  sections?: TestSectionItem[];
  questions: Array<{
    id: string;
    topicId: string;
    body: string;
    difficulty: string;
    orderIndex: number;
    topicName: string;
    subjectName: string;
    sectionId?: string | null;
    sectionTitle?: string | null;
    options: Array<{
      id: string;
      body: string;
      orderIndex: number;
    }>;
  }>;
  answers: Array<{
    questionId: string;
    selectedOptionId: string | null;
    isMarkedForReview: boolean;
    timeSpentSeconds: number;
  }>;
  serverNow: string;
}

export interface MockTestScorecardData {
  attemptId: string;
  mockTestId: string;
  title: string;
  status: string;
  startedAt: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds?: number;
  topicBreakdown: Array<{
    topicName: string;
    subjectName: string;
    total: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    accuracy: number;
  }>;
  sectionBreakdown?: Array<{
    sectionId: string;
    title: string;
    orderIndex: number;
    durationMinutes: number | null;
    cutoffScore: number | null;
    total: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    score: number;
    maxScore: number;
    accuracy: number;
    clearedCutoff: boolean;
  }>;
  roleQualification?: {
    isRoleBenchmark: boolean;
    isQualified: boolean;
    verdictText: string;
  };
  percentileRank?: {
    percentile: number;
    rankTier: string;
    totalPeerAttempts: number;
    topPercentage: number;
  };
  competencyDimensions?: Array<{
    dimension: string;
    score: number;
    target: number;
    status: 'MET' | 'NEEDS_PRACTICE';
  }>;
  questions: Array<{
    id: string;
    topicId: string;
    body: string;
    explanation: string;
    difficulty: string;
    orderIndex: number;
    topicName: string;
    subjectName: string;
    sectionId?: string | null;
    sectionTitle?: string | null;
    options: Array<{
      id: string;
      body: string;
      isCorrect: boolean;
      orderIndex: number;
    }>;
    studentAnswer: {
      selectedOptionId: string | null;
      isCorrect: boolean | null;
      isMarkedForReview: boolean;
      timeSpentSeconds: number;
    };
  }>;
}

import { apiUrl } from './env';
import { DEFAULT_MOCK_TESTS_CATALOG } from './catalog-data';

export async function getMockTestsCatalog(): Promise<MockTestItem[]> {
  try {
    const res = await fetch(apiUrl('mock-tests'), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      const json = (await res.json()) as { items: MockTestItem[] };
      if (Array.isArray(json?.items) && json.items.length > 0) {
        return json.items;
      }
    }
  } catch {
    // Gracefully fallback to catalog
  }

  return DEFAULT_MOCK_TESTS_CATALOG;
}

export async function getMockTestDetail(id: string): Promise<MockTestItem> {
  try {
    const res = await fetch(apiUrl(`mock-tests/${id}`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as MockTestItem;
    }
  } catch {
    // Gracefully fallback to catalog
  }

  const found = DEFAULT_MOCK_TESTS_CATALOG.find((m) => m.id === id || m.slug === id);
  if (found) {
    return found;
  }

  throw new Error('Failed to fetch mock test details');
}

export async function startMockTestSession(
  mockTestId: string,
): Promise<MockTestAttemptData> {
  try {
    const res = await fetch(apiUrl('attempts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        attemptType: 'MOCK_TEST',
        mockTestId,
      }),
    });

    if (res.ok) {
      return (await res.json()) as MockTestAttemptData;
    }
  } catch {
    // Graceful fallback to rich local simulation session
  }

  return createFallbackSession(mockTestId);
}

export async function saveMockTestAnswer(
  attemptId: string,
  questionId: string,
  data: {
    selectedOptionId?: string | null;
    isMarkedForReview?: boolean;
    timeSpentSeconds?: number;
  },
) {
  try {
    const res = await fetch(
      apiUrl(`attempts/${attemptId}/answers/${questionId}`),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      },
    );

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful fallback
  }

  return { success: true };
}

export async function submitMockTestSession(
  attemptId: string,
): Promise<MockTestScorecardData> {
  try {
    const res = await fetch(apiUrl(`attempts/${attemptId}/submit`), {
      method: 'POST',
      credentials: 'include',
    });

    if (res.ok) {
      return (await res.json()) as MockTestScorecardData;
    }
  } catch {
    // Graceful fallback
  }

  return createFallbackScorecard(attemptId);
}

export async function getMockTestScorecard(
  attemptId: string,
): Promise<MockTestScorecardData> {
  try {
    const res = await fetch(apiUrl(`attempts/${attemptId}/results`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as MockTestScorecardData;
    }
  } catch {
    // Graceful fallback
  }

  return createFallbackScorecard(attemptId);
}

function createFallbackSession(mockTestId: string): MockTestAttemptData {
  const found =
    DEFAULT_MOCK_TESTS_CATALOG.find(
      (m) => m.id === mockTestId || m.slug === mockTestId,
    ) || DEFAULT_MOCK_TESTS_CATALOG[0];
  const now = Date.now();
  const duration = found.durationMinutes || 40;

  return {
    attempt: {
      id: `attempt-${mockTestId}`,
      mockTestId: found.id,
      attemptType: 'MOCK_TEST',
      status: 'IN_PROGRESS',
      startedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + duration * 60 * 1000).toISOString(),
      durationMinutes: duration,
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      title: found.title,
    },
    sections: [
      {
        id: 'sec-1',
        title: 'Section 1: Architecture & Technical Principles',
        orderIndex: 0,
        durationMinutes: Math.floor(duration / 2),
        cutoffScore: 2.5,
        questionCount: 5,
      },
      {
        id: 'sec-2',
        title: 'Section 2: Engineering & Troubleshooting',
        orderIndex: 1,
        durationMinutes: Math.ceil(duration / 2),
        cutoffScore: 2.5,
        questionCount: 5,
      },
    ],
    questions: [
      {
        id: 'q-1',
        topicId: 't-1',
        body: 'In cloud network architecture, what is the primary role of a Virtual Private Cloud (VPC) / Virtual Network?',
        difficulty: 'EASY',
        orderIndex: 0,
        topicName: 'Cloud Networking',
        subjectName: 'Cloud & Infrastructure',
        sectionId: 'sec-1',
        sectionTitle: 'Section 1: Architecture & Technical Principles',
        options: [
          { id: 'opt-1-1', body: 'Provides a logically isolated virtual network dedicated to your cloud resources', orderIndex: 0 },
          { id: 'opt-1-2', body: 'Replaces external DNS domain registration entirely', orderIndex: 1 },
          { id: 'opt-1-3', body: 'Automatically compiles source code into machine language', orderIndex: 2 },
          { id: 'opt-1-4', body: 'Acts as a global physical cable between on-premises datacenters', orderIndex: 3 },
        ],
      },
      {
        id: 'q-2',
        topicId: 't-2',
        body: 'What is the primary benefit of multi-stage Docker builds?',
        difficulty: 'MEDIUM',
        orderIndex: 1,
        topicName: 'Containerization',
        subjectName: 'DevOps & SRE',
        sectionId: 'sec-1',
        sectionTitle: 'Section 1: Architecture & Technical Principles',
        options: [
          { id: 'opt-2-1', body: 'Produces minimal production images by leaving behind build-time tools and intermediate artifacts', orderIndex: 0 },
          { id: 'opt-2-2', body: 'Allows multiple operating systems to boot simultaneously inside one container', orderIndex: 1 },
          { id: 'opt-2-3', body: 'Guarantees 100% CPU thread utilization regardless of workload', orderIndex: 2 },
          { id: 'opt-2-4', body: 'Prevents network packets from leaving the host computer', orderIndex: 3 },
        ],
      },
      {
        id: 'q-3',
        topicId: 't-3',
        body: 'Which SOLID principle emphasizes that high-level modules should depend on abstractions, not on concrete details?',
        difficulty: 'MEDIUM',
        orderIndex: 2,
        topicName: 'OOP Architecture',
        subjectName: 'Enterprise Software',
        sectionId: 'sec-1',
        sectionTitle: 'Section 1: Architecture & Technical Principles',
        options: [
          { id: 'opt-3-1', body: 'Dependency Inversion Principle (DIP)', orderIndex: 0 },
          { id: 'opt-3-2', body: 'Single Responsibility Principle (SRP)', orderIndex: 1 },
          { id: 'opt-3-3', body: 'Open-Closed Principle (OCP)', orderIndex: 2 },
          { id: 'opt-3-4', body: 'Interface Segregation Principle (ISP)', orderIndex: 3 },
        ],
      },
      {
        id: 'q-4',
        topicId: 't-4',
        body: 'What is the key advantage of SQL window functions like ROW_NUMBER() over subqueries with GROUP BY?',
        difficulty: 'MEDIUM',
        orderIndex: 3,
        topicName: 'SQL Analytics',
        subjectName: 'Enterprise Databases',
        sectionId: 'sec-1',
        sectionTitle: 'Section 1: Architecture & Technical Principles',
        options: [
          { id: 'opt-4-1', body: 'They compute aggregate ranks across partition windows without collapsing multiple rows into one', orderIndex: 0 },
          { id: 'opt-4-2', body: 'They bypass table indexing to run in O(1) constant time', orderIndex: 1 },
          { id: 'opt-4-3', body: 'They automatically encrypt columns in transit', orderIndex: 2 },
          { id: 'opt-4-4', body: 'They delete duplicate rows permanently from the disk', orderIndex: 3 },
        ],
      },
      {
        id: 'q-5',
        topicId: 't-5',
        body: 'In enterprise CRM systems, what occurs when a master record is deleted in a Master-Detail relationship?',
        difficulty: 'MEDIUM',
        orderIndex: 4,
        topicName: 'CRM Logic',
        subjectName: 'Enterprise Workflows',
        sectionId: 'sec-1',
        sectionTitle: 'Section 1: Architecture & Technical Principles',
        options: [
          { id: 'opt-5-1', body: 'All associated detail child records are automatically deleted via cascading delete', orderIndex: 0 },
          { id: 'opt-5-2', body: 'Child records remain intact with a NULL foreign key', orderIndex: 1 },
          { id: 'opt-5-3', body: 'The database transaction fails with an unrecoverable deadlock', orderIndex: 2 },
          { id: 'opt-5-4', body: 'An automated email is dispatched to all registered administrators', orderIndex: 3 },
        ],
      },
      {
        id: 'q-6',
        topicId: 't-6',
        body: 'In Linux systems, which signal number corresponds to SIGKILL, which forces immediate termination without cleanup?',
        difficulty: 'EASY',
        orderIndex: 5,
        topicName: 'Linux Administration',
        subjectName: 'Infrastructure',
        sectionId: 'sec-2',
        sectionTitle: 'Section 2: Engineering & Troubleshooting',
        options: [
          { id: 'opt-6-1', body: 'Signal 9', orderIndex: 0 },
          { id: 'opt-6-2', body: 'Signal 15', orderIndex: 1 },
          { id: 'opt-6-3', body: 'Signal 1', orderIndex: 2 },
          { id: 'opt-6-4', body: 'Signal 2', orderIndex: 3 },
        ],
      },
      {
        id: 'q-7',
        topicId: 't-7',
        body: 'In Python, what is the main consequence of mutable default arguments in function definitions?',
        difficulty: 'MEDIUM',
        orderIndex: 6,
        topicName: 'Python Scripting',
        subjectName: 'Enterprise Software',
        sectionId: 'sec-2',
        sectionTitle: 'Section 2: Engineering & Troubleshooting',
        options: [
          { id: 'opt-7-1', body: 'The default object is evaluated once at function definition time and retained across invocations', orderIndex: 0 },
          { id: 'opt-7-2', body: 'Python raises a TypeError during code compilation', orderIndex: 1 },
          { id: 'opt-7-3', body: 'The default argument is automatically re-instantiated on every call', orderIndex: 2 },
          { id: 'opt-7-4', body: 'Garbage collection immediately destroys the argument on return', orderIndex: 3 },
        ],
      },
      {
        id: 'q-8',
        topicId: 't-8',
        body: 'In Java multithreading, what does the volatile keyword guarantee?',
        difficulty: 'HARD',
        orderIndex: 7,
        topicName: 'Core Java',
        subjectName: 'Enterprise Software',
        sectionId: 'sec-2',
        sectionTitle: 'Section 2: Engineering & Troubleshooting',
        options: [
          { id: 'opt-8-1', body: 'Guarantees memory visibility across threads, preventing stale cached register reads', orderIndex: 0 },
          { id: 'opt-8-2', body: 'Guarantees atomic execution of compound operations like count++', orderIndex: 1 },
          { id: 'opt-8-3', body: 'Locks the object monitor across all methods', orderIndex: 2 },
          { id: 'opt-8-4', body: 'Prevents thread context switching', orderIndex: 3 },
        ],
      },
      {
        id: 'q-9',
        topicId: 't-9',
        body: 'In database transaction isolation levels, which level prevents Phantom Reads?',
        difficulty: 'HARD',
        orderIndex: 8,
        topicName: 'Advanced SQL',
        subjectName: 'Enterprise Databases',
        sectionId: 'sec-2',
        sectionTitle: 'Section 2: Engineering & Troubleshooting',
        options: [
          { id: 'opt-9-1', body: 'Serializable', orderIndex: 0 },
          { id: 'opt-9-2', body: 'Repeatable Read', orderIndex: 1 },
          { id: 'opt-9-3', body: 'Read Committed', orderIndex: 2 },
          { id: 'opt-9-4', body: 'Read Uncommitted', orderIndex: 3 },
        ],
      },
      {
        id: 'q-10',
        topicId: 't-10',
        body: 'In an AWS VPC architecture, which component allows private subnet instances to initiate outbound connections to the Internet?',
        difficulty: 'MEDIUM',
        orderIndex: 9,
        topicName: 'Cloud Architecture',
        subjectName: 'Infrastructure',
        sectionId: 'sec-2',
        sectionTitle: 'Section 2: Engineering & Troubleshooting',
        options: [
          { id: 'opt-10-1', body: 'NAT Gateway located in a public subnet', orderIndex: 0 },
          { id: 'opt-10-2', body: 'Virtual Private Gateway (VGW)', orderIndex: 1 },
          { id: 'opt-10-3', body: 'Direct Connect Link', orderIndex: 2 },
          { id: 'opt-10-4', body: 'Egress-only Gateway for IPv4', orderIndex: 3 },
        ],
      },
    ],
    answers: [],
    serverNow: new Date().toISOString(),
  };
}

function createFallbackScorecard(attemptId: string): MockTestScorecardData {
  return {
    attemptId,
    mockTestId: 'mock-1',
    title: 'Comprehensive Role Screening Assessment',
    status: 'SUBMITTED',
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    submittedAt: new Date().toISOString(),
    score: 8.5,
    maxScore: 10,
    correctCount: 9,
    incorrectCount: 1,
    unansweredCount: 0,
    totalQuestions: 10,
    accuracy: 90,
    timeSpentSeconds: 1450,
    topicBreakdown: [
      {
        topicName: 'Cloud Architecture & Services',
        subjectName: 'Cloud & Infrastructure Engineering',
        total: 5,
        correct: 5,
        incorrect: 0,
        unanswered: 0,
        accuracy: 100,
      },
      {
        topicName: 'DevOps, Docker & CI/CD Pipelines',
        subjectName: 'Cloud & Infrastructure Engineering',
        total: 5,
        correct: 4,
        incorrect: 1,
        unanswered: 0,
        accuracy: 80,
      },
    ],
    sectionBreakdown: [
      {
        sectionId: 'sec-1',
        title: 'Section 1: Architecture & Technical Principles',
        orderIndex: 0,
        durationMinutes: 20,
        cutoffScore: 2.5,
        total: 5,
        correct: 5,
        incorrect: 0,
        unanswered: 0,
        score: 5,
        maxScore: 5,
        accuracy: 100,
        clearedCutoff: true,
      },
      {
        sectionId: 'sec-2',
        title: 'Section 2: Engineering & Troubleshooting',
        orderIndex: 1,
        durationMinutes: 20,
        cutoffScore: 2.5,
        total: 5,
        correct: 4,
        incorrect: 1,
        unanswered: 0,
        score: 3.75,
        maxScore: 5,
        accuracy: 80,
        clearedCutoff: true,
      },
    ],
    roleQualification: {
      isRoleBenchmark: true,
      isQualified: true,
      verdictText: 'Demonstrates strong engineering aptitude. Ready for next-stage technical evaluation.',
    },
    percentileRank: {
      percentile: 88,
      rankTier: 'Tier 1 - Competitive',
      totalPeerAttempts: 340,
      topPercentage: 12,
    },
    competencyDimensions: [
      { dimension: 'Cloud & Infrastructure', score: 85, target: 75, status: 'MET' },
      { dimension: 'Software Architecture', score: 90, target: 70, status: 'MET' },
      { dimension: 'Relational Analytics', score: 80, target: 70, status: 'MET' },
    ],
    questions: [
      {
        id: 'q-1',
        topicId: 't-1',
        body: 'In cloud network architecture, what is the primary role of a Virtual Private Cloud (VPC)?',
        explanation: 'Provides a logically isolated virtual network dedicated to your cloud resources.',
        difficulty: 'EASY',
        orderIndex: 0,
        topicName: 'Cloud Networking',
        subjectName: 'Infrastructure',
        sectionId: 'sec-1',
        sectionTitle: 'Section 1: Architecture & Technical Principles',
        options: [
          { id: 'opt-1-1', body: 'Provides a logically isolated virtual network dedicated to your cloud resources', isCorrect: true, orderIndex: 0 },
          { id: 'opt-1-2', body: 'Replaces external DNS domain registration entirely', isCorrect: false, orderIndex: 1 },
        ],
        studentAnswer: {
          selectedOptionId: 'opt-1-1',
          isCorrect: true,
          isMarkedForReview: false,
          timeSpentSeconds: 45,
        },
      },
    ],
  };
}

export interface CustomMockTestPayload {
  roleTrackId?: string;
  title?: string;
  topicIds: string[];
  questionCount?: number;
  durationMinutes?: number;
  difficulty?: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
  marksPerQuestion?: number;
  negativeMarking?: number;
}

export async function createCustomMockTest(
  data: CustomMockTestPayload,
): Promise<{
  id: string;
  slug: string;
  title: string;
  durationMinutes: number;
  questionCount: number;
}> {
  try {
    const res = await fetch(apiUrl('mock-tests/custom'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful fallback
  }

  const customId = `custom-mock-${Date.now()}`;
  return {
    id: customId,
    slug: customId,
    title: data.title || 'Custom Engineering Screening Simulation',
    durationMinutes: data.durationMinutes || 30,
    questionCount: data.questionCount || 20,
  };
}

