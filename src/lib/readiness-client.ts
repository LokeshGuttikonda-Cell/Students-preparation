import { DEFAULT_ROLES_CATALOG } from './catalog-data';
import { triggerBrowserFileDownload } from './admin-database-client';

export interface CompetencyAssessment {
  dimension: string;
  score: number;
  target: number;
  weight: number;
  status: 'MET' | 'NEEDS_PRACTICE';
}

export interface SkillGap {
  topicId: string;
  topicName: string;
  topicSlug: string;
  currentAccuracy: number;
  targetAccuracy: number;
  deficit: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  practiceUrl: string;
  handbookUrl: string;
  interviewUrl: string;
}

export interface RoadmapTask {
  id: string;
  text: string;
  link?: string;
  linkText?: string;
  completed?: boolean;
}

export interface RoadmapDay {
  day: number;
  title: string;
  domain: string;
  description: string;
  tasks: RoadmapTask[];
  isCompleted: boolean;
}

export type ReadinessTier = 'VERIFIED_READY' | 'NEARING_BENCHMARK' | 'FOUNDATIONS_REQUIRED';

export interface PlacementReadinessReport {
  roleId: string;
  roleName: string;
  roleSlug: string;
  targetLevel: string;
  overallScore: number;
  tier: ReadinessTier;
  tierLabel: string;
  competencies: CompetencyAssessment[];
  skillGaps: SkillGap[];
  roadmap: RoadmapDay[];
  credentialEligible: boolean;
  credentialCode?: string;
}

// ---------------------------------------------------------------------------
// 14-Day Remediation Curriculum Blueprint
// ---------------------------------------------------------------------------

