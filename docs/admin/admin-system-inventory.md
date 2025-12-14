# Admin & Platform System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 85 files (45 pages, 35 components, 5 hooks)  
> **Parent System:** Platform Administration  
> **Hub Page:** `/admin-portal`

---

## Overview

The Admin System provides platform administration including user management, RBAC, data management, system configuration, monitoring, and compliance.

---

## 📄 Pages (45)

### Core Admin Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Admin Portal** | `AdminPortal.jsx` | `/admin-portal` | `admin` | Self (Root) |
| Command Center | `CommandCenter.jsx` | `/command-center` | `admin` | Admin Portal |
| System Health Dashboard | `SystemHealthDashboard.jsx` | `/system-health-dashboard` | `admin` | Admin Portal |
| Platform Audit | `PlatformAudit.jsx` | `/platform-audit` | `admin` | Admin Portal |

### User Management Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| User Management | `UserManagement.jsx` | `/user-management` | `user_manage` | Admin Portal |
| User Management Hub | `UserManagementHub.jsx` | `/user-management-hub` | `user_manage` | Admin Portal |
| User Activity Dashboard | `UserActivityDashboard.jsx` | `/user-activity-dashboard` | `user_manage` | User Management |
| User Profile | `UserProfile.jsx` | `/user-profile` | `authenticated` | Personal |
| User Profile Multi Identity | `UserProfileMultiIdentity.jsx` | `/user-profile-multi-identity` | `authenticated` | Personal |
| Team Overview | `TeamOverview.jsx` | `/team-overview` | `team_manage` | User Management |
| Team Workspace | `TeamWorkspace.jsx` | `/team-workspace` | `team_manage` | User Management |
| Delegation Manager | `DelegationManager.jsx` | `/delegation-manager` | `authenticated` | Personal |
| Session Device Manager | `SessionDeviceManager.jsx` | `/session-device-manager` | `authenticated` | Personal |

### RBAC Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| RBAC Hub | `RBACHub.jsx` | `/rbac-hub` | `rbac_admin` | Admin Portal |
| Role Permission Manager | `RolePermissionManager.jsx` | `/role-permission-manager` | `rbac_admin` | RBAC Hub |
| Role Request Center | `RoleRequestCenter.jsx` | `/role-request-center` | `rbac_admin` | RBAC Hub |
| Conditional Access Rules | `ConditionalAccessRules.jsx` | `/conditional-access-rules` | `rbac_admin` | RBAC Hub |
| Menu RBAC Coverage Report | `MenuRBACCoverageReport.jsx` | `/menu-rbac-coverage-report` | `admin` | Reports |

### Data Management Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Data Management Hub | `DataManagementHub.jsx` | `/data-management-hub` | `data_admin` | Admin Portal |
| Import Export Hub | `ImportExportHub.jsx` | `/import-export-hub` | `data_admin` | Data Management |
| Validation Rules Engine | `ValidationRulesEngine.jsx` | `/validation-rules-engine` | `data_admin` | Data Management |
| Data Retention Config | `DataRetentionConfig.jsx` | `/data-retention-config` | `data_admin` | Data Management |
| Backup Recovery Manager | `BackupRecoveryManager.jsx` | `/backup-recovery-manager` | `admin` | Admin Portal |

### System Configuration Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Settings | `Settings.jsx` | `/settings` | `authenticated` | Personal |
| Branding Settings | `BrandingSettings.jsx` | `/branding-settings` | `admin` | Admin Portal |
| System Defaults Config | `SystemDefaultsConfig.jsx` | `/system-defaults-config` | `admin` | Admin Portal |
| Security Policy Manager | `SecurityPolicyManager.jsx` | `/security-policy-manager` | `admin` | Admin Portal |
| Feature Flags Dashboard | `FeatureFlagsDashboard.jsx` | `/feature-flags-dashboard` | `admin` | Admin Portal |
| AI Configuration Panel | `AIConfigurationPanel.jsx` | `/ai-configuration-panel` | `admin` | Admin Portal |
| Taxonomy Builder | `TaxonomyBuilder.jsx` | `/taxonomy-builder` | `admin` | Admin Portal |
| Workflow Designer | `WorkflowDesigner.jsx` | `/workflow-designer` | `admin` | Admin Portal |

