# Comprehensive Visibility System

## Overview

The visibility system provides consistent access control across all entity types in the platform, designed specifically for the Municipality/Deputyship organizational structure.

## Table of Contents
1. [Visibility Levels](#visibility-levels)
2. [User Personas](#user-personas)
3. [Entity Types](#entity-types)
4. [Pages Coverage](#pages-coverage)
5. [Detail Pages](#detail-pages)
6. [Sidebar Navigation](#sidebar-navigation)
7. [Components](#components)
8. [Database Functions](#database-functions)
9. [Implementation Guide](#implementation-guide)
10. [Security](#security)
11. [Migration Status](#migration-status)

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

### Core Entity Hooks

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

### Supporting Entity Hooks

| Entity | Table | Hook | Status |
|--------|-------|------|--------|
| Users | `user_profiles` | `useUsersWithVisibility` | ✅ Implemented |
| Municipalities | `municipalities` | `useMunicipalitiesWithVisibility` | ✅ Implemented |
| Organizations | `organizations` | `useOrganizationsWithVisibility` | ✅ Implemented |

### Utility Hooks

| Hook | Purpose | Status |
|------|---------|--------|
| `useVisibilityAwareSearch` | Cross-entity search with visibility | ✅ Implemented |
| `useEntityAccessCheck` | Single entity access validation | ✅ Implemented |

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
| R&D Projects | `/rd-projects` | `useRDProjectsWithVisibility` | ✅ |
| Knowledge | `/knowledge` | `useKnowledgeWithVisibility` | ✅ |
| Contract Management | `/contract-management` | `useContractsWithVisibility` | ✅ |
| Budget Management | `/budget-management` | `useBudgetsWithVisibility` | ✅ |
| Proposal Review | `/challenge-proposal-review` | `useProposalsWithVisibility` | ✅ |

### Dashboard Pages ✅

| Page | Route | Hooks Used | Status |
|------|-------|------------|--------|
| Executive Dashboard | `/executive-dashboard` | All visibility hooks | ✅ |
| Municipality Dashboard | `/municipality-dashboard` | Visibility hooks imported | ✅ |
| RBAC Dashboard | `/rbac-dashboard` | Admin PermissionGate | ✅ |

### My* Personal Pages

| Page | Route | Notes | Status |
|------|-------|-------|--------|
| My Challenges | `/my-challenges` | Uses user-specific queries | ⚡ Built-in filtering |
| My Pilots | `/my-pilots` | Uses user-specific queries | ⚡ Built-in filtering |
| My Programs | `/my-programs` | Uses user-specific queries | ⚡ Built-in filtering |
| My R&D Projects | `/my-rd-projects` | Uses user-specific queries | ⚡ Built-in filtering |

### Public/Citizen Pages

| Page | Route | Description | Status |
|------|-------|-------------|--------|
| Citizen Challenges Browser | `/citizen/challenges` | Published challenges | ⚡ Public filter |
| Citizen Solutions Browser | `/citizen/solutions` | Published solutions | ⚡ Public filter |
| Citizen Living Labs | `/citizen/living-labs` | Published labs | ⚡ Public filter |

---

## Detail Pages ✅

Detail pages now include visibility access checks using `useEntityAccessCheck`:

| Page | Route | Access Check | Status |
|------|-------|--------------|--------|
| Challenge Detail | `/challenge-detail` | `useEntityAccessCheck` | ✅ |
| Pilot Detail | `/pilot-detail` | `useEntityAccessCheck` | ✅ |
| Program Detail | `/program-detail` | `useEntityAccessCheck` | ✅ |
| Solution Detail | `/solution-detail` | `useEntityAccessCheck` | ✅ |
| Living Lab Detail | `/living-lab-detail` | `useEntityAccessCheck` | ✅ |
| R&D Project Detail | `/rd-project-detail` | `useEntityAccessCheck` | ✅ |
| Contract Detail | `/contract-detail` | `useEntityAccessCheck` | ✅ |

### Using Entity Access Check

```javascript
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';

function ChallengeDetail() {
  const { data: challenge } = useQuery({...});
  
  // Check access after entity is loaded
  const accessCheck = useEntityAccessCheck(challenge, {
    municipalityColumn: 'municipality_id',
    sectorColumn: 'sector_id',
    ownerColumn: 'created_by',
    publishedColumn: 'is_published',
    statusColumn: 'status',
    publicStatuses: ['approved', 'published', 'active']
  });

  if (accessCheck.isLoading) return <Loading />;
  if (!accessCheck.canAccess) return <AccessDenied />;
  
  return <DetailContent />;
}
```

---

## Sidebar Navigation

The sidebar (`PersonaSidebar.jsx`) implements permission-based filtering:

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

## Components Using Visibility

### Search Components ✅

| Component | Hook/Protection | Status |
|-----------|-----------------|--------|
| `SemanticSearch` | `useVisibilityAwareSearch` | ✅ Implemented |

### Dashboard Widgets ✅

| Component | Hook/Protection | Status |
|-----------|-----------------|--------|
| `ExecutiveDashboard` | All visibility hooks | ✅ |
| `MunicipalityDashboard` | Geographic visibility | ✅ |
| `RBACDashboardContent` | `PermissionGate` (admin only) | ✅ |
| `PeerBenchmarkingTool` | `useMunicipalitiesWithVisibility`, `useChallengesWithVisibility`, `usePilotsWithVisibility` | ✅ |

### Workflow Components ✅

| Component | Hook/Protection | Status |
|-----------|-----------------|--------|
| `ProgramToPilotWorkflow` | `useMunicipalitiesWithVisibility`, `useChallengesWithVisibility` | ✅ |
| `LabRoutingHub` | `useLivingLabsWithVisibility` | ✅ |

### Academia/Research Components ✅

| Component | Hook/Protection | Status |
|-----------|-----------------|--------|
| `CollaborationHub` | `useRDProjectsWithVisibility`, `useOrganizationsWithVisibility` | ✅ |

### RBAC Components ✅

| Component | Hook/Protection | Status |
|-----------|-----------------|--------|
| `MenuRBACContent` | `PermissionGate` (admin only) | ✅ |

### Form/Selection Components ✅

| Component | Hook/Protection | Status |
|-----------|-----------------|--------|
| `ChallengeOwnershipTransfer` | `useUsersWithVisibility` | ✅ |

### Filter Components

| Component | Pattern | Status |
|-----------|---------|--------|
| Sector filter | Respects user's sector access | ✅ |
| Municipality filter | Only shows accessible municipalities | ✅ |

### User-Scoped Components (No Changes Needed)

| Component | Pattern | Status |
|-----------|---------|--------|
| `ChallengeFollowButton` | User's own follows | ✅ Correct |
| `StakeholderHub` | Pilot-specific feedback | ✅ Correct |
| `ProviderNotificationPreferences` | User's own preferences | ✅ Correct |
| `ProposalSubmissionForm` | User's own solutions | ✅ Correct |
| `SolutionReviewsTab` | User's own reviews | ✅ Correct |
| `MyWorkPrioritizer` | User's own work items | ✅ Correct |
| `MyWeekAhead` | User's own schedule | ✅ Correct |

### Lookup/Reference Data (Public - No Changes Needed)

| Component | Data Type | Status |
|-----------|-----------|--------|
| Sector dropdowns | Reference data | ✅ Public OK |
| Service dropdowns | Reference data | ✅ Public OK |
| Region dropdowns | Reference data | ✅ Public OK |

---

## Available Visibility Hooks

```javascript
// Import from the visibility index
import {
  // Core system
  useVisibilitySystem,
  createVisibilityHook,
  
  // Single entity access
  useEntityAccessCheck,
  withEntityAccess,
  
  // Entity-specific list hooks
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
  
  // Supporting entity hooks
  useUsersWithVisibility,
  useMunicipalitiesWithVisibility,
  
  // Utility hooks
  useVisibilityAwareSearch,
  
  // Permissions
  usePermissions
} from '@/hooks/visibility';
```

---

## Implementation Guide

### Using Visibility Hooks for Lists

```javascript
// For Challenges list
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';

const { data: challenges, isLoading } = useChallengesWithVisibility({
  status: 'approved',
  sectorId: selectedSector,
  limit: 50
});
```

### Using Entity Access Check for Detail Pages

```javascript
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';

function EntityDetail({ entity }) {
  const accessCheck = useEntityAccessCheck(entity, {
    municipalityColumn: 'municipality_id',
    sectorColumn: 'sector_id'
  });

  // accessCheck.canAccess - boolean
  // accessCheck.reason - 'admin_access', 'sectoral_access', 'municipality_access', etc.
  // accessCheck.visibilityLevel - 'global', 'sectoral', 'geographic', 'public'
}
```

### Using Visibility-Aware Search

```javascript
import { useVisibilityAwareSearch } from '@/hooks/useVisibilityAwareSearch';

function SearchComponent() {
  const { search, results, searching } = useVisibilityAwareSearch();
  
  const handleSearch = async (query) => {
    await search(query, {
      entityTypes: ['challenges', 'pilots', 'solutions'],
      limit: 10
    });
  };
  
  // Results are automatically filtered by user's visibility level
}
```

### Using Users With Visibility

```javascript
import { useUsersWithVisibility } from '@/hooks/useUsersWithVisibility';

function UserSelector() {
  const { data: users } = useUsersWithVisibility();
  
  // Admin: sees all users
  // Deputyship: sees users across all municipalities
  // Municipality: sees only users in same municipality
  // Provider: sees only users in same organization
}
```

### Using Municipalities With Visibility

```javascript
import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';

function MunicipalitySelector() {
  const { data: municipalities } = useMunicipalitiesWithVisibility({
    includeNational: true
  });
  
  // Admin/Deputyship: sees all municipalities
  // Municipality staff: sees own + national municipalities
}
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

### Component Protection with PermissionGate

```javascript
import PermissionGate from '@/components/permissions/PermissionGate';

function AdminOnlySection() {
  return (
    <PermissionGate 
      requireAdmin 
      fallback={<AccessDeniedMessage />}
    >
      <AdminContent />
    </PermissionGate>
  );
}
```

---

## Hook Options Reference

All visibility hooks accept these common options:

| Option | Type | Description |
|--------|------|-------------|
| `status` | string | Filter by status field |
| `sectorId` | string | Filter by sector UUID |
| `limit` | number | Max records to return (default: 100) |
| `includeDeleted` | boolean | Include soft-deleted records |
| `publishedOnly` | boolean | Only return published records |

### Hook-Specific Options

| Hook | Additional Options |
|------|-------------------|
| `usePilotsWithVisibility` | `providerId` |
| `useProgramsWithVisibility` | `programType` |
| `useSolutionsWithVisibility` | `maturityLevel` |
| `useKnowledgeWithVisibility` | `documentType` |
| `useRDProjectsWithVisibility` | `projectType` |
| `useContractsWithVisibility` | `contractType` |
| `useBudgetsWithVisibility` | `entityType`, `fiscalYear` |
| `useMunicipalitiesWithVisibility` | `includeNational` |

### Entity Access Check Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `municipalityColumn` | string | `'municipality_id'` | Column name for municipality |
| `sectorColumn` | string | `'sector_id'` | Column name for sector |
| `ownerColumn` | string | `'created_by'` | Column name for owner/creator |
| `publishedColumn` | string | `'is_published'` | Column name for published status |
| `statusColumn` | string | `'status'` | Column name for status |
| `publicStatuses` | array | `['published', 'active', 'completed']` | Status values considered public |
| `providerColumn` | string | `'provider_id'` | Column name for provider |

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
   - PermissionGate component for inline protection
   - Sidebar filters menu items by role/permission
   - Visibility hooks filter data client-side
   - Entity access check for detail pages

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
- [x] All 11 entity visibility hooks
- [x] `useEntityAccessCheck` for detail pages

### Phase 2: Page Integration ✅ Complete
- [x] Challenges page
- [x] Pilots page
- [x] Programs page
- [x] Solutions page
- [x] Living Labs page
- [x] R&D Projects page
- [x] Knowledge page
- [x] Contract Management page
- [x] Budget Management page
- [x] Proposal Review page
- [x] Executive Dashboard
- [x] Municipality Dashboard

### Phase 3: Detail Pages ✅ Complete
- [x] ChallengeDetail
- [x] PilotDetail
- [x] ProgramDetail
- [x] SolutionDetail
- [x] LivingLabDetail
- [x] RDProjectDetail
- [x] ContractDetail

### Phase 4: Sidebar & Navigation ✅ Complete
- [x] Dynamic menu filtering by role/permission
- [x] Persona-specific menu configurations
- [x] Permission-based item visibility

### Phase 5: Components ✅ Complete
- [x] SemanticSearch → `useVisibilityAwareSearch`
- [x] PeerBenchmarkingTool → Visibility hooks
- [x] RBACDashboardContent → `PermissionGate`
- [x] ChallengeOwnershipTransfer → `useUsersWithVisibility`
- [x] ProgramToPilotWorkflow → `useMunicipalitiesWithVisibility`, `useChallengesWithVisibility`
- [x] LabRoutingHub → `useLivingLabsWithVisibility`
- [x] CollaborationHub → `useRDProjectsWithVisibility`, `useOrganizationsWithVisibility`
- [x] MenuRBACContent → `PermissionGate`

### Phase 6: Supporting Hooks ✅ Complete
- [x] `useUsersWithVisibility`
- [x] `useMunicipalitiesWithVisibility`
- [x] `useOrganizationsWithVisibility`
- [x] `useVisibilityAwareSearch`

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

---

## Troubleshooting

### Common Issues

1. **Data not loading**: Check if `visibilityLoading` is blocking the query
2. **Empty results**: Verify user has appropriate role/municipality assignment
3. **Cache stale**: Query keys include visibility context for proper invalidation
4. **Access denied on detail page**: Check if entity has correct municipality_id/sector_id
5. **Search returning too many results**: Ensure `useVisibilityAwareSearch` is being used

### Debug Mode

```javascript
// For list visibility
const { visibilityLevel, hasFullVisibility, sectorIds } = useVisibilitySystem();
console.log('Visibility:', { visibilityLevel, hasFullVisibility, sectorIds });

// For detail page access
const accessCheck = useEntityAccessCheck(entity);
console.log('Access:', accessCheck);
// { canAccess: true/false, reason: 'admin_access'|'sectoral_access'|..., visibilityLevel: '...' }

// For search
const { search, results } = useVisibilityAwareSearch();
console.log('Search results (filtered):', results);
```

---

## File Structure

```
src/hooks/
├── visibility/
│   ├── index.js                    # Central exports
│   ├── useVisibilitySystem.js      # Core visibility logic
│   └── createVisibilityHook.js     # Hook factory
├── useChallengesWithVisibility.js
├── usePilotsWithVisibility.js
├── useProgramsWithVisibility.js
├── useSolutionsWithVisibility.js
├── useLivingLabsWithVisibility.js
├── useContractsWithVisibility.js
├── useRDProjectsWithVisibility.js
├── useKnowledgeWithVisibility.js
├── useCaseStudiesWithVisibility.js
├── useBudgetsWithVisibility.js
├── useProposalsWithVisibility.js
├── useUsersWithVisibility.js
├── useMunicipalitiesWithVisibility.js
├── useOrganizationsWithVisibility.js
├── useVisibilityAwareSearch.js
├── useEntityAccessCheck.js
└── useEntityVisibility.js

src/components/permissions/
├── PermissionGate.jsx
├── ProtectedPage.jsx
├── usePermissions.jsx
└── withEntityAccess.jsx
```

---

## Summary

The visibility system is now **fully implemented** across:

| Category | Coverage |
|----------|----------|
| Entity Hooks | 15 hooks (11 core + 4 supporting) |
| Pages | 26+ pages with visibility |
| Detail Pages | 7 pages with access checks |
| Components | 9+ components updated |
| Sidebar | Full permission-based filtering |
| Search | Visibility-aware cross-entity search |

All user personas are supported with appropriate visibility levels, and the system is designed to be extensible for future entity types.
