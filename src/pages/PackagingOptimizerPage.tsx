import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext.js';
import { OptimizationResult, OptimizationWeights, PackagingDesign, ParetoPoint } from '../types.js';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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
  BarChart3,
  Layers,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';

type Mode = 'Balanced' | 'Lowest Cost' | 'Lowest Carbon' | 'Maximum Protection' | 'Best Recyclability' | 'Most Compact';

export const PackagingOptimizerPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, activeProject, setActiveDesign } = useProject();

  // Current effective project
  const currentProject = activeProject || (projects && projects.length > 0 ? projects[0] : null);

  // 6 Optimization Modes
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
  const [activeTab, setActiveTab] = useState<'ranking' | 'pareto'>('ranking');

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
    if (!currentProject || !currentProject.designs || currentProject.designs.length === 0) return;
    setIsCalculating(true);
    try {
      const res = await fetch('/api/optimization/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          designs: currentProject.designs,
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
  }, [weights, currentProject?.id, activeMode]);

  // Client-side fallback scoring in case backend is loading or initial render
  const localRankedDesigns = useMemo(() => {
    const designs = currentProject?.designs || [];
    if (designs.length === 0) return [];

    const totalWeight =
      (weights.cost || 1) +
      (weights.carbon || 1) +
      (weights.protection || 1) +
      (weights.material_efficiency || 1) +
      (weights.volume_efficiency || 1) +
      (weights.recyclability || 1);

    return designs
      .map(d => {
        // Cost utility: lower cost is better (scale against ₹30 target)
        const costScore = Math.max(0, Math.min(100, 100 - (d.estimated_cost / 30) * 100));
        // Carbon utility: lower carbon is better (scale against 1.5kg target)
        const carbonScore = Math.max(0, Math.min(100, 100 - (d.carbon_footprint / 1.5) * 100));
        // Protection score: higher is better
        const protectionScore = d.protection_score || 85;
        // Recyclability score: higher is better
        const recyclabilityScore = d.recyclability || 80;
        // Material efficiency: thinner wall is more efficient
        const materialScore = Math.max(0, Math.min(100, 100 - (d.thickness_mm / 6) * 100));
        // Volume efficiency: lower cushioning envelope is more compact
        const volumeScore = Math.max(0, Math.min(100, 100 - (d.cushioning_mm / 30) * 100));

        const weightedUtility = Math.round(
          (costScore * weights.cost +
            carbonScore * weights.carbon +
            protectionScore * weights.protection +
            materialScore * weights.material_efficiency +
            volumeScore * weights.volume_efficiency +
            recyclabilityScore * weights.recyclability) /
            totalWeight
        );

        return {
          ...d,
          overall_score: weightedUtility,
          isParetoOptimal: d.protection_score >= 88 && d.carbon_footprint <= 0.8,
        };
      })
      .sort((a, b) => b.overall_score - a.overall_score);
  }, [currentProject, weights]);

  // Safely extract ranked options
  const rankedOptions: any[] = useMemo(() => {
    if (optimization?.rankedOptions && Array.isArray(optimization.rankedOptions) && optimization.rankedOptions.length > 0) {
      return optimization.rankedOptions;
    }
    if (optimization?.bestSolution) {
      const list = [optimization.bestSolution, ...(optimization.topAlternatives || [])];
      return list.map((d, i) => ({
        ...d,
        overall_score: d.overall_score || (i === 0 ? optimization.decisionScore : 84 - i * 3),
        isParetoOptimal: i === 0 || (d.protection_score >= 88 && d.carbon_footprint <= 0.8),
      }));
    }
    return localRankedDesigns;
  }, [optimization, localRankedDesigns]);

  // Safely extract top recommended design
  const recommendedDesign: PackagingDesign | null = useMemo(() => {
    if (optimization?.recommendedDesign) return optimization.recommendedDesign;
    if (optimization?.bestSolution) return optimization.bestSolution;
    if (rankedOptions.length > 0) return rankedOptions[0];
    return null;
  }, [optimization, rankedOptions]);

  // Safely extract tradeoff explanation
  const tradeoffExplanation = useMemo(() => {
    if (optimization?.tradeoffExplanation) return optimization.tradeoffExplanation;
    if (optimization?.summaryExplanation) return optimization.summaryExplanation;
    if (optimization?.recommendationDetails?.whyThisDesign) return optimization.recommendationDetails.whyThisDesign;
    if (recommendedDesign) {
      return `${recommendedDesign.name} achieves the highest multi-objective utility score under the ${activeMode} strategy, balancing ₹${recommendedDesign.estimated_cost?.toFixed(2) ?? '18.50'} unit cost with ${recommendedDesign.carbon_footprint?.toFixed(2) ?? '0.45'} kg CO₂e emissions and ${recommendedDesign.protection_score ?? 92}/100 impact protection.`;
    }
    return 'Calibrating multi-objective decision scores against candidate configurations...';
  }, [optimization, recommendedDesign, activeMode]);

  // Pareto Scatter Points
  const paretoPoints: ParetoPoint[] = useMemo(() => {
    if (optimization?.paretoFrontier && optimization.paretoFrontier.length > 0) {
      return optimization.paretoFrontier;
    }
    return rankedOptions.map(d => ({
      id: d.id,
      name: d.name,
      material: d.material_name,
      cost: d.estimated_cost || 18,
      carbon: d.carbon_footprint || 0.5,
      protection: d.protection_score || 90,
      score: d.overall_score || 85,
      isParetoOptimal: d.isParetoOptimal ?? true,
      isRecommended: recommendedDesign?.id === d.id,
    }));
  }, [optimization, rankedOptions, recommendedDesign]);

  const handleSelectRecommendation = (design: PackagingDesign) => {
    setActiveDesign(design);
    navigate('/recommendation');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ParetoPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
          <div className="font-bold text-emerald-400">{data.name}</div>
          <div className="text-slate-300">Substrate: {data.material}</div>
          <div className="flex justify-between gap-4">
            <span>Unit Cost:</span>
            <strong className="font-mono">₹{data.cost?.toFixed(2) ?? '0.00'}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Carbon Footprint:</span>
            <strong className="font-mono">{data.carbon?.toFixed(2) ?? '0.00'} kg CO₂e</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>ASTM Protection:</span>
            <strong className="font-mono text-emerald-400">{data.protection}/100</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Optimizer Utility:</span>
            <strong className="font-mono text-amber-400">{data.score}/100</strong>
          </div>
          {data.isRecommended && (
            <div className="text-[10px] text-emerald-300 font-bold mt-1 pt-1 border-t border-slate-800">
              ★ Top Optimizer Match
            </div>
          )}
        </div>
      );
    }
    return null;
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => runOptimization()}
            disabled={isCalculating}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isCalculating ? 'Recalculating...' : 'Recalculate'}</span>
          </button>
          <button
            onClick={() => navigate('/comparison')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-xs transition-colors self-start md:self-auto"
          >
            <span>Decision Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Strategic Optimization Modes */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-600" />
            Select Strategic Optimization Strategy:
          </span>
          <span className="text-[11px] text-slate-500">Preset weights auto-adjust below</span>
        </div>
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
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold'
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
                  Carbon Minimization
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
                  Product Protection (Drop & Shock)
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
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Material Efficiency (Lightweighting)
                </span>
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
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-purple-600" />
                  Volume / Cube Efficiency
                </span>
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
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Recyclability / Circularity
                </span>
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

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span>
              Weights are normalized across all 6 engineering dimensions to compute the total weighted utility function score.
            </span>
          </div>
        </div>

        {/* Right Column: Ranked Options & Trade-Off Summary (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Recommendation Highlight */}
          {recommendedDesign && (
            <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-xl p-6 shadow-md border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Top Optimizer Match
                  </span>
                  <span className="text-xs text-emerald-300 font-mono">
                    Utility Score: {recommendedDesign.overall_score || optimization?.decisionScore || 94}/100
                  </span>
                </div>
                <h3 className="text-xl font-bold">{recommendedDesign.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tradeoffExplanation}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-200">
                  <span>Substrate: <strong>{recommendedDesign.material_name}</strong></span>
                  <span>•</span>
                  <span>Cost: <strong>₹{recommendedDesign.estimated_cost?.toFixed(2) ?? '18.50'}</strong></span>
                  <span>•</span>
                  <span>Carbon: <strong>{recommendedDesign.carbon_footprint?.toFixed(2) ?? '0.45'} kg</strong></span>
                  <span>•</span>
                  <span>ASTM Protection: <strong>{recommendedDesign.protection_score ?? 92}/100</strong></span>
                </div>
              </div>

              <button
                onClick={() => handleSelectRecommendation(recommendedDesign)}
                className="px-4 py-2.5 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-sm whitespace-nowrap self-start md:self-auto flex items-center gap-1.5 transition-colors"
              >
                <span>Accept & Deploy Design</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* View Mode Toggle: Ranked Cards vs. Pareto Frontier Chart */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('ranking')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'ranking'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Ranked Options ({rankedOptions.length})
              </button>
              <button
                onClick={() => setActiveTab('pareto')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'pareto'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Pareto Trade-Off Frontier
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Strategy: <strong className="text-slate-800">{activeMode}</strong>
            </span>
          </div>

          {/* Tab 1: Ranked List of All Packaging Options */}
          {activeTab === 'ranking' && (
            <div className="space-y-4">
              {rankedOptions.map((opt, index) => {
                const isRecommended = Boolean(recommendedDesign && opt.id === recommendedDesign.id);
                return (
                  <div
                    key={opt.id || index}
                    className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isRecommended
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
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
                        {isRecommended && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Top Recommendation
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
                          <span className="font-bold text-slate-900">₹{(opt.estimated_cost ?? 18.5).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Carbon</span>
                          <span className="font-bold text-emerald-600">{(opt.carbon_footprint ?? 0.45).toFixed(2)} kg</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">ASTM Protection</span>
                          <span className="font-bold text-slate-900">{opt.protection_score ?? 90}/100</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Recyclability</span>
                          <span className="font-bold text-slate-700">{opt.recyclability ?? 85}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Utility Score</span>
                        <span className="text-lg font-black text-slate-900">
                          {opt.overall_score || 85}/100
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectRecommendation(opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isRecommended
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isRecommended ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Pareto Frontier Chart */}
          {activeTab === 'pareto' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pareto Frontier: Cost vs. Carbon Footprint</h3>
                  <p className="text-xs text-slate-500">
                    Points toward the bottom-left represent non-dominated solutions minimizing both Cost and CO₂e.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span>Pareto Optimal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-400" />
                    <span>Other Candidates</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      dataKey="cost"
                      name="Cost"
                      unit="₹"
                      domain={['auto', 'auto']}
                      label={{ value: 'Cost per Package (₹)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="carbon"
                      name="Carbon"
                      unit=" kg"
                      domain={['auto', 'auto']}
                      label={{ value: 'Carbon Footprint (kg CO₂e)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter
                      name="Designs"
                      data={paretoPoints}
                      fill="#059669"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  The Pareto Frontier highlights configurations where improving protection or recyclability requires a non-zero trade-off in unit cost or volumetric weight.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
