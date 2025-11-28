import { create } from 'zustand';
import type { BusinessCaseData, FinancialData, AuditResponse, SlideData } from '../types';

interface BusinessCaseState {
  // Business case data
  businessCase: BusinessCaseData;
  
  // Audit results
  auditResults: AuditResponse | null;
  
  // Slides data (derived from business case)
  slides: SlideData[];
  
  // Loading states
  isLoading: boolean;
  isAuditing: boolean;
  isExporting: boolean;
  
  // Actions
  setBusinessCase: (data: BusinessCaseData) => void;
  updateFinancialData: (data: FinancialData[]) => void;
  updateSingleRow: (index: number, data: Partial<FinancialData>) => void;
  setProjectName: (name: string) => void;
  setDescription: (description: string) => void;
  setAssumptions: (assumptions: Record<string, string | number>) => void;
  setAuditResults: (results: AuditResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setAuditing: (auditing: boolean) => void;
  setExporting: (exporting: boolean) => void;
  resetBusinessCase: () => void;
}

// Default financial data for 5 years
const defaultFinancialData: FinancialData[] = [
  { year: 2024, revenue: 1000000, costs: 600000, gross_profit: 400000, operating_expenses: 200000, ebitda: 200000, depreciation: 50000, ebit: 150000, interest: 20000, taxes: 32500, net_income: 97500 },
  { year: 2025, revenue: 1200000, costs: 700000, gross_profit: 500000, operating_expenses: 230000, ebitda: 270000, depreciation: 55000, ebit: 215000, interest: 18000, taxes: 49250, net_income: 147750 },
  { year: 2026, revenue: 1500000, costs: 850000, gross_profit: 650000, operating_expenses: 280000, ebitda: 370000, depreciation: 60000, ebit: 310000, interest: 15000, taxes: 73750, net_income: 221250 },
  { year: 2027, revenue: 1800000, costs: 1000000, gross_profit: 800000, operating_expenses: 320000, ebitda: 480000, depreciation: 65000, ebit: 415000, interest: 12000, taxes: 100750, net_income: 302250 },
  { year: 2028, revenue: 2200000, costs: 1200000, gross_profit: 1000000, operating_expenses: 380000, ebitda: 620000, depreciation: 70000, ebit: 550000, interest: 10000, taxes: 135000, net_income: 405000 },
];

const defaultBusinessCase: BusinessCaseData = {
  project_name: 'New Business Initiative',
  description: 'Business Case Analysis for Strategic Growth',
  financial_data: defaultFinancialData,
  assumptions: {
    'Revenue Growth Rate': '20%',
    'Cost Escalation': '15%',
    'Tax Rate': '25%',
    'Discount Rate': '10%',
  },
};

// Generate slides from business case data
const generateSlides = (businessCase: BusinessCaseData): SlideData[] => {
  const years = businessCase.financial_data.map(fd => fd.year.toString());
  
  return [
    {
      id: 1,
      title: businessCase.project_name,
      type: 'title',
      content: businessCase.description,
    },
    {
      id: 2,
      title: 'Executive Summary',
      type: 'content',
      content: '• Project overview and objectives\n• Key financial highlights\n• Strategic alignment',
    },
    {
      id: 3,
      title: 'Revenue Projection',
      type: 'chart',
      chartType: 'bar',
      chartData: {
        labels: years,
        datasets: [{
          label: 'Revenue',
          data: businessCase.financial_data.map(fd => fd.revenue),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      },
    },
    {
      id: 4,
      title: 'Cost Analysis',
      type: 'chart',
      chartType: 'bar',
      chartData: {
        labels: years,
        datasets: [
          {
            label: 'Direct Costs',
            data: businessCase.financial_data.map(fd => fd.costs),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: 'Operating Expenses',
            data: businessCase.financial_data.map(fd => fd.operating_expenses),
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
          },
        ],
      },
    },
    {
      id: 5,
      title: 'Profitability Analysis',
      type: 'chart',
      chartType: 'line',
      chartData: {
        labels: years,
        datasets: [
          {
            label: 'Gross Profit',
            data: businessCase.financial_data.map(fd => fd.gross_profit),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
          },
          {
            label: 'EBITDA',
            data: businessCase.financial_data.map(fd => fd.ebitda),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
          },
        ],
      },
    },
    {
      id: 6,
      title: 'Net Income Projection',
      type: 'chart',
      chartType: 'bar',
      chartData: {
        labels: years,
        datasets: [{
          label: 'Net Income',
          data: businessCase.financial_data.map(fd => fd.net_income),
          backgroundColor: 'rgba(46, 204, 113, 0.6)',
          borderColor: 'rgba(46, 204, 113, 1)',
          borderWidth: 1,
        }],
      },
    },
    {
      id: 7,
      title: 'Key Assumptions',
      type: 'content',
      content: Object.entries(businessCase.assumptions).map(([k, v]) => `• ${k}: ${v}`).join('\n'),
    },
    {
      id: 8,
      title: 'Risk Analysis',
      type: 'content',
      content: '• Market risks\n• Operational risks\n• Financial risks\n• Mitigation strategies',
    },
    {
      id: 9,
      title: 'Implementation Timeline',
      type: 'content',
      content: '• Phase 1: Planning and Setup\n• Phase 2: Implementation\n• Phase 3: Optimization\n• Phase 4: Scale',
    },
    {
      id: 10,
      title: 'Resource Requirements',
      type: 'content',
      content: '• Personnel needs\n• Technology infrastructure\n• Capital requirements\n• Training needs',
    },
    {
      id: 11,
      title: 'Financial Summary',
      type: 'content',
      content: `• Total Revenue (5-year): $${businessCase.financial_data.reduce((sum, fd) => sum + fd.revenue, 0).toLocaleString()}\n• Total Net Income: $${businessCase.financial_data.reduce((sum, fd) => sum + fd.net_income, 0).toLocaleString()}\n• ROI Analysis`,
    },
    {
      id: 12,
      title: 'Conclusion & Recommendations',
      type: 'content',
      content: '• Strategic alignment confirmed\n• Financial viability established\n• Recommended next steps',
    },
  ];
};

export const useBusinessCaseStore = create<BusinessCaseState>((set, get) => ({
  businessCase: defaultBusinessCase,
  auditResults: null,
  slides: generateSlides(defaultBusinessCase),
  isLoading: false,
  isAuditing: false,
  isExporting: false,
  
  setBusinessCase: (data) => set({ 
    businessCase: data, 
    slides: generateSlides(data) 
  }),
  
  updateFinancialData: (data) => {
    const newBusinessCase = { ...get().businessCase, financial_data: data };
    set({ 
      businessCase: newBusinessCase,
      slides: generateSlides(newBusinessCase)
    });
  },
  
  updateSingleRow: (index, data) => {
    const financialData = [...get().businessCase.financial_data];
    financialData[index] = { ...financialData[index], ...data };
    const newBusinessCase = { ...get().businessCase, financial_data: financialData };
    set({ 
      businessCase: newBusinessCase,
      slides: generateSlides(newBusinessCase)
    });
  },
  
  setProjectName: (name) => {
    const newBusinessCase = { ...get().businessCase, project_name: name };
    set({ 
      businessCase: newBusinessCase,
      slides: generateSlides(newBusinessCase)
    });
  },
  
  setDescription: (description) => {
    const newBusinessCase = { ...get().businessCase, description };
    set({ 
      businessCase: newBusinessCase,
      slides: generateSlides(newBusinessCase)
    });
  },
  
  setAssumptions: (assumptions) => {
    const newBusinessCase = { ...get().businessCase, assumptions };
    set({ 
      businessCase: newBusinessCase,
      slides: generateSlides(newBusinessCase)
    });
  },
  
  setAuditResults: (results) => set({ auditResults: results }),
  setLoading: (loading) => set({ isLoading: loading }),
  setAuditing: (auditing) => set({ isAuditing: auditing }),
  setExporting: (exporting) => set({ isExporting: exporting }),
  
  resetBusinessCase: () => set({
    businessCase: defaultBusinessCase,
    slides: generateSlides(defaultBusinessCase),
    auditResults: null,
  }),
}));
