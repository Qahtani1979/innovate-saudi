# Solutions Database Schema

## Overview

Database schema reference for the Solutions system.

## Tables

### solutions

Main table for solution data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| name_en | TEXT | NO | - | English name |
| name_ar | TEXT | YES | - | Arabic name |
| tagline_en | TEXT | YES | - | English tagline |
| tagline_ar | TEXT | YES | - | Arabic tagline |
| description_en | TEXT | YES | - | English description |
| description_ar | TEXT | YES | - | Arabic description |
| provider_id | UUID | YES | - | FK to providers |
| sector_id | UUID | YES | - | FK to sectors |
| subsector_id | UUID | YES | - | FK to subsectors |
| workflow_stage | TEXT | YES | 'draft' | Current stage |
| is_published | BOOLEAN | YES | false | Public visibility |
| is_deleted | BOOLEAN | YES | false | Soft delete flag |
| is_featured | BOOLEAN | YES | false | Featured status |
| image_url | TEXT | YES | - | Main image |
| gallery_urls | TEXT[] | YES | - | Image gallery |
| video_url | TEXT | YES | - | Demo video |
| documentation_url | TEXT | YES | - | Documentation link |
| website_url | TEXT | YES | - | Website link |
| technology_stack | TEXT[] | YES | - | Technologies used |
| capabilities | TEXT[] | YES | - | Solution capabilities |
| deployment_model | TEXT | YES | - | SaaS/On-premise/Hybrid |
| pricing_model | TEXT | YES | - | Pricing structure |
| maturity_level | TEXT | YES | - | TRL level |
| certifications | TEXT[] | YES | - | Certifications held |
| embedding | VECTOR(1536) | YES | - | AI embedding |
| created_by | TEXT | YES | - | Creator email |
| created_at | TIMESTAMPTZ | NO | now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NO | now() | Last update |
| deleted_at | TIMESTAMPTZ | YES | - | Deletion timestamp |
| deleted_by | TEXT | YES | - | Deleter email |

**Indexes:**
- `idx_solutions_provider` on (provider_id)
- `idx_solutions_sector` on (sector_id)
- `idx_solutions_workflow_stage` on (workflow_stage)
- `idx_solutions_published` on (is_published, is_deleted)
- `idx_solutions_embedding` on (embedding) using ivfflat

---

### solution_version_history

Tracks all changes to solutions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| solution_id | UUID | NO | - | FK to solutions |
| version_number | INTEGER | NO | - | Version number |
| changes | JSONB | YES | - | Changed fields |
| old_values | JSONB | YES | - | Previous values |
| new_values | JSONB | YES | - | New values |
| changed_by | TEXT | YES | - | Editor email |
| changed_at | TIMESTAMPTZ | NO | now() | Change timestamp |
| change_reason | TEXT | YES | - | Reason for change |

**Indexes:**
- `idx_solution_version_solution_id` on (solution_id)
- `idx_solution_version_changed_at` on (changed_at)

**RLS Policies:**
- Admins can view all versions
- Providers can view own solution versions

---

### challenge_solution_matches

AI-generated matches between solutions and challenges.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| challenge_id | UUID | YES | - | FK to challenges |
| solution_id | UUID | YES | - | FK to solutions |
| match_score | NUMERIC | YES | - | AI match score (0-100) |
| match_type | TEXT | YES | - | ai/manual |
| status | TEXT | YES | 'pending' | pending/approved/rejected |
| matched_by | TEXT | YES | - | Matcher email |
| matched_at | TIMESTAMPTZ | YES | - | Match timestamp |
| notes | TEXT | YES | - | Match notes |
| created_at | TIMESTAMPTZ | YES | now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | YES | now() | Last update |

---

## Workflow Stages

| Stage | Description | Next Stages |
|-------|-------------|-------------|
| draft | Initial creation | submitted, cancelled |
| submitted | Under review | under_review, draft, cancelled |
| under_review | Being evaluated | approved, rejected, submitted |
| approved | Approved for publish | published, under_review |
| rejected | Rejected | draft, archived |
| published | Publicly visible | archived, approved |
| archived | Archived | - |
| cancelled | Cancelled | draft, archived |

---

## Database Functions

### log_solution_changes()
Trigger function to log all solution changes.

### validate_solution_stage_transition()
Validates workflow stage transitions.

### check_solution_sla_escalation()
Checks for overdue approval requests and escalates.

### cleanup_orphaned_solution_files()
Logs intent for orphaned file cleanup.

### cleanup_old_solution_audit_logs()
Cleans up audit logs older than 365 days (retention policy).

---

## Triggers

| Trigger | Table | Event | Function |
|---------|-------|-------|----------|
| log_solution_changes_trigger | solutions | INSERT/UPDATE/DELETE | log_solution_changes() |
| validate_solution_stage | solutions | UPDATE | validate_solution_stage_transition() |

---

## RLS Policies

| Policy | Command | Description |
|--------|---------|-------------|
| Admins can manage all solutions | ALL | Full access for admins |
| Anyone can view published solutions | SELECT | Public read for published |
| Providers can manage own solutions | ALL | Provider CRUD for own solutions |

---

## Realtime

The `solutions` table is enabled for Supabase Realtime:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.solutions;
```

Subscribe to changes:
```javascript
const channel = supabase
  .channel('solutions-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'solutions'
  }, (payload) => {
    console.log('Solution changed:', payload);
  })
  .subscribe();
```
