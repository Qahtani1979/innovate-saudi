# AI Bilingual Implementation Plan - Complete Technical Specification

**Generated:** 2025-12-17 (Updated with Full Schema Analysis)  
**Status:** Ready for Implementation  
**Total Files to Update:** 45 files  
**Estimated Effort:** 4 phases, ~8 days

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Database Schema Analysis](#database-schema-analysis)
3. [Taxonomy & Context Data](#taxonomy--context-data)
4. [Files Requiring Updates](#files-requiring-updates)
5. [Detailed Implementation Changes](#detailed-implementation-changes)
6. [Infrastructure Files](#infrastructure-files)
7. [Testing & Verification](#testing--verification)

---

## Executive Summary

This document provides a comprehensive plan to standardize AI prompts across the codebase to match the Strategy Wizard's bilingual architecture pattern. All AI outputs must include bilingual fields (`_en` / `_ar`) that map directly to database columns.

**Key Principles:**
- All text fields must be bilingual with `_en` and `_ar` suffixes
- Prompts must include Saudi/MoMAH context
- Schemas must enforce bilingual output
- Arabic must be formal (فصحى) suitable for government documents

---

## Database Schema Analysis

### Complete Table-by-Field Bilingual Requirements

#### 1. **challenges** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES - max 100 chars |
| `title_ar` | text | YES - max 100 chars |
| `tagline_en` | text | YES - 15-20 words |
| `tagline_ar` | text | YES - 15-20 words |
| `description_en` | text | YES - 200+ words |
| `description_ar` | text | YES - 200+ words |
| `problem_statement_en` | text | YES |
| `problem_statement_ar` | text | YES |
| `current_situation_en` | text | YES |
| `current_situation_ar` | text | YES |
| `desired_outcome_en` | text | YES |
| `desired_outcome_ar` | text | YES |
| `root_cause_en` | text | YES |
| `root_cause_ar` | text | YES |
| Additional: `sector`, `category`, `priority`, `status`, `kpis` (JSON), `stakeholders` (JSON)

#### 2. **pilots** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES - max 80 chars |
| `title_ar` | text | YES - max 80 chars |
| `tagline_en` | text | YES - 15-20 words |
| `tagline_ar` | text | YES - 15-20 words |
| `description_en` | text | YES - 200+ words |
| `description_ar` | text | YES - 200+ words |
| `objective_en` | text | YES |
| `objective_ar` | text | YES |
| Additional: `hypothesis`, `methodology`, `scope`, `kpis` (JSON), `milestones` (JSON), `risks` (JSON), `team` (JSON), `technology_stack` (JSON)
| Evaluation: `evaluation_summary_en`, `evaluation_summary_ar`, `ai_insights`, `success_probability`, `risk_level`, `recommendation`

#### 3. **sandboxes** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `name` | text | YES (name_en) |
| `name_ar` | text | YES |
| `description` | text | YES (description_en) |
| `description_ar` | text | YES |
| Additional: `domain`, `capacity`, `status`, `regulatory_framework` (JSON), `exemptions_granted` (array)

**NOTE:** Sandboxes table uses `name`/`description` not `name_en`/`description_en` - code must map accordingly!

#### 4. **solutions** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `name_en` | text | YES |
| `name_ar` | text | YES |
| `tagline_en` | text | YES |
| `tagline_ar` | text | YES |
| `description_en` | text | YES - 200+ words |
| `description_ar` | text | YES - 200+ words |
| `value_proposition` | text | YES |
| Additional: `features` (array), `sectors` (array), `trl`, `pricing_model`, `certifications` (JSON)

#### 5. **programs** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `name_en` | text | YES |
| `name_ar` | text | YES |
| `tagline_en` | text | YES |
| `tagline_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| `objectives_en` | text | YES |
| `objectives_ar` | text | YES |
| Additional: `program_type`, `curriculum` (JSON), `benefits` (JSON), `eligibility_criteria` (array)

#### 6. **rd_calls** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| Additional: `call_type`, `focus_areas` (array), `eligibility_criteria` (JSON), `evaluation_criteria` (JSON)

#### 7. **rd_projects** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| `objectives_en` | text | YES |
| `objectives_ar` | text | YES |
| Additional: `research_areas` (array), `methodology`, `expected_outputs` (JSON), `deliverables` (JSON)

#### 8. **events** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| Additional: `event_type`, `venue_name`, `agenda` (JSON), `speakers` (JSON)

#### 9. **contracts** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| Additional: `contract_type`, `terms_and_conditions`, `deliverables` (JSON), `milestones` (JSON)

#### 10. **communication_plans** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `name_en` | text | YES |
| `name_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| `master_narrative_en` | text | YES |
| `master_narrative_ar` | text | YES |
| Additional: `key_messages` (JSON), `channel_strategy` (JSON), `content_calendar` (JSON)

#### 11. **case_studies** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| `description_en` | text | YES |
| `description_ar` | text | YES |
| Additional: `challenge_description`, `solution_description`, `results_achieved`, `lessons_learned`, `metrics` (JSON)

#### 12. **scaling_plans** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `title_en` | text | YES |
| `title_ar` | text | YES |
| Additional: `strategy`, `phases` (JSON), `success_metrics` (JSON), `integration_requirements` (array)

#### 13. **pilot_kpis** Table
| Field | Type | Required AI Output |
|-------|------|-------------------|
| `name` | text | YES (name_en equivalent) |
| `name_ar` | text | YES |
| `description` | text | For context |
| Additional: `baseline`, `target`, `unit`, `measurement_frequency`

---

## Taxonomy & Context Data

### Available Lookup Tables for AI Context Injection

```javascript
// These can be fetched and injected into AI prompts for context
const TAXONOMY_TABLES = {
  // Core Reference Data
  'sectors': { fields: ['id', 'code', 'name_en', 'name_ar', 'description_en', 'description_ar'] },
  'subsectors': { fields: ['id', 'code', 'name_en', 'name_ar', 'sector_id'] },
  'services': { fields: ['id', 'code', 'name_en', 'name_ar', 'sector_id', 'subsector_id'] },
  'regions': { fields: ['id', 'code', 'name_en', 'name_ar'] },
  'cities': { fields: ['id', 'name_en', 'name_ar', 'region_id', 'municipality_id'] },
  
  // Strategic Taxonomy
  'lookup_strategic_themes': { 
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar', 'icon'] 
  },
  'lookup_technologies': { 
    fields: ['code', 'name_en', 'name_ar', 'category', 'description_en', 'description_ar'] 
  },
  'lookup_vision_programs': { 
    fields: ['code', 'name_en', 'name_ar', 'official_url', 'description_en'] 
  },
  'lookup_stakeholder_types': { 
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar'] 
  },
  'lookup_risk_categories': { 
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar'] 
  },
  'lookup_governance_roles': { 
    fields: ['code', 'name_en', 'name_ar', 'description_en', 'description_ar'] 
  }
};
```

### Saudi Context Constants (For All AI Prompts)

```javascript
export const SAUDI_CONTEXT = {
  FULL: `
## SAUDI ARABIA MUNICIPAL INNOVATION CONTEXT

### Ministry of Municipalities and Housing (MoMAH)
MoMAH oversees 285+ municipalities across 13 regions, managing urban development,
infrastructure, and municipal services for 35+ million residents.

### Vision 2030 Alignment
All outputs must support Saudi Vision 2030 objectives:
- Quality of Life Program (جودة الحياة)
- National Transformation Program
- Smart Cities Initiative
- Municipal Excellence Program
- Sustainability & Environment goals

### Key Partners in Innovation Ecosystem
- MCIT (Ministry of Communications): Digital transformation
- SDAIA: AI and data governance
- KAUST, KACST: Research partnerships
- NEOM, Red Sea Project: Mega project innovation
- Saudi Venture Capital Company
- Monsha'at (SME Authority)

### Cultural Requirements
- Use formal Arabic (فصحى) for all Arabic content
- Align with Saudi government communication standards
- Respect local customs and Islamic principles
- Bilingual outputs for diverse stakeholder engagement
`,

  COMPACT: `Saudi MoMAH innovation platform supporting Vision 2030. 
Partners: MCIT, SDAIA, KAUST. Use formal Arabic (فصحى) for government documents.
Align with Quality of Life Program and Municipal Excellence initiatives.`
};
```

---

## Files Requiring Updates

### Priority 1: High-Impact User-Facing Pages (6 files)

| # | File | Current AI Prompts | DB Fields Affected | Issues |
|---|------|-------------------|-------------------|--------|
| 1 | `src/pages/SandboxCreate.jsx` | 1 prompt (L92-116) | sandboxes: name, name_ar, description, description_ar | Schema incomplete, missing objectives, prompt lacks Saudi context |
| 2 | `src/pages/PilotEdit.jsx` | 7 prompts (L233-498) | pilots: all _en/_ar fields, kpis, milestones, risks, evaluation | Partial bilingual - technology/engagement sections English-only |
| 3 | `src/pages/SolutionChallengeMatcher.jsx` | 1 prompt | challenge_proposals | Proposal generation English-only |
| 4 | `src/pages/EmailTemplateManager.jsx` | 1 prompt | email_templates | Template enhancement English-only |
| 5 | `src/pages/RDPortfolioPlanner.jsx` | 1 prompt | rd_projects | Portfolio planning English-only |
| 6 | `src/pages/RiskPortfolio.jsx` | 1 prompt | (analysis only) | Risk analysis English-only |

### Priority 2: Workflow Components (18 files)

| # | File | Current Issues | Required Changes |
|---|------|----------------|------------------|
| 1 | `src/components/sandbox/SandboxCreateWizard.jsx` | Prompt unclear for bilingual | Add explicit bilingual requirements |
| 2 | `src/components/matchmaker/PilotConversionWizard.jsx` | L52-78: Agreement English-only | Add `agreement_ar`, bilingual `key_terms` |
| 3 | `src/components/matchmaker/MultiPartyMatchmaker.jsx` | Consortium English-only | Add bilingual consortium details |
| 4 | `src/components/matchmaker/StrategicChallengeMapper.jsx` | Mapping English-only | Add bilingual challenge mapping |
| 5 | `src/components/matchmaker/FailedMatchLearningEngine.jsx` | Analysis English-only | Add bilingual learning insights |
| 6 | `src/components/scaling/ScalingToProgramConverter.jsx` | Partial bilingual | Complete all program fields |
| 7 | `src/components/scaling/ScalingCostBenefitAnalyzer.jsx` | L17-66: Analysis English-only | Add bilingual `investment_summary`, `recommendations` |
| 8 | `src/components/scaling/AdaptiveRolloutSequencing.jsx` | Rollout English-only | Add bilingual phase descriptions |
| 9 | `src/components/challenges/ChallengeToRDWizard.jsx` | RD call English-only | Add all rd_calls bilingual fields |
| 10 | `src/components/pilots/SuccessPatternAnalyzer.jsx` | Patterns English-only | Add bilingual pattern descriptions |
| 11 | `src/components/pilots/ScalingReadiness.jsx` | Assessment English-only | Add bilingual recommendations |
| 12 | `src/components/pilots/PilotBenchmarking.jsx` | Benchmarks English-only | Add bilingual benchmark insights |
| 13 | `src/components/solutions/ContractGeneratorWizard.jsx` | Contract English-only | Add bilingual contract sections |
| 14 | `src/components/collaboration/PartnershipProposalWizard.jsx` | Proposal English-only | Add bilingual proposal content |
| 15 | `src/components/rd/RDProposalAIScorerWidget.jsx` | Scoring English-only | Add bilingual scoring justification |
| 16 | `src/components/rd/IPCommercializationTracker.jsx` | IP assessment English-only | Add bilingual IP recommendations |
| 17 | `src/components/citizen/AIIdeaClassifier.jsx` | L16-42: Keywords English-only | Add `keywords_ar`, bilingual sector names |
| 18 | `src/components/onboarding/FirstActionRecommender.jsx` | Recommendations English-only | Add bilingual action recommendations |

### Priority 3: Analysis Components (10 files)

| # | File | AI Purpose | Required Changes |
|---|------|------------|------------------|
| 1 | `src/components/data/DuplicateRecordDetector.jsx` | Duplicate detection | Add bilingual reason/recommendation |
| 2 | `src/components/ROICalculator.jsx` | ROI calculation | Add bilingual benchmark, risks |
| 3 | `src/components/ai/AIProgramEventCorrelator.jsx` | Event correlation | Add bilingual insights |
| 4 | `src/components/ai/AIAttendancePredictor.jsx` | Attendance prediction | Add bilingual prediction context |
| 5 | `src/components/ai/AIEventROIPredictor.jsx` | Event ROI | Add bilingual ROI summary |
| 6 | `src/components/ai/AISectorTrendAnalyzer.jsx` | Trend analysis | Add bilingual trend descriptions |
| 7 | `src/components/strategy/CollaborationMapper.jsx` | Collaboration mapping | Add bilingual collaboration notes |
| 8 | `src/components/strategy/cascade/StrategyChallengeGenerator.jsx` | Challenge generation | Verify bilingual output |
| 9 | `src/components/strategy/cascade/StrategyToEventGenerator.jsx` | Event generation | Verify bilingual output |
| 10 | `src/components/strategy/cascade/StrategyToRDCallGenerator.jsx` | RD call generation | Verify bilingual output |

---

## Detailed Implementation Changes

### 1. SandboxCreate.jsx (Lines 86-136)

**Current Prompt (English-only emphasis):**
```javascript
prompt: `Enhance this regulatory sandbox proposal:
Sandbox Name: ${formData.name_en}
Domain: ${formData.domain}
Current Description: ${formData.description_en || 'N/A'}
Provide bilingual enhancements...`
```

**Required Changes:**

```javascript
// src/pages/SandboxCreate.jsx - Lines 92-136
const handleAIEnhancement = async () => {
  const city = cities.find(c => c.id === formData.city_id);
  const organization = organizations.find(o => o.id === formData.organization_id);
  
  const result = await invokeAI({
    prompt: `Enhance regulatory sandbox proposal for Saudi municipal innovation.

## CURRENT DATA
Name: ${formData.name_en}
Name (Arabic): ${formData.name_ar || 'Not provided'}
Domain: ${formData.domain}
City: ${city?.name_en || 'Not selected'} / ${city?.name_ar || ''}
Managing Organization: ${organization?.name_en || 'Not selected'}
Current Description: ${formData.description_en || 'Not provided'}

## BILINGUAL OUTPUT REQUIREMENTS
Generate ALL content in BOTH English AND Arabic (فصحى formal):
- Taglines: Compelling 10-15 word taglines suitable for Saudi government announcements
- Descriptions: Comprehensive narratives (150+ words each language)
- Objectives: Clear regulatory testing objectives aligned with Saudi innovation policy

## REQUIRED OUTPUT FIELDS
1. tagline_en / tagline_ar - Professional taglines
2. description_en / description_ar - Detailed sandbox descriptions  
3. objectives_en / objectives_ar - Clear regulatory testing objectives
4. exemption_suggestions - Array of recommended regulatory exemptions

## SAUDI CONTEXT
MoMAH regulatory sandboxes support Vision 2030 innovation goals.
Coordinate with: MCIT, CITC, SDAIA for technology regulation.
Quality of Life Program alignment required.`,

    response_json_schema: {
      type: 'object',
      required: ['tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objectives_en', 'objectives_ar'],
      properties: {
        tagline_en: { type: 'string', description: 'Compelling tagline in English (10-15 words)' },
        tagline_ar: { type: 'string', description: 'شعار مقنع بالعربية (10-15 كلمة)' },
        description_en: { type: 'string', minLength: 150, description: 'Comprehensive description in English' },
        description_ar: { type: 'string', minLength: 150, description: 'وصف شامل بالعربية' },
        objectives_en: { type: 'string', description: 'Clear regulatory testing objectives' },
        objectives_ar: { type: 'string', description: 'أهداف اختبار تنظيمية واضحة' },
        exemption_suggestions: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Recommended regulatory exemptions for sandbox'
        }
      }
    }
  });

  if (result.success) {
    setFormData({
      ...formData,
      tagline_en: result.data.tagline_en,
      tagline_ar: result.data.tagline_ar,
      description_en: result.data.description_en,
      description_ar: result.data.description_ar,
      objectives_en: result.data.objectives_en,
      objectives_ar: result.data.objectives_ar
    });
    toast.success(t({ en: 'AI enhanced your sandbox', ar: 'تم تحسين منطقة الاختبار بالذكاء الاصطناعي' }));
  }
};
```

### 2. PilotEdit.jsx - Section: 'details' (Lines 326-354)

**Current Prompt:**
```javascript
prompt = `${baseContext}
Current data:
Title EN: ${formData.title_en}
...
Enhance: refined titles, taglines, detailed descriptions...`;
```

**Required Changes:**

```javascript
// Section: 'details' - Full bilingual output
else if (section === 'details') {
  prompt = `${baseContext}

## CURRENT PILOT DATA
Title: ${formData.title_en} | ${formData.title_ar || 'N/A'}
Description (EN): ${formData.description_en?.substring(0, 300) || 'N/A'}
Description (AR): ${formData.description_ar?.substring(0, 300) || 'N/A'}
Objective: ${formData.objective_en || 'N/A'}
Current Hypothesis: ${formData.hypothesis || 'N/A'}
Methodology: ${formData.methodology || 'N/A'}

## BILINGUAL OUTPUT REQUIREMENTS
Enhance ALL text fields in BOTH English AND Arabic (فصحى formal):
- Titles: Compelling, sector-specific (max 80 chars each)
- Taglines: Memorable summaries (15-20 words each)
- Descriptions: Detailed narratives (200+ words each language)
- Objectives: Clear, measurable goals with bilingual text
- Hypothesis: Scientific format hypothesis statement
- Methodology: Step-by-step approach description
- Scope: Clear boundaries and limitations

Use formal Arabic suitable for Saudi government documentation.`;

  schema = {
    type: 'object',
    required: ['title_en', 'title_ar', 'tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objective_en', 'objective_ar'],
    properties: {
      title_en: { type: 'string', maxLength: 80 },
      title_ar: { type: 'string', maxLength: 80 },
      tagline_en: { type: 'string' },
      tagline_ar: { type: 'string' },
      description_en: { type: 'string', minLength: 200 },
      description_ar: { type: 'string', minLength: 200 },
      objective_en: { type: 'string' },
      objective_ar: { type: 'string' },
      hypothesis: { type: 'string' },
      methodology: { type: 'string' },
      scope: { type: 'string' }
    }
  };
}
```

### 3. AIIdeaClassifier.jsx (Lines 16-42)

**Current Prompt:**
```javascript
prompt: `Classify citizen idea and detect issues:
IDEA: ${idea.content || idea.title}
...
Provide: 1. Primary sector... 5. Similar existing challenges...`
```

**Required Changes:**

```javascript
const classifyIdea = async () => {
  const response = await invokeAI({
    prompt: `Classify citizen idea for Saudi municipal innovation platform.

## IDEA DETAILS
Title: ${idea.title}
Content: ${idea.content || idea.description || 'No description'}
Location: ${idea.location || 'Not specified'}
Category: ${idea.category || 'Not specified'}

## CLASSIFICATION REQUIREMENTS
Analyze and classify this citizen idea with bilingual outputs:

1. Primary sector (use standard codes: urban_design, transport, environment, digital_services, utilities, public_safety, parks_recreation, housing)
2. Sector names in both languages
3. Keywords in BOTH English AND Arabic (5-10 relevant terms each)
4. Is it spam/low-quality? (true/false with reason)
5. Sentiment (positive_suggestion, neutral, complaint, urgent_issue)
6. Similar existing challenges (if any patterns detected)
7. Recommended priority (high/medium/low) with justification
8. Quality assessment (0-100 score)

## SAUDI CONTEXT
Ideas should align with Quality of Life Program and municipal service improvement.
Consider Vision 2030 goals in classification.`,

    response_json_schema: {
      type: "object",
      required: ['sector', 'sector_en', 'sector_ar', 'keywords_en', 'keywords_ar', 'is_spam', 'sentiment', 'priority', 'quality_score'],
      properties: {
        sector: { type: "string", description: "Sector code" },
        sector_en: { type: "string", description: "Sector name in English" },
        sector_ar: { type: "string", description: "اسم القطاع بالعربية" },
        keywords_en: { type: "array", items: { type: "string" }, description: "English keywords (5-10)" },
        keywords_ar: { type: "array", items: { type: "string" }, description: "كلمات مفتاحية بالعربية (5-10)" },
        is_spam: { type: "boolean" },
        spam_reason: { type: "string", description: "Reason if spam detected" },
        sentiment: { type: "string", enum: ["positive_suggestion", "neutral", "complaint", "urgent_issue"] },
        similar_patterns: { type: "array", items: { type: "string" } },
        priority: { type: "string", enum: ["high", "medium", "low"] },
        priority_justification_en: { type: "string" },
        priority_justification_ar: { type: "string" },
        quality_score: { type: "number", minimum: 0, maximum: 100 }
      }
    }
  });

  if (response.success && response.data) {
    setClassification(response.data);
    if (onClassified) {
      onClassified(response.data);
    }
    toast.success(t({ en: 'Idea classified', ar: 'تم تصنيف الفكرة' }));
  }
};
```

### 4. ROICalculator.jsx (Lines 26-61)

**Current Prompt:**
```javascript
prompt: `Calculate expected ROI and impact for this initiative:
Type: ${inputs.type}
...
Be realistic and data-driven.`
```

**Required Changes:**

```javascript
const calculateROI = async () => {
  if (!inputs.budget || !inputs.sector) {
    toast.error(t({ en: 'Please fill required fields', ar: 'الرجاء ملء الحقول المطلوبة' }));
    return;
  }

  const result = await invokeAI({
    prompt: `Calculate expected ROI for Saudi municipal innovation initiative.

## INITIATIVE DETAILS
Type: ${inputs.type}
Budget: ${inputs.budget} SAR
Sector: ${inputs.sector}
Duration: ${inputs.duration_months} months
Expected Outcome: ${inputs.expected_outcome}

## ANALYSIS REQUIREMENTS
Based on similar initiatives in Saudi municipal innovation ecosystem, provide:
1. Expected ROI percentage (realistic for Saudi context)
2. Payback period in months
3. Impact score (0-100)
4. Cost per citizen served (SAR)
5. Benchmark comparison with bilingual summary
6. Risk factors with bilingual descriptions (3 key risks)

## OUTPUT REQUIREMENTS
All text outputs must be bilingual (English + Arabic فصحى):
- benchmark_en / benchmark_ar
- risks with risk_en / risk_ar pairs
- recommendation_en / recommendation_ar

## SAUDI CONTEXT
Consider Vision 2030 ROI benchmarks for municipal innovation.
Reference Quality of Life Program metrics where relevant.`,

    response_json_schema: {
      type: "object",
      required: ['roi_percentage', 'payback_months', 'impact_score', 'cost_per_citizen', 'benchmark_en', 'benchmark_ar'],
      properties: {
        roi_percentage: { type: "number" },
        payback_months: { type: "number" },
        impact_score: { type: "number", minimum: 0, maximum: 100 },
        cost_per_citizen: { type: "number" },
        benchmark_en: { type: "string", description: "Comparison to similar initiatives in English" },
        benchmark_ar: { type: "string", description: "مقارنة بمبادرات مماثلة بالعربية" },
        recommendation_en: { type: "string" },
        recommendation_ar: { type: "string" },
        risks: { 
          type: "array", 
          items: { 
            type: "object",
            properties: {
              risk_en: { type: "string" },
              risk_ar: { type: "string" },
              severity: { type: "string", enum: ["high", "medium", "low"] }
            }
          }
        }
      }
    }
  });

  if (result.success) {
    setResults(result.data);
    if (onCalculated) onCalculated(result.data);
    toast.success(t({ en: 'ROI calculated', ar: 'تم حساب العائد على الاستثمار' }));
  }
};
```

### 5. ScalingCostBenefitAnalyzer.jsx (Lines 17-66)

**Current Prompt:**
```javascript
prompt: `Calculate cost-benefit analysis for scaling pilot:
PILOT: ${pilot.title_en}
...`
```

**Required Changes:**

```javascript
const analyzeCostBenefit = async () => {
  const result = await invokeAI({
    prompt: `Calculate cost-benefit analysis for scaling municipal innovation pilot.

## PILOT DETAILS
Title: ${pilot.title_en} | ${pilot.title_ar || ''}
Current Budget: ${pilot.budget} ${pilot.budget_currency || 'SAR'}
Current Results: ${pilot.kpis?.map(k => `${k.name}: ${k.current_value || k.current}`).join(', ')}
Target Municipalities: ${targetMunicipalities.length} cities
Municipality Names: ${targetMunicipalities.map(m => m.name_en).join(', ')}

## ANALYSIS REQUIREMENTS
For scaling to ${targetMunicipalities.length} Saudi municipalities, estimate:
1. Total deployment cost (SAR)
2. Expected annual benefits (cost savings, efficiency gains)
3. Break-even point (months)
4. 3-year ROI percentage
5. Cost per municipality
6. Benefit variance (best/worst case scenarios)
7. Bilingual investment summary and recommendation

## OUTPUT REQUIREMENTS
Provide bilingual summaries:
- investment_summary_en / investment_summary_ar
- recommendation_en / recommendation_ar

## SAUDI CONTEXT
Consider Saudi municipal procurement timelines.
Factor in Vision 2030 municipal transformation costs.
Account for regional variations across Saudi regions.`,

    response_json_schema: {
      type: "object",
      required: ['total_cost', 'annual_benefit', 'break_even_months', 'three_year_roi'],
      properties: {
        total_cost: { type: "number", description: "Total deployment cost in SAR" },
        annual_benefit: { type: "number", description: "Annual benefit in SAR" },
        break_even_months: { type: "number" },
        three_year_roi: { type: "number" },
        cost_per_municipality: { type: "number" },
        benefit_variance: {
          type: "object",
          properties: {
            best_case: { type: "number" },
            worst_case: { type: "number" }
          }
        },
        investment_summary_en: { type: "string", description: "Investment summary in English" },
        investment_summary_ar: { type: "string", description: "ملخص الاستثمار بالعربية" },
        recommendation_en: { type: "string" },
        recommendation_ar: { type: "string" },
        cashflow_projection: {
          type: "array",
          items: {
            type: "object",
            properties: {
              month: { type: "number" },
              cost: { type: "number" },
              benefit: { type: "number" }
            }
          }
        }
      }
    }
  });

  if (result.success) {
    setForecast(result.data);
    toast.success(t({ en: 'Analysis complete', ar: 'اكتمل التحليل' }));
  }
};
```

### 6. PilotConversionWizard.jsx - generatePartnershipAgreement (Lines 52-86)

**Current Prompt:**
```javascript
prompt: `Generate a partnership agreement template...
Generate professional MOU/Partnership Agreement in both Arabic and English with:
1. Parties and background...`
```

**Required Changes:**

```javascript
const generatePartnershipAgreement = async () => {
  const { success, data } = await invokeAI({
    prompt: `Generate MOU/Partnership Agreement for Matchmaker-to-Pilot conversion in Saudi municipal context.

## PARTNERSHIP CONTEXT
Provider: ${application.organization_name_en} | ${application.organization_name_ar || ''}
Challenge: ${challenge?.title_en} | ${challenge?.title_ar || ''}
Municipality: ${challenge?.municipality?.name_en || 'TBD'}
Pilot Objective: ${pilotData.objective_en}
Duration: ${pilotData.duration_weeks} weeks
Budget: ${pilotData.budget} SAR

## AGREEMENT SECTIONS (Bilingual Required)
Generate professional MOU content with ALL sections in BOTH English AND Arabic (فصحى formal):

1. Parties and Background (الأطراف والخلفية)
2. Scope of Collaboration (نطاق التعاون)
3. Roles and Responsibilities (الأدوار والمسؤوليات)
4. Duration and Milestones (المدة والمعالم الرئيسية)
5. Budget and Resource Allocation (الميزانية وتخصيص الموارد)
6. IP and Data Ownership (الملكية الفكرية وملكية البيانات)
7. Success Criteria (معايير النجاح)
8. Exit Clauses (بنود الخروج)

## LEGAL CONTEXT
Follow Saudi commercial contract standards.
Reference relevant Saudi municipal procurement regulations.
Align with MoMAH partnership frameworks.`,

    response_json_schema: {
      type: 'object',
      required: ['agreement_en', 'agreement_ar', 'key_terms_en', 'key_terms_ar'],
      properties: {
        agreement_en: { type: 'string', description: 'Full agreement text in English' },
        agreement_ar: { type: 'string', description: 'نص الاتفاقية الكامل بالعربية' },
        key_terms_en: { type: 'array', items: { type: 'string' }, description: 'Key terms summary in English' },
        key_terms_ar: { type: 'array', items: { type: 'string' }, description: 'ملخص البنود الرئيسية بالعربية' },
        effective_date: { type: 'string' },
        termination_conditions_en: { type: 'string' },
        termination_conditions_ar: { type: 'string' }
      }
    }
  });

  if (success && data) {
    setPilotData({...pilotData, partnership_agreement_url: 'generated_agreement_url'});
    toast.success(t({ en: 'Agreement generated', ar: 'تم إنشاء الاتفاقية' }));
  }
};
```

---

## Infrastructure Files

### 1. Create: src/lib/ai/saudiContext.js

```javascript
/**
 * Saudi Arabia / MoMAH Context Constants for AI Prompts
 */

export const SAUDI_CONTEXT = {
  FULL: `
## SAUDI ARABIA MUNICIPAL INNOVATION CONTEXT

### Ministry of Municipalities and Housing (MoMAH)
وزارة الشؤون البلدية والقروية والإسكان
MoMAH oversees 285+ municipalities across 13 regions, managing urban development,
infrastructure, and municipal services for 35+ million residents.

### Vision 2030 Alignment
All outputs must support Saudi Vision 2030 objectives:
- Quality of Life Program (برنامج جودة الحياة)
- National Transformation Program (برنامج التحول الوطني)
- Smart Cities Initiative
- Municipal Excellence Program
- Sustainability & Environmental Goals

### Key Partners in Innovation Ecosystem
- MCIT (Ministry of Communications): Digital transformation
- SDAIA: AI and data governance
- KAUST, KACST: Research partnerships
- NEOM, Red Sea Project: Mega project innovation
- Saudi Venture Capital Company
- Monsha'at (SME Authority)

### Cultural & Language Requirements
- Use formal Arabic (الفصحى) for all Arabic content
- Align with Saudi government communication standards
- Respect local customs and Islamic principles
- Provide bilingual outputs for diverse stakeholder engagement
`,

  COMPACT: `Saudi MoMAH innovation platform supporting Vision 2030. 
Partners: MCIT, SDAIA, KAUST. Use formal Arabic (فصحى) for government documents.
Align with Quality of Life Program and Municipal Excellence initiatives.`,

  REGULATORY: `Saudi regulatory sandbox framework aligned with:
- MCIT Digital Regulations
- CITC Telecommunications Standards
- SDAIA Data & AI Governance
- Municipal Excellence Guidelines`,

  SECTORS: [
    { code: 'transport', name_en: 'Transport & Mobility', name_ar: 'النقل والتنقل' },
    { code: 'environment', name_en: 'Environment & Sustainability', name_ar: 'البيئة والاستدامة' },
    { code: 'urban_design', name_en: 'Urban Design & Planning', name_ar: 'التصميم والتخطيط الحضري' },
    { code: 'digital_services', name_en: 'Digital Municipal Services', name_ar: 'الخدمات البلدية الرقمية' },
    { code: 'utilities', name_en: 'Utilities & Infrastructure', name_ar: 'المرافق والبنية التحتية' },
    { code: 'public_safety', name_en: 'Public Safety', name_ar: 'السلامة العامة' },
    { code: 'parks_recreation', name_en: 'Parks & Recreation', name_ar: 'الحدائق والترفيه' },
    { code: 'housing', name_en: 'Housing & Construction', name_ar: 'الإسكان والبناء' }
  ]
};

export const BILINGUAL_INSTRUCTIONS = `
## BILINGUAL OUTPUT REQUIREMENTS
Generate ALL text content in BOTH English AND Arabic:
- English: Professional, clear, suitable for international stakeholders
- Arabic: Formal Arabic (فصحى) suitable for Saudi government documents
- Ensure semantic equivalence between languages
- Use proper Arabic grammar and professional terminology
`;

export default SAUDI_CONTEXT;
```

### 2. Create: src/lib/ai/bilingualSchemaBuilder.js

```javascript
/**
 * Helper functions for building consistent bilingual JSON schemas
 */

/**
 * Creates a bilingual text field pair
 * @param {string} fieldName - Base field name (without _en/_ar suffix)
 * @param {object} options - Additional schema options
 */
export function bilingualTextField(fieldName, options = {}) {
  const { minLength, maxLength, description } = options;
  
  const baseProps = { type: 'string' };
  if (minLength) baseProps.minLength = minLength;
  if (maxLength) baseProps.maxLength = maxLength;
  
  return {
    [`${fieldName}_en`]: {
      ...baseProps,
      description: description || `${fieldName} in English`
    },
    [`${fieldName}_ar`]: {
      ...baseProps,
      description: `${fieldName} بالعربية`
    }
  };
}

/**
 * Creates a bilingual array field pair
 * @param {string} fieldName - Base field name
 * @param {object} itemSchema - Schema for array items
 */
export function bilingualArrayField(fieldName, itemSchema = { type: 'string' }) {
  return {
    [`${fieldName}_en`]: {
      type: 'array',
      items: itemSchema,
      description: `${fieldName} in English`
    },
    [`${fieldName}_ar`]: {
      type: 'array',
      items: itemSchema,
      description: `${fieldName} بالعربية`
    }
  };
}

/**
 * Creates a complete bilingual schema for common entity types
 * @param {string} entityType - Type of entity (pilot, sandbox, challenge, etc.)
 */
export function entityBilingualSchema(entityType) {
  const schemas = {
    pilot: {
      type: 'object',
      required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'objective_en', 'objective_ar'],
      properties: {
        ...bilingualTextField('title', { maxLength: 80 }),
        ...bilingualTextField('tagline'),
        ...bilingualTextField('description', { minLength: 150 }),
        ...bilingualTextField('objective'),
        hypothesis: { type: 'string' },
        methodology: { type: 'string' },
        scope: { type: 'string' }
      }
    },
    sandbox: {
      type: 'object',
      required: ['tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objectives_en', 'objectives_ar'],
      properties: {
        ...bilingualTextField('tagline'),
        ...bilingualTextField('description', { minLength: 150 }),
        ...bilingualTextField('objectives'),
        exemption_suggestions: { type: 'array', items: { type: 'string' } }
      }
    },
    challenge: {
      type: 'object',
      required: ['title_en', 'title_ar', 'description_en', 'description_ar'],
      properties: {
        ...bilingualTextField('title', { maxLength: 100 }),
        ...bilingualTextField('tagline'),
        ...bilingualTextField('description', { minLength: 200 }),
        ...bilingualTextField('problem_statement'),
        ...bilingualTextField('desired_outcome')
      }
    },
    program: {
      type: 'object',
      required: ['name_en', 'name_ar', 'description_en', 'description_ar', 'objectives_en', 'objectives_ar'],
      properties: {
        ...bilingualTextField('name'),
        ...bilingualTextField('tagline'),
        ...bilingualTextField('description', { minLength: 150 }),
        ...bilingualTextField('objectives')
      }
    }
  };
  
  return schemas[entityType] || null;
}

export default { bilingualTextField, bilingualArrayField, entityBilingualSchema };
```

---

## Testing & Verification

### Pre-Implementation Checklist

- [ ] Review each file's current AI prompt structure
- [ ] Identify all text fields that need bilingual output
- [ ] Map AI output fields to database columns
- [ ] Ensure schema enforces required bilingual fields

### Post-Implementation Verification

For each updated file, verify:

1. **Prompt Structure**
   - [ ] Includes SAUDI_CONTEXT or equivalent
   - [ ] Specifies bilingual requirements explicitly
   - [ ] Uses formal Arabic (فصحى) instruction

2. **Schema Completeness**
   - [ ] All text fields have `_en` and `_ar` pairs
   - [ ] Required array includes all bilingual pairs
   - [ ] Description fields are bilingual

3. **Database Mapping**
   - [ ] Output fields match database column names
   - [ ] Special cases handled (e.g., sandboxes.name vs name_en)
   - [ ] JSON fields properly structured

4. **UI Integration**
   - [ ] Both languages displayed where appropriate
   - [ ] RTL support for Arabic content
   - [ ] Language toggle works correctly

### Testing Script Template

```javascript
// Test bilingual AI output for [Component Name]
describe('Bilingual AI Output', () => {
  it('should return both _en and _ar fields', async () => {
    const result = await invokeAI({ prompt: testPrompt, schema: testSchema });
    
    expect(result.success).toBe(true);
    expect(result.data.title_en).toBeDefined();
    expect(result.data.title_ar).toBeDefined();
    expect(result.data.title_ar).toMatch(/[\u0600-\u06FF]/); // Contains Arabic
  });
});
```

---

## Implementation Priority & Timeline

### Phase 1: Infrastructure (Day 1)
- [ ] Create `src/lib/ai/saudiContext.js`
- [ ] Create `src/lib/ai/bilingualSchemaBuilder.js`
- [ ] Update existing prompt files to use shared context

### Phase 2: High-Priority Pages (Days 2-3)
- [ ] `SandboxCreate.jsx`
- [ ] `PilotEdit.jsx` (7 sections)
- [ ] `SolutionChallengeMatcher.jsx`
- [ ] `EmailTemplateManager.jsx`
- [ ] `RDPortfolioPlanner.jsx`
- [ ] `RiskPortfolio.jsx`

### Phase 3: Workflow Components (Days 4-6)
- [ ] All 18 workflow components listed in Priority 2
- [ ] Focus on matcher, scaling, and collaboration components

### Phase 4: Analysis Components (Days 7-8)
- [ ] All 10 analysis components listed in Priority 3
- [ ] Final verification and testing

---

## Summary

**Total Changes Required:**
- 6 high-priority pages
- 18 workflow components  
- 10 analysis components
- 2 new infrastructure files
- **34 files total**

**Key Patterns to Follow:**
1. Always include `SAUDI_CONTEXT` or equivalent
2. Enforce bilingual fields in schema with `required` array
3. Map output directly to database column names
4. Use formal Arabic (فصحى) specification
5. Include minLength for description fields (150+ words)

---

*Document Version: 2.0*  
*Last Updated: 2025-12-17*
