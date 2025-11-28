import React, { useCallback, useState } from 'react';
import { useBusinessCaseStore } from '../store/businessCaseStore';
import { exportToPptx, downloadBlob, saveBusinessCase } from '../services/api';
import './Header.css';

export const Header: React.FC = () => {
  const businessCase = useBusinessCaseStore((state) => state.businessCase);
  const setProjectName = useBusinessCaseStore((state) => state.setProjectName);
  const setDescription = useBusinessCaseStore((state) => state.setDescription);
  const isExporting = useBusinessCaseStore((state) => state.isExporting);
  const setExporting = useBusinessCaseStore((state) => state.setExporting);
  const resetBusinessCase = useBusinessCaseStore((state) => state.resetBusinessCase);
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(businessCase.project_name);
  const [tempDescription, setTempDescription] = useState(businessCase.description || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await exportToPptx(businessCase);
      downloadBlob(blob, `${businessCase.project_name.replace(/\s+/g, '_')}_business_case.pptx`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export. Make sure the backend is running.');
    } finally {
      setExporting(false);
    }
  }, [businessCase, setExporting]);

  const handleSave = useCallback(async () => {
    try {
      await saveBusinessCase(businessCase);
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('Save failed');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, [businessCase]);

  const handleEditSubmit = useCallback(() => {
    setProjectName(tempName);
    setDescription(tempDescription);
    setIsEditing(false);
  }, [tempName, tempDescription, setProjectName, setDescription]);

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">📊</span>
          <span className="logo-text">Business Case Command Center</span>
        </div>
      </div>

      <div className="header-center">
        {isEditing ? (
          <div className="edit-project">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="project-name-input"
              placeholder="Project Name"
            />
            <input
              type="text"
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              className="project-desc-input"
              placeholder="Description"
            />
            <button className="btn-small" onClick={handleEditSubmit}>✓</button>
            <button className="btn-small btn-cancel" onClick={() => setIsEditing(false)}>✕</button>
          </div>
        ) : (
          <div className="project-info" onClick={() => setIsEditing(true)}>
            <h1 className="project-name">{businessCase.project_name}</h1>
            <p className="project-description">{businessCase.description}</p>
          </div>
        )}
      </div>

      <div className="header-right">
        {saveStatus && <span className="save-status">{saveStatus}</span>}
        <button className="btn btn-secondary" onClick={handleSave}>
          💾 Save
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? '⏳ Exporting...' : '📤 Export PPTX'}
        </button>
        <button className="btn btn-danger" onClick={resetBusinessCase}>
          🔄 Reset
        </button>
      </div>
    </header>
  );
};
