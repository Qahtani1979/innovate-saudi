/**
 * Hooks for Budget Approval Gates
 * Handles logic for Budget Allocation Approval and Scaling Plan Budget Approval.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook for Budget Allocation Approval Gate
 */
export function useBudgetAllocationApproval() {
    const { t } = useLanguage();

    const approvalMutation = useMutation({
        mutationFn: async ({ allocation, decision, comments }) => {
            const { error } = await supabase.from('system_activities').insert({
                activity_type: decision === 'approve' ? 'budget_allocation_approved' : 'budget_allocation_rejected',
                entity_type: 'Budget',
                description: `Budget allocation ${decision === 'approve' ? 'approved' : 'rejected'}`,
                metadata: { allocation, comments, decision }
            });
            if (error) throw error;
            return { success: true };
        },
        onSuccess: (_, { decision }) => {
            if (decision === 'approve') {
                toast.success(t({ en: 'Budget allocation approved', ar: 'تمت الموافقة على توزيع الميزانية' }));
            } else {
                toast.success(t({ en: 'Revision requested', ar: 'تم طلب التنقيح' }));
            }
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return { approvalMutation };
}

/**
 * Hook for Scaling Plan Budget Approval Gate
 */
export function useScalingBudgetApproval() {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const approvalMutation = useMutation({
        mutationFn: async ({ scalingPlan, decision, comments }) => {
            const isApproved = decision === 'approve';

            // Update scaling plan
            const { error: updateError } = await supabase
                .from('scaling_plans')
                .update({
                    budget_approved: isApproved,
                    budget_approval_date: new Date().toISOString(),
                    budget_approval_comments: comments
                })
                .eq('id', scalingPlan.id);

            if (updateError) throw updateError;

            // Trigger email notification
            const trigger = isApproved ? 'proposal.accepted' : 'proposal.revision_requested';
            const variables = isApproved ? {
                planTitle: scalingPlan.title_en,
                budgetAmount: scalingPlan.estimated_budget,
                comments: comments
            } : {
                planTitle: scalingPlan.title_en,
                comments: comments
            };

            await supabase.functions.invoke('email-trigger-hub', {
                body: {
                    trigger: trigger,
                    recipient_email: scalingPlan.created_by,
                    entity_type: 'scaling_plan',
                    entity_id: scalingPlan.id,
                    variables: variables,
                    triggered_by: 'system'
                }
            });
        },
        onSuccess: (_, { decision }) => {
            queryClient.invalidateQueries({ queryKey: ['scaling-plan'] });
            if (decision === 'approve') {
                toast.success(t({ en: 'Budget approved', ar: 'تمت الموافقة على الميزانية' }));
            } else {
                toast.success(t({ en: 'Revision requested', ar: 'تم طلب مراجعة' }));
            }
        },
        onError: (error) => {
            console.error('Budget approval failed:', error);
            toast.error(t({ en: 'Action failed', ar: 'فشل الإجراء' }));
        }
    });

    return { approvalMutation };
}
