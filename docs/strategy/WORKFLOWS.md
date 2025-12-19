# Strategy Workflows

## Plan Lifecycle

```mermaid
stateDiagram-v2
    [*] --> draft: Create
    draft --> active: Activate
    active --> completed: Complete
    active --> archived: Archive
    completed --> archived: Archive
```

## Objective Cascade

```mermaid
flowchart TD
    A[Strategic Plan] --> B[Objectives]
    B --> C[KPIs]
    B --> D[Action Plans]
    D --> E[Action Items]
    E --> F[Tasks]
```

## Approval Flow

1. Plan created in draft
2. Submit for review
3. Stakeholder approval
4. Plan activation
5. Progress monitoring
6. Annual review
