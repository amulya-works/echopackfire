import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext.js';
import {
  Settings,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Compass,
  Globe,
  Sliders,
  ShieldAlert,
  Save,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { launchDemo, refreshProjects } = useProject();

  const [unitSystem, setUnitSystem] = useState<'Metric' | 'Imperial'>('Metric');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [defaultTransport, setDefaultTransport] = useState<'Road' | 'Rail' | 'Air' | 'Sea'>('Road');
  const [optimizationWeightDefault, setOptimizationWeightDefault] = useState('Balanced');
  const [isResetting, setIsResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleResetDemo = async () => {
    if (window.confirm('Reset all demo projects and return to initial state?')) {
      setIsResetting(true);
      await launchDemo();
      setIsResetting(false);
      alert('Demo data successfully restored to pristine state.');
    }
  };

  const handleSavePreferences = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            System Preferences
          </span>
          <span className="text-xs text-slate-500 font-mono">Platform Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Platform Settings</h1>
        <p className="text-sm text-slate-600 mt-1">
          Customize measurement standards, procurement currencies, and default simulation parameters.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-emerald-600" />
            Engineering & Regional Units
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Measurement System</label>
              <select
                value={unitSystem}
                onChange={e => setUnitSystem(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Metric">Metric (mm, grams, kg CO₂e)</option>
                <option value="Imperial">Imperial (inches, ounces, lbs CO₂e)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Standardizes CAD dimensions and tensile load conversions.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Procurement Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Converts material substrate rates and transport freight tariffs.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Compass className="w-4 h-4 text-emerald-600" />
            Simulation & Optimization Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Default Freight Mode</label>
              <select
                value={defaultTransport}
                onChange={e => setDefaultTransport(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Road">🚛 Road Truck (0.092 kg CO₂e/t-km)</option>
                <option value="Rail">🚂 Rail Freight (0.028 kg CO₂e/t-km)</option>
                <option value="Sea">🚢 Ocean Freight (0.015 kg CO₂e/t-km)</option>
                <option value="Air">✈️ Air Freight (0.602 kg CO₂e/t-km)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Default Optimization Preset</label>
              <select
                value={optimizationWeightDefault}
                onChange={e => setOptimizationWeightDefault(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Balanced">Balanced Engineering (Equal weights)</option>
                <option value="Lowest Cost">Lowest Cost Priority</option>
                <option value="Lowest Carbon">Lowest Carbon / ESG Priority</option>
                <option value="Maximum Protection">Maximum Protection (High Fragility)</option>
                <option value="Best Recyclability">Maximum Circularity / 100% Recyclable</option>
                <option value="Most Compact">Logistics Cube & Freight Density</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <div>
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully.
              </span>
            )}
          </div>
          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset Demo Data */}
      <div className="bg-rose-50 rounded-xl border border-rose-200 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-rose-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Demo Data Management
            </h2>
            <p className="text-xs text-rose-700 mt-1 max-w-xl">
              Reset all projects, design options, drop tests, and simulation states back to the original demo datasets (Smart Water Bottle, Laptop, Organic Cosmetics).
            </p>
          </div>

          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Resetting...' : 'Reset All Demo Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
