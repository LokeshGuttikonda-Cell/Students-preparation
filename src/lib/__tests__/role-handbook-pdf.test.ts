import { describe, it, expect } from 'vitest';
import { ROLE_HANDBOOKS } from '../role-handbooks-data';
import {
  generateRoleHandbookPdf,
  generateMasterCompendiumPdf,
  generatePersonalizedStudyPlanPdf,
  generateRoleHandbookMarkdown,
} from '../role-handbook-pdf';

describe('PDF Generation & Document Export Engine', () => {
  it('should generate a valid PDF-1.4 binary stream for an individual role handbook', () => {
    const role = ROLE_HANDBOOKS[0]; // Cloud Solutions Architect
    const pdfBytes = generateRoleHandbookPdf(role);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(10000);

    const pdfString = Buffer.from(pdfBytes).toString('latin1');

    // PDF 1.4 Specification compliance
    expect(pdfString.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfString).toContain('/Type /Catalog');
    expect(pdfString).toContain('/Type /Pages');
    expect(pdfString).toContain('/Type /Page');
    expect(pdfString).toContain('/Type /Font');
    expect(pdfString).toContain('/BaseFont /Helvetica');
    expect(pdfString).toContain('xref');
    expect(pdfString).toContain('trailer');
    expect(pdfString).toContain('/Root 1 0 R');
    expect(pdfString).toContain('startxref');
    expect(pdfString.trim().endsWith('%%EOF')).toBe(true);
  });

  it('should generate valid PDFs for all 13 IT roles without runtime errors', () => {
    for (const role of ROLE_HANDBOOKS) {
      const pdfBytes = generateRoleHandbookPdf(role);
      expect(pdfBytes.length).toBeGreaterThan(5000);

      const pdfString = Buffer.from(pdfBytes).toString('latin1');
      expect(pdfString).toContain('%PDF-1.4');
      expect(pdfString.trim().endsWith('%%EOF')).toBe(true);
    }
  });

  it('should compile the Master Engineering Compendium containing all 13 roles', () => {
    const compendiumBytes = generateMasterCompendiumPdf(ROLE_HANDBOOKS);

    expect(compendiumBytes).toBeInstanceOf(Uint8Array);
    expect(compendiumBytes.length).toBeGreaterThan(35000);

    const pdfString = Buffer.from(compendiumBytes).toString('latin1');
    expect(pdfString).toContain('%PDF-1.4');
    expect(pdfString).toContain('STUDENTSPREP MASTER COMPENDIUM');
    expect(pdfString).toContain('13 IT ROLES ENGINEERING HANDBOOK');
    expect(pdfString).toContain('TABLE OF CONTENTS');
    expect(pdfString).toContain('1. ROLE MISSION & EXECUTIVE PROFILE');
    expect(pdfString).toContain('2. EVALUATED SYLLABUS & CURRICULUM ROADMAP');
    expect(pdfString).toContain('3. TECHNICAL INTERVIEW QUESTIONS & MODEL EVALUATIONS');
    expect(pdfString).toContain('4. PRODUCTION INVARIANTS & RECRUITER ANTI-PATTERNS');
    expect(pdfString.trim().endsWith('%%EOF')).toBe(true);
  });

  it('should generate a personalized study plan PDF with status stamps and gap analysis', () => {
    const role = ROLE_HANDBOOKS[0];
    const allTopics = role.syllabus.flatMap((s) => s.competencies.map((c) => c.topic));
    const masteredTopics = [allTopics[0], allTopics[1]];

    const pdfBytes = generatePersonalizedStudyPlanPdf(role, masteredTopics);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(5000);

    const pdfString = Buffer.from(pdfBytes).toString('latin1');
    expect(pdfString).toContain('%PDF-1.4');
    expect(pdfString).toContain('STUDENTSPREP PERSONALIZED STUDY PLAN');
    expect(pdfString).toContain('CANDIDATE MASTERY STATUS:');
    expect(pdfString).toContain('[COMPLETED]');
    expect(pdfString).toContain('[PENDING]');
    expect(pdfString).toContain('1. STRATEGIC GAP ANALYSIS & HIGH-YIELD TARGETS');
    expect(pdfString.trim().endsWith('%%EOF')).toBe(true);
  });

  it('should render all-mastered celebration in study plan when 100% competencies achieved', () => {
    const role = ROLE_HANDBOOKS[0];
    const allTopics = role.syllabus.flatMap((s) => s.competencies.map((c) => c.topic));

    const pdfBytes = generatePersonalizedStudyPlanPdf(role, allTopics);
    const pdfString = Buffer.from(pdfBytes).toString('latin1');
    expect(pdfString).toContain('%PDF-1.4');
    expect(pdfString).toContain('ALL SYLLABUS COMPETENCIES MASTERED!');
    expect(pdfString.trim().endsWith('%%EOF')).toBe(true);
  });

  it('should generate well-formed Markdown with all 5 core sections', () => {
    const role = ROLE_HANDBOOKS[3]; // Java Enterprise Backend Developer
    const md = generateRoleHandbookMarkdown(role);

    expect(typeof md).toBe('string');
    expect(md).toContain(`# ${role.name}`);
    expect(md).toContain('## 1. Role Mission & Executive Profile');
    expect(md).toContain('## 2. Evaluated Syllabus & Curriculum Roadmap');
    expect(md).toContain('## 3. Technical Screening Questions & Counter-Probes');
    expect(md).toContain('## 4. Recruiter Traps & Anti-Patterns');
    expect(md).toContain('## 5. Architectural Documentation & Production Invariants');
    expect(md).toContain('```java');
  });
});

