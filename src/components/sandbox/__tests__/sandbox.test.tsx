import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SqlQuerySandbox } from '../SqlQuerySandbox';
import { CodeLogicSandbox } from '../CodeLogicSandbox';
import * as sandboxClient from '../../../lib/sandbox-client';

describe('SqlQuerySandbox', () => {
  it('renders title, editor, and runs query successfully to display tabular rows', async () => {
    vi.spyOn(sandboxClient, 'runSqlQuery').mockResolvedValueOnce({
      success: true,
      columns: ['department', 'total_employees'],
      rows: [
        { department: 'Engineering', total_employees: 3 },
        { department: 'DevOps & Cloud', total_employees: 2 },
      ],
      rowCount: 2,
      executionTimeMs: 2,
    });

    render(
      <SqlQuerySandbox
        title="Department Aggregations"
        taskDescription="Count employees per department"
      />,
    );

    expect(screen.getByText('Department Aggregations')).toBeInTheDocument();
    expect(screen.getByText('Count employees per department')).toBeInTheDocument();

    // Toggle schema reference
    const toggleSchemaBtn = screen.getByText('View Database Schema Reference');
    fireEvent.click(toggleSchemaBtn);
    expect(screen.getByText('Hide Database Schema')).toBeInTheDocument();
    expect(screen.getByText('Database Schema (DDL)')).toBeInTheDocument();

    // Run query
    const runBtn = screen.getByRole('button', { name: /Run Query/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('DevOps & Cloud')).toBeInTheDocument();
      expect(screen.getByText(/Returned 2 rows in 2ms/i)).toBeInTheDocument();
    });
  });

  it('displays error alert when SQL execution fails', async () => {
    vi.spyOn(sandboxClient, 'runSqlQuery').mockResolvedValueOnce({
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 1,
      error: 'syntax error at or near "FORM"',
    });

    render(<SqlQuerySandbox />);

    const runBtn = screen.getByRole('button', { name: /Run Query/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('SQL Execution Error')).toBeInTheDocument();
      expect(screen.getByText(/syntax error at or near "FORM"/i)).toBeInTheDocument();
    });
  });

  it('validates candidate query and triggers onSuccess', async () => {
    vi.spyOn(sandboxClient, 'validateSqlQuery').mockResolvedValueOnce({
      passed: true,
      message: 'Query output matches expected solution criteria.',
      actualRowCount: 4,
      expectedRowCount: 4,
      candidateRows: [],
      executionTimeMs: 2,
    });

    const onSuccess = vi.fn();
    render(
      <SqlQuerySandbox
        expectedQuery="SELECT * FROM departments;"
        onSuccess={onSuccess}
      />,
    );

    const validateBtn = screen.getByRole('button', { name: /Validate Solution/i });
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(screen.getByText('Solution Passed')).toBeInTheDocument();
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});

describe('CodeLogicSandbox', () => {
  it('renders problem description and evaluates code logic against test cases', async () => {
    vi.spyOn(sandboxClient, 'runCodeLogic').mockResolvedValueOnce({
      success: true,
      allPassed: true,
      totalTests: 2,
      passedTests: 2,
      executionTimeMs: 3,
      results: [
        {
          testCaseId: 'tc_1',
          description: 'Pair exists',
          passed: true,
          actualOutput: true,
          expectedOutput: true,
          executionTimeMs: 1,
        },
        {
          testCaseId: 'tc_2',
          description: 'No pair exists',
          passed: true,
          actualOutput: false,
          expectedOutput: false,
          executionTimeMs: 1,
        },
      ],
    });

    render(
      <CodeLogicSandbox
        title="Two Sum Algorithm"
        problemDescription="Find if pair sums to target"
      />,
    );

    expect(screen.getByText('Two Sum Algorithm')).toBeInTheDocument();
    expect(screen.getByText('Find if pair sums to target')).toBeInTheDocument();

    const runBtn = screen.getByRole('button', { name: /Run Code Logic/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('✓ All Test Cases Passed')).toBeInTheDocument();
      expect(screen.getAllByText('Passed').length).toBeGreaterThanOrEqual(2);
    });
  });
});
