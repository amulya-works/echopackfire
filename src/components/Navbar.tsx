import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Layers,
  Box,
  Sliders,
  ShieldCheck,
  FileCheck2,
  Factory,
  BarChart3,
  TrendingUp,
  FileText,
  Settings,
  Sparkles,
  Package,
  ChevronDown,
  Truck,
  ArrowRightLeft,
  Bot,
  Menu,
  X,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProject, launchDemo, demoStep } = useProject();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const primaryNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Layers },
    { name: 'AI Design Studio', path: '/studio', icon: Box },
    { name: 'Packaging Optimizer', path: '/optimizer', icon: Sliders },
    { name: 'Validation Lab', path: '/validation', icon: ShieldCheck },
    { name: 'Material Intelligence', path: '/materials', icon: Layers },
    { name: 'Logistics & Carbon', path: '/logistics', icon: Truck },
    { name: 'Comparison', path: '/comparison', icon: ArrowRightLeft },
  ];

  const secondaryNavItems = [
    { name: 'Compliance Center', path: '/compliance', icon: FileCheck2 },
    { name: 'Supplier Engine', path: '/suppliers', icon: Factory },
    { name: 'Global Benchmarking', path: '/benchmarks', icon: BarChart3 },
    { name: 'Savings & Impact', path: '/savings', icon: TrendingUp },
    { name: 'Reports & Export', path: '/reports', icon: FileText },
    { name: 'Scenario Simulator', path: '/simulator', icon: Sliders },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLaunchDemoClick = async () => {
    await launchDemo();
    navigate('/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-5">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
                <Package className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1 leading-none">
                  <span className="text-lg font-black tracking-tight text-emerald-600">EchoPack</span>
                  <span className="text-xs font-semibold text-slate-400">Intelligence</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium tracking-tight hidden sm:block">
                  Design smarter. Protect better. Waste less.
                </span>
              </div>
            </Link>

            {/* Active Project Pill */}
            {activeProject && (
              <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs">
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                    {activeProject.name}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    {activeProject.designs?.[0]?.material_name || 'Active Workspace'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 h-16">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in"
                  onMouseLeave={() => setIsMoreOpen(false)}
                >
                  {secondaryNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMoreOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Actions & Demo Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLaunchDemoClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                demoStep > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Reset and launch judge demonstration workflow"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>{demoStep > 0 ? `Demo (${demoStep}/9)` : 'Demo Mode'}</span>
            </button>

            <Link
              to="/projects/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <span>+ New Project</span>
            </Link>

            {/* Mobile hamburger toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto">
          {[...primaryNavItems, ...secondaryNavItems].map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
