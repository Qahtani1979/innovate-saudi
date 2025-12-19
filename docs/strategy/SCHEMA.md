# Strategy Database Schema

## Tables

### strategic_plans
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title_en | TEXT | English title |
| title_ar | TEXT | Arabic title |
| vision_en | TEXT | Vision statement |
| mission_en | TEXT | Mission statement |
| start_date | DATE | Plan start |
| end_date | DATE | Plan end |
| status | TEXT | draft/active/completed |
| is_template | BOOLEAN | Template flag |
| municipality_id | UUID | FK to municipalities |

### strategic_objectives
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| plan_id | UUID | FK to strategic_plans |
| title_en | TEXT | Objective title |
| weight | NUMERIC | Objective weight |
| status | TEXT | Status |

### kpis
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| objective_id | UUID | FK to objectives |
| name_en | TEXT | KPI name |
| target_value | NUMERIC | Target |
| current_value | NUMERIC | Current |
| unit | TEXT | Measurement unit |

### action_plans
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| objective_id | UUID | FK to objectives |
| title_en | TEXT | Action title |
| total_budget | NUMERIC | Budget allocation |

### action_items
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| action_plan_id | UUID | FK to action_plans |
| title_en | TEXT | Item title |
| status | TEXT | Status |
| progress_percentage | INTEGER | Progress |
