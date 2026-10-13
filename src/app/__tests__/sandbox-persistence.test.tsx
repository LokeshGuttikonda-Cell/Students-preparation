import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { SqlQuerySandbox } from '../../components/sandbox/SqlQuerySandbox';
import { CodeLogicSandbox } from '../../components/sandbox/CodeLogicSandbox';
import SandboxPage from '../(student)/sandbox/page';

describe('Sandbox State Persistence & Recovery', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('SqlQuerySandbox Persistence', () => {
    it('restores customized query from localStorage on mount', () => {
      localStorage.setItem('studentsprep_sql_code_ch_test_1', 'SELECT 999 AS custom_val;');

      render(
        <SqlQuerySandbox
          challengeId="ch_test_1"
          title="Persistence Test SQL"
          initialQuery="SELECT 1 AS default_val;"
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your SQL SELECT query here/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('SELECT 999 AS custom_val;');
    });

    it('persists user query edits to localStorage', () => {
      render(
        <SqlQuerySandbox
          challengeId="ch_test_2"
          title="Persistence Test SQL"
          initialQuery="SELECT 1 AS default_val;"
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your SQL SELECT query here/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'SELECT 42 AS answer;' } });

      expect(localStorage.getItem('studentsprep_sql_code_ch_test_2')).toBe('SELECT 42 AS answer;');
    });

    it('resets query to initial template and removes from localStorage when clicking Reset Query', () => {
      localStorage.setItem('studentsprep_sql_code_ch_test_3', 'SELECT 100 AS edited;');

      render(
        <SqlQuerySandbox
          challengeId="ch_test_3"
          title="Persistence Test SQL"
          initialQuery="SELECT 1 AS default_val;"
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your SQL SELECT query here/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('SELECT 100 AS edited;');

      const resetBtn = screen.getByRole('button', { name: /Reset Query/i });
      fireEvent.click(resetBtn);

      expect(textarea.value).toBe('SELECT 1 AS default_val;');
      expect(localStorage.getItem('studentsprep_sql_code_ch_test_3')).toBeNull();
    });
  });

  describe('CodeLogicSandbox Persistence', () => {
    it('restores customized code from localStorage on mount', () => {
      localStorage.setItem('studentsprep_code_code_test_1', 'function customFn() { return 100; }');

      render(
        <CodeLogicSandbox
          challengeId="code_test_1"
          functionName="customFn"
          initialCode="function customFn() { return 0; }"
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your function implementation here/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('function customFn() { return 100; }');
    });

    it('persists user code edits to localStorage', () => {
      render(
        <CodeLogicSandbox
          challengeId="code_test_2"
          functionName="customFn2"
          initialCode="function customFn2() { return 0; }"
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your function implementation here/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'function customFn2() { return 42; }' } });

      expect(localStorage.getItem('studentsprep_code_code_test_2')).toBe('function customFn2() { return 42; }');
    });

    it('resets code to initial template and clears localStorage when clicking Reset Code', () => {
      localStorage.setItem('studentsprep_code_code_test_3', 'function customFn3() { return 999; }');

      render(
        <CodeLogicSandbox
          challengeId="code_test_3"
          functionName="customFn3"
          initialCode="function customFn3() { return 1; }"
        />
      );

      const textarea = screen.getByPlaceholderText(/Write your function implementation here/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('function customFn3() { return 999; }');

      const resetBtn = screen.getByRole('button', { name: /Reset Code/i });
      fireEvent.click(resetBtn);

      expect(textarea.value).toBe('function customFn3() { return 1; }');
      expect(localStorage.getItem('studentsprep_code_code_test_3')).toBeNull();
    });
  });

  describe('SandboxPage Active Tab Persistence', () => {
    it('restores active tab from localStorage on initial load when no URL query is present', () => {
      localStorage.setItem('studentsprep_sandbox_active_tab', 'MEMORY');

      render(<SandboxPage />);

      expect(screen.getByText('Process Virtual Memory & CPU Cache Coherence Simulator')).toBeInTheDocument();
    });

    it('saves selected tab to localStorage upon tab switch', () => {
      render(<SandboxPage />);

      const kernelTabBtn = screen.getByRole('button', { name: /OS Kernel & Network Protocols Lab/i });
      fireEvent.click(kernelTabBtn);

      expect(localStorage.getItem('studentsprep_sandbox_active_tab')).toBe('KERNEL_NETWORK');
    });
  });
});
