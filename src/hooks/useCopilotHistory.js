import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useCopilotHistory() {
    const useSessions = () => useQuery({
        queryKey: ['copilot-sessions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('copilot_sessions')
                .select('*')
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    const useSessionMessages = (sessionId) => useQuery({
        queryKey: ['copilot-messages', sessionId],
        queryFn: async () => {
            if (!sessionId || sessionId === 'mock-session-id') return [];
            const { data, error } = await supabase
                .from('copilot_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data;
        },
        enabled: !!sessionId && sessionId !== 'mock-session-id'
    });

    return {
        useSessions,
        useSessionMessages
    };
}

