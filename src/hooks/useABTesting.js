import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

/**
 * A/B Testing Hook (Refactored to Gold Standard)
 * 
 * Usage:
 *   const { getVariant, trackConversion, isLoading } = useABTesting();
 */
export function useABTesting() {
  const { user } = useAuth();
  const queryClient = useAppQueryClient();

  // 1. Fetch Active Experiments
  const { data: experiments = [], isLoading: expsLoading } = useQuery({
    queryKey: ['ab-experiments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ab_experiments')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 mins
  });

  // 2. Fetch User Assignments
  const { data: assignments = {}, isLoading: assignsLoading } = useQuery({
    queryKey: ['ab-assignments', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      const { data, error } = await supabase
        .from('ab_assignments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const map = {};
      (data || []).forEach(a => map[a.experiment_id] = a);
      return map;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
  });

  // 3. Assign User Mutation
  const assignMutation = useMutation({
    mutationFn: async ({ experimentId, variant }) => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('ab_assignments')
        .insert({
          experiment_id: experimentId,
          user_id: user.id,
          user_email: user.email,
          variant: variant
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (newItem) => {
      if (newItem) {
        queryClient.setQueryData(['ab-assignments', user?.id], (old) => ({
          ...old,
          [newItem.experiment_id]: newItem
        }));
      }
    }
  });

  // 4. Track Conversion Mutation
  const trackMutation = useMutation({
    mutationFn: async ({ experimentId, assignmentId, type, value, metadata }) => {
      const { error } = await supabase.from('ab_conversions').insert({
        experiment_id: experimentId,
        assignment_id: assignmentId,
        user_id: user.id,
        conversion_type: type,
        conversion_value: value,
        metadata
      });
      if (error) throw error;
    }
  });

  // Logic: Get or Assign Variant
  const getVariant = useCallback(async (experimentName) => {
    if (!user?.id) return 'control';

    // Find experiment
    const experiment = experiments.find(e => e.name === experimentName);
    if (!experiment) return 'control';

    // Check existing assignment (from cache)
    if (assignments[experiment.id]) {
      return assignments[experiment.id].variant;
    }

    // Determine new variant locally
    const variants = experiment.variants || ['control', 'treatment'];
    const allocations = experiment.allocation_percentages || {};
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

    // Persist assignment
    // We don't await this to return fast, optimistic UI
    assignMutation.mutate({ experimentId: experiment.id, variant: selectedVariant });

    return selectedVariant;
  }, [user, experiments, assignments, assignMutation]);

  const trackConversion = useCallback((experimentName, type, value = 1, metadata = {}) => {
    const experiment = experiments.find(e => e.name === experimentName);
    if (!experiment || !assignments[experiment.id]) return;

    trackMutation.mutate({
      experimentId: experiment.id,
      assignmentId: assignments[experiment.id].id,
      type,
      value,
      metadata
    });
  }, [experiments, assignments, trackMutation]);

  return {
    getVariant,
    trackConversion,
    isLoading: expsLoading || assignsLoading
  };
}

export default useABTesting;

