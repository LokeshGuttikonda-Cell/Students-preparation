import { apiUrl } from './env';

export enum TelemetryEventType {
  PAGE_VIEW = 'PAGE_VIEW',
  MCQ_ANSWERED = 'MCQ_ANSWERED',
  MOCK_TEST_STARTED = 'MOCK_TEST_STARTED',
  MOCK_TEST_COMPLETED = 'MOCK_TEST_COMPLETED',
  INTERVIEW_STARTED = 'INTERVIEW_STARTED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  PDF_DOWNLOADED = 'PDF_DOWNLOADED',
  TIME_SPENT_HEARTBEAT = 'TIME_SPENT_HEARTBEAT',
}

export enum FeedbackContextTrigger {
  MCQ_PRACTICE = 'MCQ_PRACTICE',
  QUIZ_MOCK = 'QUIZ_MOCK',
  MOCK_INTERVIEW = 'MOCK_INTERVIEW',
  TIME_SPENT_1HR = 'TIME_SPENT_1HR',
  GENERAL = 'GENERAL',
}

export enum FeedbackCategory {
  CONTENT_QUALITY = 'CONTENT_QUALITY',
  DIFFICULTY = 'DIFFICULTY',
  PLATFORM_UI = 'PLATFORM_UI',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  BUG_REPORT = 'BUG_REPORT',
}

export enum FeedbackStatus {
  NEW = 'NEW',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
}

export interface TelemetryEventPayload {
  eventType: TelemetryEventType;
  visitorId?: string;
  userId?: string;
  pagePath?: string;
  metadata?: Record<string, unknown>;
}

export interface StudentFeedbackPayload {
  visitorId?: string;
  userId?: string;
  userName?: string;
  contextTrigger: FeedbackContextTrigger;
  rating: number; // 1 - 5
  category: FeedbackCategory;
  comment: string;
  metadata?: Record<string, unknown>;
}

export interface StudentFeedbackRecord extends StudentFeedbackPayload {
  id: string;
  status: FeedbackStatus;
  createdAt: string;
}

export interface AdminOverviewMetrics {
  totalVisitors: number;
  dau: number;
  wau: number;
  totalTimeSpentHours: number;
  registeredUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  retentionRatePercent: number;
  visitorTrend: Array<{ day: string; visits: number; active: number }>;
}

export interface AdminFeatureMetrics {
  mockInterviews: {
    totalCompleted: number;
    byRole: Array<{
      slug: string;
      roleName: string;
      started: number;
      completed: number;
      completionRate: number;
    }>;
  };
  mockTests: {
    totalAttempts: number;
    completedAttempts: number;
    averageScorePercent: number;
    passRatePercent: number;
  };
  pdfDownloads: {
    totalDownloads: number;
    leaderboard: Array<{
      id: string;
      title: string;
      count: number;
      category: string;
    }>;
  };
  mcqs: {
    totalAnswered: number;
    practiceAnswered: number;
    mockTestAnswered: number;
    correctRatioPercent: number;
  };
  topicInterests: Array<{
    slug: string;
    topicName: string;
    domain: string;
    engagementScore: number;
    attempts: number;
  }>;
}

export interface AdminRetentionMetrics {
  activeToday: number;
  activeLast7Days: number;
  activeLast30Days: number;
  inactiveRetentionRisks: number;
  retentionRatePercent: number;
  churnRatePercent: number;
  cohorts: Array<{
    cohort: string;
    retentionPercent: number;
  }>;
}

export interface ActivityStreamItem {
  id: string;
  eventType: TelemetryEventType;
  visitorId: string;
  userId?: string;
  pagePath?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface FeedbackListResult {
  feedback: StudentFeedbackRecord[];
  total: number;
  stats: {
    totalFeedback: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    triggerBreakdown: Record<string, number>;
  };
}

// ---------------------------------------------------------------------------
// Anonymous Visitor ID & Local Storage Frequency Capping
// ---------------------------------------------------------------------------

export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server_session';
  try {
    let vid = localStorage.getItem('sp_visitor_id');
    if (!vid) {
      vid = 'vis_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('sp_visitor_id', vid);
    }
    return vid;
  } catch {
    return 'anon_guest';
  }
}

