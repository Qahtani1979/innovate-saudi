import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProposals(options = {}) {
    const queryClient = useQueryClient();
    const { user } = options;

    const useUserProposals = () => useQuery({
        queryKey: ['user-proposals', user?.email],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenge_proposals')
                .select('*')
                .or(`proposer_email.eq.${user?.email},created_by.eq.${user?.email}`);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });

    const useSubmitProposal = () => useMutation({
        mutationFn: async (proposalData) => {
            const { data, error } = await supabase.from('challenge_proposals').insert(proposalData).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user-proposals']);
            toast.success('Proposal submitted successfully');
        }
    });

    return {
        useUserProposals,
        useSubmitProposal
    };
}
