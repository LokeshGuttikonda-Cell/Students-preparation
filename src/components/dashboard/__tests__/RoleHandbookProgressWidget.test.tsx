import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleHandbookProgressWidget } from '../RoleHandbookProgressWidget';

// Mock window Blob & ObjectURL
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-pdf-url');
  window.URL.revokeObjectURL = vi.fn();
}

describe('RoleHandbookProgressWidget Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders default showcase state when no progress has been saved in localStorage', () => {
    render(<RoleHandbookProgressWidget />);

    expect(
      screen.getByRole('heading', {
        name: /IT Roles Engineering Handbooks & Syllabi Portal/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /Browse All 12 Handbooks/i }),
    ).toBeInTheDocument();

    const compendiumBtn = screen.getByRole('button', {
      name: /Download Master Compendium \(PDF\)/i,
    });
    expect(compendiumBtn).toBeInTheDocument();

    fireEvent.click(compendiumBtn);
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('renders active progress card and mastery percentage when role progress is saved in localStorage', () => {
    // Simulate student has checked off 2 competencies for Java Backend Developer
    const mockTopics = ['JVM Architecture & Execution', 'Memory Model & Happens-Before'];
    localStorage.setItem(
      'studentsprep_handbook_progress_java-backend-developer',
      JSON.stringify(mockTopics),
    );

    render(<RoleHandbookProgressWidget targetRoleId="java-backend-developer" />);

    expect(
      screen.getByRole('heading', {
        name: /Java Enterprise Backend Developer — Syllabus Mastery/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/2 of \d+ Competencies Mastered/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /Resume Handbook Reader/i }),
    ).toBeInTheDocument();

    const planBtn = screen.getByRole('button', {
      name: /Export Study Plan \(PDF\)/i,
    });
    expect(planBtn).toBeInTheDocument();

    fireEvent.click(planBtn);
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });
});
