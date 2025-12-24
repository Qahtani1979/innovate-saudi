import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook to fetch comments for an R&D project
 * @param {string} projectId
 */
export function useRDProjectComments(projectId) {
    return useQuery({
        queryKey: ['rd-project-comments', projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_project_comments')
                .select(`
          *,
          user:profiles(*)
        `)
                .eq('rd_project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!projectId
    });
}

/**
 * Hook to add a comment to an R&D project
 */
export function useAddRDProjectComment() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: async ({ rd_project_id, comment_text }) => {
            const { data, error } = await supabase
                .from('rd_project_comments')
                .insert([{ rd_project_id, comment_text }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['rd-project-comments', variables.rd_project_id] });
            toast.success(t({ en: 'Comment added', ar: 'تمت إضافة التعليق' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to add comment', ar: 'فشل إرسال التعليق' }) + ': ' + error.message);
        }
    });
}
