import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePortfolioReviews() {
    const queryClient = useAppQueryClient();

    const reviewsQuery = useQuery({
        queryKey: ['portfolio-reviews'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('platform_config')
                .select('*')
                .eq('category', 'workflow');

            if (error) throw error;
            return data.filter(c => c.config_key?.startsWith('portfolio_review_'));
        }
    });

    const reviewMutation = useMutation({
        mutationFn: ({ action, review_id, review_data, comments }) =>
            supabase.functions.invoke('portfolio-review', { body: { action, review_id, review_data, comments } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio-reviews'] });
            // Toasts are handled in component usually for translation
        }
    });

    return {
        reviews: reviewsQuery.data || [],
        isLoading: reviewsQuery.isLoading,
        reviewMutation
    };
}

