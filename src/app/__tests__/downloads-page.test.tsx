import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DownloadsCenterPage from '../(student)/downloads/page';

// Mock window Blob & ObjectURL
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-pdf-url');
  window.URL.revokeObjectURL = vi.fn();
}

describe('DownloadsCenterPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the page title, hero metrics, and master compendiums', () => {
    render(<DownloadsCenterPage />);

    // Title & Hero
    expect(
      screen.getByRole('heading', { name: /Curriculum PDF Download Center/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/12 Role Handbooks/i)).toBeInTheDocument();
    expect(screen.getByText(/13 Deep Tracks/i)).toBeInTheDocument();

    // Master Compendium Banners
    expect(
      screen.getByRole('heading', {
        name: /All 12 IT Roles Master Engineering Compendium/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Master Computer Science & Engineering Compendium/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders publications across roles and tracks by default', () => {
    render(<DownloadsCenterPage />);

    // Check presence of role handbook cards
    expect(screen.getByText(/Cloud Solutions Architect -- Engineering Handbook/i)).toBeInTheDocument();
    expect(screen.getByText(/Java Enterprise Backend Developer -- Engineering Handbook/i)).toBeInTheDocument();

    // Check presence of CS track handbook cards
    expect(screen.getByText(/System Design & Distributed Scalability Engineering Handbook/i)).toBeInTheDocument();
    expect(screen.getByText(/Operating Systems & Linux Kernel Architecture Engineering Handbook/i)).toBeInTheDocument();
  });

  it('filters publications using the publication type tabs', () => {
    render(<DownloadsCenterPage />);

    // Click "Master Compendiums" tab
    const compendiumsTab = screen.getByRole('button', { name: /Master Compendiums/i });
    fireEvent.click(compendiumsTab);

    // Master compendiums are visible
    expect(
      screen.getByRole('heading', {
        name: /12 IT Roles Master Engineering Handbook & Curriculum Compendium/i,
      }),
    ).toBeInTheDocument();

    // Individual role handbook should not be rendered in this tab
    expect(
      screen.queryByText(/Cloud Solutions Architect -- Engineering Handbook/i),
    ).not.toBeInTheDocument();

    // Click "CS Engineering Tracks" tab
    const tracksTab = screen.getByRole('button', { name: /CS Engineering Tracks/i });
    fireEvent.click(tracksTab);

    expect(
      screen.getByText(/System Design & Distributed Scalability Engineering Handbook/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Java Enterprise Backend Developer -- Engineering Handbook/i),
    ).not.toBeInTheDocument();
  });

  it('filters publications by discipline category chip', () => {
    render(<DownloadsCenterPage />);

    // Click "Data & AI" discipline chip
    const dataAiChip = screen.getByRole('button', { name: /^Data & AI$/i });
    fireEvent.click(dataAiChip);

    // Data Analyst and Data Engineer handbooks should be visible
    expect(
      screen.getByText(/Data Analyst & SQL Specialist -- Engineering Handbook/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Data Engineer & ETL Architect -- Engineering Handbook/i),
    ).toBeInTheDocument();

    // Java Backend Developer is "Backend & Systems", should not be visible
    expect(
      screen.queryByText(/Java Enterprise Backend Developer -- Engineering Handbook/i),
    ).not.toBeInTheDocument();
  });

  it('filters publications by keyword search', () => {
    render(<DownloadsCenterPage />);

    const searchInput = screen.getByPlaceholderText(/Search publications by title/i);
    fireEvent.change(searchInput, { target: { value: 'Rust' } });

    expect(
      screen.getByText(/Rust Systems & Memory Safety Architecture Engineering Handbook/i),
    ).toBeInTheDocument();

    // Java should be filtered out
    expect(
      screen.queryByText(/Java Enterprise Backend Developer -- Engineering Handbook/i),
    ).not.toBeInTheDocument();
  });

  it('displays empty state and resets filters when search has no matches', () => {
    render(<DownloadsCenterPage />);

    const searchInput = screen.getByPlaceholderText(/Search publications by title/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentTechnologyXYZ123' } });

    expect(
      screen.getByText(/No publications match your criteria/i),
    ).toBeInTheDocument();

    // Click Reset All Filters
    const resetBtn = screen.getByRole('button', { name: /Reset All Filters/i });
    fireEvent.click(resetBtn);

    // Publications should reappear
    expect(
      screen.getByText(/Cloud Solutions Architect -- Engineering Handbook/i),
    ).toBeInTheDocument();
  });

  it('triggers Master IT Roles Compendium PDF download when clicked', () => {
    render(<DownloadsCenterPage />);

    const downloadBtn = screen.getByRole('button', {
      name: /Download 12 Roles Compendium \(PDF\)/i,
    });
    fireEvent.click(downloadBtn);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('triggers Master CS Compendium PDF download when clicked', () => {
    render(<DownloadsCenterPage />);

    const downloadBtn = screen.getByRole('button', {
      name: /Download CS Master Compendium \(PDF\)/i,
    });
    fireEvent.click(downloadBtn);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('generates personalized role study plan via interactive selector', () => {
    // Save progress for devops engineer
    localStorage.setItem(
      'studentsprep_handbook_progress_devops-engineer',
      JSON.stringify(['CI/CD Pipeline Engineering', 'GitOps & Declarative Config']),
    );

    render(<DownloadsCenterPage />);

    const select = screen.getByLabelText(/Select role for personalized study plan/i);
    fireEvent.change(select, { target: { value: 'devops-engineer' } });

    expect(screen.getByText(/2 of \d+ Competencies Mastered/i)).toBeInTheDocument();

    const exportBtn = screen.getByRole('button', {
      name: /Export Study Plan \(PDF\)/i,
    });
    fireEvent.click(exportBtn);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });
});
