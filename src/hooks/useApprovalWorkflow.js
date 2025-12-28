import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useApprovalRequests(entityType, entityId) {
    return useQuery({
        queryKey: ['approval-requests', entityType, entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('approval_requests')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!(entityType && entityId)
    });
}

export function useApprovalWorkflowMutations(entityType, entityId) {
    const queryClient = useAppQueryClient();

    const createApprovalRequest = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase
                .from('approval_requests')
                .insert(data)
                .select()
                .single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['approval-requests', entityType, entityId]);
            toast.success('Approval request created');
        },
        onError: (error) => {
            console.error('Failed to create approval request:', error);
            toast.error('Failed to create approval request');
        }
    });

    const updateApprovalRequest = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: result, error } = await supabase
                .from('approval_requests')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['approval-requests', entityType, entityId]);
            toast.success('Approval request updated');
        },
        onError: (error) => {
            console.error('Failed to update approval request:', error);
            toast.error('Failed to update approval request');
        }
    });

    return {
        createApprovalRequest,
        updateApprovalRequest
    };
}



