import axios from 'axios';
import type { BusinessCaseData, AuditResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Save business case data to the backend
 */
export const saveBusinessCase = async (data: BusinessCaseData): Promise<{ status: string; project_name: string }> => {
  const response = await api.post('/api/data/business-case', data);
  return response.data;
};

/**
 * Get business case by project name
 */
export const getBusinessCase = async (projectName: string): Promise<BusinessCaseData> => {
  const response = await api.get(`/api/data/business-case/${encodeURIComponent(projectName)}`);
  return response.data;
};

/**
 * List all business cases
 */
export const listBusinessCases = async (): Promise<string[]> => {
  const response = await api.get('/api/data/business-cases');
  return response.data;
};

/**
 * Run AI audit on business case data
 */
export const runAudit = async (data: BusinessCaseData): Promise<AuditResponse> => {
  const response = await api.post('/api/ai/audit', { business_case_data: data });
  return response.data;
};

/**
 * Export business case to PowerPoint
 */
export const exportToPptx = async (data: BusinessCaseData): Promise<Blob> => {
  const response = await api.post('/api/export/pptx', data, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get template slide information
 */
export const getTemplateInfo = async (): Promise<{ slides: Array<{ id: number; title: string; type: string }> }> => {
  const response = await api.get('/api/export/template');
  return response.data;
};

/**
 * Get validation rules
 */
export const getValidationRules = async (): Promise<{ rules: Array<{ id: string; description: string; severity: string }> }> => {
  const response = await api.get('/api/ai/rules');
  return response.data;
};

/**
 * Download file helper
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
