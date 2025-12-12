# Persona Layout System Documentation

> Last Updated: December 2024

This document outlines the complete persona-based layout and styling system implemented across the BALADI Innovation Hub platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Hooks](#hooks)
5. [Persona Definitions](#persona-definitions)
6. [Page Implementation Status](#page-implementation-status)
7. [Widget & Filter Components](#widget--filter-components)
8. [Recommendations](#recommendations)

---

## Overview

The persona layout system provides tailored UI experiences based on user roles. Each persona has:
- **Custom sidebar navigation** with role-appropriate menu items
- **Themed styling** with persona-specific colors and branding
- **Permission-based filtering** showing only accessible features
- **Consistent page layouts** with headers, breadcrumbs, and content areas

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Layout.jsx                               │
│  (Main wrapper - handles auth, redirects, persona detection)    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │  PersonaSidebar │    │         PersonaPageLayout           │ │
│  │                 │    │  ┌─────────────────────────────────┐│ │
│  │  - Logo         │    │  │       PersonaHeader            ││ │
│  │  - Menu Items   │    │  │  (Breadcrumbs, Title, Actions) ││ │
│  │  - User Info    │    │  └─────────────────────────────────┘│ │
│  │  - Collapse     │    │  ┌─────────────────────────────────┐│ │
│  │                 │    │  │       Page Content              ││ │
│  │                 │    │  │  (Dashboard/List/Detail/Form)   ││ │
│  │                 │    │  └─────────────────────────────────┘│ │
│  └─────────────────┘    └─────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Layout.jsx
**Path:** `src/components/Layout.jsx`
**Status:** ✅ Complete

Responsibilities:
- Wraps all authenticated routes
- Detects user persona from roles
- Renders PersonaSidebar + content area
- Handles mobile responsiveness
- Manages sidebar collapse state

### 2. PersonaSidebar.jsx
**Path:** `src/components/layout/PersonaSidebar.jsx`
**Status:** ✅ Complete

Features:
- Dynamic menu generation based on persona
- Permission-based item filtering
- Active state highlighting
- Collapsible groups
- Mobile drawer mode
- RTL support
- Municipality ID injection for links

### 3. PersonaPageLayout.jsx
**Path:** `src/components/layout/PersonaPageLayout.jsx`
**Status:** ✅ Complete

Exports:
- `PageLayout` - Main page wrapper with header
- `PageHeader` - Standalone header component
- `PersonaButton` - Styled action button

### 4. CitizenPageLayout.jsx
**Path:** `src/components/citizen/CitizenPageLayout.jsx`
**Status:** ✅ Complete

Exports:
- `CitizenPageLayout` - Citizen-themed page wrapper
- `CitizenPageHeader` - Citizen-styled header
- `CitizenSearchFilter` - Search/filter component
- `CitizenCardGrid` - Grid layout for cards
- `CitizenEmptyState` - Empty state component

### 5. PersonaHeader.jsx
**Path:** `src/components/layout/PersonaHeader.jsx`
**Status:** ✅ Complete

Features:
- Breadcrumb navigation
- Page title with optional Arabic translation
- Description text
- Action buttons area
- Responsive design

### 6. sidebarMenus.js
**Path:** `src/components/layout/sidebarMenus.js`
**Status:** ✅ Complete

Contains menu definitions for all personas.

---

## Hooks

### 1. usePersonaRouting.js
**Path:** `src/hooks/usePersonaRouting.js`
**Status:** ✅ Complete

### 2. usePermissions.jsx
**Path:** `src/components/permissions/usePermissions.jsx`
**Status:** ✅ Complete

### 3. useVisibilitySystem.js
**Path:** `src/hooks/visibility/useVisibilitySystem.js`
**Status:** ✅ Complete

---

## Persona Definitions

| Persona | Dashboard Path | Description |
|---------|---------------|-------------|
| **Admin** | `/admin-dashboard` | Full system access |
| **Executive** | `/executive-dashboard` | Strategic oversight |
| **Deputyship** | `/deputyship-dashboard` | Sector management |
| **Municipality** | `/municipality-dashboard` | Local government |
| **Provider** | `/provider-dashboard` | Solution providers |
| **Expert** | `/expert-dashboard` | Advisory role |
| **Researcher** | `/researcher-dashboard` | R&D focus |
| **Citizen** | `/citizen-dashboard` | Public participation |
| **Viewer** | `/viewer-dashboard` | Read-only access |
| **Academia** | `/academia-dashboard` | Academic institutions |
| **Startup** | `/startup-dashboard` | Startup companies |

---

## Page Implementation Status

### Summary

| Category | Using Layout | Not Using | Total |
|----------|-------------|-----------|-------|
| Dashboards | 11 | 0 | 11 |
| Citizen Pages | 12 | 0 | 12 |
| Core Entity Lists | 2 | 4 | 6 |
| Detail Pages | ~15 | ~10 | ~25 |
| Form Pages | ~8 | ~5 | ~13 |
| Management Pages | ~5 | ~10 | ~15 |
| Other Pages | ~15 | ~490+ | ~505+ |

---

### ✅ Pages Using PersonaPageLayout (31 pages)

#### Dashboards (All Complete)
| Page | File | Layout |
|------|------|--------|
| Admin Dashboard | `AdminDashboard.jsx` | `PageLayout` |
| Executive Dashboard | `ExecutiveDashboard.jsx` | `PageLayout` |
| Deputyship Dashboard | `DeputyshipDashboard.jsx` | `PageLayout` |
| Municipality Dashboard | `MunicipalityDashboard.jsx` | `PageLayout` |
| Provider Dashboard | `ProviderDashboard.jsx` | `PageLayout` |
| Expert Dashboard | `ExpertDashboard.jsx` | `PageLayout` |
| Researcher Dashboard | `ResearcherDashboard.jsx` | `PageLayout` |
| Citizen Dashboard | `CitizenDashboard.jsx` | `CitizenPageLayout` |
| Viewer Dashboard | `ViewerDashboard.jsx` | `PageLayout` |
| Academia Dashboard | `AcademiaDashboard.jsx` | `PageLayout` |
| Startup Dashboard | `StartupDashboard.jsx` | `PageLayout` |

#### Citizen Portal Pages (12 pages - All Complete)
| Page | File | Layout |
|------|------|--------|
| Citizen Dashboard | `CitizenDashboard.jsx` | `CitizenPageLayout` |
| Citizen Challenges Browser | `CitizenChallengesBrowser.jsx` | `CitizenPageLayout` |
| Citizen Solutions Browser | `CitizenSolutionsBrowser.jsx` | `CitizenPageLayout` |
| Citizen Living Labs Browser | `CitizenLivingLabsBrowser.jsx` | `CitizenPageLayout` |
| Citizen Idea Submission | `CitizenIdeaSubmission.jsx` | `CitizenPageLayout` |
| Citizen Leaderboard | `CitizenLeaderboard.jsx` | `CitizenPageLayout` |
| Event Calendar | `EventCalendar.jsx` | `CitizenPageLayout` |
| Public Ideas Board | `PublicIdeasBoard.jsx` | `CitizenPageLayout` |
| Provider Proposal Wizard | `ProviderProposalWizard.jsx` | `CitizenPageLayout` |
| Citizen Pilot Enrollment | `CitizenPilotEnrollment.jsx` | `CitizenPageLayout` |
| Citizen Lab Participation | `CitizenLabParticipation.jsx` | `CitizenPageLayout` |
| Citizen Engagement Dashboard | `CitizenEngagementDashboard.jsx` | `PageLayout` |

#### Entity Pages Using Layout
| Page | File | Layout |
|------|------|--------|
| Solutions | `Solutions.jsx` | `PageLayout` |
| Living Labs | `LivingLabs.jsx` | `PageLayout` |
| My Challenges | `MyChallenges.jsx` | `PageLayout` |
| My Pilots | `MyPilots.jsx` | `PageLayout` |
| My Programs | `MyPrograms.jsx` | `PageLayout` |
| My R&D Projects | `MyRDProjects.jsx` | `PageLayout` |
| My Applications | `MyApplications.jsx` | `PageLayout` |
| My Bookmarks | `MyBookmarks.jsx` | `PageLayout` |
| Expert Registry | `ExpertRegistry.jsx` | `PageLayout` |
| Municipal Proposal Inbox | `MunicipalProposalInbox.jsx` | `PageLayout` |
| Municipality Ideas View | `MunicipalityIdeasView.jsx` | `PageLayout` |
| Admin Portal | `AdminPortal.jsx` | `PageLayout` |

---

### ❌ Pages NOT Using PersonaPageLayout

#### HIGH PRIORITY - Core Entity List Pages (6 pages)
| Page | File | Status | Action Required |
|------|------|--------|-----------------|
| Challenges | `Challenges.jsx` | ❌ No Layout | Add `PageLayout` wrapper |
| Pilots | `Pilots.jsx` | ❌ No Layout | Add `PageLayout` wrapper |
| Programs | `Programs.jsx` | ❌ No Layout | Add `PageLayout` wrapper |
| R&D Projects | `RDProjects.jsx` | ❌ No Layout | Add `PageLayout` wrapper |
| Knowledge | `Knowledge.jsx` | ❌ No Layout | Add `PageLayout` wrapper |
| Case Studies | `CaseStudies.jsx` | ❌ No Layout | Add `PageLayout` wrapper |

#### MEDIUM PRIORITY - Management & Admin Pages (~15 pages)
| Page | File | Action Required |
|------|------|-----------------|
| Contract Management | `ContractManagement.jsx` | Add `PageLayout` |
| Budget Management | `BudgetManagement.jsx` | Add `PageLayout` |
| Approval Center | `ApprovalCenter.jsx` | Add `PageLayout` |
| Proposal Management | `ProposalManagement.jsx` | Add `PageLayout` |
| User Management | `UserManagement.jsx` | Add `PageLayout` |
| Role Management | `RoleManagement.jsx` | Add `PageLayout` |
| Audit Registry | `AuditRegistry.jsx` | Add `PageLayout` |
| Audit Logs | `AuditLogs.jsx` | Add `PageLayout` |
| Organizations | `Organizations.jsx` | Add `PageLayout` |
| Data Management Hub | `DataManagementHub.jsx` | Add `PageLayout` |
| Invoice Management | `InvoiceManagement.jsx` | Add `PageLayout` |
| Notification Center | `NotificationCenter.jsx` | Add `PageLayout` |
| Settings | `Settings.jsx` | Add `PageLayout` |
| Reports | `Reports.jsx` | Add `PageLayout` |
| Analytics Dashboard | `AnalyticsDashboard.jsx` | Add `PageLayout` |

#### LOW PRIORITY - Detail Pages (~25 pages)
| Page | File | Action Required |
|------|------|-----------------|
| Challenge Detail | `ChallengeDetail.jsx` | Check/Add `PageLayout` |
| Pilot Detail | `PilotDetail.jsx` | Check/Add `PageLayout` |
| Solution Detail | `SolutionDetail.jsx` | Check/Add `PageLayout` |
| Program Detail | `ProgramDetail.jsx` | Check/Add `PageLayout` |
| R&D Project Detail | `RDProjectDetail.jsx` | Check/Add `PageLayout` |
| Living Lab Detail | `LivingLabDetail.jsx` | Check/Add `PageLayout` |
| Contract Detail | `ContractDetail.jsx` | Check/Add `PageLayout` |
| Budget Detail | `BudgetDetail.jsx` | Check/Add `PageLayout` |
| Organization Detail | `OrganizationDetail.jsx` | Check/Add `PageLayout` |
| Expert Detail | `ExpertDetail.jsx` | Check/Add `PageLayout` |
| Idea Detail | `IdeaDetail.jsx` | Check/Add `PageLayout` |
| Event Detail | `EventDetail.jsx` | Check/Add `PageLayout` |
| Audit Detail | `AuditDetail.jsx` | Check/Add `PageLayout` |
| Policy Detail | `PolicyDetail.jsx` | Check/Add `PageLayout` |
| Proposal Detail | `ChallengeProposalDetail.jsx` | Check/Add `PageLayout` |
| ... and more | | |

#### LOW PRIORITY - Form/Create/Edit Pages (~20 pages)
| Page | File | Action Required |
|------|------|-----------------|
| Challenge Create | `ChallengeCreate.jsx` | Check/Add `PageLayout` |
| Challenge Edit | `ChallengeEdit.jsx` | Check/Add `PageLayout` |
| Pilot Create | `PilotCreate.jsx` | Check/Add `PageLayout` |
| Pilot Edit | `PilotEdit.jsx` | Check/Add `PageLayout` |
| Solution Create | `SolutionCreate.jsx` | Check/Add `PageLayout` |
| Program Create | `ProgramCreate.jsx` | Check/Add `PageLayout` |
| Living Lab Create | `LivingLabCreate.jsx` | Check/Add `PageLayout` |
| Organization Create | `OrganizationCreate.jsx` | Check/Add `PageLayout` |
| Municipality Create | `MunicipalityCreate.jsx` | Check/Add `PageLayout` |
| Policy Create | `PolicyCreate.jsx` | Check/Add `PageLayout` |
| Case Study Create | `CaseStudyCreate.jsx` | Check/Add `PageLayout` |
| Knowledge Document Create | `KnowledgeDocumentCreate.jsx` | Check/Add `PageLayout` |
| ... and more | | |

#### NOT APPLICABLE - Public/Auth/Error Pages
| Page | File | Notes |
|------|------|-------|
| Home | `Home.jsx` | Public landing page |
| Login | `Login.jsx` | Auth page, no sidebar |
| Register | `Register.jsx` | Auth page, no sidebar |
| Auth | `Auth.jsx` | Auth page, no sidebar |
| Public Portal | `PublicPortal.jsx` | Public, no auth needed |
| Public Challenge Detail | `PublicChallengeDetail.jsx` | Public view |
| Public Pilot Detail | `PublicPilotDetail.jsx` | Public view |
| Not Found | `NotFound.jsx` | Error page |
| Unauthorized | `Unauthorized.jsx` | Error page |
| Getting Started | `GettingStarted.jsx` | Onboarding |
| About | `About.jsx` | Public info |
| Contact | `Contact.jsx` | Public info |
| News | `News.jsx` | Public info |

---

## Widget & Filter Components

### Dashboard Widgets

#### Status: ❌ NOT Using Persona-Aware Layout

| Component | Location | Used By | Status |
|-----------|----------|---------|--------|
| DashboardSharing | `src/components/dashboard/` | All dashboards | ❌ Needs persona styling |
| WidgetLibrary | `src/components/dashboard/` | Admin | ❌ Needs persona styling |

### Search & Filter Components

#### Status: ❌ NOT Using Persona-Aware Layout

| Component | Location | Used By | Status |
|-----------|----------|---------|--------|
| AdvancedFilters | `src/components/search/` | List pages | ❌ Needs persona styling |
| AdvancedSearchPanel | `src/components/search/` | Search pages | ❌ Needs persona styling |
| SearchAnalytics | `src/components/search/` | Admin | ❌ Needs persona styling |

### Entity-Specific Components

#### Challenges Components
| Component | Location | Status |
|-----------|----------|--------|
| ChallengeCard | `src/components/challenges/` | ⚠️ Check styling |
| ChallengeFilters | `src/components/challenges/` | ⚠️ Check styling |
| ChallengeKPISection | `src/components/challenges/` | ⚠️ Check styling |
| ChallengeStatusBadge | `src/components/challenges/` | ⚠️ Check styling |
| ChallengeWorkflowStepper | `src/components/challenges/` | ⚠️ Check styling |

#### Pilot Components
| Component | Location | Status |
|-----------|----------|--------|
| PilotCard | `src/components/pilots/` | ⚠️ Check styling |
| PilotFilters | `src/components/pilots/` | ⚠️ Check styling |
| PilotMetricsGrid | `src/components/pilots/` | ⚠️ Check styling |
| PilotGateProgress | `src/components/pilots/` | ⚠️ Check styling |

#### Program Components
| Component | Location | Status |
|-----------|----------|--------|
| ProgramCard | `src/components/programs/` | ⚠️ Check styling |
| ProgramFilters | `src/components/programs/` | ⚠️ Check styling |
| ProgramTimeline | `src/components/programs/` | ⚠️ Check styling |

#### R&D Project Components
| Component | Location | Status |
|-----------|----------|--------|
| RDProjectCard | `src/components/rd/` | ⚠️ Check styling |
| RDProjectFilters | `src/components/rd/` | ⚠️ Check styling |
| RDMilestoneTracker | `src/components/rd/` | ⚠️ Check styling |

---

## Implementation Recommendations

### Phase 1: High Priority (Core Entity List Pages)
**Effort: ~2-3 hours**

Update these 6 core list pages to use `PageLayout`:

1. `Challenges.jsx`
2. `Pilots.jsx`
3. `Programs.jsx`
4. `RDProjects.jsx`
5. `Knowledge.jsx`
6. `CaseStudies.jsx`

**Implementation Pattern:**
```jsx
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

export default function Challenges() {
  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'Challenges', ar: 'التحديات' }}
        description={{ en: 'Browse and manage challenges', ar: 'تصفح وإدارة التحديات' }}
        actions={<Button><Plus /> Create Challenge</Button>}
      />
      {/* Existing content */}
    </PageLayout>
  );
}
```

### Phase 2: Medium Priority (Management Pages)
**Effort: ~3-4 hours**

Update 15 management pages with `PageLayout`.

### Phase 3: Low Priority (Detail & Form Pages)
**Effort: ~5-6 hours**

Update ~45 detail and form pages with `PageLayout`.

### Phase 4: Widget & Filter Styling
**Effort: ~2-3 hours**

Add persona-aware theming to:
- Dashboard widget components
- Search/filter components
- Entity card components

---

## Testing Checklist

### Per Persona Testing
- [ ] Admin - All pages accessible, full features
- [ ] Executive - Dashboard, reports, approvals
- [ ] Deputyship - Sector-specific views
- [ ] Municipality - Local government views
- [ ] Provider - Solution management
- [ ] Expert - Evaluation workflows
- [ ] Researcher - R&D project views
- [ ] Citizen - Public participation pages
- [ ] Viewer - Read-only access
- [ ] Academia - Academic institution views
- [ ] Startup - Startup company views

### Layout Testing
- [ ] PageLayout renders correctly
- [ ] Breadcrumbs display properly
- [ ] RTL layout functions
- [ ] Mobile responsive
- [ ] Actions visible in header

---

## File Structure Summary

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx              ✅ Complete
│   │   ├── PersonaSidebar.jsx      ✅ Complete
│   │   ├── PersonaPageLayout.jsx   ✅ Complete
│   │   ├── PersonaHeader.jsx       ✅ Complete
│   │   └── sidebarMenus.js         ✅ Complete
│   ├── citizen/
│   │   └── CitizenPageLayout.jsx   ✅ Complete
│   ├── dashboard/
│   │   ├── DashboardSharing.jsx    ❌ Needs work
│   │   └── WidgetLibrary.jsx       ❌ Needs work
│   ├── search/
│   │   ├── AdvancedFilters.jsx     ❌ Needs work
│   │   ├── AdvancedSearchPanel.jsx ❌ Needs work
│   │   └── SearchAnalytics.jsx     ❌ Needs work
│   └── permissions/
│       └── usePermissions.jsx      ✅ Complete
├── hooks/
│   ├── usePersonaRouting.js        ✅ Complete
│   └── visibility/                 ✅ Complete
└── pages/
    ├── *Dashboard.jsx              ✅ All complete (11)
    ├── Citizen*.jsx                ✅ All complete (12)
    ├── Solutions.jsx               ✅ Complete
    ├── LivingLabs.jsx              ✅ Complete
    ├── Challenges.jsx              ❌ Needs PageLayout
    ├── Pilots.jsx                  ❌ Needs PageLayout
    ├── Programs.jsx                ❌ Needs PageLayout
    ├── RDProjects.jsx              ❌ Needs PageLayout
    ├── Knowledge.jsx               ❌ Needs PageLayout
    ├── CaseStudies.jsx             ❌ Needs PageLayout
    └── ... (~500+ more pages)      ❌ Most need PageLayout
```

---

## Changelog

| Date | Change |
|------|--------|
| Dec 2024 | Initial documentation created |
| Dec 2024 | Visibility system integration complete |
| Dec 2024 | Citizen persona fully implemented (12 pages) |
| Dec 2024 | All 11 dashboards using PersonaPageLayout |
| Dec 2024 | Identified 6 core list pages needing updates |
| Dec 2024 | Identified ~500+ pages needing layout updates |

