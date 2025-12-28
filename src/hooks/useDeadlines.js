/**
 * Hook for fetching Upcoming Deadlines
 * Aggregates tasks, pilots (milestones), and programs with deadlines within a specific range.
 */

import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useDeadlines() {

    // Tasks deadlines (next 7 days)
    const { data: tasks = [] } = useQuery({
        queryKey: ['upcoming-tasks-deadlines'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .neq('status', 'completed')
                .not('due_date', 'is', null);

            if (error) throw error;

            const now = new Date();
            return (data || []).filter(t => {
                const due = new Date(t.due_date);
                const diffTime = due - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 7;
            }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        }
    });

    // Pilot Milestones deadlines (next 7 days)
    const { data: pilotMilestones = [] } = useQuery({
        queryKey: ['upcoming-pilots-milestones'],
        queryFn: async () => {
            const { data, error } = await supabase.from('pilots').select('*');
            if (error) throw error;

            return (data || []).filter(p => {
                if (!p.milestones) return false;
                // Check if any milestone is pending and due soon
                return p.milestones.some(m => {
                    if (!m.due_date || m.completed) return false;
                    const due = new Date(m.due_date);
                    const now = new Date();
                    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 7;
                });
            });
        }
    });

    // Program Application deadlines (next 14 days)
    const { data: programs = [] } = useQuery({
        queryKey: ['upcoming-programs-deadlines'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .not('application_deadline', 'is', null);

            if (error) throw error;

            const now = new Date();
            return (data || []).filter(p => {
                const due = new Date(p.application_deadline);
                const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 14;
            });
        }
    });

    return {
        tasks,
        pilotMilestones,
        programs
    };
}

