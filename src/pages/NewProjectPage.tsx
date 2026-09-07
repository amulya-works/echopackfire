import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Box,
  Truck,
  Leaf,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';
import { ProductFragility, TransportMode } from '../types.js';

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProject, setActiveProject } = useProject();

  // Form fields
  const [projectName, setProjectName] = useState<string>('Custom Ergonomic Device');
  const [productName, setProductName] = useState<string>('Ergonomic Sensor Module');
  const [category, setCategory] = useState<string>('Consumer Electronics');
  const [length_mm, setLength_mm] = useState<number>(120);
  const [width_mm, setWidth_mm] = useState<number>(85);
  const [height_mm, setHeight_mm] = useState<number>(55);
  const [weight_g, setWeight_g] = useState<number>(350);
  const [fragility, setFragility] = useState<ProductFragility>('Medium');

  const [budget, setBudget] = useState<number>(22.0);
  const [expectedVolume, setExpectedVolume] = useState<number>(20000);
  const [brandStyle, setBrandStyle] = useState<'Minimal' | 'Premium' | 'Eco-conscious' | 'Standard'>('Eco-conscious');

  const [maxCarbon, setMaxCarbon] = useState<number>(1.1);
  const [minRecyclability, setMinRecyclability] = useState<number>(85);

  const [transportDistance, setTransportDistance] = useState<number>(650);
  const [transportMode, setTransportMode] = useState<TransportMode>('Road');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // Check if AI Advisor pre-filled requirements exist
  useEffect(() => {
    const saved = sessionStorage.getItem('prefilled_project_reqs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.productName) {
          setProductName(parsed.productName);
          setProjectName(parsed.productName);
        }
        if (parsed.fragility) setFragility(parsed.fragility);
        if (parsed.budget) setBudget(parsed.budget);
        if (parsed.category) setCategory(parsed.category);
        sessionStorage.removeItem('prefilled_project_reqs');
      } catch (e) {
        console.error('Failed to parse prefilled specs:', e);
      }
    }
  }, []);

  const handleQuickFillSmartBottle = () => {
    setProjectName('Smart Bottle');
    setProductName('Smart Bottle with Sensor Core');
    setCategory('Smart Hardware & Consumer Goods');
    setLength_mm(80);
    setWidth_mm(80);
    setHeight_mm(250);
    setWeight_g(450);
    setFragility('Medium');
    setBudget(20.0);
    setExpectedVolume(25000);
    setBrandStyle('Eco-conscious');
    setMaxCarbon(1.0);
    setMinRecyclability(90);
    setTransportDistance(500);
    setTransportMode('Road');
  };

  const handleGeneratePackaging = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      setGenerationStep('Evaluating certified material substrate densities...');
      await new Promise(r => setTimeout(r, 450));

      setGenerationStep('Calculating required protective cushioning thicknesses...');
      await new Promise(r => setTimeout(r, 500));

      setGenerationStep('Running cradle-to-grave LCA lifecycle emissions...');
      await new Promise(r => setTimeout(r, 550));

      setGenerationStep('Generating 4 candidate packaging designs...');

      const newProj = await createProject({
        name: projectName,
        description: `Packaging design for ${productName} (${length_mm}x${width_mm}x${height_mm}mm, ${weight_g}g).`,
        product: {
          name: productName,
          category,
          length_mm,
          width_mm,
          height_mm,
          weight_g,
          fragility,
          budget,
          expected_volume: expectedVolume,
          brand_style: brandStyle,
          transport_distance_km: transportDistance,
          transport_mode: transportMode,
        },
      });

      setActiveProject(newProj);
      navigate('/studio');
    } catch (err) {
      console.error('Failed to generate project:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Configure New Packaging Project</h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify dimensional geometry, fragility requirements, and business constraints to generate candidate solutions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleQuickFillSmartBottle}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick Fill: Smart Bottle Demo</span>
        </button>
      </div>

      <form onSubmit={handleGeneratePackaging} className="mt-8 space-y-8">
        {/* Section 1: Product Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Box className="w-4 h-4 text-emerald-600" />
            <span>1. Product Geometry & Specifications</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Project Name</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Product Category</label>
              <input
                type="text"
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Length (mm)</label>
              <input
                type="number"
                min="20"
                max="1000"
                required
                value={length_mm}
                onChange={e => setLength_mm(Number(e.target.value))}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Width (mm)</label>
              <input
                type="number"
                min="20"
                max="1000"
                required
                value={width_mm}
                onChange={e => setWidth_mm(Number(e.target.value))}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Height (mm)</label>
              <input
                type="number"
                min="20"
                max="1000"
                required
                value={height_mm}
                onChange={e => setHeight_mm(Number(e.target.value))}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Product Weight (grams)</label>
              <input
                type="number"
                min="10"
                max="50000"
                required
                value={weight_g}
                onChange={e => setWeight_g(Number(e.target.value))}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Fragility Classification</label>
              <div className="mt-1 grid grid-cols-4 gap-1.5">
                {(['Low', 'Medium', 'High', 'Very High'] as ProductFragility[]).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFragility(f)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      fragility === f
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f === 'Very High' ? 'V.High' : f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Business & Sustainability Requirements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>2. Business & Sustainability Targets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Max Budget / Package (₹)</label>
              <input
                type="number"
                step="0.5"
                min="2"
                max="500"
                required
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Annual Production Volume</label>
              <input
                type="number"
                min="500"
                max="10000000"
                required
                value={expectedVolume}
                onChange={e => setExpectedVolume(Number(e.target.value))}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Carbon Target (kg CO₂e)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="10"
                required
                value={maxCarbon}
                onChange={e => setMaxCarbon(Number(e.target.value))}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Logistics & Supply Chain */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>3. Logistics & Freight Distance</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Transport Distance</span>
                <span className="font-mono text-emerald-600 font-bold">{transportDistance} km</span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={transportDistance}
                onChange={e => setTransportDistance(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>50 km (Local)</span>
                <span>500 km (Regional)</span>
                <span>3,000 km (National)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Transport Mode</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Road', 'Rail', 'Air', 'Sea'] as TransportMode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTransportMode(m)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      transportMode === m
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button & Interactive Loading */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-75 shadow-md shadow-emerald-200 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{generationStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Packaging Options</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
