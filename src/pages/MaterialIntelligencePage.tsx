import React, { useState, useEffect } from 'react';
import { Material } from '../types.js';
import {
  Layers,
  Search,
  Filter,
  ArrowRightLeft,
  CheckCircle2,
  Droplets,
  ShieldAlert,
  Leaf,
  DollarSign,
  Cpu,
  Info,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';

export const MaterialIntelligencePage: React.FC = () => {
  const { activeProject } = useProject();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([
    'mat_corrugated',
    'mat_molded_pulp',
    'mat_bioplastic',
  ]);
  const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');

  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => setMaterials(data))
      .catch(err => console.error('Failed to load materials:', err));
  }, []);

  const categories = ['All', 'Paper & Board', 'Fiber & Pulp', 'Bio-based', 'Polymer', 'Metal & Glass'];

  const filteredMaterials = materials.filter(m => {
    const matchesCat = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleCompare = (id: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 4) {
          return [...prev.slice(1), id];
        }
        return [...prev, id];
      }
    });
  };

  const comparedMaterials = materials.filter(m => selectedForComparison.includes(m.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Section 5 Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">12 Certified Substrates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Material Intelligence</h1>
          <p className="text-sm text-slate-600 mt-1">
            Certified technical properties, mechanical strength, life-cycle carbon factors, and moisture barriers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Materials ({materials.length})
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'compare'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Side-by-Side ({selectedForComparison.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material or property..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison View */}
      {viewMode === 'compare' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Side-by-Side Material Matrix</h2>
            </div>
            <p className="text-xs text-slate-500">
              Comparing {comparedMaterials.length} of 12 substrates (Select up to 4)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold text-slate-500 w-44 bg-slate-50">Property</th>
                  {comparedMaterials.map(m => (
                    <th key={m.id} className="py-3 px-4 font-bold text-slate-900 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span>{m.name}</span>
                        <button
                          onClick={() => toggleCompare(m.id)}
                          className="text-slate-400 hover:text-red-500 text-sm font-bold"
                          title="Remove from comparison"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-700 block mt-0.5">
                        {m.category}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Estimated Cost / kg</td>
                  {comparedMaterials.map(m => (
                    <td key={m.id} className="py-3 px-4 font-semibold text-slate-900">
                      ₹{m.cost_per_kg.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Carbon Factor</td>
                  {comparedMaterials.map(m => (
                    <td key={m.id} className="py-3 px-4 font-semibold text-emerald-600">
                      {m.carbon_factor_kg_co2e_per_kg} kg CO₂e/kg
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Tensile Strength</td>
                  {comparedMaterials.map(m => (
                    <td key={m.id} className="py-3 px-4 font-semibold text-slate-900">
                      {m.strength_mpa} MPa
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Certified Recyclability</td>
                  {comparedMaterials.map(m => (
                    <td key={m.id} className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${m.recyclability_pct}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-900">{m.recyclability_pct}%</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">PCR Recycled Content</td>
                  {comparedMaterials.map(m => (
                    <td key={m.id} className="py-3 px-4 font-semibold text-slate-700">
                      {m.recycled_content_pct}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Moisture Resistance</td>
                  {comparedMaterials.map(m => (
                    <td key={m.id} className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          m.moisture_resistance === 'Waterproof'
                            ? 'bg-blue-100 text-blue-800'
                            : m.moisture_resistance === 'High'
                            ? 'bg-teal-100 text-teal-800'
                            : m.moisture_resistance === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.moisture_resistance}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Fragility Damping Suitability</td>
                  {comparedMaterials.map(m => (
                    <td key={m.id} className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          m.fragility_suitability === 'Very High'
                            ? 'bg-purple-100 text-purple-800'
                            : m.fragility_suitability === 'High'
                            ? 'bg-indigo-100 text-indigo-800'
                            : m.fragility_suitability === 'Medium'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {m.fragility_suitability}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">End-of-Life Score</td>
                  {comparedMaterials.map(m => (
                    <td key={m.id} className="py-3 px-4 font-bold text-emerald-600">
                      {m.end_of_life_score} / 100
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Substrate Density</td>
                  {comparedMaterials.map(m => (
                    <td key={m.id} className="py-3 px-4 text-slate-700">
                      {m.density_g_cm3} g/cm³
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Primary Engineering Application</td>
                  {comparedMaterials.map(m => (
                    <td key={m.id} className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                      {m.description}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View of all 12 Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map(mat => {
          const isCompared = selectedForComparison.includes(mat.id);
          return (
            <div
              key={mat.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                isCompared ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {mat.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{mat.name}</h3>
                  </div>

                  <button
                    onClick={() => toggleCompare(mat.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                      isCompared
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    {isCompared ? 'Comparing' : 'Compare'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{mat.description}</p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Cost</span>
                    <span className="font-bold text-slate-900">₹{mat.cost_per_kg.toFixed(2)} / kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Carbon Factor</span>
                    <span className="font-bold text-emerald-600">
                      {mat.carbon_factor_kg_co2e_per_kg} kg CO₂e/kg
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tensile Strength</span>
                    <span className="font-bold text-slate-900">{mat.strength_mpa} MPa</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">End-of-Life Score</span>
                    <span className="font-bold text-emerald-600">{mat.end_of_life_score} / 100</span>
                  </div>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    Recyclability: {mat.recyclability_pct}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    PCR: {mat.recycled_content_pct}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    Moisture: {mat.moisture_resistance}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    Fragility: {mat.fragility_suitability}
                  </span>
                </div>
              </div>

              {activeProject && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Density: {mat.density_g_cm3} g/cm³</span>
                  <span className="text-emerald-700 font-medium">
                    ASTM Shock: {(mat.shock_absorption_coef * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
