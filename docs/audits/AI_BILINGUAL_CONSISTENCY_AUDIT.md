# AI Bilingual Consistency Audit

**Generated:** 2025-12-17  
**Total AI Files:** 355 files use AI (useAIWithFallback/invokeAI)  
**Bilingual Compliant:** ~47 files explicitly request bilingual output  
**Needs Update:** ~308 files may need bilingual prompt updates

---

## ✅ COMPLIANT FILES (Request Bilingual Output)

These files already request "BOTH English AND Arabic" in their AI prompts:

### Pages
- `src/pages/FailureAnalysisDashboard.jsx` - ✅ Bilingual
- `src/pages/PilotDetail.jsx` - ✅ Bilingual  
- `src/pages/RDProposalDetail.jsx` - ✅ Bilingual
- `src/pages/Sandboxes.jsx` - ✅ Bilingual
- `src/pages/MII.jsx` - ✅ Bilingual
- `src/pages/ProgramDetail.jsx` - ✅ Bilingual
- `src/pages/RDCallDetail.jsx` - ✅ Bilingual
- `src/pages/Knowledge.jsx` - ✅ Bilingual
- `src/pages/Network.jsx` - ✅ Bilingual
- `src/pages/SandboxDetail.jsx` - ✅ Bilingual
- `src/pages/CampaignPlanner.jsx` - ✅ Bilingual
- `src/pages/EventsAnalyticsDashboard.jsx` - ✅ Bilingual
- `src/pages/RDProjects.jsx` - ✅ Bilingual
- `src/pages/CompetitiveIntelligenceDashboard.jsx` - ✅ Bilingual

### Components
- `src/components/challenges/InnovationFramingGenerator.jsx` - ✅ Bilingual
- `src/components/pilots/PilotToProcurementWorkflow.jsx` - ✅ Bilingual
- `src/components/matchmaker/MatchmakerEngagementHub.jsx` - ✅ Bilingual
- `src/components/hub/ProgramsEventsHub.jsx` - ✅ Bilingual
- `src/components/strategy/evaluation/CaseStudyGenerator.jsx` - ✅ Bilingual
- `src/components/taxonomy/TaxonomyWizard.jsx` - ✅ Bilingual
- `src/components/gates/StrategicPlanApprovalGate.jsx` - ✅ Bilingual
- `src/components/programs/AIAlumniSuggester.jsx` - ✅ Bilingual (schema-based)
- `src/components/programs/AlumniSuccessStoryGenerator.jsx` - ✅ Bilingual
- `src/components/programs/AICurriculumGenerator.jsx` - ✅ Bilingual
- `src/components/programs/CrossProgramSynergy.jsx` - ✅ Bilingual (schema-based)
- `src/components/programs/MentorMatchingEngine.jsx` - ✅ Bilingual (schema-based)
- `src/components/programs/PeerLearningNetwork.jsx` - ✅ Bilingual (schema-based)

### Strategy Wizard Prompts (All 17 Steps)
- `src/components/strategy/wizard/prompts/step1Context.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step2Vision.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step3Stakeholders.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step4Pestel.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step5Swot.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step6Scenarios.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step7Risks.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step8Dependencies.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step9Objectives.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step10National.js` - ✅ Bilingual (fixed)
- `src/components/strategy/wizard/prompts/step11Kpis.js` - ✅ Bilingual (fixed)
- `src/components/strategy/wizard/prompts/step12Actions.js` - ✅ Bilingual (fixed)
- `src/components/strategy/wizard/prompts/step13Resources.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step14Timeline.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step15Governance.js` - ✅ Bilingual
- `src/components/strategy/wizard/prompts/step16Communication.js` - ✅ Bilingual (fixed)
- `src/components/strategy/wizard/prompts/step17Change.js` - ✅ Bilingual (fixed)

---

## ❌ FILES NEEDING BILINGUAL UPDATE

These files use AI but do NOT explicitly request bilingual output:

### High Priority (User-Facing Pages)

1. `src/pages/SandboxCreate.jsx`
   - Issue: "Enhance this regulatory sandbox proposal" - English only
   - Fix: Add "in BOTH English and Arabic" to prompt

2. `src/pages/SolutionChallengeMatcher.jsx`
   - Issue: "Generate a comprehensive proposal" - English only
   - Fix: Add bilingual requirement

3. `src/pages/EmailTemplateManager.jsx`
   - Issue: "Enhance this email template" - English only
   - Fix: Add bilingual requirement

4. `src/pages/RDPortfolioPlanner.jsx`
   - Issue: "Create a strategic R&D portfolio plan" - English only
   - Fix: Add bilingual requirement

5. `src/pages/PilotEdit.jsx`
   - Issue: Multiple AI prompts for team generation, stakeholders - English only
   - Fix: Add bilingual requirement to all prompts

