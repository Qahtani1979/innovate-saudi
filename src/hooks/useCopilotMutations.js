import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCopilotMutations() {
    const queryClient = useQueryClient();

    const createSession = useMutation({
        mutationFn: async ({ title, mode = 'general', context_data = {} }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not logged in');

            const { data, error } = await supabase
                .from('copilot_sessions')
                .insert({ user_id: user.id, title, mode, context_data })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['copilot-sessions'] });
        }
    });

    const sendMessage = useMutation({
        mutationFn: async ({ session_id, role, content, meta_data = {} }) => {
            const { data, error } = await supabase
                .from('copilot_messages')
                .insert({ session_id, role, content, meta_data })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['copilot-messages', variables.session_id] });
        }
    });

    const deleteSession = useMutation({
        mutationFn: async (sessionId) => {
            const { error } = await supabase
                .from('copilot_sessions')
                .delete()
                .eq('id', sessionId);
            if (error) throw error;
            return sessionId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['copilot-sessions'] });
        }
    });

    return {
        createSession,
        sendMessage,
        deleteSession
    };
}
