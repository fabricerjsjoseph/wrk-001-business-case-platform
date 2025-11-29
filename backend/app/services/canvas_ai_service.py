"""
Canvas AI Service - LlamaIndex ReAct Agent for AI-powered canvas generation
Uses Vertex AI for LLM, Vertex AI Search for knowledge base, and Google Cloud ADC auth
"""
import os
from typing import Optional

from llama_index.core import Settings
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.query_engine import RouterQueryEngine
from llama_index.core.selectors import PydanticSingleSelector
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.llms.vertex import Vertex

# 7-Step Pitch Framework for grounding AI responses
SEVEN_STEP_PITCH_FRAMEWORK = """
The 7-Step Pitch Framework structures a persuasive business case:

1. **Hook/Problem Statement**: Capture attention with a compelling problem or opportunity.
   - What is the pain point or opportunity?
   - Why does it matter now?

2. **Solution Overview**: Present your solution clearly and concisely.
   - What is your proposed solution?
   - How does it address the problem?

3. **Value Proposition**: Articulate the unique value and benefits.
   - What makes this solution unique?
   - What are the key benefits for stakeholders?

4. **Market Opportunity**: Demonstrate the market size and potential.
   - What is the total addressable market?
   - What is the growth trajectory?

5. **Business Model**: Explain how value translates to revenue.
   - How will this generate revenue?
   - What are the key financial metrics?

6. **Traction/Validation**: Show evidence of progress and validation.
   - What milestones have been achieved?
   - What proof points exist?

7. **Ask/Call to Action**: Clear request and next steps.
   - What resources are needed?
   - What are the specific asks?
"""

# Canvas building blocks aligned with 7-step pitch framework
CANVAS_BUILDING_BLOCKS = {
    "problem_statement": {
        "name": "Problem Statement",
        "pitch_step": 1,
        "description": "Define the problem or opportunity being addressed",
        "prompts": [
            "What specific problem are you solving?",
            "Who experiences this problem?",
            "What is the cost of inaction?"
        ]
    },
    "solution_overview": {
        "name": "Solution Overview",
        "pitch_step": 2,
        "description": "Describe your proposed solution",
        "prompts": [
            "What is your solution?",
            "How does it work?",
            "What makes it effective?"
        ]
    },
    "value_proposition": {
        "name": "Value Proposition",
        "pitch_step": 3,
        "description": "Articulate the unique value and benefits",
        "prompts": [
            "What are the key benefits?",
            "What differentiates this solution?",
            "What is the ROI potential?"
        ]
    },
    "market_opportunity": {
        "name": "Market Opportunity",
        "pitch_step": 4,
        "description": "Define the market size and potential",
        "prompts": [
            "What is the market size?",
            "What are the growth trends?",
            "Who are the target customers?"
        ]
    },
    "financial_projections": {
        "name": "Financial Projections",
        "pitch_step": 5,
        "description": "Present financial forecasts and metrics",
        "prompts": [
            "What are the revenue projections?",
            "What are the cost assumptions?",
            "What is the break-even timeline?"
        ]
    },
    "risk_analysis": {
        "name": "Risk Analysis",
        "pitch_step": 5,
        "description": "Identify and assess key risks",
        "prompts": [
            "What are the main risks?",
            "How will risks be mitigated?",
            "What contingencies exist?"
        ]
    },
    "implementation_plan": {
        "name": "Implementation Plan",
        "pitch_step": 6,
        "description": "Outline the execution roadmap",
        "prompts": [
            "What are the key milestones?",
            "What resources are needed?",
            "What is the timeline?"
        ]
    },
    "traction_validation": {
        "name": "Traction & Validation",
        "pitch_step": 6,
        "description": "Show evidence and proof points",
        "prompts": [
            "What progress has been made?",
            "What validation exists?",
            "What are the key metrics?"
        ]
    },
    "team_resources": {
        "name": "Team & Resources",
        "pitch_step": 7,
        "description": "Describe the team and resource requirements",
        "prompts": [
            "Who is on the team?",
            "What resources are needed?",
            "What expertise is required?"
        ]
    },
    "call_to_action": {
        "name": "Ask & Next Steps",
        "pitch_step": 7,
        "description": "Define the specific request and next steps",
        "prompts": [
            "What is the specific ask?",
            "What are the next steps?",
            "What is the decision timeline?"
        ]
    },
    "executive_summary": {
        "name": "Executive Summary",
        "pitch_step": 1,
        "description": "High-level overview of the business case",
        "prompts": [
            "What is the one-sentence summary?",
            "What are the key highlights?",
            "What is the bottom line?"
        ]
    },
    "conclusion": {
        "name": "Conclusion",
        "pitch_step": 7,
        "description": "Summary and recommendations",
        "prompts": [
            "What are the key takeaways?",
            "What is the recommendation?",
            "What is the expected outcome?"
        ]
    }
}


