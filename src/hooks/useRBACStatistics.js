import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useRBACStatistics() {
    // Phase 4: Query user_roles assignments (role_id join)
    const { data: userRoleAssignments = [] } = useQuery({
        queryKey: ['rbac-user-roles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_roles')
                .select('*, roles:role_id(id, name)')
                .eq('is_active', true);
            if (error) throw error;
            return data || [];
        }
    });

    const { data: delegations = [] } = useQuery({
        queryKey: ['rbac-delegations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('delegation_rules').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    return { userRoleAssignments, delegations };
}

export function useAccessLogs(days = 7) {
    return useQuery({
        queryKey: ['rbac-access-logs', days],
        queryFn: async () => {
            const dateFrom = new Date();
            dateFrom.setDate(dateFrom.getDate() - days);
            const { data, error } = await supabase
                .from('access_logs')
                .select('*')
                .gte('created_at', dateFrom.toISOString())
                .order('created_at', { ascending: false })
                .limit(500);
            if (error) throw error;
            return data || [];
        }
    });
}

