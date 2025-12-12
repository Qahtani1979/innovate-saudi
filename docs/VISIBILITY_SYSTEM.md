# Comprehensive Visibility System

## Overview

The visibility system provides consistent access control across all entity types in the platform, designed specifically for the Municipality/Deputyship organizational structure.

## Table of Contents
1. [Visibility Levels](#visibility-levels)
2. [User Personas](#user-personas)
3. [Entity Types](#entity-types)
4. [Pages Coverage](#pages-coverage)
5. [Sidebar Navigation](#sidebar-navigation)
6. [Components](#components)
7. [Database Functions](#database-functions)
8. [Implementation Guide](#implementation-guide)
9. [Security](#security)
10. [Migration Status](#migration-status)

---

## Visibility Levels

### 1. GLOBAL (Platform Admin)
- **Who**: Platform administrators, users with `visibility_all_municipalities` or `visibility_all_sectors` permissions
- **Access**: All records across all municipalities and sectors
- **Use Case**: System administrators, national oversight

### 2. SECTORAL (National Deputyship)
- **Who**: Deputyship staff assigned to national-level entities
- **Access**: 
  - All entities within their assigned sector(s) across ALL municipalities
  - All national-level entities
- **Use Case**: Sector-specific oversight (e.g., Health sector deputyship sees all health-related challenges nationwide)
- **Database**: Identified by `region.code = 'NATIONAL'`

### 3. GEOGRAPHIC (Municipality Staff)
- **Who**: Municipality admins, staff, coordinators
- **Access**:
  - Own municipality's entities
  - National-level entities (shared resources, national programs)
- **Use Case**: Local municipality innovation teams
- **Cannot See**: Other municipalities' entities

### 4. ORGANIZATIONAL (Providers/Partners)
- **Who**: Technology providers, startups, academia, research institutions
- **Access**:
  - Entities they own/created
  - Entities linked to their organization
  - Public/published entities
- **Use Case**: External partners participating in pilots/programs

### 5. PUBLIC (Unauthenticated/Citizens)
- **Who**: General public, unauthenticated users
- **Access**: Only published/public entities
- **Use Case**: Transparency, public engagement

---

## User Personas

### Staff Personas

| Persona | Role Keys | Visibility Level | Description |
|---------|-----------|------------------|-------------|
| Platform Admin | `admin` | GLOBAL | Full system access |
| Deputyship Admin | `deputyship_admin` | SECTORAL | National-level sector oversight |
| Deputyship Staff | `deputyship_staff` | SECTORAL | National-level sector operations |
| Municipality Admin | `municipality_admin` | GEOGRAPHIC | Local municipality management |
| Municipality Staff | `municipality_staff` | GEOGRAPHIC | Local municipality operations |
| Municipality Coordinator | `municipality_coordinator` | GEOGRAPHIC | Local coordination |

### External Personas

| Persona | Role Keys | Visibility Level | Description |
|---------|-----------|------------------|-------------|
| Provider | `provider` | ORGANIZATIONAL | Technology/solution providers |
| Startup | `startup` | ORGANIZATIONAL | Startup companies |
| Academia | `academia` | ORGANIZATIONAL | Academic institutions |
| Researcher | `researcher` | ORGANIZATIONAL | Individual researchers |
| Expert | `expert` | ORGANIZATIONAL | Domain experts/evaluators |
| Citizen | `citizen` | PUBLIC | General public |

---

## Entity Types

| Entity | Table | Hook | Municipality Column | Sector Column | Published Column |
|--------|-------|------|---------------------|---------------|------------------|
| Challenges | `challenges` | `useChallengesWithVisibility` | `municipality_id` | `sector_id` | `is_published` |
| Pilots | `pilots` | `usePilotsWithVisibility` | `municipality_id` | `sector_id` | - |
| Programs | `programs` | `useProgramsWithVisibility` | `municipality_id` | `sector_id` | - |
| Solutions | `solutions` | `useSolutionsWithVisibility` | - | `sector_id` | `is_published` |
| Living Labs | `living_labs` | `useLivingLabsWithVisibility` | `municipality_id` | `sector_id` | - |
| R&D Projects | `rd_projects` | `useRDProjectsWithVisibility` | `municipality_id` | `sector_id` | `is_published` |
| Contracts | `contracts` | `useContractsWithVisibility` | `municipality_id` | - | - |
| Knowledge Docs | `knowledge_documents` | `useKnowledgeWithVisibility` | `municipality_id` | `sector_id` | `is_published` |
| Case Studies | `case_studies` | TBD | `municipality_id` | `sector_id` | `is_published` |
| Budgets | `budgets` | TBD | (via entity) | - | - |
| Proposals | `challenge_proposals` | TBD | (via challenge) | - | - |

---

## Pages Coverage

### Primary Entity Pages (Implemented ✅)

| Page | Route | Hook Used | Protection |
|------|-------|-----------|------------|
| Challenges | `/challenges` | `useChallengesWithVisibility` | `challenge_view_all`, `challenge_view_own`, `dashboard_view` |
| Pilots | `/pilots` | `usePilotsWithVisibility` | `pilot_view_all`, `pilot_view_own`, `dashboard_view` |
| Programs | `/programs` | `useProgramsWithVisibility` | `program_view_all`, `program_view_own`, `dashboard_view` |
| Solutions | `/solutions` | `useSolutionsWithVisibility` | `solution_view_all`, `solution_view`, `dashboard_view` |

### Secondary Entity Pages (To Implement)

| Page | Route | Hook | Status |
|------|-------|------|--------|
| Living Labs | `/living-labs` | `useLivingLabsWithVisibility` | Hook Ready |
| R&D Projects | `/rd-projects` | `useRDProjectsWithVisibility` | Hook Ready |
| Contracts | `/contract-management` | `useContractsWithVisibility` | Hook Ready |
| Knowledge | `/knowledge` | `useKnowledgeWithVisibility` | Hook Ready |

### Dashboard Pages

| Page | Route | Persona | Visibility Notes |
|------|-------|---------|-----------------|
| Executive Dashboard | `/executive-dashboard` | Admin/Deputyship | GLOBAL/SECTORAL data |
| Municipality Dashboard | `/municipality-dashboard` | Municipality Staff | GEOGRAPHIC data |
| Citizen Dashboard | `/citizen-dashboard` | Citizens | PUBLIC data only |
| Provider Dashboard | `/provider-dashboard` | Providers | ORGANIZATIONAL data |
| Expert Dashboard | `/expert-dashboard` | Experts | ORGANIZATIONAL data |
| Startup Dashboard | `/startup-dashboard` | Startups | ORGANIZATIONAL data |

### My* Personal Pages

| Page | Route | Description |
|------|-------|-------------|
| My Challenges | `/my-challenges` | User's own challenges |
| My Pilots | `/my-pilots` | User's own pilots |
| My Programs | `/my-programs` | User's enrolled programs |
| My Applications | `/my-applications` | User's applications |
| My Approvals | `/my-approvals` | Pending approvals for user |

### Public/Citizen Pages

| Page | Route | Description |
|------|-------|-------------|
| Citizen Challenges Browser | `/citizen/challenges` | Published challenges |
| Citizen Solutions Browser | `/citizen/solutions` | Published solutions |
| Citizen Living Labs | `/citizen/living-labs` | Active living labs |
| Public Portal | `/public` | General public access |

---

## Sidebar Navigation

### Navigation Groups by Persona

#### Admin Sidebar
```
├── Dashboard (Executive Dashboard)
├── Manage
│   ├── Challenges (all)
│   ├── Pilots (all)
│   ├── Programs (all)
│   ├── Solutions (all)
│   ├── Living Labs (all)
│   └── R&D Projects (all)
├── Operations
│   ├── Contracts (all)
│   ├── Budgets (all)
│   └── Approvals
├── Analytics
│   └── All analytics dashboards
└── Settings
    └── All admin settings
```

#### Deputyship Sidebar
```
├── Dashboard (Deputyship Dashboard)
├── Sector Oversight
│   ├── Challenges (sector-filtered)
│   ├── Pilots (sector-filtered)
│   ├── Programs (sector-filtered)
│   └── Solutions (sector-filtered)
├── National Programs
│   ├── Living Labs
│   └── R&D Projects
├── Collaboration
│   ├── Cross-City Learning Hub
│   └── Multi-City Coordination
└── Reports
    └── Sector analytics
```

#### Municipality Sidebar
```
├── Dashboard (Municipality Dashboard)
├── My Municipality
│   ├── Challenges (own + national)
│   ├── Pilots (own + national)
│   ├── Programs (own + national)
│   └── Solutions
├── Collaboration
│   ├── National Programs
│   └── Cross-City Learning
├── Operations
│   ├── Contracts (own)
│   ├── Budgets (own)
│   └── Approvals
└── My Work
    ├── My Challenges
    ├── My Pilots
    └── My Approvals
```

#### Provider Sidebar
```
├── Dashboard (Provider Dashboard)
├── My Solutions
├── Opportunities
│   ├── Browse Challenges
│   ├── Browse Programs
│   └── Browse Pilots
├── My Proposals
├── My Contracts
└── My Pilots
```

#### Citizen Sidebar
```
├── Home
├── Browse
│   ├── Challenges
│   ├── Solutions
│   └── Living Labs
├── Participate
│   ├── Submit Ideas
│   └── Join Pilots
└── My Activity
    ├── My Ideas
    ├── My Enrollments
    └── My Feedback
```

---

## Components

### Visibility-Aware Components

| Component | Location | Description |
|-----------|----------|-------------|
| ProtectedPage | `src/components/permissions/ProtectedPage` | HOC for page-level protection |
| PermissionGate | `src/components/permissions/PermissionGate` | Conditional rendering by permission |
| RoleGate | `src/components/permissions/RoleGate` | Conditional rendering by role |
| VisibilityFilter | `src/components/filters/VisibilityFilter` | Filter UI based on visibility |

### Dashboard Widgets

| Widget | Visibility Implementation |
|--------|--------------------------|
| ChallengesWidget | Uses `useChallengesWithVisibility` |
| PilotsWidget | Uses `usePilotsWithVisibility` |
| ProgramsWidget | Uses `useProgramsWithVisibility` |
| StatsCards | Aggregates based on user visibility |
| RecentActivity | Filters by user scope |

### List/Table Components

| Component | Notes |
|-----------|-------|
| ChallengesList | Should use visibility hook |
| PilotsList | Should use visibility hook |
| ProgramsList | Should use visibility hook |
| SolutionsList | Should use visibility hook |

---

## Database Functions

### `get_user_visibility_scope(p_user_id)`
Returns the user's visibility scope:
```sql
RETURNS TABLE(
  scope_type text,      -- 'sectoral' or 'geographic'
  municipality_id uuid, -- User's municipality
  sector_ids uuid[],    -- Array of sector IDs for deputyship
  is_national boolean   -- True if national deputyship
)
```

### `can_view_entity(p_user_id, p_entity_municipality_id, p_entity_sector_id)`
Checks if a user can view a specific entity:
```sql
RETURNS boolean
```

### `is_national_entity(p_municipality_id)`
Checks if a municipality belongs to the NATIONAL region:
```sql
RETURNS boolean
```

---

## Implementation Guide

### Using Visibility Hooks

```javascript
// For Challenges
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';

const { data: challenges, isLoading } = useChallengesWithVisibility({
  status: 'approved',
  sectorId: selectedSector,
  limit: 50
});
```

### Using the Core Visibility System

```javascript
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

function MyComponent() {
  const {
    visibilityLevel,
    hasFullVisibility,
    isNational,
    sectorIds,
    userMunicipalityId,
    fetchWithVisibility
  } = useVisibilitySystem();

  // Fetch any entity with visibility applied
  const data = await fetchWithVisibility('challenges', '*', {
    additionalFilters: { status: 'approved' },
    limit: 50
  });
}
```

### Creating Custom Visibility Hooks

```javascript
import { createVisibilityHook } from '@/hooks/visibility/createVisibilityHook';

const useCustomEntityWithVisibility = createVisibilityHook({
  entityName: 'custom-entity',
  tableName: 'custom_entities',
  selectClause: `*, municipality:municipalities(id, name_en)`,
  columns: {
    municipalityColumn: 'municipality_id',
    sectorColumn: 'sector_id'
  },
  publicStatuses: ['active', 'published']
});
```

### Page Protection

```javascript
export default ProtectedPage(MyPage, {
  requiredPermissions: [
    'entity_view_all',
    'entity_view_own',
    'dashboard_view'
  ]
  // By default, requires ANY of these permissions (not ALL)
});
```

---

## Security

### Security Layers

1. **Frontend Protection**
   - ProtectedPage HOC checks permissions before rendering
   - VisibilityGate components hide unauthorized UI
   - Navigation filters based on roles

2. **API/Hook Protection**
   - Visibility hooks filter data based on user scope
   - Query keys include visibility context for proper caching

3. **Database Protection (RLS)**
   - Row Level Security policies enforce access at database level
   - Security Definer functions prevent privilege escalation
   - Audit logging tracks access attempts

### Best Practices

- Never rely solely on frontend filtering
- Always use visibility hooks for data fetching
- RLS policies must match hook logic
- Test visibility with different user personas

---

## Migration Status

### Phase 1: Core System ✅
- [x] `useVisibilitySystem` hook
- [x] `useEntityVisibility` hook
- [x] Database functions
- [x] `useChallengesWithVisibility`
- [x] `usePilotsWithVisibility`
- [x] `useProgramsWithVisibility`
- [x] `useSolutionsWithVisibility`
- [x] `useLivingLabsWithVisibility`
- [x] `useContractsWithVisibility`
- [x] `useRDProjectsWithVisibility`
- [x] `useKnowledgeWithVisibility`

### Phase 2: Page Integration 🔄
- [x] Challenges page
- [x] Pilots page
- [x] Programs page
- [x] Solutions page
- [ ] Living Labs page
- [ ] R&D Projects page
- [ ] Contracts page
- [ ] Knowledge page
- [ ] Dashboard pages
- [ ] Detail pages

### Phase 3: Components 📋
- [ ] Dashboard widgets
- [ ] List components
- [ ] Detail views
- [ ] Analytics components
- [ ] Search components
- [ ] Export functions

### Phase 4: Sidebar & Navigation 📋
- [ ] Dynamic sidebar filtering
- [ ] Menu item visibility
- [ ] Breadcrumb visibility
- [ ] Quick action visibility

---

## Role-Permission Mapping

| Role | Key Permissions |
|------|-----------------|
| Admin | `*` (all) |
| Deputyship Admin | `visibility_national`, `challenge_view_all`, `pilot_view_all`, `program_view_all`, `user_manage_sector` |
| Deputyship Staff | `visibility_national`, `challenge_view_all`, `pilot_view_all`, `program_view_all` |
| Municipality Admin | `challenge_create`, `pilot_create`, `challenge_view_own`, `pilot_view_own`, `user_manage_local` |
| Municipality Staff | `challenge_view_own`, `pilot_view_own`, `challenge_view`, `pilot_view`, `program_view`, `solution_view` |
| Provider | `solution_create`, `solution_edit_own`, `proposal_submit`, `pilot_view` (linked) |
| Startup | `solution_create`, `program_apply`, `challenge_view` (published) |
| Expert | `evaluation_create`, `challenge_view`, `pilot_view`, `proposal_review` |
| Citizen | Public access only |
