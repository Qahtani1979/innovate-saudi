import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch comprehensive performance stats for a provider.
 * Aggregates solutions, pilots, and matches to calculate win rates and success metrics.
 */
export function useProviderPerformanceStats(providerId) {
    return useQuery({
        queryKey: ['provider-performance-stats', providerId],
        queryFn: async () => {
            if (!providerId) throw new Error('Provider ID is required');

            // 1. Fetch Solutions
            const { data: solutions, error: solutionsError } = await supabase
                .from('solutions')
                .select('id, name_en, name_ar, sectors, ratings, deployment_count')
                .eq('provider_id', providerId);

            if (solutionsError) throw solutionsError;

            if (!solutions || solutions.length === 0) {
                return {
                    winRate: 0,
                    successRate: 0,
                    avgRating: 0,
                    totalDeployments: 0,
                    sectorData: [],
                    raw: { solutions: [], pilots: [], matches: [] }
                };
            }

            const solutionIds = solutions.map(s => s.id);

            // 2. Fetch Pilots (for those solutions)
            const { data: pilots, error: pilotsError } = await supabase
                .from('pilots')
                .select('id, stage, recommendation, solution_id')
                .in('solution_id', solutionIds);

            if (pilotsError) throw pilotsError;

            // 3. Fetch Matches (for Win Rate)
            const { data: matches, error: matchesError } = await supabase
                .from('challenge_solution_matches')
                .select('id, solution_id')
                .in('solution_id', solutionIds);

            if (matchesError) throw matchesError;

            // 4. Calculate Derived Metrics
            const winRate = matches.length > 0 ? (pilots.length / matches.length) * 100 : 0;

            const completedPilots = pilots.filter(p => ['completed', 'scaled'].includes(p.stage));
            const successfulPilots = pilots.filter(p => p.recommendation === 'scale');
            const successRate = completedPilots.length > 0
                ? (successfulPilots.length / completedPilots.length) * 100
                : 0;

            const avgRating = solutions.reduce((sum, s) => sum + (s.ratings?.average || 0), 0) / solutions.length;
            const totalDeployments = solutions.reduce((sum, s) => sum + (s.deployment_count || 0), 0);

            // Sector Breakdown
            const sectorCounts = solutions.reduce((acc, s) => {
                s.sectors?.forEach(sector => {
                    acc[sector] = (acc[sector] || 0) + 1;
                });
                return acc;
            }, {});

            const sectorData = Object.entries(sectorCounts).map(([sector, count]) => ({
                sector: sector.replace(/_/g, ' '),
                count
            }));

            return {
                winRate,
                successRate,
                avgRating,
                totalDeployments,
                sectorData,
                raw: { solutions, pilots, matches }
            };
        },
        enabled: !!providerId,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

/**
 * Hook to fetch marketplace analytics.
 * Aggregates global solutions and pilots data.
 */
export function useMarketplaceAnalytics() {
    return useQuery({
        queryKey: ['marketplace-analytics'],
        queryFn: async () => {
            // 1. Fetch All Solutions
            const { data: solutions, error: solutionsError } = await supabase
                .from('solutions')
                .select('id, name_en, name_ar, sectors, ratings, provider_id, provider_name, created_at, deployments:pilots(id)')
                .eq('is_published', true);

            if (solutionsError) throw solutionsError;

            // 2. Fetch All Pilots
            const { data: pilots, error: pilotsError } = await supabase
                .from('pilots')
                .select('id, stage, created_at')
                .eq('is_deleted', false);

            if (pilotsError) throw pilotsError;

            // 3. Process Data
            const totalSolutions = solutions.length;
            const totalDeployments = pilots.length; // Or use solutions[].deployments length if that's the canonical source

            // Trending Sectors
            const sectorCounts = solutions.reduce((acc, s) => {
                s.sectors?.forEach(sector => {
                    acc[sector] = (acc[sector] || 0) + 1;
                });
                return acc;
            }, {});

            const trendingData = Object.entries(sectorCounts)
                .map(([sector, count]) => ({ sector, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6);

            // Top Solutions
            const topSolutions = solutions
                .map(s => ({
                    id: s.id,
                    name: s.name_en,
                    deployments: s.deployments?.length || 0,
                    rating: s.ratings?.average || 0
                }))
                .sort((a, b) => b.deployments - a.deployments)
                .slice(0, 5);

            // Provider Leaderboard
            const providerStats = solutions.reduce((acc, s) => {
                const provider = s.provider_name || s.provider_id || 'Unknown';
                if (!acc[provider]) {
                    acc[provider] = { deployments: 0, solutions: 0, avgRating: 0, ratings: [] };
                }
                acc[provider].solutions += 1;
                acc[provider].deployments += s.deployments?.length || 0;
                if (s.ratings?.average) acc[provider].ratings.push(s.ratings.average);
                return acc;
            }, {});

            const leaderboard = Object.entries(providerStats)
                .map(([provider, stats]) => ({
                    provider,
                    deployments: stats.deployments,
                    solutions: stats.solutions,
                    avgRating: stats.ratings.length > 0
                        ? (stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(1)
                        : 0
                }))
                .sort((a, b) => b.deployments - a.deployments)
                .slice(0, 10);

            return {
                totalSolutions,
                totalDeployments,
                trendingData,
                topSolutions,
                leaderboard,
                providerCount: Object.keys(providerStats).length
            };
        },
        staleTime: 1000 * 60 * 15 // 15 minutes (heavy query)
    });
}

