import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotificationSystem } from './useNotificationSystem';
import { useAuditLogger } from './useAuditLogger';

/**
 * Hook for Governance and Committee Mutations
 */
export function useGovernanceQueries(entityId, entityType) {
    const isPilot = entityType?.toLowerCase() === 'pilot';
    const table = isPilot ? 'pilot_approvals' : 'approval_requests';
    const idField = isPilot ? 'pilot_id' : 'entity_id';

    return useQuery({
        queryKey: ['governance-approvals', entityId, entityType],
        queryFn: async () => {
            let query = supabase.from(table).select('*').eq(idField, entityId);
            if (table === 'approval_requests') {
                query = query.eq('entity_type', entityType.toLowerCase());
            }
            const { data, error } = await query.order('created_at', { ascending: true });
            if (error) throw error;

            // Normalize data mapping to consistent structure
            return (data || []).map(item => ({
                id: item.id,
                // For pilot_approvals, we might store step in approval_type if needed, 
                // but for now we'll rely on the order of created_at or metadata
                step: item.metadata?.step || (item.approval_type?.startsWith('step_') ? parseInt(item.approval_type.split('_')[1]) : null),
                decision: item.decision || item.status || item.approval_status || 'pending',
                approver_name: item.approver_name || item.approver_email || 'Approver',
                comments: item.comments || item.reviewer_notes || item.rejection_reason || '',
                approved_date: item.approved_date || item.approval_date || item.approved_at || item.created_at
            }));
        },
        enabled: !!entityId && !!entityType
    });
}

import { useAuth } from '@/lib/AuthContext';

const APPROVAL_WORKFLOW_CONFIG = {
    challenge: [
        { step: 1, role: 'municipality_lead', label: 'Municipality Lead', label_ar: 'قائد البلدية' },
        { step: 2, role: 'sector_expert', label: 'Sector Expert', label_ar: 'خبير القطاع' },
        { step: 3, role: 'gdisb_admin', label: 'GDISB Admin', label_ar: 'مسؤول المنصة' }
    ],
    pilot: [
        { step: 1, role: 'technical_lead', label: 'Technical Lead', label_ar: 'القائد التقني' },
        { step: 2, role: 'budget_officer', label: 'Budget Officer', label_ar: 'مسؤول الميزانية' },
        { step: 3, role: 'municipality_director', label: 'Director', label_ar: 'المدير' },
        { step: 4, role: 'gdisb_admin', label: 'GDISB Final Approval', label_ar: 'الموافقة النهائية' }
    ],
    program: [
        { step: 1, role: 'program_manager', label: 'Program Manager', label_ar: 'مدير البرنامج' },
        { step: 2, role: 'gdisb_admin', label: 'GDISB Admin', label_ar: 'مسؤول المنصة' }
    ]
};

export function useApprovalWorkflow(entityId, entityType) {
    const { user } = useAuth();
    const { data: approvals = [], isLoading } = useGovernanceQueries(entityId, entityType);
    const { submitApprovalDecision } = useGovernanceMutations();

    const workflow = APPROVAL_WORKFLOW_CONFIG[entityType.toLowerCase()] || [];

    // Calculate current step based on history
    const currentStep = approvals.length > 0
        ? Math.max(...approvals.map(a => a.step || 0)) + 1
        : 1;

    const currentStepConfig = workflow.find(s => s.step === currentStep);
    const canApprove = currentStepConfig && user?.role === currentStepConfig.role;
    const isWorkflowCompleted = currentStep > workflow.length;

    return {
        approvals,
        isLoading,
        workflow,
        currentStep,
        currentStepConfig,
        canApprove,
        isWorkflowCompleted,
        submitApprovalDecision,
        currentUser: user
    };
}

