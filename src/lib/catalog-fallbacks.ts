import type {
  WeakAreaAnalyticsData,
  PaginatedAttempts,
  RoleReadinessData,
} from './analytics-client';
import type {
  CohortReadinessResponse,
  CohortSummaryItem,
} from './cohort-client';
import type {
  RoleMilestoneItem,
  CredentialItem,
  PublicVerificationItem,
} from './credentials-client';
import type {
  InterviewSessionData,
  InterviewMessageData,
  PaginatedInterviews,
} from './interview-client';
import type {
  PracticeQuestion,
  PracticeAttemptData,
  AnswerFeedback,
} from './practice-client';
import {
  DEFAULT_ROLES_CATALOG,
  DEFAULT_MOCK_TESTS_CATALOG,
  DEFAULT_PRACTICE_CATALOG,
} from './catalog-data';

// ==========================================
// 1. Topic Questions Catalog (All Topics)
// ==========================================
export interface RawTopicQuestion {
  id: string;
  topicId: string;
  topicSlug: string;
  body: string;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: Array<{ id: string; body: string; orderIndex: number }>;
  correctOptionId: string;
}

export const FALLBACK_TOPIC_QUESTIONS: RawTopicQuestion[] = [
  // AWS Cloud Architecture
  {
    id: 'pq-aws-1',
    topicId: 'topic-aws-arch',
    topicSlug: 'aws-cloud-architecture',
    body: 'In cloud networking, what is the key difference between a Public Subnet and a Private Subnet in a Virtual Private Cloud (VPC)?',
    explanation: 'A public subnet has a route table entry pointing traffic to an Internet Gateway (0.0.0.0/0 -> igw), whereas a private subnet routes outbound traffic only via a NAT Gateway without direct inbound internet access.',
    difficulty: 'EASY',
    options: [
      { id: 'opt-aws-1a', body: 'A public subnet routes 0.0.0.0/0 to an Internet Gateway; a private subnet routes via a NAT Gateway', orderIndex: 0 },
      { id: 'opt-aws-1b', body: 'A public subnet uses IPv6 while a private subnet is restricted to IPv4 only', orderIndex: 1 },
      { id: 'opt-aws-1c', body: 'Private subnets can only contain database compute instances with encrypted disks', orderIndex: 2 },
      { id: 'opt-aws-1d', body: 'Public subnets bypass Network Access Control Lists (NACLs)', orderIndex: 3 },
    ],
    correctOptionId: 'opt-aws-1a',
  },
  {
    id: 'pq-aws-2',
    topicId: 'topic-aws-arch',
    topicSlug: 'aws-cloud-architecture',
    body: 'Which cloud storage tier guarantees strong read-after-write consistency for PUT and DELETE operations of object keys?',
    explanation: 'Modern cloud object storage engines (such as AWS S3) provide strong read-after-write consistency automatically for all PUT and DELETE operations without performance penalties.',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt-aws-2a', body: 'Cloud Object Storage (e.g. S3 Standard)', orderIndex: 0 },
      { id: 'opt-aws-2b', body: 'Cold Archive Tape Vaults', orderIndex: 1 },
      { id: 'opt-aws-2c', body: 'Local Ephemeral Instance Store only', orderIndex: 2 },
      { id: 'opt-aws-2d', body: 'Distributed Memory Cache with TTL=0', orderIndex: 3 },
    ],
    correctOptionId: 'opt-aws-2a',
  },
  // Azure Systems
  {
    id: 'pq-az-1',
    topicId: 'topic-azure-sys',
    topicSlug: 'azure-cloud-systems',
    body: 'In Azure networking, which component enforces stateful traffic filtering at the subnet and network interface card (NIC) layer?',
    explanation: 'Network Security Groups (NSGs) contain stateful security rules that allow or deny inbound or outbound network traffic to several types of Azure resources.',
    difficulty: 'EASY',
    options: [
      { id: 'opt-az-1a', body: 'Network Security Group (NSG)', orderIndex: 0 },
      { id: 'opt-az-1b', body: 'Traffic Manager DNS Profile', orderIndex: 1 },
      { id: 'opt-az-1c', body: 'Azure Bastion Host', orderIndex: 2 },
      { id: 'opt-az-1d', body: 'Virtual WAN Hub', orderIndex: 3 },
    ],
    correctOptionId: 'opt-az-1a',
  },
  // DevOps & CI/CD
  {
    id: 'pq-dev-1',
    topicId: 'topic-devops',
    topicSlug: 'devops-docker-cicd',
    body: 'Why are multi-stage Docker builds recommended in production continuous delivery pipelines?',
    explanation: 'Multi-stage builds separate the build environment (compilers, build tools, dev dependencies) from the final runtime image, resulting in dramatically smaller container size and a significantly reduced attack surface.',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt-dev-1a', body: 'They isolate build dependencies from runtime artifacts, producing minimal, secure production containers', orderIndex: 0 },
      { id: 'opt-dev-1b', body: 'They permit running multiple operating systems inside a single Linux namespace simultaneously', orderIndex: 1 },
      { id: 'opt-dev-1c', body: 'They eliminate the need for container registry authentication', orderIndex: 2 },
      { id: 'opt-dev-1d', body: 'They automatically convert interpreted code into native assembly binaries', orderIndex: 3 },
    ],
    correctOptionId: 'opt-dev-1a',
  },
  {
    id: 'pq-dev-2',
    topicId: 'topic-devops',
    topicSlug: 'devops-docker-cicd',
    body: 'In Kubernetes, what is the role of a Readiness Probe on a Pod?',
    explanation: 'A readiness probe determines whether a container is ready to accept incoming network traffic. If it fails, the container is removed from service endpoints and receives no requests until it passes.',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt-dev-2a', body: 'Determines if a container is ready to accept incoming requests from Services', orderIndex: 0 },
      { id: 'opt-dev-2b', body: 'Restarts crashed containers automatically when memory limit is exceeded', orderIndex: 1 },
      { id: 'opt-dev-2c', body: 'Scans the filesystem for vulnerabilities prior to node scheduling', orderIndex: 2 },
      { id: 'opt-dev-2d', body: 'Provisions persistent volumes on cloud storage controllers', orderIndex: 3 },
    ],
    correctOptionId: 'opt-dev-2a',
  },
  // Linux & Shell Scripting
  {
    id: 'pq-lin-1',
    topicId: 'topic-linux',
    topicSlug: 'linux-shell-scripting',
    body: 'In POSIX Linux administration, what is the key difference between SIGTERM (15) and SIGKILL (9)?',
    explanation: 'SIGTERM can be caught, handled, or blocked by the application process to perform graceful resource cleanup. SIGKILL is handled directly by the kernel and terminates the process immediately without cleanup.',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt-lin-1a', body: 'SIGTERM requests graceful cleanup and can be intercepted; SIGKILL forces kernel termination unconditionally', orderIndex: 0 },
      { id: 'opt-lin-1b', body: 'SIGTERM deletes log files; SIGKILL saves memory coredumps to /tmp', orderIndex: 1 },
      { id: 'opt-lin-1c', body: 'SIGTERM applies only to root users; SIGKILL applies to unprivileged accounts', orderIndex: 2 },
      { id: 'opt-lin-1d', body: 'SIGTERM terminates child threads; SIGKILL preserves parent sockets', orderIndex: 3 },
    ],
    correctOptionId: 'opt-lin-1a',
  },
  // Core Java & Multithreading
  {
    id: 'pq-java-1',
    topicId: 'topic-core-java',
    topicSlug: 'core-java-multithreading',
    body: 'In Java multithreading, what memory semantics does the "volatile" keyword guarantee?',
    explanation: 'The volatile keyword in Java guarantees visibility of changes to variables across threads by preventing CPU register caching and preventing instruction reordering across the volatile read/write barrier.',
    difficulty: 'HARD',
    options: [
      { id: 'opt-java-1a', body: 'Guarantees variable visibility across threads and prevents instruction reordering', orderIndex: 0 },
      { id: 'opt-java-1b', body: 'Provides mutual exclusion lock like a synchronized block', orderIndex: 1 },
      { id: 'opt-java-1c', body: 'Forces variables to be allocated strictly on the stack rather than the heap', orderIndex: 2 },
      { id: 'opt-java-1d', body: 'Prevents garbage collection from cleaning up the referenced instance', orderIndex: 3 },
    ],
    correctOptionId: 'opt-java-1a',
  },
  // Python Scripting & OOP
  {
    id: 'pq-py-1',
    topicId: 'topic-python',
    topicSlug: 'python-programming-scripting',
    body: 'What is the primary danger of using a mutable default argument like `def append_to(item, target=[])` in Python?',
    explanation: 'In Python, default arguments are evaluated once when the function definition is executed, not each time the function is called. If modified, the same mutated list object persists across subsequent calls.',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt-py-1a', body: 'The default list is instantiated once at function definition and shared across subsequent calls', orderIndex: 0 },
      { id: 'opt-py-1b', body: 'Python raises an unhandled SyntaxError at bytecode compilation time', orderIndex: 1 },
      { id: 'opt-py-1c', body: 'The Global Interpreter Lock deadlocks when multiple threads call the function', orderIndex: 2 },
      { id: 'opt-py-1d', body: 'It causes variable shadowing within nested closures', orderIndex: 3 },
    ],
    correctOptionId: 'opt-py-1a',
  },
  // Full Stack JavaScript
  {
    id: 'pq-fs-1',
    topicId: 'topic-fullstack-js',
    topicSlug: 'fullstack-javascript-apis',
    body: 'In the Node.js / JavaScript Event Loop, which queue executes first after the currently executing script completes?',
    explanation: 'Microtasks (Promise callbacks and queueMicrotask) have strict priority over Macrotasks (setTimeout, setInterval, setImmediate) and drain completely before the event loop advances.',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt-fs-1a', body: 'Microtask queue (Promise callbacks & process.nextTick)', orderIndex: 0 },
      { id: 'opt-fs-1b', body: 'Timers queue (setTimeout / setInterval)', orderIndex: 1 },
      { id: 'opt-fs-1c', body: 'Check phase queue (setImmediate)', orderIndex: 2 },
      { id: 'opt-fs-1d', body: 'Poll I/O callback phase', orderIndex: 3 },
    ],
    correctOptionId: 'opt-fs-1a',
  },
  // Advanced SQL
  {
    id: 'pq-sql-1',
    topicId: 'topic-adv-sql',
    topicSlug: 'advanced-sql-optimization',
    body: 'What is the key performance benefit of creating a Composite Covering Index (INDEX (dept_id, salary) INCLUDE (name)) in relational databases?',
    explanation: 'A covering index allows the query planner to satisfy the entire SELECT query directly from the index B-tree without performing expensive table lookups (heap fetches) for row pages.',
    difficulty: 'HARD',
    options: [
      { id: 'opt-sql-1a', body: 'Allows the query optimizer to resolve the query directly from the index without table heap lookups', orderIndex: 0 },
      { id: 'opt-sql-1b', body: 'Automatically locks the table in READ COMMITTED snapshot mode', orderIndex: 1 },
      { id: 'opt-sql-1c', body: 'Compresses string data into binary integers in memory', orderIndex: 2 },
      { id: 'opt-sql-1d', body: 'Eliminates all foreign key constraints during concurrent writes', orderIndex: 3 },
    ],
    correctOptionId: 'opt-sql-1a',
  },
  // CRM Workflows
  {
    id: 'pq-crm-1',
    topicId: 'topic-crm-work',
    topicSlug: 'crm-workflow-logic',
    body: 'In enterprise CRM data architecture, what happens when a Master record is deleted in a Master-Detail relationship?',
    explanation: 'A Master-Detail relationship tightly links child records to a parent record. When the master is deleted, all detail child records are cascaded and deleted automatically.',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt-crm-1a', body: 'All associated detail child records are cascaded and deleted automatically', orderIndex: 0 },
      { id: 'opt-crm-1b', body: 'Child records remain intact with a NULL foreign key reference', orderIndex: 1 },
      { id: 'opt-crm-1c', body: 'The database rejects deletion until an administrator detaches every child record', orderIndex: 2 },
      { id: 'opt-crm-1d', body: 'Child records are moved to an archive queue without schema deletion', orderIndex: 3 },
    ],
    correctOptionId: 'opt-crm-1a',
  },
  // Data Structures
  {
    id: 'pq-ds-1',
    topicId: 'topic-ds',
    topicSlug: 'data-structures-basics',
    body: 'What is the average-case and worst-case time complexity of lookup in a balanced binary search tree (such as an AVL or Red-Black Tree)?',
    explanation: 'A balanced BST maintains height proportional to log(n). Therefore both average and worst-case lookup time is strictly O(log n).',
    difficulty: 'EASY',
    options: [
      { id: 'opt-ds-1a', body: 'Average: O(log n), Worst: O(log n)', orderIndex: 0 },
      { id: 'opt-ds-1b', body: 'Average: O(1), Worst: O(n)', orderIndex: 1 },
      { id: 'opt-ds-1c', body: 'Average: O(log n), Worst: O(n)', orderIndex: 2 },
      { id: 'opt-ds-1d', body: 'Average: O(n), Worst: O(n log n)', orderIndex: 3 },
    ],
    correctOptionId: 'opt-ds-1a',
  },
  // Quantitative Aptitude: Number Systems
  {
    id: 'pq-num-1',
    topicId: 'topic-numbers',
    topicSlug: 'number-systems',
    body: 'What is the remainder when 2^10 is divided by 7?',
    explanation: '2^1=2, 2^2=4, 2^3=1 (mod 7). The powers of 2 modulo 7 cycle with period 3. Since 10 = 3*3 + 1, we have 2^10 ≡ 2^1 ≡ 2 (mod 7).',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt-num-1a', body: '2', orderIndex: 0 },
      { id: 'opt-num-1b', body: '1', orderIndex: 1 },
      { id: 'opt-num-1c', body: '3', orderIndex: 2 },
      { id: 'opt-num-1d', body: '4', orderIndex: 3 },
    ],
    correctOptionId: 'opt-num-1a',
  },
  // Logical Reasoning: Syllogisms
  {
    id: 'pq-syl-1',
    topicId: 'topic-syllogisms',
    topicSlug: 'syllogisms',
    body: 'Statements: "All clouds are servers. Some servers are databases." Which conclusion logically follows?',
    explanation: 'From "All clouds are servers" and "Some servers are databases", the overlap between clouds and databases is not guaranteed. Therefore "Some databases may be clouds" is possible, but not deterministically guaranteed.',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt-syl-1a', body: 'Neither conclusion is deterministically guaranteed without further premise', orderIndex: 0 },
      { id: 'opt-syl-1b', body: 'All clouds are definitely databases', orderIndex: 1 },
      { id: 'opt-syl-1c', body: 'No databases are servers', orderIndex: 2 },
      { id: 'opt-syl-1d', body: 'All servers are clouds', orderIndex: 3 },
    ],
    correctOptionId: 'opt-syl-1a',
  },
];

