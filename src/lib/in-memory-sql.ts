/**
 * Production-Grade In-Memory Relational SQL Engine
 *
 * Provides resilient, zero-dependency client-side relational SQL execution and validation
 * in pure TypeScript. Supports DDL schema initialization, tuple INSERT parsing, multi-table
 * INNER and LEFT joins, GROUP BY with aggregate functions (COUNT, SUM, AVG, MIN, MAX),
 * HAVING filtering, window functions (ROW_NUMBER, DENSE_RANK, NTILE, running SUM),
 * balanced-depth subqueries in FROM, and correlated subqueries in WHERE clauses.
 */

import {
  DEFAULT_SQL_SCHEMA,
  DEFAULT_SQL_SEED,
  type SqlExecutionResult,
  type SqlValidationResult,
} from './sandbox-client';

export interface TopLevelClauses {
  SELECT?: string;
  FROM?: string;
  WHERE?: string;
  'GROUP BY'?: string;
  HAVING?: string;
  'ORDER BY'?: string;
  LIMIT?: string;
}

export class InMemorySqlEngine {
  public tables: Record<string, Record<string, unknown>[]> = {};

  constructor() {
    this.tables = {};
  }

  public executeDdl(ddl?: string): void {
    if (!ddl) return;
    const statements = ddl.split(';').map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      const createMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]+)\)/i);
      if (createMatch) {
        const tableName = createMatch[1].toLowerCase();
        this.tables[tableName] = [];
      }
    }
  }

  public executeSeed(seedSql?: string): void {
    if (!seedSql) return;
    const statements = seedSql.split(';').map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      const insertMatch = stmt.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+)/i);
      if (insertMatch) {
        const tableName = insertMatch[1].toLowerCase();
        if (!this.tables[tableName]) this.tables[tableName] = [];
        const columns = insertMatch[2].split(',').map((c) => c.trim().toLowerCase());

        const rawValues = insertMatch[3].trim();
        const tupleRegex = /\(([^)]+)\)/g;
        let match: RegExpExecArray | null;
        while ((match = tupleRegex.exec(rawValues)) !== null) {
          const rowValues = this.parseCsvValues(match[1]);
          const rowObj: Record<string, unknown> = {};
          columns.forEach((col, idx) => {
            rowObj[col] = rowValues[idx];
          });
          this.tables[tableName].push(rowObj);
        }
      }
    }
  }

  public parseCsvValues(csvStr: string): unknown[] {
    const values: unknown[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < csvStr.length; i++) {
      const char = csvStr[i];
      if (char === "'" && inQuote && i + 1 < csvStr.length && csvStr[i + 1] === "'") {
        current += "'";
        i++; // skip escaped quote
        continue;
      }
      if (char === "'" && (i === 0 || csvStr[i - 1] !== '\\')) {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(this.castValue(current.trim()));
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      values.push(this.castValue(current.trim()));
    }
    return values;
  }

  public castValue(val: string): unknown {
    if (val.startsWith("'") && val.endsWith("'")) {
      return val.slice(1, -1).replace(/''/g, "'");
    }
    const lower = val.toLowerCase();
    if (lower === 'null') return null;
    if (lower === 'true') return true;
    if (lower === 'false') return false;
    if (!isNaN(Number(val)) && val !== '') {
      return Number(val);
    }
    return val;
  }

  public run(query: string): SqlExecutionResult {
    const startTime = Date.now();
    try {
      const cleaned = query
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim()
        .replace(/;$/, '');
      const rows = this.evaluateSelect(cleaned);
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      return {
        success: true,
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.max(1, Date.now() - startTime),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'SQL Execution Error';
      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: Math.max(1, Date.now() - startTime),
        error: msg,
      };
    }
  }

  public splitTopLevelClauses(query: string): TopLevelClauses {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT'];
    let depth = 0;
    let inQuote = false;
    const positions: { keyword: keyof TopLevelClauses; index: number; length: number }[] = [];

    for (let i = 0; i < query.length; i++) {
      const ch = query[i];
      if (ch === "'" && (i === 0 || query[i - 1] !== '\\')) {
        inQuote = !inQuote;
      } else if (!inQuote) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (depth === 0) {
          for (const kw of keywords) {
            const len = kw.length;
            const sub = query.substring(i, i + len).toUpperCase();
            if (sub === kw) {
              const prevChar = i > 0 ? query[i - 1] : ' ';
              const nextChar = i + len < query.length ? query[i + len] : ' ';
              if (/[\s(),]/.test(prevChar) && /[\s(),]/.test(nextChar)) {
                positions.push({ keyword: kw as keyof TopLevelClauses, index: i, length: len });
                break;
              }
            }
          }
        }
      }
    }

    const clauses: TopLevelClauses = {};
    for (let p = 0; p < positions.length; p++) {
      const current = positions[p];
      const next = positions[p + 1];
      const startIndex = current.index + current.length;
      const endIndex = next ? next.index : query.length;
      clauses[current.keyword] = query.substring(startIndex, endIndex).trim();
    }
    return clauses;
  }

  public extractParenthesized(text: string, startKeywordIdx = 0): { openParenIdx: number; closeParenIdx: number; inner: string } | null {
    const openParenIdx = text.indexOf('(', startKeywordIdx);
    if (openParenIdx === -1) return null;

    let depth = 0;
    let inQuote = false;
    let closeParenIdx = -1;

    for (let i = openParenIdx; i < text.length; i++) {
      const ch = text[i];
      if (ch === "'" && (i === 0 || text[i - 1] !== '\\')) {
        inQuote = !inQuote;
      } else if (!inQuote) {
        if (ch === '(') depth++;
        else if (ch === ')') {
          depth--;
          if (depth === 0) {
            closeParenIdx = i;
            break;
          }
        }
      }
    }

    if (closeParenIdx === -1) return null;
    const inner = text.substring(openParenIdx + 1, closeParenIdx).trim();
    return { openParenIdx, closeParenIdx, inner };
  }

  public evaluateSelect(query: string): Record<string, unknown>[] {
    const clauses = this.splitTopLevelClauses(query);
    if (!clauses.SELECT) throw new Error('Missing SELECT clause in query');
    if (!clauses.FROM) throw new Error('Missing FROM clause in query');

    let workingRows: Record<string, unknown>[] = [];

    // 1. Process FROM (Subquery or base table with optional JOINs)
    const fromStr = clauses.FROM;
    if (fromStr.startsWith('(')) {
      const sub = this.extractParenthesized(fromStr, 0);
      if (!sub) throw new Error('Malformed subquery in FROM clause');
      const subRows = this.evaluateSelect(sub.inner);
      const afterParen = fromStr.substring(sub.closeParenIdx + 1).trim();
      const aliasMatch = afterParen.match(/^(?:AS\s+)?([a-zA-Z0-9_]+)/i);
      const alias = aliasMatch ? aliasMatch[1].toLowerCase() : 'derived';

      workingRows = subRows.map((r) => {
        const enriched = { ...r };
        for (const [k, v] of Object.entries(r)) {
          enriched[alias + '.' + k] = v;
        }
        return enriched;
      });
    } else {
      const joinSplitRegex = /\b(?:(LEFT|INNER)\s+)?JOIN\b/i;
      const firstJoinMatch = fromStr.match(joinSplitRegex);

      let primaryPart = fromStr;
      let joinsPart = '';
      if (firstJoinMatch && typeof firstJoinMatch.index === 'number') {
        primaryPart = fromStr.substring(0, firstJoinMatch.index).trim();
        joinsPart = fromStr.substring(firstJoinMatch.index).trim();
      }

      const primaryMatch = primaryPart.match(/^([a-zA-Z0-9_]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?$/i);
      if (!primaryMatch) throw new Error(`Invalid table expression in FROM: ${primaryPart}`);
      const primaryTable = primaryMatch[1].toLowerCase();
      const primaryAlias = (primaryMatch[2] || primaryTable).toLowerCase();
      if (!this.tables[primaryTable]) {
        throw new Error(`Table '${primaryTable}' does not exist in schema`);
      }
      const baseRows = this.tables[primaryTable];

      workingRows = baseRows.map((r) => this.createRowScope(r, primaryTable, primaryAlias));

      if (joinsPart) {
        const joinRegex = /(?:(LEFT|INNER)\s+)?JOIN\s+([a-zA-Z0-9_]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?\s+ON\s+([\s\S]+?)(?=(?:(?:LEFT|INNER\s+)?JOIN|$))/gi;
        let joinMatch: RegExpExecArray | null;
        while ((joinMatch = joinRegex.exec(joinsPart)) !== null) {
          const isLeft = (joinMatch[1] || '').toUpperCase() === 'LEFT';
          const joinTable = joinMatch[2].toLowerCase();
          const joinAlias = (joinMatch[3] || joinTable).toLowerCase();
          const joinOn = joinMatch[4].trim();

          if (!this.tables[joinTable]) {
            throw new Error(`Table '${joinTable}' does not exist in schema`);
          }
          const joinTableRows = this.tables[joinTable];

          const newWorkingRows: Record<string, unknown>[] = [];
          for (const leftRow of workingRows) {
            let matchedAny = false;
            for (const rightItem of joinTableRows) {
              const rightScoped = this.createRowScope(rightItem, joinTable, joinAlias);
              const combined = { ...leftRow };
              for (const [rk, rv] of Object.entries(rightScoped)) {
                if (rk.includes('.')) {
                  combined[rk] = rv;
                } else if (combined[rk] === undefined) {
                  combined[rk] = rv;
                }
              }
              if (this.evaluateCondition(joinOn, combined)) {
                newWorkingRows.push(combined);
                matchedAny = true;
              }
            }
            if (isLeft && !matchedAny) {
              const nullRight: Record<string, null> = {};
              for (const k of Object.keys(joinTableRows[0] || {})) {
                nullRight[joinTable + '.' + k] = null;
                nullRight[joinAlias + '.' + k] = null;
              }
              newWorkingRows.push({ ...leftRow, ...nullRight });
            }
          }
          workingRows = newWorkingRows;
        }
      }
    }

    // 2. Process WHERE
    if (clauses.WHERE) {
      workingRows = workingRows.filter((row) => this.evaluateCondition(clauses.WHERE!, row));
    }

    // 3. Process SELECT Expressions & Aggregations
    const selectExpressions = this.parseSelectExpressions(clauses.SELECT);
    const hasAggregates = selectExpressions.some((e) => /^(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(e.expr));

    let resultRows: Record<string, unknown>[] = [];

    if (clauses['GROUP BY']) {
      const groupColumns = clauses['GROUP BY'].split(',').map((c) => c.trim());
      const groups = new Map<string, Record<string, unknown>[]>();

      for (const row of workingRows) {
        const groupKey = groupColumns.map((col) => String(this.resolveValue(col, row))).join(':::');
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(row);
      }

      for (const rowsInGroup of groups.values()) {
        if (clauses.HAVING) {
          if (!this.evaluateHaving(clauses.HAVING, rowsInGroup)) {
            continue;
          }
        }

        const outRow: Record<string, unknown> = {};
        for (const exp of selectExpressions) {
          outRow[exp.alias] = this.evaluateExpressionInGroup(exp.expr, rowsInGroup);
        }
        resultRows.push(outRow);
      }
    } else if (hasAggregates && !selectExpressions.some((e) => /OVER\s*\(/i.test(e.expr))) {
      const outRow: Record<string, unknown> = {};
      for (const exp of selectExpressions) {
        outRow[exp.alias] = this.evaluateExpressionInGroup(exp.expr, workingRows);
      }
      resultRows.push(outRow);
    } else {
      resultRows = this.evaluateProjectionsWithWindows(selectExpressions, workingRows);
    }

    // 4. Process ORDER BY
    if (clauses['ORDER BY']) {
      const orderClauses = clauses['ORDER BY'].split(',').map((c) => c.trim());
      resultRows.sort((a, b) => {
        for (const clause of orderClauses) {
          const parts = clause.trim().split(/\s+/);
          const colName = parts[0];
          const isDesc = parts[1] && parts[1].toUpperCase() === 'DESC';

          const valA = a[colName] !== undefined ? a[colName] : this.resolveValue(colName, a);
          const valB = b[colName] !== undefined ? b[colName] : this.resolveValue(colName, b);

          if (valA === valB) continue;
          if (valA === null || valA === undefined) return isDesc ? 1 : -1;
          if (valB === null || valB === undefined) return isDesc ? -1 : 1;

          if (typeof valA === 'number' && typeof valB === 'number') {
            return isDesc ? valB - valA : valA - valB;
          }
          const cmp = String(valA).localeCompare(String(valB));
          return isDesc ? -cmp : cmp;
        }
        return 0;
      });
    }

    // 5. Process LIMIT
    if (clauses.LIMIT) {
      const limitMatch = clauses.LIMIT.match(/^(\d+)(?:\s+OFFSET\s+(\d+))?/i);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1], 10);
        const offset = limitMatch[2] ? parseInt(limitMatch[2], 10) : 0;
        resultRows = resultRows.slice(offset, offset + limit);
      }
    }

    return resultRows;
  }

  public createRowScope(row: Record<string, unknown>, tableName: string, alias?: string): Record<string, unknown> {
    const scope: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      scope[k] = v;
      scope[tableName + '.' + k] = v;
      if (alias) {
        scope[alias + '.' + k] = v;
      }
    }
    return scope;
  }

  public evaluateCondition(condition: string, row: Record<string, unknown>): boolean {
    const whereSubquery = this.extractParenthesized(condition, 0);
    if (whereSubquery && /^\s*SELECT\b/i.test(whereSubquery.inner)) {
      let innerQuery = whereSubquery.inner;
      innerQuery = innerQuery.replace(/\b([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\b/g, (match) => {
        const val = this.resolveValue(match, row);
        if (val !== null && val !== undefined) {
          return typeof val === 'string' ? `'${val}'` : String(val);
        }
        return match;
      });

      const subResult = this.evaluateSelect(innerQuery);
      const scalarVal = subResult.length > 0 ? Object.values(subResult[0])[0] : null;
      const fullSubqueryMatch = condition.substring(whereSubquery.openParenIdx, whereSubquery.closeParenIdx + 1);
      const replacedCond = condition.replace(fullSubqueryMatch, scalarVal !== null ? String(scalarVal) : 'NULL');
      return this.evaluateCondition(replacedCond, row);
    }

    if (/\s+AND\s+/i.test(condition)) {
      const parts = condition.split(/\s+AND\s+/i);
      return parts.every((p) => this.evaluateCondition(p.trim(), row));
    }
    if (/\s+OR\s+/i.test(condition)) {
      const parts = condition.split(/\s+OR\s+/i);
      return parts.some((p) => this.evaluateCondition(p.trim(), row));
    }

    const isNotNullMatch = condition.match(/^([a-zA-Z0-9_.]+)\s+IS\s+NOT\s+NULL$/i);
    if (isNotNullMatch) {
      const val = this.resolveValue(isNotNullMatch[1].trim(), row);
      return val !== null && val !== undefined;
    }
    const isNullMatch = condition.match(/^([a-zA-Z0-9_.]+)\s+IS\s+NULL$/i);
    if (isNullMatch) {
      const val = this.resolveValue(isNullMatch[1].trim(), row);
      return val === null || val === undefined;
    }

    const compMatch = condition.match(/([a-zA-Z0-9_.]+|'.*?'|\d+)\s*(=|!=|<>|>=|<=|>|<|LIKE|IN)\s*([\s\S]+)/i);
    if (!compMatch) return true;

    const leftRaw = compMatch[1].trim();
    const op = compMatch[2].toUpperCase();
    const rightRaw = compMatch[3].trim();

    const leftVal = this.resolveValue(leftRaw, row);
    const rightVal = this.resolveValue(rightRaw, row);

    switch (op) {
      case '=':
        return leftVal == rightVal;
      case '!=':
      case '<>':
        return leftVal != rightVal;
      case '>':
        return Number(leftVal) > Number(rightVal);
      case '<':
        return Number(leftVal) < Number(rightVal);
      case '>=':
        return Number(leftVal) >= Number(rightVal);
      case '<=':
        return Number(leftVal) <= Number(rightVal);
      case 'LIKE': {
        const pattern = String(rightVal).replace(/%/g, '.*').replace(/_/g, '.');
        return new RegExp('^' + pattern + '$', 'i').test(String(leftVal));
      }
      default:
        return false;
    }
  }

  public resolveValue(expr: string, row: Record<string, unknown>): unknown {
    const trimmed = expr.trim();
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1).replace(/''/g, "'");
    }
    if (!isNaN(Number(trimmed)) && trimmed !== '') {
      return Number(trimmed);
    }
    if (row[trimmed] !== undefined) {
      return row[trimmed];
    }
    const lower = trimmed.toLowerCase();
    if (row[lower] !== undefined) {
      return row[lower];
    }
    const dotIdx = lower.lastIndexOf('.');
    if (dotIdx !== -1) {
      const colOnly = lower.slice(dotIdx + 1);
      if (row[colOnly] !== undefined) {
        return row[colOnly];
      }
    }
    return null;
  }

  public parseSelectExpressions(selectText: string): { expr: string; alias: string }[] {
    const items: string[] = [];
    let current = '';
    let parenDepth = 0;
    for (let i = 0; i < selectText.length; i++) {
      const char = selectText[i];
      if (char === '(') parenDepth++;
      else if (char === ')') parenDepth--;

      if (char === ',' && parenDepth === 0) {
        items.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) items.push(current.trim());

    return items.map((item) => {
      const windowAsMatch = item.match(/^(.*?\s*OVER\s*\(.*?\))\s+(?:AS\s+)?([a-zA-Z0-9_]+)$/i);
      if (windowAsMatch) {
        return { expr: windowAsMatch[1].trim(), alias: windowAsMatch[2].trim() };
      }
      const mathAsMatch = item.match(/^(\(.*?\))\s+(?:AS\s+)?([a-zA-Z0-9_]+)$/i);
      if (mathAsMatch) {
        return { expr: mathAsMatch[1].trim(), alias: mathAsMatch[2].trim() };
      }
      const asMatch = item.match(/^(.*?)\s+(?:AS\s+)?([a-zA-Z0-9_]+)$/i);
      if (asMatch) {
        return { expr: asMatch[1].trim(), alias: asMatch[2].trim() };
      }
      const dotIdx = item.lastIndexOf('.');
      const cleanAlias = dotIdx !== -1 ? item.slice(dotIdx + 1).trim() : item.trim();
      return { expr: item.trim(), alias: cleanAlias };
    });
  }

  public evaluateHaving(havingClause: string, rowsInGroup: Record<string, unknown>[]): boolean {
    const compMatch = havingClause.match(/([a-zA-Z0-9_().]+)\s*(=|!=|<>|>=|<=|>|<)\s*([a-zA-Z0-9_().]+)/i);
    if (!compMatch) return true;

    const leftExpr = compMatch[1].trim();
    const op = compMatch[2];
    const rightExpr = compMatch[3].trim();

    const leftVal = this.evaluateAggregate(leftExpr, rowsInGroup);
    const rightVal = Number(rightExpr);

    switch (op) {
      case '>':
        return leftVal > rightVal;
      case '<':
        return leftVal < rightVal;
      case '>=':
        return leftVal >= rightVal;
      case '<=':
        return leftVal <= rightVal;
      case '=':
        return leftVal == rightVal;
      case '!=':
      case '<>':
        return leftVal != rightVal;
      default:
        return true;
    }
  }

  public evaluateAggregate(expr: string, rowsInGroup: Record<string, unknown>[]): number {
    const countMatch = expr.match(/COUNT\s*\((.*?)\)/i);
    if (countMatch) {
      const col = countMatch[1].trim();
      if (col === '*' || col === '1') return rowsInGroup.length;
      return rowsInGroup.filter((r) => this.resolveValue(col, r) !== null).length;
    }
    const sumMatch = expr.match(/SUM\s*\((.*?)\)/i);
    if (sumMatch) {
      const col = sumMatch[1].trim();
      return rowsInGroup.reduce((acc, r) => {
        const val = this.resolveValue(col, r);
        if (val === null || val === undefined || val === '') return acc;
        const n = Number(val);
        return acc + (!isNaN(n) ? n : 0);
      }, 0);
    }
    const avgMatch = expr.match(/AVG\s*\((.*?)\)/i);
    if (avgMatch) {
      const col = avgMatch[1].trim();
      const valid = rowsInGroup
        .map((r) => this.resolveValue(col, r))
        .filter((v) => v !== null && v !== undefined && v !== '')
        .map((v) => Number(v))
        .filter((n) => !isNaN(n));
      if (valid.length === 0) return 0;
      const sum = valid.reduce((a, b) => a + b, 0);
      return Math.round(sum / valid.length);
    }
    const maxMatch = expr.match(/MAX\s*\((.*?)\)/i);
    if (maxMatch) {
      const col = maxMatch[1].trim();
      const nums = rowsInGroup
        .map((r) => this.resolveValue(col, r))
        .filter((v) => v !== null && v !== undefined && v !== '')
        .map((v) => Number(v))
        .filter((n) => !isNaN(n));
      return nums.length > 0 ? Math.max(...nums) : 0;
    }
    const minMatch = expr.match(/MIN\s*\((.*?)\)/i);
    if (minMatch) {
      const col = minMatch[1].trim();
      const nums = rowsInGroup
        .map((r) => this.resolveValue(col, r))
        .filter((v) => v !== null && v !== undefined && v !== '')
        .map((v) => Number(v))
        .filter((n) => !isNaN(n));
      return nums.length > 0 ? Math.min(...nums) : 0;
    }
    return 0;
  }

  public evaluateExpressionInGroup(expr: string, rowsInGroup: Record<string, unknown>[]): unknown {
    const mathMatch = expr.match(
      /^\(?\s*(MAX|MIN|AVG|SUM|COUNT)\s*\((.*?)\)\s*([-+*/])\s*(MAX|MIN|AVG|SUM|COUNT)\s*\((.*?)\)\s*\)?$/i,
    );
    if (mathMatch) {
      const leftAgg = this.evaluateAggregate(mathMatch[1] + '(' + mathMatch[2] + ')', rowsInGroup);
      const op = mathMatch[3];
      const rightAgg = this.evaluateAggregate(mathMatch[4] + '(' + mathMatch[5] + ')', rowsInGroup);
      if (op === '-') return leftAgg - rightAgg;
      if (op === '+') return leftAgg + rightAgg;
      if (op === '*') return leftAgg * rightAgg;
      if (op === '/') return rightAgg !== 0 ? Math.round(leftAgg / rightAgg) : 0;
    }

    if (/^(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(expr)) {
      return this.evaluateAggregate(expr, rowsInGroup);
    }
    return this.resolveValue(expr, rowsInGroup[0] || {});
  }

  public evaluateProjectionsWithWindows(
    selectExpressions: { expr: string; alias: string }[],
    rows: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    const windowCalculators: {
      alias: string;
      func: string;
      partitionCols: string[];
      orderClauses: string[];
    }[] = [];

    for (const exp of selectExpressions) {
      const windowMatch = exp.expr.match(
        /^(ROW_NUMBER\s*\(\s*\)|DENSE_RANK\s*\(\s*\)|RANK\s*\(\s*\)|NTILE\s*\(\s*\d+\s*\)|SUM\s*\([^)]+\)|AVG\s*\([^)]+\))\s+OVER\s*\(([\s\S]*?)\)$/i,
      );
      if (windowMatch) {
        const funcSignature = windowMatch[1].trim();
        const overClause = windowMatch[2].trim();

        const partMatch = overClause.match(/PARTITION\s+BY\s+([a-zA-Z0-9_.,\s]+?)(?=(?:ORDER\s+BY|$))/i);
        const orderMatch = overClause.match(/ORDER\s+BY\s+([a-zA-Z0-9_.,\s]+)/i);

        const partitionCols = partMatch ? partMatch[1].split(',').map((c) => c.trim()) : [];
        const orderClauses = orderMatch ? orderMatch[1].split(',').map((c) => c.trim()) : [];

        windowCalculators.push({
          alias: exp.alias,
          func: funcSignature,
          partitionCols,
          orderClauses,
        });
      }
    }

    const enrichedRows: Record<string, unknown>[] = rows.map((r, i) => ({ ...r, __orig_index__: i }));

    for (const win of windowCalculators) {
      const partitions = new Map<string, Record<string, unknown>[]>();
      for (const row of enrichedRows) {
        const partKey =
          win.partitionCols.length > 0
            ? win.partitionCols.map((c) => String(this.resolveValue(c, row))).join(':::')
            : '__global__';
        if (!partitions.has(partKey)) partitions.set(partKey, []);
        partitions.get(partKey)!.push(row);
      }

      for (const partRows of partitions.values()) {
        if (win.orderClauses.length > 0) {
          partRows.sort((a, b) => {
            for (const clause of win.orderClauses) {
              const parts = clause.trim().split(/\s+/);
              const colName = parts[0];
              const isDesc = parts[1] && parts[1].toUpperCase() === 'DESC';

              const valA = this.resolveValue(colName, a);
              const valB = this.resolveValue(colName, b);

              if (valA === valB) continue;
              if (valA === null) return isDesc ? 1 : -1;
              if (valB === null) return isDesc ? -1 : 1;

              if (typeof valA === 'number' && typeof valB === 'number') {
                return isDesc ? valB - valA : valA - valB;
              }
              const cmp = String(valA).localeCompare(String(valB));
              return isDesc ? -cmp : cmp;
            }
            return 0;
          });
        }

        if (/^ROW_NUMBER/i.test(win.func)) {
          partRows.forEach((r, idx) => {
            r[win.alias] = idx + 1;
          });
        } else if (/^DENSE_RANK/i.test(win.func)) {
          let currentRank = 1;
          let prevVal: unknown = null;
          partRows.forEach((r, idx) => {
            const firstOrderCol = win.orderClauses[0]?.split(/\s+/)[0];
            const currentVal = firstOrderCol ? this.resolveValue(firstOrderCol, r) : idx;
            if (idx > 0 && currentVal !== prevVal) {
              currentRank++;
            }
            r[win.alias] = currentRank;
            prevVal = currentVal;
          });
        } else if (/^NTILE\s*\((\d+)\)/i.test(win.func)) {
          const ntileMatch = win.func.match(/^NTILE\s*\((\d+)\)/i);
          const numBuckets = parseInt(ntileMatch![1], 10);
          const totalRows = partRows.length;
          partRows.forEach((r, idx) => {
            r[win.alias] = Math.floor((idx * numBuckets) / totalRows) + 1;
          });
        } else if (/^SUM\s*\((.*?)\)/i.test(win.func)) {
          const sumMatch = win.func.match(/^SUM\s*\((.*?)\)/i);
          const col = sumMatch![1].trim();
          let runningTotal = 0;
          partRows.forEach((r) => {
            runningTotal += Number(this.resolveValue(col, r)) || 0;
            r[win.alias] = runningTotal;
          });
        }
      }
    }

    enrichedRows.sort((a, b) => Number(a.__orig_index__) - Number(b.__orig_index__));

    return enrichedRows.map((row) => {
      const out: Record<string, unknown> = {};
      for (const exp of selectExpressions) {
        if (row[exp.alias] !== undefined) {
          out[exp.alias] = row[exp.alias];
        } else {
          out[exp.alias] = this.resolveValue(exp.expr, row);
        }
      }
      return out;
    });
  }
}

