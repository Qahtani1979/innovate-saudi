/**
 * Hook for Strategy Adjustments & Approval Routing
 * Centralizes logic for submitting strategy adjustments and creating approval requests.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

export function useStrategyAdjustmentMutations() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();

    const submitAdjustment = useMutation({
        mutationFn: async ({
            elementType,
            elementId,
            elementName,
            changeType,
            currentValue,
            newValue,
            justification,
            impactLevel,
            strategicPlanId,
            aiAnalysis
        }) => {
            if (!user) throw new Error('User not authenticated');

            // Create approval request for the adjustment
            const { data, error } = await supabase
                .from('approval_requests')
                .insert({
                    request_type: 'strategy_adjustment',
                    entity_type: elementType,
                    entity_id: elementId || null,
                    requester_email: user.email,
                    requester_notes: justification,
                    metadata: {
                        element_name: elementName,
                        change_type: changeType,
                        current_value: currentValue,
                        new_value: newValue,
                        impact_level: impactLevel,
                        strategic_plan_id: strategicPlanId,
                        ai_analysis: aiAnalysis
                    }
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['approval_requests']);
            toast.success(t({ en: 'Adjustment submitted for approval', ar: 'تم إرسال التعديل للموافقة' }));
        },
        onError: (error) => {
            console.error('Adjustment submission error:', error);
            toast.error(t({ en: 'Failed to submit adjustment', ar: 'فشل في إرسال التعديل' }));
        }
    });

    return { submitAdjustment };
}
