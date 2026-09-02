export interface InterviewMessageData {
  id: string;
  sender: 'AI_INTERVIEWER' | 'CANDIDATE';
  content: string;
  stage: 'INTRODUCTION' | 'TECHNICAL_DRILL' | 'SCENARIO_DESIGN' | 'WRAPUP';
  turnNumber: number;
  technicalFeedback: string | null;
  suggestedBetterAnswer: string | null;
  createdAt: string;
}

export interface InterviewSessionData {
  id: string;
  userId: string;
  roleTrackId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  currentStage: 'INTRODUCTION' | 'TECHNICAL_DRILL' | 'SCENARIO_DESIGN' | 'WRAPUP';
  targetDurationMinutes: number;
  overallScore: number | null;
  technicalScore: number | null;
  clarityScore: number | null;
  feedbackSummary: string | null;
  strengths: string[] | null;
  growthAreas: string[] | null;
  startedAt: string;
  completedAt: string | null;
  roleTrack: {
    id: string;
    name: string;
    slug: string;
    targetLevel?: string;
  };
  messages: InterviewMessageData[];
}

export interface PaginatedInterviews {
  items: Array<{
    id: string;
    userId: string;
    roleTrackId: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    currentStage: string;
    targetDurationMinutes: number;
    overallScore: number | null;
    startedAt: string;
    completedAt: string | null;
    roleTrack: {
      id: string;
      name: string;
      slug: string;
    };
    _count?: {
      messages: number;
    };
  }>;
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function startInterviewSession(
  roleTrackId: string,
  targetDurationMinutes = 20,
): Promise<InterviewSessionData> {
  const res = await fetch('/api/v1/interviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleTrackId, targetDurationMinutes }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to initialize technical interview simulation');
  }

  return (await res.json()) as InterviewSessionData;
}

export async function sendInterviewMessage(
  interviewId: string,
  content: string,
): Promise<{
  candidateMessage: InterviewMessageData;
  aiMessage: InterviewMessageData;
  currentStage: 'INTRODUCTION' | 'TECHNICAL_DRILL' | 'SCENARIO_DESIGN' | 'WRAPUP';
}> {
  const res = await fetch(`/api/v1/interviews/${interviewId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to submit response to interviewer');
  }

  return await res.json();
}

export async function completeInterviewSession(
  interviewId: string,
): Promise<InterviewSessionData> {
  const res = await fetch(`/api/v1/interviews/${interviewId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to finalize interview scorecard');
  }

  return (await res.json()) as InterviewSessionData;
}

export async function getInterviewSession(
  interviewId: string,
): Promise<InterviewSessionData> {
  const res = await fetch(`/api/v1/interviews/${interviewId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch interview session');
  }

  return (await res.json()) as InterviewSessionData;
}

export async function getUserInterviews(
  page = 1,
  pageSize = 10,
): Promise<PaginatedInterviews> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const res = await fetch(`/api/v1/interviews?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch interview history');
  }

  return (await res.json()) as PaginatedInterviews;
}
