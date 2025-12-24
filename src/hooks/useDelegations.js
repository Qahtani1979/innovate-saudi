import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * @param {string} userEmail 
 */
export function usePendingDelegations(userEmail) {
    return useQuery({
        queryKey: ['pending-delegations', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data, error } = await supabase
                .from('delegation_rules')
                .select('*')
                .or(`delegator_email.eq.${userEmail}`)
                .or('approved_by.is.null');
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });
}

/**
 * @param {string} email 
 */
export function useMyDelegations(email) {
    return useQuery({
        queryKey: ['my-delegations', email],
        queryFn: async () => {
            if (!email) return [];
            const { data, error } = await supabase
                .from('delegation_rules')
                .select('*')
                .eq('delegator_email', email);
            if (error) throw error;
            return data || [];
        },
        enabled: !!email
    });
}

/**
 * @param {string} email 
 */
export function useReceivedDelegations(email) {
    return useQuery({
        queryKey: ['received-delegations', email],
        queryFn: async () => {
            if (!email) return [];
            const { data, error } = await supabase
                .from('delegation_rules')
                .select('*')
                .eq('delegate_email', email);
            if (error) throw error;
            return data || [];
        },
        enabled: !!email
    });
}

export function useDelegationMutations() {
    const queryClient = useQueryClient();

    const createDelegation = useMutation({
        /** @param {any} delegationData */
        mutationFn: async (delegationData) => {
            const { error } = await supabase
                .from('delegation_rules')
                .insert({ ...(delegationData || {}), is_active: true });
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            const email = (variables && typeof variables === 'object') ? (variables.delegator_email || '') : '';
            queryClient.invalidateQueries({ queryKey: ['my-delegations', email] });
            queryClient.invalidateQueries({ queryKey: ['pending-delegations'] });
            toast.success('Delegation created');
        },
        onError: (error) => toast.error(error.message)
    });

    const deleteDelegation = useMutation({
        /** @param {string} id */
        mutationFn: async (id) => {
            const { error } = await supabase.from('delegation_rules').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-delegations'] });
            queryClient.invalidateQueries({ queryKey: ['received-delegations'] });
            queryClient.invalidateQueries({ queryKey: ['pending-delegations'] });
            toast.success('Delegation removed');
        },
        onError: (error) => toast.error(error.message)
    });

    const approveDelegation = useMutation({
        /** @param {{ delegation_id: string, action: 'approve' | 'reject', approver_email: string, comments?: string, reason?: string }} params */
        mutationFn: async ({ delegation_id, action, approver_email, comments, reason }) => {
            const updateData = {
                is_active: action === 'approve',
                approved_by: approver_email,
                approval_date: new Date().toISOString(),
                comments: comments || reason
            };

            const { error } = await supabase
                .from('delegation_rules')
                .update(updateData)
                .eq('id', delegation_id);

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            const action = (variables && typeof variables === 'object') ? variables.action : 'approve';
            queryClient.invalidateQueries({ queryKey: ['pending-delegations'] });
            queryClient.invalidateQueries({ queryKey: ['my-delegations'] });
            queryClient.invalidateQueries({ queryKey: ['received-delegations'] });
            toast.success(action === 'approve' ? 'Delegation approved' : 'Delegation rejected');
        },
        onError: (error) => toast.error(error.message)
    });

    return { createDelegation, deleteDelegation, approveDelegation };
}
