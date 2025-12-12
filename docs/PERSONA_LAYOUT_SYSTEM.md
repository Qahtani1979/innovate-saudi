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

| Component | Path | Status |
|-----------|------|--------|
| Layout.jsx | `src/components/Layout.jsx` | ✅ Complete |
| PersonaSidebar.jsx | `src/components/layout/PersonaSidebar.jsx` | ✅ Complete |
| PersonaPageLayout.jsx | `src/components/layout/PersonaPageLayout.jsx` | ✅ Complete |
| CitizenPageLayout.jsx | `src/components/citizen/CitizenPageLayout.jsx` | ✅ Complete |
| PersonaHeader.jsx | `src/components/layout/PersonaHeader.jsx` | ✅ Complete |

---

## Hooks

| Hook | Path | Status |
|------|------|--------|
| usePersonaRouting | `src/hooks/usePersonaRouting.js` | ✅ Complete |
| usePermissions | `src/components/permissions/usePermissions.jsx` | ✅ Complete |
| useVisibilitySystem | `src/hooks/visibility/useVisibilitySystem.js` | ✅ Complete |

---

## Persona-by-Persona Status

### Summary Statistics

| Category | Using Layout | Total Pages | Coverage |
|----------|-------------|-------------|----------|
| **All Pages** | 39 | ~567 | 6.9% |
| **Dashboards** | 7 | 11 | 64% |
| **Citizen Pages** | 8 | 8 | 100% ✅ |
| **Municipality Pages** | 14 | 14 | 100% ✅ |
| **Core Entity Lists** | 7 | 7 | 100% ✅ |

---

## 1. ADMIN Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'admin'
- `defaultDashboard`: '/home'
- `portalType`: 'admin'
- `onboardingWizard`: null

**Dashboard Page:**
| Page | File | Has PageLayout |
|------|------|----------------|
| Admin Portal | `AdminPortal.jsx` | ✅ Yes |

**Related Pages (NOT using PageLayout):**
| Page | File | Status |
|------|------|--------|
| User Management | `UserManagement.jsx` | ❌ Missing |
| Role Management | `RoleManagement.jsx` | ❌ Missing |
| Audit Registry | `AuditRegistry.jsx` | ❌ Missing |
| Audit Trail | `AuditTrail.jsx` | ❌ Missing |
| Data Management Hub | `DataManagementHub.jsx` | ❌ Missing |
| Integration Manager | `IntegrationManager.jsx` | ❌ Missing |
| Settings | `Settings.jsx` | ❌ Missing |
| Backup Recovery Manager | `BackupRecoveryManager.jsx` | ❌ Missing |
| Error Logs Console | `ErrorLogsConsole.jsx` | ❌ Missing |
| Feature Flags Dashboard | `FeatureFlagsDashboard.jsx` | ❌ Missing |
| Email Template Manager | `EmailTemplateManager.jsx` | ❌ Missing |

---

## 2. EXECUTIVE Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'executive'
- `defaultDashboard`: '/executive-dashboard'
- `portalType`: 'executive'
- `onboardingWizard`: 'DeputyshipOnboarding'

**Dashboard Page:**
| Page | File | Has PageLayout |
|------|------|----------------|
| Executive Dashboard | `ExecutiveDashboard.jsx` | ✅ Yes |

**Related Pages (NOT using PageLayout):**
| Page | File | Status |
|------|------|--------|
| Executive Approvals | `ExecutiveApprovals.jsx` | ❌ Missing |
| Executive Brief Generator | `ExecutiveBriefGenerator.jsx` | ❌ Missing |
| Executive Strategic Challenge Queue | `ExecutiveStrategicChallengeQueue.jsx` | ❌ Missing |
| Command Center | `CommandCenter.jsx` | ❌ Missing |
| National Innovation Map | `NationalInnovationMap.jsx` | ❌ Missing |
| National Map | `NationalMap.jsx` | ❌ Missing |
| Strategic Plan Builder | (if exists) | ❌ Missing |

