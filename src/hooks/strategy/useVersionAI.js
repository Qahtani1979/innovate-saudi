import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// AI helpers for strategy version control governance
// Keeps the same shape as React Query mutations: { isPending, mutateAsync }
export function useVersionAI() {
  const { toast } = useToast();

  const [analyzePending, setAnalyzePending] = useState(false);
  const [categorizePending, setCategorizePending] = useState(false);
  const [comparePending, setComparePending] = useState(false);
  const [rollbackPending, setRollbackPending] = useState(false);
  const [relatedPending, setRelatedPending] = useState(false);

  const analyzeImpact = {
    isPending: analyzePending,
    mutateAsync: async ({ changes, planContext }) => {
      setAnalyzePending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-version-ai', {
          body: { action: 'analyze_impact', changes, planContext },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI analyzeImpact error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setAnalyzePending(false);
      }
    },
  };

  const categorizeChange = {
    isPending: categorizePending,
    mutateAsync: async ({ changes, versionData, planContext }) => {
      setCategorizePending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-version-ai', {
          body: { action: 'categorize_change', changes, versionData, planContext },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI categorizeChange error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setCategorizePending(false);
      }
    },
  };

  const compareVersions = {
    isPending: comparePending,
    mutateAsync: async ({ versionData, planContext }) => {
      setComparePending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-version-ai', {
          body: { action: 'compare_versions', versionData, planContext },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI compareVersions error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setComparePending(false);
      }
    },
  };

  const predictRollbackImpact = {
    isPending: rollbackPending,
    mutateAsync: async ({ versionData, planContext }) => {
      setRollbackPending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-version-ai', {
          body: { action: 'predict_rollback_impact', versionData, planContext },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI predictRollbackImpact error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setRollbackPending(false);
      }
    },
  };

  const findRelatedDocuments = {
    isPending: relatedPending,
    mutateAsync: async ({ changes, planContext }) => {
      setRelatedPending(true);
      try {
        const { data, error } = await supabase.functions.invoke('strategy-version-ai', {
          body: { action: 'find_related_documents', changes, planContext },
        });
        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error('AI findRelatedDocuments error', error);
        toast({ title: 'AI Error', description: error.message, variant: 'destructive' });
        throw error;
      } finally {
        setRelatedPending(false);
      }
    },
  };

  return {
    analyzeImpact,
    categorizeChange,
    compareVersions,
    predictRollbackImpact,
    findRelatedDocuments,
  };
}
