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

| Entity | Table | Hook | Status |
|--------|-------|------|--------|
| Challenges | `challenges` | `useChallengesWithVisibility` | ✅ Implemented |
| Pilots | `pilots` | `usePilotsWithVisibility` | ✅ Implemented |
| Programs | `programs` | `useProgramsWithVisibility` | ✅ Implemented |
| Solutions | `solutions` | `useSolutionsWithVisibility` | ✅ Implemented |
| Living Labs | `living_labs` | `useLivingLabsWithVisibility` | ✅ Implemented |
| R&D Projects | `rd_projects` | `useRDProjectsWithVisibility` | ✅ Implemented |
| Contracts | `contracts` | `useContractsWithVisibility` | ✅ Implemented |
| Knowledge Docs | `knowledge_documents` | `useKnowledgeWithVisibility` | ✅ Implemented |
| Case Studies | `case_studies` | `useCaseStudiesWithVisibility` | ✅ Implemented |
| Budgets | `budgets` | `useBudgetsWithVisibility` | ✅ Implemented |
| Proposals | `challenge_proposals` | `useProposalsWithVisibility` | ✅ Implemented |

---

## Pages Coverage

### Primary Entity Pages ✅

| Page | Route | Hook Used | Status |
|------|-------|-----------|--------|
| Challenges | `/challenges` | `useChallengesWithVisibility` | ✅ |
| Pilots | `/pilots` | `usePilotsWithVisibility` | ✅ |
| Programs | `/programs` | `useProgramsWithVisibility` | ✅ |
| Solutions | `/solutions` | `useSolutionsWithVisibility` | ✅ |
| Living Labs | `/living-labs` | `useLivingLabsWithVisibility` | ✅ |
| Knowledge | `/knowledge` | `useKnowledgeWithVisibility` | ✅ |
| Contract Management | `/contract-management` | `useContractsWithVisibility` | ✅ |

### Dashboard Pages ✅

| Page | Route | Hooks Used | Status |
|------|-------|------------|--------|
| Executive Dashboard | `/executive-dashboard` | All visibility hooks | ✅ |
| Municipality Dashboard | `/municipality-dashboard` | Visibility hooks imported | ✅ |

### My* Personal Pages

| Page | Route | Notes | Status |
|------|-------|-------|--------|
| My Challenges | `/my-challenges` | Uses user-specific queries | ⚡ Built-in filtering |
| My Pilots | `/my-pilots` | Uses user-specific queries | ⚡ Built-in filtering |
| My Programs | `/my-programs` | Uses user-specific queries | ⚡ Built-in filtering |

### Public/Citizen Pages

| Page | Route | Description | Status |
|------|-------|-------------|--------|
| Citizen Challenges Browser | `/citizen/challenges` | Published challenges | ⚡ Public filter |
| Citizen Solutions Browser | `/citizen/solutions` | Published solutions | ⚡ Public filter |

---

## Sidebar Navigation

The sidebar (`PersonaSidebar.jsx`) already implements permission-based filtering:

```javascript
// Filter menu items based on permissions
const filteredItems = useMemo(() => {
  return menuConfig.items.filter((item) => {
    if (!item.permission && !item.anyPermission && !item.roles) return true;
    if (isAdmin) return true;
    
    if (item.roles?.length > 0) {
      if (!item.roles.some(r => roles.includes(r))) return false;
    }
    
    if (item.anyPermission?.length > 0) {
      return hasAnyPermission(item.anyPermission);
    }
    
    if (item.permission) {
      return hasPermission(item.permission);
    }
    
    return true;
  });
}, [menuConfig.items, hasPermission, hasAnyPermission, roles, isAdmin]);
```

### Menu Configuration (`sidebarMenus.js`)

Each persona has a dedicated menu with permission-controlled items:
- **Admin**: Full access to all menu items
- **Executive**: Strategic overview and reports
- **Deputyship**: National-level oversight, multi-city coordination
- **Municipality**: Local operations, own challenges/pilots/programs
- **Provider**: Solutions, opportunities, proposals
- **Startup/Academia**: Program applications, research
- **Citizen**: Browse, participate, feedback

