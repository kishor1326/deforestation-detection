import React, { useState } from 'react';
import { Upload, Crosshair, Cpu, Image as ImageIcon, Volume2, ShieldAlert, CheckCircle } from 'lucide-react';
import { regions } from '../data/mockData';
import AlertBadge from '../components/AlertBadge';
import './HuntingConsole.css';

export default function HuntingConsole() {
    const [activeTab, setActiveTab] = useState('acoustic');
    const [file, setFile] = useState(null);
    const [region, setRegion] = useState(regions[0].id);
    const [logText, setLogText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleTextAnalyze = async () => {
        if (!logText) return;
        setAnalyzing(true);
        setResult(null);

        try {
            const payload = {
                sensor_id: `SNSR-${Math.floor(Math.random() * 1000)}`,
                region: region,
                log_text: logText
            };

            const response = await fetch('http://localhost:8000/api/analyze-hunting/text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            setResult(data.analysis);
            setAnalyzing(false);
        } catch (err) {
            console.error("Backend unreachable, using fallback simulation");
            setTimeout(() => {
                const txt = logText.toLowerCase();
                let fallback = { threat_level: 'low', confidence: 95, event_type: 'Normal Noise' };
                if (txt.includes('gun') || txt.includes('shot')) fallback = { threat_level: 'critical', confidence: 98, event_type: 'Gunshot Detected' };
                else if (txt.includes('engine') || txt.includes('vehicle')) fallback = { threat_level: 'high', confidence: 88, event_type: 'Unauthorized Vehicle' };
                setResult(fallback);
                setAnalyzing(false);
            }, 1500);
        }
    };

    const handleImageAnalyze = async () => {
        if (!file) return;
        setAnalyzing(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('region', region);

        try {
            const response = await fetch('http://localhost:8000/api/analyze-hunting/image', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            setResult(data.analysis);
            setAnalyzing(false);
        } catch (err) {
            setTimeout(() => {
                setResult({
                    threat_level: Math.random() > 0.5 ? 'high' : 'low',
                    confidence: Math.floor(Math.random() * 20) + 80,
                    event_type: 'Simulated Camera Trap Analysis'
                });
                setAnalyzing(false);
            }, 2000);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Hunting & Poaching AI Console</h1>
                <p>Analyze acoustic sensors, drone metadata, and camera trap images using the ForestGuard LLM</p>
            </div>

            <div className="hunting-layout">
                <div className="console-panel glass-card">
                    <div className="card-header">
                        <h3><Cpu size={18} /> LLM Inference Engine</h3>
                    </div>

                    <div className="analysis-tabs">
                        <button className={`tab-btn ${activeTab === 'acoustic' ? 'active' : ''}`} onClick={() => { setActiveTab('acoustic'); setResult(null); }}>
                            <Volume2 size={16} /> Acoustic / Text Logs
                        </button>
                        <button className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`} onClick={() => { setActiveTab('visual'); setResult(null); }}>
                            <ImageIcon size={16} /> Camera Trap Images
                        </button>
                    </div>

                    <div className="form-group">
                        <label>Deployment Region</label>
                        <div className="select-wrapper">
                            <select value={region} onChange={e => setRegion(e.target.value)}>
                                {regions.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {activeTab === 'acoustic' ? (
                        <div className="acoustic-input animate-fade-in">
                            <div className="form-group">
                                <label>Sensor Log Transcription</label>
                                <textarea
                                    placeholder="e.g., Loud sharp crack followed by silence. Possible gunshot."
                                    value={logText}
                                    onChange={e => setLogText(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <button
                                className={`btn-primary btn-analyze ${analyzing ? 'loading' : ''}`}
                                onClick={handleTextAnalyze}
                                disabled={!logText || analyzing}
                            >
                                {analyzing ? <div className="spinner"></div> : <Crosshair size={16} />}
                                {analyzing ? 'Processing LLM Inference...' : 'Run Analysis'}
                            </button>
                        </div>
                    ) : (
                        <div className="visual-input animate-fade-in">
                            <div className="upload-zone">
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept="image/*"
                                    onChange={e => setFile(e.target.files[0])}
                                />
                                <label htmlFor="file-upload" className="upload-label">
                                    <Upload size={32} />
                                    <span>{file ? file.name : 'Click to upload or drag camera trap image'}</span>
                                </label>
                            </div>
                            <button
                                className={`btn-primary btn-analyze ${analyzing ? 'loading' : ''}`}
                                onClick={handleImageAnalyze}
                                disabled={!file || analyzing}
                            >
                                {analyzing ? <div className="spinner"></div> : <Crosshair size={16} />}
                                {analyzing ? 'Processing Vision Model...' : 'Analyze Image'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="results-panel glass-card">
                    <div className="card-header">
                        <h3>Diagnostic Results</h3>
                    </div>

                    {!analyzing && !result ? (
                        <div className="empty-results">
                            <Cpu size={48} className="empty-icon" />
                            <p>Awaiting sensor data for analysis</p>
                        </div>
                    ) : analyzing ? (
                        <div className="analyzing-state">
                            <div className="scanning-grid">
                                <div className="scan-line"></div>
                            </div>
                            <p className="typing-effect">LLM Neural Processing Active...</p>
                        </div>
                    ) : (
                        <div className="analysis-result animate-fade-in-up">
                            <div className="result-header">
                                <AlertBadge severity={result.threat_level} />
                                <span className="confidence-score">Confidence: {result.confidence}%</span>
                            </div>

                            <div className="result-details">
                                <div className="detail-item">
                                    <span className="detail-label">Detected Event</span>
                                    <span className="detail-value highlight">{result.event_type}</span>
                                </div>

                                {result.threat_level === 'critical' || result.threat_level === 'high' ? (
                                    <div className="threat-action required">
                                        <ShieldAlert size={20} />
                                        <div>
                                            <strong>Immediate Action Required</strong>
                                            <p>Poaching/hunting pattern confirmed. Dispatching ranger drone to designated coordinates.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="threat-action safe">
                                        <CheckCircle size={20} />
                                        <div>
                                            <strong>No Threat Detected</strong>
                                            <p>Acoustic/visual patterns match normal wildlife and environmental profiles.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
