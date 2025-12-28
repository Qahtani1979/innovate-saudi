import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing user bookmarks.
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useBookmarks(userEmail, t) {
    const queryClient = useAppQueryClient();

    // Fetch all bookmarks for the user
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

    // Toggle bookmark for a specific entity
    const toggleBookmark = useMutation({
        mutationFn: async ({ entityType, entityId, entityName }) => {
            if (!userEmail) throw new Error('Login required');

            // Check for existing bookmark
            const { data: existing, error: checkError } = await supabase
                .from('bookmarks')
                .select('id')
                .eq('user_email', userEmail)
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .maybeSingle();

            if (checkError) throw checkError;

            if (existing) {
                // Delete existing bookmark
                const { error: deleteError } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('id', existing.id);
                if (deleteError) throw deleteError;
                return { action: 'removed' };
            } else {
                // Create new bookmark
                const { error: insertError } = await supabase
                    .from('bookmarks')
                    .insert({
                        user_email: userEmail,
                        entity_type: entityType,
                        entity_id: entityId,
                        notes: entityName || null
                    });
                if (insertError) throw insertError;
                return { action: 'added' };
            }
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['user-bookmarks', userEmail] });
            queryClient.invalidateQueries({ queryKey: ['bookmark'] });

            const message = result.action === 'added'
                ? (t ? t({ en: 'Added to bookmarks', ar: 'تمت الإضافة للمفضلة' }) : 'Added to bookmarks')
                : (t ? t({ en: 'Removed from bookmarks', ar: 'تمت الإزالة من المفضلة' }) : 'Removed from bookmarks');

            toast.success(message);
        },
        onError: (error) => {
            console.error('Bookmark error:', error);
            toast.error(error.message || 'Failed to update bookmark');
        }
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
            queryClient.invalidateQueries({ queryKey: ['user-bookmarks', userEmail] });
            const message = t ? t({ en: 'Bookmark removed', ar: 'تمت الإزالة' }) : 'Bookmark removed';
            toast.success(message);
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
            queryClient.invalidateQueries({ queryKey: ['user-bookmarks', userEmail] });
            const message = t ? t({ en: 'All bookmarks cleared', ar: 'تم مسح جميع الإشارات' }) : 'All bookmarks cleared';
            toast.success(message);
        }
    });

    return {
        bookmarks,
        isLoading,
        toggleBookmark,
        removeMutation,
        clearAllMutation
    };
}

export default useBookmarks;



