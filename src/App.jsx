import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SatelliteView from './pages/SatelliteView';
import Alerts from './pages/Alerts';
import TemporalAnalysis from './pages/TemporalAnalysis';
import Reports from './pages/Reports';
import HuntingConsole from './pages/HuntingConsole';
import GlobalMap from './pages/GlobalMap';
import DatasetManager from './pages/DatasetManager';
import './App.css';

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isGlobalMap = location.pathname === '/global';

  return (
    <div className={`app-container ${isLanding ? 'landing-layout' : 'dashboard-layout'}`}>
      <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`main-content ${(isLanding || isGlobalMap) ? 'full-width' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isGlobalMap ? 'map-active' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/global" element={<GlobalMap />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/satellite" element={<SatelliteView />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/hunting" element={<HuntingConsole />} />
          <Route path="/analysis" element={<TemporalAnalysis />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/datasets" element={<DatasetManager />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