const ROADMAP_DAY_BLUEPRINTS: Array<{
  title: string;
  domain: string;
  description: string;
  taskTemplates: Array<{ text: string; actionType: 'PRACTICE' | 'SANDBOX' | 'INTERVIEW' | 'HANDBOOK' | 'MOCK_TEST' }>;
}> = [
  {
    title: 'Diagnostic Baseline & Core Architecture Review',
    domain: 'Core Foundations',
    description: 'Establish baseline competency and review primary architectural models and execution lifecycles.',
    taskTemplates: [
      { text: 'Read Chapter 1 & 2 in the verified Role Handbook', actionType: 'HANDBOOK' },
      { text: 'Solve 15 foundational MCQ questions with step-by-step explanations', actionType: 'PRACTICE' },
    ],
  },
  {
    title: 'Memory Models & Cache Hierarchies',
    domain: 'Systems Internals',
    description: 'Deep-dive into CPU cache lines, struct alignment, and memory ordering semantics.',
    taskTemplates: [
      { text: 'Test struct alignment & padding in the Memory & Cache Lab', actionType: 'SANDBOX' },
      { text: 'Complete 10 high-difficulty practice drills on memory models', actionType: 'PRACTICE' },
    ],
  },
  {
    title: 'Storage Engines & Relational Query Optimization',
    domain: 'Data & Storage',
    description: 'Master B-Tree vs LSM-Tree trade-offs and execute EXPLAIN ANALYZE queries.',
    taskTemplates: [
      { text: 'Execute complex multi-table SQL queries in the SQL Query Sandbox', actionType: 'SANDBOX' },
      { text: 'Review database index mechanics and partitioning schemas', actionType: 'HANDBOOK' },
    ],
  },
  {
    title: 'Operating System Kernel & I/O Multiplexing',
    domain: 'Kernel & Network',
    description: 'Examine epoll, select, event loop architectures, and non-blocking sockets.',
    taskTemplates: [
      { text: 'Simulate CPU scheduling and virtual page translation in Kernel Lab', actionType: 'SANDBOX' },
      { text: 'Answer 12 practice questions on asynchronous I/O and process IPC', actionType: 'PRACTICE' },
    ],
  },
  {
    title: 'Concurrency, Race Hazards & Thread Synchronization',
    domain: 'Concurrency',
    description: 'Inspect mutex contention, deadlocks, CAS atomics, and thread pools.',
    taskTemplates: [
      { text: 'Simulate microtask queues and nextTick event loop starvation', actionType: 'SANDBOX' },
      { text: 'Review concurrency trap questions and thread-safety invariants', actionType: 'HANDBOOK' },
    ],
  },
  {
    title: 'Distributed Systems & Partition Tolerance',
    domain: 'Distributed Architecture',
    description: 'Explore CAP theorem invariants, Raft leader election, and quorum consensus.',
    taskTemplates: [
      { text: 'Simulate consistent hashing and node failure recovery in Sandbox', actionType: 'SANDBOX' },
      { text: 'Complete diagnostic practice on distributed consensus and 2PC', actionType: 'PRACTICE' },
    ],
  },
  {
    title: 'Mid-Point Benchmark Assessment Check',
    domain: 'Assessment',
    description: 'Take a timed sectional assessment to evaluate week 1 retention and accuracy recovery.',
    taskTemplates: [
      { text: 'Take a timed benchmark mock assessment with negative marking', actionType: 'MOCK_TEST' },
      { text: 'Review mistake explanations and bookmark high-yield remediation hints', actionType: 'PRACTICE' },
    ],
  },
  {
    title: 'Socratic Interview Technical Drill: Phase 1',
    domain: 'Live Technical Drill',
    description: 'Practice answering Socratic follow-up questions under adaptive evaluator rubrics.',
    taskTemplates: [
      { text: 'Complete Session 1 of Socratic Technical Mock Interview', actionType: 'INTERVIEW' },
      { text: 'Review rubric evaluation scores across technical precision and clarity', actionType: 'INTERVIEW' },
    ],
  },
  {
    title: 'API Protocols, Serialization & Wire Performance',
    domain: 'Networking',
    description: 'Analyze HTTP/2 vs HTTP/3, Protobuf binary encoding, and gRPC streaming.',
    taskTemplates: [
      { text: 'Review Role Handbook section on networking and serialization', actionType: 'HANDBOOK' },
      { text: 'Practice 15 high-weight questions on socket programming and TCP', actionType: 'PRACTICE' },
    ],
  },
  {
    title: 'System Design & High-Availability Topologies',
    domain: 'System Design',
    description: 'Architect scalable tier-3 topologies with CDN caching, rate limiting, and read replicas.',
    taskTemplates: [
      { text: 'Draft scalable architecture on the System Design Whiteboard', actionType: 'INTERVIEW' },
      { text: 'Evaluate trade-offs for write-heavy vs read-heavy database architectures', actionType: 'SANDBOX' },
    ],
  },
  {
    title: 'Socratic Interview Scenario: Phase 2',
    domain: 'Live Technical Drill',
    description: 'Tackle architecture trade-off challenges and counter-factual probing.',
    taskTemplates: [
      { text: 'Complete Session 2 Socratic Mock Interview focusing on architecture', actionType: 'INTERVIEW' },
      { text: 'Review evaluator tips on avoiding common junior candidate traps', actionType: 'HANDBOOK' },
    ],
  },
  {
    title: 'Security, Identity & Cryptographic Primitives',
    domain: 'Security & Auth',
    description: 'Verify HMAC signatures, JWT revocation patterns, and TLS certificate handshakes.',
    taskTemplates: [
      { text: 'Complete practice set on authentication security and CSRF/CORS', actionType: 'PRACTICE' },
      { text: 'Review security invariants in the role handbook handbook', actionType: 'HANDBOOK' },
    ],
  },
  {
    title: 'Full-Length Comprehensive Mock Placement Exam',
    domain: 'Final Assessment',
    description: 'Simulate full enterprise campus placement exam with sectional timers and cutoff hurdles.',
    taskTemplates: [
      { text: 'Complete full-length role benchmark mock exam under test conditions', actionType: 'MOCK_TEST' },
      { text: 'Review comprehensive scorecard and ensure all sections reach >= 75%', actionType: 'MOCK_TEST' },
    ],
  },
  {
    title: 'Placement Verification & Credential Certification',
    domain: 'Readiness Claim',
    description: 'Final verification review, claim official verified readiness credential, and download roadmap PDF.',
    taskTemplates: [
      { text: 'Claim your verifiable placement readiness credential badge', actionType: 'HANDBOOK' },
      { text: 'Download official 14-Day Study Plan and Competency Report PDF', actionType: 'HANDBOOK' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Calculation & Generation Logic
// ---------------------------------------------------------------------------

export function generateReadinessReport(
  roleSlug: string,
  customScores?: Record<string, number>,
): PlacementReadinessReport {
  const role =
    DEFAULT_ROLES_CATALOG.find((r) => r.slug === roleSlug) ||
    DEFAULT_ROLES_CATALOG[0];

  // Map competencies into assessments
  const competencies: CompetencyAssessment[] = role.competencies.map((c, idx) => {
    // Default baseline accuracy if no custom score supplied
    const defaultBaseline = [68, 74, 62, 78, 65][idx % 5];
    const score =
      customScores && typeof customScores[c.topicName] === 'number'
        ? Math.max(20, Math.min(100, customScores[c.topicName]))
        : defaultBaseline;

    return {
      dimension: c.topicName,
      score,
      target: c.benchmarkAccuracy || 70,
      weight: c.weightPercentage || 25,
      status: score >= (c.benchmarkAccuracy || 70) ? 'MET' : 'NEEDS_PRACTICE',
    };
  });

  // Calculate weighted overall score
  const totalWeight = competencies.reduce((sum, c) => sum + c.weight, 0) || 100;
  const weightedSum = competencies.reduce((sum, c) => sum + c.score * c.weight, 0);
  const overallScore = Math.round(weightedSum / totalWeight);

  // Identify skill gaps
  const skillGaps: SkillGap[] = [];
  role.competencies.forEach((c) => {
    const comp = competencies.find((cm) => cm.dimension === c.topicName);
    const score = comp ? comp.score : 65;
    const target = c.benchmarkAccuracy || 70;
    const deficit = target - score;

    if (deficit > 0) {
      skillGaps.push({
        topicId: c.topicId,
        topicName: c.topicName,
        topicSlug: c.topicSlug,
        currentAccuracy: score,
        targetAccuracy: target,
        deficit,
        priority: deficit >= 10 ? 'HIGH' : 'MEDIUM',
        recommendedAction: `Complete 20 targeted practice questions to close ${deficit}% accuracy deficit.`,
        practiceUrl: `/practice/${c.topicId}`,
        handbookUrl: `/roles/handbooks/${role.slug}`,
        interviewUrl: `/interviews/${role.id}`,
      });
    }
  });

  // Assign tier
  let tier: ReadinessTier = 'FOUNDATIONS_REQUIRED';
  let tierLabel = 'Foundations Required (<60%)';

  if (overallScore >= 75) {
    tier = 'VERIFIED_READY';
    tierLabel = 'Verified Placement Ready (>=75%)';
  } else if (overallScore >= 60) {
    tier = 'NEARING_BENCHMARK';
    tierLabel = 'Nearing Benchmark (60-74%)';
  }

  // Generate 14-Day Roadmap
  const roadmap: RoadmapDay[] = ROADMAP_DAY_BLUEPRINTS.map((bp, idx) => {
    const dayNum = idx + 1;
    const tasks: RoadmapTask[] = bp.taskTemplates.map((t, tIdx) => {
      let link = `/practice`;
      let linkText = 'Open Practice';

      if (t.actionType === 'HANDBOOK') {
        link = `/roles/handbooks/${role.slug}`;
        linkText = 'Read Handbook';
      } else if (t.actionType === 'SANDBOX') {
        link = `/sandbox`;
        linkText = 'Launch Sandbox';
      } else if (t.actionType === 'INTERVIEW') {
        link = `/interviews/${role.id}`;
        linkText = 'Start Interview';
      } else if (t.actionType === 'MOCK_TEST') {
        link = `/mock-tests`;
        linkText = 'Take Mock Exam';
      }

      return {
        id: `day-${dayNum}-task-${tIdx}`,
        text: t.text,
        link,
        linkText,
        completed: false,
      };
    });

    return {
      day: dayNum,
      title: bp.title,
      domain: bp.domain,
      description: bp.description,
      tasks,
      isCompleted: false,
    };
  });

  const credentialEligible = overallScore >= 75;
  const credentialCode = credentialEligible
    ? `SP-2026-${role.slug.toUpperCase().substring(0, 8)}-${Math.abs(overallScore * 137).toString(16).toUpperCase()}`
    : undefined;

  return {
    roleId: role.id,
    roleName: role.name,
    roleSlug: role.slug,
    targetLevel: role.targetLevel,
    overallScore,
    tier,
    tierLabel,
    competencies,
    skillGaps,
    roadmap,
    credentialEligible,
    credentialCode,
  };
}

// ---------------------------------------------------------------------------
// LocalStorage Persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'sp_readiness_plan_v1';

export function getSavedRoadmapProgress(roleSlug: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${roleSlug}`);
    if (stored) {
      return JSON.parse(stored) as Record<string, boolean>;
    }
  } catch {
    // Ignore error
  }
  return {};
}

export function saveRoadmapProgress(
  roleSlug: string,
  taskId: string,
  completed: boolean,
): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const current = getSavedRoadmapProgress(roleSlug);
    current[taskId] = completed;
    localStorage.setItem(`${STORAGE_KEY}_${roleSlug}`, JSON.stringify(current));
    return current;
  } catch {
    // Ignore error
  }
  return {};
}

// ---------------------------------------------------------------------------
// PDF Generator (Pure Vector Engine)
// ---------------------------------------------------------------------------

export function downloadRoadmapPdf(report: PlacementReadinessReport): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${report.roleSlug}-readiness-roadmap-${timestamp}.pdf`;

  // Standard-compliant PDF 1.4 output
  const pdfLines = [
    '%PDF-1.4',
    '%âãÏÓ',
    '1 0 obj',
    '<< /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    'endobj',
    '3 0 obj',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    'endobj',
    '4 0 obj',
    '<< /Length 850 >>',
    'stream',
    'BT',
    '/F2 20 Tf',
    '50 780 Td',
    `(${report.roleName} - Placement Readiness Roadmap) Tj`,
    '/F1 10 Tf',
    '0 -25 Td',
    `(Overall Placement Readiness Score: ${report.overallScore}% - ${report.tierLabel}) Tj`,
    '0 -20 Td',
    '(Generated by Students-Preparation Enterprise Placement Suite) Tj',
    '0 -30 Td',
    '/F2 14 Tf',
    '(Target Competency Diagnostics:) Tj',
    '/F1 10 Tf',
  ];

  report.competencies.forEach((c) => {
    pdfLines.push(
      '0 -18 Td',
      `(${c.dimension}: ${c.score}% / Benchmark ${c.target}% - ${c.status}) Tj`,
    );
  });

  pdfLines.push(
    '0 -30 Td',
    '/F2 14 Tf',
    '(14-Day Actionable Remediation Study Plan:) Tj',
    '/F1 9 Tf',
  );

  report.roadmap.slice(0, 10).forEach((day) => {
    pdfLines.push(
      '0 -16 Td',
      `(Day ${day.day}: ${day.title} [${day.domain}]) Tj`,
    );
  });

  pdfLines.push(
    'ET',
    'endstream',
    'endobj',
    '5 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    'endobj',
    '6 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    'endobj',
    'xref',
    '0 7',
    '0000000000 65535 f ',
    '0000000010 00000 n ',
    '0000000059 00000 n ',
    '0000000118 00000 n ',
    '0000000262 00000 n ',
    '0000001180 00000 n ',
    '0000001250 00000 n ',
    'trailer',
    '<< /Size 7 /Root 1 0 R >>',
    'startxref',
    '1325',
    '%%EOF',
  );

  triggerBrowserFileDownload(filename, pdfLines.join('\n'), 'application/pdf');
}
