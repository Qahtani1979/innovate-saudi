# AI Bilingual Implementation Plan

**Generated:** 2025-12-17  
**Status:** Ready for Implementation  
**Total Files to Update:** 70+ files  
**Estimated Effort:** 3-4 phases

---

## Executive Summary

This document provides a comprehensive plan to standardize AI prompts across the codebase to match the Strategy Wizard's bilingual architecture pattern. The Strategy Wizard demonstrates the ideal implementation with:
- Separated prompt files with explicit bilingual output requirements
- JSON schemas requiring `_en` and `_ar` field pairs
- Saudi/MoMAH context injection
- Centralized AI hook with status management

---

## Part 1: Current Architecture Analysis

### 1.1 Strategy Wizard Pattern (Reference Implementation)

```
┌────────────────────────────────────────────────────────────────┐
│                    STRATEGY WIZARD ARCHITECTURE                 │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────┐    ┌──────────────────┐                  │
│  │ useAIWithFallback│◄───│ AIStatusIndicator │                 │
│  │ (Core Hook)      │    │ (UI Component)    │                 │
│  └────────┬────────┘    └──────────────────┘                  │
│           │                                                    │
│           ▼                                                    │
│  ┌─────────────────┐                                          │
│  │   useWizardAI   │ ◄── Domain-specific router               │
│  │  (Router Hook)   │     Routes to edge functions             │
│  └────────┬────────┘     Provides SAUDI_CONTEXT               │
│           │                                                    │
│           ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐      │
│  │            prompts/stepXXX.js files                  │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │getStepPrompt│  │  stepSchema │  │ BILINGUAL   │  │      │
│  │  │ (function)  │  │  (JSON def) │  │ REQUIRED    │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `useAIWithFallback` | `src/hooks/useAIWithFallback.js` | Core AI invocation with rate limiting, error handling |
| `AIStatusIndicator` | `src/components/ai/AIStatusIndicator.jsx` | Bilingual status display |
| `useWizardAI` | `src/hooks/strategy/useWizardAI.js` | Strategy-specific AI router with SAUDI_CONTEXT |
| Prompt files | `src/components/strategy/wizard/prompts/` | 24 files with getPrompt + schema exports |

### 1.3 Database Schema Bilingual Fields

Based on database analysis, these tables have bilingual columns requiring AI to generate both:

| Table | Bilingual Fields |
|-------|------------------|
| `challenges` | title_en/ar, description_en/ar, problem_statement_en/ar, current_situation_en/ar, desired_outcome_en/ar, root_cause_en/ar, tagline_en/ar |
| `pilots` | title_en/ar, description_en/ar, objective_en/ar, tagline_en/ar, evaluation_summary_en/ar |
| `solutions` | name_en/ar, description_en/ar, value_proposition_en/ar, tagline_en/ar |
| `sandboxes` | name_en/ar, description_en/ar, objectives_en/ar, tagline_en/ar |
| `programs` | name_en/ar, description_en/ar, objectives_en/ar |
| `rd_calls` | title_en/ar, description_en/ar, objectives_en/ar |
| `rd_projects` | title_en/ar, description_en/ar, objectives_en/ar |
| `events` | title_en/ar, description_en/ar |
| `contracts` | title_en/ar |
| `case_studies` | title_en/ar, description_en/ar |
| `communication_plans` | name_en/ar, description_en/ar, master_narrative_en/ar |
| `strategic_plans` | name_en/ar, description_en/ar, vision_en/ar, mission_en/ar |

### 1.4 Taxonomy Context (from TaxonomyContext.jsx)

Available for AI context injection:
- **Sectors**: id, code, name_en, name_ar, description_en/ar
- **Regions**: id, code, name_en, name_ar  
- **Strategic Themes**: code, name_en, name_ar, description
- **Technologies**: code, name_en, name_ar, category
- **Vision Programs**: code, name_en, name_ar, official_url
- **Stakeholder Types**: code, name_en, name_ar
- **Risk Categories**: code, name_en, name_ar
- **Governance Roles**: code, name_en, name_ar

---

## Part 2: Files Requiring Updates

### 2.1 HIGH PRIORITY - User-Facing Pages (20 files)

| # | File | Current Issue | AI Prompts Count | DB Fields Affected |
|---|------|---------------|------------------|-------------------|
| 1 | `src/pages/SandboxCreate.jsx` | Lines 92-116: Prompt asks for bilingual but schema incomplete | 1 | sandboxes: all _en/_ar fields |
| 2 | `src/pages/PilotEdit.jsx` | Lines 233-498: 7 AI sections, partial bilingual | 7 | pilots: all _en/_ar fields |
| 3 | `src/pages/SolutionChallengeMatcher.jsx` | Proposal generation English-only | 1 | challenge_proposals |
| 4 | `src/pages/EmailTemplateManager.jsx` | Template enhancement English-only | 1 | email_templates |
| 5 | `src/pages/RDPortfolioPlanner.jsx` | Portfolio planning English-only | 1 | rd_projects |
| 6 | `src/pages/RiskPortfolio.jsx` | Risk analysis English-only | 1 | - (analysis only) |
| 7 | `src/pages/IterationWorkflow.jsx` | Iteration plan English-only | 1 | pilots |
| 8 | `src/pages/FailureAnalysisDashboard.jsx` | ✅ Already bilingual | 1 | - |
| 9 | `src/pages/PilotDetail.jsx` | ✅ Already bilingual | 1 | - |
| 10 | `src/pages/RDProposalDetail.jsx` | ✅ Already bilingual | 1 | - |
| 11 | `src/pages/Sandboxes.jsx` | ✅ Already bilingual | 1 | - |
| 12 | `src/pages/MII.jsx` | ✅ Already bilingual | 1 | - |
| 13 | `src/pages/ProgramDetail.jsx` | ✅ Already bilingual | 1 | - |
| 14 | `src/pages/RDCallDetail.jsx` | ✅ Already bilingual | 1 | - |
| 15 | `src/pages/Knowledge.jsx` | ✅ Already bilingual | 1 | - |
| 16 | `src/pages/Network.jsx` | ✅ Already bilingual | 1 | - |
| 17 | `src/pages/SandboxDetail.jsx` | ✅ Already bilingual | 1 | - |
| 18 | `src/pages/CampaignPlanner.jsx` | ✅ Already bilingual | 1 | - |
| 19 | `src/pages/EventsAnalyticsDashboard.jsx` | ✅ Already bilingual | 1 | - |
| 20 | `src/pages/CompetitiveIntelligenceDashboard.jsx` | ✅ Already bilingual | 1 | - |

**Action Required for Pages:** 6 files need updates

### 2.2 HIGH PRIORITY - Workflow Components (25 files)

| # | File | Current Issue | AI Prompts | Fix Required |
|---|------|---------------|------------|--------------|
| 1 | `src/components/sandbox/SandboxCreateWizard.jsx` | Lines 50-78: Schema has bilingual but prompt unclear | 1 | Enhance prompt clarity |
| 2 | `src/components/sandbox/SandboxPolicyFeedbackWorkflow.jsx` | ✅ Summary shows bilingual | 1 | Verify schema |
| 3 | `src/components/matchmaker/PilotConversionWizard.jsx` | Partnership agreement English-only | 1 | Add bilingual |
| 4 | `src/components/matchmaker/MultiPartyMatchmaker.jsx` | Consortium formation English-only | 1 | Add bilingual |
| 5 | `src/components/matchmaker/StrategicChallengeMapper.jsx` | Challenge mapping English-only | 1 | Add bilingual |
| 6 | `src/components/matchmaker/FailedMatchLearningEngine.jsx` | Match analysis English-only | 1 | Add bilingual |
| 7 | `src/components/scaling/ScalingToProgramConverter.jsx` | Program generation partial bilingual | 1 | Complete bilingual |
| 8 | `src/components/scaling/ScalingCostBenefitAnalyzer.jsx` | Cost analysis English-only | 1 | Add bilingual |
| 9 | `src/components/scaling/AdaptiveRolloutSequencing.jsx` | Rollout optimization English-only | 1 | Add bilingual |
| 10 | `src/components/challenges/ChallengeToProgramWorkflow.jsx` | Lines 67-136: Has bilingual schema | 1 | ✅ Verify complete |
| 11 | `src/components/challenges/ChallengeToRDWizard.jsx` | RD call generation English-only | 1 | Add bilingual |
| 12 | `src/components/challenges/InnovationFramingGenerator.jsx` | ✅ Already bilingual | 1 | - |
| 13 | `src/components/pilots/PilotToProcurementWorkflow.jsx` | ✅ Already bilingual | 1 | - |
| 14 | `src/components/pilots/SuccessPatternAnalyzer.jsx` | Pattern analysis English-only | 1 | Add bilingual |
| 15 | `src/components/pilots/ScalingReadiness.jsx` | Readiness assessment English-only | 1 | Add bilingual |
| 16 | `src/components/pilots/PilotBenchmarking.jsx` | Benchmarking English-only | 1 | Add bilingual |
| 17 | `src/components/solutions/ContractGeneratorWizard.jsx` | Contract generation English-only | 1 | Add bilingual |
| 18 | `src/components/collaboration/PartnershipProposalWizard.jsx` | Proposal generation English-only | 1 | Add bilingual |
| 19 | `src/components/rd/RDProposalAIScorerWidget.jsx` | Scoring English-only | 1 | Add bilingual |
| 20 | `src/components/rd/IPCommercializationTracker.jsx` | IP assessment English-only | 1 | Add bilingual |
| 21 | `src/components/citizen/AIIdeaClassifier.jsx` | Lines 16-42: Classification English-only | 1 | Add bilingual keywords |
| 22 | `src/components/onboarding/FirstActionRecommender.jsx` | Recommendations English-only | 1 | Add bilingual |
| 23 | `src/components/data/DuplicateRecordDetector.jsx` | Detection English-only | 1 | Add bilingual |
| 24 | `src/components/ROICalculator.jsx` | Lines 26-61: ROI calculation English-only | 1 | Add bilingual |
| 25 | `src/components/strategy/PartnershipNetwork.jsx` | Network analysis English-only | 1 | Add bilingual |

**Action Required for Workflows:** 20 files need updates

### 2.3 MEDIUM PRIORITY - AI Analysis Components (20 files)

| # | File | AI Purpose | Fix Required |
|---|------|------------|--------------|
| 1 | `src/components/ai/AIProgramEventCorrelator.jsx` | Event correlation | Add bilingual |
| 2 | `src/components/ai/AIAttendancePredictor.jsx` | Attendance prediction | Add bilingual |
| 3 | `src/components/ai/AIEventROIPredictor.jsx` | Event ROI | Add bilingual |
| 4 | `src/components/ai/AISectorTrendAnalyzer.jsx` | Trend analysis | Add bilingual |
| 5 | `src/components/ai/AIPromptLocalizer.jsx` | ✅ Bilingual helper | - |
| 6 | `src/components/programs/AIAlumniSuggester.jsx` | ✅ Already bilingual | - |
| 7 | `src/components/programs/AlumniSuccessStoryGenerator.jsx` | ✅ Already bilingual | - |
| 8 | `src/components/programs/AICurriculumGenerator.jsx` | ✅ Already bilingual | - |
| 9 | `src/components/programs/CrossProgramSynergy.jsx` | ✅ Already bilingual | - |
| 10 | `src/components/programs/MentorMatchingEngine.jsx` | ✅ Already bilingual | - |
| 11 | `src/components/programs/PeerLearningNetwork.jsx` | ✅ Already bilingual | - |
| 12 | `src/components/strategy/CollaborationMapper.jsx` | Collaboration mapping | Add bilingual |
| 13 | `src/components/strategy/cascade/StrategyChallengeGenerator.jsx` | Challenge generation | Verify bilingual |
| 14 | `src/components/strategy/cascade/StrategyToCampaignGenerator.jsx` | Campaign generation | Verify bilingual |
| 15 | `src/components/strategy/cascade/StrategyToPilotGenerator.jsx` | Pilot generation | Verify bilingual |
| 16 | `src/components/strategy/cascade/StrategyToEventGenerator.jsx` | Event generation | Verify bilingual |
| 17 | `src/components/strategy/cascade/StrategyToRDCallGenerator.jsx` | RD call generation | Verify bilingual |
| 18 | `src/components/strategy/evaluation/CaseStudyGenerator.jsx` | ✅ Already bilingual | - |
| 19 | `src/components/gates/StrategicPlanApprovalGate.jsx` | ✅ Already bilingual | - |
| 20 | `src/components/taxonomy/TaxonomyWizard.jsx` | ✅ Already bilingual | - |

**Action Required for Analysis:** 10 files need updates

---

## Part 3: Implementation Changes

### 3.1 Standard Bilingual Prompt Template

Every AI prompt MUST follow this structure:

```javascript
const result = await invokeAI({
  prompt: `[Task description] for Saudi municipal context.

## CONTEXT
Entity: ${entityName}
Type: ${entityType}
Sector: ${sector}
${additionalContext}

## BILINGUAL REQUIREMENTS
Generate ALL text content in BOTH English AND Arabic:
- Use formal Arabic (فصحى) suitable for Saudi government documents
- Ensure Arabic content is culturally appropriate
- All field pairs must be semantically equivalent

## OUTPUT FIELDS
${fieldsList}

## SAUDI INNOVATION CONTEXT
${SAUDI_CONTEXT.COMPACT}`,

  response_json_schema: {
    type: 'object',
    required: ['field_en', 'field_ar', ...],
    properties: {
      field_en: { type: 'string' },
      field_ar: { type: 'string' },
      // ... all bilingual pairs
    }
  }
});
```

### 3.2 Schema Requirements

Every schema MUST include:
1. **Bilingual text fields** with `_en` and `_ar` suffixes
2. **Required array** listing all bilingual pairs
3. **Consistent property naming** matching database columns

Example:
```javascript
const schema = {
  type: 'object',
  required: [
    'title_en', 'title_ar',
    'description_en', 'description_ar',
    'objectives_en', 'objectives_ar'
  ],
  properties: {
    title_en: { type: 'string', description: 'Title in English' },
    title_ar: { type: 'string', description: 'العنوان بالعربية' },
    description_en: { type: 'string', minLength: 100 },
    description_ar: { type: 'string', minLength: 100 },
    objectives_en: { type: 'string' },
    objectives_ar: { type: 'string' },
    // Non-bilingual fields
    priority: { type: 'string', enum: ['high', 'medium', 'low'] },
    score: { type: 'number', minimum: 0, maximum: 100 }
  }
};
```

---

## Part 4: Detailed File Changes

### 4.1 SandboxCreate.jsx (Lines 86-136)

**Current Code:**
```javascript
prompt: `Enhance this regulatory sandbox proposal:

Sandbox Name: ${formData.name_en}
Domain: ${formData.domain}
Current Description: ${formData.description_en || 'N/A'}

Provide bilingual enhancements:
1. Professional tagline (AR + EN)
...`
```

**Required Change:**
```javascript
prompt: `Enhance regulatory sandbox proposal for Saudi municipal innovation.

## SANDBOX CONTEXT
Name: ${formData.name_en}
Domain: ${formData.domain}
City: ${cities.find(c => c.id === formData.city_id)?.name_en || 'N/A'}
Current Description: ${formData.description_en || 'N/A'}

## BILINGUAL REQUIREMENTS
Generate ALL content in BOTH English AND Arabic (فصحى):
- Professional taglines suitable for Saudi government announcements
- Detailed descriptions (150+ words each language)
- Clear regulatory objectives aligned with Saudi innovation policy
- Suggested exemption categories for regulatory sandbox framework

## REQUIRED OUTPUT
1. tagline_en / tagline_ar - Compelling 10-15 word taglines
2. description_en / description_ar - Comprehensive descriptions
3. objectives_en / objectives_ar - Clear regulatory testing objectives
4. exemption_suggestions - Array of recommended regulatory exemptions

## SAUDI CONTEXT
MoMAH regulatory sandboxes support Vision 2030 innovation goals.
Partners: MCIT, CITC, SDAIA for technology regulation.`,

