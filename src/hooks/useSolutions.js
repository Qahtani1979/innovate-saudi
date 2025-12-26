import { useQuery } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSolutions({ publishedOnly = true, limit = 100, searchQuery = '' } = {}) {
    const queryClient = useAppQueryClient();

    const { data: solutions = [], isLoading, error } = useQuery({
        queryKey: ['solutions', { publishedOnly, limit, searchQuery }],
        queryFn: async () => {
            let query = supabase
                .from('solutions')
                .select('*')
                .limit(limit);

            if (publishedOnly) {
                query = query.eq('is_published', true);
            }

            if (searchQuery) {
                query = query.or(`name_en.ilike.%${searchQuery}%,name_ar.ilike.%${searchQuery}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    return {
        solutions,
        isLoading,
        error
    };
}

export function useMatchedSolutions(municipalityId, challenges = []) {
    const { language } = { language: 'en' }; // Basic fallback, though usually we strictly rely on data

    return useQuery({
        queryKey: ['matched-solutions', municipalityId, challenges.length],
        queryFn: async () => {
            if (challenges.length === 0) return [];

            const sectors = [...new Set(challenges.map(c => c.sector).filter(Boolean))];

            let query = supabase
                .from('solutions')
                .select('*, providers(name_en, name_ar)')
                .eq('is_published', true)
                .eq('is_verified', true)
                .limit(6);

            if (sectors.length > 0) {
                query = query.in('sector', sectors);
            }

            const { data, error } = await query;
            if (error) throw error;

            return data?.map(s => ({
                ...s,
                provider_name: s.providers?.name_en // Simplified for data layer
            })) || [];
        },
        enabled: challenges.length > 0,
        staleTime: 1000 * 60 * 15 // 15 mins
    });
}

export function useSolution(solutionId) {
    return useQuery({
        queryKey: ['solution', solutionId],
        queryFn: async () => {
            if (!solutionId) return null;
            const { data, error } = await supabase
                .from('solutions')
                .select('*')
                .eq('id', solutionId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!solutionId,
        staleTime: 1000 * 60 * 5
    });
}

export function useSimilarSolutions({ solutionId, sectors = [], limit = 5 }) {
    return useQuery({
        queryKey: ['similar-solutions', solutionId, sectors, limit],
        queryFn: async () => {
            if (!solutionId || sectors.length === 0) return [];

            const { data, error } = await supabase
                .from('solutions')
                .select('*')
                .neq('id', solutionId)
                .overlaps('sectors', sectors)
                .order('rating', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionId && sectors.length > 0,
        staleTime: 1000 * 60 * 10 // 10 minutes
    });
}

export function useSolutionVersions(solutionId) {
    return useQuery({
        queryKey: ['solution-versions', solutionId],
        queryFn: async () => {
            const { data: current, error } = await supabase.from('solutions').select('*').eq('id', solutionId).single();
            if (error) throw error;
            if (!current) return [];

            const allVersions = [];
            let currentVersion = current;

            // Limit depth to prevent infinite loops
            while (currentVersion?.previous_version_id && allVersions.length < 20) {
                const { data: prev } = await supabase.from('solutions').select('*')
                    .eq('id', currentVersion.previous_version_id).single();
                if (prev) {
                    allVersions.push(prev);
                    currentVersion = prev;
                } else {
                    break;
                }
            }

            return [current, ...allVersions];
        },
        enabled: !!solutionId
    });
}

export function useTrendingSolutions() {
    return useQuery({
        queryKey: ['trending-solutions'],
        queryFn: async () => {
            const now = new Date();
            const last30Days = new Date(now.setDate(now.getDate() - 30));

            const { data: solutions, error: solutionsError } = await supabase
                .from('solutions')
                .select('*')
                .eq('is_published', true)
                .eq('is_verified', true)
                .order('updated_at', { ascending: false })
                .limit(10);

            if (solutionsError) throw solutionsError;

            const { data: interests } = await supabase.from('solution_interests').select('*');
            const { data: demos } = await supabase.from('demo_requests').select('*');
            const { data: reviews } = await supabase.from('solution_reviews').select('*');

            return solutions.map(solution => {
                const recentInterests = (interests || []).filter(i =>
                    i.solution_id === solution.id &&
                    new Date(i.created_at) > last30Days
                ).length;
                const recentDemos = (demos || []).filter(d =>
                    d.solution_id === solution.id &&
                    new Date(d.created_at) > last30Days
                ).length;
                const recentReviews = (reviews || []).filter(r =>
                    r.solution_id === solution.id &&
                    new Date(r.created_at) > last30Days
                ).length;

                return {
                    ...solution,
                    trendingScore: recentInterests * 3 + recentDemos * 5 + recentReviews * 10
                };
            })
                .sort((a, b) => b.trendingScore - a.trendingScore)
                .slice(0, 5);
        },
        staleTime: 1000 * 60 * 30 // 30 minutes
    });
}

