import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing strategy recalibration (Phase 8)
 * Handles feedback analysis, pivot management, and baseline recalibration
 */
export function useStrategyRecalibration(planId) {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all lessons learned from related entities
  const { data: feedbackData = {}, isLoading: feedbackLoading } = useQuery({
    queryKey: ['recalibration-feedback', planId],
    queryFn: async () => {
      if (!planId) return { lessons: [], evaluations: [], recommendations: [] };

      // Get lessons from challenges linked to this plan
      const { data: challenges } = await supabase
        .from('challenges')
        .select('id, title_en, lessons_learned, status, resolution_date')
        .contains('strategic_plan_ids', [planId]);

      // Get lessons from pilots
      const { data: pilots } = await supabase
        .from('pilots')
        .select('id, name_en, lessons_learned, status, end_date')
        .contains('strategic_plan_ids', [planId]);

      // Get expert evaluations
      const { data: evaluations } = await supabase
        .from('expert_evaluations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Aggregate lessons
      const allLessons = [];
      
      challenges?.forEach(c => {
        (c.lessons_learned || []).forEach(lesson => {
          allLessons.push({
            ...lesson,
            source_type: 'challenge',
            source_id: c.id,
            source_name: c.title_en
          });
        });
      });

      pilots?.forEach(p => {
        (p.lessons_learned || []).forEach(lesson => {
          allLessons.push({
            ...lesson,
            source_type: 'pilot',
            source_id: p.id,
            source_name: p.name_en
          });
        });
      });

      return {
        lessons: allLessons,
        evaluations: evaluations || [],
        challenges: challenges || [],
        pilots: pilots || []
      };
    },
    enabled: !!planId
  });

  // Analyze patterns in lessons learned
  const analyzePatterns = useCallback(() => {
    const { lessons } = feedbackData;
    if (!lessons?.length) return { categories: {}, patterns: [], recommendations: [] };

    // Group by category
    const categories = {};
    lessons.forEach(lesson => {
      const cat = lesson.category || 'other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(lesson);
    });

    // Identify patterns (themes that appear 3+ times)
    const themeCount = {};
    lessons.forEach(lesson => {
      const words = (lesson.lesson || '').toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) {
          themeCount[word] = (themeCount[word] || 0) + 1;
        }
      });
    });

    const patterns = Object.entries(themeCount)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([theme, count]) => ({ theme, count }));

    // Generate recommendations based on patterns
    const recommendations = [];
    if (categories.process?.length >= 3) {
      recommendations.push({
        type: 'process',
        priority: 'high',
        title: 'Process Improvement Needed',
        description: `${categories.process.length} lessons relate to process issues. Consider Phase 4 governance adjustments.`,
        targetPhase: 4
      });
    }
    if (categories.technology?.length >= 2) {
      recommendations.push({
        type: 'technology',
        priority: 'medium',
        title: 'Technology Enhancements',
        description: `${categories.technology.length} lessons highlight technology gaps. Review Phase 3 entity mix.`,
        targetPhase: 3
      });
    }

    return { categories, patterns, recommendations };
  }, [feedbackData]);

  // Fetch strategic plan pivots history
  const { data: pivotsHistory = [] } = useQuery({
    queryKey: ['pivot-history', planId],
    queryFn: async () => {
      if (!planId) return [];
      
      const { data } = await supabase
        .from('strategy_versions')
        .select('*')
        .eq('strategic_plan_id', planId)
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: !!planId
  });

  // Create a new pivot record
  const createPivot = useMutation({
    mutationFn: async ({ pivotType, scope, reason, targetPhases, changes }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('strategy_versions')
        .insert({
          strategic_plan_id: planId,
          version_type: 'pivot',
          change_summary: reason,
          changes_json: {
            pivot_type: pivotType,
            scope,
            target_phases: targetPhases,
            changes
          },
          created_by: user?.user?.email,
          status: 'pending_approval'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pivot-history', planId] });
      toast.success('Pivot request created');
    },
    onError: (error) => {
      console.error('Pivot error:', error);
      toast.error('Failed to create pivot request');
    }
  });

  // Calculate adjustment impact score
  const calculateImpactScore = useCallback((adjustment) => {
    const weights = {
      strategicAlignment: 0.3,
      resourceEfficiency: 0.25,
      riskMitigation: 0.25,
      stakeholderValue: 0.2
    };

    let score = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      score += (adjustment[key] || 3) * weight;
    });

    return {
      score: Math.round(score * 10) / 10,
      decision: score >= 4 ? 'proceed' : score >= 3 ? 'proceed_with_conditions' : 'defer'
    };
  }, []);

  // Update baseline data
  const updateBaseline = useMutation({
    mutationFn: async ({ baselineType, oldValue, newValue, justification }) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Store baseline update in strategy_baselines or similar table
      const { data, error } = await supabase
        .from('strategy_baselines')
        .upsert({
          strategic_plan_id: planId,
          baseline_type: baselineType,
          previous_value: oldValue,
          current_value: newValue,
          justification,
          updated_by: user?.user?.email,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['baselines', planId] });
      toast.success('Baseline updated successfully');
    }
  });

  // Prepare next cycle initialization data
  const prepareNextCycle = useCallback(async () => {
    setIsProcessing(true);
    try {
      const { lessons, evaluations } = feedbackData;
      const patterns = analyzePatterns();

      // Package data for next cycle
      const nextCyclePackage = {
        strategicRecommendations: patterns.recommendations,
        lessonsLearned: lessons.slice(0, 20),
        topPatterns: patterns.patterns,
        evaluationSummary: {
          avgScore: evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / (evaluations.length || 1),
          totalEvaluations: evaluations.length
        },
        generatedAt: new Date().toISOString(),
        planId
      };

      return nextCyclePackage;
    } finally {
      setIsProcessing(false);
    }
  }, [feedbackData, analyzePatterns, planId]);

  return {
    // Data
    feedbackData,
    pivotsHistory,
    isLoading: feedbackLoading,
    isProcessing,
    
    // Analysis
    patterns: analyzePatterns(),
    
    // Actions
    createPivot: createPivot.mutate,
    createPivotAsync: createPivot.mutateAsync,
    isPivotPending: createPivot.isPending,
    
    calculateImpactScore,
    updateBaseline: updateBaseline.mutate,
    prepareNextCycle
  };
}

export default useStrategyRecalibration;
