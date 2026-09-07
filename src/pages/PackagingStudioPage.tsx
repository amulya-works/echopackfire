import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Layers,
  ShieldCheck,
  Sliders,
  DollarSign,
  Leaf,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  Maximize2,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';
import { Packaging3DViewer } from '../components/Packaging3DViewer.js';
import { SEEDED_MATERIALS } from '../../backend/data/materials.js';

export const PackagingStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, activeDesign, setActiveDesign, updateActiveDesignMetrics } = useProject();

  const currentProject = activeProject;
  const currentDesign = activeDesign || currentProject?.designs[0];

  // Parametric controls state
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    currentDesign?.material_id || 'mat_hybrid'
  );
  const [length_mm, setLength_mm] = useState<number>(currentProject?.product.length_mm || 80);
  const [width_mm, setWidth_mm] = useState<number>(currentProject?.product.width_mm || 80);
  const [height_mm, setHeight_mm] = useState<number>(currentProject?.product.height_mm || 250);
  const [thickness_mm, setThickness_mm] = useState<number>(currentDesign?.thickness_mm || 3.2);
  const [cushioning_mm, setCushioning_mm] = useState<number>(currentDesign?.cushioning_mm || 20);

  const [explodedView, setExplodedView] = useState<boolean>(false);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<any>(null);

  // Sync state when active design changes
  useEffect(() => {
    if (currentDesign) {
      setSelectedMaterialId(currentDesign.material_id);
      setThickness_mm(currentDesign.thickness_mm);
      setCushioning_mm(currentDesign.cushioning_mm);
    }
  }, [currentDesign]);

  // Recalculate metrics in real-time when sliders change
  useEffect(() => {
    let isCancelled = false;

    const recalculate = async () => {
      setIsRecalculating(true);
      try {
        const res = await fetch('/api/packaging/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            material_id: selectedMaterialId,
            length_mm,
            width_mm,
            height_mm,
            thickness_mm,
            cushioning_mm,
            transport_distance_km: currentProject?.product.transport_distance_km || 500,
            transport_mode: currentProject?.product.transport_mode || 'Road',
            product_weight_g: currentProject?.product.weight_g || 450,
            product_fragility: currentProject?.product.fragility || 'Medium',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setMetrics(data);

            if (currentDesign) {
              const updated = {
                ...currentDesign,
                material_id: selectedMaterialId,
                material_name: data.material_name,
                thickness_mm,
                cushioning_mm,
                estimated_cost: data.estimated_cost,
                carbon_footprint: data.carbon_footprint,
                protection_score: data.protection_score,
                recyclability: data.recyclability,
                weight_g: data.weight_g,
                logistics_score: data.logistics_score,
              };
              updateActiveDesignMetrics(updated);
            }
          }
        }
      } catch (err) {
        console.error('Recalculation error:', err);
      } finally {
        if (!isCancelled) setIsRecalculating(false);
      }
    };

    const timer = setTimeout(recalculate, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [selectedMaterialId, length_mm, width_mm, height_mm, thickness_mm, cushioning_mm]);

  const activeMat = SEEDED_MATERIALS.find(m => m.id === selectedMaterialId) || SEEDED_MATERIALS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">3D Packaging Parametric Studio</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Interactive FEA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Focus: <strong className="text-slate-800">{currentProject?.name}</strong> • Modifying geometry updates cost, carbon, and cushioning in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/drop-test')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Virtual Drop Test Lab</span>
          </button>

          <button
            onClick={() => navigate('/simulator')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 shadow-xs transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Scenario Simulator</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: 3D Stage + Parametric Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Viewport + Candidate Selector (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Three.js Interactive Viewer with sleek canvas & floating corner metrics */}
          <div className="relative">
            <Packaging3DViewer
              length_mm={length_mm}
              width_mm={width_mm}
              height_mm={height_mm}
              thickness_mm={thickness_mm}
              cushioning_mm={cushioning_mm}
              materialName={activeMat.name}
              materialColor={activeMat.color_hex}
              productType={currentProject?.name.toLowerCase().includes('bottle') ? 'bottle' : 'box'}
              exploded={explodedView}
              metrics={{
                carbon_footprint: metrics?.carbon_footprint ?? currentDesign?.carbon_footprint,
                estimated_cost: metrics?.estimated_cost ?? currentDesign?.estimated_cost,
                protection_score: metrics?.protection_score ?? currentDesign?.protection_score,
                recyclability: metrics?.recyclability ?? activeMat.recyclability_pct,
              }}
              className="w-full h-[500px]"
            />
          </div>

          {/* Alternative Packaging Preset Tabs */}
          {currentProject && currentProject.designs.length > 0 && (
            <div className="sleek-card">
              <div className="sleek-section-title">
                <span>Compare Against Generated Options</span>
                <span className="text-[11px] font-medium lowercase text-slate-400">click to load</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {currentProject.designs.map(d => {
                  const isSelected = d.id === currentDesign?.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setActiveDesign(d)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs truncate">{d.name.split(':')[1] || d.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        ₹{d.estimated_cost.toFixed(1)} • {d.carbon_footprint.toFixed(2)} kg
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        {d.protection_score}/100 Prot.
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Parametric Controls & Real-Time Metrics Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Packaging Config Header */}
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold text-slate-900 m-0">Packaging Config</h2>
            <span className="sleek-tag">
              {activeMat.name.includes('Hybrid') ? 'Hybrid Recycled' : activeMat.name.split(' ')[0]}
            </span>
          </div>

          {/* Material Specification Card */}
          <div>
            <div className="sleek-section-title">Material Specification</div>
            <div className="sleek-card space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-900">{activeMat.name}</span>
                <span className="text-emerald-600 text-xs font-semibold">Primary</span>
              </div>
              <div className="text-xs text-slate-500">
                Source: {activeMat.category === 'Bio-based' || activeMat.recyclability_pct >= 90 ? '100% Bio-based / Post-consumer waste' : 'Recycled Substrate Blend'}
              </div>

              {/* Substrate Selector */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                {SEEDED_MATERIALS.slice(0, 3).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMaterialId(m.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      selectedMaterialId === m.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color_hex }} />
                      <span className="truncate max-w-[190px]">{m.name}</span>
                    </div>
                    {selectedMaterialId === m.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Parametric Dimension Sliders */}
          <div className="sleek-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="sleek-section-title mb-0">Parametric Geometry</span>
              <button
                type="button"
                onClick={() => setExplodedView(!explodedView)}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  explodedView ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {explodedView ? 'Collapse' : 'Exploded'}
              </button>
            </div>

            {/* Cushioning Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Cushioning Buffer</span>
                <span className="font-mono text-emerald-600 font-bold">{cushioning_mm} mm</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={cushioning_mm}
                onChange={e => setCushioning_mm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer sleek-slider"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>5mm</span>
                <span>20mm (Optimal)</span>
                <span>40mm</span>
              </div>
            </div>

            {/* Wall Thickness Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Wall Thickness</span>
                <span className="font-mono text-emerald-600 font-bold">{thickness_mm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="6.0"
                step="0.1"
                value={thickness_mm}
                onChange={e => setThickness_mm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer sleek-slider"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1.5mm</span>
                <span>3.2mm (Balanced)</span>
                <span>6.0mm</span>
              </div>
            </div>
          </div>

          {/* Decision Result Recommendation Badge */}
          <div>
            <div className="sleek-section-title">Decision Result</div>
            <div className="sleek-recommendation-badge">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider opacity-80 font-medium">Confidence Score</span>
                <span className="text-xl font-bold font-mono">94%</span>
              </div>
              <p className="text-xs leading-relaxed opacity-95">
                This design is optimal for the current 500km transport scenario with high eco-weighting.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => navigate('/compare')}
            className="sleek-btn-primary w-full"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Optimization Suite</span>
          </button>
        </div>
      </div>
    </div>
  );
};
