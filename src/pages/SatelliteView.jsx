import React, { useState, useEffect, useMemo } from 'react';
import { Layers, ChevronDown, ZoomIn, ZoomOut, RotateCcw, MapPin, TreePine, AlertTriangle, TrendingDown } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { regions, alerts, historicalImageryData } from '../data/mockData';
import HistoricalTimeline from '../components/HistoricalTimeline';
import './SatelliteView.css';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const ndviLegend = [
  { color: '#d73027', label: 'No Vegetation' },
  { color: '#fc8d59', label: 'Sparse' },
  { color: '#fee08b', label: 'Moderate' },
  { color: '#d9ef8b', label: 'Dense' },
  { color: '#1a9850', label: 'Very Dense' },
];

// Generate synthetic deforestation events linked to timeline dates
function getDeforestationForDate(date, region) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();

  // Simulate increasing deforestation over the years
  const yearFactor = (year - 2019) * 0.12;
  // Dry season (Jun-Oct) = more deforestation
  const seasonFactor = (month >= 5 && month <= 9) ? 1.4 : 0.8;
  const seed = (year * 100 + month) * 17 % 100;

  const forestCoverLoss = (2.1 + yearFactor * 3.5 * seasonFactor + (seed % 5) * 0.4).toFixed(1);
  const areaAffected = Math.round(120 + yearFactor * 280 * seasonFactor + (seed % 8) * 30);
  const hotspots = Math.round(3 + yearFactor * 8 * seasonFactor + (seed % 4));
  const ndviChange = -(0.02 + yearFactor * 0.04 * seasonFactor).toFixed(3);

  return {
    date,
    forestCoverLoss: parseFloat(forestCoverLoss),
    areaAffected,
    hotspots,
    ndviChange: parseFloat(ndviChange),
    riskLevel: forestCoverLoss > 6 ? 'critical' : forestCoverLoss > 4 ? 'high' : forestCoverLoss > 2.5 ? 'medium' : 'low',
  };
}

