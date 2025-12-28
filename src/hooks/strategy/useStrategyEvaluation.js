import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useState, useCallback } from 'react';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing strategy evaluations
 * Handles expert evaluations, scoring, and lessons learned
 */
export function useStrategyEvaluation(entityType, entityId) {
  const queryClient = useAppQueryClient();
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch evaluations for an entity
  const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery({
    queryKey: ['expert-evaluations', entityType, entityId],
    queryFn: async () => {
      if (!entityType || !entityId) return [];
      const { data, error } = await supabase
        .from('expert_evaluations')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!entityType && !!entityId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  // Calculate consensus score from multiple evaluations
  const calculateConsensus = useCallback(() => {
    if (!evaluations.length) return null;

    const scores = evaluations.map(e => e.overall_score).filter(Boolean);
    if (!scores.length) return null;

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, s) => acc + Math.pow(s - avgScore, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Determine consensus level
    let consensusLevel = 'high';
    if (stdDev > 15) consensusLevel = 'low';
    else if (stdDev > 8) consensusLevel = 'medium';

    // Aggregate recommendations
    const allRecommendations = evaluations.flatMap(e => e.recommendations || []);
    const recommendations = [...new Set(allRecommendations)];

    return {
      averageScore: Math.round(avgScore),
      standardDeviation: Math.round(stdDev * 10) / 10,
      consensusLevel,
      evaluatorCount: evaluations.length,
      recommendations,
      scoreByCriteria: calculateCriteriaScores()
    };
  }, [evaluations]);

  // Calculate average scores by criteria
  const calculateCriteriaScores = useCallback(() => {
    if (!evaluations.length) return {};

    const criteria = ['feasibility', 'impact', 'innovation', 'cost_effectiveness', 'risk_level', 'strategic_alignment'];
    const scores = {};

    criteria.forEach(criterion => {
      const values = evaluations
        .map(e => e.criteria_scores?.[criterion])
        .filter(v => typeof v === 'number');
      
      if (values.length) {
        scores[criterion] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      }
    });

    return scores;
  }, [evaluations]);

  // Submit a new evaluation
  const submitEvaluation = useMutation({
    mutationFn: async ({ scores, recommendation, strengths, weaknesses, comments }) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Calculate overall score using weights
      const weights = {
        feasibility: 0.15,
        impact: 0.20,
        innovation: 0.15,
        cost_effectiveness: 0.15,
        risk_level: 0.10,
        strategic_alignment: 0.15,
        scalability: 0.10
      };

      let overallScore = 0;
      Object.entries(weights).forEach(([criterion, weight]) => {
        overallScore += (scores[criterion] || 50) * weight;
      });

      const { data, error } = await supabase
        .from('expert_evaluations')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          evaluator_email: user?.user?.email,
          criteria_scores: scores,
          overall_score: Math.round(overallScore),
          recommendation,
          strengths: strengths || [],
          weaknesses: weaknesses || [],
          comments,
          status: 'submitted'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-evaluations', entityType, entityId] });
      toast.success('Evaluation submitted successfully');
    },
    onError: (error) => {
      console.error('Evaluation error:', error);
      toast.error('Failed to submit evaluation');
    }
  });

  // Get evaluation summary for dashboards
  const getEvaluationSummary = useCallback(() => {
    const consensus = calculateConsensus();
    if (!consensus) return null;

    return {
      ...consensus,
      latestEvaluation: evaluations[0],
      pendingCount: evaluations.filter(e => e.status === 'pending').length,
      completedCount: evaluations.filter(e => e.status === 'submitted' || e.status === 'completed').length
    };
  }, [evaluations, calculateConsensus]);

  // Fetch lessons learned for an entity
  const { data: lessonsLearned = [] } = useQuery({
    queryKey: ['lessons-learned', entityType, entityId],
    queryFn: async () => {
      if (!entityType || !entityId) return [];
      
      // Get lessons from entity's lessons_learned field
      const tableName = entityType === 'challenge' ? 'challenges' : 
                        entityType === 'pilot' ? 'pilots' : 
                        entityType === 'program' ? 'programs' : null;
      
      if (!tableName) return [];

      const { data, error } = await supabase
        .from(tableName)
        .select('lessons_learned')
        .eq('id', entityId)
        .single();

      if (error) return [];
      return data?.lessons_learned || [];
    },
    enabled: !!entityType && !!entityId
  });

  // Add lesson learned
  const addLessonLearned = useMutation({
    mutationFn: async ({ category, lesson, recommendation }) => {
      const tableName = entityType === 'challenge' ? 'challenges' : 
                        entityType === 'pilot' ? 'pilots' : 
                        entityType === 'program' ? 'programs' : null;
      
      if (!tableName) throw new Error('Invalid entity type');

      const newLesson = {
        category,
        lesson,
        recommendation,
        added_at: new Date().toISOString()
      };

      const { data: current } = await supabase
        .from(tableName)
        .select('lessons_learned')
        .eq('id', entityId)
        .single();

      const updatedLessons = [...(current?.lessons_learned || []), newLesson];

      const { error } = await supabase
        .from(tableName)
        .update({ lessons_learned: updatedLessons })
        .eq('id', entityId);

      if (error) throw error;
      return newLesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons-learned', entityType, entityId] });
      toast.success('Lesson added successfully');
    }
  });

  return {
    evaluations,
    isLoading: evaluationsLoading,
    isCalculating,
    consensus: calculateConsensus(),
    criteriaScores: calculateCriteriaScores(),
    summary: getEvaluationSummary(),
    lessonsLearned,
    submitEvaluation: submitEvaluation.mutate,
    submitEvaluationAsync: submitEvaluation.mutateAsync,
    isSubmitting: submitEvaluation.isPending,
    addLessonLearned: addLessonLearned.mutate
  };
}

export default useStrategyEvaluation;



