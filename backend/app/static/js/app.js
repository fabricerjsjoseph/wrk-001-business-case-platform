/**
 * Business Case Command Center - JavaScript Application
 * Canvas-based business case creation with AI-powered content generation
 */

// Global state management
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
        },
        canvas_content: {} // Store AI-generated canvas content
    },
    buildingBlocks: null, // Will be fetched from API
    auditResults: null,
    selectedBlock: null,
    currentEditBlock: null,
    isExporting: false,
    isAuditing: false,
    isGenerating: false,
    charts: {}
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    fetchBuildingBlocks();
    renderFinancialData();
    updateProjectDisplay();
    populateBlockSelect();
});

// ========== CANVAS BUILDING BLOCKS ==========

async function fetchBuildingBlocks() {
    try {
        const response = await fetch('/api/canvas/building-blocks');
        if (response.ok) {
            const data = await response.json();
            state.buildingBlocks = data.building_blocks;
            renderCanvas();
            populateBlockSelect();
        } else {
            // Use default building blocks if API fails
            state.buildingBlocks = getDefaultBuildingBlocks();
            renderCanvas();
            populateBlockSelect();
        }
    } catch (err) {
        console.warn('Could not fetch building blocks, using defaults:', err);
        state.buildingBlocks = getDefaultBuildingBlocks();
        renderCanvas();
        populateBlockSelect();
    }
}

function getDefaultBuildingBlocks() {
    return {
        "executive_summary": {
            "name": "Executive Summary",
            "pitch_step": 1,
            "description": "High-level overview of the business case"
        },
        "problem_statement": {
            "name": "Problem Statement",
            "pitch_step": 1,
            "description": "Define the problem or opportunity being addressed"
        },
        "solution_overview": {
            "name": "Solution Overview",
            "pitch_step": 2,
            "description": "Describe your proposed solution"
        },
        "value_proposition": {
            "name": "Value Proposition",
            "pitch_step": 3,
            "description": "Articulate the unique value and benefits"
        },
        "market_opportunity": {
            "name": "Market Opportunity",
            "pitch_step": 4,
            "description": "Define the market size and potential"
        },
        "financial_projections": {
            "name": "Financial Projections",
            "pitch_step": 5,
            "description": "Present financial forecasts and metrics"
        },
        "risk_analysis": {
            "name": "Risk Analysis",
            "pitch_step": 5,
            "description": "Identify and assess key risks"
        },
        "implementation_plan": {
            "name": "Implementation Plan",
            "pitch_step": 6,
            "description": "Outline the execution roadmap"
        },
        "traction_validation": {
            "name": "Traction & Validation",
            "pitch_step": 6,
            "description": "Show evidence and proof points"
        },
        "team_resources": {
            "name": "Team & Resources",
            "pitch_step": 7,
            "description": "Describe the team and resource requirements"
        },
        "call_to_action": {
            "name": "Ask & Next Steps",
            "pitch_step": 7,
            "description": "Define the specific request and next steps"
        },
        "conclusion": {
            "name": "Conclusion",
            "pitch_step": 7,
            "description": "Summary and recommendations"
        }
    };
}

