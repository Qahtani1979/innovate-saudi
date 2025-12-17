# AI Bilingual Implementation Plan - Complete Technical Specification

**Generated:** 2025-12-17 (Updated with Full Entity Dependencies & Multi-Entity Context)  
**Status:** Ready for Implementation  
**Total Files to Update:** 45 component files + 42 new prompt files  
**Estimated Effort:** 4 phases, ~10 days

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Pattern: Strategy Wizard Reference](#architecture-pattern-strategy-wizard-reference)
3. [Entity Dependencies & Multi-Entity Context](#entity-dependencies--multi-entity-context)
4. [Database Schema Analysis](#database-schema-analysis)
5. [Taxonomy & Context Data](#taxonomy--context-data)
6. [Prompt File Structure](#prompt-file-structure)
7. [Files Requiring Updates](#files-requiring-updates)
8. [Detailed Prompt File Specifications](#detailed-prompt-file-specifications)
9. [Infrastructure Files](#infrastructure-files)
10. [Testing & Verification](#testing--verification)

---

## Executive Summary

This document provides a comprehensive plan to standardize AI prompts across the codebase to match the Strategy Wizard's bilingual architecture pattern. **Critically, all AI prompts must be extracted into separate files** following the Strategy Planning approach.

**Key Principles:**
- **Separated Prompts:** All AI prompts extracted to dedicated `prompts/` directories (NOT inline in components)
- **Multi-Entity Context:** Each prompt function accepts ALL required entity data as parameters
- **Consistent Exports:** Each prompt file exports `getXPrompt(context, data)` function and `xSchema` object
- **Bilingual Fields:** All text fields must have `_en` and `_ar` suffixes
- **Saudi Context:** All prompts include MoMAH/Vision 2030 context
- Arabic must be formal (فصحى) suitable for government documents

---

## Architecture Pattern: Strategy Wizard Reference

### Current Strategy Wizard Structure (REFERENCE MODEL)

```
src/components/strategy/wizard/prompts/
├── index.js                    # Exports all prompts and schemas
├── step1Context.js             # getStep1Prompt(context) + step1Schema
├── step2Vision.js              # getStep2Prompt(context, wizardData) + step2Schema
├── step3Stakeholders.js        # getStep3Prompt(context, wizardData) + step3Schema
├── step3StakeholdersSingle.js  # generateSingleStakeholderPrompt + SINGLE_STAKEHOLDER_SCHEMA
├── step4Pestel.js              # getStep4Prompt(context, wizardData) + step4Schema
├── step5Swot.js                # getStep5Prompt(context, wizardData) + step5Schema
├── step6Scenarios.js           # ...
├── step7Risks.js               # getStep7Prompt + step7Schema
├── step7RisksSingle.js         # generateSingleRiskPrompt + SINGLE_RISK_SCHEMA
├── ...                         # etc.
└── step18Review.js             
```

### Key Pattern Elements:

1. **Prompt Function Signature (with entity data):**
```javascript
export const getStepXPrompt = (context, wizardData, relatedEntities = {}) => {
  const { challenge, solution, pilot, municipality, sector } = relatedEntities;
  
  return `You are a strategic planning expert...
  
  ## CONTEXT
  - Plan Name: ${context.planName}
  - Vision: ${context.vision}
  
  ## RELATED ENTITIES
  - Challenge: ${challenge?.title_en || 'N/A'} | ${challenge?.title_ar || ''}
  - Solution: ${solution?.name_en || 'N/A'}
  - Municipality: ${municipality?.name_en || 'N/A'} | ${municipality?.name_ar || ''}
  ...
  
  ## REQUIREMENTS
  Generate bilingual output for ALL fields...`;
};
```

2. **Schema Export:**
```javascript
export const stepXSchema = {
  type: 'object',
  required: ['field_en', 'field_ar', ...],
  properties: {
    field_en: { type: 'string', description: 'English description' },
    field_ar: { type: 'string', description: 'الوصف بالعربية' },
    ...
  }
};
```

3. **Index File Aggregation:**
```javascript
// index.js
export { getStep1Prompt, step1Schema } from './step1Context';
export { getStep2Prompt, step2Schema } from './step2Vision';
// ...
export const STEP_PROMPT_MAP = {
  1: { promptKey: 'getStep1Prompt', schemaKey: 'step1Schema' },
  // ...
};
```

---

## Entity Dependencies & Multi-Entity Context

### CRITICAL: Prompts Require Multi-Entity Data

Many AI prompts require data from MULTIPLE entities as input. The prompt files must accept all necessary entity data as parameters.

### Complete Entity Dependency Map

| Prompt File | Primary Entity | Required Related Entities | Fields Used from Each Entity |
|-------------|---------------|---------------------------|------------------------------|
| **sandbox/sandboxEnhancement.js** | `sandbox` | `sector`, `city`, `municipality`, `organization` | sector: name_en/ar, code; city: name_en/ar; municipality: name_en/ar; org: name_en/ar, type |
| **sandbox/sandboxEvaluation.js** | `sandbox` | `sandbox_applications[]`, `sandbox_incidents[]`, `regulatory_exemptions[]` | applications: count, status; incidents: severity; exemptions: regulation, status |
| **pilot/pilotDetails.js** | `pilot` | `challenge`, `solution`, `sector`, `municipality`, `strategic_plan` | challenge: title_en/ar, description, sector; solution: name_en/ar; sector: name_en/ar |
| **pilot/pilotKpis.js** | `pilot` | `challenge`, `sector`, `kpi_references[]` | challenge: kpis (JSON); sector: typical KPIs; kpi_refs: unit, measurement |
| **pilot/pilotMilestones.js** | `pilot` | `challenge`, `solution` | challenge: timeline_estimate; solution: implementation_time |
| **pilot/pilotRisks.js** | `pilot` | `challenge`, `sector`, `municipality` | challenge: constraints; sector: typical risks; municipality: capacity |
| **pilot/pilotTechnology.js** | `pilot` | `solution`, `challenge` | solution: technology_stack, features; challenge: required_technologies |
| **pilot/pilotEvaluation.js** | `pilot` | `pilot_kpis[]`, `pilot_kpi_datapoints[]`, `stakeholder_feedback[]`, `pilot_expenses[]` | kpis: current/target; datapoints: values; feedback: ratings; expenses: amounts |
| **pilot/pilotScalingReadiness.js** | `pilot` | `pilot_kpis[]`, `municipality`, `strategic_plan`, `solution` | kpis: achievement %; municipality: capacity; plan: objectives |
| **pilot/pilotBenchmarking.js** | `pilot` | `pilots[]` (similar), `sector`, `municipality` | other pilots: same sector, KPI achievements |
| **matchmaker/proposalGeneration.js** | `matchmaker_application` | `challenge`, `organization`, `solutions[]`, `provider` | challenge: full details; org: capabilities; solutions: features |
| **matchmaker/partnershipAgreement.js** | `matchmaker_application` | `challenge`, `organization`, `municipality`, `pilot` (new) | all entity titles/names for legal document |
| **matchmaker/multiPartyConsortium.js** | `challenge` | `organizations[]`, `providers[]`, `solutions[]` | challenge: requirements; orgs: capabilities; providers: expertise |
| **matchmaker/strategicChallengeMapping.js** | `challenge` | `strategic_plans[]`, `objectives[]`, `sectors[]` | plans: vision, objectives; sectors: priorities |
| **matchmaker/failedMatchLearning.js** | `challenge_solution_matches[]` | `challenges[]`, `solutions[]`, `organizations[]` | matches: rejection reasons, scores |
| **matchmaker/engagementQuality.js** | `matchmaker_application` | `engagement_history[]`, `challenge`, `organization` | history: meetings, documents, dates |
| **scaling/costBenefitAnalysis.js** | `pilot` | `municipalities[]` (targets), `pilot_kpis[]`, `pilot_expenses[]` | pilot: budget, results; municipalities: population, capacity |
| **scaling/programConversion.js** | `pilot` | `challenge`, `solution`, `pilot_kpis[]`, `stakeholder_feedback[]`, `lessons_learned` | pilot: full evaluation; challenge: sector; kpis: achievements |
| **scaling/adaptiveRollout.js** | `scaling_plan` | `pilot`, `municipalities[]`, `regions[]` | pilot: results; municipalities: readiness scores |
| **challenge/challengeEnhancement.js** | `challenge` | `sector`, `municipality`, `region`, `service` | sector: name_en/ar, description; municipality: name_en/ar; region: name_en/ar |
| **challenge/challengeImpact.js** | `challenge` | `municipality`, `sector`, `related_pilots[]` | challenge: scores, population; municipality: population; pilots: results |
| **challenge/challengeToRD.js** | `challenge` | `strategic_plan`, `sector`, `rd_calls[]` (existing) | challenge: problem, requirements; plan: objectives; sector: priorities |
| **solution/solutionEnhancement.js** | `solution` | `sectors[]`, `organization`, `solution_cases[]` | sectors: names; org: type; cases: results |
| **solution/contractGeneration.js** | `solution` | `challenge`, `organization`, `pilot`, `municipality` | all parties for contract terms |
| **rd/proposalScoring.js** | `rd_proposal` | `rd_call`, `organization`, `researcher_profiles[]` | call: criteria; org: track record; researchers: publications |
| **rd/portfolioPlanning.js** | `rd_projects[]` | `strategic_plans[]`, `sectors[]`, `budgets[]` | projects: status, budget; plans: objectives; budgets: allocation |
| **citizen/ideaClassification.js** | `citizen_idea` | `sectors[]`, `challenges[]` (similar), `citizen_feedback[]` (user history) | idea: content; sectors: codes/names; challenges: patterns |
| **analysis/roiCalculation.js** | varies | `pilot` OR `program` OR `scaling_plan`, `pilot_kpis[]`, `pilot_expenses[]`, `municipality` | costs, benefits, population |
| **analysis/duplicateDetection.js** | entity[] | same entity type records | titles, descriptions, embeddings |
| **communication/partnershipProposal.js** | `partnership` | `organization`, `strategic_plan`, `municipality` | partnership: type, objectives; org: capabilities |
| **livinglab/collaboration.js** | `living_lab` | `living_labs[]`, `equipment[]`, `research_themes[]` | labs: focus areas, equipment; themes: overlap |
| **pilots/policyWorkflow.js** | `pilot` | `pilot_kpis[]`, `lessons_learned[]`, `sector`, `municipality` | pilot: evaluation; kpis: results; lessons: insights |
| **sandbox/regulatoryGap.js** | `sandbox_application` | `sandbox`, `sector`, `regulations[]` | app: description; sandbox: framework; regulations: requirements |

### Entity Field Extraction Requirements

#### Primary Entity: `challenge`
```javascript
// Fields commonly needed by AI prompts
const challengeContext = {
  // Core bilingual fields
  title_en: challenge.title_en,
  title_ar: challenge.title_ar,
  description_en: challenge.description_en,
  description_ar: challenge.description_ar,
  problem_statement_en: challenge.problem_statement_en,
  problem_statement_ar: challenge.problem_statement_ar,
  
  // Metadata for AI context
  sector: challenge.sector,
  sector_id: challenge.sector_id,
  category: challenge.category,
  priority: challenge.priority,
  status: challenge.status,
  budget_estimate: challenge.budget_estimate,
  impact_score: challenge.impact_score,
  severity_score: challenge.severity_score,
  affected_population_size: challenge.affected_population_size,
  
  // JSON fields (need parsing)
  kpis: challenge.kpis,
  stakeholders: challenge.stakeholders,
  constraints: challenge.constraints,
  root_causes: challenge.root_causes,
  
  // Foreign keys (need lookups)
  municipality_id: challenge.municipality_id,
  region_id: challenge.region_id,
  strategic_plan_ids: challenge.strategic_plan_ids
};
```

#### Primary Entity: `pilot`
```javascript
const pilotContext = {
  // Core bilingual fields
  title_en: pilot.title_en,
  title_ar: pilot.title_ar,
  tagline_en: pilot.tagline_en,
  tagline_ar: pilot.tagline_ar,
  description_en: pilot.description_en,
  description_ar: pilot.description_ar,
  objective_en: pilot.objective_en,
  objective_ar: pilot.objective_ar,
  
  // Pilot-specific fields
  hypothesis: pilot.hypothesis,
  methodology: pilot.methodology,
  scope: pilot.scope,
  duration_weeks: pilot.duration_weeks,
  budget: pilot.budget,
  stage: pilot.stage,
  success_probability: pilot.success_probability,
  risk_level: pilot.risk_level,
  
  // JSON fields
  kpis: pilot.kpis,
  milestones: pilot.milestones,
  risks: pilot.risks,
  team: pilot.team,
  technology_stack: pilot.technology_stack,
  lessons_learned: pilot.lessons_learned,
  
  // Evaluation fields
  evaluation_summary_en: pilot.evaluation_summary_en,
  evaluation_summary_ar: pilot.evaluation_summary_ar,
  
  // Foreign keys
  challenge_id: pilot.challenge_id,
  solution_id: pilot.solution_id,
  municipality_id: pilot.municipality_id,
  strategic_plan_ids: pilot.strategic_plan_ids
};
```

#### Primary Entity: `matchmaker_application`
```javascript
const applicationContext = {
  // Organization info (embedded or lookup)
  organization_name_en: application.organization_name_en,
  organization_name_ar: application.organization_name_ar,
  organization_id: application.organization_id,
  
  // Match context
  match_type: application.match_type,
  match_score: application.match_score,
  stage: application.stage,
  
  // Proposal details
  proposal_summary: application.proposal_summary,
  value_proposition: application.value_proposition,
  
  // Foreign keys
  challenge_id: application.challenge_id,
  solution_id: application.solution_id
};
```

### Prompt Function Signature Pattern

All prompt functions MUST follow this pattern to accept multi-entity data:

```javascript
/**
 * @param {Object} context - Saudi context and bilingual instructions
 * @param {Object} primaryData - The main entity data (pilot, challenge, etc.)
 * @param {Object} relatedEntities - All related entity data needed
 */
export const getPromptName = (context, primaryData, relatedEntities = {}) => {
  const {
    challenge,      // Related challenge
    solution,       // Related solution
    sector,         // Sector lookup
    municipality,   // Municipality lookup
    organization,   // Organization lookup
    kpis,           // Array of KPI records
    feedbacks,      // Array of feedback records
    strategicPlan,  // Related strategic plan
    // ... other entities as needed
  } = relatedEntities;
  
  return `You are a ${role} for Saudi Arabia's MoMAH...
  
  ## PRIMARY ENTITY: ${entityType}
  ${formatPrimaryEntityDetails(primaryData)}
  
  ## RELATED CONTEXT
  ### Challenge
  - Title: ${challenge?.title_en || 'N/A'} | ${challenge?.title_ar || ''}
  - Sector: ${challenge?.sector || sector?.name_en || 'N/A'}
  
  ### Solution
  - Name: ${solution?.name_en || 'N/A'} | ${solution?.name_ar || ''}
  
  ### Municipality
  - Name: ${municipality?.name_en || 'N/A'} | ${municipality?.name_ar || ''}
  - Population: ${municipality?.population || 'N/A'}
  
  ## KPIs (${kpis?.length || 0} defined)
  ${kpis?.map(k => `- ${k.name}: ${k.current}/${k.target} ${k.unit}`).join('\n') || 'None defined'}
  
  ${context.BILINGUAL_INSTRUCTIONS}
  
  ## GENERATE BILINGUAL OUTPUT
  ...`;
};
```

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

// Regulatory context for sandbox prompts
export const REGULATORY_CONTEXT = `
### Saudi Regulatory Framework
- Municipal and Rural Affairs regulations
- PDPL (Personal Data Protection Law) compliance
- CITC telecommunications regulations
- Environmental regulations (PME)
- Building and construction codes
- Commercial licensing requirements`;

// Sector-specific contexts
export const SECTOR_CONTEXTS = {
  SMART_CITIES: `Smart Cities: IoT infrastructure, 5G networks, data platforms, AI services`,
  ENVIRONMENT: `Environment: Waste management, air quality, green spaces, sustainability`,
  INFRASTRUCTURE: `Infrastructure: Roads, utilities, public facilities, maintenance`,
  CITIZEN_SERVICES: `Citizen Services: Digital services, permits, complaints, engagement`
};
```

---

## Component Implementation Patterns

### How Components Should Fetch & Pass Multi-Entity Data

Components must fetch ALL related entities before invoking AI. This ensures prompts have complete context.

### Pattern 1: PilotConversionWizard (Application → Pilot Conversion)

**Current Code (BEFORE):**
```javascript
// ❌ INCOMPLETE - Missing entity context
export default function PilotConversionWizard({ application, challenge, onClose }) {
  const generatePartnershipAgreement = async () => {
    const { success, data } = await invokeAI({
      prompt: `Generate a partnership agreement...
        PROVIDER: ${application.organization_name_en}
        CHALLENGE: ${challenge?.title_en}
        ...`,
      response_json_schema: { /* inline schema */ }
    });
  };
}
```

**Updated Code (AFTER):**
```javascript
// ✅ COMPLETE - Fetches all required entities, uses separated prompt
import { getPartnershipAgreementPrompt, partnershipAgreementSchema } from '@/lib/ai/prompts/matchmaker';
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '@/lib/ai/prompts/saudiContext';

export default function PilotConversionWizard({ application, challenge, onClose }) {
  // Fetch related entities
  const { data: organization } = useQuery({
    queryKey: ['organization', application?.organization_id],
    queryFn: () => base44.entities.Organization.get(application.organization_id),
    enabled: !!application?.organization_id
  });
  
  const { data: municipality } = useQuery({
    queryKey: ['municipality', challenge?.municipality_id],
    queryFn: () => base44.entities.Municipality.get(challenge.municipality_id),
    enabled: !!challenge?.municipality_id
  });
  
  const { data: sector } = useQuery({
    queryKey: ['sector', challenge?.sector_id],
    queryFn: () => base44.entities.Sector.get(challenge.sector_id),
    enabled: !!challenge?.sector_id
  });

  const generatePartnershipAgreement = async () => {
    const context = { SAUDI_CONTEXT: SAUDI_CONTEXT.COMPACT, BILINGUAL_INSTRUCTIONS };
    
    const relatedEntities = {
      challenge: {
        title_en: challenge?.title_en,
        title_ar: challenge?.title_ar,
        description_en: challenge?.description_en,
        sector: challenge?.sector
      },
      organization: {
        name_en: organization?.name_en,
        name_ar: organization?.name_ar,
        organization_type: organization?.organization_type,
        capabilities: organization?.capabilities
      },
      municipality: {
        name_en: municipality?.name_en,
        name_ar: municipality?.name_ar
      },
      sector: {
        name_en: sector?.name_en,
        name_ar: sector?.name_ar
      }
    };
    
    const { success, data } = await invokeAI({
      prompt: getPartnershipAgreementPrompt(context, pilotData, relatedEntities),
      response_json_schema: partnershipAgreementSchema
    });
    // Handle result...
  };
}
```

### Pattern 2: ScalingCostBenefitAnalyzer (Multi-Municipality Context)

**Updated Code:**
```javascript
import { getCostBenefitAnalysisPrompt, costBenefitAnalysisSchema } from '@/lib/ai/prompts/scaling';

export default function ScalingCostBenefitAnalyzer({ pilot, targetMunicipalities }) {
  // Fetch pilot KPIs
  const { data: pilotKpis = [] } = useQuery({
    queryKey: ['pilot-kpis', pilot?.id],
    queryFn: () => base44.entities.PilotKPI.filter({ pilot_id: pilot.id }),
    enabled: !!pilot?.id
  });
  
  // Fetch pilot expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['pilot-expenses', pilot?.id],
    queryFn: () => base44.entities.PilotExpense.filter({ pilot_id: pilot.id }),
    enabled: !!pilot?.id
  });
  
  // Fetch challenge details
  const { data: challenge } = useQuery({
    queryKey: ['challenge', pilot?.challenge_id],
    queryFn: () => base44.entities.Challenge.get(pilot.challenge_id),
    enabled: !!pilot?.challenge_id
  });

  const analyzeCostBenefit = async () => {
    const relatedEntities = {
      challenge,
      kpis: pilotKpis.map(k => ({
        name_en: k.name,
        name_ar: k.name_ar,
        baseline: k.baseline,
        current: k.current_value,
        target: k.target,
        unit: k.unit
      })),
      expenses: expenses.map(e => ({
        category: e.category,
        amount: e.amount,
        description: e.description
      })),
      targetMunicipalities: targetMunicipalities.map(m => ({
        name_en: m.name_en,
        name_ar: m.name_ar,
        population: m.population,
        region: m.region_id
      }))
    };
    
    const result = await invokeAI({
      prompt: getCostBenefitAnalysisPrompt(context, pilot, relatedEntities),
      response_json_schema: costBenefitAnalysisSchema
    });
  };
}
```

### Pattern 3: MultiLabCollaborationEngine (Cross-Entity Comparison)

**Updated Code:**
```javascript
import { getMultiLabCollaborationPrompt, multiLabCollaborationSchema } from '@/lib/ai/prompts/livinglab';

export default function MultiLabCollaborationEngine({ currentLabId }) {
  // Fetch all labs
  const { data: labs = [] } = useQuery({
    queryKey: ['living-labs'],
    queryFn: () => base44.entities.LivingLab.list()
  });
  
  // Fetch equipment for current lab
  const { data: equipment = [] } = useQuery({
    queryKey: ['lab-equipment', currentLabId],
    queryFn: () => base44.entities.LivingLabResource.filter({ living_lab_id: currentLabId }),
    enabled: !!currentLabId
  });

  const currentLab = labs.find(l => l.id === currentLabId);
  const otherLabs = labs.filter(l => l.id !== currentLabId);

  const findCollaborations = async () => {
    const relatedEntities = {
      currentLab: {
        name_en: currentLab?.name_en,
        name_ar: currentLab?.name_ar,
        research_themes: currentLab?.research_themes,
        equipment: equipment.map(e => ({
          name: e.name,
          type: e.resource_type
        })),
        focus_areas: currentLab?.focus_areas
      },
      otherLabs: otherLabs.slice(0, 10).map(l => ({
        id: l.id,
        name_en: l.name_en,
        name_ar: l.name_ar,
        research_themes: l.research_themes,
        focus_areas: l.focus_areas,
        location: l.location
      }))
    };
    
    const result = await invokeAI({
      prompt: getMultiLabCollaborationPrompt(context, currentLab, relatedEntities),
      response_json_schema: multiLabCollaborationSchema
    });
  };
}
```

### Pattern 4: PilotToPolicyWorkflow (Pilot + Evaluation Data)

**Updated Code:**
```javascript
import { getPilotToPolicyPrompt, pilotToPolicySchema } from '@/lib/ai/prompts/pilot';

export default function PilotToPolicyWorkflow({ pilot, onClose }) {
  // Fetch pilot KPIs with datapoints
  const { data: kpis = [] } = useQuery({
    queryKey: ['pilot-kpis', pilot?.id],
    queryFn: async () => {
      const kpiList = await base44.entities.PilotKPI.filter({ pilot_id: pilot.id });
      // Fetch datapoints for each KPI
      const withDatapoints = await Promise.all(kpiList.map(async (kpi) => {
        const datapoints = await base44.entities.PilotKPIDatapoint.filter({ pilot_kpi_id: kpi.id });
        return { ...kpi, datapoints };
      }));
      return withDatapoints;
    },
    enabled: !!pilot?.id
  });
  
  // Fetch stakeholder feedback
  const { data: feedback = [] } = useQuery({
    queryKey: ['stakeholder-feedback', pilot?.id],
    queryFn: () => base44.entities.StakeholderFeedback.filter({ entity_id: pilot.id, entity_type: 'pilot' }),
    enabled: !!pilot?.id
  });
  
  // Fetch municipality
  const { data: municipality } = useQuery({
    queryKey: ['municipality', pilot?.municipality_id],
    queryFn: () => base44.entities.Municipality.get(pilot.municipality_id),
    enabled: !!pilot?.municipality_id
  });
  
  // Fetch sector
  const { data: sector } = useQuery({
    queryKey: ['sector-by-name', pilot?.sector],
    queryFn: () => base44.entities.Sector.filter({ name_en: pilot.sector }).then(r => r[0]),
    enabled: !!pilot?.sector
  });

  const generateAI = async () => {
    const relatedEntities = {
      kpis: kpis.map(k => ({
        name_en: k.name,
        name_ar: k.name_ar,
        baseline: k.baseline,
        current: k.current_value,
        target: k.target,
        achievement_percentage: k.target ? ((k.current_value || 0) / k.target * 100) : 0,
        trend: k.datapoints?.slice(-5).map(d => d.value)
      })),
      feedback: feedback.map(f => ({
        rating: f.rating,
        feedback_text: f.feedback_text,
        stakeholder_type: f.stakeholder_type
      })),
      municipality: {
        name_en: municipality?.name_en,
        name_ar: municipality?.name_ar
      },
      sector: {
        name_en: sector?.name_en,
        name_ar: sector?.name_ar
      },
      lessonsLearned: pilot?.lessons_learned
    };
    
    const result = await invokeAI({
      prompt: getPilotToPolicyPrompt(context, pilot, relatedEntities),
      response_json_schema: pilotToPolicySchema
    });
  };
}
```

### Utility Hook: useEntityRelations

Create a reusable hook for fetching common entity relations:

```javascript
// src/hooks/useEntityRelations.js
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useEntityRelations(entityType, entityId, entityData) {
  // Fetch sector
  const { data: sector } = useQuery({
    queryKey: ['sector', entityData?.sector_id],
    queryFn: () => base44.entities.Sector.get(entityData.sector_id),
    enabled: !!entityData?.sector_id
  });
  
  // Fetch municipality
  const { data: municipality } = useQuery({
    queryKey: ['municipality', entityData?.municipality_id],
    queryFn: () => base44.entities.Municipality.get(entityData.municipality_id),
    enabled: !!entityData?.municipality_id
  });
  
  // Fetch challenge (for pilots)
  const { data: challenge } = useQuery({
    queryKey: ['challenge', entityData?.challenge_id],
    queryFn: () => base44.entities.Challenge.get(entityData.challenge_id),
    enabled: !!entityData?.challenge_id && entityType === 'pilot'
  });
  
  // Fetch solution (for pilots)
  const { data: solution } = useQuery({
    queryKey: ['solution', entityData?.solution_id],
    queryFn: () => base44.entities.Solution.get(entityData.solution_id),
    enabled: !!entityData?.solution_id && entityType === 'pilot'
  });
  
  // Fetch strategic plans
  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans', entityData?.strategic_plan_ids],
    queryFn: async () => {
      if (!entityData?.strategic_plan_ids?.length) return [];
      return Promise.all(
        entityData.strategic_plan_ids.map(id => 
          base44.entities.StrategicPlan.get(id)
        )
      );
    },
    enabled: !!entityData?.strategic_plan_ids?.length
  });
  
  return {
    sector,
    municipality,
    challenge,
    solution,
    strategicPlans,
    isLoading: false // Combine loading states as needed
  };
}
```

---

## Prompt File Structure (NEW FILES TO CREATE)

### Directory Structure

Following the Strategy Wizard pattern, create these new prompt directories and files:

```
src/lib/ai/prompts/
├── index.js                          # Central export for all domain prompts
├── saudiContext.js                   # Shared Saudi/MoMAH context constants
├── bilingualSchemaBuilder.js         # Helper utilities for schema building
│
├── sandbox/
│   ├── index.js                      # Export all sandbox prompts
│   ├── sandboxEnhancement.js         # getSandboxEnhancementPrompt + sandboxEnhancementSchema
│   └── sandboxEvaluation.js          # getSandboxEvaluationPrompt + sandboxEvaluationSchema
│
├── pilot/
│   ├── index.js                      # Export all pilot prompts
│   ├── pilotDetails.js               # getPilotDetailsPrompt + pilotDetailsSchema
│   ├── pilotKpis.js                  # getPilotKpisPrompt + pilotKpisSchema
│   ├── pilotMilestones.js            # getPilotMilestonesPrompt + pilotMilestonesSchema
│   ├── pilotRisks.js                 # getPilotRisksPrompt + pilotRisksSchema
│   ├── pilotTechnology.js            # getPilotTechnologyPrompt + pilotTechnologySchema
│   ├── pilotEngagement.js            # getPilotEngagementPrompt + pilotEngagementSchema
│   ├── pilotEvaluation.js            # getPilotEvaluationPrompt + pilotEvaluationSchema
│   ├── pilotBenchmarking.js          # getPilotBenchmarkingPrompt + pilotBenchmarkingSchema
│   └── pilotScalingReadiness.js      # getPilotScalingReadinessPrompt + pilotScalingReadinessSchema
│
├── matchmaker/
│   ├── index.js                      # Export all matchmaker prompts
│   ├── proposalGeneration.js         # getProposalGenerationPrompt + proposalGenerationSchema
│   ├── partnershipAgreement.js       # getPartnershipAgreementPrompt + partnershipAgreementSchema
│   ├── multiPartyConsortium.js       # getMultiPartyConsortiumPrompt + multiPartyConsortiumSchema
│   ├── strategicChallengeMapping.js  # getStrategicChallengeMappingPrompt + strategicChallengeMappingSchema
│   └── failedMatchLearning.js        # getFailedMatchLearningPrompt + failedMatchLearningSchema
│
├── scaling/
│   ├── index.js                      # Export all scaling prompts
│   ├── costBenefitAnalysis.js        # getCostBenefitAnalysisPrompt + costBenefitAnalysisSchema
│   ├── programConversion.js          # getProgramConversionPrompt + programConversionSchema
│   └── adaptiveRollout.js            # getAdaptiveRolloutPrompt + adaptiveRolloutSchema
│
├── challenge/
│   ├── index.js                      # Export all challenge prompts
│   ├── challengeEnhancement.js       # getChallengeEnhancementPrompt + challengeEnhancementSchema
│   └── challengeToRD.js              # getChallengeToRDPrompt + challengeToRDSchema
│
├── solution/
│   ├── index.js                      # Export all solution prompts
│   ├── solutionEnhancement.js        # getSolutionEnhancementPrompt + solutionEnhancementSchema
│   └── contractGeneration.js         # getContractGenerationPrompt + contractGenerationSchema
│
├── rd/
│   ├── index.js                      # Export all R&D prompts
│   ├── proposalScoring.js            # getProposalScoringPrompt + proposalScoringSchema
│   ├── ipCommercialization.js        # getIPCommercializationPrompt + ipCommercializationSchema
│   └── portfolioPlanning.js          # getPortfolioPlanningPrompt + portfolioPlanningSchema
│
├── citizen/
│   ├── index.js                      # Export all citizen prompts
│   └── ideaClassification.js         # getIdeaClassificationPrompt + ideaClassificationSchema
│
├── analysis/
│   ├── index.js                      # Export all analysis prompts
│   ├── roiCalculation.js             # getROICalculationPrompt + roiCalculationSchema
│   ├── duplicateDetection.js         # getDuplicateDetectionPrompt + duplicateDetectionSchema
│   ├── trendAnalysis.js              # getTrendAnalysisPrompt + trendAnalysisSchema
│   ├── eventCorrelation.js           # getEventCorrelationPrompt + eventCorrelationSchema
│   ├── attendancePrediction.js       # getAttendancePredictionPrompt + attendancePredictionSchema
│   └── eventROI.js                   # getEventROIPrompt + eventROISchema
│
└── communication/
    ├── index.js                      # Export all communication prompts
    ├── emailTemplate.js              # getEmailTemplatePrompt + emailTemplateSchema
    └── partnershipProposal.js        # getPartnershipProposalPrompt + partnershipProposalSchema
```

### Total New Files: 42 prompt files

---

## Files Requiring Updates (Component Changes)

After extracting prompts, components need minimal changes - just import and use the prompt functions.

### Priority 1: High-Impact User-Facing Pages (6 files)

| # | Component File | Prompt File(s) to Create | Changes in Component |
|---|------|-------------------|-------------------|
| 1 | `src/pages/SandboxCreate.jsx` | `sandbox/sandboxEnhancement.js` | Replace inline prompt with: `import { getSandboxEnhancementPrompt, sandboxEnhancementSchema } from '@/lib/ai/prompts/sandbox'` |
| 2 | `src/pages/PilotEdit.jsx` | `pilot/*.js` (7 files) | Replace 7 inline prompts with imports from `@/lib/ai/prompts/pilot` |
| 3 | `src/pages/SolutionChallengeMatcher.jsx` | `matchmaker/proposalGeneration.js` | Import from `@/lib/ai/prompts/matchmaker` |
| 4 | `src/pages/EmailTemplateManager.jsx` | `communication/emailTemplate.js` | Import from `@/lib/ai/prompts/communication` |
| 5 | `src/pages/RDPortfolioPlanner.jsx` | `rd/portfolioPlanning.js` | Import from `@/lib/ai/prompts/rd` |
| 6 | `src/pages/RiskPortfolio.jsx` | `analysis/riskAnalysis.js` | Import from `@/lib/ai/prompts/analysis` |

### Priority 2: Workflow Components (18 files)

| # | Component File | Prompt File(s) to Create | Changes in Component |
|---|------|----------------|------------------|
| 1 | `src/components/sandbox/SandboxCreateWizard.jsx` | Uses `sandbox/sandboxEnhancement.js` | Import prompt, remove inline code |
| 2 | `src/components/matchmaker/PilotConversionWizard.jsx` | `matchmaker/partnershipAgreement.js` | Import prompt, remove inline code |
| 3 | `src/components/matchmaker/MultiPartyMatchmaker.jsx` | `matchmaker/multiPartyConsortium.js` | Import prompt, remove inline code |
| 4 | `src/components/matchmaker/StrategicChallengeMapper.jsx` | `matchmaker/strategicChallengeMapping.js` | Import prompt, remove inline code |
| 5 | `src/components/matchmaker/FailedMatchLearningEngine.jsx` | `matchmaker/failedMatchLearning.js` | Import prompt, remove inline code |
| 6 | `src/components/scaling/ScalingToProgramConverter.jsx` | `scaling/programConversion.js` | Import prompt, remove inline code |
| 7 | `src/components/scaling/ScalingCostBenefitAnalyzer.jsx` | `scaling/costBenefitAnalysis.js` | Import prompt, remove inline code |
| 8 | `src/components/scaling/AdaptiveRolloutSequencing.jsx` | `scaling/adaptiveRollout.js` | Import prompt, remove inline code |
| 9 | `src/components/challenges/ChallengeToRDWizard.jsx` | `challenge/challengeToRD.js` | Import prompt, remove inline code |
| 10 | `src/components/pilots/SuccessPatternAnalyzer.jsx` | `pilot/successPattern.js` | Import prompt, remove inline code |
| 11 | `src/components/pilots/ScalingReadiness.jsx` | `pilot/pilotScalingReadiness.js` | Import prompt, remove inline code |
| 12 | `src/components/pilots/PilotBenchmarking.jsx` | `pilot/pilotBenchmarking.js` | Import prompt, remove inline code |
| 13 | `src/components/solutions/ContractGeneratorWizard.jsx` | `solution/contractGeneration.js` | Import prompt, remove inline code |
| 14 | `src/components/collaboration/PartnershipProposalWizard.jsx` | `communication/partnershipProposal.js` | Import prompt, remove inline code |
| 15 | `src/components/rd/RDProposalAIScorerWidget.jsx` | `rd/proposalScoring.js` | Import prompt, remove inline code |
| 16 | `src/components/rd/IPCommercializationTracker.jsx` | `rd/ipCommercialization.js` | Import prompt, remove inline code |
| 17 | `src/components/citizen/AIIdeaClassifier.jsx` | `citizen/ideaClassification.js` | Import prompt, remove inline code |
| 18 | `src/components/onboarding/FirstActionRecommender.jsx` | `onboarding/actionRecommendation.js` | Import prompt, remove inline code |

### Priority 3: Analysis Components (10 files)

| # | Component File | Prompt File(s) to Create | Changes in Component |
|---|------|------------|------------------|
| 1 | `src/components/data/DuplicateRecordDetector.jsx` | `analysis/duplicateDetection.js` | Import prompt, remove inline code |
| 2 | `src/components/ROICalculator.jsx` | `analysis/roiCalculation.js` | Import prompt, remove inline code |
| 3 | `src/components/ai/AIProgramEventCorrelator.jsx` | `analysis/eventCorrelation.js` | Import prompt, remove inline code |
| 4 | `src/components/ai/AIAttendancePredictor.jsx` | `analysis/attendancePrediction.js` | Import prompt, remove inline code |
| 5 | `src/components/ai/AIEventROIPredictor.jsx` | `analysis/eventROI.js` | Import prompt, remove inline code |
| 6 | `src/components/ai/AISectorTrendAnalyzer.jsx` | `analysis/trendAnalysis.js` | Import prompt, remove inline code |
| 7 | `src/components/strategy/CollaborationMapper.jsx` | `strategy/collaborationMapping.js` | Import prompt, remove inline code |
| 8 | `src/components/strategy/cascade/StrategyChallengeGenerator.jsx` | Verify uses extracted prompts | Verify import pattern |
| 9 | `src/components/strategy/cascade/StrategyToEventGenerator.jsx` | Verify uses extracted prompts | Verify import pattern |
| 10 | `src/components/strategy/cascade/StrategyToRDCallGenerator.jsx` | Verify uses extracted prompts | Verify import pattern |

---

## Detailed Prompt File Specifications

Following the Strategy Wizard pattern, all prompts are extracted to separate files. Below are the complete file specifications.

### 1. src/lib/ai/prompts/sandbox/sandboxEnhancement.js

```javascript
/**
 * Sandbox Enhancement AI Prompt
 * Used by: SandboxCreate.jsx, SandboxCreateWizard.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getSandboxEnhancementPrompt = (context) => {
  return `You are a regulatory sandbox expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${SAUDI_CONTEXT.COMPACT}

## CURRENT SANDBOX DATA
Name: ${context.name_en || 'Not provided'}
Name (Arabic): ${context.name_ar || 'Not provided'}
Domain: ${context.domain || 'Not specified'}
City: ${context.city?.name_en || 'Not selected'} / ${context.city?.name_ar || ''}
Managing Organization: ${context.organization?.name_en || 'Not selected'}
Current Description: ${context.description_en || 'Not provided'}

${BILINGUAL_INSTRUCTIONS}

## SPECIFIC REQUIREMENTS
Generate enhanced content for regulatory sandbox proposal:
1. Taglines: Compelling 10-15 word taglines suitable for Saudi government announcements
2. Descriptions: Comprehensive narratives (150+ words each language)
3. Objectives: Clear regulatory testing objectives aligned with Saudi innovation policy
4. Exemption Suggestions: Recommended regulatory exemptions for the sandbox

## REGULATORY CONTEXT
${SAUDI_CONTEXT.REGULATORY}`;
};

export const sandboxEnhancementSchema = {
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
};
```

**Component Usage (SandboxCreate.jsx):**
```javascript
import { getSandboxEnhancementPrompt, sandboxEnhancementSchema } from '@/lib/ai/prompts/sandbox';

const handleAIEnhancement = async () => {
  const context = {
    name_en: formData.name_en,
    name_ar: formData.name_ar,
    domain: formData.domain,
    city: cities.find(c => c.id === formData.city_id),
    organization: organizations.find(o => o.id === formData.organization_id),
    description_en: formData.description_en
  };
  
  const result = await invokeAI({
    prompt: getSandboxEnhancementPrompt(context),
    response_json_schema: sandboxEnhancementSchema
  });
  // ... handle result
};
```

---

### 2. src/lib/ai/prompts/pilot/pilotDetails.js

```javascript
/**
 * Pilot Details Enhancement AI Prompt
 * Used by: PilotEdit.jsx (section: 'details')
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getPilotDetailsPrompt = (context, pilotData) => {
  return `You are a pilot program expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${SAUDI_CONTEXT.COMPACT}

## CURRENT PILOT DATA
Title: ${pilotData.title_en} | ${pilotData.title_ar || 'N/A'}
Sector: ${context.sector?.name_en || pilotData.sector} | ${context.sector?.name_ar || ''}
Challenge: ${context.challenge?.title_en || 'Not linked'}
Description (EN): ${pilotData.description_en?.substring(0, 300) || 'N/A'}
Description (AR): ${pilotData.description_ar?.substring(0, 300) || 'N/A'}
Objective: ${pilotData.objective_en || 'N/A'}
Hypothesis: ${pilotData.hypothesis || 'N/A'}
Methodology: ${pilotData.methodology || 'N/A'}

${BILINGUAL_INSTRUCTIONS}

## SPECIFIC REQUIREMENTS
Enhance ALL text fields in BOTH English AND Arabic (فصحى formal):
- Titles: Compelling, sector-specific (max 80 chars each)
- Taglines: Memorable summaries (15-20 words each)
- Descriptions: Detailed narratives (200+ words each language)
- Objectives: Clear, measurable goals with bilingual text
- Hypothesis: Scientific format hypothesis statement
- Methodology: Step-by-step approach description
- Scope: Clear boundaries and limitations`;
};

export const pilotDetailsSchema = {
  type: 'object',
  required: ['title_en', 'title_ar', 'tagline_en', 'tagline_ar', 'description_en', 'description_ar', 'objective_en', 'objective_ar'],
  properties: {
    title_en: { type: 'string', maxLength: 80, description: 'Pilot title in English' },
    title_ar: { type: 'string', maxLength: 80, description: 'عنوان التجربة بالعربية' },
    tagline_en: { type: 'string', description: 'Memorable tagline in English (15-20 words)' },
    tagline_ar: { type: 'string', description: 'شعار تعريفي بالعربية (15-20 كلمة)' },
    description_en: { type: 'string', minLength: 200, description: 'Detailed description in English' },
    description_ar: { type: 'string', minLength: 200, description: 'وصف تفصيلي بالعربية' },
    objective_en: { type: 'string', description: 'Clear objective in English' },
    objective_ar: { type: 'string', description: 'هدف واضح بالعربية' },
    hypothesis: { type: 'string', description: 'Scientific hypothesis statement' },
    methodology: { type: 'string', description: 'Step-by-step methodology' },
    scope: { type: 'string', description: 'Pilot scope and boundaries' }
  }
};
```

---

### 3. src/lib/ai/prompts/pilot/pilotKpis.js

```javascript
/**
 * Pilot KPIs Generation AI Prompt
 * Used by: PilotEdit.jsx (section: 'kpis')
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getPilotKpisPrompt = (context, pilotData) => {
  return `You are a KPI specialist for Saudi municipal innovation pilots.

${SAUDI_CONTEXT.COMPACT}

## PILOT CONTEXT
Title: ${pilotData.title_en} | ${pilotData.title_ar || ''}
Sector: ${context.sector?.name_en || pilotData.sector}
Objective: ${pilotData.objective_en}
Duration: ${pilotData.duration_weeks || 12} weeks

${BILINGUAL_INSTRUCTIONS}

## SPECIFIC REQUIREMENTS
Generate 5-7 measurable KPIs for this pilot:
- Each KPI must have bilingual name and description
- Include baseline, target, and measurement frequency
- Balance outcome KPIs and process KPIs
- Align with Vision 2030 municipal excellence metrics
- Consider Saudi-specific data availability`;
};

export const pilotKpisSchema = {
  type: 'object',
  required: ['kpis'],
  properties: {
    kpis: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name_en', 'name_ar', 'baseline', 'target', 'unit'],
        properties: {
          name_en: { type: 'string', description: 'KPI name in English' },
          name_ar: { type: 'string', description: 'اسم المؤشر بالعربية' },
          description_en: { type: 'string', description: 'KPI description in English' },
          description_ar: { type: 'string', description: 'وصف المؤشر بالعربية' },
          baseline: { type: 'number', description: 'Current baseline value' },
          target: { type: 'number', description: 'Target value to achieve' },
          unit: { type: 'string', description: 'Measurement unit' },
          measurement_frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'quarterly'] }
        }
      }
    }
  }
};
```

---

### 4. src/lib/ai/prompts/pilot/index.js

```javascript
/**
 * Pilot Prompts Index
 * Exports all pilot-related prompts and schemas
 */
export { getPilotDetailsPrompt, pilotDetailsSchema } from './pilotDetails';
export { getPilotKpisPrompt, pilotKpisSchema } from './pilotKpis';
export { getPilotMilestonesPrompt, pilotMilestonesSchema } from './pilotMilestones';
export { getPilotRisksPrompt, pilotRisksSchema } from './pilotRisks';
export { getPilotTechnologyPrompt, pilotTechnologySchema } from './pilotTechnology';
export { getPilotEngagementPrompt, pilotEngagementSchema } from './pilotEngagement';
export { getPilotEvaluationPrompt, pilotEvaluationSchema } from './pilotEvaluation';
export { getPilotBenchmarkingPrompt, pilotBenchmarkingSchema } from './pilotBenchmarking';
export { getPilotScalingReadinessPrompt, pilotScalingReadinessSchema } from './pilotScalingReadiness';

// Prompt map for dynamic section loading (like Strategy Wizard)
export const PILOT_PROMPT_MAP = {
  details: { promptKey: 'getPilotDetailsPrompt', schemaKey: 'pilotDetailsSchema' },
  kpis: { promptKey: 'getPilotKpisPrompt', schemaKey: 'pilotKpisSchema' },
  milestones: { promptKey: 'getPilotMilestonesPrompt', schemaKey: 'pilotMilestonesSchema' },
  risks: { promptKey: 'getPilotRisksPrompt', schemaKey: 'pilotRisksSchema' },
  technology: { promptKey: 'getPilotTechnologyPrompt', schemaKey: 'pilotTechnologySchema' },
  engagement: { promptKey: 'getPilotEngagementPrompt', schemaKey: 'pilotEngagementSchema' },
  evaluation: { promptKey: 'getPilotEvaluationPrompt', schemaKey: 'pilotEvaluationSchema' }
};
```

---

### 5. src/lib/ai/prompts/matchmaker/partnershipAgreement.js

```javascript
/**
 * Partnership Agreement Generation AI Prompt
 * Used by: PilotConversionWizard.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getPartnershipAgreementPrompt = (context) => {
  return `You are a legal document specialist for Saudi municipal innovation partnerships.

${SAUDI_CONTEXT.COMPACT}

## PARTNERSHIP CONTEXT
Provider: ${context.organization?.name_en} | ${context.organization?.name_ar || ''}
Challenge: ${context.challenge?.title_en} | ${context.challenge?.title_ar || ''}
Municipality: ${context.municipality?.name_en || 'TBD'}
Pilot Objective: ${context.objective_en}
Duration: ${context.duration_weeks} weeks
Budget: ${context.budget} SAR

${BILINGUAL_INSTRUCTIONS}

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
Align with MoMAH partnership frameworks.`;
};

export const partnershipAgreementSchema = {
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
};
```

---

### 6. src/lib/ai/prompts/citizen/ideaClassification.js

```javascript
/**
 * Citizen Idea Classification AI Prompt
 * Used by: AIIdeaClassifier.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getIdeaClassificationPrompt = (context) => {
  return `You are a citizen engagement specialist for Saudi municipal services.

${SAUDI_CONTEXT.COMPACT}

## IDEA DETAILS
Title: ${context.title}
Content: ${context.content || context.description || 'No description'}
Location: ${context.location || 'Not specified'}
Category: ${context.category || 'Not specified'}

${BILINGUAL_INSTRUCTIONS}

## CLASSIFICATION REQUIREMENTS
Analyze and classify this citizen idea with bilingual outputs:

1. Primary sector (use codes: ${SAUDI_CONTEXT.SECTORS.map(s => s.code).join(', ')})
2. Sector names in both languages
3. Keywords in BOTH English AND Arabic (5-10 relevant terms each)
4. Is it spam/low-quality? (true/false with reason)
5. Sentiment (positive_suggestion, neutral, complaint, urgent_issue)
6. Similar existing challenges (if any patterns detected)
7. Recommended priority (high/medium/low) with bilingual justification
8. Quality assessment (0-100 score)

## CONTEXT
Ideas should align with Quality of Life Program and municipal service improvement.
Consider Vision 2030 goals in classification.`;
};

export const ideaClassificationSchema = {
  type: 'object',
  required: ['sector', 'sector_en', 'sector_ar', 'keywords_en', 'keywords_ar', 'is_spam', 'sentiment', 'priority', 'quality_score'],
  properties: {
    sector: { type: 'string', description: 'Sector code' },
    sector_en: { type: 'string', description: 'Sector name in English' },
    sector_ar: { type: 'string', description: 'اسم القطاع بالعربية' },
    keywords_en: { type: 'array', items: { type: 'string' }, description: 'English keywords (5-10)' },
    keywords_ar: { type: 'array', items: { type: 'string' }, description: 'كلمات مفتاحية بالعربية (5-10)' },
    is_spam: { type: 'boolean' },
    spam_reason: { type: 'string', description: 'Reason if spam detected' },
    sentiment: { type: 'string', enum: ['positive_suggestion', 'neutral', 'complaint', 'urgent_issue'] },
    similar_patterns: { type: 'array', items: { type: 'string' } },
    priority: { type: 'string', enum: ['high', 'medium', 'low'] },
    priority_justification_en: { type: 'string' },
    priority_justification_ar: { type: 'string' },
    quality_score: { type: 'number', minimum: 0, maximum: 100 }
  }
};
```

---

### 7. src/lib/ai/prompts/analysis/roiCalculation.js

```javascript
/**
 * ROI Calculation AI Prompt
 * Used by: ROICalculator.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getROICalculationPrompt = (context) => {
  return `You are a financial analyst for Saudi municipal innovation initiatives.

${SAUDI_CONTEXT.COMPACT}

## INITIATIVE DETAILS
Type: ${context.type}
Budget: ${context.budget} SAR
Sector: ${context.sector}
Duration: ${context.duration_months} months
Expected Outcome: ${context.expected_outcome}
Municipality: ${context.municipality?.name_en || 'All municipalities'}
Population Affected: ${context.population_affected || 'Not specified'}

${BILINGUAL_INSTRUCTIONS}

## CALCULATION REQUIREMENTS
Calculate expected ROI with bilingual outputs:
1. Cost-benefit analysis in SAR
2. Break-even timeline
3. 3-year projected ROI percentage
4. Risk-adjusted returns
5. Benchmark comparison (similar Saudi initiatives)
6. Key assumptions and risks
7. Bilingual executive summary and recommendation

Consider Saudi-specific factors:
- Vision 2030 strategic alignment bonus
- Municipal co-funding opportunities
- Digital transformation multipliers`;
};

export const roiCalculationSchema = {
  type: 'object',
  required: ['roi_percentage', 'break_even_months', 'npv', 'summary_en', 'summary_ar'],
  properties: {
    roi_percentage: { type: 'number', description: '3-year ROI percentage' },
    break_even_months: { type: 'number', description: 'Months to break even' },
    npv: { type: 'number', description: 'Net Present Value in SAR' },
    total_benefit: { type: 'number', description: 'Total projected benefit in SAR' },
    benefit_breakdown: {
      type: 'object',
      properties: {
        cost_savings: { type: 'number' },
        efficiency_gains: { type: 'number' },
        citizen_value: { type: 'number' },
        strategic_value: { type: 'number' }
      }
    },
    benchmark_comparison: { type: 'string', description: 'Comparison with similar initiatives' },
    key_assumptions: { type: 'array', items: { type: 'string' } },
    key_risks_en: { type: 'array', items: { type: 'string' } },
    key_risks_ar: { type: 'array', items: { type: 'string' } },
    summary_en: { type: 'string', description: 'Executive summary in English' },
    summary_ar: { type: 'string', description: 'ملخص تنفيذي بالعربية' },
    recommendation_en: { type: 'string' },
    recommendation_ar: { type: 'string' }
  }
};
```

---

### 8. src/lib/ai/prompts/scaling/costBenefitAnalysis.js

```javascript
/**
 * Scaling Cost-Benefit Analysis AI Prompt
 * Used by: ScalingCostBenefitAnalyzer.jsx
 */
import { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from '../saudiContext';

export const getCostBenefitAnalysisPrompt = (context) => {
  return `You are a scaling strategist for Saudi municipal innovation programs.

${SAUDI_CONTEXT.COMPACT}

## PILOT DETAILS
Title: ${context.pilot?.title_en} | ${context.pilot?.title_ar || ''}
Current Budget: ${context.pilot?.budget} ${context.pilot?.budget_currency || 'SAR'}
Current Results: ${context.pilot?.kpis?.map(k => \`\${k.name}: \${k.current_value || k.current}\`).join(', ')}
Target Municipalities: ${context.targetMunicipalities?.length || 0} cities
Municipality Names: ${context.targetMunicipalities?.map(m => m.name_en).join(', ')}

${BILINGUAL_INSTRUCTIONS}

## ANALYSIS REQUIREMENTS
For scaling to ${context.targetMunicipalities?.length || 'multiple'} Saudi municipalities, estimate:
1. Total deployment cost (SAR)
2. Expected annual benefits (cost savings, efficiency gains)
3. Break-even point (months)
4. 3-year ROI percentage
5. Cost per municipality
6. Benefit variance (best/worst case scenarios)
7. Bilingual investment summary and recommendation

## SAUDI CONTEXT
Consider Saudi municipal procurement timelines.
Factor in Vision 2030 municipal transformation costs.
Account for regional variations across Saudi regions.`;
};

export const costBenefitAnalysisSchema = {
  type: 'object',
  required: ['total_cost', 'annual_benefit', 'break_even_months', 'three_year_roi'],
  properties: {
    total_cost: { type: 'number', description: 'Total deployment cost in SAR' },
    annual_benefit: { type: 'number', description: 'Annual benefit in SAR' },
    break_even_months: { type: 'number' },
    three_year_roi: { type: 'number' },
    cost_per_municipality: { type: 'number' },
    benefit_variance: {
      type: 'object',
      properties: {
        best_case: { type: 'number' },
        worst_case: { type: 'number' }
      }
    },
    investment_summary_en: { type: 'string', description: 'Investment summary in English' },
    investment_summary_ar: { type: 'string', description: 'ملخص الاستثمار بالعربية' },
    recommendation_en: { type: 'string' },
    recommendation_ar: { type: 'string' },
    cashflow_projection: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          month: { type: 'number' },
          cost: { type: 'number' },
          benefit: { type: 'number' }
        }
      }
    }
  }
};
```

---

### 9. src/lib/ai/prompts/index.js (Central Export)

```javascript
/**
 * Central AI Prompts Index
 * Exports all domain prompts for easy importing
 */

// Sandbox prompts
export * from './sandbox';

// Pilot prompts
export * from './pilot';

// Matchmaker prompts
export * from './matchmaker';

// Scaling prompts
export * from './scaling';

// Challenge prompts
export * from './challenge';

// Solution prompts
export * from './solution';

// R&D prompts
export * from './rd';

// Citizen prompts
export * from './citizen';

// Analysis prompts
export * from './analysis';

// Communication prompts
export * from './communication';

// Shared context
export { SAUDI_CONTEXT, BILINGUAL_INSTRUCTIONS } from './saudiContext';
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
