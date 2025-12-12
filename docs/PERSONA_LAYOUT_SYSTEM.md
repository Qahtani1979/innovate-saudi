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

### 2. PersonaSidebar.jsx
**Path:** `src/components/layout/PersonaSidebar.jsx`
**Status:** ✅ Complete

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

### 5. PersonaHeader.jsx
**Path:** `src/components/layout/PersonaHeader.jsx`
**Status:** ✅ Complete

### 6. sidebarMenus.js
**Path:** `src/components/layout/sidebarMenus.js`
**Status:** ✅ Complete

---

## Hooks

| Hook | Path | Status |
|------|------|--------|
| usePersonaRouting | `src/hooks/usePersonaRouting.js` | ✅ Complete |
| usePermissions | `src/components/permissions/usePermissions.jsx` | ✅ Complete |
| useVisibilitySystem | `src/hooks/visibility/useVisibilitySystem.js` | ✅ Complete |

---

## Persona Definitions

| Persona | Dashboard Path | Portal Type |
|---------|---------------|-------------|
| **Admin** | `/admin-dashboard` | admin |
| **Executive** | `/executive-dashboard` | executive |
| **Deputyship** | `/deputyship-dashboard` | deputyship |
| **Municipality** | `/municipality-dashboard` | municipality |
| **Provider** | `/provider-dashboard` | provider |
| **Expert** | `/expert-dashboard` | expert |
| **Researcher** | `/researcher-dashboard` | researcher |
| **Citizen** | `/citizen-dashboard` | citizen |
| **Viewer** | `/viewer-dashboard` | viewer |
| **Academia** | `/academia-dashboard` | academia |
| **Startup** | `/startup-dashboard` | startup |

---

## Page Implementation Status

### Summary Statistics

| Category | Using Layout | Total | Coverage |
|----------|-------------|-------|----------|
| **Total Pages** | 29 | ~567 | 5.1% |
| Dashboards | 11 | 11 | 100% ✅ |
| Citizen Pages | 8 | 8 | 100% ✅ |
| Core Entity Lists | 7 | 7 | 100% ✅ |
| Other Pages | 3 | ~541 | <1% |

---

## ✅ Pages Using PersonaPageLayout (29 pages)

### Dashboards (11 pages - 100% Complete)

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

### Citizen Portal Pages (8 pages - 100% Complete)

| Page | File | Layout |
|------|------|--------|
| Citizen Dashboard | `CitizenDashboard.jsx` | `CitizenPageLayout` |
| Citizen Challenges Browser | `CitizenChallengesBrowser.jsx` | `CitizenPageLayout` |
| Citizen Solutions Browser | `CitizenSolutionsBrowser.jsx` | `CitizenPageLayout` |
| Citizen Living Labs Browser | `CitizenLivingLabsBrowser.jsx` | `CitizenPageLayout` |
| Citizen Idea Submission | `CitizenIdeaSubmission.jsx` | `CitizenPageLayout` |
| Citizen Leaderboard | `CitizenLeaderboard.jsx` | `CitizenPageLayout` |
| Citizen Pilot Enrollment | `CitizenPilotEnrollment.jsx` | `CitizenPageLayout` |
| Citizen Lab Participation | `CitizenLabParticipation.jsx` | `CitizenPageLayout` |

### Core Entity List Pages (7 pages - 100% Complete)

| Page | File | Layout |
|------|------|--------|
| Challenges | `Challenges.jsx` | `PageLayout` |
| Pilots | `Pilots.jsx` | `PageLayout` |
| Programs | `Programs.jsx` | `PageLayout` |
| R&D Projects | `RDProjects.jsx` | `PageLayout` |
| Knowledge | `Knowledge.jsx` | `PageLayout` |
| Solutions | `Solutions.jsx` | `PageLayout` |
| Living Labs | `LivingLabs.jsx` | `PageLayout` |

### Other Pages Using Layout (3 pages)

| Page | File | Layout |
|------|------|--------|
| Expert Registry | `ExpertRegistry.jsx` | `PageLayout` |
| My Bookmarks | `MyBookmarks.jsx` | `PageLayout` |
| My Applications | `MyApplications.jsx` | `PageLayout` |
| My Programs | `MyPrograms.jsx` | `PageLayout` |
| My Pilots | `MyPilots.jsx` | `PageLayout` |
| Municipal Proposal Inbox | `MunicipalProposalInbox.jsx` | `PageLayout` |
| Citizen Engagement Dashboard | `CitizenEngagementDashboard.jsx` | `PageLayout` |
| Provider Proposal Wizard | `ProviderProposalWizard.jsx` | `CitizenPageLayout` |
| Municipality Peer Matcher | `MunicipalityPeerMatcher.jsx` | `PageLayout` |
| Admin Portal | `AdminPortal.jsx` | `PageLayout` |

