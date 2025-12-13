# Strategy System - Design Document

**Version:** 5.1 (COMPLETE STRATEGY LEADER WORKFLOW)  
**Last Updated:** 2025-12-13  
**Status:** ✅ 100% PLATFORM INTEGRATION | 70% WORKFLOW COVERAGE

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Strategy Leader Workflow](#strategy-leader-workflow)
   - [Phase 1: Pre-Planning](#phase-1-pre-planning)
   - [Phase 2: Strategy Creation](#phase-2-strategy-creation)
   - [Phase 3: Cascade & Operationalization](#phase-3-cascade--operationalization)
   - [Phase 4: Governance & Approval](#phase-4-governance--approval)
   - [Phase 5: Communication & Publishing](#phase-5-communication--publishing)
   - [Phase 6: Monitoring & Tracking](#phase-6-monitoring--tracking)
   - [Phase 7: Review & Adjustment](#phase-7-review--adjustment)
3. [Entity Integration Model](#entity-integration-model)
4. [Architecture](#architecture)
5. [Data Model](#data-model)
6. [Implementation Plan](#implementation-plan)
7. [Gap Analysis](#gap-analysis)

---

## System Overview

The Strategy System provides comprehensive strategic planning and execution management for municipal innovation. It enables:

- **Strategic Plan Creation** - Build and manage multi-year strategic plans
- **Objective & KPI Management** - Define and track strategic objectives and KPIs
- **Bidirectional Integration** - Strategy drives entities, entities inform strategy
- **AI-Powered Insights** - 7 AI features for analysis and recommendations
- **Approval Workflows** - Multi-step approval gates for strategic decisions

### Key Metrics

| Metric | Implemented | Missing | Coverage |
|--------|-------------|---------|----------|
| Pre-Planning Tools | 11 | 0 | 100% ✅ |
| Strategy Creation Tools | 10 | 0 | 100% ✅ |
| Cascade & Operationalization | 4 | 6 | 40% |
| Governance & Approval | 3 | 2 | 60% |
| Communication & Publishing | 2 | 2 | 50% |
| Monitoring & Tracking | 8 | 1 | 89% |
| Review & Adjustment | 2 | 3 | 40% |
| **TOTAL TOOLS** | **40** | **14** | **74%** |

### Platform Integration Status

| Metric | Count | Status |
|--------|-------|--------|
| Direct Entity Integration | 8/8 | ✅ 100% |
| Indirect Entity Integration | 13/13 | ✅ 100% |
| Database Tables | 6 | ✅ Complete |
| Edge Functions | 7 | ✅ Complete |
| Hooks | 2 | ✅ Complete |
| AI Features | 7 | ✅ Complete |

---

## Strategy Leader Workflow

The Strategy Leader (Innovation Department Strategy Leader) uses this system to plan, execute, and monitor the national innovation strategy. The workflow is organized into 7 phases:

### Complete Workflow Visualization

```mermaid
flowchart TB
    subgraph P1["📋 PHASE 1: PRE-PLANNING"]
        ENV[Environmental Scanning]
        SWOT[SWOT Analysis]
        STAKE[Stakeholder Analysis]
        RES[Resource Assessment]
        RISK[Risk Assessment]
        BASE[Baseline Data]
        BENCH[Benchmarking]
    end

    subgraph P2["✏️ PHASE 2: STRATEGY CREATION"]
        VIS[Vision/Mission]
        OBJ[Strategic Objectives]
        KPI[KPI Definition]
        TIME[Timeline Planning]
        OWN[Ownership Assignment]
        ACT[Action Plans]
        LINK[National Linking]
    end

    subgraph P3["⚡ PHASE 3: CASCADE"]
        GEN_PROG[Generate Programs]
        GEN_CHAL[Generate Challenges]
        GEN_PIL[Generate Pilots]
        GEN_SAND[Generate Sandboxes]
        GEN_LAB[Generate Living Labs]
        GEN_RD[Generate R&D Calls]
        GEN_PART[Generate Partnerships]
        GEN_EVT[Generate Events]
    end

    subgraph P4["✅ PHASE 4: GOVERNANCE"]
        APPR[Plan Approval]
        SIGN[Stakeholder Sign-off]
        COMM[Committee Review]
        EXEC[Executive Approval]
        VER[Version Control]
    end

    subgraph P5["📢 PHASE 5: COMMUNICATION"]
        INT[Internal Comms]
        PUB[Strategy Publishing]
        NOTIF[Notifications]
        DASH[Public Dashboard]
    end

    subgraph P6["📊 PHASE 6: MONITORING"]
        KPI_TRACK[KPI Tracking]
        PROG_MON[Progress Monitoring]
        COV[Coverage Analysis]
        WHAT[What-If Simulation]
        GAP[Gap Analysis]
        BOTTLE[Bottleneck Detection]
        COCKPIT[Strategy Cockpit]
    end

    subgraph P7["🔄 PHASE 7: REVIEW"]
        MID[Mid-Year Review]
        LESS[Lessons Learned]
        ADJ[Strategy Adjustment]
        REPRI[Re-prioritization]
        IMPACT[Impact Assessment]
    end

    P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7
    P7 -.->|Feedback Loop| P2
```

---

### Phase 1: Pre-Planning (100% Complete) ✅

**Purpose:** Gather intelligence and assess the current state before creating strategic plans.

| # | Task | Component/Page | Description | Status | Priority |
|---|------|----------------|-------------|--------|----------|
| 1 | **Environmental Scanning** | `EnvironmentalScanWidget` | Scan external environment for trends, threats, opportunities affecting innovation strategy | ✅ Complete | - |
| 2 | **SWOT Analysis** | `SWOTAnalysisBuilder` | Build comprehensive Strengths, Weaknesses, Opportunities, Threats analysis | ✅ Complete | - |
| 3 | **Stakeholder Analysis** | `StakeholderAnalysisWidget` | Map stakeholders, their interests, influence levels, and engagement strategies | ✅ Complete | - |
| 4 | **Resource Assessment** | `ResourceAllocationView` | Assess available resources (budget, staff, technology, partnerships) | ✅ Exists | - |
| 5 | **Policy Review** | `PolicyLibrary` | Review existing policies that impact or enable innovation | ✅ Exists | - |
| 6 | **Historical Performance** | `HistoricalComparison` | Analyze past strategy execution and lessons | ✅ Exists | - |
| 7 | **International Benchmarking** | `InternationalBenchmarkingSuite` | Compare with global innovation leaders | ✅ Exists | - |
| 8 | **Budget Assessment** | `BudgetManagement` | Understand fiscal constraints and opportunities | ✅ Exists | - |
| 9 | **Risk Assessment** | `RiskAssessmentBuilder` | Identify and categorize strategic risks with mitigation plans | ✅ Complete | - |
| 10 | **Input Gathering** | `StrategyInputCollector` | Collect input from departments, municipalities, citizens, experts | ✅ Complete | - |
| 11 | **Baseline Data Collection** | `BaselineDataCollector` | Establish baseline metrics for measuring future progress | ✅ Complete | - |

#### Component Specifications - Phase 1

##### 1.1 EnvironmentalScanWidget
```typescript
interface EnvironmentalScanWidget {
  // Features
  - PESTLE Analysis (Political, Economic, Social, Tech, Legal, Environmental)
  - Trend monitoring dashboard
  - AI-powered news aggregation
  - Opportunity/threat identification
  - Export to strategy inputs
  
  // AI Integration
  model: "google/gemini-2.5-flash"
  prompt: "Analyze current trends in municipal innovation..."
  
  // Data Sources
  - Global trends table
  - News APIs
  - Policy documents
  - International reports
  
  // Output
  - Environmental scan report (PDF)
  - Strategy input recommendations
  - Trend alerts
}
```

##### 1.2 SWOTAnalysisBuilder
```typescript
interface SWOTAnalysisBuilder {
  // Features
  - Quadrant builder (S/W/O/T)
  - AI-assisted factor identification
  - Stakeholder input collection
  - Cross-reference with challenges
  - Historical SWOT comparison
  - Export to strategic plan
  
  // AI Integration
  model: "google/gemini-2.5-flash"
  features: [
    "Auto-suggest strengths from MII scores",
    "Identify weaknesses from gap analyses",
    "Surface opportunities from trends",
    "Detect threats from risk assessments"
  ]
  
  // Data Model
  interface SWOTItem {
    id: string;
    quadrant: 'strength' | 'weakness' | 'opportunity' | 'threat';
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    impact_level: 'high' | 'medium' | 'low';
    related_entities: string[];
    source: 'ai' | 'manual' | 'stakeholder';
  }
}
```

##### 1.3 StakeholderAnalysisWidget
```typescript
interface StakeholderAnalysisWidget {
  // Features
  - Stakeholder registry
  - Power/Interest matrix
  - Influence mapping
  - Engagement strategy builder
  - Communication plan generator
  
  // Data Model
  interface Stakeholder {
    id: string;
    name_en: string;
    name_ar: string;
    type: 'government' | 'private' | 'academic' | 'civil_society' | 'international';
    power_level: 1-10;
    interest_level: 1-10;
    current_engagement: 'champion' | 'supporter' | 'neutral' | 'critic' | 'blocker';
    desired_engagement: string;
    engagement_tactics: string[];
    key_concerns: string[];
    communication_frequency: 'weekly' | 'monthly' | 'quarterly';
  }
  
  // Outputs
  - Stakeholder map visualization
  - Engagement plan
  - Communication calendar
}
```

##### 1.4 RiskAssessmentBuilder
```typescript
interface RiskAssessmentBuilder {
  // Features
  - Risk registry
  - Probability x Impact matrix
  - Mitigation plan builder
  - Risk monitoring dashboard
  - Early warning system
  
  // Data Model
  interface StrategicRisk {
    id: string;
    title_en: string;
    title_ar: string;
    category: 'political' | 'financial' | 'operational' | 'technological' | 'reputational';
    probability: 1-5;
    impact: 1-5;
    risk_score: number; // probability * impact
    mitigation_strategy: string;
    contingency_plan: string;
    owner: string;
    status: 'identified' | 'mitigating' | 'accepted' | 'resolved';
    triggers: string[];
    last_review_date: timestamp;
  }
  
  // AI Integration
  - Auto-suggest risks from challenges
  - Mitigation strategy recommendations
  - Early warning pattern detection
}
```

##### 1.5 StrategyInputCollector
```typescript
interface StrategyInputCollector {
  // Features
  - Multi-source input collection (municipalities, departments, citizens)
  - Survey builder
  - Input aggregation
  - Theme extraction (AI)
  - Priority voting
  
  // Input Channels
  - Structured surveys
  - Open-ended submissions
  - Workshop facilitation tool
  - Citizen idea integration
  
  // AI Integration
  - Theme clustering from inputs
  - Sentiment analysis
  - Priority recommendations
  
  // Output
  - Aggregated input report
  - Theme summary
  - Priority matrix
}
```

##### 1.6 BaselineDataCollector
```typescript
interface BaselineDataCollector {
  // Features
  - KPI baseline capture
  - Current state documentation
  - Benchmark establishment
  - Data validation
  
  // Data Points
  - Current MII scores by municipality
  - Challenge resolution rates
  - Pilot success rates
  - Partnership metrics
  - Budget utilization
  - Innovation pipeline health
  
  // Output
  - Baseline report
  - KPI starting values
  - Benchmark comparisons
}
```

---

### Phase 2: Strategy Creation

**Purpose:** Define the strategic plan with vision, objectives, KPIs, and action plans.

| # | Task | Component/Page | Description | Status | Priority |
|---|------|----------------|-------------|--------|----------|
| 1 | **Vision/Mission Definition** | `StrategicPlanBuilder` | Define the overarching vision and mission for innovation | ✅ Exists | - |
| 2 | **Strategic Objectives** | `StrategicPlanBuilder` | Define SMART objectives aligned to vision | ✅ Exists | - |
| 3 | **KPI Definition** | `useStrategicKPI` | Define measurable KPIs for each objective | ✅ Exists | - |
| 4 | **Timeline Planning** | `StrategyTimelinePlanner` | Create Gantt-style timeline for objectives and milestones | ✅ Complete | - |
| 5 | **Budget Allocation** | `BudgetAllocationTool` | Allocate budget to strategic initiatives | ✅ Exists | - |
| 6 | **Ownership Assignment** | `StrategyOwnershipAssigner` | Assign owners/accountable parties to objectives | ✅ Complete | - |
| 7 | **Action Plans** | `ActionPlanBuilder` | Create detailed action plans for each objective | ✅ Complete | - |
| 8 | **National Strategy Linking** | `NationalStrategyLinker` | Link to national Vision 2030 goals | ✅ Complete | - |
| 9 | **Sector Sub-Strategies** | `SectorStrategyBuilder` | Create sector-specific sub-strategies | ✅ Complete | - |
| 10 | **Strategy Templates** | `StrategyTemplateLibrary` | Use and manage reusable strategy templates | ✅ Complete | - |

#### Component Specifications - Phase 2

##### 2.1 StrategyTimelinePlanner
```typescript
interface StrategyTimelinePlanner {
  // Features
  - Gantt chart visualization
  - Milestone definition
  - Dependency mapping
  - Critical path analysis
  - Resource loading view
  - Export to PDF/PPT
  
  // Data Model
  interface StrategyMilestone {
    id: string;
    objective_id: string;
    title_en: string;
    title_ar: string;
    start_date: date;
    end_date: date;
    dependencies: string[]; // milestone IDs
    owner: string;
    status: 'planned' | 'in_progress' | 'completed' | 'delayed';
    deliverables: string[];
    resources_required: string[];
  }
  
  // Visualizations
  - Timeline view (quarters/years)
  - Milestone dependency graph
  - Resource heatmap
  - Critical path highlight
}
```

##### 2.2 StrategyOwnershipAssigner
```typescript
interface StrategyOwnershipAssigner {
  // Features
  - Objective-to-owner mapping
  - RACI matrix builder
  - Delegation rules
  - Notification configuration
  - Performance accountability
  
  // Data Model
  interface ObjectiveOwnership {
    objective_id: string;
    responsible: string; // User/Role who does the work
    accountable: string; // User who is ultimately accountable
    consulted: string[]; // Users to be consulted
    informed: string[]; // Users to be informed
    delegation_rules: DelegationRule[];
  }
  
  // Features
  - Auto-suggest owners based on municipality/sector
  - Workload balancing view
  - Escalation path definition
}
```

##### 2.3 ActionPlanBuilder
```typescript
interface ActionPlanBuilder {
  // Features
  - Action item creation
  - Task breakdown structure
  - Resource assignment
  - Timeline assignment
  - Budget linkage
  - Progress tracking
  
  // Data Model
  interface ActionPlan {
    id: string;
    objective_id: string;
    title_en: string;
    title_ar: string;
    actions: ActionItem[];
    total_budget: number;
    start_date: date;
    end_date: date;
    status: 'draft' | 'approved' | 'in_progress' | 'completed';
  }
  
  interface ActionItem {
    id: string;
    action_plan_id: string;
    title_en: string;
    title_ar: string;
    description: string;
    owner: string;
    start_date: date;
    end_date: date;
    budget: number;
    dependencies: string[];
    deliverables: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    progress_percentage: number;
  }
  
  // AI Integration
  - Auto-generate action plans from objectives
  - Suggest tasks based on similar objectives
  - Risk identification for action items
}
```

##### 2.4 NationalStrategyLinker
```typescript
interface NationalStrategyLinker {
  // Features
  - Vision 2030 goal mapping
  - SDG alignment
  - National priority linking
  - Alignment scoring
  - Gap identification
  
  // Data Sources
  - Vision 2030 goals database
  - SDG targets
  - National Innovation Strategy
  - Sector-specific national strategies
  
  // Visualizations
  - Alignment matrix
  - Coverage heat map
  - Gap report
  
  // AI Integration
  - Auto-suggest alignments based on objective text
  - Identify unmapped national priorities
}
```

##### 2.5 SectorStrategyBuilder
```typescript
interface SectorStrategyBuilder {
  // Features
  - Sector-specific strategy creation
  - Parent strategy inheritance
  - Sector KPI definition
  - Cross-sector coordination
  
  // Data Model
  interface SectorStrategy {
    id: string;
    parent_plan_id: string;
    sector_id: string;
    name_en: string;
    name_ar: string;
    vision_en: string;
    vision_ar: string;
    objectives: SectorObjective[];
    kpis: SectorKPI[];
    owner: string;
    status: 'draft' | 'approved' | 'active';
  }
  
  // Features
  - Cascade objectives from parent
  - Sector-specific customization
  - Cross-sector synergy detection
}
```

##### 2.6 StrategyTemplateLibrary
```typescript
interface StrategyTemplateLibrary {
  // Features
  - Template catalog
  - Template creation from existing plans
  - Template customization
  - Template sharing
  - Version management
  
  // Template Types
  - Innovation strategy template
  - Digital transformation template
  - Sustainability strategy template
  - Sector-specific templates
  - Municipality-scale templates
  
  // Data Model
  interface StrategyTemplate {
    id: string;
    name_en: string;
    name_ar: string;
    description: string;
    template_type: string;
    structure: {
      pillars: PillarTemplate[];
      objectives: ObjectiveTemplate[];
      kpis: KPITemplate[];
    };
    created_by: string;
    is_public: boolean;
    usage_count: number;
  }
}
```

---

### Phase 3: Cascade & Operationalization

**Purpose:** Generate operational entities (programs, challenges, pilots, etc.) from the strategic plan.

| # | Task | Component/Page | Edge Function | Description | Status | Priority |
|---|------|----------------|---------------|-------------|--------|----------|
| 1 | **Generate Programs** | `StrategyToProgramGenerator` | `strategy-program-theme-generator` | AI-generate programs from strategic objectives | ✅ Complete | - |
| 2 | **Generate Challenges** | `StrategyChallengeGenerator` | `strategy-challenge-generator` | AI-generate challenges from objectives | ⚠️ Partial | P1 |
| 3 | **Generate Pilots** | `StrategyToPilotGenerator` | - | Generate pilots from programs/solutions | ⚠️ Component Only | P2 |
| 4 | **Generate Sandboxes** | `StrategyToSandboxGenerator` | `strategy-sandbox-planner` | AI-generate sandboxes for innovation testing | ✅ Complete | - |
| 5 | **Generate Living Labs** | `StrategyToLivingLabGenerator` | `strategy-lab-research-generator` | AI-generate living lab designs | ⚠️ Function Only | P2 |
| 6 | **Generate R&D Calls** | `StrategyToRDCallGenerator` | `strategy-rd-call-generator` | Generate R&D calls from challenges | ⚠️ Function Only | P2 |
| 7 | **Generate Partnerships** | `StrategyToPartnershipGenerator` | `strategy-partnership-matcher` | AI-match partners to strategic goals | ❌ Missing | P2 |
| 8 | **Generate Events** | `StrategyToEventGenerator` | `strategy-event-planner` | Plan events aligned to strategy | ❌ Missing | P3 |
| 9 | **Generate Campaigns** | `StrategyToCampaignGenerator` | `strategy-campaign-planner` | Plan marketing campaigns | ❌ Missing | P3 |
| 10 | **Generate Policies** | `StrategyToPolicyGenerator` | `strategy-policy-deriver` | Derive policy recommendations | ❌ Missing | P3 |

#### Component Specifications - Phase 3

##### 3.1 StrategyChallengeGenerator (Needs UI)
```typescript
interface StrategyChallengeGenerator {
  // Current State: Edge function exists, UI missing
  
  // Required UI Features
  - Strategic plan selector
  - Objective multi-selector
  - Sector filter
  - AI generation trigger
  - Preview and edit
  - Batch creation
  
  // Edge Function: strategy-challenge-generator (NEW)
  inputs: {
    strategic_objective_ids: string[];
    sector_id: string;
    municipality_id?: string;
    challenge_count: number;
  }
  
  outputs: {
    challenges: Array<{
      title_en: string;
      title_ar: string;
      description_en: string;
      description_ar: string;
      problem_statement_en: string;
      problem_statement_ar: string;
      desired_outcome_en: string;
      desired_outcome_ar: string;
      kpis: KPI[];
      strategic_plan_ids: string[];
    }>;
  }
  
  // AI Prompt
  prompt: `Generate innovation challenges that address the following 
  strategic objectives: {objectives}. 
  Focus on sector: {sector}. 
  Each challenge should have clear problem statement, 
  desired outcome, and measurable KPIs.`
}
```

##### 3.2 StrategyToLivingLabGenerator (Needs UI)
```typescript
interface StrategyToLivingLabGenerator {
  // Current State: Edge function exists, UI missing
  
  // Required UI Features
  - Strategic plan selector
  - Research focus areas input
  - Municipality selector
  - AI generation trigger
  - Preview and customize
  
  // Uses: strategy-lab-research-generator
  // Needs: Matching UI component
}
```

##### 3.3 StrategyToRDCallGenerator (Needs UI)
```typescript
interface StrategyToRDCallGenerator {
  // Current State: Edge function exists, UI missing
  
  // Required UI Features
  - Challenge selector (multi)
  - Budget range input
  - Timeline selector
  - AI generation trigger
  - Preview and edit
  
  // Uses: strategy-rd-call-generator
  // Needs: Matching UI component
}
```

##### 3.4 StrategyToPartnershipGenerator (NEW)
```typescript
interface StrategyToPartnershipGenerator {
  // Features
  - Strategic goal input
  - Capability needs identifier
  - Partner recommendation engine
  - Match scoring
  - Outreach planning
  
  // Edge Function: strategy-partnership-matcher (NEW)
  inputs: {
    strategic_plan_id: string;
    capability_needs: string[];
    partnership_types: string[];
  }
  
  outputs: {
    partner_recommendations: Array<{
      organization_id: string;
      match_score: number;
      capability_match: string[];
      strategic_alignment: string;
      recommended_partnership_type: string;
      suggested_activities: string[];
    }>;
  }
  
  // AI Integration
  - Capability matching algorithm
  - Organization profiling
  - Strategic fit scoring
}
```

##### 3.5 StrategyToEventGenerator (NEW)
```typescript
interface StrategyToEventGenerator {
  // Features
  - Event type selector
  - Strategic objective linking
  - Audience definition
  - AI event planning
  - Calendar integration
  
  // Edge Function: strategy-event-planner (NEW)
  inputs: {
    strategic_plan_id: string;
    event_type: 'conference' | 'workshop' | 'hackathon' | 'exhibition';
    target_objectives: string[];
    target_audience: string[];
  }
  
  outputs: {
    event_plan: {
      title_en: string;
      title_ar: string;
      description: string;
      suggested_date_range: { start: date; end: date };
      agenda: AgendaItem[];
      speakers_needed: string[];
      kpis: EventKPI[];
      estimated_budget: number;
    };
  }
}
```

##### 3.6 StrategyToCampaignGenerator (NEW)
```typescript
interface StrategyToCampaignGenerator {
  // Features
  - Campaign objective selector
  - Audience targeting
  - Message generation
  - Channel planning
  - Timeline creation
  
  // Edge Function: strategy-campaign-planner (NEW)
  inputs: {
    strategic_plan_id: string;
    campaign_objective: string;
    target_audience: string[];
    channels: string[];
    budget: number;
  }
  
  outputs: {
    campaign_plan: {
      name: string;
      key_messages: { en: string; ar: string }[];
      channel_strategy: ChannelPlan[];
      timeline: CampaignPhase[];
      content_calendar: ContentItem[];
      kpis: CampaignKPI[];
    };
  }
}
```

##### 3.7 StrategyToPolicyGenerator (NEW)
```typescript
interface StrategyToPolicyGenerator {
  // Features
  - Policy area selector
  - Strategic alignment display
  - Policy draft generation
  - Stakeholder impact analysis
  - Approval workflow initiation
  
  // Edge Function: strategy-policy-deriver (NEW)
  inputs: {
    strategic_plan_id: string;
    policy_area: string;
    target_objectives: string[];
  }
  
  outputs: {
    policy_draft: {
      title_en: string;
      title_ar: string;
      executive_summary: string;
      policy_statement: string;
      rationale: string;
      implementation_steps: string[];
      stakeholder_impacts: StakeholderImpact[];
      success_metrics: PolicyMetric[];
    };
  }
}
```

---

### Phase 4: Governance & Approval

**Purpose:** Ensure proper governance, approval, and version control of strategic plans.

| # | Task | Component/Page | Description | Status | Priority |
|---|------|----------------|-------------|--------|----------|
| 1 | **Plan Approval Workflow** | `strategic-plan-approval` | Multi-step approval process for plans | ✅ Exists | - |
| 2 | **Stakeholder Sign-off** | `StakeholderSignoffTracker` | Track stakeholder approvals and sign-offs | ❌ Missing | P2 |
| 3 | **Committee Review** | `GovernanceCommitteeManager` | Manage governance committee reviews | ✅ Exists | - |
| 4 | **Executive Approval** | `ExecutiveApprovals` | Executive-level approval workflow | ✅ Exists | - |
| 5 | **Version Control** | `StrategyVersionControl` | Track versions and changes to strategic plans | ❌ Missing | P2 |

#### Component Specifications - Phase 4

##### 4.1 StakeholderSignoffTracker
```typescript
interface StakeholderSignoffTracker {
  // Features
  - Signoff request management
  - Status tracking dashboard
  - Reminder automation
  - Digital signature capture
  - Audit trail
  
  // Data Model
  interface SignoffRequest {
    id: string;
    strategic_plan_id: string;
    stakeholder_id: string;
    stakeholder_name: string;
    stakeholder_role: string;
    requested_date: timestamp;
    due_date: timestamp;
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    signed_date?: timestamp;
    signature_url?: string;
    comments: string;
    reminder_count: number;
  }
  
  // Notifications
  - Email reminders (configurable)
  - Escalation after due date
  - Completion notifications
}
```

##### 4.2 StrategyVersionControl
```typescript
interface StrategyVersionControl {
  // Features
  - Version history
  - Change comparison (diff)
  - Version restoration
  - Change annotations
  - Approval per version
  
  // Data Model
  interface StrategyVersion {
    id: string;
    strategic_plan_id: string;
    version_number: string; // semver
    version_label: string;
    created_at: timestamp;
    created_by: string;
    change_summary: string;
    changes: ChangeRecord[];
    status: 'draft' | 'in_review' | 'approved' | 'superseded';
    snapshot: JSON; // Full plan snapshot
  }
  
  interface ChangeRecord {
    field_path: string;
    old_value: any;
    new_value: any;
    change_type: 'added' | 'modified' | 'removed';
    reason: string;
  }
  
  // Features
  - Side-by-side version comparison
  - Rollback capability
  - Change impact analysis
}
```

---

### Phase 5: Communication & Publishing

**Purpose:** Communicate the strategy internally and externally.

| # | Task | Component/Page | Description | Status | Priority |
|---|------|----------------|-------------|--------|----------|
| 1 | **Internal Communication** | `CommunicationsHub` | Manage internal strategy communications | ✅ Exists | - |
| 2 | **Strategy Publishing** | `StrategyPublicView` | Public-facing strategy display page | ❌ Missing | P3 |
| 3 | **Stakeholder Notification** | `email-trigger-hub` | Automated notifications to stakeholders | ✅ Exists | - |
| 4 | **Strategy Dashboard (Public)** | `PublicStrategyDashboard` | Public dashboard showing strategy progress | ❌ Missing | P3 |

#### Component Specifications - Phase 5

##### 5.1 StrategyPublicView
```typescript
interface StrategyPublicView {
  // Route: /strategy/public/:id
  
  // Features
  - Public-facing strategy summary
  - Vision and objectives display
  - Progress visualization
  - Key achievements
  - Contact/feedback form
  
  // Access Control
  - No authentication required
  - Rate limiting
  - Optional password protection
  
  // Content
  - Executive summary
  - Strategic pillars
  - Key objectives
  - Progress indicators
  - Success stories
  - Upcoming initiatives
  
  // Styling
  - Branded template
  - Bilingual support
  - Mobile responsive
  - PDF export
}
```

##### 5.2 PublicStrategyDashboard
```typescript
interface PublicStrategyDashboard {
  // Route: /strategy/dashboard/:id
  
  // Features
  - Real-time KPI display
  - Progress charts
  - Milestone tracker
  - News/updates feed
  - Interactive elements
  
  // Widgets
  - KPI progress cards
  - Timeline visualization
  - Entity counts (programs, pilots, etc.)
  - Geographic distribution map
  - Sector coverage chart
  
  // Refresh
  - Auto-refresh every 5 minutes
  - Manual refresh button
}
```

---

### Phase 6: Monitoring & Tracking

**Purpose:** Monitor strategy execution and track progress against KPIs.

| # | Task | Component/Page | Description | Status | Priority |
|---|------|----------------|-------------|--------|----------|
| 1 | **KPI Tracking** | `useStrategicKPI` | Track and update strategic KPIs | ✅ Exists | - |
| 2 | **Progress Monitoring** | `StrategicCoverageWidget` | Monitor entity coverage and linkage | ✅ Exists | - |
| 3 | **Coverage Analysis** | `useStrategicCascadeValidation` | Validate strategic cascade integrity | ✅ Exists | - |
| 4 | **What-If Simulation** | `WhatIfSimulator` | Model scenario impacts | ✅ Exists | - |
| 5 | **Gap Analysis** | `SectorGapAnalysisWidget` | Identify coverage gaps | ✅ Exists | - |
| 6 | **Strategic Reports** | `StrategicNarrativeGenerator` | AI-generated narrative reports | ✅ Exists | - |
| 7 | **Alignment Scoring** | `strategic-priority-scoring` | Score entity alignment to strategy | ✅ Exists | - |
| 8 | **Bottleneck Detection** | `BottleneckDetector` | Identify execution bottlenecks | ✅ Exists | - |
| 9 | **Real-time Dashboard** | `StrategyCockpit` | Central strategy monitoring cockpit | ⚠️ Needs Enhancement | P2 |

#### Component Specifications - Phase 6

##### 6.1 StrategyCockpit Enhancement
```typescript
interface StrategyCockpit {
  // Current Features (Implemented)
  - Strategic plan selector
  - Basic metrics display
  - Entity counts
  
  // Enhancement Needed
  additions: {
    - Real-time KPI gauges
    - Predictive alerts
    - Cross-entity drill-down
    - Executive summary generator
    - Export to executive briefing
    - Mobile-optimized view
    - Customizable widget layout
    - Alert configuration
    - Trend analysis
    - Comparative view (vs targets)
  }
  
  // Widget Library
  widgets: [
    'kpi_gauge',
    'entity_pipeline',
    'coverage_heatmap',
    'risk_radar',
    'milestone_timeline',
    'bottleneck_alert',
    'trend_chart',
    'comparison_bar'
  ]
}
```

---

### Phase 7: Review & Adjustment

**Purpose:** Periodically review strategy execution and make adjustments.

| # | Task | Component/Page | Description | Status | Priority |
|---|------|----------------|-------------|--------|----------|
| 1 | **Mid-Year Review** | `MidYearReviewDashboard` | Conduct mid-year strategy reviews | ✅ Exists | - |
| 2 | **Lessons Learned** | `LessonsLearnedRepository` | Capture and analyze lessons | ✅ Exists | - |
| 3 | **Strategy Adjustment** | `StrategyAdjustmentWizard` | Guided workflow for strategy adjustments | ❌ Missing | P2 |
| 4 | **Re-prioritization** | `StrategyReprioritizer` | Re-prioritize objectives based on learnings | ❌ Missing | P2 |
| 5 | **Impact Assessment** | `StrategyImpactAssessment` | Assess overall strategy impact | ❌ Missing | P3 |

#### Component Specifications - Phase 7

##### 7.1 StrategyAdjustmentWizard
```typescript
interface StrategyAdjustmentWizard {
  // Features
  - Guided adjustment workflow
  - Change justification capture
  - Impact analysis
  - Stakeholder notification
  - Version creation
  
  // Wizard Steps
  steps: [
    'select_elements', // What to adjust
    'define_changes', // New values
    'justify_changes', // Rationale
    'impact_analysis', // Auto-analyze downstream impact
    'approval_routing', // Who needs to approve
    'communication_plan', // How to communicate
    'confirm_execute' // Final confirmation
  ]
  
  // Change Types
  - Objective modification
  - KPI target adjustment
  - Timeline extension/compression
  - Resource reallocation
  - Priority change
  - Scope expansion/reduction
}
```

##### 7.2 StrategyReprioritizer
```typescript
interface StrategyReprioritizer {
  // Features
  - Priority scoring matrix
  - Drag-drop reordering
  - Impact visualization
  - Resource rebalancing
  - Notification generation
  
  // Prioritization Criteria
  criteria: [
    'strategic_importance',
    'resource_availability',
    'quick_wins_potential',
    'risk_level',
    'stakeholder_demand',
    'external_dependencies'
  ]
  
  // Visualizations
  - Priority matrix (effort vs impact)
  - Before/after comparison
  - Resource allocation shift
  - Timeline impact
}
```

##### 7.3 StrategyImpactAssessment
```typescript
interface StrategyImpactAssessment {
  // Features
  - Comprehensive impact analysis
  - Multi-dimensional scoring
  - Benchmark comparison
  - Trend visualization
  - Report generation
  
  // Impact Dimensions
  dimensions: [
    'economic_impact',
    'social_impact',
    'environmental_impact',
    'institutional_impact',
    'innovation_capacity_impact'
  ]
  
  // Data Sources
  - KPI achievements
  - Pilot outcomes
  - Solution adoptions
  - Partnership results
  - Citizen feedback
  - MII improvements
  
  // Outputs
  - Impact scorecard
  - Trend analysis
  - Recommendations
  - Executive summary
  - Full assessment report
}
```

---

## Entity Integration Model

### Integration Hierarchy (Tree View)

```
STRATEGIC PLANS (Root)
│
├── DIRECT INTEGRATION (explicit strategic_plan_ids[])
│   ├── Programs ✅
│   │   └── Events ✅ (also has direct!)
│   ├── Challenges ✅
│   ├── Partnerships ✅
│   ├── Sandboxes ✅
│   ├── Living Labs ✅
│   ├── Policy Documents ✅
│   └── Global Trends ✅
│
├── INDIRECT INTEGRATION (via parent chain)
│   ├── Solutions (via Challenge/Program) ✅
│   ├── Pilots (via Solution→Challenge) ✅
│   ├── Scaling Plans (via Pilot + R&D) ✅
│   ├── R&D Calls (via Challenges + Programs) ✅
│   ├── R&D Projects (via R&D Calls) ✅
│   ├── Matchmaker Applications ✅
│   ├── Innovation Proposals ✅
│   ├── Challenge Proposals ✅
│   ├── Email Campaigns ✅
│   ├── Contracts (via Pilot/Solution) ✅
│   └── Citizen Enrollments (via Pilot) ✅
│
└── NO INTEGRATION (by design)
    ├── Providers (External)
    ├── Organizations (External)
    ├── Citizen Ideas (Raw input)
    ├── Regions (Geographic)
    ├── Cities (Geographic)
    └── Sectors (Reference data)
```

### Model Corrections Applied

1. **Events** - Originally classified as INDIRECT, but has DIRECT integration fields
2. **Municipalities** - Reclassified as DIRECT (owns strategic_plan_id)
3. **Policy Documents** - Added to DIRECT integration (P2)
4. **Global Trends** - Added to DIRECT integration (P2)

### Three-Tier Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STRATEGY SYSTEM                                      │
│                    (Strategic Plans, Objectives, KPIs)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TIER 1: DIRECT INTEGRATION ✅ ALL COMPLETE                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Programs ✅   │ Challenges ✅ │ Partnerships ✅ │ Sandboxes ✅ │ Labs ✅│   │
│  │ (100%)        │ (100%)        │ (100%)          │ (100%)       │ (100%) │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│         ▼                                                                    │
│  TIER 2: INDIRECT INTEGRATION ✅ ALL COMPLETE                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Campaigns ✅  │ R&D Calls ✅  │ Events ✅ │ Matchmaker ✅ │ Solutions ✅ │   │
│  │ (100%)        │ (100%)        │ (100%+)   │ (100%)       │ (100%)      │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │ Pilots ✅ │ R&D Projects ✅ │ Scaling ✅  │ Proposals ✅ │ Innovations ✅│   │
│  │ (100%)    │ (100%)          │ (100%)      │ (100%)       │ (100%)       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│         ▼                                                                    │
│  TIER 3: NO INTEGRATION (By Design)                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Providers (External) │ Ideas (Raw Input) │ Municipalities (Owns Plan) │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### DIRECT Integration Requirements ✅ ALL COMPLETE

Entities with explicit strategy fields (ALL DB FIELDS NOW PRESENT):

| Entity | Required Fields | Current State | Status |
|--------|-----------------|---------------|--------|
| **Programs** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `lessons_learned` | ✅ All present | ✅ Complete |
| **Challenges** | `strategic_plan_ids[]`, `strategic_goal` | ✅ All present | ✅ Complete |
| **Partnerships** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategy_derivation_date` | ✅ All present | ✅ Complete |
| **Sandboxes** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `strategic_gaps_addressed[]`, `strategic_taxonomy_codes[]` | ✅ All present | ✅ Complete |
| **Living Labs** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `research_priorities`, `strategic_taxonomy_codes[]` | ✅ All present | ✅ Complete |

### INDIRECT Integration Chains ✅ ALL COMPLETE

| Entity | Via Chain | DB Fields | Status |
|--------|-----------|-----------|--------|
| **Campaigns** | Programs → Strategy | ✅ `program_id`, `challenge_id` | ✅ FIXED |
| **R&D Calls** | Challenges + Programs → Strategy | ✅ `challenge_ids[]`, `program_id` | ✅ FIXED |
| **Events** | Programs → Strategy | `program_id` + DIRECT fields | ✅ EXCEEDS |
| **Matchmaker** | Challenges → Strategy | `target_challenges[]` | ✅ Works |
| **Solutions** | Programs/R&D → Strategy | `source_program_id`, `source_rd_project_id` | ✅ Works |
| **Pilots** | Challenges → Strategy | `challenge_id`, `source_program_id` | ✅ Works |
| **R&D Projects** | R&D Calls → Challenges → Strategy | `rd_call_id`, `challenge_ids[]` | ✅ Works |
| **Scaling Plans** | Pilots + R&D → Strategy | ✅ `pilot_id`, `rd_project_id` | ✅ FIXED |
| **Proposals** | Challenges → Strategy | `challenge_id`, `target_challenges[]` | ✅ Works |
| **Innovations** | Challenges → Strategy | `target_challenges[]` | ✅ Works |

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STRATEGY SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   STRATEGY   │───▶│   ENTITIES   │───▶│   OUTCOMES   │                   │
│  │    LAYER     │    │    LAYER     │    │    LAYER     │                   │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘                   │
│         │                                        │                           │
│         └────────────── FEEDBACK ────────────────┘                           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           AI SERVICES                                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │  Insights  │ │   Themes   │ │    Gaps    │ │ Narratives │                │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘                │
├─────────────────────────────────────────────────────────────────────────────┤
│                         EDGE FUNCTIONS                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │  Approval  │ │  Scoring   │ │  Generator │ │  Analysis  │                │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── pages/
│   ├── StrategyCockpit.jsx              # Main dashboard
│   ├── StrategicPlanBuilder.jsx         # Create/edit plans
│   ├── StrategyFeedbackDashboard.jsx    # Bidirectional hub
│   ├── GapAnalysisTool.jsx              # Gap detection
│   ├── OKRManagementSystem.jsx          # OKR management
│   └── ... (20+ more pages)
│
├── components/strategy/
│   ├── StrategyToProgramGenerator.jsx   # Forward flow
│   ├── StrategicGapProgramRecommender.jsx # Gap recommendations
│   ├── WhatIfSimulator.jsx              # What-if simulation
│   └── ... (11 more components)
│
├── components/programs/
│   ├── ProgramOutcomeKPITracker.jsx     # KPI tracking
│   ├── ProgramLessonsToStrategy.jsx     # Lessons feedback
│   └── StrategicAlignmentWidget.jsx     # Alignment display
│
├── components/events/
│   └── EventStrategicAlignment.jsx      # Event linking
│
├── hooks/
│   ├── useStrategicKPI.js               # Centralized KPI logic
│   └── useStrategicCascadeValidation.js # Cascade validation & coverage
│
└── supabase/functions/
    ├── strategic-plan-approval/
    ├── strategic-priority-scoring/
    ├── strategy-program-theme-generator/
    ├── strategy-lab-research-generator/   # Updated with strategic fields
    ├── strategy-rd-call-generator/
    ├── strategy-sandbox-planner/          # Updated with strategic fields
    └── strategy-sector-gap-analysis/
```

---

## Data Model

### Core Tables

#### strategic_plans

```typescript
interface StrategicPlan {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  municipality_id: string;
  start_year: number;
  end_year: number;
  vision_en: string;
  vision_ar: string;
  pillars: JSONB;      // Strategic pillars array
  objectives: JSONB;   // Strategic objectives array
  kpis: JSONB;         // Key performance indicators
  status: string;      // draft|pending|active|completed|archived
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Strategic Fields on Entities ✅ ALL COMPLETE

#### CURRENT STATE (All Fields Present)

| Entity | Current Fields | Status |
|--------|---------------|--------|
| **programs** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategic_pillar_id`, `strategic_priority_level`, `strategic_kpi_contributions`, `is_strategy_derived`, `strategy_derivation_date`, `lessons_learned` | ✅ COMPLETE |
| **events** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategic_pillar_id`, `strategic_alignment_score`, `is_strategy_derived`, `strategy_derivation_date`, `program_id` | ✅ COMPLETE |
| **challenges** | `strategic_plan_ids[]`, `strategic_goal`, `linked_program_ids[]` | ✅ COMPLETE |
| **partnerships** | `is_strategic`, `linked_challenge_ids[]`, `linked_pilot_ids[]`, `linked_program_ids[]`, `strategic_plan_ids[]`, `strategic_objective_ids[]`, `strategy_derivation_date` | ✅ COMPLETE |
| **sandboxes** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `strategic_gaps_addressed[]`, `strategic_taxonomy_codes[]` | ✅ COMPLETE |
| **living_labs** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived`, `strategy_derivation_date`, `research_priorities`, `strategic_taxonomy_codes[]` | ✅ COMPLETE |
| **email_campaigns** | `program_id`, `challenge_id` | ✅ COMPLETE |
| **scaling_plans** | `pilot_id`, `rd_project_id` | ✅ COMPLETE |
| **rd_calls** | `challenge_ids[]`, `program_id` | ✅ COMPLETE |
| **policy_documents** | `strategic_plan_ids[]`, `strategic_objective_ids[]`, `is_strategy_derived` | ✅ COMPLETE |
| **global_trends** | `strategic_plan_ids[]` | ✅ COMPLETE |

---

## Pages Inventory

### Core Strategy Pages (25+)

| # | Page | Purpose | Status |
|---|------|---------|--------|
| 1 | StrategyCockpit | Main strategy dashboard | ✅ |
| 2 | StrategicPlanBuilder | Create/edit plans | ✅ |
| 3 | StrategyFeedbackDashboard | Bidirectional hub | ✅ |
| 4 | GapAnalysisTool | AI-powered gap detection | ✅ |
| 5 | OKRManagementSystem | OKR management | ✅ |
| 6 | Portfolio | Innovation Kanban | ✅ |
| 7 | StrategicPlanApprovalGate | Approval workflow | ✅ |
| 8 | BudgetAllocationTool | Budget allocation | ✅ |
| 9 | BudgetAllocationApprovalGate | Budget approval | ✅ |
| 10 | WhatIfSimulatorPage | Scenario simulation | ✅ |
| 11 | StrategicKPITracker | KPI monitoring | ✅ |
| 12 | StrategicExecutionDashboard | Execution view | ✅ |
| 13 | StrategicInitiativeTracker | Initiative tracking | ✅ |
| 14 | StrategicPlanningProgress | Progress tracking | ✅ |
| 15 | StrategicAdvisorChat | AI advisor | ✅ |
| 16 | StrategyCopilotChat | Strategy copilot | ✅ |
| 17 | StrategyAlignment | Entity alignment | ✅ |
| 18 | InitiativePortfolio | Portfolio view | ✅ |
| 19 | ProgressToGoalsTracker | Goal tracking | ✅ |
| 20 | MultiYearRoadmap | Long-term planning | ✅ |
| 21 | InitiativeLaunchGate | Launch gate | ✅ |
| 22 | PortfolioReviewGate | Review gate | ✅ |
| 23 | PortfolioRebalancing | Rebalancing | ✅ |
| 24 | StrategicCommunicationsHub | Communications | ✅ |
| 25 | StrategicPlanningCoverageReport | Coverage report | ✅ |

---

## Components Inventory

### Strategy Components ✅ 20 Complete

| # | Component | Purpose | AI | Status |
|---|-----------|---------|-----|--------|
| 1 | StrategyToProgramGenerator | Generate programs from plans | ✅ | ✅ |
| 2 | StrategicGapProgramRecommender | Gap-based recommendations | ✅ | ✅ |
| 3 | WhatIfSimulator | Scenario simulation | ✅ | ✅ |
| 4 | SectorGapAnalysisWidget | Sector gap analysis | ✅ | ✅ |
| 5 | BottleneckDetector | Pipeline bottleneck detection | ✅ | ✅ |
| 6 | StrategicNarrativeGenerator | AI narrative generation | ✅ | ✅ |
| 7 | ResourceAllocationView | Resource visualization | No | ✅ |
| 8 | PartnershipNetwork | Network visualization | No | ✅ |
| 9 | CollaborationMapper | Collaboration view | No | ✅ |
| 10 | HistoricalComparison | Year-over-year comparison | No | ✅ |
| 11 | GeographicCoordinationWidget | Geographic coordination | No | ✅ |
| 12 | StrategicPlanWorkflowTab | Workflow stage display | No | ✅ |
| 13 | StrategyChallengeRouter | Challenge routing | No | ✅ |
| 14 | AutomatedMIICalculator | MII score calculation | No | ✅ |
| 15 | StrategicAlignmentSandbox | Sandbox strategy alignment | No | ✅ CREATED |
| 16 | StrategicAlignmentLivingLab | Living lab strategy alignment | No | ✅ CREATED |
| 17 | StrategicAlignmentPartnership | Partnership strategy alignment | No | ✅ CREATED |
| 18 | StrategicPlanSelector | Shared reusable selector | No | ✅ CREATED |
| 19 | StrategicCoverageWidget | Coverage metrics dashboard | No | ✅ CREATED |
| 20 | StrategyDrillDown | Cross-entity drill-down page | No | ✅ CREATED |

---

## Edge Functions

### Strategy Edge Functions (7)

| # | Function | Purpose | Status |
|---|----------|---------|--------|
| 1 | `strategic-plan-approval` | Process approval actions | ✅ |
| 2 | `strategic-priority-scoring` | Calculate priority scores | ✅ |
| 3 | `strategy-program-theme-generator` | AI program theme generation | ✅ |
| 4 | `strategy-lab-research-generator` | AI research brief generation | ✅ |
| 5 | `strategy-rd-call-generator` | Generate R&D calls | ✅ |
| 6 | `strategy-sandbox-planner` | Plan sandbox from strategy | ✅ |
| 7 | `strategy-sector-gap-analysis` | Sector gap analysis | ✅ |

---

## Hooks

### useStrategicKPI Hook

**File:** `src/hooks/useStrategicKPI.js` (211 lines)

```typescript
export function useStrategicKPI() {
  return {
    // Data
    strategicPlans,           // All strategic plans
    strategicKPIs,           // Extracted KPIs from plans
    isLoading,               // Loading state
    isUpdating,              // Mutation state

    // Mutations
    updateStrategicKPI,      // Update single KPI
    updateStrategicKPIAsync, // Async update with await
    batchUpdateKPIs,         // Batch update from programs

    // Utilities
    calculateProgramContribution,  // Calculate program→KPI contribution
    getLinkedKPIs,                 // Get KPIs linked to program
    getStrategicCoverage          // Get coverage metrics
  };
}
```

---

## AI Features

### 7 AI-Powered Features

| # | Feature | Component/Function | Model | Status |
|---|---------|-------------------|-------|--------|
| 1 | Strategic Insights | StrategyCockpit | gemini-2.5-flash | ✅ |
| 2 | Program Theme Generation | strategy-program-theme-generator | gemini-2.5-flash | ✅ |
| 3 | Gap Recommendations | StrategicGapProgramRecommender | gemini-2.5-flash | ✅ |
| 4 | Plan Generation | StrategicPlanBuilder | gemini-2.5-flash | ✅ |
| 5 | Strategy Feedback | ProgramLessonsToStrategy | gemini-2.5-flash | ✅ |
| 6 | Narrative Generation | StrategicNarrativeGenerator | gemini-2.5-flash | ✅ |
| 7 | What-If Simulation | WhatIfSimulator | gemini-2.5-flash | ✅ |

---

## User Flows

### Flow 1: Strategy-Driven Program Creation

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Strategic Plan  │───▶│ Theme Generator │───▶│ Program Created │
│ (Objectives)    │    │ (AI-powered)    │    │ (Auto-linked)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                             │
         └─────────── is_strategy_derived=true ────────┘
```

### Flow 2: Program Outcome Feedback

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Program KPIs    │───▶│ Lessons Learned │───▶│ Strategy Update │
│ (Achievements)  │    │ (AI Analysis)   │    │ (KPI Revision)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                             │
         └─────────── useStrategicKPI hook ────────────┘
```

### Flow 3: Gap Analysis & Recommendations

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Strategic Gaps  │───▶│ AI Analysis     │───▶│ Recommendations │
│ (Unmet Goals)   │    │ (Gap Detection) │    │ (New Programs)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Comprehensive Strategy System Flow

### Complete Innovation Ecosystem Flow Chart

```mermaid
flowchart TB
    subgraph STRATEGY["🎯 STRATEGY LAYER"]
        SP[Strategic Plans]
        OBJ[Objectives & KPIs]
        PILLARS[Pillars]
        SP --> OBJ
        SP --> PILLARS
    end

    subgraph GENERATION["⚡ AI GENERATION"]
        TPG[Theme Generator]
        LRG[Lab Research Generator]
        SBP[Sandbox Planner]
        RDG[R&D Call Generator]
        GAP[Gap Analyzer]
    end

    subgraph DIRECT["📦 DIRECT INTEGRATION (Tier 1)"]
        PROG[Programs]
        CHAL[Challenges]
        PART[Partnerships]
        SAND[Sandboxes]
        LABS[Living Labs]
        EVENTS[Events]
        POLICY[Policy Documents]
        TRENDS[Global Trends]
    end

    subgraph INDIRECT["🔗 INDIRECT INTEGRATION (Tier 2)"]
        SOL[Solutions]
        PIL[Pilots]
        RDC[R&D Calls]
        RDP[R&D Projects]
        SCALE[Scaling Plans]
        CAMP[Campaigns]
        PROP[Proposals]
        MATCH[Matchmaker]
    end

    subgraph OUTCOMES["📊 OUTCOMES & FEEDBACK"]
        KPI[KPI Tracking]
        LESS[Lessons Learned]
        COV[Coverage Analytics]
        FEED[Feedback Loop]
    end

    %% Strategy → Generation
    SP --> TPG
    SP --> LRG
    SP --> SBP
    SP --> RDG
    SP --> GAP

    %% Generation → Direct Entities
    TPG --> PROG
    LRG --> LABS
    SBP --> SAND
    RDG --> RDC
    GAP --> CHAL

    %% Strategy → Direct (explicit links)
    OBJ -.->|strategic_plan_ids| PROG
    OBJ -.->|strategic_plan_ids| CHAL
    OBJ -.->|strategic_plan_ids| PART
    OBJ -.->|strategic_plan_ids| SAND
    OBJ -.->|strategic_plan_ids| LABS
    OBJ -.->|strategic_plan_ids| EVENTS
    OBJ -.->|strategic_plan_ids| POLICY
    OBJ -.->|strategic_plan_ids| TRENDS

    %% Direct → Indirect chains
    PROG --> EVENTS
    PROG --> CAMP
    CHAL --> SOL
    CHAL --> PROP
    CHAL --> RDC
    CHAL --> MATCH
    SOL --> PIL
    PIL --> SCALE
    RDC --> RDP
    RDP --> SCALE

    %% Outcomes feedback
    PROG --> KPI
    PIL --> LESS
    RDP --> LESS
    KPI --> COV
    LESS --> FEED
    FEED --> SP
```

### Data Flow Summary

| Flow Direction | Entities Involved | Mechanism |
|---------------|-------------------|-----------|
| **Strategy → Programs** | Strategic Plans → Programs | `strategic_plan_ids[]`, AI Theme Generator |
| **Strategy → Challenges** | Objectives → Challenges | `strategic_plan_ids[]`, Gap Analyzer |
| **Strategy → Sandboxes** | Plans → Sandboxes | `strategic_plan_ids[]`, Sandbox Planner |
| **Strategy → Living Labs** | Plans → Labs | `strategic_plan_ids[]`, Lab Research Generator |
| **Programs → Pilots** | Programs → Solutions → Pilots | `source_program_id`, `challenge_id` |
| **Pilots → Strategy** | Pilots → Lessons → Plans | `useStrategicKPI` hook feedback |
| **Coverage → Strategy** | All Entities → Coverage Report | `useStrategicCascadeValidation` |

---

## Strategy Tools Inventory

### ✅ Implemented Tools (28 Total)

#### Pages (25)
| # | Tool | Type | Purpose |
|---|------|------|---------|
| 1 | StrategyCockpit | Page | Main strategy dashboard |
| 2 | StrategicPlanBuilder | Page | Create/edit plans |
| 3 | StrategyFeedbackDashboard | Page | Bidirectional feedback hub |
| 4 | GapAnalysisTool | Page | AI gap detection |
| 5 | OKRManagementSystem | Page | OKR management |
| 6 | WhatIfSimulatorPage | Page | Scenario simulation |
| 7 | StrategicKPITracker | Page | KPI monitoring |
| 8 | StrategicExecutionDashboard | Page | Execution tracking |
| 9 | MultiYearRoadmap | Page | Long-term planning |
| 10 | BudgetAllocationTool | Page | Budget management |
| 11+ | ... | Page | (15 more pages) |

#### Components (20)
| # | Tool | Type | AI-Powered |
|---|------|------|------------|
| 1 | StrategyToProgramGenerator | Component | ✅ |
| 2 | StrategicGapProgramRecommender | Component | ✅ |
| 3 | WhatIfSimulator | Component | ✅ |
| 4 | SectorGapAnalysisWidget | Component | ✅ |
| 5 | BottleneckDetector | Component | ✅ |
| 6 | StrategicNarrativeGenerator | Component | ✅ |
| 7 | StrategicPlanSelector | Component | No |
| 8 | StrategicCoverageWidget | Component | No |
| 9 | StrategyDrillDown | Component | No |
| 10 | StrategicAlignmentSandbox | Component | No |
| 11 | StrategicAlignmentLivingLab | Component | No |
| 12 | StrategicAlignmentPartnership | Component | No |
| 13-20 | ... | Component | (8 more) |

#### Edge Functions (7)
| # | Tool | Purpose |
|---|------|---------|
| 1 | strategic-plan-approval | Approval workflow |
| 2 | strategic-priority-scoring | Priority calculation |
| 3 | strategy-program-theme-generator | AI program themes |
| 4 | strategy-lab-research-generator | AI research briefs |
| 5 | strategy-rd-call-generator | R&D call generation |
| 6 | strategy-sandbox-planner | Sandbox planning |
| 7 | strategy-sector-gap-analysis | Sector gap analysis |

#### Hooks (2)
| # | Tool | Purpose |
|---|------|---------|
| 1 | useStrategicKPI | KPI management & feedback |
| 2 | useStrategicCascadeValidation | Chain validation & coverage |

### 🔄 Enhancement Opportunities - FULL IMPLEMENTATION PLAN

---

---

## Full Implementation Plan

### Summary Dashboard

| Phase | Implemented | Missing | Coverage | Priority |
|-------|-------------|---------|----------|----------|
| Phase 1: Pre-Planning | 4 | 7 | 36% | **P1: 4, P2: 3** |
| Phase 2: Strategy Creation | 4 | 6 | 40% | **P1: 4, P2: 2** |
| Phase 3: Cascade | 4 | 6 | 40% | **P1: 1, P2: 3, P3: 2** |
| Phase 4: Governance | 3 | 2 | 60% | **P2: 2** |
| Phase 5: Communication | 2 | 2 | 50% | **P3: 2** |
| Phase 6: Monitoring | 8 | 1 | 89% | **P2: 1** |
| Phase 7: Review | 2 | 3 | 40% | **P2: 2, P3: 1** |
| **TOTAL** | **27** | **27** | **50%** | - |

### Implementation Sprints

#### Sprint 1: P1 Critical (Pre-Planning & Strategy Creation Core)
**Duration:** 2 weeks | **Effort:** 64 hours

| # | Item | Type | Phase | Effort |
|---|------|------|-------|--------|
| 1 | `SWOTAnalysisBuilder` | Component | P1 | 8hr |
| 2 | `StakeholderAnalysisWidget` | Component | P1 | 6hr |
| 3 | `RiskAssessmentBuilder` | Component | P1 | 6hr |
| 4 | `EnvironmentalScanWidget` | Component | P1 | 8hr |
| 5 | `StrategyTimelinePlanner` | Component | P2 | 8hr |
| 6 | `StrategyOwnershipAssigner` | Component | P2 | 6hr |
| 7 | `ActionPlanBuilder` | Component | P2 | 10hr |
| 8 | `strategy-challenge-generator` | Edge Function | P3 | 4hr |
| 9 | `StrategyChallengeGenerator` | Component | P3 | 8hr |

**Deliverables:**
- Complete pre-planning toolkit
- Strategy creation workflow
- Challenge generation from strategy

#### Sprint 2: P2 Cascade & Governance (2 weeks) | 52 hours

| # | Item | Type | Phase | Effort |
|---|------|------|-------|--------|
| 1 | `StrategyInputCollector` | Component | P1 | 6hr |
| 2 | `BaselineDataCollector` | Component | P1 | 5hr |
| 3 | `StrategyToLivingLabGenerator` | Component | P3 | 6hr |
| 4 | `StrategyToRDCallGenerator` | Component | P3 | 5hr |
| 5 | `strategy-partnership-matcher` | Edge Function | P3 | 4hr |
| 6 | `StrategyToPartnershipGenerator` | Component | P3 | 6hr |
| 7 | `StakeholderSignoffTracker` | Component | P4 | 6hr |
| 8 | `StrategyVersionControl` | Component | P4 | 8hr |
| 9 | `NationalStrategyLinker` | Component | P2 | 6hr |

**Deliverables:**
- Complete cascade generators
- Governance tracking
- National strategy alignment

#### Sprint 3: P3 Monitoring & Review (2 weeks) | 48 hours

| # | Item | Type | Phase | Effort |
|---|------|------|-------|--------|
| 1 | `SectorStrategyBuilder` | Component | P2 | 8hr |
| 2 | `StrategyCockpit` Enhancement | Component | P6 | 8hr |
| 3 | `StrategyAdjustmentWizard` | Component | P7 | 8hr |
| 4 | `StrategyReprioritizer` | Component | P7 | 6hr |
| 5 | `strategy-alignment-scorer` | Edge Function | P6 | 3hr |
| 6 | `StrategyAlignmentScoreCard` | Component | P6 | 4hr |
| 7 | `useStrategyAlignment` | Hook | P6 | 4hr |
| 8 | `StrategyTemplateLibrary` | Component | P2 | 7hr |

**Deliverables:**
- Enhanced monitoring cockpit
- Review & adjustment workflow
- Alignment scoring

#### Sprint 4: P4 Communication & Polish (1 week) | 33 hours

| # | Item | Type | Phase | Effort |
|---|------|------|-------|--------|
| 1 | `StrategyPublicView` | Page | P5 | 6hr |
| 2 | `PublicStrategyDashboard` | Page | P5 | 6hr |
| 3 | `strategy-event-planner` | Edge Function | P3 | 3hr |
| 4 | `StrategyToEventGenerator` | Component | P3 | 5hr |
| 5 | `strategy-campaign-planner` | Edge Function | P3 | 3hr |
| 6 | `StrategyToCampaignGenerator` | Component | P3 | 5hr |
| 7 | `StrategyImpactAssessment` | Component | P7 | 5hr |

**Deliverables:**
- Public strategy views
- Event & campaign generation
- Impact assessment

#### Sprint 5: P5 Templates & Advanced (1 week) | 27 hours

| # | Item | Type | Phase | Effort |
|---|------|------|-------|--------|
| 1 | `StrategyTemplates` | Page | P2 | 8hr |
| 2 | `useStrategyTemplates` | Hook | P2 | 3hr |
| 3 | `strategy-policy-deriver` | Edge Function | P3 | 4hr |
| 4 | `StrategyToPolicyGenerator` | Component | P3 | 6hr |
| 5 | `StrategicBenchmarking` | Page | P6 | 6hr |

**Deliverables:**
- Template library
- Policy generation
- Benchmarking page

---

### Complete Implementation Checklist

#### Phase 1: Pre-Planning (11 items, 4 done, 7 missing)

| # | Item | Type | Status | Priority | Sprint |
|---|------|------|--------|----------|--------|
| 1 | EnvironmentalScanWidget | Component | ❌ Missing | P1 | 1 |
| 2 | SWOTAnalysisBuilder | Component | ❌ Missing | P1 | 1 |
| 3 | StakeholderAnalysisWidget | Component | ❌ Missing | P1 | 1 |
| 4 | ResourceAllocationView | Component | ✅ Exists | - | - |
| 5 | PolicyLibrary | Page | ✅ Exists | - | - |
| 6 | HistoricalComparison | Component | ✅ Exists | - | - |
| 7 | InternationalBenchmarkingSuite | Page | ✅ Exists | - | - |
| 8 | BudgetManagement | Page | ✅ Exists | - | - |
| 9 | RiskAssessmentBuilder | Component | ❌ Missing | P1 | 1 |
| 10 | StrategyInputCollector | Component | ❌ Missing | P2 | 2 |
| 11 | BaselineDataCollector | Component | ❌ Missing | P2 | 2 |

#### Phase 2: Strategy Creation (10 items, 4 done, 6 missing)

| # | Item | Type | Status | Priority | Sprint |
|---|------|------|--------|----------|--------|
| 1 | StrategicPlanBuilder | Page | ✅ Exists | - | - |
| 2 | useStrategicKPI | Hook | ✅ Exists | - | - |
| 3 | BudgetAllocationTool | Page | ✅ Exists | - | - |
| 4 | StrategyTimelinePlanner | Component | ❌ Missing | P1 | 1 |
| 5 | StrategyOwnershipAssigner | Component | ❌ Missing | P1 | 1 |
| 6 | ActionPlanBuilder | Component | ❌ Missing | P1 | 1 |
| 7 | NationalStrategyLinker | Component | ❌ Missing | P2 | 2 |
| 8 | SectorStrategyBuilder | Component | ❌ Missing | P2 | 3 |
| 9 | StrategyTemplateLibrary | Component | ❌ Missing | P3 | 3 |
| 10 | StrategyTemplates | Page | ❌ Missing | P3 | 5 |

#### Phase 3: Cascade & Operationalization (10 items, 4 done, 6 missing)

| # | Item | Type | Status | Priority | Sprint |
|---|------|------|--------|----------|--------|
| 1 | StrategyToProgramGenerator | Component | ✅ Exists | - | - |
| 2 | strategy-program-theme-generator | Edge Function | ✅ Exists | - | - |
| 3 | StrategyToSandboxGenerator | Component | ✅ Exists | - | - |
| 4 | strategy-sandbox-planner | Edge Function | ✅ Exists | - | - |
| 5 | strategy-challenge-generator | Edge Function | ❌ Missing | P1 | 1 |
| 6 | StrategyChallengeGenerator | Component | ❌ Missing | P1 | 1 |
| 7 | StrategyToLivingLabGenerator | Component | ❌ Missing | P2 | 2 |
| 8 | StrategyToRDCallGenerator | Component | ❌ Missing | P2 | 2 |
| 9 | strategy-partnership-matcher | Edge Function | ❌ Missing | P2 | 2 |
| 10 | StrategyToPartnershipGenerator | Component | ❌ Missing | P2 | 2 |
| 11 | strategy-event-planner | Edge Function | ❌ Missing | P3 | 4 |
| 12 | StrategyToEventGenerator | Component | ❌ Missing | P3 | 4 |
| 13 | strategy-campaign-planner | Edge Function | ❌ Missing | P3 | 4 |
| 14 | StrategyToCampaignGenerator | Component | ❌ Missing | P3 | 4 |
| 15 | strategy-policy-deriver | Edge Function | ❌ Missing | P3 | 5 |
| 16 | StrategyToPolicyGenerator | Component | ❌ Missing | P3 | 5 |

#### Phase 4: Governance & Approval (5 items, 3 done, 2 missing)

| # | Item | Type | Status | Priority | Sprint |
|---|------|------|--------|----------|--------|
| 1 | strategic-plan-approval | Edge Function | ✅ Exists | - | - |
| 2 | GovernanceCommitteeManager | Page | ✅ Exists | - | - |
| 3 | ExecutiveApprovals | Page | ✅ Exists | - | - |
| 4 | StakeholderSignoffTracker | Component | ❌ Missing | P2 | 2 |
| 5 | StrategyVersionControl | Component | ❌ Missing | P2 | 2 |

#### Phase 5: Communication & Publishing (4 items, 2 done, 2 missing)

| # | Item | Type | Status | Priority | Sprint |
|---|------|------|--------|----------|--------|
| 1 | CommunicationsHub | Page | ✅ Exists | - | - |
| 2 | email-trigger-hub | Edge Function | ✅ Exists | - | - |
| 3 | StrategyPublicView | Page | ❌ Missing | P3 | 4 |
| 4 | PublicStrategyDashboard | Page | ❌ Missing | P3 | 4 |

#### Phase 6: Monitoring & Tracking (9 items, 8 done, 1 missing)

| # | Item | Type | Status | Priority | Sprint |
|---|------|------|--------|----------|--------|
| 1 | useStrategicKPI | Hook | ✅ Exists | - | - |
| 2 | StrategicCoverageWidget | Component | ✅ Exists | - | - |
| 3 | useStrategicCascadeValidation | Hook | ✅ Exists | - | - |
| 4 | WhatIfSimulator | Component | ✅ Exists | - | - |
| 5 | SectorGapAnalysisWidget | Component | ✅ Exists | - | - |
| 6 | StrategicNarrativeGenerator | Component | ✅ Exists | - | - |
| 7 | strategic-priority-scoring | Edge Function | ✅ Exists | - | - |
| 8 | BottleneckDetector | Component | ✅ Exists | - | - |
| 9 | StrategyCockpit (Enhanced) | Page | ⚠️ Needs Enhancement | P2 | 3 |
| 10 | strategy-alignment-scorer | Edge Function | ❌ Missing | P2 | 3 |
| 11 | StrategyAlignmentScoreCard | Component | ❌ Missing | P2 | 3 |
| 12 | useStrategyAlignment | Hook | ❌ Missing | P2 | 3 |
| 13 | StrategicBenchmarking | Page | ❌ Missing | P3 | 5 |

#### Phase 7: Review & Adjustment (5 items, 2 done, 3 missing)

| # | Item | Type | Status | Priority | Sprint |
|---|------|------|--------|----------|--------|
| 1 | MidYearReviewDashboard | Page | ✅ Exists | - | - |
| 2 | LessonsLearnedRepository | Page | ✅ Exists | - | - |
| 3 | StrategyAdjustmentWizard | Component | ❌ Missing | P2 | 3 |
| 4 | StrategyReprioritizer | Component | ❌ Missing | P2 | 3 |
| 5 | StrategyImpactAssessment | Component | ❌ Missing | P3 | 4 |

---

### Effort & Timeline Summary

| Sprint | Duration | Effort | Key Deliverables |
|--------|----------|--------|-----------------|
| Sprint 1 | 2 weeks | 64 hr | Pre-planning tools, Strategy creation core |
| Sprint 2 | 2 weeks | 52 hr | Cascade generators, Governance tracking |
| Sprint 3 | 2 weeks | 48 hr | Monitoring enhancement, Review workflow |
| Sprint 4 | 1 week | 33 hr | Public views, Event/Campaign generation |
| Sprint 5 | 1 week | 27 hr | Templates, Policy generation, Benchmarking |
| **TOTAL** | **8 weeks** | **224 hr** | **Complete Strategy Leader Workflow** |

### File Structure for New Components

```
src/components/strategy/
├── pre-planning/
│   ├── EnvironmentalScanWidget.jsx        # P1 Sprint 1
│   ├── SWOTAnalysisBuilder.jsx            # P1 Sprint 1
│   ├── StakeholderAnalysisWidget.jsx      # P1 Sprint 1
│   ├── RiskAssessmentBuilder.jsx          # P1 Sprint 1
│   ├── StrategyInputCollector.jsx         # P2 Sprint 2
│   └── BaselineDataCollector.jsx          # P2 Sprint 2
│
├── creation/
│   ├── StrategyTimelinePlanner.jsx        # P1 Sprint 1
│   ├── StrategyOwnershipAssigner.jsx      # P1 Sprint 1
│   ├── ActionPlanBuilder.jsx              # P1 Sprint 1
│   ├── NationalStrategyLinker.jsx         # P2 Sprint 2
│   ├── SectorStrategyBuilder.jsx          # P2 Sprint 3
│   └── StrategyTemplateLibrary.jsx        # P3 Sprint 3
│
├── cascade/
│   ├── StrategyChallengeGenerator.jsx     # P1 Sprint 1
│   ├── StrategyToLivingLabGenerator.jsx   # P2 Sprint 2
│   ├── StrategyToRDCallGenerator.jsx      # P2 Sprint 2
│   ├── StrategyToPartnershipGenerator.jsx # P2 Sprint 2
│   ├── StrategyToEventGenerator.jsx       # P3 Sprint 4
│   ├── StrategyToCampaignGenerator.jsx    # P3 Sprint 4
│   └── StrategyToPolicyGenerator.jsx      # P3 Sprint 5
│
├── governance/
│   ├── StakeholderSignoffTracker.jsx      # P2 Sprint 2
│   └── StrategyVersionControl.jsx         # P2 Sprint 2
│
├── monitoring/
│   ├── StrategyAlignmentScoreCard.jsx     # P2 Sprint 3
│   └── EnhancedStrategyCockpit.jsx        # P2 Sprint 3
│
└── review/
    ├── StrategyAdjustmentWizard.jsx       # P2 Sprint 3
    ├── StrategyReprioritizer.jsx          # P2 Sprint 3
    └── StrategyImpactAssessment.jsx       # P3 Sprint 4

src/pages/strategy/
├── StrategyTemplates.jsx                   # P3 Sprint 5
├── StrategyPublicView.jsx                  # P3 Sprint 4
├── PublicStrategyDashboard.jsx             # P3 Sprint 4
└── StrategicBenchmarking.jsx               # P3 Sprint 5

src/hooks/
├── useStrategyAlignment.js                 # P2 Sprint 3
└── useStrategyTemplates.js                 # P3 Sprint 5

supabase/functions/
├── strategy-challenge-generator/           # P1 Sprint 1
├── strategy-partnership-matcher/           # P2 Sprint 2
├── strategy-alignment-scorer/              # P2 Sprint 3
├── strategy-event-planner/                 # P3 Sprint 4
├── strategy-campaign-planner/              # P3 Sprint 4
└── strategy-policy-deriver/                # P3 Sprint 5
```

---

## Gap Analysis - RESOLVED (Platform Integration)

### Previous Issues (All Fixed ✅)

| Issue | Resolution | Status |
|-------|------------|--------|
| Sandboxes missing strategic fields | Added all fields via migration | ✅ |
| Living Labs missing strategic fields | Added all fields via migration | ✅ |
| Programs missing columns | Added all fields via migration | ✅ |
| Missing alignment UI components | Created 6 new components | ✅ |
| Scaling Plans missing parent refs | Added pilot_id, rd_project_id | ✅ |
| R&D Calls missing program link | Added program_id | ✅ |
| Campaigns missing strategy chain | Added program_id, challenge_id | ✅ |

### Platform Integration: 100% COMPLETE ✅

All 21 entities are now properly integrated with the Strategy System:
- **8 Direct Integration**: Programs, Challenges, Partnerships, Sandboxes, Living Labs, Events, Policy Documents, Global Trends
- **13 Indirect Integration**: Via parent entity chains (Solutions, Pilots, R&D, Scaling, Campaigns, Proposals, etc.)

### Workflow Coverage: 50% COMPLETE ⚠️

The Strategy Leader workflow has 27 implemented tools and 27 missing tools across 7 phases.

**Next Steps:**
1. Prioritize Sprint 1 (P1 Critical Pre-Planning & Creation)
2. Execute Sprint 2 (Cascade & Governance)
3. Complete Sprints 3-5 for full workflow coverage

---

*Document last updated: 2025-12-13*
*Version: 5.0 - Complete Strategy Leader Workflow Design*
