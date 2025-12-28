import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to manage Citizen Portal data (Solutions, Bookmarks).
 * Enforces visibility rules but allows public access where appropriate.
 */
export function useCitizenServices(t) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();

    // We don't strictly enforce visibility for public listing (is_published=true),
    // but we use the system to allow future RBAC/Region filtering if needed.
    // For now, we replicate the query: is_deleted=false, is_published=true
    const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

    const { data: solutions = [], isLoading: isSolutionsLoading } = useQuery({
        queryKey: ['citizen-solutions-browser-hook'],
        queryFn: async () => {
            // We use a custom fetch here OR fetchWithVisibility if we want to enforce RLS
            // The original code used: 
            // .from('solutions').select('*, providers(name_en, name_ar)').eq('is_deleted', false).eq('is_published', true)

            // fetchWithVisibility defaults to simple select *, but supports additional filters.
            // It also handles 'count' which we don't strictly need here but is fine.
            // IMPORTANT: 'providers' relation syntax isn't directly supported by simple select arg in fetchWithVisibility
            // unless we pass it as columns string.
            const columns = '*, providers(name_en, name_ar)';
            return fetchWithVisibility('solutions', columns, {
                orderBy: 'created_at',
                orderAscending: false,
                additionalFilters: (q) => q.eq('is_deleted', false).eq('is_published', true)
            });
        },
        enabled: !isVisibilityLoading
    });

    const { data: userBookmarks = [], refetch: refetchBookmarks } = useQuery({
        queryKey: ['citizen-solution-bookmarks-hook', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('bookmarks')
                .select('entity_id')
                .eq('user_email', user.email)
                .eq('entity_type', 'solution');
            if (error) throw error;
            return data?.map(b => b.entity_id) || [];
        },
        enabled: !!user?.email
    });

    const toggleBookmarkMutation = useMutation({
        mutationFn: async (/** @type {{ solutionId: any, isBookmarked: boolean }} */ { solutionId, isBookmarked }) => {
            if (!user?.email) throw new Error('User not logged in');

            if (isBookmarked) {
                const { error } = await supabase.from('bookmarks').delete()
                    .eq('user_email', user.email)
                    .eq('entity_id', solutionId)
                    .eq('entity_type', 'solution');
                if (error) throw error;
                return 'removed';
            } else {
                const { error } = await supabase.from('bookmarks').insert({
                    user_email: user.email,
                    entity_id: solutionId,
                    entity_type: 'solution'
                });
                if (error) throw error;
                return 'added';
            }
        },
        onSuccess: (action) => {
            refetchBookmarks();
            // We return action to let UI show specific message
        },
        onError: (error) => {
            toast({ title: t({ en: 'Error processing bookmark', ar: 'خطأ في معالجة الإشارة' }), variant: 'destructive' });
        }
    });

    const isLoading = isVisibilityLoading || isSolutionsLoading;

    return {
        solutions,
        userBookmarks,
        toggleBookmarkMutation,
        isLoading
    };
}



