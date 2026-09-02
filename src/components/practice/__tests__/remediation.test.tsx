import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SocraticRemediationCard } from '../SocraticRemediationCard';
import { RoleInterviewTrapsSection } from '../../roles/RoleInterviewTrapsSection';
import * as remediationClient from '../../../lib/remediation-client';

describe('SocraticRemediationCard', () => {
  it('renders trigger button, fetches diagnosis, and reveals misconception & hints', async () => {
    vi.spyOn(remediationClient, 'explainMissedQuestion').mockResolvedValueOnce({
      misconception: 'Assuming readiness and liveness probes behave identically in container schedulers.',
      recruiterTrap: 'Interviewers use this distractor to test container restart lifecycle understanding.',
      socraticHint: 'What happens when a container takes 30 seconds to warm up database connections?',
      conceptualRule: 'Liveness restarts hung containers; readiness buffers network traffic during initialization.',
      targetCompetency: {
        topicId: 'top_k8s',
        topicName: 'Kubernetes & Containers',
        subjectName: 'DevOps Systems',
      },
      similarDrillAvailable: true,
    });

    render(
      <SocraticRemediationCard
        questionId="q_test_1"
        selectedOptionId="opt_distractor_1"
      />,
    );

    const triggerBtn = screen.getByRole('button', {
      name: /Explain Why I Missed This/i,
    });
    expect(triggerBtn).toBeInTheDocument();

    // Click to expand Socratic diagnosis
    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Assuming readiness and liveness probes behave identically/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Interviewers use this distractor to test container restart/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/What happens when a container takes 30 seconds/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Liveness restarts hung containers; readiness buffers network/i),
      ).toBeInTheDocument();
    });

    // Verify parallel drill button is available
    expect(
      screen.getByRole('button', { name: /Try a Similar Drill Question/i }),
    ).toBeInTheDocument();
  });

  it('loads parallel drill question when clicking Try Similar Drill Question', async () => {
    vi.spyOn(remediationClient, 'explainMissedQuestion').mockResolvedValueOnce({
      misconception: 'Trap',
      recruiterTrap: 'Recruiter pattern',
      socraticHint: 'Think again',
      conceptualRule: 'Rule',
      targetCompetency: {
        topicId: 'top_k8s',
        topicName: 'Kubernetes',
        subjectName: 'DevOps',
      },
      similarDrillAvailable: true,
    });

    vi.spyOn(remediationClient, 'getSimilarDrill').mockResolvedValueOnce({
      id: 'q_parallel_1',
      topicId: 'top_k8s',
      body: 'What happens when a container startupProbe fails?',
      difficulty: 'MEDIUM',
      options: [
        { id: 'opt_p1', questionId: 'q_parallel_1', body: 'The container is killed and restarted', orderIndex: 0 },
        { id: 'opt_p2', questionId: 'q_parallel_1', body: 'Traffic is temporarily diverted', orderIndex: 1 },
      ],
    });

    render(<SocraticRemediationCard questionId="q_test_1" />);

    // Expand
    fireEvent.click(screen.getByRole('button', { name: /Explain Why I Missed This/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Try a Similar Drill Question/i })).toBeInTheDocument();
    });

    // Click drill button
    fireEvent.click(screen.getByRole('button', { name: /Try a Similar Drill Question/i }));

    await waitFor(() => {
      expect(screen.getByText('What happens when a container startupProbe fails?')).toBeInTheDocument();
      expect(screen.getByText('The container is killed and restarted')).toBeInTheDocument();
    });
  });
});

describe('RoleInterviewTrapsSection', () => {
  it('renders curated recruiter interview traps for the role', async () => {
    vi.spyOn(remediationClient, 'getRoleInterviewTraps').mockResolvedValueOnce([
      {
        id: 'trap_1',
        roleSlug: 'cloud-devops',
        title: 'Missing Readiness Probe Grace Periods',
        topicName: 'Kubernetes',
        trapDescription: 'Confusing liveness and readiness probe lifecycles.',
        antiPatternExample: 'livenessProbe: initialDelay 1s',
        correctPatternExample: 'readinessProbe with startupProbe',
        interviewTip: 'Explain traffic routing vs process lifecycle.',
      },
    ]);

    render(<RoleInterviewTrapsSection roleSlug="cloud-devops" />);

    await waitFor(() => {
      expect(screen.getByText('Classic Interview Traps & Anti-Patterns')).toBeInTheDocument();
      expect(screen.getByText('Missing Readiness Probe Grace Periods')).toBeInTheDocument();
      expect(screen.getByText('livenessProbe: initialDelay 1s')).toBeInTheDocument();
      expect(screen.getByText('readinessProbe with startupProbe')).toBeInTheDocument();
      expect(screen.getByText(/Explain traffic routing vs process lifecycle/i)).toBeInTheDocument();
    });
  });
});