---

## 3. DEPUTYSHIP Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'deputyship'
- `defaultDashboard`: '/executive-dashboard' (shares with Executive)
- `portalType`: 'deputyship'
- `onboardingWizard`: 'DeputyshipOnboarding'

**Dashboard Page:**
| Page | File | Has PageLayout |
|------|------|----------------|
| No dedicated dashboard | Uses ExecutiveDashboard | N/A |

**Related Pages (NOT using PageLayout):**
| Page | File | Status |
|------|------|--------|
| Deputyship Onboarding | `DeputyshipOnboarding.jsx` | ❌ Missing (wizard) |
| Policy Hub | `PolicyHub.jsx` | ❌ Missing |
| Policy Library | `PolicyLibrary.jsx` | ❌ Missing |
| Policy Create | `PolicyCreate.jsx` | ❌ Missing |
| Policy Edit | `PolicyEdit.jsx` | ❌ Missing |
| Policy Detail | `PolicyDetail.jsx` | ❌ Missing |
| Multi City Coordination | `MultiCityCoordination.jsx` | ❌ Missing |
| Multi City Orchestration | `MultiCityOrchestration.jsx` | ❌ Missing |

---

## 4. MUNICIPALITY Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'municipality'
- `defaultDashboard`: '/municipality-dashboard'
- `portalType`: 'municipality'
- `onboardingWizard`: 'MunicipalityStaffOnboarding'

**Dashboard Page:**
| Page | File | Has PageLayout |
|------|------|----------------|
| Municipality Dashboard | `MunicipalityDashboard.jsx` | ✅ Yes |

**Related Pages Using PageLayout:**
| Page | File | Status |
|------|------|--------|
| Municipal Proposal Inbox | `MunicipalProposalInbox.jsx` | ✅ Yes |
| Municipality Peer Matcher | `MunicipalityPeerMatcher.jsx` | ✅ Yes |
| Municipality Ideas View | `MunicipalityIdeasView.jsx` | ✅ Yes |
| Municipality Profile | `MunicipalityProfile.jsx` | ✅ Yes |
| Municipality Create | `MunicipalityCreate.jsx` | ✅ Yes |
| Municipality Edit | `MunicipalityEdit.jsx` | ✅ Yes |
| City Management | `CityManagement.jsx` | ✅ Yes |
| City Dashboard | `CityDashboard.jsx` | ✅ Yes |
| MII | `MII.jsx` | ✅ Yes |
| MII Drill Down | `MIIDrillDown.jsx` | ✅ Yes |
| Cross City Learning Hub | `CrossCityLearningHub.jsx` | ✅ Yes |
| Multi City Coordination | `MultiCityCoordination.jsx` | ✅ Yes |
| Multi City Orchestration | `MultiCityOrchestration.jsx` | ✅ Yes |

**Excluded (wizard/special):**
| Page | File | Reason |
|------|------|--------|
| Municipality Staff Onboarding | `MunicipalityStaffOnboarding.jsx` | Onboarding wizard - custom UX |

---

## 5. PROVIDER/STARTUP Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'provider'
- `defaultDashboard`: '/startup-dashboard'
- `portalType`: 'provider'
- `onboardingWizard`: 'StartupOnboarding'

**Dashboard Page:**
| Page | File | Has PageLayout |
|------|------|----------------|
| Startup Dashboard | `StartupDashboard.jsx` | ✅ Yes |

**Related Pages Using PageLayout:**
| Page | File | Status |
|------|------|--------|
| Provider Proposal Wizard | `ProviderProposalWizard.jsx` | ✅ Yes (CitizenPageLayout) |

