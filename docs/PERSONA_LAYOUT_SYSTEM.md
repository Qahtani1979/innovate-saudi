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

| Category | Using Layout | Total |
|----------|-------------|-------|
| Dashboards | 11 | 11 ✅ |
| Citizen Pages | 12 | 12 ✅ |
| Core Entity Lists | 7 | 7 ✅ |
| Entity-Related | 12+ | 12+ ✅ |

---

### ✅ Pages Using PersonaPageLayout (42+ pages)

#### Dashboards (11 - All Complete)
| Page | File | Layout | Icon |
|------|------|--------|------|
| Admin Dashboard | `AdminDashboard.jsx` | `PageLayout` | LayoutDashboard |
| Executive Dashboard | `ExecutiveDashboard.jsx` | `PageLayout` | Briefcase |
| Deputyship Dashboard | `DeputyshipDashboard.jsx` | `PageLayout` | Building2 |
| Municipality Dashboard | `MunicipalityDashboard.jsx` | `PageLayout` | Building |
| Provider Dashboard | `ProviderDashboard.jsx` | `PageLayout` | Handshake |
| Expert Dashboard | `ExpertDashboard.jsx` | `PageLayout` | UserCheck |
| Researcher Dashboard | `ResearcherDashboard.jsx` | `PageLayout` | Microscope |
| Citizen Dashboard | `CitizenDashboard.jsx` | `CitizenPageLayout` | LayoutDashboard |
| Viewer Dashboard | `ViewerDashboard.jsx` | `PageLayout` | Eye |
| Academia Dashboard | `AcademiaDashboard.jsx` | `PageLayout` | GraduationCap |
| Startup Dashboard | `StartupDashboard.jsx` | `PageLayout` | Rocket |

#### Citizen Portal Pages (12 - All Complete)
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

#### Core Entity List Pages (7 - All Complete)
| Page | File | Layout | Icon |
|------|------|--------|------|
| **Challenges** | `Challenges.jsx` | `PageLayout` | Target |
| **Pilots** | `Pilots.jsx` | `PageLayout` | TestTube2 |
| **Programs** | `Programs.jsx` | `PageLayout` | Layers |
| **R&D Projects** | `RDProjects.jsx` | `PageLayout` | FlaskConical |
| **Knowledge** | `Knowledge.jsx` | `PageLayout` | BookOpen |
| **Solutions** | `Solutions.jsx` | `PageLayout` | Lightbulb |
| **Living Labs** | `LivingLabs.jsx` | `PageLayout` | FlaskConical |

#### Other Entity Pages Using Layout (12+)
| Page | File | Layout |
|------|------|--------|
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

### ⏳ Pages Still Needing PersonaPageLayout

#### MEDIUM PRIORITY - Management & Admin Pages (~15 pages)
| Page | File | Status |
|------|------|--------|
| Contract Management | `ContractManagement.jsx` | ⏳ Pending |
| Budget Management | `BudgetManagement.jsx` | ⏳ Pending |
| Approval Center | `ApprovalCenter.jsx` | ⏳ Pending |
| User Management | `UserManagement.jsx` | ⏳ Pending |
| Role Management | `RoleManagement.jsx` | ⏳ Pending |
| Audit Registry | `AuditRegistry.jsx` | ⏳ Pending |
| Organizations | `Organizations.jsx` | ⏳ Pending |
| Settings | `Settings.jsx` | ⏳ Pending |
| Reports | `Reports.jsx` | ⏳ Pending |
| Analytics Dashboard | `AnalyticsDashboard.jsx` | ⏳ Pending |

#### LOW PRIORITY - Detail & Form Pages (~45+ pages)
These pages work correctly but could benefit from consistent headers:
- Challenge Detail, Edit, Create
- Pilot Detail, Edit, Create
- Solution Detail, Edit, Create
- Program Detail, Edit, Create
- R&D Project Detail, Edit, Create
- Living Lab Detail, Edit, Create
- Contract Detail
- Budget Detail
- Organization Detail
- Expert Detail
- And more...

#### NOT APPLICABLE - Public/Auth/Error Pages
| Page | Notes |
|------|-------|
| Home | Public landing page |
| Login/Register/Auth | Auth pages, no sidebar |
| Public Portal | Public, no auth needed |
| Public Challenge/Pilot Detail | Public views |
| Not Found/Unauthorized | Error pages |
| Getting Started | Onboarding |
| About/Contact/News | Public info |

