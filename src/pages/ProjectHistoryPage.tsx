import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Box,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
  ShieldCheck,
  Leaf,
  DollarSign,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';

export const ProjectHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, activeProject, setActiveProject, deleteProject, duplicateProject } = useProject();

  const handleOpenProject = (proj: typeof activeProject) => {
    if (proj) {
      setActiveProject(proj);
      navigate('/studio');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Project History & Archives</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              Database Persistence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse all active and historical packaging projects, simulation runs, and optimized specifications.
          </p>
        </div>

        <button
          onClick={() => navigate('/projects/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Project & Dimensions</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Fragility</th>
                <th className="py-3.5 px-4">Selected Substrate</th>
                <th className="py-3.5 px-4">Est. Cost</th>
                <th className="py-3.5 px-4">Carbon</th>
                <th className="py-3.5 px-4">Protection</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(proj => {
                const bestDesign = proj.designs.find(d => d.id === proj.selected_design_id) || proj.designs[0];
                const isCurrent = activeProject?.id === proj.id;

                return (
                  <tr
                    key={proj.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isCurrent ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{proj.name}</span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Focus" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {proj.product.length_mm}×{proj.product.width_mm}×{proj.product.height_mm} mm ({proj.product.weight_g}g)
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{proj.product.category}</td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {proj.product.fragility}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{bestDesign?.material_name}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{bestDesign?.estimated_cost.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">
                      {bestDesign?.carbon_footprint.toFixed(2)} kg
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-sky-700">
                      {bestDesign?.protection_score}/100
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {proj.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenProject(proj)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Open 3D Studio"
                        >
                          <Box className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => duplicateProject(proj.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {projects.length > 1 && (
                          <button
                            onClick={() => deleteProject(proj.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
