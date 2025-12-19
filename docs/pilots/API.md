# Pilots API Documentation

## Overview

The Pilots API provides endpoints for managing the complete lifecycle of innovation pilots, from ideation through scaling.

## Data Model

### Pilot Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `code` | TEXT | Unique pilot code |
| `title_en` | TEXT | English title (required) |
| `title_ar` | TEXT | Arabic title |
| `stage` | TEXT | Current lifecycle stage |
| `challenge_id` | UUID | Linked challenge (required) |
| `solution_id` | UUID | Linked solution |
| `municipality_id` | UUID | Municipality (required) |
| `sector` | TEXT | Sector (required) |
| `budget` | NUMERIC | Allocated budget |
| `kpis` | JSONB | Key performance indicators |
| `milestones` | JSONB | Project milestones |

### Valid Stages

```
ideation → design → planning → implementation → monitoring → evaluation → scaling → completed
                                     ↓                          ↓
                                   paused                    cancelled
```

## Queries

### List Pilots

```javascript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('pilots')
  .select('*')
  .eq('is_deleted', false)
  .order('created_at', { ascending: false });
```

### Get Pilot with Relations

```javascript
const { data, error } = await supabase
  .from('pilots')
  .select(`
    *,
    municipalities(name_en, name_ar),
    challenges(title_en, title_ar),
    solutions(name_en, name_ar)
  `)
  .eq('id', pilotId)
  .single();
```

### Public View (PII Masked)

```javascript
const { data, error } = await supabase
  .from('pilots_public_view')
  .select('*');
// Returns created_by_masked instead of actual email
```

## Mutations

### Create Pilot

```javascript
const { data, error } = await supabase
  .from('pilots')
  .insert({
    title_en: 'New Pilot',
    challenge_id: challengeId,
    municipality_id: municipalityId,
    sector: 'infrastructure',
    stage: 'ideation',
    created_by: userEmail
  })
  .select()
  .single();
```

### Update Pilot Stage

```javascript
const { data, error } = await supabase
  .from('pilots')
  .update({ stage: 'planning' })
  .eq('id', pilotId)
  .select()
  .single();
// Note: Invalid transitions will raise an error
```

### Soft Delete

```javascript
const { error } = await supabase
  .from('pilots')
  .update({ 
    is_deleted: true, 
    deleted_date: new Date().toISOString(),
    deleted_by: userId 
  })
  .eq('id', pilotId);
```

## Audit Functions

### Log Bulk Operation

```javascript
await supabase.rpc('log_pilot_bulk_operation', {
  p_operation: 'archive',
  p_entity_ids: pilotIds,
  p_user_email: userEmail
});
```

### Log Export

```javascript
await supabase.rpc('log_pilot_export', {
  p_export_type: 'csv',
  p_filters: { stage: 'active' },
  p_user_email: userEmail,
  p_record_count: 50
});
```

## Error Handling

### Stage Transition Error

```javascript
// ERROR: Invalid pilot stage transition from "ideation" to "implementation"
// Solution: Follow valid stage sequence
```

### RLS Policy Error

```javascript
// ERROR: new row violates row-level security policy
// Solution: Ensure user has proper permissions and user_id is set
```

## Rate Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Create | 10 | 1 minute |
| Update | 30 | 1 minute |
| Delete | 5 | 1 minute |
| Export | 5 | 5 minutes |

## Realtime Subscriptions

```javascript
const channel = supabase
  .channel('pilots-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'pilots'
  }, (payload) => {
    console.log('Pilot changed:', payload);
  })
  .subscribe();
```
