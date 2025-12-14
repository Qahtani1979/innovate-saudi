import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// AI helpers for committee review governance flows
// Exposes { isPending, mutateAsync } just like React Query mutations
export function useCommitteeAI() {
  const { toast } = useToast();

  const [agendaPending, setAgendaPending] = useState(false);
  const [schedulePending, setSchedulePending] = useState(false);
  const [impactPending, setImpactPending] = useState(false);
  const [actionsPending, setActionsPending] = useState(false);
  const [summaryPending, setSummaryPending] = useState(false);

  const prioritizeAgenda = {
    isPending: agendaPending,
    mutateAsync: async ({ agendaItems, committeeData, meetingContext }) => {
      setAgendaPending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-committee-ai', {
          body: { action: 'prioritize_agenda', agendaItems, committeeData, meetingContext },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI prioritizeAgenda error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setAgendaPending(false);
      }
    },
  };

  const optimizeScheduling = {
    isPending: schedulePending,
    mutateAsync: async ({ committeeData, agendaItems, meetingContext }) => {
      setSchedulePending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-committee-ai', {
          body: { action: 'optimize_scheduling', committeeData, agendaItems, meetingContext },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI optimizeScheduling error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setSchedulePending(false);
      }
    },
  };

  const predictDecisionImpact = {
    isPending: impactPending,
    mutateAsync: async ({ decisions, committeeData, meetingContext }) => {
      setImpactPending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-committee-ai', {
          body: { action: 'predict_decision_impact', decisions, committeeData, meetingContext },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI predictDecisionImpact error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setImpactPending(false);
      }
    },
  };

  const generateActionItems = {
    isPending: actionsPending,
    mutateAsync: async ({ decisions, committeeData, meetingContext }) => {
      setActionsPending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-committee-ai', {
          body: { action: 'generate_action_items', decisions, committeeData, meetingContext },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI generateActionItems error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setActionsPending(false);
      }
    },
  };

  const summarizeMeeting = {
    isPending: summaryPending,
    mutateAsync: async ({ decisions, agendaItems, committeeData, meetingContext }) => {
      setSummaryPending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-committee-ai', {
          body: { action: 'summarize_meeting', decisions, agendaItems, committeeData, meetingContext },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI summarizeMeeting error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setSummaryPending(false);
      }
    },
  };

  return {
    prioritizeAgenda,
    optimizeScheduling,
    predictDecisionImpact,
    generateActionItems,
    summarizeMeeting,
  };
}
