import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAssessmentStats() {

    const useUserAccessStats = () => useQuery({
        queryKey: ['assessment-user-access-stats'],
        queryFn: async () => {
            const { count: userProfiles } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
            const { count: roles } = await supabase.from('roles').select('*', { count: 'exact', head: true });
            const { count: userRoles } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('is_active', true);
            const { count: permissions } = await supabase.from('permissions').select('*', { count: 'exact', head: true });
            const { count: roleRequests } = await supabase.from('role_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');

            return {
                userProfiles: userProfiles || 0,
                roles: roles || 0,
                userRoles: userRoles || 0,
                permissions: permissions || 0,
                roleRequests: roleRequests || 0
            };
        }
    });

    const useRResearchStats = () => useQuery({
        queryKey: ['assessment-research-stats'],
        queryFn: async () => {
            const { count: rdProjects } = await supabase.from('rd_projects').select('*', { count: 'exact', head: true }).eq('is_deleted', false);
            const { count: rdCalls } = await supabase.from('rd_calls').select('*', { count: 'exact', head: true }).or('is_deleted.eq.false,is_deleted.is.null');
            const { count: rdProposals } = await supabase.from('rd_proposals').select('*', { count: 'exact', head: true });
            const { count: innovationProposals } = await supabase.from('innovation_proposals').select('*', { count: 'exact', head: true }).eq('is_deleted', false);

            return {
                rdProjects: rdProjects || 0,
                rdCalls: rdCalls || 0,
                rdProposals: rdProposals || 0,
                innovationProposals: innovationProposals || 0
            };
        }
    });

    return {
        useUserAccessStats,
        useRResearchStats
    };
}
