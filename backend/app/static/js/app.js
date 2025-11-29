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
        canvas_content: {}, // Store AI-generated canvas content
        strategy: {
            problem_statement: '',
            investment_type: '',
            strategic_pillar: '',
            stakeholders: '',
            signoff: false
        }
    },
    buildingBlocks: null, // Will be fetched from API
    auditResults: null,
    selectedBlock: null,
    currentEditBlock: null,
    isExporting: false,
    isAuditing: false,
    isGenerating: false,
    charts: {},
    financialMetrics: {
        npv: 0,
        irr: 0,
        paybackPeriod: null,
        rofe: 0,
        inflationRate: 3,
        hurdleRate: 10,
        initialInvestment: 500000
    },
    interrogator: {
        currentQuestion: null,
        questionsAnswered: 0,
        answers: [],
        usedQuestions: []
    }
};

// Hot Topic Questions for Investment Committee Preparation
const hotTopicQuestions = [
    { category: 'Cannibalization', question: 'How will this initiative affect sales of our existing products? What is the expected cannibalization rate?', hint: 'Consider the overlap with existing product lines and customer segments.' },
    { category: 'Ramp-up Curves', question: 'What is your expected ramp-up timeline? How long until this reaches full operational capacity?', hint: 'Think about resource constraints, market adoption, and learning curves.' },
    { category: 'Competitive Response', question: 'How do you expect competitors to respond to this initiative, and how will that impact your projections?', hint: 'Consider pricing pressure, feature matching, and market positioning.' },
    { category: 'Dependency Risk', question: 'What are the critical dependencies for this project, and what is your mitigation plan if any fail?', hint: 'Think about technology, suppliers, talent, and regulatory dependencies.' },
    { category: 'Market Validation', question: 'What customer validation have you done to confirm demand at the projected price point?', hint: 'Reference any pilots, surveys, focus groups, or pre-orders.' },
    { category: 'Scale Economics', question: 'At what volume does this business become profitable? What happens if you achieve only 50% of projected volume?', hint: 'Consider fixed vs variable costs and break-even analysis.' },
    { category: 'Resource Allocation', question: 'What resources will be diverted from existing initiatives, and what is the opportunity cost?', hint: 'Think about talent, capital, and management attention.' },
    { category: 'Exit Strategy', question: 'What is the exit strategy if this initiative underperforms? What are the sunk costs vs. recoverable assets?', hint: 'Consider asset liquidation value and contractual obligations.' },
    { category: 'Technology Risk', question: 'What technology risks exist, and how confident are you in the technical feasibility?', hint: 'Think about unproven technologies, integration complexity, and technical debt.' },
    { category: 'Regulatory Risk', question: 'What regulatory approvals are required, and what is the timeline and risk of non-approval?', hint: 'Consider industry regulations, compliance requirements, and geopolitical factors.' },
    { category: 'Talent Risk', question: 'Do you have the right talent to execute this? What is your plan for critical skill gaps?', hint: 'Think about hiring plans, training needs, and retention strategies.' },
    { category: 'Customer Acquisition', question: 'What is your customer acquisition cost assumption, and how does it compare to industry benchmarks?', hint: 'Consider marketing spend, sales cycles, and conversion rates.' },
    { category: 'Sensitivity Analysis', question: 'What happens to your IRR if costs increase by 20%? What is the margin of safety in your projections?', hint: 'Think about the key assumptions that drive the business case.' },
    { category: 'Strategic Fit', question: 'How does this initiative align with our 5-year strategic plan? Why now?', hint: 'Consider timing, strategic priorities, and corporate capabilities.' },
    { category: 'Execution Risk', question: 'What is your track record of executing similar initiatives? What lessons learned are you applying?', hint: 'Reference past projects, failures, and organizational capabilities.' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    fetchBuildingBlocks();
    renderFinancialData();
    updateProjectDisplay();
    populateBlockSelect();
    validateStrategyForm();
    updateFinancialMetrics();
    runCommercialAgentCheck();
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
        canvas_content: {},
        strategy: {
            problem_statement: '',
            investment_type: '',
            strategic_pillar: '',
            stakeholders: '',
            signoff: false
        }
    };
    state.auditResults = null;
    state.interrogator = {
        currentQuestion: null,
        questionsAnswered: 0,
        answers: [],
        usedQuestions: []
    };
    
    // Reset strategy form
    document.getElementById('problem-statement-input').value = '';
    document.getElementById('investment-type-select').value = '';
    document.getElementById('strategic-pillar-select').value = '';
    document.getElementById('stakeholders-input').value = '';
    document.getElementById('strategy-signoff').checked = false;
    
    // Reset financial settings
    document.getElementById('inflation-rate-input').value = 3;
    document.getElementById('hurdle-rate-input').value = 10;
    document.getElementById('initial-investment-input').value = 500000;
    
    // Reset interrogator
    document.getElementById('questions-answered').textContent = '0';
    document.getElementById('answers-list').innerHTML = '<p class="placeholder-text">Your answered questions will appear here.</p>';
    document.getElementById('answer-section').style.display = 'none';
    
    // Hide sensitivity results
    document.getElementById('sensitivity-results').style.display = 'none';
    
    updateProjectDisplay();
    renderFinancialData();
    renderCanvas();
    renderAuditResults();
    validateStrategyForm();
    updateFinancialMetrics();
    runCommercialAgentCheck();
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

// ========== MAIN TAB NAVIGATION ==========

function switchMainTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.main-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.main-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab-content`);
    });
    
    // Trigger metrics update when switching to financial tab
    if (tabName === 'financial') {
        updateFinancialMetrics();
    }
}

// ========== COMMERCIAL AGENT (SMART LOGIC) ==========

function runCommercialAgentCheck() {
    const issues = [];
    
    // Check for missing strategy inputs
    const strategy = state.businessCase.strategy;
    if (!strategy.problem_statement || !strategy.investment_type || !strategy.strategic_pillar || !strategy.stakeholders) {
        issues.push({ type: 'info', message: 'Complete the Strategy Validator to define your business case foundation.' });
    }
    
    // Check for negative NPV
    if (state.financialMetrics.npv < 0) {
        issues.push({ type: 'error', message: `Negative NPV detected (${formatCurrency(state.financialMetrics.npv)}). The project may not be financially viable.` });
    }
    
    // Check if IRR is below hurdle rate
    if (state.financialMetrics.irr > 0 && state.financialMetrics.irr < state.financialMetrics.hurdleRate) {
        issues.push({ type: 'warning', message: `IRR (${state.financialMetrics.irr.toFixed(1)}%) is below the hurdle rate (${state.financialMetrics.hurdleRate}%). Consider revising projections.` });
    }
    
    // Check for logic errors (Benefits < Costs)
    const totalRevenue = state.businessCase.financial_data.reduce((sum, fd) => sum + fd.revenue, 0);
    const totalCosts = state.businessCase.financial_data.reduce((sum, fd) => sum + fd.costs + fd.operating_expenses, 0);
    if (totalCosts > totalRevenue) {
        issues.push({ type: 'error', message: 'Total costs exceed total revenue. Review your financial projections.' });
    }
    
    // Check for unapproved spending (sign-off not complete)
    if (!strategy.signoff && totalRevenue > 0) {
        issues.push({ type: 'warning', message: 'Strategic sign-off pending. Complete the Strategy Validator before proceeding.' });
    }
    
    // Check for missing financial data
    if (state.businessCase.financial_data.length === 0) {
        issues.push({ type: 'info', message: 'Add financial projections in the Financial Modeling tab.' });
    }
    
    // Show the most important issue
    if (issues.length > 0) {
        // Prioritize: error > warning > info
        const errorIssue = issues.find(i => i.type === 'error');
        const warningIssue = issues.find(i => i.type === 'warning');
        const infoIssue = issues.find(i => i.type === 'info');
        
        const issue = errorIssue || warningIssue || infoIssue;
        showBanner(issue.type, issue.message);
    } else {
        // All good!
        showBanner('success', 'Business case is complete and financially viable. Ready for submission.');
    }
}

function showBanner(type, message) {
    const banner = document.getElementById('commercial-agent-banner');
    const iconSpan = banner.querySelector('.banner-icon');
    const messageSpan = banner.querySelector('.banner-message');
    
    // Set banner class
    banner.className = 'commercial-agent-banner ' + type;
    
    // Set icon based on type
    const icons = {
        'info': 'ℹ️',
        'warning': '⚠️',
        'error': '❌',
        'success': '✅'
    };
    iconSpan.textContent = icons[type] || 'ℹ️';
    messageSpan.textContent = message;
    
    banner.style.display = 'flex';
}

function closeBanner() {
    const banner = document.getElementById('commercial-agent-banner');
    banner.style.display = 'none';
}

// ========== STRATEGY VALIDATOR ==========

function validateStrategyForm() {
    const problemStatement = document.getElementById('problem-statement-input').value.trim();
    const investmentType = document.getElementById('investment-type-select').value;
    const strategicPillar = document.getElementById('strategic-pillar-select').value;
    const stakeholders = document.getElementById('stakeholders-input').value.trim();
    
    let isValid = true;
    
    // Update state
    state.businessCase.strategy.problem_statement = problemStatement;
    state.businessCase.strategy.investment_type = investmentType;
    state.businessCase.strategy.strategic_pillar = strategicPillar;
    state.businessCase.strategy.stakeholders = stakeholders;
    
    // Validate problem statement
    const problemInput = document.getElementById('problem-statement-input');
    const problemValidation = document.getElementById('problem-statement-validation');
    if (!problemStatement) {
        problemInput.classList.add('error');
        problemInput.classList.remove('valid');
        problemValidation.textContent = 'Problem statement is required';
        problemValidation.classList.remove('valid');
        isValid = false;
    } else {
        problemInput.classList.remove('error');
        problemInput.classList.add('valid');
        problemValidation.textContent = '✓ Complete';
        problemValidation.classList.add('valid');
    }
    
    // Validate investment type
    const investmentInput = document.getElementById('investment-type-select');
    const investmentValidation = document.getElementById('investment-type-validation');
    if (!investmentType) {
        investmentInput.classList.add('error');
        investmentInput.classList.remove('valid');
        investmentValidation.textContent = 'Investment type is required';
        investmentValidation.classList.remove('valid');
        isValid = false;
    } else {
        investmentInput.classList.remove('error');
        investmentInput.classList.add('valid');
        investmentValidation.textContent = '✓ Complete';
        investmentValidation.classList.add('valid');
    }
    
    // Validate strategic pillar
    const pillarInput = document.getElementById('strategic-pillar-select');
    const pillarValidation = document.getElementById('strategic-pillar-validation');
    if (!strategicPillar) {
        pillarInput.classList.add('error');
        pillarInput.classList.remove('valid');
        pillarValidation.textContent = 'Strategic pillar is required';
        pillarValidation.classList.remove('valid');
        isValid = false;
    } else {
        pillarInput.classList.remove('error');
        pillarInput.classList.add('valid');
        pillarValidation.textContent = '✓ Complete';
        pillarValidation.classList.add('valid');
    }
    
    // Validate stakeholders
    const stakeholdersInput = document.getElementById('stakeholders-input');
    const stakeholdersValidation = document.getElementById('stakeholders-validation');
    if (!stakeholders) {
        stakeholdersInput.classList.add('error');
        stakeholdersInput.classList.remove('valid');
        stakeholdersValidation.textContent = 'Stakeholder names are required';
        stakeholdersValidation.classList.remove('valid');
        isValid = false;
    } else {
        stakeholdersInput.classList.remove('error');
        stakeholdersInput.classList.add('valid');
        stakeholdersValidation.textContent = '✓ Complete';
        stakeholdersValidation.classList.add('valid');
    }
    
    // Update sign-off checkbox state
    const signOffCheckbox = document.getElementById('strategy-signoff');
    const signoffStatus = document.getElementById('signoff-status');
    
    if (isValid) {
        signOffCheckbox.disabled = false;
        signoffStatus.className = 'signoff-status ready';
        signoffStatus.innerHTML = '<span class="status-icon">✅</span><span class="status-text">All fields complete. You may now sign off.</span>';
        
        // Generate strategic narrative
        generateStrategicNarrative();
    } else {
        signOffCheckbox.disabled = true;
        signOffCheckbox.checked = false;
        state.businessCase.strategy.signoff = false;
        signoffStatus.className = 'signoff-status pending';
        signoffStatus.innerHTML = '<span class="status-icon">🔒</span><span class="status-text">Complete all mandatory fields to enable sign-off</span>';
        
        // Clear narrative
        const narrativeDiv = document.getElementById('strategic-narrative');
        narrativeDiv.innerHTML = '<p class="placeholder-text">Complete all mandatory fields above to generate the strategic narrative.</p>';
    }
    
    // Run commercial agent check
    runCommercialAgentCheck();
    
    return isValid;
}

function generateStrategicNarrative() {
    const strategy = state.businessCase.strategy;
    const investmentTypeLabel = strategy.investment_type === 'growth' ? 'Growth Investment' : 'Stay in Business (SIB)';
    const pillarLabels = {
        'revenue-growth': 'Revenue Growth',
        'operational-excellence': 'Operational Excellence',
        'customer-experience': 'Customer Experience',
        'digital-transformation': 'Digital Transformation',
        'sustainability': 'Sustainability',
        'innovation': 'Innovation'
    };
    const pillarLabel = pillarLabels[strategy.strategic_pillar] || strategy.strategic_pillar;
    
    const narrative = `
<div class="narrative-content">
<strong>Strategic Initiative:</strong> ${state.businessCase.project_name}

<strong>Problem/Opportunity:</strong>
${strategy.problem_statement}

<strong>Investment Classification:</strong> ${investmentTypeLabel}

<strong>Strategic Alignment:</strong> This initiative aligns with our "${pillarLabel}" strategic pillar.

<strong>Key Stakeholders:</strong> ${strategy.stakeholders}

<strong>Recommendation:</strong> Proceed to financial modeling to quantify the business impact and validate the investment thesis.
</div>
    `.trim();
    
    const narrativeDiv = document.getElementById('strategic-narrative');
    narrativeDiv.innerHTML = narrative;
}

function handleSignOff() {
    const signOffCheckbox = document.getElementById('strategy-signoff');
    const signoffStatus = document.getElementById('signoff-status');
    
    state.businessCase.strategy.signoff = signOffCheckbox.checked;
    
    if (signOffCheckbox.checked) {
        signoffStatus.className = 'signoff-status complete';
        signoffStatus.innerHTML = '<span class="status-icon">🎉</span><span class="status-text">Strategic sign-off complete! You may proceed to financial modeling.</span>';
        
        // Show success banner
        showBanner('success', 'Strategic sign-off complete! Navigate to Financial Modeling to continue.');
    } else {
        signoffStatus.className = 'signoff-status ready';
        signoffStatus.innerHTML = '<span class="status-icon">✅</span><span class="status-text">All fields complete. You may now sign off.</span>';
    }
    
    runCommercialAgentCheck();
}

// ========== FINANCIAL MODELING ENGINE ==========

function updateFinancialMetrics() {
    // Get settings from inputs
    const inflationRate = parseFloat(document.getElementById('inflation-rate-input')?.value || 3) / 100;
    const hurdleRate = parseFloat(document.getElementById('hurdle-rate-input')?.value || 10) / 100;
    const initialInvestment = parseFloat(document.getElementById('initial-investment-input')?.value || 500000);
    
    state.financialMetrics.inflationRate = inflationRate * 100;
    state.financialMetrics.hurdleRate = hurdleRate * 100;
    state.financialMetrics.initialInvestment = initialInvestment;
    
    // Apply inflation to costs and calculate cash flows
    const cashFlows = state.businessCase.financial_data.map((fd, index) => {
        // Apply compounding inflation to costs
        const inflatedCosts = fd.costs * Math.pow(1 + inflationRate, index);
        const inflatedOpex = fd.operating_expenses * Math.pow(1 + inflationRate, index);
        
        // Calculate adjusted cash flow (Net Income + Depreciation - adjusted costs difference)
        const adjustedNetIncome = fd.revenue - inflatedCosts - inflatedOpex - fd.depreciation - fd.interest;
        const adjustedTaxes = Math.max(0, adjustedNetIncome * 0.25);
        const cashFlow = adjustedNetIncome - adjustedTaxes + fd.depreciation;
        
        return cashFlow;
    });
    
    // Calculate NPV
    const npv = calculateNPV(cashFlows, hurdleRate, initialInvestment);
    state.financialMetrics.npv = npv;
    
    // Calculate IRR using Newton-Raphson method
    const irr = calculateIRR(cashFlows, initialInvestment);
    state.financialMetrics.irr = irr * 100;
    
    // Calculate Payback Period
    const paybackPeriod = calculatePaybackPeriod(cashFlows, initialInvestment);
    state.financialMetrics.paybackPeriod = paybackPeriod;
    
    // Calculate ROFE (Return on Funds Employed)
    const totalNetIncome = state.businessCase.financial_data.reduce((sum, fd) => sum + fd.net_income, 0);
    const averageNetIncome = totalNetIncome / state.businessCase.financial_data.length;
    const rofe = initialInvestment > 0 ? (averageNetIncome / initialInvestment) * 100 : 0;
    state.financialMetrics.rofe = rofe;
    
    // Update UI
    updateMetricsDisplay();
    
    // Run commercial agent check
    runCommercialAgentCheck();
}

function calculateNPV(cashFlows, discountRate, initialInvestment) {
    let npv = -initialInvestment;
    
    for (let i = 0; i < cashFlows.length; i++) {
        npv += cashFlows[i] / Math.pow(1 + discountRate, i + 1);
    }
    
    return npv;
}

function calculateIRR(cashFlows, initialInvestment, maxIterations = 100, tolerance = 0.0001) {
    // Newton-Raphson method for IRR calculation
    let irr = 0.1; // Initial guess of 10%
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let npv = -initialInvestment;
        let derivative = 0;
        
        for (let i = 0; i < cashFlows.length; i++) {
            const discountFactor = Math.pow(1 + irr, i + 1);
            npv += cashFlows[i] / discountFactor;
            derivative -= (i + 1) * cashFlows[i] / Math.pow(1 + irr, i + 2);
        }
        
        // Avoid division by zero
        if (Math.abs(derivative) < 1e-10) {
            break;
        }
        
        const newIrr = irr - npv / derivative;
        
        // Check for convergence
        if (Math.abs(newIrr - irr) < tolerance) {
            return Math.max(0, newIrr); // Ensure non-negative IRR
        }
        
        irr = newIrr;
        
        // Bound IRR to reasonable range
        if (irr < -0.99) irr = -0.99;
        if (irr > 10) irr = 10;
    }
    
    return Math.max(0, irr);
}

function calculatePaybackPeriod(cashFlows, initialInvestment) {
    let cumulativeCashFlow = -initialInvestment;
    
    for (let i = 0; i < cashFlows.length; i++) {
        cumulativeCashFlow += cashFlows[i];
        
        if (cumulativeCashFlow >= 0) {
            // Calculate fractional year
            const previousCumulative = cumulativeCashFlow - cashFlows[i];
            const fraction = Math.abs(previousCumulative) / cashFlows[i];
            return i + fraction;
        }
    }
    
    // Not recovered within projection period
    return null;
}

function updateMetricsDisplay() {
    const { npv, irr, paybackPeriod, rofe, hurdleRate } = state.financialMetrics;
    
    // Update NPV
    const npvCard = document.getElementById('npv-card');
    const npvValue = document.getElementById('npv-value');
    const npvIndicator = document.getElementById('npv-indicator');
    const npvStatus = document.getElementById('npv-status');
    
    npvValue.textContent = formatCurrency(npv);
    
    if (npv >= 0) {
        npvCard.className = 'metric-card positive';
        npvIndicator.textContent = '🟢';
        npvStatus.textContent = 'Project is financially viable';
        npvStatus.className = 'metric-status good';
    } else {
        npvCard.className = 'metric-card negative';
        npvIndicator.textContent = '🔴';
        npvStatus.textContent = 'Project may not be viable';
        npvStatus.className = 'metric-status bad';
    }
    
    // Update IRR
    const irrCard = document.getElementById('irr-card');
    const irrValue = document.getElementById('irr-value');
    const irrIndicator = document.getElementById('irr-indicator');
    const irrStatus = document.getElementById('irr-status');
    
    irrValue.textContent = irr.toFixed(1) + '%';
    
    if (irr >= hurdleRate) {
        irrCard.className = 'metric-card positive';
        irrIndicator.textContent = '🟢';
        irrStatus.textContent = `Above hurdle rate (${hurdleRate}%)`;
        irrStatus.className = 'metric-status good';
    } else if (irr >= hurdleRate * 0.8) {
        irrCard.className = 'metric-card warning';
        irrIndicator.textContent = '🟡';
        irrStatus.textContent = `Near hurdle rate (${hurdleRate}%)`;
        irrStatus.className = 'metric-status warning';
    } else {
        irrCard.className = 'metric-card negative';
        irrIndicator.textContent = '🔴';
        irrStatus.textContent = `Below hurdle rate (${hurdleRate}%)`;
        irrStatus.className = 'metric-status bad';
    }
    
    // Update Payback Period
    const paybackCard = document.getElementById('payback-card');
    const paybackValue = document.getElementById('payback-value');
    const paybackIndicator = document.getElementById('payback-indicator');
    const paybackStatus = document.getElementById('payback-status');
    
    if (paybackPeriod !== null) {
        paybackValue.textContent = paybackPeriod.toFixed(1) + ' years';
        
        if (paybackPeriod <= 3) {
            paybackCard.className = 'metric-card positive';
            paybackIndicator.textContent = '🟢';
            paybackStatus.textContent = 'Quick payback';
            paybackStatus.className = 'metric-status good';
        } else if (paybackPeriod <= 5) {
            paybackCard.className = 'metric-card warning';
            paybackIndicator.textContent = '🟡';
            paybackStatus.textContent = 'Moderate payback';
            paybackStatus.className = 'metric-status warning';
        } else {
            paybackCard.className = 'metric-card negative';
            paybackIndicator.textContent = '🔴';
            paybackStatus.textContent = 'Long payback period';
            paybackStatus.className = 'metric-status bad';
        }
    } else {
        paybackValue.textContent = '> 5 years';
        paybackCard.className = 'metric-card negative';
        paybackIndicator.textContent = '🔴';
        paybackStatus.textContent = 'Not recovered in projection period';
        paybackStatus.className = 'metric-status bad';
    }
    
    // Update ROFE
    const rofeCard = document.getElementById('rofe-card');
    const rofeValue = document.getElementById('rofe-value');
    const rofeIndicator = document.getElementById('rofe-indicator');
    const rofeStatus = document.getElementById('rofe-status');
    
    rofeValue.textContent = rofe.toFixed(1) + '%';
    
    if (rofe >= 15) {
        rofeCard.className = 'metric-card positive';
        rofeIndicator.textContent = '🟢';
        rofeStatus.textContent = 'Strong returns';
        rofeStatus.className = 'metric-status good';
    } else if (rofe >= 10) {
        rofeCard.className = 'metric-card warning';
        rofeIndicator.textContent = '🟡';
        rofeStatus.textContent = 'Acceptable returns';
        rofeStatus.className = 'metric-status warning';
    } else {
        rofeCard.className = 'metric-card negative';
        rofeIndicator.textContent = '🔴';
        rofeStatus.textContent = 'Low returns';
        rofeStatus.className = 'metric-status bad';
    }
}

// ========== SENSITIVITY ANALYSIS ==========

function runSensitivityAnalysis() {
    const sensitivityResults = document.getElementById('sensitivity-results');
    
    // Get current settings
    const hurdleRate = state.financialMetrics.hurdleRate / 100;
    const initialInvestment = state.financialMetrics.initialInvestment;
    const inflationRate = state.financialMetrics.inflationRate / 100;
    
    // Apply 10% reduction to benefits (revenue)
    const stressedCashFlows = state.businessCase.financial_data.map((fd, index) => {
        const stressedRevenue = fd.revenue * 0.9; // 10% reduction
        const inflatedCosts = fd.costs * Math.pow(1 + inflationRate, index);
        const inflatedOpex = fd.operating_expenses * Math.pow(1 + inflationRate, index);
        
        const adjustedNetIncome = stressedRevenue - inflatedCosts - inflatedOpex - fd.depreciation - fd.interest;
        const adjustedTaxes = Math.max(0, adjustedNetIncome * 0.25);
        const cashFlow = adjustedNetIncome - adjustedTaxes + fd.depreciation;
        
        return cashFlow;
    });
    
    // Calculate stressed metrics
    const stressedNpv = calculateNPV(stressedCashFlows, hurdleRate, initialInvestment);
    const stressedIrr = calculateIRR(stressedCashFlows, initialInvestment) * 100;
    
    // Update UI
    document.getElementById('stressed-npv').textContent = formatCurrency(stressedNpv);
    document.getElementById('stressed-irr').textContent = stressedIrr.toFixed(1) + '%';
    
    const verdictElement = document.getElementById('stress-verdict');
    const verdictText = verdictElement.querySelector('.verdict-text');
    
    if (stressedNpv >= 0) {
        verdictText.textContent = '✅ Project remains viable under stress';
        verdictText.className = 'value verdict-text viable';
    } else {
        verdictText.textContent = '❌ Project NOT viable under stress';
        verdictText.className = 'value verdict-text not-viable';
    }
    
    sensitivityResults.style.display = 'block';
}

// ========== HOT TOPIC INTERROGATOR ==========

function drawNewQuestion() {
    // Get available questions
    const availableQuestions = hotTopicQuestions.filter((_, index) => 
        !state.interrogator.usedQuestions.includes(index)
    );
    
    if (availableQuestions.length === 0) {
        // Reset if all questions used
        state.interrogator.usedQuestions = [];
        drawNewQuestion();
        return;
    }
    
    // Select random question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const originalIndex = hotTopicQuestions.indexOf(availableQuestions[randomIndex]);
    const question = availableQuestions[randomIndex];
    
    state.interrogator.currentQuestion = { ...question, index: originalIndex };
    state.interrogator.usedQuestions.push(originalIndex);
    
    // Update UI
    document.getElementById('card-category').textContent = question.category;
    document.getElementById('card-question').textContent = question.question;
    document.getElementById('card-hint').textContent = '💡 Hint: ' + question.hint;
    
    // Show answer section
    document.getElementById('answer-section').style.display = 'block';
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').focus();
    
    // Update counter
    document.getElementById('total-questions').textContent = hotTopicQuestions.length;
}

function submitAnswer() {
    const answerInput = document.getElementById('answer-input');
    const answer = answerInput.value.trim();
    
    if (!answer) {
        alert('Please enter a response before submitting.');
        return;
    }
    
    if (!state.interrogator.currentQuestion) {
        return;
    }
    
    // Save answer
    state.interrogator.answers.push({
        category: state.interrogator.currentQuestion.category,
        question: state.interrogator.currentQuestion.question,
        answer: answer
    });
    
    state.interrogator.questionsAnswered++;
    
    // Update counter
    document.getElementById('questions-answered').textContent = state.interrogator.questionsAnswered;
    
    // Add to answers list
    renderAnswersList();
    
    // Hide answer section
    document.getElementById('answer-section').style.display = 'none';
    state.interrogator.currentQuestion = null;
    
    // Show success message
    showBanner('success', 'Response recorded! Draw another question to continue preparing.');
}

function skipQuestion() {
    document.getElementById('answer-section').style.display = 'none';
    state.interrogator.currentQuestion = null;
}

function renderAnswersList() {
    const answersList = document.getElementById('answers-list');
    
    if (state.interrogator.answers.length === 0) {
        answersList.innerHTML = '<p class="placeholder-text">Your answered questions will appear here.</p>';
        return;
    }
    
    answersList.innerHTML = state.interrogator.answers.map((item, index) => `
        <div class="answer-item">
            <div class="answer-item-category">${item.category}</div>
            <div class="answer-item-question">${item.question}</div>
            <div class="answer-item-response">${item.answer}</div>
        </div>
    `).join('');
}
