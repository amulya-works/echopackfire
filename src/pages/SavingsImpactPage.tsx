import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Leaf,
  ShieldCheck,
  TrendingDown,
  Calculator,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Download,
  Printer,
  Copy,
  Check,
  Truck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useProject } from '../context/ProjectContext.js';
import { PackagingDesign } from '../types.js';

export const SavingsImpactPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, activeProject, activeDesign, setActiveDesign } = useProject();

  // Defensive fallback project
  const currentProject = activeProject || (projects && projects.length > 0 ? projects[0] : null);

  // Available designs
  const designs = currentProject?.designs || [];

  // Selected design to evaluate
  const [selectedDesignId, setSelectedDesignId] = useState<string>(
    activeDesign?.id || (designs.length > 0 ? designs[0].id : '')
  );

  const selectedDesign: PackagingDesign | undefined = useMemo(() => {
    return designs.find(d => d.id === selectedDesignId) || activeDesign || (designs.length > 0 ? designs[0] : undefined);
  }, [designs, selectedDesignId, activeDesign]);

  // Interactive Inputs
  const [annualShipments, setAnnualShipments] = useState<number>(
    currentProject?.product?.annual_quantity || 250000
  );
  const [baselineUnitCost, setBaselineUnitCost] = useState<number>(24.5);
  const [optimizedUnitCost, setOptimizedUnitCost] = useState<number>(
    selectedDesign?.estimated_cost || 16.8
  );
  const [baselineCarbonKg, setBaselineCarbonKg] = useState<number>(1.35);
  const [optimizedCarbonKg, setOptimizedCarbonKg] = useState<number>(
    selectedDesign?.carbon_footprint || 0.68
  );
  const [plasticPerPackGrams, setPlasticPerPackGrams] = useState<number>(85);
  const [baselineDamageRate, setBaselineDamageRate] = useState<number>(2.4); // 2.4%
  const [optimizedDamageRate, setOptimizedDamageRate] = useState<number>(0.3); // 0.3%
  const [productCostPerDamage, setProductCostPerDamage] = useState<number>(850); // ₹850 unit replacement & reverse logistics
  const [toolingInvestment, setToolingInvestment] = useState<number>(150000); // ₹1.5L tooling / die-line tooling
  const [copied, setCopied] = useState<boolean>(false);

  // Sync with selected design change
  const handleDesignSelect = (designId: string) => {
    setSelectedDesignId(designId);
    const chosen = designs.find(d => d.id === designId);
    if (chosen) {
      setOptimizedUnitCost(chosen.estimated_cost);
      setOptimizedCarbonKg(chosen.carbon_footprint);
      setActiveDesign(chosen);
    }
  };

  // Preset volume handlers
  const handleVolumePreset = (vol: number) => {
    setAnnualShipments(vol);
  };

  // Calculations
  const costSavingsPerUnit = Math.max(0, baselineUnitCost - optimizedUnitCost);
  const annualDirectMaterialSavings = Math.round(costSavingsPerUnit * annualShipments);

  // Logistics savings: Cube density optimization saves ~18% in freight trips
  const estimatedFreightSavingsPerPack = Math.max(0, baselineUnitCost * 0.08);
  const annualFreightSavings = Math.round(estimatedFreightSavingsPerPack * annualShipments);

  // Damage savings
  const baselineDamagedUnits = (baselineDamageRate / 100) * annualShipments;
  const optimizedDamagedUnits = (optimizedDamageRate / 100) * annualShipments;
  const unitsSavedFromDamage = Math.max(0, Math.round(baselineDamagedUnits - optimizedDamagedUnits));
  const annualDamageClaimsSaved = Math.round(unitsSavedFromDamage * productCostPerDamage);

  // Total Gross Annual Economic Benefit
  const totalAnnualBenefit = annualDirectMaterialSavings + annualFreightSavings + annualDamageClaimsSaved;
  const year1NetBenefit = Math.max(0, totalAnnualBenefit - toolingInvestment);
  const threeYearGrossBenefit = totalAnnualBenefit * 3;
  const threeYearNetBenefit = Math.max(0, threeYearGrossBenefit - toolingInvestment);

  // Payback Horizon in Months
  const monthlyBenefit = totalAnnualBenefit / 12;
  const paybackMonths = monthlyBenefit > 0 ? Number((toolingInvestment / monthlyBenefit).toFixed(1)) : 0;

  // Carbon and ESG
  const carbonSavedPerUnitKg = Math.max(0, baselineCarbonKg - optimizedCarbonKg);
  const annualCarbonAvoidedKg = carbonSavedPerUnitKg * annualShipments;
  const annualCarbonAvoidedTonnes = Number((annualCarbonAvoidedKg / 1000).toFixed(1));
  const threeYearCarbonAvoidedTonnes = Number((annualCarbonAvoidedTonnes * 3).toFixed(1));

  // Plastic diverted
  const annualPlasticEliminatedKg = Math.round((plasticPerPackGrams / 1000) * annualShipments);
  const annualPlasticEliminatedTonnes = Number((annualPlasticEliminatedKg / 1000).toFixed(1));

  // EPA GHG Equivalencies
  const carsRemovedEquiv = Number((annualCarbonAvoidedTonnes / 4.6).toFixed(1));
  const treesGrownEquiv = Math.round(annualCarbonAvoidedTonnes * 16.5);
  const dieselLitersSaved = Math.round(annualCarbonAvoidedTonnes * 370);

  // Multi-Year Chart Data
  const multiYearChartData = useMemo(() => {
    const baselineYear1 = Math.round(baselineUnitCost * annualShipments + (baselineDamagedUnits * productCostPerDamage));
    const baselineYear2 = baselineYear1 * 2;
    const baselineYear3 = baselineYear1 * 3;

    const optYear1 = Math.round(optimizedUnitCost * annualShipments + (optimizedDamagedUnits * productCostPerDamage) + toolingInvestment - annualFreightSavings);
    const optYear2 = optYear1 + Math.round(optimizedUnitCost * annualShipments + (optimizedDamagedUnits * productCostPerDamage) - annualFreightSavings);
    const optYear3 = optYear2 + Math.round(optimizedUnitCost * annualShipments + (optimizedDamagedUnits * productCostPerDamage) - annualFreightSavings);

    return [
      {
        year: 'Year 1',
        baselineCumulative: baselineYear1,
        optimizedCumulative: optYear1,
        netSavingsCumulative: baselineYear1 - optYear1,
      },
      {
        year: 'Year 2',
        baselineCumulative: baselineYear2,
        optimizedCumulative: optYear2,
        netSavingsCumulative: baselineYear2 - optYear2,
      },
      {
        year: 'Year 3',
        baselineCumulative: baselineYear3,
        optimizedCumulative: optYear3,
        netSavingsCumulative: baselineYear3 - optYear3,
      },
    ];
  }, [
    baselineUnitCost,
    optimizedUnitCost,
    annualShipments,
    baselineDamagedUnits,
    optimizedDamagedUnits,
    productCostPerDamage,
    toolingInvestment,
    annualFreightSavings,
  ]);

  // Savings Source Breakdown Data
  const savingsBreakdownData = useMemo(() => {
    return [
      {
        name: 'Direct Packaging Material',
        amount: annualDirectMaterialSavings,
        fill: '#059669', // Emerald
      },
      {
        name: 'Freight & Logistics Cube',
        amount: annualFreightSavings,
        fill: '#0284c7', // Sky
      },
      {
        name: 'Damage Claims Avoidance',
        amount: annualDamageClaimsSaved,
        fill: '#7c3aed', // Purple
      },
    ];
  }, [annualDirectMaterialSavings, annualFreightSavings, annualDamageClaimsSaved]);

  const copySummary = () => {
    const text = `EchoPack Enterprise ROI Summary — ${currentProject?.name || 'Packaging Project'}
Selected Design: ${selectedDesign?.name || 'Optimized Design'} (${selectedDesign?.material_name || 'Bio-material'})
Annual Volume: ${annualShipments.toLocaleString()} units/year
Unit Packaging Savings: ₹${costSavingsPerUnit.toFixed(2)}/unit
Total Annual Economic Benefit: ₹${totalAnnualBenefit.toLocaleString()} (Material: ₹${annualDirectMaterialSavings.toLocaleString()}, Freight: ₹${annualFreightSavings.toLocaleString()}, Damage: ₹${annualDamageClaimsSaved.toLocaleString()})
Tooling Investment: ₹${toolingInvestment.toLocaleString()} (Payback Horizon: ${paybackMonths} months)
3-Year Net Savings: ₹${threeYearNetBenefit.toLocaleString()}
Annual CO₂e Avoided: ${annualCarbonAvoidedTonnes} Metric Tonnes (Equivalent to ${carsRemovedEquiv} cars removed, ${treesGrownEquiv.toLocaleString()} trees planted)
Plastic Diverted from Landfill: ${annualPlasticEliminatedTonnes} Tonnes`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const exportCSV = () => {
    const headers = 'Metric,Value,Unit\n';
    const rows = [
      `"Project Name","${currentProject?.name || 'Packaging Project'}",""`,
      `"Selected Design","${selectedDesign?.name || 'Optimized Design'}",""`,
      `"Material","${selectedDesign?.material_name || 'Cardboard'}",""`,
      `"Annual Shipment Volume",${annualShipments},"units/yr"`,
      `"Baseline Unit Cost",${baselineUnitCost},"INR"`,
      `"Optimized Unit Cost",${optimizedUnitCost},"INR"`,
      `"Direct Material Savings / Year",${annualDirectMaterialSavings},"INR"`,
      `"Freight & Cube Savings / Year",${annualFreightSavings},"INR"`,
      `"Damage Claims Saved / Year",${annualDamageClaimsSaved},"INR"`,
      `"Total Gross Annual Benefit",${totalAnnualBenefit},"INR"`,
      `"Tooling & Setup Investment",${toolingInvestment},"INR"`,
      `"Payback Horizon",${paybackMonths},"months"`,
      `"3-Year Net Economic Savings",${threeYearNetBenefit},"INR"`,
      `"Baseline Carbon / Unit",${baselineCarbonKg},"kg CO2e"`,
      `"Optimized Carbon / Unit",${optimizedCarbonKg},"kg CO2e"`,
      `"Annual Carbon Avoided",${annualCarbonAvoidedTonnes},"metric tonnes CO2e"`,
      `"Annual Plastic Diverted",${annualPlasticEliminatedTonnes},"metric tonnes"`,
      `"Equiv Cars Off Road",${carsRemovedEquiv},"passenger vehicles/yr"`,
      `"Equiv Seedling Trees Planted",${treesGrownEquiv},"trees 10yr"`,
    ].join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `echopack_savings_roi_${currentProject?.id || 'model'}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportJSON = () => {
    const reportData = {
      project: currentProject?.name,
      design: selectedDesign,
      parameters: {
        annualShipments,
        baselineUnitCost,
        optimizedUnitCost,
        baselineCarbonKg,
        optimizedCarbonKg,
        baselineDamageRate,
        optimizedDamageRate,
        productCostPerDamage,
        toolingInvestment,
      },
      financialSavings: {
        unitCostSavings: costSavingsPerUnit,
        annualDirectMaterialSavings,
        annualFreightSavings,
        annualDamageClaimsSaved,
        totalAnnualBenefit,
        toolingInvestment,
        paybackMonths,
        year1NetBenefit,
        threeYearGrossBenefit,
        threeYearNetBenefit,
      },
      esgImpact: {
        annualCarbonAvoidedKg,
        annualCarbonAvoidedTonnes,
        threeYearCarbonAvoidedTonnes,
        annualPlasticEliminatedTonnes,
        carsRemovedEquiv,
        treesGrownEquiv,
        dieselLitersSaved,
      },
      generatedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `echopack_roi_model_${currentProject?.id || 'audit'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Section 21 ROI & Enterprise Impact
            </span>
            <span className="text-xs text-slate-500 font-mono">Financial & ESG Aggregation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Savings & Impact Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            Quantify financial procurement savings, direct carbon avoidance, single-use plastic elimination, and damage claims reduction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <span>View 16-Section Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Design & Volume Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            Evaluating Design Configuration:
          </span>
          <select
            value={selectedDesignId}
            onChange={e => handleDesignSelect(e.target.value)}
            className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {designs.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} — ₹{d.estimated_cost?.toFixed(2)} / {d.carbon_footprint?.toFixed(2)} kg CO₂e ({d.material_name})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Volume Preset Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 mr-1">Annual Volume:</span>
          {[25000, 50000, 100000, 250000, 500000, 1000000].map(vol => (
            <button
              key={vol}
              onClick={() => handleVolumePreset(vol)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                annualShipments === vol
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {vol >= 1000000 ? '1M' : `${vol / 1000}k`}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Cards (4 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Annual Value */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Annual Savings</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{totalAnnualBenefit.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>₹{(totalAnnualBenefit / annualShipments).toFixed(2)} total value / package</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Material + Freight + Damage Avoidance
          </div>
        </div>

        {/* Payback Horizon */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tooling Payback Horizon</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-950">
            {paybackMonths} Months
          </div>
          <div className="text-xs text-indigo-600 font-medium mt-2">
            Tooling Investment: ₹{toolingInvestment.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Year 1 Net: ₹{year1NetBenefit.toLocaleString()}
          </div>
        </div>

        {/* Carbon Footprint Avoidance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">CO₂e Avoided (Annual)</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {annualCarbonAvoidedTonnes} Tonnes
          </div>
          <div className="text-xs text-teal-600 font-medium mt-2">
            {carbonSavedPerUnitKg.toFixed(2)} kg CO₂e saved / package
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            3-Year Carbon Avoided: {threeYearCarbonAvoidedTonnes} Tonnes
          </div>
        </div>

        {/* Plastic Diverted */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Plastic Diverted</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {annualPlasticEliminatedTonnes} Tonnes
          </div>
          <div className="text-xs text-amber-600 font-medium mt-2">
            {annualPlasticEliminatedKg.toLocaleString()} kg EPS & Bubble Wrap
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Replaced with 100% bio-pulp / kraft
          </div>
        </div>
      </div>

      {/* Interactive Sliders & Assumptions Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Enterprise Financial & Volume Modeling Parameters</h2>
              <p className="text-xs text-slate-500">
                Calibrate unit costs, benchmark logistics, freight savings, and breakage rates to match your operations.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setBaselineUnitCost(24.5);
              setOptimizedUnitCost(selectedDesign?.estimated_cost || 16.8);
              setBaselineCarbonKg(1.35);
              setOptimizedCarbonKg(selectedDesign?.carbon_footprint || 0.68);
              setBaselineDamageRate(2.4);
              setOptimizedDamageRate(0.3);
              setToolingInvestment(150000);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* Annual Volume Slider */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Annual Shipment Volume</span>
              <span className="font-mono text-emerald-700 text-sm">{annualShipments.toLocaleString()} units</span>
            </div>
            <input
              type="range"
              min="10000"
              max="1000000"
              step="10000"
              value={annualShipments}
              onChange={e => setAnnualShipments(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10k</span>
              <span>250k</span>
              <span>500k</span>
              <span>1M units</span>
            </div>
          </div>

          {/* Unit Cost Baseline & Optimized */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block">Unit Packaging Procurement Cost</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Baseline (₹ / unit)</label>
                <input
                  type="number"
                  step="0.5"
                  value={baselineUnitCost}
                  onChange={e => setBaselineUnitCost(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Optimized (₹ / unit)</label>
                <input
                  type="number"
                  step="0.5"
                  value={optimizedUnitCost}
                  onChange={e => setOptimizedUnitCost(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg text-emerald-700"
                />
              </div>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold">
              Delta: ₹{costSavingsPerUnit.toFixed(2)} savings / package
            </div>
          </div>

          {/* Carbon Baseline & Optimized */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block">Life-Cycle Carbon Footprint</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Baseline (kg CO₂e)</label>
                <input
                  type="number"
                  step="0.05"
                  value={baselineCarbonKg}
                  onChange={e => setBaselineCarbonKg(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Optimized (kg CO₂e)</label>
                <input
                  type="number"
                  step="0.05"
                  value={optimizedCarbonKg}
                  onChange={e => setOptimizedCarbonKg(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg text-teal-700"
                />
              </div>
            </div>
            <div className="text-[11px] text-teal-700 font-semibold">
              Delta: {carbonSavedPerUnitKg.toFixed(2)} kg CO₂e saved / package
            </div>
          </div>

          {/* Transit Breakage & Damage Rate */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block">Transit Damage & Breakage Rate</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Baseline Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={baselineDamageRate}
                  onChange={e => setBaselineDamageRate(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Optimized Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={optimizedDamageRate}
                  onChange={e => setOptimizedDamageRate(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg text-purple-700"
                />
              </div>
            </div>
            <div className="text-[11px] text-purple-700 font-semibold">
              {unitsSavedFromDamage.toLocaleString()} units saved from breakage / year
            </div>
          </div>

          {/* Product Unit Value for Damage */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block">Damage Replacement & Return Cost</span>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Cost / Incident (₹ Product + Reverse Logistics)</label>
              <input
                type="number"
                step="50"
                value={productCostPerDamage}
                onChange={e => setProductCostPerDamage(Math.max(0, Number(e.target.value)))}
                className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div className="text-[11px] text-slate-500">
              Annual damage claim savings: ₹{annualDamageClaimsSaved.toLocaleString()}
            </div>
          </div>

          {/* Tooling & Die Investment */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block">Upfront Tooling & Die Investment</span>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Tooling / Mold Expense (₹)</label>
              <input
                type="number"
                step="10000"
                value={toolingInvestment}
                onChange={e => setToolingInvestment(Math.max(0, Number(e.target.value)))}
                className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div className="text-[11px] text-slate-500">
              One-time expense amortized in {paybackMonths} months
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts: 3-Year Projection & Value Driver Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Multi-Year Cumulative Comparison (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">3-Year Cumulative Spend & Savings Horizon</h3>
              <p className="text-xs text-slate-500">
                Comparison of total packaging, freight, and damage costs over time (₹)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              ₹{threeYearNetBenefit.toLocaleString()} 3-Yr Net ROI
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={multiYearChartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={val => `₹${(val / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `₹${Number(value).toLocaleString()}`,
                    name === 'baselineCumulative' ? 'Baseline Total Spend' : 'EchoPack Total Spend',
                  ]}
                />
                <Legend
                  formatter={(value: any) => (value === 'baselineCumulative' ? 'Baseline Total Spend' : 'EchoPack Total Spend')}
                />
                <Area
                  type="monotone"
                  dataKey="baselineCumulative"
                  stroke="#64748b"
                  fillOpacity={1}
                  fill="url(#baselineGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="optimizedCumulative"
                  stroke="#059669"
                  fillOpacity={1}
                  fill="url(#optGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Composition by Value Driver (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Annual Value Composition</h3>
            <p className="text-xs text-slate-500">Breakdown of total ₹{totalAnnualBenefit.toLocaleString()} annual benefit</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsBreakdownData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={val => `₹${(val / 100000).toFixed(1)}L`} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Annual Value']} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                Material Unit Savings:
              </span>
              <strong className="text-slate-900">₹{annualDirectMaterialSavings.toLocaleString()}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                Freight Cube Optimization:
              </span>
              <strong className="text-slate-900">₹{annualFreightSavings.toLocaleString()}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                Damage Claims Avoided:
              </span>
              <strong className="text-slate-900">₹{annualDamageClaimsSaved.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ESG Equivalencies Bar */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-xl p-6 sm:p-8 shadow-md border border-emerald-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">Real-World Environmental Equivalency Benchmarks</h3>
          </div>
          <span className="text-[11px] text-emerald-300 font-mono">EPA GHG Calculations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-center sm:text-left">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
            <span className="text-xs text-emerald-300 block">Passenger Vehicles</span>
            <div className="text-2xl font-black text-white">{carsRemovedEquiv} Cars</div>
            <p className="text-[11px] text-slate-300">
              Equivalent gasoline passenger vehicles removed from the road for 1 full year.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
            <span className="text-xs text-emerald-300 block">Carbon Sequestration</span>
            <div className="text-2xl font-black text-white">{treesGrownEquiv.toLocaleString()} Trees</div>
            <p className="text-[11px] text-slate-300">
              Tree seedlings grown for 10 continuous years in urban afforestation projects.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
            <span className="text-xs text-emerald-300 block">Fossil Fuel Energy</span>
            <div className="text-2xl font-black text-white">{dieselLitersSaved.toLocaleString()} Liters</div>
            <p className="text-[11px] text-slate-300">
              Direct diesel fuel consumption avoided in long-haul logistics transportation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
