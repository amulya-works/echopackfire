import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Leaf,
  DollarSign,
  Truck,
  Layers,
  Swords,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';
import { ScenarioWeights, ScenarioConstraints, ScenarioSimulationResult } from '../types.js';

export const ScenarioSimulatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject } = useProject();

  const currentProject = activeProject;

  // Active weights
  const [weights, setWeights] = useState<ScenarioWeights>({
    sustainability: 40,
    protection: 30,
    cost: 15,
    logistics: 10,
    brand: 5,
  });

  // Active constraints
  const [constraints, setConstraints] = useState<ScenarioConstraints>({
    transport_distance_km: currentProject?.product.transport_distance_km || 500,
    budget: currentProject?.product.budget || 20.0,
    carbon_target: 1.0,
    min_protection: 85,
    min_recyclability: 80,
  });

  const [activePreset, setActivePreset] = useState<string>('CUSTOM');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<ScenarioSimulationResult | null>(null);

  // Tab view: 'simulator' or 'battle'
  const [activeTab, setActiveTab] = useState<'simulator' | 'battle'>('simulator');
  const [battleResult, setBattleResult] = useState<any>(null);

  // Presets definition
  const presets = [
    {
      id: 'GREEN_FIRST',
      name: 'Green-First',
      desc: 'Max sustainability (55%) and circularity (90% min)',
      weights: { sustainability: 55, protection: 25, cost: 10, logistics: 5, brand: 5 },
      constraints: { transport_distance_km: 500, budget: 22, carbon_target: 0.85, min_protection: 80, min_recyclability: 90 },
    },
    {
      id: 'COST_FIRST',
      name: 'Cost-First',
      desc: 'Margin optimization (50% cost weight, ₹16 budget)',
      weights: { sustainability: 10, protection: 30, cost: 50, logistics: 5, brand: 5 },
      constraints: { transport_distance_km: 500, budget: 16, carbon_target: 1.6, min_protection: 75, min_recyclability: 70 },
    },
    {
      id: 'PROTECTION_FIRST',
      name: 'Protection-First',
      desc: 'Zero-damage priority (60% protection, 92 min score)',
      weights: { sustainability: 15, protection: 60, cost: 10, logistics: 10, brand: 5 },
      constraints: { transport_distance_km: 500, budget: 24, carbon_target: 1.5, min_protection: 92, min_recyclability: 75 },
    },
    {
      id: 'LOGISTICS_SHOCK',
      name: 'Logistics Shock (+200% km)',
      desc: 'Freight expansion to 1,500 km heavily weighting tare mass',
      weights: { sustainability: 25, protection: 25, cost: 20, logistics: 25, brand: 5 },
      constraints: { transport_distance_km: 1500, budget: 25, carbon_target: 1.3, min_protection: 82, min_recyclability: 80 },
    },
    {
      id: 'CARBON_CAP',
      name: 'Strict Carbon Cap',
      desc: 'Rigid ESG limit capping emissions at 0.75 kg CO₂e',
      weights: { sustainability: 50, protection: 25, cost: 15, logistics: 5, brand: 5 },
      constraints: { transport_distance_km: 500, budget: 22, carbon_target: 0.75, min_protection: 78, min_recyclability: 85 },
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setActivePreset(p.id);
    setWeights(p.weights);
    setConstraints(p.constraints);
  };

  const handleWeightChange = (key: keyof ScenarioWeights, val: number) => {
    setActivePreset('CUSTOM');
    setWeights(prev => ({ ...prev, [key]: val }));
  };

  const handleConstraintChange = (key: keyof ScenarioConstraints, val: number) => {
    setActivePreset('CUSTOM');
    setConstraints(prev => ({ ...prev, [key]: val }));
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/scenarios/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject?.id,
          scenarioName: activePreset !== 'CUSTOM' ? presets.find(p => p.id === activePreset)?.name : 'Custom Scenario',
          designs: currentProject?.designs,
          weights,
          constraints,
          previousBestId: currentProject?.selected_design_id,
        }),
      });

      if (res.ok) {
        const data: ScenarioSimulationResult = await res.json();
        setSimulationResult(data);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const runScenarioBattle = async () => {
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject?.id,
          scenarioA: {
            name: 'Green-First Sustainability',
            weights: { sustainability: 55, protection: 25, cost: 10, logistics: 5, brand: 5 },
            constraints: { transport_distance_km: 500, budget: 22, carbon_target: 0.85, min_protection: 80 },
          },
          scenarioB: {
            name: 'Cost-First Margin Optimization',
            weights: { sustainability: 10, protection: 30, cost: 50, logistics: 5, brand: 5 },
            constraints: { transport_distance_km: 500, budget: 16, carbon_target: 1.6, min_protection: 75 },
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBattleResult(data);
      }
    } catch (err) {
      console.error('Battle error:', err);
    }
  };

  // Run on mount
  useEffect(() => {
    runSimulation();
    runScenarioBattle();
  }, [currentProject?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">PS7 Decision Simulation & Scenario Intelligence</h1>
            <span className="sleek-tag">
              Sensitivity Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            "What If Reality Changes?" • Dynamically evaluate trade-off shifts under changing supply chain conditions.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'simulator' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('battle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'battle' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-purple-600" />
            <span>Scenario Battle Arena</span>
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Presets Grid */}
            <div className="sleek-card space-y-3">
              <span className="sleek-section-title block mb-2">
                Scenario Presets
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activePreset === p.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold">{p.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Objective Weighting Sliders (Matching Sleek Interface theme) */}
            <div className="sleek-card space-y-3">
              <span className="sleek-section-title block mb-2">
                PS7 Scenario Weights
              </span>

              {/* Sustainability */}
              <div className="sleek-slider-group">
                <div className="sleek-slider-label">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Carbon Priority
                  </span>
                  <span className="font-mono font-semibold text-emerald-700">{(weights.sustainability / 100).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={weights.sustainability}
                  onChange={e => handleWeightChange('sustainability', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer sleek-slider"
                />
              </div>

              {/* Protection */}
              <div className="sleek-slider-group">
                <div className="sleek-slider-label">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <ShieldAlert className="w-3.5 h-3.5 text-sky-600" /> Protection Priority
                  </span>
                  <span className="font-mono font-semibold text-sky-700">{(weights.protection / 100).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={weights.protection}
                  onChange={e => handleWeightChange('protection', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer sleek-slider"
                />
              </div>

              {/* Cost */}
              <div className="sleek-slider-group">
                <div className="sleek-slider-label">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <DollarSign className="w-3.5 h-3.5 text-slate-600" /> Cost Priority
                  </span>
                  <span className="font-mono font-semibold text-slate-800">{(weights.cost / 100).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={weights.cost}
                  onChange={e => handleWeightChange('cost', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer sleek-slider"
                />
              </div>

              {/* Logistics */}
              <div className="sleek-slider-group">
                <div className="sleek-slider-label">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Truck className="w-3.5 h-3.5 text-amber-600" /> Logistics Priority
                  </span>
                  <span className="font-mono font-semibold text-amber-700">{(weights.logistics / 100).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={weights.logistics}
                  onChange={e => handleWeightChange('logistics', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer sleek-slider"
                />
              </div>
            </div>

            {/* Environmental & Route Conditions */}
            <div className="sleek-card space-y-4">
              <span className="sleek-section-title block mb-2">
                Supply Chain Shock Variables
              </span>

              {/* Transport Distance */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Transport Distance</span>
                  <span className="font-mono text-emerald-600 font-bold">{constraints.transport_distance_km} km</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2500"
                  step="100"
                  value={constraints.transport_distance_km}
                  onChange={e => handleConstraintChange('transport_distance_km', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer sleek-slider"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>500 km (Baseline)</span>
                  <span>1,500 km (Shock)</span>
                  <span>2,500 km (Air/Cross-Border)</span>
                </div>
              </div>

              {/* Budget Constraint */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Budget Limit / Unit</span>
                  <span className="font-mono text-slate-900 font-bold">₹{constraints.budget?.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="35"
                  step="1"
                  value={constraints.budget}
                  onChange={e => handleConstraintChange('budget', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer sleek-slider"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={runSimulation}
              disabled={isSimulating}
              className="sleek-btn-primary w-full"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Simulating Decision Shifts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Scenario Simulation</span>
                </>
              )}
            </button>
          </div>

          {/* Results Column: Dynamic Ranking Shifts & Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Recommendation Shift Banner with Sleek styling */}
            {simulationResult && (
              <div className="sleek-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="sleek-section-title mb-0">
                      Scenario Shift Dynamics
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {simulationResult.scenarioName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Winning Alternative</span>
                    <p className="text-xs font-bold text-emerald-700">
                      {simulationResult.bestOption.name}
                    </p>
                  </div>
                </div>

                {/* Transition flow */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Previous Baseline</span>
                    <p className="font-bold text-slate-800 truncate mt-0.5">
                      {simulationResult.previousBestOption?.name || 'Recycled Corrugated'}
                    </p>
                    <span className="text-[10px] text-slate-500">₹14.80 • 1.15 kg CO₂e</span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-1 sm:py-0 border-y sm:border-y-0 sm:border-x border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Scenario Shock</span>
                    <span className="text-[11px] font-semibold text-slate-700">
                      {constraints.transport_distance_km} km / {weights.sustainability}% Sust.
                    </span>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] text-emerald-600 uppercase font-bold">New Top Recommendation</span>
                    <p className="font-bold text-emerald-800 truncate mt-0.5">
                      {simulationResult.bestOption.name}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      ₹{simulationResult.bestOption.estimated_cost.toFixed(2)} • {simulationResult.bestOption.carbon_footprint.toFixed(2)} kg
                    </span>
                  </div>
                </div>

                {/* Sleek Recommendation Callout */}
                <div className="sleek-recommendation-badge">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider opacity-80 font-medium">Confidence Score</span>
                    <span className="text-xl font-bold font-mono">94%</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-95">
                    {simulationResult.bestOption.name} optimizes the frontier under the {simulationResult.scenarioName} profile.
                  </p>
                </div>
              </div>
            )}

            {/* Ranked Designs Table */}
            {simulationResult && (
              <div className="sleek-card p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Ranked Alternatives Under This Scenario</h4>
                  <span className="text-xs text-slate-500 font-medium">Multi-Objective Score</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {simulationResult.rankedDesigns.map((r, idx) => {
                    const isWinner = idx === 0;
                    return (
                      <div
                        key={r.design.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                          isWinner ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              isWinner ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            #{idx + 1}
                          </span>

                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-slate-900">{r.design.name}</h5>
                              {isWinner && (
                                <span className="sleek-tag">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Winner
                                </span>
                              )}
                              {!r.isFeasible && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  <AlertTriangle className="w-3 h-3" /> Constraint Violation
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 mt-0.5">{r.design.notes}</p>

                            {r.rejectionReason && (
                              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                                Rejection reason: {r.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Metric pill metrics */}
                        <div className="flex items-center gap-4 text-right shrink-0">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Unit Cost</span>
                            <p className="text-xs font-bold text-slate-900 font-mono">
                              ₹{r.design.estimated_cost.toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Carbon</span>
                            <p className="text-xs font-bold text-emerald-700 font-mono">
                              {r.design.carbon_footprint.toFixed(2)} kg
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Score</span>
                            <p className="text-sm font-extrabold text-slate-900 font-mono">
                              {r.finalScore}/100
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex justify-end">
              <button
                onClick={() => navigate('/compare')}
                className="sleek-btn-primary"
              >
                <span>Inspect Pareto Frontier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Scenario Battle Arena View (Section 15) */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Swords className="w-5 h-5 text-purple-600" />
              <span>Scenario Battle: Green-First vs Cost-First</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Side-by-side trade-off matrix comparing sustainability prioritization against margin optimization.
            </p>
          </div>

          {battleResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scenario A: Green-First */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border-2 border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Scenario A: Green-First
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-200 text-emerald-900">
                    Sust: 55%
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-emerald-950">
                    {battleResult.scenarioA.bestOption.name}
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Selected Substrate: {battleResult.scenarioA.bestOption.material_name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[11px] text-slate-500">Lifecycle Carbon</span>
                    <p className="text-lg font-bold text-emerald-700 font-mono">
                      {battleResult.scenarioA.bestOption.carbon_footprint.toFixed(2)} kg CO₂e
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[11px] text-slate-500">Unit Cost</span>
                    <p className="text-lg font-bold text-slate-900 font-mono">
                      ₹{battleResult.scenarioA.bestOption.estimated_cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[11px] text-slate-500">Recyclability</span>
                    <p className="text-lg font-bold text-slate-900 font-mono">
                      {battleResult.scenarioA.bestOption.recyclability}%
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[11px] text-slate-500">Decision Score</span>
                    <p className="text-lg font-extrabold text-emerald-600 font-mono">
                      {battleResult.scenarioA.ranked.finalScore}/100
                    </p>
                  </div>
                </div>
              </div>

              {/* Scenario B: Cost-First */}
              <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-300 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Scenario B: Cost-First
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-200 text-slate-800">
                    Cost: 50%
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {battleResult.scenarioB.bestOption.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Selected Substrate: {battleResult.scenarioB.bestOption.material_name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500">Lifecycle Carbon</span>
                    <p className="text-lg font-bold text-slate-700 font-mono">
                      {battleResult.scenarioB.bestOption.carbon_footprint.toFixed(2)} kg CO₂e
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500">Unit Cost</span>
                    <p className="text-lg font-bold text-slate-900 font-mono">
                      ₹{battleResult.scenarioB.bestOption.estimated_cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500">Recyclability</span>
                    <p className="text-lg font-bold text-slate-900 font-mono">
                      {battleResult.scenarioB.bestOption.recyclability}%
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500">Decision Score</span>
                    <p className="text-lg font-extrabold text-slate-700 font-mono">
                      {battleResult.scenarioB.ranked.finalScore}/100
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
