import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, ChevronLeft, Check, X, ArrowRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';

export const DemoWorkflowModal: React.FC = () => {
  const navigate = useNavigate();
  const { demoStep, setDemoStep, activeProject } = useProject();

  if (demoStep === 0) return null;

  const DEMO_STEPS = [
    {
      step: 1,
      title: 'Step 1: Smart Bottle Project',
      desc: 'Demo project loaded: vacuum stainless bottle with IoT sensor (Medium fragility, ₹20 budget).',
      route: '/dashboard',
      actionText: 'View 3 Packaging Options',
    },
    {
      step: 2,
      title: 'Step 2: 4 Packaging Alternatives',
      desc: 'Corrugated Box, Molded Fiber, Recycled Polymer, and Hybrid Packaging with real computed costs & carbon.',
      route: '/dashboard',
      actionText: 'Open in 3D Studio',
    },
    {
      step: 3,
      title: 'Step 3: 3D Packaging Studio',
      desc: 'Interactive Three.js studio: inspect interior bottle, toggle exploded view, adjust cushioning sliders.',
      route: '/studio',
      actionText: 'Test in Virtual Lab',
    },
    {
      step: 4,
      title: 'Step 4: Virtual Drop Test Lab',
      desc: 'Simulate 1.5m drop on concrete corner. Watch impact dynamics and protection rating (94/100).',
      route: '/drop-test',
      actionText: 'Run Scenario Simulator',
    },
    {
      step: 5,
      title: 'Step 5: Scenario Simulator (PS7)',
      desc: 'What if reality changes? Adjust sustainability, protection, and cost priority sliders.',
      route: '/simulator',
      actionText: 'Apply Logistics Shock (1500km)',
    },
    {
      step: 6,
      title: 'Step 6: Transport Distance Shock',
      desc: 'Simulate freight distance expansion to 1,500 km. Observe real-time weight & carbon penalty shifts!',
      route: '/simulator',
      actionText: 'View Pareto Frontier',
    },
    {
      step: 7,
      title: 'Step 7: Pareto Trade-off Frontier',
      desc: 'Multi-objective Cost vs Carbon curve with non-dominated candidate solutions.',
      route: '/compare',
      actionText: 'View Optimization Decisions',
    },
    {
      step: 8,
      title: 'Step 8: Constraint Verification',
      desc: 'Filter feasible vs rejected candidates with mathematical rejection reasons.',
      route: '/compare',
      actionText: 'View Final Recommendation',
    },
    {
      step: 9,
      title: 'Step 9: Final Executive Recommendation',
      desc: 'Executive decision sheet: "Why this package?" and "Why not the others?" with decision score 92/100.',
      route: '/recommendation',
      actionText: 'Finish Demo Flow',
    },
  ];

  const current = DEMO_STEPS[demoStep - 1] || DEMO_STEPS[0];

  const handleNext = () => {
    if (demoStep < DEMO_STEPS.length) {
      const nextStepNum = demoStep + 1;
      setDemoStep(nextStepNum);
      navigate(DEMO_STEPS[nextStepNum - 1].route);
    } else {
      setDemoStep(0);
      navigate('/dashboard');
    }
  };

  const handlePrev = () => {
    if (demoStep > 1) {
      const prevStepNum = demoStep - 1;
      setDemoStep(prevStepNum);
      navigate(DEMO_STEPS[prevStepNum - 1].route);
    }
  };

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-3xl bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-emerald-500/40 p-3 sm:p-4 animate-in slide-in-from-top-4 duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Step Indicator & Text */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
            {demoStep}/9
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                WOW Demo Walkthrough
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-semibold text-white">{current.title}</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 sm:line-clamp-none">{current.desc}</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrev}
            disabled={demoStep === 1}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm shadow-emerald-700/50 cursor-pointer"
          >
            <span>{current.actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDemoStep(0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            title="Exit Demo Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
