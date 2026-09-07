import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext.js';
import { LogisticsMetrics, TransportMode } from '../types.js';
import {
  Truck,
  Box,
  Compass,
  DollarSign,
  Leaf,
  Scale,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Percent,
  RefreshCw,
} from 'lucide-react';

export const LogisticsCarbonPage: React.FC = () => {
  const { activeProject, activeDesign } = useProject();

  const [distanceKm, setDistanceKm] = useState(activeProject?.product.transport_distance_km || 500);
  const [transportMode, setTransportMode] = useState<TransportMode>(activeProject?.product.transport_mode || 'Road');
  const [totalUnits, setTotalUnits] = useState(activeProject?.product.expected_volume || 25000);
  const [packageLength, setPackageLength] = useState(activeDesign?.length_mm || 120);
  const [packageWidth, setPackageWidth] = useState(activeDesign?.width_mm || 120);
  const [packageHeight, setPackageHeight] = useState(activeDesign?.height_mm || 290);
  const [packageWeight, setPackageWeight] = useState(activeDesign?.weight_g || 220);

  const [metrics, setMetrics] = useState<LogisticsMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Sync with active design if changed
  useEffect(() => {
    if (activeDesign) {
      setPackageLength(activeDesign.length_mm);
      setPackageWidth(activeDesign.width_mm);
      setPackageHeight(activeDesign.height_mm);
      setPackageWeight(activeDesign.weight_g);
    }
  }, [activeDesign]);

  const calculateLogisticsMetrics = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch('/api/logistics/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          length_mm: packageLength,
          width_mm: packageWidth,
          height_mm: packageHeight,
          package_weight_g: packageWeight,
          number_of_packages: totalUnits,
          transport_distance_km: distanceKm,
          transport_mode: transportMode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to calculate logistics:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    calculateLogisticsMetrics();
  }, [packageLength, packageWidth, packageHeight, packageWeight, totalUnits, distanceKm, transportMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Section 10 Logistics Cube Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">Scope 3 Freight & Cube Utilization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Logistics & Carbon Footprint</h1>
          <p className="text-sm text-slate-600 mt-1">
            Quantifying how volumetric optimization and right-sized packaging eliminate empty air and reduce freight runs.
          </p>
        </div>

        {activeProject && (
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500">Active:</span>
            <span className="font-bold text-slate-900">{activeProject.name}</span>
            <span className="text-slate-400">|</span>
            <span className="font-medium text-emerald-700">{activeDesign?.name || 'Standard Pack'}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Control Panel & Live Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Logistics Controls */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              Freight & Dimension Variables
            </h2>
            <button
              onClick={calculateLogisticsMetrics}
              className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {/* Transport Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Primary Transit Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Road', 'Rail', 'Air', 'Sea'] as TransportMode[]).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTransportMode(mode)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    transportMode === mode
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mode === 'Road' && '🚛 Road Truck'}
                  {mode === 'Rail' && '🚂 Rail Freight'}
                  {mode === 'Air' && '✈️ Air Cargo'}
                  {mode === 'Sea' && '🚢 Ocean Freight'}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>Transit Distance</span>
              <span className="font-bold text-slate-900">{distanceKm} km</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={distanceKm}
              onChange={e => setDistanceKm(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Production Volume */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>Annual Shipment Volume</span>
              <span className="font-bold text-slate-900">{totalUnits.toLocaleString()} units</span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={totalUnits}
              onChange={e => setTotalUnits(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Packaging Outer Dimensions */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Outer Pack Dimensions</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block">Length (mm)</label>
                <input
                  type="number"
                  value={packageLength}
                  onChange={e => setPackageLength(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Width (mm)</label>
                <input
                  type="number"
                  value={packageWidth}
                  onChange={e => setPackageWidth(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block">Height (mm)</label>
                <input
                  type="number"
                  value={packageHeight}
                  onChange={e => setPackageHeight(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block">Gross Weight / Unit (grams)</label>
              <input
                type="number"
                value={packageWeight}
                onChange={e => setPackageWeight(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Comparison Callouts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Banner: Truck Payload Comparison */}
          {metrics && (
            <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Volumetric Logistics Yield
                </span>
                <h3 className="text-xl font-bold mt-1">
                  {metrics.packages_per_truck.toLocaleString()} Boxes / 53ft Truck
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  {metrics.dimension_efficiency_note}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-3 rounded-lg text-center whitespace-nowrap">
                <span className="text-[10px] text-emerald-200 uppercase font-semibold block">
                  Capacity Gain vs Baseline
                </span>
                <span className="text-2xl font-black text-white">
                  +{metrics.improvement_pct}%
                </span>
                <span className="text-[10px] text-slate-300 block">
                  ({metrics.baseline_packages_per_truck.toLocaleString()} baseline)
                </span>
              </div>
            </div>
          )}

          {/* 6-Card Logistics Metric Grid */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">Unit Pack Volume</span>
                  <Box className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {metrics.package_volume_l} L
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {(metrics.package_volume_l / 1000).toFixed(4)} m³ displacement
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">Total Shipment Volume</span>
                  <Scale className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {metrics.shipment_volume_m3.toLocaleString()} m³
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  For {totalUnits.toLocaleString()} units batch
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">Gross Freight Weight</span>
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {metrics.shipment_weight_kg.toLocaleString()} kg
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {(metrics.shipment_weight_kg / 1000).toFixed(1)} metric tonnes
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">Cube Space Utilization</span>
                  <Percent className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-emerald-600">
                  {metrics.space_utilization_pct}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  High packing factor efficiency
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">Total Freight Cost</span>
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-slate-900">
                  ₹{metrics.transportation_cost_total.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  ₹{(metrics.transportation_cost_total / totalUnits).toFixed(2)} per package
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">Scope 3 Emissions</span>
                  <Leaf className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-emerald-600">
                  {metrics.estimated_transport_emissions_kg.toLocaleString()} kg CO₂e
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {(metrics.estimated_transport_emissions_kg / totalUnits).toFixed(3)} kg/package
                </div>
              </div>
            </div>
          )}

          {/* Explanatory Technical Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-xs text-slate-600 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Engineering Standard: Volumetric Freight Density
            </h4>
            <p className="leading-relaxed">
              In modern parcel and dry van logistics, freight carriers apply dimensional weight (DIM weight) pricing when package volume exceeds cubic density thresholds. EchoPack's tight internal clearance tolerances (1.5mm) and form-fitting shock buffers reduce gross volume displacement by up to 18%, directly decreasing both billable dimensional freight tiers and tailpipe Scope 3 GHG emissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