export function getFallbackQuestionsForTopic(topicIdOrSlug: string): PracticeQuestion[] {
  const matched = FALLBACK_TOPIC_QUESTIONS.filter(
    (q) => q.topicId === topicIdOrSlug || q.topicSlug === topicIdOrSlug,
  );

  const pool = matched.length > 0 ? matched : FALLBACK_TOPIC_QUESTIONS.slice(0, 3);

  return pool.map((q) => ({
    id: q.id,
    topicId: q.topicId,
    body: q.body,
    difficulty: q.difficulty,
    explanation: q.explanation,
    options: q.options.map((o) => ({
      id: o.id,
      body: o.body,
      orderIndex: o.orderIndex,
    })),
  }));
}

export function createFallbackPracticeSession(topicId: string): PracticeAttemptData {
  const topicMatch = DEFAULT_PRACTICE_CATALOG.flatMap((s) => s.topics).find(
    (t) => t.id === topicId || t.slug === topicId,
  );
  const topicName = topicMatch ? topicMatch.name : 'Technical Domain Practice';
  const questions = getFallbackQuestionsForTopic(topicId);

  return {
    attempt: {
      id: `practice-${topicId}-${Date.now()}`,
      topicId,
      attemptType: 'PRACTICE',
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      topicName,
      subjectName: 'Engineering Competency Curriculum',
    },
    questions,
    answers: [],
  };
}

export function evaluateFallbackPracticeAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
): AnswerFeedback {
  const found = FALLBACK_TOPIC_QUESTIONS.find((q) => q.id === questionId);
  const isCorrect = found ? found.correctOptionId === selectedOptionId : true;
  const correctOptionId = found ? found.correctOptionId : selectedOptionId;
  const explanation = found
    ? found.explanation
    : 'Evaluated against standard engineering design principles. Ensure correct option alignment and review the module curriculum.';

  return {
    isCorrect,
    correctOptionId,
    explanation,
    selectedOptionId,
  };
}

// ==========================================
// 2. Dashboard Analytics & KPIs
// ==========================================
export const DEFAULT_ANALYTICS_DATA: WeakAreaAnalyticsData = {
  kpis: {
    totalTestsCompleted: 14,
    totalQuestionsAnswered: 96,
    overallAccuracy: 84,
  },
  weakAreas: [
    {
      topicId: 'topic-adv-sql',
      topicName: 'Advanced SQL & Query Optimization',
      topicSlug: 'advanced-sql-optimization',
      subjectId: 'sub-ent-db',
      subjectName: 'Enterprise Databases & Workflows',
      totalAttempted: 18,
      correctCount: 9,
      incorrectCount: 9,
      accuracy: 50,
      needsRevision: true,
    },
    {
      topicId: 'topic-devops',
      topicName: 'DevOps, Docker & CI/CD Pipelines',
      topicSlug: 'devops-docker-cicd',
      subjectId: 'sub-cloud',
      subjectName: 'Cloud & Infrastructure Engineering',
      totalAttempted: 24,
      correctCount: 14,
      incorrectCount: 10,
      accuracy: 58,
      needsRevision: true,
    },
    {
      topicId: 'topic-core-java',
      topicName: 'Core Java & Multithreading',
      topicSlug: 'core-java-multithreading',
      subjectId: 'sub-ent-dev',
      subjectName: 'Enterprise Software Development',
      totalAttempted: 26,
      correctCount: 20,
      incorrectCount: 6,
      accuracy: 77,
      needsRevision: false,
    },
    {
      topicId: 'topic-aws-arch',
      topicName: 'AWS Cloud Architecture & Services',
      topicSlug: 'aws-cloud-architecture',
      subjectId: 'sub-cloud',
      subjectName: 'Cloud & Infrastructure Engineering',
      totalAttempted: 28,
      correctCount: 24,
      incorrectCount: 4,
      accuracy: 86,
      needsRevision: false,
    },
  ],
};

