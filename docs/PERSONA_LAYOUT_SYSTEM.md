# Persona Layout System Documentation

> Last Updated: December 2024

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
│  │  - Logo         │    │  │       PageHeader               ││ │
│  │  - Menu Items   │    │  │  (Icon, Title, Stats, Actions) ││ │
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

| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| Layout.jsx | `src/components/Layout.jsx` | Main app wrapper, auth, persona detection | ✅ Complete |
| PersonaSidebar.jsx | `src/components/layout/PersonaSidebar.jsx` | Role-based navigation menu | ✅ Complete |
| PersonaPageLayout.jsx | `src/components/layout/PersonaPageLayout.jsx` | Page wrapper with consistent styling | ✅ Complete |
| PersonaHeader.jsx | `src/components/layout/PersonaHeader.jsx` | User persona badge display | ✅ Complete |
| CitizenPageLayout.jsx | `src/components/citizen/CitizenPageLayout.jsx` | Re-export for backward compatibility | ✅ Complete |

### Component Exports (PersonaPageLayout.jsx)

```javascript
import { 
  PageLayout,       // Main page wrapper
  PageHeader,       // Header with icon, title, stats, actions
  SearchFilter,     // Search and filter bar
  CardGrid,         // Responsive card grid
  EmptyState,       // Empty state placeholder
  PersonaButton,    // Persona-themed button
  usePersonaColors  // Hook for persona color tokens
} from '@/components/layout/PersonaPageLayout';
```

---

## Hooks

| Hook | Path | Purpose | Status |
|------|------|---------|--------|
| usePersonaRouting | `src/hooks/usePersonaRouting.js` | Determines persona, dashboard, menu visibility | ✅ Complete |
| usePermissions | `src/components/permissions/usePermissions.jsx` | Role & permission checks | ✅ Complete |
| useVisibilitySystem | `src/hooks/visibility/useVisibilitySystem.js` | Data access level control | ✅ Complete |

---

## Persona-by-Persona Status

### Summary Statistics

| Persona | Dashboard | Related Pages | Total Using Layout |
|---------|-----------|---------------|-------------------|
| Admin | ✅ AdminPortal | 0 of 11 | 1 |
| Executive | ✅ ExecutiveDashboard | 4 of 6 | 5 ✅ |
| Deputyship | (shares Executive) | 3 of 6 | 3 |
| Municipality | ✅ MunicipalityDashboard | 13 of 13 | 14 ✅ |
| Provider/Startup | ✅ StartupDashboard | 1 of 11 | 2 |
| Expert | ✅ ExpertDashboard | 1 of 15 | 2 |
| Researcher | ✅ ResearcherDashboard | 1 of 12 | 2 |
| Citizen | ✅ CitizenDashboard | 7 of 7 | 8 ✅ |
| Viewer | ✅ ViewerDashboard | 0 of 0 | 1 |
| Academia | ✅ AcademiaDashboard | 2 of 2 | 3 ✅ |

**All Dashboard Pages: 10/10 ✅ Complete**

---

## 1. ADMIN Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'admin'
- `defaultDashboard`: '/home'
- `portalType`: 'admin'
- `onboardingWizard`: null

### Pages Using PageLayout ✅

| Page | File |
|------|------|
| Admin Portal | `AdminPortal.jsx` |

### Pages NOT Using PageLayout

| Page | File | Priority |
|------|------|----------|
| User Management | `UserManagement.jsx` | High |
| Role Management | `RoleManagement.jsx` | High |
| Audit Registry | `AuditRegistry.jsx` | Medium |
| Audit Trail | `AuditTrail.jsx` | Medium |
| Data Management Hub | `DataManagementHub.jsx` | Medium |
| Integration Manager | `IntegrationManager.jsx` | Low |
| Settings | `Settings.jsx` | Low |
| Backup Recovery Manager | `BackupRecoveryManager.jsx` | Low |
| Error Logs Console | `ErrorLogsConsole.jsx` | Low |
| Feature Flags Dashboard | `FeatureFlagsDashboard.jsx` | Low |
| Email Template Manager | `EmailTemplateManager.jsx` | Low |

