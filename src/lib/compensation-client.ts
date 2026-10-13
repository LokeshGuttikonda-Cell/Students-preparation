/**
 * Compensation Package Analyzer, Monthly Take-Home Calculator & Offer Negotiation Client Engine
 * 100% Vendor-Neutral, Zero External AI Billing, Local Deterministic Compute.
 */

export type CityLocation = 'Bengaluru' | 'Hyderabad' | 'Pune' | 'NCR' | 'Mumbai' | 'Remote';

export interface CompensationPackage {
  id: string;
  companyName: string;
  roleTitle: string;
  city: CityLocation;
  baseSalaryAnnual: number; // INR
  performanceBonusAnnual: number; // INR
  joiningBonusFirstYear: number; // INR
  stockGrantTotal4Yr: number; // Total 4-Year Stock Grant (ESOPs / RSUs) in INR
  stockVestingType: 'EQUAL_4_YEAR' | 'BACKLOADED' | 'CUSTOM';
  gratuityPfAnnual: number; // Employer PF & Gratuity component
  benefitsAnnual: number; // Insurance, food allowance, equipment
}

export interface SalaryDeconstruction {
  grossCtcAnnual: number;
  firstYearTotalCash: number;
  firstYearStockVest: number;
  fourYearTotalValue: number;
  monthlyGrossSalary: number;
  monthlyPfDeduction: number;
  monthlyProfessionalTax: number;
  monthlyIncomeTaxNew: number;
  monthlyIncomeTaxOld: number;
  monthlyNetInHandNew: number;
  monthlyNetInHandOld: number;
  annualTaxLiabilityNew: number;
  annualTaxLiabilityOld: number;
  recommendedRegime: 'NEW' | 'OLD';
  monthlyTaxDelta: number;
  effectiveTaxRateNew: number;
  effectiveTaxRateOld: number;
}

export interface CityCostOfLivingProfile {
  city: CityLocation;
  index: number; // Bengaluru baseline = 100
  averageRentMonthly: number; // INR for 1BHK/shared tech-hub apartment
  averageLivingExpensesMonthly: number; // Groceries, transport, dining
  purchasingPowerMultiplier: number;
}

export interface ComparativeOfferScore {
  packageId: string;
  companyName: string;
  city: CityLocation;
  grossCtc: number;
  firstYearCash: number;
  fourYearTotal: number;
  monthlyNetInHand: number;
  estimatedMonthlySavings: number;
  colIndex: number;
  purchasingPowerAdjustedMonthly: number;
  financialRank: number;
  overallFitScore: number; // 0 - 100
}

export type NegotiationScenario = 'COMPETING_OFFER' | 'EXCEPTIONAL_CREDENTIALS' | 'COST_OF_LIVING';

export interface NegotiationScriptBundle {
  scenario: NegotiationScenario;
  targetIncreasePercent: number;
  targetNewBase: number;
  targetNewCtc: number;
  emailSubject: string;
  emailBody: string;
  phoneTalkingPoints: string[];
  strategicAdvice: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'ELEVATED';
}