---

## ⏳ Pages NOT Using PersonaPageLayout (~538 pages)

### HIGH PRIORITY (~50 pages)

#### Detail Pages (Need PageLayout)
| Page | File | Priority |
|------|------|----------|
| Challenge Detail | `ChallengeDetail.jsx` | 🔴 High |
| Pilot Detail | `PilotDetail.jsx` | 🔴 High |
| Program Detail | `ProgramDetail.jsx` | 🔴 High |
| Solution Detail | `SolutionDetail.jsx` | 🔴 High |
| Living Lab Detail | `LivingLabDetail.jsx` | 🔴 High |
| R&D Project Detail | `RDProjectDetail.jsx` | 🔴 High |
| Organization Detail | `OrganizationDetail.jsx` | 🔴 High |
| Contract Detail | `ContractDetail.jsx` | 🔴 High |
| Budget Detail | `BudgetDetail.jsx` | 🔴 High |
| Expert Detail | `ExpertDetail.jsx` | 🔴 High |
| Policy Detail | `PolicyDetail.jsx` | 🔴 High |
| Idea Detail | `IdeaDetail.jsx` | 🔴 High |
| Event Detail | `EventDetail.jsx` | 🔴 High |
| Audit Detail | `AuditDetail.jsx` | 🔴 High |

#### Create/Edit Pages (Need PageLayout)
| Page | File | Priority |
|------|------|----------|
| Challenge Create | `ChallengeCreate.jsx` | 🔴 High |
| Challenge Edit | `ChallengeEdit.jsx` | 🔴 High |
| Pilot Create | `PilotCreate.jsx` | 🔴 High |
| Pilot Edit | `PilotEdit.jsx` | 🔴 High |
| Program Create | `ProgramCreate.jsx` | 🔴 High |
| Program Edit | `ProgramEdit.jsx` | 🔴 High |
| Solution Create | `SolutionCreate.jsx` | 🔴 High |
| Solution Edit | `SolutionEdit.jsx` | 🔴 High |
| Living Lab Create | `LivingLabCreate.jsx` | 🔴 High |
| Living Lab Edit | `LivingLabEdit.jsx` | 🔴 High |
| Organization Create | `OrganizationCreate.jsx` | 🔴 High |
| Organization Edit | `OrganizationEdit.jsx` | 🔴 High |
| Policy Create | `PolicyCreate.jsx` | 🔴 High |
| Policy Edit | `PolicyEdit.jsx` | 🔴 High |
| Municipality Create | `MunicipalityCreate.jsx` | 🔴 High |
| Municipality Edit | `MunicipalityEdit.jsx` | 🔴 High |

#### Management Pages (Need PageLayout)
| Page | File | Priority |
|------|------|----------|
| Contract Management | `ContractManagement.jsx` | 🔴 High |
| Budget Management | `BudgetManagement.jsx` | 🔴 High |
| User Management | `UserManagement.jsx` | 🔴 High |
| Organizations | `Organizations.jsx` | 🔴 High |
| Approval Center | `ApprovalCenter.jsx` | 🔴 High |
| Role Management | `RoleManagement.jsx` | 🔴 High |
| Audit Registry | `AuditRegistry.jsx` | 🔴 High |
| Invoice Management | `InvoiceManagement.jsx` | 🔴 High |
| Ideas Management | `IdeasManagement.jsx` | 🔴 High |
| Settings | `Settings.jsx` | 🔴 High |

#### Review/Approval Pages (Need PageLayout)
| Page | File | Priority |
|------|------|----------|
| Challenge Review Queue | `ChallengeReviewQueue.jsx` | 🔴 High |
| Application Review Hub | `ApplicationReviewHub.jsx` | 🔴 High |
| Idea Evaluation Queue | `IdeaEvaluationQueue.jsx` | 🔴 High |
| Expert Assignment Queue | `ExpertAssignmentQueue.jsx` | 🔴 High |
| Matching Queue | `MatchingQueue.jsx` | 🔴 High |
| Organization Verification Queue | `OrganizationVerificationQueue.jsx` | 🔴 High |

---

### MEDIUM PRIORITY (~100 pages)

