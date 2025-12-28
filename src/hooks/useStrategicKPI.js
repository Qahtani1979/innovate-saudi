import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing Strategic KPI contributions from Programs
 * Enables bidirectional Strategy ↔ Programs integration
 */
export function useStrategicKPI() {
  const queryClient = useAppQueryClient();

  // Fetch strategic plans with their KPIs/objectives
  const { data: strategicPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['strategic-plans-kpi-hook'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  // Extract KPIs from strategic plans
  const extractKPIsFromPlans = (plans) => {
    const kpis = [];
    plans.forEach(plan => {
      // Use standard 'objectives' field from Supabase schema
      const objectives = Array.isArray(plan.objectives) ? plan.objectives : [];
      objectives.forEach((obj, i) => {
        kpis.push({
          id: typeof obj === 'object' && obj.id ? obj.id : `${plan.id}-kpi-${i}`,
          plan_id: plan.id,
          plan_name: plan.name_en,
          name_en: typeof obj === 'object' ? obj.name_en || obj.title : obj,
          name_ar: typeof obj === 'object' ? obj.name_ar : null,
          description: typeof obj === 'object' ? obj.description : null,
          target: typeof obj === 'object' ? obj.target || 100 : 100,
          current: typeof obj === 'object' ? obj.current || 0 : 0,
          unit: typeof obj === 'object' ? obj.unit || '%' : '%',
          contributing_programs: typeof obj === 'object' ? obj.contributing_programs || [] : []
        });
      });
    });
    return kpis;
  };

  const strategicKPIs = extractKPIsFromPlans(strategicPlans);

  /**
   * Update a strategic KPI with program contribution
   */
  const updateStrategicKPIMutation = useMutation({
    mutationFn: async ({ kpiId, programId, contributionValue, notes }) => {
      // Find the KPI and its parent plan
      const kpi = strategicKPIs.find(k => k.id === kpiId);
      if (!kpi) throw new Error('KPI not found');

      const plan = strategicPlans.find(p => p.id === kpi.plan_id);
      if (!plan) throw new Error('Strategic plan not found');

      // Update the plan's objectives with new contribution
      const objectivesArray = Array.isArray(plan.objectives) ? plan.objectives : [];
      const updatedObjectives = objectivesArray.map((obj, i) => {
        const isObject = typeof obj === 'object' && obj !== null && !Array.isArray(obj);
        const objId = isObject && 'id' in obj ? obj.id : `${plan.id}-kpi-${i}`;

        if (objId === kpiId) {
          const existingContributions = isObject && 'contributions' in obj && Array.isArray(obj.contributions)
            ? obj.contributions
            : [];

          const newContribution = {
            program_id: programId,
            value: contributionValue,
            contributed_at: new Date().toISOString(),
            notes
          };

          if (isObject) {
            const currentVal = typeof obj.current === 'number' ? obj.current : 0;
            const existingProgs = Array.isArray(obj.contributing_programs) ? obj.contributing_programs : [];

            return {
              ...obj,
              current: currentVal + contributionValue,
              contributions: [...existingContributions, newContribution],
              contributing_programs: [...new Set([...existingProgs, programId])],
              last_updated: new Date().toISOString()
            };
          } else {
            return {
              name_en: obj,
              current: contributionValue,
              target: 100,
              contributions: [newContribution],
              contributing_programs: [programId],
              last_updated: new Date().toISOString()
            };
          }
        }
        return obj;
      });

      // Update strategic plan via Supabase
      const { data, error } = await supabase
        .from('strategic_plans')
        .update({
          objectives: updatedObjectives,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id)
        .select()
        .single();

      if (error) throw error;
      return { kpiId, contributionValue, planId: plan.id };
    },
    onSuccess: ({ kpiId, contributionValue }) => {
      queryClient.invalidateQueries({ queryKey: ['strategic-plans'] });
      queryClient.invalidateQueries({ queryKey: ['strategic-plans-kpi-hook'] });
      toast.success(`KPI updated with +${contributionValue} contribution`);
    },
    onError: (error) => {
      console.error('KPI update error:', error);
      toast.error('Failed to update strategic KPI');
    }
  });

  /**
   * Calculate program's total contribution to strategy
   */
  const calculateProgramContribution = (programId) => {
    let totalContribution = 0;
    let contributedKPIs = [];

    strategicKPIs.forEach(kpi => {
      if (kpi.contributing_programs?.includes(programId)) {
        contributedKPIs.push(kpi);
        // Estimate contribution (would need contribution history for accuracy)
        totalContribution += 1;
      }
    });

    return {
      totalKPIs: contributedKPIs.length,
      contributedKPIs,
      contributionScore: strategicKPIs.length > 0
        ? Math.round((contributedKPIs.length / strategicKPIs.length) * 100)
        : 0
    };
  };

  /**
   * Get KPIs linked to a specific program via strategic_plan_ids
   */
  const getLinkedKPIs = (programStrategicPlanIds = [], programStrategicObjectiveIds = []) => {
    return strategicKPIs.filter(kpi =>
      programStrategicPlanIds.includes(kpi.plan_id) ||
      programStrategicObjectiveIds.includes(kpi.id)
    );
  };

  /**
   * Get strategic coverage metrics
   */
  const getStrategicCoverage = (programs = []) => {
    const linkedPlanIds = new Set();
    const linkedObjectiveIds = new Set();

    programs.forEach(program => {
      (program.strategic_plan_ids || []).forEach(id => linkedPlanIds.add(id));
      (program.strategic_objective_ids || []).forEach(id => linkedObjectiveIds.add(id));
    });

    return {
      plansWithPrograms: linkedPlanIds.size,
      totalPlans: strategicPlans.length,
      planCoverage: strategicPlans.length > 0
        ? Math.round((linkedPlanIds.size / strategicPlans.length) * 100)
        : 0,
      kpisWithContributions: strategicKPIs.filter(k => k.contributing_programs?.length > 0).length,
      totalKPIs: strategicKPIs.length,
      kpiCoverage: strategicKPIs.length > 0
        ? Math.round((strategicKPIs.filter(k => k.contributing_programs?.length > 0).length / strategicKPIs.length) * 100)
        : 0
    };
  };

  /**
   * Batch update program outcomes to strategic KPIs
   */
  const batchUpdateKPIs = useMutation({
    mutationFn: async ({ programId, outcomes }) => {
      const updates = [];

      for (const outcome of outcomes) {
        if (outcome.linked_kpi_id && outcome.current) {
          updates.push(
            updateStrategicKPIMutation.mutateAsync({
              kpiId: outcome.linked_kpi_id,
              programId,
              contributionValue: outcome.current,
              notes: `Auto-synced from program outcome: ${outcome.description}`
            })
          );
        }
      }

      return Promise.all(updates);
    },
    onSuccess: () => {
      toast.success('All program outcomes synced to strategic KPIs');
    },
    onError: (error) => {
      console.error('Batch KPI update error:', error);
      toast.error('Failed to sync some outcomes');
    }
  });

  return {
    strategicPlans,
    strategicKPIs,
    isLoading: plansLoading,
    updateStrategicKPI: updateStrategicKPIMutation.mutate,
    updateStrategicKPIAsync: updateStrategicKPIMutation.mutateAsync,
    isUpdating: updateStrategicKPIMutation.isPending,
    calculateProgramContribution,
    getLinkedKPIs,
    getStrategicCoverage,
    batchUpdateKPIs: batchUpdateKPIs.mutate
  };
}

export default useStrategicKPI;



