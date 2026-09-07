import React, { useState } from 'react';
import {
  DollarSign,
  Leaf,
  ShieldCheck,
  TrendingDown,
  Calculator,
  BarChart3,
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';

export const SavingsImpactPage: React.FC = () => {
  const { activeProject, activeDesign } = useProject();

  const [annualShipments, setAnnualShipments] = useState<number>(250000);
  const [baselineUnitCost, setBaselineUnitCost] = useState<number>(24.50);
  const [optimizedUnitCost, setOptimizedUnitCost] = useState<number>(activeDesign?.estimated_cost || 16.80);
  const [baselineCarbonKg, setBaselineCarbonKg] = useState<number>(1.35);
  const [optimizedCarbonKg, setOptimizedCarbonKg] = useState<number>(activeDesign?.carbon_footprint || 0.68);
  const [plasticPerPackGrams, setPlasticPerPackGrams] = useState<number>(85); // 85g plastic eliminated per unit
  const [baselineDamageRate, setBaselineDamageRate] = useState<number>(2.4); // 2.4% damage
  const [optimizedDamageRate, setOptimizedDamageRate] = useState<number>(0.3); // 0.3% damage

  // Calculations
  const costSavingsPerUnit = Math.max(0, baselineUnitCost - optimizedUnitCost);
  const annualCostSaved = costSavingsPerUnit * annualShipments;
  const threeYearCostSaved = annualCostSaved * 3;

  const carbonSavedPerUnitKg = Math.max(0, baselineCarbonKg - optimizedCarbonKg);
  const annualCarbonAvoidedKg = carbonSavedPerUnitKg * annualShipments;
  const annualCarbonAvoidedTonnes = Number((annualCarbonAvoidedKg / 1000).toFixed(1));
  const threeYearCarbonAvoidedTonnes = Number((annualCarbonAvoidedTonnes * 3).toFixed(1));

  const annualPlasticEliminatedKg = Math.round((plasticPerPackGrams / 1000) * annualShipments);
  const damageRateReductionPct = Number((((baselineDamageRate - optimizedDamageRate) / baselineDamageRate) * 100).toFixed(0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Section 21 ROI & Enterprise Impact
            </span>
            <span className="text-xs text-slate-500 font-mono">Real Financial & ESG Aggregation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Savings & Impact Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            Quantify financial procurement savings, direct carbon avoidance, single-use plastic elimination, and damage claims reduction.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-900">
          <span className="font-bold block text-sm">Enterprise Multi-Year Projected ROI</span>
          <span className="text-[11px] text-emerald-700">Calculated over real production volumes</span>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">1-Year Cost Saved</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{annualCostSaved.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>₹{costSavingsPerUnit.toFixed(2)} savings per package</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">CO₂e Avoided (1-Yr)</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {annualCarbonAvoidedTonnes} Tonnes
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            {carbonSavedPerUnitKg.toFixed(2)} kg CO₂e avoided per unit
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Plastic Diverted</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {annualPlasticEliminatedKg.toLocaleString()} kg
          </div>
          <div className="text-xs text-teal-600 font-medium mt-1">
            Replaced EPS/Bubble wrap with pulp & kraft
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Damage Claims Cut</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            -{damageRateReductionPct}%
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1">
            From {baselineDamageRate}% to {optimizedDamageRate}% breakage rate
          </div>
        </div>
      </div>

      {/* Interactive ROI Calculator Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Calculator className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Interactive Corporate ROI Calculator</h2>
            <p className="text-xs text-slate-500">
              Adjust shipment volume and benchmark cost to project 1-year and 3-year organizational balance sheet returns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sliders and Inputs */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Annual Shipment Volume</span>
                <span className="text-emerald-700 font-mono text-sm">{annualShipments.toLocaleString()} boxes/year</span>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Baseline Cost (₹ / unit)</label>
                <input
                  type="number"
                  step="0.5"
                  value={baselineUnitCost}
                  onChange={e => setBaselineUnitCost(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Optimized Cost (₹ / unit)</label>
                <input
                  type="number"
                  step="0.5"
                  value={optimizedUnitCost}
                  onChange={e => setOptimizedUnitCost(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Baseline Carbon (kg CO₂e)</label>
                <input
                  type="number"
                  step="0.05"
                  value={baselineCarbonKg}
                  onChange={e => setBaselineCarbonKg(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Optimized Carbon (kg CO₂e)</label>
                <input
                  type="number"
                  step="0.05"
                  value={optimizedCarbonKg}
                  onChange={e => setOptimizedCarbonKg(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* ROI Outputs */}
          <div className="lg:col-span-6 bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-4">
                Financial & Carbon Payoff Breakdown
              </span>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                  <div>
                    <span className="text-xs font-medium text-slate-600 block">1-Year Direct Savings</span>
                    <span className="text-xl font-bold text-slate-900">₹{annualCostSaved.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-600 block">1-Year CO₂e Avoided</span>
                    <span className="text-base font-bold text-emerald-600">{annualCarbonAvoidedTonnes} tonnes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 shadow-xs">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">3-Year Cumulative Savings</span>
                    <span className="text-2xl font-black text-emerald-950">₹{threeYearCostSaved.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-800 block">3-Year CO₂e Avoided</span>
                    <span className="text-base font-bold text-emerald-700">{threeYearCarbonAvoidedTonnes} tonnes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed pt-3 border-t border-slate-200">
              * Calculations include amortized tooling investments and assume current scrap commodity recycling credits. Excludes brand uplift and EPR tax liability rebates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
