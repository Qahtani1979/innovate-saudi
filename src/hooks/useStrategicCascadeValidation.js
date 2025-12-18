/* @refresh reset */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to validate and calculate strategic cascade coverage
 * Validates chain integrity: Strategy → Entity → Child Entities
 */
export function useStrategicCascadeValidation() {
  const { data: strategicPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['strategic-plans-cascade'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .or('is_template.is.null,is_template.eq.false')
        .or('is_deleted.is.null,is_deleted.eq.false');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['programs-cascade'],
    queryFn: async () => {
      const { data, error } = await supabase.from('programs').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges-cascade'],
    queryFn: async () => {
      const { data, error } = await supabase.from('challenges').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: sandboxes = [], isLoading: sandboxesLoading } = useQuery({
    queryKey: ['sandboxes-cascade'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sandboxes').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: livingLabs = [], isLoading: labsLoading } = useQuery({
    queryKey: ['living-labs-cascade'],
    queryFn: async () => {
      const { data, error } = await supabase.from('living_labs').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: partnerships = [], isLoading: partnershipsLoading } = useQuery({
    queryKey: ['partnerships-cascade'],
    queryFn: async () => {
      const { data, error } = await supabase.from('partnerships').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: pilots = [], isLoading: pilotsLoading } = useQuery({
    queryKey: ['pilots-cascade'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pilots').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const isLoading = plansLoading || programsLoading || challengesLoading || sandboxesLoading || labsLoading || partnershipsLoading || pilotsLoading;

  // Calculate coverage metrics
  const calculateCoverage = () => {
    const totalPlans = strategicPlans.length;
    if (totalPlans === 0) return { overall: 0, byEntity: {} };

    const planCoverage = new Map();
    strategicPlans.forEach(plan => planCoverage.set(plan.id, new Set()));

    // Track which plans are covered by each entity type
    const entityCoverage = {
      programs: { linked: 0, total: programs.length },
      challenges: { linked: 0, total: challenges.length },
      sandboxes: { linked: 0, total: sandboxes.length },
      livingLabs: { linked: 0, total: livingLabs.length },
      partnerships: { linked: 0, total: partnerships.length },
      pilots: { linked: 0, total: pilots.length }
    };

    // Programs
    programs.forEach(p => {
      if (p.strategic_plan_ids?.length > 0) {
        entityCoverage.programs.linked++;
        p.strategic_plan_ids.forEach(id => planCoverage.get(id)?.add('program'));
      }
    });

    // Challenges
    challenges.forEach(c => {
      if (c.strategic_plan_ids?.length > 0) {
        entityCoverage.challenges.linked++;
        c.strategic_plan_ids.forEach(id => planCoverage.get(id)?.add('challenge'));
      }
    });

    // Sandboxes
    sandboxes.forEach(s => {
      if (s.strategic_plan_ids?.length > 0) {
        entityCoverage.sandboxes.linked++;
        s.strategic_plan_ids.forEach(id => planCoverage.get(id)?.add('sandbox'));
      }
    });

    // Living Labs
    livingLabs.forEach(l => {
      if (l.strategic_plan_ids?.length > 0) {
        entityCoverage.livingLabs.linked++;
        l.strategic_plan_ids.forEach(id => planCoverage.get(id)?.add('livingLab'));
      }
    });

    // Partnerships
    partnerships.forEach(p => {
      if (p.strategic_plan_ids?.length > 0) {
        entityCoverage.partnerships.linked++;
        p.strategic_plan_ids.forEach(id => planCoverage.get(id)?.add('partnership'));
      }
    });

    // Pilots (indirect via challenge)
    pilots.forEach(p => {
      const linkedChallenge = challenges.find(c => c.id === p.challenge_id);
      if (linkedChallenge?.strategic_plan_ids?.length > 0) {
        entityCoverage.pilots.linked++;
      }
    });

    // Calculate plan coverage scores
    const planScores = Array.from(planCoverage.entries()).map(([planId, entities]) => ({
      planId,
      entityTypes: entities.size,
      score: Math.min(100, entities.size * 20)
    }));

    const overallScore = planScores.length > 0
      ? Math.round(planScores.reduce((sum, p) => sum + p.score, 0) / planScores.length)
      : 0;

    return {
      overall: overallScore,
      byEntity: entityCoverage,
      planScores,
      uncoveredPlans: planScores.filter(p => p.score < 40).map(p => p.planId)
    };
  };

  // Validate cascade integrity
  const validateCascade = (entityType, entityId) => {
    const issues = [];
    
    switch (entityType) {
      case 'pilot': {
        const pilot = pilots.find(p => p.id === entityId);
        if (!pilot) break;
        
        const challenge = challenges.find(c => c.id === pilot.challenge_id);
        if (!challenge?.strategic_plan_ids?.length) {
          issues.push({ type: 'warning', message: 'Pilot challenge has no strategic alignment' });
        }
        break;
      }
      case 'sandbox': {
        const sandbox = sandboxes.find(s => s.id === entityId);
        if (!sandbox?.strategic_plan_ids?.length) {
          issues.push({ type: 'info', message: 'Sandbox not linked to strategic plans' });
        }
        break;
      }
      case 'livingLab': {
        const lab = livingLabs.find(l => l.id === entityId);
        if (!lab?.strategic_plan_ids?.length) {
          issues.push({ type: 'info', message: 'Living Lab not linked to strategic plans' });
        }
        break;
      }
    }
    
    return { valid: issues.length === 0, issues };
  };

  // Get strategy-derived entities
  const getStrategyDerivedEntities = (planId) => {
    return {
      programs: programs.filter(p => p.strategic_plan_ids?.includes(planId)),
      challenges: challenges.filter(c => c.strategic_plan_ids?.includes(planId)),
      sandboxes: sandboxes.filter(s => s.strategic_plan_ids?.includes(planId)),
      livingLabs: livingLabs.filter(l => l.strategic_plan_ids?.includes(planId)),
      partnerships: partnerships.filter(p => p.strategic_plan_ids?.includes(planId))
    };
  };

  return {
    coverage: calculateCoverage(),
    validateCascade,
    getStrategyDerivedEntities,
    isLoading
  };
}

export default useStrategicCascadeValidation;
