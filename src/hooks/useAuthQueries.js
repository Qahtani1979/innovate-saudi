import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook to fetch login history with pagination
 * @param {number} page
 * @param {number} pageSize
 */
export function useLoginHistory(page = 1, pageSize = 10) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['login-history', user?.id, page, pageSize],
        queryFn: async () => {
            if (!user?.id) return { data: [], count: 0 };

            const { data, count, error } = await supabase
                .from('access_logs')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .in('action', ['login_success', 'logout', 'login_failed'])
                .order('created_at', { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1);

            if (error) throw error;

            return { data: data || [], count: count || 0 };
        },
        enabled: !!user?.id,
        placeholderData: (previousData) => previousData // Keep previous data while fetching new page
    });
}