export const DEFAULT_ATTEMPTS_HISTORY: PaginatedAttempts = {
  items: [
    {
      id: 'att-1',
      attemptType: 'MOCK_TEST',
      status: 'SUBMITTED',
      title: 'AWS Cloud Solutions Engineer Benchmark Mock Test',
      startedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      submittedAt: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
      score: 8.5,
      maxScore: 10,
      correctCount: 9,
      incorrectCount: 1,
      unansweredCount: 0,
      accuracy: 90,
      mockTestId: 'mock-aws-screen',
      topicId: null,
    },
    {
      id: 'att-2',
      attemptType: 'PRACTICE',
      status: 'SUBMITTED',
      title: 'Practice: DevOps, Docker & CI/CD Pipelines',
      startedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      submittedAt: new Date(Date.now() - 47 * 3600 * 1000).toISOString(),
      score: 7,
      maxScore: 10,
      correctCount: 7,
      incorrectCount: 3,
      unansweredCount: 0,
      accuracy: 70,
      mockTestId: null,
      topicId: 'topic-devops',
    },
    {
      id: 'att-3',
      attemptType: 'MOCK_TEST',
      status: 'SUBMITTED',
      title: 'DevOps & CI/CD Engineering Screening Simulation',
      startedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      submittedAt: new Date(Date.now() - 71 * 3600 * 1000).toISOString(),
      score: 8.0,
      maxScore: 10,
      correctCount: 8,
      incorrectCount: 2,
      unansweredCount: 0,
      accuracy: 80,
      mockTestId: 'mock-devops-screen',
      topicId: null,
    },
  ],
  totalItems: 3,
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

// ==========================================
// 3. Role Readiness Benchmarks
// ==========================================
export function getFallbackRoleReadiness(roleTrackId?: string): RoleReadinessData {
  const role =
    DEFAULT_ROLES_CATALOG.find((r) => r.id === roleTrackId || r.slug === roleTrackId) ||
    DEFAULT_ROLES_CATALOG[0];

  return {
    role: {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      targetLevel: role.targetLevel,
    },
    rri: 82,
    readinessTier: 'COMPETITIVE',
    summary:
      'Strong profile competency demonstrated across core architecture, automation, and distributed systems. Focus on advanced troubleshooting to hit Distinction.',
    competencies: role.competencies.map((c) => ({
      id: c.id,
      topicId: c.topicId,
      topicName: c.topicName,
      topicSlug: c.topicSlug,
      subjectId: c.subjectId,
      subjectName: c.subjectName,
      weightPercentage: c.weightPercentage,
      benchmarkAccuracy: c.benchmarkAccuracy,
      studentQuestionsAttempted: 24,
      studentAccuracy: 78,
      coverageRatio: 0.85,
      gap: 78 - c.benchmarkAccuracy,
      status: (78 >= c.benchmarkAccuracy ? 'READY' : 'IN_PROGRESS') as
        | 'READY'
        | 'IN_PROGRESS'
        | 'NOT_STARTED',
      practiceTopicId: c.topicId,
    })),
    benchmarkMockTests: DEFAULT_MOCK_TESTS_CATALOG.slice(0, 2).map((m) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      durationMinutes: m.durationMinutes,
      questionCount: m.questionCount,
    })),
  };
}

