# Challenges Database Schema

## Tables

### challenges
Main challenges table with 80+ columns.

#### Required Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| title_en | TEXT | NO | - | English title |
| title_ar | TEXT | NO | - | Arabic title |
| created_at | TIMESTAMPTZ | NO | now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NO | now() | Update timestamp |

#### Nullable Columns (db-6 documentation)
| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| description_en | TEXT | English description | Optional long text |
| description_ar | TEXT | Arabic description | Optional long text |
| tagline_en | TEXT | Short tagline | For cards/previews |
| tagline_ar | TEXT | Arabic tagline | For cards/previews |
| status | TEXT | Workflow status | Defaults to 'draft' |
| priority | TEXT | Priority level | Defaults to 'medium' |
| category | TEXT | Challenge category | Optional classification |
| municipality_id | UUID | FK to municipalities | Required for geographic |
| sector_id | UUID | FK to sectors | Categorization |
| challenge_owner_email | TEXT | Owner email | PII - masked in public views |
| reviewer | TEXT | Assigned reviewer | Internal use |
| image_url | TEXT | Cover image | Optional media |
| budget_estimate | NUMERIC | Budget range | Financial planning |
| timeline_estimate | TEXT | Duration estimate | Planning |
| is_published | BOOLEAN | Public visibility | Default false |
| is_featured | BOOLEAN | Featured status | Homepage display |
| is_deleted | BOOLEAN | Soft delete | Default false |
| is_archived | BOOLEAN | Archive status | Default false |
| is_confidential | BOOLEAN | Sensitive flag | Restricts access |
| citizen_votes_count | INTEGER | Vote tally | Engagement metric |
| view_count | INTEGER | Page views | Analytics |
| sla_due_date | TIMESTAMPTZ | SLA deadline | Workflow tracking |
| submission_date | TIMESTAMPTZ | Submitted when | Audit trail |
| approval_date | TIMESTAMPTZ | Approved when | Audit trail |

### challenge_activities
Activity log for challenges.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| challenge_id | UUID | NO | FK to challenges |
| activity_type | TEXT | NO | Action type |
| description | TEXT | YES | Activity details |
| user_email | TEXT | YES | Actor email |
| created_at | TIMESTAMPTZ | NO | Timestamp |

### challenge_attachments
File attachments for challenges.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| challenge_id | UUID | YES | FK to challenges |
| file_name | TEXT | NO | Original filename |
| file_url | TEXT | NO | Storage URL |
| file_type | TEXT | YES | MIME type |
| file_size | INTEGER | YES | Bytes |
| is_public | BOOLEAN | YES | Visibility |

### challenge_proposals
Solution proposals for challenges.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| challenge_id | UUID | YES | FK to challenges |
| organization_id | UUID | YES | Proposing org |
| title | TEXT | NO | Proposal title |
| status | TEXT | YES | Review status |
| score | INTEGER | YES | Evaluation score |

### challenge_solution_matches
AI-powered solution matching.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| challenge_id | UUID | YES | FK to challenges |
| solution_id | UUID | YES | FK to solutions |
| match_score | NUMERIC | YES | AI confidence |
| match_type | TEXT | YES | ai/manual |

## Indexes
- `idx_challenges_municipality_id` - Geographic queries
- `idx_challenges_sector_id` - Sector filtering
- `idx_challenges_status` - Status filtering
- `idx_challenges_is_published` - Public queries

## Triggers
- `log_challenge_changes_with_diff()` - Audit logging
- `log_challenge_permission_changes()` - Permission audit
