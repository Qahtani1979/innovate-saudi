# Strategy System - AI Components Analysis

**Last Updated:** 2025-12-13  
**Status:** Analysis Complete

---

## EXECUTIVE SUMMARY

| Phase | AI Components | Edge Functions | Status | Missing AI |
|-------|---------------|----------------|--------|------------|
| **Phase 1: Pre-Planning** | 5 | 0 | ✅ 100% | 1 enhancement |
| **Phase 2: Strategy Creation** | 3 | 1 | ⚠️ 80% | 2 missing |
| **Phase 3: Cascade** | 6 | 5 | ✅ 100% | 0 |
| **Phase 4: Governance** | 0 | 1 | ⚠️ 50% | 2 missing |
| **Phase 5: Communication** | 1 | 1 | ⚠️ 50% | 2 missing |
| **Phase 6: Monitoring** | 5 | 2 | ✅ 90% | 1 enhancement |
| **Phase 7: Review** | 0 | 0 | ❌ 0% | 3 missing |
| **TOTAL** | **20** | **10** | **75%** | **11 gaps** |

---

## PHASE 1: PRE-PLANNING - AI Analysis

### Existing AI Components

| Component | File | AI Hook | AI Role | Status |
|-----------|------|---------|---------|--------|
| `EnvironmentalScanWidget` | `src/components/strategy/preplanning/EnvironmentalScanWidget.jsx` | `useAIWithFallback` | PESTLE trend analysis, opportunity/threat identification | ✅ Complete |
| `SWOTAnalysisBuilder` | `src/components/strategy/preplanning/SWOTAnalysisBuilder.jsx` | `useAIWithFallback` | Auto-suggest SWOT factors from context | ✅ Complete |
| `StakeholderAnalysisWidget` | `src/components/strategy/preplanning/StakeholderAnalysisWidget.jsx` | `useAIWithFallback` | Stakeholder identification, power/interest scoring | ✅ Complete |
| `RiskAssessmentBuilder` | `src/components/strategy/preplanning/RiskAssessmentBuilder.jsx` | `useAIWithFallback` | Risk identification, probability/impact assessment | ✅ Complete |
| `StrategyInputCollector` | `src/components/strategy/preplanning/StrategyInputCollector.jsx` | Simulated | Theme extraction (mock), sentiment analysis | ⚠️ Uses mock AI |

### Missing/Enhancement Opportunities

| # | Component | AI Feature Needed | Priority | Effort |
|---|-----------|-------------------|----------|--------|
| 1.1 | `StrategyInputCollector` | **Real AI Integration** - Replace simulated theme extraction with actual `useAIWithFallback` call for theme clustering and sentiment | P2 | 2hr |
| 1.2 | `BaselineDataCollector` | **AI Benchmarking** - AI-powered benchmark suggestions based on historical data patterns | P3 | 3hr |

---

## PHASE 2: STRATEGY CREATION - AI Analysis

### Existing AI Components

| Component | File | AI Hook/Function | AI Role | Status |
|-----------|------|------------------|---------|--------|
| `StrategyTimelinePlanner` | `src/components/strategy/creation/StrategyTimelinePlanner.jsx` | None | No AI (manual timeline) | ⚠️ No AI |
| `ActionPlanBuilder` | `src/components/strategy/creation/ActionPlanBuilder.jsx` | `useAIWithFallback` | Generate action items from objectives | ✅ Complete |
| `NationalStrategyLinker` | `src/components/strategy/creation/NationalStrategyLinker.jsx` | None | No AI (manual linking) | ⚠️ No AI |
| `SectorStrategyBuilder` | `src/components/strategy/creation/SectorStrategyBuilder.jsx` | None | No AI | ⚠️ No AI |
| `StrategyTemplateLibrary` | `src/components/strategy/creation/StrategyTemplateLibrary.jsx` | None | No AI | ⚠️ No AI |
| `StrategyOwnershipAssigner` | `src/components/strategy/creation/StrategyOwnershipAssigner.jsx` | None | No AI | ⚠️ No AI |

### Missing AI Features

