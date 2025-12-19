# Pilots Components Documentation

## Overview

This document describes all React components used in the Pilots system.

## Page Components

### PilotsManagement (`src/pages/PilotsManagement.jsx`)

Main listing page for all pilots with filtering and search.

**Props:** None (uses route params)

**Permissions:** `pilots.view`

**Features:**
- Grid/list view toggle
- Stage filtering
- Municipality filtering
- Search functionality
- Bulk actions

### PilotDetail (`src/pages/PilotDetail.jsx`)

Detailed view of a single pilot with all related information.

**Props:** None (uses `useParams`)

**Permissions:** `pilots.view`

**Features:**
- Pilot overview
- KPI dashboard
- Milestone timeline
- Team information
- Risk assessment

### CreatePilot (`src/pages/CreatePilot.jsx`)

Multi-step form for creating new pilots.

**Permissions:** `pilots.create`

**Steps:**
1. Basic Information
2. Challenge & Solution Linking
3. Budget & Resources
4. KPIs & Milestones
5. Review & Submit

### EditPilot (`src/pages/EditPilot.jsx`)

Edit form for existing pilots.

**Permissions:** `pilots.update`

## Shared Components

### PilotCard (`src/components/pilots/PilotCard.jsx`)

Card component for displaying pilot summary.

```jsx
<PilotCard
  pilot={pilotData}
  onClick={() => navigate(`/pilots/${id}`)}
  showActions={true}
/>
```

### PilotErrorBoundary (`src/components/pilots/PilotErrorBoundary.jsx`)

Error boundary for catching and handling pilot-related errors.

```jsx
<PilotErrorBoundary
  title="Error Loading Pilot"
  message="Unable to load pilot data"
  onReset={() => refetch()}
>
  <PilotDetail />
</PilotErrorBoundary>
```

### PilotDeleteDialog (`src/components/pilots/PilotDeleteDialog.jsx`)

Confirmation dialog for delete operations.

```jsx
<PilotDeleteDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onConfirm={handleDelete}
  pilotTitle="Smart Traffic Pilot"
  isBulk={false}
/>
```

### PilotAccessDenied (`src/components/pilots/PilotAccessDenied.jsx`)

Access denied message component.

```jsx
<PilotAccessDenied
  message="You don't have permission to view this pilot"
  showBackButton={true}
/>
```

### PilotTimeline (`src/components/pilots/PilotTimeline.jsx`)

Visual timeline of pilot stages.

```jsx
<PilotTimeline
  currentStage="implementation"
  milestones={pilotMilestones}
/>
```

### PilotMetrics (`src/components/pilots/PilotMetrics.jsx`)

KPI dashboard for pilot metrics.

```jsx
<PilotMetrics
  kpis={pilot.kpis}
  budget={pilot.budget}
  budgetSpent={pilot.budget_spent}
/>
```

## Form Components

### PilotForm (`src/components/pilots/PilotForm.jsx`)

Main form component with Zod validation.

**Validation Rules:**
- `title_en`: Required, max 200 characters
- `description_en`: Max 2000 characters
- `budget`: Positive number
- `sector`: Required selection

### PilotStageSelector (`src/components/pilots/PilotStageSelector.jsx`)

Stage selection with transition validation.

```jsx
<PilotStageSelector
  currentStage="design"
  onStageChange={handleStageChange}
  disabled={!canChangeStage}
/>
```

## Workflow Components

### PilotApprovalWorkflow (`src/components/pilots/PilotApprovalWorkflow.jsx`)

Approval workflow interface for reviewers.

### PilotEscalationPanel (`src/components/pilots/PilotEscalationPanel.jsx`)

SLA monitoring and escalation management.

## Integration Components

### PilotChallengeLink (`src/components/pilots/PilotChallengeLink.jsx`)

Links pilot to source challenge.

### PilotSolutionLink (`src/components/pilots/PilotSolutionLink.jsx`)

Links pilot to implementing solution.

## Component Tree

```
PilotsManagement
├── PilotFilters
├── PilotGrid
│   └── PilotCard
│       ├── PilotStageBadge
│       └── PilotActions
└── PilotDeleteDialog

PilotDetail
├── PilotErrorBoundary
├── PilotHeader
├── PilotTimeline
├── PilotMetrics
├── PilotTeam
├── PilotRisks
└── PilotApprovalWorkflow
```
