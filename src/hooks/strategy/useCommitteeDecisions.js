import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCommitteeDecisions(planId) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: decisions, isLoading, error } = useQuery({
    queryKey: ['committee-decisions', planId],
    queryFn: async () => {
      let query = supabase
        .from('committee_decisions')
        .select('*')
        .order('meeting_date', { ascending: false });
      
      if (planId) {
        query = query.eq('strategic_plan_id', planId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true
  });

  const createDecision = useMutation({
    mutationFn: async (decisionData) => {
      const { data, error } = await supabase
        .from('committee_decisions')
        .insert([decisionData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-decisions'] });
      toast({
        title: 'Decision Recorded',
        description: 'Committee decision has been saved'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateDecision = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('committee_decisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-decisions'] });
      toast({
        title: 'Decision Updated',
        description: 'Changes saved successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteDecision = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('committee_decisions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['committee-decisions'] });
      toast({
        title: 'Decision Removed',
        description: 'Decision has been deleted'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    decisions,
    isLoading,
    error,
    createDecision,
    updateDecision,
    deleteDecision
  };
}
