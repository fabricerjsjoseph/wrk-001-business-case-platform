"""
Data management router
"""
from flask import Blueprint, jsonify, request, abort

bp = Blueprint('data', __name__)

# In-memory storage for demo purposes
business_cases: dict = {}


@bp.route('/business-case', methods=['POST'])
def create_business_case():
    """Create or update a business case"""
    data = request.get_json()
    project_name = data.get('project_name')
    business_cases[project_name] = data
    return jsonify({"status": "success", "project_name": project_name})


@bp.route('/business-case/<project_name>', methods=['GET'])
def get_business_case(project_name):
    """Get a business case by project name"""
    if project_name not in business_cases:
        abort(404, description="Business case not found")
    return jsonify(business_cases[project_name])


@bp.route('/business-cases', methods=['GET'])
def list_business_cases():
    """List all business cases"""
    return jsonify(list(business_cases.keys()))


@bp.route('/business-case/<project_name>/financial-data', methods=['PUT'])
def update_financial_data(project_name):
    """Update financial data for a business case"""
    if project_name not in business_cases:
        abort(404, description="Business case not found")
    financial_data = request.get_json()
    business_cases[project_name]['financial_data'] = financial_data
    return jsonify({"status": "success", "updated_rows": len(financial_data)})


@bp.route('/business-case/<project_name>', methods=['DELETE'])
def delete_business_case(project_name):
    """Delete a business case"""
    if project_name not in business_cases:
        abort(404, description="Business case not found")
    del business_cases[project_name]
    return jsonify({"status": "success", "deleted": project_name})
