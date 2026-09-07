import React, { useState, useEffect } from 'react';
import { ComplianceRule } from '../types.js';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Globe2,
  Building2,
  Package,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';

export const ComplianceCenterPage: React.FC = () => {
  const { activeProject, activeDesign } = useProject();

  const [region, setRegion] = useState('All');
  const [industry, setIndustry] = useState('Consumer Goods');
  const [packagingType, setPackagingType] = useState('Rigid Carton / Pulp');
  const [materialCategory, setMaterialCategory] = useState('Paper & Board');
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch(`/api/compliance?region=${encodeURIComponent(region)}&category=${encodeURIComponent(selectedCategory)}`)
      .then(res => res.json())
      .then(data => {
        if (data.rules) setRules(data.rules);
      })
      .catch(err => console.error('Failed to load compliance rules:', err));
  }, [region, selectedCategory]);

  const categories = [
    'All',
    'Packaging Waste (EPR)',
    'Material Restrictions',
    'Labelling & Markings',
    'Food-Contact Considerations',
    'Transport Safety',
  ];

  const regions = [
    'All',
    'European Union (PPWR)',
    'United States (FTC / EPR)',
    'India (PWM / EPR)',
    'Global / ISO 14021',
  ];

  const filteredRules = rules.filter(r => {
    const matchesSearch =
      r.rule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Section 18 Regulatory Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">Global EPR & PPWR Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Compliance Center</h1>
          <p className="text-sm text-slate-600 mt-1">
            Proactive regulatory checklist for material restrictions, environmental labelling, and Extended Producer Responsibility.
          </p>
        </div>

        {/* Mandatory Regulatory Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 max-w-md">
          <div className="flex items-start gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug font-medium">
              Regulatory information is decision support only. Verify with the relevant authority or qualified compliance professional.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Multi-Variable Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
            Target Jurisdiction / Region
          </label>
          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium"
          >
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Industry Sector
          </label>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="Consumer Goods">Consumer Hardware & Electronics</option>
            <option value="Cosmetics">Cosmetics & Personal Care</option>
            <option value="Food & Beverage">Food & Beverage Packaging</option>
            <option value="Pharma">Pharmaceutical & Medical Devices</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            Packaging Architecture
          </label>
          <select
            value={packagingType}
            onChange={e => setPackagingType(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="Rigid Carton / Pulp">Rigid Carton / Molded Pulp Tray</option>
            <option value="Corrugated Outer">Corrugated Outer Shipper (RSC)</option>
            <option value="Flexible Pouch">Flexible Monomaterial Pouch</option>
            <option value="Bio Clamshell">Compostable Bio-Polymer Clamshell</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Substrate Classification
          </label>
          <select
            value={materialCategory}
            onChange={e => setMaterialCategory(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="Paper & Board">Paper & Board (Flute / Boxboard)</option>
            <option value="Fiber & Pulp">Molded Sugarcane / Bagasse Pulp</option>
            <option value="Bio-based">Compostable Bio-polyester (PHA / PLA)</option>
            <option value="Polymer">Recycled PET / HDPE (PCR)</option>
          </select>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search regulation or standard..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Compliance Checklist Cards */}
      <div className="space-y-4">
        {filteredRules.map(rule => (
          <div
            key={rule.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                  {rule.region}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800">
                  {rule.category}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {rule.standard}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{rule.rule}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{rule.details}</p>

              <div className="text-xs font-medium text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 flex items-start gap-1.5 mt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Design Recommendation:</strong> {rule.remedy}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  rule.status === 'Compliant'
                    ? 'bg-emerald-100 text-emerald-800'
                    : rule.status === 'Caution'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {rule.status === 'Compliant' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                {rule.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