| # | Component | AI Feature Needed | Priority | Effort |
|---|-----------|-------------------|----------|--------|
| 2.1 | `StrategyTimelinePlanner` | **AI Timeline Optimization** - Suggest optimal task sequencing, identify dependencies, predict delays | P2 | 4hr |
| 2.2 | `NationalStrategyLinker` | **AI Alignment Suggester** - Auto-suggest Vision 2030/SDG alignments based on objective text | P1 | 3hr |
| 2.3 | `StrategyOwnershipAssigner` | **AI Owner Recommender** - Suggest optimal owners based on capacity and expertise | P3 | 3hr |

---

## PHASE 3: CASCADE & OPERATIONALIZATION - AI Analysis

### Existing AI Components (ALL COMPLETE ✅)

| Component | File | Edge Function | AI Role | Status |
|-----------|------|---------------|---------|--------|
| `StrategyToProgramGenerator` | `src/components/strategy/StrategyToProgramGenerator.jsx` | `strategy-program-theme-generator` | Generate program themes from strategic goals | ✅ Complete |
| `StrategyChallengeGenerator` | `src/components/strategy/cascade/StrategyChallengeGenerator.jsx` | `strategy-challenge-generator` | Generate challenges from objectives | ✅ Complete |
| `StrategyToLivingLabGenerator` | `src/components/strategy/cascade/StrategyToLivingLabGenerator.jsx` | `strategy-lab-research-generator` | Generate research briefs | ✅ Complete |
| `StrategyToRDCallGenerator` | `src/components/strategy/cascade/StrategyToRDCallGenerator.jsx` | `strategy-rd-call-generator` | Generate R&D calls from challenges | ✅ Complete |
| `StrategyToSandboxGenerator` | `src/components/strategy/cascade/StrategyToSandboxGenerator.jsx` | `strategy-sandbox-planner` | Plan sandbox experiments | ✅ Complete |
| `StrategyToPilotGenerator` | `src/components/strategy/cascade/StrategyToPilotGenerator.jsx` | `strategy-pilot-generator` | Generate pilot designs | ✅ Complete |
| `StrategyToPartnershipGenerator` | `src/components/strategy/cascade/StrategyToPartnershipGenerator.jsx` | Uses `useAIWithFallback` | Partner matching recommendations | ✅ Complete |
| `StrategyToEventGenerator` | `src/components/strategy/cascade/StrategyToEventGenerator.jsx` | Uses `useAIWithFallback` | Event planning from strategy | ✅ Complete |
| `StrategyToCampaignGenerator` | `src/components/strategy/cascade/StrategyToCampaignGenerator.jsx` | Simulated | Campaign generation (mock) | ⚠️ Mock AI |
| `StrategyToPolicyGenerator` | `src/components/strategy/cascade/StrategyToPolicyGenerator.jsx` | Simulated | Policy derivation (mock) | ⚠️ Mock AI |

### Enhancement Opportunities

| # | Component | Enhancement | Priority | Effort |
|---|-----------|-------------|----------|--------|
| 3.1 | `StrategyToCampaignGenerator` | Replace mock with real AI via `useAIWithFallback` | P3 | 2hr |
| 3.2 | `StrategyToPolicyGenerator` | Replace mock with real AI via `useAIWithFallback` | P3 | 2hr |

---

## PHASE 4: GOVERNANCE & APPROVAL - AI Analysis

### Existing AI Components

| Component | File | AI Integration | Status |
|-----------|------|----------------|--------|
| `StakeholderSignoffTracker` | `src/components/strategy/governance/StakeholderSignoffTracker.jsx` | None | ⚠️ No AI |
| `StrategyVersionControl` | `src/components/strategy/governance/StrategyVersionControl.jsx` | None | ⚠️ No AI |
| Edge Function | `strategic-plan-approval` | Approval workflow (no AI) | ✅ Works |

### Missing AI Features

| # | Component | AI Feature Needed | Priority | Effort |
|---|-----------|-------------------|----------|--------|
| 4.1 | `StakeholderSignoffTracker` | **AI Follow-up Generator** - Generate personalized reminder messages for pending sign-offs | P3 | 2hr |
| 4.2 | `StrategyVersionControl` | **AI Change Summarizer** - Auto-generate change summaries comparing versions | P2 | 3hr |
| 4.3 | NEW | **AI Approval Risk Analyzer** - Identify potential approval blockers and suggest mitigation | P3 | 4hr |

