import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useParticipantDashboardData(userEmail) {
    // Fetch user's program applications
    const { data: myApplications = [], isLoading: applicationsLoading } = useQuery({
        queryKey: ['my-program-applications', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_applications')
                .select('*')
                .eq('applicant_email', userEmail);
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    // Fetch programs
    const { data: programs = [], isLoading: programsLoading } = useQuery({
        queryKey: ['programs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        }
    });

    // Find active program
    const activeProgram = myApplications.find(app => app.status === 'accepted');
    const program = activeProgram ? programs.find(p => p.id === activeProgram.program_id) : null;

    // Fetch participant progress data
    const { data: progressData, isLoading: progressLoading } = useQuery({
        queryKey: ['participant-progress', activeProgram?.id, program?.id],
        queryFn: async () => {
            if (!program?.id) return null;

            // Get total sessions count
            const { count: totalSessions } = await supabase
                .from('program_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('program_id', program.id);

            // Get completed sessions
            const { count: sessionsCompleted } = await supabase
                .from('session_attendance')
                .select('*', { count: 'exact', head: true })
                .eq('user_email', userEmail)
                .eq('attended', true);

            // Get total assignments
            const { count: totalAssignments } = await supabase
                .from('program_assignments')
                .select('*', { count: 'exact', head: true })
                .eq('program_id', program.id);

            // Get submitted assignments
            const { count: assignmentsSubmitted } = await supabase
                .from('assignment_submissions')
                .select('*', { count: 'exact', head: true })
                .eq('user_email', userEmail);

            // Get mentor meetings
            const { count: mentorMeetings } = await supabase
                .from('mentor_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('participant_email', userEmail)
                .eq('status', 'completed');

            // Get peer collaborations
            const { count: peerCollaborations } = await supabase
                .from('peer_collaborations')
                .select('*', { count: 'exact', head: true })
                .or(`participant_email.eq.${userEmail},partner_email.eq.${userEmail}`);

            const sessionsTotal = totalSessions || 12;
            const sessionsCompletedCount = sessionsCompleted || 0;
            const assignmentsTotal = totalAssignments || 8;
            const assignmentsSubmittedCount = assignmentsSubmitted || 0;

            // Calculate overall progress
            const sessionProgress = sessionsTotal > 0 ? (sessionsCompletedCount / sessionsTotal) * 50 : 0;
            const assignmentProgress = assignmentsTotal > 0 ? (assignmentsSubmittedCount / assignmentsTotal) * 50 : 0;
            const overallProgress = Math.round(sessionProgress + assignmentProgress);

            return {
                sessionsCompleted: sessionsCompletedCount,
                totalSessions: sessionsTotal,
                assignmentsSubmitted: assignmentsSubmittedCount,
                totalAssignments: assignmentsTotal,
                mentorMeetings: mentorMeetings || 0,
                peerCollaborations: peerCollaborations || 0,
                overallProgress
            };
        },
        enabled: !!program?.id && !!userEmail
    });

    // Fetch program events
    const { data: programEvents = [], isLoading: eventsLoading } = useQuery({
        queryKey: ['participant-program-events', program?.id],
        queryFn: async () => {
            if (!program?.id) return [];
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('program_id', program.id)
                .eq('is_deleted', false)
                .gte('start_date', new Date().toISOString())
                .order('start_date', { ascending: true })
                .limit(5);
            if (error) throw error;
            return data || [];
        },
        enabled: !!program?.id
    });

    return {
        myApplications,
        programs,
        activeProgram,
        program,
        progressData,
        programEvents,
        isLoading: applicationsLoading || programsLoading || progressLoading || eventsLoading
    };
}

