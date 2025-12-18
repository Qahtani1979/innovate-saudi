# Edge Function Consolidation Plan - Deep Analysis v2.1

**Created:** December 18, 2024  
**Updated:** December 18, 2024 (Final Verification)  
**Status:** ✅ **PHASE 5 READY** - All Consumers Migrated, Old Functions Ready for Deletion  
**Objective:** Merge all RBAC-related edge functions into a unified `rbac-manager` function

## ✅ IMPLEMENTATION COMPLETE

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Create rbac-manager | ✅ **DONE** | `supabase/functions/rbac-manager/index.ts` (703 lines) |
| Phase 2: Frontend Service | ✅ **DONE** | `src/services/rbac/rbacService.ts` (232 lines), `src/hooks/useRBACManager.js` (203 lines) |
| Phase 3: Update Consumers | ✅ **DONE** | All 7 consumers migrated (see below) |
| Phase 4: Verification | ✅ **DONE** | All code paths verified, validation guards added, deployed |
| Phase 5: Delete Old Functions | 🟡 **READY** | Old functions can be safely deleted |

## Migration Summary (2024-12-18 - FINAL)

### Files Migrated to Unified rbac-manager:

| File | Old Edge Function | Status |
|------|-------------------|--------|
| `src/components/access/RoleRequestApprovalQueue.jsx` | direct DB → `rbac-manager` | ✅ **Fixed critical bug** |
| `src/hooks/useAutoRoleAssignment.js` | `auto-role-assignment`, `role-request-notification` | ✅ Migrated |
| `src/components/onboarding/MunicipalityStaffOnboardingWizard.jsx` | `auto-role-assignment`, `role-request-notification` | ✅ Migrated |
| `src/components/onboarding/OnboardingWizard.jsx` | `role-request-notification` | ✅ Migrated |
| `src/api/base44Client.js` | mappings updated | ✅ Updated |
| `src/components/rbac/DelegationApprovalQueue.jsx` | `approve-delegation` | ✅ **Migrated** |
| `src/components/access/BackendPermissionValidator.jsx` | `validate-permission` | ✅ **Migrated** |

### Critical Bug Fix Verified ✅
- **Before:** `RoleRequestApprovalQueue.jsx` wrote to `user_functional_roles` → users had NO ACCESS
- **After:** Writes to `user_roles` via `rbac-manager` edge function → users get ACTUAL ACCESS

### Validation Guards Added ✅
- `handleRoleAssign`: Validates `user_id` and `role` are present
- `handleApproveRoleRequest`: Validates `request_id`, `user_id`, `user_email`, and `role` are present

---

## Executive Summary

This document provides a comprehensive analysis of RBAC-related edge functions, their current usage, critical bugs discovered, and a detailed implementation plan for consolidation.

### Critical Bug Found
🚨 **RoleRequestApprovalQueue.jsx writes approved roles to `user_functional_roles` instead of `user_roles`, causing approved users to have NO ACCESS.**

---

## Part 1: Current State Analysis

### 1.1 Edge Functions Inventory

| Function Name | Lines | Purpose | Status |
|---------------|-------|---------|--------|
| `auto-role-assignment` | 216 | Assign/revoke roles, check auto-approval rules | **Active** |
| `role-request-notification` | 341 | Send email notifications for role request lifecycle | **Active** |
| `validate-permission` | 124 | Validate user permissions with delegation support | **Active** |
| `approve-delegation` | 79 | Approve/reject delegation requests | **Active** |
| `run-rbac-security-audit` | 147 | Run security audits on RBAC configuration | **Active** |
| `budget-approval` | 121 | Approve pilot budgets (partial RBAC overlap) | **Keep Separate** |

### 1.2 Detailed Function Analysis

---

#### 1.2.1 `auto-role-assignment` (supabase/functions/auto-role-assignment/index.ts)

**Actions Supported:**
```typescript
switch (action) {
  case 'assign':             // Direct role assignment to user_roles table
  case 'revoke':             // Revoke role (set is_active = false)  
  case 'check_auto_approve': // Check auto-approval rules
  case 'auto_assign':        // Legacy: Auto-assign based on org membership
  default:                   // Get user roles
}
```

**Database Tables Used:**
- `user_roles` - ✅ Writes to correct table
- `auto_approval_rules` - Read for auto-approval logic
- `municipalities` - Read approved_email_domains
- `organization_members` - Legacy auto-assign

