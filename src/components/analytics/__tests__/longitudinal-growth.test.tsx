import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LongitudinalGrowthTracker } from '../LongitudinalGrowthTracker';

describe('LongitudinalGrowthTracker', () => {
  it('renders longitudinal articulation tracker with default sessions and metrics', () => {
    render(<LongitudinalGrowthTracker />);

    expect(screen.getByText('Longitudinal Articulation Radar')).toBeInTheDocument();
    expect(screen.getByText(/Technical Vocabulary Growth & Architectural Drift/i)).toBeInTheDocument();
    expect(screen.getByText('Grade: EXEMPLARY')).toBeInTheDocument();

    // 3 KPI Highlights
    expect(screen.getByText('Net Concept Density Gain')).toBeInTheDocument();
    expect(screen.getByText('+5.8%')).toBeInTheDocument();
    expect(screen.getByText('Articulation Pace Growth')).toBeInTheDocument();
    expect(screen.getByText('+49 WPM')).toBeInTheDocument();
    expect(screen.getByText('Filler Word Elimination')).toBeInTheDocument();
    expect(screen.getByText('100% Reduction')).toBeInTheDocument();
  });

  it('allows toggling trajectory timeline metric modes between Density, Pace, and Fillers', () => {
    render(<LongitudinalGrowthTracker />);

    const paceBtn = screen.getByRole('button', { name: 'Pace (WPM)' });
    fireEvent.click(paceBtn);
    expect(paceBtn).toHaveClass('bg-primary-700');
    expect(screen.getByText('140 WPM Target')).toBeInTheDocument();

    const fillersBtn = screen.getByRole('button', { name: 'Fillers' });
    fireEvent.click(fillersBtn);
    expect(fillersBtn).toHaveClass('bg-primary-700');
    expect(screen.getByText('0 Fillers Target')).toBeInTheDocument();

    const densityBtn = screen.getByRole('button', { name: 'Concept Density' });
    fireEvent.click(densityBtn);
    expect(densityBtn).toHaveClass('bg-primary-700');
    expect(screen.getByText('8.0% Exemplary Threshold')).toBeInTheDocument();
  });

  it('allows selecting an earlier session to view its specific breakdown and top concepts', () => {
    render(<LongitudinalGrowthTracker />);

    // Click Session 1 (S1)
    const s1Label = screen.getByText('S1');
    fireEvent.click(s1Label);

    expect(screen.getByText(/Session Selected: 30 days ago/i)).toBeInTheDocument();
    expect(screen.getByText('Introductory Microservices Mock')).toBeInTheDocument();
    expect(screen.getByText('CONVERSATIONAL (3.4%)')).toBeInTheDocument();
    expect(screen.getByText('#database')).toBeInTheDocument();
    expect(screen.getByText('#api')).toBeInTheDocument();
  });

  it('renders comparative architectural radar drift with domain deltas and recommendation', () => {
    render(<LongitudinalGrowthTracker />);

    expect(screen.getByText('Architectural Competency Drift')).toBeInTheDocument();
    expect(screen.getByText('Baseline (Sitting 1)')).toBeInTheDocument();
    expect(screen.getByText('Current (Sitting 5)')).toBeInTheDocument();
    expect(screen.getByText('Target Benchmark')).toBeInTheDocument();

    // Domain Delta Chips
    expect(screen.getByText('+22%')).toBeInTheDocument(); // Distributed Systems
    expect(screen.getByText('+21%')).toBeInTheDocument(); // Storage & DB
    expect(screen.getByText('+16%')).toBeInTheDocument(); // OS & Concurrency

    // Recommendation card
    expect(screen.getByText('Socratic Growth Recommendation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Target Practice →/i })).toBeInTheDocument();
  });
});
