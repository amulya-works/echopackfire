import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext.js';
import { Navbar } from './components/Navbar.js';
import { DemoWorkflowModal } from './components/DemoWorkflowModal.js';
import { FloatingAdvisor } from './components/FloatingAdvisor.js';

import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { NewProjectPage } from './pages/NewProjectPage.js';
import { PackagingStudioPage } from './pages/PackagingStudioPage.js';
import { PackagingOptimizerPage } from './pages/PackagingOptimizerPage.js';
import { VirtualTestLabPage } from './pages/VirtualTestLabPage.js';
import { MaterialIntelligencePage } from './pages/MaterialIntelligencePage.js';
import { LogisticsCarbonPage } from './pages/LogisticsCarbonPage.js';
import { PackagingComparisonPage } from './pages/PackagingComparisonPage.js';
import { ComplianceCenterPage } from './pages/ComplianceCenterPage.js';
import { SupplierEnginePage } from './pages/SupplierEnginePage.js';
import { GlobalBenchmarkingPage } from './pages/GlobalBenchmarkingPage.js';
import { SavingsImpactPage } from './pages/SavingsImpactPage.js';
import { ReportsExportPage } from './pages/ReportsExportPage.js';
import { ScenarioSimulatorPage } from './pages/ScenarioSimulatorPage.js';
import { CompareOptimizePage } from './pages/CompareOptimizePage.js';
import { RecommendationPage } from './pages/RecommendationPage.js';
import { ProjectHistoryPage } from './pages/ProjectHistoryPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          <Navbar />
          <DemoWorkflowModal />

          <main className="flex-1">
            <Routes>
              {/* Core Landing & Auth */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* 14 Main Modules */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects/new" element={<NewProjectPage />} />
              <Route path="/studio" element={<PackagingStudioPage />} />
              <Route path="/optimizer" element={<PackagingOptimizerPage />} />
              <Route path="/validation" element={<VirtualTestLabPage />} />
              <Route path="/drop-test" element={<VirtualTestLabPage />} />
              <Route path="/materials" element={<MaterialIntelligencePage />} />
              <Route path="/logistics" element={<LogisticsCarbonPage />} />
              <Route path="/comparison" element={<PackagingComparisonPage />} />
              <Route path="/compare" element={<CompareOptimizePage />} />
              <Route path="/compliance" element={<ComplianceCenterPage />} />
              <Route path="/suppliers" element={<SupplierEnginePage />} />
              <Route path="/benchmarks" element={<GlobalBenchmarkingPage />} />
              <Route path="/savings" element={<SavingsImpactPage />} />
              <Route path="/reports" element={<ReportsExportPage />} />
              <Route path="/simulator" element={<ScenarioSimulatorPage />} />
              <Route path="/recommendation" element={<RecommendationPage />} />
              <Route path="/history" element={<ProjectHistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>

          <FloatingAdvisor />
        </div>
      </BrowserRouter>
    </ProjectProvider>
  );
}