**Frontend Consumers:**
| File | Location | Usage |
|------|----------|-------|
| `src/hooks/useAutoRoleAssignment.js` | Lines 35, 127 | `checkAndAssignRole()`, `assignRole()` |
| `src/components/onboarding/MunicipalityStaffOnboardingWizard.jsx` | Line 273 | check_auto_approve |
| `src/api/base44Client.js` | Line 271 | autoRoleAssignment mapping |

---

#### 1.2.2 `role-request-notification` (supabase/functions/role-request-notification/index.ts)

**Notification Types:**
```typescript
type: 'submitted' | 'approved' | 'rejected'
```

**Features:**
- Sends bilingual email templates (EN/AR)
- Creates in-app notifications via `citizen_notifications` table
- Notifies admins when `notify_admins = true`
- Uses Resend API for email delivery

**External Dependencies:**
- `RESEND_API_KEY` secret required

**Frontend Consumers:**
| File | Location | Usage |
|------|----------|-------|
| `src/hooks/useAutoRoleAssignment.js` | Line 90 | Submit notification |
| `src/components/onboarding/MunicipalityStaffOnboardingWizard.jsx` | Lines 305, 332 | Notifications |
| `src/components/onboarding/OnboardingWizard.jsx` | Line 66 | Submit notification |

---

#### 1.2.3 `validate-permission` (supabase/functions/validate-permission/index.ts)

**Validation Logic:**
1. Check if user has admin role → Allow all
2. Check active delegations matching permission
3. Fall back to role-based permission map

**Database Tables Used:**
- `user_roles` - Read roles
- `delegation_rules` - Check active delegations

**Frontend Consumers:**
| File | Location | Usage |
|------|----------|-------|
| `src/api/base44Client.js` | Line 249 | validatePermission mapping |

---

#### 1.2.4 `approve-delegation` (supabase/functions/approve-delegation/index.ts)

**Purpose:** Approve or reject delegation requests

**Database Operations:**
- Updates `delegation_rules.approval_status`
- Sets `is_active = true` on approval

**Frontend Consumers:**
| File | Location | Usage |
|------|----------|-------|
| `src/api/base44Client.js` | Line 248 | approveDelegation mapping |

---

#### 1.2.5 `run-rbac-security-audit` (supabase/functions/run-rbac-security-audit/index.ts)

**Audit Checks:**
1. Excessive admins (>5 per org)
2. Inactive users with active roles (30+ days)
3. Orphaned permissions (null user_id)
4. Sensitive data access patterns

**Frontend Consumers:**
| File | Location | Usage |
|------|----------|-------|
| `src/api/base44Client.js` | Line 277 | runRBACSecurityAudit mapping |

---

#### 1.2.6 `budget-approval` (supabase/functions/budget-approval/index.ts)

**Purpose:** Pilot budget approval (domain-specific, not core RBAC)

**Recommendation:** Keep separate - not merging

---

## Part 2: Critical Bugs Discovered

### 🚨 BUG #1: RoleRequestApprovalQueue Writes to Wrong Table (CRITICAL)

**Location:** `src/components/access/RoleRequestApprovalQueue.jsx` (Lines 84-94)

**Current Code (BROKEN):**
```javascript
// Line 85-86
const { error: roleError } = await supabase
  .from('user_functional_roles')  // ❌ WRONG TABLE
  .upsert({
    user_id: targetUser.user_id,
    role_id: role.id,           // Uses role ID
    assigned_by: user?.id,
    assigned_at: new Date().toISOString(),
    is_active: true
  }, {
    onConflict: 'user_id,role_id'
  });
```

**Impact:**
- ❌ Approved role requests do NOT grant actual access
- ❌ `is_admin()` database function reads from `user_roles`, returns FALSE
- ❌ All RLS policies check `user_roles` table
- ❌ `get_user_permissions()` reads from `user_roles`
- ❌ User appears "approved" but has NO ACCESS

**Correct Fix:**
```javascript
// Should write to user_roles table
const { error: roleError } = await supabase
  .from('user_roles')  // ✅ CORRECT TABLE
  .upsert({
    user_id: targetUser.user_id,
    user_email: userEmail,
    role: role.name,    // Note: user_roles uses role NAME, not ID
    is_active: true,
    assigned_at: new Date().toISOString()
  }, {
    onConflict: 'user_id,role'
  });
```

---

