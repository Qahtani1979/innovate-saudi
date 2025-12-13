import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing Strategic KPI contributions from Programs
 * Enables bidirectional Strategy ↔ Programs integration
 */
export function useStrategicKPI() {
  const queryClient = useQueryClient();

  // Fetch strategic plans with their KPIs/objectives
  const { data: strategicPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['strategic-plans-kpi-hook'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  // Extract KPIs from strategic plans
  const extractKPIsFromPlans = (plans) => {
    const kpis = [];
    plans.forEach(plan => {
      const objectives = plan.objectives || plan.strategic_objectives || [];
      objectives.forEach((obj, i) => {
        kpis.push({
          id: typeof obj === 'object' && obj.id ? obj.id : `${plan.id}-kpi-${i}`,
          plan_id: plan.id,
          plan_name: plan.name_en || plan.title_en,
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
      const updatedObjectives = (plan.objectives || plan.strategic_objectives || []).map((obj, i) => {
        const objId = typeof obj === 'object' && obj.id ? obj.id : `${plan.id}-kpi-${i}`;
        
        if (objId === kpiId) {
          const existingContributions = typeof obj === 'object' ? obj.contributions || [] : [];
          const newContribution = {
            program_id: programId,
            value: contributionValue,
            contributed_at: new Date().toISOString(),
            notes
          };

          return typeof obj === 'object' ? {
            ...obj,
            current: (obj.current || 0) + contributionValue,
            contributions: [...existingContributions, newContribution],
            contributing_programs: [...new Set([...(obj.contributing_programs || []), programId])],
            last_updated: new Date().toISOString()
          } : {
            name_en: obj,
            current: contributionValue,
            target: 100,
            contributions: [newContribution],
            contributing_programs: [programId],
            last_updated: new Date().toISOString()
          };
        }
        return obj;
      });

      // Update strategic plan with new objective values
      await base44.entities.StrategicPlan.update(plan.id, {
        objectives: updatedObjectives,
        last_kpi_update: new Date().toISOString()
      });

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
