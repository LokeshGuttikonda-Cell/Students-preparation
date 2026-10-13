import { describe, it, expect } from 'vitest';
import { DOC_TRACKS } from '../docs-catalog';
import {
  generateTrackHandbookPdf,
  generateCompleteEngineeringDocsPdf,
} from '../docs-pdf';

describe('Documentation Track Vector PDF Engine', () => {
  it('generates a valid PDF-1.4 binary stream for an individual track handbook', () => {
    const javaTrack = DOC_TRACKS.find((t) => t.slug === 'java')!;
    const pdfBytes = generateTrackHandbookPdf(javaTrack);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(15000);

    const pdfString = Buffer.from(pdfBytes).toString('latin1');

    // PDF 1.4 Specification compliance
    expect(pdfString.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfString).toContain('/Type /Catalog');
    expect(pdfString).toContain('/Type /Pages');
    expect(pdfString).toContain('/Type /Page');
    expect(pdfString).toContain('/Type /Font');
    expect(pdfString).toContain('/BaseFont /Helvetica');
    expect(pdfString).toContain('/BaseFont /Courier');
    expect(pdfString).toContain('xref');
    expect(pdfString).toContain('trailer');
    expect(pdfString).toContain('/Root 1 0 R');
    expect(pdfString).toContain('startxref');
    expect(pdfString.trim().endsWith('%%EOF')).toBe(true);
  });

  it('renders track title, invariants, and MCQs in generated track PDF', () => {
    const dsaTrack = DOC_TRACKS.find((t) => t.slug === 'dsa')!;
    const pdfBytes = generateTrackHandbookPdf(dsaTrack);
    const pdfString = Buffer.from(pdfBytes).toString('latin1');

    expect(pdfString).toContain('DATA STRUCTURES');
    expect(pdfString).toContain('CURRICULUM MODULES');
    expect(pdfString).toContain('Architectural & Theoretical Invariants');
    expect(pdfString).toContain('Evaluated Practice Questions');
  });

  it('generates valid PDFs for all 14 documentation tracks without runtime errors', () => {
    expect(DOC_TRACKS.length).toBe(14);

    for (const track of DOC_TRACKS) {
      const pdfBytes = generateTrackHandbookPdf(track);
      expect(pdfBytes.length).toBeGreaterThan(5000);

      const pdfString = Buffer.from(pdfBytes).toString('latin1');
      expect(pdfString.startsWith('%PDF-1.4')).toBe(true);
      expect(pdfString.trim().endsWith('%%EOF')).toBe(true);
    }
  });

  it('compiles the Master Engineering Documentation Compendium containing all 14 tracks', () => {
    const compendiumBytes = generateCompleteEngineeringDocsPdf(DOC_TRACKS);

    expect(compendiumBytes).toBeInstanceOf(Uint8Array);
    expect(compendiumBytes.length).toBeGreaterThan(30000);

    const pdfString = Buffer.from(compendiumBytes).toString('latin1');
    expect(pdfString.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfString).toContain('STUDENTSPREP MASTER DOCUMENTATION COMPENDIUM');
    expect(pdfString).toContain('13 COMPUTER SCIENCE & SOFTWARE ENGINEERING TRACKS');
    expect(pdfString).toContain('MASTER TABLE OF CONTENTS');
    expect(pdfString.trim().endsWith('%%EOF')).toBe(true);
  });
});
