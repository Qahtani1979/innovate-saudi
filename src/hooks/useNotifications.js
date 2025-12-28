import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useNotifications(userEmail, options = {}) {
    const queryClient = useAppQueryClient();
    const { refetchInterval } = options;

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_email', userEmail)
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail,
        refetchInterval
    });

    const markAsRead = useMutation({
        /** @param {string} id */
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
    });

    const deleteNotification = useMutation({
        /** @param {string} id */
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
    });

    const markAllAsRead = useMutation({
        mutationFn: async () => {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
            if (unreadIds.length > 0) {
                const { error } = await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .in('id', unreadIds);
                if (error) throw error;
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
    });

    return {
        notifications,
        isLoading,
        markAsRead,
        deleteNotification,
        markAllAsRead
    };
}



