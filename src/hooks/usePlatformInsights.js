import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function usePlatformInsights() {
    const queryClient = useAppQueryClient();

    const { data: announcements = [], isLoading, error, refetch } = useQuery({
        queryKey: ['platform-insights'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('platform_insights')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            return data || [];
        }
    });

    const markAsRead = useMutation({
        mutationFn: async (announcementId) => {
            // In real implementation, track read status per user
            return announcementId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-insights'] });
        }
    });

    return { announcements, isLoading, error, markAsRead, refetch };
}

