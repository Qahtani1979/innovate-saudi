# Challenges API Documentation

## Overview
Complete API reference for the Challenges system.

## Hooks

### useChallenges
Main hook for challenge data operations.

```javascript
import { useChallenges } from '@/hooks/useChallenges';

const { challenges, isLoading, createChallenge, updateChallenge } = useChallenges(filters);
```

### useApprovalRequest
Manages approval workflows for challenges.

```javascript
import { useApprovalRequest } from '@/hooks/useApprovalRequest';

const { createApprovalRequest, hasExistingApprovalRequest } = useApprovalRequest();
```

### useWorkflowAI
AI-powered workflow optimization.

```javascript
import { useWorkflowAI } from '@/hooks/strategy/useWorkflowAI';

const { optimizeWorkflow, predictBottlenecks, estimateDuration } = useWorkflowAI();
```

## API Utilities

### Error Handling
```javascript
import { formatApiError, API_ERROR_CODES } from '@/lib/api/errorHandler';
```

### Input Sanitization
```javascript
import { sanitizeInput, sanitizeHTML } from '@/lib/api/sanitizer';
```

### Response Formatting
```javascript
import { formatPaginatedResponse, calculatePagination } from '@/lib/api/responseFormatter';
```

## Database Schema

### challenges table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title_en | TEXT | English title |
| title_ar | TEXT | Arabic title |
| status | TEXT | draft/submitted/in_review/approved/rejected/archived |
| priority | TEXT | low/medium/high/critical |
| municipality_id | UUID | FK to municipalities |
| sector_id | UUID | FK to sectors |
| challenge_owner_email | TEXT | Owner's email |
| is_published | BOOLEAN | Public visibility |
| is_deleted | BOOLEAN | Soft delete flag |

## RLS Policies

1. **Admins can manage all challenges** - Full access for admin role
2. **Anyone can view published challenges** - Public read for published
3. **Deputyship staff can view all challenges** - Cross-municipality read
4. **Municipality staff can manage own challenges** - CRUD for own municipality

## Edge Functions

### email-trigger-hub
Sends notifications for challenge events.

### strategy-workflow-ai
AI analysis for workflow optimization.

## Performance

### Select Clauses
```javascript
import { CHALLENGE_SELECT_CLAUSES } from '@/lib/api/responseFormatter';

// Use minimal for lists
CHALLENGE_SELECT_CLAUSES.minimal

// Use summary for cards
CHALLENGE_SELECT_CLAUSES.summary

// Use full for detail views
CHALLENGE_SELECT_CLAUSES.full
```

## Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| NOT_FOUND | Challenge not found |
| PERMISSION_DENIED | User lacks permission |
| RATE_LIMITED | Too many requests |
