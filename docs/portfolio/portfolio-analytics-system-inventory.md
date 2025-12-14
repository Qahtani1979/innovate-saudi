# Portfolio & Analytics System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 32 files (15 pages, 12 components, 4 hooks)  
> **Parent System:** Portfolio Management & Analytics  
> **Hub Page:** `/portfolio`

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

| Table | Purpose |
|-------|---------|
| `custom_reports` | Custom report definitions |
| `report_schedules` | Report schedules |

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
