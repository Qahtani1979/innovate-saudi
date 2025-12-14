import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useGapAnalysis(strategicPlanId) {
  const [analysis, setAnalysis] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch latest coverage snapshot
  const { data: latestSnapshot, isLoading: isLoadingSnapshot } = useQuery({
    queryKey: ['coverage-snapshot', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return null;
      
      const { data, error } = await supabase
        .from('coverage_snapshots')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!strategicPlanId
  });

  // Run gap analysis
  const runAnalysis = useMutation({
    mutationFn: async (depth = 'quick') => {
      const { data, error } = await supabase.functions.invoke('strategy-gap-analysis', {
        body: { 
          strategic_plan_id: strategicPlanId, 
          analysis_depth: depth 
        }
      });
      
      if (error) throw error;
      setAnalysis(data);
      return data;
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Analysis Complete', 
        description: `Found ${data?.total_generation_needed?.total || 0} items needed` 
      });
      queryClient.invalidateQueries({ queryKey: ['coverage-snapshot', strategicPlanId] });
    },
    onError: (error) => {
      toast({ 
        title: 'Analysis Failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Generate demand queue from analysis
  const generateQueue = useMutation({
    mutationFn: async (maxItems = 20) => {
      if (!analysis) {
        throw new Error('Run analysis first');
      }
      
      const { data, error } = await supabase.functions.invoke('strategy-demand-queue-generator', {
        body: { 
          strategic_plan_id: strategicPlanId,
          gap_analysis: analysis,
          max_items: maxItems
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Queue Generated', 
        description: `Created ${data?.items_created || 0} queue items` 
      });
      queryClient.invalidateQueries({ queryKey: ['demand-queue', strategicPlanId] });
    },
    onError: (error) => {
      toast({ 
        title: 'Queue Generation Failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Save coverage snapshot
  const saveSnapshot = useMutation({
    mutationFn: async (analysisData) => {
      const dataToSave = analysisData || analysis;
      if (!dataToSave) throw new Error('No analysis data to save');
      
      const { data, error } = await supabase
        .from('coverage_snapshots')
        .upsert({
          strategic_plan_id: strategicPlanId,
          snapshot_date: new Date().toISOString().split('T')[0],
          objective_coverage: dataToSave.objectives || [],
          entity_coverage: dataToSave.entity_coverage || {},
          gap_analysis: dataToSave.gaps || {},
          overall_coverage_pct: dataToSave.overall_coverage_pct,
          total_objectives: dataToSave.total_objectives,
          fully_covered_objectives: dataToSave.fully_covered_objectives,
          total_gap_items: dataToSave.total_generation_needed?.total || 0
        }, {
          onConflict: 'strategic_plan_id,snapshot_date'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverage-snapshot', strategicPlanId] });
    }
  });

  // Calculate summary from analysis
  const summary = analysis ? {
    overallCoverage: analysis.overall_coverage_pct || 0,
    totalObjectives: analysis.total_objectives || 0,
    fullyCovered: analysis.fully_covered_objectives || 0,
    totalGaps: analysis.total_generation_needed?.total || 0,
    byType: analysis.total_generation_needed || {}
  } : null;

  return {
    analysis,
    latestSnapshot,
    summary,
    runAnalysis,
    generateQueue,
    saveSnapshot,
    isAnalyzing: runAnalysis.isPending,
    isGeneratingQueue: generateQueue.isPending,
    isLoadingSnapshot,
    hasAnalysis: !!analysis,
    canGenerateQueue: !!analysis && !generateQueue.isPending
  };
}
