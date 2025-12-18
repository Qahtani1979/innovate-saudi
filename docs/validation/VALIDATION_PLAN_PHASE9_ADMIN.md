# Phase 9: Admin Portal + User/Role Management
## Validation Plan

**Version:** 1.0  
**Last Updated:** 2024-12-10  
**Reference:** `docs/personas/ADMIN_PERSONA.md`

---

## 1. AdminPortal Dashboard

### 1.1 Access Control (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-001 | Admin role required | requireAdmin: true | Critical |
| A9-002 | Non-admin redirected | To Home or 403 | Critical |
| A9-003 | Super admin access | Full access | Critical |
| A9-004 | Platform admin access | Most features | High |
| A9-005 | Dashboard loads < 3s | Performance | High |
| A9-006 | No console errors | Clean load | Critical |
| A9-007 | RTL layout correct | Arabic | High |
| A9-008 | Responsive on mobile | Layout | High |

### 1.2 Approval Alerts Banner (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-009 | Pending challenges count | Real count | High |
| A9-010 | Pending pilots count | Real count | High |
| A9-011 | Pending applications count | Real count | High |
| A9-012 | Banner links work | Navigate | High |
| A9-013 | Banner hides when empty | Conditional | Medium |
| A9-014 | Counts refresh | On data change | Medium |

### 1.3 Platform Statistics (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-015 | Total challenges (+ pending) | Accurate count | High |
| A9-016 | Total pilots (+ active) | Accurate count | High |
| A9-017 | Total solutions (+ verified) | Accurate count | High |
| A9-018 | Total organizations (+ partners) | Accurate count | High |
| A9-019 | Total municipalities (+ active) | Accurate count | High |
| A9-020 | Total users count | From user_profiles | High |
| A9-021 | Stats cards clickable | Navigate to list | Medium |
| A9-022 | Zero handling | Empty state | Medium |
| A9-023 | Stats accurate | DB counts | Critical |
| A9-024 | Refresh button works | Reload data | Medium |

### 1.4 Recent System Activity (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-025 | Activity feed loads | Recent activities | High |
| A9-026 | Cross-entity activities | All entity types | High |
| A9-027 | Timestamp shown | Relative/absolute | Medium |
| A9-028 | User email shown | Actor | High |
| A9-029 | Activity type icon | Visual indicator | Medium |
| A9-030 | Click navigates to entity | If applicable | Medium |

### 1.5 Admin Sections (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-031 | Entity Management section | 6 links | High |
| A9-032 | Geography & Taxonomy section | 4 links | High |
| A9-033 | User & Access section | 4 links | High |
| A9-034 | Citizen Engagement section | 3 links | High |
| A9-035 | System Operations section | 4 links | High |
| A9-036 | All section links work | Navigate | Critical |
| A9-037 | Icons display correctly | Visual | Medium |
| A9-038 | Descriptions helpful | Text | Low |
| A9-039 | RTL section layout | Arabic | High |
| A9-040 | Mobile section collapse | Responsive | Medium |

---

## 2. User Management

### 2.1 UserManagementHub (12 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-041 | Page loads with admin | Auth check | Critical |
| A9-042 | User list displays | Paginated | High |
| A9-043 | Search by email works | Filter | High |
| A9-044 | Search by name works | Filter | High |
| A9-045 | Filter by role works | Dropdown | High |
| A9-046 | Filter by status works | Active/inactive | High |
| A9-047 | User profile view | Click to detail | High |
| A9-048 | Edit user works | Form | High |
| A9-049 | Deactivate user works | Status toggle | High |
| A9-050 | Delete user (soft) | is_deleted flag | Medium |
| A9-051 | Export users | CSV/Excel | Low |
| A9-052 | Pagination works | Page nav | High |

### 2.2 RolePermissionManager (14 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-053 | Page loads with admin | Auth check | Critical |
| A9-054 | All roles displayed | From roles table | High |
| A9-055 | Role descriptions shown | What each does | High |
| A9-056 | Assign role to user | user_roles insert | Critical |
| A9-057 | Remove role from user | user_roles delete | Critical |
| A9-058 | Cannot remove own admin | Safety check | Critical |
| A9-059 | User search works | Find by email | High |
| A9-060 | Current roles displayed | Per user | High |
| A9-061 | Role assignment audit | access_logs entry | High |
| A9-062 | Multiple roles allowed | Array support | Medium |
| A9-063 | Role hierarchy respected | Cannot grant higher | High |
| A9-064 | Confirmation dialog | Before changes | High |
| A9-065 | Success toast shown | After assign/remove | High |
| A9-066 | Changes immediate | No delay | High |

### 2.3 Role Requests Processing (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-067 | Pending requests list | role_requests | High |
| A9-068 | Request details shown | User, role, justification | High |
| A9-069 | Approve action works | Status='approved' | Critical |
| A9-070 | Reject action works | Status='rejected' | Critical |
| A9-071 | Rejection reason required | Textarea | High |
| A9-072 | Role auto-granted on approve | user_roles insert | Critical |
| A9-073 | Notification sent | Email/in-app | High |
| A9-074 | Audit trail created | access_logs | High |

---

## 3. Approval Center

