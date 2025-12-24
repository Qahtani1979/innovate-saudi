import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

/**
 * Hook for fetching vendor performance metrics
 */
export function useVendorPerformance(vendorId) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['vendor-performance', vendorId],
        queryFn: async () => {
            let query = supabase
                .from('vendor_performance')
                .select('*')
                .eq('vendor_id', vendorId)
                .order('created_at', { ascending: false });

            query = applyVisibilityRules(query, 'vendor_performance');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!vendorId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for fetching vendor ratings and reviews
 */
export function useVendorRatings(vendorId) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['vendor-ratings', vendorId],
        queryFn: async () => {
            let query = supabase
                .from('vendor_ratings')
                .select('*')
                .eq('vendor_id', vendorId)
                .order('created_at', { ascending: false });

            query = applyVisibilityRules(query, 'vendor_ratings');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!vendorId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for calculating vendor performance summary
 */
export function useVendorPerformanceSummary(vendorId) {
    const { data: performance = [] } = useVendorPerformance(vendorId);
    const { data: ratings = [] } = useVendorRatings(vendorId);

    const summary = {
        totalProjects: performance.length,
        averageRating: ratings.length > 0
            ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
            : 0,
        totalReviews: ratings.length,
        onTimeDelivery: performance.filter(p => p.delivered_on_time).length,
        qualityScore: performance.length > 0
            ? performance.reduce((sum, p) => sum + (p.quality_score || 0), 0) / performance.length
            : 0,
    };

    return summary;
}

export default useVendorPerformance;
