# Challenge R&D Backlink Function

## Purpose
Automatically links R&D projects back to their originating challenges. This ensures bidirectional relationships are maintained in the system.

## Trigger
- Called on R&D project creation
- Can be triggered manually for batch synchronization

## Endpoint
```
POST /functions/v1/challenge-rd-backlink
```

## Authentication
Requires valid Supabase auth token or service role key.

## Input
```json
{
  "challenge_id": "uuid",
  "rd_project_id": "uuid"
}
```

## Output
```json
{
  "success": true,
  "linked_count": 1,
  "challenge_id": "uuid",
  "rd_project_id": "uuid"
}
```

## Error Responses
```json
{
  "success": false,
  "error": "Challenge not found"
}
```

## Related Tables
- `challenges.linked_rd_ids` - Array of linked R&D project IDs
- `rd_projects.challenge_ids` - Array of source challenge IDs

## Usage Example
```typescript
const { data, error } = await supabase.functions.invoke('challenge-rd-backlink', {
  body: { 
    challenge_id: '123e4567-e89b-12d3-a456-426614174000',
    rd_project_id: '987fcdeb-51a2-3b4c-5d6e-7f8g9h0i1j2k'
  }
});
```

## Related Functions
- `strategy-rd-call-generator` - Generates R&D calls from challenges
- `generate-embeddings` - Generates embeddings for semantic search
