import { describe, expect, it } from 'vitest';
import {
  InMemorySqlEngine,
  executeSqlQueryLocally,
  validateSqlQueryLocally,
} from './in-memory-sql';
import { DEFAULT_SQL_SCHEMA, DEFAULT_SQL_SEED } from './sandbox-client';

describe('InMemorySqlEngine', () => {
  it('initializes schema and parses tuple seed data accurately', () => {
    const engine = new InMemorySqlEngine();
    engine.executeDdl(DEFAULT_SQL_SCHEMA);
    engine.executeSeed(DEFAULT_SQL_SEED);

    expect(engine.tables.departments).toHaveLength(4);
    expect(engine.tables.employees).toHaveLength(8);

    const firstEmp = engine.tables.employees[0];
    expect(firstEmp.id).toBe(101);
    expect(firstEmp.name).toBe('Aarav Sharma');
    expect(firstEmp.department_id).toBe(1);
    expect(firstEmp.salary).toBe(95000);
    expect(firstEmp.hire_date).toBe('2024-01-15');
  });

  it('evaluates basic projection, filtering, and order by', () => {
    const engine = new InMemorySqlEngine();
    engine.executeDdl(DEFAULT_SQL_SCHEMA);
    engine.executeSeed(DEFAULT_SQL_SEED);

    const result = engine.run(`
      SELECT name, salary
      FROM employees
      WHERE salary >= 110000
      ORDER BY salary DESC;
    `);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(3);
    expect(result.columns).toEqual(['name', 'salary']);
    expect(result.rows[0]).toEqual({ name: 'Meera Joshi', salary: 125000 });
    expect(result.rows[1]).toEqual({ name: 'Vikram Nair', salary: 115000 });
    expect(result.rows[2]).toEqual({ name: 'Priya Patel', salary: 110000 });
  });

  it('evaluates multi-table INNER JOIN and column disambiguation', () => {
    const engine = new InMemorySqlEngine();
    engine.executeDdl(DEFAULT_SQL_SCHEMA);
    engine.executeSeed(DEFAULT_SQL_SEED);

    const result = engine.run(`
      SELECT e.name AS employee, d.name AS department, e.salary
      FROM departments d
      JOIN employees e ON d.id = e.department_id
      WHERE d.name = 'Data Platform'
      ORDER BY e.salary DESC;
    `);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(2);
    expect(result.rows).toEqual([
      { employee: 'Vikram Nair', department: 'Data Platform', salary: 115000 },
      { employee: 'Ananya Gupta', department: 'Data Platform', salary: 98000 },
    ]);
  });

  it('evaluates GROUP BY with aggregate functions and math expressions', () => {
    const engine = new InMemorySqlEngine();
    engine.executeDdl(DEFAULT_SQL_SCHEMA);
    engine.executeSeed(DEFAULT_SQL_SEED);

    const result = engine.run(`
      SELECT d.name AS department,
             COUNT(e.id) AS total_employees,
             AVG(e.salary) AS avg_salary,
             (MAX(e.salary) - MIN(e.salary)) AS salary_spread
      FROM departments d
      JOIN employees e ON d.id = e.department_id
      GROUP BY d.name
      ORDER BY avg_salary DESC;
    `);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(4);
    expect(result.rows[0]).toEqual({
      department: 'Engineering',
      total_employees: 3,
      avg_salary: 110000,
      salary_spread: 30000,
    });
    expect(result.rows[1]).toEqual({
      department: 'Data Platform',
      total_employees: 2,
      avg_salary: 106500,
      salary_spread: 17000,
    });
  });

  it('evaluates HAVING aggregate filtering', () => {
    const engine = new InMemorySqlEngine();
    engine.executeDdl(DEFAULT_SQL_SCHEMA);
    engine.executeSeed(DEFAULT_SQL_SEED);

    const result = engine.run(`
      SELECT d.name AS department, SUM(e.salary) AS total_payroll
      FROM departments d
      JOIN employees e ON d.id = e.department_id
      GROUP BY d.name
      HAVING SUM(e.salary) > 150000
      ORDER BY total_payroll DESC;
    `);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(3);
    expect(result.rows[0]).toEqual({ department: 'Engineering', total_payroll: 330000 });
    expect(result.rows[1]).toEqual({ department: 'Data Platform', total_payroll: 213000 });
    expect(result.rows[2]).toEqual({ department: 'DevOps & Cloud', total_payroll: 195000 });
  });

  it('evaluates window functions: ROW_NUMBER, DENSE_RANK, NTILE, running SUM', () => {
    const engine = new InMemorySqlEngine();
    engine.executeDdl(DEFAULT_SQL_SCHEMA);
    engine.executeSeed(DEFAULT_SQL_SEED);

    // ROW_NUMBER
    const rowNumRes = engine.run(`
      SELECT id, name, salary, hire_date,
             ROW_NUMBER() OVER (ORDER BY hire_date ASC) AS seniority_rank
      FROM employees
      ORDER BY seniority_rank ASC
      LIMIT 2;
    `);
    expect(rowNumRes.success).toBe(true);
    expect(rowNumRes.rows[0]).toEqual({
      id: 108,
      name: 'Meera Joshi',
      salary: 125000,
      hire_date: '2022-04-14',
      seniority_rank: 1,
    });
    expect(rowNumRes.rows[1]).toEqual({
      id: 105,
      name: 'Vikram Nair',
      salary: 115000,
      hire_date: '2022-11-12',
      seniority_rank: 2,
    });

    // Running SUM
    const sumRes = engine.run(`
      SELECT id, name, salary,
             SUM(salary) OVER (ORDER BY id ASC) AS running_payroll
      FROM employees
      ORDER BY id ASC
      LIMIT 3;
    `);
    expect(sumRes.success).toBe(true);
    expect(sumRes.rows[0].running_payroll).toBe(95000);
    expect(sumRes.rows[1].running_payroll).toBe(205000);
    expect(sumRes.rows[2].running_payroll).toBe(310000);

    // NTILE
    const ntileRes = engine.run(`
      SELECT name, salary,
             NTILE(4) OVER (ORDER BY salary DESC) AS salary_quartile
      FROM employees
      ORDER BY salary DESC;
    `);
    expect(ntileRes.success).toBe(true);
    expect(ntileRes.rows[0].salary_quartile).toBe(1);
    expect(ntileRes.rows[7].salary_quartile).toBe(4);
  });

  it('evaluates nested subqueries in FROM clause', () => {
    const engine = new InMemorySqlEngine();
    engine.executeDdl(DEFAULT_SQL_SCHEMA);
    engine.executeSeed(DEFAULT_SQL_SEED);

    const result = engine.run(`
      SELECT name, department, salary
      FROM (
        SELECT e.name, d.name AS department, e.salary,
               DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rank
        FROM employees e
        JOIN departments d ON e.department_id = d.id
      ) ranked
      WHERE rank = 1
      ORDER BY salary DESC;
    `);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(4);
    expect(result.rows[0]).toEqual({ name: 'Meera Joshi', department: 'Engineering', salary: 125000 });
    expect(result.rows[1]).toEqual({ name: 'Vikram Nair', department: 'Data Platform', salary: 115000 });
    expect(result.rows[2]).toEqual({ name: 'Rohan Iyer', department: 'DevOps & Cloud', salary: 105000 });
    expect(result.rows[3]).toEqual({ name: 'Karthik Rao', department: 'Quality Assurance', salary: 85000 });
  });

  it('evaluates correlated subqueries in WHERE clause', () => {
    const engine = new InMemorySqlEngine();
    engine.executeDdl(DEFAULT_SQL_SCHEMA);
    engine.executeSeed(DEFAULT_SQL_SEED);

    const result = engine.run(`
      SELECT e.name, e.salary, e.department_id
      FROM employees e
      WHERE e.salary > (
        SELECT AVG(salary)
        FROM employees
        WHERE department_id = e.department_id
      )
      ORDER BY e.salary DESC;
    `);

    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(3);
    expect(result.rows).toEqual([
      { name: 'Meera Joshi', salary: 125000, department_id: 1 },
      { name: 'Vikram Nair', salary: 115000, department_id: 3 },
      { name: 'Rohan Iyer', salary: 105000, department_id: 2 },
    ]);
  });

  it('handles syntax errors gracefully without throwing', () => {
    const engine = new InMemorySqlEngine();
    const result = engine.run('INVALID SQL STATEMENT');
    expect(result.success).toBe(false);
    expect(result.rowCount).toBe(0);
    expect(result.error).toBeDefined();
  });
});

