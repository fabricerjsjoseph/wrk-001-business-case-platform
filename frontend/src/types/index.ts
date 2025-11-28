/**
 * Financial data for a single year
 */
export interface FinancialData {
  year: number;
  revenue: number;
  costs: number;
  gross_profit: number;
  operating_expenses: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interest: number;
  taxes: number;
  net_income: number;
}

/**
 * Complete business case data
 */
export interface BusinessCaseData {
  project_name: string;
  description?: string;
  financial_data: FinancialData[];
  assumptions: Record<string, string | number>;
}

/**
 * Slide data for a single slide
 */
export interface SlideData {
  id: number;
  title: string;
  type: 'title' | 'content' | 'chart';
  chartType?: 'bar' | 'line' | 'pie' | 'column';
  chartData?: ChartData;
  content?: string;
}

/**
 * Chart data structure
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Chart dataset
 */
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

/**
 * AI Audit finding
 */
export interface AuditFinding {
  type: 'error' | 'warning' | 'info';
  year: number;
  field: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

/**
 * AI Audit response
 */
export interface AuditResponse {
  status: string;
  findings: AuditFinding[];
  suggestions: string[];
  risk_score: number;
}

/**
 * Slide template info
 */
export interface SlideTemplate {
  id: number;
  title: string;
  type: 'title' | 'content' | 'chart';
}
