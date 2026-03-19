import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, ComposedChart,
} from 'recharts';
import { timeSeriesData, regionComparisonData, predictionData, heatmapData } from '../data/mockData';
import './TemporalAnalysis.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TemporalAnalysis() {
  const [activeTab, setActiveTab] = useState('trends');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Temporal Analysis</h1>
        <p>Track forest cover changes over time and predict future deforestation trends</p>
      </div>

      {/* Tabs */}
      <div className="analysis-tabs">
        {[
          { id: 'trends', label: 'Forest Trends', icon: TrendingUp },
          { id: 'heatmap', label: 'Event Calendar', icon: Calendar },
          { id: 'comparison', label: 'Region Comparison', icon: BarChart3 },
        ].map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="tab-content animate-fade-in">
          <div className="trends-grid">
            <div className="chart-card glass-card">
              <div className="card-header">
                <h3>Forest Cover Over Time</h3>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="forestGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00c853" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00c853" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
                    <XAxis dataKey="month" tick={{ fill: '#5a7d62', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#5a7d62', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 5000', 'dataMax + 5000']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="forestCover" stroke="#00c853" fill="url(#forestGrad)" strokeWidth={2} name="Forest Cover (km²)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card glass-card">
              <div className="card-header">
                <h3>Prediction Forecast</h3>
                <span className="forecast-badge">AI Predicted</span>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={predictionData}>
                    <defs>
                      <linearGradient id="predRange" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffab40" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#ffab40" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
                    <XAxis dataKey="month" tick={{ fill: '#5a7d62', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#5a7d62', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="url(#predRange)" name="Upper Bound" />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" name="Lower Bound" />
                    <Line type="monotone" dataKey="predicted" stroke="#ffab40" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: '#ffab40', r: 4 }} name="Predicted (ha)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Tab */}
      {activeTab === 'heatmap' && (
        <div className="tab-content animate-fade-in">
          <div className="heatmap-card glass-card">
            <div className="card-header">
              <h3>Detection Events Calendar — 2026</h3>
            </div>
            <div className="heatmap-grid">
              <div className="heatmap-months">
                {months.slice(0, 3).map(m => (
                  <span key={m} className="heatmap-month-label">{m}</span>
                ))}
              </div>
              <div className="heatmap-days">
                {weekDays.map(d => (
                  <span key={d} className="heatmap-day-label">{d}</span>
                ))}
              </div>
              <div className="heatmap-cells">
                {Array.from({ length: 70 }).map((_, i) => {
                  const matchData = heatmapData[i % heatmapData.length];
                  const count = i < 70 ? (matchData ? matchData.count : Math.floor(Math.random() * 12)) : 0;
                  const intensity = Math.min(count / 12, 1);
                  return (
                    <div
                      key={i}
                      className="heatmap-cell"
                      title={`${count} events`}
                      style={{
                        background: count === 0
                          ? 'var(--color-bg-secondary)'
                          : `rgba(0, 200, 83, ${0.15 + intensity * 0.7})`,
                        borderColor: count > 8 ? 'rgba(255, 82, 82, 0.5)' : 'transparent',
                      }}
                    />
                  );
                })}
              </div>
              <div className="heatmap-legend">
                <span>Less</span>
                <div className="legend-cells">
                  {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v, i) => (
                    <div key={i} className="legend-cell" style={{ background: v === 0 ? 'var(--color-bg-secondary)' : `rgba(0, 200, 83, ${0.15 + v * 0.7})` }} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="tab-content animate-fade-in">
          <div className="comparison-grid">
            <div className="chart-card glass-card">
              <div className="card-header">
                <h3>Region Comparison — Deforestation Rate (ha)</h3>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={regionComparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
                    <XAxis type="number" tick={{ fill: '#5a7d62', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="region" type="category" tick={{ fill: '#5a7d62', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="previous" fill="rgba(0,200,83,0.2)" radius={[0, 4, 4, 0]} name="Previous Period" />
                    <Bar dataKey="current" fill="#00c853" radius={[0, 4, 4, 0]} name="Current Period" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="region-change-list glass-card">
              <div className="card-header">
                <h3>Change by Region</h3>
              </div>
              <div className="change-items">
                {regionComparisonData.map((r, i) => (
                  <div key={i} className="change-item animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="change-region">{r.region}</span>
                    <div className="change-bar-wrapper">
                      <div className="change-bar" style={{ width: `${(r.current / 6000) * 100}%` }} />
                    </div>
                    <div className={`change-pct ${r.change > 20 ? 'high' : 'moderate'}`}>
                      {r.change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {r.change}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
