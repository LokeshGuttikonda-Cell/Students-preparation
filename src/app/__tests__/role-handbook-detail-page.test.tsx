import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoleHandbookDetailPage from '../(student)/roles/handbooks/[slug]/page';

let mockSlug = 'aws-cloud-engineer';

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: mockSlug }),
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock Blob & ObjectURL for PDF download
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-pdf-url');
  window.URL.revokeObjectURL = vi.fn();
}

describe('RoleHandbookDetailPage Component', () => {
  beforeEach(() => {
    mockSlug = 'aws-cloud-engineer';
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the role handbook header and executive summary', () => {
    render(<RoleHandbookDetailPage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Cloud Solutions Architect/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Cloud & Infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/Publication Pages/i)).toBeInTheDocument();
    expect(screen.getByText(/24 min/i)).toBeInTheDocument();
  });

  it('renders all core engineering sections', () => {
    render(<RoleHandbookDetailPage />);

    expect(
      screen.getByRole('heading', {
        name: /Role Mission & Executive Profile/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Career Ladder & Market Compensation/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Evaluated Syllabus Roadmap/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Technical Interview Questions & Counter-Probes/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Recruiter Traps & Candidate Anti-Patterns/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Architectural Documentation & Production Invariants/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders Table of Contents links in sticky navigation sidebar', () => {
    render(<RoleHandbookDetailPage />);

    const tocLinks = screen.getAllByRole('link', {
      name: /Executive Profile|Career Ladder|Syllabus Roadmap|Interview Scenarios|Recruiter Traps|Architectural Documentation/i,
    });
    expect(tocLinks.length).toBeGreaterThanOrEqual(5);
  });

  it('tracks competency mastery status and updates progress calculation', () => {
    render(<RoleHandbookDetailPage />);

    // Initial state: 0 of N Competencies Mastered (0%)
    expect(screen.getByText(/0 of \d+ Competencies Mastered \(0%\)/i)).toBeInTheDocument();

    // Find checkboxes for syllabus competencies
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(8);

    // Check first competency
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    // Progress percentage should increase above 0%
    expect(screen.queryByText(/0 of \d+ Competencies Mastered \(0%\)/i)).not.toBeInTheDocument();
    expect(screen.getByText(/1 of \d+ Competencies Mastered/i)).toBeInTheDocument();

    // Check second competency
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();
    expect(screen.getByText(/2 of \d+ Competencies Mastered/i)).toBeInTheDocument();

    // Uncheck first competency
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
    expect(screen.getByText(/1 of \d+ Competencies Mastered/i)).toBeInTheDocument();
  });

  it('resets progress when clicking the reset progress button', () => {
    render(<RoleHandbookDetailPage />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    expect(screen.getByText(/2 of \d+ Competencies Mastered/i)).toBeInTheDocument();

    // Click Reset Progress
    const resetButton = screen.getByRole('button', { name: /Reset Progress/i });
    fireEvent.click(resetButton);

    expect(screen.getByText(/0 of \d+ Competencies Mastered \(0%\)/i)).toBeInTheDocument();
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('triggers personalized study plan PDF download', () => {
    render(<RoleHandbookDetailPage />);

    const downloadPlanButtons = screen.getAllByRole('button', {
      name: /Download Study Plan \(PDF\)|Study Plan \(PDF\)/i,
    });
    expect(downloadPlanButtons.length).toBeGreaterThan(0);

    fireEvent.click(downloadPlanButtons[0]);
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('renders Handbook Not Found fallback when slug does not exist', () => {
    mockSlug = 'non-existent-role-slug-999';
    render(<RoleHandbookDetailPage />);

    expect(
      screen.getByRole('heading', { name: /Handbook Not Found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/could not be located in our curriculum catalog/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Return to All Role Handbooks/i }),
    ).toBeInTheDocument();
  });

  it('opens and closes the technical interview defense drill modal', () => {
    mockSlug = 'aws-cloud-engineer';
    render(<RoleHandbookDetailPage />);

    // Click Launch Defense Drill Simulator
    const drillBtn = screen.getByRole('button', {
      name: /Launch Defense Drill Simulator/i,
    });
    fireEvent.click(drillBtn);

    // Modal is rendered
    expect(
      screen.getByRole('dialog', { name: /Role Technical Interview Defense Drill/i }),
    ).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByLabelText(/Close drill modal/i);
    fireEvent.click(closeBtn);

    // Modal closed
    expect(
      screen.queryByRole('dialog', { name: /Role Technical Interview Defense Drill/i }),
    ).not.toBeInTheDocument();
  });

  it('opens and closes the rapid flashcards modal', () => {
    mockSlug = 'aws-cloud-engineer';
    render(<RoleHandbookDetailPage />);

    // Click Rapid Flashcards
    const flashcardsButtons = screen.getAllByRole('button', {
      name: /Rapid Flashcards/i,
    });
    expect(flashcardsButtons.length).toBeGreaterThan(0);
    fireEvent.click(flashcardsButtons[0]);

    // Modal is rendered
    expect(
      screen.getByRole('dialog', { name: /Role Technical Interview Flashcards/i }),
    ).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByLabelText(/Close flashcards modal/i);
    fireEvent.click(closeBtn);

    // Modal closed
    expect(
      screen.queryByRole('dialog', { name: /Role Technical Interview Flashcards/i }),
    ).not.toBeInTheDocument();
  });

  it('renders AI Agent & Generative Systems Engineer handbook when slug is ai-agent-engineer', () => {
    mockSlug = 'ai-agent-engineer';
    render(<RoleHandbookDetailPage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /AI Agent & Generative Systems Engineer/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Data & AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Autonomous Coding & Lint-Repair Agent/i)).toBeInTheDocument();
    expect(screen.getByText(/Autonomous Coding Agent Oscillation and Infinite Loop Mitigation/i)).toBeInTheDocument();
  });
});

