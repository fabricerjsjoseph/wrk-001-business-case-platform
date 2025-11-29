# Business Case Command Center

A React/FastAPI application for creating and managing business cases with real-time data visualization and AI-powered auditing.

## Features

- **Mission Control UI**: Single-screen layout with live slide previews
- **12 Live Slides**: Real-time preview of PowerPoint slides mirroring a .pptx template
- **Data Deck**: Handsontable-powered financial data input with formula enforcement
- **AI Auditor**: Vertex AI-ready logic error detection and validation
- **Synthesizer Pattern**: Spreadsheet changes instantly update slide charts
- **PPTX Export**: Pixel-perfect PowerPoint export

## Architecture

```
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── store/       # Zustand state management
│   │   ├── services/    # API client
│   │   └── types/       # TypeScript types
│   └── ...
└── backend/           # FastAPI + Python
    └── app/
        ├── routers/     # API endpoints
        ├── services/    # Business logic
        └── models/      # Pydantic schemas
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- pip

## Getting Started

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:5173

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

## Development

### Frontend
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

### Backend
```bash
cd backend
uvicorn app.main:app --reload  # Start dev server
```

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Zustand (state management)
- Handsontable (data grid)
- Chart.js + react-chartjs-2 (charts)
- Axios (HTTP client)

### Backend
- FastAPI
- Python 3.10+
- python-pptx (PowerPoint generation)
- Pydantic (data validation)
- Google Cloud AI Platform (Vertex AI ready)

## License

MIT