**Related Pages (NOT using PageLayout):**
| Page | File | Status |
|------|------|--------|
| Solution Create | `SolutionCreate.jsx` | ❌ Missing |
| Solution Edit | `SolutionEdit.jsx` | ❌ Missing |
| Solution Detail | `SolutionDetail.jsx` | ❌ Missing |
| Browse Startups | `BrowseStartups.jsx` | ❌ Missing |
| Startup Onboarding | `StartupOnboarding.jsx` | ❌ Missing (wizard) |
| Matchmaker Journey | `MatchmakerJourney.jsx` | ❌ Missing |
| Matchmaker Applications | `MatchmakerApplications.jsx` | ❌ Missing |
| Matchmaker Application Create | `MatchmakerApplicationCreate.jsx` | ❌ Missing |
| Matchmaker Application Detail | `MatchmakerApplicationDetail.jsx` | ❌ Missing |
| Opportunity Feed | `OpportunityFeed.jsx` | ❌ Missing |
| My Startup Profile Editor | `MyStartupProfileEditor.jsx` | ❌ Missing |

---

## 6. EXPERT Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'expert'
- `defaultDashboard`: '/expert-dashboard'
- `portalType`: 'expert'
- `onboardingWizard`: 'ExpertOnboarding'

**Dashboard Page:**
| Page | File | Has PageLayout |
|------|------|----------------|
| Expert Dashboard | `ExpertDashboard.jsx` | ✅ Yes |

**Related Pages Using PageLayout:**
| Page | File | Status |
|------|------|--------|
| Expert Registry | `ExpertRegistry.jsx` | ✅ Yes |

**Related Pages (NOT using PageLayout):**
| Page | File | Status |
|------|------|--------|
| Expert Detail | `ExpertDetail.jsx` | ❌ Missing |
| Expert Profile Edit | `ExpertProfileEdit.jsx` | ❌ Missing |
| Expert Panel Management | `ExpertPanelManagement.jsx` | ❌ Missing |
| Expert Panel Detail | `ExpertPanelDetail.jsx` | ❌ Missing |
| Expert Assignment Queue | `ExpertAssignmentQueue.jsx` | ❌ Missing |
| Expert Evaluation Workflow | `ExpertEvaluationWorkflow.jsx` | ❌ Missing |
| Expert Matching Engine | `ExpertMatchingEngine.jsx` | ❌ Missing |
| Expert Performance Dashboard | `ExpertPerformanceDashboard.jsx` | ❌ Missing |
| Expert Onboarding | `ExpertOnboarding.jsx` | ❌ Missing (wizard) |
| Browse Experts | `BrowseExperts.jsx` | ❌ Missing |
| My Evaluator Profile | `MyEvaluatorProfile.jsx` | ❌ Missing |
| Evaluation Panel | `EvaluationPanel.jsx` | ❌ Missing |
| Evaluation Rubric Builder | `EvaluationRubricBuilder.jsx` | ❌ Missing |
| Evaluation Template Manager | `EvaluationTemplateManager.jsx` | ❌ Missing |
| Evaluation Analytics Dashboard | `EvaluationAnalyticsDashboard.jsx` | ❌ Missing |

---

## 7. RESEARCHER Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'researcher'
- `defaultDashboard`: '/researcher-dashboard'
- `portalType`: 'researcher'
- `onboardingWizard`: 'ResearcherOnboarding'

**Dashboard Page:**
| Page | File | Has PageLayout |
|------|------|----------------|
| Researcher Dashboard | `ResearcherDashboard.jsx` | ❌ **MISSING** |

**Related Pages (NOT using PageLayout):**
| Page | File | Status |
|------|------|--------|
| R&D Projects | `RDProjects.jsx` | ✅ Yes |
| R&D Project Create | `RDProjectCreate.jsx` | ❌ Missing |
| R&D Project Edit | `RDProjectEdit.jsx` | ❌ Missing |
| R&D Project Detail | `RDProjectDetail.jsx` | ❌ Missing |
| R&D Call Create | `RDCallCreate.jsx` | ❌ Missing |
| R&D Call Detail | `RDCallDetail.jsx` | ❌ Missing |
| R&D Proposal Create | `RDProposalCreate.jsx` | ❌ Missing |
| R&D Proposal Detail | `RDProposalDetail.jsx` | ❌ Missing |
| R&D Proposal Edit | `RDProposalEdit.jsx` | ❌ Missing |
| Institution R&D Dashboard | `InstitutionRDDashboard.jsx` | ❌ Missing |
| My Researcher Profile Editor | `MyResearcherProfileEditor.jsx` | ❌ Missing |
| My R&D Projects | `MyRDProjects.jsx` | ❌ Missing |
| Researcher Onboarding | `ResearcherOnboarding.jsx` | ❌ Missing (wizard) |