---

## 2. EXECUTIVE Persona ✅ COMPLETE

**Route Config (usePersonaRouting.js):**
- `persona`: 'executive'
- `defaultDashboard`: '/executive-dashboard'
- `portalType`: 'executive'
- `onboardingWizard`: 'DeputyshipOnboarding'

### Pages Using PageLayout ✅

| Page | File |
|------|------|
| Executive Dashboard | `ExecutiveDashboard.jsx` |
| Executive Approvals | `ExecutiveApprovals.jsx` |
| Executive Brief Generator | `ExecutiveBriefGenerator.jsx` |
| Executive Strategic Challenge Queue | `ExecutiveStrategicChallengeQueue.jsx` |
| Command Center | `CommandCenter.jsx` |

### Pages NOT Using PageLayout

| Page | File | Priority |
|------|------|----------|
| National Innovation Map | `NationalInnovationMap.jsx` | Low (Map view) |
| National Map | `NationalMap.jsx` | Low (Map view) |

---

## 3. DEPUTYSHIP Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'deputyship'
- `defaultDashboard`: '/executive-dashboard' (shares with Executive)
- `portalType`: 'deputyship'
- `onboardingWizard`: 'DeputyshipOnboarding'

### Pages Using PageLayout ✅

| Page | File |
|------|------|
| Policy Hub | `PolicyHub.jsx` |
| Policy Library | `PolicyLibrary.jsx` |
| Multi City Coordination | `MultiCityCoordination.jsx` |
| Multi City Orchestration | `MultiCityOrchestration.jsx` |

### Pages NOT Using PageLayout

| Page | File | Priority |
|------|------|----------|
| Policy Create | `PolicyCreate.jsx` | Form wizard |
| Policy Edit | `PolicyEdit.jsx` | Form wizard |
| Policy Detail | `PolicyDetail.jsx` | Detail view |
| Deputyship Onboarding | `DeputyshipOnboarding.jsx` | Onboarding wizard |

---

## 4. MUNICIPALITY Persona ✅ COMPLETE

**Route Config (usePersonaRouting.js):**
- `persona`: 'municipality'
- `defaultDashboard`: '/municipality-dashboard'
- `portalType`: 'municipality'
- `onboardingWizard`: 'MunicipalityStaffOnboarding'

### All Pages Using PageLayout (14 pages)

| Page | File |
|------|------|
| Municipality Dashboard | `MunicipalityDashboard.jsx` |
| Municipal Proposal Inbox | `MunicipalProposalInbox.jsx` |
| Municipality Peer Matcher | `MunicipalityPeerMatcher.jsx` |
| Municipality Ideas View | `MunicipalityIdeasView.jsx` |
| Municipality Profile | `MunicipalityProfile.jsx` |
| Municipality Create | `MunicipalityCreate.jsx` |
| Municipality Edit | `MunicipalityEdit.jsx` |
| City Management | `CityManagement.jsx` |
| City Dashboard | `CityDashboard.jsx` |
| MII | `MII.jsx` |
| MII Drill Down | `MIIDrillDown.jsx` |
| Cross City Learning Hub | `CrossCityLearningHub.jsx` |
| Multi City Coordination | `MultiCityCoordination.jsx` |
| Multi City Orchestration | `MultiCityOrchestration.jsx` |

### Excluded (Special UX)

| Page | File | Reason |
|------|------|--------|
| Municipality Staff Onboarding | `MunicipalityStaffOnboarding.jsx` | Onboarding wizard |

---

## 5. PROVIDER/STARTUP Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'provider'
- `defaultDashboard`: '/startup-dashboard'
- `portalType`: 'provider'
- `onboardingWizard`: 'StartupOnboarding'

