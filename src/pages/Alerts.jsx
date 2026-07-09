import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter, MapPin, Clock, ChevronUp, ExternalLink, Shield } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AlertBadge from '../components/AlertBadge';
import { alerts } from '../data/mockData';
import './Alerts.css';

const severityCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
};

const formatTime = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

export default function Alerts() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [search, setSearch] = useState(query);
    const [severityFilter, setSeverityFilter] = useState('all');
    const [expanded, setExpanded] = useState(null);

    // Sync state with URL search query changes
    useEffect(() => {
        setSearch(query);
    }, [query]);

    const handleSearchChange = (value) => {
        setSearch(value);
        if (value) {
            setSearchParams({ q: value });
        } else {
            setSearchParams({});
        }
    };

    const filtered = alerts.filter(a => {
        const matchSearch = a.region.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
        const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
        return matchSearch && matchSeverity;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Alerts</h1>
                <p>Monitor and manage deforestation detection alerts</p>
            </div>

            {/* Summary Cards */}
            <div className="alert-summary">
                <div className="summary-card glass-card critical-card">
                    <div className="pulse-ring"></div>
                    <div className="summary-icon"><AlertTriangle size={24} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{severityCounts.critical}</span>
                        <span className="summary-label">Critical</span>
                    </div>
                </div>
                <div className="summary-card glass-card">
                    <div className="summary-icon high"><AlertTriangle size={24} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{severityCounts.high}</span>
                        <span className="summary-label">High</span>
                    </div>
                </div>
                <div className="summary-card glass-card">
                    <div className="summary-icon medium"><AlertTriangle size={24} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{severityCounts.medium}</span>
                        <span className="summary-label">Medium</span>
                    </div>
                </div>
                <div className="summary-card glass-card">
                    <div className="summary-icon low"><Shield size={24} /></div>
                    <div className="summary-info">
                        <span className="summary-value">{severityCounts.low}</span>
                        <span className="summary-label">Low</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="alerts-filters glass-card">
                <div className="filter-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search alerts by region or ID..."
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={14} />
                    <span className="filter-label">Severity:</span>
                    {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                        <button
                            key={s}
                            className={`filter-chip chip-${s} ${severityFilter === s ? 'active' : ''}`}
                            onClick={() => setSeverityFilter(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alert Feed */}
            <div className="alerts-feed">
                {filtered.length === 0 ? (
                    <div className="no-results">
                        <Search size={48} />
                        <h3>No alerts found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filtered.map((a, i) => (
                        <div
                            key={a.id}
                            className={`alert-card glass-card animate-fade-in-up ${a.severity === 'critical' ? 'critical-pulse' : ''}`}
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <div className="alert-card-main" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                                <div className="alert-card-left">
                                    <AlertBadge severity={a.severity} />
                                    <div className="alert-card-info">
                                        <div className="alert-card-title">
                                            <span className="alert-id">{a.id}</span>
                                            <span className="alert-region-name">{a.region}</span>
                                        </div>
                                        <div className="alert-card-meta">
                                            <span><MapPin size={12} /> {a.area}</span>
                                            <span><Clock size={12} /> {formatTime(a.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="alert-card-right">
                                    <div className="alert-stats">
                                        <div className="alert-stat">
                                            <span className="stat-val">{a.confidence}%</span>
                                            <span className="stat-lbl">Confidence</span>
                                        </div>
                                    </div>
                                    <span className={`status-badge status-${a.status}`}>{a.status}</span>
                                    <ChevronUp size={16} className={`expand-icon ${expanded === a.id ? '' : 'rotated'}`} />
                                </div>
                            </div>

                            {expanded === a.id && (
                                <div className="alert-card-expanded">
                                    <p className="alert-description">{a.description}</p>
                                    <div className="alert-actions">
                                        <button className="btn-primary action-btn">
                                            <ExternalLink size={14} /> View Details
                                        </button>
                                        <button className="btn-secondary action-btn escalate">
                                            <AlertTriangle size={14} /> Escalate
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