### 🚨 BUG #2: Dual Table System Creates Confusion

**Problem:** Two separate tables for roles with no synchronization:

| Table | Used By | Writes From |
|-------|---------|-------------|
| `user_roles` | DB functions, RLS, edge functions | `auto-role-assignment` ✅ |
| `user_functional_roles` | Almost nothing | `RoleRequestApprovalQueue` ❌ |

**Solution:** Deprecate `user_functional_roles` and consolidate to `user_roles` only.

---

## Part 3: Usage Flow Diagrams

### 3.1 Role Request Flow (Current - BROKEN)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        ROLE REQUEST FLOW (CURRENT)                       │
└──────────────────────────────────────────────────────────────────────────┘

User Onboarding                                     Admin Review
     │                                                   │
     ▼                                                   ▼
┌─────────────────┐                            ┌─────────────────┐
│ OnboardingWizard │                            │RoleRequestQueue │
└────────┬────────┘                            └────────┬────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────────────┐                   ┌─────────────────────────┐
│useAutoRoleAssignment.js │                   │ approveMutation()       │
└────────┬────────────────┘                   └────────┬────────────────┘
         │                                              │
         │ invoke('auto-role-assignment')               │
         ▼                                              │
┌─────────────────────────┐                             │
│ auto-role-assignment    │                             │
│ (Edge Function)         │                             │
│                         │                             │
│ action: check_auto_approve                            │
└────────┬────────────────┘                             │
         │                                              │
         ├── If auto-approved ──┐                       │
         │                      ▼                       │
         │        ┌─────────────────────┐               │
         │        │ Writes to user_roles│ ✅ CORRECT    │
         │        └─────────────────────┘               │
         │                                              │
         ├── If NOT auto-approved                       │
         │                                              │
         ▼                                              ▼
┌─────────────────────────┐              ┌─────────────────────────────┐
│ Creates role_requests   │──────────────▶│ Admin approves request      │
│ (status: pending)       │              │                             │
└─────────────────────────┘              │ Writes to user_functional_  │
                                         │ roles ❌ WRONG TABLE         │
                                         └─────────────────────────────┘
                                                        │
                                                        ▼
                                         ┌─────────────────────────────┐
                                         │ is_admin() checks user_roles│
                                         │ → Returns FALSE ❌           │
                                         │                             │
                                         │ User has NO ACCESS despite  │
                                         │ "approved" role request     │
                                         └─────────────────────────────┘
```

### 3.2 Auto-Approval Flow (WORKING)

```
     User Signup (Matching Domain)
                │
                ▼
     ┌─────────────────────────┐
     │ auto-role-assignment    │
     │ action: check_auto_approve│
     └────────┬────────────────┘
              │
              ▼
     ┌─────────────────────────┐
     │ Query auto_approval_rules│
     │ Check email domain match │
     └────────┬────────────────┘
              │
              ├── Match Found
              │
              ▼
     ┌─────────────────────────┐
     │ Writes to user_roles    │ ✅ CORRECT
     │ Returns auto_approved:true│
     └────────┬────────────────┘
              │
              ▼
     ┌─────────────────────────┐
     │ is_admin() / RLS        │
     │ → Returns TRUE ✅        │
     │ User has FULL ACCESS    │
     └─────────────────────────┘
```

---

## Part 4: Consolidation Plan

### 4.1 New Unified Edge Function: `rbac-manager`

**Location:** `supabase/functions/rbac-manager/index.ts`

**Action Routing:**
```typescript
interface RBACRequest {
  action: string;
  payload: Record<string, unknown>;
}

const ACTIONS = {
  // Role Management
  'role.assign':          handleRoleAssign,
  'role.revoke':          handleRoleRevoke,
  'role.check_auto':      handleCheckAutoApprove,
  'role.list':            handleListUserRoles,
  'role.approve_request': handleApproveRoleRequest,  // FIXES BUG #1
  'role.reject_request':  handleRejectRoleRequest,
  
  // Notifications
  'notify.role_submitted': handleNotifyRoleSubmitted,
  'notify.role_approved':  handleNotifyRoleApproved,
  'notify.role_rejected':  handleNotifyRoleRejected,
  
  // Permission Validation
  'permission.validate':  handleValidatePermission,
  
  // Delegation
  'delegation.approve':   handleApproveDelegation,
  'delegation.reject':    handleRejectDelegation,
  
  // Security Audit
  'audit.rbac':           handleRunRBACAudit
};
```

### 4.2 Files to Update After Creation

| File | Current | New |
|------|---------|-----|
| `src/components/access/RoleRequestApprovalQueue.jsx` | Uses inline mutation | Use rbac-manager `role.approve_request` |
| `src/hooks/useAutoRoleAssignment.js` | Calls `auto-role-assignment` | Call rbac-manager |
| `src/components/onboarding/MunicipalityStaffOnboardingWizard.jsx` | Calls old functions | Call rbac-manager |
| `src/components/onboarding/OnboardingWizard.jsx` | Calls `role-request-notification` | Call rbac-manager |
| `src/api/base44Client.js` | Multiple mappings | Single rbacManager mapping |

### 4.3 New Frontend Service Layer

```javascript
// src/services/rbac/rbacService.js