---

## 8. CITIZEN Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'citizen'
- `defaultDashboard`: '/citizen-dashboard'
- `portalType`: 'citizen'
- `onboardingWizard`: 'CitizenOnboarding'

**Dashboard Page:**
| Page | File | Has PageLayout |
|------|------|----------------|
| Citizen Dashboard | `CitizenDashboard.jsx` | ✅ Yes (CitizenPageLayout) |

**Related Pages Using PageLayout (8 pages - 100% Complete):**
| Page | File | Status |
|------|------|--------|
| Citizen Challenges Browser | `CitizenChallengesBrowser.jsx` | ✅ Yes |
| Citizen Solutions Browser | `CitizenSolutionsBrowser.jsx` | ✅ Yes |
| Citizen Living Labs Browser | `CitizenLivingLabsBrowser.jsx` | ✅ Yes |
| Citizen Idea Submission | `CitizenIdeaSubmission.jsx` | ✅ Yes |
| Citizen Leaderboard | `CitizenLeaderboard.jsx` | ✅ Yes |
| Citizen Pilot Enrollment | `CitizenPilotEnrollment.jsx` | ✅ Yes |
| Citizen Lab Participation | `CitizenLabParticipation.jsx` | ✅ Yes |
| Citizen Engagement Dashboard | `CitizenEngagementDashboard.jsx` | ✅ Yes |

**Related Pages (NOT using PageLayout):**
| Page | File | Status |
|------|------|--------|
| Citizen Onboarding | `CitizenOnboarding.jsx` | ❌ Missing (wizard) |
| Public Ideas Board | `PublicIdeasBoard.jsx` | ❌ Missing |
| Event Calendar | `EventCalendar.jsx` | ❌ Missing |
| Event Detail | `EventDetail.jsx` | ❌ Missing |
| Event Registration | `EventRegistration.jsx` | ❌ Missing |

---

## 9. VIEWER Persona

**Route Config (usePersonaRouting.js):**
- `persona`: 'viewer'
- `defaultDashboard`: '/viewer-dashboard'
- `portalType`: 'viewer'
- `onboardingWizard`: null

**Dashboard Page:**
| Page | File | Has PageLayout |
|------|------|----------------|
| Viewer Dashboard | `ViewerDashboard.jsx` | ❌ **MISSING** |

**Notes:** Viewer is a browse-only role. Limited related pages.

---

## 10. ACADEMIA Persona (Bonus)

**Dashboard Page:**
| Page | File | Has PageLayout |
|------|------|----------------|
| Academia Dashboard | `AcademiaDashboard.jsx` | ✅ Yes |

**Related Pages (NOT using PageLayout):**
| Page | File | Status |
|------|------|--------|
| Alumni Showcase | `AlumniShowcase.jsx` | ❌ Missing |
| Institution R&D Dashboard | `InstitutionRDDashboard.jsx` | ❌ Missing |

---

## Core Entity List Pages (Shared Across Personas)

All 7 core entity list pages have PageLayout ✅

| Page | File | Has PageLayout |
|------|------|----------------|
| Challenges | `Challenges.jsx` | ✅ Yes |
| Pilots | `Pilots.jsx` | ✅ Yes |
| Programs | `Programs.jsx` | ✅ Yes |
| R&D Projects | `RDProjects.jsx` | ✅ Yes |
| Knowledge | `Knowledge.jsx` | ✅ Yes |
| Solutions | `Solutions.jsx` | ✅ Yes |
| Living Labs | `LivingLabs.jsx` | ✅ Yes |