### Medium Priority (Components)

6. `src/components/sandbox/SandboxCreateWizard.jsx`
   - Issue: "Design a regulatory sandbox" - English only

7. `src/components/matchmaker/StrategicChallengeMapper.jsx`
   - Issue: "Match this application to strategic challenges" - English only

8. `src/components/strategy/PartnershipNetwork.jsx`
   - Issue: "Analyze partnership network" - English only

9. `src/components/pilots/SuccessPatternAnalyzer.jsx`
   - Issue: "Analyze success patterns" - English only

10. `src/components/collaboration/PartnershipProposalWizard.jsx`
    - Issue: "Generate a professional partnership proposal draft" - English only

11. `src/components/citizen/AIIdeaClassifier.jsx`
    - Issue: "Classify citizen idea" - English only

12. `src/components/scaling/ScalingCostBenefitAnalyzer.jsx`
    - Issue: "Calculate cost-benefit analysis" - English only

13. `src/components/pilots/ScalingReadiness.jsx`
    - Issue: "Assess scaling readiness" - English only

14. `src/components/pilots/PilotBenchmarking.jsx`
    - Issue: "Compare this pilot against similar completed pilots" - English only

15. `src/components/solutions/ContractGeneratorWizard.jsx`
    - Issue: Contract generation - English only

16. `src/components/challenges/ChallengeToProgramWorkflow.jsx`
    - Issue: "Design a program to address this challenge" - English only

17. `src/components/ROICalculator.jsx`
    - Issue: "Calculate expected ROI" - English only

18. `src/components/challenges/ChallengeToRDWizard.jsx`
    - Issue: "Generate an R&D call from this municipal challenge" - English only

19. `src/components/onboarding/FirstActionRecommender.jsx`
    - Issue: "Recommend the most impactful first action" - English only

20. `src/components/matchmaker/FailedMatchLearningEngine.jsx`
    - Issue: Match analysis - English only

21. `src/components/data/DuplicateRecordDetector.jsx`
    - Issue: "Detect duplicate or highly similar records" - English only

### Lower Priority (Supporting Components)

22. `src/components/ai-uploader/steps/StepValidation.jsx`
    - Issue: Translation step already bilingual, but analysis step English only

23-308. **Many more components** - See full codebase search results

---

## 📝 STANDARD BILINGUAL PROMPT TEMPLATE

When fixing prompts, use this pattern:

```javascript
const result = await invokeAI({
  prompt: `[Your task description] in BOTH English AND Arabic.

Context: ${JSON.stringify(contextData)}

Requirements:
1. [Requirement 1]
2. [Requirement 2]

Return JSON with bilingual fields:
- title_en / title_ar
- description_en / description_ar
- [other fields with _en/_ar suffixes]`,
  response_json_schema: {
    type: 'object',
    properties: {
      title_en: { type: 'string' },
      title_ar: { type: 'string' },
      description_en: { type: 'string' },
      description_ar: { type: 'string' },
      // ... more fields
    },
    required: ['title_en', 'title_ar', ...]
  }
});
```

---

## 🔧 NOTIFICATION TEMPLATES

`src/components/notifications/BilingualNotificationTemplate.jsx` only has 4 templates:
- `challenge_approved`
- `pilot_milestone`
- `task_assigned`
- `approval_pending`

**Recommended additions:**
- `solution_submitted`
- `rd_call_created`
- `program_application_received`
- `sandbox_approved`
- `event_reminder`
- `deadline_approaching`
- `status_changed`
- `comment_added`
- `mention_notification`

---

## ✅ AI INFRASTRUCTURE (Consistent)

The following are already consistent:

1. **useAIWithFallback hook** - Centralized AI invocation with:
   - Rate limiting
   - Error handling
   - Status management
   - Fallback support

2. **AIStatusIndicator component** - Bilingual status messages:
   - Rate limited warning (EN/AR)
   - Error message (EN/AR)
   - Usage warning (EN/AR)

3. **invoke-llm edge function** - Consistent backend for all AI calls

---

## 📊 SUMMARY

| Category | Count | Status |
|----------|-------|--------|
| Total AI Files | 355 | - |
| Fully Bilingual | ~47 | ✅ |
| Needs Fix (High Priority) | ~20 | ❌ |
| Needs Fix (Medium Priority) | ~50 | ⚠️ |
| Needs Fix (Low Priority) | ~238 | 📋 |
| Notification Templates | 4/13 | ⚠️ |

---

## 🎯 RECOMMENDED PRIORITY

1. **Phase 1** (Immediate): Fix high-priority user-facing pages
2. **Phase 2** (This Week): Fix medium-priority components
3. **Phase 3** (Ongoing): Address remaining components incrementally
4. **Phase 4**: Add missing notification templates