### Monitoring Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Performance Monitor | `PerformanceMonitor.jsx` | `/performance-monitor` | `admin` | Admin Portal |
| Error Logs Console | `ErrorLogsConsole.jsx` | `/error-logs-console` | `admin` | Admin Portal |
| Scheduled Jobs Manager | `ScheduledJobsManager.jsx` | `/scheduled-jobs-manager` | `admin` | Admin Portal |
| API Management Console | `APIManagementConsole.jsx` | `/api-management-console` | `admin` | Admin Portal |
| Usage Analytics | `UsageAnalytics.jsx` | `/usage-analytics` | `admin` | Admin Portal |
| Feature Usage Heatmap | `FeatureUsageHeatmap.jsx` | `/feature-usage-heatmap` | `admin` | Admin Portal |
| Audit Trail | `AuditTrail.jsx` | `/audit-trail` | `admin` | Admin Portal |
| Audit Registry | `AuditRegistry.jsx` | `/audit-registry` | `admin` | Admin Portal |
| Audit Detail | `AuditDetail.jsx` | `/audit-detail` | `admin` | Audit Registry |

### Compliance Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Compliance Dashboard | `ComplianceDashboard.jsx` | `/compliance-dashboard` | `admin` | Admin Portal |

### Template & Content Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Template Library | `TemplateLibrary.jsx` | `/template-library` | `admin` | Admin Portal |
| Template Library Manager | `TemplateLibraryManager.jsx` | `/template-library-manager` | `admin` | Admin Portal |
| Document Version Control | `DocumentVersionControl.jsx` | `/document-version-control` | `admin` | Admin Portal |
| Media Library | `MediaLibrary.jsx` | `/media-library` | `admin` | Admin Portal |
| File Library | `FileLibrary.jsx` | `/file-library` | `authenticated` | Personal |

---

## 🧩 Components (35)

### Admin Components
**Location:** `src/components/admin/`

| Component | Description |
|-----------|-------------|
| `LookupDataManager.jsx` | Lookup data management |

**Location:** `src/components/admin/lookup/`

| Component | Description |
|-----------|-------------|
| Various lookup management components | - |

### RBAC Components
**Location:** `src/components/rbac/`

| Component | Description |
|-----------|-------------|
| `DelegationApprovalQueue.jsx` | Delegation approvals |
| `MenuRBACContent.jsx` | Menu RBAC content |
| `MobileDelegationManager.jsx` | Mobile delegation |
| `PermissionAuditTrail.jsx` | Permission audit |
| `RBACAuditContent.jsx` | RBAC audit |
| `RBACCoverageContent.jsx` | RBAC coverage |
| `RBACDashboardContent.jsx` | RBAC dashboard |

### Workflow Components
**Location:** `src/components/workflows/`

| Component | Description |
|-----------|-------------|
| `AIWorkflowOptimizer.jsx` | AI workflow optimization |
| `ApprovalMatrixEditor.jsx` | Approval matrix editing |
| `GateTemplateLibrary.jsx` | Gate templates |
| `SLARuleBuilder.jsx` | SLA rule building |
| `VisualWorkflowBuilder.jsx` | Visual workflow builder |

### Data Management Components
**Location:** `src/components/data-management/`

| Component | Description |
|-----------|-------------|
| `CitiesTab.jsx` | Cities data |
| `EntityTable.jsx` | Entity table display |
| `IntegrityTab.jsx` | Data integrity |
| `MunicipalitiesTab.jsx` | Municipalities data |
| `OrganizationsTab.jsx` | Organizations data |
| `RegionsTab.jsx` | Regions data |
| `index.js` | Exports |

### Root-Level Admin Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `EntityPermissions.jsx` | Entity permissions |
| `EscalationPathsConfig.jsx` | Escalation paths |
| `FeatureFlagsManager.jsx` | Feature flags |
| `PermissionMatrix.jsx` | Permission matrix |
| `SystemConfiguration.jsx` | System config |
| `TaxonomyManager.jsx` | Taxonomy management |
| `TemplateLibrary.jsx` | Template library |
| `UserImpersonation.jsx` | User impersonation |
| `UserRoleManager.jsx` | Role management |

---

## 🪝 Hooks (5)

| Hook | Description |
|------|-------------|
| `useUserRoles.js` | User roles management |
| `useAuditLog.js` | Audit logging |
| `useAutoRoleAssignment.js` | Auto role assignment |
| `useUsersWithVisibility.js` | Users with visibility |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `user_roles` | Role assignments |
| `roles` | Role definitions |
| `permissions` | Permission definitions |
| `role_permissions` | Role-permission mapping |
| `access_logs` | Access logging |
| `auto_approval_rules` | Auto-approval rules |
| `approval_requests` | Approval requests |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `admin` | Full admin access |
| `user_manage` | User management |
| `rbac_admin` | RBAC administration |
| `data_admin` | Data administration |
| `team_manage` | Team management |
| `platform_admin` | Platform admin |
| `security_manage` | Security management |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| All Systems | Administers all |
