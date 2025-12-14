# Municipalities & Geography System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 42 files (18 pages, 18 components, 6 hooks)  
> **Parent System:** Geographic & Municipal Management  
> **Hub Page:** `/municipality-dashboard`

---

## Overview

The Municipalities System manages municipal entities, regional coordination, MII scoring, peer learning, and geographic innovation tracking.

---

## 📄 Pages (18)

### Municipality Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Municipality Dashboard** | `MunicipalityDashboard.jsx` | `/municipality-dashboard` | `municipality_view` | Self (Root) |
| Municipality Profile | `MunicipalityProfile.jsx` | `/municipality-profile` | `municipality_view` | Municipality Dashboard |
| Municipality Create | `MunicipalityCreate.jsx` | `/municipality-create` | `municipality_create` | Admin |
| Municipality Edit | `MunicipalityEdit.jsx` | `/municipality-edit` | `municipality_edit` | Municipality Profile |
| Municipality Staff Onboarding | `MunicipalityStaffOnboarding.jsx` | `/municipality-staff-onboarding` | `municipality_manage` | Municipality Dashboard |
| Municipality Ideas View | `MunicipalityIdeasView.jsx` | `/municipality-ideas-view` | `municipality_view` | Municipality Dashboard |
| Municipality Peer Matcher | `MunicipalityPeerMatcher.jsx` | `/municipality-peer-matcher` | `municipality_view` | Municipality Dashboard |
| Municipal Proposal Inbox | `MunicipalProposalInbox.jsx` | `/municipal-proposal-inbox` | `municipality_manage` | Municipality Dashboard |

### MII Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **MII** | `MII.jsx` | `/mii` | `mii_view` | Self (Root) |
| MII Drill Down | `MIIDrillDown.jsx` | `/mii-drill-down` | `mii_view` | MII |
| MII Admin Hub | `MIIAdminHub.jsx` | `/mii-admin-hub` | `mii_admin` | Admin |
| MII Coverage Report | `MIICoverageReport.jsx` | `/mii-coverage-report` | `admin` | Admin |

### Geography Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Region Management | `RegionManagement.jsx` | `/region-management` | `admin` | Admin |
| City Management | `CityManagement.jsx` | `/city-management` | `admin` | Admin |
| City Dashboard | `CityDashboard.jsx` | `/city-dashboard` | `municipality_view` | Municipality Dashboard |
| National Map | `NationalMap.jsx` | `/national-map` | `public` | Public |
| National Innovation Map | `NationalInnovationMap.jsx` | `/national-innovation-map` | `public` | Public |

### Reports

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Municipality Coverage Report | `MunicipalityCoverageReport.jsx` | `/municipality-coverage-report` | `admin` | Admin |
| Geography Coverage Report | `GeographyCoverageReport.jsx` | `/geography-coverage-report` | `admin` | Admin |

---

## 🧩 Components (18)

### Municipality Components
**Location:** `src/components/municipalities/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `MIIImprovementAI.jsx` | AI improvement suggestions | MII |
| `MunicipalityBestPractices.jsx` | Best practices sharing | Municipality Dashboard |
| `MunicipalityKnowledgeBase.jsx` | Knowledge base | Municipality Dashboard |
| `MunicipalityTrainingEnrollment.jsx` | Training enrollment | Municipality Dashboard |
| `MunicipalityTrainingProgress.jsx` | Training progress | Municipality Dashboard |
| `PeerBenchmarkingTool.jsx` | Peer benchmarking | Municipality Dashboard |
| `QuickSolutionsMarketplace.jsx` | Quick solutions | Municipality Dashboard |

### MII Components
**Location:** `src/components/mii/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AutomatedMIICalculator.jsx` | MII calculation | MII |
| `MIIDataGapAnalyzer.jsx` | Data gap analysis | MII Admin |
| `MIIForecastingEngine.jsx` | MII forecasting | MII |
| `MIIImprovementPlanner.jsx` | Improvement planning | MII |

### Root-Level Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `MIIWeightTuner.jsx` | Weight tuning |
| `NationalMap.jsx` | National map display |

### Data Management Components
**Location:** `src/components/data-management/`

| Component | Description |
|-----------|-------------|
| `CitiesTab.jsx` | Cities management |
| `MunicipalitiesTab.jsx` | Municipalities management |
| `RegionsTab.jsx` | Regions management |

---

## 🪝 Hooks (6)

| Hook | Location | Description |
|------|----------|-------------|
| `useMunicipalitiesWithVisibility.js` | `src/hooks/` | Municipalities with visibility |
| `useMIIData.js` | `src/hooks/` | MII data fetching |
| `useLookupData.js` | `src/hooks/` | Lookup data (regions, cities) |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `municipalities` | Municipality data |
| `regions` | Regional data |
| `cities` | City data |
| `mii_scores` | MII score history |
| `mii_indicators` | MII indicator definitions |
| `mii_data_points` | MII data collection |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `municipality_view` | View municipalities |
| `municipality_create` | Create municipalities |
| `municipality_edit` | Edit municipalities |
| `municipality_manage` | Manage municipalities |
| `mii_view` | View MII scores |
| `mii_admin` | Administer MII |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Challenges | Owns challenges |
| Pilots | Hosts pilots |
| Strategy | Aligns with strategy |
| Citizens | Serves citizens |
| Programs | Participates in programs |
