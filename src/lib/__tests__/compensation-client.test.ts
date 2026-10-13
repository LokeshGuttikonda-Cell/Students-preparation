import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DEFAULT_BENCHMARK_PACKAGES,
  deconstructCompensation,
  calculateNewRegimeTax,
  calculateOldRegimeTax,
  compareOffers,
  generateNegotiationScripts,
  importFromPlacementDrives,
  getSavedCompensationState,
  saveCompensationState,
  generateCompensationMarkdown,
  exportCompensationReportPdf,
  type CompensationPackage,
} from '../compensation-client';

describe('compensation-client domain engine', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deconstructs headline CTC into accurate first-year cash, monthly gross, and statutory deductions', () => {
    const pkg: CompensationPackage = {
      id: 'test-pkg',
      companyName: 'Test Tech Consortium',
      roleTitle: 'Software Engineer',
      city: 'Bengaluru',
      baseSalaryAnnual: 2400000, // ₹24.0 LPA
      performanceBonusAnnual: 300000, // ₹3.0 LPA
      joiningBonusFirstYear: 200000, // ₹2.0 LPA
      stockGrantTotal4Yr: 1600000, // ₹16.0 LPA total (₹4.0 LPA/yr)
      stockVestingType: 'EQUAL_4_YEAR',
      gratuityPfAnnual: 180000,
      benefitsAnnual: 120000,
    };

    const d = deconstructCompensation(pkg);

    // Headline CTC: Base (24L) + Bonus (3L) + Annual Stock (4L) + PF/Gratuity (1.8L) + Benefits (1.2L) = 34 LPA
    expect(d.grossCtcAnnual).toBe(3400000);

    // First Year Cash: Base (24L) + Performance Bonus (3L) + Joining Bonus (2L) = 29 LPA
    expect(d.firstYearTotalCash).toBe(2900000);

    // Monthly Gross Base: 24L / 12 = 2,00,000
    expect(d.monthlyGrossSalary).toBe(200000);

    // Monthly PF (12% of basic, basic = 50% of 24L = 12L / 12 = 1,00,000 => 12,000)
    expect(d.monthlyPfDeduction).toBe(12000);

    // Professional Tax: ₹200/mo
    expect(d.monthlyProfessionalTax).toBe(200);

    // Monthly Net In-Hand should be positive and substantial
    expect(d.monthlyNetInHandNew).toBeGreaterThan(140000);
    expect(d.monthlyNetInHandOld).toBeGreaterThan(130000);
    expect(['NEW', 'OLD']).toContain(d.recommendedRegime);
  });

  it('correctly computes Indian New Tax Regime slabs and Section 87A full rebate', () => {
    // Under ₹7.75L gross (₹7.0L net after ₹75k standard deduction) => 0 tax under Section 87A
    const zeroTax = calculateNewRegimeTax(750000);
    expect(zeroTax).toBe(0);

    // Higher income bracket (e.g. ₹15,00,000 taxable)
    const midTax = calculateNewRegimeTax(1500000);
    expect(midTax).toBeGreaterThan(100000);

    // Top income bracket (> ₹25,00,000 taxable)
    const highTax = calculateNewRegimeTax(2500000);
    expect(highTax).toBeGreaterThan(400000);
  });

  it('correctly computes Old Tax Regime slabs with standard, 80C, and 80D deductions', () => {
    // Up to ₹5.5L gross (<= ₹5.0L net after ₹50k standard deduction) => 0 tax
    const zeroTax = calculateOldRegimeTax(550000, 50000);
    expect(zeroTax).toBe(0);

    const midTax = calculateOldRegimeTax(1800000, 150000);
    expect(midTax).toBeGreaterThan(200000);
  });

  it('compares multiple offers with Purchasing Power Parity (PPP) and city cost-of-living adjustments', () => {
    const scores = compareOffers(DEFAULT_BENCHMARK_PACKAGES);

    expect(scores.length).toBe(3);
    // Rankings should be 1, 2, 3
    expect(scores[0].financialRank).toBe(1);
    expect(scores[1].financialRank).toBe(2);
    expect(scores[2].financialRank).toBe(3);

    // Fit scores should be between 0 and 100
    scores.forEach((s) => {
      expect(s.overallFitScore).toBeGreaterThan(0);
      expect(s.overallFitScore).toBeLessThanOrEqual(100);
      expect(s.estimatedMonthlySavings).toBeGreaterThan(0);
    });
  });

  it('generates negotiation scripts and counter-offer proposals for multiple scenarios', () => {
    const pkg = DEFAULT_BENCHMARK_PACKAGES[0]; // HyperScale Systems (₹20L base)

    // Scenario 1: Competing offer
    const competing = generateNegotiationScripts(pkg, 'COMPETING_OFFER', 15);
    expect(competing.scenario).toBe('COMPETING_OFFER');
    expect(competing.targetNewBase).toBe(2300000); // 20L * 1.15
    expect(competing.emailSubject).toContain('HyperScale Systems Consortium');
    expect(competing.emailBody).toContain('concurrent offer');
    expect(competing.phoneTalkingPoints.length).toBeGreaterThan(2);

    // Scenario 2: Exceptional credentials
    const credentials = generateNegotiationScripts(pkg, 'EXCEPTIONAL_CREDENTIALS', 10);
    expect(credentials.scenario).toBe('EXCEPTIONAL_CREDENTIALS');
    expect(credentials.emailBody).toContain('verifiable engineering certifications');

    // Scenario 3: Cost of living
    const col = generateNegotiationScripts(pkg, 'COST_OF_LIVING', 10);
    expect(col.scenario).toBe('COST_OF_LIVING');
    expect(col.emailBody).toContain('relocation');
  });

  it('imports unlocked offers from placement drives localStorage records', () => {
    localStorage.setItem(
      'sp_campus_drives_v1_apps',
      JSON.stringify({
        'hyperscale-backend': {
          driveId: 'hyperscale-backend',
          status: 'OFFER_EXTENDED',
          offerDetails: {
            offerCode: 'SP-OFFER-2026-TEST',
            consortiumName: 'HyperScale Systems Consortium',
            roleTitle: 'Distributed Systems Engineer',
            ctcAnnual: '₹28.0 LPA',
            baseSalary: '₹20.0 LPA',
          },
        },
      })
    );

    const imported = importFromPlacementDrives();
    expect(imported.length).toBe(1);
    expect(imported[0].companyName).toBe('HyperScale Systems Consortium');
    expect(imported[0].baseSalaryAnnual).toBe(2000000);
  });

  it('manages localStorage persistence for compensation state', () => {
    const initial = getSavedCompensationState();
    expect(initial.activePackages.length).toBe(3);

    saveCompensationState({
      activePackages: [DEFAULT_BENCHMARK_PACKAGES[0]],
      selectedRegime: 'OLD',
      negotiationScenario: 'COST_OF_LIVING',
      targetIncreasePercent: 15,
      lastUpdated: new Date().toISOString(),
    });

    const updated = getSavedCompensationState();
    expect(updated.activePackages.length).toBe(1);
    expect(updated.selectedRegime).toBe('OLD');
    expect(updated.negotiationScenario).toBe('COST_OF_LIVING');
    expect(updated.targetIncreasePercent).toBe(15);
  });

  it('generates executive Markdown report and vector PDF document', () => {
    const packages = DEFAULT_BENCHMARK_PACKAGES;
    const scores = compareOffers(packages);

    const markdown = generateCompensationMarkdown(packages, scores);
    expect(markdown).toContain('# Executive Compensation & Offer Comparison Report');
    expect(markdown).toContain('HyperScale Systems Consortium');
    expect(markdown).toContain('Titan Core FinTech Labs');

    // Mock URL and click
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
    global.URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(clickSpy);

    exportCompensationReportPdf(packages, scores);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });
});
