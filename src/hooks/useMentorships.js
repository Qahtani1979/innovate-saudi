import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for fetching all program mentorships
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useMentorships(options = {}) {
    const { menteeEmail, mentorEmail, programId } = options;

    return useQuery({
        queryKey: ['mentorships', menteeEmail, mentorEmail, programId],
        queryFn: async () => {
            let query = supabase
                .from('program_mentorships')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (menteeEmail) query = query.eq('mentee_email', menteeEmail);
            if (mentorEmail) query = query.eq('mentor_email', mentorEmail);
            if (programId) query = query.eq('program_id', programId);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook for mentorship summary statistics
 */
export function useMentorshipStats() {
    const { data: mentorships = [], isLoading } = useMentorships();

    const activeMentorships = mentorships.filter(m => m.status === 'active');
    const completedMentorships = mentorships.filter(m => m.status === 'completed');

    const stats = {
        total: mentorships.length,
        active: activeMentorships.length,
        completed: completedMentorships.length,
        avg_duration: mentorships.filter(m => m.actual_duration_weeks).reduce((sum, m) => sum + m.actual_duration_weeks, 0) / (mentorships.filter(m => m.actual_duration_weeks).length || 1)
    };

    return { stats, isLoading };
}

