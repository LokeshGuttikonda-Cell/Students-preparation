import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PublicCredentialVerifyPage from '../verify/[code]/page';

const mockParams = { code: 'CRED-CLOU-ABCD1234' };
vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
}));

describe('PublicCredentialVerifyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders authentic verified certificate details for valid credential code', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          isValid: true,
          credentialCode: 'CRED-CLOU-ABCD1234',
          title: 'Cloud & DevOps Engineer Readiness Credential',
          recipientName: 'Sarah Connor',
          roleName: 'Cloud & DevOps Engineer',
          grade: 'DISTINCTION',
          compositeScore: 94,
          mockTestScore: 92,
          interviewScore: 96,
          issuedAt: '2026-09-01T10:00:00.000Z',
          verificationHash: 'sha256_mock_tamper_evident_hash',
          competencies: ['CI/CD Pipelines', 'Kubernetes Architecture'],
        }),
    });

    render(<PublicCredentialVerifyPage />);

    expect(screen.getByText('Verifying cryptographic record...')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText('AUTHENTIC & CRYPTOGRAPHICALLY VERIFIED'),
      ).toBeInTheDocument();
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      expect(
        screen.getByText('Cloud & DevOps Engineer Readiness Credential'),
      ).toBeInTheDocument();
      expect(screen.getByText('Grade: DISTINCTION')).toBeInTheDocument();
      expect(screen.getByText('Composite: 94%')).toBeInTheDocument();
      expect(screen.getByText(/Fingerprint: sha256_mock_tamper_evident_hash/i)).toBeInTheDocument();
    });
  });

  it('renders error banner when credential code is invalid or not found', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Credential not found' }),
    });

    render(<PublicCredentialVerifyPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Credential Verification Failed'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/could not be verified against the official platform registry/i),
      ).toBeInTheDocument();
    });
  });
});
