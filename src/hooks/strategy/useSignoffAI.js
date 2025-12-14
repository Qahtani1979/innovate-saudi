import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSignoffAI() {
  const { toast } = useToast();

  const suggestStakeholders = useMutation({
    mutationFn: async ({ documentType, planData }) => {
      const { data, error } = await supabase.functions.invoke('strategy-signoff-ai', {
        body: { action: 'suggest_stakeholders', documentType, planData }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const predictApprovalRisk = useMutation({
    mutationFn: async ({ stakeholderData, planData, context }) => {
      const { data, error } = await supabase.functions.invoke('strategy-signoff-ai', {
        body: { action: 'predict_approval_risk', stakeholderData, planData, context }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const optimizeReminders = useMutation({
    mutationFn: async ({ stakeholderData, context }) => {
      const { data, error } = await supabase.functions.invoke('strategy-signoff-ai', {
        body: { action: 'optimize_reminders', stakeholderData, context }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const analyzeSentiment = useMutation({
    mutationFn: async ({ stakeholderData, documentType }) => {
      const { data, error } = await supabase.functions.invoke('strategy-signoff-ai', {
        body: { action: 'analyze_sentiment', stakeholderData, documentType }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  return {
    suggestStakeholders,
    predictApprovalRisk,
    optimizeReminders,
    analyzeSentiment
  };
}
