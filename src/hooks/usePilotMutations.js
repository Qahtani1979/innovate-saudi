/**
 * Pilot Mutations Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';
import { useEmailTrigger } from './useEmailTrigger';
import { useAccessControl } from '@/hooks/useAccessControl';

/**
 * Hook for pilot-related mutations: create, update, change stage, delete.
 * Includes audit logging and email notifications.
 */
export function usePilotMutations() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { logCrudOperation, logStatusChange } = useAuditLogger();
    const { triggerEmail } = useEmailTrigger();
    const { checkPermission, checkEntityAccess } = useAccessControl();
    const archivePilots = useBulkArchivePilots();
    const deletePilots = useBulkDeletePilots();

    /**
     * Create Pilot
     */
    const createPilot = useMutation({
        /** @param {any} data */
        mutationFn: async (data) => {
            // 1. Permission Check
            checkPermission(['admin', 'innovation_manager', 'program_manager']);

            const pilotData = {
                ...data,
                created_by: user?.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: pilot, error } = await supabase
                .from('pilots')
                .insert(pilotData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(
                AUDIT_ACTIONS.CREATE,
                ENTITY_TYPES.PILOT,
                pilot.id,
                null,
                pilotData
            );

            await supabase.from('system_activities').insert({
                entity_type: 'pilot',
                entity_id: pilot.id,
                activity_type: 'created',
                description: `Pilot "${pilot.title_en}" created by ${user?.email}`
            });

            return pilot;
        },
        onSuccess: async (pilot) => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            queryClient.invalidateQueries({ queryKey: ['pending-pilots'] });
            await triggerEmail('pilot.created', {
                entity_type: 'pilot',
                entity_id: pilot.id,
                variables: {
                    pilot_name: pilot.title_en,
                    municipality: pilot.municipality_id
                }
            }).catch(err => console.error('Email trigger failed:', err));
            toast.success('Pilot created successfully');
        }
    });

    /**
     * Update Pilot
     */
    const updatePilot = useMutation({
        /** @param {any} params */
        mutationFn: async (params) => {
            const { id, data } = params;
            const { data: currentPilot } = await supabase
                .from('pilots')
                .select('*')
                .eq('id', id)
                .single();

            checkEntityAccess(currentPilot, 'created_by');

            const updateData = {
                ...data,
                updated_at: new Date().toISOString()
            };

            const { data: pilot, error } = await supabase
                .from('pilots')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(
                AUDIT_ACTIONS.UPDATE,
                ENTITY_TYPES.PILOT,
                id,
                currentPilot,
                updateData
            );

            if (data.activity_type || (data.stage && data.stage !== currentPilot.stage)) {
                await supabase.from('system_activities').insert({
                    entity_type: 'pilot',
                    entity_id: id,
                    activity_type: data.activity_type || `pilot_${data.stage}`,
                    description: data.activity_description || (data.stage ? `Pilot "${pilot.title_en}" moved to stage ${data.stage}` : `Pilot "${pilot.title_en}" updated`),
                    metadata: {
                        old_stage: currentPilot.stage,
                        new_stage: data.stage || currentPilot.stage,
                        ...(data.activity_metadata || data.metadata || {})
                    }
                });

                if (data.stage && data.stage !== currentPilot.stage) {
                    await triggerEmail('pilot.status_changed', {
                        entity_type: 'pilot',
                        entity_id: id,
                        variables: {
                            pilot_name: pilot.title_en,
                            new_status: data.stage
                        }
                    }).catch(err => console.error('Email trigger failed:', err));
                }
            }

            return pilot;
        },
        onMutate: async (params) => {
            const { id, data } = params;
            await queryClient.cancelQueries({ queryKey: ['pilot', id] });
            const previousPilot = queryClient.getQueryData(['pilot', id]);
            if (previousPilot) {
                queryClient.setQueryData(['pilot', id], (/** @type {any} */ old) => old ? { ...old, ...data } : data);
            }
            return { previousPilot };
        },
        onError: (error, variables, context) => {
            const { id } = variables;
            if (context?.previousPilot) {
                queryClient.setQueryData(['pilot', id], context.previousPilot);
            }
            toast.error(`Update failed: ${error.message}`);
        },
        onSettled: (pilot) => {
            if (pilot) {
                queryClient.invalidateQueries({ queryKey: ['pilot', pilot.id] });
            }
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            queryClient.invalidateQueries({ queryKey: ['pending-pilots'] });
        }
    });

    /**
     * Change Pilot Stage
     */
    const changeStage = useMutation({
        /** @param {any} params */
        mutationFn: async (params) => {
            const { id, newStage, notes, metadata = {} } = params;
            const { data: currentPilot } = await supabase
                .from('pilots')
                .select('stage, title_en, created_by')
                .eq('id', id)
                .single();

            checkEntityAccess(currentPilot, 'created_by');

            const { data: pilot, error } = await supabase
                .from('pilots')
                .update({
                    stage: newStage,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logStatusChange(ENTITY_TYPES.PILOT, id, currentPilot.stage, newStage, { notes });

            await supabase.from('system_activities').insert({
                entity_type: 'pilot',
                entity_id: id,
                activity_type: `pilot_${newStage}`,
                description: `Pilot stage changed to ${newStage}`,
                metadata: { notes, old_stage: currentPilot.stage, ...metadata }
            });

            await triggerEmail('pilot.status_changed', {
                entity_type: 'pilot',
                entity_id: id,
                variables: {
                    pilot_name: currentPilot.title_en,
                    new_status: newStage,
                    notes: notes || ''
                }
            }).catch(err => console.error('Email trigger failed:', err));

            return pilot;
        },
        onSuccess: (pilot) => {
            queryClient.invalidateQueries({ queryKey: ['pilot', pilot.id] });
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            queryClient.invalidateQueries({ queryKey: ['pending-pilots'] });
            toast.success(`Pilot moved to stage: ${pilot.stage}`);
        }
    });

    /**
     * Delete Pilot
     */
    const deletePilot = useMutation({
        /** @param {string} id */
        mutationFn: async (id) => {
            const { data: currentPilot } = await supabase
                .from('pilots')
                .select('*')
                .eq('id', id)
                .single();

            checkEntityAccess(currentPilot, 'created_by');

            const { error } = await supabase
                .from('pilots')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logCrudOperation(
                AUDIT_ACTIONS.DELETE,
                ENTITY_TYPES.PILOT,
                id,
                currentPilot,
                { deleted: true }
            );

            await supabase.from('system_activities').insert({
                entity_type: 'pilot',
                entity_id: id,
                activity_type: 'deleted',
                description: `Pilot "${currentPilot?.title_en || id}" deleted by ${user?.email}`
            });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            queryClient.invalidateQueries({ queryKey: ['pending-pilots'] });
            toast.success('Pilot deleted successfully');
        },
        onError: (error) => {
            toast.error(`Delete failed: ${error.message}`);
        }
    });

    /**
     * Start Iteration Loop
     */
    const startIteration = useMutation({
        mutationFn: async (pilotId) => {
            const { data: existing } = await supabase.from('pilots').select('created_by').eq('id', pilotId).single();
            checkEntityAccess(existing, 'created_by');

            const { data: pilot, error } = await supabase.from('pilots').update({
                stage: 'design',
                recommendation: 'pending',
                updated_at: new Date().toISOString()
            }).eq('id', pilotId).select().single();

            if (error) throw error;
            return pilot;
        },
        onSuccess: (pilot) => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            queryClient.invalidateQueries({ queryKey: ['iteration-pilots'] });
            toast.success(`Iteration started for: ${pilot.title_en}`);
        }
    });

    /**
     * Enroll Citizen
     */
    const enrollCitizen = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('citizen_pilot_enrollments').insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['enrollment']);
            queryClient.invalidateQueries(['my-enrollments']);
            toast.success('Successfully enrolled in pilot!');
        },
        onError: (error) => {
            toast.error(`Enrollment failed: ${error.message}`);
        }
    });

    /**
     * Budget Approval (Edge Function)
     */
    const approveBudget = useMutation({
        mutationFn: async ({ pilot_id, phase, amount, action, comments }) => {
            const { error } = await supabase.functions.invoke('budgetApproval', {
                body: { action, pilot_id, phase, amount, comments }
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
        }
    });

    /**
     * Process Budget Approval (Client-side Logic)
     * Replaces direct DB logic from BudgetApprovalWorkflow.jsx
     */
    const processBudgetApproval = useMutation({
        mutationFn: async ({ pilot, phase, amount, approved, comments }) => {
            const budgetApprovals = pilot.budget_approvals || [];
            const newApproval = {
                phase,
                amount,
                approved,
                approved_by: user?.email,
                approval_date: new Date().toISOString(),
                comments
            };

            const { error: pilotError } = await supabase.from('pilots').update({
                budget_approvals: [...budgetApprovals, newApproval],
                budget_released: approved
                    ? (pilot.budget_released || 0) + amount
                    : pilot.budget_released
            }).eq('id', pilot.id);
            if (pilotError) throw pilotError;

            const { error: activityError } = await supabase.from('system_activities').insert({
                activity_type: 'budget_approval',
                entity_type: 'Pilot',
                entity_id: pilot.id,
                description: `Budget ${phase} ${approved ? 'approved' : 'rejected'} for "${pilot.title_en}"`,
                metadata: { phase, amount, decision: approved ? 'approved' : 'rejected' }
            });
            if (activityError) throw activityError;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            queryClient.invalidateQueries({ queryKey: ['pilot', variables.pilot.id] });
            toast.success(variables.approved ? 'Budget approved' : 'Budget rejected');
        }
    });

    /**
     * Refresh pilots cache (Gold Standard Pattern)
     * Invalidates all pilot-related queries
     */
    const refreshPilots = () => {
        queryClient.invalidateQueries({ queryKey: ['pilots'] });
        queryClient.invalidateQueries({ queryKey: ['pilots-with-visibility'] });
        queryClient.invalidateQueries({ queryKey: ['pending-pilots'] });
    };

    /**
     * Save Scaling Readiness Assessment
     */
    const saveScalingReadiness = useMutation({
        mutationFn: async (assessmentData) => {
            const { error } = await supabase.from('scaling_readiness').insert(assessmentData);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            toast.success('Readiness assessment complete');
        },
        onError: (error) => {
            toast.error(`Assessment failed: ${error.message}`);
        }
    });

    return {
        createPilot,
        updatePilot,
        changeStage,
        deletePilot,
        refreshPilots,  // ✅ Gold Standard: Export refresh method
        isCreating: createPilot.isPending,
        isUpdating: updatePilot.isPending,
        isDeleting: deletePilot.isPending,
        archivePilots: archivePilots.mutateAsync,
        deletePilots: deletePilots.mutateAsync,
        startIteration,
        enrollCitizen,
        approveBudget: approveBudget.mutateAsync,
        isApprovingBudget: approveBudget.isPending,
        isApprovingBudget: approveBudget.isPending,
        processBudgetApproval,
        saveScalingReadiness: saveScalingReadiness.mutateAsync,
        isSavingReadiness: saveScalingReadiness.isPending
    };
}

function useBudgetApprovalMutation() {
    return useMutation({
        mutationFn: async ({ pilot_id, phase, amount, action, comments }) => {
            const { error } = await supabase.functions.invoke('budgetApproval', {
                body: { action, pilot_id, phase, amount, comments }
            });
            if (error) throw error;
        },
        onSuccess: () => {
            // Invalidation strategy might need adjustment based on where budget approvals are shown
            // but 'pilots' covers the main list.
        }
    });
}

/**
 * Bulk Archive Pilots
 */
function useBulkArchivePilots() {
    const queryClient = useQueryClient();
    const { checkPermission } = useAccessControl();

    return useMutation({
        mutationFn: async (ids) => {
            checkPermission(['admin', 'program_manager']);
            const { error } = await supabase
                .from('pilots')
                .update({ stage: 'terminated' })
                .in('id', ids);
            if (error) throw error;
            return ids;
        },
        onSuccess: (ids) => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            toast.success(`${ids.length} pilots archived`);
        }
    });
}

/**
 * Bulk Delete Pilots
 */
function useBulkDeletePilots() {
    const queryClient = useQueryClient();
    const { checkPermission } = useAccessControl();

    return useMutation({
        mutationFn: async (ids) => {
            checkPermission(['admin', 'program_manager']);
            const { error } = await supabase
                .from('pilots')
                .delete()
                .in('id', ids);
            if (error) throw error;
            return ids;
        },
        onSuccess: (ids) => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            toast.success(`${ids.length} pilots deleted`);
        }
    });
}

export default usePilotMutations;
