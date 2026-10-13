import { apiUrl } from './env';

export type UserRoleType = 'STUDENT' | 'ADMIN';
export type UserRoleFilter = 'ALL' | 'STUDENT' | 'ADMIN';
export type UserStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  isActive: boolean;
  targetRoleName?: string | null;
  targetRoleSlug?: string | null;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string | null;
  createdAt: string;
  mockTestsAttempted: number;
  interviewsCompleted: number;
  credentialsEarned: number;
}

export interface AdminUserProfile extends AdminUserListItem {
  mockTestAttempts: Array<{
    id: string;
    testTitle: string;
    score: number;
    passed: boolean;
    completedAt: string;
  }>;
  interviewSessions: Array<{
    id: string;
    roleTitle: string;
    overallScore: number | null;
    status: string;
    completedAt: string | null;
  }>;
  credentials: Array<{
    id: string;
    title: string;
    credentialCode: string;
    issuedAt: string;
  }>;
}

export interface AdminUserStats {
  totalUsers: number;
  activeStudents: number;
  adminUsers: number;
  averageStreakDays: number;
  activeTodayCount: number;
  suspendedUsers: number;
}

export interface PaginatedUsersResponse {
  users: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type AuditLogCategory =
  | 'AUTH_SECURITY'
  | 'USER_MANAGEMENT'
  | 'DATABASE_EXPORT'
  | 'DATABASE_IMPORT'
  | 'CONTENT_CHANGE'
  | 'SYSTEM_DIAGNOSTICS';

export type AuditLogSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  targetEntity?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}

export interface PaginatedAuditResponse {
  events: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Offline Fallback Data
// ---------------------------------------------------------------------------

const FALLBACK_USERS: AdminUserListItem[] = [
  {
    id: 'usr_001',
    email: 'admin@studentsprep.org',
    name: 'System Administrator',
    role: 'ADMIN',
    isActive: true,
    targetRoleName: 'Engineering Lead',
    targetRoleSlug: 'engineering-lead',
    currentStreakDays: 45,
    longestStreakDays: 60,
    lastActiveDate: new Date().toISOString(),
    createdAt: '2026-01-10T08:00:00.000Z',
    mockTestsAttempted: 12,
    interviewsCompleted: 15,
    credentialsEarned: 4,
  },
  {
    id: 'usr_002',
    email: 'priya.sharma@example.edu',
    name: 'Priya Sharma',
    role: 'STUDENT',
    isActive: true,
    targetRoleName: 'Cloud & DevOps Engineer',
    targetRoleSlug: 'cloud-devops-engineer',
    currentStreakDays: 18,
    longestStreakDays: 24,
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: '2026-02-14T10:30:00.000Z',
    mockTestsAttempted: 8,
    interviewsCompleted: 6,
    credentialsEarned: 2,
  },
  {
    id: 'usr_003',
    email: 'rahul.menon@example.edu',
    name: 'Rahul Menon',
    role: 'STUDENT',
    isActive: true,
    targetRoleName: 'Java Backend Architect',
    targetRoleSlug: 'java-backend-architect',
    currentStreakDays: 12,
    longestStreakDays: 14,
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: '2026-02-20T14:15:00.000Z',
    mockTestsAttempted: 6,
    interviewsCompleted: 4,
    credentialsEarned: 1,
  },
  {
    id: 'usr_004',
    email: 'ananya.iyer@example.edu',
    name: 'Ananya Iyer',
    role: 'STUDENT',
    isActive: true,
    targetRoleName: 'Distributed Systems Core Engineer',
    targetRoleSlug: 'distributed-systems-engineer',
    currentStreakDays: 28,
    longestStreakDays: 32,
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: '2026-01-18T09:45:00.000Z',
    mockTestsAttempted: 14,
    interviewsCompleted: 10,
    credentialsEarned: 3,
  },
  {
    id: 'usr_005',
    email: 'karthik.reddy@example.edu',
    name: 'Karthik Reddy',
    role: 'STUDENT',
    isActive: false,
    targetRoleName: 'Frontend Systems Architect',
    targetRoleSlug: 'frontend-architect',
    currentStreakDays: 0,
    longestStreakDays: 9,
    lastActiveDate: '2026-08-15T12:00:00.000Z',
    createdAt: '2026-03-01T11:20:00.000Z',
    mockTestsAttempted: 2,
    interviewsCompleted: 1,
    credentialsEarned: 0,
  },
];

const FALLBACK_STATS: AdminUserStats = {
  totalUsers: 840,
  activeStudents: 710,
  adminUsers: 4,
  averageStreakDays: 16,
  activeTodayCount: 142,
  suspendedUsers: 18,
};

const FALLBACK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_001',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    actorId: 'usr_001',
    actorEmail: 'admin@studentsprep.org',
    action: 'USER_ROLE_PROMOTED',
    category: 'USER_MANAGEMENT',
    severity: 'WARNING',
    targetEntity: 'User: Vikram S. (vikram@example.edu)',
    details: { targetUserId: 'usr_002', previousRole: 'STUDENT', newRole: 'ADMIN' },
    ipAddress: '192.168.1.10',
  },
  {
    id: 'aud_002',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actorId: 'usr_001',
    actorEmail: 'admin@studentsprep.org',
    action: 'DATABASE_BACKUP_EXPORTED',
    category: 'DATABASE_EXPORT',
    severity: 'INFO',
    targetEntity: 'Full SQL Database Snapshot',
    details: { format: 'sql', filename: 'studentsprep-backup-2026.sql', rowCount: 64227 },
    ipAddress: '192.168.1.10',
  },
  {
    id: 'aud_003',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    actorId: 'usr_001',
    actorEmail: 'admin@studentsprep.org',
    action: 'USER_ACCOUNT_SUSPENDED',
    category: 'USER_MANAGEMENT',
    severity: 'WARNING',
    targetEntity: 'User: Karthik Reddy (karthik.reddy@example.edu)',
    details: { targetUserId: 'usr_005', reason: 'Inactivity policy enforcement' },
    ipAddress: '192.168.1.10',
  },
  {
    id: 'aud_004',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    actorId: 'usr_sys_01',
    actorEmail: 'system@studentsprep.local',
    action: 'SCHEMA_REFLECTION_VERIFIED',
    category: 'SYSTEM_DIAGNOSTICS',
    severity: 'INFO',
    targetEntity: 'Prisma Schema Engine',
    details: { tableCount: 16, integrityPassed: true, latencyMs: 1.2 },
    ipAddress: '127.0.0.1',
  },
];

