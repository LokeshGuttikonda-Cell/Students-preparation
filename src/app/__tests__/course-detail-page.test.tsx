import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import CourseDetailPage from '../(student)/courses/[slug]/page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'aws-cloud-foundations' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'student@platform.edu', role: 'STUDENT' },
  }),
}));

vi.mock('../../lib/courses-client', () => ({
  getCourse: vi.fn().mockResolvedValue({
    id: 'course-aws',
    name: 'AWS Cloud Foundations & Architecture',
    slug: 'aws-cloud-foundations',
    description: 'Master core AWS infrastructure concepts, patterns, VPCs, and storage services.',
    level: 'BEGINNER',
    estimatedHours: 12,
    orderIndex: 0,
    isEnrolled: false,
    roleTrack: {
      id: 'role-devops',
      name: 'Cloud & DevOps Engineer',
      slug: 'devops-engineer',
    },
    modules: [
      {
        id: 'mod-1',
        title: 'Cloud Computing Fundamentals & Global Infrastructure',
        description: 'Regions, Availability Zones, and Edge Locations.',
        estimatedMinutes: 60,
        orderIndex: 0,
        topicId: 'topic-aws-1',
        topicName: 'AWS Cloud Architecture & Services',
      },
    ],
  }),
  getCourseProgress: vi.fn().mockRejectedValue(new Error('Not enrolled yet')),
  enrollInCourse: vi.fn().mockResolvedValue({ success: true }),
}));

describe('CourseDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders course details, modules roadmap, and role track link', async () => {
    render(<CourseDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'AWS Cloud Foundations & Architecture' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Master core AWS infrastructure concepts/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('1 Modules')).toBeInTheDocument();
    expect(screen.getAllByText(/Cloud & DevOps Engineer/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Cloud Computing Fundamentals & Global Infrastructure')).toBeInTheDocument();
  });

  it('allows user to enroll in course', async () => {
    render(<CourseDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Enroll in Course/i })).toBeInTheDocument();
    });

    const enrollBtn = screen.getByRole('button', { name: /Enroll in Course/i });
    fireEvent.click(enrollBtn);

    await waitFor(() => {
      expect(screen.getByText(/You have successfully enrolled in this course!/i)).toBeInTheDocument();
    });
  });

  it('renders Full-Spectrum Learning Continuum banner and multi-modal links', async () => {
    render(<CourseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Full-Spectrum Learning Continuum')).toBeInTheDocument();
      expect(screen.getByText('1. Knowledge Hub')).toBeInTheDocument();
      expect(screen.getByText('3. Applied Engineering Labs')).toBeInTheDocument();
      expect(screen.getByText(/Theory/i)).toBeInTheDocument();
      expect(screen.getByText(/Applied Lab/i)).toBeInTheDocument();
    });
  });
});
