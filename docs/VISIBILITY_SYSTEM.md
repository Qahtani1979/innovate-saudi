# Comprehensive Visibility System

## Overview

The visibility system provides consistent access control across all entity types in the platform, designed specifically for the Municipality/Deputyship organizational structure.

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

## Entity Types Covered

| Entity | Table | Municipality Column | Sector Column |
|--------|-------|---------------------|---------------|
| Challenges | `challenges` | `municipality_id` | `sector_id` |
| Pilots | `pilots` | `municipality_id` | `sector_id` |
| Programs | `programs` | `municipality_id` | `sector_id` |
| Solutions | `solutions` | - | `sector_id` |
| Living Labs | `living_labs` | `municipality_id` | `sector_id` |
| R&D Projects | `rd_projects` | `municipality_id` | `sector_id` |
| Contracts | `contracts` | `municipality_id` | - |
| Budgets | `budgets` | `entity_id` (indirect) | - |
| Case Studies | `case_studies` | `municipality_id` | `sector_id` |
| Knowledge Docs | `knowledge_documents` | `municipality_id` | `sector_id` |

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

## Implementation

### Using Visibility Hooks

```javascript
// For Challenges
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';

const { data: challenges, isLoading } = useChallengesWithVisibility({
  status: 'approved',
  sectorId: selectedSector,
  limit: 50
});

// For Pilots
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';

const { data: pilots } = usePilotsWithVisibility({
  status: 'active',
  limit: 100
});

// For Programs
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';

const { data: programs } = useProgramsWithVisibility({
  programType: 'accelerator',
  status: 'active'
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

const useLivingLabsWithVisibility = createVisibilityHook({
  entityName: 'living-labs',
  tableName: 'living_labs',
  selectClause: `
    *,
    municipality:municipalities(id, name_en, name_ar),
    sector:sectors(id, name_en, name_ar)
  `,
  columns: {
    municipalityColumn: 'municipality_id',
    sectorColumn: 'sector_id',
    statusColumn: 'status',
    publishedColumn: 'is_published',
    deletedColumn: 'is_deleted'
  },
  publicStatuses: ['active', 'completed']
});
```

## Page Protection

Pages use `ProtectedPage` HOC with permission checks:

```javascript
export default ProtectedPage(ChallengesPage, {
  requiredPermissions: [
    'challenge_view_all',
    'challenge_view_own',
    'challenge_view',
    'dashboard_view'
  ]
  // By default, requires ANY of these permissions (not ALL)
});
```

## Role-Permission Mapping

| Role | Permissions |
|------|-------------|
| Admin | `*` (all) |
| Municipality Staff | `challenge_view_own`, `pilot_view_own`, `challenge_view`, `pilot_view`, `program_view`, `solution_view`, `dashboard_view` |
| Municipality Admin | All Municipality Staff + `challenge_create`, `pilot_create`, `user_manage_local` |
| Deputyship Staff | `challenge_view_all`, `pilot_view_all`, `program_view_all`, `visibility_national` |
| Provider | `solution_create`, `pilot_view` (linked), `proposal_submit` |

## Security Considerations

1. **RLS Policies**: Database-level Row Level Security ensures data protection even if frontend is bypassed
2. **Server Functions**: Visibility checks via `SECURITY DEFINER` functions prevent privilege escalation
3. **Token Verification**: All API calls verify JWT tokens before processing
4. **Audit Logging**: Access attempts are logged for security monitoring

## Migration Plan

### Phase 1: Core System (Completed)
- ✅ `useVisibilitySystem` hook
- ✅ `useEntityVisibility` hook
- ✅ Database functions (`get_user_visibility_scope`, `can_view_entity`)
- ✅ `useChallengesWithVisibility`
- ✅ `usePilotsWithVisibility`
- ✅ `useProgramsWithVisibility`
- ✅ `useSolutionsWithVisibility`

### Phase 2: Page Integration (In Progress)
- ✅ Challenges page
- ✅ Pilots page
- ✅ Programs page
- ✅ Solutions page
- ⏳ Living Labs page
- ⏳ Dashboard pages
- ⏳ Detail pages

### Phase 3: Extended Entities
- ⏳ R&D Projects
- ⏳ Contracts
- ⏳ Budgets
- ⏳ Case Studies
- ⏳ Knowledge Documents

### Phase 4: Components
- ⏳ Dashboard widgets
- ⏳ Analytics components
- ⏳ Search components
- ⏳ Export functions
