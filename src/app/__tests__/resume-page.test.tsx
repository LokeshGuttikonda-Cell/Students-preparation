import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ResumeBuilderPage from '../(student)/resume/page';
import * as resumeClient from '../../../src/lib/resume-client';
import * as dbClient from '../../../src/lib/admin-database-client';

describe('ResumeBuilderPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders page header, default role selector, ATS scorecard, and live preview', () => {
    render(<ResumeBuilderPage />);

    expect(screen.getByText('ATS Technical Resume Builder & Role Fit Engine')).toBeDefined();
    expect(screen.getByLabelText('Target Role Selection')).toBeDefined();
    expect(screen.getByText(/Live Typographic ATS Preview/i)).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /RAHUL SHARMA/i })).toBeDefined();
  });

  it('switches target role when dropdown selection changes', () => {
    render(<ResumeBuilderPage />);

    const select = screen.getByLabelText('Target Role Selection') as HTMLSelectElement;
    expect(select.value).toBe('aws-cloud-engineer');

    fireEvent.change(select, { target: { value: 'devops-engineer' } });
    expect(select.value).toBe('devops-engineer');
    expect(screen.getByText(/ATS Role Alignment: DevOps & Site Reliability Engineer/i)).toBeDefined();
  });

  it('switches editor tabs and renders specific section inputs', () => {
    render(<ResumeBuilderPage />);

    // Switch to Summary tab
    fireEvent.click(screen.getByRole('button', { name: /^summary$/i }));
    expect(screen.getByLabelText('Professional Summary')).toBeDefined();

    // Switch to Skills tab
    fireEvent.click(screen.getByRole('button', { name: /^skills$/i }));
    expect(screen.getByLabelText('Programming Languages')).toBeDefined();

    // Switch to Experience tab
    fireEvent.click(screen.getByRole('button', { name: /^experience$/i }));
    expect(screen.getByText('+ Add Position')).toBeDefined();

    // Switch to Projects tab
    fireEvent.click(screen.getByRole('button', { name: /^projects$/i }));
    expect(screen.getByText('+ Add Project')).toBeDefined();
  });

  it('adds missing keyword when clicking a missing keyword chip', () => {
    render(<ResumeBuilderPage />);

    // Find a missing keyword button
    const missingButtons = screen.getAllByRole('button').filter((b) => b.textContent?.startsWith('+ '));
    if (missingButtons.length > 0) {
      const keywordText = missingButtons[0].textContent?.replace('+ ', '').trim() || '';
      fireEvent.click(missingButtons[0]);

      // Check notification banner
      expect(screen.getByText(new RegExp(`Added "${keywordText}" to Technical Skills`, 'i'))).toBeDefined();
    }
  });

  it('triggers PDF, LaTeX, and Markdown exports on clicking corresponding action buttons', () => {
    const pdfSpy = vi.spyOn(resumeClient, 'exportResumeAsPdf').mockImplementation(() => {});
    const downloadSpy = vi.spyOn(dbClient, 'triggerBrowserFileDownload').mockImplementation(() => {});

    render(<ResumeBuilderPage />);

    // PDF export
    const pdfBtn = screen.getByLabelText('Download PDF');
    fireEvent.click(pdfBtn);
    expect(pdfSpy).toHaveBeenCalledTimes(1);

    // LaTeX export
    const texBtn = screen.getByLabelText('Export LaTeX');
    fireEvent.click(texBtn);
    expect(downloadSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\.tex$/),
      expect.stringContaining('\\documentclass'),
      'application/x-tex'
    );

    // Markdown export
    const mdBtn = screen.getByLabelText('Export Markdown');
    fireEvent.click(mdBtn);
    expect(downloadSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\.md$/),
      expect.stringContaining('# Rahul Sharma'),
      'text/markdown'
    );
  });

  it('resets resume fields and restores sample data', () => {
    render(<ResumeBuilderPage />);

    // Reset
    const resetBtn = screen.getByLabelText('Reset Resume');
    fireEvent.click(resetBtn);

    // After reset, name should be empty / YOUR NAME in preview
    expect(screen.getByRole('heading', { level: 2, name: /YOUR NAME/i })).toBeDefined();

    // Load Sample
    const sampleBtn = screen.getByLabelText('Load Sample Resume');
    fireEvent.click(sampleBtn);

    // Restored sample
    expect(screen.getByRole('heading', { level: 2, name: /RAHUL SHARMA/i })).toBeDefined();
  });
});
