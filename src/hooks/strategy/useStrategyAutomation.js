/**
 * Hook for Strategy Automation
 * Handles batch generation, scheduled analysis, and quality assessment.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

export function useStrategyAutomation() {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    // Run scheduled analysis (AutomationControls)
    const runAnalysis = useMutation({
        mutationFn: async ({ strategicPlanId, autoGenerateQueue, queueThreshold, notifyOnReview }) => {
            const { data, error } = await supabase.functions.invoke('strategy-scheduled-analysis', {
                body: {
                    strategic_plan_id: strategicPlanId,
                    auto_generate_queue: autoGenerateQueue,
                    queue_threshold: queueThreshold,
                    notify_on_review: notifyOnReview,
                    trigger_source: 'manual'
                }
            });

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            toast.success(t({
                en: `Analysis Complete: ${data.plans_analyzed} plan(s) analyzed`,
                ar: `اكتمل التحليل: تم تحليل ${data.plans_analyzed} خطة`
            }));
        },
        onError: (error) => {
            console.error('Analysis error:', error);
            toast.error(error.message || t({ en: 'Analysis Failed', ar: 'فشل التحليل' }));
        }
    });

    // Strategy Generators Mapping
    const getGeneratorFunction = (entityType) => {
        const map = {
            challenge: 'strategy-challenge-generator',
            pilot: 'strategy-pilot-generator',
            program: 'strategy-program-generator',
            campaign: 'strategy-campaign-generator',
            event: 'strategy-event-planner',
            policy: 'strategy-policy-generator',
            partnership: 'strategy-partnership-matcher',
            rd_call: 'strategy-rd-call-generator',
            living_lab: 'strategy-lab-research-generator'
        };
        return map[entityType] || 'strategy-challenge-generator';
    };

    // Single item generation (helper for batch process)
    const generateItem = async ({ strategicPlanId, queueItem }) => {
        const generatorFn = getGeneratorFunction(queueItem.entity_type);

        // 1. Update status to in_progress
        await supabase
            .from('demand_queue')
            .update({ status: 'in_progress', last_attempt_at: new Date().toISOString() })
            .eq('id', queueItem.id);

        try {
            // 2. Invoke generator
            const { data, error } = await supabase.functions.invoke(generatorFn, {
                body: {
                    strategic_plan_id: strategicPlanId,
                    queue_item_id: queueItem.id,
                    prefilled_spec: queueItem.prefilled_spec,
                    auto_mode: true
                }
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error(`Generator error for ${queueItem.id}:`, error);
            return { success: false, error };
        }
    };

    // Quality Assessment (helper for batch process)
    const assessQuality = async ({ entityType, entityData, queueItem }) => {
        const { data } = await supabase.functions.invoke('strategy-quality-assessor', {
            body: {
                entity_type: entityType,
                entity_data: entityData,
                queue_item: queueItem,
                mode: 'quick'
            }
        });
        return data;
    };

    // Update Queue Item Result (helper)
    const updateQueueResult = async ({ id, status, generatedEntityId, generatedEntityType, qualityScore, qualityFeedback, attempts, error }) => {
        const updateData = error ? {
            status: 'pending', // Reset to pending on failure for retry? Or failed? Existing logic was pending.
            attempts: attempts + 1,
            quality_feedback: { error: error.message, failed_at: new Date().toISOString() }
        } : {
            status,
            generated_entity_id: generatedEntityId,
            generated_entity_type: generatedEntityType,
            quality_score: qualityScore,
            quality_feedback: qualityFeedback,
            attempts: attempts + 1
        };

        await supabase
            .from('demand_queue')
            .update(updateData)
            .eq('id', id);

        // Invalidate queue query
        queryClient.invalidateQueries(['demand-queue']);
    };

    return {
        runAnalysis,
        generateItem,
        assessQuality,
        updateQueueResult
    };
}
