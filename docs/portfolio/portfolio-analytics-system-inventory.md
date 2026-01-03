# Portfolio & Analytics System Inventory

> **Version:** 1.1  
> **Last Updated:** 2026-01-03  
> **Total Assets:** 35 files (15 pages, 12 components, 8 hooks)  
> **Parent System:** Portfolio Management & Analytics  
> **Hub Page:** `/portfolio`

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← Startups & Academia](../personas/startups-academia-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Approvals →](../approvals/approvals-system-inventory.md) |

---

## Overview

The Portfolio & Analytics System provides portfolio management, predictive analytics, custom reporting, and strategic intelligence across the innovation ecosystem.

---

## 📄 Pages (15)

### Portfolio Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Portfolio** | `Portfolio.jsx` | `/portfolio` | `portfolio_view` | Self (Root) |
| Portfolio Rebalancing | `PortfolioRebalancing.jsx` | `/portfolio-rebalancing` | `portfolio_manage` | Portfolio |
| Portfolio Review Gate | `PortfolioReviewGate.jsx` | `/portfolio-review-gate` | `portfolio_approve` | Portfolio |
| Initiative Portfolio | `InitiativePortfolio.jsx` | `/initiative-portfolio` | `portfolio_view` | Portfolio |
| Initiative Map | `InitiativeMap.jsx` | `/initiative-map` | `portfolio_view` | Portfolio |

### Analytics Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Predictive Analytics | `PredictiveAnalytics.jsx` | `/predictive-analytics` | `analytics_view` | Analytics |
| Predictive Insights | `PredictiveInsights.jsx` | `/predictive-insights` | `analytics_view` | Analytics |
| Predictive Forecasting Dashboard | `PredictiveForecastingDashboard.jsx` | `/predictive-forecasting-dashboard` | `analytics_view` | Analytics |
| Pattern Recognition | `PatternRecognition.jsx` | `/pattern-recognition` | `analytics_view` | Analytics |
| Trends | `Trends.jsx` | `/trends` | `analytics_view` | Analytics |

### Reporting Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Custom Report Builder | `CustomReportBuilder.jsx` | `/custom-report-builder` | `reporting_create` | Reporting |
| Reports Builder | `ReportsBuilder.jsx` | `/reports-builder` | `reporting_create` | Reporting |
| Progress Report | `ProgressReport.jsx` | `/progress-report` | `reporting_view` | Reporting |
| Executive Brief Generator | `ExecutiveBriefGenerator.jsx` | `/executive-brief-generator` | `reporting_create` | Reporting |
| Presentation Mode | `PresentationMode.jsx` | `/presentation-mode` | `reporting_view` | Reporting |

---

## 🧩 Components (12)

**Location:** `src/components/portfolio/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `BulkActionsToolbar.jsx` | Bulk actions | Portfolio |
| `DependencyVisualizer.jsx` | Dependency visualization | Portfolio |
| `PilotPortfolioOptimizer.jsx` | Portfolio optimization | Portfolio |
| `PortfolioExportDialog.jsx` | Export dialog | Portfolio |
| `PortfolioHealthMonitor.jsx` | Health monitoring | Portfolio |
| `TimelineGanttView.jsx` | Gantt view | Portfolio |

**Location:** `src/components/analytics/`

| Component | Description |
|-----------|-------------|
| `AdvancedAnalyticsDashboard.jsx` | Advanced analytics |

**Location:** `src/components/reports/`

| Component | Description |
|-----------|-------------|
| `CoverageReportExporter.jsx` | Report export |
| `CoverageTrendTracker.jsx` | Trend tracking |

### Root-Level Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `ExportData.jsx` | Data export |
| `PDFExport.jsx` | PDF export |
| `ScheduledReports.jsx` | Scheduled reports |

---

## 🗄️ Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `custom_reports` | Custom report definitions | ✅ Created |
| `report_schedules` | Report schedules | ✅ Created |

### custom_reports Schema
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name_en` | TEXT | Report name (English) |
| `name_ar` | TEXT | Report name (Arabic) |
| `report_type` | TEXT | Type of report |
| `query_config` | JSONB | Query configuration |
| `filters` | JSONB | Applied filters |
| `columns` | JSONB | Column definitions |
| `chart_config` | JSONB | Chart settings |
| `created_by` | TEXT | Creator email |
| `is_public` | BOOLEAN | Public visibility |
| `is_template` | BOOLEAN | Template flag |

### report_schedules Schema
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `report_id` | UUID | FK to custom_reports |
| `schedule_type` | TEXT | daily/weekly/monthly/quarterly |
| `recipients` | TEXT[] | Email recipients |
| `next_run_at` | TIMESTAMPTZ | Next scheduled run |
| `is_active` | BOOLEAN | Active status |

---

## 🪝 Hooks (8)

**Location:** `src/hooks/portfolio/`

| Hook | Purpose | Returns |
|------|---------|---------|
| `useCustomReports` | Fetch all custom reports with filters | `{ data, isLoading, error }` |
| `useCustomReport` | Fetch single report by ID | `{ data, isLoading, error }` |
| `useCreateCustomReport` | Create new custom report | `{ mutate, isPending }` |
| `useUpdateCustomReport` | Update existing report | `{ mutate, isPending }` |
| `useDeleteCustomReport` | Soft delete report | `{ mutate, isPending }` |
| `useReportSchedules` | Fetch report schedules | `{ data, isLoading, error }` |
| `useCreateReportSchedule` | Create schedule | `{ mutate, isPending }` |
| `useToggleScheduleActive` | Toggle schedule on/off | `{ mutate, isPending }` |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `portfolio_view` | View portfolio |
| `portfolio_manage` | Manage portfolio |
| `portfolio_approve` | Approve portfolio |
| `analytics_view` | View analytics |
| `reporting_view` | View reports |
| `reporting_create` | Create reports |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Strategy | Strategic portfolio |
| Pilots | Pilot portfolio |
| Programs | Program portfolio |
| R&D | R&D portfolio |
| Budget | Budget integration |
