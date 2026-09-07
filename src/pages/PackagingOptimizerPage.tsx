import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext.js';
import { OptimizationResult, OptimizationWeights, PackagingDesign } from '../types.js';
import {
  Sliders,
  Sparkles,
  Award,
  ArrowRight,
  RefreshCw,
  TrendingDown,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Maximize2,
  RotateCcw,
  Zap,
} from 'lucide-react';

export const PackagingOptimizerPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, setActiveDesign } = useProject();

  // 6 Optimization Modes
  type Mode = 'Balanced' | 'Lowest Cost' | 'Lowest Carbon' | 'Maximum Protection' | 'Best Recyclability' | 'Most Compact';
  const [activeMode, setActiveMode] = useState<Mode>('Balanced');

  // Interactive weights (0-100%)
  const [weights, setWeights] = useState<OptimizationWeights>({
    cost: 20,
    carbon: 20,
    protection: 25,
    material_efficiency: 15,
    volume_efficiency: 10,
    recyclability: 10,
  });

  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Apply predefined preset weights based on mode
  const handleModeChange = (mode: Mode) => {
    setActiveMode(mode);
    switch (mode) {
      case 'Lowest Cost':
        setWeights({ cost: 60, carbon: 10, protection: 15, material_efficiency: 5, volume_efficiency: 5, recyclability: 5 });
        break;
      case 'Lowest Carbon':
        setWeights({ cost: 10, carbon: 55, protection: 15, material_efficiency: 10, volume_efficiency: 5, recyclability: 5 });
        break;
      case 'Maximum Protection':
        setWeights({ cost: 10, carbon: 10, protection: 60, material_efficiency: 5, volume_efficiency: 5, recyclability: 10 });
        break;
      case 'Best Recyclability':
        setWeights({ cost: 10, carbon: 20, protection: 15, material_efficiency: 10, volume_efficiency: 5, recyclability: 40 });
        break;
      case 'Most Compact':
        setWeights({ cost: 15, carbon: 15, protection: 15, material_efficiency: 15, volume_efficiency: 35, recyclability: 5 });
        break;
      case 'Balanced':
      default:
        setWeights({ cost: 20, carbon: 20, protection: 25, material_efficiency: 15, volume_efficiency: 10, recyclability: 10 });
        break;
    }
  };

  const runOptimization = async () => {
    if (!activeProject) return;
    setIsCalculating(true);
    try {
      const res = await fetch('/api/optimization/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject.id,
          designs: activeProject.designs,
          weights,
          mode: activeMode,
        }),
      });

      if (res.ok) {
        const data: OptimizationResult = await res.json();
        setOptimization(data);
      }
    } catch (err) {
      console.error('Failed to run optimization:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    runOptimization();
  }, [weights, activeProject?.id]);

  const handleSelectRecommendation = (design: PackagingDesign) => {
    setActiveDesign(design);
    navigate('/recommendation');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Section 11 Multi-Objective Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">Weighted Utility Function & Pareto Ranks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Packaging Optimizer</h1>
          <p className="text-sm text-slate-600 mt-1">
            Simultaneously evaluates Cost, Carbon, ASTM Protection, Volume density, and Circularity against your priorities.
          </p>
        </div>

        <button
          onClick={() => navigate('/comparison')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-xs transition-colors self-start md:self-auto"
        >
          <span>Open Decision Matrix</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6 Optimization Modes Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <span className="text-xs font-bold text-slate-700 block mb-2.5">
          Select Strategic Optimization Mode:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(
            [
              'Balanced',
              'Lowest Cost',
              'Lowest Carbon',
              'Maximum Protection',
              'Best Recyclability',
              'Most Compact',
            ] as Mode[]
          ).map(mode => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                activeMode === mode
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Interactive Sliders + Ranked Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Objective Weight Sliders (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Customize Objective Weights
            </h2>
            <button
              onClick={() => handleModeChange('Balanced')}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
              title="Reset weights to equal distribution"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Cost Weight */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  Cost Reduction
                </span>
                <span className="font-mono text-slate-900">{weights.cost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.cost}
                onChange={e => setWeights({ ...weights, cost: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Carbon Weight */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Carbon Footprint (ESG)
                </span>
                <span className="font-mono text-slate-900">{weights.carbon}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.carbon}
                onChange={e => setWeights({ ...weights, carbon: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Protection Weight */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Product Protection (ASTM)
                </span>
                <span className="font-mono text-slate-900">{weights.protection}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.protection}
                onChange={e => setWeights({ ...weights, protection: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Material Efficiency */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Material Efficiency</span>
                <span className="font-mono text-slate-900">{weights.material_efficiency}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.material_efficiency}
                onChange={e => setWeights({ ...weights, material_efficiency: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Volume Efficiency */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Volume / Cube Efficiency</span>
                <span className="font-mono text-slate-900">{weights.volume_efficiency}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.volume_efficiency}
                onChange={e => setWeights({ ...weights, volume_efficiency: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Recyclability */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Recyclability / Circularity</span>
                <span className="font-mono text-slate-900">{weights.recyclability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.recyclability}
                onChange={e => setWeights({ ...weights, recyclability: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Total utility weights are automatically normalized across all 6 engineering objectives.
          </div>
        </div>

        {/* Right Column: Ranked Options & Trade-Off Summary (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Recommendation Highlight */}
          {optimization?.recommendedDesign && (
            <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-xl p-6 shadow-md border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Top Optimizer Match
                  </span>
                  <span className="text-xs text-emerald-300 font-mono">
                    Utility Score: {optimization.recommendedDesign.overall_score}/100
                  </span>
                </div>
                <h3 className="text-xl font-bold">{optimization.recommendedDesign.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {optimization.tradeoffExplanation}
                </p>
              </div>

              <button
                onClick={() => handleSelectRecommendation(optimization.recommendedDesign)}
                className="px-4 py-2.5 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-sm whitespace-nowrap self-start md:self-auto"
              >
                Accept & Deploy Design
              </button>
            </div>
          )}

          {/* Ranked List of All Packaging Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Ranked Candidate Packaging Configurations ({optimization?.rankedOptions.length || 0})
            </h3>

            {optimization?.rankedOptions.map((opt, index) => {
              const isRecommended = opt.id === optimization.recommendedDesign.id;
              return (
                <div
                  key={opt.id}
                  className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isRecommended
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{opt.name}</h4>
                      {opt.isParetoOptimal && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Pareto Optimal
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500">
                      Material: <strong className="text-slate-700">{opt.material_name}</strong> • {opt.thickness_mm}mm wall • {opt.cushioning_mm}mm cushion
                    </div>

                    {/* Key Metrics Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Cost</span>
                        <span className="font-bold text-slate-900">₹{opt.estimated_cost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Carbon</span>
                        <span className="font-bold text-emerald-600">{opt.carbon_footprint.toFixed(2)} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">ASTM Protection</span>
                        <span className="font-bold text-slate-900">{opt.protection_score}/100</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Recyclability</span>
                        <span className="font-bold text-slate-700">{opt.recyclability}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Utility Score</span>
                      <span className="text-lg font-black text-slate-900">{opt.overall_score}/100</span>
                    </div>

                    <button
                      onClick={() => handleSelectRecommendation(opt)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