response_json_schema: {
  type: 'object',
  required: ['tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objectives_en', 'objectives_ar'],
  properties: {
    tagline_en: { type: 'string' },
    tagline_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    objectives_en: { type: 'string' },
    objectives_ar: { type: 'string' },
    exemption_suggestions: { type: 'array', items: { type: 'string' } }
  }
}
```

### 4.2 PilotEdit.jsx (Lines 233-498) - 7 AI Sections

Each section needs similar updates. Example for `details` section:

**Current (Line 326-354):**
```javascript
prompt = `${baseContext}

Current data:
Title EN: ${formData.title_en}
...
Enhance: refined titles, taglines, detailed descriptions...`;
```

**Required:**
```javascript
prompt = `${baseContext}

## CURRENT DATA
Title: ${formData.title_en} | ${formData.title_ar || 'N/A'}
Description: ${formData.description_en?.substring(0, 200) || 'N/A'}
Objective: ${formData.objective_en || 'N/A'}

## BILINGUAL REQUIREMENTS
Enhance ALL text fields in BOTH English AND Arabic:
- Titles: Compelling, sector-specific (max 80 chars each)
- Taglines: Memorable summaries (15-20 words each)
- Descriptions: Detailed narratives (200+ words each)
- Objectives: Clear, measurable goals
- Hypothesis: Scientific format
- Methodology: Step-by-step approach
- Scope: Boundaries and limitations

Use formal Arabic (فصحى) for Saudi government documentation.`;

