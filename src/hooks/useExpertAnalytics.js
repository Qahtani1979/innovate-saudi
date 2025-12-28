import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useExpertAnalytics() {

    const { data: expertStats = { activeExperts: 0, pendingAssignments: 0, overdueAssignments: 0, totalReviews: 0 }, isLoading } = useQuery({
        queryKey: ['expert-stats'],
        queryFn: async () => {
            const [
                { count: activeExperts },
                { data: assignments },
                { count: totalReviews }
            ] = await Promise.all([
                supabase.from('expert_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from('expert_assignments').select('id, status, due_date'),
                supabase.from('expert_evaluations').select('*', { count: 'exact', head: true })
            ]);

            const pendingAssignments = assignments?.filter(a => a.status === 'pending').length || 0;
            const overdueAssignments = assignments?.filter(a =>
                a.due_date && new Date(a.due_date) < new Date() && a.status !== 'completed'
            ).length || 0;

            return {
                activeExperts: activeExperts || 0,
                pendingAssignments,
                overdueAssignments,
                totalReviews: totalReviews || 0
            };
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    return {
        expertStats,
        isLoading
    };
}

