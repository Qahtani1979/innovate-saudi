import { useQuery } from '@/hooks/useAppQueryClient';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';

/**
 * Hook to aggregate data for Conversion Hub and Platform Analytics.
 * Centralizes multiple fetch calls to respect visibility rules.
 */
export function usePlatformAnalytics() {
    const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

    // Helper for simple fetches
    const fetchTable = (table, queryKey) => useQuery({
        queryKey: [queryKey],
        queryFn: () => fetchWithVisibility(table, '*'),
        enabled: !isVisibilityLoading,
        initialData: []
    });

    const { data: challenges } = fetchTable('challenges', 'challenges-analytics');
    const { data: pilots } = fetchTable('pilots', 'pilots-analytics');
    const { data: citizenIdeas } = fetchTable('citizen_ideas', 'ideas-analytics');
    const { data: innovationProposals } = fetchTable('innovation_proposals', 'proposals-analytics');
    const { data: rdProjects } = fetchTable('rd_projects', 'rd-analytics');
    const { data: solutions } = fetchTable('solutions', 'solutions-analytics');
    const { data: scalingPlans } = fetchTable('scaling_plans', 'scaling-analytics');
    const { data: policies } = fetchTable('policy_recommendations', 'policies-analytics');
    const { data: contracts } = fetchTable('contracts', 'contracts-analytics');
    const { data: challengeRelations } = fetchTable('challenge_relations', 'relations-analytics');
    const { data: rdCalls } = fetchTable('rd_calls', 'rd-calls-analytics');

    const isLoading = isVisibilityLoading;

    return {
        challenges,
        pilots,
        citizenIdeas,
        innovationProposals,
        rdProjects,
        solutions,
        scalingPlans,
        policies,
        contracts,
        challengeRelations,
        rdCalls,
        isLoading
    };
}

