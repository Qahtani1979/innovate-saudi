/**
 * Audit Logger Hook
 * Provides functions for logging various audit events
 * Addresses: audit-10 (Bulk operations), audit-11 (Data exports), audit-8 (Auth events)
 */

import { supabase } from "@/integrations/supabase/client";
import { useCallback } from 'react';

// Action types for audit logging
export const AUDIT_ACTIONS = {
  // CRUD Operations
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  
  // Bulk Operations
  BULK_CREATE: 'bulk_create',
  BULK_UPDATE: 'bulk_update',
  BULK_DELETE: 'bulk_delete',
  BULK_IMPORT: 'bulk_import',
  
  // Export Operations
  DATA_EXPORT: 'data_export',
  REPORT_EXPORT: 'report_export',
  PDF_EXPORT: 'pdf_export',
  EXCEL_EXPORT: 'excel_export',
  
  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  
  // Permission Changes
  PERMISSION_CHANGE: 'permission_change',
  ROLE_ASSIGNMENT: 'role_assignment',
  ROLE_REMOVAL: 'role_removal',
  
  // Status Changes
  STATUS_CHANGE: 'status_change',
  APPROVAL: 'approval',
  REJECTION: 'rejection',
  
  // Access
  VIEW: 'view',
  DOWNLOAD: 'download',
  SHARE: 'share'
};

// Entity types
export const ENTITY_TYPES = {
  CHALLENGE: 'challenge',
  PILOT: 'pilot',
  SOLUTION: 'solution',
  PROGRAM: 'program',
  USER: 'user',
  ROLE: 'role',
  ORGANIZATION: 'organization',
  DOCUMENT: 'document',
  BUDGET: 'budget',
  CONTRACT: 'contract',
  EVENT: 'event',
  STRATEGIC_PLAN: 'strategic_plan'
};

export const useAuditLogger = () => {
  /**
   * Get current user info for logging
   */
  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return {
      user_id: user?.id || null,
      user_email: user?.email || 'anonymous'
    };
  }, []);

  /**
   * Core logging function
   */
  const logAuditEvent = useCallback(async ({
    action,
    entityType,
    entityId = null,
    metadata = {},
    oldValues = null,
    newValues = null
  }) => {
    try {
      const { user_id, user_email } = await getCurrentUser();
      
      const logEntry = {
        user_id,
        user_email,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        },
        old_values: oldValues,
        new_values: newValues,
        ip_address: null // Will be captured server-side if needed
      };

      const { error } = await supabase
        .from('access_logs')
        .insert(logEntry);

      if (error) {
        console.error('Failed to log audit event:', error);
      }
      
      return !error;
    } catch (error) {
      console.error('Audit logging error:', error);
      return false;
    }
  }, [getCurrentUser]);

  /**
   * Log bulk operation (audit-10)
   */
  const logBulkOperation = useCallback(async (
    operation, // 'create' | 'update' | 'delete' | 'import'
    entityType,
    entityIds,
    metadata = {}
  ) => {
    return logAuditEvent({
      action: `bulk_${operation}`,
      entityType,
      entityId: null,
      metadata: {
        ...metadata,
        operation_type: operation,
        affected_count: entityIds?.length || 0,
        entity_ids: entityIds?.slice(0, 100) || [], // Limit stored IDs
        truncated: entityIds?.length > 100
      }
    });
  }, [logAuditEvent]);

  /**
   * Log data export (audit-11)
   */
  const logDataExport = useCallback(async (
    entityType,
    exportFormat, // 'pdf' | 'excel' | 'csv' | 'json'
    recordCount,
    filters = {}
  ) => {
    return logAuditEvent({
      action: AUDIT_ACTIONS.DATA_EXPORT,
      entityType,
      metadata: {
        export_format: exportFormat,
        record_count: recordCount,
        filters_applied: filters,
        exported_at: new Date().toISOString()
      }
    });
  }, [logAuditEvent]);

  /**
   * Log authentication event (audit-8)
   */
  const logAuthEvent = useCallback(async (
    eventType, // 'login_success' | 'login_failed' | 'logout'
    email,
    errorMessage = null
  ) => {
    try {
      // For failed logins, we might not have a user session
      const logEntry = {
        user_id: null,
        user_email: email,
        action: eventType,
        entity_type: 'authentication',
        entity_id: null,
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          error_message: errorMessage
        }
      };

      const { error } = await supabase
        .from('access_logs')
        .insert(logEntry);

      if (error) {
        console.error('Failed to log auth event:', error);
      }
      
      return !error;
    } catch (error) {
      console.error('Auth logging error:', error);
      return false;
    }
  }, []);

  /**
   * Log status change with old/new values
   */
  const logStatusChange = useCallback(async (
    entityType,
    entityId,
    oldStatus,
    newStatus,
    additionalMetadata = {}
  ) => {
    return logAuditEvent({
      action: AUDIT_ACTIONS.STATUS_CHANGE,
      entityType,
      entityId,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus },
      metadata: {
        ...additionalMetadata,
        status_transition: `${oldStatus} → ${newStatus}`
      }
    });
  }, [logAuditEvent]);

  /**
   * Log permission/role change (audit-9)
   */
  const logPermissionChange = useCallback(async (
    changeType, // 'role_assignment' | 'role_removal' | 'permission_change'
    targetUserId,
    targetUserEmail,
    details = {}
  ) => {
    return logAuditEvent({
      action: AUDIT_ACTIONS.PERMISSION_CHANGE,
      entityType: ENTITY_TYPES.USER,
      entityId: targetUserId,
      metadata: {
        change_type: changeType,
        target_user_email: targetUserEmail,
        ...details
      }
    });
  }, [logAuditEvent]);

  /**
   * Log view/access event
   */
  const logViewEvent = useCallback(async (entityType, entityId, metadata = {}) => {
    return logAuditEvent({
      action: AUDIT_ACTIONS.VIEW,
      entityType,
      entityId,
      metadata
    });
  }, [logAuditEvent]);

  /**
   * Log CRUD operation with change tracking
   */
  const logCrudOperation = useCallback(async (
    action, // 'create' | 'update' | 'delete'
    entityType,
    entityId,
    oldValues = null,
    newValues = null,
    metadata = {}
  ) => {
    return logAuditEvent({
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      metadata
    });
  }, [logAuditEvent]);

  return {
    // Core function
    logAuditEvent,
    
    // Specialized loggers
    logBulkOperation,
    logDataExport,
    logAuthEvent,
    logStatusChange,
    logPermissionChange,
    logViewEvent,
    logCrudOperation,
    
    // Constants for external use
    AUDIT_ACTIONS,
    ENTITY_TYPES
  };
};

// Standalone function for use outside React components
export const logAuditEventStandalone = async ({
  action,
  entityType,
  entityId = null,
  metadata = {},
  userEmail = null
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('access_logs')
      .insert({
        user_id: user?.id || null,
        user_email: userEmail || user?.email || 'system',
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });

    return !error;
  } catch (error) {
    console.error('Standalone audit logging error:', error);
    return false;
  }
};

export default useAuditLogger;
