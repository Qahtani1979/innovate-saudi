# Solutions System Inventory

> **Version:** 2.0  
> **Last Updated:** 2026-01-03  
> **Total Assets:** 52 files (15 pages, 45 components, 12+ hooks)  
> **Parent System:** Solutions Marketplace  
> **Hub Page:** `/solutions`
> **Hooks Index:** `src/hooks/solutions/index.js`  
> **Components Location:** `src/components/solutions/`

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← R&D](../rd/rd-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Sandboxes & Living Labs →](../sandboxes-livinglabs/sandboxes-livinglabs-system-inventory.md) |

---

## Overview

The Solutions System manages the innovation solutions marketplace including solution registration, verification, matching, deployment tracking, and marketplace analytics.

---

## 📄 Pages (15)

### Core Solution Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Solutions** | `Solutions.jsx` | `/solutions` | `public` | Self (Root) |
| Solution Create | `SolutionCreate.jsx` | `/solution-create` | `solution_create` | Solutions |
| Solution Detail | `SolutionDetail.jsx` | `/solution-detail` | `public` | Solutions |
| Solution Edit | `SolutionEdit.jsx` | `/solution-edit` | `solution_edit` | Solution Detail |
| Solution Verification | `SolutionVerification.jsx` | `/solution-verification` | `solution_verify` | Solutions |

### Solution Matching Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Solution Challenge Matcher | `SolutionChallengeMatcher.jsx` | `/solution-challenge-matcher` | `solution_manage` | Solutions |
| Challenge Solution Matching | `ChallengeSolutionMatching.jsx` | `/challenge-solution-matching` | `challenge_manage` | Challenges |

### Marketplace Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Public Solutions Marketplace | `PublicSolutionsMarketplace.jsx` | `/public-solutions-marketplace` | `public` | Public |
| Citizen Solutions Browser | `CitizenSolutionsBrowser.jsx` | `/citizen-solutions-browser` | `public` | Citizen |

### Provider Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Provider Dashboard | `ProviderDashboard.jsx` | `/provider-dashboard` | `provider` | Provider |
| Provider Submission Portal | `ProviderSubmissionPortal.jsx` | `/provider-submission-portal` | `provider` | Provider |
| Provider Profile | `ProviderProfile.jsx` | `/provider-profile` | `provider` | Provider |

### Reports Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Solution Coverage Report | `SolutionCoverageReport.jsx` | `/solution-coverage-report` | `admin` | Admin |
| Solutions Coverage Report | `SolutionsCoverageReport.jsx` | `/solutions-coverage-report` | `admin` | Admin |

---

## 🧩 Components (37)

### Solution Marketplace Components
**Location:** `src/components/solutions/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `MarketplaceAnalytics.jsx` | Marketplace analytics | Analytics |
| `MarketIntelligenceFeed.jsx` | Market intelligence | Solutions |
| `RealTimeMarketIntelligence.jsx` | Real-time market data | Solutions |
| `SolutionMarketIntelligence.jsx` | Solution market intel | SolutionDetail |
| `DynamicPricingIntelligence.jsx` | Pricing intelligence | Solutions |
| `PriceComparisonTool.jsx` | Price comparison | Solutions |

### Solution Matching Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `AutomatedMatchingPipeline.jsx` | Automated matching | Matching |
| `SmartRecommendationEngine.jsx` | Smart recommendations | Solutions |
| `SolutionRecommendationEngine.jsx` | Solution recommendations | Challenges |
| `PilotReadinessChecker.jsx` | Pilot readiness | SolutionDetail |

### Solution Provider Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIPricingSuggester.jsx` | AI pricing suggestions | SolutionCreate |
| `AIProfileEnhancer.jsx` | AI profile enhancement | ProviderProfile |
| `ClientTestimonialsShowcase.jsx` | Testimonials | SolutionDetail |
| `ProviderCollaborationNetwork.jsx` | Provider network | Provider |
| `ProviderPerformanceDashboard.jsx` | Provider performance | Provider |
| `ProviderSolutionCard.jsx` | Solution card | Solutions |

### Solution Verification Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `ComplianceValidationAI.jsx` | Compliance validation | Verification |
| `SolutionReadinessGate.jsx` | Readiness gate | Verification |
| `DeploymentBadges.jsx` | Deployment badges | SolutionDetail |
| `DeploymentSuccessTracker.jsx` | Deployment tracking | SolutionDetail |
| `TRLAssessmentTool.jsx` | TRL assessment | SolutionDetail |

### Solution Analytics Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `CompetitiveAnalysisAI.jsx` | AI competitive analysis | Analytics |
| `CompetitiveAnalysisTab.jsx` | Competitive analysis tab | SolutionDetail |
| `CompetitiveAnalysisWidget.jsx` | Competitive widget | SolutionDetail |
| `SolutionSuccessPredictor.jsx` | Success prediction | SolutionDetail |

### Solution Workflow Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `ContractGeneratorWizard.jsx` | Contract generation | Solutions |
| `ContractTemplateLibrary.jsx` | Contract templates | Solutions |
| `SolutionActivityLog.jsx` | Activity log | SolutionDetail |
| `SolutionCreateWizard.jsx` | Creation wizard | SolutionCreate |
| `SolutionDeprecationWizard.jsx` | Deprecation wizard | SolutionDetail |
| `SolutionEvolutionTracker.jsx` | Evolution tracking | SolutionDetail |
| `SolutionVersionHistory.jsx` | Version history | SolutionDetail |
| `SolutionReviewsTab.jsx` | Reviews tab | SolutionDetail |

### Solution Integration Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `ExpressInterestButton.jsx` | Express interest | SolutionDetail |
| `RequestDemoButton.jsx` | Request demo | SolutionDetail |
| `SolutionRDCollaborationProposal.jsx` | R&D collaboration | SolutionDetail |
| `SolutionToPilotWorkflow.jsx` | To pilot workflow | SolutionDetail |

### Root-Level Solution Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `SolutionCaseStudyWizard.jsx` | Case study wizard |
| `SolutionDeploymentTracker.jsx` | Deployment tracking |
| `SolutionReviewCollector.jsx` | Review collection |
| `SolutionVerificationWizard.jsx` | Verification wizard |

---

## 🪝 Hooks (2)

**Location:** `src/hooks/`

| Hook | Description |
|------|-------------|
| `useSolutionsWithVisibility.js` | Solutions with visibility |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `solutions` | Core solution data |
| `solution_deployments` | Deployment records |
| `solution_reviews` | User reviews |
| `challenge_solution_matches` | Challenge matches |
| `providers` | Provider organizations |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `solution_view` | View solutions |
| `solution_create` | Create solutions |
| `solution_edit` | Edit solutions |
| `solution_manage` | Manage solutions |
| `solution_verify` | Verify solutions |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Challenges | Matches to challenges |
| Pilots | Tests in pilots |
| R&D | Research collaboration |
| Programs | Program outputs |
| Providers | Provider management |
| Municipalities | Deployment tracking |