#### My* Pages (User Personal Pages)
| Page | File |
|------|------|
| My Challenges | `MyChallenges.jsx` |
| My R&D Projects | `MyRDProjects.jsx` |
| My Performance | `MyPerformance.jsx` |
| My Deadlines | `MyDeadlines.jsx` |
| My Connections | `MyConnections.jsx` |
| My Following | `MyFollowing.jsx` |
| My Approvals | `MyApprovals.jsx` |
| My Delegation | `MyDelegation.jsx` |
| My Impact Dashboard | `MyImpactDashboard.jsx` |
| My Learning | `MyLearning.jsx` |
| My Partnerships | `MyPartnerships.jsx` |
| My Activity Timeline | `MyActivityTimeline.jsx` |
| My Workload Dashboard | `MyWorkloadDashboard.jsx` |
| My Profile Analytics | `MyProfileAnalytics.jsx` |
| My Profiles Hub | `MyProfilesHub.jsx` |
| My Evaluator Profile | `MyEvaluatorProfile.jsx` |
| My Municipality Staff Profile | `MyMunicipalityStaffProfile.jsx` |
| My Researcher Profile Editor | `MyResearcherProfileEditor.jsx` |
| My Startup Profile Editor | `MyStartupProfileEditor.jsx` |
| My Challenge Tracker | `MyChallengeTracker.jsx` |
| My Program Dashboard | `MyProgramDashboard.jsx` |

#### Analytics/Dashboard Pages
| Page | File |
|------|------|
| Challenge Analytics Dashboard | `ChallengeAnalyticsDashboard.jsx` |
| Pilot Monitoring Dashboard | `PilotMonitoringDashboard.jsx` |
| Evaluation Analytics Dashboard | `EvaluationAnalyticsDashboard.jsx` |
| Program Impact Dashboard | `ProgramImpactDashboard.jsx` |
| Program ROI Dashboard | `ProgramROIDashboard.jsx` |
| Expert Performance Dashboard | `ExpertPerformanceDashboard.jsx` |
| Data Quality Dashboard | `DataQualityDashboard.jsx` |
| Compliance Dashboard | `ComplianceDashboard.jsx` |
| IP Management Dashboard | `IPManagementDashboard.jsx` |
| Pipeline Health Dashboard | `PipelineHealthDashboard.jsx` |
| Predictive Forecasting Dashboard | `PredictiveForecastingDashboard.jsx` |
| Competitive Intelligence Dashboard | `CompetitiveIntelligenceDashboard.jsx` |
| Failure Analysis Dashboard | `FailureAnalysisDashboard.jsx` |
| Mid Year Review Dashboard | `MidYearReviewDashboard.jsx` |
| Institution R&D Dashboard | `InstitutionRDDashboard.jsx` |
| City Dashboard | `CityDashboard.jsx` |
| Mentor Dashboard | `MentorDashboard.jsx` |
| Participant Dashboard | `ParticipantDashboard.jsx` |
| Personalized Dashboard | `PersonalizedDashboard.jsx` |

#### Expert/Evaluation Pages
| Page | File |
|------|------|
| Expert Panel Management | `ExpertPanelManagement.jsx` |
| Expert Panel Detail | `ExpertPanelDetail.jsx` |
| Expert Matching Engine | `ExpertMatchingEngine.jsx` |
| Expert Evaluation Workflow | `ExpertEvaluationWorkflow.jsx` |
| Evaluation Panel | `EvaluationPanel.jsx` |
| Evaluation Rubric Builder | `EvaluationRubricBuilder.jsx` |
| Evaluation Template Manager | `EvaluationTemplateManager.jsx` |

#### Matching/Conversion Pages
| Page | File |
|------|------|
| Challenge Solution Matching | `ChallengeSolutionMatching.jsx` |
| Challenge RD Call Matcher | `ChallengeRDCallMatcher.jsx` |
| Program Challenge Matcher | `ProgramChallengeMatcher.jsx` |
| Pilot Scaling Matcher | `PilotScalingMatcher.jsx` |
| Living Lab Project Matcher | `LivingLabProjectMatcher.jsx` |
| Conversion Hub | `ConversionHub.jsx` |
| Conversion Funnel | `ConversionFunnel.jsx` |

#### Program/Pilot Operations
| Page | File |
|------|------|
| Program Operator Portal | `ProgramOperatorPortal.jsx` |
| Program Application Wizard | `ProgramApplicationWizard.jsx` |
| Program Application Detail | `ProgramApplicationDetail.jsx` |
| Program Cohort Management | `ProgramCohortManagement.jsx` |
| Program Launch Wizard | `ProgramLaunchWizard.jsx` |
| Program Portfolio Planner | `ProgramPortfolioPlanner.jsx` |
| Pilot Launch Wizard | `PilotLaunchWizard.jsx` |
| Pilot Management Panel | `PilotManagementPanel.jsx` |
| Pilot Evaluations | `PilotEvaluations.jsx` |
| Pilot Gates Overview | `PilotGatesOverview.jsx` |
| Pilot Success Patterns | `PilotSuccessPatterns.jsx` |
| Pilot Workflow Guide | `PilotWorkflowGuide.jsx` |

#### R&D Pages
| Page | File |
|------|------|
| R&D Project Detail | `RDProjectDetail.jsx` |
| R&D Project Create | `RDProjectCreate.jsx` |
| R&D Project Edit | `RDProjectEdit.jsx` |
| R&D Call Create | `RDCallCreate.jsx` |
| R&D Call Detail | `RDCallDetail.jsx` |
| R&D Proposal Create | `RDProposalCreate.jsx` |
| R&D Proposal Detail | `RDProposalDetail.jsx` |
| R&D Proposal Edit | `RDProposalEdit.jsx` |

