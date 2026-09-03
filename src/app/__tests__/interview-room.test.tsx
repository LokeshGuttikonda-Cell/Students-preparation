import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LiveInterviewRoomPage from '../(student)/interviews/[id]/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'sess_123' }),
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

// Mock speech utilities
vi.mock('../../lib/speech', () => ({
  speakText: vi.fn(),
  stopSpeaking: vi.fn(),
  createSpeechRecognizer: vi.fn().mockReturnValue({
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
  }),
  isSpeechRecognitionSupported: vi.fn().mockReturnValue(true),
}));

const mockSessionData = {
  id: 'sess_123',
  userId: 'stu_1',
  roleTrackId: 'r_devops',
  status: 'IN_PROGRESS' as const,
  currentStage: 'INTRODUCTION' as const,
  targetDurationMinutes: 20,
  overallScore: null,
  technicalScore: null,
  clarityScore: null,
  feedbackSummary: null,
  strengths: null,
  growthAreas: null,
  startedAt: '2026-09-02T10:00:00.000Z',
  completedAt: null,
  roleTrack: {
    id: 'r_devops',
    name: 'Cloud & DevOps Engineer',
    slug: 'cloud-devops-engineer',
  },
  messages: [
    {
      id: 'msg_ai_1',
      sender: 'AI_INTERVIEWER' as const,
      content: 'Welcome to your Cloud & DevOps technical screening.',
      stage: 'INTRODUCTION' as const,
      turnNumber: 1,
      technicalFeedback: null,
      suggestedBetterAnswer: null,
      createdAt: '2026-09-02T10:00:00.000Z',
    },
  ],
};

const mockGetInterviewSession = vi.fn();
const mockSendInterviewMessage = vi.fn();
const mockCompleteInterviewSession = vi.fn();

vi.mock('../../lib/interview-client', () => ({
  getInterviewSession: (...args: unknown[]) => mockGetInterviewSession(...args),
  sendInterviewMessage: (...args: unknown[]) => mockSendInterviewMessage(...args),
  completeInterviewSession: (...args: unknown[]) =>
    mockCompleteInterviewSession(...args),
}));

describe('LiveInterviewRoomPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetInterviewSession.mockResolvedValue(mockSessionData);
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders interview room with role, initial greeting, and stage stepper', async () => {
    render(<LiveInterviewRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Cloud & DevOps Engineer')).toBeDefined();
      expect(
        screen.getByText('Welcome to your Cloud & DevOps technical screening.'),
      ).toBeDefined();
    });

    expect(screen.getByText('Socratic Interviewer')).toBeDefined();
    expect(screen.getAllByText('1. Introduction').length).toBeGreaterThan(0);
    expect(screen.getByText('Complete Interview')).toBeDefined();
  });

  it('submits candidate turn and displays AI response', async () => {
    mockSendInterviewMessage.mockResolvedValueOnce({
      candidateMessage: {
        id: 'msg_cand_2',
        sender: 'CANDIDATE',
        content: 'I manage CI/CD pipelines with GitHub Actions.',
        stage: 'INTRODUCTION',
        turnNumber: 2,
        technicalFeedback: 'Clear introductory summary.',
        suggestedBetterAnswer: null,
        createdAt: '2026-09-02T10:02:00.000Z',
      },
      aiMessage: {
        id: 'msg_ai_3',
        sender: 'AI_INTERVIEWER',
        content: 'How do you handle zero-downtime deployments?',
        stage: 'TECHNICAL_DRILL',
        turnNumber: 3,
        technicalFeedback: null,
        suggestedBetterAnswer: null,
        createdAt: '2026-09-02T10:02:05.000Z',
      },
      currentStage: 'TECHNICAL_DRILL',
    });

    render(<LiveInterviewRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Cloud & DevOps Engineer')).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(
      /Type your technical response/i,
    );
    fireEvent.change(textarea, {
      target: { value: 'I manage CI/CD pipelines with GitHub Actions.' },
    });

    const sendBtn = screen.getByText('Send →');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockSendInterviewMessage).toHaveBeenCalledWith(
        'sess_123',
        'I manage CI/CD pipelines with GitHub Actions.',
      );
      expect(
        screen.getByText('How do you handle zero-downtime deployments?'),
      ).toBeDefined();
      expect(screen.getByText('Clear introductory summary.')).toBeDefined();
    });
  });

  it('completes interview session and renders completed scorecard banner', async () => {
    mockCompleteInterviewSession.mockResolvedValueOnce({
      ...mockSessionData,
      status: 'COMPLETED',
      overallScore: 90,
      technicalScore: 92,
      clarityScore: 88,
    });

    render(<LiveInterviewRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Complete Interview')).toBeDefined();
    });

    const completeBtn = screen.getByText('Complete Interview');
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(mockCompleteInterviewSession).toHaveBeenCalledWith('sess_123');
      expect(
        screen.getByText(/Interview simulation has been completed/i),
      ).toBeDefined();
      expect(screen.getByText('90%')).toBeDefined();
    });
  });
});
