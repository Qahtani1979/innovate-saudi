import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProposalReviewData() {
    const queryClient = useQueryClient();

    // 1. Fetch proposals
    const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
        queryKey: ['rd-proposals-review'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_proposals')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });

    // 2. Check Consensus Mutation
    const checkConsensus = useMutation({
        mutationFn: async (proposalId) => {
            const { data, error } = await supabase.functions.invoke('check-consensus', {
                body: {
                    entity_type: 'rd_proposal',
                    entity_id: proposalId
                }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposals-review'] });
        }
    });

    return {
        proposals,
        isLoading: proposalsLoading,
        checkConsensus
    };
}
