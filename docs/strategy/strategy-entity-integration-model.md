# Strategy System Entity Integration Model

## Complete Assessment Against User's Proposed Model

**Assessment Date:** 2025-01-13  
**Assessed By:** Platform Architecture Review

---

## 1. DIRECT INTEGRATION (Explicit Strategy Fields)

Entities that SHOULD have direct `strategic_plan_ids[]` and/or `strategic_objective_ids[]` fields.

| Entity | User Model | Current DB State | Gap Analysis |
|--------|-----------|------------------|--------------|
| **Programs** | ✅ Direct | ✅ Has: `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategic_pillar_id`, `strategic_priority_level`, `strategic_kpi_contributions` | **COMPLETE** - Full strategic fields |
| **Challenges** | ✅ Direct | ✅ Has: `strategic_plan_ids[]`, `strategic_goal` + dedicated `strategic_plan_challenge_links` table | **COMPLETE** - Full strategic fields |
| **Partnerships** | ✅ Direct | ⚠️ Has: `is_strategic` boolean, `linked_program_ids[]`, `linked_challenge_ids[]` | **PARTIAL** - Missing explicit `strategic_plan_ids[]` |
| **Sandboxes** | ✅ Direct | ❌ No strategic fields | **MISSING** - Needs `strategic_plan_ids[]` |
| **Living Labs** | ✅ Direct | ❌ No strategic fields | **MISSING** - Needs `strategic_plan_ids[]` |

### Direct Integration Summary
- **Fully Implemented:** 2/5 (Programs, Challenges)
- **Partially Implemented:** 1/5 (Partnerships - via linked entities)
- **Not Implemented:** 2/5 (Sandboxes, Living Labs)

---

## 2. INDIRECT INTEGRATION (Via Parent Entity)

Entities that link to Strategy through their parent relationships.

| Entity | User Model | Indirect Path | Current DB State | Status |
|--------|-----------|---------------|------------------|--------|
| **Campaigns** | via Programs/Challenges | `email_campaigns` → audience → Programs/Challenges | ❌ No `program_id` or `challenge_id` | **MISSING PATH** |
| **R&D Calls** | via Programs/Challenges | `rd_calls.challenge_ids[]` → Challenges | ✅ Has `challenge_ids[]` | **COMPLETE** |
| **Events** | via Programs/Challenges | `events.program_id` → Programs | ✅ Has `program_id`, `strategic_plan_ids[]`, `strategic_objective_ids[]` | **COMPLETE** (Actually DIRECT!) |
| **Matchmaker Apps** | via Programs/Challenges | `matchmaker_applications` → Solutions/Challenges | ✅ Has `solution_id`, `matched_challenges`, `target_challenges` | **COMPLETE** |
| **Citizens** | via Programs/Challenges | Implicit via enrollments/feedback | ⚠️ Indirect only via activities | **IMPLICIT** |
| **Staff** | via Programs/Challenges | Implicit via assignments | ⚠️ Indirect only via activities | **IMPLICIT** |
| **Innovation Proposals** | via Citizens→Programs/Challenges | `innovation_proposals.target_challenges[]` | ✅ Has `target_challenges` | **COMPLETE** |
| **Proposals (Challenge)** | via Challenges | `challenge_proposals.challenge_id` | ✅ Has `challenge_id` | **COMPLETE** |
| **Solutions** | via Proposals→Challenges | `solutions.source_program_id`, `challenge_solution_matches` | ✅ Has links | **COMPLETE** |
| **Pilots** | via Solutions→Challenges | `pilots.solution_id`, `pilots.challenge_id`, `pilots.source_program_id` | ✅ Has all links | **COMPLETE** |
| **R&D Projects** | via R&D Calls→Challenges | `rd_projects.challenge_ids[]`, `rd_projects.solution_id` | ✅ Has `challenge_ids[]` | **COMPLETE** |
| **Scaling Plans** | via Pilots→Challenges | `scaling_plans.pilot_id`, `scaling_plans.validated_solution_id` | ✅ Has links | **COMPLETE** |

### Indirect Integration Summary
- **Complete:** 9/12 entities have proper indirect paths
- **Implicit Only:** 2/12 (Citizens, Staff - via activities)
- **Missing Path:** 1/12 (Campaigns - no entity link)