export default function SatelliteView() {
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [showNDVI, setShowNDVI] = useState(false);

  // Historical timeline state
  const [showTimeline, setShowTimeline] = useState(true);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);

  // Filter historical data by selected region
  const regionHistoryData = useMemo(() => {
    const allForRegion = historicalImageryData.filter(
      d => d.region === selectedRegion.id
    );
    return allForRegion.length > 0 ? allForRegion : historicalImageryData;
  }, [selectedRegion]);

  // Current imagery data point for the selected date
  const currentImagery = useMemo(() => {
    return regionHistoryData.find(d => d.date === selectedHistoryDate) || null;
  }, [regionHistoryData, selectedHistoryDate]);

  // Deforestation stats derived from the selected date
  const deforestationStats = useMemo(() => {
    return getDeforestationForDate(selectedHistoryDate, selectedRegion.id);
  }, [selectedHistoryDate, selectedRegion]);

  // Auto-select the latest date when region changes
  useEffect(() => {
    if (regionHistoryData.length > 0) {
      const sorted = [...regionHistoryData].sort((a, b) => new Date(b.date) - new Date(a.date));
      setSelectedHistoryDate(sorted[0].date);
    }
  }, [regionHistoryData]);

  const handleHistoryDateChange = (date) => {
    setSelectedHistoryDate(date);
  };

  // Map state
  const [mapCenter, setMapCenter] = useState({ lat: selectedRegion.lat || -1.411, lng: selectedRegion.lng || 32.062 });
  const [mapZoom, setMapZoom] = useState(12);

  // Provide markers based on the selected region
  const regionAlerts = alerts.filter(a => a.region.toLowerCase().includes(selectedRegion.name.toLowerCase().split(' ')[0]));
  const displayAlerts = regionAlerts.length > 0 ? regionAlerts : alerts.slice(0, 3);

  const locateDeforestation = (lat, lng) => {
    setMapCenter({ lat, lng });
    setMapZoom(15);
  };

  useEffect(() => {
    if (selectedRegion.lat && selectedRegion.lng) {
      setMapCenter({ lat: selectedRegion.lat, lng: selectedRegion.lng });
      setMapZoom(12);
    } else {
      setMapCenter({ lat: -1.411, lng: 32.062 });
      setMapZoom(10);
    }
  }, [selectedRegion]);

  const handleCameraChange = (ev) => {
    setMapCenter(ev.detail.center);
    setMapZoom(ev.detail.zoom);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Satellite Imagery</h1>
        <p>Monitor deforestation through historical satellite data from 2020–2025</p>
      </div>

      {/* Controls */}
      <div className="sat-controls glass-card">
        <div className="control-group">
          <label>Region</label>
          <div className="select-wrapper">
            <select value={selectedRegion.id} onChange={e => setSelectedRegion(regions.find(r => r.id === e.target.value))}>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}, {r.country}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="control-group">
          <label>Selected Date</label>
          <div className="selected-date-display">
            {selectedHistoryDate
              ? new Date(selectedHistoryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'No date selected'}
          </div>
        </div>

        {currentImagery && (
          <div className="control-group">
            <label>Sensor</label>
            <div className="sensor-badge">{currentImagery.sensor} · {currentImagery.resolution}</div>
          </div>
        )}

        <div className="control-group">
          <label>NDVI Overlay</label>
          <button className={`toggle-btn ${showNDVI ? 'active' : ''}`} onClick={() => setShowNDVI(!showNDVI)}>
            <Layers size={16} />
            {showNDVI ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Historical Imagery Timeline */}
      {showTimeline && (
        <div className="timeline-bar-wrapper">
          <HistoricalTimeline
            dataPoints={regionHistoryData}
            selectedDate={selectedHistoryDate}
            onDateChange={handleHistoryDateChange}
            onClose={() => setShowTimeline(false)}
          />
        </div>
      )}

      {!showTimeline && (
        <button
          className="show-timeline-btn glass-card"
          onClick={() => setShowTimeline(true)}
        >
          🛰️ Show Historical Timeline
        </button>
      )}

      {/* Main Content: Map + Side Panel */}
      <div className="comparison-section">
        <div className="comparison-container glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Date overlay header */}
          <div className="map-date-header">
            <span className="map-date-badge">
              📅 {selectedHistoryDate
                ? new Date(selectedHistoryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'Select a date'}
            </span>
            {currentImagery && (
              <span className="map-sensor-badge">
                {currentImagery.sensor} · Cloud {currentImagery.cloudCover}%
              </span>
            )}
          </div>

          <div className="comparison-viewer" style={{ height: '600px' }}>
            <APIProvider apiKey={apiKey}>
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Map
                  mapTypeId={'satellite'}
                  center={mapCenter}
                  zoom={mapZoom}
                  onCameraChanged={handleCameraChange}
                  disableDefaultUI={true}
                  gestureHandling="greedy"
                  mapId="satellite_main"
                >
                  {displayAlerts.map(alert => (
                    <AdvancedMarker
                      key={alert.id}
                      position={{ lat: alert.lat, lng: alert.lng }}
                    >
                      <Pin background="#ff1744" borderColor="#fff" glyphColor="#fff" />
                    </AdvancedMarker>
                  ))}
                </Map>

                {/* Deforestation heatmap overlay (simulated based on date) */}
                {deforestationStats && (
                  <div className="deforestation-overlay" style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: `radial-gradient(ellipse at 40% 45%, rgba(255,${Math.max(0, 180 - deforestationStats.forestCoverLoss * 20)},0,${0.08 + deforestationStats.forestCoverLoss * 0.03}) 0%, transparent 50%),
                                 radial-gradient(ellipse at 65% 55%, rgba(255,${Math.max(0, 150 - deforestationStats.forestCoverLoss * 15)},0,${0.06 + deforestationStats.forestCoverLoss * 0.02}) 0%, transparent 40%)`,
                  }} />
                )}
              </div>

              {/* NDVI Overlay */}
              {showNDVI && (
                <div className="ndvi-overlay" style={{ pointerEvents: 'none' }}>
                  <div className="ndvi-grid">
                    {Array.from({ length: 144 }).map((_, i) => {
                      const baseVal = currentImagery ? currentImagery.ndviAvg : 0.6;
                      const val = Math.max(0, Math.min(1, baseVal + (Math.random() - 0.5) * 0.4));
                      const colors = ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#1a9850'];
                      return (
                        <div key={i} className="ndvi-cell" style={{
                          background: colors[Math.floor(val * 4.99)],
                          opacity: 0.3 + val * 0.2,
                        }} />
                      );
                    })}
                  </div>
                </div>
              )}
            </APIProvider>
          </div>

          <div className="comparison-tools" style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 30 }}>
            <button className="tool-btn" onClick={() => setMapZoom(z => Math.min(z + 1, 20))}><ZoomIn size={16} /></button>
            <button className="tool-btn" onClick={() => setMapZoom(z => Math.max(z - 1, 1))}><ZoomOut size={16} /></button>
            <button className="tool-btn" onClick={() => {
              if (selectedRegion.lat) { setMapCenter({ lat: selectedRegion.lat, lng: selectedRegion.lng }); }
              setMapZoom(12);
            }}><RotateCcw size={16} /></button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="sat-info-panel">
          {/* Deforestation Stats for Selected Date */}
          {deforestationStats && (
            <div className="info-card glass-card deforestation-date-card">
              <h3>
                <TreePine size={16} style={{ marginRight: '8px', color: '#00c853' }} />
                Deforestation — {new Date(selectedHistoryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </h3>
              <div className="deforestation-stats-grid">
                <div className="defo-stat">
                  <div className={`defo-stat-value ${deforestationStats.riskLevel}`}>
                    -{deforestationStats.forestCoverLoss}%
                  </div>
                  <div className="defo-stat-label">Forest Cover Loss</div>
                </div>
                <div className="defo-stat">
                  <div className="defo-stat-value">{deforestationStats.areaAffected} ha</div>
                  <div className="defo-stat-label">Area Affected</div>
                </div>
                <div className="defo-stat">
                  <div className="defo-stat-value">{deforestationStats.hotspots}</div>
                  <div className="defo-stat-label">Active Hotspots</div>
                </div>
                <div className="defo-stat">
                  <div className="defo-stat-value">{deforestationStats.ndviChange}</div>
                  <div className="defo-stat-label">NDVI Change</div>
                </div>
              </div>
              <div className={`risk-indicator risk-${deforestationStats.riskLevel}`}>
                <AlertTriangle size={14} />
                <span>Risk Level: <strong>{deforestationStats.riskLevel.toUpperCase()}</strong></span>
              </div>
            </div>
          )}

          {/* Imagery Metadata */}
          {currentImagery && (
            <div className="info-card glass-card">
              <h3>Imagery Metadata</h3>
              <div className="info-row"><span>Sensor</span><span>{currentImagery.sensor}</span></div>
              <div className="info-row"><span>Resolution</span><span>{currentImagery.resolution}</span></div>
              <div className="info-row"><span>Cloud Cover</span>
                <span className={currentImagery.cloudCover > 40 ? 'cover-value low' : currentImagery.cloudCover > 20 ? 'cover-value medium' : 'cover-value high'}>
                  {currentImagery.cloudCover}%
                </span>
              </div>
              <div className="info-row"><span>Avg NDVI</span>
                <span style={{ color: currentImagery.ndviAvg > 0.6 ? '#00c853' : currentImagery.ndviAvg > 0.4 ? '#ffab00' : '#ff1744', fontWeight: 700 }}>
                  {currentImagery.ndviAvg.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Region Details */}
          <div className="info-card glass-card">
            <h3>Region Details</h3>
            <div className="info-row"><span>Name</span><span>{selectedRegion.name}</span></div>
            <div className="info-row"><span>Country</span><span>{selectedRegion.country}</span></div>
            <div className="info-row"><span>Area</span><span>{selectedRegion.area}</span></div>
            <div className="info-row"><span>Forest Cover</span>
              <span className={`cover-value ${selectedRegion.forestCover < 50 ? 'low' : selectedRegion.forestCover < 75 ? 'medium' : 'high'}`}>
                {selectedRegion.forestCover}%
              </span>
            </div>
            <div className="info-row"><span>Risk Level</span>
              <span className={`risk-badge risk-${selectedRegion.riskLevel}`}>{selectedRegion.riskLevel}</span>
            </div>
          </div>

          {showNDVI && (
            <div className="info-card glass-card ndvi-legend-card">
              <h3>NDVI Legend</h3>
              <div className="ndvi-legend">
                {ndviLegend.map((item, i) => (
                  <div key={i} className="legend-item">
                    <div className="legend-color" style={{ background: item.color }} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected Deforestation Alerts */}
          <div className="info-card glass-card">
            <h3>Detected Deforestation</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Click an area below to locate it on the map.
            </p>
            <div className="locations-list">
              {displayAlerts.map(alert => (
                <button
                  key={alert.id}
                  className="location-btn"
                  onClick={() => locateDeforestation(alert.lat, alert.lng)}
                  style={{
                    display: 'flex', width: '100%', alignItems: 'center', gap: '10px',
                    padding: '10px', background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)', borderRadius: '8px',
                    marginBottom: '8px', cursor: 'pointer', textAlign: 'left',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <MapPin size={16} color="#ff1744" />
                  <div className="location-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{alert.id}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Loss: {alert.area}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