### Pages Using PageLayout ✅

| Page | File |
|------|------|
| Startup Dashboard | `StartupDashboard.jsx` |
| Provider Proposal Wizard | `ProviderProposalWizard.jsx` |

### Pages NOT Using PageLayout

| Page | File | Priority |
|------|------|----------|
| Solution Create | `SolutionCreate.jsx` | High |
| Solution Edit | `SolutionEdit.jsx` | High |
| Solution Detail | `SolutionDetail.jsx` | High |
| Matchmaker Journey | `MatchmakerJourney.jsx` | Medium |
| Matchmaker Applications | `MatchmakerApplications.jsx` | Medium |
| Matchmaker Application Create | `MatchmakerApplicationCreate.jsx` | Low |
| Matchmaker Application Detail | `MatchmakerApplicationDetail.jsx` | Low |
| Opportunity Feed | `OpportunityFeed.jsx` | Medium |
| Startup Onboarding | `StartupOnboarding.jsx` | Wizard |

---

## 6. EXPERT Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'expert'
- `defaultDashboard`: '/expert-dashboard'
- `portalType`: 'expert'
- `onboardingWizard`: 'ExpertOnboarding'

### Pages Using PageLayout ✅

| Page | File |
|------|------|
| Expert Dashboard | `ExpertDashboard.jsx` |
| Expert Registry | `ExpertRegistry.jsx` |

### Pages NOT Using PageLayout

| Page | File | Priority |
|------|------|----------|
| Expert Detail | `ExpertDetail.jsx` | High |
| Expert Profile Edit | `ExpertProfileEdit.jsx` | High |
| Expert Panel Management | `ExpertPanelManagement.jsx` | Medium |
| Expert Panel Detail | `ExpertPanelDetail.jsx` | Medium |
| Expert Assignment Queue | `ExpertAssignmentQueue.jsx` | Medium |
| Expert Evaluation Workflow | `ExpertEvaluationWorkflow.jsx` | Medium |
| Expert Matching Engine | `ExpertMatchingEngine.jsx` | Low |
| Expert Performance Dashboard | `ExpertPerformanceDashboard.jsx` | Low |
| Browse Experts | `BrowseExperts.jsx` | Medium |
| My Evaluator Profile | `MyEvaluatorProfile.jsx` | Medium |
| Evaluation Panel | `EvaluationPanel.jsx` | Medium |
| Evaluation Rubric Builder | `EvaluationRubricBuilder.jsx` | Low |
| Evaluation Template Manager | `EvaluationTemplateManager.jsx` | Low |
| Evaluation Analytics Dashboard | `EvaluationAnalyticsDashboard.jsx` | Low |
| Expert Onboarding | `ExpertOnboarding.jsx` | Wizard |

---

## 7. RESEARCHER Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'researcher'
- `defaultDashboard`: '/researcher-dashboard'
- `portalType`: 'researcher'
- `onboardingWizard`: 'ResearcherOnboarding'

### Pages Using PageLayout ✅

| Page | File |
|------|------|
| Researcher Dashboard | `ResearcherDashboard.jsx` |
| R&D Projects | `RDProjects.jsx` |

### Pages NOT Using PageLayout

| Page | File | Priority |
|------|------|----------|
| R&D Project Create | `RDProjectCreate.jsx` | High |
| R&D Project Edit | `RDProjectEdit.jsx` | High |
| R&D Project Detail | `RDProjectDetail.jsx` | High |
| R&D Call Create | `RDCallCreate.jsx` | Medium |
| R&D Call Detail | `RDCallDetail.jsx` | Medium |
| R&D Proposal Create | `RDProposalCreate.jsx` | Medium |
| R&D Proposal Detail | `RDProposalDetail.jsx` | Medium |
| R&D Proposal Edit | `RDProposalEdit.jsx` | Medium |
| Institution R&D Dashboard | `InstitutionRDDashboard.jsx` | Medium |
| My Researcher Profile Editor | `MyResearcherProfileEditor.jsx` | Medium |
| My R&D Projects | `MyRDProjects.jsx` | Medium |
| Researcher Onboarding | `ResearcherOnboarding.jsx` | Wizard |

