import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAuditLogs(filters = {}) {
    return useQuery({
        queryKey: ['audit-logs', filters],
        queryFn: async () => {
            let query = supabase
                .from('access_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);

            // Apply filters if needed (example logic)
            if (filters.entity_type && filters.entity_type !== 'all') {
                query = query.eq('entity_type', filters.entity_type);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 30 * 1000 // Shorter cache for audit logs
    });
}

export function useAudits(options = {}) {
    return useQuery({
        queryKey: ['audits-registry', options],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('audits')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    });
}

export function useAudit(auditId) {
    return useQuery({
        queryKey: ['audit-detail', auditId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('audits')
                .select('*')
                .eq('id', auditId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!auditId
    });
}

export function useAuditMutations() {
    const queryClient = useQueryClient();

    const logAction = useMutation({
        mutationFn: async (logData) => {
            const { error } = await supabase
                .from('access_logs')
                .insert(logData);
            if (error) throw error;
        },
        onSuccess: () => {
            // Typically don't need to invalidate unless showing real-time logs
            queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
        },
        onError: (error) => {
            console.error('Failed to log action:', error);
            // Fails silently for user, but logs to console
        }
    });

    return {
        logAction
    };
}
