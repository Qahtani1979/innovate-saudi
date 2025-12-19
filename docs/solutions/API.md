# Solutions API Documentation

## Overview

Complete API reference for the Solutions system.

## Hooks

### useSolutions

Main hook for solution data operations.

```javascript
import { useSolutions } from '@/hooks/useSolutions';

const { 
  solutions, 
  isLoading, 
  error,
  createSolution, 
  updateSolution,
  deleteSolution,
  refetch 
} = useSolutions(filters);
```

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| filters.status | string | Filter by workflow status |
| filters.sector_id | string | Filter by sector |
| filters.provider_id | string | Filter by provider |
| filters.search | string | Full-text search |

### useSolutionMatching

AI-powered solution matching.

```javascript
import { useSolutionMatching } from '@/hooks/useSolutionMatching';

const { 
  matches, 
  findMatches, 
  updateMatchStatus,
  isMatching 
} = useSolutionMatching(solutionId);
```

### useProviderProfile

Provider profile management.

```javascript
import { useProviderProfile } from '@/hooks/useProviderProfile';

const { profile, updateProfile, isLoading } = useProviderProfile();
```

## API Utilities

### Error Handling
```javascript
import { formatApiError, API_ERROR_CODES } from '@/lib/api/errorHandler';

try {
  await createSolution(data);
} catch (error) {
  const formatted = formatApiError(error);
  toast.error(formatted.message);
}
```

### Input Sanitization
```javascript
import { sanitizeInput, sanitizeHTML } from '@/lib/api/sanitizer';

const cleanTitle = sanitizeInput(userInput);
const cleanDescription = sanitizeHTML(richTextInput);
```

### Embedding Generation
```javascript
// With retry logic (exponential backoff)
const generateWithRetry = async (text, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateEmbeddings(text);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
};
```

## Database Operations

### Create Solution
```javascript
const { data, error } = await supabase
  .from('solutions')
  .insert({
    name_en: 'Solution Name',
    name_ar: 'اسم الحل',
    description_en: 'Description',
    provider_id: providerId,
    workflow_stage: 'draft',
    created_by: userEmail
  })
  .select()
  .single();
```

### Update Solution
```javascript
const { data, error } = await supabase
  .from('solutions')
  .update({ 
    workflow_stage: 'submitted',
    updated_at: new Date().toISOString()
  })
  .eq('id', solutionId)
  .select()
  .single();
```

### Delete Solution (Soft)
```javascript
const { error } = await supabase
  .from('solutions')
  .update({ 
    is_deleted: true,
    deleted_at: new Date().toISOString(),
    deleted_by: userEmail
  })
  .eq('id', solutionId);
```

## Edge Functions

### email-trigger-hub
Sends notifications for solution events.

**Events:**
- `solution_submitted` - New solution submitted
- `solution_approved` - Solution approved
- `solution_rejected` - Solution rejected
- `solution_matched` - New match found

### strategy-workflow-ai
AI analysis for solution optimization.

## Performance

### Select Clauses
```javascript
// Minimal for lists
const SOLUTION_MINIMAL = 'id, name_en, name_ar, workflow_stage, created_at';

// Summary for cards
const SOLUTION_SUMMARY = `
  id, name_en, name_ar, description_en, workflow_stage, 
  sector_id, provider_id, created_at, image_url
`;

// Full for detail views
const SOLUTION_FULL = '*';
```

### Optimistic Updates
```javascript
// Delete with optimistic update
const deleteMutation = useMutation({
  mutationFn: (id) => deleteSolution(id),
  onMutate: async (id) => {
    await queryClient.cancelQueries(['solutions']);
    const previous = queryClient.getQueryData(['solutions']);
    queryClient.setQueryData(['solutions'], (old) => 
      old.filter(s => s.id !== id)
    );
    return { previous };
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['solutions'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['solutions']);
  }
});
```

## Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| NOT_FOUND | Solution not found |
| PERMISSION_DENIED | User lacks permission |
| RATE_LIMITED | Too many requests |
| DUPLICATE_ENTRY | Solution already exists |
| INVALID_TRANSITION | Invalid workflow stage transition |