---

## Available Visibility Hooks

```javascript
// Import from the visibility index
import {
  useVisibilitySystem,
  createVisibilityHook,
  useEntityVisibility,
  useChallengesWithVisibility,
  usePilotsWithVisibility,
  useProgramsWithVisibility,
  useSolutionsWithVisibility,
  useLivingLabsWithVisibility,
  useContractsWithVisibility,
  useRDProjectsWithVisibility,
  useKnowledgeWithVisibility,
  useCaseStudiesWithVisibility,
  useBudgetsWithVisibility,
  useProposalsWithVisibility,
  usePermissions
} from '@/hooks/visibility';
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
    visibilityLevel,      // 'global' | 'sectoral' | 'geographic' | 'organizational' | 'public'
    hasFullVisibility,    // boolean
    isNational,           // boolean - is deputyship user
    sectorIds,            // array of sector UUIDs
    userMunicipalityId,   // user's municipality UUID
    nationalMunicipalityIds, // array of national municipality UUIDs
    fetchWithVisibility   // async function for custom queries
  } = useVisibilitySystem();
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
});
```

---

## Database Functions

### `get_user_visibility_scope(p_user_id)`
```sql
RETURNS TABLE(
  scope_type text,
  municipality_id uuid,
  sector_ids uuid[],
  is_national boolean
)
```

### `can_view_entity(p_user_id, p_entity_municipality_id, p_entity_sector_id)`
```sql
RETURNS boolean
```

### `is_national_entity(p_municipality_id)`
```sql
RETURNS boolean
```

---

## Security

### Security Layers

1. **Frontend Protection**
   - ProtectedPage HOC checks permissions
   - Sidebar filters menu items by role/permission
   - Visibility hooks filter data client-side

2. **API/Hook Protection**
   - Visibility hooks filter based on user scope
   - Query keys include visibility context for caching

3. **Database Protection (RLS)**
   - Row Level Security enforces access at DB level
   - Security Definer functions prevent privilege escalation

---

## Migration Status

### Phase 1: Core Hooks ✅ Complete
- [x] `useVisibilitySystem`
- [x] `useEntityVisibility`
- [x] `createVisibilityHook` factory
- [x] `useChallengesWithVisibility`
- [x] `usePilotsWithVisibility`
- [x] `useProgramsWithVisibility`
- [x] `useSolutionsWithVisibility`
- [x] `useLivingLabsWithVisibility`
- [x] `useContractsWithVisibility`
- [x] `useRDProjectsWithVisibility`
- [x] `useKnowledgeWithVisibility`
- [x] `useCaseStudiesWithVisibility`
- [x] `useBudgetsWithVisibility`
- [x] `useProposalsWithVisibility`

### Phase 2: Page Integration ✅ Complete
- [x] Challenges page
- [x] Pilots page
- [x] Programs page
- [x] Solutions page
- [x] Living Labs page
- [x] Knowledge page
- [x] Contract Management page
- [x] Executive Dashboard
- [x] Municipality Dashboard (imports ready)

### Phase 3: Sidebar & Navigation ✅ Complete
- [x] Dynamic menu filtering by role/permission
- [x] Persona-specific menu configurations
- [x] Permission-based item visibility

### Phase 4: Additional Pages (Optional)
- [ ] Detail pages (ChallengeDetail, PilotDetail, etc.)
- [ ] R&D Projects page
- [ ] Budget Management page
- [ ] Audit pages

---

## Role-Permission Mapping

| Role | Key Permissions |
|------|-----------------|
| Admin | `*` (all) |
| Deputyship Admin | `visibility_national`, `*_view_all`, `user_manage_sector` |
| Deputyship Staff | `visibility_national`, `*_view_all` |
| Municipality Admin | `*_create`, `*_view_own`, `user_manage_local` |
| Municipality Staff | `*_view_own`, `*_view` |
| Provider | `solution_create`, `solution_edit_own`, `proposal_submit` |
| Startup | `solution_create`, `program_apply` |
| Expert | `evaluation_create`, `*_view`, `proposal_review` |
| Citizen | Public access only |
