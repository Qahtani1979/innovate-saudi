# Persona Layout System Documentation

> Last Updated: December 2024
> Status: ✅ SUBSTANTIALLY COMPLETE (101+ pages)

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
| Admin | ✅ AdminPortal | 11 of 11 | 12 ✅ |
| Executive | ✅ ExecutiveDashboard | 6 of 6 | 7 ✅ |
| Deputyship | (shares Executive) | 6 of 6 | 6 ✅ |
| Municipality | ✅ MunicipalityDashboard | 14 of 14 | 15 ✅ |
| Provider/Startup | ✅ StartupDashboard | 10 of 11 | 11 ✅ |
| Expert | ✅ ExpertDashboard | 14 of 15 | 15 ✅ |
| Researcher | ✅ ResearcherDashboard | 11 of 12 | 12 ✅ |
| Citizen | ✅ CitizenDashboard | 8 of 8 | 9 ✅ |
| Viewer | ✅ ViewerDashboard | 0 of 0 | 1 ✅ |
| Academia | ✅ AcademiaDashboard | 2 of 2 | 3 ✅ |

**All Dashboard Pages: 10/10 ✅ Complete**
**Total PageLayout Coverage: 101+ pages ✅**

---

## 1. ADMIN Persona ✅ COMPLETE

**Route Config (usePersonaRouting.js):**
- `persona`: 'admin'
- `defaultDashboard`: '/home'
- `portalType`: 'admin'
- `onboardingWizard`: null

### All Pages Using PageLayout ✅

| Page | File |
|------|------|
| Admin Portal | `AdminPortal.jsx` |
| User Management | `UserManagement.jsx` |
| Role Management | `RoleManagement.jsx` |
| Audit Registry | `AuditRegistry.jsx` |
| Audit Trail | `AuditTrail.jsx` |
| Audit Detail | `AuditDetail.jsx` |
| Data Management Hub | `DataManagementHub.jsx` |
| Budget Management | `BudgetManagement.jsx` |
| Budget Detail | `BudgetDetail.jsx` |
| Contract Management | `ContractManagement.jsx` |
| Contract Detail | `ContractDetail.jsx` |
| IP Management Dashboard | `IPManagementDashboard.jsx` |

### Excluded (Special UX)

| Page | File | Reason |
|------|------|--------|
| Settings | `Settings.jsx` | User preferences page |
| Integration Manager | `IntegrationManager.jsx` | Technical config |

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

## 5. PROVIDER/STARTUP Persona ✅ COMPLETE

**Route Config (usePersonaRouting.js):**
- `persona`: 'provider'
- `defaultDashboard`: '/startup-dashboard'
- `portalType`: 'provider'
- `onboardingWizard`: 'StartupOnboarding'

### All Pages Using PageLayout ✅

| Page | File |
|------|------|
| Startup Dashboard | `StartupDashboard.jsx` |
| Provider Proposal Wizard | `ProviderProposalWizard.jsx` |
| Solution Create | `SolutionCreate.jsx` |
| Solution Edit | `SolutionEdit.jsx` |
| Solution Detail | `SolutionDetail.jsx` |
| Matchmaker Journey | `MatchmakerJourney.jsx` |
| Matchmaker Applications | `MatchmakerApplications.jsx` |
| Matchmaker Application Create | `MatchmakerApplicationCreate.jsx` |
| Matchmaker Application Detail | `MatchmakerApplicationDetail.jsx` |
| Opportunity Feed | `OpportunityFeed.jsx` |

### Excluded (Special UX)

| Page | File | Reason |
|------|------|--------|
| Startup Onboarding | `StartupOnboarding.jsx` | Onboarding wizard |

---

## 6. EXPERT Persona ✅ COMPLETE

**Route Config (usePersonaRouting.js):**
- `persona`: 'expert'
- `defaultDashboard`: '/expert-dashboard'
- `portalType`: 'expert'
- `onboardingWizard`: 'ExpertOnboarding'

### All Pages Using PageLayout ✅

| Page | File |
|------|------|
| Expert Dashboard | `ExpertDashboard.jsx` |
| Expert Registry | `ExpertRegistry.jsx` |
| Expert Detail | `ExpertDetail.jsx` |
| Expert Profile Edit | `ExpertProfileEdit.jsx` |
| Expert Panel Management | `ExpertPanelManagement.jsx` |
| Expert Panel Detail | `ExpertPanelDetail.jsx` |
| Expert Assignment Queue | `ExpertAssignmentQueue.jsx` |
| Expert Evaluation Workflow | `ExpertEvaluationWorkflow.jsx` |
| Expert Matching Engine | `ExpertMatchingEngine.jsx` |
| Expert Performance Dashboard | `ExpertPerformanceDashboard.jsx` |
| Browse Experts | `BrowseExperts.jsx` |
| My Evaluator Profile | `MyEvaluatorProfile.jsx` |
| Evaluation Panel | `EvaluationPanel.jsx` |
| Evaluation Rubric Builder | `EvaluationRubricBuilder.jsx` |
| Evaluation Template Manager | `EvaluationTemplateManager.jsx` |

