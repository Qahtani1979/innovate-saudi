import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@/hooks/useAppQueryClient';

/**
 * Hook to manage notification preferences for all users (Admin view).
 */
export function useAllNotificationPreferences(searchTerm = '') {
    const queryClient = useAppQueryClient();

    const preferencesQuery = useQuery({
        queryKey: ['user-notification-preferences', searchTerm],
        queryFn: async () => {
            let query = supabase
                .from('user_notification_preferences')
                .select('*, user_profiles(full_name, avatar_url)')
                .order('updated_at', { ascending: false })
                .limit(100);

            if (searchTerm) {
                query = query.ilike('user_email', `%${searchTerm}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });

    const statsQuery = useQuery({
        queryKey: ['notification-preferences-stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_notification_preferences')
                .select('email_notifications, in_app_notifications, push_notifications');

            if (error) throw error;

            const counts = {
                total: data?.length || 0,
                emailEnabled: data?.filter(p => p.email_notifications !== false).length || 0,
                inAppEnabled: data?.filter(p => p.in_app_notifications !== false).length || 0,
                pushEnabled: data?.filter(p => p.push_notifications === true).length || 0,
            };
            return counts;
        }
    });

    const updatePreferences = useMutation({
        /** @param {{ userId: string, updates: any }} params */
        mutationFn: async ({ userId, updates }) => {
            const { error } = await supabase
                .from('user_notification_preferences')
                .update(updates)
                .eq('user_id', userId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-notification-preferences'] });
            queryClient.invalidateQueries({ queryKey: ['notification-preferences-stats'] });
            toast.success('Preferences updated successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return {
        preferences: preferencesQuery.data || [],
        stats: statsQuery.data,
        isLoading: preferencesQuery.isLoading,
        isUpdating: updatePreferences.isPending,
        refetch: preferencesQuery.refetch,
        updatePreferences: updatePreferences.mutate
    };
}


