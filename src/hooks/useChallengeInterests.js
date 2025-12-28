import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for fetching challenge relationships (pilots, solutions, programs, similar challenges).
 * Note: Uses 'challenge_relations' for entity-to-entity links.
 */
export function useChallengeInterests(challengeId) {
    return useQuery({
        queryKey: ['challenge-interests', challengeId],
        queryFn: async () => {
            if (!challengeId) return [];
            // Use challenge_relations instead of challenge_interests for functional links
            const { data, error } = await supabase
                .from('challenge_relations')
                .select('*')
                .eq('challenge_id', challengeId);

            if (error) {
                console.warn('challenge_relations query failed, falling back to challenge_interests:', error.message);
                // Fallback to interests if relations table is missing or empty
                const { data: fallbackData } = await supabase
                    .from('challenge_interests')
                    .select('*')
                    .eq('challenge_id', challengeId);
                return fallbackData || [];
            }
            return data || [];
        },
        enabled: !!challengeId,
        staleTime: 1000 * 60 * 5
    });
}

export function useChallengeInterestMutations(challengeId) {
    const queryClient = useAppQueryClient();

    const addInterest = useMutation({
        mutationFn: async (relationData) => {
            const { error } = await supabase.from('challenge_relations').insert(relationData);
            if (error) throw error;
        },
        onSuccess: () => {
            if (challengeId) {
                queryClient.invalidateQueries({ queryKey: ['challenge-interests', challengeId] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['challenge-interests'] });
            }
            toast.success('Relation added successfully');
        }
    });

    const removeInterest = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('challenge_relations').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            if (challengeId) {
                queryClient.invalidateQueries({ queryKey: ['challenge-interests', challengeId] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['challenge-interests'] });
            }
            toast.success('Relation removed successfully');
        }
    });

    return { addInterest, removeInterest };
}



