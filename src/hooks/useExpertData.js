import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useExpertProfile(userId) {
    return useQuery({
        queryKey: ['expert-profile', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_profiles')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useExpertProfileById(expertId) {
    return useQuery({
        queryKey: ['expert-profile', expertId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_profiles')
                .select('*')
                .eq('id', expertId)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!expertId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useExpertAssignment(id) {
    return useQuery({
        queryKey: ['expert-assignment', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_assignments')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useExpertAssignments(email) {
    return useQuery({
        queryKey: ['expert-assignments', email],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_assignments')
                .select(`
          *,
          expert_panel:expert_panels(name_en, name_ar)
        `)
                .eq('expert_email', email)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!email,
        staleTime: 2 * 60 * 1000,
    });
}

export function useExpertEvaluations(email) {
    return useQuery({
        queryKey: ['expert-evaluations', email],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('evaluator_email', email)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!email,
        staleTime: 2 * 60 * 1000,
    });
}

export function useExpertDeadlines(email) {
    return useQuery({
        queryKey: ['expert-deadlines', email],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_assignments')
                .select('*')
                .eq('expert_email', email)
                .eq('status', 'assigned')
                .not('due_date', 'is', null)
                .order('due_date', { ascending: true })
                .limit(5);
            if (error) throw error;
            return data || [];
        },
        enabled: !!email
    });
}

export function useExperts() {
    return useQuery({
        queryKey: ['expert-profiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(500);
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useAllExpertAssignments() {
    return useQuery({
        queryKey: ['all-assignments'],
        queryFn: async () => {
            const { data, error } = await supabase.from('expert_assignments').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

export function useAllExpertEvaluations() {
    return useQuery({
        queryKey: ['all-evaluations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('expert_evaluations').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook for fetching expert evaluations by entity type and ID.
 */
export function useExpertEvaluationsByEntity(entityType, entityId) {
    return useQuery({
        queryKey: ['expert-evaluations-by-entity', entityType, entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!entityType && !!entityId,
    });
}

export function useExpertAssignmentsWithDetails(email) {
    return useQuery({
        queryKey: ['expert-assignments-with-details', email],
        queryFn: async () => {
            // 1. Fetch assignments
            const { data: assignments, error } = await supabase
                .from('expert_assignments')
                .select(`
                  *,
                  expert_panel:expert_panels(name_en, name_ar)
                `)
                .eq('expert_email', email)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!assignments || assignments.length === 0) return [];

            // 2. Enrich with entity details
            const enrichedAssignments = await Promise.all(
                assignments.map(async (a) => {
                    try {
                        let entity = null;
                        const tableName = a.entity_type === 'rd_proposal' ? 'rd_proposals' : `${a.entity_type}s`;

                        // Safety check for unknown entity types or if table names assume simple pluralization
                        // For now we assume the convention holds or we rely on the catching of errors

                        const { data: entityData, error: entityError } = await supabase
                            .from(tableName)
                            .select('*')
                            .eq('id', a.entity_id)
                            .single();

                        if (!entityError) {
                            entity = entityData;
                        }
                        return { ...a, entity };
                    } catch (err) {
                        console.warn(`Failed to fetch details for assignment ${a.id} (type: ${a.entity_type})`, err);
                        return { ...a, entity: null };
                    }
                })
            );

            return enrichedAssignments;
        },
        enabled: !!email,
        staleTime: 5 * 60 * 1000
    });
}