schema = {
  type: 'object',
  required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'objective_en', 'objective_ar'],
  properties: {
    title_en: { type: 'string' },
    title_ar: { type: 'string' },
    tagline_en: { type: 'string' },
    tagline_ar: { type: 'string' },
    description_en: { type: 'string' },
    description_ar: { type: 'string' },
    objective_en: { type: 'string' },
    objective_ar: { type: 'string' },
    hypothesis: { type: 'string' },
    methodology: { type: 'string' },
    scope: { type: 'string' }
  }
};
```

### 4.3 ROICalculator.jsx (Lines 26-61)

**Current:**
```javascript
prompt: `Calculate expected ROI and impact for this initiative:

Type: ${inputs.type}
Budget: ${inputs.budget} SAR
...

Based on similar initiatives in municipal innovation, provide:
1. Expected ROI (%)
...
Be realistic and data-driven.`,
```

**Required:**
```javascript
prompt: `Calculate ROI and impact for Saudi municipal innovation initiative.

## INITIATIVE CONTEXT
Type: ${inputs.type}
Budget: ${inputs.budget} SAR
Sector: ${inputs.sector}
Duration: ${inputs.duration_months} months
Expected Outcome: ${inputs.expected_outcome}

## BILINGUAL REQUIREMENTS
Generate analysis summary and recommendations in BOTH English AND Arabic.

## REQUIRED OUTPUT
1. roi_percentage - Expected return on investment
2. payback_months - Time to recover investment
3. impact_score - Overall impact (0-100)
4. cost_per_citizen - SAR per citizen served
5. benchmark_en / benchmark_ar - Comparison to similar Saudi initiatives
6. risks_en / risks_ar - Key risk factors (3-5 each)
7. recommendation_en / recommendation_ar - Strategic recommendation

## SAUDI CONTEXT
Base calculations on Saudi municipal initiative benchmarks.
Consider Vision 2030 alignment and MoMAH priorities.`,