### 3.1 ApprovalCenter Page (12 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-075 | Page loads with admin | Auth check | Critical |
| A9-076 | Challenge approvals tab | Pending list | High |
| A9-077 | Pilot approvals tab | Pending list | High |
| A9-078 | Program applications tab | Pending list | High |
| A9-079 | Solution verifications tab | Pending list | High |
| A9-080 | Expert verifications tab | Pending list | High |
| A9-081 | Bulk approve works | Multi-select | Medium |
| A9-082 | Individual approve works | Single item | Critical |
| A9-083 | Reject with reason | Required field | Critical |
| A9-084 | SLA indicator shown | Time remaining | High |
| A9-085 | Priority sorting | High first | Medium |
| A9-086 | Status update immediate | No delay | High |

### 3.2 Multi-Step Approvals (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-087 | Step progression works | 1→2→3→4 | High |
| A9-088 | Each step role-gated | Permission check | Critical |
| A9-089 | Partial approval state | Intermediate | High |
| A9-090 | Escalation trigger | If SLA breached | High |
| A9-091 | Final authority correct | gdisb_admin | Critical |
| A9-092 | Approval chain visible | History | Medium |

---

## 4. System Operations

### 4.1 SystemHealthDashboard (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-093 | Page loads with admin | Auth check | Critical |
| A9-094 | Database status shown | Connected/not | High |
| A9-095 | API latency shown | Response times | Medium |
| A9-096 | Error rate shown | Last 24h | High |
| A9-097 | Active users count | Real-time | Medium |
| A9-098 | Storage usage shown | Bucket sizes | Medium |
| A9-099 | Edge function status | Running/not | Medium |
| A9-100 | Alerts displayed | If any issues | High |

### 4.2 AuditTrail (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-101 | Page loads with admin | Auth check | Critical |
| A9-102 | All actions logged | access_logs query | High |
| A9-103 | Filter by user | Email search | High |
| A9-104 | Filter by action | Action type | High |
| A9-105 | Filter by date range | Date picker | High |
| A9-106 | Export logs | CSV/JSON | Medium |
| A9-107 | IP address shown | If captured | Medium |
| A9-108 | Metadata expandable | JSON details | Medium |

### 4.3 SystemDefaultsConfig (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-109 | Page loads with admin | Auth check | Critical |
| A9-110 | SLA thresholds editable | Save works | High |
| A9-111 | Email templates editable | Save works | High |
| A9-112 | Default values editable | Save works | High |
| A9-113 | Feature flags editable | Save works | Medium |
| A9-114 | Changes require confirm | Dialog | High |
| A9-115 | Validation on fields | Type checking | High |
| A9-116 | Audit log on change | Tracked | High |

---

## 5. Data Management

### 5.1 DataManagementHub (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-117 | Page loads with admin | Auth check | Critical |
| A9-118 | Entity type selection | All types | High |
| A9-119 | List view works | Paginated | High |
| A9-120 | Search works | Text search | High |
| A9-121 | Create new works | Form | High |
| A9-122 | Edit existing works | Form | High |
| A9-123 | Soft delete works | is_deleted flag | High |
| A9-124 | Restore deleted works | Undo delete | Medium |
| A9-125 | Bulk operations | Select multiple | Medium |
| A9-126 | Export data | CSV/JSON | Medium |

### 5.2 BulkImport (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-127 | Page loads with admin | Auth check | Critical |
| A9-128 | Entity type selection | Dropdown | High |
| A9-129 | File upload works | CSV/Excel | High |
| A9-130 | Validation preview | Before import | Critical |
| A9-131 | Error highlighting | Invalid rows | High |
| A9-132 | Import execution | Batch insert | High |
| A9-133 | Success count shown | After import | High |
| A9-134 | Rollback on error | Transaction | High |

---

## 6. Security Validations (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| A9-135 | Admin pages protected | ProtectedPage HOC | Critical |
| A9-136 | API calls authorized | Bearer token | Critical |
| A9-137 | RBAC enforced | has_role function | Critical |
| A9-138 | Cannot escalate own role | Safety | Critical |
| A9-139 | Audit all admin actions | access_logs | Critical |
| A9-140 | Session timeout | Auto logout | High |
| A9-141 | No SQL injection | Parameterized | Critical |
| A9-142 | No XSS vulnerabilities | Input sanitization | Critical |
| A9-143 | Rate limiting | API calls | High |
| A9-144 | Sensitive data masked | In logs/UI | High |

---

## Summary

| Category | Total Checks |
|----------|--------------|
| Access Control | 8 |
| Approval Alerts | 6 |
| Platform Statistics | 10 |
| System Activity | 6 |
| Admin Sections | 10 |
| UserManagementHub | 12 |
| RolePermissionManager | 14 |
| Role Requests | 8 |
| ApprovalCenter | 12 |
| Multi-Step Approvals | 6 |
| SystemHealthDashboard | 8 |
| AuditTrail | 8 |
| SystemDefaultsConfig | 8 |
| DataManagementHub | 10 |
| BulkImport | 8 |
| Security | 10 |
| **TOTAL** | **144 checks** |

---

## Files to Validate

| File | Purpose |
|------|---------|
| `src/pages/AdminPortal.jsx` | Main admin dashboard |
| `src/pages/UserManagementHub.jsx` | User administration |
| `src/pages/RolePermissionManager.jsx` | RBAC management |
| `src/pages/ApprovalCenter.jsx` | Approval processing |
| `src/pages/SystemHealthDashboard.jsx` | System monitoring |
| `src/pages/AuditTrail.jsx` | Audit logs |
| `src/pages/SystemDefaultsConfig.jsx` | Platform settings |
| `src/pages/DataManagementHub.jsx` | Entity management |
| `src/pages/BulkImport.jsx` | Bulk operations |
