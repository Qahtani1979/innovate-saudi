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
7. [Recommendations](#recommendations)

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
- `CitizenPageLayout` - Alias for citizen pages

Props:
```jsx
<PageLayout
  title="Page Title"
  titleAr="عنوان الصفحة"
  description="Page description"
  breadcrumbs={[{ label: 'Home', href: '/' }]}
  actions={<Button>Action</Button>}
  className="optional-classes"
>
  {children}
</PageLayout>
```

### 4. PersonaHeader.jsx
**Path:** `src/components/layout/PersonaHeader.jsx`
**Status:** ✅ Complete

Features:
- Breadcrumb navigation
- Page title with optional Arabic translation
- Description text
- Action buttons area
- Responsive design

### 5. sidebarMenus.js
**Path:** `src/components/layout/sidebarMenus.js`
**Status:** ✅ Complete

Contains menu definitions for all personas with:
- Icon assignments
- Route paths
- Required permissions
- Menu groupings
- Visibility rules

---

## Hooks

### 1. usePersonaRouting.js
**Path:** `src/hooks/usePersonaRouting.js`
**Status:** ✅ Complete

Returns:
```javascript
{
  persona: 'admin' | 'citizen' | 'municipality' | etc.,
  dashboardPath: '/admin-dashboard',
  menuItems: [...],
  isLoading: boolean
}
```

### 2. usePermissions.jsx
**Path:** `src/components/permissions/usePermissions.jsx`
**Status:** ✅ Complete

Returns permission checking functions and user role data.

### 3. useVisibilitySystem.js
**Path:** `src/hooks/visibility/useVisibilitySystem.js`
**Status:** ✅ Complete

Returns visibility scope data for filtering content.

---

## Persona Definitions

| Persona | Dashboard Path | Menu Items | Description |
|---------|---------------|------------|-------------|
| **Admin** | `/admin-dashboard` | 25+ | Full system access |
| **Executive** | `/executive-dashboard` | 15+ | Strategic oversight |
| **Deputyship** | `/deputyship-dashboard` | 18+ | Sector management |
| **Municipality** | `/municipality-dashboard` | 20+ | Local government |
| **Provider** | `/provider-dashboard` | 12+ | Solution providers |
| **Expert** | `/expert-dashboard` | 10+ | Advisory role |
| **Researcher** | `/researcher-dashboard` | 10+ | R&D focus |
| **Citizen** | `/citizen-dashboard` | 8 | Public participation |
| **Viewer** | `/viewer-dashboard` | 5 | Read-only access |

---

## Page Implementation Status

### ✅ Pages Using PersonaPageLayout (31 pages)

#### Dashboards
| Page | File | Layout Component |
|------|------|-----------------|
| Admin Dashboard | `src/pages/AdminDashboard.jsx` | `PageLayout` |
| Executive Dashboard | `src/pages/ExecutiveDashboard.jsx` | `PageLayout` |
| Deputyship Dashboard | `src/pages/DeputyshipDashboard.jsx` | `PageLayout` |
| Municipality Dashboard | `src/pages/MunicipalityDashboard.jsx` | `PageLayout` |
| Provider Dashboard | `src/pages/ProviderDashboard.jsx` | `PageLayout` |
| Expert Dashboard | `src/pages/ExpertDashboard.jsx` | `PageLayout` |
| Researcher Dashboard | `src/pages/ResearcherDashboard.jsx` | `PageLayout` |
| Citizen Dashboard | `src/pages/CitizenDashboard.jsx` | `CitizenPageLayout` |
| Viewer Dashboard | `src/pages/ViewerDashboard.jsx` | `PageLayout` |

#### Admin Pages
| Page | File | Layout Component |
|------|------|-----------------|
| User Management | `src/pages/UserManagement.jsx` | `PageLayout` |
| Role Management | `src/pages/RoleManagement.jsx` | `PageLayout` |
| Workflow Management | `src/pages/WorkflowManagement.jsx` | `PageLayout` |
| Audit Logs | `src/pages/AuditLogs.jsx` | `PageLayout` |
| Settings | `src/pages/Settings.jsx` | `PageLayout` |
| Analytics Dashboard | `src/pages/AnalyticsDashboard.jsx` | `PageLayout` |
| Reports | `src/pages/Reports.jsx` | `PageLayout` |
| Integrations | `src/pages/Integrations.jsx` | `PageLayout` |
| Monitoring | `src/pages/Monitoring.jsx` | `PageLayout` |
| System Health | `src/pages/SystemHealth.jsx` | `PageLayout` |
| AI Agents | `src/pages/AIAgents.jsx` | `PageLayout` |

#### Entity List Pages (Partial)
| Page | File | Layout Component |
|------|------|-----------------|
| Solutions | `src/pages/Solutions.jsx` | `PageLayout` |
| Case Studies | `src/pages/CaseStudies.jsx` | `PageLayout` |

#### Detail Pages
| Page | File | Layout Component |
|------|------|-----------------|
| Challenge Detail | `src/pages/ChallengeDetail.jsx` | `PageLayout` |
| Pilot Detail | `src/pages/PilotDetail.jsx` | `PageLayout` |
| Solution Detail | `src/pages/SolutionDetail.jsx` | `PageLayout` |
| Program Detail | `src/pages/ProgramDetail.jsx` | `PageLayout` |
| R&D Project Detail | `src/pages/RDProjectDetail.jsx` | `PageLayout` |
| Living Lab Detail | `src/pages/LivingLabDetail.jsx` | `PageLayout` |
| Contract Detail | `src/pages/ContractDetail.jsx` | `PageLayout` |

#### Form Pages
| Page | File | Layout Component |
|------|------|-----------------|
| Challenge Form | `src/pages/ChallengeForm.jsx` | `PageLayout` |
| Pilot Form | `src/pages/PilotForm.jsx` | `PageLayout` |
| Solution Form | `src/pages/SolutionForm.jsx` | `PageLayout` |

---

### ❌ Pages NOT Using PersonaPageLayout (Priority Updates Needed)

#### High Priority - Core Entity List Pages
| Page | File | Current Layout | Recommended Action |
|------|------|----------------|-------------------|
| Challenges | `src/pages/Challenges.jsx` | Custom | Add `PageLayout` |
| Pilots | `src/pages/Pilots.jsx` | Custom | Add `PageLayout` |
| Programs | `src/pages/Programs.jsx` | Custom | Add `PageLayout` |
| R&D Projects | `src/pages/RDProjects.jsx` | Custom | Add `PageLayout` |
| Knowledge | `src/pages/Knowledge.jsx` | Custom | Add `PageLayout` |
| Living Labs | `src/pages/LivingLabs.jsx` | Custom | Add `PageLayout` |

#### Medium Priority - Management Pages
| Page | File | Current Layout | Recommended Action |
|------|------|----------------|-------------------|
| Contract Management | `src/pages/ContractManagement.jsx` | Custom | Add `PageLayout` |
| Budget Management | `src/pages/BudgetManagement.jsx` | Custom | Add `PageLayout` |
| Approval Center | `src/pages/ApprovalCenter.jsx` | Custom | Add `PageLayout` |
| Proposal Management | `src/pages/ProposalManagement.jsx` | Custom | Add `PageLayout` |

#### Low Priority - Specialized Pages
| Page | File | Current Layout | Notes |
|------|------|----------------|-------|
| Public Portal | `src/pages/PublicPortal.jsx` | None | Public page, no auth |
| Public Challenge Detail | `src/pages/PublicChallengeDetail.jsx` | None | Public page |
| Public Pilot Detail | `src/pages/PublicPilotDetail.jsx` | None | Public page |
| Login | `src/pages/Login.jsx` | None | Auth page |
| Register | `src/pages/Register.jsx` | None | Auth page |
| Not Found | `src/pages/NotFound.jsx` | None | Error page |
| Unauthorized | `src/pages/Unauthorized.jsx` | None | Error page |

---

## Implementation Pattern

### Standard Page Template

```jsx
import { PageLayout } from '@/components/layout/PersonaPageLayout';
import { useTranslation } from '@/hooks/useTranslation';

export default function EntityListPage() {
  const { t, isRTL } = useTranslation();

  const breadcrumbs = [
    { label: t('dashboard'), href: '/' },
    { label: t('entities') }
  ];

  const actions = (
    <Button onClick={handleCreate}>
      <Plus className="h-4 w-4 mr-2" />
      {t('createNew')}
    </Button>
  );

  return (
    <PageLayout
      title={t('entities')}
      titleAr="الكيانات"
      description={t('manageEntities')}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      {/* Page content */}
    </PageLayout>
  );
}
```

---

## Recommendations

### Immediate Actions (High Priority)

1. **Update 6 Core Entity List Pages**
   - `Challenges.jsx` - Add PageLayout wrapper
   - `Pilots.jsx` - Add PageLayout wrapper
   - `Programs.jsx` - Add PageLayout wrapper
   - `RDProjects.jsx` - Add PageLayout wrapper
   - `Knowledge.jsx` - Add PageLayout wrapper
   - `LivingLabs.jsx` - Add PageLayout wrapper

2. **Ensure Consistent Breadcrumbs**
   - All pages should have proper breadcrumb trails
   - Dynamic breadcrumbs for detail pages

### Phase 2 Actions (Medium Priority)

3. **Update Management Pages**
   - `ContractManagement.jsx`
   - `BudgetManagement.jsx`
   - `ApprovalCenter.jsx`
   - `ProposalManagement.jsx`

4. **Add Page Actions**
   - Create/Add buttons in header area
   - Export/Filter toggles where appropriate

### Future Enhancements

5. **Persona-Specific Styling**
   - Color themes per persona
   - Custom icons per role

6. **Accessibility Improvements**
   - ARIA labels on all navigation
   - Keyboard navigation support

---

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx              # Main auth wrapper
│   │   ├── PersonaSidebar.jsx      # Sidebar navigation
│   │   ├── PersonaPageLayout.jsx   # Page wrapper + header
│   │   ├── PersonaHeader.jsx       # Header component
│   │   └── sidebarMenus.js         # Menu definitions
│   └── permissions/
│       └── usePermissions.jsx      # Permission hook
├── hooks/
│   ├── usePersonaRouting.js        # Routing hook
│   └── visibility/
│       └── useVisibilitySystem.js  # Visibility hook
└── pages/
    ├── *Dashboard.jsx              # Dashboard pages (✅ all use PageLayout)
    ├── *Detail.jsx                 # Detail pages (✅ most use PageLayout)
    ├── *Form.jsx                   # Form pages (✅ most use PageLayout)
    └── *.jsx                       # List pages (❌ some need updating)
```

---

## Testing Checklist

- [ ] All personas can access their dashboard
- [ ] Sidebar shows correct items per persona
- [ ] Breadcrumbs display correctly
- [ ] Page titles show in both languages
- [ ] Actions buttons are visible
- [ ] Mobile sidebar works
- [ ] RTL layout functions properly
- [ ] Permission-based filtering works

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| Dec 2024 | Initial documentation | System |
| Dec 2024 | Visibility system integration complete | System |
| Dec 2024 | Citizen persona fully implemented | System |

