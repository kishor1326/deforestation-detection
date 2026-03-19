import React, { useState, useMemo } from 'react';
import { FileText, Calendar, MapPin, Download, Eye, ChevronDown, BarChart3, CheckCircle, TreePine, AlertTriangle, TrendingDown, Globe, Activity, X, Printer } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import {
  reportTypes,
  regions,
  regionComparisonData,
  alerts,
  timeSeriesData,
  historicalImageryData,
  kpiStats,
  heatmapData,
  predictionData
} from '../data/mockData';
import './Reports.css';

/* ─── Helpers ─── */

/* ─── Generate HTML report for download/view ─── */

function generateReportHTML(report) {
  const dates = report.dateRange ? report.dateRange.split(' → ') : ['2020-01-01', '2025-12-31'];
  const dateFrom = dates[0] || '2020-01-01';
  const dateTo = dates[1] || '2025-12-31';

  // Get relevant alerts for the region
  const relevantAlerts = report.region === 'All Regions'
    ? alerts
    : alerts.filter(a => a.region.toLowerCase().includes(report.region.toLowerCase().split(' ')[0]));

  // Get relevant imagery
  const relevantImagery = historicalImageryData.filter(d => {
    const dateMatch = inDateRange(d.date, dateFrom, dateTo);
    if (report.region === 'All Regions') return dateMatch;
    const regionObj = regions.find(r => r.name.toLowerCase().includes(report.region.toLowerCase().split(' ')[0]));
    return dateMatch && (regionObj ? d.region === regionObj.id : true);
  });

  const totalArea = relevantAlerts.reduce((sum, a) => {
    const num = parseFloat(a.area);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const avgNdvi = relevantImagery.length > 0
    ? (relevantImagery.reduce((s, d) => s + d.ndviAvg, 0) / relevantImagery.length).toFixed(3)
    : 'N/A';

  const criticalCount = relevantAlerts.filter(a => a.severity === 'critical').length;
  const highCount = relevantAlerts.filter(a => a.severity === 'high').length;
  const mediumCount = relevantAlerts.filter(a => a.severity === 'medium').length;
  const lowCount = relevantAlerts.filter(a => a.severity === 'low').length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${report.title} — ${report.id}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', 'Inter', sans-serif; background: #0a1a0f; color: #e0e8e4; line-height: 1.6; padding: 40px; }
  .container { max-width: 900px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #00c853; padding-bottom: 24px; margin-bottom: 32px; }
  .header h1 { font-size: 28px; color: #00c853; margin-bottom: 8px; }
  .header .meta { font-size: 13px; color: #6b8a72; display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
  .header .meta span { display: flex; align-items: center; gap: 4px; }
  .section { margin-bottom: 32px; }
  .section h2 { font-size: 20px; color: #69f0ae; margin-bottom: 14px; border-left: 4px solid #00c853; padding-left: 12px; }
  .section h3 { font-size: 16px; color: #a0c8a8; margin-bottom: 10px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .kpi-card { background: #112218; border: 1px solid rgba(0,200,83,0.15); border-radius: 10px; padding: 18px; text-align: center; }
  .kpi-card .value { font-size: 28px; font-weight: 800; color: #00c853; }
  .kpi-card .value.red { color: #ff5252; }
  .kpi-card .label { font-size: 11px; color: #6b8a72; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #112218; color: #69f0ae; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 14px; text-align: left; }
  td { padding: 10px 14px; border-bottom: 1px solid rgba(0,200,83,0.08); font-size: 13px; }
  tr:hover { background: rgba(0,200,83,0.04); }
  .sev { padding: 2px 10px; border-radius: 12px; font-weight: 700; font-size: 11px; text-transform: uppercase; }
  .sev-critical { background: rgba(255,23,68,0.15); color: #ff1744; }
  .sev-high { background: rgba(255,109,0,0.15); color: #ff6d00; }
  .sev-medium { background: rgba(255,171,0,0.15); color: #ffab00; }
  .sev-low { background: rgba(0,200,83,0.15); color: #00c853; }
  .footer { text-align: center; padding-top: 24px; border-top: 1px solid rgba(0,200,83,0.12); margin-top: 40px; font-size: 12px; color: #4a6a52; }
  .imagery-table td:nth-child(4), .imagery-table td:nth-child(5) { font-variant-numeric: tabular-nums; }
  @media print { body { background: white; color: #222; } .kpi-card { border-color: #ccc; } .section h2 { color: #006633; } }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🌍 ${report.title}</h1>
    <div class="meta">
      <span>📋 ${report.id}</span>
      <span>📊 ${report.type}</span>
      <span>📍 ${report.region}</span>
      <span>📅 ${report.dateRange}</span>
      <span>🗓 Generated: ${report.date}</span>
    </div>
  </div>

  <div class="section">
    <h2>Key Metrics</h2>
    <div class="kpi-grid">
      <div class="kpi-card"><div class="value">${relevantAlerts.length}</div><div class="label">Total Alerts</div></div>
      <div class="kpi-card"><div class="value red">${totalArea.toFixed(1)} ha</div><div class="label">Area Affected</div></div>
      <div class="kpi-card"><div class="value">${criticalCount}</div><div class="label">Critical Alerts</div></div>
      <div class="kpi-card"><div class="value">${avgNdvi}</div><div class="label">Avg NDVI</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Alert Severity Summary</h2>
    <div class="kpi-grid">
      <div class="kpi-card"><div class="value" style="color:#ff1744">${criticalCount}</div><div class="label">Critical</div></div>
      <div class="kpi-card"><div class="value" style="color:#ff6d00">${highCount}</div><div class="label">High</div></div>
      <div class="kpi-card"><div class="value" style="color:#ffab00">${mediumCount}</div><div class="label">Medium</div></div>
      <div class="kpi-card"><div class="value" style="color:#00c853">${lowCount}</div><div class="label">Low</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Deforestation Alerts</h2>
    <table>
      <thead><tr><th>Alert ID</th><th>Region</th><th>Severity</th><th>Area Lost</th><th>Coordinates</th></tr></thead>
      <tbody>
        ${relevantAlerts.map(a => `<tr>
          <td>${a.id}</td>
          <td>${a.region}</td>
          <td><span class="sev sev-${a.severity}">${a.severity}</span></td>
          <td>${a.area}</td>
          <td>${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Satellite Imagery Captures</h2>
    <p style="margin-bottom:12px;color:#6b8a72;font-size:13px">${relevantImagery.length} captures found for ${report.region} from ${dateFrom} to ${dateTo}</p>
    <table class="imagery-table">
      <thead><tr><th>Date</th><th>Sensor</th><th>Resolution</th><th>Cloud Cover</th><th>NDVI Avg</th></tr></thead>
      <tbody>
        ${relevantImagery.sort((a, b) => new Date(a.date) - new Date(b.date)).map(d => `<tr>
          <td>${new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
          <td>${d.sensor}</td>
          <td>${d.resolution}</td>
          <td>${d.cloudCover}%</td>
          <td>${d.ndviAvg.toFixed(3)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Region Overview</h2>
    <table>
      <thead><tr><th>Region</th><th>Country</th><th>Area</th><th>Forest Cover</th><th>Risk Level</th></tr></thead>
      <tbody>
        ${(report.region === 'All Regions' ? regions : regions.filter(r => r.name.toLowerCase().includes(report.region.toLowerCase().split(' ')[0]))).map(r => `<tr>
          <td>${r.name}</td>
          <td>${r.country}</td>
          <td>${r.area}</td>
          <td>${r.forestCover}%</td>
          <td><span class="sev sev-${r.riskLevel === 'critical' ? 'critical' : r.riskLevel === 'high' ? 'high' : 'low'}">${r.riskLevel}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Generated by ForestGuard AI Deforestation Detection System</p>
    <p>${report.id} · ${report.type} · ${new Date().toLocaleString()}</p>
  </div>
</div>
</body>
</html>`;
}

/* ─── Report View Modal ─── */

function ReportViewModal({ report, onClose }) {
  if (!report) return null;
  const html = generateReportHTML(report);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_${report.title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="report-modal-title">
            <FileText size={20} />
            <div>
              <h2>{report.title}</h2>
              <span className="report-modal-meta">{report.id} · {report.type} · {report.region} · {report.dateRange}</span>
            </div>
          </div>
          <div className="report-modal-actions">
            <button className="report-modal-btn" onClick={handlePrint} title="Print">
              <Printer size={16} /> Print
            </button>
            <button className="report-modal-btn primary" onClick={handleDownload} title="Download">
              <Download size={16} /> Download
            </button>
            <button className="report-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="report-modal-body">
          <iframe
            srcDoc={html}
            title={report.title}
            className="report-iframe"
          />
        </div>
      </div>
    </div>
  );
}

function regionMatch(alertRegion, regionId) {
  if (regionId === 'all') return true;
  const reg = regions.find(r => r.id === regionId);
  if (!reg) return true;
  const keyword = reg.name.toLowerCase().split(' ')[0];
  return alertRegion.toLowerCase().includes(keyword);
}

function inDateRange(timestamp, dateFrom, dateTo) {
  const t = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const from = new Date(dateFrom).getTime();
  const to = new Date(dateTo).getTime() + 86400000; // include end day
  return t >= from && t <= to;
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#00c853', fontSize: '12px' }}>
            {p.name || p.dataKey}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── Report Preview: Executive Summary ─── */

function ExecutiveSummaryPreview({ dateFrom, dateTo, selectedRegion }) {
  const filteredAlerts = useMemo(() =>
    alerts.filter(a => regionMatch(a.region, selectedRegion)),
    [selectedRegion]
  );

  const filteredImagery = useMemo(() =>
    historicalImageryData
      .filter(d => (selectedRegion === 'all' || d.region === selectedRegion))
      .filter(d => inDateRange(d.date, dateFrom, dateTo)),
    [selectedRegion, dateFrom, dateTo]
  );

  const totalArea = filteredAlerts.reduce((sum, a) => {
    const num = parseFloat(a.area);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // Build pie data from filtered alerts
  const pieGroups = [
    { name: 'Amazon/Brazil', keywords: ['amazon', 'mato', 'rondônia'], color: '#00c853' },
    { name: 'Congo', keywords: ['congo'], color: '#69f0ae' },
    { name: 'Indonesia', keywords: ['sumatra', 'kalimantan', 'borneo'], color: '#ffab40' },
    { name: 'Africa', keywords: ['kruger', 'cameroon', 'madagascar'], color: '#ff5252' },
    { name: 'Oceania', keywords: ['papua'], color: '#448aff' },
    { name: 'India', keywords: ['western ghats', 'northeast india', 'central india', 'sundarbans', 'india'], color: '#ff9100' },
  ];
  const pieData = pieGroups.map(g => ({
    ...g,
    value: filteredAlerts.filter(a => g.keywords.some(k => a.region.toLowerCase().includes(k))).length,
  })).filter(d => d.value > 0);

  // Forest trend filtered by date
  const filteredForestTrend = timeSeriesData
    .filter(d => {
      const monthDate = new Date(d.month.replace(' ', ' 1, '));
      return inDateRange(monthDate, dateFrom, dateTo);
    })
    .map(d => ({
      month: d.month,
      deforestationRate: d.deforestationRate,
      alerts: d.alertsCount,
    }));

  const avgNdvi = filteredImagery.length > 0
    ? (filteredImagery.reduce((s, d) => s + d.ndviAvg, 0) / filteredImagery.length).toFixed(2)
    : 'N/A';

  return (
    <>
      <div className="report-kpi-row">
        <div className="report-kpi">
          <div className="report-kpi-value">{filteredAlerts.length}</div>
          <div className="report-kpi-label">Total Alerts</div>
        </div>
        <div className="report-kpi">
          <div className="report-kpi-value negative">{totalArea.toFixed(1)} ha</div>
          <div className="report-kpi-label">Area Affected</div>
        </div>
        <div className="report-kpi">
          <div className="report-kpi-value">{filteredAlerts.filter(a => a.severity === 'critical').length}</div>
          <div className="report-kpi-label">Critical Alerts</div>
        </div>
        <div className="report-kpi">
          <div className="report-kpi-value">{avgNdvi}</div>
          <div className="report-kpi-label">Avg NDVI</div>
        </div>
      </div>

      <div className="report-filter-badge">
        <span>📍 {selectedRegion === 'all' ? 'All Regions' : regions.find(r => r.id === selectedRegion)?.name}</span>
        <span>📅 {dateFrom} → {dateTo}</span>
        <span>🛰️ {filteredImagery.length} captures</span>
      </div>

      <div className="preview-charts">
        <div className="preview-chart">
          <h4>Alert Distribution by Region</h4>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.map((d, i) => (
                  <span key={i} className="pie-legend-item">
                    <span className="pie-dot" style={{ background: d.color }}></span>
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="no-data-msg">No alert data for this region/date range</div>
          )}
        </div>

        <div className="preview-chart">
          <h4>Deforestation Rate Trend</h4>
          {filteredForestTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={filteredForestTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
                <XAxis dataKey="month" tick={{ fill: '#5a7d62', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="deforestationRate" stroke="#ff5252" fill="rgba(255,82,82,0.15)" strokeWidth={2} name="Deforestation Rate" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-msg">No time-series data in this date range</div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Report Preview: Detailed Analysis ─── */

function DetailedAnalysisPreview({ dateFrom, dateTo, selectedRegion }) {
  const filteredImagery = useMemo(() =>
    historicalImageryData
      .filter(d => (selectedRegion === 'all' || d.region === selectedRegion))
      .filter(d => inDateRange(d.date, dateFrom, dateTo))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        ndvi: d.ndviAvg,
        cloudCover: d.cloudCover,
        sensor: d.sensor,
      })),
    [selectedRegion, dateFrom, dateTo]
  );

  const regionLabel = selectedRegion === 'all' ? 'All Regions' : regions.find(r => r.id === selectedRegion)?.name || selectedRegion;

  // Region comparison filtered
  const filteredComparison = selectedRegion === 'all'
    ? regionComparisonData
    : regionComparisonData.filter(r => {
        const reg = regions.find(rg => rg.id === selectedRegion);
        return reg ? r.region.toLowerCase().includes(reg.name.toLowerCase().split(' ')[0]) : true;
      });

  return (
    <div className="preview-charts">
      <div className="report-filter-badge">
        <span>📍 {regionLabel}</span>
        <span>📅 {dateFrom} → {dateTo}</span>
        <span>🛰️ {filteredImagery.length} captures found</span>
      </div>

      <div className="preview-chart">
        <h4>NDVI Vegetation Trend — {regionLabel}</h4>
        {filteredImagery.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={filteredImagery}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
              <XAxis dataKey="date" tick={{ fill: '#5a7d62', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0.2, 1.0]} tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ndvi" stroke="#00c853" strokeWidth={2} dot={{ r: 3, fill: '#00c853' }} name="NDVI" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-msg">No satellite captures for {regionLabel} in this date range</div>
        )}
      </div>

      <div className="preview-chart">
        <h4>Cloud Cover per Capture (%) — {regionLabel}</h4>
        {filteredImagery.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={filteredImagery}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
              <XAxis dataKey="date" tick={{ fill: '#5a7d62', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cloudCover" fill="#448aff" radius={[3, 3, 0, 0]} name="Cloud Cover %" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-msg">No data available</div>
        )}
      </div>

      {filteredComparison.length > 0 && (
        <div className="preview-chart">
          <h4>Region Comparison — Current vs Previous Period</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={filteredComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
              <XAxis dataKey="region" tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="previous" fill="rgba(0,200,83,0.3)" radius={[3, 3, 0, 0]} name="Previous" />
              <Bar dataKey="current" fill="#00c853" radius={[3, 3, 0, 0]} name="Current" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ─── Report Preview: Alert Report ─── */

function AlertReportPreview({ dateFrom, dateTo, selectedRegion }) {
  const filteredAlerts = useMemo(() =>
    alerts.filter(a => regionMatch(a.region, selectedRegion)),
    [selectedRegion]
  );

  const sevData = useMemo(() => [
    { name: 'Critical', count: filteredAlerts.filter(a => a.severity === 'critical').length, color: '#ff1744' },
    { name: 'High', count: filteredAlerts.filter(a => a.severity === 'high').length, color: '#ff6d00' },
    { name: 'Medium', count: filteredAlerts.filter(a => a.severity === 'medium').length, color: '#ffab00' },
    { name: 'Low', count: filteredAlerts.filter(a => a.severity === 'low').length, color: '#00c853' },
  ], [filteredAlerts]);

  const filteredForestTrend = timeSeriesData
    .filter(d => {
      const monthDate = new Date(d.month.replace(' ', ' 1, '));
      return inDateRange(monthDate, dateFrom, dateTo);
    })
    .map(d => ({ month: d.month, alerts: d.alertsCount }));

  const regionLabel = selectedRegion === 'all' ? 'All Regions' : regions.find(r => r.id === selectedRegion)?.name || selectedRegion;

  return (
    <div className="preview-charts">
      <div className="report-filter-badge">
        <span>📍 {regionLabel}</span>
        <span>📅 {dateFrom} → {dateTo}</span>
        <span>⚠️ {filteredAlerts.length} alerts</span>
      </div>

      <div className="preview-chart">
        <h4>Alert Severity Breakdown — {regionLabel}</h4>
        <div className="severity-bars">
          {sevData.map((s, i) => (
            <div key={i} className="severity-bar-row">
              <span className="severity-label" style={{ color: s.color }}>{s.name}</span>
              <div className="severity-bar-track">
                <div className="severity-bar-fill" style={{ width: `${filteredAlerts.length > 0 ? (s.count / filteredAlerts.length) * 100 : 0}%`, background: s.color }} />
              </div>
              <span className="severity-count">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="preview-chart">
        <h4>Alert Events — {regionLabel} ({filteredAlerts.length} total)</h4>
        <div className="alert-preview-list">
          {filteredAlerts.length > 0 ? filteredAlerts.slice(0, 8).map(alert => (
            <div key={alert.id} className="alert-preview-item">
              <div className="alert-preview-left">
                <AlertTriangle size={14} style={{ color: alert.severity === 'critical' ? '#ff1744' : alert.severity === 'high' ? '#ff6d00' : '#ffab00', flexShrink: 0 }} />
                <div>
                  <span className="alert-preview-id">{alert.id}</span>
                  <span className="alert-preview-region">{alert.region}</span>
                </div>
              </div>
              <span className={`alert-preview-severity sev-${alert.severity}`}>{alert.severity}</span>
              <span className="alert-preview-area">{alert.area}</span>
            </div>
          )) : (
            <div className="no-data-msg">No alerts for this region</div>
          )}
        </div>
      </div>

      {filteredForestTrend.length > 0 && (
        <div className="preview-chart">
          <h4>Monthly Alert Count</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={filteredForestTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#5a7d62', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="alerts" fill="#ff5252" radius={[3, 3, 0, 0]} name="Alert Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ─── Report Preview: Compliance Report ─── */

function ComplianceReportPreview({ dateFrom, dateTo, selectedRegion }) {
  const filteredCompliance = useMemo(() => {
    const data = regions.map(r => ({
      region: r.name.split(' ')[0],
      id: r.id,
      compliance: r.riskLevel === 'critical' ? 45 : r.riskLevel === 'high' ? 62 : 78,
      protected: Math.round(r.forestCover * 0.6),
      violations: r.riskLevel === 'critical' ? 12 : r.riskLevel === 'high' ? 7 : 3,
      forestCover: r.forestCover,
    }));
    return selectedRegion === 'all' ? data : data.filter(d => d.id === selectedRegion);
  }, [selectedRegion]);

  const avgCompliance = filteredCompliance.length > 0
    ? Math.round(filteredCompliance.reduce((s, c) => s + c.compliance, 0) / filteredCompliance.length)
    : 0;
  const totalViolations = filteredCompliance.reduce((s, c) => s + c.violations, 0);
  const regionLabel = selectedRegion === 'all' ? 'All Regions' : regions.find(r => r.id === selectedRegion)?.name || selectedRegion;

  return (
    <div className="preview-charts">
      <div className="report-filter-badge">
        <span>📍 {regionLabel}</span>
        <span>📅 {dateFrom} → {dateTo}</span>
        <span>📊 {filteredCompliance.length} regions</span>
      </div>

      <div className="preview-chart">
        <h4>Compliance Score — {regionLabel}</h4>
        <ResponsiveContainer width="100%" height={Math.max(120, filteredCompliance.length * 40)}>
          <BarChart data={filteredCompliance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="region" tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="compliance" fill="#00c853" radius={[0, 4, 4, 0]} name="Compliance %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="preview-chart">
        <h4>Protected Area vs Violations</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={filteredCompliance}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,83,0.1)" />
            <XAxis dataKey="region" tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5a7d62', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="protected" fill="#69f0ae" radius={[4, 4, 0, 0]} name="Protected %" />
            <Bar dataKey="violations" fill="#ff5252" radius={[4, 4, 0, 0]} name="Violations" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="compliance-summary">
        <div className="compliance-stat">
          <Globe size={18} className="compliance-icon green" />
          <div>
            <div className="compliance-stat-value">{filteredCompliance.length}</div>
            <div className="compliance-stat-label">Regions</div>
          </div>
        </div>
        <div className="compliance-stat">
          <CheckCircle size={18} className="compliance-icon green" />
          <div>
            <div className="compliance-stat-value">{avgCompliance}%</div>
            <div className="compliance-stat-label">Avg Compliance</div>
          </div>
        </div>
        <div className="compliance-stat">
          <AlertTriangle size={18} className="compliance-icon red" />
          <div>
            <div className="compliance-stat-value">{totalViolations}</div>
            <div className="compliance-stat-label">Violations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

const defaultReports = [
  { id: 'RPT-001', title: 'Amazon Basin Q1 2026 Report', type: 'Detailed Analysis', region: 'Amazon Basin', dateRange: '2025-01-01 → 2025-12-31', date: '2026-03-08', status: 'ready', pages: 42 },
  { id: 'RPT-002', title: 'Global Executive Summary', type: 'Executive Summary', region: 'All Regions', dateRange: '2020-01-01 → 2025-12-31', date: '2026-03-01', status: 'ready', pages: 12 },
  { id: 'RPT-003', title: 'Borneo Alert Compilation', type: 'Alert Report', region: 'Borneo', dateRange: '2024-01-01 → 2025-12-31', date: '2026-02-25', status: 'ready', pages: 28 },
  { id: 'RPT-004', title: 'Congo Basin Compliance Review', type: 'Compliance Report', region: 'Congo Basin', dateRange: '2020-01-01 → 2025-12-31', date: '2026-02-20', status: 'ready', pages: 18 },
];

export default function Reports() {
  const [selectedType, setSelectedType] = useState('summary');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [dateFrom, setDateFrom] = useState('2020-01-01');
  const [dateTo, setDateTo] = useState('2025-12-31');
  const [generating, setGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState(defaultReports);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);

  const handleViewReport = (report) => {
    setViewingReport(report);
  };

  const handleDownloadReport = (report) => {
    const html = generateReportHTML(report);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_${report.title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setReportGenerated(false);
    setTimeout(() => {
      const regionName = selectedRegion === 'all' ? 'All Regions' : regions.find(r => r.id === selectedRegion)?.name || selectedRegion;
      const typeName = reportTypes.find(r => r.id === selectedType)?.name || 'Report';
      const newId = `RPT-${String(generatedReports.length + 1).padStart(3, '0')}`;
      const pages = Math.floor(Math.random() * 30) + 10;

      const newReport = {
        id: newId,
        title: `${regionName} ${typeName}`,
        type: typeName,
        region: regionName,
        dateRange: `${dateFrom} → ${dateTo}`,
        date: new Date().toISOString().split('T')[0],
        status: 'ready',
        pages,
      };

      setGeneratedReports(prev => [newReport, ...prev]);
      setGenerating(false);
      setReportGenerated(true);
      setTimeout(() => setReportGenerated(false), 4000);
    }, 2000);
  };

  const renderPreview = () => {
    switch (selectedType) {
      case 'summary':
        return <ExecutiveSummaryPreview dateFrom={dateFrom} dateTo={dateTo} selectedRegion={selectedRegion} />;
      case 'detailed':
        return <DetailedAnalysisPreview dateFrom={dateFrom} dateTo={dateTo} selectedRegion={selectedRegion} />;
      case 'alert':
        return <AlertReportPreview dateFrom={dateFrom} dateTo={dateTo} selectedRegion={selectedRegion} />;
      case 'compliance':
        return <ComplianceReportPreview dateFrom={dateFrom} dateTo={dateTo} selectedRegion={selectedRegion} />;
      default:
        return <ExecutiveSummaryPreview dateFrom={dateFrom} dateTo={dateTo} selectedRegion={selectedRegion} />;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reports & Analysis</h1>
        <p>Generate comprehensive deforestation reports powered by historical satellite data (2020–2025)</p>
      </div>

      {/* Data Overview Strip */}
      <div className="data-overview-strip">
        <div className="data-chip"><Globe size={14} /> <strong>{regions.length}</strong> Regions</div>
        <div className="data-chip"><AlertTriangle size={14} /> <strong>{alerts.length}</strong> Alerts</div>
        <div className="data-chip"><Activity size={14} /> <strong>{historicalImageryData.length}</strong> Satellite Captures</div>
        <div className="data-chip"><TrendingDown size={14} /> <strong>{timeSeriesData.length}</strong> Monthly Data Points</div>
        <div className="data-chip"><Calendar size={14} /> <strong>2020–2025</strong> Range</div>
      </div>

      <div className="reports-layout">
        {/* Generate Report */}
        <div className="report-generator glass-card">
          <h3><FileText size={18} /> Generate New Report</h3>

          <div className="form-group">
            <label>Report Type</label>
            <div className="report-type-grid">
              {reportTypes.map(rt => (
                <button
                  key={rt.id}
                  className={`type-card ${selectedType === rt.id ? 'active' : ''}`}
                  onClick={() => setSelectedType(rt.id)}
                >
                  <FileText size={20} />
                  <span className="type-name">{rt.name}</span>
                  <span className="type-desc">{rt.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Region</label>
              <div className="select-wrapper">
                <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
                  <option value="all">All Regions</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </div>
            </div>
            <div className="form-group">
              <label>From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="form-group">
              <label>To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          <button className={`btn-primary generate-btn ${generating ? 'loading' : ''}`} onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <div className="spinner"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText size={16} />
                Generate Report
              </>
            )}
          </button>

          {reportGenerated && (
            <div className="report-success-msg">
              <CheckCircle size={16} />
              Report generated successfully! See it below in Previous Reports.
            </div>
          )}
        </div>

        {/* Report Preview — Dynamic Based on Type, Region, and Dates */}
        <div className="report-preview glass-card">
          <h3><Eye size={18} /> Report Preview</h3>
          <div className="preview-content">
            <div className="preview-header-info">
              <span className="preview-type">{reportTypes.find(r => r.id === selectedType)?.name}</span>
              <span className="preview-date">{dateFrom} to {dateTo}</span>
            </div>
            {renderPreview()}
          </div>
        </div>
      </div>

      {/* Previous Reports */}
      <div className="previous-reports">
        <h3>Previous Reports ({generatedReports.length})</h3>
        <div className="reports-table glass-card">
          <div className="table-header">
            <span>Report</span>
            <span>Type</span>
            <span>Region</span>
            <span>Date Range</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {generatedReports.map((report, i) => (
            <div key={report.id + i} className="table-row animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="report-title-cell">
                <FileText size={16} />
                <div>
                  <span className="report-id">{report.id}</span>
                  <span className="report-name">{report.title}</span>
                </div>
              </div>
              <span className="report-type-label">{report.type}</span>
              <span className="report-date">{report.region}</span>
              <span className="report-pages">{report.dateRange}</span>
              <span className="report-status">
                <CheckCircle size={14} />
                {report.status}
              </span>
              <div className="report-actions">
                <button className="action-icon-btn" title="View" onClick={() => handleViewReport(report)}><Eye size={16} /></button>
                <button className="action-icon-btn" title="Download" onClick={() => handleDownloadReport(report)}><Download size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report View Modal */}
      {viewingReport && (
        <ReportViewModal report={viewingReport} onClose={() => setViewingReport(null)} />
      )}
    </div>
  );
}
