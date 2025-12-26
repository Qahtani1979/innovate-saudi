import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

/**
 * @typedef {Object} UseStrategiesOptions
 * @property {string | null} [status] - Filter by status (e.g., 'active', 'draft')
 * @property {string | null} [sectorId] - Filter by sector ID (checks target_sectors)
 * @property {boolean} [publishedOnly] - If true, only returns public plans
 * @property {string | null} [municipalityId] - Filter by municipality ID
 */

/**
 * Hook to fetch strategic plans with visibility rules applied.
 * @param {UseStrategiesOptions} options
 */
export const useStrategiesWithVisibility = ({
    status = null,
    sectorId = null,
    publishedOnly = false,
    municipalityId = null,
    includeTemplates = false,
    id = null
} = {}) => {
    const { canViewInternal } = useVisibilitySystem();

    return useQuery({
        queryKey: ['strategic-plans', { status, sectorId, publishedOnly, municipalityId, canViewInternal }],
        queryFn: async () => {
            let query = supabase
                .from('strategic_plans')
                .select(`
                    *,
                    municipalities (
                        id,
                        name: name_en
                    )
                `)
                .eq('is_deleted', false);

            // Apply status filter
            if (status && status !== 'all') {
                query = query.eq('status', status);
            }

            // Apply sector filter (array column)
            if (sectorId) {
                query = query.contains('target_sectors', [sectorId]);
            }

            // Apply municipality filter
            if (municipalityId) {
                query = query.eq('municipality_id', municipalityId);
            }

            // Apply template filter (default: exclude templates)
            if (!includeTemplates) {
                query = query.or('is_template.is.null,is_template.eq.false');
            }

            // Apply ID filter
            if (id) {
                query = query.eq('id', id);
            }

            // Apply visibility rules
            if (publishedOnly || !canViewInternal) {
                query = query.eq('is_public', true);
                if (!status) {
                    query = query.eq('status', 'active');
                }
            }

            // Default sorting
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching strategic plans:', error);
                throw error;
            }

            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
