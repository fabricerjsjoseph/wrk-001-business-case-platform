# Business Case Command Center

A Flask application for creating and managing business cases with AI-powered canvas generation, real-time data visualization, and intelligent content enhancement.

## Features

- **Business Case Canvas**: Grid-based layout with 12 building blocks aligned to the 7-step pitch framework
- **AI-Powered Canvas Generation**: LlamaIndex ReAct Agent generates canvas content based on knowledge base
- **Canvas Content Editing**: Manually edit AI-generated content or provide feedback for improvements
- **AI Content Enhancement**: Enhance content for clarity, impact, and persuasiveness
- **Suggestion Engine**: Get AI-powered suggestions, statistics, and critical questions for each canvas block
- **Grounded AI**: All AI responses are grounded on the 7-step pitch framework
- **Data Deck**: Interactive financial data input with formula enforcement
- **AI Auditor**: Logic error detection and validation
- **Synthesizer Pattern**: Data changes instantly update canvas and exports
- **PPTX Export**: Pixel-perfect PowerPoint export

## Architecture

```
└── backend/           # Flask + Python
    └── app/
        ├── routers/     # API endpoints (Blueprints)
        │   ├── canvas_ai.py  # Canvas generation & enhancement
        │   ├── ai_auditor.py # Financial audit
        │   ├── data.py       # Business case CRUD
        │   └── export.py     # PPTX export
        ├── services/    # AI Services
        │   ├── canvas_ai_service.py      # LlamaIndex ReAct Agent
        │   └── knowledge_base_service.py # Vertex AI Search
        ├── templates/   # Jinja2 HTML templates
        ├── static/      # CSS and JavaScript
        │   ├── css/     # Stylesheet files
        │   └── js/      # JavaScript files
        └── models/      # Data schemas
```

## AI Stack

- **Agent**: LlamaIndex ReAct Agent for intelligent content generation
- **Tools**: LlamaIndex Query Engine and Query Router
- **Knowledge Base**: Vertex AI Search for grounded responses
- **LLM**: Vertex AI (Gemini)
- **Authentication**: Google Cloud ADC (Application Default Credentials) - no API keys

## 7-Step Pitch Framework

The canvas building blocks are aligned with the 7-step pitch framework:

1. **Hook/Problem Statement** - Capture attention with a compelling problem
2. **Solution Overview** - Present your solution clearly
3. **Value Proposition** - Articulate unique value and benefits
4. **Market Opportunity** - Demonstrate market size and potential
5. **Business Model** - Explain financial projections and metrics
6. **Traction/Validation** - Show evidence of progress
7. **Ask/Call to Action** - Clear request and next steps

## Prerequisites

- Python 3.10+
- pip
- Google Cloud Project (for AI features)
- Google Cloud ADC configured (`gcloud auth application-default login`)

## Getting Started

### Setup

```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

The app will be available at http://localhost:8000

### Environment Variables (Optional)

```bash
# Google Cloud configuration for AI features
export GOOGLE_CLOUD_PROJECT=your-project-id
export VERTEX_AI_SEARCH_DATA_STORE=your-data-store-id
```

## API Endpoints

### Canvas AI (NEW)
- `POST /api/canvas/generate` - Generate AI content for a canvas block
- `POST /api/canvas/generate-all` - Generate content for all canvas blocks
- `POST /api/canvas/enhance` - Enhance content for clarity/impact
- `POST /api/canvas/suggest` - Get suggestions for a canvas block
- `POST /api/canvas/feedback` - Process feedback and regenerate content
- `GET /api/canvas/building-blocks` - Get canvas block definitions
- `POST /api/canvas/knowledge-base/search` - Search knowledge base
- `GET /api/canvas/status` - Check AI service status

### Data Management
- `POST /api/data/business-case` - Create/update business case
- `GET /api/data/business-case/{name}` - Get business case
- `GET /api/data/business-cases` - List all business cases

### Export
- `POST /api/export/pptx` - Export to PowerPoint
- `GET /api/export/template` - Get template structure

### AI Auditor
- `POST /api/ai/audit` - Run AI audit on business case
- `GET /api/ai/rules` - Get validation rules

## Financial Data Model

The Data Deck enforces the following formulas:
- **Gross Profit** = Revenue - Costs
- **EBITDA** = Gross Profit - Operating Expenses
- **EBIT** = EBITDA - Depreciation
- **Net Income** = EBIT - Interest - Taxes (25%)

## Tech Stack

- Flask (Python web framework)
- LlamaIndex (AI Agent framework)
- Vertex AI (LLM and Embeddings)
- Vertex AI Search (Knowledge base)
- Jinja2 (templating)
- Chart.js (charts)
- python-pptx (PowerPoint generation)
- Google Cloud ADC (authentication)

## License

MIT