import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

/**
 * Comprehensive audit logging hook for tracking all system activities
 * Logs to access_logs table with detailed metadata for Programs & Events
 * 
 * Usage:
 *   const { logActivity, logProgramActivity, logEventActivity } = useAuditLog();
 *   await logProgramActivity('created', program, { additional: 'data' });
 */
export function useAuditLog() {
  const { user } = useAuth();

  /**
   * Core logging function - logs to access_logs table
   */
  const logActivity = useCallback(async ({
    action,
    entityType,
    entityId,
    metadata = {},
    userId = null,
    userEmail = null
  }) => {
    try {
      const logEntry = {
        action,
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId || user?.id || null,
        user_email: userEmail || user?.email || null,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        },
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('access_logs').insert(logEntry);
      
      if (error) {
        console.warn('Failed to log activity:', error);
      }
      
      return !error;
    } catch (err) {
      console.warn('Error logging activity:', err);
      return false;
    }
  }, [user]);

  /**
   * Log program-specific activities with rich metadata
   */
  const logProgramActivity = useCallback(async (action, program, additionalMetadata = {}) => {
    const actionMap = {
      'created': 'program_created',
      'updated': 'program_updated',
      'deleted': 'program_deleted',
      'published': 'program_published',
      'unpublished': 'program_unpublished',
      'submitted': 'program_submitted_for_approval',
      'approved': 'program_approved',
      'rejected': 'program_rejected',
      'status_changed': 'program_status_changed',
      'enrollment_opened': 'program_enrollment_opened',
      'enrollment_closed': 'program_enrollment_closed',
      'participant_enrolled': 'program_participant_enrolled',
      'participant_removed': 'program_participant_removed',
      'milestone_completed': 'program_milestone_completed',
      'budget_updated': 'program_budget_updated',
      'event_added': 'program_event_added',
      'event_removed': 'program_event_removed',
      'cohort_created': 'program_cohort_created',
      'cohort_completed': 'program_cohort_completed',
      'viewed': 'program_viewed',
      'exported': 'program_exported'
    };

    const metadata = {
      program_name: program?.name_en || program?.name_ar,
      program_type: program?.program_type,
      program_status: program?.status,
      municipality_id: program?.municipality_id,
      sector_id: program?.sector_id,
      is_published: program?.is_published,
      start_date: program?.start_date,
      end_date: program?.end_date,
      max_participants: program?.max_participants,
      ...additionalMetadata
    };

    return logActivity({
      action: actionMap[action] || `program_${action}`,
      entityType: 'program',
      entityId: program?.id,
      metadata
    });
  }, [logActivity]);

  /**
   * Log event-specific activities with rich metadata
   */
  const logEventActivity = useCallback(async (action, event, additionalMetadata = {}) => {
    const actionMap = {
      'created': 'event_created',
      'updated': 'event_updated',
      'deleted': 'event_deleted',
      'published': 'event_published',
      'unpublished': 'event_unpublished',
      'submitted': 'event_submitted_for_approval',
      'approved': 'event_approved',
      'rejected': 'event_rejected',
      'cancelled': 'event_cancelled',
      'rescheduled': 'event_rescheduled',
      'registration_opened': 'event_registration_opened',
      'registration_closed': 'event_registration_closed',
      'user_registered': 'event_user_registered',
      'user_unregistered': 'event_user_unregistered',
      'waitlist_joined': 'event_waitlist_joined',
      'reminder_sent': 'event_reminder_sent',
      'started': 'event_started',
      'completed': 'event_completed',
      'attendance_marked': 'event_attendance_marked',
      'feedback_submitted': 'event_feedback_submitted',
      'viewed': 'event_viewed',
      'exported': 'event_exported'
    };

    const metadata = {
      event_title: event?.title_en || event?.title_ar,
      event_type: event?.event_type,
      event_status: event?.status,
      program_id: event?.program_id,
      municipality_id: event?.municipality_id,
      is_published: event?.is_published,
      is_virtual: event?.is_virtual,
      start_date: event?.start_date,
      end_date: event?.end_date,
      location: event?.location,
      max_attendees: event?.max_attendees,
      current_registrations: event?.current_registrations,
      ...additionalMetadata
    };

    return logActivity({
      action: actionMap[action] || `event_${action}`,
      entityType: 'event',
      entityId: event?.id,
      metadata
    });
  }, [logActivity]);

  /**
   * Log approval workflow activities
   */
  const logApprovalActivity = useCallback(async (action, entityType, entityId, approvalData = {}) => {
    const actionMap = {
      'submitted': 'approval_submitted',
      'approved': 'approval_granted',
      'rejected': 'approval_rejected',
      'escalated': 'approval_escalated',
      'delegated': 'approval_delegated',
      'cancelled': 'approval_cancelled',
      'expired': 'approval_expired'
    };

    return logActivity({
      action: actionMap[action] || `approval_${action}`,
      entityType: `${entityType}_approval`,
      entityId,
      metadata: {
        original_entity_type: entityType,
        approver_email: approvalData.approver_email,
        approval_level: approvalData.level,
        rejection_reason: approvalData.rejection_reason,
        sla_due_date: approvalData.sla_due_date,
        ...approvalData
      }
    });
  }, [logActivity]);

  /**
   * Log registration/enrollment activities
   */
  const logRegistrationActivity = useCallback(async (action, entityType, entityId, registrationData = {}) => {
    const actionPrefix = entityType === 'program' ? 'program' : 'event';
    
    return logActivity({
      action: `${actionPrefix}_${action}`,
      entityType: `${entityType}_registration`,
      entityId,
      metadata: {
        participant_email: registrationData.participant_email,
        participant_id: registrationData.participant_id,
        registration_type: registrationData.type,
        source: registrationData.source,
        ...registrationData
      }
    });
  }, [logActivity]);

  /**
   * Log bulk operations
   */
  const logBulkActivity = useCallback(async (action, entityType, entityIds, operationData = {}) => {
    return logActivity({
      action: `bulk_${action}`,
      entityType,
      entityId: entityIds[0], // Primary entity
      metadata: {
        affected_count: entityIds.length,
        affected_ids: entityIds.slice(0, 100), // Limit stored IDs
        operation_type: action,
        ...operationData
      }
    });
  }, [logActivity]);

  /**
   * Log data export activities
   */
  const logExportActivity = useCallback(async (entityType, exportData = {}) => {
    return logActivity({
      action: `${entityType}_exported`,
      entityType,
      entityId: exportData.entityId || null,
      metadata: {
        export_format: exportData.format,
        export_scope: exportData.scope,
        record_count: exportData.count,
        filters_applied: exportData.filters,
        ...exportData
      }
    });
  }, [logActivity]);

  return {
    logActivity,
    logProgramActivity,
    logEventActivity,
    logApprovalActivity,
    logRegistrationActivity,
    logBulkActivity,
    logExportActivity
  };
}

export default useAuditLog;
