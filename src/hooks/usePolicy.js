import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePolicy(policyId) {
    return useQuery({
        queryKey: ['policy', policyId],
        queryFn: async () => {
            if (!policyId) return null;
            const { data, error } = await supabase
                .from('policy_recommendations')
                .select('*')
                .eq('id', policyId)
                .eq('is_deleted', false)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!policyId
    });
}

export function usePolicyMutations() {
    const queryClient = useQueryClient();

    const createPolicy = useMutation({
        mutationFn: async (policyData) => {
            const { data, error } = await supabase
                .from('policy_recommendations')
                .insert(policyData)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['policies']);
            toast.success('Policy created successfully');
        },
        onError: (error) => {
            toast.error('Failed to create policy: ' + error.message);
        }
    });

    // Placeholder for audit logger - in real implementation, import useAuditLogger
    // import { useAuditLogger } from './useAuditLogger'; 

    const updatePolicy = useMutation({
        mutationFn: async ({ id, ...updates }) => {
            // Fetch current state for logging
            const { data: currentPolicy, error: fetchError } = await supabase
                .from('policy_recommendations')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            const { data, error } = await supabase
                .from('policy_recommendations')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;

            // Basic logging - enhance as needed
            try {
                await supabase.from('system_activities').insert({
                    entity_type: 'PolicyRecommendation',
                    entity_id: id,
                    action_type: 'updated',
                    // user_email: user?.email, // User context needed
                    changes: updates,
                    metadata: { previous_state: currentPolicy }
                });
            } catch (e) {
                console.error('Logging failed', e);
            }

            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['policies']);
            queryClient.invalidateQueries(['policy', data.id]);
            toast.success('Policy updated successfully');
        },
        onError: (error) => {
            toast.error('Failed to update policy: ' + error.message);
        }
    });

    return { createPolicy, updatePolicy };
}
