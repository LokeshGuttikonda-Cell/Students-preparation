import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AiAgentLabSandbox } from '../AiAgentLabSandbox';

describe('AiAgentLabSandbox Component', () => {
  it('renders title, description, and ReAct agent loop module by default', () => {
    render(<AiAgentLabSandbox />);

    expect(
      screen.getByRole('heading', {
        name: /AI Agent & LLM Systems Engineering Laboratory/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/1\. ReAct Agent Loop/i)).toBeInTheDocument();
    expect(screen.getByText(/Context Token Usage/i)).toBeInTheDocument();
    expect(screen.getByText(/Agent Reasoning & Plan \(Thought\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ast_grep/i).length).toBeGreaterThan(0);
  });

  it('steps forward through the ReAct agent execution trace', () => {
    render(<AiAgentLabSandbox />);

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    expect(nextBtn).toBeInTheDocument();

    // Click next step to proceed from step 1 (ast_grep) to step 2 (read_file)
    fireEvent.click(nextBtn);

    expect(screen.getAllByText(/read_file/i).length).toBeGreaterThan(0);
  });

  it('triggers cycle oscillation hazard and displays cycle detection error', () => {
    render(<AiAgentLabSandbox />);

    const injectBtn = screen.getByRole('button', { name: /Inject Oscillation Hazard/i });
    fireEvent.click(injectBtn);

    expect(screen.getAllByText(/Cycle Detected/i).length).toBeGreaterThan(0);
  });

  it('switches to Hybrid RAG & RRF tab and renders candidate fusion rankings', () => {
    render(<AiAgentLabSandbox />);

    const ragTabBtn = screen.getByRole('button', { name: /2\. Hybrid RAG & RRF/i });
    fireEvent.click(ragTabBtn);

    expect(screen.getByText(/Information Retrieval Query/i)).toBeInTheDocument();
    expect(screen.getByText(/Cross-Encoder Reranker/i)).toBeInTheDocument();
    expect(screen.getByText(/Candidate Document Scoring & Fusion Rankings/i)).toBeInTheDocument();

    // Verify HNSW document candidate appears
    expect(screen.getByText(/HNSW Vector Graph Indexing/i)).toBeInTheDocument();
  });

  it('switches to VRAM Serving & Quantization tab and calculates VRAM footprint', () => {
    render(<AiAgentLabSandbox />);

    const vramTabBtn = screen.getByRole('button', { name: /3\. VRAM & Quantization/i });
    fireEvent.click(vramTabBtn);

    expect(screen.getByText(/Serving Engine Parameters/i)).toBeInTheDocument();
    expect(screen.getByText(/GPU VRAM Memory Allocation Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Total VRAM Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommended Production Hardware Topology/i)).toBeInTheDocument();

    // Test changing model size to 7B
    const sevenBBtn = screen.getByRole('button', { name: /^7B$/i });
    fireEvent.click(sevenBBtn);

    expect(screen.getByText(/7B Params/i)).toBeInTheDocument();
  });

  it('switches to Speculative Decoding tab and verifies acceleration calculations and block table', () => {
    render(<AiAgentLabSandbox />);

    const specTabBtn = screen.getByRole('button', { name: /4\. Speculative Decoding & PagedAttention/i });
    fireEvent.click(specTabBtn);

    expect(screen.getByText(/Speculative Decoding Engine Config/i)).toBeInTheDocument();
    expect(screen.getByText(/Speedup Factor/i)).toBeInTheDocument();
    expect(screen.getByText(/Expected Tokens \/ Step/i)).toBeInTheDocument();
    expect(screen.getByText(/Target Pass Reduction/i)).toBeInTheDocument();
    expect(screen.getByText(/PagedAttention Physical Block Allocation Table/i)).toBeInTheDocument();
    expect(screen.getByText(/Block #0/i)).toBeInTheDocument();
    expect(screen.getByText(/Seq-A \(CoW\)/i)).toBeInTheDocument();
  });
});
