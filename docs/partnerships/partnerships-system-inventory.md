# Partnerships & Organizations System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 38 files (12 pages, 22 components, 4 hooks)  
> **Parent System:** Partnership & Organization Management  
> **Hub Page:** `/partnership-registry`

---

## Overview

The Partnerships System manages strategic partnerships, organization profiles, MOU tracking, and collaboration networks across the innovation ecosystem.

---

## 📄 Pages (12)

### Partnership Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Partnership Registry** | `PartnershipRegistry.jsx` | `/partnership-registry` | `partnership_view` | Self (Root) |
| Partnership Network | `PartnershipNetwork.jsx` | `/partnership-network` | `partnership_view` | Partnership Registry |
| Partnership Performance | `PartnershipPerformance.jsx` | `/partnership-performance` | `partnership_view` | Partnership Registry |
| Partnership MOU Tracker | `PartnershipMOUTracker.jsx` | `/partnership-mou-tracker` | `partnership_manage` | Partnership Registry |
| My Partnerships | `MyPartnerships.jsx` | `/my-partnerships` | `authenticated` | Personal |
| My Partnerships Page | `MyPartnershipsPage.jsx` | `/my-partnerships-page` | `authenticated` | Personal |
| Partnership Coverage Report | `PartnershipCoverageReport.jsx` | `/partnership-coverage-report` | `admin` | Admin |

### Organization Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Organization Detail | `OrganizationDetail.jsx` | `/organization-detail` | `organization_view` | Organizations |
| Organization Create | `OrganizationCreate.jsx` | `/organization-create` | `organization_create` | Organizations |
| Organization Edit | `OrganizationEdit.jsx` | `/organization-edit` | `organization_edit` | Organization Detail |
| Organization Verification Queue | `OrganizationVerificationQueue.jsx` | `/organization-verification-queue` | `organization_verify` | Admin |
| Organization Portfolio Analytics | `OrganizationPortfolioAnalytics.jsx` | `/organization-portfolio-analytics` | `organization_view` | Organizations |
| Organization Coverage Report | `OrganizationCoverageReport.jsx` | `/organization-coverage-report` | `admin` | Admin |
| Organizations Coverage Report | `OrganizationsCoverageReport.jsx` | `/organizations-coverage-report` | `admin` | Admin |

---

## 🧩 Components (22)

### Partnership Components
**Location:** `src/components/partnerships/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIAgreementGenerator.jsx` | AI agreement generation | Partnerships |
| `AIPartnerDiscovery.jsx` | AI partner discovery | Partnership Registry |
| `PartnershipEngagementTracker.jsx` | Engagement tracking | Partnership Detail |
| `PartnershipNetworkGraph.jsx` | Network visualization | Partnership Network |
| `PartnershipOrchestrator.jsx` | Partnership orchestration | Partnerships |
| `PartnershipPerformanceDashboard.jsx` | Performance dashboard | Partnership Performance |
| `PartnershipPlaybookLibrary.jsx` | Playbook library | Partnerships |
| `PartnershipSynergyDetector.jsx` | Synergy detection | Partnerships |
| `StrategicAlignmentPartnership.jsx` | Strategic alignment | Partnerships |

### Organization Components
**Location:** `src/components/organizations/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AINetworkAnalysis.jsx` | AI network analysis | Organizations |
| `OrganizationActivityDashboard.jsx` | Activity dashboard | Organization Detail |
| `OrganizationActivityLog.jsx` | Activity log | Organization Detail |
| `OrganizationCollaborationManager.jsx` | Collaboration management | Organization Detail |
| `OrganizationNetworkGraph.jsx` | Network graph | Organization Detail |
| `OrganizationPerformanceMetrics.jsx` | Performance metrics | Organization Detail |
| `OrganizationReputationTracker.jsx` | Reputation tracking | Organization Detail |
| `OrganizationVerificationWorkflow.jsx` | Verification workflow | Verification Queue |
| `OrganizationWorkflowTab.jsx` | Workflow tab | Organization Detail |
| `PartnershipWorkflow.jsx` | Partnership workflow | Partnerships |
| `PartnershipWorkflowIntegration.jsx` | Workflow integration | Partnerships |

### Data Management Components
**Location:** `src/components/data-management/`

| Component | Description |
|-----------|-------------|
| `OrganizationsTab.jsx` | Organizations data tab |

---

## 🪝 Hooks (4)

| Hook | Description |
|------|-------------|
| `useOrganizationsWithVisibility.js` | Organizations with visibility |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `partnerships` | Partnership records |
| `partnership_mous` | MOU tracking |
| `organizations` | Organization profiles |
| `organization_members` | Organization membership |
| `providers` | Solution providers |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `partnership_view` | View partnerships |
| `partnership_create` | Create partnerships |
| `partnership_manage` | Manage partnerships |
| `organization_view` | View organizations |
| `organization_create` | Create organizations |
| `organization_edit` | Edit organizations |
| `organization_verify` | Verify organizations |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Strategy | Strategic partnerships from cascade |
| R&D | Research collaborations |
| Programs | Program partnerships |
| Solutions | Provider partnerships |
| Municipalities | Municipal partnerships |