import { supabase } from '@/integrations/supabase/client';

const invokeRBAC = async (action, payload) => {
  const { data, error } = await supabase.functions.invoke('rbac-manager', {
    body: { action, payload }
  });
  if (error) throw error;
  return data;
};

export const rbacService = {
  // Role Management
  async assignRole(userId, userEmail, role, options = {}) {
    return invokeRBAC('role.assign', { user_id: userId, user_email: userEmail, role, ...options });
  },
  
  async revokeRole(userEmail, role) {
    return invokeRBAC('role.revoke', { user_email: userEmail, role });
  },
  
  async checkAutoApproval(params) {
    return invokeRBAC('role.check_auto', params);
  },
  
  async approveRoleRequest(requestId, roleName, userEmail, userId, approverEmail) {
    return invokeRBAC('role.approve_request', { 
      request_id: requestId, 
      role_name: roleName,
      user_email: userEmail,
      user_id: userId,
      approver_email: approverEmail
    });
  },
  
  async rejectRoleRequest(requestId, reason, approverEmail) {
    return invokeRBAC('role.reject_request', { 
      request_id: requestId, 
      reason, 
      approver_email: approverEmail 
    });
  },
  
  // Permission Validation
  async validatePermission(userId, permission, resource) {
    return invokeRBAC('permission.validate', { user_id: userId, permission, resource });
  },
  
  // Delegation
  async approveDelegation(delegationId) {
    return invokeRBAC('delegation.approve', { delegation_id: delegationId });
  },
  
  async rejectDelegation(delegationId, reason) {
    return invokeRBAC('delegation.reject', { delegation_id: delegationId, reason });
  },
  
  // Audit
  async runSecurityAudit(organizationId, scope) {
    return invokeRBAC('audit.rbac', { organization_id: organizationId, scope });
  }
};
```

---

## Part 5: Implementation Timeline

### Phase 1: Create rbac-manager (Day 1)
- [ ] Create `supabase/functions/rbac-manager/index.ts`
- [ ] Implement all action handlers
- [ ] **CRITICAL:** Implement `role.approve_request` to write to `user_roles`
- [ ] Update `supabase/config.toml`
- [ ] Deploy and test basic actions

### Phase 2: Create Frontend Service (Day 1-2)
- [ ] Create `src/services/rbac/rbacService.js`
- [ ] Create `src/hooks/useRBACManager.js`
- [ ] Add TypeScript types

### Phase 3: Migrate Consumers (Day 2-3)
- [ ] **PRIORITY:** Update `RoleRequestApprovalQueue.jsx` (Fixes Bug #1)
- [ ] Update `useAutoRoleAssignment.js`
- [ ] Update `MunicipalityStaffOnboardingWizard.jsx`
- [ ] Update `OnboardingWizard.jsx`
- [ ] Update `base44Client.js`

### Phase 4: Testing (Day 3-4)
- [ ] Test: Role request → Admin approval → User gets access
- [ ] Test: Auto-approval flow continues working
- [ ] Test: Delegation approval/rejection
- [ ] Test: Permission validation
- [ ] Verify `is_admin()` returns correct values

### Phase 5: Cleanup (Day 4-5)
- [ ] Remove old edge functions
- [ ] Update `supabase/config.toml`
- [ ] Update documentation

---

## Part 6: Edge Functions to Delete After Migration

```
DELETE:
├── supabase/functions/auto-role-assignment/
├── supabase/functions/role-request-notification/
├── supabase/functions/validate-permission/
├── supabase/functions/approve-delegation/
└── supabase/functions/run-rbac-security-audit/