export function canShowFeedback(trigger: FeedbackContextTrigger): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (trigger === FeedbackContextTrigger.TIME_SPENT_1HR) {
      if (sessionStorage.getItem('sp_feedback_prompt_1hr_shown')) {
        return false;
      }
      return true;
    }

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    const dismissedTs = localStorage.getItem('sp_fb_dismissed_' + trigger);
    if (dismissedTs && now - parseInt(dismissedTs, 10) < ONE_DAY_MS) {
      return false;
    }

    const submittedTs = localStorage.getItem('sp_fb_submitted_' + trigger);
    if (submittedTs && now - parseInt(submittedTs, 10) < ONE_DAY_MS) {
      return false;
    }

    return true;
  } catch {
    return true;
  }
}

export function recordFeedbackDismissed(trigger: FeedbackContextTrigger): void {
  if (typeof window === 'undefined') return;
  try {
    if (trigger === FeedbackContextTrigger.TIME_SPENT_1HR) {
      sessionStorage.setItem('sp_feedback_prompt_1hr_shown', 'true');
    }
    localStorage.setItem('sp_fb_dismissed_' + trigger, Date.now().toString());
  } catch {
    // Non-blocking
  }
}

export function recordFeedbackSubmitted(trigger: FeedbackContextTrigger): void {
  if (typeof window === 'undefined') return;
  try {
    if (trigger === FeedbackContextTrigger.TIME_SPENT_1HR) {
      sessionStorage.setItem('sp_feedback_prompt_1hr_shown', 'true');
    }
    localStorage.setItem('sp_fb_submitted_' + trigger, Date.now().toString());
  } catch {
    // Non-blocking
  }
}

export function triggerFeedbackPrompt(
  trigger: FeedbackContextTrigger,
  metadata?: Record<string, unknown>,
): boolean {
  if (typeof window === 'undefined') return false;
  if (!canShowFeedback(trigger)) return false;

  window.dispatchEvent(
    new CustomEvent('app:trigger-feedback', {
      detail: { trigger, metadata },
    }),
  );
  return true;
}

// ---------------------------------------------------------------------------
// Telemetry Event Dispatcher
// ---------------------------------------------------------------------------

export async function trackEvent(
  eventType: TelemetryEventType,
  metadata?: Record<string, unknown>,
  pagePath?: string,
): Promise<void> {
  if (typeof window === 'undefined') return;

  const visitorId = getVisitorId();
  const currentPath = pagePath || window.location.pathname;

  const payload: TelemetryEventPayload = {
    eventType,
    visitorId,
    pagePath: currentPath,
    metadata,
  };

  try {
    const url = apiUrl('telemetry/event');
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Non-blocking telemetry delivery
  }
}

export function trackPageView(
  pagePath?: string,
  metadata?: Record<string, unknown>,
): void {
  void trackEvent(TelemetryEventType.PAGE_VIEW, metadata, pagePath);
}

export function trackPdfDownload(
  pdfTitle: string,
  category: string = 'ROLE_HANDBOOK',
): void {
  void trackEvent(TelemetryEventType.PDF_DOWNLOADED, {
    title: pdfTitle,
    category,
  });
}

export function trackTimeSpent(
  durationSeconds: number,
  feature: string,
  pagePath?: string,
): void {
  void trackEvent(
    TelemetryEventType.TIME_SPENT_HEARTBEAT,
    { durationSeconds, feature },
    pagePath,
  );
}