describe('Standalone Helper Functions', () => {
  it('executeSqlQueryLocally runs queries with defaults', () => {
    const res = executeSqlQueryLocally('SELECT COUNT(id) AS total FROM departments;');
    expect(res.success).toBe(true);
    expect(res.rows[0]).toEqual({ total: 4 });
  });

  it('validateSqlQueryLocally validates matching queries', () => {
    const valRes = validateSqlQueryLocally(
      'SELECT id, name FROM departments ORDER BY id ASC;',
      DEFAULT_SQL_SCHEMA,
      DEFAULT_SQL_SEED,
      'SELECT id, name FROM departments ORDER BY id ASC;',
    );

    expect(valRes.passed).toBe(true);
    expect(valRes.actualRowCount).toBe(4);
    expect(valRes.message).toContain('Query validation successful');
  });

  it('validateSqlQueryLocally detects row count mismatches', () => {
    const valRes = validateSqlQueryLocally(
      'SELECT id, name FROM departments WHERE id = 1;',
      DEFAULT_SQL_SCHEMA,
      DEFAULT_SQL_SEED,
      'SELECT id, name FROM departments;',
    );

    expect(valRes.passed).toBe(false);
    expect(valRes.actualRowCount).toBe(1);
    expect(valRes.expectedRowCount).toBe(4);
    expect(valRes.message).toContain('Row count mismatch');
  });

  it('validateSqlQueryLocally catches candidate execution errors', () => {
    const valRes = validateSqlQueryLocally(
      'SELECT non_existent_column FROM non_existent_table;',
      DEFAULT_SQL_SCHEMA,
      DEFAULT_SQL_SEED,
    );

    expect(valRes.passed).toBe(false);
    expect(valRes.candidateRows).toHaveLength(0);
  });
});
