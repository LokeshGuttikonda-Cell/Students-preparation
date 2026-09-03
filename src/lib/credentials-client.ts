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

export async function getUserCredentials(): Promise<CredentialItem[]> {
  const res = await fetch('/api/v1/credentials', {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error('Failed to load credentials');
  }
  return res.json();
}

export async function getRoleMilestones(): Promise<RoleMilestoneItem[]> {
  const res = await fetch('/api/v1/credentials/milestones', {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error('Failed to load role readiness milestones');
  }
  return res.json();
}

export async function claimCredential(
  roleTrackId: string,
): Promise<CredentialItem> {
  const res = await fetch('/api/v1/credentials/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ roleTrackId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      errorData?.message ||
      'Failed to claim credential';
    throw new Error(message);
  }
  return res.json();
}

export async function verifyCredential(
  code: string,
): Promise<PublicVerificationItem> {
  const res = await fetch(`/api/v1/credentials/verify/${code}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error('Credential not found or invalid verification code');
  }
  return res.json();
}