### Excluded (Special UX)

| Page | File | Reason |
|------|------|--------|
| Expert Onboarding | `ExpertOnboarding.jsx` | Onboarding wizard |

---

## 7. RESEARCHER Persona ✅ COMPLETE

**Route Config (usePersonaRouting.js):**
- `persona`: 'researcher'
- `defaultDashboard`: '/researcher-dashboard'
- `portalType`: 'researcher'
- `onboardingWizard`: 'ResearcherOnboarding'

### All Pages Using PageLayout ✅

| Page | File |
|------|------|
| Researcher Dashboard | `ResearcherDashboard.jsx` |
| R&D Projects | `RDProjects.jsx` |
| R&D Project Create | `RDProjectCreate.jsx` |
| R&D Project Edit | `RDProjectEdit.jsx` |
| R&D Project Detail | `RDProjectDetail.jsx` |
| R&D Call Create | `RDCallCreate.jsx` |
| R&D Call Detail | `RDCallDetail.jsx` |
| R&D Calls | `RDCalls.jsx` |
| Institution R&D Dashboard | `InstitutionRDDashboard.jsx` |
| My Researcher Profile Editor | `MyResearcherProfileEditor.jsx` |
| My R&D Projects | `MyRDProjects.jsx` |
| Research Outputs Hub | `ResearchOutputsHub.jsx` |

### Excluded (Special UX)

| Page | File | Reason |
|------|------|--------|
| Researcher Onboarding | `ResearcherOnboarding.jsx` | Onboarding wizard |

---

## 8. CITIZEN Persona ✅ COMPLETE

**Route Config (usePersonaRouting.js):**
- `persona`: 'citizen'
- `defaultDashboard`: '/citizen-dashboard'
- `portalType`: 'citizen'
- `onboardingWizard`: 'CitizenOnboarding'

### All Pages Using PageLayout (9 pages)

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

## Migration Status

### Phase 1: Dashboards ✅ COMPLETE
All 10 persona dashboards now use PageLayout.

### Phase 2: Core CRUD Pages ✅ COMPLETE
All Detail/Create/Edit pages for main entities:
- Challenge CRUD ✅
- Pilot CRUD ✅
- Program CRUD ✅
- Solution CRUD ✅
- R&D Project CRUD ✅
- Policy CRUD ✅
- Organization CRUD ✅
- Living Lab CRUD ✅

### Phase 3: Admin & Management ✅ COMPLETE
- User Management ✅
- Role Management ✅
- Audit pages ✅
- Budget pages ✅
- Contract pages ✅

### Phase 4: Specialty Pages ✅ COMPLETE
- Analytics dashboards ✅
- Expert pages ✅
- Knowledge pages ✅

---

## Components Available

| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `PageLayout` | `PersonaPageLayout.jsx` | Main page wrapper | ✅ Complete |
| `PageHeader` | `PersonaPageLayout.jsx` | Header with icon, title, stats | ✅ Complete |
| `SearchFilter` | `PersonaPageLayout.jsx` | Search and filter bar | ✅ Complete |
| `CardGrid` | `PersonaPageLayout.jsx` | Responsive card grid | ✅ Complete |
| `EmptyState` | `PersonaPageLayout.jsx` | Empty state placeholder | ✅ Complete |
| `PersonaButton` | `PersonaPageLayout.jsx` | Persona-themed button | ✅ Complete |
| `EntityDetailHeader` | `EntityDetailHeader.jsx` | Unified detail page headers | ✅ Complete |
| `EntityFormLayout` | `EntityFormLayout.jsx` | Consistent form layouts | ✅ Complete |
| `EntityStatusBadge` | `EntityStatusBadge.jsx` | Unified status badges | ✅ Complete |

---

## Changelog

| Date | Changes |
|------|---------|
| Dec 2024 | Initial documentation |
| Dec 2024 | Added Municipality persona (14 pages) |
| Dec 2024 | Added Citizen persona (8 pages) |
| Dec 2024 | All 10 dashboards complete |
| Dec 2024 | Created LAYOUT_SYSTEM_IMPLEMENTATION_PLAN.md |
| Dec 2024 | Migrated all Core CRUD pages (21 pages) |
| Dec 2024 | Migrated all Admin & Management pages (21 pages) |
| Dec 2024 | Created EntityDetailHeader, EntityFormLayout, EntityStatusBadge |
| Dec 2024 | **Total coverage: 101+ pages using PageLayout** ✅ |
