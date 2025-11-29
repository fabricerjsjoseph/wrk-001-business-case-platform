import React, { useCallback, useState } from 'react';
import { useBusinessCaseStore } from '../store/businessCaseStore';
import { runAudit } from '../services/api';
import type { AuditFinding } from '../types';
import './AIAuditor.css';

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '•';
  }
};

export const AIAuditor: React.FC = () => {
  const businessCase = useBusinessCaseStore((state) => state.businessCase);
  const auditResults = useBusinessCaseStore((state) => state.auditResults);
  const setAuditResults = useBusinessCaseStore((state) => state.setAuditResults);
  const isAuditing = useBusinessCaseStore((state) => state.isAuditing);
  const setAuditing = useBusinessCaseStore((state) => state.setAuditing);
  
  const [error, setError] = useState<string | null>(null);

  const handleRunAudit = useCallback(async () => {
    setAuditing(true);
    setError(null);
    
    try {
      const results = await runAudit(businessCase);
      setAuditResults(results);
    } catch (err) {
      setError('Failed to run audit. Make sure the backend is running.');
      console.error('Audit error:', err);
    } finally {
      setAuditing(false);
    }
  }, [businessCase, setAuditResults, setAuditing]);

  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score < 0.3) return { label: 'Low', color: '#27ae60' };
    if (score < 0.6) return { label: 'Medium', color: '#f39c12' };
    return { label: 'High', color: '#e74c3c' };
  };

  const groupFindingsByYear = (findings: AuditFinding[]) => {
    const grouped: Record<number, AuditFinding[]> = {};
    findings.forEach(finding => {
      if (!grouped[finding.year]) {
        grouped[finding.year] = [];
      }
      grouped[finding.year].push(finding);
    });
    return grouped;
  };

  return (
    <div className="ai-auditor-container">
      <div className="ai-auditor-header">
        <div className="header-title">
          <span className="ai-icon">🤖</span>
          <h2>AI Auditor</h2>
        </div>
        <button 
          className="audit-button"
          onClick={handleRunAudit}
          disabled={isAuditing}
        >
          {isAuditing ? 'Analyzing...' : 'Run Audit'}
        </button>
      </div>

      <div className="ai-auditor-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!auditResults && !error && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>Click "Run Audit" to analyze your business case for logical errors and inconsistencies.</p>
            <ul className="audit-features">
              <li>✓ Formula validation</li>
              <li>✓ Growth rate analysis</li>
              <li>✓ Margin consistency checks</li>
              <li>✓ Trend anomaly detection</li>
            </ul>
          </div>
        )}

        {auditResults && (
          <>
            <div className="risk-score-section">
              <h3>Risk Assessment</h3>
              <div className="risk-meter">
                <div 
                  className="risk-fill"
                  style={{ 
                    width: `${auditResults.risk_score * 100}%`,
                    backgroundColor: getRiskLevel(auditResults.risk_score).color
                  }}
                />
              </div>
              <div className="risk-label" style={{ color: getRiskLevel(auditResults.risk_score).color }}>
                {getRiskLevel(auditResults.risk_score).label} Risk ({(auditResults.risk_score * 100).toFixed(0)}%)
              </div>
            </div>

            <div className="findings-section">
              <h3>Findings ({auditResults.findings.length})</h3>
              {auditResults.findings.length === 0 ? (
                <div className="no-findings">
                  ✅ No issues found! Your data looks consistent.
                </div>
              ) : (
                <div className="findings-list">
                  {Object.entries(groupFindingsByYear(auditResults.findings)).map(([year, findings]) => (
                    <div key={year} className="year-group">
                      <div className="year-header">Year {year}</div>
                      {findings.map((finding, idx) => (
                        <div key={idx} className={`finding-item ${finding.type}`}>
                          <div className="finding-icons">
                            <span>{getTypeIcon(finding.type)}</span>
                            <span>{getSeverityIcon(finding.severity)}</span>
                          </div>
                          <div className="finding-details">
                            <span className="finding-field">{finding.field}</span>
                            <span className="finding-message">{finding.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {auditResults.suggestions.length > 0 && (
              <div className="suggestions-section">
                <h3>Suggestions</h3>
                <ul className="suggestions-list">
                  {auditResults.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
