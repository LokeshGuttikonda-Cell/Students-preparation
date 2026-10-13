/**
 * IT Roles PDF Handbook & Document Generation Engine
 * Pure TypeScript, standard-compliant vector PDF 1.4 builder and Markdown exporter.
 * Zero third-party dependencies, 100% offline client-side & server-side execution.
 */

import type { RoleHandbook } from './role-handbooks-data';

// ==========================================
// PURE TYPESCRIPT PDF 1.4 VECTOR ENGINE
// ==========================================

interface PdfPage {
  commands: string[];
}

class SimplePdfDocument {
  private pages: PdfPage[] = [];
  private currentPage: PdfPage | null = null;
  private offsets: number[] = [];

  constructor() {
    this.newPage();
  }

  newPage(): void {
    const page: PdfPage = { commands: [] };
    this.pages.push(page);
    this.currentPage = page;
  }

  getPageCount(): number {
    return this.pages.length;
  }

  addRaw(cmd: string): void {
    if (this.currentPage) {
      this.currentPage.commands.push(cmd);
    }
  }

  // Draw filled rectangle (RGB in 0..1)
  drawRect(x: number, y: number, w: number, h: number, r: number, g: number, b: number): void {
    this.addRaw(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }

  // Draw stroked line
  drawLine(x1: number, y1: number, x2: number, y2: number, r: number, g: number, b: number, lineWidth = 1): void {
    this.addRaw(`${lineWidth.toFixed(2)} w ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  // Draw single line of text
  drawText(
    text: string,
    x: number,
    y: number,
    font: 'F1' | 'F2' | 'F3' | 'F4' | 'F5',
    size: number,
    r = 0.1,
    g = 0.1,
    b = 0.1
  ): void {
    const sanitized = sanitizePdfText(text);
    this.addRaw(
      `BT /${font} ${size} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${sanitized}) Tj ET`
    );
  }

  build(): Uint8Array {
    let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
    this.offsets = [0];

    // Obj 1: Catalog
    // Obj 2: Outlines
    // Obj 3: Pages
    // Obj 4..N: Page objects
    // Font objects:
    // F1 = Helvetica (Obj F1)
    // F2 = Helvetica-Bold (Obj F2)
    // F3 = Helvetica-Oblique (Obj F3)
    // F4 = Courier (Obj F4)
    // F5 = Courier-Bold (Obj F5)

    const fontStartObj = 4 + this.pages.length * 2;
    const f1Obj = fontStartObj;
    const f2Obj = fontStartObj + 1;
    const f3Obj = fontStartObj + 2;
    const f4Obj = fontStartObj + 3;
    const f5Obj = fontStartObj + 4;

    const pageObjIds: number[] = [];
    const contentObjIds: number[] = [];

    for (let i = 0; i < this.pages.length; i++) {
      const pageId = 4 + i * 2;
      const contentId = pageId + 1;
      pageObjIds.push(pageId);
      contentObjIds.push(contentId);
    }

    const totalObjects = f5Obj;

    // Build object strings
    const objMap: Record<number, string> = {};

    objMap[1] = '<< /Type /Catalog /Pages 3 0 R /Outlines 2 0 R >>';
    objMap[2] = '<< /Type /Outlines /Count 0 >>';
    objMap[3] = `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${this.pages.length} >>`;

    for (let i = 0; i < this.pages.length; i++) {
      const pageId = pageObjIds[i];
      const contentId = contentObjIds[i];

      objMap[pageId] = `<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595.28 841.89] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${f1Obj} 0 R /F2 ${f2Obj} 0 R /F3 ${f3Obj} 0 R /F4 ${f4Obj} 0 R /F5 ${f5Obj} 0 R >> >> >>`;

      const streamContent = this.pages[i].commands.join('\n');
      const streamBytes = Buffer.from(streamContent, 'latin1');
      objMap[contentId] = `<< /Length ${streamBytes.length} >>\nstream\n${streamContent}\nendstream`;
    }

    objMap[f1Obj] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objMap[f2Obj] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    objMap[f3Obj] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>';
    objMap[f4Obj] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>';
    objMap[f5Obj] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>';

    // Assemble PDF string and offsets
    for (let i = 1; i <= totalObjects; i++) {
      this.offsets.push(Buffer.byteLength(out, 'latin1'));
      out += `${i} 0 obj\n${objMap[i]}\nendobj\n`;
    }

    const xrefOffset = Buffer.byteLength(out, 'latin1');
    out += `xref\n0 ${totalObjects + 1}\n`;
    out += '0000000000 65535 f \n';
    for (let i = 1; i <= totalObjects; i++) {
      out += `${this.offsets[i].toString().padStart(10, '0')} 00000 n \n`;
    }

    out += `trailer\n<<\n  /Size ${totalObjects + 1}\n  /Root 1 0 R\n>>\n`;
    out += `startxref\n${xrefOffset}\n%%EOF\n`;

    return new Uint8Array(Buffer.from(out, 'latin1'));
  }
}

// Sanitize text for standard Type 1 WinAnsi encoding
function sanitizePdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '--')
    .replace(/\u2022/g, '*')
    .replace(/\u2192/g, '->')
    .replace(/\u2265/g, '>=')
    .replace(/\u2264/g, '<=')
    .replace(/[^\x20-\x7E]/g, ' ');
}

// Word-wrap utility
function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxChars) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// ==========================================
// ROLE HANDBOOK PDF GENERATION
// ==========================================

export function generateRoleHandbookPdf(role: RoleHandbook): Uint8Array {
  const doc = new SimplePdfDocument();
  const pageWidth = 595.28;
  const marginX = 45;
  const contentWidth = pageWidth - marginX * 2; // 505.28
  let currentY = 790;
  let pageNum = 1;

  function renderHeader(isFirstPage = false) {
    if (isFirstPage) {
      // Large Top Banner
      doc.drawRect(marginX, currentY - 55, contentWidth, 55, 0.071, 0.227, 0.369); // primary-900 (#123a5e)
      doc.drawText('STUDENTSPREP ENGINEERING HANDBOOK', marginX + 15, currentY - 20, 'F2', 9, 0.75, 0.85, 0.95);
      doc.drawText(role.name.toUpperCase(), marginX + 15, currentY - 42, 'F2', 17, 1.0, 1.0, 1.0);
      currentY -= 75;

      // Metadata Bar
      doc.drawRect(marginX, currentY - 22, contentWidth, 22, 0.94, 0.96, 0.98);
      doc.drawText(
        `Discipline: ${role.category}   |   Target Level: ${role.targetLevel}   |   Est. Read: ${role.estimatedReadTime}   |   100% Technical Signal`,
        marginX + 12,
        currentY - 15,
        'F1',
        8.5,
        0.2,
        0.3,
        0.4
      );
      currentY -= 35;
    } else {
      // Running Page Header
      doc.drawRect(marginX, 805, contentWidth, 18, 0.95, 0.96, 0.98);
      doc.drawText(`StudentsPrep Technical Handbook: ${role.name}`, marginX + 10, 810, 'F2', 8, 0.2, 0.3, 0.4);
      doc.drawText(role.category, pageWidth - marginX - 110, 810, 'F1', 8, 0.4, 0.5, 0.6);
      doc.drawLine(marginX, 804, pageWidth - marginX, 804, 0.8, 0.85, 0.9, 0.5);
      currentY = 785;
    }
  }

  function renderFooter() {
    doc.drawLine(marginX, 45, pageWidth - marginX, 45, 0.8, 0.85, 0.9, 0.5);
    doc.drawText('CONFIDENTIAL & PROPRIETARY -- STUDENTSPREP CAREER PLATFORM', marginX, 32, 'F1', 7.5, 0.5, 0.5, 0.5);
    doc.drawText(`Page ${pageNum}`, pageWidth - marginX - 45, 32, 'F2', 8, 0.3, 0.4, 0.5);
  }

  function checkPageBreak(requiredHeight: number) {
    if (currentY - requiredHeight < 55) {
      renderFooter();
      doc.newPage();
      pageNum++;
      renderHeader(false);
    }
  }

  // Initial Cover Header
  renderHeader(true);

  // Section: Executive Overview
  checkPageBreak(80);
  doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.12, 0.32, 0.52);
  doc.drawText('1. ROLE MISSION & EXECUTIVE PROFILE', marginX + 10, currentY - 13, 'F2', 10, 1, 1, 1);
  currentY -= 30;

  const overviewLines = wrapText(role.information.overview, 85);
  for (const line of overviewLines) {
    checkPageBreak(14);
    doc.drawText(line, marginX + 5, currentY, 'F1', 9.5, 0.15, 0.15, 0.15);
    currentY -= 13;
  }
  currentY -= 6;

  // Day in the life bullet points
  checkPageBreak(30);
  doc.drawText('Typical Day-in-the-Life & Engineering Focus:', marginX + 5, currentY, 'F2', 9.5, 0.1, 0.2, 0.35);
  currentY -= 15;
  for (const item of role.information.dayInTheLife) {
    const wrapped = wrapText(item, 82);
    checkPageBreak(wrapped.length * 13 + 4);
    doc.drawText('*', marginX + 10, currentY, 'F2', 9, 0.12, 0.32, 0.52);
    for (let idx = 0; idx < wrapped.length; idx++) {
      doc.drawText(wrapped[idx], marginX + 22, currentY, 'F1', 9, 0.2, 0.2, 0.2);
      currentY -= 12;
    }
    currentY -= 2;
  }
  currentY -= 8;

  // Career Progression Ladder Table
  checkPageBreak(110);
  doc.drawText('Senior Engineering Career Progression Ladder:', marginX + 5, currentY, 'F2', 9.5, 0.1, 0.2, 0.35);
  currentY -= 16;
  doc.drawRect(marginX + 5, currentY - 15, contentWidth - 10, 15, 0.9, 0.93, 0.96);
  doc.drawText('Level', marginX + 12, currentY - 11, 'F2', 8, 0.1, 0.2, 0.3);
  doc.drawText('Title', marginX + 55, currentY - 11, 'F2', 8, 0.1, 0.2, 0.3);
  doc.drawText('Experience', marginX + 190, currentY - 11, 'F2', 8, 0.1, 0.2, 0.3);
  doc.drawText('Architectural Responsibility', marginX + 265, currentY - 11, 'F2', 8, 0.1, 0.2, 0.3);
  currentY -= 18;

  for (const tier of role.information.careerProgression) {
    checkPageBreak(16);
    doc.drawText(tier.level, marginX + 12, currentY, 'F2', 8, 0.1, 0.3, 0.6);
    doc.drawText(tier.title, marginX + 55, currentY, 'F1', 8, 0.1, 0.1, 0.1);
    doc.drawText(tier.typicalExperience, marginX + 190, currentY, 'F1', 8, 0.3, 0.3, 0.3);
    const focusWrapped = wrapText(tier.focus, 45);
    doc.drawText(focusWrapped[0] || '', marginX + 265, currentY, 'F1', 8, 0.2, 0.2, 0.2);
    currentY -= 14;
  }
  currentY -= 12;

  // Compensation Benchmarks
  checkPageBreak(85);
  doc.drawText('Market Compensation Benchmarks by Tier:', marginX + 5, currentY, 'F2', 9.5, 0.1, 0.2, 0.35);
  currentY -= 16;
  doc.drawRect(marginX + 5, currentY - 15, contentWidth - 10, 15, 0.9, 0.93, 0.96);
  doc.drawText('Region', marginX + 12, currentY - 11, 'F2', 8, 0.1, 0.2, 0.3);
  doc.drawText('Entry Tier (L1)', marginX + 140, currentY - 11, 'F2', 8, 0.1, 0.2, 0.3);
  doc.drawText('Mid-Senior (L2/L3)', marginX + 260, currentY - 11, 'F2', 8, 0.1, 0.2, 0.3);
  doc.drawText('Staff/Principal (L4)', marginX + 380, currentY - 11, 'F2', 8, 0.1, 0.2, 0.3);
  currentY -= 18;

  for (const comp of role.information.compensationBands) {
    checkPageBreak(16);
    doc.drawText(comp.region, marginX + 12, currentY, 'F2', 8, 0.1, 0.1, 0.1);
    doc.drawText(comp.entryLevel, marginX + 140, currentY, 'F1', 8, 0.2, 0.2, 0.2);
    doc.drawText(comp.midSenior, marginX + 260, currentY, 'F1', 8, 0.2, 0.2, 0.2);
    doc.drawText(comp.staffPrincipal, marginX + 380, currentY, 'F1', 8, 0.1, 0.4, 0.2);
    currentY -= 14;
  }
  currentY -= 16;

  // Section 2: Comprehensive Multi-Tier Syllabus
  checkPageBreak(90);
  doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.12, 0.32, 0.52);
  doc.drawText('2. EVALUATED SYLLABUS & CURRICULUM ROADMAP', marginX + 10, currentY - 13, 'F2', 10, 1, 1, 1);
  currentY -= 30;

  for (const tier of role.syllabus) {
    checkPageBreak(50);
    doc.drawRect(marginX + 5, currentY - 16, contentWidth - 10, 16, 0.93, 0.95, 0.98);
    doc.drawText(`${tier.tier}: ${tier.title} (${tier.durationWeeks} Weeks)`, marginX + 12, currentY - 12, 'F2', 9, 0.08, 0.25, 0.45);
    currentY -= 24;

    const descLines = wrapText(tier.description, 85);
    for (const l of descLines) {
      checkPageBreak(13);
      doc.drawText(l, marginX + 10, currentY, 'F3', 8.5, 0.3, 0.3, 0.3);
      currentY -= 12;
    }
    currentY -= 6;

    for (const comp of tier.competencies) {
      checkPageBreak(35);
      doc.drawText(`- ${comp.topic}`, marginX + 12, currentY, 'F2', 8.5, 0.1, 0.2, 0.3);
      doc.drawText(`Weight: ${comp.weightPercentage}% | Benchmark Accuracy: ${comp.benchmarkAccuracy}%`, marginX + 330, currentY, 'F1', 8, 0.3, 0.4, 0.5);
      currentY -= 13;

      for (const inv of comp.coreInvariants) {
        checkPageBreak(12);
        doc.drawText(`  * Invariant: ${inv}`, marginX + 20, currentY, 'F1', 8, 0.25, 0.25, 0.25);
        currentY -= 11;
      }
      currentY -= 4;
    }

    if (tier.handsOnProjects && tier.handsOnProjects.length > 0) {
      for (const proj of tier.handsOnProjects) {
        checkPageBreak(40);
        doc.drawText(`Capstone Project: ${proj.title}`, marginX + 12, currentY, 'F2', 8.5, 0.15, 0.35, 0.2);
        currentY -= 12;
        const specLines = wrapText(proj.spec, 80);
        for (const sl of specLines) {
          checkPageBreak(12);
          doc.drawText(sl, marginX + 20, currentY, 'F1', 8, 0.2, 0.2, 0.2);
          currentY -= 11;
        }
        currentY -= 4;
      }
    }
    currentY -= 10;
  }

  // Section 3: Technical Screening Questions & Counter-Probes
  checkPageBreak(90);
  doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.12, 0.32, 0.52);
  doc.drawText('3. TECHNICAL INTERVIEW QUESTIONS & MODEL EVALUATIONS', marginX + 10, currentY - 13, 'F2', 10, 1, 1, 1);
  currentY -= 30;

  for (let qIdx = 0; qIdx < role.questions.length; qIdx++) {
    const q = role.questions[qIdx];
    checkPageBreak(60);

    doc.drawText(`Question ${qIdx + 1}: ${q.title} [${q.difficulty}] -- ${q.category}`, marginX + 5, currentY, 'F2', 9.5, 0.1, 0.2, 0.4);
    currentY -= 15;

    const qLines = wrapText(q.questionText, 85);
    for (const ql of qLines) {
      checkPageBreak(13);
      doc.drawText(ql, marginX + 10, currentY, 'F2', 9, 0.15, 0.15, 0.15);
      currentY -= 13;
    }
    currentY -= 6;

    // Model Answer Box
    doc.drawText('Model Architectural Answer:', marginX + 10, currentY, 'F2', 8.5, 0.1, 0.4, 0.2);
    currentY -= 12;
    const aLines = wrapText(q.modelAnswer, 85);
    for (const al of aLines) {
      checkPageBreak(13);
      doc.drawText(al, marginX + 12, currentY, 'F1', 8.5, 0.2, 0.2, 0.2);
      currentY -= 12;
    }
    currentY -= 6;

    // Counter Questions
    if (q.counterQuestions && q.counterQuestions.length > 0) {
      checkPageBreak(30);
      doc.drawText('Interviewer Follow-Up Counter-Questions:', marginX + 10, currentY, 'F2', 8.5, 0.6, 0.2, 0.1);
      currentY -= 12;
      for (const cq of q.counterQuestions) {
        const cqLines = wrapText(cq, 80);
        for (const cql of cqLines) {
          checkPageBreak(12);
          doc.drawText(`? ${cql}`, marginX + 16, currentY, 'F3', 8, 0.3, 0.15, 0.1);
          currentY -= 11;
        }
      }
      currentY -= 4;
    }

    // Critical Pitfalls
    if (q.criticalPitfalls && q.criticalPitfalls.length > 0) {
      checkPageBreak(25);
      doc.drawText('Candidate Rejection Pitfalls:', marginX + 10, currentY, 'F2', 8.5, 0.7, 0.1, 0.1);
      currentY -= 12;
      for (const pf of q.criticalPitfalls) {
        const pfLines = wrapText(pf, 80);
        for (const pfl of pfLines) {
          checkPageBreak(12);
          doc.drawText(`! ${pfl}`, marginX + 16, currentY, 'F1', 8, 0.4, 0.1, 0.1);
          currentY -= 11;
        }
      }
    }
    currentY -= 16;
  }

  // Section 4: Recruiter Traps & Anti-Patterns
  checkPageBreak(90);
  doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.12, 0.32, 0.52);
  doc.drawText('4. RECRUITER TRAPS & ANTI-PATTERNS', marginX + 10, currentY - 13, 'F2', 10, 1, 1, 1);
  currentY -= 30;

  for (const trap of role.interviewTraps) {
    checkPageBreak(65);
    doc.drawRect(marginX + 5, currentY - 15, contentWidth - 10, 15, 0.98, 0.92, 0.92);
    doc.drawText(`[DANGER: ${trap.dangerLevel}] ${trap.title}`, marginX + 10, currentY - 11, 'F2', 8.5, 0.7, 0.1, 0.1);
    currentY -= 22;

    doc.drawText('Candidate Anti-Pattern:', marginX + 10, currentY, 'F2', 8, 0.6, 0.1, 0.1);
    currentY -= 11;
    const antiLines = wrapText(trap.antiPattern, 82);
    for (const an of antiLines) {
      checkPageBreak(12);
      doc.drawText(an, marginX + 18, currentY, 'F1', 8, 0.3, 0.1, 0.1);
      currentY -= 11;
    }
    currentY -= 4;

    doc.drawText('Textbook-Grade Correct Approach:', marginX + 10, currentY, 'F2', 8, 0.1, 0.4, 0.2);
    currentY -= 11;
    const corLines = wrapText(trap.correctApproach, 82);
    for (const cr of corLines) {
      checkPageBreak(12);
      doc.drawText(cr, marginX + 18, currentY, 'F1', 8, 0.1, 0.25, 0.15);
      currentY -= 11;
    }
    currentY -= 12;
  }

  // Section 5: Deep-Dive Architectural Documentation & Invariants
  checkPageBreak(90);
  doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.12, 0.32, 0.52);
  doc.drawText('5. ARCHITECTURAL DOCUMENTATION & PRODUCTION INVARIANTS', marginX + 10, currentY - 13, 'F2', 10, 1, 1, 1);
  currentY -= 30;

  for (const docSec of role.documentation) {
    checkPageBreak(50);
    doc.drawText(docSec.sectionTitle, marginX + 5, currentY, 'F2', 10, 0.1, 0.25, 0.45);
    currentY -= 15;

    const docOverview = wrapText(docSec.overview, 85);
    for (const d of docOverview) {
      checkPageBreak(13);
      doc.drawText(d, marginX + 10, currentY, 'F1', 9, 0.2, 0.2, 0.2);
      currentY -= 12;
    }
    currentY -= 8;

    for (const inv of docSec.architecturalInvariants) {
      checkPageBreak(50);
      doc.drawRect(marginX + 10, currentY - 14, contentWidth - 20, 14, 0.94, 0.95, 0.97);
      doc.drawText(`INVARIANT: ${inv.title}`, marginX + 15, currentY - 10, 'F2', 8, 0.1, 0.2, 0.35);
      currentY -= 20;

      doc.drawText(`Formula / Invariant: ${inv.formulaOrInvariant}`, marginX + 15, currentY, 'F5', 8.5, 0.1, 0.3, 0.6);
      currentY -= 13;

      const expLines = wrapText(inv.explanation, 80);
      for (const e of expLines) {
        checkPageBreak(12);
        doc.drawText(e, marginX + 15, currentY, 'F1', 8, 0.2, 0.2, 0.2);
        currentY -= 11;
      }
      currentY -= 4;

      const tradeLines = wrapText(`Trade-offs: ${inv.tradeoffs}`, 80);
      for (const t of tradeLines) {
        checkPageBreak(12);
        doc.drawText(t, marginX + 15, currentY, 'F3', 8, 0.3, 0.3, 0.3);
        currentY -= 11;
      }
      currentY -= 10;
    }

    if (docSec.codeExamples && docSec.codeExamples.length > 0) {
      for (const codeEx of docSec.codeExamples) {
        checkPageBreak(60);
        doc.drawText(`Production Code Reference: ${codeEx.title} (${codeEx.language})`, marginX + 10, currentY, 'F2', 8.5, 0.1, 0.3, 0.5);
        currentY -= 14;

        const codeLines = codeEx.code.split('\n');
        doc.drawRect(marginX + 10, currentY - (codeLines.length * 10 + 6), contentWidth - 20, codeLines.length * 10 + 6, 0.96, 0.97, 0.98);
        currentY -= 8;
        for (const cl of codeLines) {
          checkPageBreak(11);
          doc.drawText(cl, marginX + 15, currentY, 'F4', 7.5, 0.15, 0.15, 0.15);
          currentY -= 10;
        }
        currentY -= 6;
      }
    }
  }

  // Final Footer
  renderFooter();

  return doc.build();
}

// ==========================================
// MASTER ENGINEERING COMPENDIUM (ALL 12 ROLES)
// ==========================================

export function generateMasterCompendiumPdf(roles: RoleHandbook[]): Uint8Array {
  const doc = new SimplePdfDocument();
  const pageWidth = 595.28;
  const marginX = 45;
  const contentWidth = pageWidth - marginX * 2;
  let currentY = 790;
  let pageNum = 1;

  function renderHeader(isFirstPage = false) {
    if (isFirstPage) {
      // Mega Title Cover Banner
      doc.drawRect(marginX, currentY - 80, contentWidth, 80, 0.071, 0.227, 0.369);
      doc.drawText('STUDENTSPREP MASTER COMPENDIUM', marginX + 20, currentY - 25, 'F2', 11, 0.8, 0.9, 1.0);
      doc.drawText(`${roles.length} IT ROLES ENGINEERING HANDBOOK`, marginX + 20, currentY - 50, 'F2', 18, 1.0, 1.0, 1.0);
      doc.drawText('Complete Syllabi, Technical Questions, Recruiter Traps & Architectural Invariants', marginX + 20, currentY - 70, 'F3', 8.5, 0.8, 0.85, 0.9);
      currentY -= 105;

      // Overview box
      doc.drawRect(marginX, currentY - 30, contentWidth, 30, 0.94, 0.96, 0.98);
      doc.drawText(
        `Edition: 2026 Comprehensive Release   |   ${roles.length} IT Role Tracks   |   100% Technical Signal   |   Zero Vendor Placement`,
        marginX + 12,
        currentY - 18,
        'F2',
        8.5,
        0.15,
        0.25,
        0.4
      );
      currentY -= 45;
    } else {
      doc.drawRect(marginX, 805, contentWidth, 18, 0.95, 0.96, 0.98);
      doc.drawText(`StudentsPrep ${roles.length} IT Roles Master Engineering Compendium`, marginX + 10, 810, 'F2', 8, 0.2, 0.3, 0.4);
      doc.drawText('Full Technical Specification', pageWidth - marginX - 120, 810, 'F1', 8, 0.4, 0.5, 0.6);
      doc.drawLine(marginX, 804, pageWidth - marginX, 804, 0.8, 0.85, 0.9, 0.5);
      currentY = 785;
    }
  }

  function renderFooter() {
    doc.drawLine(marginX, 45, pageWidth - marginX, 45, 0.8, 0.85, 0.9, 0.5);
    doc.drawText('CONFIDENTIAL & PROPRIETARY -- STUDENTSPREP CAREER PLATFORM', marginX, 32, 'F1', 7.5, 0.5, 0.5, 0.5);
    doc.drawText(`Page ${pageNum}`, pageWidth - marginX - 45, 32, 'F2', 8, 0.3, 0.4, 0.5);
  }

  function checkPageBreak(requiredHeight: number) {
    if (currentY - requiredHeight < 55) {
      renderFooter();
      doc.newPage();
      pageNum++;
      renderHeader(false);
    }
  }

  renderHeader(true);

  // Table of Contents
  checkPageBreak(120);
  doc.drawText('TABLE OF CONTENTS & DISCIPLINE INDEX', marginX + 5, currentY, 'F2', 12, 0.08, 0.22, 0.38);
  currentY -= 20;

  for (let rIdx = 0; rIdx < roles.length; rIdx++) {
    const r = roles[rIdx];
    checkPageBreak(16);
    doc.drawText(`${(rIdx + 1).toString().padStart(2, '0')}. ${r.name}`, marginX + 10, currentY, 'F2', 9, 0.1, 0.2, 0.35);
    doc.drawText(`[${r.category}]  --  ${r.targetLevel}`, marginX + 280, currentY, 'F1', 8, 0.4, 0.4, 0.4);
    currentY -= 14;
  }
  currentY -= 25;

  // Render each role sequentially
  for (let rIdx = 0; rIdx < roles.length; rIdx++) {
    const role = roles[rIdx];
    checkPageBreak(110);

    // Major Role Chapter Banner
    doc.drawRect(marginX, currentY - 32, contentWidth, 32, 0.071, 0.227, 0.369);
    doc.drawText(`CHAPTER ${rIdx + 1}: ${role.name.toUpperCase()}`, marginX + 14, currentY - 18, 'F2', 12, 1, 1, 1);
    doc.drawText(
      `Discipline: ${role.category}   |   Target Level: ${role.targetLevel}   |   Est. Study Time: ${role.estimatedReadTime}`,
      marginX + 14,
      currentY - 28,
      'F3',
      7.5,
      0.82,
      0.9,
      0.98
    );
    currentY -= 46;

    // --- 1. Role Mission & Executive Information ---
    checkPageBreak(50);
    doc.drawRect(marginX + 5, currentY - 16, contentWidth - 10, 16, 0.94, 0.96, 0.98);
    doc.drawText('1. ROLE MISSION & EXECUTIVE PROFILE', marginX + 12, currentY - 12, 'F2', 8.5, 0.08, 0.22, 0.38);
    currentY -= 22;

    const ovLines = wrapText(role.information.overview, 85);
    for (const line of ovLines) {
      checkPageBreak(13);
      doc.drawText(line, marginX + 8, currentY, 'F1', 8.5, 0.15, 0.15, 0.15);
      currentY -= 12;
    }
    currentY -= 4;

    // Key Tools & Runtime Technologies
    checkPageBreak(25);
    doc.drawText('Primary Tools & Technologies:', marginX + 8, currentY, 'F2', 8, 0.1, 0.25, 0.4);
    currentY -= 12;
    const toolsStr = role.information.keyToolsAndTechnologies.join(', ');
    const toolLines = wrapText(toolsStr, 80);
    for (const tl of toolLines) {
      checkPageBreak(12);
      doc.drawText(tl, marginX + 14, currentY, 'F4', 7.5, 0.2, 0.2, 0.2);
      currentY -= 11;
    }
    currentY -= 4;

    // Core Responsibilities
    checkPageBreak(30);
    doc.drawText('Core Responsibilities & Delivery Focus:', marginX + 8, currentY, 'F2', 8, 0.1, 0.25, 0.4);
    currentY -= 12;
    for (const resp of role.information.coreResponsibilities) {
      checkPageBreak(13);
      const respLines = wrapText(`* ${resp}`, 80);
      for (const rl of respLines) {
        doc.drawText(rl, marginX + 14, currentY, 'F1', 8, 0.2, 0.2, 0.2);
        currentY -= 11;
      }
    }
    currentY -= 4;

    // Senior Career Progression Ladder
    checkPageBreak(70);
    doc.drawText('Senior Career Ladder & Compensation Benchmarks:', marginX + 8, currentY, 'F2', 8, 0.1, 0.25, 0.4);
    currentY -= 12;
    for (const prog of role.information.careerProgression) {
      checkPageBreak(13);
      doc.drawText(
        `[${prog.level}] ${prog.title} (${prog.typicalExperience}) - Focus: ${prog.focus}`,
        marginX + 14,
        currentY,
        'F1',
        7.5,
        0.25,
        0.25,
        0.25
      );
      currentY -= 11;
    }
    currentY -= 2;

    // Compensation Summary
    const compSummary = role.information.compensationBands.map((c) => `${c.region}: L1 ${c.entryLevel} / L3 ${c.midSenior} / L4+ ${c.staffPrincipal}`).join(' | ');
    const compLines = wrapText(compSummary, 85);
    for (const cl of compLines) {
      checkPageBreak(12);
      doc.drawText(cl, marginX + 14, currentY, 'F3', 7.5, 0.35, 0.35, 0.35);
      currentY -= 11;
    }
    currentY -= 8;

    // --- 2. Evaluated Syllabus & Curriculum Roadmap ---
    checkPageBreak(50);
    doc.drawRect(marginX + 5, currentY - 16, contentWidth - 10, 16, 0.94, 0.96, 0.98);
    doc.drawText('2. EVALUATED SYLLABUS & CURRICULUM ROADMAP', marginX + 12, currentY - 12, 'F2', 8.5, 0.08, 0.22, 0.38);
    currentY -= 22;

    for (const tier of role.syllabus) {
      checkPageBreak(35);
      doc.drawText(`${tier.tier}: ${tier.title} (${tier.durationWeeks} Weeks)`, marginX + 8, currentY, 'F2', 8.5, 0.1, 0.3, 0.5);
      currentY -= 12;

      for (const comp of tier.competencies) {
        checkPageBreak(25);
        doc.drawText(`- ${comp.topic} (Weight: ${comp.weightPercentage}%, Benchmark: ${comp.benchmarkAccuracy}%)`, marginX + 14, currentY, 'F2', 8, 0.15, 0.2, 0.3);
        currentY -= 11;
        for (const inv of comp.coreInvariants) {
          checkPageBreak(12);
          doc.drawText(`  * ${inv}`, marginX + 22, currentY, 'F1', 7.5, 0.25, 0.25, 0.25);
          currentY -= 10;
        }
      }

      if (tier.handsOnProjects && tier.handsOnProjects.length > 0) {
        for (const proj of tier.handsOnProjects) {
          checkPageBreak(25);
          doc.drawText(`Capstone Project: ${proj.title}`, marginX + 14, currentY, 'F2', 8, 0.12, 0.38, 0.2);
          currentY -= 11;
          const specWrapped = wrapText(`Spec: ${proj.spec} | Deliverables: ${proj.deliverables.join(', ')}`, 80);
          for (const sw of specWrapped) {
            checkPageBreak(11);
            doc.drawText(sw, marginX + 22, currentY, 'F1', 7.5, 0.25, 0.25, 0.25);
            currentY -= 10;
          }
        }
      }
      currentY -= 4;
    }
    currentY -= 6;

    // --- 3. Technical Interview Counter-Probes & Screening Questions ---
    checkPageBreak(50);
    doc.drawRect(marginX + 5, currentY - 16, contentWidth - 10, 16, 0.94, 0.96, 0.98);
    doc.drawText('3. TECHNICAL INTERVIEW QUESTIONS & MODEL EVALUATIONS', marginX + 12, currentY - 12, 'F2', 8.5, 0.08, 0.22, 0.38);
    currentY -= 22;

    for (let qIdx = 0; qIdx < role.questions.length; qIdx++) {
      const q = role.questions[qIdx];
      checkPageBreak(40);
      doc.drawText(`Q${qIdx + 1} [${q.difficulty}] ${q.title} (${q.category})`, marginX + 8, currentY, 'F2', 8, 0.12, 0.32, 0.2);
      currentY -= 12;

      // Model answer brief
      const ansLines = wrapText(`Model Solution: ${q.modelAnswer}`, 82);
      for (const al of ansLines) {
        checkPageBreak(12);
        doc.drawText(al, marginX + 14, currentY, 'F1', 7.5, 0.15, 0.15, 0.15);
        currentY -= 11;
      }

      // Counter Questions
      if (q.counterQuestions && q.counterQuestions.length > 0) {
        checkPageBreak(16);
        doc.drawText('Counter-Probes:', marginX + 14, currentY, 'F2', 7.5, 0.4, 0.2, 0.1);
        currentY -= 11;
        for (const cq of q.counterQuestions) {
          checkPageBreak(12);
          doc.drawText(`? ${cq}`, marginX + 20, currentY, 'F3', 7.5, 0.3, 0.2, 0.2);
          currentY -= 10;
        }
      }

      // Rejection Pitfalls
      if (q.criticalPitfalls && q.criticalPitfalls.length > 0) {
        checkPageBreak(16);
        doc.drawText('Rejection Traps:', marginX + 14, currentY, 'F2', 7.5, 0.6, 0.1, 0.1);
        currentY -= 11;
        for (const pf of q.criticalPitfalls) {
          checkPageBreak(12);
          doc.drawText(`! ${pf}`, marginX + 20, currentY, 'F1', 7.5, 0.45, 0.1, 0.1);
          currentY -= 10;
        }
      }
      currentY -= 6;
    }
    currentY -= 4;

    // --- 4. Architectural Documentation & Recruiter Traps ---
    checkPageBreak(50);
    doc.drawRect(marginX + 5, currentY - 16, contentWidth - 10, 16, 0.94, 0.96, 0.98);
    doc.drawText('4. PRODUCTION INVARIANTS & RECRUITER ANTI-PATTERNS', marginX + 12, currentY - 12, 'F2', 8.5, 0.08, 0.22, 0.38);
    currentY -= 22;

    for (const t of role.interviewTraps) {
      checkPageBreak(30);
      doc.drawText(`[Trap Alert] ${t.title}`, marginX + 8, currentY, 'F2', 8, 0.7, 0.1, 0.1);
      currentY -= 12;
      const antiLines = wrapText(`Anti-Pattern: ${t.antiPattern}`, 80);
      for (const ap of antiLines) {
        checkPageBreak(12);
        doc.drawText(ap, marginX + 14, currentY, 'F1', 7.5, 0.5, 0.1, 0.1);
        currentY -= 10;
      }
      const recLines = wrapText(`Senior Invariant: ${t.correctApproach}`, 80);
      for (const rl of recLines) {
        checkPageBreak(12);
        doc.drawText(rl, marginX + 14, currentY, 'F1', 7.5, 0.1, 0.35, 0.1);
        currentY -= 10;
      }
      currentY -= 4;
    }

    currentY -= 24;
  }

  renderFooter();
  return doc.build();
}

export const generateAllRolesMasterHandbookPdf = generateMasterCompendiumPdf;


// ==========================================
// MARKDOWN HANDBOOK EXPORTER
// ==========================================

export function generateRoleHandbookMarkdown(role: RoleHandbook): string {
  let md = `# ${role.name} -- Engineering Handbook & Complete Syllabus

**Discipline:** ${role.category}  
**Target Level:** ${role.targetLevel}  
**Estimated Study Time:** ${role.estimatedReadTime}  
**Policy Compliance:** 100% Technical Signal (Zero Vendor Trademarks)

---

## 1. Role Mission & Executive Profile

${role.information.overview}

### Typical Day-in-the-Life
${role.information.dayInTheLife.map((d) => `- ${d}`).join('\n')}

### Core Engineering Responsibilities
${role.information.coreResponsibilities.map((r) => `- ${r}`).join('\n')}

### Senior Engineering Career Progression
| Level | Title | Typical Experience | Core Architectural Focus |
| :--- | :--- | :--- | :--- |
${role.information.careerProgression.map((p) => `| **${p.level}** | ${p.title} | ${p.typicalExperience} | ${p.focus} |`).join('\n')}

### Market Compensation Benchmarks
| Region | Entry Level (L1) | Mid-Senior (L2/L3) | Staff/Principal (L4+) |
| :--- | :--- | :--- | :--- |
${role.information.compensationBands.map((c) => `| **${c.region}** | ${c.entryLevel} | ${c.midSenior} | ${c.staffPrincipal} |`).join('\n')}

---

## 2. Evaluated Syllabus & Curriculum Roadmap

`;

  for (const tier of role.syllabus) {
    md += `### ${tier.tier}: ${tier.title} (${tier.durationWeeks} Weeks)\n\n`;
    md += `${tier.description}\n\n`;
    md += `| Evaluated Topic | Exam Weight | Target Accuracy | Core Invariants |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const c of tier.competencies) {
      md += `| **${c.topic}** | ${c.weightPercentage}% | ${c.benchmarkAccuracy}% | ${c.coreInvariants.join('; ')} |\n`;
    }
    md += '\n';

    if (tier.handsOnProjects && tier.handsOnProjects.length > 0) {
      md += '**Hands-On Capstone Projects:**\n';
      for (const p of tier.handsOnProjects) {
        md += `- **${p.title}**: ${p.spec}\n`;
        md += `  - Deliverables: ${p.deliverables.join(', ')}\n`;
      }
      md += '\n';
    }
  }

  md += `---

## 3. Technical Screening Questions & Counter-Probes

`;

  for (let i = 0; i < role.questions.length; i++) {
    const q = role.questions[i];
    md += `### Question ${i + 1}: ${q.title} [${q.difficulty}] -- ${q.category}\n\n`;
    md += `**Question:** ${q.questionText}\n\n`;
    md += `**Model Architectural Answer:**\n${q.modelAnswer}\n\n`;

    if (q.counterQuestions.length > 0) {
      md += `**Interviewer Counter-Questions:**\n${q.counterQuestions.map((cq) => `- ${cq}`).join('\n')}\n\n`;
    }
    if (q.criticalPitfalls.length > 0) {
      md += `**Candidate Rejection Pitfalls:**\n${q.criticalPitfalls.map((pf) => `- ${pf}`).join('\n')}\n\n`;
    }
  }

