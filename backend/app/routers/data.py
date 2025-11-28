"""
Data management router
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import BusinessCaseData, FinancialData

router = APIRouter()

# In-memory storage for demo purposes
business_cases: dict[str, BusinessCaseData] = {}


@router.post("/business-case")
async def create_business_case(data: BusinessCaseData):
    """Create or update a business case"""
    business_cases[data.project_name] = data
    return {"status": "success", "project_name": data.project_name}


@router.get("/business-case/{project_name}")
async def get_business_case(project_name: str):
    """Get a business case by project name"""
    if project_name not in business_cases:
        raise HTTPException(status_code=404, detail="Business case not found")
    return business_cases[project_name]


@router.get("/business-cases")
async def list_business_cases():
    """List all business cases"""
    return list(business_cases.keys())


@router.put("/business-case/{project_name}/financial-data")
async def update_financial_data(project_name: str, financial_data: list[FinancialData]):
    """Update financial data for a business case"""
    if project_name not in business_cases:
        raise HTTPException(status_code=404, detail="Business case not found")
    business_cases[project_name].financial_data = financial_data
    return {"status": "success", "updated_rows": len(financial_data)}


@router.delete("/business-case/{project_name}")
async def delete_business_case(project_name: str):
    """Delete a business case"""
    if project_name not in business_cases:
        raise HTTPException(status_code=404, detail="Business case not found")
    del business_cases[project_name]
    return {"status": "success", "deleted": project_name}
