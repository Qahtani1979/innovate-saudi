import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useEntityPagination } from '@/hooks/useEntityPagination';

export function useApprovals(userEmail, { challengesPage = 1, pilotsPage = 1, expertsPage = 1 } = {}) {
    const { user } = useAuth();
    const queryClient = useAppQueryClient();
    const email = userEmail || user?.email;

    // 1. Pending Challenge Reviews
    const challenges = useEntityPagination({
        entityName: 'challenges',
        page: challengesPage,
        pageSize: 6, // Card grid
        select: '*',
        filters: {
            review_assigned_to: email,
            status: 'under_review'
        },
        enabled: !!email
    });

    // 2. Pending Pilot Approvals (Complex JSONB Filter)
    // We want: milestones @> '[{"requires_approval": true, "approval_status": "pending"}]'
    const pilots = useEntityPagination({
        entityName: 'pilots',
        page: pilotsPage,
        pageSize: 6,
        select: '*',
        filters: {
            'milestones': {
                operator: 'cs', // contains
                value: '[{"requires_approval": true, "approval_status": "pending"}]'
            }
        },
        enabled: !!email
    });

    // 3. Pending Expert Evaluations
    const experts = useEntityPagination({
        entityName: 'expert_evaluations',
        page: expertsPage,
        pageSize: 6,
        select: '*',
        filters: {
            recommendation: 'approve_with_conditions',
            // status: 'pending' // Assuming column exists
        },
        enabled: !!email
    });


    /**
     * @typedef {Object} ApprovalParams
     * @property {'challenge' | 'pilot'} type
     * @property {string} id
     * @property {Object} data
     */

    /** @type {ReturnType<typeof useMutation<void, Error, ApprovalParams>>} */
    const approveMutation = useMutation({
        /** @param {ApprovalParams} params */
        mutationFn: async (params) => {
            const { type, id, data } = params;
            if (type === 'challenge') {
                const { error } = await supabase.from('challenges').update(data).eq('id', id);
                if (error) throw error;
            } else if (type === 'pilot') {
                const { error } = await supabase.from('pilots').update(data).eq('id', id);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            challenges.refetch();
            experts.refetch();
            pilots.refetch();
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            toast.success('Approved successfully');
        },
        onError: (error) => {
            console.error('Approval error:', error);
            toast.error('Failed to approve');
        }
    });

    return {
        challenges,
        pilots,
        experts,
        approveMutation
    };
}


