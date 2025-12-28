import { useQuery, useMutation } from '@/hooks/useAppQueryClient';

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProgramAttendance(programId, sessionId) {
    const queryClient = useAppQueryClient();

    const programQuery = useQuery({
        queryKey: ['program', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!programId
    });

    const participantsQuery = useQuery({
        queryKey: ['program-participants', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_applications')
                .select('*')
                .eq('program_id', programId)
                .eq('status', 'accepted');
            if (error) throw error;
            return data || [];
        },
        enabled: !!programId
    });

    const updateAttendance = useMutation({
        mutationFn: async ({ attendance }) => {
            const program = programQuery.data;
            if (!program) throw new Error("Program not found");

            const updatedEvents = program.events.map(e =>
                e.id === sessionId ? { ...e, attendance, attendance_recorded: true } : e
            );

            const { error: programError } = await supabase
                .from('programs')
                .update({ events: updatedEvents })
                .eq('id', programId);
            if (programError) throw programError;

            // Update each participant's attendance percentage
            // Note: This logic might be better server-side, but keeping it here for now as per original code
            // To optimize, this could be a parallel execution or a single batch update if possible, 
            // but loop seems fine for small cohorts.
            const applications = participantsQuery.data || [];
            for (const app of applications) {
                const sessions = updatedEvents.filter(e => e.attendance_recorded);
                const attended = sessions.filter(e => e.attendance?.[app.id]).length;
                const percentage = sessions.length > 0 ? (attended / sessions.length) * 100 : 0;

                await supabase
                    .from('program_applications')
                    .update({ attendance_percentage: Math.round(percentage) })
                    .eq('id', app.id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['program', programId]);
            queryClient.invalidateQueries(['program-participants', programId]);
            toast.success('Attendance saved');
        },
        onError: (error) => {
            toast.error('Failed to save attendance: ' + error.message);
        }
    });

    return {
        program: programQuery.data,
        participants: participantsQuery.data || [],
        isLoading: programQuery.isLoading || participantsQuery.isLoading,
        updateAttendance
    };
}