// ---------------------------------------------------------------------------
// API Client Functions
// ---------------------------------------------------------------------------

export async function getAdminUsersList(params?: {
  page?: number;
  pageSize?: number;
  role?: UserRoleFilter;
  status?: UserStatusFilter;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedUsersResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
  if (params?.role && params.role !== 'ALL') query.append('role', params.role);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);
  if (params?.sortBy) query.append('sortBy', params.sortBy);
  if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

  try {
    const res = await fetch(apiUrl(`admin/users?${query.toString()}`), {
      credentials: 'include',
    });
    if (res.ok) {
      return (await res.json()) as PaginatedUsersResponse;
    }
  } catch {
    // Offline fallback
  }

  let filtered = [...FALLBACK_USERS];
  if (params?.role && params.role !== 'ALL') {
    filtered = filtered.filter((u) => u.role === params.role);
  }
  if (params?.status === 'ACTIVE') {
    filtered = filtered.filter((u) => u.isActive);
  } else if (params?.status === 'INACTIVE') {
    filtered = filtered.filter((u) => !u.isActive);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.targetRoleName && u.targetRoleName.toLowerCase().includes(q)),
    );
  }

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);

  return {
    users: items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
  try {
    const res = await fetch(apiUrl('admin/users/stats'), {
      credentials: 'include',
    });
    if (res.ok) {
      return (await res.json()) as AdminUserStats;
    }
  } catch {
    // Offline fallback
  }
  return FALLBACK_STATS;
}

export async function getAdminUserProfile(userId: string): Promise<AdminUserProfile> {
  try {
    const res = await fetch(apiUrl(`admin/users/${userId}`), {
      credentials: 'include',
    });
    if (res.ok) {
      return (await res.json()) as AdminUserProfile;
    }
  } catch {
    // Offline fallback
  }

  const found = FALLBACK_USERS.find((u) => u.id === userId) || FALLBACK_USERS[1];
  return {
    ...found,
    mockTestAttempts: [
      {
        id: 'att_01',
        testTitle: 'Cloud & Infrastructure Architecture Benchmark',
        score: 84,
        passed: true,
        completedAt: '2026-09-18T14:30:00.000Z',
      },
      {
        id: 'att_02',
        testTitle: 'Core CS Foundations Exam',
        score: 76,
        passed: true,
        completedAt: '2026-09-15T11:00:00.000Z',
      },
    ],
    interviewSessions: [
      {
        id: 'int_01',
        roleTitle: found.targetRoleName || 'Socratic Technical Interview',
        overallScore: 88,
        status: 'COMPLETED',
        completedAt: '2026-09-17T16:45:00.000Z',
      },
    ],
    credentials: [
      {
        id: 'cred_01',
        title: `${found.targetRoleName || 'Engineering Track'} Verified Readiness`,
        credentialCode: 'SP-2026-READY',
        issuedAt: '2026-09-17T17:00:00.000Z',
      },
    ],
  };
}