---

## Widget & Filter Components

### Dashboard Widgets
| Component | Location | Status |
|-----------|----------|--------|
| DashboardSharing | `src/components/dashboard/` | ⚠️ Review needed |
| WidgetLibrary | `src/components/dashboard/` | ⚠️ Review needed |

### Search & Filter Components
| Component | Location | Status |
|-----------|----------|--------|
| AdvancedFilters | `src/components/search/` | ⚠️ Review needed |
| AdvancedSearchPanel | `src/components/search/` | ⚠️ Review needed |
| SearchAnalytics | `src/components/search/` | ⚠️ Review needed |

---

## Implementation Pattern

### Standard Page Template

```jsx
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { Target } from 'lucide-react';

export default function EntityListPage() {
  const { t, isRTL } = useLanguage();

  const headerActions = (
    <div className="flex items-center gap-2">
      <ExportData data={data} filename="export" />
      {hasPermission('entity_create') && (
        <Link to={createPageUrl('EntityCreate')}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Create', ar: 'إنشاء' })}
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        icon={Target}
        title={{ en: 'Entities', ar: 'الكيانات' }}
        description={{ en: 'Manage entities', ar: 'إدارة الكيانات' }}
        actions={headerActions}
      />
      
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page content */}
      </div>
    </PageLayout>
  );
}
```

---

## Testing Checklist

### Per Persona Testing
- [x] Admin - All pages accessible, full features
- [x] Executive - Dashboard, reports, approvals
- [x] Deputyship - Sector-specific views
- [x] Municipality - Local government views
- [x] Provider - Solution management
- [x] Expert - Evaluation workflows
- [x] Researcher - R&D project views
- [x] Citizen - Public participation pages
- [x] Viewer - Read-only access
- [x] Academia - Academic institution views
- [x] Startup - Startup company views

### Layout Testing
- [x] PageLayout renders correctly
- [x] PageHeader with icons displays properly
- [x] RTL layout functions
- [x] Mobile responsive
- [x] Actions visible in header

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
│   │   ├── DashboardSharing.jsx    ⚠️ Review needed
│   │   └── WidgetLibrary.jsx       ⚠️ Review needed
│   ├── search/
│   │   ├── AdvancedFilters.jsx     ⚠️ Review needed
│   │   ├── AdvancedSearchPanel.jsx ⚠️ Review needed
│   │   └── SearchAnalytics.jsx     ⚠️ Review needed
│   └── permissions/
│       └── usePermissions.jsx      ✅ Complete
├── hooks/
│   ├── usePersonaRouting.js        ✅ Complete
│   └── visibility/                 ✅ Complete
└── pages/
    ├── *Dashboard.jsx              ✅ All complete (11)
    ├── Citizen*.jsx                ✅ All complete (12)
    ├── Challenges.jsx              ✅ Complete (with PageLayout)
    ├── Pilots.jsx                  ✅ Complete (with PageLayout)
    ├── Programs.jsx                ✅ Complete (with PageLayout)
    ├── RDProjects.jsx              ✅ Complete (with PageLayout)
    ├── Knowledge.jsx               ✅ Complete (with PageLayout)
    ├── Solutions.jsx               ✅ Complete (with PageLayout)
    ├── LivingLabs.jsx              ✅ Complete (with PageLayout)
    └── ... (other pages)           ⏳ Medium/Low priority
```

---

## Changelog

| Date | Change |
|------|--------|
| Dec 2024 | Initial documentation created |
| Dec 2024 | Visibility system integration complete |
| Dec 2024 | Citizen persona fully implemented (12 pages) |
| Dec 2024 | All 11 dashboards using PersonaPageLayout |
| Dec 2024 | **Phase 1 Complete**: 5 core entity pages updated (Challenges, Pilots, Programs, RDProjects, Knowledge) |
| Dec 2024 | Total: 42+ pages now using PersonaPageLayout |

---

## Next Steps

### Phase 2 - Medium Priority
- Update management pages (ContractManagement, BudgetManagement, etc.)
- Update admin pages (UserManagement, RoleManagement, etc.)

### Phase 3 - Low Priority
- Update detail pages for consistent headers
- Update form/create/edit pages
- Review and enhance widget components

