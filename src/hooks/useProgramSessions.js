import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export function useProgramSessions(programId) {
    return useQuery({
        queryKey: ['program', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .eq('is_deleted', false)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!programId
    });
}

export function useProgramSessionMutations(programId) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();

    const createSession = useMutation({
        /**
         * @param {{ sessionData: any, existingSessions: any[] }} params
         */
        mutationFn: async ({ sessionData, existingSessions }) => {
            const { error } = await supabase.from('programs').update({
                events: [...existingSessions, {
                    ...sessionData,
                    status: 'scheduled',
                    created_date: new Date().toISOString()
                }]
            }).eq('id', programId);

            if (error) throw error;

            await supabase.from('system_activities').insert({
                entity_type: 'program',
                entity_id: programId,
                activity_type: 'session_scheduled',
                performed_by: user?.email,
                timestamp: new Date().toISOString(),
                metadata: { session_title: sessionData.title, session_date: sessionData.date }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program', programId] });
            toast.success('Session scheduled successfully');
        },
        onError: (error) => {
            console.error('Failed to schedule session:', error);
            toast.error('Failed to schedule session');
        }
    });

    return { createSession };
}