---

## 8. CITIZEN Persona ✅ COMPLETE

**Route Config (usePersonaRouting.js):**
- `persona`: 'citizen'
- `defaultDashboard`: '/citizen-dashboard'
- `portalType`: 'citizen'
- `onboardingWizard`: 'CitizenOnboarding'

### All Pages Using PageLayout (8 pages)

| Page | File |
|------|------|
| Citizen Dashboard | `CitizenDashboard.jsx` |
| Citizen Challenges Browser | `CitizenChallengesBrowser.jsx` |
| Citizen Solutions Browser | `CitizenSolutionsBrowser.jsx` |
| Citizen Living Labs Browser | `CitizenLivingLabsBrowser.jsx` |
| Citizen Idea Submission | `CitizenIdeaSubmission.jsx` |
| Citizen Leaderboard | `CitizenLeaderboard.jsx` |
| Citizen Pilot Enrollment | `CitizenPilotEnrollment.jsx` |
| Citizen Lab Participation | `CitizenLabParticipation.jsx` |
| Citizen Engagement Dashboard | `CitizenEngagementDashboard.jsx` |

### Excluded (Special UX)

| Page | File | Reason |
|------|------|--------|
| Citizen Onboarding | `CitizenOnboarding.jsx` | Onboarding wizard |

---

## 9. VIEWER Persona ✅ COMPLETE

**Route Config (usePersonaRouting.js):**
- `persona`: 'viewer'
- `defaultDashboard`: '/viewer-dashboard'
- `portalType`: 'viewer'
- `onboardingWizard`: null

### Pages Using PageLayout ✅

| Page | File |
|------|------|
| Viewer Dashboard | `ViewerDashboard.jsx` |

**Note:** Viewer is a browse-only role with limited functionality.

---

## 10. ACADEMIA Persona ✅ COMPLETE

### Pages Using PageLayout ✅

| Page | File |
|------|------|
| Academia Dashboard | `AcademiaDashboard.jsx` |
| Alumni Showcase | `AlumniShowcase.jsx` |
| Institution R&D Dashboard | `InstitutionRDDashboard.jsx` |

---

## Core Entity List Pages ✅ COMPLETE

All 7 core entity list pages have PageLayout:

| Page | File |
|------|------|
| Challenges | `Challenges.jsx` |
| Pilots | `Pilots.jsx` |
| Programs | `Programs.jsx` |
| R&D Projects | `RDProjects.jsx` |
| Knowledge | `Knowledge.jsx` |
| Solutions | `Solutions.jsx` |
| Living Labs | `LivingLabs.jsx` |

---

## Sidebar Configuration

### PersonaSidebar Component

Located at: `src/components/layout/PersonaSidebar.jsx`

**Features:**
- Persona badge with icon and label
- Filtered menu items based on permissions
- Collapsible on desktop
- Mobile-responsive overlay
- RTL support

### Menu Configuration

Located at: `src/config/sidebarConfig.js`

**Structure:**
```javascript
{
  id: 'menu-item-id',
  label: { en: 'English Label', ar: 'Arabic Label' },
  icon: IconComponent,
  path: '/route-path',
  personas: ['admin', 'municipality'], // Which personas see this
  permissions: ['permission_name'],    // Required permissions
  roles: ['role_name'],               // Required roles
  badge: 5,                           // Optional notification count
}
```

### Persona-Specific Menu Visibility

Controlled by `usePersonaRouting.js` → `menuVisibility` object:

```javascript
menuVisibility: {
  showAdminMenu: isAdmin,
  showMunicipalityMenu: isMunicipalityUser,
  showProviderMenu: isProvider,
  showExpertMenu: isExpert,
  showResearcherMenu: isResearcher,
  showCitizenMenu: isCitizen,
  showExecutiveMenu: isExecutive || isDeputyship,
  ...
}
```

