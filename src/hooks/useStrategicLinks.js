import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing strategic plan challenge links
 */
export function useStrategicLinks(challengeId = null) {
    const queryClient = useAppQueryClient();

    const query = useQuery({
        queryKey: ['strategic-links', challengeId],
        queryFn: async () => {
            let q = supabase.from('strategic_plan_challenge_links').select('*');
            if (challengeId) {
                q = q.eq('challenge_id', challengeId);
            }
            const { data, error } = await q;
            if (error) throw error;
            return data || [];
        },
        enabled: true
    });

    const updateLinksMutation = useMutation({
        /** @param {{challengeId: string, selectedPlanIds: string[], existingLinks: any[]}} params */
        mutationFn: async ({ challengeId, selectedPlanIds, existingLinks }) => {
            if (!challengeId || challengeId === 'preview') return;

            const currentLinks = existingLinks.map(l => l.strategic_plan_id);
            const toAdd = selectedPlanIds.filter(id => !currentLinks.includes(id));
            const toRemove = currentLinks.filter(id => !selectedPlanIds.includes(id));

            const operations = [];

            if (toAdd.length > 0) {
                operations.push(
                    supabase.from('strategic_plan_challenge_links').insert(
                        toAdd.map(plan_id => ({
                            strategic_plan_id: plan_id,
                            challenge_id: challengeId,
                            contribution_type: 'addresses',
                            strategic_objective: 'objective', // Placeholder to satisfy DB constraint
                            linked_date: new Date().toISOString()
                        }))
                    )
                );
            }

            for (const plan_id of toRemove) {
                const link = existingLinks.find(l => l.strategic_plan_id === plan_id);
                if (link) {
                    operations.push(
                        supabase.from('strategic_plan_challenge_links').delete().eq('id', link.id)
                    );
                }
            }

            const results = await Promise.all(operations);
            const errors = results.filter(r => r.error).map(r => r.error);
            if (errors.length > 0) throw errors[0];

            return { added: toAdd.length, removed: toRemove.length };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['strategic-links'] });
            queryClient.invalidateQueries({ queryKey: ['strategic-plan-challenge-links'] });
        }
    });

    return {
        links: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        updateLinks: updateLinksMutation.mutateAsync,
        isUpdating: updateLinksMutation.isPending
    };
}

