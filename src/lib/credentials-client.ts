export interface CredentialItem {
  id: string;
  credentialCode: string;
  title: string;
  grade: 'DISTINCTION' | 'MERIT' | 'PASS';
  compositeScore: number;
  mockTestScore: number;
  interviewScore: number;
  verificationHash: string;
  competencies: string[];
  issuedAt: string;
  roleTrack: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface RoleMilestoneItem {
  roleTrackId: string;
  roleName: string;
  roleSlug: string;
  mockTestCleared: boolean;
  bestMockScore: number | null;
  interviewCleared: boolean;
  bestInterviewScore: number | null;
  isEligible: boolean;
  credential: CredentialItem | null;
}

export interface PublicVerificationItem {
  isValid: boolean;
  credentialCode: string;
  title: string;
  recipientName: string;
  roleName: string;
  grade: 'DISTINCTION' | 'MERIT' | 'PASS';
  compositeScore: number;
  mockTestScore: number;
  interviewScore: number;
  issuedAt: string;
  verificationHash: string;
  competencies: string[];
}

import { apiUrl } from './env';
import {
  DEFAULT_ROLE_MILESTONES,
  createFallbackCredential,
  verifyFallbackCredential,
} from './catalog-fallbacks';

export async function getUserCredentials(): Promise<CredentialItem[]> {
  try {
    const res = await fetch(apiUrl('credentials'), {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      return (await res.json()) as CredentialItem[];
    }
  } catch {
    // Graceful fallback
  }

  return DEFAULT_ROLE_MILESTONES.filter((m) => m.credential !== null).map(
    (m) => m.credential!,
  );
}

export async function getRoleMilestones(): Promise<RoleMilestoneItem[]> {
  try {
    const res = await fetch(apiUrl('credentials/milestones'), {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      return (await res.json()) as RoleMilestoneItem[];
    }
  } catch {
    // Graceful fallback
  }

  return DEFAULT_ROLE_MILESTONES;
}

export async function claimCredential(
  roleTrackId: string,
): Promise<CredentialItem> {
  try {
    const res = await fetch(apiUrl('credentials/claim'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roleTrackId }),
    });
    if (res.ok) {
      return (await res.json()) as CredentialItem;
    }
  } catch {
    // Graceful fallback
  }

  return createFallbackCredential(roleTrackId);
}

export async function verifyCredential(
  code: string,
): Promise<PublicVerificationItem> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`credentials/verify/${code}`), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Graceful fallback on network failure
    return verifyFallbackCredential(code);
  }

  if (!res.ok) {
    throw new Error('Credential not found or invalid verification code');
  }

  return (await res.json()) as PublicVerificationItem;
}

