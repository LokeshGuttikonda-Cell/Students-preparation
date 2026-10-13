import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RoleHandbooksPage from '../(student)/roles/handbooks/page';

// Mock window.print
vi.stubGlobal('print', vi.fn());

describe('RoleHandbooksPage Component', () => {
  it('renders the page title and hero metadata', () => {
    render(<RoleHandbooksPage />);

    expect(
      screen.getByRole('heading', {
        name: /IT Roles Engineering Handbooks & Syllabi/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Download Master Engineering Compendium \(All 13 Roles PDF\)/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/13 Engineering Handbooks/i)).toBeInTheDocument();
  });

  it('renders all 13 role handbook cards by default', () => {
    render(<RoleHandbooksPage />);

    expect(screen.getByText(/Cloud Solutions Architect/i)).toBeInTheDocument();
    expect(screen.getByText(/Java Enterprise Backend Developer/i)).toBeInTheDocument();
    expect(screen.getByText(/DevOps & Site Reliability Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/QA Automation & SDET Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/Cybersecurity & Infrastructure Defense Specialist/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Agent & Generative Systems Engineer/i)).toBeInTheDocument();
  });

  it('filters role handbooks by discipline category', () => {
    render(<RoleHandbooksPage />);

    // Click "Data & AI" pill
    const dataAiButton = screen.getByRole('button', { name: /^Data & AI$/i });
    fireEvent.click(dataAiButton);

    // Data Analyst, Data Engineer, ML/AI Engineer, and AI Agent Engineer should be present
    expect(screen.getByText(/Data Analyst & SQL Specialist/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Engineer & ETL Architect/i)).toBeInTheDocument();
    expect(screen.getByText(/Machine Learning & AI Systems Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Agent & Generative Systems Engineer/i)).toBeInTheDocument();

    // Java Backend Developer should be filtered out
    expect(screen.queryByText(/Java Enterprise Backend Developer/i)).not.toBeInTheDocument();
  });

  it('filters role handbooks by search query', () => {
    render(<RoleHandbooksPage />);

    const searchInput = screen.getByPlaceholderText(/Search by role, skill, or topic/i);
    fireEvent.change(searchInput, { target: { value: 'Kubernetes' } });

    // DevOps Engineer matches Kubernetes
    expect(screen.getByText(/DevOps & Site Reliability Engineer/i)).toBeInTheDocument();

    // CRM specialist should be filtered out
    expect(screen.queryByText(/CRM & Enterprise Applications Specialist/i)).not.toBeInTheDocument();
  });

  it('opens and closes the online preview modal with tab switching', () => {
    render(<RoleHandbooksPage />);

    // Click preview on first card
    const previewButtons = screen.getAllByRole('button', { name: /Preview handbook for/i });
    fireEvent.click(previewButtons[0]);

    // Modal dialog should appear
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Technical Handbook Preview/i)).toBeInTheDocument();

    // Switch to Syllabus tab
    const syllabusTab = screen.getByRole('button', { name: /Syllabus & Projects/i });
    fireEvent.click(syllabusTab);
    expect(screen.getAllByText(/Evaluated Competencies/i).length).toBeGreaterThan(0);

    // Switch to Questions tab
    const questionsTab = screen.getByRole('button', { name: /Questions & Counter-Probes/i });
    fireEvent.click(questionsTab);
    expect(screen.getAllByText(/Model Architectural Answer/i).length).toBeGreaterThan(0);

    // Close preview modal
    const closeButton = screen.getByRole('button', { name: /Close Preview/i });
    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
