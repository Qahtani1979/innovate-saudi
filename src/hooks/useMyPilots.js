import { useEntityPagination } from '@/hooks/useEntityPagination';
import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useMyPilots(userEmail, page = 1) {
    // 1. PRIMARY LIST (Paginated - Created by User)
    // Filters: created_by (via email match to challenge owner pattern, though strictly users usually have ID)
    // The previous implementation used .eq('created_by', userEmail)

    const pagination = useEntityPagination({
        entityName: 'pilots',
        pageSize: 12, // Grid layout friendly
        page,
        filters: {
            created_by: userEmail // Assuming the DB column stores email or we trust the variable name from previous code
        },
        select: '*',
        enabled: !!userEmail
    });

    // 2. STATS QUERY (Lightweight)
    const { data: stats } = useQuery({
        queryKey: ['my-pilots-stats', userEmail],
        queryFn: async () => {
            if (!userEmail) return { total: 0, in_progress: 0, completed: 0, avg_success: 0 };

            const { data, error } = await supabase
                .from('pilots')
                .select('stage, success_probability')
                .eq('created_by', userEmail)
                .eq('is_deleted', false);

            if (error) return { total: 0 };

            // Aggregate locally
            const total = data.length;
            const in_progress = data.filter(p => p.stage === 'in_progress').length;
            const completed = data.filter(p => p.stage === 'completed').length;

            // Calculate Average Success Probability
            const totalSuccess = data.reduce((acc, p) => acc + (p.success_probability || 0), 0);
            const avg_success = total > 0 ? Math.round(totalSuccess / total) : 0;

            return {
                total,
                in_progress,
                completed,
                avg_success
            };
        },
        enabled: !!userEmail,
        staleTime: 5 * 60 * 1000
    });

    return {
        // Flattened Pagination API
        ...pagination,
        pilots: pagination.data,

        // Stats
        stats: stats || { total: 0, in_progress: 0, completed: 0, avg_success: 0 }
    };
}

