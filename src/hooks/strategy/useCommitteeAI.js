import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCommitteeAI() {
  const { toast } = useToast();

  const prioritizeAgenda = useMutation({
    mutationFn: async ({ agendaItems, committeeData, meetingContext }) => {
      const { data, error } = await supabase.functions.invoke('strategy-committee-ai', {
        body: { action: 'prioritize_agenda', agendaItems, committeeData, meetingContext }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const optimizeScheduling = useMutation({
    mutationFn: async ({ committeeData, agendaItems, meetingContext }) => {
      const { data, error } = await supabase.functions.invoke('strategy-committee-ai', {
        body: { action: 'optimize_scheduling', committeeData, agendaItems, meetingContext }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const predictDecisionImpact = useMutation({
    mutationFn: async ({ decisions, committeeData, meetingContext }) => {
      const { data, error } = await supabase.functions.invoke('strategy-committee-ai', {
        body: { action: 'predict_decision_impact', decisions, committeeData, meetingContext }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const generateActionItems = useMutation({
    mutationFn: async ({ decisions, committeeData, meetingContext }) => {
      const { data, error } = await supabase.functions.invoke('strategy-committee-ai', {
        body: { action: 'generate_action_items', decisions, committeeData, meetingContext }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const summarizeMeeting = useMutation({
    mutationFn: async ({ decisions, agendaItems, committeeData, meetingContext }) => {
      const { data, error } = await supabase.functions.invoke('strategy-committee-ai', {
        body: { action: 'summarize_meeting', decisions, agendaItems, committeeData, meetingContext }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  return {
    prioritizeAgenda,
    optimizeScheduling,
    predictDecisionImpact,
    generateActionItems,
    summarizeMeeting
  };
}