  md += `---

## 4. Recruiter Traps & Anti-Patterns

`;

  for (const trap of role.interviewTraps) {
    md += `### [DANGER: ${trap.dangerLevel}] ${trap.title}\n\n`;
    md += `- **Candidate Anti-Pattern:** ${trap.antiPattern}\n`;
    md += `- **Correct Engineering Approach:** ${trap.correctApproach}\n`;
    md += `- **Screening Context:** ${trap.interviewContext}\n\n`;
  }

  md += `---

## 5. Architectural Documentation & Production Invariants

`;

  for (const docSec of role.documentation) {
    md += `### ${docSec.sectionTitle}\n\n${docSec.overview}\n\n`;
    for (const inv of docSec.architecturalInvariants) {
      md += `#### Invariant: ${inv.title}\n`;
      md += `- **Formula / Invariant:** \`${inv.formulaOrInvariant}\`\n`;
      md += `- **Explanation:** ${inv.explanation}\n`;
      md += `- **Trade-offs:** ${inv.tradeoffs}\n\n`;
    }

    for (const code of docSec.codeExamples) {
      md += `#### ${code.title}\n` +
        '```' + code.language + '\n' +
        code.code + '\n' +
        '```\n\n' +
        `*${code.explanation}*\n\n`;
    }
  }

