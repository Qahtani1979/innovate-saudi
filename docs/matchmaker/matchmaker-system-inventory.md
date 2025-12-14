# Matchmaker System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 32 files (10 pages, 20 components, 2 hooks)  
> **Parent System:** Innovation Matchmaking  
> **Hub Page:** `/matchmaker-applications`

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← Events](../events/events-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Admin →](../admin/admin-system-inventory.md) |

---

## Overview

The Matchmaker System facilitates matching between challenges, solutions, providers, and municipalities with AI-powered recommendations and quality gates.

---

## 📄 Pages (10)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Matchmaker Applications** | `MatchmakerApplications.jsx` | `/matchmaker-applications` | `matchmaker_view` | Self (Root) |
| Matchmaker Application Create | `MatchmakerApplicationCreate.jsx` | `/matchmaker-application-create` | `matchmaker_create` | Matchmaker Applications |
| Matchmaker Application Detail | `MatchmakerApplicationDetail.jsx` | `/matchmaker-application-detail` | `matchmaker_view` | Matchmaker Applications |
| Matchmaker Journey | `MatchmakerJourney.jsx` | `/matchmaker-journey` | `matchmaker_view` | Matchmaker Applications |
| Matchmaker Evaluation Hub | `MatchmakerEvaluationHub.jsx` | `/matchmaker-evaluation-hub` | `matchmaker_evaluate` | Matchmaker Applications |
| Matchmaker Success Analytics | `MatchmakerSuccessAnalytics.jsx` | `/matchmaker-success-analytics` | `matchmaker_view` | Analytics |
| Matching Queue | `MatchingQueue.jsx` | `/matching-queue` | `matchmaker_manage` | Matchmaker Applications |
| Challenge Solution Matching | `ChallengeSolutionMatching.jsx` | `/challenge-solution-matching` | `matchmaker_manage` | Challenges |
| Solution Challenge Matcher | `SolutionChallengeMatcher.jsx` | `/solution-challenge-matcher` | `matchmaker_manage` | Solutions |
| Matchmaker Coverage Report | `MatchmakerCoverageReport.jsx` | `/matchmaker-coverage-report` | `admin` | Admin |
| Matchers Coverage Report | `MatchersCoverageReport.jsx` | `/matchers-coverage-report` | `admin` | Admin |

---

## 🧩 Components (20)

**Location:** `src/components/matchmaker/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIMatchSuccessPredictor.jsx` | AI success prediction | Matching |
| `AutomatedMatchNotifier.jsx` | Match notifications | Matching |
| `ClassificationDashboard.jsx` | Classification dashboard | Admin |
| `EngagementQualityAnalytics.jsx` | Engagement analytics | Analytics |
| `EngagementReadinessGate.jsx` | Readiness gate | Matching |
| `EnhancedMatchingEngine.jsx` | Enhanced matching | Matching |
| `EvaluationRubrics.jsx` | Evaluation rubrics | Evaluation Hub |
| `ExecutiveReviewGate.jsx` | Executive review | Matching |
| `FailedMatchLearningEngine.jsx` | Failed match learning | Analytics |
| `MatchQualityGate.jsx` | Quality gate | Matching |
| `MatchmakerActivityLog.jsx` | Activity log | Application Detail |
| `MatchmakerEngagementHub.jsx` | Engagement hub | Matching |
| `MatchmakerMarketIntelligence.jsx` | Market intelligence | Analytics |
| `MultiPartyMatchmaker.jsx` | Multi-party matching | Matching |
| `PilotConversionWizard.jsx` | Pilot conversion | Matching |
| `ProviderPerformanceScorecard.jsx` | Provider scorecard | Analytics |
| `ProviderPortfolioIntelligence.jsx` | Portfolio intelligence | Analytics |
| `ScreeningChecklist.jsx` | Screening checklist | Matching |
| `StakeholderReviewGate.jsx` | Stakeholder review | Matching |
| `StrategicChallengeMapper.jsx` | Strategic mapping | Matching |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `matchmaker_applications` | Match applications |
| `challenge_solution_matches` | Match records |
| `match_quality_scores` | Quality scoring |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `matchmaker_view` | View matchmaker |
| `matchmaker_create` | Create matches |
| `matchmaker_manage` | Manage matching |
| `matchmaker_evaluate` | Evaluate matches |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Challenges | Challenge matching |
| Solutions | Solution matching |
| Pilots | Pilot conversion |
| Providers | Provider matching |
| Municipalities | Municipal matching |
