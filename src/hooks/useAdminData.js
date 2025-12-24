import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';

/**
 * Hook for fetching platform-wide administrative data.
 * Centralizes counts and activity logs for the Admin Portal.
 * Refactored to use granular queries for better caching and performance.
 * 
 * Visibility: Only enabled for users with hasFullVisibility (Admins).
 */
export function useAdminData() {
    const { hasFullVisibility, isLoading: visibilityLoading } = useVisibilitySystem();
    const enabled = !visibilityLoading && hasFullVisibility;

    // 1. Core Entity Stats (Challenges, Pilots, Solutions, Programs) - High Priority
    const { data: coreStats, isLoading: coreLoading } = useQuery({
        queryKey: ['admin-stats-core'],
        queryFn: async () => {
            const [challenges, pilots, solutions, programs, rdProjects] = await Promise.all([
                supabase.from('challenges').select('status', { count: 'exact' }).eq('is_deleted', false),
                supabase.from('pilots').select('stage', { count: 'exact' }).eq('is_deleted', false),
                supabase.from('solutions').select('is_verified', { count: 'exact' }).eq('is_deleted', false),
                supabase.from('programs').select('id', { count: 'exact' }).eq('is_deleted', false),
                supabase.from('rd_projects').select('id', { count: 'exact' }).eq('is_deleted', false),
            ]);

            return {
                challenges: challenges.count || 0,
                pendingChallenges: challenges.data?.filter(c => c.status === 'submitted').length || 0,
                pilots: pilots.count || 0,
                activePilots: pilots.data?.filter(p => ['active', 'monitoring'].includes(p.stage)).length || 0,
                solutions: solutions.count || 0,
                verifiedSolutions: solutions.data?.filter(s => s.is_verified).length || 0,
                programs: programs.count || 0,
                rdProjects: rdProjects.count || 0,
            };
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 min
    });

    // 2. Network Stats (Orgs, Munis, Experts, Ideas) - Less frequent updates
    const { data: networkStats, isLoading: networkLoading } = useQuery({
        queryKey: ['admin-stats-network'],
        queryFn: async () => {
            const [organizations, municipalities, citizenIdeas, expertProfiles] = await Promise.all([
                supabase.from('organizations').select('is_partner', { count: 'exact' }),
                supabase.from('municipalities').select('is_active', { count: 'exact' }),
                supabase.from('citizen_ideas').select('status', { count: 'exact' }),
                supabase.from('user_roles').select('id', { count: 'exact' }).eq('role_name', 'expert'),
            ]);

            return {
                organizations: organizations.count || 0,
                partners: organizations.data?.filter(o => o.is_partner).length || 0,
                municipalities: municipalities.count || 0,
                activeMunicipalities: municipalities.data?.filter(m => m.is_active).length || 0,
                citizenIdeas: citizenIdeas.count || 0,
                approvedIdeas: citizenIdeas.data?.filter(i => i.status === 'approved').length || 0,
                experts: expertProfiles.count || 0,
            };
        },
        enabled,
        staleTime: 1000 * 60 * 10, // 10 min
    });

    // 3. Pending Approvals - High Velocity / Real-time impact
    const { data: pendingStats, isLoading: pendingLoading } = useQuery({
        queryKey: ['admin-stats-pending'],
        queryFn: async () => {
            const [challenges, pilots, programs] = await Promise.all([
                supabase.from('challenges').select('id', { count: 'exact' }).eq('status', 'submitted').eq('is_deleted', false),
                supabase.from('pilots').select('id', { count: 'exact' }).eq('stage', 'pending_approval').eq('is_deleted', false),
                supabase.from('program_applications').select('id', { count: 'exact' }).eq('status', 'submitted')
            ]);

            return {
                challenges: challenges.count || 0,
                pilots: pilots.count || 0,
                programs: programs.count || 0,
                total: (challenges.count || 0) + (pilots.count || 0) + (programs.count || 0)
            };
        },
        enabled,
        staleTime: 1000 * 60 * 1, // 1 min (more frequent)
    });

    // 4. Activity Log
    const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
        queryKey: ['admin-activity'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('access_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data || [];
        },
        enabled,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    // Merge all stats into the legacy shape expected by AdminPortal
    const stats = {
        ...coreStats,
        ...networkStats,
        pendingApprovals: pendingStats || { challenges: 0, pilots: 0, programs: 0, total: 0 }
    };

    return {
        stats,
        recentActivities,
        isLoading: visibilityLoading || coreLoading || networkLoading || pendingLoading || activitiesLoading,
        hasAccess: hasFullVisibility
    };
}
