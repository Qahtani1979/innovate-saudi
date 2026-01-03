# User & Organization System Inventory

**Version:** 1.0  
**Last Updated:** 2026-01-03  
**Status:** Active

## Overview

The User & Organization System manages user profiles, authentication, role-based access control, and organizational entities including municipalities.

## Directory Structure

```
src/
├── hooks/users/
│   └── index.js                    # Consolidated hook exports
├── components/
│   ├── users/
│   │   └── ProfileVisibilityControl.jsx
│   └── organizations/
│       ├── AINetworkAnalysis.jsx
│       ├── OrganizationActivityDashboard.jsx
│       ├── OrganizationActivityLog.jsx
│       ├── OrganizationCollaborationManager.jsx
│       ├── OrganizationNetworkGraph.jsx
│       ├── OrganizationPerformanceMetrics.jsx
│       ├── OrganizationReputationTracker.jsx
│       ├── OrganizationVerificationWorkflow.jsx
│       └── OrganizationWorkflowTab.jsx
```

## Hooks Reference

### User Profile Hooks
| Hook | Source File | Purpose |
|------|-------------|---------|
| `useUserProfile` | useUserProfiles.js | Fetch user profile by email |
| `useAllUserProfiles` | useUserProfiles.js | Fetch all user profiles |
| `useUserProfileById` | useUserProfiles.js | Fetch user profile by ID |

### User Roles & RBAC Hooks
| Hook | Source File | Purpose |
|------|-------------|---------|
| `useUserRoles` | useRBACManager.js | Fetch user roles |
| `useUserRoleMutations` | useUserRoleMutations.js | Manage user role changes |
| `useRoles` | useRoles.js | Fetch available roles |
| `useRoleMutations` | useRoleMutations.js | CRUD operations on roles |
| `useRolePermissions` | useRolePermissions.js | Fetch role permissions |
| `useRoleRequests` | useRoleRequests.js | Manage role requests |

### User Activity Hooks
| Hook | Source File | Purpose |
|------|-------------|---------|
| `useUserFollows` | useUserFollows.js | User follow/unfollow actions |
| `useMyDelegation` | useMyDelegation.js | User delegation management |
| `useMyBookmarks` | useMyBookmarks.js | User bookmarks |
| `useMyWork` | useMyWork.js | User work items |
| `useMyWorkload` | useMyWorkload.js | User workload metrics |

### Organization Hooks
| Hook | Source File | Purpose |
|------|-------------|---------|
| `useOrganization` | useOrganization.js | Fetch single organization |
| `useOrganizations` | useOrganizations.js | Fetch all organizations |
| `useOrganizationMutations` | useOrganizationMutations.js | CRUD operations |
| `useOrganizationActivity` | useOrganizationActivity.js | Org activity tracking |
| `useOrganizationReputation` | useOrganizationReputation.js | Reputation scoring |

### Municipality Hooks
| Hook | Source File | Purpose |
|------|-------------|---------|
| `useMunicipalities` | useMunicipalities.js | Fetch municipalities |
| `useMunicipalityMutations` | useMunicipalityMutations.js | CRUD operations |
| `useMunicipalAnalysis` | useMunicipalAnalysis.js | Municipal analytics |
| `useMunicipalImpact` | useMunicipalImpact.js | Impact assessment |

## Import Examples

```javascript
// Centralized import from index
import { 
  useUserProfile, 
  useOrganizations, 
  useMunicipalities 
} from '@/hooks/users';

// Or import specific hooks
import { useUserProfile } from '@/hooks/useUserProfiles';
```

## Database Tables

- `user_profiles` - Extended user information
- `user_roles` - Role assignments
- `organizations` - Organization entities
- `municipalities` - Municipal entities
- `access_logs` - User activity logging

## Security Considerations

1. **Role-Based Access**: All user data access controlled via RLS policies
2. **Profile Visibility**: Users control their own profile visibility
3. **Organization Membership**: Verified membership required for org actions
4. **Audit Logging**: All role changes logged for compliance
