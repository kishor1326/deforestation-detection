import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, FileText, CheckCircle, Clock } from 'lucide-react';
import './DatasetManager.css';

export default function DatasetManager() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mock form state for adding a dataset
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('alerts');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    // Load datasets from local storage
    setTimeout(() => {
      const stored = localStorage.getItem(`forestguard_datasets_public`);
      if (stored) {
        setDatasets(JSON.parse(stored));
      } else {
        // Add some default mock data for demo purposes
        const defaultData = [
          { id: '1', name: 'Amazon Q3 2025 Alerts', type: 'alerts', status: 'active', recordsCount: 342, createdAt: new Date(Date.now() - 864000000).toISOString() },
          { id: '2', name: 'Western Ghats Boundary', type: 'boundary', status: 'active', recordsCount: 1, createdAt: new Date(Date.now() - 432000000).toISOString() },
        ];
        setDatasets(defaultData);
        localStorage.setItem(`forestguard_datasets_public`, JSON.stringify(defaultData));
      }
      setLoading(false);
    }, 600);
  }, []);

  function saveToStorage(newDatasets) {
    localStorage.setItem(`forestguard_datasets_public`, JSON.stringify(newDatasets));
  }

  function handleAddDataset(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    setAddLoading(true);
    setTimeout(() => {
      const newDataset = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        type: newType,
        status: 'active',
        createdAt: new Date().toISOString(),
        recordsCount: Math.floor(Math.random() * 500) + 10
      };

      const updated = [newDataset, ...datasets];
      setDatasets(updated);
      saveToStorage(updated);
      setShowAddForm(false);
      setNewName('');
      setAddLoading(false);
    }, 800);
  }

  function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this dataset?")) return;
    const updated = datasets.filter(d => d.id !== id);
    setDatasets(updated);
    saveToStorage(updated);
  }

  function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const updated = datasets.map(d => d.id === id ? { ...d, status: newStatus } : d);
    setDatasets(updated);
    saveToStorage(updated);
  }

  return (
    <div className="page-container dataset-manager">
      <div className="page-header flex-header">
        <div>
          <h1><Database size={28} className="header-icon" /> Your Datasets</h1>
          <p>Manage and upload custom deforestation tracking data</p>
        </div>
        <button className="btn-primary flex-btn" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add Dataset'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-dataset-card glass-card">
          <h3>Upload New Dataset</h3>
          <form onSubmit={handleAddDataset} className="dataset-form">
             <div className="form-group">
               <label>Dataset Name</label>
               <input 
                 type="text" 
                 required 
                 placeholder="e.g. Amazon Region Alerts Q4" 
                 value={newName} 
                 onChange={e => setNewName(e.target.value)} 
               />
             </div>
             <div className="form-group">
               <label>Data Type</label>
               <select value={newType} onChange={e => setNewType(e.target.value)}>
                 <option value="alerts">Deforestation Alerts (CSV/JSON)</option>
                 <option value="imagery">Satellite Imagery (GeoTIFF)</option>
                 <option value="boundary">Region Boundary (GeoJSON)</option>
               </select>
             </div>
             
             <div className="file-drop-zone">
                <FileText size={32} color="var(--color-text-muted)" />
                <p>Drag & drop your file here, or click to browse</p>
                <span className="file-info">Max size: 50MB</span>
             </div>

             <button type="submit" className="btn-primary" disabled={addLoading}>
               {addLoading ? 'Uploading...' : 'Save Dataset'}
             </button>
          </form>
        </div>
      )}

      <div className="dataset-list">
        {loading ? (
          <div className="loading-state">Loading your datasets...</div>
        ) : datasets.length === 0 ? (
          <div className="empty-state glass-card">
             <Database size={48} color="rgba(0,200,83,0.3)" />
             <h3>No datasets found</h3>
             <p>You haven't uploaded any custom datasets yet.</p>
             <button className="btn-outline" onClick={() => setShowAddForm(true)}>Add your first dataset</button>
          </div>
        ) : (
          <div className="datasets-grid">
            {datasets.map(dataset => (
              <div key={dataset.id} className="dataset-card glass-card">
                 <div className="dataset-header">
                   <div className="dataset-title">
                     <FileText size={20} color="var(--color-green-primary)" />
                     <h4>{dataset.name}</h4>
                   </div>
                   <div className={`status-badge ${dataset.status}`}>
                     {dataset.status === 'active' ? <CheckCircle size={14} /> : <Clock size={14} />}
                     {dataset.status}
                   </div>
                 </div>
                 <div className="dataset-body">
                   <p className="dataset-type"><strong>Type:</strong> {dataset.type.charAt(0).toUpperCase() + dataset.type.slice(1)}</p>
                   <p><strong>Records:</strong> {dataset.recordsCount}</p>
                   <p className="dataset-date">Added: {new Date(dataset.createdAt).toLocaleDateString()}</p>
                 </div>
                 <div className="dataset-actions">
                   <button 
                     className="action-btn toggle" 
                     onClick={() => toggleStatus(dataset.id, dataset.status)}
                   >
                     {dataset.status === 'active' ? 'Deactivate' : 'Activate'}
                   </button>
                   <button 
                     className="action-btn delete" 
                     onClick={() => handleDelete(dataset.id)}
                   >
                     <Trash2 size={16} />
                   </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
