import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
} from 'recharts';
import {
  BarChart3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  DollarSign,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';
import { OptimizationResult, ParetoPoint } from '../types.js';

export const CompareOptimizePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject } = useProject();

  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOptimization = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/optimization/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject?.id,
          designs: activeProject?.designs,
          weights: activeProject?.latest_scenario?.weights,
          constraints: activeProject?.latest_scenario?.constraints,
        }),
      });

      if (res.ok) {
        const data: OptimizationResult = await res.json();
        setOptimization(data);
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimization();
  }, [activeProject?.id]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ParetoPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
          <div className="font-bold text-emerald-400">{data.name}</div>
          <div className="text-slate-300">Material: {data.material}</div>
          <div className="flex justify-between gap-4">
            <span>Cost:</span>
            <strong className="font-mono">₹{data.cost.toFixed(2)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Carbon Footprint:</span>
            <strong className="font-mono">{data.carbon.toFixed(2)} kg CO₂e</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Protection Score:</span>
            <strong className="font-mono">{data.protection}/100</strong>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-700 text-emerald-300 font-semibold">
            <span>Pareto Status:</span>
            <span>{data.isParetoOptimal ? '★ Non-Dominated' : 'Dominated'}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Pareto Trade-off Frontier & Optimization Engine</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
              Multi-Objective Solvers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing mathematical Pareto dominance between Cost and Carbon Footprint for {activeProject?.name}.
          </p>
        </div>

        <button
          onClick={() => navigate('/recommendation')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-colors"
        >
          <Award className="w-4 h-4" />
          <span>View Final Recommendation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Calculating Pareto frontier curves...</span>
        </div>
      ) : (
        <>
          {/* Pareto Frontier Chart & Best Solution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pareto Chart (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pareto Frontier: Cost vs. Carbon Trade-off</h3>
                  <p className="text-[11px] text-slate-500">
                    Solutions on the lower-left frontier cannot improve carbon without increasing cost, and vice versa.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  ★ Optimal Frontier
                </span>
              </div>

              {/* Chart Canvas */}
              <div className="h-[340px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={optimization?.paretoFrontier || []}
                    margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      dataKey="cost"
                      name="Unit Cost"
                      unit="₹"
                      domain={['dataMin - 1', 'dataMax + 2']}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: 'Unit Cost (₹)', position: 'bottom', offset: 0, fontSize: 11, fill: '#475569' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="carbon"
                      name="Carbon Footprint"
                      unit=" kg"
                      domain={['dataMin - 0.2', 'dataMax + 0.3']}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: 'Carbon (kg CO₂e)', angle: -90, position: 'left', offset: 0, fontSize: 11, fill: '#475569' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Pareto Curve connecting optimal points */}
                    <Line
                      type="monotone"
                      dataKey="carbon"
                      stroke="#059669"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 6, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                    <Scatter
                      name="Candidates"
                      data={optimization?.paretoFrontier}
                      fill="#0f172a"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Green line = Non-dominated Pareto frontier</span>
                <span>Hover over markers for multi-criteria telemetry</span>
              </div>
            </div>

            {/* Best Solution Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {optimization && (
                <div className="bg-emerald-50/80 p-6 rounded-2xl border-2 border-emerald-500/50 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Dominant Optimization Pick
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                      Score: {optimization.decisionScore}/100
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {optimization.bestSolution.name}
                    </h3>
                    <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                      {optimization.summaryExplanation}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-xl border border-emerald-200">
                      <span className="text-[11px] text-slate-500">Unit Cost</span>
                      <p className="text-lg font-bold text-slate-900 font-mono">
                        ₹{optimization.bestSolution.estimated_cost.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-200">
                      <span className="text-[11px] text-slate-500">Carbon Footprint</span>
                      <p className="text-lg font-bold text-emerald-700 font-mono">
                        {optimization.bestSolution.carbon_footprint.toFixed(2)} kg
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-200">
                      <span className="text-[11px] text-slate-500">Drop Protection</span>
                      <p className="text-lg font-bold text-sky-700 font-mono">
                        {optimization.bestSolution.protection_score}/100
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-200">
                      <span className="text-[11px] text-slate-500">Recyclability</span>
                      <p className="text-lg font-bold text-slate-900 font-mono">
                        {optimization.bestSolution.recyclability}%
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/recommendation')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <span>View Executive Justification Sheet</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Top Alternatives & Rejections (Section 17) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Alternatives (6 cols) */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Top Feasible Alternatives</h3>
              <div className="space-y-3">
                {optimization?.topAlternatives.map((alt, idx) => (
                  <div
                    key={alt.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                          {idx + 2}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{alt.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{alt.material_name}</p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-mono font-bold text-slate-900">₹{alt.estimated_cost.toFixed(2)}</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="font-mono text-emerald-700">{alt.carbon_footprint.toFixed(2)} kg</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {alt.protection_score}/100 Prot. • {alt.recyclability}% Recycled
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejected Solutions Table with Explicit Reasons (6 cols) */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Rejected Candidates ({optimization?.rejectedSolutions.length || 0})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                These designs failed hard business constraints (budget ceiling, minimum protection, or carbon caps).
              </p>

              <div className="space-y-3">
                {optimization?.rejectedSolutions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                    All candidates satisfied constraints under baseline conditions.
                  </div>
                ) : (
                  optimization?.rejectedSolutions.map((rej, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{rej.design.name}</h4>
                        <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Non-Compliant
                        </span>
                      </div>
                      <div className="text-xs text-amber-900 space-y-0.5">
                        {rej.reasons.map((r, rIdx) => (
                          <div key={rIdx}>• {r}</div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
