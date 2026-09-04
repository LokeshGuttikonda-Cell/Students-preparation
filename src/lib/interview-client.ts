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

import { apiUrl } from './env';
import {
  createFallbackInterviewSession,
  createFallbackInterviewReply,
  completeFallbackInterviewSession,
  getFallbackInterviewSession,
  getFallbackUserInterviews,
} from './catalog-fallbacks';

export async function startInterviewSession(
  roleTrackId: string,
  targetDurationMinutes = 20,
): Promise<InterviewSessionData> {
  try {
    const res = await fetch(apiUrl('interviews'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roleTrackId, targetDurationMinutes }),
    });

    if (res.ok) {
      return (await res.json()) as InterviewSessionData;
    }
  } catch {
    // Graceful fallback
  }

  return createFallbackInterviewSession(roleTrackId, targetDurationMinutes);
}

export async function sendInterviewMessage(
  interviewId: string,
  content: string,
): Promise<{
  candidateMessage: InterviewMessageData;
  aiMessage: InterviewMessageData;
  currentStage: 'INTRODUCTION' | 'TECHNICAL_DRILL' | 'SCENARIO_DESIGN' | 'WRAPUP';
}> {
  try {
    const res = await fetch(apiUrl(`interviews/${interviewId}/message`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful fallback
  }

  return createFallbackInterviewReply(interviewId, content);
}

export async function completeInterviewSession(
  interviewId: string,
): Promise<InterviewSessionData> {
  try {
    const res = await fetch(apiUrl(`interviews/${interviewId}/complete`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (res.ok) {
      return (await res.json()) as InterviewSessionData;
    }
  } catch {
    // Graceful fallback
  }

  return completeFallbackInterviewSession(interviewId);
}

export async function getInterviewSession(
  interviewId: string,
): Promise<InterviewSessionData> {
  try {
    const res = await fetch(apiUrl(`interviews/${interviewId}`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as InterviewSessionData;
    }
  } catch {
    // Graceful fallback
  }

  return getFallbackInterviewSession(interviewId);
}

export async function getUserInterviews(
  page = 1,
  pageSize = 10,
): Promise<PaginatedInterviews> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    const res = await fetch(apiUrl(`interviews?${params.toString()}`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as PaginatedInterviews;
    }
  } catch {
    // Graceful fallback
  }

  return getFallbackUserInterviews();
}

