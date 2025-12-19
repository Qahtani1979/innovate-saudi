# Pilots Workflow Documentation

## Lifecycle Stages

```
ideation → design → planning → implementation → monitoring → evaluation → scaling → completed
    ↓         ↓         ↓            ↓              ↓            ↓           ↓
cancelled cancelled cancelled     paused        paused     cancelled   archived
```

## Stage Definitions

### 1. Ideation
- **Description**: Initial concept development
- **Activities**: Problem definition, stakeholder identification, feasibility assessment
- **Exit Criteria**: Approved concept document, identified challenge linkage

### 2. Design
- **Description**: Detailed pilot design
- **Activities**: Solution design, KPI definition, resource planning
- **Exit Criteria**: Approved design document, defined success criteria

### 3. Planning
- **Description**: Implementation preparation
- **Activities**: Team assembly, budget allocation, timeline finalization
- **Exit Criteria**: Approved budget, assembled team, signed agreements

### 4. Implementation
- **Description**: Active pilot execution
- **Activities**: Solution deployment, data collection, stakeholder engagement
- **Exit Criteria**: Pilot deployed, monitoring systems active

### 5. Monitoring
- **Description**: Performance tracking
- **Activities**: KPI tracking, issue resolution, progress reporting
- **Exit Criteria**: Sufficient data collected, interim review completed

### 6. Evaluation
- **Description**: Results assessment
- **Activities**: Impact analysis, lessons learned, scaling assessment
- **Exit Criteria**: Evaluation report, scaling recommendation

### 7. Scaling
- **Description**: Expansion preparation
- **Activities**: Scale-up planning, resource securing, policy recommendations
- **Exit Criteria**: Approved scaling plan, secured resources

### 8. Completed
- **Description**: Pilot concluded
- **Activities**: Final reporting, knowledge transfer, archival
- **End State**: All deliverables submitted

## Approval Workflow

### SLA Configuration

```javascript
PILOT_SLA_DAYS = {
  ideation_review: 7,
  design_approval: 10,
  budget_approval: 14,
  scaling_decision: 21
}
```

### Escalation Levels

| Level | Trigger | Action |
|-------|---------|--------|
| 0 | Initial assignment | Reviewer notified |
| 1 | 50% SLA elapsed | Reminder sent |
| 2 | 75% SLA elapsed | Manager notified |
| 3 | SLA breached | Director escalation |

### Approval Gates

| Gate | Stage Transition | Approvers | Auto-approve |
|------|------------------|-----------|--------------|
| Concept | ideation → design | Innovation Lead | No |
| Design | design → planning | Technical Committee | No |
| Budget | planning → implementation | Finance | Yes (< 50K SAR) |
| Go-Live | planning → implementation | Pilot Owner | No |
| Scaling | evaluation → scaling | Steering Committee | No |

## Email Notifications

| Event | Recipients | Template Key |
|-------|------------|--------------|
| Pilot Submitted | Reviewers | pilot_submitted |
| Pilot Approved | Owner | pilot_approved |
| Pilot Rejected | Owner | pilot_rejected |
| SLA Warning | Reviewer | pilot_sla_warning |
| Approval Needed | Approver | pilot_approval_needed |

## State Transition Rules

### Valid Transitions

```javascript
const validTransitions = {
  ideation: ['design', 'cancelled'],
  design: ['planning', 'ideation', 'cancelled'],
  planning: ['implementation', 'design', 'cancelled'],
  implementation: ['monitoring', 'paused', 'cancelled'],
  monitoring: ['evaluation', 'implementation', 'paused'],
  evaluation: ['scaling', 'completed', 'cancelled'],
  scaling: ['completed', 'evaluation'],
  completed: ['archived'],
  paused: ['implementation', 'monitoring', 'cancelled'],
  cancelled: ['ideation', 'archived'],
  archived: []
};
```

### Transition Actions

```javascript
// On stage change
1. Validate transition is allowed
2. Log stage change to audit trail
3. Send notifications to relevant parties
4. Update SLA timers if applicable
5. Create approval request if gate approval needed
```

## Components

### PilotSubmissionWizard
Multi-step form for pilot submission.

### PilotApprovalWorkflow
Reviewer interface with evaluation checklist.

### PilotStageSelector
Stage transition interface with validation.

### SLAMonitor
Dashboard for SLA tracking and escalation status.

## Integration Points

### Challenges
- Pilots are created from approved challenges
- Challenge status updated when pilot completes

### Solutions
- Solutions can be tested through pilots
- Pilot results feed back to solution metrics

### Programs
- Pilots can be grouped into programs
- Program-level reporting aggregates pilot data

### Strategic Plans
- Pilots can be linked to strategic objectives
- Progress contributes to strategy KPIs
