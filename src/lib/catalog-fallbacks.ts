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
import {
  FALLBACK_TOPIC_QUESTIONS,
  type RawTopicQuestion,
} from './catalog-questions';
export { FALLBACK_TOPIC_QUESTIONS, type RawTopicQuestion };

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

export function getDomainTopicsForMockTest(mockTestIdOrSlug: string): string[] {
  const id = (mockTestIdOrSlug || '').toLowerCase();
  if (id.includes('aws') || id === 'mock-2') {
    return ['topic-aws-arch', 'topic-cloud-security', 'topic-devops', 'topic-linux'];
  }
  if (id.includes('azure') || id === 'mock-3') {
    return ['topic-azure-sys', 'topic-cloud-security', 'topic-devops', 'topic-linux'];
  }
  if (id.includes('devops') || id.includes('container') || id === 'mock-4') {
    return ['topic-devops', 'topic-linux', 'topic-cloud-security', 'topic-aws-arch'];
  }
  if (id.includes('java') || id === 'mock-5') {
    return ['topic-core-java', 'topic-oop', 'topic-adv-sql', 'topic-ds'];
  }
  if (id.includes('python') || id === 'mock-6') {
    return ['topic-python', 'topic-ds', 'topic-adv-sql', 'topic-qa-testing'];
  }
  if (id.includes('data-analyst') || id.includes('sql') || id === 'mock-7') {
    return ['topic-adv-sql', 'topic-dbms', 'topic-etl-pipelines', 'topic-percentages'];
  }
  if (id.includes('crm') || id === 'mock-8') {
    return ['topic-crm-work', 'topic-adv-sql', 'topic-fullstack-js', 'topic-oop'];
  }
  if (id.includes('data-eng') || id.includes('etl') || id === 'mock-9') {
    return ['topic-etl-pipelines', 'topic-adv-sql', 'topic-python', 'topic-devops'];
  }
  if (id.includes('machine-learning') || id.includes('ml-ai') || id === 'mock-10') {
    return ['topic-ml-systems', 'topic-python', 'topic-etl-pipelines', 'topic-ds'];
  }
  if (id.includes('cyber') || id.includes('defense') || id === 'mock-11') {
    return ['topic-cloud-security', 'topic-linux', 'topic-aws-arch', 'topic-azure-sys'];
  }
  if (id.includes('qa') || id.includes('sdet') || id === 'mock-12') {
    return ['topic-qa-testing', 'topic-fullstack-js', 'topic-python', 'topic-devops'];
  }
  // Default general aptitude mock test (mock-1)
  return [
    'topic-numbers',
    'topic-percentages',
    'topic-time-work',
    'topic-prob',
    'topic-blood',
    'topic-coding',
    'topic-syllogisms',
    'topic-direction',
    'topic-ds',
    'topic-dbms',
    'topic-oop',
  ];
}

