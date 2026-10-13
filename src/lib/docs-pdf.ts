/**
 * Documentation & Track Handbook Vector PDF Generation Engine
 * Pure TypeScript, standard-compliant vector PDF 1.4 builder.
 * Zero third-party dependencies, 100% offline client-side and server-side execution.
 * Strictly adheres to docs/CONTENT_POLICY.md: 100% technical signal, zero vendor trademarks.
 */

import type { DocTrack } from './docs-catalog';

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
// TRACK HANDBOOK PDF GENERATION
// ==========================================

export function generateTrackHandbookPdf(track: DocTrack): Uint8Array {
  const doc = new SimplePdfDocument();
  const pageWidth = 595.28;
  const marginX = 45;
  const contentWidth = pageWidth - marginX * 2;
  let currentY = 790;
  let pageNum = 1;

  function renderHeader(isFirstPage = false) {
    if (isFirstPage) {
      // Cover Header
      doc.drawRect(marginX, currentY - 70, contentWidth, 70, 0.071, 0.227, 0.369);
      doc.drawText('STUDENTSPREP ENGINEERING DOCUMENTATION HANDBOOK', marginX + 15, currentY - 22, 'F2', 9.5, 0.75, 0.85, 0.95);
      doc.drawText(track.title.toUpperCase(), marginX + 15, currentY - 45, 'F2', 16, 1.0, 1.0, 1.0);
      doc.drawText(
        `${track.category === 'PROGRAMMING_LANGUAGE' ? 'Language Specialization' : 'Computer Science Specialization'}  |  ${track.badge}  |  ${track.topicsCount} Topics across ${track.modulesCount} Modules`,
        marginX + 15,
        currentY - 60,
        'F3',
        8.5,
        0.8,
        0.88,
        0.95
      );
      currentY -= 85;
    } else {
      // Running Page Header
      doc.drawRect(marginX, 805, contentWidth, 18, 0.95, 0.96, 0.98);
      doc.drawText(`StudentsPrep Technical Handbook: ${track.title}`, marginX + 10, 810, 'F2', 8, 0.2, 0.3, 0.4);
      doc.drawText(track.badge, pageWidth - marginX - 90, 810, 'F1', 8, 0.4, 0.5, 0.6);
      doc.drawLine(marginX, 804, pageWidth - marginX, 804, 0.8, 0.85, 0.9, 0.5);
      currentY = 785;
    }
  }

  function renderFooter() {
    doc.drawLine(marginX, 45, pageWidth - marginX, 45, 0.8, 0.85, 0.9, 0.5);
    doc.drawText('CONFIDENTIAL & PROPRIETARY -- STUDENTSPREP ENGINEERING PLATFORM', marginX, 32, 'F1', 7.5, 0.5, 0.5, 0.5);
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

  // Track Tagline & Overview
  checkPageBreak(70);
  doc.drawRect(marginX, currentY - 24, contentWidth, 24, 0.92, 0.95, 0.98);
  doc.drawText(`Focus: ${track.tagline}`, marginX + 10, currentY - 16, 'F2', 9.5, 0.1, 0.25, 0.45);
  currentY -= 36;

  const overviewLines = wrapText(track.description, 85);
  for (const line of overviewLines) {
    checkPageBreak(14);
    doc.drawText(line, marginX + 5, currentY, 'F1', 9.5, 0.2, 0.2, 0.2);
    currentY -= 13;
  }
  currentY -= 10;

  // Table of Contents Section
  checkPageBreak(90);
  doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.12, 0.32, 0.52);
  doc.drawText('CURRICULUM MODULES & TOPIC ROADMAP', marginX + 10, currentY - 13, 'F2', 10, 1, 1, 1);
  currentY -= 28;

  for (let mIdx = 0; mIdx < track.modules.length; mIdx++) {
    const mod = track.modules[mIdx];
    checkPageBreak(25);
    doc.drawText(`Module ${mIdx + 1}: ${mod.title}`, marginX + 5, currentY, 'F2', 9, 0.1, 0.3, 0.5);
    currentY -= 14;

    for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
      const topic = mod.topics[tIdx];
      checkPageBreak(14);
      doc.drawText(`* ${topic.title} [${topic.difficulty}]`, marginX + 15, currentY, 'F1', 8.5, 0.25, 0.25, 0.25);
      doc.drawText(`~${topic.readTimeMinutes} min`, pageWidth - marginX - 55, currentY, 'F3', 8, 0.45, 0.45, 0.45);
      currentY -= 12;
    }
    currentY -= 6;
  }
  currentY -= 10;

  // Render Detailed Chapters
  for (let mIdx = 0; mIdx < track.modules.length; mIdx++) {
    const mod = track.modules[mIdx];

    // Module Divider Banner
    checkPageBreak(50);
    doc.drawRect(marginX, currentY - 22, contentWidth, 22, 0.071, 0.227, 0.369);
    doc.drawText(`MODULE ${mIdx + 1}: ${mod.title.toUpperCase()}`, marginX + 10, currentY - 15, 'F2', 10.5, 1, 1, 1);
    currentY -= 32;

    const modDesc = wrapText(mod.description, 85);
    for (const dLine of modDesc) {
      checkPageBreak(13);
      doc.drawText(dLine, marginX + 5, currentY, 'F3', 8.5, 0.35, 0.35, 0.35);
      currentY -= 12;
    }
    currentY -= 10;

    for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
      const topic = mod.topics[tIdx];

      // Topic Card Header
      checkPageBreak(45);
      doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.94, 0.96, 0.98);
      doc.drawText(
        `Topic ${mIdx + 1}.${tIdx + 1}: ${topic.title}`,
        marginX + 8,
        currentY - 13,
        'F2',
        9.5,
        0.1,
        0.2,
        0.35
      );
      doc.drawText(
        `[${topic.difficulty}]  ~${topic.readTimeMinutes} min`,
        pageWidth - marginX - 105,
        currentY - 13,
        'F2',
        8,
        0.4,
        0.2,
        0.1
      );
      currentY -= 26;

      // Short Description & Overview
      const topicOverview = wrapText(topic.overview, 84);
      for (const line of topicOverview) {
        checkPageBreak(13);
        doc.drawText(line, marginX + 5, currentY, 'F1', 9, 0.18, 0.18, 0.18);
        currentY -= 12;
      }
      currentY -= 6;

      // Core Invariants Box
      if (topic.invariants && topic.invariants.length > 0) {
        checkPageBreak(35);
        doc.drawText('Architectural & Theoretical Invariants:', marginX + 5, currentY, 'F2', 8.5, 0.05, 0.35, 0.15);
        currentY -= 14;

        for (const inv of topic.invariants) {
          const invLines = wrapText(inv, 80);
          checkPageBreak(invLines.length * 12 + 4);
          doc.drawText('*', marginX + 10, currentY, 'F2', 8.5, 0.05, 0.45, 0.15);
          for (let i = 0; i < invLines.length; i++) {
            doc.drawText(invLines[i], marginX + 20, currentY, 'F1', 8.5, 0.15, 0.25, 0.15);
            currentY -= 11;
          }
          currentY -= 2;
        }
        currentY -= 6;
      }

      // Theory Sections & Code Snippet
      if (topic.theorySections && topic.theorySections.length > 0) {
        for (const sec of topic.theorySections) {
          checkPageBreak(30);
          doc.drawText(sec.heading, marginX + 5, currentY, 'F2', 9, 0.15, 0.25, 0.45);
          currentY -= 13;

          const secContent = wrapText(sec.content, 84);
          for (const sLine of secContent) {
            checkPageBreak(12);
            doc.drawText(sLine, marginX + 8, currentY, 'F1', 8.5, 0.22, 0.22, 0.22);
            currentY -= 11;
          }
          currentY -= 4;

          if (sec.codeSnippet) {
            checkPageBreak(40);
            doc.drawText(`Production Code Implementation (${sec.codeSnippet.language}):`, marginX + 8, currentY, 'F2', 8, 0.3, 0.3, 0.3);
            currentY -= 12;

            const codeLines = sec.codeSnippet.code.split('\n').slice(0, 10);
            for (const cLine of codeLines) {
              checkPageBreak(12);
              doc.drawRect(marginX + 8, currentY - 10, contentWidth - 16, 11, 0.96, 0.96, 0.96);
              doc.drawText(cLine.slice(0, 75), marginX + 12, currentY - 2, 'F4', 7.5, 0.1, 0.1, 0.1);
              currentY -= 11;
            }
            currentY -= 6;
          }
        }
      }

      // Interviewer Gotchas
      if (topic.interviewerGotchas && topic.interviewerGotchas.length > 0) {
        checkPageBreak(35);
        doc.drawText('Senior Technical Interview Traps & Countermeasures:', marginX + 5, currentY, 'F2', 8.5, 0.65, 0.15, 0.15);
        currentY -= 13;

        for (const gotcha of topic.interviewerGotchas) {
          const trapLines = wrapText(`Trap: ${gotcha.trap}`, 82);
          const counterLines = wrapText(`Countermeasure: ${gotcha.counterMeasure}`, 82);
          checkPageBreak((trapLines.length + counterLines.length) * 11 + 6);

          for (const tLine of trapLines) {
            doc.drawText(tLine, marginX + 12, currentY, 'F2', 8, 0.55, 0.1, 0.1);
            currentY -= 11;
          }
          for (const cLine of counterLines) {
            doc.drawText(cLine, marginX + 12, currentY, 'F1', 8, 0.2, 0.2, 0.2);
            currentY -= 11;
          }
          currentY -= 4;
        }
        currentY -= 6;
      }

      // Practice Socratic MCQs
      if (topic.practiceMcqs && topic.practiceMcqs.length > 0) {
        checkPageBreak(40);
        doc.drawText('Evaluated Practice Questions & Socratic Verification:', marginX + 5, currentY, 'F2', 8.5, 0.12, 0.32, 0.52);
        currentY -= 13;

        for (const mcq of topic.practiceMcqs) {
          const qLines = wrapText(`Q: ${mcq.question}`, 82);
          checkPageBreak(qLines.length * 11 + 45);

          for (const qLine of qLines) {
            doc.drawText(qLine, marginX + 10, currentY, 'F2', 8, 0.1, 0.2, 0.35);
            currentY -= 11;
          }

          const optionLabels = ['A', 'B', 'C', 'D'];
          for (let optIdx = 0; optIdx < mcq.options.length; optIdx++) {
            const isCorrect = optIdx === mcq.correctIndex;
            const optLines = wrapText(`(${optionLabels[optIdx]}) ${mcq.options[optIdx]}`, 80);
            for (const oLine of optLines) {
              checkPageBreak(11);
              if (isCorrect) {
                doc.drawText(oLine, marginX + 18, currentY, 'F2', 8, 0.05, 0.45, 0.15);
              } else {
                doc.drawText(oLine, marginX + 18, currentY, 'F1', 8, 0.3, 0.3, 0.3);
              }
              currentY -= 10;
            }
          }

          const expLines = wrapText(`Explanation: ${mcq.explanation}`, 80);
          checkPageBreak(expLines.length * 10 + 6);
          for (const eLine of expLines) {
            doc.drawText(eLine, marginX + 18, currentY, 'F3', 7.5, 0.35, 0.35, 0.35);
            currentY -= 10;
          }
          currentY -= 6;
        }
      }

      currentY -= 10;
      doc.drawLine(marginX, currentY, pageWidth - marginX, currentY, 0.88, 0.9, 0.92, 0.5);
      currentY -= 12;
    }
  }

  renderFooter();
  return doc.build();
}

