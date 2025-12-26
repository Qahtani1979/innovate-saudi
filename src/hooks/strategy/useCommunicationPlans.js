import { useState, useCallback } from 'react';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useCommunicationPlans(strategicPlanId) {
  const queryClient = useAppQueryClient();

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['communication-plans', strategicPlanId],
    queryFn: async () => {
      let query = supabase
        .from('communication_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (strategicPlanId) {
        query = query.eq('strategic_plan_id', strategicPlanId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: true
  });

  const createPlan = useMutation({
    mutationFn: async (planData) => {
      const { data, error } = await supabase
        .from('communication_plans')
        .insert([planData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-plans'] });
    }
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('communication_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-plans'] });
    }
  });

  const deletePlan = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('communication_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-plans'] });
    }
  });

  return {
    plans,
    isLoading,
    error,
    createPlan: createPlan.mutateAsync,
    updatePlan: updatePlan.mutateAsync,
    deletePlan: deletePlan.mutateAsync,
    isCreating: createPlan.isPending,
    isUpdating: updatePlan.isPending,
    isDeleting: deletePlan.isPending
  };
}

export default useCommunicationPlans;