export function getMockTestQuestionsForDomain(mockTestIdOrSlug: string): Array<{
  id: string;
  topicId: string;
  body: string;
  explanation: string;
  difficulty: string;
  orderIndex: number;
  topicName: string;
  subjectName: string;
  sectionId: string;
  sectionTitle: string;
  options: Array<{ id: string; body: string; orderIndex: number; isCorrect: boolean }>;
  correctOptionId: string;
}> {
  const targetTopics = getDomainTopicsForMockTest(mockTestIdOrSlug);
  const matched = FALLBACK_TOPIC_QUESTIONS.filter((q) => targetTopics.includes(q.topicId));
  const pool = matched.length >= 8 ? matched : FALLBACK_TOPIC_QUESTIONS;
  const selected = pool.slice(0, 10);

  // Topic & Subject lookup maps
  const topicMap = new Map<string, { topicName: string; subjectName: string }>();
  for (const sub of DEFAULT_PRACTICE_CATALOG) {
    for (const top of sub.topics) {
      topicMap.set(top.id, { topicName: top.name, subjectName: sub.name });
    }
  }

  const half = Math.ceil(selected.length / 2);

  return selected.map((q, idx) => {
    const meta = topicMap.get(q.topicId) || {
      topicName: 'Technical Engineering Core',
      subjectName: 'Engineering Competency',
    };
    const isFirstSection = idx < half;
    return {
      id: q.id,
      topicId: q.topicId,
      body: q.body,
      explanation: q.explanation,
      difficulty: q.difficulty,
      orderIndex: idx,
      topicName: meta.topicName,
      subjectName: meta.subjectName,
      sectionId: isFirstSection ? 'sec-1' : 'sec-2',
      sectionTitle: isFirstSection
        ? 'Section 1: Architecture & Technical Principles'
        : 'Section 2: Applied Engineering & Troubleshooting',
      options: q.options.map((o) => ({
        id: o.id,
        body: o.body,
        orderIndex: o.orderIndex,
        isCorrect: o.id === q.correctOptionId,
      })),
      correctOptionId: q.correctOptionId,
    };
  });
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

interface RoleInterviewDialogue {
  introQuestion: string;
  technicalDrillPrompt: string;
  scenarioDesignPrompt: string;
  wrapupPrompt: string;
  technicalFeedback: string;
  suggestedAnswer: string;
  feedbackSummary: string;
  strengths: string[];
  growthAreas: string[];
}

function getRoleInterviewDialogue(roleSlugOrId: string): RoleInterviewDialogue {
  const s = (roleSlugOrId || '').toLowerCase();

  if (s.includes('aws')) {
    return {
      introQuestion: 'Welcome to the AWS Cloud Solutions Architect interview. Please introduce yourself and explain how you apply the AWS Well-Architected Framework pillars when designing resilient multi-tier systems.',
      technicalDrillPrompt: 'Your application experiences intermittent HTTP 504 timeout errors behind an Application Load Balancer in us-east-1 during traffic surges. Walk me through how you isolate whether the root cause is ALB idle timeout, target group health check failures, or backend connection pool exhaustion.',
      scenarioDesignPrompt: 'Design an active-active cross-region disaster recovery architecture for a mission-critical web application with an RPO under 1 minute and RTO under 5 minutes.',
      wrapupPrompt: 'Thorough architectural breakdown. Do you have any questions for me regarding our multi-region AWS infrastructure or cloud governance standards?',
      technicalFeedback: 'Strong grasp of AWS networking, VPC peering, and multi-region replication. Consider detailing CloudWatch metric alarms and ALB connection draining settings.',
      suggestedAnswer: 'Structure the response around Amazon Route 53 latency routing, DynamoDB global tables, S3 cross-region replication, and automated health checks.',
      feedbackSummary: 'Candidate demonstrated advanced understanding of AWS Well-Architected principles, VPC isolation, and cross-region disaster recovery patterns.',
      strengths: [
        'Methodical troubleshooting of ALB 504 timeouts',
        'Strong knowledge of multi-region active-active disaster recovery',
        'Clear articulation of RTO and RPO trade-offs',
      ],
      growthAreas: [
        'Incorporate specific AWS CloudWatch synthetic canary monitors',
        'Deepen explanation of IAM role session policies and IMDSv2 security',
      ],
    };
  }

  if (s.includes('azure')) {
    return {
      introQuestion: 'Welcome to the Azure Cloud Infrastructure interview. How do you approach enterprise landing zone architecture, subscription governance, and hub-and-spoke VNet topologies in Microsoft Azure?',
      technicalDrillPrompt: 'A virtual machine in a spoke VNet cannot communicate with an Azure SQL Managed Instance in a peered VNet. How do you systematically troubleshoot UDR route tables, NSGs, and private endpoints?',
      scenarioDesignPrompt: 'Design a secure, highly available hybrid connectivity architecture between an on-premises datacenter and two Azure regions using ExpressRoute with automated VPN failover.',
      wrapupPrompt: 'Great technical reasoning. Do you have any architectural questions for our cloud infrastructure team?',
      technicalFeedback: 'Solid understanding of Azure networking and NSG stateful rules. Consider citing Azure Bastion host tunneling and Azure Policy compliance audits.',
      suggestedAnswer: 'Trace packet flow using Azure Network Watcher IP Flow Verify and Next Hop tools, verifying effective routes and NSG priority rules.',
      feedbackSummary: 'Candidate demonstrated thorough knowledge of Azure VNet peering, landing zone governance, and hybrid connectivity failover.',
      strengths: [
        'Precise usage of Network Watcher diagnostic tools',
        'Clear design of ExpressRoute with redundant VPN gateway backup',
        'Proficient understanding of Azure RBAC and Managed Identities',
      ],
      growthAreas: [
        'Quantify BGP route convergence times during ExpressRoute failover',
        'Discuss Azure Monitor Log Analytics workspace data retention cost tuning',
      ],
    };
  }

  if (s.includes('java')) {
    return {
      introQuestion: 'Welcome to the Java Enterprise Backend Developer interview. Describe your approach to managing object lifecycle, memory allocation, and concurrency in modern Java applications.',
      technicalDrillPrompt: 'A production Java 21 microservice is experiencing stop-the-world GC pauses exceeding 3 seconds and periodic java.lang.OutOfMemoryError: Java heap space. How do you diagnose and tune the JVM using thread and heap dumps?',
      scenarioDesignPrompt: 'Design a high-concurrency payment processing engine that handles idempotent transactions, distributed locks, and pessimistic vs optimistic locking against PostgreSQL.',
      wrapupPrompt: 'Very strong fundamentals on memory models and JVM performance. Do you have any questions about our backend architecture?',
      technicalFeedback: 'Precise analysis of Java memory regions and volatile visibility semantics. Consider comparing ZGC or Shenandoah garbage collectors for sub-millisecond pauses.',
      suggestedAnswer: 'Inspect GC logs with tools like jcmd or VisualVM, identify memory leaks via Eclipse MAT retained heap analysis, and tune generational heap parameters.',
      feedbackSummary: 'Candidate demonstrated exemplary mastery of Java concurrency primitives, JVM heap profiling, and relational database locking semantics.',
      strengths: [
        'Accurate explanation of Java memory visibility and volatile semantics',
        'Methodical approach to analyzing heap memory dumps',
        'Sound concurrency model using ReentrantLock and virtual threads',
      ],
      growthAreas: [
        'Discuss Java 21 Scoped Values and Structured Concurrency patterns',
        'Elaborate on database connection pool sizing (HikariCP) relative to CPU cores',
      ],
    };
  }

  if (s.includes('python')) {
    return {
      introQuestion: 'Welcome to the Python Developer technical interview. Discuss the trade-offs of using Python for scalable backend systems, specifically around concurrency models like asyncio vs multiprocessing.',
      technicalDrillPrompt: 'A long-running background worker process in Python is steadily consuming more RAM over time and eventually gets terminated by the OS OOM killer. How do you profile and eliminate memory leaks in CPython?',
      scenarioDesignPrompt: 'Design a distributed asynchronous job processing pipeline using Celery and Redis with rate limiting, task retries with exponential backoff, and dead-letter queues.',
      wrapupPrompt: 'Solid understanding of Python internals and async design. What questions do you have about our Python engineering stack?',
      technicalFeedback: 'Great explanation of mutable default argument traps and the Global Interpreter Lock. Consider profiling memory with tracemalloc and objgraph.',
      suggestedAnswer: 'Use Python tracemalloc to take heap snapshots, identify cyclic references keeping objects alive, and use multiprocessing or Celery with max-tasks-per-child to recycle worker memory.',
      feedbackSummary: 'Candidate showcased in-depth understanding of Python memory management, generator lazy evaluation, and distributed asynchronous task queues.',
      strengths: [
        'Clear understanding of CPython GIL vs multiprocessing parallelism',
        'Practical approach to diagnosing memory leaks with tracemalloc',
        'Resilient worker architecture with Celery dead-letter routing',
      ],
      growthAreas: [
        'Explore uvloop integration for enhanced async I/O performance',
        'Discuss strict typing with mypy and Pydantic v2 validation models',
      ],
    };
  }

  if (s.includes('fullstack') || s.includes('javascript')) {
    return {
      introQuestion: 'Welcome to the Full Stack JavaScript Developer interview. Walk me through the end-to-end request lifecycle from a React client to a Node.js API server and database.',
      technicalDrillPrompt: 'A Node.js backend experiences severe event loop lag (event loop delay > 500ms) under concurrent requests. How do you identify whether CPU-bound synchronous code or microtask starvation is blocking the loop?',
      scenarioDesignPrompt: 'Architect a real-time collaborative dashboard with WebSockets, optimistic UI updates, conflict resolution, and offline sync resilience.',
      wrapupPrompt: 'Impressive coverage of client-server synchronization and event-driven architecture. Any questions for our full-stack engineering leads?',
      technicalFeedback: 'Excellent explanation of microtask vs macrotask queuing. Consider discussing Server-Sent Events (SSE) as a lightweight alternative to full WebSockets for unidirectional streams.',
      suggestedAnswer: 'Profile using node:perf_hooks or clinic.js doctor, offload intensive computations to worker threads, and avoid nested Promise loops that starve the macrotask queue.',
      feedbackSummary: 'Candidate exhibited well-rounded full-stack expertise spanning React state hydration, Node.js event loop scheduling, and real-time WebSocket protocol handling.',
      strengths: [
        'Precise understanding of the V8 JavaScript event loop phases',
        'Practical conflict resolution strategy for real-time state',
        'Clear emphasis on idempotent HTTP methods and secure CORS configurations',
      ],
      growthAreas: [
        'Discuss web worker offloading for browser-side intensive transforms',
        'Incorporate HTTP/2 or HTTP/3 multiplexing advantages',
      ],
    };
  }

  if (s.includes('data-analyst') || s.includes('sql')) {
    return {
      introQuestion: 'Welcome to the Data Analyst & SQL Specialist interview. How do you translate complex business questions into efficient, auditable analytical queries and executive dashboards?',
      technicalDrillPrompt: 'An analytical query calculating year-over-year revenue and customer cohort retention takes 12 minutes to execute on a 50-million row table. How do you analyze the query execution plan and optimize it using indexes or CTEs?',
      scenarioDesignPrompt: 'Design a dimensional data model (Star Schema vs Snowflake Schema) for a multi-channel retail business to support flexible reporting on sales, inventory, and promotions.',
      wrapupPrompt: 'Excellent analytical intuition and SQL query design. Do you have any questions about our enterprise data warehousing standards?',
      technicalFeedback: 'Great command of SQL window functions (ROW_NUMBER vs DENSE_RANK). Consider discussing partition pruning and columnar storage benefits (Parquet/ClickHouse).',
      suggestedAnswer: 'Examine the EXPLAIN ANALYZE output for sequential scans, add composite covering indexes on (cohort_date, customer_id), and pre-aggregate daily facts into materialized summary tables.',
      feedbackSummary: 'Candidate demonstrated superior proficiency in relational SQL optimization, window analytics, and dimensional star schema design.',
      strengths: [
        'Skilled in interpreting EXPLAIN query cost plans',
        'Effective use of window partition functions for cohort analysis',
        'Strong dimensional modeling methodology (Facts vs Dimensions)',
      ],
      growthAreas: [
        'Incorporate columnar indexing strategies (e.g. BRIN indexes in Postgres)',
        'Discuss data freshness SLAs and automated reconciliation checks',
      ],
    };
  }

  if (s.includes('crm')) {
    return {
      introQuestion: 'Welcome to the CRM Technical Specialist interview. How do you design scalable data models and automation workflows within enterprise CRM platforms while honoring governor limits?',
      technicalDrillPrompt: 'A bulk CSV import of 50,000 customer records triggers execution timeouts and governor limit exceptions in your CRM environment. How do you re-architect the trigger logic and batch processes?',
      scenarioDesignPrompt: 'Design a bidirectional real-time synchronization between an enterprise CRM and an external ERP billing system with idempotent webhook delivery and error escalation.',
      wrapupPrompt: 'Great coverage of CRM enterprise integration and workflow governance. What questions would you like to ask our CRM architecture group?',
      technicalFeedback: 'Sound understanding of Master-Detail cascading deletes and trigger bulkification. Consider discussing external object virtualization via OData.',
      suggestedAnswer: 'Bulkify trigger handlers to process collections of records, move asynchronous enrichment to queueable background jobs, and utilize bulk API endpoints with batch sizes of 200.',
      feedbackSummary: 'Candidate demonstrated thorough knowledge of CRM relational data schemas, governor limits, and resilient third-party webhook integrations.',
      strengths: [
        'Rigorous application of bulkification patterns',
        'Idempotent webhook deduplication using transaction keys',
        'Clear distinction between lookup and master-detail relationships',
      ],
      growthAreas: [
        'Explore change data capture (CDC) streaming event architectures',
        'Detail sandbox staging and metadata deployment regression pipelines',
      ],
    };
  }

  if (s.includes('data-eng') || s.includes('etl')) {
    return {
      introQuestion: 'Welcome to the Data Engineer & ETL Architect interview. How do you design robust data lakehouses that provide both batch and streaming capabilities with guaranteed schema evolution?',
      technicalDrillPrompt: 'A distributed Apache Spark job crashes with ExecutorLostFailure due to severe data skew during a wide join on customer_id. How do you diagnose the skew and implement key salting to balance partitions?',
      scenarioDesignPrompt: 'Architect an end-to-end streaming ingestion pipeline from Kafka to a Delta Lake/Iceberg bronze-silver-gold architecture with exactly-once semantics and automated backfilling.',
      wrapupPrompt: 'Outstanding mastery of distributed data pipelines and partition tuning. What questions do you have about our data engineering infrastructure?',
      technicalFeedback: 'Comprehensive explanation of Spark shuffle bottlenecks and Delta Lake ACID transaction logs. Consider discussing broadcast joins for smaller dimensional tables.',
      suggestedAnswer: 'Identify skewed partitions via Spark UI task duration histograms, append a random integer salt (0 to N-1) to the join keys to distribute data evenly across worker nodes, and broadcast un-skewed dimension tables.',
      feedbackSummary: 'Candidate demonstrated deep technical authority on distributed data processing, Lakehouse ACID storage formats, and streaming pipeline idempotency.',
      strengths: [
        'Expert diagnostic methodology for Spark data skew',
        'Clear medallion architecture (bronze/silver/gold) implementation',
        'Thorough grasp of exactly-once streaming semantics',
      ],
      growthAreas: [
        'Discuss automated compaction and Z-order clustering optimization',
        'Incorporate data quality contracts with Great Expectations / Deequ',
      ],
    };
  }

  if (s.includes('ml-ai') || s.includes('machine-learning')) {
    return {
      introQuestion: 'Welcome to the Machine Learning & AI Systems Engineer interview. How do you bridge the gap between offline model training in Jupyter notebooks and production low-latency inference systems?',
      technicalDrillPrompt: 'A deployed vector embedding search service experiences p99 latency spikes from 20ms to 850ms under peak query traffic. How do you profile HNSW graph traversal, memory mapping, and batch inference throughput?',
      scenarioDesignPrompt: 'Design an enterprise RAG (Retrieval-Augmented Generation) pipeline incorporating document chunking, semantic vector indexing, re-ranking, and model drift/hallucination guardrails.',
      wrapupPrompt: 'Superb grasp of AI production engineering and vector retrieval optimization. What questions do you have for our AI systems team?',
      technicalFeedback: 'Great command of vector similarity metrics (Cosine vs Euclidean) and model quantization (INT8). Consider discussing cross-encoder re-ranking latency trade-offs.',
      suggestedAnswer: 'Profile vector index memory usage, optimize HNSW efSearch parameters, batch embedding calculations with GPU TensorRT or ONNX Runtime, and implement semantic caching with Redis.',
      feedbackSummary: 'Candidate demonstrated comprehensive expertise in production ML pipelines, low-latency vector search optimization, and enterprise RAG architecture guardrails.',
      strengths: [
        'Deep understanding of embedding index tuning (HNSW / IVF)',
        'Practical approach to mitigating model concept drift and data drift',
        'Clear pipeline design incorporating point-in-time feature stores',
      ],
      growthAreas: [
        'Discuss speculative decoding and KV-cache optimizations for LLMs',
        'Detail automated evaluation metrics (ROUGE, BLEU, and LLM-as-a-judge)',
      ],
    };
  }

  if (s.includes('cyber') || s.includes('defense') || s.includes('security')) {
    return {
      introQuestion: 'Welcome to the Cybersecurity & Infrastructure Defense interview. How do you construct threat models for modern cloud architectures using frameworks like STRIDE and MITRE ATT&CK?',
      technicalDrillPrompt: 'Your SIEM alerts you to anomalous API calls originating from a compute instance with unauthorized AssumeRole permissions attempting to enumerate cloud storage buckets at 3:00 AM. Walk me through your incident response protocol.',
      scenarioDesignPrompt: 'Architect a comprehensive defense-in-depth security perimeter for a multi-tenant cloud application, covering mutual TLS, WAF rules, container image signing, and secrets rotation.',
      wrapupPrompt: 'Very thorough threat detection and incident triage methodology. Any questions for our security operations group?',
      technicalFeedback: 'Excellent emphasis on Zero Trust and Least Privilege. Consider detailing forensic memory acquisition before terminating compromised compute instances.',
      suggestedAnswer: 'Immediately isolate the instance via NSG quarantine rules, revoke active IAM credentials, preserve volatile memory for forensics, inspect VPC flow logs, and perform a blast radius audit.',
      feedbackSummary: 'Candidate demonstrated exceptional rigor in cloud incident response, IAM least privilege auditing, and defense-in-depth perimeter architecture.',
      strengths: [
        'Methodical cloud containment and forensic evidence preservation',
        'Thorough understanding of zero-trust mutual TLS enforcement',
        'Accurate knowledge of cryptographic forward secrecy (PFS)',
      ],
      growthAreas: [
        'Discuss automated security orchestration and response (SOAR) playbooks',
        'Detail supply chain security with SLSA framework and SBOM verification',
      ],
    };
  }

  if (s.includes('qa') || s.includes('sdet') || s.includes('testing')) {
    return {
      introQuestion: 'Welcome to the QA Automation & SDET Engineer interview. How do you establish test automation strategies that balance test execution speed, defect detection, and maintenance cost?',
      technicalDrillPrompt: 'An automated UI test suite running Playwright in CI exhibits a 15% flakiness rate due to hydration delays and dynamic content rendering. How do you identify root causes and refactor tests to be 100% deterministic?',
      scenarioDesignPrompt: 'Design a continuous testing quality gate within a GitOps pipeline that orchestrates unit tests, consumer-driven contract tests, security SAST scans, and automated canary smoke tests.',
      wrapupPrompt: 'Fantastic understanding of SDET architecture and resilient test harness design. What questions do you have about our engineering quality standards?',
      technicalFeedback: 'Great application of the Test Automation Pyramid and web-first auto-waiting locators. Consider discussing visual regression testing with Percy or Applitools.',
      suggestedAnswer: 'Eliminate hardcoded sleep timeouts by replacing them with Playwright auto-waiting web-first assertions, isolate test fixtures with unique database tenants, and trace test network calls.',
      feedbackSummary: 'Candidate demonstrated deep mastery of modern SDET methodologies, Playwright automation resilience, and continuous delivery quality gates.',
      strengths: [
        'Rigorous methodology for isolating and resolving flaky tests',
        'Solid implementation of consumer-driven contract testing (Pact)',
        'Clear alignment with the Test Automation Pyramid',
      ],
      growthAreas: [
        'Discuss test suite parallelization across distributed CI worker shards',
        'Detail mutation testing (e.g. Stryker) to evaluate test suite robustness',
      ],
    };
  }

  // Default: Cloud & DevOps Engineer
  return {
    introQuestion: 'Welcome to the DevOps & Site Reliability Engineering interview. To begin our technical screening, please introduce yourself and explain what key architectural trade-offs you prioritize when designing resilient production systems.',
    technicalDrillPrompt: 'A high-throughput microservice encounters sudden connection pool exhaustion during a 10x traffic surge. Walk me through your step-by-step diagnostic and remediation process.',
    scenarioDesignPrompt: 'How would you architect this service for zero-downtime canary deployments while ensuring database schema migrations remain backward-compatible?',
    wrapupPrompt: 'Excellent technical reasoning. We have covered core competencies, resilience patterns, and migration strategies. Do you have any architectural questions for me regarding this engineering role?',
    technicalFeedback: 'Clear articulation of architectural principles. Consider quantifying reliability targets with specific SLAs/SLOs (e.g. 99.99% availability).',
    suggestedAnswer: 'Frame the answer around the CAP theorem trade-offs and cite metrics such as MTTR, MTTD, and connection pool queuing latency.',
    feedbackSummary: 'Candidate demonstrated solid technical fundamentals, thorough debugging methodology, and strong grasp of distributed system failure modes.',
    strengths: [
      'Methodical diagnostic approach to connection pool exhaustion',
      'Clear understanding of blue/green and canary deployment trade-offs',
      'Concise verbal communication with accurate terminology',
    ],
    growthAreas: [
      'Incorporate concrete latency percentiles (p95, p99) when discussing performance',
      'Discuss automated rollback strategies with distributed circuit breakers',
    ],
  };
}

export function createFallbackInterviewSession(
  roleTrackId: string,
  targetDurationMinutes = 20,
): InterviewSessionData {
  const role =
    DEFAULT_ROLES_CATALOG.find((r) => r.id === roleTrackId || r.slug === roleTrackId) ||
    DEFAULT_ROLES_CATALOG[0];

  const dialogue = getRoleInterviewDialogue(role.slug || role.id);
  const sessionId = `interview-${role.slug}-${Date.now()}`;
  const initialMessage: InterviewMessageData = {
    id: `msg-${Date.now()}-1`,
    sender: 'AI_INTERVIEWER',
    content: dialogue.introQuestion,
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

  const roleSlug = session.roleTrack?.slug || DEFAULT_ROLES_CATALOG[0].slug;
  const dialogue = getRoleInterviewDialogue(roleSlug);
  const turn = session.messages.length + 1;

  const candMsg: InterviewMessageData = {
    id: `msg-cand-${Date.now()}`,
    sender: 'CANDIDATE',
    content: candidateContent,
    stage: session.currentStage,
    turnNumber: turn,
    technicalFeedback: dialogue.technicalFeedback,
    suggestedBetterAnswer: dialogue.suggestedAnswer,
    createdAt: new Date().toISOString(),
  };

  // Stage progression logic
  let nextStage: 'INTRODUCTION' | 'TECHNICAL_DRILL' | 'SCENARIO_DESIGN' | 'WRAPUP' =
    session.currentStage;
  let nextPrompt = '';

  if (session.currentStage === 'INTRODUCTION') {
    nextStage = 'TECHNICAL_DRILL';
    nextPrompt = dialogue.technicalDrillPrompt;
  } else if (session.currentStage === 'TECHNICAL_DRILL') {
    nextStage = 'SCENARIO_DESIGN';
    nextPrompt = dialogue.scenarioDesignPrompt;
  } else if (session.currentStage === 'SCENARIO_DESIGN') {
    nextStage = 'WRAPUP';
    nextPrompt = dialogue.wrapupPrompt;
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

  const roleSlug = session.roleTrack?.slug || DEFAULT_ROLES_CATALOG[0].slug;
  const dialogue = getRoleInterviewDialogue(roleSlug);

  session.status = 'COMPLETED';
  session.completedAt = new Date().toISOString();
  session.overallScore = 88;
  session.technicalScore = 90;
  session.clarityScore = 86;
  session.feedbackSummary = dialogue.feedbackSummary;
  session.strengths = dialogue.strengths;
  session.growthAreas = dialogue.growthAreas;

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