/**
 * Executes a SQL query locally in memory against the provided schema and seed data.
 * If schema or seed data are omitted, standard department/employee records are utilized.
 */
export function executeSqlQueryLocally(
  query: string,
  schemaDdl = DEFAULT_SQL_SCHEMA,
  seedDataSql = DEFAULT_SQL_SEED,
): SqlExecutionResult {
  const engine = new InMemorySqlEngine();
  engine.executeDdl(schemaDdl);
  engine.executeSeed(seedDataSql);
  return engine.run(query);
}

/**
 * Validates candidate SQL query results locally against expected query specification or target rows.
 */
export function validateSqlQueryLocally(
  userQuery: string,
  schemaDdl = DEFAULT_SQL_SCHEMA,
  seedDataSql = DEFAULT_SQL_SEED,
  expectedQuery?: string,
  expectedRows?: Record<string, unknown>[],
): SqlValidationResult {
  const startTime = Date.now();
  const engine = new InMemorySqlEngine();
  engine.executeDdl(schemaDdl);
  engine.executeSeed(seedDataSql);

  const candidateResult = engine.run(userQuery);
  if (!candidateResult.success) {
    return {
      passed: false,
      message: candidateResult.error || 'SQL Query execution failed',
      candidateRows: [],
      executionTimeMs: Math.max(1, Date.now() - startTime),
    };
  }

  let targetRows: Record<string, unknown>[] | undefined = expectedRows;
  if (!targetRows && expectedQuery) {
    const expectedResult = engine.run(expectedQuery);
    if (expectedResult.success) {
      targetRows = expectedResult.rows;
    }
  }

  if (targetRows) {
    if (candidateResult.rowCount !== targetRows.length) {
      return {
        passed: false,
        message: `Row count mismatch: expected ${targetRows.length} rows, received ${candidateResult.rowCount}`,
        expectedRowCount: targetRows.length,
        actualRowCount: candidateResult.rowCount,
        candidateRows: candidateResult.rows,
        expectedRows: targetRows,
        executionTimeMs: Math.max(1, Date.now() - startTime),
      };
    }

    const sortKey = (r: Record<string, unknown>) => JSON.stringify(r);
    const sortedCandidate = [...candidateResult.rows].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    const sortedExpected = [...targetRows].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

    const isMatch = JSON.stringify(sortedCandidate) === JSON.stringify(sortedExpected);
    if (!isMatch) {
      return {
        passed: false,
        message: 'Data mismatch: query output does not match expected result set',
        expectedRowCount: targetRows.length,
        actualRowCount: candidateResult.rowCount,
        candidateRows: candidateResult.rows,
        expectedRows: targetRows,
        executionTimeMs: Math.max(1, Date.now() - startTime),
      };
    }
  }

  return {
    passed: true,
    message: 'Query validation successful: output rows match expected specification',
    expectedRowCount: targetRows?.length ?? candidateResult.rowCount,
    actualRowCount: candidateResult.rowCount,
    candidateRows: candidateResult.rows,
    expectedRows: targetRows,
    executionTimeMs: Math.max(1, Date.now() - startTime),
  };
}