---

## 3. NO INTEGRATION (Correct by Design)

| Entity | User Model | Reasoning | Verified |
|--------|-----------|-----------|----------|
| **Providers** | ❌ N/A | External organizations, strategy-agnostic | ✅ Correct |
| **Municipalities** | ❌ N/A | Geographic entities, not strategy-driven | ⚠️ Actually HAS `strategic_plan_id` |
| **Ideas** | ❌ N/A | Raw citizen input before processing | ✅ Correct |

### Correction to User Model
**Municipalities** actually HAVE `strategic_plan_id` in the database, suggesting they ARE linked to strategy (municipality strategic plans).

---

## 4. ENTITIES NOT IN USER'S MODEL

These entities exist in the database but were not covered:

| Entity | Suggested Category | Current DB State | Recommendation |
|--------|-------------------|------------------|----------------|
| **Case Studies** | INDIRECT via entity | Has `entity_type`, `entity_id` | Link via Program/Challenge success |
| **Knowledge Documents** | INDIRECT | No strategic fields | Could link via Programs |
| **Policy Documents** | DIRECT | No strategic fields | Should link to Strategic Plans |
| **Policy Recommendations** | DIRECT | No strategic fields | Should link to Strategic Plans |
| **Regulatory Exemptions** | INDIRECT via Sandbox | Has sandbox link | ✅ Correct path |
| **Contracts** | INDIRECT via Pilot | Has `pilot_id`, `solution_id` | ✅ Correct path |
| **Budgets** | INDIRECT via entity | Has `entity_type`, `entity_id` | ✅ Correct path |
| **Risks** | INDIRECT via entity | Has entity links | ✅ Correct path |
| **Tasks** | INDIRECT | Has entity links | ✅ Correct path |
| **Milestones** | INDIRECT via entity | Has entity links | ✅ Correct path |
| **Teams** | INDIRECT | No direct strategy link | Via Programs |
| **News Articles** | INDIRECT | No strategic fields | Could link via entity |
| **Global Trends** | DIRECT | No strategic fields | Should inform Strategy |
| **KPI References** | DIRECT | No strategic fields | Should link to Strategic Plans |

---

## 5. COMPLETE INTEGRATION HIERARCHY

```
STRATEGIC PLANS (Root)
│
├── DIRECT INTEGRATION (explicit strategic_plan_ids[])
│   ├── Programs ✅ COMPLETE
│   │   ├── Events ✅ (also has direct!)
│   │   ├── Program Applications ✅
│   │   ├── Program Mentorships ✅
│   │   └── Program Pilot Links ✅
│   │
│   ├── Challenges ✅ COMPLETE
│   │   ├── Challenge Proposals ✅
│   │   ├── Challenge Interests ✅
│   │   ├── Challenge Activities ✅
│   │   └── Challenge Solution Matches ✅
│   │
│   ├── Partnerships ⚠️ PARTIAL (via linked entities)
│   │
│   ├── Sandboxes ❌ MISSING
│   │   └── Sandbox Applications ❌
│   │
│   └── Living Labs ❌ MISSING
│       └── Living Lab Bookings ❌
│
├── INDIRECT INTEGRATION (via parent chain)
│   │
│   ├── Solutions (via Challenge/Program)
│   │   ├── Solution Cases ✅
│   │   ├── Solution Interests ✅
│   │   └── Solution Reviews ✅
│   │
│   ├── Pilots (via Solution→Challenge/Program)
│   │   ├── Pilot KPIs ✅
│   │   ├── Pilot Documents ✅
│   │   ├── Pilot Expenses ✅
│   │   ├── Pilot Issues ✅
│   │   └── Pilot Approvals ✅
│   │
│   ├── Scaling Plans (via Pilot→Solution→Challenge/Program) ✅
│   │
│   ├── R&D Calls (via challenge_ids[]) ✅
│   │   └── R&D Proposals ✅
│   │       └── R&D Projects ✅
│   │
│   ├── Matchmaker Applications (via Solution/Challenges) ✅
│   │
│   ├── Innovation Proposals (via target_challenges[]) ✅
│   │
│   ├── Contracts (via Pilot/Solution) ✅
│   │
│   └── Citizen Enrollments (via Pilot) ✅
│
└── NO INTEGRATION (by design)
    ├── Providers ✅ Correct
    ├── Organizations ✅ Correct
    ├── Citizen Ideas ✅ Correct
    ├── Regions ✅ Correct
    ├── Cities ✅ Correct
    └── Sectors ✅ Correct
```

