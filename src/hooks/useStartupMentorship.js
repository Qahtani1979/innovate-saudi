import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export function usePotentialMentors(startupId, startup) {
    return useQuery({
        queryKey: ['potential-mentors', startupId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('startup_profiles')
                .select('*')
                .neq('id', startupId)
                .gt('pilot_success_rate', 70)
                .gte('municipal_clients_count', 2)
                .limit(5);

            if (error) throw error;
            return (data || []).filter(s => s.sectors?.some(sector => startup?.sectors?.includes(sector)));
        },
        enabled: !!startup
    });
}

export function useStartupMentorshipMutations() {
    const queryClient = useAppQueryClient();
    const { triggerEmail } = useEmailTrigger();

    const requestMentorship = useMutation({
        /**
         * @param {{ mentorId: string, mentor: any, startup: any, startupId: string }} params
         */
        mutationFn: async ({ mentorId, mentor, startup, startupId }) => {
            // Send mentorship request email
            await triggerEmail('pilot.feedback_request', {
                entity_type: 'startup',
                entity_id: startupId,
                variables: {
                    startupName: startup?.name_en,
                    mentorName: mentor.name_en,
                    sectors: startup?.sectors?.join(', '),
                    stage: startup?.stage,
                    teamSize: startup?.team_size
                }
            });

            // Create mentorship record
            const { error } = await supabase.from('program_mentorships').insert({
                mentor_startup_id: mentorId,
                mentee_startup_id: startupId,
                status: 'requested',
                mentorship_type: 'peer_startup',
                focus_areas: startup?.sectors || []
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['potential-mentors'] });
            toast.success('Mentorship request sent successfully');
        },
        onError: (error) => {
            console.error('Failed to request mentorship:', error);
            toast.error('Failed to send mentorship request');
        }
    });

    return { requestMentorship };
}



