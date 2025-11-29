import React, { useCallback, useMemo } from 'react';
import { HotTable, HotColumn } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import type { CellChange, ChangeSource } from 'handsontable/common';
import 'handsontable/dist/handsontable.full.min.css';
import { useBusinessCaseStore } from '../store/businessCaseStore';
import type { FinancialData } from '../types';
import './DataDeck.css';

// Register Handsontable modules
registerAllModules();

// Column configuration
const COLUMNS = [
  { data: 'year', title: 'Year', type: 'numeric', readOnly: true },
  { data: 'revenue', title: 'Revenue', type: 'numeric', numericFormat: { pattern: '$0,0' } },
  { data: 'costs', title: 'Costs', type: 'numeric', numericFormat: { pattern: '$0,0' } },
  { data: 'gross_profit', title: 'Gross Profit', type: 'numeric', numericFormat: { pattern: '$0,0' }, readOnly: true },
  { data: 'operating_expenses', title: 'Op. Expenses', type: 'numeric', numericFormat: { pattern: '$0,0' } },
  { data: 'ebitda', title: 'EBITDA', type: 'numeric', numericFormat: { pattern: '$0,0' }, readOnly: true },
  { data: 'depreciation', title: 'Depreciation', type: 'numeric', numericFormat: { pattern: '$0,0' } },
  { data: 'ebit', title: 'EBIT', type: 'numeric', numericFormat: { pattern: '$0,0' }, readOnly: true },
  { data: 'interest', title: 'Interest', type: 'numeric', numericFormat: { pattern: '$0,0' } },
  { data: 'taxes', title: 'Taxes', type: 'numeric', numericFormat: { pattern: '$0,0' }, readOnly: true },
  { data: 'net_income', title: 'Net Income', type: 'numeric', numericFormat: { pattern: '$0,0' }, readOnly: true },
];

export const DataDeck: React.FC = () => {
  const financialData = useBusinessCaseStore((state) => state.businessCase.financial_data);
  const updateFinancialData = useBusinessCaseStore((state) => state.updateFinancialData);

  // Calculate derived fields when data changes
  const calculateDerivedFields = useCallback((data: FinancialData[]): FinancialData[] => {
    return data.map((row) => {
      const gross_profit = row.revenue - row.costs;
      const ebitda = gross_profit - row.operating_expenses;
      const ebit = ebitda - row.depreciation;
      const pretax_income = ebit - row.interest;
      const taxes = pretax_income * 0.25; // 25% tax rate
      const net_income = pretax_income - taxes;

      return {
        ...row,
        gross_profit,
        ebitda,
        ebit,
        taxes,
        net_income,
      };
    });
  }, []);

  // Handle data change from Handsontable
  const handleAfterChange = useCallback((
    changes: CellChange[] | null,
    source: ChangeSource
  ) => {
    if (source === 'loadData' || !changes) return;

    const newData = [...financialData];
    
    changes.forEach(([row, prop, , newValue]) => {
      if (typeof prop === 'string' && row < newData.length) {
        const typedProp = prop as keyof FinancialData;
        newData[row] = { 
          ...newData[row], 
          [typedProp]: Number(newValue) || 0 
        };
      }
    });

    const calculatedData = calculateDerivedFields(newData);
    updateFinancialData(calculatedData);
  }, [financialData, calculateDerivedFields, updateFinancialData]);

  // Memoize table settings
  const tableSettings = useMemo(() => ({
    data: financialData,
    colHeaders: COLUMNS.map(c => c.title),
    columns: COLUMNS,
    rowHeaders: true,
    width: '100%',
    height: '100%',
    licenseKey: 'non-commercial-and-evaluation',
    stretchH: 'all' as const,
    autoWrapRow: true,
    contextMenu: false,
    manualColumnResize: true,
    className: 'htCenter htMiddle',
  }), [financialData]);

  return (
    <div className="data-deck-container">
      <div className="data-deck-header">
        <h2>Data Deck</h2>
        <div className="data-deck-info">
          <span className="info-badge calculated">Calculated fields are highlighted</span>
        </div>
      </div>
      <div className="data-deck-table">
        <HotTable
          {...tableSettings}
          afterChange={handleAfterChange}
        >
          {COLUMNS.map((col, idx) => (
            <HotColumn
              key={idx}
              data={col.data}
              type={col.type}
              readOnly={col.readOnly}
              className={col.readOnly ? 'calculated-cell' : ''}
            />
          ))}
        </HotTable>
      </div>
      <div className="data-deck-footer">
        <div className="formula-legend">
          <span><strong>Formulas:</strong></span>
          <span>Gross Profit = Revenue - Costs</span>
          <span>EBITDA = Gross Profit - Op. Expenses</span>
          <span>EBIT = EBITDA - Depreciation</span>
          <span>Net Income = EBIT - Interest - Taxes (25%)</span>
        </div>
      </div>
    </div>
  );
};
