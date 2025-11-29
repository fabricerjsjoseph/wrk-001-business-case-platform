# Business Case Command Center

A Flask application for creating and managing business cases with real-time data visualization and AI-powered auditing.

## Features

- **Mission Control UI**: Single-screen layout with live slide previews
- **12 Live Slides**: Real-time preview of PowerPoint slides mirroring a .pptx template
- **Data Deck**: Interactive financial data input with formula enforcement
- **AI Auditor**: Logic error detection and validation
- **Synthesizer Pattern**: Spreadsheet changes instantly update slide charts
- **PPTX Export**: Pixel-perfect PowerPoint export

## Architecture

```
└── backend/           # Flask + Python
    └── app/
        ├── routers/     # API endpoints (Blueprints)
        ├── templates/   # Jinja2 HTML templates
        ├── static/      # CSS and JavaScript
        │   ├── css/     # Stylesheet files
        │   └── js/      # JavaScript files
        └── models/      # Data schemas
```

## Prerequisites

- Python 3.10+
- pip

## Getting Started

### Setup

```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

The app will be available at http://localhost:8000

## API Endpoints

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
- Jinja2 (templating)
- Chart.js (charts)
- python-pptx (PowerPoint generation)
- Google Cloud AI Platform (Vertex AI ready)

## License

MIT