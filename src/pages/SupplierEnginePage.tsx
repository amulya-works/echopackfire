import React, { useState, useEffect } from 'react';
import { Supplier } from '../types.js';
import {
  Factory,
  Search,
  MapPin,
  Award,
  PackageCheck,
  Clock,
  Star,
  Mail,
  ShieldCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const SupplierEnginePage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [maxMoq, setMaxMoq] = useState<number>(50000);
  const [selectedCert, setSelectedCert] = useState('All');

  useEffect(() => {
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(data => {
        if (data.suppliers) setSuppliers(data.suppliers);
      })
      .catch(err => console.error('Failed to load suppliers:', err));
  }, []);

  const materialsList = [
    'All',
    'Molded Pulp',
    'Kraft Paper',
    'Corrugated Cardboard',
    'Recycled PET',
    'Bio-based',
    'Bio-Foam',
    'Aluminum',
  ];

  const certsList = [
    'All',
    'FSC',
    'ISO 14001',
    'Cradle to Cradle',
    'BPI Compostable',
    'TÜV Austria',
  ];

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.manufacturing_capabilities.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMat =
      materialFilter === 'All' ||
      s.materials_supplied.some(m => m.toLowerCase().includes(materialFilter.toLowerCase()));

    const matchesMoq = s.min_order_qty <= maxMoq;

    const matchesCert =
      selectedCert === 'All' ||
      s.certifications.some(c => c.toLowerCase().includes(selectedCert.toLowerCase()));

    return matchesSearch && matchesMat && matchesMoq && matchesCert;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Section 19 Sourcing Network
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              DEMO SUPPLIER DATA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Supplier Sourcing Engine</h1>
          <p className="text-sm text-slate-600 mt-1">
            Discover and qualify certified eco-packaging converters, tooling fabricators, and bio-substrate manufacturers.
          </p>
        </div>

        <div className="bg-slate-100 px-4 py-2 rounded-lg text-xs text-slate-600 flex items-center gap-2">
          <Factory className="w-4 h-4 text-emerald-600" />
          <span>{filteredSuppliers.length} Verified Converter Partners Available</span>
        </div>
      </div>

      {/* Filter and Query Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Material Substrate</label>
          <select
            value={materialFilter}
            onChange={e => setMaterialFilter(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
          >
            {materialsList.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Maximum Minimum Order Qty (MOQ)
          </label>
          <select
            value={maxMoq}
            onChange={e => setMaxMoq(Number(e.target.value))}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
          >
            <option value={5000}>Up to 5,000 units</option>
            <option value={10000}>Up to 10,000 units</option>
            <option value={20000}>Up to 20,000 units</option>
            <option value={50000}>All MOQs (Up to 50k+)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Certification Standard</label>
          <select
            value={selectedCert}
            onChange={e => setSelectedCert(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
          >
            {certsList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Search Name / Capability</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Thermoformed, pulp, Sweden..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Supplier Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSuppliers.map(sup => (
          <div
            key={sup.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{sup.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      DEMO
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-800">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{sup.rating}</span>
                </div>
              </div>

              {/* Materials Supplied */}
              <div className="mt-4">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Certified Materials:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sup.materials_supplied.map(m => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Manufacturing Capabilities */}
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Production Capabilities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sup.manufacturing_capabilities.map(c => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Third-Party Accreditations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sup.certifications.map(cert => (
                    <span
                      key={cert}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-100 flex items-center gap-1"
                    >
                      <Award className="w-3 h-3 text-blue-600" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer / Specs */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Min. Order Qty</span>
                  <span className="font-bold text-slate-900">{sup.min_order_qty.toLocaleString()} units</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Lead Time</span>
                  <span className="font-bold text-slate-900">{sup.lead_time_days} days</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Recycled Content</span>
                  <span className="font-bold text-emerald-600">{sup.recycled_content_avg_pct}% PCR</span>
                </div>
              </div>

              <a
                href={`mailto:${sup.contact_email}?subject=EchoPack RFP Inquiry`}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-700 shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                Request RFQ
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
