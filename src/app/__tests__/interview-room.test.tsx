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
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockAbort = vi.fn();
const mockCreateMicrophoneSpectrumAnalyzer = vi.fn().mockResolvedValue({
  getFrequencies: vi.fn(),
  getAverageVolume: vi.fn().mockReturnValue(42),
  stop: vi.fn(),
});

vi.mock('../../lib/speech', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/speech')>();
  return {
    ...actual,
    speakText: vi.fn(),
    stopSpeaking: vi.fn(),
    createSpeechRecognizer: vi.fn().mockImplementation((opts) => ({
      start: mockStart.mockImplementation(() => opts?.onStart?.()),
      stop: mockStop.mockImplementation(() => opts?.onEnd?.()),
      abort: mockAbort,
    })),
    createMicrophoneSpectrumAnalyzer: () => mockCreateMicrophoneSpectrumAnalyzer(),
    isSpeechRecognitionSupported: vi.fn().mockReturnValue(true),
  };
});

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

  it('toggles microphone listening and initiates live spectrum analyzer', async () => {
    render(<LiveInterviewRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Cloud & DevOps Engineer')).toBeDefined();
    });

    const micBtn = screen.getByRole('button', { name: /speak verbal response/i });
    expect(micBtn).toBeDefined();

    fireEvent.click(micBtn);

    await waitFor(() => {
      expect(mockCreateMicrophoneSpectrumAnalyzer).toHaveBeenCalled();
      expect(screen.getByText(/Listening to candidate voice/i)).toBeDefined();
    });

    // Toggle off
    fireEvent.click(micBtn);
    await waitFor(() => {
      expect(screen.getByText(/Voice Ready \(Standby\)/i)).toBeDefined();
    });
  });

  it('renders live articulation telemetry HUD showing word count, cadence, and filler detection as candidate drafts response', async () => {
    render(<LiveInterviewRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Cloud & DevOps Engineer')).toBeDefined();
    });

    // Telemetry HUD should not be present initially
    expect(screen.queryByTestId('live-articulation-telemetry-hud')).toBeNull();

    const textarea = screen.getByPlaceholderText(/Type your technical response/i);

    // 1. Enter clean response
    fireEvent.change(textarea, {
      target: { value: 'I implement idempotent distributed workers using message queues.' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('live-articulation-telemetry-hud')).toBeDefined();
      expect(screen.getByText('8 words')).toBeDefined();
      expect(screen.getByText('0 Fillers Detected')).toBeDefined();
      expect(screen.getByText('EXEMPLARY')).toBeDefined();
    });

    // 2. Enter response with filler words
    fireEvent.change(textarea, {
      target: { value: 'Basically I mean we sort of use event driven queues.' },
    });

    await waitFor(() => {
      expect(screen.getByText(/3 fillers/i)).toBeDefined();
      expect(screen.getByTestId('live-articulation-coaching-tip')).toBeDefined();
      expect(screen.getByText(/💡 Articulation Tip:/i)).toBeDefined();
      expect(screen.getByText(/Consider replacing “sort of” with “Approximately”/i)).toBeDefined();
    });
  });

  it('opens Architecture Whiteboard studio, selects archetype, and exports topology into candidate response input', async () => {
    render(<LiveInterviewRoomPage />);

    await waitFor(() => {
      expect(screen.getByText('Cloud & DevOps Engineer')).toBeDefined();
    });

    // Whiteboard modal is closed initially
    expect(screen.queryByTestId('architecture-whiteboard-studio')).toBeNull();

    // Click Architecture Whiteboard button
    const openBtns = screen.getAllByRole('button', { name: /Architecture Whiteboard/i });
    expect(openBtns.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(openBtns[0]);

    // Modal is open
    expect(screen.getByTestId('architecture-whiteboard-studio')).toBeDefined();
    expect(screen.getByText('Architecture Whiteboard & Topology Canvas')).toBeDefined();

    // Click Export Topology to Response
    const exportBtn = screen.getByRole('button', { name: /Export Topology to Response/i });
    fireEvent.click(exportBtn);

    // Modal is closed and textarea contains exported topology text
    expect(screen.queryByTestId('architecture-whiteboard-studio')).toBeNull();
    const textarea = screen.getByPlaceholderText(/Type your technical response/i);
    expect((textarea as HTMLTextAreaElement).value).toContain('Proposed Architecture Topology');
    expect((textarea as HTMLTextAreaElement).value).toContain('Caching Strategy');
  });
});
