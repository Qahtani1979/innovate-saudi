/**
 * System Analytics Hook
 * Centralized data access for system health, user activities, and usage metrics.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSystemAnalytics() {

    const fetchUserActivities = async (limit = 100) => {
        const { data, error } = await supabase
            .from('user_activities')
            .select('*, user_profiles(first_name_en, last_name_en, email)')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    };

    const useUserActivities = (limit = 100) => useQuery({
        queryKey: ['system-activities', limit],
        queryFn: () => fetchUserActivities(limit),
        staleTime: 1000 * 30, // 30 seconds
    });

    const useRecentSystemActivities = (limit = 50) => useQuery({
        queryKey: ['system-activities-recent', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 30
    });

    const useActiveSessions = () => useQuery({
        queryKey: ['active-sessions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_sessions')
                .select('*')
                .gt('expires_at', new Date().toISOString()); // Only valid sessions
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60
    });

    const useEntityCounts = () => useQuery({
        queryKey: ['entity-counts'],
        queryFn: async () => {
            const [
                { count: challengeCount },
                { count: pilotCount },
                { count: solutionCount },
                { count: userCount },
                { count: orgCount }
            ] = await Promise.all([
                supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
                supabase.from('pilots').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
                supabase.from('solutions').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
                supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
                supabase.from('organizations').select('*', { count: 'exact', head: true })
            ]);

            return {
                challenges: challengeCount || 0,
                pilots: pilotCount || 0,
                solutions: solutionCount || 0,
                users: userCount || 0,
                organizations: orgCount || 0
            };
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    return {
        useUserActivities,
        useRecentSystemActivities,
        useActiveSessions,
        useEntityCounts
    };
}

export default useSystemAnalytics;
