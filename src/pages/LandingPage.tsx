import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShieldCheck,
  Sliders,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Leaf,
  DollarSign,
  TrendingDown,
  Box,
} from 'lucide-react';
import { Packaging3DViewer } from '../components/Packaging3DViewer.js';
import { useProject } from '../context/ProjectContext.js';

export const LandingPage: React.FC = () => {
  const { launchDemo } = useProject();

  const capabilities = [
    {
      icon: Box,
      title: '3D Packaging Studio',
      desc: 'Parametric box generation with dynamic cushioning thickness, real-time material swatches, and exploded assembly inspection.',
      tag: 'PS11 Optimizer',
    },
    {
      icon: ShieldCheck,
      title: 'Virtual Drop Testing',
      desc: 'Physics-based impact simulation modeling deceleration, deformation percentage, and structural pass/fail criteria.',
      tag: 'ASTM D5276',
    },
    {
      icon: Sliders,
      title: 'Scenario Simulator',
      desc: 'Interactive "What If Reality Changes?" engine simulating transport expansions, carbon caps, and raw material inflation.',
      tag: 'PS7 Intelligence',
    },
    {
      icon: Leaf,
      title: 'Lifecycle Carbon Engine',
      desc: 'Deterministic cradle-to-grave emissions accounting across material extraction, processing, and multi-modal transport.',
      tag: 'ISO 14044',
    },
    {
      icon: DollarSign,
      title: 'Supply Chain Cost Engine',
      desc: 'Itemized breakdown of raw substrate cost, tooling amortization, and volume-weighted freight rates.',
      tag: 'Real-Time Calc',
    },
    {
      icon: BarChart3,
      title: 'Pareto Trade-off Frontier',
      desc: 'Multi-criteria mathematical dominance analysis balancing cost efficiency against carbon minimization.',
      tag: 'Pareto Optimal',
    },
    {
      icon: Sparkles,
      title: 'AI Packaging Advisor',
      desc: 'Engineering conversational agent powered by Gemini 2.5 Flash, strictly grounded in your simulation metrics.',
      tag: 'Grounded AI',
    },
    {
      icon: Layers,
      title: 'Scenario Battle Arena',
      desc: 'Side-by-side scorecard comparison evaluating Green-First vs Cost-First trade-offs for C-suite sign-off.',
      tag: 'Executive Ready',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Integrating PS11 Optimizer & PS7 Scenario Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Sustainable Packaging{' '}
                <span className="text-emerald-600">Decision Intelligence</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Design it. See it. Test it. Simulate it. Optimize it.{' '}
                <span className="font-semibold text-slate-800">Decide with mathematical certainty.</span>
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link
                  to="/projects/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all cursor-pointer"
                >
                  <span>Start Designing</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={launchDemo}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Explore Smart Bottle Demo</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 text-left">
                <div>
                  <div className="text-xl font-bold text-slate-900">-32%</div>
                  <div className="text-xs text-slate-500 font-medium">Avg. Carbon Cut</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">94 / 100</div>
                  <div className="text-xs text-slate-500 font-medium">Drop Protection</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">0 Mock Data</div>
                  <div className="text-xs text-slate-500 font-medium">Deterministic FEA</div>
                </div>
              </div>
            </div>

            {/* Right Interactive 3D Visual with Floating Telemetry */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* 3D Box & Bottle Component */}
                <Packaging3DViewer
                  length_mm={80}
                  width_mm={80}
                  height_mm={250}
                  thickness_mm={3.2}
                  cushioning_mm={20}
                  materialName="Hybrid Recycled Packaging"
                  materialColor="#2d6a4f"
                  productType="bottle"
                  className="w-full h-[420px] rounded-3xl shadow-2xl border-2 border-slate-200/80"
                />

                {/* Floating Metric Badge 1: Carbon */}
                <div className="absolute -top-4 -left-4 sm:left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3 animate-bounce-subtle">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Lifecycle Carbon</div>
                    <div className="text-sm font-extrabold text-slate-900">
                      0.82 kg CO₂e <span className="text-emerald-600 text-xs font-bold">(-32%)</span>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Badge 2: Protection Score */}
                <div className="absolute -bottom-5 right-2 sm:right-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Virtual Drop Test</div>
                    <div className="text-sm font-extrabold text-slate-900">
                      94 / 100 <span className="text-sky-600 text-xs font-bold">(PASS)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Problem & Solution Workflow */}
      <section className="py-16 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
              The Packaging Dilemma
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              Packaging decisions always involve competing objectives
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Minimizing material drops cost and carbon, but risks catastrophic product breakage. Maximizing cushioning guarantees zero damage, but explodes freight expenses. EcoPack resolves the multi-variable trade-off mathematically.
            </p>
          </div>

          {/* Workflow Stepper Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
            {[
              { step: '01', title: 'DESIGN', desc: 'Specify product geometry, weight, & fragility' },
              { step: '02', title: 'SEE', desc: 'Inspect parametric 3D structure & cushions' },
              { step: '03', title: 'TEST', desc: 'Virtual ASTM D5276 drop simulation' },
              { step: '04', title: 'SIMULATE', desc: 'What-if distance & price shocks' },
              { step: '05', title: 'OPTIMIZE', desc: 'Pareto multi-objective frontier' },
              { step: '06', title: 'DECIDE', desc: 'Executive recommendation with reasons' },
            ].map((w, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative">
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {w.step}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-2">{w.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise-Grade Packaging Intelligence
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Every button, slider, and calculation connects to genuine backend microservices with real engineering physics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 hover:border-emerald-500/50 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                      {c.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to optimize your packaging decisions?
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Experience the full decision intelligence workflow on our pre-configured Smart Bottle project or configure your own custom product.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/projects/new"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors"
            >
              Build a Better Package
            </Link>
            <button
              onClick={launchDemo}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Run Hackathon Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-500 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-400">EcoPack Intelligence Platform</span>
            <span>• Hackathon Edition</span>
          </div>
          <div>© {new Date().getFullYear()} EcoPack Systems. Engineered for commercial circularity.</div>
        </div>
      </footer>
    </div>
  );
};
