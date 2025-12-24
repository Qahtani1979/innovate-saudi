import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMyRoleRequests(email) {
    return useQuery({
        queryKey: ['role-requests', email],
        queryFn: async () => {
            if (!email) return [];
            const { data, error } = await supabase
                .from('role_requests')
                .select('*')
                .eq('user_email', email)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!email
    });
}

export function useRoleRequestRateLimit(email) {
    const { data: requests, isLoading, error } = useMyRoleRequests(email);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).getTime();
    const recentRequests = requests?.filter(r => new Date(r.created_at).getTime() >= twentyFourHoursAgo) || [];

    return {
        count: recentRequests.length,
        remaining: Math.max(0, 3 - recentRequests.length),
        isLimitReached: recentRequests.length >= 3,
        isLoading,
        error
    };
}

export function usePendingRoleRequests() {
    return useQuery({
        queryKey: ['role-requests', 'pending'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('role_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * @typedef {Object} RoleRequestData
 * @property {string} [user_id]
 * @property {string} user_email
 * @property {string} requested_role
 * @property {string} justification
 * @property {string} [status]
 */

/**
 * @typedef {Object} RoleRequestUpdateData
 * @property {string} id
 * @property {string} status
 * @property {string} [rejection_reason]
 * @property {string} [roleId]
 * @property {string} [userId]
 */

export function useRoleRequestMutations() {
    const queryClient = useQueryClient();

    /** @type {import('@tanstack/react-query').UseMutationResult<void, Error, RoleRequestData>} */
    const requestRole = useMutation({
        mutationFn: async (requestData) => {
            const { error } = await supabase.from('role_requests').insert(requestData);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['role-requests', variables.user_email] });
            queryClient.invalidateQueries({ queryKey: ['role-requests', 'pending'] });
            toast.success('Role request submitted');
        },
        onError: (error) => toast.error(error.message)
    });

    /** @type {import('@tanstack/react-query').UseMutationResult<void, Error, RoleRequestUpdateData>} */
    const updateRequestStatus = useMutation({
        mutationFn: async ({ id, status, rejection_reason, roleId, userId }) => {
            // Update request status
            const { error: updateError } = await supabase
                .from('role_requests')
                .update({
                    status,
                    rejection_reason,
                    processed_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            // If approved, assign the role
            if (status === 'approved' && roleId && userId) {
                const { error: assignError } = await supabase
                    .from('user_roles')
                    .insert({
                        user_