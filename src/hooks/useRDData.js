import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch Activity Logs for R&D entities
 * @param {string} entityType - 'RDProject', 'RDProposal', 'RDCall'
 * @param {string} entityId - UUID of the entity
 */
export function useRDActivityLog(entityType, entityId) {
    return useQuery({
        queryKey: ['rd-activity-log', entityType, entityId],
        queryFn: async () => {
            if (!entityId) return [];
            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.warn(`Failed to fetch activities for ${entityType} ${entityId}`, error);
                return [];
            }
            return data;
        },
        enabled: !!entityId
    });
}

/**
 * Hook to fetch Publications for a project
 */
export function useRDPublications(projectId) {
    return useQuery({
        queryKey: ['rd-publications', projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('research_publications') // Assuming table name
                .select('*')
                .eq('project_id', projectId);

            if (error) return [];
            return data || [];
        },
        enabled: !!projectId
    });
}

/**
 * Hook to fetch IP Assets for a project
 */
export function useRDIPAssets(projectId) {
    return useQuery({
        queryKey: ['rd-ip-assets', projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('intellectual_property') // Assuming table name
                .select('*')
                .eq('project_id', projectId);

            if (error) return [];
            return data || [];
        },
        enabled: !!projectId
    });
}

/**
 * Hook to fetch Municipalities for Pilot matching
 */
export function useRDMunicipalities() {
    return useQuery({
        queryKey: ['rd-municipalities'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('municipalities')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch Challenges for matching
 */
export function useRDChallenges() {
    return useQuery({
        queryKey: ['rd-challenges'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch Policy Recommendations for impact tracking
 */
export function useRDPolicies() {
    return useQuery({
        queryKey: ['rd-policies'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('policy_recommendations')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch Comments for an RD Call
 * Mapped from system_activities where activity_type = 'comment'
 */
export function useRDCallComments(entityId) {
    return useQuery({
        queryKey: ['rd-call-comments', entityId],
        queryFn: async () => {
            if (!entityId) return [];
            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .eq('entity_type', 'RDCall')
                .eq('entity_id', entityId)
                .eq('activity_type', 'comment')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn(`Failed to fetch comments for RDCall ${entityId}`, error);
                return [];
            }

            // Map description to comment_text to match component expectation
            return data.map(item => ({
                ...item,
                comment_text: item.description,
                created_by: item.user_email // Fallback since created_by isn't direct
            }));
        },
        enabled: !!entityId
    });
}