// ==========================================
// 4. Cohort Percentiles & Gaussian Distribution
// ==========================================
export function getFallbackCohortReadiness(roleTrackId: string): CohortReadinessResponse {
  const role =
    DEFAULT_ROLES_CATALOG.find((r) => r.id === roleTrackId || r.slug === roleTrackId) ||
    DEFAULT_ROLES_CATALOG[0];

  return {
    roleTrackId: role.id,
    roleName: role.name,
    roleSlug: role.slug,
    candidateScore: 84,
    percentileRank: 86,
    readinessBand: 'JOB_READY',
    cohortSampleSize: 148,
    cohortMedianScore: 68,
    cohortTopDecileScore: 88,
    distribution: [
      { range: '0-9%', minScore: 0, maxScore: 9, count: 0, percentage: 0, isStudentBucket: false },
      { range: '10-19%', minScore: 10, maxScore: 19, count: 1, percentage: 1, isStudentBucket: false },
      { range: '20-29%', minScore: 20, maxScore: 29, count: 3, percentage: 2, isStudentBucket: false },
      { range: '30-39%', minScore: 30, maxScore: 39, count: 8, percentage: 5, isStudentBucket: false },
      { range: '40-49%', minScore: 40, maxScore: 49, count: 14, percentage: 9, isStudentBucket: false },
      { range: '50-59%', minScore: 50, maxScore: 59, count: 24, percentage: 16, isStudentBucket: false },
      { range: '60-69%', minScore: 60, maxScore: 69, count: 38, percentage: 26, isStudentBucket: false },
      { range: '70-79%', minScore: 70, maxScore: 79, count: 32, percentage: 22, isStudentBucket: false },
      { range: '80-89%', minScore: 80, maxScore: 89, count: 20, percentage: 14, isStudentBucket: true },
      { range: '90-100%', minScore: 90, maxScore: 100, count: 8, percentage: 5, isStudentBucket: false },
    ],
    competencyBenchmarks: role.competencies.map((c, i) => ({
      topicId: c.topicId,
      topicName: c.topicName,
      studentAccuracy: i === 0 ? 88 : i === 1 ? 82 : 72,
      cohortMedian: 66,
      topDecileBenchmark: 86,
      gapFromMedian: (i === 0 ? 88 : i === 1 ? 82 : 72) - 66,
    })),
    keyDeficit: {
      topicId: role.competencies[role.competencies.length - 1]?.topicId || 't-deficit',
      topicName: role.competencies[role.competencies.length - 1]?.topicName || 'Systems Optimization',
      studentAccuracy: 72,
      cohortMedian: 66,
      topDecileBenchmark: 86,
      gapFromMedian: 6,
    },
    keyStrength: {
      topicId: role.competencies[0]?.topicId || 't-strength',
      topicName: role.competencies[0]?.topicName || 'Core Architecture',
      studentAccuracy: 88,
      cohortMedian: 66,
      topDecileBenchmark: 86,
      gapFromMedian: 22,
    },
  };
}

