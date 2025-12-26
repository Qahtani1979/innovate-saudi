import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

export function usePilotAuditLogger() {
    const { user } = useAuth();

    const logActionMutation = useMutation({
        mutationFn: async ({ action, pilotId, metadata }) => {
            await supabase.from('access_logs').insert({
                action,
                entity_type: 'pilot',
                entity_id: pilotId,
                metadata,
                user_email: user?.email
            });
        },
        onError: (error) => console.error('Error logging pilot action:', error)
    });

    const logBulkOperationMutation = useMutation({
        mutationFn: async ({ operation, entityIds }) => {
            const { error } = await supabase.rpc('log_pilot_bulk_operation', {
                p_operation: operation,
                p_entity_ids: entityIds,
                p_user_email: user?.email
            });
            if (error) throw error;
        },
        onError: (error) => console.error('Error logging bulk operation:', error)
    });

    const logDataExportMutation = useMutation({
        mutationFn: async ({ exportType, filters, recordCount }) => {
            const { error } = await supabase.rpc('log_pilot_export', {
                p_export_type: exportType,
                p_filters: filters,
                p_user_email: user?.email,
                p_record_count: recordCount
            });
            if (error) throw error;
        },
        onError: (error) => console.error('Error logging export:', error)
    });

    const logStageChangeMutation = useMutation({
        mutationFn: async ({ pilotId, oldStage, newStage }) => {
            await supabase.from('access_logs').insert({
                action: 'stage_change',
                entity_type: 'pilot',
                entity_id: pilotId,
                metadata: {
                    old_stage: oldStage,
                    new_stage: newStage
                },
                user_email: user?.email
            });
        },
        onError: (error) => console.error('Error logging stage change:', error)
    });

    return {
        logPilotAction: (action, pilotId, metadata) => logActionMutation.mutate({ action, pilotId, metadata }),
        logBulkOperation: (operation, entityIds) => logBulkOperationMutation.mutate({ operation, entityIds }),
        logDataExport: (exportType, filters, recordCount) => logDataExportMutation.mutate({ exportType, filters, recordCount }),
        logStageChange: (pilotId, oldStage, newStage) => logStageChangeMutation.mutate({ pilotId, oldStage, newStage })
    };
}
