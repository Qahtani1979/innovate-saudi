import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAnalytics() {
    const useTrendEntries = (options = {}) => useQuery({
        queryKey: ['trend-entries', options],
        queryFn: async () => {
            let query = supabase.from('trend_entries').select('*');
            if (options.sector) {
                query = query.eq('sector', options.sector);
            }
            if (options.limit) {
                query = query.limit(options.limit);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });

    const useRisks = (options = {}) => useQuery({
        queryKey: ['risks', options],
        queryFn: async () => {
            let query = supabase.from('risks').select('*');
            if (options.limit) {
                query = query.limit(options.limit);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });

    const useUserProfiles = () => useQuery({
        queryKey: ['user-profiles-analytics'],
        queryFn: async () => {
            const { data } = await supabase.from('user_profiles').select('id, user_id, persona_type, created_at, last_login');
            return data || [];
        }
    });

    const useUserRoles = () => useQuery({
        queryKey: ['user-roles-analytics'],
        queryFn: async () => {
            const { data } = await supabase.from('user_roles').select('user_id, role');
            return data || [];
        }
    });

    const useSystemActivities = (limit = 500) => useQuery({
        queryKey: ['system-activities-analytics', limit],
        queryFn: async () => {
            const { data } = await supabase
                .from('system_activities')
                .select('id, activity_type, created_at, user_email')
                .order('created_at', { ascending: false })
                .limit(limit);
            return data || [];
        }
    });

    const useAccessLogs = (limit = 500) => useQuery({
        queryKey: ['access-logs-analytics', limit],
        queryFn: async () => {
            const { data } = await supabase
                .from('access_logs')
                .select('id, action, created_at, user_id')
                .order('created_at', { ascending: false })
                .limit(limit);
            return data || [];
        }
    });

    return {
        useTrendEntries,
        useRisks,
        useUserProfiles,
        useUserRoles,
        useSystemActivities,
        useAccessLogs
    };
}
