import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

export function useCitizenIdeas() {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    // Fetch ideas for the board
    const ideasQuery = useQuery({
        queryKey: ['citizen-ideas-board'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('citizen_ideas')
                .select('id, title, description, category, votes_count, status, created_at')
                .eq('is_published', true)
                .order('votes_count', { ascending: false })
                .limit(10);

            if (error) throw error;
            return data || [];
        }
    });

    // Fetch comment counts for visible ideas
    const commentCountsQuery = useQuery({
        queryKey: ['idea-comment-counts', ideasQuery.data?.map(i => i.id).join(',')],
        queryFn: async () => {
            if (!ideasQuery.data || ideasQuery.data.length === 0) return {};

            const { data, error } = await supabase
                .from('idea_comments')
                .select('idea_id')
                .in('idea_id', ideasQuery.data.map(i => i.id));

            if (error) return {};

            const counts = {};
            data?.forEach(c => {
                counts[c.idea_id] = (counts[c.idea_id] || 0) + 1;
            });
            return counts;
        },
        enabled: !!ideasQuery.data && ideasQuery.data.length > 0
    });

    // Submit new idea
    const submitIdeaMutation = useMutation({
        mutationFn: async (newIdea) => {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('citizen_ideas')
                .insert({
                    title: newIdea.title,
                    description: newIdea.description,
                    category: newIdea.category || 'General',
                    user_id: user?.id,
                    status: 'pending',
                    is_published: false,
                    votes_count: 0
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['citizen-ideas-board']);
            toast.success(t({ en: 'Idea submitted for review', ar: 'تم إرسال الفكرة للمراجعة' }));
        },
        onError: (error) => {
            console.error('Submit error:', error);
            toast.error(t({ en: 'Failed to submit idea', ar: 'فشل في إرسال الفكرة' }));
        }
    });

    return {
        ideas: ideasQuery.data || [],
        isLoading: ideasQuery.isLoading,
        isError: ideasQuery.isError,
        commentCounts: commentCountsQuery.data || {},
        submitIdea: submitIdeaMutation
    };
}
