import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// AI helpers for stakeholder sign-offs governance
// API compatible with React Query's useMutation objects: { isPending, mutateAsync }
export function useSignoffAI() {
  const { toast } = useToast();

  const [suggestPending, setSuggestPending] = useState(false);
  const [riskPending, setRiskPending] = useState(false);
  const [remindersPending, setRemindersPending] = useState(false);
  const [sentimentPending, setSentimentPending] = useState(false);

  const suggestStakeholders = {
    isPending: suggestPending,
    mutateAsync: async ({ documentType, planData }) => {
      setSuggestPending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-signoff-ai', {
          body: { action: 'suggest_stakeholders', documentType, planData },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI suggestStakeholders error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setSuggestPending(false);
      }
    },
  };

  const predictApprovalRisk = {
    isPending: riskPending,
    mutateAsync: async ({ stakeholderData, planData, context }) => {
      setRiskPending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-signoff-ai', {
          body: { action: 'predict_approval_risk', stakeholderData, planData, context },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI predictApprovalRisk error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setRiskPending(false);
      }
    },
  };

  const optimizeReminders = {
    isPending: remindersPending,
    mutateAsync: async ({ stakeholderData, context }) => {
      setRemindersPending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-signoff-ai', {
          body: { action: 'optimize_reminders', stakeholderData, context },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI optimizeReminders error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setRemindersPending(false);
      }
    },
  };

  const analyzeSentiment = {
    isPending: sentimentPending,
    mutateAsync: async ({ stakeholderData, documentType }) => {
      setSentimentPending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-signoff-ai', {
          body: { action: 'analyze_sentiment', stakeholderData, documentType },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI analyzeSentiment error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setSentimentPending(false);
      }
    },
  };

  return {
    suggestStakeholders,
    predictApprovalRisk,
    optimizeReminders,
    analyzeSentiment,
  };
}
