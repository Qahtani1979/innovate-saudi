import { supabase } from '@/integrations/supabase/client';

/**
 * Log a pilot audit action
 */
export const logPilotAction = async (action, pilotId, metadata = {}, userEmail = null) => {
  try {
    await supabase.from('access_logs').insert({
      action,
      entity_type: 'pilot',
      entity_id: pilotId,
      metadata,
      user_email: userEmail
    });
  } catch (error) {
    console.error('Error logging pilot action:', error);
  }
};

/**
 * Log a bulk operation on pilots
 */
export const logBulkOperation = async (operation, entityIds, userEmail) => {
  try {
    const { error } = await supabase.rpc('log_pilot_bulk_operation', {
      p_operation: operation,
      p_entity_ids: entityIds,
      p_user_email: userEmail
    });
    
    if (error) {
      console.error('Error logging bulk operation:', error);
    }
  } catch (error) {
    console.error('Error logging bulk operation:', error);
  }
};

/**
 * Log a pilot data export
 */
export const logDataExport = async (exportType, filters, userEmail, recordCount) => {
  try {
    const { error } = await supabase.rpc('log_pilot_export', {
      p_export_type: exportType,
      p_filters: filters,
      p_user_email: userEmail,
      p_record_count: recordCount
    });
    
    if (error) {
      console.error('Error logging export:', error);
    }
  } catch (error) {
    console.error('Error logging export:', error);
  }
};

/**
 * Log pilot stage change
 */
export const logStageChange = async (pilotId, oldStage, newStage, userEmail) => {
  try {
    await supabase.from('access_logs').insert({
      action: 'stage_change',
      entity_type: 'pilot',
      entity_id: pilotId,
      metadata: {
        old_stage: oldStage,
        new_stage: newStage
      },
      user_email: userEmail
    });
  } catch (error) {
    console.error('Error logging stage change:', error);
  }
};

export default {
  logPilotAction,
  logBulkOperation,
  logDataExport,
  logStageChange
};
