import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Search, User, Shield } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ onToggleSidebar }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          <span></span><span></span><span></span>
        </button>
        <Link to="/" className="navbar-brand">
          <Shield size={28} className="brand-icon" />
          <span className="brand-text">ForestGuard</span>
        </Link>
      </div>

      <div className="navbar-center">
        <div className={`search-bar ${searchOpen ? 'open' : ''}`}>
          <Search size={18} />
          <input type="text" placeholder="Search regions, alerts..." />
        </div>
      </div>

      <div className="navbar-right">
        <button className="nav-icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
          <Search size={20} />
        </button>
        <button className="nav-icon-btn notification-btn">
          <Bell size={20} />
          <span className="notification-badge">5</span>
        </button>
        <div className="nav-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="profile-info">
            <span className="profile-name">Admin</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