response_json_schema: {
  type: 'object',
  required: ['roi_percentage', 'benchmark_en', 'benchmark_ar'],
  properties: {
    roi_percentage: { type: 'number' },
    payback_months: { type: 'number' },
    impact_score: { type: 'number' },
    cost_per_citizen: { type: 'number' },
    benchmark_en: { type: 'string' },
    benchmark_ar: { type: 'string' },
    risks_en: { type: 'array', items: { type: 'string' } },
    risks_ar: { type: 'array', items: { type: 'string' } },
    recommendation_en: { type: 'string' },
    recommendation_ar: { type: 'string' }
  }
}
```

### 4.4 AIIdeaClassifier.jsx (Lines 16-42)

**Current:**
```javascript
prompt: `Classify citizen idea and detect issues:

IDEA: ${idea.content || idea.title}
LOCATION: ${idea.location || 'Not specified'}

Provide:
1. Primary sector...`,
```

**Required:**
```javascript
prompt: `Classify citizen idea for Saudi municipal innovation platform.

## IDEA DETAILS
Content: ${idea.content || idea.title}
Location: ${idea.location || 'Not specified'}
Municipality: ${idea.municipality_id ? 'Specified' : 'General'}

## BILINGUAL REQUIREMENTS
Generate classification labels in BOTH English AND Arabic.

## REQUIRED OUTPUT
1. sector_en / sector_ar - Primary sector classification
2. keywords_en / keywords_ar - 5-10 relevant terms each language
3. is_spam - Boolean spam/quality flag
4. sentiment - positive_suggestion, neutral, complaint
5. summary_en / summary_ar - Brief idea summary
6. recommendation_en / recommendation_ar - Next steps suggestion
7. priority - high/medium/low
8. quality_score - 0-100

## SAUDI CONTEXT
Classify according to MoMAH service categories and Vision 2030 themes.`,

