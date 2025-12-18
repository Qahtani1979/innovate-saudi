# Orphan Files Inventory

> **Version:** 3.0  
> **Last Updated:** 2025-12-18  
> **Purpose:** Track files not yet assigned to any system inventory

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← Approvals](../approvals/approvals-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Shared →](../shared/shared-system-inventory.md) |

---

## 📄 Ghost Pages (Pages in pages.config.js but not in any inventory)

### Public Pages → Move to Shared System
**Location:** `src/pages/public/` or `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| About | `About.jsx` | Shared |
| Contact | `Contact.jsx` | Shared |
| FAQ | `FAQ.jsx` | Shared |
| For Innovators | `ForInnovators.jsx` | Shared |
| For Municipalities | `ForMunicipalities.jsx` | Shared |
| For Providers | `ForProviders.jsx` | Shared |
| For Researchers | `ForResearchers.jsx` | Shared |
| Privacy | `Privacy.jsx` | Shared |
| Terms | `Terms.jsx` | Shared |
| Public Portal | `PublicPortal.jsx` | Shared |
| Public Ideas Board | `PublicIdeasBoard.jsx` | Citizens |
| Public Challenges | `PublicChallenges.jsx` | Challenges |
| Public Solutions | `PublicSolutionsMarketplace.jsx` | Solutions |
| Public Programs Directory | `PublicProgramsDirectory.jsx` | Programs |
| Public Geographic Map | `PublicGeographicMap.jsx` | Municipalities |
| Public Pilot Tracker | `PublicPilotTracker.jsx` | Pilots |
| Public Pilot Detail | `PublicPilotDetail.jsx` | Pilots |
| Public Pilot Feedback Form | `PublicPilotFeedbackForm.jsx` | Pilots |
| Public Idea Submission | `PublicIdeaSubmission.jsx` | Citizens |

### Onboarding Pages → Move to Citizens System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Onboarding | `Onboarding.jsx` | Citizens |
| Citizen Onboarding | `CitizenOnboarding.jsx` | Citizens |
| Municipality Staff Onboarding | `MunicipalityStaffOnboarding.jsx` | Municipalities |
| Startup Onboarding | `StartupOnboarding.jsx` | Startups & Academia |
| Researcher Onboarding | `ResearcherOnboarding.jsx` | Startups & Academia |
| Expert Onboarding | `ExpertOnboarding.jsx` | Matchmaker |
| Deputyship Onboarding | `DeputyshipOnboarding.jsx` | Admin |
| Getting Started | `GettingStarted.jsx` | Shared |

### Expert/Matchmaker Pages → Move to Matchmaker System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Browse Experts | `BrowseExperts.jsx` | Matchmaker |
| Expert Detail | `ExpertDetail.jsx` | Matchmaker |
| Expert Profile Edit | `ExpertProfileEdit.jsx` | Matchmaker |
| Expert Registry | `ExpertRegistry.jsx` | Matchmaker |
| Expert Dashboard | `ExpertDashboard.jsx` | Matchmaker |
| Expert Assignment Queue | `ExpertAssignmentQueue.jsx` | Matchmaker |
| Expert Matching Engine | `ExpertMatchingEngine.jsx` | Matchmaker |
| Expert Performance Dashboard | `ExpertPerformanceDashboard.jsx` | Matchmaker |
| Expert Panel Management | `ExpertPanelManagement.jsx` | Matchmaker |
| Expert Panel Detail | `ExpertPanelDetail.jsx` | Matchmaker |
| Expert Evaluation Workflow | `ExpertEvaluationWorkflow.jsx` | Matchmaker |
| Expert System Cluster Audit | `ExpertSystemClusterAudit.jsx` | Matchmaker |
| Expert Coverage Report | `ExpertCoverageReport.jsx` | Matchmaker |
| Expert Gaps Summary | `ExpertGapsSummary.jsx` | Matchmaker |
| My Evaluator Profile | `MyEvaluatorProfile.jsx` | Matchmaker |

### Financial/Contract Pages → Move to Admin System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Budget Management | `BudgetManagement.jsx` | Admin |
| Budget Detail | `BudgetDetail.jsx` | Admin |
| Budget Variance Report | `BudgetVarianceReport.jsx` | Admin |
| Contract Management | `ContractManagement.jsx` | Admin |
| Contract Detail | `ContractDetail.jsx` | Admin |
| Contract Approval | `ContractApproval.jsx` | Admin |
| Invoice Management | `InvoiceManagement.jsx` | Admin |
| Invoice Approval | `InvoiceApproval.jsx` | Admin |
| Vendor Registry | `VendorRegistry.jsx` | Admin |
| Vendor Performance | `VendorPerformance.jsx` | Admin |
| Vendor Approval | `VendorApproval.jsx` | Admin |
| Risk Register | `RiskRegister.jsx` | Admin |
| Risk Dashboard | `RiskDashboard.jsx` | Admin |
| Risk Heatmap | `RiskHeatmap.jsx` | Admin |

### Analytics & Reporting Pages → Move to Portfolio System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| GanttView | `GanttView.jsx` | Portfolio |
| My Impact Dashboard | `MyImpactDashboard.jsx` | Portfolio |
| My Performance | `MyPerformance.jsx` | Portfolio |
| My Workload Dashboard | `MyWorkloadDashboard.jsx` | Portfolio |
| Reports Builder | `ReportsBuilder.jsx` | Portfolio |
| Custom Report Builder | `CustomReportBuilder.jsx` | Portfolio |
| Predictive Analytics | `PredictiveAnalytics.jsx` | Portfolio |
| Predictive Insights | `PredictiveInsights.jsx` | Portfolio |
| Predictive Forecasting Dashboard | `PredictiveForecastingDashboard.jsx` | Portfolio |
| Velocity Analytics | `VelocityAnalytics.jsx` | Portfolio |
| Real Time Intelligence | `RealTimeIntelligence.jsx` | Portfolio |
| Pipeline Health Dashboard | `PipelineHealthDashboard.jsx` | Portfolio |
| Pipeline Benchmarking | `PipelineBenchmarking.jsx` | Portfolio |
| Pipeline Dependency Manager | `PipelineDependencyManager.jsx` | Portfolio |
| Pipeline Portfolio Optimizer | `PipelinePortfolioOptimizer.jsx` | Portfolio |
| Failure Analysis Dashboard | `FailureAnalysisDashboard.jsx` | Portfolio |
| Pattern Recognition | `PatternRecognition.jsx` | Portfolio |
| ROI Calculator | `ROICalculator.jsx` | Portfolio |

### R&D Pages → Move to R&D System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| My RD Projects | `MyRDProjects.jsx` | R&D |
| RD Progress Tracker | `RDProgressTracker.jsx` | R&D |
| RD Portfolio Control Dashboard | `RDPortfolioControlDashboard.jsx` | R&D |
| RD Portfolio Planner | `RDPortfolioPlanner.jsx` | R&D |
| Institution RD Dashboard | `InstitutionRDDashboard.jsx` | R&D |
| IP Management Dashboard | `IPManagementDashboard.jsx` | R&D |
| Research Outputs Hub | `ResearchOutputsHub.jsx` | R&D |
| Final RD Assessment | `FinalRDAssessment.jsx` | R&D |

### Researcher/Academia Pages → Move to Startups & Academia System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Researcher Dashboard | `ResearcherDashboard.jsx` | Startups & Academia |
| Researcher Network | `ResearcherNetwork.jsx` | Startups & Academia |
| Researcher Profile | `ResearcherProfile.jsx` | Startups & Academia |
| Researcher Workspace | `ResearcherWorkspace.jsx` | Startups & Academia |
| My Researcher Profile Editor | `MyResearcherProfileEditor.jsx` | Startups & Academia |
| Academia Dashboard | `AcademiaDashboard.jsx` | Startups & Academia |
| Academia Coverage Report | `AcademiaCoverageReport.jsx` | Startups & Academia |

### Provider/Startup Pages → Move to Startups & Academia System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Startup Dashboard | `StartupDashboard.jsx` | Startups & Academia |
| Startup Profile | `StartupProfile.jsx` | Startups & Academia |
| Startup Showcase | `StartupShowcase.jsx` | Startups & Academia |
| Startup Ecosystem Dashboard | `StartupEcosystemDashboard.jsx` | Startups & Academia |
| Startup Coverage Report | `StartupCoverageReport.jsx` | Startups & Academia |
| Startup Verification Queue | `StartupVerificationQueue.jsx` | Startups & Academia |
| Provider Portfolio Dashboard | `ProviderPortfolioDashboard.jsx` | Startups & Academia |
| Provider Proposal Wizard | `ProviderProposalWizard.jsx` | Startups & Academia |
| Provider Leaderboard | `ProviderLeaderboard.jsx` | Startups & Academia |
| Provider Notification Preferences | `ProviderNotificationPreferences.jsx` | Startups & Academia |

### Participant Pages → Move to Programs System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Participant Dashboard | `ParticipantDashboard.jsx` | Programs |
| Alumni Showcase | `AlumniShowcase.jsx` | Programs |
| Mentorship Hub | `MentorshipHub.jsx` | Programs |
| Mentor Dashboard | `MentorDashboard.jsx` | Programs |
| Mentee Progress | `MenteeProgress.jsx` | Programs |
| Programs Events Hub | `ProgramsEventsHub.jsx` | Programs |
| Programs Pipeline Intelligence | `ProgramsPipelineIntelligence.jsx` | Programs |
| Program Implementation Plan | `ProgramImplementationPlan.jsx` | Programs |
| Program Gaps Implementation Plan | `ProgramGapsImplementationPlan.jsx` | Programs |

### Event Pages → Move to Events System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Event Create | `EventCreate.jsx` | Events |
| Event Detail | `EventDetail.jsx` | Events |
| Event Edit | `EventEdit.jsx` | Events |
| Event Registration | `EventRegistration.jsx` | Events |
| Events Analytics Dashboard | `EventsAnalyticsDashboard.jsx` | Events |

### Solutions Pages → Move to Solutions System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Solution Comparison | `SolutionComparison.jsx` | Solutions |
| Solution Health Dashboard | `SolutionHealthDashboard.jsx` | Solutions |
| Solutions Implementation Progress | `SolutionsImplementationProgress.jsx` | Solutions |
| Solutions Implementation Plan | `SolutionsImplementationPlan.jsx` | Solutions |
| Solution Challenge Matcher | `SolutionChallengeMatcher.jsx` | Solutions |

### Living Lab Pages → Move to Sandboxes & Living Labs System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Living Lab Project Matcher | `LivingLabProjectMatcher.jsx` | Sandboxes & Living Labs |
| Living Labs Program Integration | `LivingLabsProgramIntegration.jsx` | Sandboxes & Living Labs |
| Citizen Living Labs Browser | `CitizenLivingLabsBrowser.jsx` | Sandboxes & Living Labs |
| Citizen Lab Participation | `CitizenLabParticipation.jsx` | Sandboxes & Living Labs |

### Sandbox Pages → Move to Sandboxes & Living Labs System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Sandbox Operator Portal | `SandboxOperatorPortal.jsx` | Sandboxes & Living Labs |
| Sandbox Participant Dashboard | `SandboxParticipantDashboard.jsx` | Sandboxes & Living Labs |
| Sandbox Lab Capacity Planner | `SandboxLabCapacityPlanner.jsx` | Sandboxes & Living Labs |

### Geography/Municipal Pages → Move to Municipalities System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Region Management | `RegionManagement.jsx` | Municipalities |
| Regional Dashboard | `RegionalDashboard.jsx` | Municipalities |
| Regional Analytics Dashboard | `RegionalAnalyticsDashboard.jsx` | Municipalities |
| City Dashboard | `CityDashboard.jsx` | Municipalities |
| National Map | `NationalMap.jsx` | Municipalities |
| National Innovation Map | `NationalInnovationMap.jsx` | Municipalities |
| Multi City Orchestration | `MultiCityOrchestration.jsx` | Municipalities |
| Multi City Coordination | `MultiCityCoordination.jsx` | Municipalities |
| Cross City Learning Hub | `CrossCityLearningHub.jsx` | Municipalities |
| Municipal Proposal Inbox | `MunicipalProposalInbox.jsx` | Municipalities |

### Partnership Pages → Move to Partnerships System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| My Partnerships | `MyPartnerships.jsx` | Partnerships |
| My Partnerships Page | `MyPartnershipsPage.jsx` | Partnerships |
| Partnership Performance | `PartnershipPerformance.jsx` | Partnerships |
| Partnership Network | `PartnershipNetwork.jsx` | Partnerships |

### Scaling Pages → Move to Scaling System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Scaling Plan Detail | `ScalingPlanDetail.jsx` | Scaling |

### Approval Pages → Move to Approvals System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| My Approvals | `MyApprovals.jsx` | Approvals |
| Executive Approvals | `ExecutiveApprovals.jsx` | Approvals |
| Application Review Hub | `ApplicationReviewHub.jsx` | Approvals |

### Network/Connection Pages → Move to Citizens System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Network | `Network.jsx` | Citizens |
| Network Intelligence | `NetworkIntelligence.jsx` | Citizens |
| Network Tab Analysis | `NetworkTabAnalysis.jsx` | Citizens |
| My Connections | `MyConnections.jsx` | Citizens |
| My Following | `MyFollowing.jsx` | Citizens |
| Followers List | `FollowersList.jsx` | Citizens |
| Connection Requests | `ConnectionRequests.jsx` | Citizens |
| AI Recommended Connections | `AIRecommendedConnections.jsx` | Citizens |

### Personal Dashboard Pages → Move to Citizens System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Personalized Dashboard | `PersonalizedDashboard.jsx` | Citizens |
| My Bookmarks | `MyBookmarks.jsx` | Citizens |
| My Deadlines | `MyDeadlines.jsx` | Citizens |
| My Applications | `MyApplications.jsx` | Citizens |
| My Learning | `MyLearning.jsx` | Citizens |
| Notification Center | `NotificationCenter.jsx` | Citizens |
| Notification Preferences | `NotificationPreferences.jsx` | Citizens |
| Calendar View | `CalendarView.jsx` | Citizens |
| Task Management | `TaskManagement.jsx` | Citizens |
| Opportunity Feed | `OpportunityFeed.jsx` | Citizens |

### Policy Pages → Move to Knowledge System
**Location:** `src/pages/`

| Page | File | Suggested System |
|------|------|------------------|
| Policy Hub | `PolicyHub.jsx` | Knowledge |
| Policy Library | `PolicyLibrary.jsx` | Knowledge |
| Policy Create | `PolicyCreate.jsx` | Knowledge |
| Policy Detail | `PolicyDetail.jsx` | Knowledge |
| Policy Edit | `PolicyEdit.jsx` | Knowledge |
| Policy Template Manager | `PolicyTemplateManager.jsx` | Knowledge |
| Regulatory Library | `RegulatoryLibrary.jsx` | Knowledge |
| Regulatory Exemption Detail | `RegulatoryExemptionDetail.jsx` | Knowledge |

---

## 🧩 Orphan Components

### Root-Level Components Needing Assignment
**Location:** `src/components/`

| Component | Suggested System |
|-----------|------------------|
| AIAssistant.jsx | Admin |
| AICapacityPredictor.jsx | Portfolio |
| AIExemptionSuggester.jsx | Approvals |
| AIFormAssistant.jsx | Admin |
| AIPeerComparison.jsx | Portfolio |
| AIPerformanceMonitor.jsx | Admin |
| AISafetyProtocolGenerator.jsx | Sandboxes |
| AISuccessPredictor.jsx | Portfolio |
| ActivityFeed.jsx | Citizens |
| AnomalyDetector.jsx | Portfolio |
| ApprovalStageProgress.jsx | Approvals |
| AutoNotification.jsx | Communications |
| AutomatedComplianceChecker.jsx | Admin |
| BudgetApprovalWorkflow.jsx | Strategy |
| BulkActions.jsx | Admin |

---

## 📊 Coverage Summary

| Category | Assigned | Orphaned | Total |
|----------|----------|----------|-------|
| Pages | ~380 | ~200 | ~580 |
| Components | ~420 | ~100 | ~520 |
| Hooks | ~100 | ~30 | ~130 |

---

## 🔄 Action Required

1. **High Priority**: Move public pages to Shared system
2. **High Priority**: Move onboarding pages to respective systems
3. **Medium Priority**: Move expert/matchmaker pages
4. **Medium Priority**: Move financial/contract pages to Admin
5. **Low Priority**: Move remaining analytics pages to Portfolio

---

## ⚠️ Known Gaps

### Role Request Integration Gap
The `MyProfilesHub` has a disabled "Request Access" button that does NOT connect to `RoleRequestCenter`. This needs to be fixed to enable users to request roles for inactive profile types.

**Current State:**
- `MyProfilesHub.jsx` shows "Request Access" button (disabled)
- `RoleRequestCenter.jsx` exists and is functional for role requests
- These two systems are not connected

**Required Fix:**
- Enable the "Request Access" button
- Link it to RoleRequestCenter or open RoleRequestDialog with the specific role
