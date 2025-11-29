"""
Pydantic models for data management
"""
from pydantic import BaseModel
from typing import Optional


class FinancialData(BaseModel):
    """Financial data model for the Data Deck"""
    year: int
    revenue: float
    costs: float
    gross_profit: float
    operating_expenses: float
    ebitda: float
    depreciation: float
    ebit: float
    interest: float
    taxes: float
    net_income: float
    
    
class BusinessCaseData(BaseModel):
    """Complete business case data model"""
    project_name: str
    description: Optional[str] = None
    financial_data: list[FinancialData]
    assumptions: dict = {}
    
    
class SlideData(BaseModel):
    """Data for a single slide"""
    slide_id: int
    title: str
    chart_type: Optional[str] = None
    chart_data: Optional[dict] = None
    text_content: Optional[str] = None
    
    
class AIAuditRequest(BaseModel):
    """Request model for AI audit"""
    business_case_data: BusinessCaseData
    
    
class AIAuditResponse(BaseModel):
    """Response model for AI audit"""
    status: str
    findings: list[dict]
    suggestions: list[str]
    risk_score: float