---

## Implementation Guide

### Adding PageLayout to a New Page

1. **Import components:**
```javascript
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';
```

2. **Wrap content with PageLayout:**
```jsx
return (
  <PageLayout>
    <PageHeader
      icon={IconComponent}
      title={t({ en: 'Page Title', ar: 'العنوان' })}
      description={t({ en: 'Description', ar: 'الوصف' })}
      stats={[
        { icon: Icon1, value: 10, label: t({ en: 'Label', ar: 'تسمية' }) },
      ]}
      action={
        <PersonaButton>
          Action Button
        </PersonaButton>
      }
    />
    
    {/* Page content */}
  </PageLayout>
);
```

### Using Citizen-Specific Layout (Backward Compatible)

```javascript
import { CitizenPageLayout, CitizenPageHeader } from '@/components/citizen/CitizenPageLayout';
```

---

## Color Theming

### usePersonaColors Hook

```javascript
const colors = usePersonaColors();
// Returns: { primary, secondary, accent, gradient }
```

### Persona Color Map

| Persona | Primary | Gradient |
|---------|---------|----------|
| admin | Red | red-600 → rose-600 |
| executive | Purple | purple-600 → violet-600 |
| deputyship | Blue | blue-600 → indigo-600 |
| municipality | Green | green-600 → emerald-600 |
| provider | Orange | orange-600 → amber-600 |
| expert | Indigo | indigo-600 → purple-600 |
| researcher | Teal | teal-600 → cyan-600 |
| citizen | Slate | slate-600 → gray-600 |
| viewer | Gray | gray-500 → slate-500 |

---

## Testing Checklist

When adding PageLayout to a page:

- [ ] PageLayout wraps all content
- [ ] PageHeader has icon, title, description
- [ ] Stats array shows relevant KPIs
- [ ] Action button uses PersonaButton
- [ ] RTL layout works correctly
- [ ] Mobile responsive
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] Dark mode compatible

---

## Migration Priority

### Phase 1: Dashboards ✅ COMPLETE
All 10 persona dashboards now use PageLayout.

### Phase 2: Core CRUD Pages (Next)
Focus on Detail/Create/Edit pages for main entities:
- Challenge CRUD
- Pilot CRUD
- Program CRUD
- Solution CRUD
- R&D Project CRUD

### Phase 3: Admin & Management
- User Management
- Role Management
- Audit pages
- Settings pages

### Phase 4: Specialty Pages
- Analytics dashboards
- Report pages
- Wizard pages (may remain custom)

---

## New Components (Planned)

See [LAYOUT_SYSTEM_IMPLEMENTATION_PLAN.md](./LAYOUT_SYSTEM_IMPLEMENTATION_PLAN.md) for full details.

| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `EntityDetailHeader` | `src/components/layout/EntityDetailHeader.jsx` | Unified detail page headers | 🔜 Planned |
| `EntityFormLayout` | `src/components/layout/EntityFormLayout.jsx` | Consistent form layouts | 🔜 Planned |
| `EntityStatusBadge` | `src/components/layout/EntityStatusBadge.jsx` | Unified status badges | 🔜 Planned |

---

## Changelog

| Date | Changes |
|------|---------|
| Dec 2024 | Initial documentation |
| Dec 2024 | Added Municipality persona (14 pages) |
| Dec 2024 | Added Citizen persona (8 pages) |
| Dec 2024 | Added ResearcherDashboard |
| Dec 2024 | Added ViewerDashboard |
| Dec 2024 | All 10 dashboards complete |
| Dec 2024 | Created LAYOUT_SYSTEM_IMPLEMENTATION_PLAN.md |
| Dec 2024 | Deleted 4 orphaned empty files |
| Dec 2024 | Implemented MyResearcherProfileEditor |
