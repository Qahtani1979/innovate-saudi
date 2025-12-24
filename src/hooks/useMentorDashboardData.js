import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMentorDashboardData(userEmail) {
    const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
        queryKey: ['mentor-assignments', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_assignments')
                .select('*')
                .eq('expert_email', userEmail)
                .eq('task_type', 'mentorship')
                .neq('status', 'declined');
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: programs = [], isLoading: programsLoading } = useQuery({
        queryKey: ['mentor-programs', assignments],
        queryFn: async () => {
            const programIds = [...new Set(assignments.map(a => a.entity_id || a.task_id))];
            if (programIds.length === 0) return [];

            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .in('id', programIds)
                .eq('is_deleted', false);

            if (error) throw error;
            return data || [];
        },
        enabled: assignments.length > 0
    });

    const { data: mentorships = [], isLoading: mentorshipsLoading } = useQuery({
        queryKey: ['mentorships', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('mentorship_sessions')
                .select('*')
                .eq('mentor_email', userEmail);

            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery({
        queryKey: ['mentor-evaluations', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('evaluator_email', userEmail)
                .eq('entity_type', 'program_application');

            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    return {
        assignments,
        programs,
        mentorships,
        evaluations,
        isLoading: assignmentsLoading || programsLoading || mentorshipsLoading || evaluationsLoading
    };
}
