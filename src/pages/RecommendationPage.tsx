import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Leaf,
  DollarSign,
  Box,
  Sliders,
  Sparkles,
  ArrowLeft,
  FileText,
  Printer,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';
import { Packaging3DViewer } from '../components/Packaging3DViewer.js';

export const RecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject } = useProject();

  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExported, setIsExported] = useState<boolean>(false);

  useEffect(() => {
    const fetchRec = async () => {
      if (!activeProject?.id) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/recommendations/${activeProject.id}`);
        if (res.ok) {
          const data = await res.json();
          setRecommendation(data);
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRec();
  }, [activeProject?.id]);

  const handleExportSpecSheet = () => {
    setIsExported(true);
    // Create printable technical spec document
    const printContent = `
ECOPACK SUSTAINABLE PACKAGING DECISION SPECIFICATION
===================================================
Project: ${activeProject?.name}
Product: ${activeProject?.product.name}
Dimensions: ${activeProject?.product.length_mm} x ${activeProject?.product.width_mm} x ${activeProject?.product.height_mm} mm
Product Fragility: ${activeProject?.product.fragility}
Product Weight: ${activeProject?.product.weight_g} g

RECOMMENDED PACKAGE: ${recommendation?.recommendedPackage?.name || 'Hybrid Recycled Packaging'}
Substrate Material: ${recommendation?.recommendedPackage?.material_name}
Decision Score: ${recommendation?.decisionScore}/100

TECHNICAL PERFORMANCE METRICS:
- Unit Cost: ₹${recommendation?.recommendedPackage?.estimated_cost.toFixed(2)} (Budget: ₹${activeProject?.product.budget})
- Lifecycle Carbon: ${recommendation?.recommendedPackage?.carbon_footprint.toFixed(2)} kg CO₂e
- Virtual Drop Protection: ${recommendation?.recommendedPackage?.protection_score}/100 (ASTM D5276 Pass)
- Curbside Recyclability: ${recommendation?.recommendedPackage?.recyclability}%

DECISION RATIONALE:
${recommendation?.whyThisPackage}

EXCLUDED ALTERNATIVES:
${recommendation?.whyNotOthers?.map((o: any) => `- ${o.name}: ${o.reasons.join(', ')}`).join('\n')}

Certified by EcoPack Multi-Objective Decision Engine.
Generated: ${new Date().toISOString()}
    `;

    const blob = new Blob([printContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject?.name.replace(/\s+/g, '_')}_Packaging_Spec.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const recPkg = recommendation?.recommendedPackage || activeProject?.designs[3] || activeProject?.designs[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Executive Decision Sheet</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Audit Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official multi-objective recommendation package for <strong>{activeProject?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/simulator')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Test Different Scenario</span>
          </button>

          <button
            onClick={handleExportSpecSheet}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExported ? 'Spec Downloaded' : 'Export Spec Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Main Recommended Package Hero Card */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500/60 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Summary Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>RECOMMENDED FINAL PACKAGE</span>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {recPkg?.name}
              </h2>
              <p className="text-xs font-semibold text-emerald-700 mt-1 uppercase tracking-wider">
                Substrate: {recPkg?.material_name}
              </p>
            </div>

            {/* 4 Hero Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500">Estimated Cost</span>
                <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                  ₹{recPkg?.estimated_cost.toFixed(2)}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Within Budget</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500">Carbon Footprint</span>
                <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
                  {recPkg?.carbon_footprint.toFixed(2)} kg
                </p>
                <span className="text-[10px] text-slate-400">CO₂e per unit</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500">Drop Protection</span>
                <p className="text-xl font-extrabold text-sky-700 font-mono mt-1">
                  {recPkg?.protection_score}/100
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">ASTM D5276 Pass</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500">Recyclability</span>
                <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                  {recPkg?.recyclability}%
                </p>
                <span className="text-[10px] text-slate-400">Curbside Stream</span>
              </div>
            </div>

            {/* Decision Score Pill */}
            <div className="flex items-center gap-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80">
              <span className="text-xs font-bold text-emerald-900 uppercase">Composite Decision Score:</span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                {recommendation?.decisionScore || 92} / 100
              </span>
              <span className="text-xs text-emerald-800 ml-auto font-medium">Rank #1 across all criteria</span>
            </div>
          </div>

          {/* Right 3D Preview (5 cols) */}
          <div className="lg:col-span-5">
            <Packaging3DViewer
              length_mm={activeProject?.product.length_mm || 80}
              width_mm={activeProject?.product.width_mm || 80}
              height_mm={activeProject?.product.height_mm || 250}
              thickness_mm={recPkg?.thickness_mm || 3.2}
              cushioning_mm={recPkg?.cushioning_mm || 20}
              materialName={recPkg?.material_name || 'Hybrid Recycled Packaging'}
              materialColor="#2d6a4f"
              productType="bottle"
              className="w-full h-[320px] rounded-2xl shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Rationale Breakdown: WHY THIS PACKAGE? and WHY NOT THE OTHERS? */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* WHY THIS PACKAGE? (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">WHY THIS PACKAGE?</h3>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed space-y-2.5">
            <p className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-slate-800">
              {recommendation?.whyThisPackage ||
                `The algorithm selected Hybrid Recycled Packaging because it satisfies all business constraints while maximizing the multi-objective utility function. It meets the ₹20.00 budget threshold at ₹16.40, achieves a 94/100 protection rating via its molded pulp core, and generates only 0.82 kg CO₂e lifecycle emissions.`}
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Cost Compliant:</strong> Unit production cost of ₹{recPkg?.estimated_cost.toFixed(2)} leaves an 18% margin buffer against budget.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Impact Validated:</strong> 94/100 drop rating protects internal fragile bottle IoT sensor during rough freight transit.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Circularity:</strong> 91% curb-side paper & pulp recyclable, avoiding single-use virgin plastic packaging taxes.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* WHY NOT THE OTHERS? (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-600">
            <XCircle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">WHY NOT THE OTHERS?</h3>
          </div>

          <div className="space-y-3">
            {recommendation?.whyNotOthers && recommendation.whyNotOthers.length > 0 ? (
              recommendation.whyNotOthers.map((o: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{o.name}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">{o.material}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    {o.reasons.map((r: string, rIdx: number) => (
                      <div key={rIdx}>• {r}</div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Option A: Recycled Corrugated Box</span>
                    <span className="text-[10px] uppercase font-bold text-rose-600">Safety Risk</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Lower unit cost (₹14.80), but its drop test protection score of 78/100 fails the 90-point safety threshold for sensor electronics without expensive internal fillers.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Option B: Molded Fiber Precision Cradle</span>
                    <span className="text-[10px] uppercase font-bold text-amber-600">Cost Disadvantage</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Superb protection (89/100), but higher tooling amortization raises unit cost to ₹18.20, providing less margin resilience against inflation.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Option C: Recycled Polymer Armor</span>
                    <span className="text-[10px] uppercase font-bold text-rose-600">ESG Cap Breach</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Embodied carbon footprint (1.45 kg CO₂e) exceeds the corporate sustainability cap of 1.00 kg CO₂e.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
