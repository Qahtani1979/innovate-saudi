# Pilots Permissions Matrix

## Overview

This document defines the Role-Based Access Control (RBAC) permissions for the Pilots system.

## Permission Codes

| Permission | Description |
|------------|-------------|
| `pilots.view` | View pilot listings and details |
| `pilots.create` | Create new pilots |
| `pilots.update` | Update existing pilots |
| `pilots.delete` | Soft delete pilots |
| `pilots.approve` | Approve pilot stage transitions |
| `pilots.archive` | Archive completed pilots |
| `pilots.export` | Export pilot data |
| `pilots.manage_all` | Full admin access to all pilots |

## Role-Permission Matrix

| Permission | Admin | Staff | Pilot Manager | Reviewer | Public |
|------------|-------|-------|---------------|----------|--------|
| `pilots.view` | ✓ | ✓ | ✓ | ✓ | Published only |
| `pilots.create` | ✓ | ✓ | ✓ | - | - |
| `pilots.update` | ✓ | Own | ✓ | - | - |
| `pilots.delete` | ✓ | - | Own | - | - |
| `pilots.approve` | ✓ | - | - | ✓ | - |
| `pilots.archive` | ✓ | - | ✓ | - | - |
| `pilots.export` | ✓ | ✓ | ✓ | - | - |
| `pilots.manage_all` | ✓ | - | - | - | - |

## Data Visibility Rules

### Admin
- Can view all pilots across all municipalities
- Can modify any pilot regardless of ownership
- Can view PII (emails, phone numbers)

### Staff (Municipality)
- Can view pilots in their municipality
- Can create pilots in their municipality
- Can update pilots they created
- Cannot view PII of other users

### Pilot Manager
- Can view all pilots in assigned sectors
- Can create and update pilots
- Can archive completed pilots
- Can view team member details

### Reviewer
- Can view pilots assigned for review
- Can approve/reject stage transitions
- Cannot modify pilot content
- Can view limited PII for review purposes

### Public (Unauthenticated)
- Can view published pilots only
- Cannot view PII (sees masked emails)
- Cannot perform any modifications

## RLS Policy Implementation

```sql
-- Select policy with role-based visibility
CREATE POLICY "pilots_select_policy" ON pilots FOR SELECT
USING (
  is_deleted = false AND (
    -- Public can see published
    (is_published = true) OR
    -- Authenticated users based on role
    (auth.uid() IS NOT NULL AND (
      -- Admin sees all
      has_role_by_name(auth.uid(), 'admin') OR
      -- Staff sees own municipality
      (has_role_by_name(auth.uid(), 'staff') AND 
       municipality_id IN (SELECT municipality_id FROM user_profiles WHERE user_id = auth.uid())) OR
      -- Owner sees own
      created_by = auth.jwt()->>'email'
    ))
  )
);
```

## UI Permission Checks

### Using usePermissions Hook

```jsx
import { usePermissions } from '@/hooks/usePermissions';

const PilotActions = ({ pilot }) => {
  const { hasPermission, userRole } = usePermissions();

  return (
    <div>
      {hasPermission('pilots.update') && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
      {hasPermission('pilots.delete') && (
        <Button onClick={handleDelete}>Delete</Button>
      )}
      {hasPermission('pilots.approve') && (
        <Button onClick={handleApprove}>Approve</Button>
      )}
    </div>
  );
};
```

### Protected Routes

```jsx
<ProtectedPage
  requiredPermissions={['pilots.view']}
  requiredRoles={['admin', 'staff', 'pilot_manager']}
>
  <PilotsManagement />
</ProtectedPage>
```

## Audit Requirements

All permission checks are logged:

| Action | Log Entry |
|--------|-----------|
| View | entity_type: pilot, action: view |
| Create | entity_type: pilot, action: create |
| Update | entity_type: pilot, action: update |
| Delete | entity_type: pilot, action: delete |
| Approve | entity_type: pilot, action: approve |
| Export | entity_type: pilot, action: export |

## Security Considerations

1. **Server-Side Validation**: All permission checks are enforced via RLS policies
2. **Client-Side Hiding**: UI elements are hidden but not security-critical
3. **PII Protection**: Sensitive data is masked in public views
4. **Audit Trail**: All actions are logged with user context
5. **Rate Limiting**: Export and bulk operations are rate-limited