KEEP (domain-specific):
└── supabase/functions/budget-approval/
```

---

## Part 7: Critical Fix Detail - Role Approval

### Current Code (BROKEN) - RoleRequestApprovalQueue.jsx

```javascript
// Lines 84-94
const { error: roleError } = await supabase
  .from('user_functional_roles')  // ❌ WRONG
  .upsert({
    user_id: targetUser.user_id,
    role_id: role.id,              // ❌ Uses ID
    assigned_by: user?.id,
    assigned_at: new Date().toISOString(),
    is_active: true
  }, {
    onConflict: 'user_id,role_id'
  });
```

### Fixed Code (in rbac-manager)

```javascript
// Action: role.approve_request
async function handleApproveRoleRequest(supabase, payload) {
  const { request_id, role_name, user_email, user_id, approver_email } = payload;
  
  // 1. Update request status
  await supabase
    .from('role_requests')
    .update({
      status: 'approved',
      reviewed_by: approver_email,
      reviewed_date: new Date().toISOString()
    })
    .eq('id', request_id);
  
  // 2. Write to CORRECT table (user_roles)
  const { data, error } = await supabase
    .from('user_roles')  // ✅ CORRECT TABLE
    .upsert({
      user_id: user_id,
      user_email: user_email,
      role: role_name,  // ✅ Uses role NAME, not ID
      is_active: true,
      assigned_at: new Date().toISOString()
    }, { 
      onConflict: 'user_id,role' 
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return { approved: true, role: data };
}
```

---

## Part 8: Rollback Plan

1. **Keep old functions deployed initially** (do not delete for 48 hours)
2. **Add feature flag** in frontend for new vs old:
   ```javascript
   const USE_NEW_RBAC = true; // Toggle if issues
   ```
3. **Monitor logs** for errors
4. **Quick rollback:** Change feature flag to false

---

## Appendix A: Database Function Dependencies

| DB Function | Reads From | Critical For |
|-------------|------------|--------------|
| `is_admin(email)` | `user_roles` | All RLS policies |
| `get_user_permissions(user_id)` | `user_roles`, `role_permissions` | Frontend permission checks |
| `get_user_functional_roles(user_id)` | `user_functional_roles` | ❌ Almost never used |
| `can_view_entity(entity, id)` | `user_roles` | Entity visibility |

---

## Appendix B: Table Schema

### user_roles (PRIMARY - Used by RLS/DB Functions)
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  user_email TEXT,
  role TEXT NOT NULL,  -- Role NAME (e.g., 'admin', 'municipality_staff')
  municipality_id UUID,
  organization_id UUID,
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, role)
);
```

### user_functional_roles (DEPRECATED - Do not use)
```sql
CREATE TABLE user_functional_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  role_id UUID REFERENCES roles(id),  -- Uses role ID, not name
  assigned_by UUID,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);
```

---

## Confirmation Required

Before proceeding:

- [x] Deep analysis complete
- [x] Critical bugs documented
- [x] All consumers identified
- [x] Implementation plan ready

**Ready to proceed with implementation?**

---

*Document Version: 2.0*  
*Last Updated: December 18, 2024*
  | 'role.request.reject'
  | 'permission.validate'
  | 'permission.get_user_permissions'
  | 'delegation.approve'
  | 'delegation.reject'
  | 'notification.role_request'
  | 'notification.role_approved'
  | 'notification.role_rejected'
  | 'audit.run_security_audit';

async function invokeRBAC<T = unknown>(action: RBACAction, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('rbac-manager', {
    body: { action, payload }
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error || 'RBAC operation failed');
  
  return data as T;
}

// ========== Role Operations ==========

export async function assignRole(params: {
  user_id: string;
  user_email: string;
  role: string;
  organization_id?: string;
  municipality_id?: string;
}) {
  return invokeRBAC('role.assign', params);
}

export async function revokeRole(params: {
  user_email: string;
  role: string;
}) {
  return invokeRBAC('role.revoke', params);
}

export async function checkAutoApproval(params: {
  user_email: string;
  user_id: string;
  persona_type: string;
  municipality_id?: string;
  organization_id?: string;
}) {
  return invokeRBAC('role.check_auto_approve', params);
}

export async function getUserRoles(params: {
  user_id?: string;
  user_email?: string;
}) {
  return invokeRBAC<{ roles: Array<{role: string; municipality_id?: string; organization_id?: string}> }>(
    'role.get_user_roles', 
    params
  );
}

export async function approveRoleRequest(params: {
  request_id: string;
  user_id: string;
  user_email: string;
  role: string;
  municipality_id?: string;
  organization_id?: string;
}) {
  return invokeRBAC('role.request.approve', params);
}

export async function rejectRoleRequest(params: {
  request_id: string;
  reason: string;
}) {
  return invokeRBAC('role.request.reject', params);
}

// ========== Permission Operations ==========

export async function validatePermission(params: {
  user_id: string;
  user_email?: string;
  permission: string;
  resource?: string;
}) {
  return invokeRBAC<{ allowed: boolean; reason: string }>('permission.validate', params);
}

// ========== Delegation Operations ==========

export async function approveDelegation(delegation_id: string) {
  return invokeRBAC('delegation.approve', { delegation_id });
}

export async function rejectDelegation(delegation_id: string, reason?: string) {
  return invokeRBAC('delegation.reject', { delegation_id, reason });
}

// ========== Notification Operations ==========

export async function sendRoleNotification(params: {
  type: 'submitted' | 'approved' | 'rejected';
  user_id: string;
  user_email: string;
  user_name: string;
  requested_role: string;
  justification?: string;
  rejection_reason?: string;
  language?: string;
}) {
  const actionMap = {
    submitted: 'notification.role_request',
    approved: 'notification.role_approved',
    rejected: 'notification.role_rejected'
  };
  return invokeRBAC(actionMap[params.type] as RBACAction, params);
}

// ========== Audit Operations ==========

export async function runSecurityAudit(params: {
  organization_id?: string;
  scope?: string;
}) {
  return invokeRBAC('audit.run_security_audit', params);
}

export default {
  assignRole,
  revokeRole,
  checkAutoApproval,
  getUserRoles,
  approveRoleRequest,
  rejectRoleRequest,
  validatePermission,
  approveDelegation,
  rejectDelegation,
  sendRoleNotification,
  runSecurityAudit
};
```

#### Step 2.2: Create React Hooks

```typescript
// src/hooks/useRBACManager.js

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import rbacService from '@/services/rbac/rbacService';
import { toast } from 'sonner';

export function useUserRoles(userId?: string, userEmail?: string) {
  return useQuery({
    queryKey: ['rbac-roles', userId || userEmail],
    queryFn: () => rbacService.getUserRoles({ user_id: userId, user_email: userEmail }),
    enabled: !!(userId || userEmail)
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rbacService.assignRole,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles', variables.user_id] });
      toast.success('Role assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign role: ${error.message}`);
    }
  });
}

export function useRevokeRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rbacService.revokeRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      toast.success('Role revoked successfully');
    },
    onError: (error) => {
      toast.error(`Failed to revoke role: ${error.message}`);
    }
  });
}

