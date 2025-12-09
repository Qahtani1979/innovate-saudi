import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

/**
 * A/B Testing Hook
 * Usage:
 *   const { getVariant, trackConversion, isLoading } = useABTesting();
 *   const variant = await getVariant('onboarding_wizard_v2');
 *   if (variant === 'control') { ... } else if (variant === 'treatment') { ... }
 *   trackConversion('onboarding_wizard_v2', 'completed_onboarding', 1);
 */
export function useABTesting() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState({});
  const [experiments, setExperiments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load active experiments and user assignments on mount
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const loadExperimentsAndAssignments = async () => {
      try {
        // Get active experiments
        const { data: exps, error: expError } = await supabase
          .from('ab_experiments')
          .select('*')
          .eq('status', 'active');

        if (expError) throw expError;
        setExperiments(exps || []);

        // Get user's existing assignments
        const { data: assigns, error: assignError } = await supabase
          .from('ab_assignments')
          .select('*')
          .eq('user_id', user.id);

        if (assignError) throw assignError;

        const assignMap = {};
        (assigns || []).forEach(a => {
          assignMap[a.experiment_id] = a;
        });
        setAssignments(assignMap);
      } catch (err) {
        console.warn('Failed to load A/B experiments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExperimentsAndAssignments();
  }, [user?.id]);

  /**
   * Get the variant for an experiment
   * Assigns user to a variant if not already assigned
   */
  const getVariant = useCallback(async (experimentName) => {
    if (!user?.id) return 'control';

    // Find the experiment
    const experiment = experiments.find(e => e.name === experimentName);
    if (!experiment) {
      // No experiment found, return control
      return 'control';
    }

    // Check if user is already assigned
    if (assignments[experiment.id]) {
      return assignments[experiment.id].variant;
    }

    // Assign user to a variant based on allocation percentages
    const variants = experiment.variants || ['control', 'treatment'];
    const allocations = experiment.allocation_percentages || {};
    
    // Default to 50/50 if no allocations specified
    let selectedVariant = 'control';
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const variant of variants) {
      const percentage = allocations[variant] || (100 / variants.length);
      cumulative += percentage;
      if (random <= cumulative) {
        selectedVariant = variant;
        break;
      }
    }

    // Save assignment
    try {
      const { data, error } = await supabase
        .from('ab_assignments')
        .insert({
          experiment_id: experiment.id,
          user_id: user.id,
          user_email: user.email,
          variant: selectedVariant
        })
        .select()
        .single();

      if (!error && data) {
        setAssignments(prev => ({
          ...prev,
          [experiment.id]: data
        }));
      }
    } catch (err) {
      console.warn('Failed to save A/B assignment:', err);
    }

    return selectedVariant;
  }, [user, experiments, assignments]);

  /**
   * Track a conversion event for an experiment
   */
  const trackConversion = useCallback(async (experimentName, conversionType, conversionValue = 1, metadata = {}) => {
    if (!user?.id) return;

    const experiment = experiments.find(e => e.name === experimentName);
    if (!experiment) return;

    const assignment = assignments[experiment.id];
    if (!assignment) return;

    try {
      await supabase.from('ab_conversions').insert({
        experiment_id: experiment.id,
        assignment_id: assignment.id,
        user_id: user.id,
        conversion_type: conversionType,
        conversion_value: conversionValue,
        metadata
      });
    } catch (err) {
      console.warn('Failed to track A/B conversion:', err);
    }
  }, [user, experiments, assignments]);

  /**
   * Get experiment statistics (admin use)
   */
  const getExperimentStats = useCallback(async (experimentName) => {
    const experiment = experiments.find(e => e.name === experimentName);
    if (!experiment) return null;

    try {
      // Get all assignments for this experiment
      const { data: allAssignments } = await supabase
        .from('ab_assignments')
        .select('variant')
        .eq('experiment_id', experiment.id);

      // Get all conversions for this experiment
      const { data: conversions } = await supabase
        .from('ab_conversions')
        .select('*, ab_assignments(variant)')
        .eq('experiment_id', experiment.id);

      // Calculate stats per variant
      const variants = experiment.variants || ['control', 'treatment'];
      const stats = {};

      variants.forEach(v => {
        const variantAssignments = (allAssignments || []).filter(a => a.variant === v).length;
        const variantConversions = (conversions || []).filter(c => c.ab_assignments?.variant === v);
        
        stats[v] = {
          participants: variantAssignments,
          conversions: variantConversions.length,
          conversionRate: variantAssignments > 0 
            ? ((variantConversions.length / variantAssignments) * 100).toFixed(2)
            : 0,
          totalValue: variantConversions.reduce((sum, c) => sum + (c.conversion_value || 0), 0)
        };
      });

      return {
        experiment,
        stats,
        totalParticipants: (allAssignments || []).length,
        totalConversions: (conversions || []).length
      };
    } catch (err) {
      console.warn('Failed to get experiment stats:', err);
      return null;
    }
  }, [experiments]);

  return {
    getVariant,
    trackConversion,
    getExperimentStats,
    experiments,
    isLoading
  };
}

export default useABTesting;