---

## PHASE 5: COMMUNICATION & PUBLISHING - AI Analysis

### Existing AI Components

| Component | File | AI Integration | AI Role | Status |
|-----------|------|----------------|---------|--------|
| `StrategicNarrativeGenerator` | `src/components/strategy/StrategicNarrativeGenerator.jsx` | `useAIWithFallback` | Generate compelling strategy narratives | ✅ Complete |
| `CommunicationsHub` | Existing page | Edge function `email-trigger-hub` | Email automation | ✅ Complete |

### Missing AI Features

| # | Component | AI Feature Needed | Priority | Effort |
|---|-----------|-------------------|----------|--------|
| 5.1 | NEW: `StrategyAnnouncementGenerator` | **AI Announcement Writer** - Generate internal/external announcements for strategy launch | P2 | 3hr |
| 5.2 | NEW: `StrategyPresentationBuilder` | **AI Presentation Outliner** - Generate slide deck outlines for strategy presentations | P3 | 4hr |
| 5.3 | `PublicStrategyDashboard` | **AI Executive Summary** - Auto-generate public-facing executive summary | P2 | 2hr |

---

## PHASE 6: MONITORING & TRACKING - AI Analysis

### Existing AI Components

| Component | File | AI Integration | AI Role | Status |
|-----------|------|----------------|---------|--------|
| `WhatIfSimulator` | `src/components/strategy/WhatIfSimulator.jsx` | `useAIWithFallback` | Scenario prediction and impact simulation | ✅ Complete |
| `BottleneckDetector` | `src/components/strategy/BottleneckDetector.jsx` | `useAIWithFallback` | Pipeline bottleneck analysis | ✅ Complete |
| `StrategicNarrativeGenerator` | `src/components/strategy/StrategicNarrativeGenerator.jsx` | `useAIWithFallback` | Progress narrative generation | ✅ Complete |
| `StrategicGapProgramRecommender` | `src/components/strategy/StrategicGapProgramRecommender.jsx` | `useAIWithFallback` | Gap-based program recommendations | ✅ Complete |
| `CollaborationMapper` | `src/components/strategy/CollaborationMapper.jsx` | `useAIWithFallback` | Partner suggestions | ✅ Complete |
| `PartnershipNetwork` | `src/components/strategy/PartnershipNetwork.jsx` | `useAIWithFallback` | Network insights | ✅ Complete |
| Edge Function | `strategy-sector-gap-analysis` | Sector gap analysis | ✅ Complete |
| Edge Function | `strategic-priority-scoring` | Priority scoring | ✅ Complete |

### Missing/Enhancement Opportunities

| # | Component | AI Feature Needed | Priority | Effort |
|---|-----------|-------------------|----------|--------|
| 6.1 | `StrategyAlignmentScoreCard` | **AI Alignment Insights** - Explain alignment gaps and suggest fixes | P2 | 2hr |
| 6.2 | `StrategyCockpit` | **AI Trend Prediction** - Predict KPI trajectories based on current performance | P2 | 4hr |

---

## PHASE 7: REVIEW & ADJUSTMENT - AI Analysis

### Existing AI Components

| Component | File | AI Integration | Status |
|-----------|------|----------------|--------|
| `StrategyAdjustmentWizard` | `src/components/strategy/review/StrategyAdjustmentWizard.jsx` | None | ❌ No AI |
| `StrategyReprioritizer` | `src/components/strategy/review/StrategyReprioritizer.jsx` | None | ❌ No AI |
| `StrategyImpactAssessment` | `src/components/strategy/review/StrategyImpactAssessment.jsx` | None | ❌ No AI |

### Missing AI Features (CRITICAL GAP)

