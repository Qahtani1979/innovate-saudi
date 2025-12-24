import { useEntityPagination } from '@/hooks/useEntityPagination';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Gold Standard Hook for My Bookmarks (Paginated)
 * @param {string} userId - Current user ID to filter by
 */
export function useMyBookmarks(userId, page = 1) {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    // 1. PAGINATED DATA FETCHING
    const pagination = useEntityPagination({
        entityName: 'bookmarks',
        pageSize: 12, // Grid layout friendly (divisible by 2, 3, 4)
        page,
        filters: {
            user_id: userId // Server-side filter
        },
        select: '*',
        enabled: !!userId
    });

    // 2. DELETE MUTATION (Single)
    const removeMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            // Invalidate the specific pagination query
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            toast.success(t({ en: 'Bookmark removed', ar: 'تم إزالة الإشارة المرجعية' }));
        }
    });

    // 3. CLEAR ALL MUTATION
    const clearAllMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            toast.success(t({ en: 'All bookmarks cleared', ar: 'تم مسح جميع الإشارات' }));
        }
    });

    return {
        // Flattened Pagination API
        ...pagination,
        bookmarks: pagination.data, // Alias for component readability

        // Mutations
        removeMutation,
        clearAllMutation,

        // derived state
        isMutating: removeMutation.isPending || clearAllMutation.isPending
    };
}
