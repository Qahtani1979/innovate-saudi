import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useNotificationSystem } from '@/hooks/useNotificationSystem'; // Replaces EmailTrigger
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';
import { useAccessControl } from '@/hooks/useAccessControl';
// Removed useLogActivity as it's likely redundant with AuditLogger + Notification
import { useMutation } from '@/hooks/useAppQueryClient';

/**
 * Hook for solution-related mutations: create, update, delete.
 * Includes audit logging and email notifications.
 */
export function useSolutionMutations() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { notify } = useNotificationSystem();
    const { logCrudOperation } = useAuditLogger();
    const { checkPermission, checkEntityAccess } = useAccessControl();

    /**
     * Create a new solution
     */
    const createSolution = useMutation({
        /** @param {Object} data */
        mutationFn: async (data) => {
            // 1. Role Check
            checkPermission(['admin', 'innovation_manager', 'service_provider']);

            const solutionData = {
                ...data,
                created_by: user?.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: solution, error } = await supabase
                .from('solutions')
                .insert(solutionData)
                .select()
                .single();

            if (error) throw error;

            // Log creation in audit logs
            await logCrudOperation(AUDIT_ACTIONS.CREATE, ENTITY_TYPES.SOLUTION, solution.id, null, solutionData);

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'solution',
                entity_id: solution.id,
                activity_type: 'created',
                description: `Solution "${data.name_en}" created by ${data.provider_name || user?.email}`,
                metadata: { provider: data.provider_name }
            });

            return solution;
        },
        onSuccess: async (solution) => {
            queryClient.invalidateQueries({ queryKey: ['solutions'] });

            // Notify Admin/Manager
            await notify({
                type: 'solution_created',
                entityType: 'solution',
                entityId: solution.id,
                title: 'New Solution Created',
                message: `Solution "${solution.name_en}" has been created by ${solution.provider_name}.`,
                recipientEmails: [], // System notification to admins? or just rely on feed
                sendEmail: true, // Send email to admins? Or maybe confirm to creator?
                // Let's assume confirmation to creator for now, or alert to admins.
                // Gold Standard: notify() handles routing if configured.
                emailTemplate: 'solution_created',
                emailVariables: {
                    solution_name: solution.name_en,
                    solution_code: solution.code,
                    provider_name: solution.provider_name
                }
            });

            toast.success('Solution created successfully!');
        },
        onError: (error) => {
            toast.error(`Failed to create solution: ${error.message}`);
        }
    });

    /**
     * Update an existing solution
     */
    const updateSolution = useMutation({
        /** @param {{id: string, data: Object, activityLog?: {type?: string, description?: string, metadata?: Object}, changedFields?: string[], metadata?: Object}} params */
        mutationFn: async ({ id, data, activityLog, changedFields = [], metadata = {} }) => {
            // Get current solution for versioning and auditing
            const { data: currentSolution } = await supabase
                .from('solutions')
                .select('*')
                .eq('id', id)
                .single();

            // Check Access (Ownership or Admin)
            checkEntityAccess(currentSolution, 'created_by');

            const updateData = {
                ...data,
                version_number: (currentSolution?.version_number || 1) + 1,
                previous_version_id: id,
                updated_at: new Date().toISOString()
            };

            const { data: updated, error } = await supabase
                .from('solutions')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Log update in audit logs
            await logCrudOperation(AUDIT_ACTIONS.UPDATE, ENTITY_TYPES.SOLUTION, id, currentSolution, updateData);

            // Log changes in activity system
            if (activityLog) {
                await supabase.from('system_activities').insert({
                    entity_type: 'solution',
                    entity_id: id,
                    activity_type: activityLog.type || 'updated',
                    description: activityLog.description || `Solution updated (v${currentSolution?.version_number || 1} → v${updateData.version_number})${changedFields.length > 0 ? `: ${changedFields.length} fields modified` : ''}`,
                    metadata: {
                        changed_fields: changedFields,
                        version: updateData.version_number,
                        ...activityLog.metadata,
                        ...metadata
                    }
                });
            } else {
                await supabase.from('system_activities').insert({
                    entity_type: 'solution',
                    entity_id: id,
                    activity_type: 'updated',
                    description: `Solution updated (v${currentSolution?.version_number || 1} → v${updateData.version_number})${changedFields.length > 0 ? `: ${changedFields.length} fields modified` : ''}`,
                    metadata: {
                        changed_fields: changedFields,
                        version: updateData.version_number,
                        ...metadata
                    }
                });
            }

            // Regenerate embedding if content changed
            const contentFields = ['description_en', 'name_en', 'features', 'tagline_en', 'value_proposition'];
            const hasContentChanges = changedFields.some(field => contentFields.includes(field));

            if (hasContentChanges) {
                try {
                    await supabase.functions.invoke('generate-embeddings', {
                        body: {
                            entity_name: 'solution',
                            entity_ids: [id]
                        }
                    });
                } catch (err) {
                    console.error('Embedding regeneration failed:', err);
                }
            }

            return updated;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['solution', data.id] });
            queryClient.invalidateQueries({ queryKey: ['solutions'] });
            toast.success('Solution updated successfully');
        },
        onError: (error) => {
            toast.error(`Failed to update: ${error.message}`);
        }
    });

    /**
     * Delete a solution (soft delete)
     */
    const deleteSolution = useMutation({
        /** @param {string} id */
        mutationFn: async (id) => {
            const { data: currentSolution } = await supabase
                .from('solutions')
                .select('*')
                .eq('id', id)
                .single();

            checkEntityAccess(currentSolution, 'created_by');

            const { error } = await supabase
                .from('solutions')
                .update({
                    is_deleted: true,
                    deleted_by: user?.email,
                    deleted_date: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            // Log deletion in audit logs
            await logCrudOperation(AUDIT_ACTIONS.DELETE, ENTITY_TYPES.SOLUTION, id, currentSolution, { is_deleted: true });

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'solution',
                entity_id: id,
                activity_type: 'deleted',
                description: `Solution (ID: ${id}) soft-deleted by ${user?.email}`
            });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solutions'] });
            toast.success('Solution deleted');
        },
        onError: (error) => {
            toast.error(`Failed to delete: ${error.message}`);
        }
    });

    /**
     * Bulk archive solutions
     */
    const bulkArchiveSolutions = useMutation({
        /** @param {string[]} ids */
        mutationFn: async (ids) => {
            checkPermission(['admin', 'innovation_manager']);
            const { error } = await supabase
                .from('solutions')
                .update({ is_archived: true })
                .in('id', ids);
            if (error) throw error;

            // Audit Log
            await logCrudOperation('BULK_ARCHIVE', ENTITY_TYPES.SOLUTION, 'multiple', null, { ids });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solutions'] });
            toast.success('Solutions archived successfully');
        }
    });

    /**
     * Toggle Publish Status
     */
    const togglePublishSolution = useMutation({
        /** @param {{id: string, isPublished: boolean}} params */
        mutationFn: async ({ id, isPublished }) => {
            // Retrieve validation info first
            const { data: currentSolution } = await supabase
                .from('solutions')
                .select('created_by')
                .eq('id', id)
                .single();

            checkEntityAccess(currentSolution, 'created_by');

            const { error } = await supabase
                .from('solutions')
                .update({ is_published: isPublished })
                .eq('id', id);

            if (error) throw error;

            // Audit Log
            await logCrudOperation('TOGGLE_PUBLISH', ENTITY_TYPES.SOLUTION, id, null, { is_published: isPublished });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solutions'] });
            toast.success('Solution visibility updated');
        }
    });

    /**
     * Verify a solution (Admin)
     */
    const verifySolution = useMutation({
        mutationFn: async ({ solutionId, verificationData }) => {
            checkPermission(['admin', 'innovation_manager']);

            const { error: updateError } = await supabase.from('solutions').update({
                is_verified: true,
                verification_date: new Date().toISOString().split('T')[0],
                verification_notes: verificationData.verificationNotes,
                verification_checklist: verificationData.checklist,
                ai_verification_recommendation: verificationData.aiRecommendation,
                workflow_stage: 'verified',
                updated_at: new Date().toISOString()
            }).eq('id', solutionId);

            if (updateError) throw updateError;

            // Audit
            await logCrudOperation('VERIFY', ENTITY_TYPES.SOLUTION, solutionId, null, { verified: true });

            return solutionId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solutions'] });
            toast.success('Solution verified successfully');
        },
        onError: (error) => {
            toast.error(`Verification failed: ${error.message}`);
        }
    });

    /**
     * Send Feedback to Provider
     */
    const sendFeedbackToProvider = useMutation({
        mutationFn: async ({ pilotId, solution, pilot, data }) => {
            // Notify Provider
            await notify({
                type: 'pilot_feedback_request', // or solution_feedback
                entityType: 'pilot',
                entityId: pilotId,
                recipientEmails: [solution?.contact_email || pilot?.created_by].filter(Boolean),
                title: 'Feedback Request',
                message: 'You have received feedback on your pilot.',
                sendEmail: true,
                emailTemplate: 'pilot_feedback_request',
                emailVariables: {
                    pilotTitle: pilot?.title_en,
                    municipalityId: pilot?.municipality_id,
                    improvements: data.improvements,
                    aiSuggestions: data.ai_suggestions ? JSON.stringify(data.ai_suggestions, null, 2) : ''
                }
            });

            // Log Activity
            await supabase.from('user_activities').insert({
                entity_type: 'pilot',
                entity_id: pilotId,
                activity_type: 'feedback_sent',
                description: `Solution feedback sent to provider: ${solution?.provider_name || 'Provider'}`,
                metadata: { improvements: data.improvements },
                user_id: user?.id
            });

            return { pilotId };
        },
        onSuccess: ({ pilotId }) => {
            queryClient.invalidateQueries({ queryKey: ['system-activity'] });
            queryClient.invalidateQueries({ queryKey: ['entity-activities', pilotId] });
            toast.success('Feedback sent to provider');
        },
        onError: (error) => {
            toast.error(`Failed to send: ${error.message}`);
        }
    });

    /**
     * Refresh solutions cache (Gold Standard Pattern)
     */
    const refreshSolutions = () => {
        queryClient.invalidateQueries({ queryKey: ['solutions'] });
        queryClient.invalidateQueries({ queryKey: ['solutions-with-visibility'] });
    };

    return {
        createSolution,
        updateSolution,
        deleteSolution,
        refreshSolutions,  // ✅ Gold Standard
        isCreating: createSolution.isPending,
        isUpdating: updateSolution.isPending,
        isDeleting: deleteSolution.isPending,
        bulkArchiveSolutions,

        togglePublishSolution,
        sendFeedbackToProvider,
        verifySolution
    };
}

export default useSolutionMutations;


