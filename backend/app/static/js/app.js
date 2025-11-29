/**
 * Business Case Command Center - JavaScript Application
 * Replaces React functionality with vanilla JS
 */

// Global state management (similar to Zustand store)
const state = {
    businessCase: {
        project_name: 'New Business Initiative',
        description: 'Business Case Analysis for Strategic Growth',
        financial_data: [
            { year: 2024, revenue: 1000000, costs: 600000, gross_profit: 400000, operating_expenses: 200000, ebitda: 200000, depreciation: 50000, ebit: 150000, interest: 20000, taxes: 32500, net_income: 97500 },
            { year: 2025, revenue: 1200000, costs: 700000, gross_profit: 500000, operating_expenses: 230000, ebitda: 270000, depreciation: 55000, ebit: 215000, interest: 18000, taxes: 49250, net_income: 147750 },
            { year: 2026, revenue: 1500000, costs: 850000, gross_profit: 650000, operating_expenses: 280000, ebitda: 370000, depreciation: 60000, ebit: 310000, interest: 15000, taxes: 73750, net_income: 221250 },
            { year: 2027, revenue: 1800000, costs: 1000000, gross_profit: 800000, operating_expenses: 320000, ebitda: 480000, depreciation: 65000, ebit: 415000, interest: 12000, taxes: 100750, net_income: 302250 },
            { year: 2028, revenue: 2200000, costs: 1200000, gross_profit: 1000000, operating_expenses: 380000, ebitda: 620000, depreciation: 70000, ebit: 550000, interest: 10000, taxes: 135000, net_income: 405000 },
        ],
        assumptions: {
            'Revenue Growth Rate': '20%',
            'Cost Escalation': '15%',
            'Tax Rate': '25%',
            'Discount Rate': '10%',
        }
    },
    auditResults: null,
    selectedSlide: null,
    isExporting: false,
    isAuditing: false,
    charts: {} // Store chart instances for cleanup
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderSlides();
    renderFinancialData();
    updateProjectDisplay();
});

// ========== PROJECT MANAGEMENT ==========

function toggleEditMode(isEditing) {
    const displayDiv = document.getElementById('project-info-display');
    const editDiv = document.getElementById('project-edit-form');
    
    if (isEditing) {
        displayDiv.style.display = 'none';
        editDiv.style.display = 'flex';
        document.getElementById('project-name-input').value = state.businessCase.project_name;
        document.getElementById('project-desc-input').value = state.businessCase.description || '';
    } else {
        displayDiv.style.display = 'block';
        editDiv.style.display = 'none';
    }
}

function submitProjectEdit() {
    const nameInput = document.getElementById('project-name-input');
    const descInput = document.getElementById('project-desc-input');
    
    state.businessCase.project_name = nameInput.value;
    state.businessCase.description = descInput.value;
    
    toggleEditMode(false);
    updateProjectDisplay();
    renderSlides(); // Update slides to reflect new title
}

function updateProjectDisplay() {
    document.getElementById('project-name-display').textContent = state.businessCase.project_name;
    document.getElementById('project-description-display').textContent = state.businessCase.description || '';
}

// ========== FINANCIAL DATA ==========

