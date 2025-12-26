// @ts-nocheck
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to fetch reviews for a specific solution.
 */
export function useSolutionReviews(solutionId) {
    return useQuery({
        queryKey: ['solution-reviews', solutionId],
        queryFn: async () => {
            if (!solutionId) return [];
            const { data, error } = await supabase
                .from('solution_reviews')
                .select('*')
                .eq('solution_id', solutionId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionId
    });
}

/**
 * Hook to fetch reviews for multiple solutions.
 */
export function useSolutionsReviews(solutionIds = []) {
    return useQuery({
        queryKey: ['solutions-reviews', solutionIds],
        queryFn: async () => {
            if (!solutionIds?.length) return [];
            const { data, error } = await supabase
                .from('solution_reviews')
                .select('*')
                .in('solution_id', solutionIds);
            if (error) throw error;
            return data || [];
        },
        enabled: solutionIds.length > 0
    });
}

/**
 * Fetch pilots eligible for review by the current user
 */
export function useUserPilotsForReview(solutionId, userEmail) {
    return useQuery({
        queryKey: ['user-solution-pilots', solutionId, userEmail],
        queryFn: async () => {
            if (!solutionId || !userEmail) return [];
            const { data, error } = await supabase.from('pilots').select('*')
                .eq('is_deleted', false)
                .eq('solution_id', solutionId)
                .eq('created_by', userEmail)
                .in('stage', ['completed', 'scaled']);

            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionId && !!userEmail
    });
}

/**
 * Create a new review for a solution
 */
export function useCreateReview() {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async ({ solutionId, municipalityId, reviewerEmail, reviewerName, reviewerRole, pilot_id, overall_rating, ratings, review_title, review_text, pros, cons, would_recommend }) => {
            const reviewData = {
                solution_id: solutionId,
                municipality_id: municipalityId,
                reviewer_email: reviewerEmail,
                reviewer_name: reviewerName,
                reviewer_role: reviewerRole,
                pilot_id,
                overall_rating,
                ratings,
                review_title,
                review_text,
                pros,
                cons,
                would_recommend,
                is_public: true // Auto-publish for now or pending? Component implied direct insert.
            };

            const { data: review, error } = await supabase.from('solution_reviews').insert(reviewData).select().single();
            if (error) throw error;

            // Note: Solution aggregate ratings usually handled by a database trigger or edge function for consistency.
            // But we can update it manually here as the original component did, for immediate UI feedback.
            // Fetch current stats first to be safe or blindly trust the client-side list? 
            // Better: Let's assume the component will refetch 'solutions' or we invalidate it.
            // But the component logic was updating it directly. We'll simplify: invalidate the solution query.
            // The server-side trigger (if exists) is safer. If not, we should probably check.
            // Given the Gold Standard, logic should be robust.

            // To mimic component exact behavior (client-side calc pushing to DB):
            const { data: allReviews } = await supabase.from('solution_reviews').select('overall_rating').eq('solution_id', solutionId);
            if (allReviews) {
                const avgRating = allReviews.reduce((sum, r) => sum + r.overall_rating, 0) / allReviews.length;
                const ratingsBreakdown = {
                    5: allReviews.filter(r => r.overall_rating === 5).length,
                    4: allReviews.filter(r => r.overall_rating === 4).length,
                    3: allReviews.filter(r => r.overall_rating === 3).length,
                    2: allReviews.filter(r => r.overall_rating === 2).length,
                    1: allReviews.filter(r => r.overall_rating === 1).length
                };

                await supabase.from('solutions').update({
                    average_rating: avgRating,
                    total_reviews: allReviews.length,
                    ratings: {
                        average: avgRating,
                        count: allReviews.length,
                        breakdown: ratingsBreakdown
                    }
                }).eq('id', solutionId);
            }

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'Solution',
                entity_id: solutionId,
                activity_type: 'review_submitted',
                description: `Review submitted: ${overall_rating}/5 stars by ${reviewerName}`,
                metadata: { rating: overall_rating, pilot_id }
            });

            return review;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['solution-reviews', variables.solutionId] });
            queryClient.invalidateQueries({ queryKey: ['solution', variables.solutionId] });
            toast.success('Review submitted successfully!');
        },
        onError: (error) => {
            console.error('Failed to submit review:', error);
            toast.error('Failed to submit review');
        }
    });
}

/**
 * Fetch all solution reviews for dashboard analytics
 */
export function useAllSolutionReviews() {
    return useQuery({
        queryKey: ['all-solution-reviews'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('solution_reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Error fetching all reviews:', error);
                return [];
            }
            return data || [];
        }
    });
}

