/**
 * Milestone Mutations Hook
 * Handles CRUD operations for milestones (pilot/sandbox/project milestones)
 */

import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useMilestoneMutations(entityType, entityId) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();
    const { notify } = useNotificationSystem();

    const tableMap = {
        pilot: 'pilot_milestones',
        sandbox: 'sandbox_project_milestones',
        rd_project: 'rd_project_milestones'
    };

    const table = tableMap[entityType] || 'pilot_milestones';

    /**
     * Create Milestone
     */
    const createMilestone = useMutation({
        mutationFn: async (data) => {
            const milestoneData = {
                ...data,
                [`${entityType}_id`]: entityId,
                created_by: user?.id,
                created_at: new Date().toISOString()
            };

            const { data: milestone, error } = await supabase
                .from(table)
                .insert(milestoneData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(
                AUDIT_ACTIONS.CREATE,
                entityType.toUpperCase(),
                entityId,
                null,
                { milestone_added: milestoneData }
            );

            return milestone;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [`${entityType}-milestones`, entityId] });
            queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
            toast.success('Milestone created');

            // Notification: Milestone Created
            notify({
                type: 'milestone_created',
                entityType: 'milestone',
                entityId: data?.id || 'new',
                recipientEmails: [user?.email].filter(Boolean),
                title: 'Milestone Created',
                message: 'New milestone has been added.',
                sendEmail: true,
                emailTemplate: 'milestone.created',
                emailVariables: {
                    milestone_title: data?.title || 'Untitled',
                    entity_type: entityType
                }
            });
        },
        onError: (error) => {
            toast.error(`Failed to create milestone: ${error.message}`);
        }
    });

    /**
     * Update Milestone
     */
    const updateMilestone = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: milestone, error } = await supabase
                .from(table)
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return milestone;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`${entityType}-milestones`, entityId] });
            toast.success('Milestone updated');
        }
    });

    /**
     * Delete Milestone
     */
    const deleteMilestone = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`${entityType}-milestones`, entityId] });
            toast.success('Milestone deleted');
        }
    });

    /**
     * Update milestone status
     */
    const updateMilestoneStatus = useMutation({
        mutationFn: async ({ id, status }) => {
            const updateData = {
                status,
                updated_at: new Date().toISOString()
            };

            if (status === 'completed') {
                updateData.completed_date = new Date().toISOString().split('T')[0];
            }

            const { data: milestone, error } = await supabase
                .from(table)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return milestone;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`${entityType}-milestones`, entityId] });
            toast.success('Milestone status updated');

            // Notification: Milestone Status
            if (status === 'completed') {
                notify({
                    type: 'milestone_completed',
                    entityType: 'milestone',
                    entityId: id,
                    recipientEmails: [user?.email].filter(Boolean),
                    title: 'Milestone Completed',
                    message: 'Milestone marked as completed.',
                    sendEmail: true,
                    emailTemplate: 'milestone.completed',
                    emailVariables: {
                        status: status,
                        completion_date: new Date().toLocaleDateString()
                    }
                });
            }
        }
    });

    return {
        createMilestone,
        updateMilestone,
        deleteMilestone,
        updateMilestoneStatus,
        isCreating: createMilestone.isPending,
        isUpdating: updateMilestone.isPending,
        isDeleting: deleteMilestone.isPending
    };
}

export default useMilestoneMutations;

