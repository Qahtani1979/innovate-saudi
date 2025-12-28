import { useMutation } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useWorkflowAI() {
  const { toast } = useToast();

  const optimizeWorkflow = useMutation({
    mutationFn: async ({ workflowData, entityType, historicalData, context }) => {
      const { data, error } = await supabase.functions.invoke('strategy-workflow-ai', {
        body: { action: 'optimize_workflow', workflowData, entityType, historicalData, context }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const predictBottlenecks = useMutation({
    mutationFn: async ({ workflowData, historicalData, context }) => {
      const { data, error } = await supabase.functions.invoke('strategy-workflow-ai', {
        body: { action: 'predict_bottlenecks', workflowData, historicalData, context }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const recommendSimilarWorkflows = useMutation({
    mutationFn: async ({ entityType, workflowData, context }) => {
      const { data, error } = await supabase.functions.invoke('strategy-workflow-ai', {
        body: { action: 'recommend_similar_workflows', entityType, workflowData, context }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const estimateDuration = useMutation({
    mutationFn: async ({ workflowData, historicalData, context }) => {
      const { data, error } = await supabase.functions.invoke('strategy-workflow-ai', {
        body: { action: 'estimate_duration', workflowData, historicalData, context }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const analyzeGateEffectiveness = useMutation({
    mutationFn: async ({ workflowData, historicalData, context }) => {
      const { data, error } = await supabase.functions.invoke('strategy-workflow-ai', {
        body: { action: 'analyze_gate_effectiveness', workflowData, historicalData, context }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  return {
    optimizeWorkflow,
    predictBottlenecks,
    recommendSimilarWorkflows,
    estimateDuration,
    analyzeGateEffectiveness
  };
}