function populateBlockSelect() {
    const select = document.getElementById('suggest-block-select');
    if (!select || !state.buildingBlocks) return;
    
    select.innerHTML = '<option value="">-- Select a block --</option>';
    
    Object.entries(state.buildingBlocks).forEach(([id, block]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${block.name} (Step ${block.pitch_step})`;
        select.appendChild(option);
    });
}

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
    renderCanvas();
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
    renderCanvas();
}

// ========== CANVAS RENDERING ==========

function renderCanvas() {
    if (!state.buildingBlocks) return;
    
    const canvasGrid = document.getElementById('canvas-grid');
    
    // Destroy existing charts
    if (window.Chart) {
        Object.values(state.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
    state.charts = {};
    
    canvasGrid.innerHTML = '';
    
    const blockIds = Object.keys(state.buildingBlocks);
    
    blockIds.forEach((blockId, index) => {
        const block = state.buildingBlocks[blockId];
        const content = state.businessCase.canvas_content[blockId] || '';
        const isAIGenerated = content && content.length > 0;
        
        const blockDiv = document.createElement('div');
        blockDiv.className = `canvas-block ${state.selectedBlock === blockId ? 'selected' : ''} ${isAIGenerated ? 'ai-generated' : ''}`;
        blockDiv.onclick = () => openEditModal(blockId);
        
        // Generate preview content based on block type
        let previewContent = content || getDefaultContent(blockId, block);
        
        // Truncate for preview
        const maxLength = 150;
        if (previewContent.length > maxLength) {
            previewContent = previewContent.substring(0, maxLength) + '...';
        }
        
        blockDiv.innerHTML = `
            <div class="block-number">${index + 1}</div>
            ${isAIGenerated ? '<div class="block-ai-badge">AI</div>' : ''}
            <div class="block-content">
                <h4 class="block-title">${block.name}</h4>
                <div class="block-text">${previewContent.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="block-pitch-step">Step ${block.pitch_step}</div>
        `;
        
        canvasGrid.appendChild(blockDiv);
    });
    
    document.getElementById('canvas-count').textContent = `${blockIds.length} building blocks`;
}

function getDefaultContent(blockId, block) {
    const bc = state.businessCase;
    
    // Generate default content based on block type and business case data
    const defaults = {
        'executive_summary': `${bc.project_name}\n${bc.description}\n\n• Overview and objectives\n• Key financial highlights\n• Strategic alignment`,
        'problem_statement': '• Define the problem or opportunity\n• Who is affected?\n• What is the cost of inaction?',
        'solution_overview': '• Your proposed solution\n• How it works\n• Key differentiators',
        'value_proposition': '• Key benefits\n• ROI potential\n• Competitive advantages',
        'market_opportunity': '• Market size and growth\n• Target customers\n• Industry trends',
        'financial_projections': `• Revenue: ${formatCurrency(bc.financial_data.reduce((sum, fd) => sum + fd.revenue, 0))} (5-year)\n• Net Income: ${formatCurrency(bc.financial_data.reduce((sum, fd) => sum + fd.net_income, 0))}\n• Key metrics and assumptions`,
        'risk_analysis': '• Market risks\n• Operational risks\n• Mitigation strategies',
        'implementation_plan': '• Phase 1: Planning\n• Phase 2: Implementation\n• Phase 3: Optimization',
        'traction_validation': '• Progress to date\n• Proof points\n• Key metrics',
        'team_resources': '• Team capabilities\n• Resource requirements\n• Expertise needed',
        'call_to_action': '• Specific ask\n• Next steps\n• Decision timeline',
        'conclusion': '• Key takeaways\n• Recommendation\n• Expected outcomes'
    };
    
    return defaults[blockId] || block.description;
}

// ========== CANVAS MODAL ==========

function openEditModal(blockId) {
    state.currentEditBlock = blockId;
    const block = state.buildingBlocks[blockId];
    const content = state.businessCase.canvas_content[blockId] || getDefaultContent(blockId, block);
    
    document.getElementById('modal-block-title').textContent = `Edit: ${block.name}`;
    document.getElementById('modal-content-editor').value = content;
    document.getElementById('modal-feedback-input').value = '';
    document.getElementById('canvas-edit-modal').style.display = 'flex';
}

function closeEditModal() {
    state.currentEditBlock = null;
    document.getElementById('canvas-edit-modal').style.display = 'none';
}

function saveBlockContent() {
    if (!state.currentEditBlock) return;
    
    const content = document.getElementById('modal-content-editor').value;
    state.businessCase.canvas_content[state.currentEditBlock] = content;
    
    closeEditModal();
    renderCanvas();
}

async function regenerateBlockContent(event) {
    if (!state.currentEditBlock) return;
    
    const btn = event ? event.target : document.querySelector('.modal-ai-actions .btn-ai');
    btn.disabled = true;
    btn.textContent = '⏳ Generating...';
    
    try {
        const response = await fetch('/api/canvas/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                block_id: state.currentEditBlock,
                context: state.businessCase,
                use_knowledge_base: true
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.content) {
                document.getElementById('modal-content-editor').value = result.content;
            } else {
                alert(result.error || 'Failed to generate content');
            }
        } else {
            alert('Failed to generate content. Please try again.');
        }
    } catch (err) {
        console.error('Generation error:', err);
        alert('Failed to generate content. Make sure the AI service is running.');
    } finally {
        btn.disabled = false;
        btn.textContent = '✨ Regenerate with AI';
    }
}

async function applyFeedback(event) {
    if (!state.currentEditBlock) return;
    
    const feedback = document.getElementById('modal-feedback-input').value;
    if (!feedback.trim()) {
        alert('Please enter feedback for the AI to improve the content.');
        return;
    }
    
    const currentContent = document.getElementById('modal-content-editor').value;
    const btn = event ? event.target : document.querySelector('.feedback-section .btn-secondary');
    btn.disabled = true;
    btn.textContent = 'Applying...';
    
    try {
        const response = await fetch('/api/canvas/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                block_id: state.currentEditBlock,
                current_content: currentContent,
                feedback: feedback,
                context: state.businessCase
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.revised_content) {
                document.getElementById('modal-content-editor').value = result.revised_content;
                document.getElementById('modal-feedback-input').value = '';
            } else {
                alert(result.error || 'Failed to apply feedback');
            }
        } else {
            alert('Failed to apply feedback. Please try again.');
        }
    } catch (err) {
        console.error('Feedback error:', err);
        alert('Failed to apply feedback. Make sure the AI service is running.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Apply Feedback';
    }
}

// ========== AI CANVAS GENERATION ==========

async function generateCanvasContent() {
    const btn = document.getElementById('generate-canvas-btn');
    btn.disabled = true;
    btn.innerHTML = '⏳ Generating...';
    state.isGenerating = true;
    
    try {
        const response = await fetch('/api/canvas/generate-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                context: state.businessCase
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.canvas_blocks) {
                // Update canvas content from AI generation
                Object.entries(result.canvas_blocks).forEach(([blockId, blockResult]) => {
                    if (blockResult.success && blockResult.content) {
                        state.businessCase.canvas_content[blockId] = blockResult.content;
                    }
                });
                renderCanvas();
                showSaveStatus('Canvas generated!');
            } else {
                alert('Failed to generate canvas content');
            }
        } else {
            alert('Failed to generate canvas. Please try again.');
        }
    } catch (err) {
        console.error('Canvas generation error:', err);
        alert('Failed to generate canvas. Make sure the AI service is running.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '✨ AI Generate';
        state.isGenerating = false;
    }
}

// ========== AI ASSISTANT TABS ==========

function switchAITab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.ai-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.ai-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// ========== SUGGESTIONS ==========

async function getSuggestions() {
    const blockId = document.getElementById('suggest-block-select').value;
    if (!blockId) {
        alert('Please select a canvas block');
        return;
    }
    
    const resultsDiv = document.getElementById('suggestions-results');
    resultsDiv.innerHTML = '<div class="loading">Getting suggestions...</div>';
    
    const currentContent = state.businessCase.canvas_content[blockId] || getDefaultContent(blockId, state.buildingBlocks[blockId]);
    
    try {
        const response = await fetch('/api/canvas/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                block_id: blockId,
                current_content: currentContent,
                context: state.businessCase
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                resultsDiv.innerHTML = `
                    <div class="ai-result-content">
                        <h4>Suggestions for ${state.buildingBlocks[blockId].name}</h4>
                        ${result.suggestions_content ? result.suggestions_content.replace(/\n/g, '<br>') : 'No suggestions available.'}
                    </div>
                `;
            } else {
                resultsDiv.innerHTML = `<div class="error-message">${result.error || 'Failed to get suggestions'}</div>`;
            }
        } else {
            resultsDiv.innerHTML = '<div class="error-message">Failed to get suggestions. Please try again.</div>';
        }
    } catch (err) {
        console.error('Suggestions error:', err);
        resultsDiv.innerHTML = '<div class="error-message">Failed to get suggestions. Make sure the AI service is running.</div>';
    }
}

// ========== CONTENT ENHANCEMENT ==========

async function enhanceContent() {
    const content = document.getElementById('enhance-content-input').value;
    if (!content.trim()) {
        alert('Please enter content to enhance');
        return;
    }
    
    const enhanceType = document.getElementById('enhance-type-select').value;
    const resultsDiv = document.getElementById('enhance-results');
    resultsDiv.innerHTML = '<div class="loading">Enhancing content...</div>';
    
    try {
        const response = await fetch('/api/canvas/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: content,
                enhancement_type: enhanceType
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                resultsDiv.innerHTML = `
                    <div class="ai-result-content">
                        <h4>Enhanced Content (${enhanceType})</h4>
                        ${result.enhanced_content ? result.enhanced_content.replace(/\n/g, '<br>') : 'Enhancement not available.'}
                    </div>
                `;
            } else {
                resultsDiv.innerHTML = `<div class="error-message">${result.error || 'Failed to enhance content'}</div>`;
            }
        } else {
            resultsDiv.innerHTML = '<div class="error-message">Failed to enhance content. Please try again.</div>';
        }
    } catch (err) {
        console.error('Enhance error:', err);
        resultsDiv.innerHTML = '<div class="error-message">Failed to enhance content. Make sure the AI service is running.</div>';
    }
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
            await response.json();
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
        },
        canvas_content: {}
    };
    state.auditResults = null;
    
    updateProjectDisplay();
    renderFinancialData();
    renderCanvas();
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
