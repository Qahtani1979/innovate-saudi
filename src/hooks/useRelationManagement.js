import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing entity relations and data fetching for the hub.
 */
export function useRelationManagement() {
    const queryClient = useQueryClient();

    // --- Data Fetching Hooks ---

    const useAllRelations = () => useQuery({
        queryKey: ['all-relations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('challenge_solution_matches').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useAllChallenges = () => useQuery({
        queryKey: ['challenges-relations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('challenges').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useAllSolutions = () => useQuery({
        queryKey: ['solutions-relations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('solutions').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useAllPilots = () => useQuery({
        queryKey: ['pilots-relations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('pilots').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useAllRDProjects = () => useQuery({
        queryKey: ['rd-projects-relations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('rd_projects').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useAllPrograms = () => useQuery({
        queryKey: ['programs-relations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('programs').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useAllRDCalls = () => useQuery({
        queryKey: ['rd-calls-relations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('rd_calls').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useAllPolicies = () => useQuery({
        queryKey: ['policies-relations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('policy_recommendations').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    // --- Mutations ---

    const reviewRelation = useMutation({
        mutationFn: async ({ relationId, decision }) => {
            const statusMap = {
                'approve': 'accepted',
                'reject': 'rejected',
                'dismiss': 'rejected'
            };
            const newStatus = statusMap[decision] || decision; // Allow direct 'approved'/'rejected' if passed

            const { data, error } = await supabase
                .from('challenge_solution_matches')
                .update({
                    status: newStatus,
                    municipality_action_date: new Date().toISOString()
                })
                .eq('id', relationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['all-relations'] });
            toast.success(`Relation ${variables.decision} successfully`);
        },
        onError: (error) => {
            console.error('Review error:', error);
            toast.error('Failed to update relation status');
        }
    });

    const updateRelation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: updated, error } = await supabase
                .from('challenge_solution_matches')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return updated;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-relations'] });
            toast.success('Relation updated successfully');
        }
    });

    const deleteRelation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('challenge_solution_matches').delete().eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-relations'] });
            toast.success('Relation deleted');
        }
    });

    const createMatch = useMutation({
        mutationFn: async (matchData) => {
            const { data, error } = await supabase.from('challenge_solution_matches').insert(matchData).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Validation/Refetch handled by caller usually because of loop, but good to have here
            queryClient.invalidateQueries({ queryKey: ['all-relations'] });
        }
    });


    return {
        useAllRelations,
        useAllChallenges,
        useAllSolutions,
        useAllPilots,
        useAllRDProjects,
        useAllPrograms,
        useAllRDCalls,
        useAllPolicies,
        reviewRelation,
        deleteRelation,
        createMatch,
        updateRelation
    };
}

export default useRelationManagement;
