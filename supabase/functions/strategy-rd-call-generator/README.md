# Strategy R&D Call Generator

## Purpose
Generates R&D call documents based on selected challenges using AI. Creates structured call documents with objectives, eligibility criteria, evaluation criteria, and submission requirements.

## Endpoint
```
POST /functions/v1/strategy-rd-call-generator
```

## Authentication
Requires valid Supabase auth token.

## Input
```json
{
  "challenge_ids": ["uuid1", "uuid2"],
  "sector_id": "uuid",
  "budget_range": "500000-1000000 SAR",
  "timeline": "6-12 months"
}
```

## Output
```json
{
  "success": true,
  "rd_call_id": "uuid",
  "title": "Innovation R&D Call",
  "description": "Detailed description...",
  "objectives": ["Objective 1", "Objective 2"],
  "eligibility_criteria": ["Criteria 1", "Criteria 2"],
  "evaluation_criteria": ["Criteria 1", "Criteria 2"],
  "submission_requirements": ["Requirement 1", "Requirement 2"]
}
```

## AI Model
Uses Lovable AI Gateway with `google/gemini-2.5-flash` model for generating call content.

## Database Tables
- `challenges` - Source challenges for the R&D call
- `rd_calls` - Stored generated R&D call documents

## Environment Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access
- `LOVABLE_API_KEY` - API key for Lovable AI Gateway

## Usage Example
```typescript
const { data, error } = await supabase.functions.invoke('strategy-rd-call-generator', {
  body: { 
    challenge_ids: ['challenge-uuid-1', 'challenge-uuid-2'],
    sector_id: 'sector-uuid',
    budget_range: '500000-1000000 SAR',
    timeline: '12 months'
  }
});
```

## Related Functions
- `challenge-rd-backlink` - Links R&D projects back to challenges
- `generate-embeddings` - Generates embeddings for semantic matching
