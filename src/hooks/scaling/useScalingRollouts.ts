import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScalingRollout {
  id: string;
  scaling_plan_id: string;
  municipality_id?: string;
  phase: string;
  status: string;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  progress_percentage: number;
  rollout_lead_email?: string;
  notes?: string;
  blockers: unknown[];
  success_metrics: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ScalingMunicipality {
  id: string;
  scaling_plan_id: string;
  municipality_id?: string;
  readiness_score: number;
  readiness_status: string;
  onboarding_status: string;
  onboarding_started_at?: string;
  onboarding_completed_at?: string;
  training_status: string;
  infrastructure_ready: boolean;
  budget_allocated: boolean;
  staff_assigned: boolean;
  local_champion_email?: string;
  barriers: unknown[];
  support_requests: unknown[];
  created_at: string;
  updated_at: string;
}

// Scaling Rollouts Hooks
export function useScalingRollouts(scalingPlanId?: string) {
  return useQuery({
    queryKey: ['scaling-rollouts', scalingPlanId],
    queryFn: async () => {
      let query = supabase
        .from('scaling_rollouts')
        .select('*, municipalities(*)')
        .order('created_at', { ascending: false });

      if (scalingPlanId) {
        query = query.eq('scaling_plan_id', scalingPlanId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useScalingRollout(id: string | undefined) {
  return useQuery({
    queryKey: ['scaling-rollout', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('scaling_rollouts')
        .select('*, municipalities(*), scaling_plans(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateScalingRollout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<ScalingRollout>) => {
      const { data, error } = await supabase
        .from('scaling_rollouts')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scaling-rollouts'] });
      queryClient.invalidateQueries({ queryKey: ['scaling-rollouts', data.scaling_plan_id] });
      toast.success('Rollout created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create rollout: ${error.message}`);
    },
  });
}

export function useUpdateScalingRollout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ScalingRollout> & { id: string }) => {
      const { data, error } = await supabase
        .from('scaling_rollouts')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scaling-rollouts'] });
      queryClient.invalidateQueries({ queryKey: ['scaling-rollout', data.id] });
      toast.success('Rollout updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update rollout: ${error.message}`);
    },
  });
}

// Scaling Municipalities Hooks
export function useScalingMunicipalities(scalingPlanId?: string) {
  return useQuery({
    queryKey: ['scaling-municipalities', scalingPlanId],
    queryFn: async () => {
      let query = supabase
        .from('scaling_municipalities')
        .select('*, municipalities(*)')
        .order('readiness_score', { ascending: false });

      if (scalingPlanId) {
        query = query.eq('scaling_plan_id', scalingPlanId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useScalingMunicipality(id: string | undefined) {
  return useQuery({
    queryKey: ['scaling-municipality', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('scaling_municipalities')
        .select('*, municipalities(*), scaling_plans(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateScalingMunicipality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<ScalingMunicipality>) => {
      const { data, error } = await supabase
        .from('scaling_municipalities')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scaling-municipalities'] });
      queryClient.invalidateQueries({ queryKey: ['scaling-municipalities', data.scaling_plan_id] });
      toast.success('Municipality added to scaling plan');
    },
    onError: (error) => {
      toast.error(`Failed to add municipality: ${error.message}`);
    },
  });
}

export function useUpdateScalingMunicipality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ScalingMunicipality> & { id: string }) => {
      const { data, error } = await supabase
        .from('scaling_municipalities')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scaling-municipalities'] });
      queryClient.invalidateQueries({ queryKey: ['scaling-municipality', data.id] });
      toast.success('Municipality status updated');
    },
    onError: (error) => {
      toast.error(`Failed to update municipality: ${error.message}`);
    },
  });
}

export function useUpdateMunicipalityReadiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, readiness_score, readiness_status }: { id: string; readiness_score: number; readiness_status: string }) => {
      const { data, error } = await supabase
        .from('scaling_municipalities')
        .update({
          readiness_score,
          readiness_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scaling-municipalities'] });
      toast.success('Readiness score updated');
    },
    onError: (error) => {
      toast.error(`Failed to update readiness: ${error.message}`);
    },
  });
}

export function useDeleteScalingMunicipality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scaling_municipalities')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scaling-municipalities'] });
      toast.success('Municipality removed from scaling plan');
    },
    onError: (error) => {
      toast.error(`Failed to remove municipality: ${error.message}`);
    },
  });
}
