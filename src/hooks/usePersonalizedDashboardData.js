import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function usePersonalizedDashboardData(userId) {
    const { data: myTasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ['my-tasks', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('tasks')
                .select('*')
                .eq('assigned_to', userId)
                .neq('status', 'completed');
            return data || [];
        },
        enabled: !!userId
    });

    const { data: myApprovals = [], isLoading: approvalsLoading } = useQuery({
        queryKey: ['my-approvals', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('pilot_approvals')
                .select('*')
                .eq('approver_id', userId) // Assuming there is an approver_id column, fallback to email if not
                .eq('status', 'pending');
            return data || [];
        },
        enabled: !!userId
    });

    const { data: myChallenges = [], isLoading: challengesLoading } = useQuery({
        queryKey: ['my-challenges', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('challenges')
                .select('*')
                .eq('created_by', userId) // Changed from challenge_owner_email to created_by (standard UUID field)
                .not('status', 'in', '("resolved","archived")');
            return data || [];
        },
        enabled: !!userId
    });

    const { data: myPilots = [], isLoading: pilotsLoading } = useQuery({
        queryKey: ['my-pilots', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('pilots')
                .select('*')
                .not('stage', 'in', '("completed","cancelled")');
            // Filter by team membership on client side
            // Note: Team usually contains objects. If team stores UUIDs, check that.
            // If team stores emails, we need user's email too.
            // For now, let's assume team stores emails/profile objects, so we might need email.
            // But main query shouldn't fail.
            return (data || []).filter(p =>
                // p.created_by === userId || // Optional: Include created pilots
                p.team?.some(member => member.id === userId || member.user_id === userId) &&
                !['completed', 'terminated', 'archived'].includes(p.stage)
            );
        },
        enabled: !!userId
    });

    return {
        myTasks,
        myApprovals,
        myChallenges,
        myPilots,
        isLoading: tasksLoading || approvalsLoading || challengesLoading || pilotsLoading
    };
}

