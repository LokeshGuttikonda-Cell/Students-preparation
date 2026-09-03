export interface SocraticRemediationResult {
  misconception: string;
  recruiterTrap: string;
  socraticHint: string;
  conceptualRule: string;
  targetCompetency: {
    topicId: string;
    topicName: string;
    subjectName: string;
  };
  similarDrillAvailable: boolean;
}

export interface RoleTrapItem {
  id: string;
  roleSlug: string;
  title: string;
  topicName: string;
  trapDescription: string;
  antiPatternExample: string;
  correctPatternExample: string;
  interviewTip: string;
}

export interface DrillQuestionOption {
  id: string;
  questionId: string;
  body: string;
  orderIndex: number;
}

export interface DrillQuestion {
  id: string;
  topicId: string;
  body: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: DrillQuestionOption[];
}

import { apiUrl } from './env';

export async function explainMissedQuestion(
  questionId: string,
  selectedOptionId?: string,
  submittedCode?: string,
  targetRoleId?: string,
): Promise<SocraticRemediationResult> {
  const res = await fetch(apiUrl('remediation/explain-missed'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      questionId,
      selectedOptionId,
      submittedCode,
      targetRoleId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to generate Socratic diagnosis');
  }

  return (await res.json()) as SocraticRemediationResult;
}

export async function getSimilarDrill(
  questionId: string,
): Promise<DrillQuestion> {
  const res = await fetch(apiUrl('remediation/similar-drill'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ questionId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to fetch parallel drill question');
  }

  return (await res.json()) as DrillQuestion;
}

export async function getRoleInterviewTraps(
  roleSlugOrId: string,
): Promise<RoleTrapItem[]> {
  const res = await fetch(apiUrl(`remediation/traps/${encodeURIComponent(roleSlugOrId)}`), {
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to fetch role interview traps');
  }

  return (await res.json()) as RoleTrapItem[];
}

