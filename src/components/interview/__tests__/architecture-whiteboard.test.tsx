import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchitectureWhiteboard } from '../ArchitectureWhiteboard';

describe('ArchitectureWhiteboard Component', () => {
  it('renders Architecture Whiteboard with default template and SVG canvas', () => {
    const { container } = render(<ArchitectureWhiteboard />);

    expect(screen.getByTestId('architecture-whiteboard-studio')).toBeInTheDocument();
    expect(screen.getByText('Architecture Whiteboard & Topology Canvas')).toBeInTheDocument();
    expect(screen.getByText(/Resilience:/i)).toBeInTheDocument();

    const svg = container.querySelector('svg[aria-label="Interactive Architecture Topology Canvas"]');
    expect(svg).toBeInTheDocument();

    // Default template is CACHE_ASIDE: check nodes
    expect(screen.getByText('Client Apps')).toBeInTheDocument();
    expect(screen.getByText('API Gateway')).toBeInTheDocument();
    expect(screen.getByText('Stateless App Fleet')).toBeInTheDocument();
    expect(screen.getByText('Redis Cache Tier')).toBeInTheDocument();
    expect(screen.getByText('Primary DB Leader')).toBeInTheDocument();
    expect(screen.getByText('Read Replicas (2x)')).toBeInTheDocument();
  });

  it('switches between architecture archetype templates', () => {
    render(<ArchitectureWhiteboard />);

    // Click Event-Driven template button
    const eventDrivenBtn = screen.getByRole('button', { name: /Event-Driven/i });
    fireEvent.click(eventDrivenBtn);

    expect(screen.getByText('Distributed Event Bus')).toBeInTheDocument();
    expect(screen.getByText('Stream Processor')).toBeInTheDocument();
    expect(screen.getByText('Blob / Cold Storage')).toBeInTheDocument();

    // Click Multi-AZ template button
    const multiAzBtn = screen.getByRole('button', { name: /Multi-AZ/i });
    fireEvent.click(multiAzBtn);

    expect(screen.getByText('AZ-1 Gateway')).toBeInTheDocument();
    expect(screen.getByText('AZ-2 Gateway')).toBeInTheDocument();
    expect(screen.getByText('L7 Load Balancer')).toBeInTheDocument();
    expect(screen.getByText('Multi-AZ Fleet')).toBeInTheDocument();
  });

  it('allows selecting a node on canvas to inspect its parameters', () => {
    render(<ArchitectureWhiteboard />);

    const gatewayNodeBtn = screen.getByRole('button', { name: /Node API Gateway/i });
    fireEvent.click(gatewayNodeBtn);

    // Inspector shows node parameters
    expect(screen.getByText('Estimated SLA:')).toBeInTheDocument();
    expect(screen.getByText('5ms')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Add Instance' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Node' })).toBeInTheDocument();
  });

  it('adds an extra node from the palette and updates the canvas', () => {
    render(<ArchitectureWhiteboard />);

    const addQueueBtn = screen.getByRole('button', { name: '+ Queue' });
    fireEvent.click(addQueueBtn);

    expect(screen.getByText('MESSAGE QUEUE')).toBeInTheDocument();
  });

  it('exports topology to structured markdown and calls onExportToText', () => {
    const handleExport = vi.fn();
    render(<ArchitectureWhiteboard onExportToText={handleExport} />);

    const exportBtn = screen.getByRole('button', { name: /Export Topology to Response/i });
    fireEvent.click(exportBtn);

    expect(handleExport).toHaveBeenCalledTimes(1);
    const exportedText = handleExport.mock.calls[0][0];
    expect(exportedText).toContain('Proposed Architecture Topology');
    expect(exportedText).toContain('Edge & Routing');
    expect(exportedText).toContain('Compute Tier');
    expect(exportedText).toContain('Caching Strategy');
    expect(exportedText).toContain('Architectural Resilience');
  });

  it('triggers onClose callback when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<ArchitectureWhiteboard onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Close Whiteboard' });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
