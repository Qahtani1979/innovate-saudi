# RBAC (Role-Based Access Control) System Documentation

## Overview

This document describes the Role-Based Access Control system implemented in the application, including architecture, database schema, performance considerations, and optimization strategies.

---

## System Architecture (Phase 4 - Current)

### Core Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RBAC System Overview                          │
│                    (Phase 4 Complete - role_id Based)                   │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│    Users     │────▶│     user_roles       │────▶│       roles          │
│  (auth.users)│     │ (role_id FK to roles)│     │   (role definitions) │
└──────────────┘     └──────────────────────┘     └──────────────────────┘
                                                            │
                                                            ▼
                     ┌──────────────────────┐     ┌──────────────────────┐
                     │   role_permissions   │◀────│     permissions      │
                     │   (junction table)   │     │   (permission codes) │
                     └──────────────────────┘     └──────────────────────┘
                                                            │
                                                            ▼
                     ┌──────────────────────┐     ┌──────────────────────┐
                     │  delegation_rules    │────▶│  Temporary Access    │
                     │  (time-bound access) │     │  (delegated perms)   │
                     └──────────────────────┘     └──────────────────────┘
```

### Key Architecture Points (Phase 4)
- **Single role path**: `user_roles.role_id` → `roles` → `role_permissions` → `permissions`
- **No enums**: `app_role` enum REMOVED, roles stored in `roles` table with string `name`
- **`user_functional_roles` table**: DROPPED (legacy, no longer used)
- All functions, RLS policies, and edge functions use `role_id` joins exclusively

---

## Database Schema

### 1. Core Tables

#### `roles`
Defines all roles (both app-level and functional roles).

```sql
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `user_roles`
Links users to roles via `role_id` foreign key.

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  municipality_id UUID REFERENCES public.municipalities(id),
  organization_id UUID REFERENCES public.organizations(id),
  assigned_by TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);
```

#### `permissions`
Defines granular permission codes.

```sql
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Junction Tables

#### `role_permissions`
Links roles to permissions.

```sql
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role_id, permission_id)
);
```

### 3. Delegation Table

#### `delegation_rules`
Enables temporary permission delegation between users.

```sql
CREATE TABLE public.delegation_rules (
  id UUID PRIMARY KEY,
  delegator_email TEXT NOT NULL,
  delegate_email TEXT NOT NULL,
  permission_types TEXT[],
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  reason TEXT,
  approved_by TEXT,
  approval_date TIMESTAMPTZ
);
```

---

## Security Definer Functions

### `is_admin(user_email TEXT)`
Checks if a user is an admin via role_id join.

```sql
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    JOIN public.user_profiles up ON ur.user_id = up.user_id
    WHERE up.user_email = $1
    AND r.name = 'admin'
    AND ur.is_active = true
  )
$$;
```

### `get_user_permissions(_user_id UUID)`
Returns all permission codes for a user (including delegated permissions).

```sql
-- Returns: TEXT[] (e.g., ['challenges_read', 'challenges_create', 'budgets_view'])
-- Admin users return: ['*'] (wildcard for all permissions)

SELECT get_user_permissions('user-uuid-here');
```

### `get_user_functional_roles(_user_id UUID)`
Returns all active roles for a user via role_id join.

```sql
-- Returns: TABLE(role_id UUID, role_name TEXT, role_description TEXT)

SELECT * FROM get_user_functional_roles('user-uuid-here');
```

### `has_permission(_user_id UUID, _permission_code TEXT)`
Checks if a user has a specific permission.

```sql
-- Returns: BOOLEAN

SELECT has_permission('user-uuid-here', 'challenges_create');
```

---

## Frontend Implementation

### `usePermissions` Hook

Located at: `src/components/permissions/usePermissions.jsx`

```jsx
import { usePermissions } from '@/components/permissions/usePermissions';

function MyComponent() {
  const {
    user,              // Current user with profile
    userId,            // User UUID
    userEmail,         // User email
    roles,             // Role names array
    functionalRoles,   // Roles with full details
    permissions,       // Permission codes array
    hasPermission,     // (permission) => boolean
    hasAnyPermission,  // ([permissions]) => boolean
    hasAllPermissions, // ([permissions]) => boolean
    canAccessEntity,   // (entityType, action) => boolean
    hasRole,           // (roleName) => boolean
    hasFunctionalRole, // (roleName) => boolean
    isAdmin            // boolean
  } = usePermissions();

  if (hasPermission('challenges_create')) {
    // Show create button
  }
}
```

