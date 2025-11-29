"""
AI Auditor router - Vertex AI integration for logic error detection
"""
from flask import Blueprint, jsonify, request, abort

bp = Blueprint('ai_auditor', __name__)


def analyze_financial_logic(data):
    """Analyze financial data for logical errors"""
    findings = []
    financial_data = data.get('financial_data', [])
    
    for idx, fd in enumerate(financial_data):
        year = fd.get('year', 0)
        revenue = fd.get('revenue', 0)
        costs = fd.get('costs', 0)
        gross_profit = fd.get('gross_profit', 0)
        operating_expenses = fd.get('operating_expenses', 0)
        ebitda = fd.get('ebitda', 0)
        depreciation = fd.get('depreciation', 0)
        ebit = fd.get('ebit', 0)
        
        # Check gross profit calculation
        expected_gross_profit = revenue - costs
        if abs(gross_profit - expected_gross_profit) > 0.01:
            findings.append({
                "type": "error",
                "year": year,
                "field": "gross_profit",
                "message": f"Gross Profit mismatch. Expected: {expected_gross_profit:.2f}, Found: {gross_profit:.2f}",
                "severity": "high"
            })
        
        # Check EBITDA calculation
        expected_ebitda = gross_profit - operating_expenses
        if abs(ebitda - expected_ebitda) > 0.01:
            findings.append({
                "type": "error",
                "year": year,
                "field": "ebitda",
                "message": f"EBITDA mismatch. Expected: {expected_ebitda:.2f}, Found: {ebitda:.2f}",
                "severity": "high"
            })
        
        # Check EBIT calculation
        expected_ebit = ebitda - depreciation
        if abs(ebit - expected_ebit) > 0.01:
            findings.append({
                "type": "error",
                "year": year,
                "field": "ebit",
                "message": f"EBIT mismatch. Expected: {expected_ebit:.2f}, Found: {ebit:.2f}",
                "severity": "high"
            })
        
        # Check for negative values where they shouldn't be
        if revenue < 0:
            findings.append({
                "type": "warning",
                "year": year,
                "field": "revenue",
                "message": "Negative revenue detected",
                "severity": "medium"
            })
        
        # Check for unrealistic growth rates
        if idx > 0:
            prev_fd = financial_data[idx - 1]
            prev_revenue = prev_fd.get('revenue', 0)
            if prev_revenue > 0:
                growth_rate = (revenue - prev_revenue) / prev_revenue
                if growth_rate > 1.0:  # More than 100% growth
                    findings.append({
                        "type": "warning",
                        "year": year,
                        "field": "revenue",
                        "message": f"High revenue growth rate: {growth_rate*100:.1f}%",
                        "severity": "medium"
                    })
                elif growth_rate < -0.5:  # More than 50% decline
                    findings.append({
                        "type": "warning",
                        "year": year,
                        "field": "revenue",
                        "message": f"Significant revenue decline: {growth_rate*100:.1f}%",
                        "severity": "medium"
                    })
        
        # Check margin consistency
        if revenue > 0:
            gross_margin = gross_profit / revenue
            if gross_margin < 0:
                findings.append({
                    "type": "warning",
                    "year": year,
                    "field": "gross_profit",
                    "message": "Negative gross margin detected",
                    "severity": "high"
                })
            elif gross_margin > 0.9:
                findings.append({
                    "type": "info",
                    "year": year,
                    "field": "gross_profit",
                    "message": f"Very high gross margin: {gross_margin*100:.1f}%",
                    "severity": "low"
                })
    
    return findings


def generate_suggestions(findings, data):
    """Generate improvement suggestions based on findings"""
    suggestions = []
    
    error_count = sum(1 for f in findings if f["type"] == "error")
    warning_count = sum(1 for f in findings if f["type"] == "warning")
    
    if error_count > 0:
        suggestions.append("Review and correct calculation formulas in the financial model")
    
    if warning_count > 0:
        suggestions.append("Validate assumptions for flagged metrics")
    
    if any(f["field"] == "revenue" and "growth" in f.get("message", "") for f in findings):
        suggestions.append("Consider adding sensitivity analysis for revenue projections")
    
    if not data.get('assumptions'):
        suggestions.append("Document key assumptions underlying the financial projections")
    
    if len(data.get('financial_data', [])) < 3:
        suggestions.append("Consider extending projections to at least 3-5 years")
    
    return suggestions


def calculate_risk_score(findings):
    """Calculate overall risk score based on findings"""
    if not findings:
        return 0.0
    
    severity_weights = {"high": 3, "medium": 2, "low": 1}
    total_weight = sum(severity_weights.get(f.get("severity", "low"), 1) for f in findings)
    max_possible = len(findings) * 3
    
    return min(1.0, total_weight / max(max_possible, 1))


@bp.route('/audit', methods=['POST'])
def audit_business_case():
    """
    Perform AI audit on business case data.
    This performs rule-based validation and optionally uses Vertex AI for advanced analysis.
    """
    try:
        data = request.get_json()
        business_case_data = data.get('business_case_data', {})
        
        # Perform rule-based analysis
        findings = analyze_financial_logic(business_case_data)
        suggestions = generate_suggestions(findings, business_case_data)
        risk_score = calculate_risk_score(findings)
        
        return jsonify({
            "status": "completed",
            "findings": findings,
            "suggestions": suggestions,
            "risk_score": risk_score
        })
    except Exception as e:
        abort(500, description=str(e))


@bp.route('/validate-formula', methods=['POST'])
def validate_formula():
    """Validate a specific formula or calculation"""
    try:
        formula = request.get_json()
        left_side = formula.get("left_side", 0)
        right_side = formula.get("right_side", 0)
        operator = formula.get("operator", "=")
        tolerance = formula.get("tolerance", 0.01)
        
        if operator == "=":
            is_valid = abs(left_side - right_side) <= tolerance
        elif operator == ">":
            is_valid = left_side > right_side
        elif operator == "<":
            is_valid = left_side < right_side
        elif operator == ">=":
            is_valid = left_side >= right_side
        elif operator == "<=":
            is_valid = left_side <= right_side
        else:
            is_valid = False
        
        return jsonify({
            "is_valid": is_valid,
            "left_side": left_side,
            "right_side": right_side,
            "difference": abs(left_side - right_side)
        })
    except Exception as e:
        abort(400, description=str(e))


@bp.route('/rules', methods=['GET'])
def get_validation_rules():
    """Get list of validation rules applied during audit"""
    return jsonify({
        "rules": [
            {
                "id": "gross_profit_check",
                "description": "Gross Profit = Revenue - Costs",
                "severity": "high"
            },
            {
                "id": "ebitda_check",
                "description": "EBITDA = Gross Profit - Operating Expenses",
                "severity": "high"
            },
            {
                "id": "ebit_check",
                "description": "EBIT = EBITDA - Depreciation",
                "severity": "high"
            },
            {
                "id": "negative_revenue_check",
                "description": "Revenue should not be negative",
                "severity": "medium"
            },
            {
                "id": "growth_rate_check",
                "description": "Flag unusual year-over-year growth rates",
                "severity": "medium"
            },
            {
                "id": "margin_check",
                "description": "Validate profit margins are within reasonable ranges",
                "severity": "low"
            }
        ]
    })