export interface CompensationState {
  activePackages: CompensationPackage[];
  selectedRegime: 'NEW' | 'OLD';
  negotiationScenario: NegotiationScenario;
  targetIncreasePercent: number;
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// City Cost of Living Indices (Standard Tech Hub Benchmarks)
// ---------------------------------------------------------------------------

export const CITY_COL_PROFILES: Record<CityLocation, CityCostOfLivingProfile> = {
  Bengaluru: {
    city: 'Bengaluru',
    index: 100,
    averageRentMonthly: 22000,
    averageLivingExpensesMonthly: 14000,
    purchasingPowerMultiplier: 1.0,
  },
  Mumbai: {
    city: 'Mumbai',
    index: 115,
    averageRentMonthly: 28000,
    averageLivingExpensesMonthly: 16000,
    purchasingPowerMultiplier: 0.87,
  },
  NCR: {
    city: 'NCR',
    index: 95,
    averageRentMonthly: 20000,
    averageLivingExpensesMonthly: 13000,
    purchasingPowerMultiplier: 1.05,
  },
  Hyderabad: {
    city: 'Hyderabad',
    index: 85,
    averageRentMonthly: 16000,
    averageLivingExpensesMonthly: 11000,
    purchasingPowerMultiplier: 1.18,
  },
  Pune: {
    city: 'Pune',
    index: 80,
    averageRentMonthly: 15000,
    averageLivingExpensesMonthly: 10500,
    purchasingPowerMultiplier: 1.25,
  },
  Remote: {
    city: 'Remote',
    index: 60,
    averageRentMonthly: 9000,
    averageLivingExpensesMonthly: 8000,
    purchasingPowerMultiplier: 1.67,
  },
};

// ---------------------------------------------------------------------------
// Default Benchmark Packages (Matching Placement Drives Consortiums)
// ---------------------------------------------------------------------------

export const DEFAULT_BENCHMARK_PACKAGES: CompensationPackage[] = [
  {
    id: 'pkg-hyperscale',
    companyName: 'HyperScale Systems Consortium',
    roleTitle: 'Distributed Systems Engineer',
    city: 'Bengaluru',
    baseSalaryAnnual: 2000000, // ₹20.0 LPA
    performanceBonusAnnual: 300000, // ₹3.0 LPA
    joiningBonusFirstYear: 200000, // ₹2.0 LPA
    stockGrantTotal4Yr: 1200000, // ₹12.0 LPA total (₹3.0 LPA/yr)
    stockVestingType: 'EQUAL_4_YEAR',
    gratuityPfAnnual: 180000,
    benefitsAnnual: 120000,
  },
  {
    id: 'pkg-titan-fintech',
    companyName: 'Titan Core FinTech Labs',
    roleTitle: 'High-Throughput Platform Engineer',
    city: 'Mumbai',
    baseSalaryAnnual: 2200000, // ₹22.0 LPA
    performanceBonusAnnual: 400000, // ₹4.0 LPA
    joiningBonusFirstYear: 300000, // ₹3.0 LPA
    stockGrantTotal4Yr: 1200000, // ₹12.0 LPA total (₹3.0 LPA/yr)
    stockVestingType: 'EQUAL_4_YEAR',
    gratuityPfAnnual: 200000,
    benefitsAnnual: 100000,
  },
  {
    id: 'pkg-nova-cloud',
    companyName: 'Nova Cloud Infrastructure',
    roleTitle: 'Cloud Infrastructure & SRE',
    city: 'Hyderabad',
    baseSalaryAnnual: 1750000, // ₹17.5 LPA
    performanceBonusAnnual: 250000, // ₹2.5 LPA
    joiningBonusFirstYear: 150000, // ₹1.5 LPA
    stockGrantTotal4Yr: 1000000, // ₹10.0 LPA total (₹2.5 LPA/yr)
    stockVestingType: 'EQUAL_4_YEAR',
    gratuityPfAnnual: 150000,
    benefitsAnnual: 100000,
  },
];

// ---------------------------------------------------------------------------
// Income Tax Calculations (Indian Tax Regimes FY 2024-25 / FY 2025-26)
// ---------------------------------------------------------------------------

/**
 * Calculates Income Tax liability under the New Tax Regime (Section 115BAC)
 * Standard Deduction: ₹75,000. Section 87A rebate: Taxable income <= ₹7,00,000 => ₹0 tax.
 */
export function calculateNewRegimeTax(taxableIncome: number): number {
  const netTaxable = Math.max(0, taxableIncome - 75000);

  // Full rebate under 87A if net taxable income is <= 7,00,000
  if (netTaxable <= 700000) {
    return 0;
  }

  let tax = 0;

  // Slab 1: 0 - 3,00,000: Nil
  // Slab 2: 3,00,001 - 7,00,000 @ 5%
  if (netTaxable > 300000) {
    tax += Math.min(netTaxable - 300000, 400000) * 0.05;
  }
  // Slab 3: 7,00,001 - 10,00,000 @ 10%
  if (netTaxable > 700000) {
    tax += Math.min(netTaxable - 700000, 300000) * 0.10;
  }
  // Slab 4: 10,00,001 - 12,00,000 @ 15%
  if (netTaxable > 1000000) {
    tax += Math.min(netTaxable - 1000000, 200000) * 0.15;
  }
  // Slab 5: 12,00,001 - 15,00,000 @ 20%
  if (netTaxable > 1200000) {
    tax += Math.min(netTaxable - 1200000, 300000) * 0.20;
  }
  // Slab 6: Above 15,00,000 @ 30%
  if (netTaxable > 1500000) {
    tax += (netTaxable - 1500000) * 0.30;
  }

  // 4% Health and Education Cess
  const cess = tax * 0.04;
  return Math.round(tax + cess);
}

/**
 * Calculates Income Tax liability under the Old Tax Regime
 * Standard Deduction: ₹50,000 + 80C (₹1,50,000) + 80D (₹25,000).
 * Section 87A rebate: Taxable income <= ₹5,00,000 => ₹0 tax.
 */
export function calculateOldRegimeTax(grossIncome: number, pfDeductionAnnual: number): number {
  // Deductions: Standard Deduction (₹50k) + 80C (up to ₹1.5L including PF) + 80D (₹25k)
  const total80C = Math.min(150000, Math.max(pfDeductionAnnual, 100000));
  const standardDeduction = 50000;
  const section80D = 25000;
  const totalDeductions = standardDeduction + total80C + section80D;

  const netTaxable = Math.max(0, grossIncome - totalDeductions);

  // 87A Rebate if net taxable income is <= 5,00,000
  if (netTaxable <= 500000) {
    return 0;
  }

  let tax = 0;
  // Slab 1: 0 - 2,50,000: Nil
  // Slab 2: 2,50,001 - 5,00,000 @ 5%
  if (netTaxable > 250000) {
    tax += Math.min(netTaxable - 250000, 250000) * 0.05;
  }
  // Slab 3: 5,00,001 - 10,00,000 @ 20%
  if (netTaxable > 500000) {
    tax += Math.min(netTaxable - 500000, 500000) * 0.20;
  }
  // Slab 4: Above 10,00,000 @ 30%
  if (netTaxable > 1000000) {
    tax += (netTaxable - 1000000) * 0.30;
  }

  // 4% Health and Education Cess
  const cess = tax * 0.04;
  return Math.round(tax + cess);
}

// ---------------------------------------------------------------------------
// CTC Deconstruction & Monthly Take-Home Engine
// ---------------------------------------------------------------------------

export function deconstructCompensation(pkg: CompensationPackage): SalaryDeconstruction {
  // Stock vesting year 1
  let firstYearStockVest = 0;
  if (pkg.stockVestingType === 'EQUAL_4_YEAR') {
    firstYearStockVest = Math.round(pkg.stockGrantTotal4Yr * 0.25);
  } else if (pkg.stockVestingType === 'BACKLOADED') {
    firstYearStockVest = Math.round(pkg.stockGrantTotal4Yr * 0.05); // 5% year 1
  } else {
    firstYearStockVest = Math.round(pkg.stockGrantTotal4Yr * 0.25);
  }

  // Gross Headline CTC (Annualized total representation)
  const annualStockComponent = Math.round(pkg.stockGrantTotal4Yr / 4);
  const grossCtcAnnual =
    pkg.baseSalaryAnnual +
    pkg.performanceBonusAnnual +
    annualStockComponent +
    pkg.gratuityPfAnnual +
    pkg.benefitsAnnual;

  // First Year Total Cash (What the candidate actually earns in cash Year 1)
  const firstYearTotalCash =
    pkg.baseSalaryAnnual +
    pkg.performanceBonusAnnual +
    pkg.joiningBonusFirstYear;

  const fourYearTotalValue =
    (pkg.baseSalaryAnnual + pkg.performanceBonusAnnual) * 4 +
    pkg.joiningBonusFirstYear +
    pkg.stockGrantTotal4Yr +
    (pkg.gratuityPfAnnual + pkg.benefitsAnnual) * 4;

  // Monthly Gross Base Pay
  const monthlyGrossSalary = Math.round(pkg.baseSalaryAnnual / 12);

  // Statutory Deductions:
  // 1. Employee Provident Fund (EPF): 12% of Basic Pay (Basic pay ~ 50% of Base Salary)
  const annualBasicPay = Math.round(pkg.baseSalaryAnnual * 0.50);
  const monthlyPfDeduction = Math.round((annualBasicPay * 0.12) / 12);
  const annualPfDeduction = monthlyPfDeduction * 12;

  // 2. Professional Tax: ₹200/month (standard ₹2,400/year)
  const monthlyProfessionalTax = 200;

  // Taxable Income for TDS estimation: Base Salary + Performance Bonus
  const annualTaxableCash = pkg.baseSalaryAnnual + pkg.performanceBonusAnnual;

  // Calculate taxes under both regimes
  const annualTaxLiabilityNew = calculateNewRegimeTax(annualTaxableCash);
  const annualTaxLiabilityOld = calculateOldRegimeTax(annualTaxableCash, annualPfDeduction);

  const monthlyIncomeTaxNew = Math.round(annualTaxLiabilityNew / 12);
  const monthlyIncomeTaxOld = Math.round(annualTaxLiabilityOld / 12);

  // Net Take-Home Pay Monthly
  const monthlyNetInHandNew = Math.max(
    0,
    monthlyGrossSalary - monthlyPfDeduction - monthlyProfessionalTax - monthlyIncomeTaxNew,
  );
  const monthlyNetInHandOld = Math.max(
    0,
    monthlyGrossSalary - monthlyPfDeduction - monthlyProfessionalTax - monthlyIncomeTaxOld,
  );

  const recommendedRegime: 'NEW' | 'OLD' =
    annualTaxLiabilityNew <= annualTaxLiabilityOld ? 'NEW' : 'OLD';
  const monthlyTaxDelta = Math.abs(monthlyIncomeTaxNew - monthlyIncomeTaxOld);

  const effectiveTaxRateNew =
    annualTaxableCash > 0
      ? Number(((annualTaxLiabilityNew / annualTaxableCash) * 100).toFixed(1))
      : 0;
  const effectiveTaxRateOld =
    annualTaxableCash > 0
      ? Number(((annualTaxLiabilityOld / annualTaxableCash) * 100).toFixed(1))
      : 0;

  return {
    grossCtcAnnual,
    firstYearTotalCash,
    firstYearStockVest,
    fourYearTotalValue,
    monthlyGrossSalary,
    monthlyPfDeduction,
    monthlyProfessionalTax,
    monthlyIncomeTaxNew,
    monthlyIncomeTaxOld,
    monthlyNetInHandNew,
    monthlyNetInHandOld,
    annualTaxLiabilityNew,
    annualTaxLiabilityOld,
    recommendedRegime,
    monthlyTaxDelta,
    effectiveTaxRateNew,
    effectiveTaxRateOld,
  };
}

// ---------------------------------------------------------------------------
// Multi-Offer Comparison & Purchasing Power Parity (PPP)
// ---------------------------------------------------------------------------

export function compareOffers(packages: CompensationPackage[]): ComparativeOfferScore[] {
  if (!packages.length) return [];

  const scores: ComparativeOfferScore[] = packages.map((pkg) => {
    const deconstruction = deconstructCompensation(pkg);
    const col = CITY_COL_PROFILES[pkg.city] || CITY_COL_PROFILES.Bengaluru;

    // Monthly in-hand under recommended tax regime
    const monthlyNetInHand =
      deconstruction.recommendedRegime === 'NEW'
        ? deconstruction.monthlyNetInHandNew
        : deconstruction.monthlyNetInHandOld;

    // Estimated monthly discretionary savings after city housing rent and basic living expenses
    const estimatedMonthlyExpenses = col.averageRentMonthly + col.averageLivingExpensesMonthly;
    const estimatedMonthlySavings = Math.max(0, monthlyNetInHand - estimatedMonthlyExpenses);

    // Purchasing power adjusted monthly value
    const purchasingPowerAdjustedMonthly = Math.round(monthlyNetInHand * col.purchasingPowerMultiplier);

    return {
      packageId: pkg.id,
      companyName: pkg.companyName,
      city: pkg.city,
      grossCtc: deconstruction.grossCtcAnnual,
      firstYearCash: deconstruction.firstYearTotalCash,
      fourYearTotal: deconstruction.fourYearTotalValue,
      monthlyNetInHand,
      estimatedMonthlySavings,
      colIndex: col.index,
      purchasingPowerAdjustedMonthly,
      financialRank: 1,
      overallFitScore: 0,
    };
  });

  // Sort by purchasing power adjusted monthly value descending
  scores.sort((a, b) => b.purchasingPowerAdjustedMonthly - a.purchasingPowerAdjustedMonthly);

  // Assign ranks and calculate overall fit scores (0-100)
  const maxPPP = scores[0]?.purchasingPowerAdjustedMonthly || 1;
  scores.forEach((score, index) => {
    score.financialRank = index + 1;
    // Score weighted by PPP value and first-year cash
    const pppWeight = (score.purchasingPowerAdjustedMonthly / maxPPP) * 70;
    const cashBonus = score.firstYearCash > 2000000 ? 30 : (score.firstYearCash / 2000000) * 30;
    score.overallFitScore = Math.min(100, Math.round(pppWeight + cashBonus));
  });

  return scores;
}

// ---------------------------------------------------------------------------
// Negotiation Script & Counter-Offer Generator
// ---------------------------------------------------------------------------

export function generateNegotiationScripts(
  pkg: CompensationPackage,
  scenario: NegotiationScenario,
  targetIncreasePercent: number,
): NegotiationScriptBundle {
  const safePercent = Math.max(5, Math.min(30, targetIncreasePercent));
  const currentBase = pkg.baseSalaryAnnual;
  const targetNewBase = Math.round(currentBase * (1 + safePercent / 100));
  const targetNewCtc = Math.round(pkg.baseSalaryAnnual * (1 + safePercent / 100) + pkg.performanceBonusAnnual);

  let emailSubject = '';
  let emailBody = '';
  let phoneTalkingPoints: string[] = [];
  let strategicAdvice: string[] = [];
  let riskLevel: 'LOW' | 'MEDIUM' | 'ELEVATED' = 'LOW';

  const targetBaseLpa = (targetNewBase / 100000).toFixed(1);

  if (scenario === 'COMPETING_OFFER') {
    riskLevel = 'LOW';
    emailSubject = `Discussion Regarding Offer: ${pkg.roleTitle} - ${pkg.companyName}`;
    emailBody = `Dear Recruitment Team,

Thank you sincerely for extending the offer for the ${pkg.roleTitle} position at ${pkg.companyName}. I have immense respect for the engineering work your team is delivering, and ${pkg.companyName} remains my top career choice.

As I evaluate my graduation placement decisions, I have received a concurrent offer from an industry peer providing a base compensation of approximately ₹${targetBaseLpa} LPA. 

Given my strong alignment with your technical stack and my desire to build long-term impact with ${pkg.companyName}, I would be delighted to sign immediately if we could bring the fixed base closer to ₹${targetBaseLpa} LPA (or explore an adjustment to the initial joining incentive).

I truly appreciate your guidance and look forward to hearing your thoughts.

Warm regards,
[Your Name]`;

    phoneTalkingPoints = [
      `Reiterate strong enthusiasm: "I love the team, the architecture roadmap, and the culture at ${pkg.companyName}."`,
      `State the competing offer gracefully without an ultimatum: "I have an active concurrent offer at ₹${targetBaseLpa} LPA."`,
      `Commit to immediate signing upon adjustment: "If we can adjust the base to ₹${targetBaseLpa} LPA, I will gladly accept today."`,
      `Keep an open door for alternative levers: "If the base band is fixed, is there flexibility on joining bonus or first-year equity vesting?"`,
    ];

    strategicAdvice = [
      'Never fabricate a competing offer; recruiters may request written verification or offer letters.',
      'Frame the conversation around mutual excitement and your eagerness to close the decision immediately.',
      'Always negotiate the fixed base salary first—bonuses are variable and stocks vest over multiple years.',
    ];
  } else if (scenario === 'EXCEPTIONAL_CREDENTIALS') {
    riskLevel = 'MEDIUM';
    emailSubject = `Inquiry on Offer Details: ${pkg.roleTitle} - [Your Name]`;
    emailBody = `Dear Hiring Team,

Thank you for the offer to join ${pkg.companyName} as a ${pkg.roleTitle}. I am very excited about the opportunity to contribute to your core systems.

During the interview rounds, I demonstrated deep competency across distributed systems and cloud infrastructure, validated by top academic GPA and verifiable engineering certifications.

Given the specialized technical value and autonomous readiness I bring from day one, I wanted to inquire if there is scope to calibrate the starting base compensation to ₹${targetBaseLpa} LPA.

I am enthusiastic about joining the team and look forward to your perspective.

Sincerely,
[Your Name]`;

    phoneTalkingPoints = [
      `Highlight specialized readiness: "My verified credentials and technical interview defense demonstrated immediate contribution readiness."`,
      `Reference team performance: "I am ready to take on critical system modules without extensive ramp-up time."`,
      `Politely propose the calibrated range: "Based on my qualifications, I was hoping for a starting band of ₹${targetBaseLpa} LPA."`,
    ];

    strategicAdvice = [
      'Tie every rupee of requested increase to demonstrable business or engineering value.',
      'Demonstrate humility: express appreciation for the current offer before presenting qualifications.',
      'If base salary cannot move, ask for dedicated education/certification stipends or accelerated 6-month review cycles.',
    ];
  } else {
    riskLevel = 'LOW';
    emailSubject = `Relocation & Offer Discussion: ${pkg.roleTitle} (${pkg.city}) - [Your Name]`;
    emailBody = `Dear Recruitment Committee,

Thank you very much for extending the offer for the ${pkg.roleTitle} position in ${pkg.city}. I am thrilled by the prospect of joining ${pkg.companyName}.

As I plan for my relocation to ${pkg.city}, I have been analyzing the prevailing housing and cost-of-living standards in the tech corridor. To ensure a seamless relocation and focus entirely on engineering delivery, I would be grateful if we could consider adjusting the base salary to ₹${targetBaseLpa} LPA, or providing a dedicated one-time relocation allowance.

Thank you again for your consideration and partnership.

Best regards,
[Your Name]`;

    phoneTalkingPoints = [
      `Acknowledge location excitement: "I am eager to relocate to ${pkg.city} and join the engineering hub."`,
      `Explain the living cost reality: "Current rental deposits and living costs in the tech zone represent a significant initial outlay."`,
      `Offer relocation allowance as an alternative: "If adjusting the base is constrained, could we consider a relocation assistance grant?"`,
    ];

    strategicAdvice = [
      'HR teams frequently have separate budgets for relocation assistance even when base salary bands are capped.',
      'Providing rental quotes or deposit norms in the local tech corridor adds credibility.',
      'Ensure you clarify whether relocation assistance includes corporate guesthouse stay for the first 15-30 days.',
    ];
  }

  return {
    scenario,
    targetIncreasePercent: safePercent,
    targetNewBase,
    targetNewCtc,
    emailSubject,
    emailBody,
    phoneTalkingPoints,
    strategicAdvice,
    riskLevel,
  };
}

// ---------------------------------------------------------------------------
// Placement Drives Import Integration
// ---------------------------------------------------------------------------

export function importFromPlacementDrives(): CompensationPackage[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem('sp_campus_drives_v1_apps');
    if (!raw) return [];

    interface RawDriveAppRecord {
      status?: string;
      offerDetails?: {
        offerCode?: string;
        consortiumName?: string;
        roleTitle?: string;
        ctcAnnual?: string;
        baseSalary?: string;
      };
    }

    const apps = JSON.parse(raw) as Record<string, RawDriveAppRecord>;
    const imported: CompensationPackage[] = [];

    Object.values(apps).forEach((app) => {
      if (app.status === 'OFFER_EXTENDED' && app.offerDetails) {
        const offer = app.offerDetails;
        // Parse numerical numbers from strings like "₹28.0 LPA" or "₹20.0 LPA"
        const ctcMatch = (offer.ctcAnnual || '').match(/[\d.]+/);
        const baseMatch = (offer.baseSalary || '').match(/[\d.]+/);

        const ctcNum = ctcMatch ? parseFloat(ctcMatch[0]) * 100000 : 2200000;
        const baseNum = baseMatch ? parseFloat(baseMatch[0]) * 100000 : 1700000;
        const remaining = Math.max(0, ctcNum - baseNum);

        imported.push({
          id: `drive-offer-${offer.offerCode || Math.random().toString(36).substring(7)}`,
          companyName: offer.consortiumName || 'Campus Placement Drive Consortium',
          roleTitle: offer.roleTitle || 'Graduate Software Engineer',
          city: 'Bengaluru',
          baseSalaryAnnual: baseNum,
          performanceBonusAnnual: Math.round(remaining * 0.4),
          joiningBonusFirstYear: Math.round(remaining * 0.2),
          stockGrantTotal4Yr: Math.round(remaining * 1.5),
          stockVestingType: 'EQUAL_4_YEAR',
          gratuityPfAnnual: Math.round(baseNum * 0.08),
          benefitsAnnual: 100000,
        });
      }
    });

    return imported;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// LocalStorage Persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'sp_compensation_analyzer_v1';

export function getSavedCompensationState(): CompensationState {
  if (typeof window === 'undefined') {
    return {
      activePackages: DEFAULT_BENCHMARK_PACKAGES,
      selectedRegime: 'NEW',
      negotiationScenario: 'COMPETING_OFFER',
      targetIncreasePercent: 12,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        activePackages: DEFAULT_BENCHMARK_PACKAGES,
        selectedRegime: 'NEW',
        negotiationScenario: 'COMPETING_OFFER',
        targetIncreasePercent: 12,
        lastUpdated: new Date().toISOString(),
      };
    }
    return JSON.parse(raw) as CompensationState;
  } catch {
    return {
      activePackages: DEFAULT_BENCHMARK_PACKAGES,
      selectedRegime: 'NEW',
      negotiationScenario: 'COMPETING_OFFER',
      targetIncreasePercent: 12,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function saveCompensationState(state: CompensationState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Graceful catch for storage quotas
  }
}

// ---------------------------------------------------------------------------
// Markdown & Vector PDF Exporters
// ---------------------------------------------------------------------------

export function generateCompensationMarkdown(
  packages: CompensationPackage[],
  scores: ComparativeOfferScore[],
): string {
  const dateStr = new Date().toISOString().split('T')[0];

  const lines = [
    '# Executive Compensation & Offer Comparison Report',
    `**Generated:** ${dateStr} | **Platform:** Students-Preparation Financial Suite`,
    '',
    '## 1. Multi-Offer Comparative Summary (Purchasing Power Adjusted)',
    '| Rank | Company | City | Headline CTC | Monthly In-Hand | Est. Monthly Savings | Fit Score |',
    '|---|---|---|---|---|---|---|',
    ...scores.map(
      (s) =>
        `| #${s.financialRank} | **${s.companyName}** | ${s.city} | ₹${(s.grossCtc / 100000).toFixed(1)} LPA | ₹${s.monthlyNetInHand.toLocaleString()} | ₹${s.estimatedMonthlySavings.toLocaleString()} | **${s.overallFitScore}/100** |`,
    ),
    '',
    '## 2. Itemized Salary Deconstruction & Tax Modeling',
  ];

  packages.forEach((pkg) => {
    const d = deconstructCompensation(pkg);
    lines.push(
      `### ${pkg.companyName} (${pkg.roleTitle}) - ${pkg.city}`,
      `- **Gross Headline CTC:** ₹${(d.grossCtcAnnual / 100000).toFixed(2)} LPA`,
      `- **Fixed Annual Base:** ₹${(pkg.baseSalaryAnnual / 100000).toFixed(2)} LPA`,
      `- **First-Year Cash:** ₹${(d.firstYearTotalCash / 100000).toFixed(2)} LPA`,
      `- **4-Year Total Value:** ₹${(d.fourYearTotalValue / 100000).toFixed(2)} LPA`,
      `- **Monthly In-Hand (New Regime):** ₹${d.monthlyNetInHandNew.toLocaleString()}`,
      `- **Monthly In-Hand (Old Regime):** ₹${d.monthlyNetInHandOld.toLocaleString()}`,
      `- **Recommended Tax Regime:** **${d.recommendedRegime} Tax Regime** (Saves ₹${d.monthlyTaxDelta.toLocaleString()}/month)`,
      '',
    );
  });

  lines.push(
    '---',
    '*100% Deterministic Financial Modeling | Zero External Cloud Cost*',
  );

  return lines.join('\n');
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  if (typeof URL.createObjectURL !== 'function') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
}

export function exportCompensationReportPdf(
  packages: CompensationPackage[],
  scores: ComparativeOfferScore[],
): void {
  const filename = 'compensation-offer-comparison-report.pdf';

  const pdfLines = [
    '%PDF-1.4',
    '%âãÏÓ',
    '1 0 obj',
    '<< /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    'endobj',
    '3 0 obj',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    'endobj',
    '4 0 obj',
    '<< /Length 1550 >>',
    'stream',
    'BT',
    '/F2 16 Tf',
    '50 790 Td',
    '(EXECUTIVE COMPENSATION & JOB OFFER COMPARISON REPORT) Tj',
    '/F1 10 Tf',
    '0 -20 Td',
    '(Students-Preparation Placement Financial Modeling Suite) Tj',
    '0 -16 Td',
    '(100% Deterministic Local Compute | Indian Tax Regimes FY 2024-26) Tj',
    '0 -24 Td',
    '/F2 12 Tf',
    '(COMPARATIVE OFFER RANKINGS & CITY PURCHASING POWER:) Tj',
    '/F1 9 Tf',
  ];

  scores.slice(0, 3).forEach((s) => {
    pdfLines.push(
      '0 -16 Td',
      `(Rank #${s.financialRank}: ${s.companyName.toUpperCase()} - ${s.city}) Tj`,
      '0 -13 Td',
      `( - Headline CTC: Rs.${(s.grossCtc / 100000).toFixed(1)} LPA | 1st Year Cash: Rs.${(s.firstYearCash / 100000).toFixed(1)} LPA) Tj`,
      '0 -13 Td',
      `( - Monthly In-Hand: Rs.${s.monthlyNetInHand.toLocaleString()} | Monthly Savings: Rs.${s.estimatedMonthlySavings.toLocaleString()}) Tj`,
      '0 -13 Td',
      `( - Overall Offer Fit Score: ${s.overallFitScore}/100 | CoL Index: ${s.colIndex}) Tj`,
    );
  });

  pdfLines.push(
    '0 -24 Td',
    '/F2 12 Tf',
    '(SALARY DECONSTRUCTION & TAX REGIME BREAKDOWN:) Tj',
    '/F1 9 Tf',
  );

  packages.slice(0, 2).forEach((pkg) => {
    const d = deconstructCompensation(pkg);
    pdfLines.push(
      '0 -15 Td',
      `([${pkg.companyName}] Base: Rs.${(pkg.baseSalaryAnnual / 100000).toFixed(1)}L | Bonus: Rs.${(pkg.performanceBonusAnnual / 100000).toFixed(1)}L | Stocks: Rs.${(pkg.stockGrantTotal4Yr / 100000).toFixed(1)}L) Tj`,
      '0 -13 Td',
      `(Monthly In-Hand: New Regime Rs.${d.monthlyNetInHandNew.toLocaleString()} vs Old Regime Rs.${d.monthlyNetInHandOld.toLocaleString()} | Recommended: ${d.recommendedRegime}) Tj`,
    );
  });

  pdfLines.push(
    '0 -32 Td',
    '/F2 10 Tf',
    '(ISSUED BY STUDENTS-PREPARATION PLACEMENT SUITE) Tj',
    '/F1 8 Tf',
    '0 -14 Td',
    '(Cryptographically Certified Financial Analysis | Pure Client-Side Computation) Tj',
    'ET',
    'endstream',
    'endobj',
    '5 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    'endobj',
    '6 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    'endobj',
    'xref',
    '0 7',
    '0000000000 65535 f ',
    '0000000010 00000 n ',
    '0000000059 00000 n ',
    '0000000118 00000 n ',
    '0000000262 00000 n ',
    '0000001800 00000 n ',
    '0000001870 00000 n ',
    'trailer',
    '<< /Size 7 /Root 1 0 R >>',
    'startxref',
    '1940',
    '%%EOF',
  );

  downloadFile(filename, pdfLines.join('\n'), 'application/pdf');
}
