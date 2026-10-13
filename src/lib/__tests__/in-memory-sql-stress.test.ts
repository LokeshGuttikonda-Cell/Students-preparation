import { describe, expect, it } from 'vitest';
import { InMemorySqlEngine } from '../in-memory-sql';

describe('InMemorySqlEngine - Stress, Scale & Boundary Hardening', () => {
  describe('Bulk Data Ingestion & Multi-Column Aggregation Stress', () => {
    it('accurately parses and aggregates 2,000+ bulk-inserted records with JOIN and GROUP BY', () => {
      const engine = new InMemorySqlEngine();

      const ddl = `
        CREATE TABLE departments (id INT PRIMARY KEY, name TEXT);
        CREATE TABLE employees (id INT PRIMARY KEY, name TEXT, department_id INT, salary INT);
      `;

      // Create 5 departments
      const deptSeed = `
        INSERT INTO departments (id, name) VALUES
          (1, 'Infrastructure'),
          (2, 'Core Systems'),
          (3, 'Security Operations'),
          (4, 'Distributed Storage'),
          (5, 'Observability');
      `;

      // Generate 2,500 employees (500 per department)
      const employeeTuples: string[] = [];
      for (let i = 1; i <= 2500; i++) {
        const deptId = ((i - 1) % 5) + 1;
        const salary = 80000 + (i % 50) * 1000;
        employeeTuples.push(`(${i}, 'Staff Engineer ${i}', ${deptId}, ${salary})`);
      }

      const employeeSeed = `INSERT INTO employees (id, name, department_id, salary) VALUES ${employeeTuples.join(', ')};`;

      const t0 = Date.now();
      engine.executeDdl(ddl);
      engine.executeSeed(deptSeed);
      engine.executeSeed(employeeSeed);
      const ingestTime = Date.now() - t0;

      expect(engine.tables.departments).toHaveLength(5);
      expect(engine.tables.employees).toHaveLength(2500);

      // Perform complex multi-column aggregation
      const query = `
        SELECT d.name AS dept_name,
               COUNT(e.id) AS emp_count,
               AVG(e.salary) AS avg_sal,
               MAX(e.salary) AS max_sal,
               MIN(e.salary) AS min_sal
        FROM departments d
        JOIN employees e ON d.id = e.department_id
        GROUP BY d.name
        HAVING COUNT(e.id) >= 500
        ORDER BY dept_name ASC;
      `;

      const t1 = Date.now();
      const result = engine.run(query);
      const queryTime = Date.now() - t1;

      expect(result.success).toBe(true);
      expect(result.rowCount).toBe(5);
      expect(result.rows).toHaveLength(5);

      // Every department must have exactly 500 employees
      for (const row of result.rows) {
        expect(row.emp_count).toBe(500);
        expect(row.min_sal).toBeGreaterThanOrEqual(80000);
        expect(row.max_sal).toBeLessThanOrEqual(130000);
        expect(Number(row.avg_sal)).toBeGreaterThan(100000);
      }

      // Assert high performance throughput: bulk 2.5k execution completes well within browser budget
      expect(ingestTime).toBeLessThan(1500);
      expect(queryTime).toBeLessThan(1000);
    });
  });

  describe('Boundary Edge Cases & Defensive Data Handling', () => {
    it('handles NULL values in WHERE filtering, arithmetic, and aggregates properly', () => {
      const engine = new InMemorySqlEngine();
      engine.executeDdl(`
        CREATE TABLE candidates (id INT, name TEXT, score INT, bonus INT);
      `);

      engine.executeSeed(`
        INSERT INTO candidates (id, name, score, bonus) VALUES
          (1, 'Alice', 90, 10),
          (2, 'Bob', NULL, 5),
          (3, 'Charlie', 80, NULL),
          (4, 'Diana', NULL, NULL);
      `);

      // WHERE IS NOT NULL filtering on scores
      const validScores = engine.run(`
        SELECT name, score
        FROM candidates
        WHERE score IS NOT NULL
        ORDER BY score DESC;
      `);

      expect(validScores.success).toBe(true);
      expect(validScores.rowCount).toBe(2);
      expect(validScores.rows[0].name).toBe('Alice');
      expect(validScores.rows[1].name).toBe('Charlie');

      // Aggregate on column with NULL values
      const avgResult = engine.run(`
        SELECT COUNT(score) AS non_null_scores,
               COUNT(*) AS total_rows,
               AVG(score) AS avg_score
        FROM candidates;
      `);

      expect(avgResult.success).toBe(true);
      expect(avgResult.rows[0].non_null_scores).toBe(2);
      expect(avgResult.rows[0].total_rows).toBe(4);
      expect(avgResult.rows[0].avg_score).toBe(85);
    });

    it('handles string escaping with single quotes and special characters without syntax crash', () => {
      const engine = new InMemorySqlEngine();
      engine.executeDdl(`CREATE TABLE authors (id INT, name TEXT, title TEXT);`);

      engine.executeSeed(`
        INSERT INTO authors (id, name, title) VALUES
          (1, 'Tim O''Reilly', 'Open Source Architectures'),
          (2, 'Dennis Ritchie', 'The C Programming Language & UNIX'),
          (3, 'St. John''s Engineering', 'Systems Safety Vol. 1');
      `);

      expect(engine.tables.authors).toHaveLength(3);
      expect(engine.tables.authors[0].name).toBe("Tim O'Reilly");
      expect(engine.tables.authors[2].name).toBe("St. John's Engineering");

      const searchResult = engine.run(`
        SELECT id, name
        FROM authors
        WHERE name LIKE '%O''Reilly%';
      `);

      expect(searchResult.success).toBe(true);
      expect(searchResult.rowCount).toBe(1);
      expect(searchResult.rows[0].name).toBe("Tim O'Reilly");
    });

    it('safely handles empty tables without throwing unhandled runtime exceptions', () => {
      const engine = new InMemorySqlEngine();
      engine.executeDdl(`CREATE TABLE empty_logs (id INT, message TEXT);`);

      const res = engine.run(`SELECT id, message FROM empty_logs WHERE id > 10;`);
      expect(res.success).toBe(true);
      expect(res.rowCount).toBe(0);
      expect(res.rows).toEqual([]);
      expect(res.columns).toEqual([]);
    });

    it('tolerates case-insensitive table names, column names, and SQL keywords', () => {
      const engine = new InMemorySqlEngine();
      engine.executeDdl(`create table MicroServices (ServiceId INT, ServiceName TEXT);`);
      engine.executeSeed(`insert into microservices (serviceid, servicename) values (10, 'AuthGate');`);

      const res = engine.run(`
        sElEcT sErViCeId, sErViCeNaMe
        fRoM mIcRoSeRvIcEs
        wHeRe sErViCeId = 10;
      `);

      expect(res.success).toBe(true);
      expect(res.rowCount).toBe(1);
      expect(res.rows[0]).toEqual({
        sErViCeId: 10,
        sErViCeNaMe: 'AuthGate',
      });
    });
  });

  describe('Window Functions & Analytical Partition Stress', () => {
    it('computes ROW_NUMBER and DENSE_RANK over partitions accurately under dense ties', () => {
      const engine = new InMemorySqlEngine();
      engine.executeDdl(`
        CREATE TABLE scores (team TEXT, points INT);
      `);

      engine.executeSeed(`
        INSERT INTO scores (team, points) VALUES
          ('A', 100),
          ('A', 100),
          ('A', 90),
          ('B', 120),
          ('B', 110),
          ('B', 110);
      `);

      const res = engine.run(`
        SELECT team,
               points,
               ROW_NUMBER() OVER (PARTITION BY team ORDER BY points DESC) AS row_num,
               DENSE_RANK() OVER (PARTITION BY team ORDER BY points DESC) AS dense_rank
        FROM scores;
      `);

      expect(res.success).toBe(true);
      expect(res.rowCount).toBe(6);

      // Verify partition A
      const teamA = res.rows.filter((r) => r.team === 'A');
      expect(teamA[0].row_num).toBe(1);
      expect(teamA[0].dense_rank).toBe(1);
      expect(teamA[1].row_num).toBe(2);
      expect(teamA[1].dense_rank).toBe(1); // tied at 100
      expect(teamA[2].row_num).toBe(3);
      expect(teamA[2].dense_rank).toBe(2);

      // Verify partition B
      const teamB = res.rows.filter((r) => r.team === 'B');
      expect(teamB[0].row_num).toBe(1);
      expect(teamB[0].dense_rank).toBe(1);
      expect(teamB[1].row_num).toBe(2);
      expect(teamB[1].dense_rank).toBe(2); // tied at 110
      expect(teamB[2].row_num).toBe(3);
      expect(teamB[2].dense_rank).toBe(2);
    });
  });
});
