import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';

/**
 * @typedef {Object} RDCall
 * @property {string} id
 * @property {string} title_en
 * @property {string} [title_ar]
 * @property {string} status
 * @property {string} [approval_status]
 * @property {string} [announcement_date]
 * @property {string} [awards_announced_date]
 */

/**
 * Hook for R&D Call mutations (approve, reject, etc.)
 */
export function useRDCallMutations() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();

    // Approve R&D Call
    const approveRDCallMutation = useMutation({
        /** @param {string} callId */
        mutationFn: async (callId) => {
            const { data, error } = await supabase
                .from('rd_calls')
                .update({
                    approval_status: 'approved',
                    approved_at: new Date().toISOString(),
                    approved_by: user?.email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', callId)
                .select()
                .single();

            if (error) throw error;

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'rd_call',
                entity_id: callId,
                activity_type: 'approved',
                description: `R&D Call approved by ${user?.email}`,
                metadata: { approved_by: user?.email }
            });

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, ENTITY_TYPES.RD_CALL, callId, null, { approval_status: 'approved' });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-calls-with-visibility'] });
            toast.success('R&D Call approved successfully');
        },
        onError: (error) => {
            toast.error('Failed to approve R&D Call: ' + error.message);
        }
    });

    // Reject R&D Call
    const rejectRDCallMutation = useMutation({
        /** @param {string} callId */
        mutationFn: async (callId) => {
            const { data, error } = await supabase
                .from('rd_calls')
                .update({
                    approval_status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', callId)
                .select()
                .single();

            if (error) throw error;

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'rd_call',
                entity_id: callId,
                activity_type: 'rejected',
                description: `R&D Call rejected by ${user?.email}`
            });

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, ENTITY_TYPES.RD_CALL, callId, null, { approval_status: 'rejected' });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-calls-with-visibility'] });
            toast.success('R&D Call rejected');
        },
        onError: (error) => {
            toast.error('Failed to reject R&D Call: ' + error.message);
        }
    });

    // Create R&D Call
    const createRDCallMutation = useMutation({
        /** @param {any} data */
        mutationFn: async (data) => {
            const cleanData = {
                ...data,
                total_funding: data.total_funding || undefined,
                number_of_awards: data.number_of_awards || undefined,
                funding_per_project: (data.funding_per_project?.min || data.funding_per_project?.max)
                    ? data.funding_per_project
                    : undefined,
                focus_areas: data.focus_areas?.length > 0 ? data.focus_areas : ['general'],
                timeline: Object.values(data.timeline || {}).some(v => v) ? data.timeline : undefined,
                contact_person: Object.values(data.contact_person || {}).some(v => v) ? data.contact_person : undefined
            };
            const { data: result, error } = await supabase
                .from('rd_calls')
                .insert(cleanData)
                .select()
                .single();
            if (error) throw error;

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'rd_call',
                entity_id: result.id,
                activity_type: 'created',
                description: `R&D Call "${result.title_en}" created by ${user?.email}`
            });

            await logCrudOperation(AUDIT_ACTIONS.CREATE, ENTITY_TYPES.RD_CALL, result.id, null, cleanData);

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-calls'] });
            queryClient.invalidateQueries({ queryKey: ['rd-calls-with-visibility'] });
            toast.success('R&D Call created successfully');
        },
        onError: (error) => {
            toast.error('Failed to create R&D Call: ' + error.message);
        }
    });

    // Update R&D Call
    const updateRDCallMutation = useMutation({
        /** @param {{id: string, activityLog?: {type: string, description: string}, [key: string]: any}} params */
        mutationFn: async ({ id, activityLog, ...data }) => {
            const { data: result, error } = await supabase
                .from('rd_calls')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;

            // Log activity
            if (activityLog) {
                await supabase.from('system_activities').insert({
                    entity_type: 'rd_call',
                    entity_id: id,
                    activity_type: activityLog.type,
                    description: activityLog.description,
                    metadata: { ...data }
                });
            } else {
                await supabase.from('system_activities').insert({
                    entity_type: 'rd_call',
                    entity_id: id,
                    activity_type: 'updated',
                    description: `R&D Call "${result.title_en}" updated by ${user?.email}`
                });
            }

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, ENTITY_TYPES.RD_CALL, id, null, data);

            return result;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['rd-calls'] });
            queryClient.invalidateQueries({ queryKey: ['rd-calls-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['rd-call', data.id] });
            toast.success('R&D Call updated successfully');
        },
        onError: (error) => {
            toast.error('Failed to update R&D Call: ' + error.message);
        }
    });

    // Publish R&D Call
    const publishRDCallMutation = useMutation({
        /** @param {{id: string, notes: string}} params */
        mutationFn: async ({ id, notes }) => {
            const { data: result, error: updateError } = await supabase
                .from('rd_calls')
                .update({
                    status: 'open',
                    announcement_date: new Date().toISOString(),
                    publication_notes: notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'rd_call',
                entity_id: id,
                activity_type: 'published',
                description: `R&D Call "${result.title_en}" published by ${user?.email}`,
                metadata: { notes }
            });

            await logCrudOperation('PUBLISH', ENTITY_TYPES.RD_CALL, id, null, { status: 'open', notes });

            return result;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['rd-calls-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['rd-call', data.id] });
            toast.success('R&D Call published successfully');
        }
    });

    // Handle RD Call Decision (Approval/Rejection/Revision)
    const handleRDCallDecisionMutation = useMutation({
        /** @param {{id: string, decision: string, comments: string}} params */
        mutationFn: async ({ id, decision, comments }) => {
            let newStatus = 'draft';
            if (decision === 'approved') {
                newStatus = 'published'; // Or should it be 'open'? Workflow says 'published' which maps to something usually.
            }

            const { data: result, error } = await supabase
                .from('rd_calls')
                .update({
                    status: newStatus,
                    approval_status: decision,
                    approval_comments: comments,
                    approved_by: user?.email,
                    approval_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'rd_call',
                entity_id: id,
                activity_type: decision,
                description: `R&D Call decision "${decision}" recorded by ${user?.email}`,
                metadata: { comments }
            });

            await logCrudOperation('DECISION', ENTITY_TYPES.RD_CALL, id, null, { status: newStatus, decision, comments });

            return result;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['rd-calls-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['rd-call', data.id] });
            toast.success(`Decision "${data.approval_status}" recorded`);
        }
    });

    // Award R&D Call
    const awardRDCallMutation = useMutation({
        /** @param {{id: string, awardedProposals: any[], message: string, notifyAll: boolean}} params */
        mutationFn: async ({ id, awardedProposals, message, notifyAll }) => {
            // 1. Update awarded proposals
            for (const proposal of awardedProposals) {
                const { error: proposalError } = await supabase
                    .from('rd_proposals')
                    .update({
                        status: 'awarded',
                        award_date: new Date().toISOString(),
                        award_message: message,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', proposal.id);
                if (proposalError) throw proposalError;

                // 2. Create R&D Project from awarded proposal
                const { error: projectError } = await supabase
                    .from('rd_projects')
                    .insert([{
                        code: `RD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                        title_en: proposal.title_en,
                        title_ar: proposal.title_ar,
                        abstract_en: proposal.abstract_en,
                        abstract_ar: proposal.abstract_ar,
                        rd_call_id: id,
                        institution: proposal.lead_institution,
                        principal_investigator: proposal.principal_investigator,
                        budget: proposal.budget_requested,
                        duration_months: proposal.duration_months,
                        trl_start: proposal.trl_start,
                        trl_target: proposal.trl_target,
                        status: 'approved',
                        research_area: proposal.research_themes?.[0] || 'General',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }]);
                if (projectError) throw projectError;
            }

            // 3. Update R&D Call status
            const { data: call, error: callError } = await supabase
                .from('rd_calls')
                .update({
                    status: 'awarded',
                    awards_announced_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();
            if (callError) throw callError;

            // 4. Handle non-awarded proposals if notifyAll is true
            if (notifyAll) {
                const { error: rejectError } = await supabase
                    .from('rd_proposals')
                    .update({
                        status: 'not_awarded',
                        updated_at: new Date().toISOString()
                    })
                    .eq('rd_call_id', id)
                    .neq('status', 'awarded');
                if (rejectError) throw rejectError;
            }

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'rd_call',
                entity_id: id,
                activity_type: 'awarded',
                description: `R&D Call "${call.title_en}" awards announced. ${awardedProposals.length} winners selected.`,
                metadata: { winners_count: awardedProposals.length }
            });

            await logCrudOperation('AWARD', ENTITY_TYPES.RD_CALL, id, null, { winners: awardedProposals.length });

            return call;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['rd-calls-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['rd-call', data.id] });
            queryClient.invalidateQueries({ queryKey: ['rd-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
            toast.success('Awards announced successfully');
        }
    });

    return {
        approveRDCall: approveRDCallMutation.mutateAsync,
        rejectRDCall: rejectRDCallMutation.mutateAsync,
        createRDCall: createRDCallMutation.mutateAsync,
        updateRDCall: updateRDCallMutation.mutateAsync,
        publishRDCall: publishRDCallMutation.mutateAsync,
        handleRDCallDecision: handleRDCallDecisionMutation.mutateAsync,
        awardRDCall: awardRDCallMutation.mutateAsync,
        isApproving: approveRDCallMutation.isPending,
        isRejecting: rejectRDCallMutation.isPending,
        isCreating: createRDCallMutation.isPending,
        isUpdating: updateRDCallMutation.isPending,
        isPublishing: publishRDCallMutation.isPending,
        isDeciding: handleRDCallDecisionMutation.isPending,
        isAwarding: awardRDCallMutation.isPending
    };
}
