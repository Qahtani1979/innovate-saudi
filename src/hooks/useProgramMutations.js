/**
 * Program Mutations Hook
 * Implements CRUD operations for Programs with audit logging and notifications
 */
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useMutation } from '@tanstack/react-query';

export function useProgramMutations() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();
    const { notify } = useNotificationSystem();
    const { checkPermission, checkEntityAccess } = useAccessControl();

    /**
     * Create Program
     */
    /**
     * Create Program
     */
    const createMutation = useMutation({
        /** @param {any} programData */
        mutationFn: async (programData) => {
            // 1. Role Check
            checkPermission(['admin', 'innovation_manager', 'program_manager']);

            const { data, error } = await supabase
                .from('programs')
                .insert({
                    ...programData,
                    created_by: user?.email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // Create approval request if submitting for approval
            if (programData.status === 'pending' || programData.submit_for_approval) {
                const slaDueDate = new Date();
                slaDueDate.setDate(slaDueDate.getDate() + 5);

                await supabase.from('approval_requests').insert({
                    entity_type: 'program',
                    entity_id: data.id,
                    request_type: 'program_approval',
                    requester_email: user?.email,
                    approval_status: 'pending',
                    sla_due_date: slaDueDate.toISOString(),
                    metadata: {
                        gate_name: 'approval',
                        program_type: data.program_type,
                        name: data.name_en
                    }
                });

                try {
                    await notify({
                        type: 'program_approval_requested',
                        entityType: 'program',
                        entityId: data.id,
                        title: 'Program Approval Requested',
                        message: `Program "${data.name_en}" requires approval.`,
                        recipientEmails: [user?.email],
                        sendEmail: true,
                        emailTemplate: 'program_approval_requested',
                        emailVariables: {
                            program_name: data.name_en,
                            program_type: data.program_type,
                            requester_email: user?.email
                        }
                    });
                } catch (e) {
                    console.warn('Notification failed:', e);
                }
            } else {
                try {
                    await notify({
                        type: 'program_created',
                        entityType: 'program',
                        entityId: data.id,
                        title: 'Program Created',
                        message: `Program "${data.name_en}" created successfully.`,
                        recipientEmails: [user?.email],
                        sendEmail: true
                    });
                } catch (e) { }
            }

            await logCrudOperation(AUDIT_ACTIONS.CREATE, ENTITY_TYPES.PROGRAM, data.id, null, programData);

            return data;
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['programs-with-visibility'] });

            notify.success('Program created successfully');
        },
        onError: (error) => {
            notify.error(`Failed to create program: ${error.message}`);
        }
    });

    /**
     * Batch Create Programs
     */
    const createProgramsBatch = useMutation({
        /** @param {any[]} programsData */
        mutationFn: async (programsData) => {
            // 1. Role Check
            checkPermission(['admin', 'innovation_manager', 'program_manager']);

            const results = await Promise.all(
                programsData.map(async (program) => {
                    const { data, error } = await supabase.from('programs').insert({
                        ...program,
                        created_by: user?.email,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }).select().single();
                    if (error) throw error;

                    // Log for each created program
                    await logCrudOperation(AUDIT_ACTIONS.CREATE, ENTITY_TYPES.PROGRAM, data.id, null, program);

                    return data;
                })
            );
            return results;
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            notify.success(`Created ${data.length} programs`);
        },
        onError: (error) => {
            notify.error(`Failed to create programs: ${error.message}`);
        }
    });

    /**
     * Update Program
     */
    const updateProgram = useMutation({
        /** @param {{ id: string, data: any }} params */
        mutationFn: async ({ id, data: updates }) => {
            // Fetch current for access check
            const { data: currentProgram } = await supabase
                .from('programs')
                .select('created_by')
                .eq('id', id)
                .single();

            checkEntityAccess(currentProgram, 'created_by');

            const { data, error } = await supabase
                .from('programs')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, ENTITY_TYPES.PROGRAM, id, null, updates);
            return { data, previousCreator: currentProgram.created_by };
        },
        onSuccess: async ({ data, previousCreator }, variables) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['programs-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['program', variables.id] });

            notify.success('Program updated');

            // Notify Update
            try {
                await notify({
                    type: 'program_updated',
                    entityType: 'program',
                    entityId: data.id,
                    recipientEmails: [previousCreator || user?.email], // Notify owner
                    title: 'Program Updated',
                    message: `Program "${data.name_en}" has been updated.`,
                    sendEmail: true
                });
            } catch (e) { console.warn('Notification failed:', e); }
        },
        onError: (error) => {
            notify.error(`Failed to update program: ${error.message}`);
        }
    });

    /**
     * Open Applications (from Planning)
     */
    const openApplications = useMutation({
        /** @param {{ programId: string, announcement: string, checklist: any[] }} params */
        mutationFn: async ({ programId, announcement, checklist }) => {
            const { data: currentProgram } = await supabase
                .from('programs')
                .select('created_by')
                .eq('id', programId)
                .single();

            checkEntityAccess(currentProgram, 'created_by');

            const { data, error } = await supabase
                .from('programs')
                .update({
                    status: 'applications_open',
                    launch_date: new Date().toISOString().split('T')[0],
                    launch_checklist: checklist,
                    announcement_text: announcement,
                    updated_at: new Date().toISOString()
                })
                .eq('id', programId)
                .select()
                .single();

            if (error) throw error;

            return data;
        },
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['program', data.id] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Program opened for applications');

            // Audit
            await logCrudOperation('UPDATE', ENTITY_TYPES.PROGRAM, data.id, null, { status: 'applications_open', announcement: variables.announcement });

            try {
                await notify({
                    type: 'program_launched',
                    entityType: 'program',
                    entityId: data.id,
                    title: `New Program: ${data.name_en}`,
                    message: variables.announcement || `${data.name_en} is now accepting applications.`,
                    recipientEmails: [], // Public notification? Or rely on system feeds.
                    // If sendEmail is true, who to? Maybe registered users interested in programs.
                    // Gold Standard: system might fan out.
                    sendEmail: true,
                    emailTemplate: 'program_launched',
                    emailVariables: {
                        name: data.name_en,
                        program_type: data.program_type,
                        announcement: variables.announcement,
                        launchDate: data.launch_date
                    }
                });
            } catch (e) { console.warn('Notification failed:', e); }
        }
    });

    /**
     * Start Program (Move to Active)
     */
    const startProgram = useMutation({
        /** @param {string} programId */
        mutationFn: async (programId) => {
            const { data: currentProgram } = await supabase
                .from('programs')
                .select('created_by')
                .eq('id', programId)
                .single();

            checkEntityAccess(currentProgram, 'created_by');

            const { data, error } = await supabase
                .from('programs')
                .update({
                    status: 'active',
                    is_published: true,
                    launched_at: new Date().toISOString(),
                    launched_by: user?.email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', programId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['program', data.id] });
            toast.success('Program started');

            await logCrudOperation('UPDATE', ENTITY_TYPES.PROGRAM, data.id, null, { status: 'active', action: 'started' });
        }
    });

    /**
    /**
     * Complete Program
     */
    const completeProgram = useMutation({
        /** @param {string} programId */
        mutationFn: async (programId) => {
            const { data: currentProgram } = await supabase
                .from('programs')
                .select('created_by')
                .eq('id', programId)
                .single();

            checkEntityAccess(currentProgram, 'created_by');

            const { data, error } = await supabase
                .from('programs')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    completed_by: user?.email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', programId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['program', data.id] });
            toast.success('Program completed');

            await logCrudOperation('UPDATE', ENTITY_TYPES.PROGRAM, data.id, null, { status: 'completed' });

            try {
                await notify({
                    type: 'program_completed',
                    entityType: 'program',
                    entityId: data.id,
                    title: 'Program Completed',
                    message: `Program "${data.name_en}" has been completed.`,
                    recipientEmails: [data.created_by], // Notify creator.
                    // Also notify participants?
                    sendEmail: true,
                    emailTemplate: 'program_completed',
                    emailVariables: {
                        name: data.name_en,
                        program_type: data.program_type
                    }
                });
            } catch (e) {
                console.warn('Notification failed:', e);
            }
        }
    });

    /**
     * Cancel Program
     */
    const cancelProgram = useMutation({
        /** @param {{ programId: string, reason: string, notifyParticipants: boolean }} params */
        mutationFn: async ({ programId, reason, notifyParticipants }) => {
            const { data: currentProgram } = await supabase
                .from('programs')
                .select('created_by')
                .eq('id', programId)
                .single();

            checkEntityAccess(currentProgram, 'created_by');

            const { data, error } = await supabase
                .from('programs')
                .update({
                    status: 'cancelled',
                    cancellation_reason: reason,
                    cancelled_at: new Date().toISOString(),
                    cancelled_by: user?.email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', programId)
                .select()
                .single();

            if (error) throw error;

            if (notifyParticipants) {
                try {
                    await notify({
                        type: 'program_cancelled',
                        entityType: 'program',
                        entityId: programId,
                        title: 'Program Cancelled',
                        message: `Program "${data.name_en}" has been cancelled. Reason: ${reason}`,
                        recipientEmails: [], // System fan-out?
                        // If we want to notify participants, we need to fetch them.
                        // Or let system handle it by entityId reference if "participants" are linked.
                        sendEmail: true,
                        emailTemplate: 'program_cancelled',
                        emailVariables: {
                            name: data.name_en,
                            cancellation_reason: reason
                        }
                    });
                } catch (e) { console.warn('Notification failed:', e); }
            }

            return data;
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['program', data.id] });
            toast.success('Program cancelled');
            await logCrudOperation('UPDATE', ENTITY_TYPES.PROGRAM, data.id, null, { status: 'cancelled', reason: data.cancellation_reason });
        }
    });

    /**
     * Delete Program
     */
    const deleteProgram = useMutation({
        /** @param {string} id */
        mutationFn: async (id) => {
            const { data: currentProgram } = await supabase
                .from('programs')
                .select('created_by')
                .eq('id', id)
                .single();

            checkEntityAccess(currentProgram, 'created_by');

            const { error } = await supabase
                .from('programs')
                .update({
                    is_deleted: true,
                    deleted_by: user?.email,
                    deleted_date: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: async (id) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['programs-with-visibility'] });
            toast.success('Program deleted');
            await logCrudOperation('DELETE', ENTITY_TYPES.PROGRAM, id, null, {});
        }
    });

    /**
     * Approve Program
     */
    const approveProgram = useMutation({
        /** @param {string} programId */
        mutationFn: async (programId) => {
            checkPermission(['admin', 'program_manager']);
            const { data, error } = await supabase
                .from('programs')
                .update({
                    approval_status: 'approved',
                    approved_at: new Date().toISOString(),
                    approved_by: user?.email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', programId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['program', data.id] });
            await logCrudOperation('APPROVE', ENTITY_TYPES.PROGRAM, data.id, null, { approval_status: 'approved' });

            // Notify Creator
            await notify({
                type: 'program_approved',
                entityType: 'program',
                entityId: data.id,
                recipientEmails: [data.created_by],
                title: 'Program Approved',
                message: `Program "${data.name_en}" has been approved.`,
                sendEmail: true
            });
            toast.success('Program approved');
        }
    });

    /**
     * Reject Program
     */
    const rejectProgram = useMutation({
        /** @param {string} programId */
        mutationFn: async (programId) => {
            checkPermission(['admin', 'program_manager']);
            const { data, error } = await supabase
                .from('programs')
                .update({
                    approval_status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', programId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['program', data.id] });
            await logCrudOperation('REJECT', ENTITY_TYPES.PROGRAM, data.id, null, { approval_status: 'rejected' });
            // Notify Creator
            await notify({
                type: 'program_rejected',
                entityType: 'program',
                entityId: data.id,
                recipientEmails: [data.created_by],
                title: 'Program Rejected',
                message: `Program "${data.name_en}" has been rejected.`,
                sendEmail: true
            });
            toast.success('Program rejected');
        }
    });

    /**
     * Batch Update Applications (for screening results)
     */
    const updateApplicationBatch = useMutation({
        /** @param {any[]} updates */
        mutationFn: async (updates) => {
            checkPermission(['admin', 'program_manager']);
            const results = await Promise.all(
                updates.map(update =>
                    supabase
                        .from('program_applications')
                        .update(update.data)
                        .eq('id', update.id)
                        .select()
                        .single()
                )
            );

            const errors = results.filter(r => r.error).map(r => r.error);
            if (errors.length > 0) throw errors[0];

            return results.map(r => r.data);
        },
        onSuccess: (data) => {
            if (data.length > 0) {
                queryClient.invalidateQueries({ queryKey: ['program-applications', data[0].program_id] });
            }
            toast.success('Applications updated successfully');
        }
    });

    /**
     * Finalize Selection (Accept/Reject cohort and start program)
     */
    const finalizeSelection = useMutation({
        /** @param {{ programId: string, selectedIds: string[], rejectedIds: string[], rejectionMessage: string }} params */
        mutationFn: async ({ programId, selectedIds, rejectedIds, rejectionMessage }) => {
            checkPermission(['admin', 'program_manager']);
            // 1. Accept selected
            if (selectedIds.length > 0) {
                const { error: acceptError } = await supabase
                    .from('program_applications')
                    .update({
                        status: 'accepted',
                        selection_date: new Date().toISOString().split('T')[0]
                    })
                    .in('id', selectedIds);
                if (acceptError) throw acceptError;
            }

            // 2. Reject others
            if (rejectedIds.length > 0) {
                const { error: rejectError } = await supabase
                    .from('program_applications')
                    .update({
                        status: 'rejected',
                        rejection_reason: rejectionMessage,
                        rejection_date: new Date().toISOString().split('T')[0]
                    })
                    .in('id', rejectedIds);
                if (rejectError) throw rejectError;
            }

            // 3. Update program
            const { data: program, error: programError } = await supabase
                .from('programs')
                .update({
                    status: 'active',
                    accepted_count: selectedIds.length,
                    updated_at: new Date().toISOString()
                })
                .eq('id', programId)
                .select()
                .single();
            if (programError) throw programError;

            return { program, selectedCount: selectedIds.length, rejectedCount: rejectedIds.length };
        },
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['program', data.program.id] });
            queryClient.invalidateQueries({ queryKey: ['program-applications', data.program.id] });
            toast.success(`Selection finalized: ${data.selectedCount} accepted`);

            await logCrudOperation('UPDATE', ENTITY_TYPES.PROGRAM, data.program.id, null, {
                accepted_count: data.selectedCount,
                rejected_count: data.rejectedCount,
                action: 'selection_finalized'
            });

            // Summary notification
            await notify({
                type: 'program_selection_done',
                entityType: 'program',
                entityId: data.program.id,
                title: 'Selection Finalized',
                message: `${data.selectedCount} participants selected for ${data.program.name_en}`,
                recipientEmails: [data.program.created_by],
                sendEmail: true
            });
        }
    });

    /**
     * Complete Mid-Program Review
     */
    const completeMidReview = useMutation({
        /** @param {{ programId: string, checklist: any[], notes: string, adjustments: any }} params */
        mutationFn: async ({ programId, checklist, notes, adjustments }) => {
            checkPermission(['admin', 'program_manager']);
            const { data: program, error } = await supabase
                .from('programs')
                .update({
                    mid_review_completed: true,
                    mid_review_date: new Date().toISOString().split('T')[0],
                    mid_review_checklist: checklist,
                    mid_review_notes: notes,
                    mid_review_adjustments: adjustments,
                    updated_at: new Date().toISOString()
                })
                .eq('id', programId)
                .select()
                .single();
            if (error) throw error;
            return program;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['program', data.id] });
            toast.success('Mid-program review completed');
            logCrudOperation('UPDATE', ENTITY_TYPES.PROGRAM, data.id, null, { mid_review: true });
        }
    });

    /**
     * Create Program from Gap Recommendation
     */
    const createProgramFromRecommendation = useMutation({
        /** @param {any} rec */
        mutationFn: async (rec) => {
            const programData = {
                name_en: rec.program_name_en,
                name_ar: rec.program_name_ar,
                program_type: rec.program_type,
                status: 'draft',
                objectives: rec.objectives,
                target_outcomes: rec.outcomes?.map(o => ({ description: o, target: 100, current: 0 })),
                is_gap_derived: true,
                gap_derivation_date: new Date().toISOString(),
                priority: rec.priority,
                duration_months: rec.duration_months,
                strategic_plan_ids: rec.related_gap?.plan ? [rec.related_gap.plan.id] : []
            };
            return await createMutation.mutateAsync(programData);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            toast.success('Program created from recommendation');
        },
        onError: (error) => {
            toast.error(`Failed to create program: ${error.message}`);
        }
    });

    /**
     * Generate AI Lessons Summary (Gold Standard AI Pattern)
     */
    const generateLessonsSummary = useMutation({
        /** @param {{ invokeAI: Function, prompts: any, schema: any }} params */
        mutationFn: async ({ invokeAI, prompts, schema }) => {
            const result = await invokeAI({
                system_prompt: prompts.system,
                prompt: prompts.user,
                response_json_schema: schema
            });
            if (result.success && result.data) return result.data;
            throw new Error('AI generation failed');
        },
        onSuccess: () => {
            toast.success('Strategic summary generated');
        }
    });

    /**
     * Refresh programs cache (Gold Standard Pattern)
     */
    const refreshPrograms = () => {
        queryClient.invalidateQueries({ queryKey: ['programs'] });
        queryClient.invalidateQueries({ queryKey: ['programs-with-visibility'] });
    };

    return {
        // Mutations (Objects - Standard)
        createProgram: createMutation,
        createProgramsBatch: createProgramsBatch,
        updateProgram: updateProgram,
        deleteProgram: deleteProgram,
        openApplications: openApplications,
        startProgram: startProgram,
        completeProgram: completeProgram,
        cancelProgram: cancelProgram,
        approveProgram: approveProgram,
        rejectProgram: rejectProgram,
        updateApplicationBatch: updateApplicationBatch,
        finalizeSelection: finalizeSelection,
        completeMidReview: completeMidReview,
        createProgramFromRecommendation: createProgramFromRecommendation,
        generateLessonsSummary, // Already an object
        refreshPrograms,

        // Mutation states (Legacy/Convenience - still keeping these if needed)
        isCreating: createMutation.isPending,
        isBatchCreating: createProgramsBatch.isPending,
        isUpdating: updateProgram.isPending,
        isOpening: openApplications.isPending,
        isStarting: startProgram.isPending,
        isCompleting: completeProgram.isPending,
        isCancelling: cancelProgram.isPending,
        isDeleting: deleteProgram.isPending,
        isApproving: approveProgram.isPending,
        isRejecting: rejectProgram.isPending,
        isBatchUpdating: updateApplicationBatch.isPending,
        isFinalizing: finalizeSelection.isPending,
        isReviewing: completeMidReview.isPending,
        isCreatingFromRec: createProgramFromRecommendation.isPending,
        isGeneratingLessonsSummary: generateLessonsSummary.isPending
    };
}

export default useProgramMutations;

