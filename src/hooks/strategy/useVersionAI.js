import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useVersionAI() {
  const { toast } = useToast();

  const analyzeImpact = useMutation({
    mutationFn: async ({ changes, planContext }) => {
      const { data, error } = await supabase.functions.invoke('strategy-version-ai', {
        body: { action: 'analyze_impact', changes, planContext }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const categorizeChange = useMutation({
    mutationFn: async ({ changes, versionData, planContext }) => {
      const { data, error } = await supabase.functions.invoke('strategy-version-ai', {
        body: { action: 'categorize_change', changes, versionData, planContext }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const compareVersions = useMutation({
    mutationFn: async ({ versionData, planContext }) => {
      const { data, error } = await supabase.functions.invoke('strategy-version-ai', {
        body: { action: 'compare_versions', versionData, planContext }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const predictRollbackImpact = useMutation({
    mutationFn: async ({ versionData, planContext }) => {
      const { data, error } = await supabase.functions.invoke('strategy-version-ai', {
        body: { action: 'predict_rollback_impact', versionData, planContext }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  const findRelatedDocuments = useMutation({
    mutationFn: async ({ changes, planContext }) => {
      const { data, error } = await supabase.functions.invoke('strategy-version-ai', {
        body: { action: 'find_related_documents', changes, planContext }
      });
      if (error) throw error;
      return data.result;
    },
    onError: (error) => {
      toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
    }
  });

  return {
    analyzeImpact,
    categorizeChange,
    compareVersions,
    predictRollbackImpact,
    findRelatedDocuments
  };
}
