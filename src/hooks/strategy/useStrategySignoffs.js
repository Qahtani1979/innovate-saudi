import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useStrategySignoffs(planId) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: signoffs, isLoading, error } = useQuery({
    queryKey: ['strategy-signoffs', planId],
    queryFn: async () => {
      let query = supabase
        .from('strategy_signoffs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (planId) {
        query = query.eq('strategic_plan_id', planId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true
  });

  const createSignoff = useMutation({
    mutationFn: async (signoffData) => {
      const { data, error } = await supabase
        .from('strategy_signoffs')
        .insert([signoffData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-signoffs'] });
      toast({
        title: 'Sign-off Request Sent',
        description: 'Stakeholder has been notified'
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

  const updateSignoff = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('strategy_signoffs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-signoffs'] });
      toast({
        title: 'Sign-off Updated',
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

  const deleteSignoff = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('strategy_signoffs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-signoffs'] });
      toast({
        title: 'Sign-off Removed',
        description: 'Request has been removed'
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

  const sendReminder = useMutation({
    mutationFn: async (id) => {
      const signoff = signoffs?.find(s => s.id === id);
      const { data, error } = await supabase
        .from('strategy_signoffs')
        .update({ 
          reminder_count: (signoff?.reminder_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-signoffs'] });
      toast({
        title: 'Reminder Sent',
        description: 'Stakeholder has been reminded'
      });
    }
  });

  return {
    signoffs,
    isLoading,
    error,
    createSignoff,
    updateSignoff,
    deleteSignoff,
    sendReminder
  };
}
