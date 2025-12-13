import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useStrategyAlignment(entityType, entityId) {
  const [alignmentData, setAlignmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateAlignment = useCallback(async () => {
    if (!entityType || !entityId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch entity data based on type
      let entityData = null;
      let strategicPlanIds = [];

      const { data, error: fetchError } = await supabase
        .from(entityType)
        .select('*')
        .eq('id', entityId)
        .single();

      if (fetchError) throw fetchError;
      entityData = data;

      // Extract strategic plan IDs
      strategicPlanIds = entityData?.strategic_plan_ids || [];

      // Calculate alignment score
      const score = calculateAlignmentScore(entityData, strategicPlanIds);
      const gaps = identifyGaps(entityData, strategicPlanIds);
      const recommendations = generateRecommendations(gaps);

      setAlignmentData({
        score,
        gaps,
        recommendations,
        linkedObjectives: strategicPlanIds,
        entityType,
        entityId,
        lastCalculated: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  const calculateAlignmentScore = (entity, planIds) => {
    let score = 0;
    
    // Base score for having strategic plan links
    if (planIds && planIds.length > 0) {
      score += 40;
    }

    // Additional points for various alignment factors
    if (entity?.kpis && Array.isArray(entity.kpis) && entity.kpis.length > 0) {
      score += 20;
    }

    if (entity?.strategic_goal) {
      score += 15;
    }

    if (entity?.is_strategy_derived) {
      score += 15;
    }

    if (entity?.status === 'active' || entity?.status === 'approved') {
      score += 10;
    }

    return Math.min(score, 100);
  };

  const identifyGaps = (entity, planIds) => {
    const gaps = [];

    if (!planIds || planIds.length === 0) {
      gaps.push({
        type: 'missing_link',
        severity: 'high',
        message: 'No strategic plan linkage',
        recommendation: 'Link this entity to relevant strategic plans'
      });
    }

    if (!entity?.kpis || entity.kpis.length === 0) {
      gaps.push({
        type: 'missing_kpis',
        severity: 'medium',
        message: 'No KPIs defined',
        recommendation: 'Define measurable KPIs aligned with strategic objectives'
      });
    }

    if (!entity?.strategic_goal) {
      gaps.push({
        type: 'missing_goal',
        severity: 'medium',
        message: 'No strategic goal specified',
        recommendation: 'Specify which strategic goal this entity supports'
      });
    }

    return gaps;
  };

  const generateRecommendations = (gaps) => {
    return gaps.map(gap => gap.recommendation);
  };

  return {
    alignmentData,
    isLoading,
    error,
    calculateAlignment,
    refresh: calculateAlignment
  };
}

export default useStrategyAlignment;
