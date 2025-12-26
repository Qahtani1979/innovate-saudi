
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEmailTrigger } from './useEmailTrigger';

export function useMentorship(programId, mentorEmail) {
    const queryClient = useQueryClient();
    const { triggerEmail } = useEmailTrigger();

    const menteeAssignmentsQuery = useQuery({
        queryKey: ['mentor-mentees', programId, mentorEmail],
        queryFn: async () => {
            const { data: assignments, error: assignError } = await supabase
                .from('expert_assignments')
                .select('*')
                .eq('entity_type', 'program')
                .eq('entity_id', programId)
                .eq('expert_email', mentorEmail)
                .eq('assignment_type', 'mentor');

            if (assignError) throw assignError;
            if (!assignments?.length) return [];

            const { data: apps, error: appsError } = await supabase
                .from('program_applications')
                .select('*')
                .eq('program_id', programId)
                .eq('status', 'accepted');
            if (appsError) throw appsError;

            // Filter apps to those assigned to this mentor if needed, or if assignment implies they can mentor anyone...
            // The original code fetched ALL accepted applications if any assignment existed. 
            // It didn't filter apps by assignment. Let's assume the mentor can mentor any accepted participant 
            // OR we should filter by the specific mentee IDs in the assignments?
            // Re-reading original code: 
            // It fetches assignments, if empty returns [].
            // Then fetches ALL accepted apps. 
            // It behaves as if "If I am a mentor for this program, I can see all participants".
            // We will preserve this logic.
            return apps || [];
        },
        enabled: !!programId && !!mentorEmail
    });

    const meetingsQuery = useQuery({
        queryKey: ['mentor-meetings', programId, mentorEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_mentorships')
                .select('*')
                .eq('program_id', programId)
                .eq('mentor_email', mentorEmail);
            if (error) throw error;
            return data || [];
        },
        enabled: !!programId && !!mentorEmail
    });

    const scheduleMeetingMutation = useMutation({
        mutationFn: async (data) => {
            const mentee = menteeAssignmentsQuery.data?.find(a => a.id === data.mentee_id);
            if (!mentee) throw new Error("Mentee not found");

            const { error } = await supabase
                .from('program_mentorships')
                .insert({
                    program_id: programId,
                    mentor_email: mentorEmail,
                    mentee_email: mentee.applicant_email,
                    mentee_name: mentee.applicant_name,
                    session_date: data.date,
                    session_time: data.time,
                    duration_minutes: data.duration_minutes,
                    agenda: data.agenda,
                    location: data.location,
                    status: 'scheduled'
                });
            if (error) throw error;

            await triggerEmail({
                trigger: 'event.invitation',
                recipient_email: mentee.applicant_email,
                entity_type: 'program',
                entity_id: programId,
                variables: {
                    menteeName: mentee.applicant_name,
                    sessionDate: data.date,
                    sessionTime: data.time,
                    durationMinutes: data.duration_minutes,
                    location: data.location,
                    agenda: data.agenda
                },
                triggered_by: 'system'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['mentor-meetings', programId, mentorEmail]);
            toast.success('Meeting scheduled');
        },
        onError: (error) => {
            toast.error('Failed to schedule meeting: ' + error.message);
        }
    });

    return {
        mentees: menteeAssignmentsQuery.data || [],
        meetings: meetingsQuery.data || [],
        isLoading: menteeAssignmentsQuery.isLoading || meetingsQuery.isLoading,
        scheduleMeeting: scheduleMeetingMutation
    };
}