  return md;
}

// ==========================================
// PERSONALIZED STUDY PLAN PDF GENERATION
// ==========================================

export function generatePersonalizedStudyPlanPdf(
  role: RoleHandbook,
  masteredTopics: string[],
): Uint8Array {
  const doc = new SimplePdfDocument();
  const pageWidth = 595.28;
  const marginX = 45;
  const contentWidth = pageWidth - marginX * 2;
  let currentY = 790;
  let pageNum = 1;

  const allCompetencies = role.syllabus.flatMap((s) => s.competencies);
  const totalCompetencies = allCompetencies.length;
  const completedCount = allCompetencies.filter((c) =>
    masteredTopics.includes(c.topic),
  ).length;
  const completionRate =
    totalCompetencies > 0
      ? Math.round((completedCount / totalCompetencies) * 100)
      : 0;
  const pendingCount = totalCompetencies - completedCount;
  const totalWeeks = role.syllabus.reduce((acc, s) => acc + s.durationWeeks, 0);
  const estimatedWeeksRemaining =
    totalCompetencies > 0
      ? Math.max(1, Math.round((pendingCount / totalCompetencies) * totalWeeks))
      : 0;

  function renderHeader(isFirstPage = false) {
    if (isFirstPage) {
      // Header Banner
      doc.drawRect(marginX, currentY - 65, contentWidth, 65, 0.071, 0.227, 0.369);
      doc.drawText('STUDENTSPREP PERSONALIZED STUDY PLAN', marginX + 15, currentY - 22, 'F2', 9.5, 0.75, 0.85, 0.95);
      doc.drawText(`${role.name.toUpperCase()} SYLLABUS CHECKLIST`, marginX + 15, currentY - 45, 'F2', 15, 1.0, 1.0, 1.0);
      currentY -= 80;

      // HUD Progress Card
      doc.drawRect(marginX, currentY - 38, contentWidth, 38, 0.92, 0.96, 0.94); // soft green tint
      doc.drawText(
        `CANDIDATE MASTERY STATUS: ${completedCount} of ${totalCompetencies} Competencies Mastered (${completionRate}%)`,
        marginX + 15,
        currentY - 16,
        'F2',
        10,
        0.05,
        0.35,
        0.15
      );
      doc.drawText(
        `Discipline: ${role.category}   |   Remaining Syllabus: ${pendingCount} Topics (~${estimatedWeeksRemaining} Weeks)   |   Target Level: ${role.targetLevel}`,
        marginX + 15,
        currentY - 30,
        'F1',
        8,
        0.2,
        0.3,
        0.25
      );
      currentY -= 55;
    } else {
      doc.drawRect(marginX, 805, contentWidth, 18, 0.95, 0.96, 0.98);
      doc.drawText(`Study Plan & Syllabus Audit: ${role.name}`, marginX + 10, 810, 'F2', 8, 0.2, 0.3, 0.4);
      doc.drawText(`Progress: ${completionRate}% Mastered`, pageWidth - marginX - 110, 810, 'F2', 8, 0.05, 0.4, 0.15);
      doc.drawLine(marginX, 804, pageWidth - marginX, 804, 0.8, 0.85, 0.9, 0.5);
      currentY = 785;
    }
  }

  function renderFooter() {
    doc.drawLine(marginX, 45, pageWidth - marginX, 45, 0.8, 0.85, 0.9, 0.5);
    doc.drawText('STUDENTSPREP CANDIDATE ROADMAP & PERFORMANCE AUDIT', marginX, 32, 'F1', 7.5, 0.5, 0.5, 0.5);
    doc.drawText(`Page ${pageNum}`, pageWidth - marginX - 45, 32, 'F2', 8, 0.3, 0.4, 0.5);
  }

  function checkPageBreak(requiredHeight: number) {
    if (currentY - requiredHeight < 55) {
      renderFooter();
      doc.newPage();
      pageNum++;
      renderHeader(false);
    }
  }

  renderHeader(true);

  // Strategic Gap Analysis Box
  checkPageBreak(90);
  doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.12, 0.32, 0.52);
  doc.drawText('1. STRATEGIC GAP ANALYSIS & HIGH-YIELD TARGETS', marginX + 10, currentY - 13, 'F2', 10, 1, 1, 1);
  currentY -= 30;

  const uncompletedTopics = allCompetencies
    .filter((c) => !masteredTopics.includes(c.topic))
    .sort((a, b) => b.weightPercentage - a.weightPercentage);

  if (uncompletedTopics.length === 0) {
    doc.drawRect(marginX + 5, currentY - 22, contentWidth - 10, 22, 0.9, 0.97, 0.92);
    doc.drawText('ALL SYLLABUS COMPETENCIES MASTERED! Candidate is fully prepared for benchmark screening.', marginX + 15, currentY - 15, 'F2', 9, 0.05, 0.45, 0.15);
    currentY -= 35;
  } else {
    doc.drawText('Recommended High-Yield Study Targets (Sorted by Exam Weight):', marginX + 5, currentY, 'F2', 9.5, 0.1, 0.2, 0.35);
    currentY -= 15;

    for (let i = 0; i < Math.min(3, uncompletedTopics.length); i++) {
      const target = uncompletedTopics[i];
      checkPageBreak(28);
      doc.drawText(`Priority #${i + 1}: ${target.topic}`, marginX + 12, currentY, 'F2', 9, 0.7, 0.1, 0.1);
      doc.drawText(`Weight: ${target.weightPercentage}% | Benchmark Target: ${target.benchmarkAccuracy}%`, marginX + 330, currentY, 'F1', 8, 0.3, 0.3, 0.3);
      currentY -= 12;
      const invSummary = wrapText(`Key Invariant: ${target.coreInvariants[0] || 'Domain core logic'}`, 80);
      doc.drawText(invSummary[0] || '', marginX + 20, currentY, 'F3', 8, 0.35, 0.35, 0.35);
      currentY -= 14;
    }
    currentY -= 8;
  }

  // Stamped Syllabus Progression
  checkPageBreak(90);
  doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.12, 0.32, 0.52);
  doc.drawText('2. EVALUATED SYLLABUS CHECKLIST & ACCURACY BENCHMARKS', marginX + 10, currentY - 13, 'F2', 10, 1, 1, 1);
  currentY -= 30;

  for (const tier of role.syllabus) {
    checkPageBreak(50);
    doc.drawRect(marginX + 5, currentY - 15, contentWidth - 10, 15, 0.93, 0.95, 0.98);
    doc.drawText(`${tier.tier}: ${tier.title} (${tier.durationWeeks} Weeks)`, marginX + 10, currentY - 11, 'F2', 8.5, 0.1, 0.25, 0.45);
    currentY -= 22;

    for (const comp of tier.competencies) {
      const isMastered = masteredTopics.includes(comp.topic);
      checkPageBreak(30);

      if (isMastered) {
        doc.drawRect(marginX + 10, currentY - 13, 75, 13, 0.85, 0.95, 0.88);
        doc.drawText('[COMPLETED]', marginX + 14, currentY - 10, 'F2', 7.5, 0.05, 0.45, 0.15);
      } else {
        doc.drawRect(marginX + 10, currentY - 13, 65, 13, 0.96, 0.92, 0.92);
        doc.drawText('[PENDING]', marginX + 14, currentY - 10, 'F2', 7.5, 0.65, 0.15, 0.15);
      }

      doc.drawText(comp.topic, marginX + 90, currentY - 10, 'F2', 8.5, 0.15, 0.15, 0.15);
      doc.drawText(`Weight: ${comp.weightPercentage}% | Cutoff: ${comp.benchmarkAccuracy}%`, marginX + 340, currentY - 10, 'F1', 7.5, 0.3, 0.3, 0.3);
      currentY -= 16;

      for (const inv of comp.coreInvariants) {
        checkPageBreak(12);
        doc.drawText(`* ${inv}`, marginX + 25, currentY, 'F1', 7.5, 0.35, 0.35, 0.35);
        currentY -= 11;
      }
      currentY -= 4;
    }
    currentY -= 6;
  }

  // Section 3: Next Actions & Verification Runbook
  checkPageBreak(90);
  doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.12, 0.32, 0.52);
  doc.drawText('3. RECOMMENDED CANDIDATE ACTION ITEMS', marginX + 10, currentY - 13, 'F2', 10, 1, 1, 1);
  currentY -= 30;

  const actionItems = [
    `Complete timed role benchmark mock test (${role.name} Assessment) to validate test readiness.`,
    'Launch Socratic voice interview simulation to practice answering follow-up counter-probes aloud.',
    'Review candidate rejection pitfalls and recruiter anti-patterns to prevent immediate disqualification.',
    'Read deep-dive system architecture documentation to cement mathematical system invariants.'
  ];

  for (const item of actionItems) {
    checkPageBreak(18);
    doc.drawText('->', marginX + 10, currentY, 'F2', 8.5, 0.1, 0.3, 0.6);
    doc.drawText(item, marginX + 25, currentY, 'F1', 8.5, 0.2, 0.2, 0.2);
    currentY -= 15;
  }

  renderFooter();
  return doc.build();
}

export function downloadPersonalizedStudyPlan(
  role: RoleHandbook,
  masteredTopics: string[],
): void {
  if (typeof window === 'undefined') return;
  const pdfBytes = generatePersonalizedStudyPlanPdf(role, masteredTopics);
  downloadPdfFile(pdfBytes, `${role.slug}-personalized-study-plan.pdf`);
}

// Client-side download triggers
export function downloadPdfFile(pdfBytes: Uint8Array, filename: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadMarkdownFile(content: string, filename: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
