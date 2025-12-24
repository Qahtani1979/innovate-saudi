import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePersonalizedDashboardData(userEmail) {
    const { data: myTasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ['my-tasks', userEmail],
        queryFn: async () => {
            const { data } = await supabase
                .from('tasks')
                .select('*')
                .eq('assigned_to', userEmail)
                .neq('status', 'completed');
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: myApprovals = [], isLoading: approvalsLoading } = useQuery({
        queryKey: ['my-approvals', userEmail],
        queryFn: async () => {
            const { data } = await supabase
                .from('pilot_approvals')
                .select('*')
                .eq('approver_email', userEmail)
                .eq('status', 'pending');
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: myChallenges = [], isLoading: challengesLoading } = useQuery({
        queryKey: ['my-challenges', userEmail],
        queryFn: async () => {
            const { data } = await supabase
                .from('challenges')
                .select('*')
                .eq('challenge_owner_email', userEmail)
                .not('status', 'in', '("resolved","archived")');
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: myPilots = [], isLoading: pilotsLoading } = useQuery({
        queryKey: ['my-pilots', userEmail],
        queryFn: async () => {
            const { data } = await supabase
                .from('pilots')
                .select('*')
                .not('stage', 'in', '("completed","cancelled")');
            // Filter by team membership on client side since team is JSON
            return (data || []).filter(p =>
                p.team?.some(member => member.email === userEmail) &&
                !['completed', 'terminated', 'archived'].includes(p.stage)
            );
        },
        enabled: !!userEmail
    });

    return {
        myTasks,
        myApprovals,
        myChallenges,
        myPilots,
        isLoading: tasksLoading || approvalsLoading || challengesLoading || pilotsLoading
    };
}