export function useApproveRoleRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rbacService.approveRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      toast.success('Role request approved');
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    }
  });
}

export function useRejectRoleRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rbacService.rejectRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      toast.success('Role request rejected');
    },
    onError: (error) => {
      toast.error(`Failed to reject: ${error.message}`);
    }
  });
}

export function useValidatePermission() {
  return useMutation({
    mutationFn: rbacService.validatePermission
  });
}

export function useSecurityAudit() {
  return useMutation({
    mutationFn: rbacService.runSecurityAudit,
    onSuccess: (data) => {
      toast.success(`Audit complete. Score: ${data.security_score}`);
    }
  });
}
```

---

### Phase 3: Update Frontend Callers (Day 3-4)

#### Files to Update

| File | Current Call | New Call |
|------|--------------|----------|
| `RoleRequestApprovalQueue.jsx` | Direct DB + `user_functional_roles` | `useApproveRoleRequest()` → writes to `user_roles` |
| `RoleRequestCard.jsx` | Direct DB | Keep (creates requests only) |
| `FunctionalRolesManager.jsx` | Direct edge function | `rbacService.assignRole()` |
| `DelegationApprovalPanel.jsx` | `approve-delegation` | `rbacService.approveDelegation()` |
| `SecurityDashboard.jsx` | `run-rbac-security-audit` | `useSecurityAudit()` |

#### Example: Fix RoleRequestApprovalQueue.jsx

```javascript
// BEFORE (broken - writes to wrong table)
const handleApprove = async (request) => {
  await supabase.from('role_requests').update({ status: 'approved' })...
  await supabase.from('user_functional_roles').insert({...}); // WRONG!
};

