import { useMutation } from '@/hooks/useAppQueryClient';
import { useState, useCallback } from 'react';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing entity generation from action plans to demand_queue
 * Connects Step6ActionPlans → demand_queue → entity generators
 */
export function useEntityGeneration(strategicPlanId) {
  const queryClient = useAppQueryClient();
  const [generationStatus, setGenerationStatus] = useState({});

  // Queue action plans for entity generation
  const queueForGeneration = useMutation({
    mutationFn: async ({ actionPlans, objectives, wizardData }) => {
      if (!strategicPlanId) throw new Error('Strategic plan ID required');
      
      const toQueue = actionPlans.filter(ap => ap.should_create_entity);
      if (toQueue.length === 0) throw new Error('No action plans marked for generation');

      const queueItems = toQueue.map((ap, index) => {
        const objective = objectives[ap.objective_index];
        const priorityScore = ap.priority === 'high' ? 100 : ap.priority === 'medium' ? 50 : 25;
        
        return {
          strategic_plan_id: strategicPlanId,
          entity_type: ap.type,
          priority_score: priorityScore + (toQueue.length - index), // Higher priority for earlier items
          status: 'pending',
          prefilled_spec: {
            title_en: ap.name_en,
            title_ar: ap.name_ar,
            description_en: ap.description_en,
            description_ar: ap.description_ar,
            objective_title: objective?.name_en || '',
            objective_description: objective?.description_en || '',
            budget_estimate: ap.budget_estimate,
            start_date: ap.start_date,
            end_date: ap.end_date,
            owner: ap.owner,
            deliverables: ap.deliverables || [],
            dependencies: ap.dependencies || [],
            priority: ap.priority,
            // Additional context from wizard
            strategic_context: {
              vision: wizardData.vision_en,
              mission: wizardData.mission_en,
              pillars: wizardData.strategic_pillars,
              themes: wizardData.strategic_themes,
              sectors: wizardData.target_sectors,
              kpis: wizardData.kpis?.filter(k => k.objective_index === ap.objective_index) || []
            }
          },
          source_action_plan_index: actionPlans.indexOf(ap),
          attempts: 0
        };
      });

      // Insert queue items
      const { data, error } = await supabase
        .from('demand_queue')
        .insert(queueItems)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['demand-queue', strategicPlanId] });
      toast.success(`${data.length} items queued for generation`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to queue items');
    }
  });

  // Trigger batch generation for queued items
  const triggerBatchGeneration = useMutation({
    mutationFn: async ({ entityTypes, maxItems = 10 }) => {
      const { data, error } = await supabase.functions.invoke('strategy-batch-generator', {
        body: {
          strategic_plan_id: strategicPlanId,
          entity_types: entityTypes,
          max_items: maxItems,
          run_quality_assessment: true
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['demand-queue', strategicPlanId] });
      queryClient.invalidateQueries({ queryKey: ['strategic-plan', strategicPlanId] });
      
      const successful = data.results?.filter(r => r.success).length || 0;
      const failed = data.results?.filter(r => !r.success).length || 0;
      
      if (successful > 0) {
        toast.success(`Generated ${successful} entities`);
      }
      if (failed > 0) {
        toast.warning(`${failed} generations failed - check queue for details`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Generation failed');
    }
  });

  // Get generation status for entity types
  const getEntityStatus = useCallback(async () => {
    if (!strategicPlanId) return {};

    const { data, error } = await supabase
      .from('demand_queue')
      .select('entity_type, status, generated_entity_id')
      .eq('strategic_plan_id', strategicPlanId);

    if (error) {
      console.error('Error fetching entity status:', error);
      return {};
    }

    const status = {};
    (data || []).forEach(item => {
      if (!status[item.entity_type]) {
        status[item.entity_type] = { pending: 0, in_progress: 0, generated: 0, failed: 0, total: 0 };
      }
      status[item.entity_type].total++;
      if (item.status === 'pending') status[item.entity_type].pending++;
      else if (item.status === 'in_progress') status[item.entity_type].in_progress++;
      else if (['accepted', 'generated'].includes(item.status)) status[item.entity_type].generated++;
      else if (['rejected', 'failed'].includes(item.status)) status[item.entity_type].failed++;
    });

    setGenerationStatus(status);
    return status;
  }, [strategicPlanId]);

  // Sync action plans to existing DB action_plans table
  const syncToActionPlansTable = useMutation({
    mutationFn: async ({ actionPlans, objectives }) => {
      if (!strategicPlanId) throw new Error('Strategic plan ID required');

      const plansToSave = actionPlans.map(ap => ({
        strategic_plan_id: strategicPlanId,
        title_en: ap.name_en,
        title_ar: ap.name_ar,
        objective_title: objectives[ap.objective_index]?.name_en || '',
        objective_id: null, // Can be linked if objectives are saved first
        status: 'draft',
        total_budget: parseFloat(ap.budget_estimate?.replace(/,/g, '')) || null,
        start_date: ap.start_date || null,
        end_date: ap.end_date || null,
        owner_email: ap.owner || null
      }));

      // Upsert action plans
      const { data, error } = await supabase
        .from('action_plans')
        .upsert(plansToSave, { 
          onConflict: 'strategic_plan_id,title_en',
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action-plans', strategicPlanId] });
    }
  });

  // Get generated entities for this plan
  const getGeneratedEntities = useCallback(async () => {
    if (!strategicPlanId) return [];

    const { data, error } = await supabase
      .from('demand_queue')
      .select('entity_type, generated_entity_id, generated_entity_type, quality_score, prefilled_spec')
      .eq('strategic_plan_id', strategicPlanId)
      .not('generated_entity_id', 'is', null);

    if (error) {
      console.error('Error fetching generated entities:', error);
      return [];
    }

    return data || [];
  }, [strategicPlanId]);

  return {
    // Mutations
    queueForGeneration,
    triggerBatchGeneration,
    syncToActionPlansTable,
    
    // Status
    generationStatus,
    getEntityStatus,
    getGeneratedEntities,
    
    // Loading states
    isQueuing: queueForGeneration.isPending,
    isGenerating: triggerBatchGeneration.isPending,
    isSyncing: syncToActionPlansTable.isPending
  };
}



