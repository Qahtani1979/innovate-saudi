import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useTasks } from '@/hooks/useTasks';

/**
 * Hook for aggregating user performance analytics.
 * Calculates Impact Score, Completion Rates, and Monthly Activity.
 */
export function useUserAnalytics() {
    const { user } = useAuth();
    const userEmail = user?.email;

    // 1. Fetch My Challenges
    const useMyChallenges = () => useQuery({
        queryKey: ['my-challenges', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('id, created_at, linked_pilot_ids')
                .eq('is_deleted', false)
                .eq('created_by', userEmail);

            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    // 2. Fetch My Pilots
    const useMyPilots = () => useQuery({
        queryKey: ['my-pilots', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('id, stage, created_at')
                .eq('is_deleted', false)
                .eq('created_by', userEmail);

            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail,
        staleTime: 1000 * 60 * 5
    });

    // 3. Fetch My Tasks (via existing hook)
    const { useUserTasks } = useTasks({ user });
    const tasksQuery = useUserTasks();

    // 4. Derived Metrics
    const challengesQuery = useMyChallenges();
    const pilotsQuery = useMyPilots();

    const myChallenges = challengesQuery.data || [];
    const myPilots = pilotsQuery.data || [];
    const myTasks = tasksQuery.data || [];

    // Calculations
    const completionRate = myTasks.length > 0
        ? Math.round((myTasks.filter(t => t.status === 'completed').length / myTasks.length) * 100)
        : 0;

    const scaledPilots = myPilots.filter(p => p.stage === 'scaled').length;

    // Impact Score Formula: Challenges(1) + Pilots(3) + Scaled(10)
    const impactScore = Math.min(100, (myChallenges.length * 1 + myPilots.length * 3 + scaledPilots * 10));

    // Pilot Success Rate
    const completedOrScaledPilots = myPilots.filter(p => ['completed', 'scaled'].includes(p.stage)).length;
    const pilotSuccessRate = myPilots.length > 0
        ? Math.round((completedOrScaledPilots / myPilots.length) * 100)
        : 0;

    // Challenge Conversion Rate (Challenges with linked pilots)
    // Note: 'linked_pilot_ids' is an array column
    const convertedChallenges = myChallenges.filter(c => c.linked_pilot_ids && c.linked_pilot_ids.length > 0).length;
    const challengeConversionRate = myChallenges.length > 0
        ? Math.round((convertedChallenges / myChallenges.length) * 100)
        : 0;

    // Monthly Activity (Last 4 months)
    // This requires processing created_at dates
    const getMonthlyActivity = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        // Generate last 4 months
        const result = [];
        for (let i = 3; i >= 0; i--) {
            const d = new Date();
            d.setMonth(currentMonth - i);
            const monthIdx = d.getMonth();
            const year = d.getFullYear();
            const monthName = months[monthIdx];

            const challengesCount = myChallenges.filter(c => {
                const cDate = new Date(c.created_at);
                return cDate.getMonth() === monthIdx && cDate.getFullYear() === year;
            }).length;

            const pilotsCount = myPilots.filter(p => {
                const pDate = new Date(p.created_at);
                return pDate.getMonth() === monthIdx && pDate.getFullYear() === year;
            }).length;

            result.push({
                month: monthName,
                challenges: challengesCount,
                pilots: pilotsCount
            });
        }
        return result;
    };

    return {
        // Raw Data Access (if needed by UI for lists, but UI should prefer specific hooks)
        challenges: myChallenges,
        pilots: myPilots,
        tasks: myTasks,

        // Loading States
        isLoading: challengesQuery.isLoading || pilotsQuery.isLoading || tasksQuery.isLoading,
        isError: challengesQuery.isError || pilotsQuery.isError || tasksQuery.isError,

        // Metrics
        metrics: {
            challengesCount: myChallenges.length,
            pilotsCount: myPilots.length,
            impactScore,
            completionRate,
            pilotSuccessRate,
            challengeConversionRate,
            scaledPilotsCount: scaledPilots
        },

        // Charts
        monthlyActivity: getMonthlyActivity()
    };
}
