# Challenges Components Documentation

## Component Architecture

```
src/components/challenges/
├── detail/
│   ├── ChallengeHero.jsx          # Hero section
│   ├── ChallengeStatsCards.jsx    # Key metrics
│   ├── ChallengeSidebar.jsx       # Metadata sidebar
│   ├── ChallengeWorkflowModals.jsx # All workflow dialogs
│   ├── ChallengeDetailView.jsx    # Structured layout
│   ├── ChallengeActivityTimeline.jsx # Activity history
│   ├── ChallengeRelatedEntities.jsx # Related items
│   ├── ChallengeActions.jsx       # Role-based actions
│   └── tabs/                      # Tab content
├── list/
│   ├── ChallengeCard.jsx          # Card display
│   ├── ChallengeTable.jsx         # Table display
│   └── ChallengeFilters.jsx       # Filter controls
├── forms/
│   ├── ChallengeForm.jsx          # Create/edit form
│   └── ChallengeWizard.jsx        # Multi-step wizard
└── shared/
    ├── ChallengeStatusBadge.jsx   # Status indicator
    ├── ChallengePriorityBadge.jsx # Priority indicator
    └── ChallengeFollowButton.jsx  # Follow action
```

## Detail Components

### ChallengeDetailView
Main structured layout for challenge details.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| challenge | Object | Yes | Challenge data |
| solutions | Array | No | Related solutions |
| pilots | Array | No | Related pilots |

**Usage:**
```jsx
<ChallengeDetailView
  challenge={challenge}
  solutions={solutions}
  pilots={pilots}
/>
```

### ChallengeActivityTimeline
Displays activity history with icons and timestamps.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| challengeId | String | Yes | Challenge UUID |
| limit | Number | No | Max items (default: 10) |

### ChallengeRelatedEntities
Shows related solutions, pilots, and programs.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| challengeId | String | Yes | Challenge UUID |
| entityTypes | Array | No | Filter entity types |

### ChallengeActions
Role-based action buttons.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| challenge | Object | Yes | Challenge data |
| userRole | String | No | Override role |
| onAction | Function | Yes | Action handler |

**Actions by Role:**
| Role | Available Actions |
|------|-------------------|
| owner | edit, submit, archive |
| reviewer | approve, reject, request_changes |
| admin | all actions + delete |
| viewer | follow, share |

## Workflow Components

### ChallengeWorkflowModals
Container for all workflow dialogs.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| challenge | Object | Current challenge |
| showSubmission | Boolean | Show submit dialog |
| showReview | Boolean | Show review dialog |
| showResolve | Boolean | Show resolve dialog |
| showArchive | Boolean | Show archive dialog |
| onClose* | Function | Close handlers |

### InlineApprovalWizard
Quick approval from queue without navigation.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| approvalRequest | Object | Request data |
| entityData | Object | Challenge data |
| gateConfig | Object | Gate configuration |
| onComplete | Function | Completion handler |

## List Components

### BulkActions
Bulk operations on selected challenges.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| selected | Array | Selected IDs |
| onAction | Function | Action handler |
| entityType | String | 'Challenge' |

**Available Actions:**
- approve - Bulk approve
- reject - Bulk reject
- archive - Bulk archive
- delete - Bulk delete (admin only)

## Shared Components

### ChallengeStatusBadge
Visual status indicator.

```jsx
<ChallengeStatusBadge status="approved" />
```

### ChallengePriorityBadge
Priority level indicator.

```jsx
<ChallengePriorityBadge priority="critical" />
```

## Permission Integration

Components use `BackendPermissionValidator` for access control:

```jsx
import { ProtectedBackendAction } from '@/components/access/BackendPermissionValidator';

<ProtectedBackendAction
  permission="challenge:edit"
  entity_type="challenge"
  entity_id={challenge.id}
  fallback={<ViewOnlyMessage />}
>
  <EditButton />
</ProtectedBackendAction>
```

## Styling Guidelines

- Use Tailwind semantic tokens from design system
- Support RTL with `dir` attribute
- Mobile-first responsive design
- Dark mode compatible