def get_vertex_llm(
    project_id: Optional[str] = None,
    location: str = "us-central1",
    model: str = "gemini-1.5-flash"
) -> Vertex:
    """
    Initialize Vertex AI LLM with Google Cloud ADC authentication.
    No API keys required - uses Application Default Credentials.
    """
    # Use environment variable if project_id not provided
    project = project_id or os.environ.get("GOOGLE_CLOUD_PROJECT")
    
    return Vertex(
        model=model,
        project=project,
        location=location,
        temperature=0.7,
        max_tokens=2048
    )


def create_canvas_generation_prompt(
    block_id: str,
    context: dict,
    knowledge_context: str = ""
) -> str:
    """
    Create a prompt for canvas content generation grounded in the 7-step pitch framework.
    """
    block = CANVAS_BUILDING_BLOCKS.get(block_id, {})
    block_name = block.get("name", block_id)
    description = block.get("description", "")
    pitch_step = block.get("pitch_step", 1)
    
    project_name = context.get("project_name", "Business Initiative")
    project_description = context.get("description", "")
    financial_data = context.get("financial_data", [])
    
    # Format financial data summary
    financial_summary = ""
    if financial_data:
        total_revenue = sum(fd.get("revenue", 0) for fd in financial_data)
        total_net_income = sum(fd.get("net_income", 0) for fd in financial_data)
        years = [fd.get("year", 0) for fd in financial_data]
        financial_summary = f"""
Financial Data Summary:
- Projection Period: {min(years)} to {max(years)}
- Total Revenue: ${total_revenue:,.0f}
- Total Net Income: ${total_net_income:,.0f}
"""
    
    prompt = f"""
You are a business case expert helping to create compelling canvas content for a business case presentation.

{SEVEN_STEP_PITCH_FRAMEWORK}

Current Canvas Block: {block_name} (Pitch Step {pitch_step})
Description: {description}

Project: {project_name}
Project Description: {project_description}
{financial_summary}

{f"Additional Context from Knowledge Base: {knowledge_context}" if knowledge_context else ""}

Generate professional, persuasive content for this canvas block that:
1. Aligns with the 7-step pitch framework
2. Is clear, concise, and impactful
3. Uses specific data and metrics where available
4. Follows business best practices
5. Is formatted with bullet points for easy reading

Provide 3-5 key bullet points for this canvas block.
"""
    return prompt


def enhance_content_prompt(
    content: str,
    enhancement_type: str = "clarity"
) -> str:
    """
    Create a prompt for AI content enhancement.
    """
    enhancement_instructions = {
        "clarity": "Make this content clearer and easier to understand while preserving the key message.",
        "impact": "Make this content more impactful and persuasive for executive decision-makers.",
        "concise": "Make this content more concise while retaining essential information.",
        "data_driven": "Add more specific metrics, statistics, or quantifiable evidence.",
        "action_oriented": "Make this content more action-oriented with clear calls to action."
    }
    
    instruction = enhancement_instructions.get(
        enhancement_type,
        enhancement_instructions["clarity"]
    )
    
    prompt = f"""
You are a business communication expert enhancing content for a business case presentation.

{SEVEN_STEP_PITCH_FRAMEWORK}

Original Content:
{content}

Enhancement Request: {instruction}

Provide an enhanced version that:
1. Maintains the core message and facts
2. Is more compelling and professional
3. Uses strong, active language
4. Is suitable for executive presentations

Also provide 2-3 alternative phrasings for key sentences.
"""
    return prompt


def generate_suggestions_prompt(
    block_id: str,
    current_content: str,
    context: dict
) -> str:
    """
    Create a prompt for generating suggestions, statistics, and critical questions.
    """
    block = CANVAS_BUILDING_BLOCKS.get(block_id, {})
    block_name = block.get("name", block_id)
    prompts = block.get("prompts", [])
    
    prompt = f"""
You are a strategic advisor reviewing a business case canvas block.

{SEVEN_STEP_PITCH_FRAMEWORK}

Canvas Block: {block_name}
Current Content:
{current_content}

Project: {context.get("project_name", "Business Initiative")}

Provide:

1. **Improvement Suggestions** (3-5 specific, actionable suggestions):
   - How can this content be strengthened?
   - What's missing that should be included?

2. **Relevant Statistics** (2-3 industry statistics or benchmarks):
   - What data points would strengthen this section?
   - What benchmarks should be referenced?

3. **Critical Questions** (3-5 questions a skeptical reviewer might ask):
   - What gaps exist in the reasoning?
   - What objections might arise?

4. **Pitch Framework Alignment** (Score 1-10):
   - How well does this align with Step {block.get("pitch_step", 1)} of the pitch framework?
   - What would improve alignment?

Format each section clearly with bullet points.
"""
    return prompt