#### Partnership/Collaboration Pages
| Page | File |
|------|------|
| Partnership Registry | `PartnershipRegistry.jsx` |
| Partnership Network | `PartnershipNetwork.jsx` |
| Partnership Performance | `PartnershipPerformance.jsx` |
| Partnership MOU Tracker | `PartnershipMOUTracker.jsx` |
| Collaboration Hub | `CollaborationHub.jsx` |
| Collaborative Pilots | `CollaborativePilots.jsx` |

---

### LOW PRIORITY (~350+ pages)

#### Coverage Report Pages (~80 files)
These are internal development/audit tools:
- `*CoverageReport.jsx` files
- `*Audit.jsx` files
- `*Assessment.jsx` files

#### Configuration/Settings Pages
| Page | File |
|------|------|
| Branding Settings | `BrandingSettings.jsx` |
| Notification Preferences | `NotificationPreferences.jsx` |
| Data Retention Config | `DataRetentionConfig.jsx` |
| Conditional Access Rules | `ConditionalAccessRules.jsx` |
| Feature Flags Dashboard | `FeatureFlagsDashboard.jsx` |

#### Onboarding/Wizard Pages
| Page | File |
|------|------|
| Onboarding | `Onboarding.jsx` |
| Getting Started | `GettingStarted.jsx` |
| Citizen Onboarding | `CitizenOnboarding.jsx` |
| Expert Onboarding | `ExpertOnboarding.jsx` |
| Deputyship Onboarding | `DeputyshipOnboarding.jsx` |
| Municipality Staff Onboarding | `MunicipalityStaffOnboarding.jsx` |

#### Public Pages (No Auth - N/A)
| Page | File |
|------|------|
| Home | `Home.jsx` |
| About | `public/About.jsx` |
| Contact | `public/Contact.jsx` |
| FAQ | `public/FAQ.jsx` |
| Privacy | `public/Privacy.jsx` |
| Terms | `public/Terms.jsx` |
| Public Challenges | `public/PublicChallenges.jsx` |
| Public Solutions | `public/PublicSolutions.jsx` |
| For Municipalities | `public/ForMunicipalities.jsx` |
| For Providers | `public/ForProviders.jsx` |
| For Researchers | `public/ForResearchers.jsx` |
| For Innovators | `public/ForInnovators.jsx` |

#### Auth Pages (No Sidebar - N/A)
| Page | File |
|------|------|
| Auth | `Auth.jsx` |
| Reset Password | `ResetPassword.jsx` |
| Unauthorized | `Unauthorized.jsx` |
| Not Found | `NotFound.jsx` |

---

## Widget & Filter Components

### Components Needing Persona Integration

| Component | Location | Status |
|-----------|----------|--------|
| DashboardSharing | `src/components/dashboard/` | ⚠️ Review needed |
| WidgetLibrary | `src/components/dashboard/` | ⚠️ Review needed |
| AdvancedFilters | `src/components/search/` | ⚠️ Review needed |
| AdvancedSearchPanel | `src/components/search/` | ⚠️ Review needed |
| SearchAnalytics | `src/components/search/` | ⚠️ Review needed |
| PersonaDashboardWidget | `src/components/` | ✅ Already persona-aware |

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

## Recommendations

### Phase 1 - HIGH PRIORITY (50 pages)
1. Detail pages (14 pages) - Most user-facing
2. Create/Edit pages (16 pages) - Critical workflows  
3. Management pages (10 pages) - Admin functionality
4. Review/Approval pages (6 pages) - Workflow pages

### Phase 2 - MEDIUM PRIORITY (100 pages)
1. My* pages (21 pages) - Personal dashboards
2. Analytics dashboards (19 pages) - Data views
3. Expert/Evaluation pages (7 pages)
4. Program/Pilot operations (12 pages)
5. Partnership pages (6 pages)

### Phase 3 - LOW PRIORITY (350+ pages)
1. Coverage reports (internal tools)
2. Configuration pages
3. Audit/assessment pages

### NOT APPLICABLE
- Public pages (no auth required)
- Auth pages (no sidebar)
- Onboarding wizards (special flow)

---

## Changelog

| Date | Change |
|------|--------|
| Dec 2024 | Initial documentation created |
| Dec 2024 | All 11 dashboards using PersonaPageLayout |
| Dec 2024 | All 8 citizen pages complete |
| Dec 2024 | 7 core entity list pages updated |
| Dec 2024 | **Complete audit**: 29/567 pages (5.1%) using layout |
| Dec 2024 | Identified 50 high-priority, 100 medium-priority pages |
