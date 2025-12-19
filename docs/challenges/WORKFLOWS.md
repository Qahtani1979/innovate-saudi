# Challenges Workflow Documentation

## Lifecycle States

```
draft → submitted → in_review → approved/rejected → archived
                              ↓
                        conditional_approval
```

## State Transitions

### Draft → Submitted
- **Trigger**: User clicks "Submit for Review"
- **Validations**: Required fields filled
- **Actions**: 
  - Creates approval_request record
  - Sets submission_date
  - Triggers email to reviewers

### Submitted → In Review
- **Trigger**: Reviewer claims the challenge
- **Actions**:
  - Sets review_assigned_to
  - Updates status
  - Logs activity

### In Review → Approved
- **Trigger**: Reviewer approves
- **Validations**: All checklist items passed
- **Actions**:
  - Sets approval_date
  - Triggers email to owner
  - Updates approval_request

### In Review → Rejected
- **Trigger**: Reviewer rejects
- **Actions**:
  - Sets rejection_reason
  - Triggers email to owner
  - Logs rejection activity

### In Review → Conditional
- **Trigger**: Reviewer requests changes
- **Actions**:
  - Sets conditions in metadata
  - Returns to owner for updates
  - Triggers notification

## Approval Workflow

### SLA Configuration
```javascript
// Default SLA days by entity type
DEFAULT_SLA_DAYS = {
  challenge: 7,
  pilot: 14,
  solution: 10
}
```

### Escalation Logic
1. **Level 0**: Initial assignment
2. **Level 1**: 50% SLA elapsed - Reminder sent
3. **Level 2**: 75% SLA elapsed - Manager notified
4. **Level 3**: SLA breached - Director escalation

### Approval Gates
| Gate | Criteria | Auto-approve |
|------|----------|--------------|
| Initial Review | Basic validation | Yes (if score > 80) |
| Technical Review | Feasibility check | No |
| Budget Review | Cost validation | Yes (if < threshold) |
| Final Approval | Committee decision | No |

## Components

### ChallengeSubmissionWizard
Multi-step submission form with validation.

### ChallengeReviewWorkflow
Reviewer interface with checklist.

### InlineApprovalWizard
Quick approve/reject from queue.

### SLAMonitor
Dashboard for SLA tracking and escalation.

## Integration Points

### Solutions
- Auto-match solutions to challenges
- Track solution proposals

### Pilots
- Create pilots from approved challenges
- Link pilot outcomes back to challenge

### Programs
- Group related challenges into programs
- Track program-level metrics

### R&D Projects
- Link research to challenge areas
- Evidence-based challenge validation

## Email Notifications

| Event | Recipients | Template |
|-------|------------|----------|
| Submitted | Reviewers | challenge_submitted |
| Approved | Owner | challenge_approved |
| Rejected | Owner | challenge_rejected |
| SLA Warning | Reviewer | sla_warning |
| Escalated | Manager | escalation_notice |

## AI Features

### Workflow Optimization
```javascript
const { optimizeWorkflow } = useWorkflowAI();
optimizeWorkflow.mutate({ workflowData, entityType: 'challenge' });
```

### Bottleneck Prediction
Identifies stages likely to cause delays.

### Duration Estimation
Predicts total workflow completion time.

### Gate Effectiveness Analysis
Evaluates approval gate performance.