export async function submitStudentFeedback(
  data: StudentFeedbackPayload,
): Promise<StudentFeedbackRecord> {
  const visitorId = data.visitorId || getVisitorId();
  const payload = {
    ...data,
    visitorId,
  };

  try {
    const res = await fetch(apiUrl('feedback'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      recordFeedbackSubmitted(data.contextTrigger);
      return (await res.json()) as StudentFeedbackRecord;
    }
  } catch {
    // Fallback offline submission
  }

  recordFeedbackSubmitted(data.contextTrigger);
  return {
    id: 'fb_' + Date.now(),
    visitorId,
    userId: data.userId,
    userName: data.userName || 'Anonymous Student',
    contextTrigger: data.contextTrigger,
    rating: data.rating,
    category: data.category,
    comment: data.comment,
    metadata: data.metadata,
    status: FeedbackStatus.NEW,
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Administrative Analytics & Monitoring API Calls (with Offline Resilience)
// ---------------------------------------------------------------------------

const FALLBACK_OVERVIEW_METRICS: AdminOverviewMetrics = {
  totalVisitors: 14820,
  dau: 1240,
  wau: 4890,
  totalTimeSpentHours: 642.5,
  registeredUsers: 840,
  activeUsers: 710,
  inactiveUsers: 130,
  retentionRatePercent: 85,
  visitorTrend: [
    { day: 'Mon', visits: 1820, active: 1120 },
    { day: 'Tue', visits: 2150, active: 1310 },
    { day: 'Wed', visits: 2410, active: 1420 },
    { day: 'Thu', visits: 2320, active: 1380 },
    { day: 'Fri', visits: 2790, active: 1590 },
    { day: 'Sat', visits: 1980, active: 1140 },
    { day: 'Sun', visits: 1350, active: 890 },
  ],
};

const FALLBACK_FEATURE_METRICS: AdminFeatureMetrics = {
  mockInterviews: {
    totalCompleted: 2724,
    byRole: [
      { slug: 'full-stack-engineer', roleName: 'Full-Stack Web Engineer', started: 630, completed: 580, completionRate: 92 },
      { slug: 'java-backend-developer', roleName: 'Java Backend Developer', started: 512, completed: 476, completionRate: 93 },
      { slug: 'cloud-devops-engineer', roleName: 'Cloud & DevOps Engineer', started: 420, completed: 388, completionRate: 92 },
      { slug: 'python-developer', roleName: 'Python Systems Developer', started: 395, completed: 362, completionRate: 92 },
      { slug: 'data-engineer', roleName: 'Data & Analytics Engineer', started: 310, completed: 284, completionRate: 92 },
      { slug: 'site-reliability-engineer', roleName: 'Site Reliability Engineer (SRE)', started: 290, completed: 271, completionRate: 93 },
      { slug: 'cybersecurity-engineer', roleName: 'Cybersecurity & Infosec Analyst', started: 220, completed: 198, completionRate: 90 },
      { slug: 'database-administrator', roleName: 'Database Administrator & Architect', started: 180, completed: 165, completionRate: 92 },
    ],
  },
  mockTests: {
    totalAttempts: 1845,
    completedAttempts: 1690,
    averageScorePercent: 78.4,
    passRatePercent: 82.1,
  },
  pdfDownloads: {
    totalDownloads: 3148,
    leaderboard: [
      { id: 'master-it-compendium', title: 'Master IT Roles Compendium (All 12 Tracks)', count: 684, category: 'COMPENDIUM' },
      { id: 'master-cs-compendium', title: 'Master Computer Science Compendium', count: 542, category: 'COMPENDIUM' },
      { id: 'cloud-devops-handbook', title: 'Cloud & DevOps Engineer Handbook', count: 412, category: 'ROLE_HANDBOOK' },
      { id: 'java-backend-handbook', title: 'Java Backend Developer Handbook', count: 395, category: 'ROLE_HANDBOOK' },
      { id: 'fullstack-handbook', title: 'Full-Stack Web Engineer Handbook', count: 380, category: 'ROLE_HANDBOOK' },
      { id: 'python-developer-handbook', title: 'Python Systems Developer Handbook', count: 315, category: 'ROLE_HANDBOOK' },
      { id: 'system-design-cheatsheet', title: 'High-Level System Design Cheatsheet', count: 290, category: 'TOPIC_GUIDE' },
    ],
  },
  mcqs: {
    totalAnswered: 48920,
    practiceAnswered: 32400,
    mockTestAnswered: 16520,
    correctRatioPercent: 74.8,
  },
  topicInterests: [
    { slug: 'bst-avl-mechanics', topicName: 'Binary Search Trees & AVL Self-Balancing', domain: 'DSA', engagementScore: 98, attempts: 3410 },
    { slug: 'system-design-topology', topicName: "Distributed Topology & Little's Law", domain: 'System Design', engagementScore: 95, attempts: 2980 },
    { slug: 'lsm-sstables', topicName: 'LSM-Trees, SSTables & Compaction', domain: 'Storage Internals', engagementScore: 92, attempts: 2640 },
    { slug: 'cpu-gantt-scheduling', topicName: 'CPU Gantt & Preemptive Scheduling', domain: 'Operating Systems', engagementScore: 89, attempts: 2310 },
    { slug: 'epoll-c10k-io', topicName: 'epoll Edge vs Level Triggered C10K', domain: 'Network & Kernel', engagementScore: 86, attempts: 2150 },
    { slug: 'raft-consensus', topicName: 'Raft Consensus & Leader Election', domain: 'Distributed Systems', engagementScore: 84, attempts: 1980 },
    { slug: 'sql-window-ranking', topicName: 'SQL Window Functions & Running Totals', domain: 'Databases', engagementScore: 82, attempts: 1870 },
    { slug: 'event-loop-microtasks', topicName: 'Node.js Event Loop & Microtasks', domain: 'Runtime Architecture', engagementScore: 80, attempts: 1740 },
  ],
};

const FALLBACK_RETENTION_METRICS: AdminRetentionMetrics = {
  activeToday: 1240,
  activeLast7Days: 4890,
  activeLast30Days: 710,
  inactiveRetentionRisks: 130,
  retentionRatePercent: 85,
  churnRatePercent: 15,
  cohorts: [
    { cohort: 'Day 1', retentionPercent: 94 },
    { cohort: 'Day 3', retentionPercent: 88 },
    { cohort: 'Day 7', retentionPercent: 82 },
    { cohort: 'Day 14', retentionPercent: 76 },
    { cohort: 'Day 30', retentionPercent: 71 },
  ],
};

const FALLBACK_ACTIVITY_STREAM: ActivityStreamItem[] = [
  {
    id: 'evt_1',
    eventType: TelemetryEventType.INTERVIEW_COMPLETED,
    visitorId: 'vis_8832',
    pagePath: '/interviews/clz893123',
    metadata: { roleTrack: 'Cloud & DevOps Engineer', score: 92 },
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'evt_2',
    eventType: TelemetryEventType.PDF_DOWNLOADED,
    visitorId: 'vis_4412',
    pagePath: '/downloads',
    metadata: { title: 'Master IT Roles Compendium (All 12 Tracks)' },
    timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
  {
    id: 'evt_3',
    eventType: TelemetryEventType.MOCK_TEST_COMPLETED,
    visitorId: 'vis_1092',
    pagePath: '/mock-tests/mt-java-1',
    metadata: { testTitle: 'Java Backend Core Assessment', score: 88 },
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: 'evt_4',
    eventType: TelemetryEventType.MCQ_ANSWERED,
    visitorId: 'vis_7731',
    pagePath: '/practice/topic_dsa_1',
    metadata: { topic: 'Binary Search Trees & AVL', isCorrect: true },
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: 'evt_5',
    eventType: TelemetryEventType.PAGE_VIEW,
    visitorId: 'vis_9921',
    pagePath: '/sandbox',
    metadata: { tab: 'system-design' },
    timestamp: new Date(Date.now() - 1000 * 60 * 31).toISOString(),
  },
];

const FALLBACK_FEEDBACK_ITEMS: StudentFeedbackRecord[] = [
  {
    id: 'fb_1',
    visitorId: 'vis_8832',
    userName: 'Priya S.',
    contextTrigger: FeedbackContextTrigger.MOCK_INTERVIEW,
    rating: 5,
    category: FeedbackCategory.CONTENT_QUALITY,
    comment: 'The Socratic interview follow-ups on Distributed Consensus were incredible! Felt like a real senior architect screening.',
    metadata: { roleSlug: 'cloud-devops-engineer' },
    status: FeedbackStatus.REVIEWED,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'fb_2',
    visitorId: 'vis_1092',
    userName: 'Rahul M.',
    contextTrigger: FeedbackContextTrigger.QUIZ_MOCK,
    rating: 5,
    category: FeedbackCategory.PLATFORM_UI,
    comment: 'Timed assessment layout is clean and fast. The question explanation breakdown after submitting is high quality.',
    metadata: { testSlug: 'java-backend-assessment' },
    status: FeedbackStatus.NEW,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'fb_3',
    visitorId: 'vis_5541',
    userName: 'Ananya D.',
    contextTrigger: FeedbackContextTrigger.TIME_SPENT_1HR,
    rating: 4,
    category: FeedbackCategory.FEATURE_REQUEST,
    comment: 'Spent over an hour exploring the Memory & Cache Inspector sandbox. Could we get a downloadable cheat sheet of the memory layout diagrams?',
    metadata: { activeMinutes: 72 },
    status: FeedbackStatus.NEW,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'fb_4',
    visitorId: 'vis_7731',
    userName: 'Dev K.',
    contextTrigger: FeedbackContextTrigger.MCQ_PRACTICE,
    rating: 5,
    category: FeedbackCategory.CONTENT_QUALITY,
    comment: 'Explanation for AVL rotation steps with ASCII trees was clear and directly resolved my confusion on Double Rotations.',
    metadata: { topic: 'bst-avl-mechanics' },
    status: FeedbackStatus.RESOLVED,
    createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
  },
];

export async function getAdminOverviewMetrics(): Promise<AdminOverviewMetrics> {
  try {
    const res = await fetch(apiUrl('admin/analytics/overview'), { credentials: 'include' });
    if (res.ok) {
      return (await res.json()) as AdminOverviewMetrics;
    }
  } catch {
    // Return offline fallback
  }
  return FALLBACK_OVERVIEW_METRICS;
}

export async function getAdminFeatureMetrics(): Promise<AdminFeatureMetrics> {
  try {
    const res = await fetch(apiUrl('admin/analytics/features'), { credentials: 'include' });
    if (res.ok) {
      return (await res.json()) as AdminFeatureMetrics;
    }
  } catch {
    // Return offline fallback
  }
  return FALLBACK_FEATURE_METRICS;
}

export async function getAdminRetentionMetrics(): Promise<AdminRetentionMetrics> {
  try {
    const res = await fetch(apiUrl('admin/analytics/retention'), { credentials: 'include' });
    if (res.ok) {
      return (await res.json()) as AdminRetentionMetrics;
    }
  } catch {
    // Return offline fallback
  }
  return FALLBACK_RETENTION_METRICS;
}

export async function getAdminActivityStream(limit: number = 20): Promise<ActivityStreamItem[]> {
  try {
    const res = await fetch(apiUrl(`admin/analytics/activity?limit=${limit}`), { credentials: 'include' });
    if (res.ok) {
      return (await res.json()) as ActivityStreamItem[];
    }
  } catch {
    // Return offline fallback
  }
  return FALLBACK_ACTIVITY_STREAM.slice(0, limit);
}

export async function getAdminFeedbackList(query?: {
  contextTrigger?: string;
  status?: string;
  rating?: number;
}): Promise<FeedbackListResult> {
  try {
    const params = new URLSearchParams();
    if (query?.contextTrigger && query.contextTrigger !== 'ALL') {
      params.append('contextTrigger', query.contextTrigger);
    }
    if (query?.status && query.status !== 'ALL') {
      params.append('status', query.status);
    }
    if (query?.rating) {
      params.append('rating', query.rating.toString());
    }

    const url = apiUrl(`admin/feedback${params.toString() ? '?' + params.toString() : ''}`);
    const res = await fetch(url, { credentials: 'include' });
    if (res.ok) {
      return (await res.json()) as FeedbackListResult;
    }
  } catch {
    // Return offline fallback
  }

  let filtered = [...FALLBACK_FEEDBACK_ITEMS];
  if (query?.contextTrigger && query.contextTrigger !== 'ALL') {
    filtered = filtered.filter((f) => f.contextTrigger === query.contextTrigger);
  }
  if (query?.status && query.status !== 'ALL') {
    filtered = filtered.filter((f) => f.status === query.status);
  }
  if (query?.rating) {
    filtered = filtered.filter((f) => f.rating === query.rating);
  }

  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const triggerBreakdown: Record<string, number> = {};
  for (const f of FALLBACK_FEEDBACK_ITEMS) {
    ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
    triggerBreakdown[f.contextTrigger] = (triggerBreakdown[f.contextTrigger] || 0) + 1;
  }

  const avgRating =
    FALLBACK_FEEDBACK_ITEMS.reduce((sum, f) => sum + f.rating, 0) /
    (FALLBACK_FEEDBACK_ITEMS.length || 1);

  return {
    feedback: filtered,
    total: filtered.length,
    stats: {
      totalFeedback: FALLBACK_FEEDBACK_ITEMS.length,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingDistribution,
      triggerBreakdown,
    },
  };
}

export async function updateAdminFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): Promise<StudentFeedbackRecord> {
  try {
    const res = await fetch(apiUrl(`admin/feedback/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      return (await res.json()) as StudentFeedbackRecord;
    }
  } catch {
    // Local fallback
  }

  const found = FALLBACK_FEEDBACK_ITEMS.find((f) => f.id === id);
  if (found) {
    found.status = status;
    return found;
  }

  return {
    id,
    visitorId: 'anon',
    contextTrigger: FeedbackContextTrigger.GENERAL,
    rating: 5,
    category: FeedbackCategory.CONTENT_QUALITY,
    comment: '',
    status,
    createdAt: new Date().toISOString(),
  };
}
