import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SystemDesignStudioPage from '../(student)/architecture/page';
import * as architectureClient from '../../lib/architecture-client';

describe('SystemDesignStudioPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders page header, active blueprint, action buttons, and navigation tabs', () => {
    render(<SystemDesignStudioPage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /High-Throughput Global URL Shortener & Analytics Engine/i,
      })
    ).toBeDefined();

    expect(screen.getByText(/Enterprise System Design Studio/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /ADR \(\.md\)/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Blueprint \(PDF\)/i })).toBeDefined();

    // 4 tabs
    expect(screen.getByRole('button', { name: /1\. Topology & Request Flow/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /2\. Scale & Capacity Estimator/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /3\. Trade-Off & CAP Matrix/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /4\. Bottleneck & SPOF Health Audit/i })).toBeDefined();
  });

  it('switches blueprints when selecting from dropdown', () => {
    render(<SystemDesignStudioPage />);

    const select = screen.getByLabelText(/Select Architectural Blueprint/i) as HTMLSelectElement;
    expect(select.value).toBe('url-shortener');

    fireEvent.change(select, { target: { value: 'distributed-kv' } });

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Distributed Key-Value Store with Tunable Consistency/i,
      })
    ).toBeDefined();

    expect(screen.getAllByText(/Consistent Hashing Ring/i).length).toBeGreaterThan(0);
  });

  it('allows stepping through request flow in Topology tab', () => {
    render(<SystemDesignStudioPage />);

    expect(screen.getByText(/Step 1 of 4/i)).toBeDefined();
    expect(screen.getByText(/Incoming Redirect Request/i)).toBeDefined();

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2 of 4/i)).toBeDefined();
    expect(screen.getByText(/Cache Lookup/i)).toBeDefined();
  });

  it('inspects component node and displays latency SLA and failure mode in inspector', () => {
    render(<SystemDesignStudioPage />);

    // Click on In-Memory Cache node
    const cacheNode = screen.getByText('In-Memory Cache-Aside Cluster (Redis / Key-Value)');
    fireEvent.click(cacheNode);

    // Inspector should display component details
    expect(screen.getAllByText(/In-Memory Cache-Aside Cluster/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Consistent Hashing Memory Ring with Bloom Filter/i)).toBeDefined();
  });

  it('switches to Capacity Estimator tab and recalculates metrics when slider changes', () => {
    render(<SystemDesignStudioPage />);

    const capacityTab = screen.getByRole('button', { name: /2\. Scale & Capacity Estimator/i });
    fireEvent.click(capacityTab);

    expect(screen.getByText(/Back-of-the-Envelope Inputs/i)).toBeDefined();
    expect(screen.getByText(/Average QPS/i)).toBeDefined();
    expect(screen.getByText(/Peak QPS \(2\.5x\)/i)).toBeDefined();

    // Adjust DAU slider
    const dauSlider = screen.getByLabelText(/Daily Active Users slider/i);
    fireEvent.change(dauSlider, { target: { value: '100000000' } });

    // Should reflect 100.0 Million DAU
    expect(screen.getByText(/100\.0 Million/i)).toBeDefined();
  });

  it('switches to Trade-Off Matrix tab and selects architectural choices', () => {
    render(<SystemDesignStudioPage />);

    const tradeOffTab = screen.getByRole('button', { name: /3\. Trade-Off & CAP Matrix/i });
    fireEvent.click(tradeOffTab);

    expect(screen.getByText(/HTTP 301 Permanent vs HTTP 302 Temporary Redirect/i)).toBeDefined();

    // Select Option A
    const optionARadio = screen.getByLabelText(/Select Option A: HTTP 301 Permanent Redirect/i);
    fireEvent.click(optionARadio);
    expect((optionARadio as HTMLInputElement).checked).toBe(true);
  });

  it('switches to Bottleneck & SPOF Health Audit tab and saves custom notes', () => {
    render(<SystemDesignStudioPage />);

    const auditTab = screen.getByRole('button', { name: /4\. Bottleneck & SPOF Health Audit/i });
    fireEvent.click(auditTab);

    expect(screen.getByText(/System Resilience Score: 94%/i)).toBeDefined();
    expect(screen.getByText(/Cache Penetration from Non-Existent Keys/i)).toBeDefined();

    // Type notes
    const textarea = screen.getByPlaceholderText(/Record your personal notes/i);
    fireEvent.change(textarea, { target: { value: 'Important: Always evaluate Bloom Filter false-positive probability.' } });

    expect((textarea as HTMLTextAreaElement).value).toBe('Important: Always evaluate Bloom Filter false-positive probability.');
  });

  it('triggers ADR markdown export and PDF blueprint download handlers', () => {
    const downloadSpy = vi.spyOn(architectureClient, 'downloadFile').mockImplementation(() => {});
    const pdfSpy = vi.spyOn(architectureClient, 'exportArchitectureBlueprintPdf').mockImplementation(() => {});

    render(<SystemDesignStudioPage />);

    const adrBtn = screen.getByRole('button', { name: /ADR \(\.md\)/i });
    fireEvent.click(adrBtn);
    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy.mock.calls[0][0]).toContain('url-shortener-ADR.md');

    const pdfBtn = screen.getByRole('button', { name: /Blueprint \(PDF\)/i });
    fireEvent.click(pdfBtn);
    expect(pdfSpy).toHaveBeenCalledTimes(1);
    expect(pdfSpy.mock.calls[0][0].id).toBe('url-shortener');
  });

  it('resets blueprint parameters to default baseline when reset button is clicked', () => {
    render(<SystemDesignStudioPage />);

    const resetBtn = screen.getByLabelText(/Reset Blueprint to Default/i);
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Reset High-Throughput Global URL Shortener & Analytics Engine to default architecture baseline/i)).toBeDefined();
  });
});
