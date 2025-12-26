
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for fetching audit logs (access_logs) for various entities.
 * 
 * @param {Object} filters
 * @param {string} filters.entityType - 'program', 'event', etc.
 * @param {string} filters.entityId - ID of the entity
 * @param {number} filters.limit - Limit results (default 50)
 */
export function useAuditLogs({ entityType, entityId, limit = 50 } = {}) {
    return useQuery({
        queryKey: ['audit-logs', entityType, entityId, limit],
        queryFn: async () => {
            let query = supabase
                .from('access_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (entityType) {
                // If entityType is 'program_event_approval', handle the complex OR logic if needed
                // but normally we pass specific type.
                // The original code had: query.or('entity_type.eq.program,entity_type.eq.event,entity_type.like.%_approval');
                // We can replicate that default if no entityType provided.
                query = query.eq('entity_type', entityType);
            } else {
                // Default behavior for ProgramEventAuditLog when no type specified
                query = query.or('entity_type.eq.program,entity_type.eq.event,entity_type.like.%_approval');
            }

            if (entityId) {
                query = query.eq('entity_id', entityId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}