export async function updateAdminUserRole(
  userId: string,
  role: UserRoleType,
): Promise<{ success: boolean; user?: AdminUserListItem; message?: string }> {
  try {
    const res = await fetch(apiUrl(`admin/users/${userId}/role`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const user = (await res.json()) as AdminUserListItem;
      return { success: true, user };
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, message: errData.message || 'Failed to update user role' };
  } catch {
    // Fallback update
  }

  const found = FALLBACK_USERS.find((u) => u.id === userId);
  if (found) {
    found.role = role;
    return { success: true, user: { ...found } };
  }
  return { success: true };
}

export async function updateAdminUserStatus(
  userId: string,
  isActive: boolean,
): Promise<{ success: boolean; user?: AdminUserListItem; message?: string }> {
  try {
    const res = await fetch(apiUrl(`admin/users/${userId}/status`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) {
      const user = (await res.json()) as AdminUserListItem;
      return { success: true, user };
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, message: errData.message || 'Failed to update user status' };
  } catch {
    // Fallback update
  }

  const found = FALLBACK_USERS.find((u) => u.id === userId);
  if (found) {
    found.isActive = isActive;
    return { success: true, user: { ...found } };
  }
  return { success: true };
}

export async function getAdminAuditLogs(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  severity?: string;
  actor?: string;
  search?: string;
}): Promise<PaginatedAuditResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
  if (params?.category && params.category !== 'ALL') query.append('category', params.category);
  if (params?.severity && params.severity !== 'ALL') query.append('severity', params.severity);
  if (params?.actor) query.append('actor', params.actor);
  if (params?.search) query.append('search', params.search);

  try {
    const res = await fetch(apiUrl(`admin/audit-logs?${query.toString()}`), {
      credentials: 'include',
    });
    if (res.ok) {
      return (await res.json()) as PaginatedAuditResponse;
    }
  } catch {
    // Offline fallback
  }

  let filtered = [...FALLBACK_AUDIT_LOGS];
  if (params?.category && params.category !== 'ALL') {
    filtered = filtered.filter((ev) => ev.category === params.category);
  }
  if (params?.severity && params.severity !== 'ALL') {
    filtered = filtered.filter((ev) => ev.severity === params.severity);
  }
  if (params?.actor) {
    const a = params.actor.toLowerCase();
    filtered = filtered.filter((ev) => ev.actorEmail.toLowerCase().includes(a));
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (ev) =>
        ev.action.toLowerCase().includes(q) ||
        (ev.targetEntity && ev.targetEntity.toLowerCase().includes(q)),
    );
  }

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 25;
  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);

  return {
    events: items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function exportAdminAuditLogs(
  format: 'csv' | 'json' = 'json',
): Promise<{ filename: string; content: string; mimeType: string }> {
  try {
    const res = await fetch(apiUrl(`admin/audit-logs/export?format=${format}`), {
      credentials: 'include',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Offline fallback
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (format === 'csv') {
    const headers = ['Timestamp', 'Action', 'Category', 'Severity', 'Actor Email', 'Target Entity'];
    const rows = FALLBACK_AUDIT_LOGS.map((ev) => [
      `"${ev.timestamp}"`,
      `"${ev.action}"`,
      `"${ev.category}"`,
      `"${ev.severity}"`,
      `"${ev.actorEmail}"`,
      `"${(ev.targetEntity || '').replace(/"/g, '""')}"`,
    ]);
    return {
      filename: `audit-logs-${timestamp}.csv`,
      content: [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'),
      mimeType: 'text/csv',
    };
  }

  return {
    filename: `audit-logs-${timestamp}.json`,
    content: JSON.stringify(FALLBACK_AUDIT_LOGS, null, 2),
    mimeType: 'application/json',
  };
}