---

## Detail/Create/Edit Pages (Missing PageLayout)

### Challenge Entity
| Page | File | Status |
|------|------|--------|
| Challenge Detail | `ChallengeDetail.jsx` | ❌ Missing |
| Challenge Create | `ChallengeCreate.jsx` | ❌ Missing |
| Challenge Edit | `ChallengeEdit.jsx` | ❌ Missing |
| Challenge Import | `ChallengeImport.jsx` | ❌ Missing |
| Challenge Proposal Detail | `ChallengeProposalDetail.jsx` | ❌ Missing |
| Challenge Proposal Review | `ChallengeProposalReview.jsx` | ❌ Missing |
| Challenge Review Queue | `ChallengeReviewQueue.jsx` | ❌ Missing |
| Challenge Solution Matching | `ChallengeSolutionMatching.jsx` | ❌ Missing |
| Challenge Analytics Dashboard | `ChallengeAnalyticsDashboard.jsx` | ❌ Missing |
| Challenge Resolution Tracker | `ChallengeResolutionTracker.jsx` | ❌ Missing |
| Challenge Idea Response | `ChallengeIdeaResponse.jsx` | ❌ Missing |

### Pilot Entity
| Page | File | Status |
|------|------|--------|
| Pilot Detail | `PilotDetail.jsx` | ❌ Missing |
| Pilot Create | `PilotCreate.jsx` | ❌ Missing |
| Pilot Edit | `PilotEdit.jsx` | ❌ Missing |
| Pilot Launch Wizard | `PilotLaunchWizard.jsx` | ❌ Missing |
| Pilot Management Panel | `PilotManagementPanel.jsx` | ❌ Missing |
| Pilot Monitoring Dashboard | `PilotMonitoringDashboard.jsx` | ✅ Has PageLayout |
| Pilot Evaluations | `PilotEvaluations.jsx` | ❌ Missing |
| Pilot Gates Overview | `PilotGatesOverview.jsx` | ❌ Missing |
| Pilot Success Patterns | `PilotSuccessPatterns.jsx` | ❌ Missing |
| Pilot Scaling Matcher | `PilotScalingMatcher.jsx` | ❌ Missing |
| Pilot Workflow Guide | `PilotWorkflowGuide.jsx` | ❌ Missing |

### Program Entity
| Page | File | Status |
|------|------|--------|
| Program Detail | `ProgramDetail.jsx` | ❌ Missing |
| Program Create | `ProgramCreate.jsx` | ❌ Missing |
| Program Edit | `ProgramEdit.jsx` | ❌ Missing |
| Program Launch Wizard | `ProgramLaunchWizard.jsx` | ❌ Missing |
| Program Operator Portal | `ProgramOperatorPortal.jsx` | ❌ Missing |
| Program Application Wizard | `ProgramApplicationWizard.jsx` | ❌ Missing |
| Program Application Detail | `ProgramApplicationDetail.jsx` | ❌ Missing |
| Program Cohort Management | `ProgramCohortManagement.jsx` | ❌ Missing |
| Program Impact Dashboard | `ProgramImpactDashboard.jsx` | ❌ Missing |
| Program ROI Dashboard | `ProgramROIDashboard.jsx` | ❌ Missing |
| Program Portfolio Planner | `ProgramPortfolioPlanner.jsx` | ❌ Missing |

### Solution Entity
| Page | File | Status |
|------|------|--------|
| Solution Detail | `SolutionDetail.jsx` | ❌ Missing |
| Solution Create | `SolutionCreate.jsx` | ❌ Missing |
| Solution Edit | `SolutionEdit.jsx` | ❌ Missing |

