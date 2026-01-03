# Startups & Academia System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 35 files (10 pages, 20 components, 3 hooks)  
> **Parent System:** Ecosystem Personas  
> **Hub Pages:** `/startup-dashboard`, `/academia-dashboard`

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← Knowledge](../knowledge/knowledge-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Portfolio & Analytics →](../portfolio/portfolio-analytics-system-inventory.md) |

---

## Overview

The Startups & Academia System manages specialized dashboards and features for startup and academic institution personas in the innovation ecosystem.

---

## 📄 Startup Pages (5)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Startup Dashboard** | `StartupDashboard.jsx` | `/startup-dashboard` | `startup_view` | Self (Root) |
| Startup Profile | `StartupProfile.jsx` | `/startup-profile` | `startup_view` | Startup Dashboard |
| Startup Coverage Report | `StartupCoverageReport.jsx` | `/startup-coverage-report` | `admin` | Admin |

## 📄 Academia Pages (5)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Academia Dashboard** | `AcademiaDashboard.jsx` | `/academia-dashboard` | `academia_view` | Self (Root) |
| Researcher Profile | `ResearcherProfile.jsx` | `/researcher-profile` | `academia_view` | Academia Dashboard |
| My Researcher Profile Editor | `MyResearcherProfileEditor.jsx` | `/my-researcher-profile-editor` | `authenticated` | Academia Dashboard |
| Researcher Network | `ResearcherNetwork.jsx` | `/researcher-network` | `academia_view` | Academia Dashboard |
| Research Outputs Hub | `ResearchOutputsHub.jsx` | `/research-outputs-hub` | `academia_view` | Academia Dashboard |
| Institution RD Dashboard | `InstitutionRDDashboard.jsx` | `/institution-rd-dashboard` | `academia_view` | Academia Dashboard |
| Academia Coverage Report | `AcademiaCoverageReport.jsx` | `/academia-coverage-report` | `admin` | Admin |

---

## 🧩 Startup Components (13)

**Location:** `src/components/startup/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `ContractPipelineTracker.jsx` | Contract pipeline | Startups |
| `EcosystemContributionScore.jsx` | Contribution scoring | Startups |
| `MultiCityOperationsManager.jsx` | Multi-city operations | Startups |
| `MultiMunicipalityExpansionTracker.jsx` | Expansion tracking | Startups |
| `ProposalWorkflowTracker.jsx` | Proposal tracking | Startups |
| `StartupChurnPredictor.jsx` | Churn prediction | Analytics |
| `StartupCollaborationHub.jsx` | Collaboration hub | Startups |
| `StartupCredentialBadges.jsx` | Credential badges | Profile |
| `StartupJourneyAnalytics.jsx` | Journey analytics | Analytics |
| `StartupMentorshipMatcher.jsx` | Mentorship matching | Startups |
| `StartupOnboardingWizard.jsx` | Onboarding wizard | Startups |
| `StartupPublicShowcase.jsx` | Public showcase | Public |
| `StartupReferralProgram.jsx` | Referral program | Startups |

---

## 🧩 Academia Components (7)

**Location:** `src/components/` (various)

| Component | Description |
|-----------|-------------|
| Research-related components in challenges, R&D | - |

---

## 🪝 Hooks

### Startup Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useStartups` | `useStartups.js` | Startup list & CRUD |
| `useStartup` | `useStartups.js` | Single startup by ID |
| `useStartupProfile` | `useStartupProfiles.js` | Startup profile data |
| `useStartupVerifications` | `useStartupVerification.js` | Verification queue |
| `useStartupOnboardingMutations` | `useStartupOnboarding.js` | Onboarding mutations |
| `useStartupMentorshipMutations` | `useStartupMentorship.js` | Mentorship matching |
| `useStartupReferrals` | `useStartupReferrals.js` | Referral program |
| `useStartupEcosystem` | `useStartupEcosystem.js` | Ecosystem metrics |
| `useProviders` | `useProviders.js` | Provider list |
| `useProviderAwards` | `useProviderAwards.js` | Provider awards |
| `useProviderMatches` | `useMatchmakerAnalytics.js` | Provider match history |
| `useProviderPerformanceStats` | `useSolutionAnalytics.js` | Performance metrics |

### Academia Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useResearcherProfiles` | `useResearcherProfiles.js` | Researcher profiles |
| `useResearcherConnections` | `useResearcherNetwork.js` | Network connections |
| `useResearcherCollaborations` | `useResearcherNetwork.js` | Collaborations |
| `useResearcherMutations` | `useResearcherNetwork.js` | Network mutations |
| `useResearcherDashboardData` | `useResearcherDashboardData.js` | Dashboard data |
| `useAcademiaData` | `useAcademiaData.js` | Academia metrics |

---

## 🗄️ Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `providers` | Startup/provider profiles | ✅ Exists |
| `researcher_profiles` | Researcher profiles | ✅ Exists |
| `organizations` | Parent org for providers | ✅ Exists |

> **Note:** `institutions` is stored as JSON in `partner_institutions` field within `rd_projects`, not as a standalone table.

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `startup_view` | Startup access |
| `academia_view` | Academia access |
| `provider` | Provider access |
| `researcher` | Researcher access |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Solutions | Startup solutions |
| R&D | Academic research |
| Programs | Participation |
| Pilots | Implementation |