response_json_schema: {
  type: 'object',
  required: ['sector_en', 'sector_ar', 'keywords_en', 'keywords_ar'],
  properties: {
    sector_en: { type: 'string' },
    sector_ar: { type: 'string' },
    keywords_en: { type: 'array', items: { type: 'string' } },
    keywords_ar: { type: 'array', items: { type: 'string' } },
    is_spam: { type: 'boolean' },
    sentiment: { type: 'string' },
    summary_en: { type: 'string' },
    summary_ar: { type: 'string' },
    recommendation_en: { type: 'string' },
    recommendation_ar: { type: 'string' },
    priority: { type: 'string' },
    quality_score: { type: 'number' }
  }
}
```

---

## Part 5: New Infrastructure Files

### 5.1 Create: `src/lib/ai/saudiContext.js`

```javascript
/**
 * Saudi/MoMAH context constants for AI prompts
 * Centralized context for consistent AI generation
 */

export const SAUDI_CONTEXT = {
  FULL: `MoMAH (Ministry of Municipalities and Housing) oversees:
- 13 administrative regions, 285+ municipalities, 17 Amanats
- Municipal services: waste, lighting, parks, markets, permits, inspections
- Housing programs: Sakani, Wafi, Ejar, Mulkiya, REDF, NHC
- Vision 2030: Quality of Life, Housing (70% ownership), NTP, Thriving Cities
- Innovation: AI/ML, IoT, Digital Twins, Smart Cities, GovTech, PropTech, ConTech
- Partners: KACST, SDAIA, MCIT, KAUST, KFUPM, Monsha'at
- Systems: Balady Platform, Sakani, ANSA, Baladiya, Mostadam`,

  COMPACT: `MoMAH - Saudi Ministry of Municipalities & Housing. Vision 2030 aligned.
13 regions, 285+ municipalities. Programs: Sakani, Wafi, Ejar.
Innovation: KACST, SDAIA, MCIT. Platforms: Balady, Sakani, Mostadam.`,

  INNOVATION: `Innovation/R&D focus required:
- Technologies: AI/ML, IoT, Digital Twins, Smart Cities, GovTech, PropTech, ConTech
- Partners: KACST, SDAIA, KAUST, KFUPM, Monsha'at, Badir Program
- PropTech: BIM, modular construction, 3D printing, smart homes
- Green Building: Mostadam certification, sustainability`,

  BILINGUAL_INSTRUCTION: `## BILINGUAL REQUIREMENTS
Generate ALL text content in BOTH English AND Arabic:
- Use formal Arabic (فصحى) suitable for Saudi government documents
- Ensure Arabic content is culturally appropriate for Saudi context
- All field pairs must be semantically equivalent`
};

