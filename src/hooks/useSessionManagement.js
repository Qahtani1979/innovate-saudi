import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSessionManagement() {
    const queryClient = useQueryClient();

    const useSessions = (limit = 200) => useQuery({
        queryKey: ['sessions', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_sessions')
                .select('*')
                .order('last_activity', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data;
        }
    });

    const useForceLogout = () => useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('user_sessions')
                .update({
                    is_active: false,
                    logout_time: new Date().toISOString()
                })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
            toast.success('Session terminated');
        }
    });

    const useToggleTrust = () => useMutation({
        mutationFn: async ({ id, trusted }) => {
            const { error } = await supabase
                .from('user_sessions')
                .update({ is_trusted: trusted })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
            toast.success('Device trust updated');
        }
    });

    const useDeleteSession = () => useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('user_sessions').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
            toast.success('Session deleted');
        }
    });

    return {
        useSessions,
        useForceLogout,
        useToggleTrust,
        useDeleteSession
    };
}
