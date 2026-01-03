/**
 * Admin & Settings Hooks Index
 * Centralized exports for all admin-related hooks
 * 
 * @version 1.0
 * @updated 2026-01-03
 */

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================
export { useSystemConfig } from '../useSystemConfig';
export { useSettings } from '../useSettings';
export { usePlatformConfig } from '../usePlatformConfig';

// ============================================================================
// AUDIT HOOKS
// ============================================================================
export { useAuditLog } from '../useAuditLog';
export { useAuditLogs } from '../useAuditLogs';
export { useAuditLogger } from '../useAuditLogger';
export { useAuditSchedule } from '../useAuditSchedule';
export { useSystemAudit } from '../useSystemAudit';
export { useAuditHooks } from '../useAuditHooks';

// ============================================================================
// ADMIN DATA
// ============================================================================
export { useAdminData } from '../useAdminData';
export { useSystemData } from '../useSystemData';
export { useSystemActivities } from '../useSystemActivities';

// ============================================================================
// DATA MANAGEMENT
// ============================================================================
export { useDataManagement } from '../useDataManagement';
export { useDataImport } from '../useDataImport';
export { useDataImportExport } from '../useDataImportExport';
export { useBulkImporter } from '../useBulkImporter';
export { useBulkMutations } from '../useBulkMutations';

// ============================================================================
// PERMISSION MANAGEMENT
// ============================================================================
export { usePermissions } from '../usePermissions';
export { useSystemPermissions } from '../useSystemPermissions';
export { usePermissionTemplates } from '../usePermissionTemplates';

// ============================================================================
// A/B TESTING
// ============================================================================
export { useABTesting } from '../useABTesting';
export { useABExperimentMutations } from '../useABExperimentMutations';