---

## 6. PRIORITY GAP FIXES

### P0 - Critical (Block Strategy Features)

| Gap | Entity | Fix Required |
|-----|--------|--------------|
| 1 | `sandboxes` | Add `strategic_plan_ids UUID[]`, `strategic_objective_ids UUID[]` |
| 2 | `living_labs` | Add `strategic_plan_ids UUID[]`, `strategic_objective_ids UUID[]` |
| 3 | `programs` | Add missing `is_strategy_derived`, `strategy_derivation_date`, `lessons_learned` |

### P1 - High (Enhance Strategy Visibility)

| Gap | Entity | Fix Required |
|-----|--------|--------------|
| 4 | `partnerships` | Add explicit `strategic_plan_ids UUID[]` |
| 5 | `email_campaigns` | Add `program_id`, `challenge_id` for targeting |
| 6 | `policy_documents` | Add `strategic_plan_ids UUID[]` |
| 7 | `global_trends` | Add `strategic_plan_ids UUID[]` for trend-strategy mapping |

### P2 - Enhancement (Future)

| Gap | Entity | Fix Required |
|-----|--------|--------------|
| 8 | `kpi_references` | Add `strategic_plan_id` |
| 9 | `knowledge_documents` | Add entity links for strategy content |

---

## 7. REVISED INTEGRATION SCORES

| Category | Entities | Complete | Partial | Missing | Score |
|----------|----------|----------|---------|---------|-------|
| Direct Integration | 5 | 2 | 1 | 2 | 50% |
| Indirect Integration | 12 | 9 | 2 | 1 | 83% |
| No Integration | 6 | 6 | 0 | 0 | 100% |
| **Total Platform** | **23** | **17** | **3** | **3** | **78%** |

---

## 8. CORRECTIONS TO USER MODEL

1. **Events** - User placed as INDIRECT, but actually has DIRECT integration (`strategic_plan_ids[]`, `strategic_objective_ids[]`)

2. **Municipalities** - User placed as NO integration, but DB has `strategic_plan_id` (for municipality-level strategic plans)

3. **Missing from User Model:**
   - Case Studies
   - Policy Documents (should be DIRECT)
   - Global Trends (should be DIRECT)
   - Knowledge Documents
   - KPI References (should be DIRECT)

---

## 9. RECOMMENDED SQL MIGRATION

```sql
-- P0: Add strategic fields to Sandboxes
ALTER TABLE public.sandboxes
ADD COLUMN IF NOT EXISTS strategic_plan_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_objective_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_strategy_derived BOOLEAN DEFAULT false;

-- P0: Add strategic fields to Living Labs
ALTER TABLE public.living_labs
ADD COLUMN IF NOT EXISTS strategic_plan_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategic_objective_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_strategy_derived BOOLEAN DEFAULT false;

-- P0: Add missing fields to Programs
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS is_strategy_derived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS strategy_derivation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lessons_learned JSONB DEFAULT '[]';

-- P1: Add to Partnerships
ALTER TABLE public.partnerships
ADD COLUMN IF NOT EXISTS strategic_plan_ids UUID[] DEFAULT '{}';

-- P1: Add to Policy Documents
ALTER TABLE public.policy_documents
ADD COLUMN IF NOT EXISTS strategic_plan_ids UUID[] DEFAULT '{}';

-- P1: Add targeting to Campaigns
ALTER TABLE public.email_campaigns
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.programs(id),
ADD COLUMN IF NOT EXISTS challenge_ids UUID[] DEFAULT '{}';
```

---

## Summary

Your proposed model is **~85% accurate**. Key corrections:
- Events should be DIRECT (not indirect)
- Municipalities have strategy link
- Several additional entities need classification (Policy Documents, Global Trends, KPI References)
