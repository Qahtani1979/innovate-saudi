import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook for fetching policy recommendations with visibility rules.
 * 
 * Visibility:
 * - Admin / Full Visibility: All recommendations
 * - Policy Staff: All recommendations (needs checking role)
 * - Municipality: Own recommendations + published ones
 * - Public/Others: Published recommendations only
 */
export function usePoliciesWithVisibility(options = {}) {
    const {
        status,
        entityType,
        entityId,
        priority,
        limit = 100,
        publishedOnly = false
    } = options;

    const permissionsData = usePermissions();
    const { isAdmin = false, hasRole = () => false, userId = null } = permissionsData || {};

    const visibilityData = useVisibilitySystem();
    const {
        hasFullVisibility = false,
        userMunicipalityId = null,
        isLoading: visibilityLoading = true
    } = visibilityData || {};

    const isPolicyStaff = hasRole('policy_admin') ||
        hasRole('legal_reviewer') ||
        hasRole('deputyship_staff') ||
        isAdmin;

    return useQuery({
        queryKey: ['policies-with-visibility', {
            userId,
            isPolicyStaff,
            hasFullVisibility,
            userMunicipalityId,
            status,
            entityType,
            entityId,
            priority,
            limit,
            publishedOnly
        }],
        enabled: !visibilityLoading,
        queryFn: async () => {
            let query = supabase
                .from('policy_recommendations')
                .select('*')
                .limit(limit);

            // Access Control
            if (!hasFullVisibility && !isPolicyStaff) {
                if (publishedOnly) {
                    query = query.eq('is_published', true);
                } else {
                    // Complexity: Policy recommendations might not have municipality_id directly
                    // but they have source_entity_id/type. 
                    // For now, if not staff, only show published.
                    query = query.eq('is_published', true);
                }
            }

            // Filters
            if (status && status !== 'all') query = query.eq('status', status);
            if (entityType && entityType !== 'all') query = query.eq('source_entity_type', entityType);
            if (entityId) query = query.eq('source_entity_id', entityId);
            if (priority && priority !== 'all') query = query.eq('priority', priority);

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return /** @type {import('@/types/supa_ext').PolicyRecommendation[]} */ (data) || [];
        }
    });
}
