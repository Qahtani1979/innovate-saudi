# Role, Permission & Visibility System Documentation

**Last Updated:** December 18, 2024  
**Status:** ✅ Phase 4 Complete - Unified RBAC System

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Database Layer](#database-layer)
4. [Database Functions](#database-functions)
5. [Frontend Hooks](#frontend-hooks)
6. [Frontend Components](#frontend-components)
7. [Pages & Routes](#pages--routes)
8. [Data Flow Diagrams](#data-flow-diagrams)
9. [Migration History](#migration-history)
10. [File Reference Index](#file-reference-index)

---

## System Overview

The application uses a **unified role-based access control (RBAC)** system:

| Layer | Purpose | Primary Table |
|-------|---------|---------------|
| **Roles** | Role definitions with metadata | `roles` |
| **User Roles** | User-to-role assignments via `role_id` | `user_roles` |
| **Permissions** | Action-based access (challenge_create, etc.) | `permissions` |
| **Role Permissions** | Role-to-permission mappings | `role_permissions` |
| **Visibility** | Data scoping based on user context | Computed from `user_roles` |

### Key Architecture (Phase 4 Complete)
- **Single role path**: `user_roles.role_id` → `roles` → `role_permissions` → `permissions`
- **No enums**: `app_role` enum removed, roles stored in `roles` table
- **`user_functional_roles` table**: DROPPED (legacy, no longer used)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER REQUEST                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ROUTING LAYER                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   App.tsx       │  │ ProtectedPage   │  │   Route Definitions         │  │
│  │   (Routes)      │──▶│   Component     │──▶│   (requireAuth, roles)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND PERMISSION LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ usePermissions  │  │PermissionGate   │  │   ProtectedAction           │  │
│  │     Hook        │◀─│   Component     │  │   Component                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ useVisibility   │  │useEntityAccess  │  │  withEntityAccess           │  │
│  │    System       │  │    Check        │  │     HOC                     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   user_roles    │  │  permissions    │  │   role_permissions          │  │
│  │   (PRIMARY)     │  │                 │  │                             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│           │                    │                        │                    │
│           ▼                    ▼                        ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    DATABASE FUNCTIONS                                    ││
│  │  has_role_by_name() │ get_user_permissions() │ get_user_visibility_scope()││
│  │  has_permission()   │ can_view_entity()      │ get_user_functional_roles()││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         RLS POLICIES                                     ││
│  │  Uses is_admin(auth.uid()) for admin checks across all tables           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Layer

### Core Tables

#### 1. `user_roles` (PRIMARY - Phase 4 Schema)
**Location:** Supabase Database  
**Purpose:** Core role assignments with role_id references

```sql
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT,                              -- DEPRECATED: Legacy column (nullable)
    role_id UUID REFERENCES roles(id) NOT NULL,  -- NEW: FK to roles table
    municipality_id UUID REFERENCES municipalities(id),
    organization_id UUID REFERENCES organizations(id),
    user_email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    assigned_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    UNIQUE (user_id, role_id)
);
```

**Used By:**
- All database functions via `role_id` joins
- All RLS policies via `role_id` joins
- `usePermissions` hook
- `rbac-manager` edge function

---

#### 2. `roles` (Role Definitions)
**Location:** Supabase Database  
**Purpose:** Defines available roles and their metadata

```sql
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_name_en TEXT,
    display_name_ar TEXT,
    category TEXT,
    is_system_role BOOLEAN DEFAULT false,
    is_assignable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Used By:**
- `user_roles.role_id` foreign key
- Role selection UI components
- `map_enum_to_role_id()` function

---

#### 3. `permissions` (Permission Definitions)
**Location:** Supabase Database  
**Purpose:** Defines granular permissions

```sql
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,        -- e.g., 'challenge_create', 'pilot_approve'
    name_en TEXT,
    name_ar TEXT,
    description_en TEXT,
    description_ar TEXT,
    category TEXT,                    -- 'challenges', 'pilots', 'admin'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Used By:**
- `get_user_permissions()` function
- `usePermissions` hook
- `PermissionGate` component

---

#### 5. `role_permissions` (Role-Permission Mapping)
**Location:** Supabase Database  
**Purpose:** Maps roles to their permissions

```sql
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (role_id, permission_id)
);
```

**Used By:**
- `get_user_permissions()` function (joins with user_roles)

---

#### 6. `role_requests` (Role Request Queue)
**Location:** Supabase Database  
**Purpose:** Stores pending role requests from users

```sql
CREATE TABLE public.role_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_email TEXT,
    requested_role TEXT NOT NULL,
    justification TEXT,
    status TEXT DEFAULT 'pending',    -- 'pending', 'approved', 'rejected'
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    municipality_id UUID,
    organization_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Used By:**
- `RoleRequestCard.jsx` - Creates requests
- `RoleRequestApprovalQueue.jsx` - Reviews requests

---

### Table Relationship Diagram

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    auth.users    │     │      roles       │     │   permissions    │
│                  │     │                  │     │                  │
│  id (PK)         │     │  id (PK)         │     │  id (PK)         │
│  email           │     │  name            │     │  code            │
└────────┬─────────┘     │  display_name_en │     │  name_en         │
         │               │  category        │     │  category        │
         │               └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         ▼                        │                        │
┌──────────────────┐              │                        │
│   user_roles     │              │                        │
│   (PRIMARY)      │              ▼                        ▼
│                  │     ┌──────────────────────────────────────────┐
│  id (PK)         │     │          role_permissions                │
│  user_id (FK)────┼────▶│                                          │
│  role (ENUM)     │     │  id (PK)                                 │
│  municipality_id │     │  role_id (FK) ─────────────────────────┐ │
│  organization_id │     │  permission_id (FK) ───────────────────┘ │
└──────────────────┘     └──────────────────────────────────────────┘
         │
         │  ⚠️ DISCONNECTED
         ▼
┌──────────────────┐     ┌──────────────────┐
│user_functional_  │     │  role_requests   │
│     roles        │     │                  │
│   (BROKEN)       │     │  id (PK)         │
│                  │     │  user_id         │
│  id (PK)         │     │  requested_role  │
│  user_id         │     │  status          │
│  role_type       │     │  justification   │
│  scope_type      │     └──────────────────┘
│  is_active       │              │
└──────────────────┘              │
         ▲                        │
         │    ⚠️ BUG: Writes here │
         └────────────────────────┘
```

---

## Database Functions

### 1. `is_admin(user_id UUID)` - CRITICAL
**Location:** Supabase Database  
**Purpose:** Checks if user has admin role - used by ALL RLS policies

```sql
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1
    AND r.name = 'admin'
    AND ur.is_active = true
  )
$$;
```

**Used By:**
- Every RLS policy in the database (100+ policies)
- Pattern: `is_admin(auth.uid())`

---

### 2. `get_user_permissions(user_id UUID)`
**Location:** Supabase Database  
**Purpose:** Returns array of permission codes for a user

```sql
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    permission_codes TEXT[];
BEGIN
    -- Admin gets all permissions
    IF is_admin(p_user_id) THEN
        SELECT array_agg(code) INTO permission_codes FROM permissions WHERE is_active = true;
        RETURN COALESCE(permission_codes, ARRAY[]::TEXT[]);
    END IF;
    
    -- Get permissions based on user_roles -> roles -> role_permissions -> permissions
    SELECT array_agg(DISTINCT p.code) INTO permission_codes
    FROM user_roles ur
    JOIN roles r ON ur.role::text = r.name
    JOIN role_permissions rp ON rp.role_id = r.id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = p_user_id AND p.is_active = true;
    
    RETURN COALESCE(permission_codes, ARRAY[]::TEXT[]);
END;
$$;
```

**Used By:**
- `usePermissions` hook

---

### 3. `get_user_visibility_scope(user_id UUID)`
**Location:** Backend Database  
**Purpose:** Returns visibility scope for entity filtering (Phase 4)

```sql
CREATE OR REPLACE FUNCTION public.get_user_visibility_scope(p_user_id uuid)
RETURNS TABLE(scope_type text, municipality_id uuid, sector_ids uuid[], is_national boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE WHEN r.code = 'NATIONAL' THEN 'sectoral' ELSE 'geographic' END as scope_type,
    ur.municipality_id,
    COALESCE(m.focus_sectors, ARRAY[m.sector_id]::uuid[]) as sector_ids,
    (r.code = 'NATIONAL') as is_national
  FROM user_roles ur
  LEFT JOIN municipalities m ON ur.municipality_id = m.id
  LEFT JOIN regions r ON m.region_id = r.id
  WHERE ur.user_id = p_user_id
  AND ur.municipality_id IS NOT NULL
  LIMIT 1;
$$;
```

**Used By:**
- `useVisibilitySystem` hook

---

### 4. `get_user_functional_roles(user_id UUID)`
**Location:** Backend Database  
**Purpose:** Returns active user roles via `user_roles.role_id` join (Phase 4)

```sql
CREATE OR REPLACE FUNCTION public.get_user_functional_roles(_user_id uuid)
RETURNS TABLE(role_id uuid, role_name text, role_description text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.description
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = _user_id
    AND ur.is_active = true;
END;
$$;
```

**Used By:**
- `usePermissions` hook

---

### 5. `can_view_entity(user_id, entity_type, entity_id)`
**Location:** Supabase Database  
**Purpose:** Checks if user can view a specific entity

```sql
CREATE OR REPLACE FUNCTION public.can_view_entity(
    p_user_id UUID,
    p_entity_type TEXT,
    p_entity_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    scope JSONB;
    entity_municipality_id UUID;
BEGIN
    -- Admin can view everything
    IF is_admin(p_user_id) THEN RETURN TRUE; END IF;
    
    -- Get user's visibility scope
    scope := get_user_visibility_scope(p_user_id);
    
    -- Full visibility can see everything
    IF scope->>'level' = 'full' THEN RETURN TRUE; END IF;
    
    -- Get entity's municipality
    EXECUTE format('SELECT municipality_id FROM %I WHERE id = $1', p_entity_type)
    INTO entity_municipality_id USING p_entity_id;
    
    -- Check visibility based on scope
    IF scope->>'level' = 'national' THEN RETURN TRUE; END IF;
    
    IF scope->>'level' = 'municipality' THEN
        RETURN entity_municipality_id = ANY(
            SELECT jsonb_array_elements_text(scope->'municipality_ids')::UUID
        );
    END IF;
    
    RETURN FALSE;
END;
$$;
```

**Used By:**
- `useEntityAccessCheck` hook

---

## Frontend Hooks

### 1. `usePermissions` - PRIMARY PERMISSION HOOK
**File:** `src/components/permissions/usePermissions.js`

```javascript
export function usePermissions() {
  const { user, loading } = useAuth();
  
  const { data: permissions = [] } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_user_permissions', { 
        p_user_id: user.id 
      });
      return data || [];
    },
    enabled: !!user?.id
  });

  const isAdmin = useMemo(() => {
    return permissions.includes('*') || user?.assigned_roles?.includes('admin');
  }, [permissions, user]);

  const hasPermission = useCallback((permission) => {
    if (isAdmin) return true;
    return permissions.includes(permission);
  }, [permissions, isAdmin]);

  return { 
    permissions, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    isAdmin, 
    user,
    loading 
  };
}
```

**Exported From:** `src/components/permissions/index.js`  
**Used By:** 47+ components

---

### 2. `useVisibilitySystem` - VISIBILITY HOOK
**File:** `src/hooks/visibility/useVisibilitySystem.js`

```javascript
export function useVisibilitySystem() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  
  const { data: visibilityScope } = useQuery({
    queryKey: ['visibility-scope', user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_user_visibility_scope', {
        p_user_id: user.id
      });
      return data;
    },
    enabled: !!user?.id
  });

  return {
    hasFullVisibility: isAdmin || visibilityScope?.level === 'full',
    isNational: visibilityScope?.level === 'national',
    userMunicipalityId: visibilityScope?.municipality_ids?.[0],
    userOrganizationId: visibilityScope?.organization_ids?.[0],
    nationalMunicipalityIds: [...],
    visibilityLevel: visibilityScope?.level || 'public',
    isLoading
  };
}
```

**Exported From:** `src/hooks/visibility/index.js`  
**Used By:** All `use*WithVisibility` hooks

---

### 3. `useUserRoles` - ROLE FETCHING HOOK
**File:** `src/hooks/useUserRoles.js`

```javascript
export function useUserRoles() {
  const { user } = useAuth();
  
  const { data: roles = [] } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  return { roles, isAdmin: roles.some(r => r.role === 'admin') };
}
```

**Used By:**
- `RoleRequestCard.jsx`
- `UserManagementHub.jsx`

---

### 4. `useEntityAccessCheck` - ENTITY ACCESS HOOK
**File:** `src/hooks/useEntityAccessCheck.js`

```javascript
export function useEntityAccessCheck(entityType, entityId) {
  const { user } = useAuth();
  
  const { data: canAccess } = useQuery({
    queryKey: ['entity-access', entityType, entityId, user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc('can_view_entity', {
        p_user_id: user.id,
        p_entity_type: entityType,
        p_entity_id: entityId
      });
      return data;
    },
    enabled: !!user?.id && !!entityId
  });

  return { canAccess, isLoading };
}
```

**Used By:**
- `withEntityAccess` HOC
- Detail page components

---

### 5. Entity-Specific Visibility Hooks
**Location:** `src/hooks/`

| Hook | File | Purpose |
|------|------|---------|
| `useChallengesWithVisibility` | `useChallengesWithVisibility.js` | Fetch challenges user can see |
| `usePilotsWithVisibility` | `usePilotsWithVisibility.js` | Fetch pilots user can see |
| `useProgramsWithVisibility` | `useProgramsWithVisibility.js` | Fetch programs user can see |
| `useSolutionsWithVisibility` | `useSolutionsWithVisibility.js` | Fetch solutions user can see |
| `useLivingLabsWithVisibility` | `useLivingLabsWithVisibility.js` | Fetch living labs user can see |
| `useContractsWithVisibility` | `useContractsWithVisibility.js` | Fetch contracts user can see |
| `useRDProjectsWithVisibility` | `useRDProjectsWithVisibility.js` | Fetch R&D projects user can see |
| `useKnowledgeWithVisibility` | `useKnowledgeWithVisibility.js` | Fetch knowledge items user can see |
| `useCaseStudiesWithVisibility` | `useCaseStudiesWithVisibility.js` | Fetch case studies user can see |
| `useBudgetsWithVisibility` | `useBudgetsWithVisibility.js` | Fetch budgets user can see |
| `useProposalsWithVisibility` | `useProposalsWithVisibility.js` | Fetch proposals user can see |
| `useUsersWithVisibility` | `useUsersWithVisibility.js` | Fetch users in visibility scope |
| `useMunicipalitiesWithVisibility` | `useMunicipalitiesWithVisibility.js` | Fetch municipalities user can see |
| `useOrganizationsWithVisibility` | `useOrganizationsWithVisibility.js` | Fetch organizations user can see |

---

## Frontend Components

### 1. `PermissionGate` - PERMISSION WRAPPER
**File:** `src/components/permissions/PermissionGate.jsx`

```jsx
export default function PermissionGate({ 
  children, 
  permission,           // Single permission to check
  permissions = [],     // Multiple permissions
  anyPermission = false,// OR logic vs AND logic
  role,                 // Single role to check
  roles = [],           // Multiple roles
  requireAdmin = false, // Require admin access
  fallback = null,      // What to show if no access
  showMessage = true    // Show "access denied" message
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, user } = usePermissions();
  // ... permission checking logic
}
```

**Used By:** 30+ components for conditional rendering

---

### 2. `ProtectedPage` - ROUTE PROTECTION
**File:** `src/components/auth/ProtectedPage.jsx`

```jsx
export function ProtectedPage({ 
  children,
  requireAuth = false,      // Require authentication
  requiredPermissions = [], // Permissions needed
  requiredRoles = [],       // Roles needed (⚠️ checks user.assigned_roles)
  fallback                  // Redirect/fallback
}) {
  const { user, loading } = useAuth();
  const { hasAllPermissions } = usePermissions();
  
  // ⚠️ BUG: Checks user.assigned_roles instead of user_roles table
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => user?.assigned_roles?.includes(role));
}
```

**Used By:** `App.tsx` route definitions

---

### 3. `ProtectedAction` - ACTION PROTECTION
**File:** `src/components/access/ProtectedAction.jsx`

```jsx
export function ProtectedAction({
  children,
  permission,
  permissions = [],
  anyPermission = false,
  fallback = null
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  // ... renders children or fallback based on permissions
}
```

**Used By:** Buttons, links, action items

---

### 4. `withEntityAccess` - HOC FOR ENTITY ACCESS
**File:** `src/components/permissions/withEntityAccess.jsx`

```jsx
export function withEntityAccess(WrappedComponent, entityType) {
  return function EntityAccessWrapper({ entityId, ...props }) {
    const { canAccess, isLoading } = useEntityAccessCheck(entityType, entityId);
    
    if (!canAccess) return <AccessDenied />;
    return <WrappedComponent {...props} />;
  };
}
```

**Used By:** Detail page wrappers

---

### 5. `RoleRequestApprovalQueue` - FIXED COMPONENT
**File:** `src/components/access/RoleRequestApprovalQueue.jsx`

```jsx
// On approval, the UI calls a backend handler that writes to user_roles (role_id)
// e.g. via useApproveRoleRequest() / rbac-manager
await approveRoleRequest({ requestId: request.id });
```

**Location:** Admin panel, Role Request Center

**Location:** Admin panel, Role Request Center

---

### 6. `RoleRequestCard` - ROLE REQUEST UI
**File:** `src/components/settings/RoleRequestCard.jsx`

```jsx
// User-facing component for requesting roles
// Correctly creates entries in role_requests table
// Displays current roles from user_roles table (after recent fix)
```

**Location:** User settings page

---

## Pages & Routes

### Route Protection Mapping

| Route | Page Component | Protection | Permissions/Roles |
|-------|----------------|------------|-------------------|
| `/` | `Index.jsx` | None | Public |
| `/login` | `LoginPage.jsx` | None | Public |
| `/challenges` | `ChallengesPage.jsx` | Auth | None |
| `/challenges/:id` | `ChallengeDetailPage.jsx` | Auth | Entity visibility |
| `/admin/*` | Various | Auth + Admin | `requireAdmin: true` |
| `/rbac` | `RBACDashboard.jsx` | Auth + Admin | Admin only |
| `/role-request-center` | `RoleRequestCenter.jsx` | Auth | All users (queue admin-only) |
| `/user-management-hub` | `UserManagementHub.jsx` | Auth | Admin features gated |
| `/settings` | `Settings.jsx` | Auth | User's own data |

### Admin-Only Pages
- `/admin/dashboard`
- `/admin/users`
- `/admin/roles`
- `/admin/permissions`
- `/rbac`
- `/security-dashboard`

### Pages Using Visibility System
- All list pages (Challenges, Pilots, Programs, etc.)
- Dashboard widgets
- Reports and analytics

---

## Data Flow Diagrams

### Permission Check Flow

```
User Action (e.g., click "Create Challenge")
              │
              ▼
┌─────────────────────────────┐
│  PermissionGate Component   │
│  permission="challenge_create"
└─────────────────────────────┘
              │
              ▼
┌─────────────────────────────┐
│   usePermissions Hook       │
│   hasPermission(code)       │
└─────────────────────────────┘
              │
              ▼
┌─────────────────────────────┐
│  supabase.rpc(              │
│    'get_user_permissions',  │
│    { p_user_id: user.id }   │
│  )                          │
└─────────────────────────────┘
              │
              ▼
┌─────────────────────────────┐
│  get_user_permissions()     │
│  DB Function                │
│                             │
│  1. Check is_admin()        │
│  2. Join user_roles →       │
│     roles → role_permissions│
│     → permissions           │
│  3. Return permission codes │
└─────────────────────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Returns: ['challenge_create',
│   'challenge_view', ...]    │
└─────────────────────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Component renders or hides │
│  based on permission match  │
└─────────────────────────────┘
```

### Role Request & Approval Flow (CURRENT - BROKEN)

```
User Requests Role
       │
       ▼
┌──────────────────┐
│ RoleRequestCard  │
│ creates entry in │
│ role_requests    │
│ status='pending' │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Admin sees in    │
│ RoleRequest      │
│ ApprovalQueue    │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Admin clicks     │
│ "Approve"        │
└──────────────────┘
       │
       ├──────────────────────────────────────┐
       ▼                                      ▼
┌──────────────────┐              ┌──────────────────┐
│ Updates          │              │ ⚠️ WRITES TO     │
│ role_requests    │              │ user_functional_ │
│ status='approved'│              │ roles (WRONG!)   │
└──────────────────┘              └──────────────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ Permission system│
                                  │ NEVER sees this  │
                                  │ because it reads │
                                  │ from user_roles  │
                                  └──────────────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ User has NO      │
                                  │ actual access!   │
                                  └──────────────────┘
```

### Visibility Scope Flow

```
User loads Challenges List
           │
           ▼
┌─────────────────────────────┐
│ useChallengesWithVisibility │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   useVisibilitySystem       │
│   Gets visibility scope     │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   supabase.rpc(             │
│     'get_user_visibility_   │
│     scope', { user_id }     │
│   )                         │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   Returns:                  │
│   {                         │
│     level: 'municipality',  │
│     municipality_ids: [...],│
│     organization_ids: [...]│
│   }                         │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   Fetches challenges        │
│   filtered by:              │
│   - Admin: all              │
│   - National: all           │
│   - Municipality: filtered  │
│   - Public: is_published    │
└─────────────────────────────┘
```

---

## Current Issues & Bugs

### 🔴 CRITICAL: Role Approval Writes to Wrong Table

**Location:** `src/components/access/RoleRequestApprovalQueue.jsx`

**Problem:** When admin approves a role request, it writes to `user_functional_roles` instead of `user_roles`. The permission system (`is_admin()`, `get_user_permissions()`, RLS policies) all read from `user_roles`, so approved roles grant NO actual access.

**Impact:** Users who get their roles "approved" cannot actually do anything with those roles.

**Fix Required:** Change approval logic to write to `user_roles` table.

---

### 🟠 HIGH: Inconsistent Role Checking in ProtectedPage

**Location:** `src/components/auth/ProtectedPage.jsx`

**Problem:** Checks `user?.assigned_roles` (from user profile) instead of querying `user_roles` table.

**Impact:** Role-based route protection may not work correctly.

**Fix Required:** Query `user_roles` table for role checks.

---

### 🟡 MEDIUM: Two Disconnected Role Systems

**Problem:** Two tables exist for roles:
- `user_roles` - Used by permission system
- `user_functional_roles` - Written to by approval queue, unused

**Impact:** Confusion, maintenance burden, broken features.

**Fix Required:** Decide on single system and migrate.

---

### 🟡 MEDIUM: Empty Permission Data

**Problem:** `role_permissions` table may be empty or incomplete.

**Impact:** Non-admin users may have no permissions even with roles.

**Fix Required:** Seed `role_permissions` with proper mappings.

---

## File Reference Index

### Database

| Category | Location |
|----------|----------|
| Tables | Backend: `user_roles`, `roles`, `permissions`, `role_permissions`, `role_requests`, `delegation_rules`, `user_profiles` |
| Functions | Backend: `is_admin()`, `get_user_permissions()`, `get_user_visibility_scope()`, `can_view_entity()`, `get_user_functional_roles()` |
| RLS Policies | Policies use admin/permission helper functions (no enum / no legacy tables) |

### Frontend - Hooks

| File | Purpose |
|------|---------|
| `src/components/permissions/usePermissions.js` | Primary permission hook |
| `src/hooks/visibility/useVisibilitySystem.js` | Visibility scope hook |
| `src/hooks/visibility/index.js` | Visibility exports |
| `src/hooks/useUserRoles.js` | Fetch user roles |
| `src/hooks/useEntityAccessCheck.js` | Entity access check |
| `src/hooks/useChallengesWithVisibility.js` | Challenges visibility |
| `src/hooks/usePilotsWithVisibility.js` | Pilots visibility |
| `src/hooks/useProgramsWithVisibility.js` | Programs visibility |
| `src/hooks/useSolutionsWithVisibility.js` | Solutions visibility |
| `src/hooks/useLivingLabsWithVisibility.js` | Living labs visibility |
| `src/hooks/useContractsWithVisibility.js` | Contracts visibility |
| `src/hooks/useRDProjectsWithVisibility.js` | R&D visibility |
| `src/hooks/useKnowledgeWithVisibility.js` | Knowledge visibility |
| `src/hooks/useCaseStudiesWithVisibility.js` | Case studies visibility |
| `src/hooks/useBudgetsWithVisibility.js` | Budgets visibility |
| `src/hooks/useProposalsWithVisibility.js` | Proposals visibility |
| `src/hooks/useUsersWithVisibility.js` | Users visibility |
| `src/hooks/useMunicipalitiesWithVisibility.js` | Municipalities visibility |
| `src/hooks/useOrganizationsWithVisibility.js` | Organizations visibility |
| `src/hooks/useVisibilityAwareSearch.js` | Search with visibility |

### Frontend - Components

| File | Purpose |
|------|---------|
| `src/components/permissions/PermissionGate.jsx` | Permission wrapper |
| `src/components/permissions/index.js` | Permission exports |
| `src/components/permissions/withEntityAccess.jsx` | Entity access HOC |
| `src/components/auth/ProtectedPage.jsx` | Route protection |
| `src/components/access/ProtectedAction.jsx` | Action protection |
| `src/components/access/RoleRequestApprovalQueue.jsx` | ⚠️ BUGGY - Admin approval queue |
| `src/components/settings/RoleRequestCard.jsx` | User role request UI |
| `src/components/rbac/FunctionalRolesManager.jsx` | Functional roles UI |

### Frontend - Pages

| File | Purpose |
|------|---------|
| `src/pages/RoleRequestCenter.jsx` | Role request center |
| `src/pages/RBACDashboard.jsx` | RBAC management |
| `src/pages/UserManagementHub.jsx` | User management |
| `src/pages/Settings.jsx` | User settings (includes role card) |
| `src/pages/admin/*.jsx` | Admin pages |

---

## Summary

### What Works ✅
- `is_admin()` function correctly checks `user_roles` table
- RLS policies correctly use `is_admin(auth.uid())`
- `usePermissions` hook correctly calls `get_user_permissions()`
- `useVisibilitySystem` hook correctly scopes data
- `PermissionGate` component correctly uses permissions
- Admin user (qahtani1979@gmail.com) has full access

### What's Broken ❌
1. **Role approval queue writes to wrong table** - Critical bug
2. **ProtectedPage checks wrong source for roles** - Route protection issue
3. **Two parallel role systems exist** - Architectural issue
4. **Functional roles table unused by permission system** - Dead code

### Recommended Actions
1. Fix `RoleRequestApprovalQueue.jsx` to write to `user_roles`
2. Fix `ProtectedPage.jsx` to query `user_roles` table
3. Decide whether to keep or remove `user_functional_roles`
4. Seed `role_permissions` table with proper mappings
5. Add proper role management UI for admins

---

*Document generated for system analysis. Review and update as changes are made.*
