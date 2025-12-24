import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for fetching sandbox incidents.
 */
export function useSandboxIncidents(options = {}) {
    const { sandboxId, severity, status, limit = 100 } = options;

    return useQuery({
        queryKey: ['sandbox-incidents', { sandboxId, severity, status, limit }],
        queryFn: async () => {
            let query = supabase
                .from('sandbox_incidents')
                .select(`
          *,
          sandbox:sandboxes(id, name_en, name_ar, code)
        `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (sandboxId) query = query.eq('sandbox_id', sandboxId);
            if (options.sandboxIds && options.sandboxIds.length > 0) query = query.in('sandbox_id', options.sandboxIds);
            if (severity) query = query.eq('severity', severity);
            if (status) query = query.eq('status', status);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook for sandbox incident mutations.
 */
export function useSandboxIncidentMutations() {
    const queryClient = useQueryClient();

    const createIncident = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase
                .from('sandbox_incidents')
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-incidents'] });
            toast.success('Incident reported successfully');
        },
        onError: (error) => {
            toast.error(`Failed to report incident: ${error.message}`);
        }
    });

    return {
        createIncident,
        isCreating: createIncident.isPending
    };
}
