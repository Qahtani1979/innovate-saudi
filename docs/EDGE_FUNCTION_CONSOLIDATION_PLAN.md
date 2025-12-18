# Edge Function Consolidation Plan: RBAC & Access Control

**Created:** December 18, 2024  
**Status:** Planning Phase  
**Objective:** Merge all RBAC-related edge functions into a unified `rbac-manager` function

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Target Architecture](#target-architecture)
4. [Detailed Implementation Plan](#detailed-implementation-plan)
5. [Migration Strategy](#migration-strategy)
6. [Rollback Plan](#rollback-plan)
7. [Testing Strategy](#testing-strategy)
8. [Cleanup Plan](#cleanup-plan)

---

## Executive Summary

### Problem Statement
The RBAC system is fragmented across **6 separate edge functions**, leading to:
- Code duplication
- Inconsistent behavior
- Maintenance overhead
- Difficult debugging
- Potential security gaps

### Solution
Consolidate into a **single unified edge function** (`rbac-manager`) with action-based routing.

### Functions to Merge

| Current Function | Purpose | Status |
|-----------------|---------|--------|
| `auto-role-assignment` | Assign/revoke roles, auto-approval | Active |
| `role-request-notification` | Send role request emails | Active |
| `validate-permission` | Check permissions/delegations | Active |
| `approve-delegation` | Approve/reject delegations | Active |
| `run-rbac-security-audit` | Security audits | Active |
| `budget-approval` | Budget approvals (role-gated) | Active |

---

## Current State Analysis

### 1. `auto-role-assignment/index.ts`
**Lines:** 216  
**Actions Supported:**
- `assign` - Direct role assignment to `user_roles`
- `revoke` - Revoke a role
- `check_auto_approve` - Check auto-approval rules
- `auto_assign` - Legacy organization-based assignment
- (default) - Get user roles

**Database Tables Used:**
- `user_roles` (READ/WRITE)
- `auto_approval_rules` (READ)
- `municipalities` (READ)
- `organization_members` (READ)

**Dependencies:**
- None (standalone)

---

### 2. `role-request-notification/index.ts`
**Lines:** 341  
**Actions Supported:**
- `submitted` - Notify user of pending request
- `approved` - Notify user of approval
- `rejected` - Notify user of rejection
- Notify admins of new requests

**Database Tables Used:**
- `user_roles` (READ - for admin lookup)
- `user_profiles` (READ - for admin emails)
- `citizen_notifications` (WRITE)

**External Services:**
- Resend (email)

**Dependencies:**
- `RESEND_API_KEY` secret

---

### 3. `validate-permission/index.ts`
**Lines:** 124  
**Actions Supported:**
- Permission validation for users
- Delegation checking
- Role-based permission mapping

**Database Tables Used:**
- `user_roles` (READ)
- `delegation_rules` (READ)

**Dependencies:**
- None

---

### 4. `approve-delegation/index.ts`
**Lines:** 79  
**Actions Supported:**
- `approve` - Approve delegation
- `reject` - Reject delegation

**Database Tables Used:**
- `delegation_rules` (READ/WRITE)

**Dependencies:**
- None

---

### 5. `run-rbac-security-audit/index.ts`
**Lines:** 147  
**Actions Supported:**
- Run security audit
- Generate findings
- Calculate security score

**Database Tables Used:**
- `user_roles` (READ)
- `access_logs` (READ)
- `security_audits` (WRITE)

**Dependencies:**
- None

---

### 6. `budget-approval/index.ts` (Partial merge - approval workflow only)
**Lines:** 121  
**Actions Supported:**
- `approve` - Approve pilot budget
- `reject` - Reject pilot budget

**Database Tables Used:**
- `pilots` (READ/WRITE)
- `approval_requests` (WRITE)
- `system_activities` (WRITE)

**Note:** This function handles budgets but uses the same approval workflow pattern. Consider keeping separate or merging approval workflow only.

---

## Target Architecture

### New Unified Function: `rbac-manager`

```
supabase/functions/rbac-manager/
├── index.ts              # Main router
├── handlers/
│   ├── roles.ts         # Role assignment operations
│   ├── permissions.ts   # Permission validation
│   ├── delegations.ts   # Delegation management
│   ├── notifications.ts # Role-related notifications
│   ├── audit.ts         # Security audits
│   └── approvals.ts     # Approval workflows
├── utils/
│   ├── email.ts         # Email templates
│   ├── validators.ts    # Input validation
│   └── permissions.ts   # Permission maps
└── types.ts             # TypeScript types
```

### Action Routing Schema

```typescript
interface RBACRequest {
  action: 
    // Role Operations
    | 'role.assign'
    | 'role.revoke'
    | 'role.check_auto_approve'
    | 'role.get_user_roles'
    | 'role.request.submit'
    | 'role.request.approve'
    | 'role.request.reject'
    
    // Permission Operations
    | 'permission.validate'
    | 'permission.get_user_permissions'
    
    // Delegation Operations
    | 'delegation.approve'
    | 'delegation.reject'
    | 'delegation.check_active'
    
    // Notification Operations
    | 'notification.role_request'
    | 'notification.role_approved'
    | 'notification.role_rejected'
    
    // Audit Operations
    | 'audit.run_security_audit'
    | 'audit.get_findings'
    
    // Approval Workflows (optional)
    | 'approval.process';
    
  payload: Record<string, unknown>;
}
```

---

## Detailed Implementation Plan

### Phase 1: Create New Unified Function (Day 1-2)

#### Step 1.1: Create Base Structure

```typescript
// supabase/functions/rbac-manager/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handler imports (inline for edge function)
// ... all handlers defined in single file

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;

    console.log(`[rbac-manager] Action: ${action}`);

    let result;

    switch (action) {
      // ========== ROLE OPERATIONS ==========
      case 'role.assign':
        result = await handleRoleAssign(supabase, payload);
        break;
      case 'role.revoke':
        result = await handleRoleRevoke(supabase, payload);
        break;
      case 'role.check_auto_approve':
        result = await handleCheckAutoApprove(supabase, payload);
        break;
      case 'role.get_user_roles':
        result = await handleGetUserRoles(supabase, payload);
        break;
      case 'role.request.approve':
        result = await handleRoleRequestApprove(supabase, payload);
        break;
      case 'role.request.reject':
        result = await handleRoleRequestReject(supabase, payload);
        break;

      // ========== PERMISSION OPERATIONS ==========
      case 'permission.validate':
        result = await handlePermissionValidate(supabase, payload);
        break;
      case 'permission.get_user_permissions':
        result = await handleGetUserPermissions(supabase, payload);
        break;

      // ========== DELEGATION OPERATIONS ==========
      case 'delegation.approve':
        result = await handleDelegationApprove(supabase, payload);
        break;
      case 'delegation.reject':
        result = await handleDelegationReject(supabase, payload);
        break;

      // ========== NOTIFICATION OPERATIONS ==========
      case 'notification.role_request':
      case 'notification.role_approved':
      case 'notification.role_rejected':
        result = await handleRoleNotification(supabase, resend, action, payload);
        break;

      // ========== AUDIT OPERATIONS ==========
      case 'audit.run_security_audit':
        result = await handleSecurityAudit(supabase, payload);
        break;

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Unknown action: ${action}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[rbac-manager] Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

#### Step 1.2: Implement All Handlers

Each handler will be a function that takes `supabase` client and `payload`:

```typescript
// ========== ROLE HANDLERS ==========

async function handleRoleAssign(supabase: SupabaseClient, payload: {
  user_id: string;
  user_email: string;
  role: string;
  organization_id?: string;
  municipality_id?: string;
}) {
  const { user_id, user_email, role, organization_id, municipality_id } = payload;
  
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({
      user_id,
      user_email,
      role,
      organization_id: organization_id || null,
      municipality_id: municipality_id || null,
      assigned_at: new Date().toISOString(),
      is_active: true
    }, { onConflict: 'user_id,role' })
    .select()
    .single();

  if (error) throw error;
  return { assigned: true, role: data };
}

async function handleRoleRevoke(supabase: SupabaseClient, payload: {
  user_email: string;
  role: string;
}) {
  const { user_email, role } = payload;
  
  const { error } = await supabase
    .from('user_roles')
    .update({ 
      is_active: false, 
      revoked_at: new Date().toISOString() 
    })
    .eq('user_email', user_email)
    .eq('role', role);

  if (error) throw error;
  return { revoked: true };
}

async function handleCheckAutoApprove(supabase: SupabaseClient, payload: {
  user_email: string;
  user_id: string;
  persona_type: string;
  municipality_id?: string;
  organization_id?: string;
  institution_domain?: string;
}) {
  // ... implementation from auto-role-assignment
}

async function handleGetUserRoles(supabase: SupabaseClient, payload: {
  user_email?: string;
  user_id?: string;
}) {
  const { user_email, user_id } = payload;
  
  let query = supabase.from('user_roles').select('*').eq('is_active', true);
  
  if (user_id) query = query.eq('user_id', user_id);
  else if (user_email) query = query.eq('user_email', user_email);
  else throw new Error('user_id or user_email required');

  const { data, error } = await query;
  if (error) throw error;
  return { roles: data || [] };
}

// ========== PERMISSION HANDLERS ==========

async function handlePermissionValidate(supabase: SupabaseClient, payload: {
  user_id: string;
  user_email?: string;
  permission: string;
  resource?: string;
  action?: string;
}) {
  // ... implementation from validate-permission
}

// ========== DELEGATION HANDLERS ==========

async function handleDelegationApprove(supabase: SupabaseClient, payload: {
  delegation_id: string;
}) {
  const { delegation_id } = payload;
  
  const { data, error } = await supabase
    .from('delegation_rules')
    .update({
      approval_status: 'approved',
      approval_date: new Date().toISOString(),
      is_active: true
    })
    .eq('id', delegation_id)
    .select()
    .single();

  if (error) throw error;
  return { approved: true, delegation: data };
}

async function handleDelegationReject(supabase: SupabaseClient, payload: {
  delegation_id: string;
  reason?: string;
}) {
  // ... implementation
}

// ========== NOTIFICATION HANDLERS ==========

async function handleRoleNotification(
  supabase: SupabaseClient, 
  resend: Resend | null, 
  action: string, 
  payload: {
    user_id: string;
    user_email: string;
    user_name: string;
    requested_role: string;
    justification?: string;
    rejection_reason?: string;
    language?: string;
    notify_admins?: boolean;
  }
) {
  if (!resend) {
    console.warn("Resend not configured, skipping email");
    return { email_sent: false, notification_created: true };
  }
  
  // ... implementation from role-request-notification
}

// ========== AUDIT HANDLERS ==========

async function handleSecurityAudit(supabase: SupabaseClient, payload: {
  organization_id?: string;
  scope?: string;
}) {
  // ... implementation from run-rbac-security-audit
}
```

---

### Phase 2: Create Frontend Service Layer (Day 2-3)

#### Step 2.1: Create Unified RBAC Service

```typescript
// src/services/rbac/rbacService.ts

import { supabase } from '@/integrations/supabase/client';

type RBACAction = 
  | 'role.assign'
  | 'role.revoke'
  | 'role.check_auto_approve'
  | 'role.get_user_roles'
  | 'role.request.approve'
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
