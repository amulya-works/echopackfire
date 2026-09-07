import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Box,
  Sliders,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Archive,
  Truck,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';
import { VirtualDropTest3D } from '../components/VirtualDropTest3D.js';
import { DropTestResult, CompressionTestResult, VibrationTestResult } from '../types.js';

export const VirtualTestLabPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, activeDesign, updateActiveDesignMetrics } = useProject();

  const currentProject = activeProject;
  const currentDesign = activeDesign || currentProject?.designs[0];

  type LabTab = 'drop' | 'compression' | 'vibration';
  const [activeTab, setActiveTab] = useState<LabTab>('drop');

  // Drop Test State
  const [dropResult, setDropResult] = useState<DropTestResult | null>(null);

  // Compression Test State
  const [stackHeight, setStackHeight] = useState<number>(6);
  const [warehouseDurationDays, setWarehouseDurationDays] = useState<number>(30);
  const [compressionResult, setCompressionResult] = useState<CompressionTestResult | null>(null);
  const [isSimulatingCompression, setIsSimulatingCompression] = useState<boolean>(false);

  // Vibration Test State
  const [vibrationTransitMode, setVibrationTransitMode] = useState<'Road' | 'Rail' | 'Air' | 'Sea'>('Road');
  const [vibrationDistanceKm, setVibrationDistanceKm] = useState<number>(currentProject?.product.transport_distance_km || 500);
  const [vibrationResult, setVibrationResult] = useState<VibrationTestResult | null>(null);
  const [isSimulatingVibration, setIsSimulatingVibration] = useState<boolean>(false);

  const handleDropComplete = (res: DropTestResult) => {
    setDropResult(res);
    if (currentDesign) {
      updateActiveDesignMetrics({
        ...currentDesign,
        protection_score: res.protection_score,
      });
    }
  };

  // Run Compression Simulation
  const runCompressionSimulation = async () => {
    setIsSimulatingCompression(true);
    try {
      const perimeter = ((currentDesign?.length_mm || 120) + (currentDesign?.width_mm || 120)) * 2;
      const res = await fetch('/api/compression-test/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stack_height_boxes: stackHeight,
          duration_days: warehouseDurationDays,
          material_strength_mpa: 45,
          package_weight_kg: ((currentProject?.product.weight_g || 450) + (currentDesign?.weight_g || 180)) / 1000,
          perimeter_mm: perimeter,
          thickness_mm: currentDesign?.thickness_mm || 3.0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompressionResult(data);
      }
    } catch (err) {
      console.error('Compression test error:', err);
    } finally {
      setIsSimulatingCompression(false);
    }
  };

  // Run Vibration Simulation
  const runVibrationSimulation = async () => {
    setIsSimulatingVibration(true);
    try {
      const res = await fetch('/api/vibration-test/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transport_mode: vibrationTransitMode,
          distance_km: vibrationDistanceKm,
          cushioning_mm: currentDesign?.cushioning_mm || 16,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVibrationResult(data);
      }
    } catch (err) {
      console.error('Vibration test error:', err);
    } finally {
      setIsSimulatingVibration(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'compression') runCompressionSimulation();
    if (activeTab === 'vibration') runVibrationSimulation();
  }, [activeTab, stackHeight, warehouseDurationDays, vibrationTransitMode, vibrationDistanceKm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Section 9 Simulation Lab
            </span>
            <span className="text-xs text-slate-500 font-mono">ASTM & ISO Virtual Proving Grounds</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Virtual Validation Lab</h1>
          <p className="text-xs text-slate-500 mt-1">
            Validating: <strong className="text-slate-800">{currentProject?.name}</strong> • Active Substrate:{' '}
            <strong className="text-slate-800">{currentDesign?.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/studio')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Box className="w-4 h-4 text-emerald-600" />
            <span>3D Studio</span>
          </button>

          <button
            onClick={() => navigate('/optimizer')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Optimizer Suite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Interactive Test Station Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('drop')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'drop'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>1. Drop Impact Test (ASTM D5276 / ISTA)</span>
        </button>

        <button
          onClick={() => setActiveTab('compression')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'compression'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Archive className="w-4 h-4 text-blue-400" />
          <span>2. Box Compression (ISO 12048 McKee BCT)</span>
        </button>

        <button
          onClick={() => setActiveTab('vibration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'vibration'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-400" />
          <span>3. Transit Vibration (ASTM D4728 Profile)</span>
        </button>
      </div>

      {/* TAB 1: 3D DROP TEST APPARATUS */}
      {activeTab === 'drop' && (
        <div className="space-y-6">
          <VirtualDropTest3D
            materialId={currentDesign?.material_id || 'mat_hybrid'}
            materialName={currentDesign?.material_name || 'Hybrid Recycled Packaging'}
            productWeight_g={currentProject?.product.weight_g || 450}
            productFragility={currentProject?.product.fragility || 'Medium'}
            initialHeight={1.5}
            onTestComplete={handleDropComplete}
          />

          {dropResult && (
            <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">ASTM Drop Simulation Completed</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Protection rating of <strong>{dropResult.protection_score}/100</strong> has been synced with your design metrics. Peak shock deceleration was <strong>{dropResult.peak_g} G</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/optimizer')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-xs shrink-0"
              >
                Re-weight In Optimizer
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BOX COMPRESSION TEST (BCT & MCKEE FORMULA) */}
      {activeTab === 'compression' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Archive className="w-4 h-4 text-blue-600" />
                Warehouse Stacking Variables
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                McKee formula: BCT = 5.876 × ECT × √(Perimeter × Thickness)
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Warehouse Stack Height</span>
                <span className="font-bold text-slate-900">{stackHeight} boxes high</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={stackHeight}
                onChange={e => setStackHeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 box</span>
                <span>5 pallet layer</span>
                <span>10 ceiling limit</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Storage Duration in Warehouse</span>
                <span className="font-bold text-slate-900">{warehouseDurationDays} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="180"
                step="5"
                value={warehouseDurationDays}
                onChange={e => setWarehouseDurationDays(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 day</span>
                <span>30 days</span>
                <span>180 days (humidity fatigue)</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Active Box Geometry:</span>
              <div className="text-slate-600">
                Perimeter: {(((currentDesign?.length_mm || 120) + (currentDesign?.width_mm || 120)) * 2)} mm
              </div>
              <div className="text-slate-600">
                Wall Caliper: {currentDesign?.thickness_mm || 3.0} mm
              </div>
              <div className="text-slate-600">
                Unit Gross Weight: {(((currentProject?.product.weight_g || 450) + (currentDesign?.weight_g || 180)) / 1000).toFixed(2)} kg
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-8 space-y-6">
            {compressionResult && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Calculated BCT</span>
                    <span className="text-2xl font-black text-slate-900">
                      {compressionResult.box_compression_strength_n} N
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      {(compressionResult.box_compression_strength_n / 9.81).toFixed(1)} kgf peak strength
                    </span>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Dynamic Bottom Load</span>
                    <span className="text-2xl font-black text-slate-900">
                      {compressionResult.bottom_box_load_n} N
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Exerted by {stackHeight - 1} top boxes
                    </span>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Safety Factor (Target &gt;2.0)</span>
                    <span className={`text-2xl font-black ${compressionResult.safety_factor >= 2.0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {compressionResult.safety_factor}x
                    </span>
                    <span className={`text-[11px] font-bold block mt-1 ${compressionResult.safety_factor >= 2.0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      Verdict: {compressionResult.verdict}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Engineering Analysis & Creep Derating
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {compressionResult.explanation}
                  </p>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    Calculated in accordance with ISO 12048 and ASTM D642. Includes humidity creep degradation factors.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSIT VIBRATION PROFILE */}
      {activeTab === 'vibration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                Vibration Profile Variables
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ASTM D4728 Random Vibration PSD Spectrum
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Transit Profile Spectrum</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Road', 'Rail', 'Air', 'Sea'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setVibrationTransitMode(mode)}
                    className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      vibrationTransitMode === mode
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
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

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Haul Transit Distance</span>
                <span className="font-bold text-slate-900">{vibrationDistanceKm} km</span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={vibrationDistanceKm}
                onChange={e => setVibrationDistanceKm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-8 space-y-6">
            {vibrationResult && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Resonant Frequency</span>
                    <span className="text-2xl font-black text-slate-900">
                      {vibrationResult.resonance_frequency_hz} Hz
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Critical chassis band
                    </span>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Damage Probability</span>
                    <span className="text-2xl font-black text-emerald-600">
                      {vibrationResult.damage_probability_pct}%
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Low shock fatigue risk
                    </span>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Cushion Settling</span>
                    <span className="text-2xl font-black text-slate-900">
                      {vibrationResult.loose_fill_settling_mm} mm
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Compaction allowance
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    Vibration Mitigation Analysis (ASTM D4728)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {vibrationResult.recommendation}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
