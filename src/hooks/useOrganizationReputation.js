import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing organization reputation logic.
 */
export function useOrganizationReputation(organizationId) {
    const queryClient = useAppQueryClient();

    const { data: reputationData } = useQuery({
        queryKey: ['organization-reputation-factors', organizationId],
        queryFn: async () => {
            if (!organizationId) return null;

            // Parallel fetch for factors
            const [orgRes, solutionsRes, pilotsRes] = await Promise.all([
                supabase.from('organizations').select('reputation_score, reputation_factors').eq('id', organizationId).maybeSingle(),
                supabase.from('solutions').select('average_rating').eq('provider_id', organizationId),
                supabase.from('pilots').select('id, stage, team, stakeholders')
            ]);

            if (orgRes.error) throw orgRes.error;

            // Filter pilots client-side for complex join verification 
            // (pilots where org IS in team OR IS stakeholder)
            const relevantPilots = (pilotsRes.data || []).filter(p =>
                p.team?.some(t => t.organization_id === organizationId) ||
                p.stakeholders?.some(s => s.organization_id === organizationId)
            );

            return {
                org: orgRes.data,
                solutions: solutionsRes.data || [],
                pilots: relevantPilots
            };
        },
        enabled: !!organizationId,
        staleTime: 1000 * 60 * 15 // 15 minutes, doesn't change fast
    });

    const updateReputation = useMutation({
        mutationFn: async () => {
            if (!reputationData) return;

            const { solutions, pilots } = reputationData;

            const avgRating = solutions.reduce((sum, s) => sum + (s.average_rating || 0), 0) / (solutions.length || 1);
            const successRate = pilots.length > 0
                ? (pilots.filter(p => p.stage === 'completed' || p.stage === 'scaled').length / pilots.length * 100)
                : 0;

            const reputationScore = Math.round(
                (avgRating / 5 * 40) +
                (successRate * 0.4) +
                (Math.min(solutions.length, 10) * 2)
            );

            const { error } = await supabase.from('organizations').update({
                reputation_score: reputationScore,
                reputation_factors: {
                    avg_solution_rating: avgRating,
                    pilot_success_rate: successRate,
                    solution_count: solutions.length,
                    pilot_count: pilots.length
                }
            }).eq('id', organizationId);

            if (error) throw error;
            return reputationScore;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization-reputation-factors', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['org', organizationId] }); // Invalidate general org query
        }
    });

    return {
        reputationData,
        updateReputation
    };
}

