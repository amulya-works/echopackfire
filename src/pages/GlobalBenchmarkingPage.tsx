import React, { useState, useEffect } from 'react';
import { GlobalBenchmark } from '../types.js';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Leaf,
  DollarSign,
  Layers,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';

export const GlobalBenchmarkingPage: React.FC = () => {
  const { activeProject, activeDesign } = useProject();
  const [benchmarks, setBenchmarks] = useState<GlobalBenchmark[]>([]);

  useEffect(() => {
    const cost = activeDesign?.estimated_cost || 17.80;
    const carbon = activeDesign?.carbon_footprint || 0.68;
    const protection = activeDesign?.protection_score || 94;
    const weight = activeDesign?.weight_g || 195;
    const volume = activeDesign ? (activeDesign.length_mm * activeDesign.width_mm * activeDesign.height_mm) / 1000000 : 1.85;
    const matEff = activeDesign?.material_efficiency_score || 86;

    fetch(`/api/benchmarks?cost=${cost}&carbon=${carbon}&protection=${protection}&weight=${weight}&volume=${volume.toFixed(2)}&matEff=${matEff}`)
      .then(res => res.json())
      .then(data => {
        if (data.benchmarks) setBenchmarks(data.benchmarks);
      })
      .catch(err => console.error('Failed to load benchmarks:', err));
  }, [activeDesign]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Section 20 Performance Index
            </span>
            <span className="text-xs text-slate-500 font-mono">Verified LCA Datasets & Demo Benchmarks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Global Benchmarking</h1>
          <p className="text-sm text-slate-600 mt-1">
            Triangulating your active packaging configuration against sector peer benchmarks and optimum eco-performers.
          </p>
        </div>

        {activeDesign && (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Evaluation Pack</span>
            <span className="font-bold text-slate-900 text-sm">{activeDesign.name}</span>
            <span className="text-emerald-600 font-medium block">
              Overall Score: {activeDesign.overall_score}/100
            </span>
          </div>
        )}
      </div>

      {/* Benchmark Data Notice */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Benchmark integrity policy: EchoPack never fabricates real industry statistics. Every benchmark below is explicitly designated as either <strong>VERIFIED LCA DATA</strong> (derived from accredited life-cycle inventory sources) or <strong>DEMO BENCHMARK DATA</strong> (derived from our standardized test pool).
        </p>
      </div>

      {/* Benchmark Comparison Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benchmarks.map((item, idx) => {
          const isBetter = item.status === 'Leading';
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      item.dataSource === 'VERIFIED LCA DATA'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.dataSource}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      isBetter ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isBetter ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
                    {item.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{item.metric}</h3>
                <span className="text-xs text-slate-500 block">{item.unit}</span>

                {/* 3-Column Comparative Visual */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Your Design</span>
                    <span className="text-base font-black text-emerald-900 mt-0.5 block">
                      {typeof item.yourDesign === 'number' ? item.yourDesign.toLocaleString() : item.yourDesign}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">Industry Avg</span>
                    <span className="text-base font-bold text-slate-700 mt-0.5 block">
                      {typeof item.industryBenchmark === 'number' ? item.industryBenchmark.toLocaleString() : item.industryBenchmark}
                    </span>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-200">
                    <span className="text-[10px] text-purple-800 font-bold uppercase block">Best Demo</span>
                    <span className="text-base font-bold text-purple-900 mt-0.5 block">
                      {typeof item.bestPerformingDemo === 'number' ? item.bestPerformingDemo.toLocaleString() : item.bestPerformingDemo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delta Callout */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Net Delta vs Industry:</span>
                <span className={`font-bold flex items-center gap-0.5 ${isBetter ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {isBetter ? '▼' : '▲'} {Math.abs(item.deltaPct)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