export const getSectorContext = (sectorCode) => {
  const contexts = {
    SMART_CITIES: 'Smart city infrastructure, IoT sensors, data analytics, citizen apps',
    HOUSING: 'Sakani, Wafi, REDF mortgages, 70% ownership goal, NHC developments',
    URBAN_PLANNING: 'Thriving Cities, master planning, zoning, land use optimization',
    ENVIRONMENT: 'Mostadam green buildings, waste management, sustainability',
    DIGITAL_SERVICES: 'Balady platform, e-services, digital transformation',
    TRANSPORTATION: 'Smart mobility, traffic management, public transit'
  };
  return contexts[sectorCode] || 'Municipal innovation and service improvement';
};
```

### 5.2 Create: `src/lib/ai/bilingualSchemaBuilder.js`

```javascript
/**
 * Helper to build consistent bilingual JSON schemas
 */

export function buildBilingualSchema(fields, additionalProps = {}) {
  const required = [];
  const properties = {};

  fields.forEach(field => {
    if (field.bilingual) {
      required.push(`${field.name}_en`, `${field.name}_ar`);
      properties[`${field.name}_en`] = {
        type: field.type || 'string',
        ...(field.minLength && { minLength: field.minLength }),
        ...(field.description && { description: field.description })
      };
      properties[`${field.name}_ar`] = {
        type: field.type || 'string',
        ...(field.minLength && { minLength: field.minLength }),
        ...(field.descriptionAr && { description: field.descriptionAr })
      };
    } else {
      if (field.required) required.push(field.name);
      properties[field.name] = {
        type: field.type || 'string',
        ...(field.enum && { enum: field.enum }),
        ...(field.items && { items: field.items })
      };
    }
  });

  return {
    type: 'object',
    required,
    properties: { ...properties, ...additionalProps }
  };
}

