import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useChallengeProposals(challengeIds = []) {
    return useQuery({
        queryKey: ['challenge-proposals', challengeIds],
        queryFn: async () => {
            if (!challengeIds.length) return [];

            const { data, error } = await supabase
                .from('challenge_proposals')
                .select('*')
                .in('challenge_id', challengeIds)
                .eq('is_deleted', false);

            if (error) throw error;
            return data || [];
        },
        enabled: challengeIds.length > 0,
        staleTime: 5 * 60 * 1000
    });
}

export function useAllChallengeProposals() {
    return useQuery({
        queryKey: ['all-challenge-proposals'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenge_proposals')
                .select('*')
                .eq('is_deleted', false);

            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000
    });
}

export function useProposal(id) {
    return useQuery({
        queryKey: ['proposal', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenge_proposals')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}

export function useChallengeProposalMutations() {
    const queryClient = useAppQueryClient();

    const createProposal = useMutation({
        /**
         * @param {any} proposal
         */
        mutationFn: async (proposal) => {
            const { data, error } = await supabase
                .from('challenge_proposals')
                .insert(proposal)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['all-challenge-proposals'] });
            toast.success('Proposal created successfully');
        },
        onError: (error) => {
            console.error('Error creating proposal:', error);
            toast.error('Failed to create proposal');
        }
    });

    const updateProposal = useMutation({
        /**
         * @param {{ id: string, updates: any }} params
         */
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase
                .from('challenge_proposals')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['all-challenge-proposals'] });
            toast.success('Proposal updated successfully');
        },
        onError: (error) => {
            console.error('Error updating proposal:', error);
            toast.error('Failed to update proposal');
        }
    });

    const deleteProposal = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('challenge_proposals').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['all-challenge-proposals'] });
            toast.success('Proposal deleted successfully');
        }
    });

    return { createProposal, updateProposal, deleteProposal };
}



