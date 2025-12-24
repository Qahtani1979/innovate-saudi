import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePublicContent() {
    return {};
}

export function usePublicMunicipalities() {
    return useQuery({
        queryKey: ['public-municipalities'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('municipalities')
                .select('*')
                .eq('is_active', true)
                .order('name_en', { ascending: true });

            if (error) throw error;
            return data || [];
        }
    });
}

export function usePublicPilots(options = {}) {
    const { limit, successfulOnly = false, all = false } = options;
    return useQuery({
        queryKey: ['public-pilots', limit, successfulOnly, all],
        queryFn: async () => {
            let query = supabase
                .from('pilots')
                .select('*')
                .eq('is_deleted', false)
                .eq('is_published', true);

            if (successfulOnly) {
                query = query.in('stage', ['completed', 'scaled']).eq('recommendation', 'scale');
            }

            if (!all) {
                // If not fetching "all" for tracker, defaulting to top level display logic usually implies specific filters
                // But here successfulOnly handles the "home page" logic.
            }

            // For PublicPilotTracker which lists all
            if (all) {
                query = query.eq('is_confidential', false).order('created_at', { ascending: false });
            } else if (successfulOnly) {
                // kept order for homepage
            } else {
                // Default order
                query = query.order('created_at', { ascending: false });
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5 // 5 min
    });
}

export function usePublicChallenges(options = {}) {
    const { limit } = options;
    return useQuery({
        queryKey: ['public-challenges', limit],
        queryFn: async () => {
            let query = supabase
                .from('challenges')
                .select('*')
                .eq('is_deleted', false)
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

export function usePublicSolutions(options = {}) {
    const { limit, verifiedOnly = false } = options;
    return useQuery({
        queryKey: ['public-solutions', limit, verifiedOnly],
        queryFn: async () => {
            let query = supabase
                .from('solutions')
                .select('*')
                .eq('is_deleted', false)
                .eq('is_published', true);

            if (verifiedOnly) {
                query = query.eq('is_verified', true).in('maturity_level', ['market_ready', 'proven']);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

export function useTopMunicipalities(options = {}) {
    const { limit } = options;
    return useQuery({
        queryKey: ['top-municipalities-public', limit],
        queryFn: async () => {
            let query = supabase
                .from('municipalities')
                .select('*')
                .eq('is_active', true)
                .order('mii_score', { ascending: false });

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

export function usePublicPrograms(options = {}) {
    const { limit, status } = options;
    return useQuery({
        queryKey: ['public-programs', limit, status],
        queryFn: async () => {
            let query = supabase
                .from('programs')
                .select('*')
                .eq('is_deleted', false)
                .eq('is_published', true);

            if (status) {
                query = query.eq('status', status);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

export function usePlatformStats() {
    return useQuery({
        queryKey: ['public-platform-stats'],
        queryFn: async () => {
            const [
                { count: challengeCount },
                { count: pilotCount },
                { count: solutionCount },
                { count: municipalityCount }
            ] = await Promise.all([
                supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('is_published', true),
                supabase.from('pilots').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('is_published', true),
                supabase.from('solutions').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('is_published', true),
                supabase.from('municipalities').select('*', { count: 'exact', head: true }).eq('is_active', true)
            ]);
            return {
                challenges: challengeCount || 0,
                pilots: pilotCount || 0,
                solutions: solutionCount || 0,
                municipalities: municipalityCount || 0
            };
        },
        staleTime: 1000 * 60 * 15 // 15 min
    });
}