### Permission Components

#### `PermissionGate`
Conditionally renders children based on permissions.

```jsx
<PermissionGate permission="challenges_create">
  <CreateChallengeButton />
</PermissionGate>

<PermissionGate permissions={['budgets_view', 'budgets_edit']} anyPermission>
  <BudgetSection />
</PermissionGate>
```

#### `ProtectedPage` HOC
Wraps entire pages with permission requirements.

```jsx
export default ProtectedPage(AdminDashboard, {
  requiredRoles: ['admin'],
  requireAdmin: true,
  fallback: <AccessDenied />
});
```

---

## Permission Resolution Flow

```
User Request → usePermissions Hook
                    │
                    ▼
        ┌───────────────────────┐
        │  supabase.rpc()       │
        │  get_user_permissions │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Server-Side Logic    │
        │  (SECURITY DEFINER)   │
        └───────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│ Check Admin   │       │ Check Roles   │
│ (wildcard *)  │       │ via role_id   │
└───────────────┘       └───────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
        ┌───────────────────────┐
        │  Return Permission[]  │
        │  (cached by React Q)  │
        └───────────────────────┘
```

---

## Performance Analysis

### Current Implementation

| Operation | Complexity | Queries | Notes |
|-----------|------------|---------|-------|
| Get permissions | O(n) | 1 RPC call | Server-side joins via role_id |
| Get roles | O(n) | 1 RPC call | Server-side processing |
| Check permission | O(1) | 0 (cached) | Client-side array check |

### Optimized Single Query Function

```sql
CREATE OR REPLACE FUNCTION get_user_access_data(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
  is_admin_user BOOLEAN;
BEGIN
  -- Check admin status via role_id join
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = _user_id 
    AND r.name = 'admin'
    AND ur.is_active = true
  ) INTO is_admin_user;
  
  -- Build complete access data in single query
  SELECT jsonb_build_object(
    'is_admin', is_admin_user,
    'roles', COALESCE((
      SELECT jsonb_agg(r.name) 
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = _user_id AND ur.is_active = true
    ), '[]'::jsonb),
    'permissions', CASE 
      WHEN is_admin_user THEN '["*"]'::jsonb
      ELSE COALESCE((
        SELECT jsonb_agg(DISTINCT p.code)
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = _user_id 
          AND ur.is_active = true
          AND (ur.expires_at IS NULL OR ur.expires_at > now())
      ), '[]'::jsonb)
    END,
    'functional_roles', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', r.id,
        'name', r.name,
        'description', r.description
      ))
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = _user_id 
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    ), '[]'::jsonb)
  ) INTO result;
  
  RETURN result;
END;
$$;
```

---

## Security Considerations

1. **All permission functions use SECURITY DEFINER** - runs with owner privileges
2. **RLS policies on junction tables** - users can only see their own assignments
3. **Delegation requires approval** - `is_active = true` and `approved_by` checks
4. **Time-bound access** - `expires_at` and delegation date ranges
5. **Audit logging** - Track permission changes in `access_logs`

---

## Migration History

### Phase 4 (COMPLETE - December 2024)
- Added `role_id` column to `user_roles` table
- Backfilled all existing records with correct `role_id` values
- Made `role_id` NOT NULL
- Removed `permissions` column from `roles` table
- Dropped `app_role` enum type
- Dropped `user_functional_roles` table
- Updated all database functions to use role_id joins
- Updated all RLS policies to use role_id joins
- Updated all edge functions to use role_id joins
- Removed all frontend fallbacks for old schema

### Architecture Cleanup
- Single source of truth: `roles` table
- Single assignment path: `user_roles.role_id` → `roles`
- No duplicate role definitions
- No enum types for roles

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| [Profile System](shared/PROFILE_SYSTEM.md) | User profiles and profile-role integration |
| [Visibility System](VISIBILITY_SYSTEM.md) | Entity visibility rules based on roles |
| [Role Permission Visibility System](ROLE_PERMISSION_VISIBILITY_SYSTEM.md) | Comprehensive RBAC + visibility documentation |
| [Shared System Inventory](shared/shared-system-inventory.md) | Platform-wide features including profiles |
