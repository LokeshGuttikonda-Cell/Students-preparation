'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  DEFAULT_BENCHMARK_PACKAGES,
  CITY_COL_PROFILES,
  deconstructCompensation,
  compareOffers,
  generateNegotiationScripts,
  importFromPlacementDrives,
  getSavedCompensationState,
  saveCompensationState,
  generateCompensationMarkdown,
  exportCompensationReportPdf,
  downloadFile,
  type CompensationPackage,
  type CityLocation,
  type NegotiationScenario,
} from '../../../lib/compensation-client';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import {
  MapPin,
  TrendingUp,
  Calculator,
  Scale,
  MessageSquare,
  Copy,
  Check,
  FileDown,
  FileText,
  RotateCcw,
  Sparkles,
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  DollarSign,
} from 'lucide-react';

export default function CompensationAnalyzerPage() {
  const [packages, setPackages] = useState<CompensationPackage[]>(DEFAULT_BENCHMARK_PACKAGES);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(DEFAULT_BENCHMARK_PACKAGES[0].id);
  const [activeTab, setActiveTab] = useState<'deconstruction' | 'comparison' | 'negotiation'>('deconstruction');

  // Negotiation state
  const [negotiationScenario, setNegotiationScenario] = useState<NegotiationScenario>('COMPETING_OFFER');
  const [targetIncreasePercent, setTargetIncreasePercent] = useState<number>(12);

  // Copied toast state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const saved = getSavedCompensationState();
    if (saved.activePackages && saved.activePackages.length > 0) {
      setPackages(saved.activePackages);
      setSelectedPackageId(saved.activePackages[0].id);
    }
    if (saved.negotiationScenario) {
      setNegotiationScenario(saved.negotiationScenario);
    }
    if (saved.targetIncreasePercent) {
      setTargetIncreasePercent(saved.targetIncreasePercent);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveCompensationState({
      activePackages: packages,
      selectedRegime: 'NEW',
      negotiationScenario,
      targetIncreasePercent,
      lastUpdated: new Date().toISOString(),
    });
  }, [packages, negotiationScenario, targetIncreasePercent]);

  // Currently active selected package
  const activePackage = useMemo(() => {
    return packages.find((p) => p.id === selectedPackageId) || packages[0];
  }, [packages, selectedPackageId]);

  // Deconstruction for active package
  const deconstruction = useMemo(() => {
    return deconstructCompensation(activePackage);
  }, [activePackage]);

  // Comparison scores across all active packages
  const comparisonScores = useMemo(() => {
    return compareOffers(packages);
  }, [packages]);

  // Negotiation bundle for active package
  const negotiationBundle = useMemo(() => {
    return generateNegotiationScripts(activePackage, negotiationScenario, targetIncreasePercent);
  }, [activePackage, negotiationScenario, targetIncreasePercent]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, key: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast('Copied to clipboard!');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleImportFromDrives = () => {
    const imported = importFromPlacementDrives();
    if (!imported.length) {
      showToast('No extended placement offers found in local drives storage.');
      return;
    }

    // Merge without duplicates by company name
    const existingNames = new Set(packages.map((p) => p.companyName.toLowerCase()));
    const newItems = imported.filter((p) => !existingNames.has(p.companyName.toLowerCase()));

    if (!newItems.length) {
      showToast('Placement drive offers are already imported into your studio.');
      return;
    }

    const merged = [...packages, ...newItems];
    setPackages(merged);
    setSelectedPackageId(newItems[0].id);
    showToast(`Successfully imported ${newItems.length} offer letter(s) from Placement Drives!`);
  };

  const handleResetToBenchmarks = () => {
    setPackages(DEFAULT_BENCHMARK_PACKAGES);
    setSelectedPackageId(DEFAULT_BENCHMARK_PACKAGES[0].id);
    setNegotiationScenario('COMPETING_OFFER');
    setTargetIncreasePercent(12);
    showToast('Reset to default benchmark tech compensation packages.');
  };

  const handleExportPdf = () => {
    exportCompensationReportPdf(packages, comparisonScores);
    showToast('Compensation & Offer Comparison Report downloaded as PDF!');
  };

  const handleExportMarkdown = () => {
    const md = generateCompensationMarkdown(packages, comparisonScores);
    downloadFile('compensation-offer-comparison.md', md, 'text/markdown');
    showToast('Executive summary report exported as Markdown (.md)!');
  };

  const handleUpdateActivePackage = (field: keyof CompensationPackage, value: string | number) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === activePackage.id ? { ...p, [field]: value } : p))
    );
  };

  const handleAddCustomOffer = () => {
    const newId = `custom-pkg-${Date.now()}`;
    const newPackage: CompensationPackage = {
      id: newId,
      companyName: `New Tech Offer #${packages.length + 1}`,
      roleTitle: 'Software Engineer',
      city: 'Bengaluru',
      baseSalaryAnnual: 1800000,
      performanceBonusAnnual: 200000,
      joiningBonusFirstYear: 100000,
      stockGrantTotal4Yr: 800000,
      stockVestingType: 'EQUAL_4_YEAR',
      gratuityPfAnnual: 150000,
      benefitsAnnual: 80000,
    };
    setPackages((prev) => [...prev, newPackage]);
    setSelectedPackageId(newId);
    showToast('Added new custom offer to workspace.');
  };

  const handleDeletePackage = (id: string) => {
    if (packages.length <= 1) {
      showToast('You must keep at least one package in your workspace.');
      return;
    }
    const filtered = packages.filter((p) => p.id !== id);
    setPackages(filtered);
    setSelectedPackageId(filtered[0].id);
    showToast('Removed offer package from workspace.');
  };

  return (
    <div className="min-h-screen bg-canvas pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-surface border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" className="text-primary-600 border-primary-200 bg-primary-50">
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  Financial Modeling Suite
                </Badge>
                <Badge variant="neutral" className="text-slate-600 border-slate-200">
                  FY 2024–2026 Indian Tax Regimes
                </Badge>
                <Badge variant="success" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                  Zero Cloud Cost
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-text tracking-tight flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary-600" />
                Compensation & Take-Home Salary Analyzer
              </h1>
              <p className="text-text-muted mt-1 max-w-3xl text-sm sm:text-base">
                Deconstruct headline CTC into real monthly bank deposits, compare competing offers adjusted for city living costs, and simulate professional offer negotiations.
              </p>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleImportFromDrives}
                title="Import offers unlocked in Placement Drives"
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Import from Drives
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportMarkdown}
                title="Export Executive Markdown Summary"
                className="flex items-center gap-1.5 text-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                Summary (.md)
              </Button>
              <Button
                size="sm"
                onClick={handleExportPdf}
                title="Download Vector PDF Comparison Report"
                className="flex items-center gap-1.5 text-xs"
              >
                <FileDown className="w-3.5 h-3.5" />
                Report (PDF)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToBenchmarks}
                title="Reset to default benchmark packages"
                className="text-text-muted hover:text-text p-2"
                aria-label="Reset Packages to Default"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab('deconstruction')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'deconstruction'
                  ? 'border-primary-600 text-primary-600 font-bold'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Calculator className="w-4 h-4" />
              1. CTC Deconstruction & Monthly In-Hand
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'comparison'
                  ? 'border-primary-600 text-primary-600 font-bold'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Scale className="w-4 h-4" />
              2. Multi-Offer Comparison Matrix ({packages.length})
            </button>
            <button
              onClick={() => setActiveTab('negotiation')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'negotiation'
                  ? 'border-primary-600 text-primary-600 font-bold'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              3. Negotiation Simulator & Script Studio
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1: CTC DECONSTRUCTION & MONTHLY TAKE-HOME */}
        {activeTab === 'deconstruction' && (
          <div className="space-y-8">
            {/* Offer Selector Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface rounded-xl border border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider mr-2">
                  Select Active Offer:
                </span>
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      pkg.id === activePackage.id
                        ? 'bg-primary-600 text-white shadow-xs font-semibold'
                        : 'bg-canvas text-text hover:bg-slate-200 border border-border'
                    }`}
                  >
                    {pkg.companyName} (₹{(pkg.baseSalaryAnnual / 100000).toFixed(1)}L Base)
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddCustomOffer}
                className="flex items-center gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Offer
              </Button>
            </div>

            {/* Two-Column Workspace: Left = Package Editor, Right = Take-Home Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Package Configuration Editor (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <Card>
                  <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-text flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary-600" />
                        Offer Details & Compensation Structure
                      </h3>
                      <p className="text-xs text-text-muted">Edit numbers to recalculate take-home pay in real time</p>
                    </div>
                    {packages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePackage(activePackage.id)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs flex items-center gap-1"
                        title="Delete this offer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4 text-xs">
                    {/* Company & Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-text mb-1">Company / Consortium:</label>
                        <input
                          type="text"
                          value={activePackage.companyName}
                          onChange={(e) => handleUpdateActivePackage('companyName', e.target.value)}
                          className="w-full p-2 bg-canvas border border-border rounded-lg text-text focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-text mb-1">Job Title:</label>
                        <input
                          type="text"
                          value={activePackage.roleTitle}
                          onChange={(e) => handleUpdateActivePackage('roleTitle', e.target.value)}
                          className="w-full p-2 bg-canvas border border-border rounded-lg text-text focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Location City */}
                    <div>
                      <label className="block font-semibold text-text mb-1">Primary Work City:</label>
                      <select
                        value={activePackage.city}
                        onChange={(e) => handleUpdateActivePackage('city', e.target.value as CityLocation)}
                        className="w-full p-2 bg-canvas border border-border rounded-lg text-text focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium"
                      >
                        {Object.keys(CITY_COL_PROFILES).map((city) => (
                          <option key={city} value={city}>
                            {city} (Living Cost Index: {CITY_COL_PROFILES[city as CityLocation].index})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Numerical Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block font-semibold text-text mb-1">
                          Fixed Base Salary (Annual INR):
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-text-muted font-bold">₹</span>
                          <input
                            type="number"
                            step={50000}
                            value={activePackage.baseSalaryAnnual}
                            onChange={(e) =>
                              handleUpdateActivePackage('baseSalaryAnnual', Number(e.target.value))
                            }
                            className="w-full pl-7 p-2 bg-canvas border border-border rounded-lg text-text font-mono font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-text-muted mt-0.5 block">
                          ₹{(activePackage.baseSalaryAnnual / 100000).toFixed(2)} LPA
                        </span>
                      </div>

                      <div>
                        <label className="block font-semibold text-text mb-1">
                          Target Performance Bonus (Annual INR):
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-text-muted font-bold">₹</span>
                          <input
                            type="number"
                            step={25000}
                            value={activePackage.performanceBonusAnnual}
                            onChange={(e) =>
                              handleUpdateActivePackage('performanceBonusAnnual', Number(e.target.value))
                            }
                            className="w-full pl-7 p-2 bg-canvas border border-border rounded-lg text-text font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-text-muted mt-0.5 block">
                          ₹{(activePackage.performanceBonusAnnual / 100000).toFixed(2)} LPA
                        </span>
                      </div>

                      <div>
                        <label className="block font-semibold text-text mb-1">
                          First-Year Joining / Signing Bonus (INR):
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-text-muted font-bold">₹</span>
                          <input
                            type="number"
                            step={25000}
                            value={activePackage.joiningBonusFirstYear}
                            onChange={(e) =>
                              handleUpdateActivePackage('joiningBonusFirstYear', Number(e.target.value))
                            }
                            className="w-full pl-7 p-2 bg-canvas border border-border rounded-lg text-text font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-text-muted mt-0.5 block">
                          Paid with month 1 or 2 salary
                        </span>
                      </div>

                      <div>
                        <label className="block font-semibold text-text mb-1">
                          Total 4-Year Stock Grant (ESOPs/RSUs INR):
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-text-muted font-bold">₹</span>
                          <input
                            type="number"
                            step={100000}
                            value={activePackage.stockGrantTotal4Yr}
                            onChange={(e) =>
                              handleUpdateActivePackage('stockGrantTotal4Yr', Number(e.target.value))
                            }
                            className="w-full pl-7 p-2 bg-canvas border border-border rounded-lg text-text font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-text-muted mt-0.5 block">
                          Vesting ~25% (₹{(activePackage.stockGrantTotal4Yr * 0.25 / 100000).toFixed(2)} LPA) / year
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Annual Headline Overview Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-surface border border-border rounded-xl">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Headline CTC (Annual)
                    </span>
                    <div className="text-xl font-extrabold text-text font-mono mt-1">
                      ₹{(deconstruction.grossCtcAnnual / 100000).toFixed(2)} LPA
                    </div>
                    <span className="text-[10px] text-text-muted">Includes stock, PF & perks</span>
                  </div>

                  <div className="p-4 bg-surface border border-l-4 border-l-emerald-500 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      First-Year Total Cash
                    </span>
                    <div className="text-xl font-extrabold text-emerald-600 font-mono mt-1">
                      ₹{(deconstruction.firstYearTotalCash / 100000).toFixed(2)} LPA
                    </div>
                    <span className="text-[10px] text-text-muted">Base + Bonus + Joining Bonus</span>
                  </div>

                  <div className="p-4 bg-surface border border-l-4 border-l-primary-500 rounded-xl">
                    <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider block">
                      4-Year Total Projected
                    </span>
                    <div className="text-xl font-extrabold text-primary-600 font-mono mt-1">
                      ₹{(deconstruction.fourYearTotalValue / 100000).toFixed(2)} LPA
                    </div>
                    <span className="text-[10px] text-text-muted">Accumulated 4-year earnings</span>
                  </div>
                </div>
              </div>

              {/* Right Column: In-Hand Paycard & Tax Regime Analysis (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Real Monthly In-Hand Card */}
                <Card className="border-primary-300 shadow-md">
                  <CardHeader className="bg-primary-50/50 border-b border-primary-100 pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" className="text-primary-800 bg-primary-100">
                        Monthly In-Hand Deposit
                      </Badge>
                      <span className="text-xs text-text-muted font-medium">
                        {activePackage.city} Hub
                      </span>
                    </div>
                    <div className="mt-3">
                      <span className="text-xs text-text-muted block">Estimated Monthly Bank Deposit:</span>
                      <div className="text-3xl font-extrabold text-primary-700 font-mono mt-1">
                        ₹{deconstruction.monthlyNetInHandNew.toLocaleString()}
                        <span className="text-xs font-normal text-text-muted"> / month</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 text-xs">
                    <div className="space-y-2 border-b border-border pb-3">
                      <div className="flex justify-between text-text">
                        <span className="font-medium">Monthly Gross Base Pay:</span>
                        <span className="font-bold font-mono">₹{deconstruction.monthlyGrossSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>Employee Provident Fund (EPF 12%):</span>
                        <span className="font-mono">- ₹{deconstruction.monthlyPfDeduction.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>Professional Tax (PT):</span>
                        <span className="font-mono">- ₹{deconstruction.monthlyProfessionalTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>Estimated Income Tax (TDS New Regime):</span>
                        <span className="font-mono">- ₹{deconstruction.monthlyIncomeTaxNew.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Tax Regime Comparison Box */}
                    <div className="p-3.5 bg-[#060b18]/80 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-xs">Tax Regime Recommendation</span>
                        <Badge
                          variant={deconstruction.recommendedRegime === 'NEW' ? 'success' : 'primary'}
                          className="text-[10px] font-bold"
                        >
                          {deconstruction.recommendedRegime} Tax Regime Best
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-[#0a0f1d] border border-white/10 rounded">
                          <span className="text-slate-400 block font-mono">New Regime Take-Home:</span>
                          <span className="font-bold text-lime-400 font-mono">
                            ₹{deconstruction.monthlyNetInHandNew.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-2 bg-[#0a0f1d] border border-white/10 rounded">
                          <span className="text-slate-400 block font-mono">Old Regime Take-Home:</span>
                          <span className="font-bold text-cyan-300 font-mono">
                            ₹{deconstruction.monthlyNetInHandOld.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Under the <strong className="text-white">{deconstruction.recommendedRegime} Regime</strong>, your annual tax is approximately{' '}
                        <strong className="text-white">₹{deconstruction.annualTaxLiabilityNew.toLocaleString()}</strong> ({deconstruction.effectiveTaxRateNew}% effective rate), saving you{' '}
                        <strong className="text-lime-300">₹{deconstruction.monthlyTaxDelta.toLocaleString()}/month</strong> over the alternative.
                      </p>
                    </div>

                    {/* City Cost of Living Context */}
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-emerald-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          {activePackage.city} Disposable Savings
                        </span>
                        <span className="font-mono text-emerald-400">CoL Index: {CITY_COL_PROFILES[activePackage.city].index}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Estimated Rent (~₹{CITY_COL_PROFILES[activePackage.city].averageRentMonthly.toLocaleString()}) + Living Expenses (~₹{CITY_COL_PROFILES[activePackage.city].averageLivingExpensesMonthly.toLocaleString()}) leaves approx.{' '}
                        <strong className="text-emerald-300 font-mono">
                          ₹
                          {Math.max(
                            0,
                            deconstruction.monthlyNetInHandNew -
                              (CITY_COL_PROFILES[activePackage.city].averageRentMonthly +
                                CITY_COL_PROFILES[activePackage.city].averageLivingExpensesMonthly)
                          ).toLocaleString()}
                        </strong>{' '}
                        per month in free discretionary savings.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-OFFER COMPARISON MATRIX */}
        {activeTab === 'comparison' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface border border-border rounded-xl">
              <div>
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary-600" />
                  Side-by-Side Offer Comparison & Purchasing Power Parity (PPP)
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Adjusted for city rent, local inflation, and four-year total equity wealth creation
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddCustomOffer}
                className="flex items-center gap-1.5 text-xs font-semibold shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Competing Offer
              </Button>
            </div>

            {/* Comparison Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisonScores.map((score) => {
                const pkg = packages.find((p) => p.id === score.packageId) || packages[0];
                const isTopRank = score.financialRank === 1;

                return (
                  <Card
                    key={score.packageId}
                    className={`relative overflow-hidden transition-all ${
                      isTopRank ? 'border-primary-500 shadow-md ring-2 ring-primary-500/20' : 'border-border'
                    }`}
                  >
                    {isTopRank && (
                      <div className="bg-primary-600 text-white text-[10px] font-extrabold uppercase tracking-widest text-center py-1">
                        Top Purchasing Power & Financial Fit
                      </div>
                    )}
                    <CardHeader className="pb-3 border-b border-white/10 bg-white/[0.02]">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={isTopRank ? 'primary' : 'neutral'}
                          className="font-bold text-xs"
                        >
                          Rank #{score.financialRank}
                        </Badge>
                        <span className="text-xs font-semibold text-text flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {score.city}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-text mt-1">{score.companyName}</h4>
                      <p className="text-xs text-text-muted">{pkg.roleTitle}</p>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4 text-xs">
                      {/* Fit Score Gauge */}
                      <div className="p-3 bg-[#060b18]/80 border border-white/10 rounded-xl flex items-center justify-between">
                        <span className="font-mono font-semibold text-slate-300">Overall Fit Score:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-extrabold text-lime-400 font-mono">
                            {score.overallFitScore}
                          </span>
                          <span className="text-slate-400 font-mono">/ 100</span>
                        </div>
                      </div>

                      {/* Cash Metrics */}
                      <div className="space-y-2 border-b border-border pb-3">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Headline Annual CTC:</span>
                          <span className="font-bold text-text font-mono">
                            ₹{(score.grossCtc / 100000).toFixed(1)} LPA
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">First-Year Cash:</span>
                          <span className="font-bold text-emerald-600 font-mono">
                            ₹{(score.firstYearCash / 100000).toFixed(1)} LPA
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">4-Year Total Projected:</span>
                          <span className="font-bold text-text font-mono">
                            ₹{(score.fourYearTotal / 100000).toFixed(1)} LPA
                          </span>
                        </div>
                      </div>

                      {/* Monthly In-Hand & Discretionary Savings */}
                      <div className="space-y-2 border-b border-border pb-3">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Monthly In-Hand Pay:</span>
                          <span className="font-extrabold text-primary-700 font-mono">
                            ₹{score.monthlyNetInHand.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Est. Monthly Savings:</span>
                          <span className="font-bold text-emerald-700 font-mono">
                            ₹{score.estimatedMonthlySavings.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>City Living Cost Index:</span>
                          <span className="font-mono">{score.colIndex}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedPackageId(pkg.id);
                            setActiveTab('deconstruction');
                          }}
                          className="w-full text-xs"
                        >
                          Edit & Deconstruct
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPackageId(pkg.id);
                            setActiveTab('negotiation');
                          }}
                          className="w-full text-xs"
                        >
                          Simulate Negotiation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: NEGOTIATION SIMULATOR & SCRIPT STUDIO */}
        {activeTab === 'negotiation' && (
          <div className="space-y-8">
            {/* Negotiation Controls Card */}
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-text flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary-600" />
                      Offer Negotiation Strategy & Talking Points Studio
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Targeting offer from <strong>{activePackage.companyName}</strong> (Current Base: ₹{(activePackage.baseSalaryAnnual / 100000).toFixed(1)} LPA)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Strategy Risk Level:</span>
                    <Badge
                      variant={
                        negotiationBundle.riskLevel === 'LOW'
                          ? 'success'
                          : negotiationBundle.riskLevel === 'MEDIUM'
                          ? 'warning'
                          : 'error'
                      }
                      className="font-bold text-xs"
                    >
                      {negotiationBundle.riskLevel} RISK
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Scenario Selection */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Select Your Negotiation Leverage Scenario:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setNegotiationScenario('COMPETING_OFFER')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        negotiationScenario === 'COMPETING_OFFER'
                          ? 'bg-primary-50/50 border-primary-500 ring-2 ring-primary-500/20'
                          : 'bg-surface border-border hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-text mb-1">1. Competing Concurrent Offer</div>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Best when you have an active offer from an industry peer and want to match or exceed base pay.
                      </p>
                    </button>

                    <button
                      onClick={() => setNegotiationScenario('EXCEPTIONAL_CREDENTIALS')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        negotiationScenario === 'EXCEPTIONAL_CREDENTIALS'
                          ? 'bg-primary-50/50 border-primary-500 ring-2 ring-primary-500/20'
                          : 'bg-surface border-border hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-text mb-1">2. Exceptional Verified Credentials</div>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Leverage top academic rank, high interview performance, and certified engineering competence.
                      </p>
                    </button>

                    <button
                      onClick={() => setNegotiationScenario('COST_OF_LIVING')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        negotiationScenario === 'COST_OF_LIVING'
                          ? 'bg-primary-50/50 border-primary-500 ring-2 ring-primary-500/20'
                          : 'bg-surface border-border hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-text mb-1">3. City Relocation & Living Costs</div>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Request base or signing bonus calibration to offset expensive rental deposits in tech zones.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Target Increase Slider */}
                <div className="space-y-2 p-4 bg-[#060b18]/80 border border-white/10 rounded-xl">
                  <div className="flex justify-between items-center text-xs font-semibold text-text">
                    <span className="font-mono text-slate-300">Target Base Salary Increase:</span>
                    <span className="font-mono text-base font-extrabold text-lime-400">
                      +{targetIncreasePercent}% (Target: ₹{(negotiationBundle.targetNewBase / 100000).toFixed(1)} LPA)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={25}
                    step={1}
                    value={targetIncreasePercent}
                    onChange={(e) => setTargetIncreasePercent(Number(e.target.value))}
                    className="w-full accent-lime-400 cursor-pointer"
                    aria-label="Target base salary increase percentage"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>+5% (Gentle Ask)</span>
                    <span>+12% (Standard Sweet Spot)</span>
                    <span>+25% (Aggressive Leverage)</span>
                  </div>
                </div>

                {/* Generated Professional Email Draft */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-text flex items-center gap-2">
                      <FileText className="w-4 h-4 text-lime-400" />
                      Generated Counter-Offer Email Draft
                    </h4>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopy(negotiationBundle.emailBody, 'email')}
                      className="text-xs font-mono flex items-center gap-1"
                    >
                      {copiedKey === 'email' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Email Draft</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="p-4 bg-[#060b18]/90 text-slate-200 rounded-xl border border-white/10 text-xs font-mono space-y-2">
                    <div className="text-slate-400 border-b border-white/10 pb-2">
                      <strong className="text-white">Subject:</strong> {negotiationBundle.emailSubject}
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed pt-1">
                      {negotiationBundle.emailBody}
                    </pre>
                  </div>
                </div>

                {/* Telephone Verbal Talking Points */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-text flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      Recruiter Call Dialogue & Talking Points
                    </h4>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        handleCopy(negotiationBundle.phoneTalkingPoints.join('\n\n'), 'phone')
                      }
                      className="text-xs flex items-center gap-1"
                    >
                      {copiedKey === 'phone' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Script
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {negotiationBundle.phoneTalkingPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategic Advice & Dos and Don'ts */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600" />
                    Tactical Negotiation Guidelines (Protecting Your Offer):
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-amber-950">
                    {negotiationBundle.strategicAdvice.map((adv, idx) => (
                      <li key={idx}>{adv}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
