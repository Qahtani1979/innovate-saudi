# Solutions Workflows

## Overview

Business workflow documentation for the Solutions system.

## Solution Lifecycle

```mermaid
stateDiagram-v2
    [*] --> draft: Create
    draft --> submitted: Submit for Review
    draft --> cancelled: Cancel
    submitted --> under_review: Begin Review
    submitted --> draft: Return to Draft
    submitted --> cancelled: Cancel
    under_review --> approved: Approve
    under_review --> rejected: Reject
    under_review --> submitted: Request Changes
    approved --> published: Publish
    approved --> under_review: Unpublish
    rejected --> draft: Revise
    rejected --> archived: Archive
    published --> archived: Archive
    published --> approved: Unpublish
    cancelled --> draft: Reopen
    cancelled --> archived: Archive
    archived --> [*]
```

## Submission Workflow

```mermaid
sequenceDiagram
    participant P as Provider
    participant W as Wizard
    participant V as Validator
    participant AI as AI Service
    participant DB as Database
    participant N as Notifications

    P->>W: Start Solution Creation
    W->>W: Step 1: Basic Info
    W->>V: Validate required fields
    V-->>W: Validation result
    W->>W: Step 2: Technical Details
    W->>W: Step 3: Capabilities
    W->>W: Step 4: Documents
    W->>W: Step 5: Review
    P->>W: Submit
    W->>AI: Generate embeddings (with retry)
    AI-->>W: Embedding vector
    W->>DB: Insert solution (draft)
    DB-->>W: Solution created
    W->>DB: Update to 'submitted'
    DB-->>W: Status updated
    W->>N: Trigger submission notification
    N-->>P: Email confirmation
```

## Approval Workflow

```mermaid
sequenceDiagram
    participant S as Submitter
    participant AR as Approval Request
    participant R as Reviewer
    participant SLA as SLA Monitor
    participant N as Notifications

    S->>AR: Create approval request
    AR->>R: Assign reviewer
    AR->>N: Notify reviewer
    
    loop SLA Check (every 24h)
        SLA->>AR: Check due date
        alt 2 days remaining
            SLA->>N: Send warning
        else Overdue
            SLA->>AR: Escalate
            SLA->>N: Notify escalation
        end
    end

    R->>AR: Review solution
    alt Approve
        R->>AR: Approve
        AR->>S: Notify approval
    else Reject
        R->>AR: Reject with reason
        AR->>S: Notify rejection
    else Request Changes
        R->>AR: Request changes
        AR->>S: Notify changes needed
    end
```

## Matching Workflow

```mermaid
sequenceDiagram
    participant Sol as Solution
    participant AI as AI Matcher
    participant Ch as Challenge
    participant MM as Matchmaker
    participant N as Notifications

    Sol->>AI: Request matches
    AI->>AI: Generate embedding
    AI->>Ch: Vector similarity search
    Ch-->>AI: Similar challenges
    AI->>AI: Calculate match scores
    AI-->>Sol: Ranked matches
    
    MM->>MM: Review matches
    alt Accept Match
        MM->>Sol: Link to challenge
        MM->>N: Notify provider
        MM->>N: Notify challenge owner
    else Reject Match
        MM->>Sol: Mark rejected
    end
```

## Version Control

```mermaid
flowchart TD
    A[User edits solution] --> B{Has changes?}
    B -->|Yes| C[Capture old values]
    C --> D[Apply new values]
    D --> E[Increment version]
    E --> F[Store in version_history]
    F --> G[Log to access_logs]
    B -->|No| H[No action]
```

## Data Flow

```mermaid
flowchart LR
    subgraph Frontend
        A[SolutionCreateWizard]
        B[Solutions Page]
        C[SolutionDetail]
    end

    subgraph Hooks
        D[useSolutions]
        E[useSolutionMatching]
    end

    subgraph Backend
        F[(solutions)]
        G[(solution_version_history)]
        H[(challenge_solution_matches)]
    end

    subgraph Services
        I[AI Embeddings]
        J[Email Notifications]
    end

    A --> D
    B --> D
    C --> D
    C --> E
    D --> F
    D --> G
    E --> H
    A --> I
    D --> J
```

## SLA Escalation

| Level | Trigger | Action |
|-------|---------|--------|
| 0 | Request created | Assign reviewer |
| 1 | 2 days before due | Warning notification |
| 2 | Due date passed | Escalate to manager |
| 3 | 3 days overdue | Escalate to admin |
| 4 | 7 days overdue | Auto-approve/reject |

## Audit Trail

All workflow actions are logged:

| Action | Logged Data |
|--------|-------------|
| Create | Full solution data |
| Update | Old/new values, changed fields |
| Stage change | Old/new stage, timestamp |
| Delete | Full solution data, reason |
| Match | Challenge ID, score, type |
| Approve/Reject | Reviewer, reason, timestamp |