export function useGovernanceMutations() {
    const queryClient = useQueryClient();
    const { notify } = useNotificationSystem();
    const { logAction } = useAuditLogger();

    /**
     * Submit a decision in a multi-step approval workflow
     */
    const submitApprovalDecision = useMutation({
        mutationFn: async ({ entity, entityType, step, approverRole, approverName, decision, comments }) => {
            const isPilot = entityType.toLowerCase() === 'pilot';
            const table = isPilot ? 'pilot_approvals' : 'approval_requests';

            // 1. Prepare record based on table schema
            const record = isPilot ? {
                pilot_id: entity.id,
                approval_type: `step_${step}_${approverRole}`,
                approver_email: approverName, // Mapping name to email for now if that's what's available
                status: decision,
                comments: comments,
                approval_date: new Date().toISOString()
            } : {
                entity_type: entityType.toLowerCase(),
                entity_id: entity.id,
                request_type: 'multi_step_approval',
                approver_email: approverName,
                approval_status: decision,
                reviewer_notes: comments,
                metadata: { step, role: approverRole },
                created_at: new Date().toISOString()
            };

            const { error: appError } = await supabase
                .from(table)
                .insert([record]);
            if (appError) throw appError;

            // 2. Update entity status if rejected or final approval
            if (decision === 'rejected') {
                const { error: updateError } = await supabase
                    .from(entityType.toLowerCase() + 's')
                    .update({ status: 'rejected' })
                    .eq('id', entity.id);
                if (updateError) throw updateError;
            }

            return { decision, step };
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['governance-approvals', variables.entity.id, variables.entityType]);
            queryClient.invalidateQueries([variables.entityType.toLowerCase(), variables.entity.id]);
            toast.success('Decision recorded');
        }
    });

    /**
     * Submit a strategic plan review
     */
    const submitStrategicReview = useMutation({
        mutationFn: async ({ planId, status, reviewNotes }) => {
            const { error } = await supabase
                .from('strategic_plans')
                .update({
                    status,
                    review_notes: reviewNotes,
                    approval_date: status === 'approved' ? new Date().toISOString() : null
                })
                .eq('id', planId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['strategic-plans']);
            toast.success('Strategic review submitted');
        }
    });

    /**
     * Submit a peer review for an R&D proposal
     */
    const submitPeerReview = useMutation({
        mutationFn: async ({ proposalId, updatedReviews, finalScore, status }) => {
            const { error } = await supabase
                .from('rd_proposals')
                .update({
                    reviewer_scores: updatedReviews,
                    final_score: finalScore,
                    status
                })
                .eq('id', proposalId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['rd-proposal']);
            toast.success('Peer review submitted');
        }
    });

    /**
     * Pass or fail a compliance gate for a pilot
     */
    const passComplianceGate = useMutation({
        mutationFn: async ({ pilotId, pilotTitle, checklist, notes }) => {
            // 1. Update pilot compliance status
            const { error: pilotError } = await supabase
                .from('pilots')
                .update({
                    compliance_passed: true,
                    compliance_date: new Date().toISOString(),
                    compliance_notes: notes,
                    compliance_checklist: checklist
                })
                .eq('id', pilotId);
            if (pilotError) throw pilotError;

            // 2. Log system activity
            await logAction({
                action: 'COMPLIANCE_PASSED',
                entity_type: 'pilot',
                entity_id: pilotId,
                description: `Pilot "${pilotTitle}" passed compliance gate`,
                metadata: { checklist, notes }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pilot']);
            toast.success('Compliance gate passed');
        }
    });

    /**
     * Schedule a committee meeting
     */
    const scheduleCommitteeMeeting = useMutation({
        mutationFn: async ({ rdCall, meetingData }) => {
            // 1. Create task for the meeting
            const { error: taskError } = await supabase
                .from('tasks')
                .insert([{
                    title: meetingData.title,
                    description: `${meetingData.agenda}\n\nLocation: ${meetingData.location}\nLink: ${meetingData.meeting_link || 'N/A'}\n\nAttendees: ${meetingData.attendees.join(', ')}`,
                    due_date: meetingData.date,
                    status: 'todo',
                    priority: 'high',
                    tags: ['committee_meeting', 'rd_evaluation', rdCall.code]
                }]);
            if (taskError) throw taskError;

            // 2. Update RD Call
            const { error: callError } = await supabase
                .from('rd_calls')
                .update({
                    evaluation_meeting_scheduled: true,
                    evaluation_meeting_date: meetingData.date,
                    evaluation_meeting_link: meetingData.meeting_link
                })
                .eq('id', rdCall.id);
            if (callError) throw callError;

            // 3. Notify attendees
            await Promise.all(meetingData.attendees.map(email =>
                notify({
                    type: 'committee_invitation',
                    entityType: 'rd_call',
                    entityId: rdCall.id,
                    recipientEmails: [email],
                    title: `Committee Meeting: ${meetingData.title}`,
                    message: `You are invited to the meeting on ${meetingData.date} at ${meetingData.time}. Agenda: ${meetingData.agenda}`,
                    sendEmail: true,
                    emailTemplate: 'committee.invitation',
                    emailVariables: {
                        meetingTitle: meetingData.title,
                        meetingDate: meetingData.date,
                        meetingTime: meetingData.time,
                        location: meetingData.location,
                        meetingLink: meetingData.meeting_link
                    }
                })
            ));
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['rd-call']);
            queryClient.invalidateQueries(['tasks']);
            toast.success('Committee meeting scheduled and notifications sent');
        }
    });

    /**
     * Update a challenge treatment plan
     */
    const updateChallengeTreatment = useMutation({
        mutationFn: async ({ challengeId, treatmentPlan }) => {
            const { error } = await supabase
                .from('challenges')
                .update({
                    status: 'in_treatment',
                    treatment_plan: treatmentPlan
                })
                .eq('id', challengeId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['challenge']);
            toast.success('Treatment plan updated');
        }
    });

    return {
        submitApprovalDecision,
        submitStrategicReview,
        submitPeerReview,
        passComplianceGate,
        scheduleCommitteeMeeting,
        updateChallengeTreatment
    };
}
