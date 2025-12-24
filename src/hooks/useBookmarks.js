import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useBookmarks(userEmail, t) {
    const queryClient = useQueryClient();

    const { data: bookmarks = [], isLoading } = useQuery({
        queryKey: ['user-bookmarks', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_email', userEmail)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    const removeMutation = useMutation({
        mutationFn: async (bookmarkId) => {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('id', bookmarkId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user-bookmarks']);
            toast.success(t({ en: 'Bookmark removed', ar: 'تمت الإزالة' }));
        }
    });

    const clearAllMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('user_email', userEmail);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user-bookmarks']);
            toast.success(t({ en: 'All bookmarks cleared', ar: 'تم مسح جميع الإشارات' }));
        }
    });

    return {
        bookmarks,
        isLoading,
        removeMutation,
        clearAllMutation
    };
}
