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
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  // Initialize notifications from mockData
  useEffect(() => {
    const initialNotifs = alerts
      .slice(0, 5)
      .map(alert => ({
        id: alert.id,
        region: alert.region,
        description: alert.description,
        severity: alert.severity,
        timestamp: alert.timestamp,
        read: false
      }));
    setNotifs(initialNotifs);
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    // Mark as read
    setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setNotificationsOpen(false);
    navigate(`/alerts?q=${encodeURIComponent(notif.id)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/alerts?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

      <div className={`navbar-center ${searchOpen ? 'open' : ''}`}>
        <form onSubmit={handleSearchSubmit} className={`search-bar ${searchOpen ? 'open' : ''}`}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search regions, alerts..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          {searchOpen && (
            <button type="button" className="search-close-btn" onClick={() => setSearchOpen(false)}>
              <X size={18} />
            </button>
          )}
        </form>
      </div>

      <div className="navbar-right">
        <button className="nav-icon-btn" onClick={() => setSearchOpen(!searchOpen)}>
          {searchOpen ? <X size={20} /> : <Search size={20} />}
        </button>
        
        <div className="notification-container" ref={notificationRef}>
          <button className="nav-icon-btn notification-btn" onClick={() => setNotificationsOpen(!notificationsOpen)}>
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
                  View all alerts
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
  );
}
