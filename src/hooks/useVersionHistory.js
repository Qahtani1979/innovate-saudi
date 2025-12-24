import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch version history for any entity
 * @param {string} tableName - The name of the table to fetch history for
 * @param {string} recordId - The ID of the record
 * @param {object} options - Optional params like entityType for system_activities
 */
export function useVersionHistory(tableName, recordId, options = {}) {
    const { data: history = [], isLoading, error } = useQuery({
        queryKey: ['version-history', tableName, recordId, options],
        queryFn: async () => {
            // If entityType is provided, query system_activities
            if (options.entityType) {
                let query = supabase
                    .from('system_activities')
                    .select('*')
                    .eq('entity_type', options.entityType)
                    .order('created_at', { ascending: false });

                if (recordId) {
                    query = query.eq('entity_id', recordId);
                }

                const { data, error } = await query;
                if (error) {
                    console.warn('System activities fetch error:', error);
                    return [];
                }
                return data;
            }

            if (!tableName || !recordId) return [];

            const { data, error } = await supabase
                .from('audit_logs') // Assuming version history is stored in audit_logs or a specific history table
                .select('*')
                .eq('table_name', tableName)
                .eq('record_id', recordId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!((tableName && recordId) || options.entityType),
    });

    return { history, isLoading, error };
}

/**
 * Hook to fetch platform version history (changelog)
 */
export function usePlatformVersionHistory() {
    const { data: versions = [], isLoading, error } = useQuery({
        queryKey: ['platform-versions'],
        queryFn: async () => {
            // This might come from a 'platform_versions' table or a static file/config
            // For now, assuming a table
            const { data, error } = await supabase
                .from('platform_versions')
                .select('*')
                .order('release_date', { ascending: false });

            if (error) {
                if (error.code === '42P01') return []; // Table doesn't exist yet
                throw error;
            }
            return data;
        },
    });

    return { versions, isLoading, error };
}
