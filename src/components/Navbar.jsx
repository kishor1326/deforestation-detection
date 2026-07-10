import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, User, Shield, X, AlertTriangle, Check } from 'lucide-react';
import { alerts } from '../data/mockData';
import './Navbar.css';

const formatTime = (ts) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function Navbar({ onToggleSidebar }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);

  const notificationRef = useRef(null);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  // Initialize notifications from mockData
  useEffect(() => {
    const initialNotifs = alerts.slice(0, 5).map(alert => ({
      id: alert.id,
      region: alert.region,
      description: alert.description || 'Forest disturbance detected.',
      severity: alert.severity,
      timestamp: alert.timestamp,
      read: false
    }));
    setNotifs(initialNotifs);
  }, []);

  // Auto-focus search input when opened on mobile
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close on route change
  useEffect(() => {
    setSearchOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const unreadCount = notifs.filter(n => !n.read).length;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setNotificationsOpen(false);
    navigate(`/alerts`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/alerts`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const handleSearchToggle = () => {
    setSearchOpen(prev => !prev);
    if (!searchOpen) setSearchVal('');
  };

  if (isLanding) return null;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="menu-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <span></span><span></span><span></span>
          </button>
          <Link to="/" className="navbar-brand">
            <Shield size={26} className="brand-icon" />
            <span className="brand-text">ForestGuard</span>
          </Link>
        </div>

        {/* Desktop search bar */}
        <div className="navbar-center">
          <form onSubmit={handleSearchSubmit} className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search regions, alerts..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </form>
        </div>

        <div className="navbar-right">
          {/* Mobile search toggle */}
          <button className="nav-icon-btn search-toggle-btn" onClick={handleSearchToggle} aria-label="Toggle search">
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Notification Bell */}
          <div className="notification-container" ref={notificationRef}>
            <button
              className="nav-icon-btn notification-btn"
              onClick={() => setNotificationsOpen(prev => !prev)}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {notificationsOpen && (
              <div className="notifications-dropdown glass-card">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button className="mark-read-btn" onClick={handleMarkAllRead}>
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifs.length === 0 ? (
                    <div className="no-notifications">
                      <Bell size={24} />
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    notifs.map(notif => (
                      <div
                        key={notif.id}
                        className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="notif-icon-wrapper">
                          <AlertTriangle className={`notif-icon severity-${notif.severity}`} size={16} />
                        </div>
                        <div className="notif-content">
                          <div className="notif-title">
                            <span className="notif-id">{notif.id}</span>
                            <span className="notif-region">{notif.region}</span>
                          </div>
                          <p className="notif-desc">{notif.description}</p>
                          <span className="notif-time">{formatTime(notif.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="notifications-footer">
                  <Link to="/alerts" onClick={() => setNotificationsOpen(false)}>
                    View all alerts →
                  </Link>
                </div>
              </div>
            )}
          </div>

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

      {/* Mobile search overlay — rendered OUTSIDE nav so it covers full viewport */}
      {searchOpen && (
        <div className="mobile-search-overlay">
          <form onSubmit={handleSearchSubmit} className="mobile-search-form">
            <Search size={18} className="mobile-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search regions, alerts..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              autoFocus
            />
            <button type="button" className="search-close-btn" onClick={() => setSearchOpen(false)}>
              <X size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
