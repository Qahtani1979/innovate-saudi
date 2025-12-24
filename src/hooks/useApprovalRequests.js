import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { useAuditLogger } from './useAuditLogger';

/**
 * useApprovalRequests Hook
 * Centralizes all approval logic across the platform.
 */
export function useApprovalRequests() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { fetchWithVisibility } = useVisibilitySystem();
    const { logAction } = useAuditLogger();

    // --- QUERIES ---

    /**
     * Fetch all approval requests from the approval_requests table for a specific entity type
     */
    const useApprovalRequestsByType = (entityType) => useQuery({
        queryKey: ['approval-requests', entityType],
        queryFn: async () => {
            const { data: approvals, error: appError } = await supabase
                .from('approval_requests')
                .select('*')
                .eq('entity_type', entityType)
                .in('approval_status', ['pending', 'under_review']);

            if (appError) throw appError;

            // Map back to table data (using visibility system)
            const entityTableMap = {
                rd_proposal: 'rd_proposals',
                program_application: 'program_applications',
                matchmaker_application: 'matchmaker_applications',
                solution: 'solutions',
                program: 'programs',
                innovation_proposal: 'innovation_proposals',
                event: 'events'
            };

            const tableName = entityTableMap[entityType];
            if (!tableName) return approvals;

            const entities = await fetchWithVisibility(tableName);

            return (approvals || []).map(a => ({
                ...a,
                entityData: (entities || []).find(e => e.id === a.entity_id)
            })).filter(a => a.entityData);
        },
        enabled: !!user
    });

    /**
     * Fetch legacy pending items from direct tables
     */
    const useLegacyPendingItems = (tableName, statusField = 'status', statusValue = 'under_review', extraFilters = {}) => useQuery({
        queryKey: ['legacy-pending', tableName, statusValue],
        queryFn: async () => {
            let query = supabase.from(tableName).select('*').eq(statusField, statusValue);

            Object.entries(extraFilters).forEach(([key, val]) => {
                query = query.eq(key, val);
            });

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!user
    });

    const useMyChallengeReviews = () => useQuery({
        queryKey: ['my-challenge-reviews', user?.email],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('review_assigned_to', user?.email)
                .eq('status', 'under_review');
            if (error) throw error;
            return data || [];
        },
        enabled: !!user
    });

    const usePendingPilots = () => useQuery({
        queryKey: ['pending-pilots'],
        queryFn: async () => {
            const { data, error } = await supabase.from('pilots').select('*');
            if (error) throw error;
            return data || [];
        },
        enabled: !!user
    });

    // --- MUTATIONS ---

    const processApprovalMutation = useMutation({
        /**
         * @param {{ id: string, entityType: string, action: 'approve' | 'reject', updates?: object, reason?: string, logMetadata?: object }} params
         */
        mutationFn: async ({ id, entityType, action, updates, reason, logMetadata = {} }) => {
            // 1. Update the actual entity if provided
            if (updates) {
                const tableMap = {
                    challenge: 'challenges',
                    pilot: 'pilots',
                    program_application: 'program_applications',
                    rd_proposal: 'rd_proposals',
                    citizen_idea: 'citizen_ideas',
                    innovation_proposal: 'innovation_proposals',
                    rd_project: 'rd_projects',
                    event: 'events',
                    solution: 'solutions',
                    program: 'programs'
                };

                const { error: entityError } = await supabase
                    .from(tableMap[entityType])
                    .update(updates)
                    .eq('id', id);

                if (entityError) throw entityError;
            }

            // 2. Update the approval_requests table if it's a workflow request
            const { data: approvalRequest } = await supabase
                .from('approval_requests')
                .select('id')
                .eq('entity_id', id)
                .eq('entity_type', entityType)
                .in('approval_status', ['pending', 'under_review'])
                .maybeSingle();

            if (approvalRequest) {
                const { error: appError } = await supabase
                    .from('approval_requests')
                    .update({
                        approval_status: action === 'approve' ? 'approved' : 'rejected',
                        reviewer_email: user?.email,
                        review_date: new Date().toISOString(),
                        reviewer_notes: reason
                    })
                    .eq('id', approvalRequest.id);

                if (appError) throw appError;
            }

            // 3. Log the action
            await logAction({
                action: action === 'approve' ? 'APPROVE_ENTITY' : 'REJECT_ENTITY',
                entity_type: entityType,
                entity_id: id,
                description: `${action === 'approve' ? 'Approved' : 'Rejected'} ${entityType}: ${reason || 'No reason provided'}`,
                metadata: { ...logMetadata, reviewer: user?.email }
            });

            return { success: true };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries();
            toast.success(variables.action === 'approve' ? 'Approved successfully' : 'Rejected successfully');
        },
        onError: (error) => {
            toast.error(`Error processing approval: ${error.message}`);
        }
    });

    return {
        // Queries
        useApprovalRequestsByType,
        useLegacyPendingItems,
        useMyChallengeReviews,
        usePendingPilots,
        // Mutations
        processApproval: processApprovalMutation.mutate,
        isProcessing: processApprovalMutation.isPending
    };
}