### Living Lab Entity
| Page | File | Status |
|------|------|--------|
| Living Lab Detail | `LivingLabDetail.jsx` | ❌ Missing |
| Living Lab Create | `LivingLabCreate.jsx` | ❌ Missing |
| Living Lab Edit | `LivingLabEdit.jsx` | ❌ Missing |
| Living Lab Operator Portal | `LivingLabOperatorPortal.jsx` | ❌ Missing |
| Living Lab Project Matcher | `LivingLabProjectMatcher.jsx` | ❌ Missing |
| Living Labs Program Integration | `LivingLabsProgramIntegration.jsx` | ❌ Missing |

### Organization Entity
| Page | File | Status |
|------|------|--------|
| Organizations | `Organizations.jsx` | ❌ Missing |
| Organization Detail | `OrganizationDetail.jsx` | ❌ Missing |
| Organization Create | `OrganizationCreate.jsx` | ❌ Missing |
| Organization Edit | `OrganizationEdit.jsx` | ❌ Missing |
| Organization Verification Queue | `OrganizationVerificationQueue.jsx` | ❌ Missing |
| Organization Portfolio Analytics | `OrganizationPortfolioAnalytics.jsx` | ❌ Missing |

### Contract/Budget Entity
| Page | File | Status |
|------|------|--------|
| Contract Management | `ContractManagement.jsx` | ❌ Missing |
| Contract Detail | `ContractDetail.jsx` | ❌ Missing |
| Contract Approval | `ContractApproval.jsx` | ❌ Missing |
| Budget Management | `BudgetManagement.jsx` | ❌ Missing |
| Budget Detail | `BudgetDetail.jsx` | ❌ Missing |
| Budget Allocation Tool | `BudgetAllocationTool.jsx` | ❌ Missing |
| Invoice Management | `InvoiceManagement.jsx` | ❌ Missing |
| Invoice Approval | `InvoiceApproval.jsx` | ❌ Missing |

### Knowledge Entity
| Page | File | Status |
|------|------|--------|
| Knowledge Document Create | `KnowledgeDocumentCreate.jsx` | ❌ Missing |
| Knowledge Document Edit | `KnowledgeDocumentEdit.jsx` | ❌ Missing |
| Knowledge Graph | `KnowledgeGraph.jsx` | ❌ Missing |
| Lessons Learned Repository | `LessonsLearnedRepository.jsx` | ❌ Missing |
| Case Study Create | `CaseStudyCreate.jsx` | ❌ Missing |
| Case Study Edit | `CaseStudyEdit.jsx` | ❌ Missing |

---

## My* Pages (Personal/Profile)

| Page | File | Has PageLayout |
|------|------|----------------|
| My Applications | `MyApplications.jsx` | ✅ Yes |
| My Bookmarks | `MyBookmarks.jsx` | ✅ Yes |
| My Programs | `MyPrograms.jsx` | ✅ Yes |
| My Pilots | `MyPilots.jsx` | ✅ Yes |
| My Challenges | `MyChallenges.jsx` | ❌ Missing |
| My R&D Projects | `MyRDProjects.jsx` | ❌ Missing |
| My Performance | `MyPerformance.jsx` | ❌ Missing |
| My Deadlines | `MyDeadlines.jsx` | ❌ Missing |
| My Connections | `MyConnections.jsx` | ❌ Missing |
| My Following | `MyFollowing.jsx` | ❌ Missing |
| My Approvals | `MyApprovals.jsx` | ❌ Missing |
| My Delegation | `MyDelegation.jsx` | ❌ Missing |
| My Impact Dashboard | `MyImpactDashboard.jsx` | ❌ Missing |
| My Learning | `MyLearning.jsx` | ❌ Missing |
| My Partnerships | `MyPartnerships.jsx` | ❌ Missing |
| My Activity Timeline | `MyActivityTimeline.jsx` | ❌ Missing |
| My Workload Dashboard | `MyWorkloadDashboard.jsx` | ❌ Missing |
| My Profile Analytics | `MyProfileAnalytics.jsx` | ❌ Missing |
| My Profiles Hub | `MyProfilesHub.jsx` | ❌ Missing |
| My Evaluator Profile | `MyEvaluatorProfile.jsx` | ❌ Missing |
| My Municipality Staff Profile | `MyMunicipalityStaffProfile.jsx` | ❌ Missing |
| My Researcher Profile Editor | `MyResearcherProfileEditor.jsx` | ❌ Missing |
| My Startup Profile Editor | `MyStartupProfileEditor.jsx` | ❌ Missing |
| My Challenge Tracker | `MyChallengeTracker.jsx` | ❌ Missing |
| My Program Dashboard | `MyProgramDashboard.jsx` | ❌ Missing |

