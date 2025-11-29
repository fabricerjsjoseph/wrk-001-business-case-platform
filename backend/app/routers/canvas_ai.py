"""
Canvas AI router - API endpoints for AI-powered canvas generation and editing
Uses LlamaIndex ReAct Agent, Vertex AI, and Vertex AI Search
Implements Google Cloud ADC authentication (no API keys)
"""
from flask import Blueprint, jsonify, request, abort

from app.services.canvas_ai_service import (
    get_canvas_ai_service,
    CANVAS_BUILDING_BLOCKS,
    SEVEN_STEP_PITCH_FRAMEWORK
)
from app.services.knowledge_base_service import get_knowledge_base_service

bp = Blueprint('canvas_ai', __name__)


@bp.route('/generate', methods=['POST'])
def generate_canvas_content():
    """
    Generate AI-powered content for a canvas building block.
    
    Request body:
    {
        "block_id": "problem_statement",
        "context": {
            "project_name": "...",
            "description": "...",
            "financial_data": [...]
        },
        "use_knowledge_base": true
    }
    """
    try:
        data = request.get_json()
        if not data:
            abort(400, description="Request body is required")
        
        block_id = data.get('block_id')
        if not block_id:
            abort(400, description="block_id is required")
        
        context = data.get('context', {})
        use_knowledge_base = data.get('use_knowledge_base', True)
        
        # Get knowledge base context if enabled
        knowledge_context = ""
        if use_knowledge_base:
            kb_service = get_knowledge_base_service()
            if kb_service.is_configured():
                knowledge_context = kb_service.get_context_for_block(
                    block_id, context
                )
        
        # Generate canvas content
        ai_service = get_canvas_ai_service()
        result = ai_service.generate_canvas_content(
            block_id=block_id,
            context=context,
            knowledge_context=knowledge_context
        )
        
        return jsonify(result)
        
    except Exception as e:
        abort(500, description=str(e))


@bp.route('/generate-all', methods=['POST'])
def generate_full_canvas():
    """
    Generate AI-powered content for all canvas building blocks.
    
    Request body:
    {
        "context": {
            "project_name": "...",
            "description": "...",
            "financial_data": [...]
        }
    }
    """
    try:
        data = request.get_json()
        if not data:
            abort(400, description="Request body is required")
        
        context = data.get('context', {})
        
        ai_service = get_canvas_ai_service()
        result = ai_service.generate_full_canvas(context)
        
        return jsonify(result)
        
    except Exception as e:
        abort(500, description=str(e))


@bp.route('/enhance', methods=['POST'])
def enhance_content():
    """
    Enhance existing canvas content for clarity, impact, or persuasiveness.
    
    Request body:
    {
        "content": "Current content to enhance...",
        "enhancement_type": "clarity|impact|concise|data_driven|action_oriented"
    }
    """
    try:
        data = request.get_json()
        if not data:
            abort(400, description="Request body is required")
        
        content = data.get('content')
        if not content:
            abort(400, description="content is required")
        
        enhancement_type = data.get('enhancement_type', 'clarity')
        
        ai_service = get_canvas_ai_service()
        result = ai_service.enhance_content(
            content=content,
            enhancement_type=enhancement_type
        )
        
        return jsonify(result)
        
    except Exception as e:
        abort(500, description=str(e))


@bp.route('/suggest', methods=['POST'])
def get_suggestions():
    """
    Get AI-powered suggestions, statistics, and critical questions for a canvas block.
    
    Request body:
    {
        "block_id": "problem_statement",
        "current_content": "Current content...",
        "context": {
            "project_name": "...",
            "description": "..."
        }
    }
    """
    try:
        data = request.get_json()
        if not data:
            abort(400, description="Request body is required")
        
        block_id = data.get('block_id')
        if not block_id:
            abort(400, description="block_id is required")
        
        current_content = data.get('current_content', '')
        context = data.get('context', {})
        
        ai_service = get_canvas_ai_service()
        result = ai_service.generate_suggestions(
            block_id=block_id,
            current_content=current_content,
            context=context
        )
        
        return jsonify(result)
        
    except Exception as e:
        abort(500, description=str(e))


@bp.route('/feedback', methods=['POST'])
def process_feedback():
    """
    Process user feedback and regenerate improved content.
    
    Request body:
    {
        "block_id": "problem_statement",
        "current_content": "Current content...",
        "feedback": "User's feedback or improvement request...",
        "context": {
            "project_name": "...",
            "description": "..."
        }
    }
    """
    try:
        data = request.get_json()
        if not data:
            abort(400, description="Request body is required")
        
        block_id = data.get('block_id')
        if not block_id:
            abort(400, description="block_id is required")
        
        current_content = data.get('current_content', '')
        feedback = data.get('feedback', '')
        if not feedback:
            abort(400, description="feedback is required")
        
        context = data.get('context', {})
        
        ai_service = get_canvas_ai_service()
        result = ai_service.process_feedback(
            block_id=block_id,
            current_content=current_content,
            user_feedback=feedback,
            context=context
        )
        
        return jsonify(result)
        
    except Exception as e:
        abort(500, description=str(e))


@bp.route('/building-blocks', methods=['GET'])
def get_building_blocks():
    """
    Get the list of canvas building blocks and their definitions.
    Returns the structure aligned with the 7-step pitch framework.
    """
    return jsonify({
        "building_blocks": CANVAS_BUILDING_BLOCKS,
        "pitch_framework": SEVEN_STEP_PITCH_FRAMEWORK
    })


@bp.route('/knowledge-base/search', methods=['POST'])
def search_knowledge_base():
    """
    Search the knowledge base for relevant information.
    
    Request body:
    {
        "query": "search query",
        "page_size": 5
    }
    """
    try:
        data = request.get_json()
        if not data:
            abort(400, description="Request body is required")
        
        query = data.get('query')
        if not query:
            abort(400, description="query is required")
        
        page_size = data.get('page_size', 5)
        
        kb_service = get_knowledge_base_service()
        result = kb_service.search(query=query, page_size=page_size)
        
        return jsonify(result)
        
    except Exception as e:
        abort(500, description=str(e))


@bp.route('/knowledge-base/status', methods=['GET'])
def knowledge_base_status():
    """
    Check the status of the knowledge base configuration.
    """
    kb_service = get_knowledge_base_service()
    return jsonify({
        "configured": kb_service.is_configured(),
        "project_id": kb_service.project_id,
        "data_store_id": kb_service.data_store_id
    })


@bp.route('/status', methods=['GET'])
def ai_service_status():
    """
    Get the status of the AI services.
    """
    ai_service = get_canvas_ai_service()
    kb_service = get_knowledge_base_service()
    
    return jsonify({
        "canvas_ai_service": {
            "available": ai_service.llm is not None,
            "project_id": ai_service.project_id,
            "location": ai_service.location
        },
        "knowledge_base_service": {
            "configured": kb_service.is_configured(),
            "project_id": kb_service.project_id,
            "data_store_id": kb_service.data_store_id
        }
    })
