# Import & Export System Documentation

## Overview

The Import/Export Hub is a centralized data management system that provides comprehensive tools for importing data into and exporting data from the platform. It features AI-powered data extraction, validation, field mapping, and enrichment capabilities.

**Location**: `/import-export-hub` (ImportExportHub.jsx)

**Required Permissions**: `data.import`, `data.export`, or `admin`

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Import/Export Hub                            │
├──────────────┬──────────────┬───────────────┬──────────────────┤
│ AI Uploader  │    Export    │    Import     │     History      │
│   (Tab 1)    │   (Tab 2)    │    (Tab 3)    │     (Tab 4)      │
└──────┬───────┴──────────────┴───────────────┴──────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI Data Uploader (6-Step Wizard)                    │
├─────────┬──────────┬──────────┬────────────┬─────────┬─────────┤
│ Upload  │ Entity   │  Field   │ Validation │ Review  │ Import  │
│  File   │Detection │ Mapping  │& Enrichment│         │         │
└─────────┴──────────┴──────────┴────────────┴─────────┴─────────┘
```

---

## Tab 1: AI Uploader (Primary Import Method)

The AI-powered data uploader is a 6-step wizard that guides users through importing data with intelligent automation.

### Step 1: File Upload (`StepFileUpload.jsx`)

**Supported File Formats:**
| Format | Extension | Processing Method |
|--------|-----------|-------------------|
| CSV | .csv | Direct parsing with robust quote handling |
| Excel | .xlsx, .xls | xlsx library parsing |
| JSON | .json | Direct JSON.parse |
| PDF | .pdf | AI extraction via edge function |
| Images | .png, .jpg, .jpeg, .webp | AI OCR extraction |

**Features:**
- Drag-and-drop file upload
- 20MB file size limit
- Automatic format detection
- Robust CSV parsing (handles quoted fields, commas in values)
- Preview of extracted data (row count, column count, headers)

**File Processing Pipeline:**
```
File Upload → Format Detection → Parser Selection → Data Extraction → Preview
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
                 CSV/JSON          Excel            PDF/Image
                 (Direct)          (xlsx)           (AI Edge Fn)
