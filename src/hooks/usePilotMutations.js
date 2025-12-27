import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from '@/hooks/useAuditLogger';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

/**
 * Hook for pilot-related mutations: create, update, change stage, delete.
 * Includes audit logging and email notifications.
 */
export function usePilotMutations() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { logCrudOperation, logStatusChange } = useAuditLogger();
    const { triggerEmail } = useEmailTrigger();
    const { checkPermission, checkEntityAccess } = useAccessControl();
    const { notify } = useNotificationSystem();
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

            notify.success('Pilot created successfully');
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
            notify.error(`Update failed: ${error.message}`);
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
            notify.success(`Pilot moved to stage: ${pilot.stage}`);
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
            notify.success('Pilot deleted successfully');
        },
        onError: (error) => {
            notify.error(`Delete failed: ${error.message}`);
        }
    });

    /**
     * Exit Pilot from Sandbox
     * Handles complex exit logic: updating pilot, updating sandbox, notifying
     */
    const exitPilotFromSandbox = useMutation({
        /** @param {{ pilotId: string, sandboxId: string, exitData: any, currentSandboxStats: any }} params */
        mutationFn: async ({ pilotId, sandboxId, exitData, currentSandboxStats }) => {
            const userEmail = user?.email;

            // 1. Update Pilot
            const { error: pilotError } = await supabase
                .from('pilots')
                .update({
                    stage: 'completed',
                    sandbox_exit_date: new Date().toISOString().split('T')[0],
                    sandbox_exit_type: exitData.exit_type,
                    sandbox_exit_data: exitData,
                    recommendation: exitData.recommendation
                })
                .eq('id', pilotId);
            if (pilotError) throw pilotError;

            // 2. Update Sandbox Capacity
            if (sandboxId) {
                const { error: sandboxError } = await supabase
                    .from('sandboxes')
                    .update({
                        current_pilots: (currentSandboxStats.current_pilots || 1) - 1,
                        total_completed_projects: (currentSandboxStats.total_completed_projects || 0) + 1
                    })
                    .eq('id', sandboxId);
                if (sandboxError) throw sandboxError;
            }

            // 3. Create Notification
            await supabase.from('notifications').insert([{
                type: 'sandbox_exit',
                title: `Project Exited Sandbox`,
                message: `Project has completed its sandbox phase with ${exitData.exit_type}.`,
                severity: exitData.exit_type === 'successful_completion' ? 'success' : 'warning',
                link: `/PilotDetail?id=${pilotId}`,
                user_email: userEmail // Assuming simple notification, adjust as needed
            }]);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pilot', variables.pilotId] });
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            if (variables.sandboxId) {
                queryClient.invalidateQueries({ queryKey: ['sandbox', variables.sandboxId] });
            }
            notify.success('Sandbox exit processed successfully');
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
            notify.success(`Iteration started for: ${pilot.title_en}`);
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
            notify.success('Successfully enrolled in pilot!');
        },
        onError: (error) => {
            notify.error(`Enrollment failed: ${error.message}`);
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
            notify.success(variables.approved ? 'Budget approved' : 'Budget rejected');
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
            notify.success('Readiness assessment complete');
        },
        onError: (error) => {
            notify.error(`Assessment failed: ${error.message}`);
        }
    });

    /**
     * Convert Match to Pilot
     * Handles creating partnership, creating pilot, and updating application status.
     */
    const convertMatchToPilot = useMutation({
        mutationFn: async ({ application, challenge, pilotData, partnershipData }) => {
            // 1. Create Partnership Record
            const { error: partnershipError } = await supabase
                .from('organization_partnerships')
                .insert({
                    provider_id: application.organization_id,
                    partner_id: challenge?.organization_id,
                    match_id: application.matched_challenges?.[0], // Best effort linking
                    status: 'active',
                    start_date: new Date().toISOString(),
                    agreement_url: pilotData.partnership_agreement_url,
                    total_value: pilotData.budget,
                    ...partnershipData
                });

            if (partnershipError) {
                console.error('Partnership creation failed:', partnershipError);
                // We typically continue but let's log it.
            }

            // 2. Create Pilot
            const { data: pilot, error: pilotError } = await supabase
                .from('pilots')
                .insert({
                    ...pilotData,
                    challenge_id: challenge?.id,
                    solution_id: application.organization_id,
                    stage: 'design',
                    sector: challenge?.sector,
                    municipality_id: challenge?.municipality_id
                })
                .select()
                .single();

            if (pilotError) throw pilotError;

            // 3. Update Matchmaker Application
            const { error: appError } = await supabase
                .from('matchmaker_applications')
                .update({
                    conversion_status: 'pilot_created',
                    converted_pilot_id: pilot.id,
                    stage: 'pilot_conversion'
                })
                .eq('id', application.id);

            if (appError) throw appError;

            // 4. Send Email
            await triggerEmail('pilot.created', {
                entityType: 'pilot',
                entityId: pilot.id,
                variables: {
                    pilot_title: pilotData.title_en || pilotData.title_ar,
                    pilot_code: pilot.code || `PLT-${pilot.id?.substring(0, 8)}`,
                    organization_name: application.organization_name_en,
                    challenge_title: challenge?.title_en
                }
            }).catch(err => console.error('Email trigger failed:', err));

            return pilot;
        },
        onSuccess: (pilot) => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            queryClient.invalidateQueries({ queryKey: ['matchmaker-applications'] });
            notify.success('Pilot & Partnership created successfully!');
        },
        onError: (error) => {
            console.error('Conversion failed:', error);
            notify.error('Failed to create pilot');
        }
    });

    /**
     * Update Pilot Milestones
     */
    const updateMilestones = useMutation({
        mutationFn: async ({ pilotId, milestones, justCompleted }) => {
            const { error } = await supabase
                .from('pilots')
                .update({ milestones, updated_at: new Date().toISOString() })
                .eq('id', pilotId);

            if (error) throw error;

            // Trigger email if milestone was completed
            if (justCompleted) {
                await triggerEmail('pilot.milestone_completed', {
                    entity_type: 'pilot',
                    entity_id: pilotId,
                    variables: {
                        milestone_name: justCompleted.name,
                        milestone_due_date: justCompleted.due_date,
                        completed_count: milestones.filter(m => m.completed).length,
                        total_milestones: milestones.length
                    }
                }).catch(err => console.error('Email trigger failed:', err));
            }

            return milestones;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pilot', variables.pilotId] });
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            notify.success('Milestones updated successfully');
        },
        onError: (error) => {
            notify.error(`Failed to update milestones: ${error.message}`);
        }
    });

    return {
        createPilot,
        updatePilot,
        changeStage,
        deletePilot,
        exitPilotFromSandbox, // New method
        refreshPilots,  // ✅ Gold Standard: Export refresh method
        updateMilestones, // ✅ New: Milestone management
        isCreating: createPilot.isPending,
        isUpdating: updatePilot.isPending,
        isDeleting: deletePilot.isPending,
        isUpdatingMilestones: updateMilestones.isPending,
        archivePilots: archivePilots.mutateAsync,
        deletePilots: deletePilots.mutateAsync,
        startIteration,
        enrollCitizen,
        approveBudget: approveBudget.mutateAsync,
        isApprovingBudget: approveBudget.isPending,
        processBudgetApproval,
        saveScalingReadiness: saveScalingReadiness.mutateAsync,
        isSavingReadiness: saveScalingReadiness.isPending,
        convertMatchToPilot
    };
}

/**
 * Bulk Archive Pilots
 */
function useBulkArchivePilots() {
    const queryClient = useAppQueryClient();
    const { checkPermission } = useAccessControl();
    const { notify } = useNotificationSystem();

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
            notify.success(`${ids.length} pilots archived`);
        }
    });
}

/**
 * Bulk Delete Pilots
 */
function useBulkDeletePilots() {
    const queryClient = useAppQueryClient();
    const { checkPermission } = useAccessControl();
    const { notify } = useNotificationSystem();

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
            notify.success(`${ids.length} pilots deleted`);
        }
    });
}
export default usePilotMutations;