---

## Approval/Review Pages

| Page | File | Status |
|------|------|--------|
| Approval Center | `ApprovalCenter.jsx` | ❌ Missing |
| Approvals | `Approvals.jsx` | ❌ Missing |
| Application Review Hub | `ApplicationReviewHub.jsx` | ❌ Missing |
| Idea Evaluation Queue | `IdeaEvaluationQueue.jsx` | ❌ Missing |
| Matching Queue | `MatchingQueue.jsx` | ❌ Missing |

---

## Public Pages (No Layout Needed)

| Page | File | Notes |
|------|------|-------|
| Home | `Home.jsx` | Public landing |
| About | `public/About.jsx` | Public info |
| Contact | `public/Contact.jsx` | Public info |
| FAQ | `public/FAQ.jsx` | Public info |
| Privacy | `public/Privacy.jsx` | Legal |
| Terms | `public/Terms.jsx` | Legal |
| Public Challenges | `public/PublicChallenges.jsx` | Public browse |
| Public Solutions | `public/PublicSolutions.jsx` | Public browse |
| For Municipalities | `public/ForMunicipalities.jsx` | Marketing |
| For Providers | `public/ForProviders.jsx` | Marketing |
| For Researchers | `public/ForResearchers.jsx` | Marketing |
| For Innovators | `public/ForInnovators.jsx` | Marketing |

---

## Auth Pages (No Layout Needed)

| Page | File | Notes |
|------|------|-------|
| Auth | `Auth.jsx` | Login/Register |
| Reset Password | `ResetPassword.jsx` | Password reset |
| Unauthorized | `Unauthorized.jsx` | Error page |
| Not Found | `NotFound.jsx` | 404 page |

---

## Coverage Reports/Audit Pages (Low Priority - Internal Tools)

~80 files ending in `*CoverageReport.jsx`, `*Audit.jsx`, `*Assessment.jsx`

These are internal development/audit tools and have lowest priority.

---

## Summary by Priority

### CRITICAL (Dashboard Missing PageLayout)
| Dashboard | Persona | Status |
|-----------|---------|--------|
| ResearcherDashboard | researcher | ❌ MISSING |
| ViewerDashboard | viewer | ❌ MISSING |

### HIGH PRIORITY (50+ pages)
- Detail pages: ~20 pages
- Create/Edit pages: ~25 pages
- Management pages: ~10 pages

### MEDIUM PRIORITY (100+ pages)
- My* pages: ~25 pages
- Analytics dashboards: ~20 pages
- Approval/Review pages: ~10 pages
- Operator portals: ~10 pages

### LOW PRIORITY (350+ pages)
- Coverage reports
- Audit pages
- Configuration pages

---

## Recommendations

1. **IMMEDIATE**: Add PageLayout to ResearcherDashboard and ViewerDashboard
2. **Phase 1**: Detail/Create/Edit pages for core entities
3. **Phase 2**: My* pages and approval workflows
4. **Phase 3**: Analytics dashboards and operator portals
5. **Skip**: Coverage reports, audit pages (internal tools)

---

## Changelog

| Date | Change |
|------|--------|
| Dec 2024 | Initial documentation |
| Dec 2024 | Complete persona-by-persona audit |
| Dec 2024 | Identified 2 dashboards missing PageLayout |
| Dec 2024 | Documented 29/567 pages (5.1%) coverage |