```

### Step 2: Entity Detection (`StepEntityDetection.jsx`)

**AI-Powered Entity Classification:**
- Analyzes column headers and sample data
- Returns top 3 entity type matches with confidence scores
- Provides reasoning for each suggestion

**Supported Entity Types:**
| Entity | Description | Primary Fields |
|--------|-------------|----------------|
| challenges | Municipal challenges | title, description, status, priority, sector |
| solutions | Innovative solutions | name, provider, technology_type, maturity_level |
| pilots | Pilot projects | name, municipality, start_date, end_date, budget |
| municipalities | Cities | name, region, population |
| organizations | Companies/institutions | name, type, industry |
| providers | Solution providers | company_name, expertise |
| case_studies | Success stories | title, challenge, solution, results |
| rd_projects | R&D projects | title, objectives, methodology |
| sectors | Industry sectors | name, description |
| strategic_plans | Strategic plans | title, goals, timeline |

**Detection Process:**
```
Sample Data (5 rows) + Headers → AI Analysis → Ranked Suggestions → User Confirmation
```

### Step 3: Field Mapping (`StepFieldMapping.jsx`)

**AI Auto-Mapping:**
- Analyzes source columns against target entity fields
- Provides confidence scores and reasoning for each mapping
- Handles required vs optional fields

**Field Types Supported:**
| Type | Example | Handling |
|------|---------|----------|
| string | title_en | Direct mapping |
| number | budget | Numeric conversion |
| date | start_date | Date parsing |
| enum | status, priority | Validation against options |
| array | tags | Split/parse arrays |
| relation | municipality_id | FK resolution |

**Mapping Interface:**
- Visual mapping editor (source column → target field)
- Confidence indicators for AI suggestions
- Required field validation
- Unmapped column display

### Step 4: Validation & Enrichment (`StepValidation.jsx`)

**Comprehensive Validation Features:**

#### 1. Basic Validation
- Required field checking
- Data type validation
- Format validation (dates, numbers)

#### 2. Duplicate Detection
- In-file duplicate detection (by title/name)
- Database duplicate checking

#### 3. Reference Entity Resolution
Automatically resolves linked entities by name matching:

| Field | Lookup Table | Match Method |
|-------|--------------|--------------|
| sector_id | sectors | name_en exact/partial match |
| municipality_id | municipalities | name_en exact/partial match |
| region_id | regions | name_en exact/partial match |
| city_id | cities | name_en exact/partial match |
| organization_id | organizations | name_en exact/partial match |
| provider_id | providers | name_en exact/partial match |
| subsector_id | subsectors | name_en exact/partial match |
| service_id | services | name_en exact/partial match |
| program_id | programs | name_en exact/partial match |
| pilot_id | pilots | name_en exact/partial match |
| challenge_id | challenges | title_en exact/partial match |
| solution_id | solutions | name_en exact/partial match |

#### 4. AI Translation
- Detects empty `_ar` fields when `_en` field has content
- Generates formal Arabic translations via AI
- Specialized for government/municipal terminology

#### 5. AI Data Quality Analysis
- Typo detection
- Inconsistency identification
- Format standardization
- Missing data inference

**Validation Results Display:**
- Summary cards (total, valid, warnings, errors)
- Duplicate warning panel
- AI corrections panel (with Apply All button)
- AI enrichments panel (with Apply All button)

### Step 5: Review (`StepReview.jsx`)

**Pre-Import Review Features:**
- Row-by-row data preview
- Row selection/deselection
- Duplicate exclusion toggle
- Status indicators (OK, Duplicate, Error, Skip)
- Import count summary

**Statistics Display:**
| Metric | Description |
|--------|-------------|
| Total Rows | All extracted rows |
| Selected | User-selected for import |
| Duplicates | Rows matching database records |
| To Import | Final count after filters |

### Step 6: Import (`StepImport.jsx`)

**Import Execution:**
- Batch processing (50 records per batch)
- Progress tracking with percentage
- Real-time import log display
- Error handling with detailed messages

**Post-Import:**
- Success/failure summary
- Error log download (JSON format)
- Retry option for failed imports
- Access log creation for audit trail

**Import Log Structure:**
```json
{
  "importDate": "2024-01-15T10:30:00Z",
  "entityType": "challenges",
  "sourceFile": "challenges.csv",
  "results": {
    "total": 100,
    "inserted": 95,
    "failed": 5,
    "skipped": 0,
    "errors": [...]
  },
  "logs": [...]
}
```

---

## Tab 2: Export

### Export Features

**Export Formats:**
- CSV (UTF-8 with BOM for Excel compatibility)
- JSON (formatted with 2-space indentation)

**Export Filters:**
| Filter | Description |
|--------|-------------|
| Include Deleted | Include soft-deleted records |
| Published Only | Only published records |
| Date Range | Filter by created_at |
| Status | Filter by status field |

**Field Selection:**
- Select/deselect individual fields
- Select All / Clear All buttons
- Automatic FK name resolution (adds `_name` columns)

**FK Resolution Example:**
```
sector_id: "abc-123" → sector_name: "Transportation & Mobility"
```

**Quick Export:**
- One-click export buttons for common entities
- Pre-configured export with default settings

### Exportable Entities (24 total)

| Entity | Table | Key Fields |
|--------|-------|------------|
| Challenges | challenges | code, title_en, title_ar, description, status |
| Solutions | solutions | code, name_en, name_ar, solution_type |
| Pilots | pilots | code, title_en, pilot_type, stage |
| Programs | programs | code, name_en, program_type |
| Providers | providers | code, name_en, provider_type |
| Organizations | organizations | code, name_en, organization_type |
| R&D Projects | rd_projects | code, title_en, project_type |
| Sandboxes | sandboxes | code, name_en, sandbox_type |
| Living Labs | living_labs | code, name_en, lab_type |
| Case Studies | case_studies | title_en, challenge_description |
| Events | events | code, title_en, event_type |
| Municipalities | municipalities | code, name_en, region_id |
| Sectors | sectors | code, name_en, description |
| Regions | regions | code, name_en |
| Cities | cities | name_en, name_ar, region_id |
| Strategic Plans | strategic_plans | code, title_en, plan_type |
| R&D Calls | rd_calls | code, title_en, call_type |
| Citizen Ideas | citizen_ideas | title, category (export only) |
| Contracts | contracts | contract_code, title_en |
| Budgets | budgets | budget_code, name_en, total_amount |
| Tags | tags | name_en, category |
| KPI References | kpi_references | code, name_en, unit |

---

## Tab 3: Manual Import

Alternative to AI Uploader for simpler imports.

### Features
- Direct CSV/JSON file upload
- Entity selection
- Validation with error display
- Optional AI extraction toggle
- Template download

### AI Extraction Mode
For PDF/Excel files, uses AI edge function:
```javascript
const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
  file_url,
  json_schema: entityDef.aiSchema
});
```

### Import Templates
Downloadable CSV templates for each entity with required headers:
```
code,title_en,title_ar,description_en,description_ar,status,priority,...
```

---

## Tab 4: History

### Export History
- Lists recent exports with:
  - Entity type
  - Timestamp
  - Record count
  - Format (CSV/JSON)

### Import History
- Lists recent imports with:
  - Entity type
  - Timestamp
  - Record count
  - Method (AI/Direct)

**Logged to `access_logs` table:**
```json
{
  "action": "data_import" | "data_export",
  "entity_type": "challenges",
  "user_email": "user@example.com",
  "metadata": {
    "count": 100,
    "method": "ai",
    "filename": "data.csv",
    "format": "csv"
  }
}
```

---

## Supporting Components

### Data Quality Dashboard (`AIDataQualityDashboard.jsx`)
- Overall data completeness scoring
- Per-entity completeness breakdown
- Visual progress indicators
- Quality improvement recommendations

### Duplicate Record Detector (`DuplicateRecordDetector.jsx`)
- AI-powered duplicate detection
- Similarity scoring (exact vs near duplicates)
- Merge/keep/delete recommendations
- Visual duplicate group display

### AI Field Mapper (`AIImportFieldMapper.jsx`)
- Standalone AI mapping component
- Confidence scoring
- Mapping rationale display

---

## Edge Functions

### `extract-file-data`
Extracts structured data from PDF/image files using AI.

**Request:**
```json
{
  "file_content": "base64_encoded_content",
  "file_name": "document.pdf",
  "file_type": "application/pdf",
  "json_schema": { ... }
}
```

**Response:**
```json
{
  "headers": ["title_en", "description_en", ...],
  "rows": [{ "title_en": "...", ... }]
}
```

### `invoke-llm`
General-purpose LLM invocation for entity detection, mapping, and validation.

---

## Entity Definitions Structure

Each entity is defined with:

```javascript
{
  label: 'Human-readable name',
  table: 'database_table_name',
  requiredColumns: ['field1', 'field2'],
  templateColumns: ['field1', 'field2', 'field3', ...],
  aiSchema: {
    type: 'object',
    properties: { ... },
    required: ['field1']
  },
  relations: { 
    sector_id: 'sectors',
    municipality_id: 'municipalities'
  },
  hasDeleted: true, // Supports soft delete
  exportOnly: false // If true, cannot import
}
```

---

## Permissions

| Permission | Description |
|------------|-------------|
| `data.import` | Access to import functionality |
| `data.export` | Access to export functionality |
| `admin` | Full access to all features |

---

## Best Practices

### For Importing
1. Use AI Uploader for complex data with mixed formats
2. Download templates for bulk data preparation
3. Review validation results carefully before importing
4. Apply AI suggestions for translations and enrichments
5. Check for duplicates before final import

### For Exporting
1. Use filters to limit export scope
2. Select only needed fields for smaller files
3. Use CSV for Excel compatibility
4. Use JSON for programmatic processing

### Data Preparation
1. Ensure required fields are populated
2. Use consistent date formats (YYYY-MM-DD)
3. Match reference entity names exactly when possible
4. Include both English and Arabic content when available

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Excel file won't parse | Try saving as CSV first |
| AI extraction fails | Reduce file size or use CSV |
| FK resolution fails | Check exact name spelling |
| Import fails on batch | Check error log for specific row issues |
| Duplicate detection slow | Limit to first 50 records for scanning |

---

## Related Pages

- `/data-management-hub` - Central data management dashboard
- `/validation-rules-engine` - Custom validation rule configuration
- `/master-data-governance` - Data governance policies