| # | Component | AI Feature Needed | Priority | Effort |
|---|-----------|-------------------|----------|--------|
| 7.1 | `StrategyAdjustmentWizard` | **AI Impact Predictor** - Predict downstream effects of proposed adjustments | P1 | 4hr |
| 7.2 | `StrategyReprioritizer` | **AI Priority Optimizer** - Suggest optimal priority order based on constraints and goals | P1 | 4hr |
| 7.3 | `StrategyImpactAssessment` | **AI Impact Analyzer** - Analyze actual vs expected impact, identify root causes | P1 | 4hr |
| 7.4 | NEW: `LessonsLearnedAIExtractor` | **AI Lessons Extractor** - Extract lessons from entity data automatically | P2 | 3hr |

---

## EXISTING AI INFRASTRUCTURE

### Edge Functions with AI

| Function | Model | Purpose | Used By |
|----------|-------|---------|---------|
| `invoke-llm` | Lovable AI Gateway | General AI invocation | `useAIWithFallback` hook |
| `strategy-program-theme-generator` | Lovable AI | Generate program themes | `StrategyToProgramGenerator` |
| `strategy-challenge-generator` | Lovable AI | Generate challenges | `StrategyChallengeGenerator` |
| `strategy-rd-call-generator` | Lovable AI | Generate R&D calls | `StrategyToRDCallGenerator` |
| `strategy-lab-research-generator` | Lovable AI | Generate research briefs | `StrategyToLivingLabGenerator` |
| `strategy-sandbox-planner` | Lovable AI | Plan sandboxes | `StrategyToSandboxGenerator` |
| `strategy-sector-gap-analysis` | Lovable AI | Analyze sector gaps | `SectorGapAnalysisWidget` |
| `strategy-pilot-generator` | Lovable AI | Generate pilots | `StrategyToPilotGenerator` |

### AI Hook

| Hook | File | Features |
|------|------|----------|
| `useAIWithFallback` | `src/hooks/useAIWithFallback.js` | Rate limiting, error handling, fallback data, session tracking |

---

## PRIORITY IMPLEMENTATION MATRIX

### P1 (Critical - Phase 7 has NO AI)

| # | Task | Component | Effort | Impact |
|---|------|-----------|--------|--------|
| 1 | AI Impact Predictor | `StrategyAdjustmentWizard` | 4hr | High |
| 2 | AI Priority Optimizer | `StrategyReprioritizer` | 4hr | High |
| 3 | AI Impact Analyzer | `StrategyImpactAssessment` | 4hr | High |
| 4 | AI Alignment Suggester | `NationalStrategyLinker` | 3hr | High |

### P2 (Important)

| # | Task | Component | Effort | Impact |
|---|------|-----------|--------|--------|
| 5 | Real AI Theme Extraction | `StrategyInputCollector` | 2hr | Medium |
| 6 | AI Timeline Optimization | `StrategyTimelinePlanner` | 4hr | Medium |
| 7 | AI Change Summarizer | `StrategyVersionControl` | 3hr | Medium |
| 8 | AI Announcement Writer | NEW Component | 3hr | Medium |
| 9 | AI Alignment Insights | `StrategyAlignmentScoreCard` | 2hr | Medium |
| 10 | AI Trend Prediction | `StrategyCockpit` | 4hr | Medium |

### P3 (Nice to Have)

| # | Task | Component | Effort | Impact |
|---|------|-----------|--------|--------|
| 11 | AI Owner Recommender | `StrategyOwnershipAssigner` | 3hr | Low |
| 12 | AI Follow-up Generator | `StakeholderSignoffTracker` | 2hr | Low |
| 13 | Real AI for Campaigns | `StrategyToCampaignGenerator` | 2hr | Low |
| 14 | Real AI for Policies | `StrategyToPolicyGenerator` | 2hr | Low |
| 15 | AI Presentation Outliner | NEW Component | 4hr | Low |

---

## RECOMMENDED NEXT STEPS

1. **Phase 7 AI Integration (12hr)** - Critical gap: Add AI to all review components
2. **Phase 2 AI Enhancement (7hr)** - Add AI to timeline planner and national linker  
3. **Replace Mock AI (4hr)** - Convert simulated AI in collectors/generators to real AI
4. **Governance AI (5hr)** - Add version summarizer and sign-off follow-ups

**Total Estimated Effort: 28 hours**
