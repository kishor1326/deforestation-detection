import React, { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { alerts } from '../data/mockData';
import './GlobalMap.css';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Dark themed satellite map styles (Carto Dark Matter inspired)
const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
];

export default function GlobalMap() {
    const [selectedAlert, setSelectedAlert] = useState(null);

    // Extend the default alerts with a few more global points to make the map look populated like the screenshot
    const mapAlerts = [
        ...alerts,
        { id: 'ALT-GLOB-1', region: 'Russia', lat: 60.0, lng: 90.0, severity: 'critical', confidence: 99, area: 'Large Scale' },
        { id: 'ALT-GLOB-2', region: 'North America', lat: 50.0, lng: -120.0, severity: 'warning', confidence: 85, area: 'Moderate Risk' },
        { id: 'ALT-GLOB-3', region: 'Angola', lat: -11.2, lng: 17.8, severity: 'warning', confidence: 82, area: 'Moderate Clearings' },
        { id: 'ALT-GLOB-4', region: 'Australia', lat: -25.2, lng: 133.7, severity: 'critical', confidence: 96, area: 'Bushfire Risk Area' },
        { id: 'ALT-GLOB-5', region: 'India', lat: 20.5, lng: 78.9, severity: 'critical', confidence: 91, area: 'High Encroachment' },
    ];

    // Helper function to map severity to style properties
    const getMarkerStyle = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return { color: '#ff1744', size: 36, class: 'marker-pulse-critical' };
            case 'high':
            case 'warning':
                return { color: '#ffab00', size: 28, class: 'marker-pulse-warning' };
            case 'medium':
            case 'low':
            case 'watch':
            default:
                return { color: '#ffea00', size: 22, class: 'marker-pulse-watch' };
        }
    };

    return (
        <div className="global-map-container">
            {/* Overlay Header */}
            <div className="global-map-header">
                <h1>
                    <MapIcon size={24} className="map-title-icon" />
                    Global Detection Map
                </h1>

                {/* Top Right Legend */}
                <div className="global-map-legend">
                    <div className="legend-item">
                        <div className="legend-dot critical"></div>
                        <span>Critical</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot warning"></div>
                        <span>Warning</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot watch"></div>
                        <span>Watch</span>
                    </div>
                </div>
            </div>

            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={{ lat: 15, lng: 0 }}
                    defaultZoom={2}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    mapTypeId="roadmap" // Will apply standard roadmap with our dark styles
                    options={{
                        styles: darkMapStyles,
                        backgroundColor: '#1E293B',
                        streetViewControl: false,
                        mapTypeControl: false,
                    }}
                    mapId="global_detection_map"
                >
                    {mapAlerts.map((alert) => {
                        const style = getMarkerStyle(alert.severity);
                        return (
                            <AdvancedMarker
                                key={alert.id}
                                position={{ lat: alert.lat, lng: alert.lng }}
                                onClick={() => setSelectedAlert(alert)}
                                zIndex={style.size}
                            >
                                <div
                                    className={`custom-marker ${style.class}`}
                                    style={{
                                        backgroundColor: style.color,
                                        width: `${style.size}px`,
                                        height: `${style.size}px`,
                                        opacity: 0.85
                                    }}
                                >
                                    {/* The inner pulse circle is handled via CSS ::before */}
                                </div>
                            </AdvancedMarker>
                        );
                    })}

                    {selectedAlert && (
                        <InfoWindow
                            position={{ lat: selectedAlert.lat, lng: selectedAlert.lng }}
                            onCloseClick={() => setSelectedAlert(null)}
                            headerContent={<strong>{selectedAlert.id} \u2014 {selectedAlert.region}</strong>}
                        >
                            <div style={{ color: 'black', padding: '4px' }}>
                                <p style={{ margin: '4px 0' }}><strong>Severity:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedAlert.severity}</span></p>
                                <p style={{ margin: '4px 0' }}><strong>Confidence:</strong> {selectedAlert.confidence}%</p>
                                <p style={{ margin: '4px 0' }}><strong>Area:</strong> {selectedAlert.area}</p>
                                {selectedAlert.description && <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>{selectedAlert.description}</p>}
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </APIProvider>
        </div>
    );
}
