import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Box,
  Sliders,
  BarChart3,
  Award,
  Sparkles,
  Plus,
  ArrowRight,
  ShieldCheck,
  Leaf,
  DollarSign,
  Copy,
  Trash2,
  ExternalLink,
  Truck,
  ArrowRightLeft,
  TrendingUp,
  Calculator,
  FileText,
  Settings,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';
import { MetricCard } from '../components/MetricCard.js';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    projects,
    activeProject,
    setActiveProject,
    deleteProject,
    duplicateProject,
  } = useProject();

  const handleOpenStudio = (project: typeof activeProject) => {
    if (project) {
      setActiveProject(project);
      navigate('/studio');
    }
  };

  const handleOpenValidation = (project: typeof activeProject) => {
    if (project) {
      setActiveProject(project);
      navigate('/validation');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header & Tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Sustainable Packaging Intelligence
            </span>
            <span className="text-xs text-slate-500 font-mono">PS11 & PS7 Decision Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            EchoPack Command Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            "Design smarter. Protect better. Waste less." — Balancing protection, cost, carbon, and logistics trade-offs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/projects/new"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Packaging Project</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Active Projects"
          value={projects.length}
          unit="projects"
          subtext="In active engineering optimization"
          icon={Layers}
          badge="Live"
          badgeType="info"
          progress={75}
          colorScheme="slate"
        />

        <MetricCard
          title="Avg. Carbon Avoidance"
          value="-34.2"
          unit="%"
          subtext="Vs virgin EPS/fossil polymers"
          icon={Leaf}
          badge="Scope 3"
          badgeType="success"
          progress={88}
          colorScheme="emerald"
        />

        <MetricCard
          title="Procurement Savings"
          value="-18.5"
          unit="%"
          subtext="Via dimensional cube optimization"
          icon={DollarSign}
          badge="Audited"
          badgeType="success"
          progress={70}
          colorScheme="emerald"
        />

        <MetricCard
          title="ASTM Damage Reduction"
          value="-87.5"
          unit="%"
          subtext="FEA drop shock attenuation"
          icon={ShieldCheck}
          badge="ISTA 3A"
          badgeType="info"
          progress={94}
          colorScheme="blue"
        />
      </div>

      {/* 8-Card Modular Navigation Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">EchoPack Decision Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/studio')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Design Studio</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">3D CAD, shell & cushioning</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/optimizer')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Packaging Optimizer</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">6 multi-objective utility modes</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/validation')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Validation Lab</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Drop, Compression & Vibration</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/materials')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Material Intelligence</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">12 certified eco-substrates</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/logistics')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Logistics & Carbon</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Cube density & freight runs</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/comparison')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Decision Matrix</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Bubble chart & side-by-side</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/savings')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Savings & Impact</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Financial ROI & ESG metrics</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition-all text-left group cursor-pointer space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Reports & Export</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">16-section audit brief & PDF</p>
            </div>
          </button>
        </div>
      </div>

      {/* Active Projects Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Packaging Projects</h2>
            <p className="text-xs text-slate-500">Select any project to inspect 3D geometry and run simulations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map(proj => {
            const isCurrent = activeProject?.id === proj.id;
            const bestDesign = proj.designs.find(d => d.id === proj.selected_design_id) || proj.designs[0];

            return (
              <div
                key={proj.id}
                className={`bg-white rounded-xl border p-6 shadow-xs transition-all space-y-4 ${
                  isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{proj.name}</h3>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active Focus
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{proj.description}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateProject(proj.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Duplicate Project"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Product Dimensional Specs */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Dimensions</span>
                    <p className="font-semibold text-slate-800 font-mono">
                      {proj.product.length_mm}×{proj.product.width_mm}×{proj.product.height_mm} mm
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Weight & Fragility</span>
                    <p className="font-semibold text-slate-800">
                      {proj.product.weight_g}g ({proj.product.fragility})
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Budget Limit</span>
                    <p className="font-semibold text-slate-800 font-mono">
                      ₹{(proj.product.target_cost || proj.product.budget || 20).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Candidate Packaging Options Pill Bar */}
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1.5 flex justify-between">
                    <span>Generated Options ({proj.designs.length}):</span>
                    <span className="text-emerald-600 font-semibold">Top: {bestDesign?.material_name}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {proj.designs.map(d => (
                      <div
                        key={d.id}
                        className={`p-2 rounded-lg border text-[11px] ${
                          d.id === bestDesign?.id
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="truncate">{d.name.split(':')[1] || d.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ₹{d.estimated_cost.toFixed(1)} • {d.carbon_footprint.toFixed(2)}kg
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleOpenValidation(proj)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Validation Lab</span>
                  </button>

                  <button
                    onClick={() => handleOpenStudio(proj)}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Open 3D Studio</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