export const DEFAULT_COHORTS_OVERVIEW: CohortSummaryItem[] = DEFAULT_ROLES_CATALOG.map((r) => ({
  roleTrackId: r.id,
  roleName: r.name,
  roleSlug: r.slug,
  candidateScore: 82,
  percentileRank: 84,
  readinessBand: 'JOB_READY',
  cohortMedianScore: 68,
  cohortSampleSize: 140,
}));

// ==========================================
// 5. Skill Credentials & Milestones
// ==========================================
export const DEFAULT_ROLE_MILESTONES: RoleMilestoneItem[] = DEFAULT_ROLES_CATALOG.map((r, idx) => ({
  roleTrackId: r.id,
  roleName: r.name,
  roleSlug: r.slug,
  mockTestCleared: idx < 4,
  bestMockScore: idx < 4 ? 85 + idx * 2 : null,
  interviewCleared: idx < 3,
  bestInterviewScore: idx < 3 ? 88 + idx : null,
  isEligible: idx < 3,
  credential:
    idx === 0
      ? {
          id: `cred-${r.slug}`,
          credentialCode: `CRED-${r.slug.slice(0, 4).toUpperCase()}-948123`,
          title: `${r.name} Readiness Credential`,
          grade: 'DISTINCTION',
          compositeScore: 91,
          mockTestScore: 89,
          interviewScore: 93,
          verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          competencies: r.competencies.map((c) => c.topicName),
          issuedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
          roleTrack: {
            id: r.id,
            name: r.name,
            slug: r.slug,
          },
        }
      : null,
}));

