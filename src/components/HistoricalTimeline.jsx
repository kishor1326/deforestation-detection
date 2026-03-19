import React, { useMemo, useCallback, useRef, useState } from 'react';
import { Eye, EyeOff, ChevronLeft, ChevronRight, SkipForward, Maximize2, HelpCircle, X, Clock } from 'lucide-react';
import './HistoricalTimeline.css';

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
const TIMELINE_START = new Date('2020-01-01').getTime();
const TIMELINE_END = new Date('2025-12-31').getTime();
const TIMELINE_RANGE = TIMELINE_END - TIMELINE_START;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function dateToPercent(dateStr) {
  const t = new Date(dateStr).getTime();
  return ((t - TIMELINE_START) / TIMELINE_RANGE) * 100;
}

function percentToDate(pct) {
  const t = TIMELINE_START + (pct / 100) * TIMELINE_RANGE;
  return new Date(t).toISOString().split('T')[0];
}

export default function HistoricalTimeline({ dataPoints = [], selectedDate, onDateChange, onClose }) {
  const [enabled, setEnabled] = useState(true);
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Sort data points chronologically
  const sortedPoints = useMemo(() =>
    [...dataPoints].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [dataPoints]
  );

  const currentIndex = useMemo(() =>
    sortedPoints.findIndex(p => p.date === selectedDate),
    [sortedPoints, selectedDate]
  );

  const selectedPercent = selectedDate ? dateToPercent(selectedDate) : 50;

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      onDateChange(sortedPoints[currentIndex - 1].date);
    }
  }, [currentIndex, sortedPoints, onDateChange]);

  const goToNext = useCallback(() => {
    if (currentIndex < sortedPoints.length - 1) {
      onDateChange(sortedPoints[currentIndex + 1].date);
    }
  }, [currentIndex, sortedPoints, onDateChange]);

  const stepForward = useCallback(() => {
    goToNext();
  }, [goToNext]);

  // Find the nearest data point to a given percentage position
  const snapToNearest = useCallback((pct) => {
    if (sortedPoints.length === 0) return;
    let closest = sortedPoints[0];
    let minDist = Infinity;
    for (const pt of sortedPoints) {
      const ptPct = dateToPercent(pt.date);
      const dist = Math.abs(ptPct - pct);
      if (dist < minDist) {
        minDist = dist;
        closest = pt;
      }
    }
    onDateChange(closest.date);
  }, [sortedPoints, onDateChange]);

  // Click on timeline track
  const handleTrackClick = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    snapToNearest(Math.max(0, Math.min(100, pct)));
  };

  // Drag handling
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (ev) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      snapToNearest(Math.max(0, Math.min(100, pct)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Current data point info
  const currentPoint = sortedPoints[currentIndex] || null;

  return (
    <div className={`historical-timeline ${enabled ? 'enabled' : 'disabled'}`}>
      {/* Left controls */}
      <div className="ht-left-controls">
        <button
          className={`ht-icon-btn ht-toggle ${enabled ? 'active' : ''}`}
          onClick={() => setEnabled(!enabled)}
          title={enabled ? 'Disable Historical View' : 'Enable Historical View'}
        >
          {enabled ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>

        <button
          className="ht-icon-btn"
          title="Clock"
        >
          <Clock size={16} />
        </button>
      </div>

      {/* Historical Imagery label + date nav */}
      <div className="ht-date-section">
        <span className="ht-label">Historical Imagery</span>

        <div className="ht-date-nav">
          <button className="ht-nav-btn" onClick={goToPrev} disabled={currentIndex <= 0} title="Previous capture">
            <ChevronLeft size={14} />
          </button>
          <span className="ht-current-date">
            {selectedDate ? formatDate(selectedDate) : 'No date'}
          </span>
          <button className="ht-nav-btn" onClick={goToNext} disabled={currentIndex >= sortedPoints.length - 1} title="Next capture">
            <ChevronRight size={14} />
          </button>
        </div>

        <button className="ht-nav-btn ht-step-btn" onClick={stepForward} title="Step forward">
          <SkipForward size={14} />
        </button>
      </div>

      {/* Timeline track */}
      <div className="ht-timeline-wrapper">
        <div
          className="ht-timeline-track"
          ref={trackRef}
          onClick={handleTrackClick}
        >
          {/* Data points as dots */}
          {sortedPoints.map((pt, i) => {
            const pct = dateToPercent(pt.date);
            const isSelected = pt.date === selectedDate;
            const isHovered = hoveredPoint === i;
            return (
              <div
                key={`${pt.date}-${pt.region}-${i}`}
                className={`ht-dot ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                style={{ left: `${pct}%` }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onDateChange(pt.date);
                }}
              >
                {isHovered && !isSelected && (
                  <div className="ht-tooltip">
                    <strong>{formatDate(pt.date)}</strong>
                    <span>{pt.sensor} · {pt.resolution}</span>
                    <span>Cloud: {pt.cloudCover}%</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Selected indicator (big blue circle) */}
          {selectedDate && (
            <div
              className={`ht-selected-indicator ${isDragging ? 'dragging' : ''}`}
              style={{ left: `${selectedPercent}%` }}
              onMouseDown={handleMouseDown}
            >
              <div className="ht-selected-glow" />
            </div>
          )}

          {/* Highlight band around selected */}
          {selectedDate && (
            <div
              className="ht-highlight-band"
              style={{
                left: `${Math.max(0, selectedPercent - 3)}%`,
                width: `6%`,
              }}
            />
          )}
        </div>

        {/* Year labels */}
        <div className="ht-year-labels">
          {YEARS.map(year => {
            const pct = dateToPercent(`${year}-07-01`);
            return (
              <span key={year} className="ht-year-label" style={{ left: `${pct}%` }}>
                {year}
              </span>
            );
          })}
        </div>
      </div>

      {/* Right controls */}
      <div className="ht-right-controls">
        <button className="ht-icon-btn" title="Expand">
          <Maximize2 size={14} />
        </button>
        <button className="ht-icon-btn" title="Help">
          <HelpCircle size={14} />
        </button>
        <button className="ht-icon-btn ht-close-btn" onClick={onClose} title="Close timeline">
          <X size={14} />
        </button>
      </div>

      {/* Capture info tooltip when selected */}
      {currentPoint && enabled && (
        <div className="ht-capture-info">
          <span className="ht-capture-sensor">{currentPoint.sensor}</span>
          <span className="ht-capture-detail">{currentPoint.resolution} · Cloud {currentPoint.cloudCover}% · NDVI {currentPoint.ndviAvg.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
