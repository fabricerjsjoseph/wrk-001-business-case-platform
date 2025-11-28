"""
Business Case Command Center - FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import data, export, ai_auditor

app = FastAPI(
    title="Business Case Command Center API",
    description="Backend API for the Business Case Command Center",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(data.router, prefix="/api/data", tags=["data"])
app.include_router(export.router, prefix="/api/export", tags=["export"])
app.include_router(ai_auditor.router, prefix="/api/ai", tags=["ai"])


@app.get("/")
async def root():
    return {"message": "Business Case Command Center API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
