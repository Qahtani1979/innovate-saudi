import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { isBefore, isAfter, addDays, format } from 'date-fns';

/**
 * Hook for aggregating user schedule and deadlines.
 * Combines Tasks, Pilot Milestones, and Challenge Submissions.
 */
export function useUserSchedule() {
    const { user } = useAuth();
    const userEmail = user?.email;

    // 1. Fetch My Involved Pilots (Creator OR Team Member)
    // Used for extracting Milestones
    const useMyInvolvedPilots = () => useQuery({
        queryKey: ['my-involved-pilots', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('id, code, title_en, milestones, created_by, team')
                .eq('is_deleted', false)
                .or(`created_by.eq.${userEmail},team.cs.[{"email":"${userEmail}"}]`);

            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail,
        staleTime: 1000 * 60 * 5
    });

    // 2. Fetch My Draft Challenges (for Submission Deadlines)
    const useMyDraftChallenges = () => useQuery({
        queryKey: ['my-challenges-draft', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('id, title_en, submission_date, status')
                .eq('is_deleted', false)
                .eq('created_by', userEmail)
                .eq('status', 'draft') // Only care about drafts for "submission deadlines" usually
                .not('submission_date', 'is', null);

            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    // 3. Fetch Tasks
    const { useUserTasks } = useTasks({ user });
    const tasksQuery = useUserTasks();

    const pilotsQuery = useMyInvolvedPilots();
    const challengesQuery = useMyDraftChallenges();

    const myTasks = tasksQuery.data || [];
    const myPilots = pilotsQuery.data || [];
    const myChallenges = challengesQuery.data || [];

    // Aggregation Logic
    const activeTasks = myTasks.filter(t => t.due_date && t.status !== 'completed').map(task => ({
        type: 'task',
        id: task.id,
        title: task.title,
        due_date: task.due_date,
        priority: task.priority,
        entity: task
    }));

    const activeMilestones = [];
    myPilots.forEach(pilot => {
        // milestones is a JSONB array column
        /** @type {Array<{name: string, name_ar?: string, status: string, due_date: string}>} */
        const milestones = Array.isArray(pilot.milestones) ? pilot.milestones : [];

        milestones.forEach(milestone => {
            if (milestone.status !== 'completed' && milestone.due_date) {
                activeMilestones.push({
                    type: 'milestone',
                    id: `${pilot.id}-${milestone.name}`,
                    title: `${pilot.code}: ${milestone.name_ar || milestone.name}`,
                    due_date: milestone.due_date,
                    entity: pilot,
                    milestone
                });
            }
        });
    });

    const activeSubmissions = myChallenges.map(challenge => ({
        type: 'submission',
        id: challenge.id,
        title: challenge.title_en,
        due_date: challenge.submission_date,
        entity: challenge
    }));

    const allDeadlines = [
        ...activeTasks,
        ...activeMilestones,
        ...activeSubmissions
    ];

    // Sort by Date (Earliest first)
    const sortedDeadlines = allDeadlines.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    // Date Buckets
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const nextWeek = addDays(today, 7);

    const overdue = sortedDeadlines.filter(d => isBefore(new Date(d.due_date), today) && format(new Date(d.due_date), 'yyyy-MM-dd') !== todayStr);
    const dueToday = sortedDeadlines.filter(d => format(new Date(d.due_date), 'yyyy-MM-dd') === todayStr);
    const upcoming = sortedDeadlines.filter(d => isAfter(new Date(d.due_date), today) && isBefore(new Date(d.due_date), nextWeek));

    return {
        deadlines: sortedDeadlines,

        counts: {
            total: sortedDeadlines.length,
            overdue: overdue.length,
            dueToday: dueToday.length,
            upcoming: upcoming.length
        },

        buckets: {
            overdue,
            dueToday,
            upcoming
        },

        isLoading: tasksQuery.isLoading || pilotsQuery.isLoading || challengesQuery.isLoading,
        isError: tasksQuery.isError || pilotsQuery.isError || challengesQuery.isError
    };
}