class CanvasAIService:
    """
    Service class for AI-powered canvas operations using LlamaIndex ReAct Agent.
    """
    
    def __init__(
        self,
        project_id: Optional[str] = None,
        location: str = "us-central1"
    ):
        """
        Initialize the Canvas AI Service.
        Uses Google Cloud ADC authentication (no API keys).
        """
        self.project_id = project_id or os.environ.get("GOOGLE_CLOUD_PROJECT")
        self.location = location
        self._llm = None
        self._agent = None
    
    @property
    def llm(self) -> Vertex:
        """Lazy initialization of Vertex AI LLM."""
        if self._llm is None:
            try:
                self._llm = get_vertex_llm(
                    project_id=self.project_id,
                    location=self.location
                )
                # Set as default LLM for LlamaIndex
                Settings.llm = self._llm
            except Exception as e:
                # Return None if Vertex AI is not configured
                # This allows the service to be initialized without GCP credentials
                print(f"Warning: Could not initialize Vertex AI LLM: {e}")
                return None
        return self._llm
    
    def generate_canvas_content(
        self,
        block_id: str,
        context: dict,
        knowledge_context: str = ""
    ) -> dict:
        """
        Generate content for a specific canvas building block.
        
        Args:
            block_id: The ID of the canvas building block
            context: Business case context including project info and financial data
            knowledge_context: Additional context from knowledge base
            
        Returns:
            dict with generated content and metadata
        """
        if block_id not in CANVAS_BUILDING_BLOCKS:
            return {
                "success": False,
                "error": f"Unknown canvas block: {block_id}",
                "content": None
            }
        
        block = CANVAS_BUILDING_BLOCKS[block_id]
        
        # Check if LLM is available
        if self.llm is None:
            # Return placeholder content when Vertex AI is not configured
            return {
                "success": True,
                "block_id": block_id,
                "block_name": block["name"],
                "pitch_step": block["pitch_step"],
                "content": self._generate_placeholder_content(block_id, context),
                "is_placeholder": True,
                "message": "AI service not configured. Using placeholder content."
            }
        
        try:
            prompt = create_canvas_generation_prompt(
                block_id, context, knowledge_context
            )
            
            messages = [
                ChatMessage(
                    role=MessageRole.SYSTEM,
                    content="You are an expert business strategist creating compelling business case content."
                ),
                ChatMessage(
                    role=MessageRole.USER,
                    content=prompt
                )
            ]
            
            response = self.llm.chat(messages)
            
            return {
                "success": True,
                "block_id": block_id,
                "block_name": block["name"],
                "pitch_step": block["pitch_step"],
                "content": response.message.content,
                "is_placeholder": False
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "block_id": block_id,
                "content": None
            }
    
    def enhance_content(
        self,
        content: str,
        enhancement_type: str = "clarity"
    ) -> dict:
        """
        Enhance existing content for clarity, impact, or other improvements.
        
        Args:
            content: The original content to enhance
            enhancement_type: Type of enhancement (clarity, impact, concise, data_driven, action_oriented)
            
        Returns:
            dict with enhanced content and alternatives
        """
        if self.llm is None:
            return {
                "success": False,
                "error": "AI service not configured",
                "enhanced_content": content,
                "alternatives": []
            }
        
        try:
            prompt = enhance_content_prompt(content, enhancement_type)
            
            messages = [
                ChatMessage(
                    role=MessageRole.SYSTEM,
                    content="You are an expert business writer improving content for maximum persuasiveness."
                ),
                ChatMessage(
                    role=MessageRole.USER,
                    content=prompt
                )
            ]
            
            response = self.llm.chat(messages)
            
            return {
                "success": True,
                "enhancement_type": enhancement_type,
                "original_content": content,
                "enhanced_content": response.message.content
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "enhanced_content": content,
                "alternatives": []
            }
    
    def generate_suggestions(
        self,
        block_id: str,
        current_content: str,
        context: dict
    ) -> dict:
        """
        Generate suggestions, statistics, and critical questions for a canvas block.
        
        Args:
            block_id: The canvas block ID
            current_content: Current content of the block
            context: Business case context
            
        Returns:
            dict with suggestions, statistics, and questions
        """
        if self.llm is None:
            return {
                "success": False,
                "error": "AI service not configured",
                "suggestions": [],
                "statistics": [],
                "critical_questions": []
            }
        
        try:
            prompt = generate_suggestions_prompt(block_id, current_content, context)
            
            messages = [
                ChatMessage(
                    role=MessageRole.SYSTEM,
                    content="You are a strategic advisor providing actionable feedback on business cases."
                ),
                ChatMessage(
                    role=MessageRole.USER,
                    content=prompt
                )
            ]
            
            response = self.llm.chat(messages)
            
            return {
                "success": True,
                "block_id": block_id,
                "suggestions_content": response.message.content
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "suggestions": [],
                "statistics": [],
                "critical_questions": []
            }
    
    def process_feedback(
        self,
        block_id: str,
        current_content: str,
        user_feedback: str,
        context: dict
    ) -> dict:
        """
        Process user feedback and regenerate content accordingly.
        
        Args:
            block_id: The canvas block ID
            current_content: Current content of the block
            user_feedback: User's feedback or improvement request
            context: Business case context
            
        Returns:
            dict with revised content
        """
        if self.llm is None:
            return {
                "success": False,
                "error": "AI service not configured",
                "revised_content": current_content
            }
        
        block = CANVAS_BUILDING_BLOCKS.get(block_id, {})
        
        prompt = f"""
You are a business case expert revising content based on user feedback.

{SEVEN_STEP_PITCH_FRAMEWORK}

Canvas Block: {block.get("name", block_id)} (Pitch Step {block.get("pitch_step", 1)})

Current Content:
{current_content}

User Feedback:
{user_feedback}

Project Context:
- Name: {context.get("project_name", "Business Initiative")}
- Description: {context.get("description", "")}

Revise the content to address the user's feedback while:
1. Maintaining alignment with the 7-step pitch framework
2. Keeping the content professional and persuasive
3. Preserving any accurate data or facts from the original
4. Incorporating the requested changes naturally

Provide the revised content in a clean, formatted structure with bullet points.
"""
        
        try:
            messages = [
                ChatMessage(
                    role=MessageRole.SYSTEM,
                    content="You are an expert business strategist revising content based on feedback."
                ),
                ChatMessage(
                    role=MessageRole.USER,
                    content=prompt
                )
            ]
            
            response = self.llm.chat(messages)
            
            return {
                "success": True,
                "block_id": block_id,
                "original_content": current_content,
                "user_feedback": user_feedback,
                "revised_content": response.message.content
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "revised_content": current_content
            }
    
    def generate_full_canvas(self, context: dict) -> dict:
        """
        Generate content for all canvas building blocks.
        
        Args:
            context: Business case context
            
        Returns:
            dict with content for all blocks
        """
        results = {}
        
        for block_id in CANVAS_BUILDING_BLOCKS:
            result = self.generate_canvas_content(block_id, context)
            results[block_id] = result
        
        return {
            "success": True,
            "canvas_blocks": results,
            "block_definitions": CANVAS_BUILDING_BLOCKS
        }
    
    def _generate_placeholder_content(self, block_id: str, context: dict) -> str:
        """
        Generate placeholder content when AI is not available.
        """
        block = CANVAS_BUILDING_BLOCKS.get(block_id, {})
        prompts = block.get("prompts", [])
        project_name = context.get("project_name", "Your Project")
        
        placeholder = f"**{block.get('name', block_id)}**\n\n"
        placeholder += f"Content for {project_name}:\n\n"
        
        for prompt in prompts:
            placeholder += f"• {prompt}\n"
        
        placeholder += "\n[Configure Vertex AI to generate AI-powered content]"
        
        return placeholder
    
    @staticmethod
    def get_building_blocks() -> dict:
        """Return the canvas building block definitions."""
        return CANVAS_BUILDING_BLOCKS
    
    @staticmethod
    def get_pitch_framework() -> str:
        """Return the 7-step pitch framework description."""
        return SEVEN_STEP_PITCH_FRAMEWORK


# Singleton instance for use across the application
_canvas_ai_service = None


def get_canvas_ai_service(
    project_id: Optional[str] = None,
    location: str = "us-central1"
) -> CanvasAIService:
    """
    Get or create the Canvas AI Service singleton.
    """
    global _canvas_ai_service
    if _canvas_ai_service is None:
        _canvas_ai_service = CanvasAIService(
            project_id=project_id,
            location=location
        )
    return _canvas_ai_service
