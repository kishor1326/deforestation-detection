import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Satellite, AlertTriangle, BarChart3, FileText, Globe, ChevronLeft, ChevronRight, Crosshair, Database } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/global', icon: Globe, label: 'Global Map' },
  { path: '/satellite', icon: Satellite, label: 'Satellite View' },
  { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { path: '/hunting', icon: Crosshair, label: 'Hunting AI' },
  { path: '/analysis', icon: BarChart3, label: 'Analysis' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/datasets', icon: Database, label: 'Datasets' }
];

export default function Sidebar({ collapsed, onToggle, onLinkClick }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) return null;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : 'open'}`}>
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onLinkClick}
          >
            <item.icon size={20} className="sidebar-icon" />
            <span className="sidebar-label">{item.label}</span>
            {item.path === '/alerts' && (
              <span className="sidebar-badge">5</span>
            )}
          </NavLink>
        ))}
      </div>

      <button className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
