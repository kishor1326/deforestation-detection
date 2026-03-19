import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Clock } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatCard from '../components/StatCard';
import AlertBadge from '../components/AlertBadge';
import { kpiStats, alerts, timeSeriesData, regionComparisonData } from '../data/mockData';
import './Dashboard.css';

const severityColor = {
    critical: '#ff1744',
    high: '#ff6d00',
    medium: '#ffab00',
    low: '#00e676',
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="tooltip-label">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
                ))}
            </div>
        );
    }
    return null;
};

const formatTime = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

// A custom map style for a dark theme similar to the previous CARTO dark matter
const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
];

export default function Dashboard() {
    const [selectedAlert, setSelectedAlert] = useState(null);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Real-time deforestation monitoring overview</p>
            </div>

            {/* KPI Row */}
            <div className="kpi-grid grid-4">
                {kpiStats.map((stat, i) => (
                    <StatCard key={stat.id} {...stat} delay={i * 100} />
                ))}
            </div>

            {/* Map + Recent Alerts */}
            <div className="dashboard-main">
                <div className="map-container glass-card">
                    <div className="card-header">
                        <h3><MapPin size={18} /> Active Alerts Map</h3>
                        <span className="live-indicator"><span className="live-dot"></span> Live</span>
                    </div>
                    <div className="map-wrapper" style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
                            <Map
                                defaultCenter={{ lat: 0, lng: 20 }}
                                defaultZoom={2}
                                gestureHandling="greedy"
                                disableDefaultUI={true}
                                mapId="dashboard_alerts_map"
                                colorScheme="DARK"
                            >
                                {alerts.map(a => (
                                    <AdvancedMarker
                                        key={a.id}
                                        position={{ lat: a.lat, lng: a.lng }}
                                        onClick={() => setSelectedAlert(a)}
                                    >
                                        <Pin
                                            background={severityColor[a.severity]}
                                            borderColor="rgba(255,255,255,0.5)"
                                            glyphColor="white"
                                            scale={a.severity === 'critical' ? 1.2 : a.severity === 'high' ? 1 : 0.8}
                                        />
                                    </AdvancedMarker>
                                ))}
                                {selectedAlert && (
                                    <InfoWindow
                                        position={{ lat: selectedAlert.lat, lng: selectedAlert.lng }}
                                        onCloseClick={() => setSelectedAlert(null)}
                                        headerContent={<strong>{selectedAlert.id} — {selectedAlert.region}</strong>}
                                    >
                                        <div className="map-popup" style={{ color: 'black' }}>
                                            <p>Severity: {selectedAlert.severity} | Confidence: {selectedAlert.confidence}%</p>
                                            <p>Area: {selectedAlert.area}</p>
                                        </div>
                                    </InfoWindow>
                                )}
                            </Map>
                        </APIProvider>
                    </div>
                </div>

                <div className="recent-alerts glass-card">
                    <div className="card-header">
                        <h3>Recent Alerts</h3>
                        <Link to="/alerts" className="view-all">View All <ArrowRight size={14} /></Link>
                    </div>
                    <div className="alerts-list">
                        {alerts.slice(0, 6).map((a, i) => (
                            <div key={a.id} className="alert-item animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="alert-item-left">
                                    <AlertBadge severity={a.severity} />
                                    <div className="alert-item-info">
                                        <span className="alert-region">{a.region}</span>
                                        <span className="alert-area">{a.area}</span>
                                    </div>
                                </div>
                                <div className="alert-item-right">
                                    <span className="alert-confidence">{a.confidence}%</span>
                                    <span className="alert-time"><Clock size={10} /> {formatTime(a.timestamp)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-row">
                <div className="chart-card glass-card">
                    <div className="card-header">
                        <h3>Deforestation Trend</h3>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={timeSeriesData}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00c853" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#00c853" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
                                <XAxis dataKey="month" tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="deforestationRate" stroke="#00c853" fill="url(#colorRate)" strokeWidth={2} name="Deforestation (ha)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card glass-card">
                    <div className="card-header">
                        <h3>Regional Comparison</h3>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={regionComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
                                <XAxis dataKey="region" tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="previous" fill="#1b5e20" radius={[4, 4, 0, 0]} name="Previous" />
                                <Bar dataKey="current" fill="#00c853" radius={[4, 4, 0, 0]} name="Current" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