// ==========================================
// MASTER ENGINEERING COMPENDIUM (ALL 13 TRACKS)
// ==========================================

export function generateCompleteEngineeringDocsPdf(tracks: DocTrack[]): Uint8Array {
  const doc = new SimplePdfDocument();
  const pageWidth = 595.28;
  const marginX = 45;
  const contentWidth = pageWidth - marginX * 2;
  let currentY = 790;
  let pageNum = 1;

  function renderHeader(isFirstPage = false) {
    if (isFirstPage) {
      doc.drawRect(marginX, currentY - 80, contentWidth, 80, 0.071, 0.227, 0.369);
      doc.drawText('STUDENTSPREP MASTER DOCUMENTATION COMPENDIUM', marginX + 15, currentY - 24, 'F2', 10, 0.75, 0.85, 0.95);
      doc.drawText('13 COMPUTER SCIENCE & SOFTWARE ENGINEERING TRACKS', marginX + 15, currentY - 50, 'F2', 15, 1, 1, 1);
      doc.drawText('80 In-Depth Topics  |  96 Uniform Practice MCQs  |  Production Invariants', marginX + 15, currentY - 68, 'F3', 8.5, 0.85, 0.9, 0.95);
      currentY -= 95;
    } else {
      doc.drawRect(marginX, 805, contentWidth, 18, 0.95, 0.96, 0.98);
      doc.drawText('StudentsPrep Master Engineering Compendium (13 Tracks)', marginX + 10, 810, 'F2', 8, 0.2, 0.3, 0.4);
      doc.drawText('Comprehensive Edition', pageWidth - marginX - 110, 810, 'F1', 8, 0.4, 0.5, 0.6);
      doc.drawLine(marginX, 804, pageWidth - marginX, 804, 0.8, 0.85, 0.9, 0.5);
      currentY = 785;
    }
  }

  function renderFooter() {
    doc.drawLine(marginX, 45, pageWidth - marginX, 45, 0.8, 0.85, 0.9, 0.5);
    doc.drawText('STUDENTSPREP COMPREHENSIVE CURRICULUM -- CONFIDENTIAL & PROPRIETARY', marginX, 32, 'F1', 7.5, 0.5, 0.5, 0.5);
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
  checkPageBreak(80);
  doc.drawRect(marginX, currentY - 18, contentWidth, 18, 0.12, 0.32, 0.52);
  doc.drawText('MASTER TABLE OF CONTENTS: 13 SPECIALIZATION TRACKS', marginX + 10, currentY - 13, 'F2', 10, 1, 1, 1);
  currentY -= 28;

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    checkPageBreak(18);
    doc.drawText(`${i + 1}. ${t.title} (${t.badge})`, marginX + 10, currentY, 'F2', 9, 0.1, 0.25, 0.45);
    doc.drawText(`${t.topicsCount} Topics`, pageWidth - marginX - 70, currentY, 'F1', 8.5, 0.4, 0.4, 0.4);
    currentY -= 14;
  }
  currentY -= 15;

  // Track Sections
  for (let tIdx = 0; tIdx < tracks.length; tIdx++) {
    const track = tracks[tIdx];

    // Track Title Page Break
    checkPageBreak(90);
    doc.drawRect(marginX, currentY - 26, contentWidth, 26, 0.071, 0.227, 0.369);
    doc.drawText(`PART ${tIdx + 1}: ${track.title.toUpperCase()}`, marginX + 10, currentY - 17, 'F2', 11, 1, 1, 1);
    currentY -= 36;

    const tDesc = wrapText(track.description, 85);
    for (const line of tDesc) {
      checkPageBreak(13);
      doc.drawText(line, marginX + 5, currentY, 'F1', 9, 0.2, 0.2, 0.2);
      currentY -= 12;
    }
    currentY -= 8;

    for (const mod of track.modules) {
      checkPageBreak(30);
      doc.drawText(`Module: ${mod.title}`, marginX + 8, currentY, 'F2', 9.5, 0.12, 0.32, 0.52);
      currentY -= 15;

      for (const topic of mod.topics) {
        checkPageBreak(40);
        doc.drawText(`* ${topic.title} [${topic.difficulty}]`, marginX + 15, currentY, 'F2', 9, 0.15, 0.15, 0.15);
        currentY -= 12;

        const pOverview = wrapText(topic.overview, 80).slice(0, 3);
        for (const oLine of pOverview) {
          checkPageBreak(12);
          doc.drawText(oLine, marginX + 22, currentY, 'F1', 8, 0.3, 0.3, 0.3);
          currentY -= 11;
        }

        if (topic.invariants && topic.invariants[0]) {
          checkPageBreak(12);
          doc.drawText(`Key Invariant: ${topic.invariants[0].slice(0, 75)}`, marginX + 22, currentY, 'F3', 7.5, 0.05, 0.4, 0.15);
          currentY -= 11;
        }
        currentY -= 4;
      }
      currentY -= 6;
    }
    currentY -= 10;
  }

  renderFooter();
  return doc.build();
}

// Client-side download trigger
export function downloadPdfFile(pdfBytes: Uint8Array, fileName: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
