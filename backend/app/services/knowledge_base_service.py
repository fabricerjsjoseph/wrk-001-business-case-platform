"""
Knowledge Base Service - Vertex AI Search integration for grounded AI responses
Uses Google Cloud ADC authentication (no API keys)
"""
import os
from typing import Optional

from google.cloud import discoveryengine_v1 as discoveryengine


class KnowledgeBaseService:
    """
    Service for interacting with Vertex AI Search (Discovery Engine) as a knowledge base.
    Uses Google Cloud ADC authentication.
    """
    
    def __init__(
        self,
        project_id: Optional[str] = None,
        location: str = "global",
        data_store_id: Optional[str] = None
    ):
        """
        Initialize the Knowledge Base Service.
        
        Args:
            project_id: Google Cloud project ID (uses ADC if not provided)
            location: Location for the data store (default: global)
            data_store_id: The ID of the Vertex AI Search data store
        """
        self.project_id = project_id or os.environ.get("GOOGLE_CLOUD_PROJECT")
        self.location = location
        self.data_store_id = data_store_id or os.environ.get(
            "VERTEX_AI_SEARCH_DATA_STORE"
        )
        self._client = None
        self._search_client = None
    
    @property
    def client(self) -> Optional[discoveryengine.DocumentServiceClient]:
        """Lazy initialization of Document Service client."""
        if self._client is None and self.project_id and self.data_store_id:
            try:
                self._client = discoveryengine.DocumentServiceClient()
            except Exception as e:
                print(f"Warning: Could not initialize Document Service client: {e}")
        return self._client
    
    @property
    def search_client(self) -> Optional[discoveryengine.SearchServiceClient]:
        """Lazy initialization of Search Service client."""
        if self._search_client is None and self.project_id and self.data_store_id:
            try:
                self._search_client = discoveryengine.SearchServiceClient()
            except Exception as e:
                print(f"Warning: Could not initialize Search Service client: {e}")
        return self._search_client
    
    def _get_data_store_path(self) -> str:
        """Get the full path to the data store."""
        return (
            f"projects/{self.project_id}"
            f"/locations/{self.location}"
            f"/dataStores/{self.data_store_id}"
        )
    
    def _get_serving_config_path(self) -> str:
        """Get the full path to the serving config."""
        return (
            f"projects/{self.project_id}"
            f"/locations/{self.location}"
            f"/dataStores/{self.data_store_id}"
            f"/servingConfigs/default_serving_config"
        )
    
    def search(
        self,
        query: str,
        page_size: int = 5,
        filter_expression: Optional[str] = None
    ) -> dict:
        """
        Search the knowledge base using Vertex AI Search.
        
        Args:
            query: The search query
            page_size: Number of results to return
            filter_expression: Optional filter expression
            
        Returns:
            dict with search results and context
        """
        if not self.search_client:
            return {
                "success": False,
                "error": "Knowledge base not configured",
                "results": [],
                "context": ""
            }
        
        try:
            request = discoveryengine.SearchRequest(
                serving_config=self._get_serving_config_path(),
                query=query,
                page_size=page_size,
            )
            
            if filter_expression:
                request.filter = filter_expression
            
            response = self.search_client.search(request)
            
            results = []
            context_parts = []
            
            for result in response.results:
                doc = result.document
                doc_data = {
                    "id": doc.id,
                    "name": doc.name,
                }
                
                # Extract struct data if available
                if doc.struct_data:
                    for key, value in doc.struct_data.items():
                        doc_data[key] = value
                
                # Extract content for context
                if doc.content:
                    content = doc.content.raw_bytes.decode("utf-8") if doc.content.raw_bytes else ""
                    doc_data["content"] = content
                    if content:
                        context_parts.append(content[:500])  # Limit context length
                
                results.append(doc_data)
            
            return {
                "success": True,
                "query": query,
                "results": results,
                "result_count": len(results),
                "context": "\n\n".join(context_parts)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "results": [],
                "context": ""
            }
    
    def get_document(self, document_id: str) -> dict:
        """
        Retrieve a specific document from the knowledge base.
        
        Args:
            document_id: The document ID
            
        Returns:
            dict with document data
        """
        if not self.client:
            return {
                "success": False,
                "error": "Knowledge base not configured",
                "document": None
            }
        
        try:
            document_path = (
                f"{self._get_data_store_path()}"
                f"/branches/default_branch/documents/{document_id}"
            )
            
            request = discoveryengine.GetDocumentRequest(
                name=document_path
            )
            
            document = self.client.get_document(request)
            
            doc_data = {
                "id": document.id,
                "name": document.name,
            }
            
            if document.struct_data:
                for key, value in document.struct_data.items():
                    doc_data[key] = value
            
            if document.content:
                doc_data["content"] = (
                    document.content.raw_bytes.decode("utf-8")
                    if document.content.raw_bytes
                    else ""
                )
            
            return {
                "success": True,
                "document": doc_data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "document": None
            }
    
    def get_context_for_block(
        self,
        block_id: str,
        project_context: dict
    ) -> str:
        """
        Get relevant context from the knowledge base for a specific canvas block.
        
        Args:
            block_id: The canvas building block ID
            project_context: Context about the current project
            
        Returns:
            str with relevant context from the knowledge base
        """
        # Build a search query based on the block type and project
        block_queries = {
            "problem_statement": "problem statement market pain points challenges",
            "solution_overview": "solution approach methodology implementation",
            "value_proposition": "value proposition benefits ROI advantages",
            "market_opportunity": "market size TAM growth trends industry analysis",
            "financial_projections": "financial projections revenue forecasting metrics",
            "risk_analysis": "risk assessment mitigation strategies challenges",
            "implementation_plan": "implementation roadmap timeline milestones",
            "traction_validation": "traction validation proof points success metrics",
            "team_resources": "team capabilities resources requirements expertise",
            "call_to_action": "investment ask funding requirements next steps",
            "executive_summary": "executive summary overview highlights",
            "conclusion": "conclusion recommendations outcomes"
        }
        
        query = block_queries.get(block_id, block_id)
        
        # Add project context to query
        project_name = project_context.get("project_name", "")
        if project_name:
            query = f"{project_name} {query}"
        
        result = self.search(query, page_size=3)
        
        if result.get("success"):
            return result.get("context", "")
        
        return ""
    
    def is_configured(self) -> bool:
        """Check if the knowledge base is properly configured."""
        return bool(
            self.project_id and
            self.data_store_id and
            self.search_client is not None
        )


# Singleton instance
_knowledge_base_service = None


def get_knowledge_base_service(
    project_id: Optional[str] = None,
    location: str = "global",
    data_store_id: Optional[str] = None
) -> KnowledgeBaseService:
    """
    Get or create the Knowledge Base Service singleton.
    """
    global _knowledge_base_service
    if _knowledge_base_service is None:
        _knowledge_base_service = KnowledgeBaseService(
            project_id=project_id,
            location=location,
            data_store_id=data_store_id
        )
    return _knowledge_base_service
