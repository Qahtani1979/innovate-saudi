# Strategic Plan Creation Wizard - Design Document

> **Version**: 1.9  
> **Last Updated**: December 15, 2025  
> **Status**: ✅ Fully Implemented & Consistent

## Recent Changes (v1.9)
- Updated documentation to reflect Strategy Hub integration
- Added hub navigation context
- Verified wizard accessibility from hub header button

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Wizard Overview](#wizard-overview)
3. [Hub Integration](#hub-integration)
4. [Architecture](#architecture)
5. [Wizard Phases & Steps](#wizard-phases--steps)
6. [Component Inventory](#component-inventory)
7. [Data Model](#data-model)
8. [Workflow Diagrams](#workflow-diagrams)
9. [Auto-Save & Draft System](#auto-save--draft-system)
10. [Version Control System](#version-control-system)
11. [Approval Workflow Integration](#approval-workflow-integration)
12. [Template Integration](#template-integration)
13. [Step Validation](#step-validation)
14. [Implementation Status](#implementation-status)
15. [File Structure](#file-structure)
16. [API Reference](#api-reference)

---

## Executive Summary

The Strategic Plan Creation Wizard is a comprehensive 18-step guided process for creating, editing, and reviewing strategic plans. It supports three modes of operation:

- **Create Mode**: Build new strategic plans from scratch
- **Edit Mode**: Modify existing plans with version control
- **Review Mode**: Read-only view for approval workflows

Key features include:
- ✅ Auto-save functionality (every 30 seconds)
- ✅ Draft recovery system
- ✅ Version control with history tracking
- ✅ Integration with approval workflows
- ✅ AI-assisted content generation
- ✅ Progress tracking and validation

---

## Hub Integration

### Access Points from Strategy Hub

| Location | Access Method | Notes |
|----------|---------------|-------|
| Header Button | "New Strategy" button | Direct access to wizard |
| Templates Tab | "Create from Scratch" | Opens empty wizard |
| Templates Tab | Apply template | Opens wizard with template data |
| Workflow Tab | Plan cards | Edit existing plans |

### Navigation Flow

```
Strategy Hub (/strategy-hub)
├── Header Button: "New Strategy" → /strategic-plan-builder
├── Templates Tab
│   ├── "Open Template Library" → /strategy-templates-page
│   └── "Create from Scratch" → /strategic-plan-builder
└── Workflow Tab
    └── Plan Card → /strategic-plan-builder?planId=xxx&mode=edit
```

---

## Wizard Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Strategic Plan Wizard                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Create Mode   │  │    Edit Mode    │  │   Review Mode   │ │
│  │                 │  │                 │  │                 │ │
│  │  • New plans    │  │  • Version ctrl │  │  • Read-only    │ │
│  │  • AI assist    │  │  • Auto-save    │  │  • Approval     │ │
│  │  • Templates    │  │  • History      │  │  • Comments     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        18 Wizard Steps                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Phase 1: Foundation │ Phase 2: Analysis │ Phase 3: Strategy│ │
│  │ Steps 1-4           │ Steps 5-8         │ Steps 9-13       │ │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ Phase 4: Implementation                                   │   │
│  │ Steps 14-18                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Auto-Save     │  │  Draft Manager  │  │ Version Control │ │
│  │   (30 sec)      │  │  (Local + DB)   │  │  (History)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Wizard Phases & Steps

### Phase Overview

| Phase | Name | Steps | Purpose |
|-------|------|-------|---------|
| 1 | **Foundation** | 1-4 | Establish context, vision, stakeholders |
| 2 | **Analysis** | 5-8 | SWOT, scenarios, risks, dependencies |
| 3 | **Strategy** | 9-13 | Objectives, KPIs, action plans, resources |
| 4 | **Implementation** | 14-18 | Timeline, governance, communication, review |

### Detailed Step Breakdown

#### Phase 1: Foundation

| Step | Name | Required | Description | AI Support |
|------|------|----------|-------------|------------|
| 1 | Context & Discovery | ✅ | Basic plan info (name required), timeframe, scope | ✅ |
| 2 | Vision & Mission | ✅ | Strategic vision and mission statements (both required) | ✅ |
| 3 | Stakeholder Analysis | ❌ | Map stakeholders and their influence (recommended) | ✅ |
| 4 | PESTEL Analysis | ❌ | Political, Economic, Social, Tech, Environmental, Legal | ✅ |

#### Phase 2: Analysis

| Step | Name | Required | Description | AI Support |
|------|------|----------|-------------|------------|
| 5 | SWOT Analysis | ❌ | Strengths, Weaknesses, Opportunities, Threats (recommended) | ✅ |
| 6 | Scenario Planning | ❌ | Best, moderate, worst case scenarios | ✅ |
| 7 | Risk Assessment | ❌ | Identify and mitigate strategic risks (recommended) | ✅ |
| 8 | Dependencies | ❌ | External dependencies and constraints | ✅ |

#### Phase 3: Strategy

| Step | Name | Required | Description | AI Support |
|------|------|----------|-------------|------------|
| 9 | Strategic Objectives | ✅ | Define measurable objectives (min 1 required) | ✅ |
| 10 | National Alignment | ❌ | Align with national vision/programs | ❌ |
| 11 | KPIs & Metrics | ❌ | Define success metrics (recommended) | ✅ |
| 12 | Action Plans | ❌ | Detailed action items per objective (recommended) | ✅ |
| 13 | Resource Planning | ❌ | Budget, human resources, technology | ✅ |

#### Phase 4: Implementation

| Step | Name | Required | Description | AI Support |
|------|------|----------|-------------|------------|
| 14 | Timeline & Milestones | ❌ | Project timeline with key milestones (recommended) | ❌ |
| 15 | Governance Structure | ❌ | Roles, committees, reporting | ❌ |
| 16 | Communication Plan | ❌ | Stakeholder communication strategy | ✅ |
| 17 | Change Management | ❌ | Change readiness and adoption plan | ✅ |
| 18 | Review & Submit | ✅ | Final review and submission | ❌ |

---

## Component Inventory

### Existing Components (Reused)

| Component | Location | Purpose |
|-----------|----------|---------|
| `Step1Context` | `steps/Step1Context.jsx` | Basic plan information |
| `Step2SWOT` | `steps/Step2SWOT.jsx` | SWOT analysis (now Step 5) |
| `Step3Objectives` | `steps/Step3Objectives.jsx` | Strategic objectives (now Step 9) |
| `Step4Alignment` | `steps/Step4Alignment.jsx` | National alignment (now Step 10) |
| `Step5KPIs` | `steps/Step5KPIs.jsx` | KPI definitions (now Step 11) |
| `Step6ActionPlans` | `steps/Step6ActionPlans.jsx` | Action planning (now Step 12) |
| `Step7Timeline` | `steps/Step7Timeline.jsx` | Timeline/milestones (now Step 14) |

### New Components (Created)

| Component | Location | Purpose |
|-----------|----------|---------|
| `StrategyWizardWrapper` | `wizard/StrategyWizardWrapper.jsx` | Main wrapper with mode handling |
| `PlanSelectionDialog` | `wizard/PlanSelectionDialog.jsx` | Select/open existing plans |
| `Step2Vision` | `steps/Step2Vision.jsx` | Vision & mission statements |
| `Step3Stakeholders` | `steps/Step3Stakeholders.jsx` | Stakeholder mapping |
| `Step4PESTEL` | `steps/Step4PESTEL.jsx` | PESTEL analysis |
| `Step6Scenarios` | `steps/Step6Scenarios.jsx` | Scenario planning |
| `Step7Risks` | `steps/Step7Risks.jsx` | Risk assessment |
| `Step8Dependencies` | `steps/Step8Dependencies.jsx` | Dependencies & constraints |
| `Step13Resources` | `steps/Step13Resources.jsx` | Resource planning |
| `Step15Governance` | `steps/Step15Governance.jsx` | Governance structure |
| `Step16Communication` | `steps/Step16Communication.jsx` | Communication plan |
| `Step8Review` | `steps/Step8Review.jsx` | Final review (Step 18) |

### Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useAutoSaveDraft` | `hooks/strategy/useAutoSaveDraft.js` | Auto-save to local storage & DB |
| `useStrategicPlan` | `hooks/strategy/useStrategicPlan.js` | Fetch & manage plan data |
| `useStrategyAI` | `hooks/strategy/useStrategyAI.js` | AI content generation |

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| 18-Step Wizard | ✅ Complete | All steps implemented |
| Create Mode | ✅ Complete | New plan creation |
| Edit Mode | ✅ Complete | Version control |
| Review Mode | ✅ Complete | Read-only approval |
| Auto-Save | ✅ Complete | 30-second intervals |
| Draft Recovery | ✅ Complete | Local + DB |
| Template Integration | ✅ Complete | Apply templates |
| AI Assistance | ✅ Complete | Per-step AI |
| Hub Integration | ✅ Complete | Header button + tabs |
| Validation | ✅ Complete | Required fields |