export function createFallbackCredential(roleTrackId: string): CredentialItem {
  const role =
    DEFAULT_ROLES_CATALOG.find((r) => r.id === roleTrackId || r.slug === roleTrackId) ||
    DEFAULT_ROLES_CATALOG[0];

  return {
    id: `cred-${role.slug}-${Date.now()}`,
    credentialCode: `CRED-${role.slug.slice(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
    title: `${role.name} Readiness Credential`,
    grade: 'DISTINCTION',
    compositeScore: 92,
    mockTestScore: 90,
    interviewScore: 94,
    verificationHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    competencies: role.competencies.map((c) => c.topicName),
    issuedAt: new Date().toISOString(),
    roleTrack: {
      id: role.id,
      name: role.name,
      slug: role.slug,
    },
  };
}

export function verifyFallbackCredential(code: string): PublicVerificationItem {
  return {
    isValid: true,
    credentialCode: code,
    title: 'Verified Engineering Readiness Credential',
    recipientName: 'Student Candidate',
    roleName: 'Cloud Solutions & Systems Engineer',
    grade: 'DISTINCTION',
    compositeScore: 92,
    mockTestScore: 90,
    interviewScore: 94,
    issuedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    verificationHash: '8f4c2b9a71d3e5f601248739abcdef1029384756abcedf0129384756abcdef',
    competencies: [
      'Cloud Architecture & High Availability',
      'Containerization & Microservices',
      'Continuous Integration & Deployment',
    ],
  };
}

// ==========================================
// 6. Socratic AI Interview Simulation
// ==========================================
const SESSIONS_STORE: Map<string, InterviewSessionData> = new Map();

export function createFallbackInterviewSession(
  roleTrackId: string,
  targetDurationMinutes = 20,
): InterviewSessionData {
  const role =
    DEFAULT_ROLES_CATALOG.find((r) => r.id === roleTrackId || r.slug === roleTrackId) ||
    DEFAULT_ROLES_CATALOG[0];

  const sessionId = `interview-${role.slug}-${Date.now()}`;
  const initialMessage: InterviewMessageData = {
    id: `msg-${Date.now()}-1`,
    sender: 'AI_INTERVIEWER',
    content: `Hello! I am your Socratic AI Technical Interviewer for the ${role.name} track. To begin our technical screening, please introduce yourself and explain what key architectural trade-offs you prioritize when designing resilient production systems.`,
    stage: 'INTRODUCTION',
    turnNumber: 1,
    technicalFeedback: null,
    suggestedBetterAnswer: null,
    createdAt: new Date().toISOString(),
  };

  const session: InterviewSessionData = {
    id: sessionId,
    userId: 'user-current',
    roleTrackId: role.id,
    status: 'IN_PROGRESS',
    currentStage: 'INTRODUCTION',
    targetDurationMinutes,
    overallScore: null,
    technicalScore: null,
    clarityScore: null,
    feedbackSummary: null,
    strengths: null,
    growthAreas: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    roleTrack: {
      id: role.id,
      name: role.name,
      slug: role.slug,
      targetLevel: role.targetLevel,
    },
    messages: [initialMessage],
  };

  SESSIONS_STORE.set(sessionId, session);
  return session;
}

export function createFallbackInterviewReply(
  interviewId: string,
  candidateContent: string,
): {
  candidateMessage: InterviewMessageData;
  aiMessage: InterviewMessageData;
  currentStage: 'INTRODUCTION' | 'TECHNICAL_DRILL' | 'SCENARIO_DESIGN' | 'WRAPUP';
} {
  let session = SESSIONS_STORE.get(interviewId);
  if (!session) {
    session = createFallbackInterviewSession(DEFAULT_ROLES_CATALOG[0].id);
  }

  const turn = session.messages.length + 1;
  const candMsg: InterviewMessageData = {
    id: `msg-cand-${Date.now()}`,
    sender: 'CANDIDATE',
    content: candidateContent,
    stage: session.currentStage,
    turnNumber: turn,
    technicalFeedback:
      'Clear articulation of architectural principles. Consider quantifying reliability targets with specific SLAs/SLOs (e.g. 99.99% availability).',
    suggestedBetterAnswer:
      'Frame the answer around the CAP theorem trade-offs and cite metrics such as MTTR and MTTD.',
    createdAt: new Date().toISOString(),
  };

  // Stage progression logic
  let nextStage: 'INTRODUCTION' | 'TECHNICAL_DRILL' | 'SCENARIO_DESIGN' | 'WRAPUP' =
    session.currentStage;
  let nextPrompt = '';

  if (session.currentStage === 'INTRODUCTION') {
    nextStage = 'TECHNICAL_DRILL';
    nextPrompt =
      'Good baseline context. Let us dive into a technical drill: Suppose a high-throughput microservice encounters sudden connection pool exhaustion during a traffic surge. Walk me through your step-by-step diagnostic and remediation process.';
  } else if (session.currentStage === 'TECHNICAL_DRILL') {
    nextStage = 'SCENARIO_DESIGN';
    nextPrompt =
      'Solid diagnosis. Now for architectural scenario design: How would you architect this service for zero-downtime rolling deployments while ensuring database schema migrations remain backward-compatible?';
  } else if (session.currentStage === 'SCENARIO_DESIGN') {
    nextStage = 'WRAPUP';
    nextPrompt =
      'Excellent technical reasoning. We have covered core competencies, resilience patterns, and migration strategies. Do you have any architectural questions for me regarding this engineering role?';
  } else {
    nextStage = 'WRAPUP';
    nextPrompt =
      'Thank you for an insightful technical session. You can now complete the interview to generate your multi-dimensional evaluation rubric scorecard.';
  }

  const aiMsg: InterviewMessageData = {
    id: `msg-ai-${Date.now()}`,
    sender: 'AI_INTERVIEWER',
    content: nextPrompt,
    stage: nextStage,
    turnNumber: turn + 1,
    technicalFeedback: null,
    suggestedBetterAnswer: null,
    createdAt: new Date().toISOString(),
  };

  session.currentStage = nextStage;
  session.messages.push(candMsg, aiMsg);
  SESSIONS_STORE.set(interviewId, session);

  return {
    candidateMessage: candMsg,
    aiMessage: aiMsg,
    currentStage: nextStage,
  };
}

export function completeFallbackInterviewSession(interviewId: string): InterviewSessionData {
  let session = SESSIONS_STORE.get(interviewId);
  if (!session) {
    session = createFallbackInterviewSession(DEFAULT_ROLES_CATALOG[0].id);
  }

  session.status = 'COMPLETED';
  session.completedAt = new Date().toISOString();
  session.overallScore = 88;
  session.technicalScore = 90;
  session.clarityScore = 86;
  session.feedbackSummary =
    'Candidate demonstrated solid technical fundamentals, thorough debugging methodology, and strong grasp of distributed system failure modes.';
  session.strengths = [
    'Methodical diagnostic approach to connection pool exhaustion',
    'Clear understanding of blue/green and canary deployment trade-offs',
    'Concise verbal communication with accurate terminology',
  ];
  session.growthAreas = [
    'Incorporate concrete latency percentiles (p95, p99) when discussing performance',
    'Discuss automated rollback strategies with distributed circuit breakers',
  ];

  SESSIONS_STORE.set(interviewId, session);
  return session;
}

export function getFallbackInterviewSession(interviewId: string): InterviewSessionData {
  let session = SESSIONS_STORE.get(interviewId);
  if (!session) {
    session = createFallbackInterviewSession(DEFAULT_ROLES_CATALOG[0].id);
  }
  return session;
}

export function getFallbackUserInterviews(): PaginatedInterviews {
  return {
    items: [
      {
        id: 'interview-hist-1',
        userId: 'user-1',
        roleTrackId: DEFAULT_ROLES_CATALOG[0].id,
        status: 'COMPLETED',
        currentStage: 'WRAPUP',
        targetDurationMinutes: 20,
        overallScore: 88,
        startedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 47 * 3600 * 1000).toISOString(),
        roleTrack: {
          id: DEFAULT_ROLES_CATALOG[0].id,
          name: DEFAULT_ROLES_CATALOG[0].name,
          slug: DEFAULT_ROLES_CATALOG[0].slug,
        },
        _count: { messages: 6 },
      },
    ],
    totalItems: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };
}
