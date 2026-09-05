import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VoiceWaveform } from '../VoiceWaveform';
import { StageStepper } from '../StageStepper';

describe('Interview UI Components', () => {
  describe('VoiceWaveform', () => {
    it('renders waveform visualizer in idle state', () => {
      const { container } = render(<VoiceWaveform state="idle" />);
      const visualizer = screen.getByLabelText('Voice audio visualizer: idle');
      expect(visualizer).toBeDefined();

      const bars = container.querySelectorAll('span');
      expect(bars.length).toBe(10);
    });

    it('renders waveform visualizer in speaking and listening states', () => {
      const { rerender } = render(<VoiceWaveform state="speaking" />);
      expect(screen.getByLabelText('Voice audio visualizer: speaking')).toBeDefined();
      expect(screen.getByText('AI Vocalizing')).toBeDefined();

      rerender(<VoiceWaveform state="listening" />);
      expect(screen.getByLabelText('Voice audio visualizer: listening')).toBeDefined();
      expect(screen.getByText('Mic Capturing')).toBeDefined();
    });

    it('can hide telemetry when showTelemetry is disabled', () => {
      render(<VoiceWaveform state="idle" showTelemetry={false} />);
      expect(screen.queryByText('Standby')).toBeNull();
    });
  });

  describe('StageStepper', () => {
    it('highlights current stage and marks prior stages completed', () => {
      render(<StageStepper currentStage="TECHNICAL_DRILL" />);

      expect(screen.getByText('1. Introduction')).toBeDefined();
      expect(screen.getByText('2. Technical Drill')).toBeDefined();
      expect(screen.getByText('3. Scenario & Design')).toBeDefined();
      expect(screen.getByText('4. Wrap-up & Q&A')).toBeDefined();

      // Check completed checkmark exists for introduction
      expect(screen.getByText('✓')).toBeDefined();
    });
  });
});
