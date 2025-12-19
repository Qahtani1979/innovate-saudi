# Solutions Permissions Matrix

## Overview

Role-Based Access Control (RBAC) permissions for the Solutions system.

## Permission Codes

| Permission | Description |
|------------|-------------|
| `solutions.view` | View solution listings and details |
| `solutions.create` | Create new solutions |
| `solutions.update` | Update existing solutions |
| `solutions.delete` | Soft delete solutions |
| `solutions.approve` | Approve/reject solutions |
| `solutions.publish` | Publish/unpublish solutions |
| `solutions.export` | Export solution data |
| `solutions.manage_all` | Full admin access |

## Role-Permission Matrix

| Permission | Admin | Provider | Staff | Reviewer | Public |
|------------|-------|----------|-------|----------|--------|
| `solutions.view` | ✓ | ✓ | ✓ | ✓ | Published only |
| `solutions.create` | ✓ | ✓ | ✓ | - | - |
| `solutions.update` | ✓ | Own | Own | - | - |
| `solutions.delete` | ✓ | Own | - | - | - |
| `solutions.approve` | ✓ | - | - | ✓ | - |
| `solutions.publish` | ✓ | - | ✓ | - | - |
| `solutions.export` | ✓ | Own | ✓ | - | - |
| `solutions.manage_all` | ✓ | - | - | - | - |

## Data Visibility Rules

### Admin
- Can view all solutions across all providers
- Can modify any solution regardless of ownership
- Can view PII (emails, contact info)
- Full access to version history

### Provider
- Can view own solutions and published solutions
- Can create and update own solutions
- Can delete own draft solutions
- Cannot view other providers' unpublished solutions

### Staff (Municipality/Deputyship)
- Can view solutions in their sector/municipality
- Can create solutions on behalf of providers
- Can update solutions assigned to them
- Can publish approved solutions

### Reviewer
- Can view solutions assigned for review
- Can approve/reject solutions
- Cannot modify solution content
- Can view limited PII for review purposes

### Public (Unauthenticated)
- Can view published solutions only
- Cannot view PII (sees masked data)
- Cannot perform any modifications

## RLS Policy Implementation

```sql
-- Admin full access
CREATE POLICY "Admins can manage all solutions" ON solutions FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Public read for published
CREATE POLICY "Anyone can view published solutions" ON solutions FOR SELECT
USING (is_published = true AND is_deleted = false);

-- Provider access to own solutions
CREATE POLICY "Providers can manage own solutions" ON solutions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND lower(r.name) = 'provider'
      AND ur.organization_id = solutions.provider_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND lower(r.name) = 'provider'
      AND ur.organization_id = solutions.provider_id
  )
);
```

## UI Permission Checks

### Using usePermissions Hook

```jsx
import { usePermissions } from '@/hooks/usePermissions';

const SolutionActions = ({ solution }) => {
  const { hasPermission, userRole } = usePermissions();

  return (
    <div>
      {hasPermission('solutions.update') && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
      {hasPermission('solutions.delete') && (
        <Button onClick={handleDelete}>Delete</Button>
      )}
      {hasPermission('solutions.approve') && (
        <Button onClick={handleApprove}>Approve</Button>
      )}
    </div>
  );
};
```

### Protected Routes

```jsx
<ProtectedPage
  requiredPermissions={['solutions.create']}
  requiredRoles={['admin', 'provider', 'municipality_staff', 'deputyship_staff', 'solution_provider']}
>
  <SolutionCreate />
</ProtectedPage>
```

## Audit Requirements

All permission checks are logged:

| Action | Log Entry |
|--------|-----------|
| View | entity_type: solution, action: view |
| Create | entity_type: solution, action: create |
| Update | entity_type: solution, action: update |
| Delete | entity_type: solution, action: delete |
| Approve | entity_type: solution, action: approve |
| Publish | entity_type: solution, action: publish |
| Export | entity_type: solution, action: export |

## Security Considerations

1. **Server-Side Validation**: All permission checks are enforced via RLS policies
2. **Client-Side Hiding**: UI elements are hidden but not security-critical
3. **PII Protection**: Sensitive data is masked in public views
4. **Audit Trail**: All actions are logged with user context
5. **Rate Limiting**: Export and bulk operations are rate-limited
6. **Provider Verification**: Provider role requires organization_id match