// Usage example:
// const schema = buildBilingualSchema([
//   { name: 'title', bilingual: true, minLength: 10 },
//   { name: 'description', bilingual: true, minLength: 100 },
//   { name: 'priority', required: true, enum: ['high', 'medium', 'low'] },
//   { name: 'tags', type: 'array', items: { type: 'string' } }
// ]);
```

---

## Part 6: Notification Templates

### 6.1 Current Templates (4)

Located in `src/components/notifications/BilingualNotificationTemplate.jsx`:
- `challenge_approved`
- `pilot_milestone`
- `task_assigned`
- `approval_pending`

### 6.2 Required New Templates (9)

Add to BilingualNotificationTemplate.jsx:

```javascript
const TEMPLATES = {
  // Existing...
  
  // NEW TEMPLATES
  solution_submitted: {
    en: {
      title: 'Solution Submitted',
      body: 'Your solution "{solutionName}" has been submitted for review.'
    },
    ar: {
      title: 'تم تقديم الحل',
      body: 'تم تقديم الحل الخاص بك "{solutionName}" للمراجعة.'
    }
  },
  
  rd_call_created: {
    en: {
      title: 'R&D Call Published',
      body: 'New R&D call "{callTitle}" is now open for proposals.'
    },
    ar: {
      title: 'نشر طلب البحث والتطوير',
      body: 'طلب البحث والتطوير الجديد "{callTitle}" مفتوح الآن للمقترحات.'
    }
  },
  
  program_application_received: {
    en: {
      title: 'Application Received',
      body: 'Your application for "{programName}" has been received.'
    },
    ar: {
      title: 'تم استلام الطلب',
      body: 'تم استلام طلبك للبرنامج "{programName}".'
    }
  },
  
  sandbox_approved: {
    en: {
      title: 'Sandbox Approved',
      body: 'Your project has been approved for sandbox "{sandboxName}".'
    },
    ar: {
      title: 'تمت الموافقة على المنطقة التنظيمية',
      body: 'تمت الموافقة على مشروعك للمنطقة التنظيمية "{sandboxName}".'
    }
  },
  
  event_reminder: {
    en: {
      title: 'Event Reminder',
      body: '"{eventTitle}" starts in {timeUntil}.'
    },
    ar: {
      title: 'تذكير بالفعالية',
      body: '"{eventTitle}" تبدأ خلال {timeUntil}.'
    }
  },
  
  deadline_approaching: {
    en: {
      title: 'Deadline Approaching',
      body: '{entityType} "{entityTitle}" deadline in {daysRemaining} days.'
    },
    ar: {
      title: 'اقتراب الموعد النهائي',
      body: 'الموعد النهائي لـ {entityType} "{entityTitle}" خلال {daysRemaining} أيام.'
    }
  },
  
  status_changed: {
    en: {
      title: 'Status Updated',
      body: '{entityType} "{entityTitle}" changed from {oldStatus} to {newStatus}.'
    },
    ar: {
      title: 'تحديث الحالة',
      body: 'تم تغيير حالة {entityType} "{entityTitle}" من {oldStatus} إلى {newStatus}.'
    }
  },
  
  comment_added: {
    en: {
      title: 'New Comment',
      body: '{commenterName} commented on {entityType} "{entityTitle}".'
    },
    ar: {
      title: 'تعليق جديد',
      body: 'علّق {commenterName} على {entityType} "{entityTitle}".'
    }
  },
  
  mention_notification: {
    en: {
      title: 'You Were Mentioned',
      body: '{mentionerName} mentioned you in {entityType} "{entityTitle}".'
    },
    ar: {
      title: 'تمت الإشارة إليك',
      body: 'أشار إليك {mentionerName} في {entityType} "{entityTitle}".'
    }
  }
};
```

---

## Part 7: Implementation Phases

### Phase 1: Infrastructure (Day 1)
- [ ] Create `src/lib/ai/saudiContext.js`
- [ ] Create `src/lib/ai/bilingualSchemaBuilder.js`
- [ ] Update `src/components/notifications/BilingualNotificationTemplate.jsx`

### Phase 2: High-Priority Pages (Days 2-3)
- [ ] `SandboxCreate.jsx` - 1 prompt
- [ ] `PilotEdit.jsx` - 7 prompts
- [ ] `SolutionChallengeMatcher.jsx` - 1 prompt
- [ ] `EmailTemplateManager.jsx` - 1 prompt
- [ ] `RDPortfolioPlanner.jsx` - 1 prompt
- [ ] `RiskPortfolio.jsx` - 1 prompt

### Phase 3: Workflow Components (Days 4-6)
- [ ] All matchmaker components (4 files)
- [ ] All scaling components (3 files)
- [ ] All pilot components (3 files)
- [ ] Challenge workflow components (2 files)
- [ ] Other workflow components (8 files)

### Phase 4: Analysis Components (Days 7-8)
- [ ] AI analysis components (4 files)
- [ ] Strategy cascade generators (5 files)
- [ ] Verify already-bilingual components

---

## Part 8: Testing Checklist

For each updated component:

- [ ] AI prompt includes "BOTH English AND Arabic" instruction
- [ ] JSON schema has all `_en`/`_ar` field pairs
- [ ] Schema `required` array includes bilingual pairs
- [ ] Generated content saves correctly to database
- [ ] UI displays both languages appropriately
- [ ] Arabic text renders correctly (RTL)
- [ ] Rate limiting and error states work
- [ ] AIStatusIndicator displays properly

---

## Summary Statistics

| Category | Total Files | Already Bilingual | Needs Update |
|----------|-------------|-------------------|--------------|
| Pages | 20 | 14 | 6 |
| Workflow Components | 25 | 5 | 20 |
| Analysis Components | 20 | 10 | 10 |
| Notification Templates | 13 | 4 | 9 |
| **TOTAL** | **78** | **33** | **45** |

---

## Appendix: File Index

### Files Confirmed Bilingual ✅
1. `src/pages/FailureAnalysisDashboard.jsx`
2. `src/pages/PilotDetail.jsx`
3. `src/pages/RDProposalDetail.jsx`
4. `src/pages/Sandboxes.jsx`
5. `src/pages/MII.jsx`
6. `src/pages/ProgramDetail.jsx`
7. `src/pages/RDCallDetail.jsx`
8. `src/pages/Knowledge.jsx`
9. `src/pages/Network.jsx`
10. `src/pages/SandboxDetail.jsx`
11. `src/pages/CampaignPlanner.jsx`
12. `src/pages/EventsAnalyticsDashboard.jsx`
13. `src/pages/CompetitiveIntelligenceDashboard.jsx`
14. All 24 Strategy Wizard prompt files

### Files Requiring Update ❌
See Parts 2.1, 2.2, 2.3 for complete lists with line numbers.
