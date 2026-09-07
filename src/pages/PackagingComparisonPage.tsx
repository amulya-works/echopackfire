import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext.js';
import { PackagingDesign } from '../types.js';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Box,
  Leaf,
  DollarSign,
  ShieldCheck,
  Truck,
  RotateCcw,
  Info,
} from 'lucide-react';

export const PackagingComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, activeDesign, setActiveDesign } = useProject();

  const allDesigns = activeProject?.designs || [];
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (allDesigns.length >= 3) return [allDesigns[0].id, allDesigns[1].id, allDesigns[2].id];
    return allDesigns.map(d => d.id);
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert('Please maintain at least 2 configurations for comparative trade-off analysis.');
        return;
      }
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare up to 4 configurations simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const comparedDesigns = allDesigns.filter(d => selectedIds.includes(d.id));

  // Prepare Bubble Plot Data: X = Cost, Y = Carbon, Z = Protection
  const bubbleData = allDesigns.map(d => ({
    id: d.id,
    name: d.name,
    cost: Number(d.estimated_cost.toFixed(2)),
    carbon: Number(d.carbon_footprint.toFixed(2)),
    protection: d.protection_score,
    material: d.material_name,
    isSelected: selectedIds.includes(d.id),
  }));

  const CustomBubbleTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
          <div className="font-bold text-emerald-400">{data.name}</div>
          <div className="text-slate-300">Material: {data.material}</div>
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-700">
            <span>Unit Cost:</span>
            <strong className="font-mono">₹{data.cost}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Carbon Footprint:</span>
            <strong className="font-mono text-emerald-300">{data.carbon} kg CO₂e</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>ASTM Protection:</span>
            <strong className="font-mono text-blue-300">{data.protection}/100</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  // Helper to derive strengths & weaknesses
  const getInsights = (d: PackagingDesign) => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (d.estimated_cost <= 16) strengths.push('Lowest direct procurement cost');
    else if (d.estimated_cost > 21) weaknesses.push('Higher per-unit material cost');

    if (d.carbon_footprint <= 0.6) strengths.push('Sub-0.60 kg carbon footprint');
    else if (d.carbon_footprint > 1.2) weaknesses.push('High embodied processing carbon');

    if (d.protection_score >= 92) strengths.push('Superior ASTM drop shock absorption');
    else if (d.protection_score < 78) weaknesses.push('Marginal cushion safety factor');

    if (d.recyclability >= 95) strengths.push('100% curbside recyclable / compostable');
    if (d.cushioning_mm >= 25) weaknesses.push('Higher outer volume payload displacement');

    return { strengths, weaknesses };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Section 12 Comparative Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">Multi-Configuration Decision Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Packaging Comparison</h1>
          <p className="text-sm text-slate-600 mt-1">
            Side-by-side engineering evaluation across cost breakdown, ASTM drop pass/fail, carbon lifecycle, and trade-offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {allDesigns.map(d => {
            const isSel = selectedIds.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => toggleSelect(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSel
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {d.name.split(':')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Decision Matrix: Bubble Plot (Cost vs Carbon with Protection as Bubble Size) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Decision Matrix: Cost vs. Carbon Trade-Off Bubble Plot
            </h2>
            <p className="text-xs text-slate-500">
              X-Axis: Unit Cost (₹) • Y-Axis: Carbon Footprint (kg CO₂e) • Bubble Diameter: Protection Score (0–100)
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            Ideal Quadrant: Bottom-Left (Low Cost & Low Carbon)
          </span>
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
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                type="number"
                dataKey="carbon"
                name="Carbon"
                unit="kg"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <ZAxis
                type="number"
                dataKey="protection"
                range={[120, 480]}
                name="Protection"
              />
              <Tooltip content={<CustomBubbleTooltip />} />
              <Scatter name="Designs" data={bubbleData}>
                {bubbleData.map(entry => (
                  <Cell
                    key={entry.id}
                    fill={entry.isSelected ? '#059669' : '#94a3b8'}
                    stroke={entry.isSelected ? '#047857' : '#64748b'}
                    strokeWidth={entry.isSelected ? 2 : 1}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      const matched = allDesigns.find(d => d.id === entry.id);
                      if (matched) setActiveDesign(matched);
                    }}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Detailed Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
            Side-by-Side Engineering Matrix
          </h2>
          <span className="text-xs text-slate-500">
            Comparing {comparedDesigns.length} configurations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-slate-500 w-48 bg-slate-50">Metric / Parameter</th>
                {comparedDesigns.map(d => (
                  <th key={d.id} className="py-3 px-4 font-bold text-slate-900 min-w-[220px]">
                    <div className="flex items-center justify-between">
                      <span>{d.name}</span>
                      {d.id === activeDesign?.id && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      {d.material_name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Unit Packaging Cost</td>
                {comparedDesigns.map(d => (
                  <td key={d.id} className="py-3 px-4 font-bold text-slate-900">
                    ₹{d.estimated_cost.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Carbon Footprint</td>
                {comparedDesigns.map(d => (
                  <td key={d.id} className="py-3 px-4 font-bold text-emerald-600">
                    {d.carbon_footprint.toFixed(2)} kg CO₂e
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">ASTM Protection Score</td>
                {comparedDesigns.map(d => (
                  <td key={d.id} className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${d.protection_score}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900">{d.protection_score}/100</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Dimensions (LxWxH mm)</td>
                {comparedDesigns.map(d => (
                  <td key={d.id} className="py-3 px-4 text-slate-700">
                    {d.length_mm} x {d.width_mm} x {d.height_mm} mm
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Wall & Cushioning</td>
                {comparedDesigns.map(d => (
                  <td key={d.id} className="py-3 px-4 text-slate-700">
                    {d.thickness_mm}mm wall / {d.cushioning_mm}mm buffer
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Tare Weight</td>
                {comparedDesigns.map(d => (
                  <td key={d.id} className="py-3 px-4 font-semibold text-slate-800">
                    {d.weight_g} grams
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Curbside Recyclability</td>
                {comparedDesigns.map(d => (
                  <td key={d.id} className="py-3 px-4 font-bold text-emerald-600">
                    {d.recyclability}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Plastic Content</td>
                {comparedDesigns.map(d => (
                  <td key={d.id} className="py-3 px-4 text-slate-700">
                    {d.plastic_content_pct || 0}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Strengths</td>
                {comparedDesigns.map(d => {
                  const { strengths } = getInsights(d);
                  return (
                    <td key={d.id} className="py-3 px-4">
                      <ul className="space-y-1">
                        {strengths.map((s, idx) => (
                          <li key={idx} className="text-emerald-700 flex items-start gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Trade-Off Weaknesses</td>
                {comparedDesigns.map(d => {
                  const { weaknesses } = getInsights(d);
                  return (
                    <td key={d.id} className="py-3 px-4">
                      <ul className="space-y-1">
                        {weaknesses.map((w, idx) => (
                          <li key={idx} className="text-amber-800 flex items-start gap-1 text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 bg-slate-50">Action</td>
                {comparedDesigns.map(d => (
                  <td key={d.id} className="py-3 px-4">
                    <button
                      onClick={() => {
                        setActiveDesign(d);
                        navigate('/recommendation');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      Select Configuration
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