// AFTER (fixed - uses unified service)
import { useApproveRoleRequest } from '@/hooks/useRBACManager';

const { mutateAsync: approveRequest } = useApproveRoleRequest();

const handleApprove = async (request) => {
  await approveRequest({
    request_id: request.id,
    user_id: request.user_id,
    user_email: request.user_email,
    role: request.requested_role,
    municipality_id: request.municipality_id,
    organization_id: request.organization_id
  });
};
```

---

### Phase 4: Testing (Day 4-5)

#### Test Cases

1. **Role Assignment Flow**
   - [ ] Admin assigns role to user
   - [ ] User gets role in `user_roles` table
   - [ ] Permissions work immediately

2. **Role Request Flow**
   - [ ] User submits role request
   - [ ] Admin sees request in queue
   - [ ] Admin approves → user gets role in `user_roles`
   - [ ] User gets notification
   - [ ] User's permissions update

3. **Permission Validation**
   - [ ] Admin has all permissions
   - [ ] Role-based permissions work
   - [ ] Delegation permissions work

4. **Delegation Flow**
   - [ ] Create delegation
   - [ ] Approve delegation
   - [ ] Delegated permissions work

5. **Security Audit**
   - [ ] Audit runs without errors
   - [ ] Findings are accurate
   - [ ] Score is calculated correctly

---

### Phase 5: Delete Old Functions (Day 5-6)

#### Functions to Delete

After confirming all tests pass:

1. `supabase/functions/auto-role-assignment/` → **DELETE**
2. `supabase/functions/role-request-notification/` → **DELETE**
3. `supabase/functions/validate-permission/` → **DELETE**
4. `supabase/functions/approve-delegation/` → **DELETE**
5. `supabase/functions/run-rbac-security-audit/` → **DELETE**

#### Update `supabase/config.toml`

Remove old function configurations and add new one:

```toml
[functions.rbac-manager]
verify_jwt = false  # For role-related operations
```

---

## Migration Strategy

### Backward Compatibility Period

1. **Week 1:** Deploy new `rbac-manager` alongside old functions
2. **Week 1:** Update frontend to use new service
3. **Week 2:** Monitor for errors
4. **Week 2:** Delete old functions

### Feature Flags (Optional)

```javascript
const USE_NEW_RBAC = true; // Toggle for rollback

async function approveRole(request) {
  if (USE_NEW_RBAC) {
    return rbacService.approveRoleRequest(request);
  } else {
    // Old implementation
    return legacyApproveRole(request);
  }
}
```

---

## Rollback Plan

If issues arise:

1. **Revert frontend changes** via git
2. **Old functions still deployed** during transition
3. **No data migration needed** (same tables used)

---

## Cleanup Plan

### Files to Delete After Migration

#### Edge Functions
```
supabase/functions/auto-role-assignment/
supabase/functions/role-request-notification/
supabase/functions/validate-permission/
supabase/functions/approve-delegation/
supabase/functions/run-rbac-security-audit/
```

#### Frontend (Dead Code)
```
src/components/access/RoleRequestApprovalQueue.jsx  → REFACTOR (fix bug)
src/components/rbac/FunctionalRolesManager.jsx      → REVIEW (may be unused)
```

#### Database Tables (Consider Deprecation)
```
user_functional_roles  → UNUSED (approval writes here but nothing reads)
```

---

## Summary

### Before Consolidation
```
6 separate edge functions
6 separate API endpoints
Duplicated Supabase client setup
Inconsistent error handling
Broken role approval flow
```

### After Consolidation
```
1 unified edge function (rbac-manager)
1 action-based endpoint
Shared Supabase client
Consistent error handling
Fixed role approval flow
Single source of truth for RBAC operations
```

### Timeline

| Day | Task |
|-----|------|
| 1-2 | Create `rbac-manager` edge function |
| 2-3 | Create frontend service layer |
| 3-4 | Update all frontend callers |
| 4-5 | Testing |
| 5-6 | Delete old functions |

### Estimated Effort

- **Backend:** 4-6 hours
- **Frontend Service:** 2-3 hours
- **Frontend Updates:** 3-4 hours
- **Testing:** 2-3 hours
- **Cleanup:** 1-2 hours

**Total:** ~15-20 hours

---

*Document ready for review. Proceed with implementation upon confirmation.*