function calculateDerivedFields(data) {
    return data.map(row => {
        const gross_profit = row.revenue - row.costs;
        const ebitda = gross_profit - row.operating_expenses;
        const ebit = ebitda - row.depreciation;
        const pretax_income = ebit - row.interest;
        const taxes = pretax_income * 0.25;
        const net_income = pretax_income - taxes;

        return {
            ...row,
            gross_profit,
            ebitda,
            ebit,
            taxes,
            net_income
        };
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function renderFinancialData() {
    const tbody = document.getElementById('financial-data-body');
    tbody.innerHTML = '';
    
    state.businessCase.financial_data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        
        // Year (readonly)
        tr.innerHTML = `
            <td class="year-cell">${row.year}</td>
            <td><input type="number" value="${row.revenue}" data-row="${rowIndex}" data-field="revenue" onchange="handleDataChange(this)"></td>
            <td><input type="number" value="${row.costs}" data-row="${rowIndex}" data-field="costs" onchange="handleDataChange(this)"></td>
            <td class="calculated-cell">${formatCurrency(row.gross_profit)}</td>
            <td><input type="number" value="${row.operating_expenses}" data-row="${rowIndex}" data-field="operating_expenses" onchange="handleDataChange(this)"></td>
            <td class="calculated-cell">${formatCurrency(row.ebitda)}</td>
            <td><input type="number" value="${row.depreciation}" data-row="${rowIndex}" data-field="depreciation" onchange="handleDataChange(this)"></td>
            <td class="calculated-cell">${formatCurrency(row.ebit)}</td>
            <td><input type="number" value="${row.interest}" data-row="${rowIndex}" data-field="interest" onchange="handleDataChange(this)"></td>
            <td class="calculated-cell">${formatCurrency(row.taxes)}</td>
            <td class="calculated-cell">${formatCurrency(row.net_income)}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

function handleDataChange(input) {
    const rowIndex = parseInt(input.dataset.row);
    const field = input.dataset.field;
    const value = parseFloat(input.value) || 0;
    
    state.businessCase.financial_data[rowIndex][field] = value;
    state.businessCase.financial_data = calculateDerivedFields(state.businessCase.financial_data);
    
    renderFinancialData();
    renderSlides();
}

// ========== SLIDES ==========

function generateSlides() {
    const bc = state.businessCase;
    const years = bc.financial_data.map(fd => fd.year.toString());
    
    return [
        {
            id: 1,
            title: bc.project_name,
            type: 'title',
            content: bc.description,
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
                    data: bc.financial_data.map(fd => fd.revenue),
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
                        data: bc.financial_data.map(fd => fd.costs),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Operating Expenses',
                        data: bc.financial_data.map(fd => fd.operating_expenses),
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
                        data: bc.financial_data.map(fd => fd.gross_profit),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                    },
                    {
                        label: 'EBITDA',
                        data: bc.financial_data.map(fd => fd.ebitda),
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
                    data: bc.financial_data.map(fd => fd.net_income),
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
            content: Object.entries(bc.assumptions).map(([k, v]) => `• ${k}: ${v}`).join('\n'),
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
            content: `• Total Revenue (5-year): $${bc.financial_data.reduce((sum, fd) => sum + fd.revenue, 0).toLocaleString()}\n• Total Net Income: $${bc.financial_data.reduce((sum, fd) => sum + fd.net_income, 0).toLocaleString()}\n• ROI Analysis`,
        },
        {
            id: 12,
            title: 'Conclusion & Recommendations',
            type: 'content',
            content: '• Strategic alignment confirmed\n• Financial viability established\n• Recommended next steps',
        },
    ];
}

function renderSlides() {
    const slides = generateSlides();
    const slideGrid = document.getElementById('slide-grid');
    
    // Destroy existing charts (only if Chart.js is available)
    if (window.Chart) {
        Object.values(state.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
    state.charts = {};
    
    slideGrid.innerHTML = '';
    
    slides.forEach(slide => {
        const slideDiv = document.createElement('div');
        slideDiv.className = `live-slide ${state.selectedSlide === slide.id ? 'selected' : ''}`;
        slideDiv.onclick = () => selectSlide(slide.id);
        
        let contentHtml = '';
        
        if (slide.type === 'title') {
            contentHtml = `
                <div class="slide-title-content">
                    <h3 class="slide-main-title">${slide.title}</h3>
                    ${slide.content ? `<p class="slide-subtitle">${slide.content}</p>` : ''}
                </div>
            `;
        } else if (slide.type === 'content') {
            const bullets = slide.content.split('\n').map(line => 
                `<p class="slide-bullet">${line}</p>`
            ).join('');
            contentHtml = `
                <div class="slide-text-content">
                    <h4 class="slide-header">${slide.title}</h4>
                    <div class="slide-bullets">${bullets}</div>
                </div>
            `;
        } else if (slide.type === 'chart' && slide.chartData) {
            contentHtml = `
                <div class="slide-chart-content">
                    <h4 class="slide-header">${slide.title}</h4>
                    <div class="chart-container">
                        <canvas id="chart-${slide.id}"></canvas>
                    </div>
                </div>
            `;
        }
        
        slideDiv.innerHTML = `
            <div class="slide-number">${slide.id}</div>
            <div class="slide-content">
                ${contentHtml}
            </div>
        `;
        
        slideGrid.appendChild(slideDiv);
        
        // Render chart after adding to DOM
        if (slide.type === 'chart' && slide.chartData) {
            setTimeout(() => renderChart(slide), 0);
        }
    });
    
    document.getElementById('slide-count').textContent = `${slides.length} slides`;
}

function renderChart(slide) {
    const canvas = document.getElementById(`chart-${slide.id}`);
    if (!canvas) return;
    
    // Check if Chart.js is properly loaded (consistent with fallback in HTML)
    if (!window.Chart) {
        console.warn('Chart.js not available, skipping chart render');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { size: 8 },
                    boxWidth: 10,
                },
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                ticks: { font: { size: 8 } },
            },
            y: {
                ticks: { 
                    font: { size: 8 },
                    callback: function(value) {
                        if (typeof value === 'number') {
                            return value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value;
                        }
                        return value;
                    }
                },
            },
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { size: 8 },
                    boxWidth: 10,
                },
            },
        },
    };
    
    let chartType = slide.chartType;
    if (chartType === 'bar') chartType = 'bar';
    else if (chartType === 'line') chartType = 'line';
    else if (chartType === 'pie') chartType = 'pie';
    
    const options = chartType === 'pie' ? pieOptions : chartOptions;
    
    state.charts[slide.id] = new Chart(ctx, {
        type: chartType,
        data: slide.chartData,
        options: options
    });
}

function selectSlide(slideId) {
    state.selectedSlide = state.selectedSlide === slideId ? null : slideId;
    renderSlides();
}

// ========== API FUNCTIONS ==========

async function saveBusinessCase() {
    try {
        const response = await fetch('/api/data/business-case', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.businessCase)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Save failed:', errorText);
            showSaveStatus('Save failed');
            return;
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            await response.json(); // Consume the response
        }
        showSaveStatus('Saved!');
    } catch (err) {
        console.error('Save error:', err);
        showSaveStatus('Save failed');
    }
}

function showSaveStatus(message) {
    const statusEl = document.getElementById('save-status');
    statusEl.textContent = message;
    statusEl.style.display = 'inline-block';
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 2000);
}

async function exportToPptx() {
    const exportBtn = document.getElementById('export-btn');
    exportBtn.disabled = true;
    exportBtn.innerHTML = '⏳ Exporting...';
    
    try {
        const response = await fetch('/api/export/pptx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.businessCase)
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${state.businessCase.project_name.replace(/\s+/g, '_')}_business_case.pptx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } else {
            alert('Failed to export. Please try again.');
        }
    } catch (err) {
        console.error('Export error:', err);
        alert('Failed to export. Make sure the backend is running.');
    } finally {
        exportBtn.disabled = false;
        exportBtn.innerHTML = '📤 Export PPTX';
    }
}

function resetBusinessCase() {
    state.businessCase = {
        project_name: 'New Business Initiative',
        description: 'Business Case Analysis for Strategic Growth',
        financial_data: [
            { year: 2024, revenue: 1000000, costs: 600000, gross_profit: 400000, operating_expenses: 200000, ebitda: 200000, depreciation: 50000, ebit: 150000, interest: 20000, taxes: 32500, net_income: 97500 },
            { year: 2025, revenue: 1200000, costs: 700000, gross_profit: 500000, operating_expenses: 230000, ebitda: 270000, depreciation: 55000, ebit: 215000, interest: 18000, taxes: 49250, net_income: 147750 },
            { year: 2026, revenue: 1500000, costs: 850000, gross_profit: 650000, operating_expenses: 280000, ebitda: 370000, depreciation: 60000, ebit: 310000, interest: 15000, taxes: 73750, net_income: 221250 },
            { year: 2027, revenue: 1800000, costs: 1000000, gross_profit: 800000, operating_expenses: 320000, ebitda: 480000, depreciation: 65000, ebit: 415000, interest: 12000, taxes: 100750, net_income: 302250 },
            { year: 2028, revenue: 2200000, costs: 1200000, gross_profit: 1000000, operating_expenses: 380000, ebitda: 620000, depreciation: 70000, ebit: 550000, interest: 10000, taxes: 135000, net_income: 405000 },
        ],
        assumptions: {
            'Revenue Growth Rate': '20%',
            'Cost Escalation': '15%',
            'Tax Rate': '25%',
            'Discount Rate': '10%',
        }
    };
    state.auditResults = null;
    
    updateProjectDisplay();
    renderFinancialData();
    renderSlides();
    renderAuditResults();
}

// ========== AI AUDITOR ==========

async function runAudit() {
    const auditBtn = document.getElementById('audit-btn');
    auditBtn.disabled = true;
    auditBtn.textContent = 'Analyzing...';
    
    try {
        const response = await fetch('/api/ai/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ business_case_data: state.businessCase })
        });
        
        if (response.ok) {
            state.auditResults = await response.json();
            renderAuditResults();
        } else {
            showAuditError('Failed to run audit. Please try again.');
        }
    } catch (err) {
        console.error('Audit error:', err);
        showAuditError('Failed to run audit. Make sure the backend is running.');
    } finally {
        auditBtn.disabled = false;
        auditBtn.textContent = 'Run Audit';
    }
}

function showAuditError(message) {
    const resultsDiv = document.getElementById('audit-results');
    const emptyState = document.getElementById('empty-state');
    
    emptyState.style.display = 'none';
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `<div class="error-message">${message}</div>`;
}

function renderAuditResults() {
    const resultsDiv = document.getElementById('audit-results');
    const emptyState = document.getElementById('empty-state');
    
    if (!state.auditResults) {
        emptyState.style.display = 'block';
        resultsDiv.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    resultsDiv.style.display = 'block';
    
    const riskLevel = getRiskLevel(state.auditResults.risk_score);
    const groupedFindings = groupFindingsByYear(state.auditResults.findings);
    
    let findingsHtml = '';
    if (state.auditResults.findings.length === 0) {
        findingsHtml = `<div class="no-findings">✅ No issues found! Your data looks consistent.</div>`;
    } else {
        findingsHtml = `<div class="findings-list">`;
        for (const [year, findings] of Object.entries(groupedFindings)) {
            findingsHtml += `
                <div class="year-group">
                    <div class="year-header">Year ${year}</div>
                    ${findings.map(f => `
                        <div class="finding-item ${f.type}">
                            <div class="finding-icons">
                                <span>${getTypeIcon(f.type)}</span>
                                <span>${getSeverityIcon(f.severity)}</span>
                            </div>
                            <div class="finding-details">
                                <span class="finding-field">${f.field}</span>
                                <span class="finding-message">${f.message}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        findingsHtml += `</div>`;
    }
    
    let suggestionsHtml = '';
    if (state.auditResults.suggestions.length > 0) {
        suggestionsHtml = `
            <div class="suggestions-section">
                <h3>Suggestions</h3>
                <ul class="suggestions-list">
                    ${state.auditResults.suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    resultsDiv.innerHTML = `
        <div class="risk-score-section">
            <h3>Risk Assessment</h3>
            <div class="risk-meter">
                <div class="risk-fill" style="width: ${state.auditResults.risk_score * 100}%; background-color: ${riskLevel.color};"></div>
            </div>
            <div class="risk-label" style="color: ${riskLevel.color};">
                ${riskLevel.label} Risk (${(state.auditResults.risk_score * 100).toFixed(0)}%)
            </div>
        </div>
        
        <div class="findings-section">
            <h3>Findings (${state.auditResults.findings.length})</h3>
            ${findingsHtml}
        </div>
        
        ${suggestionsHtml}
    `;
}

function getRiskLevel(score) {
    if (score < 0.3) return { label: 'Low', color: '#27ae60' };
    if (score < 0.6) return { label: 'Medium', color: '#f39c12' };
    return { label: 'High', color: '#e74c3c' };
}

function getSeverityIcon(severity) {
    switch (severity) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '⚪';
    }
}

function getTypeIcon(type) {
    switch (type) {
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return '•';
    }
}

function groupFindingsByYear(findings) {
    const grouped = {};
    findings.forEach(finding => {
        if (!grouped[finding.year]) {
            grouped[finding.year] = [];
        }
        grouped[finding.year].push(finding);
    });
    return grouped;
}
