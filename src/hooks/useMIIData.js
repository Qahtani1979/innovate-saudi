import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Centralized hook for fetching MII (Municipal Innovation Index) data
 * Used by both MIIDrillDown and MunicipalityProfile pages
 */
export function useMIIData(municipalityId) {
  // Fetch dimensions (reference data)
  const { data: dimensions = [], isLoading: loadingDimensions } = useQuery({
    queryKey: ['mii-dimensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mii_dimensions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30 // 30 minutes - reference data doesn't change often
  });

  // Fetch latest result for this municipality
  const { data: latestResult, isLoading: loadingResult } = useQuery({
    queryKey: ['mii-latest-result', municipalityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mii_results')
        .select('*')
        .eq('municipality_id', municipalityId)
        .eq('is_published', true)
        .order('assessment_year', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!municipalityId
  });

  // Fetch historical trend (all years)
  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['mii-history', municipalityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mii_results')
        .select('assessment_year, overall_score, rank, dimension_scores, trend')
        .eq('municipality_id', municipalityId)
        .eq('is_published', true)
        .order('assessment_year', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!municipalityId
  });

  // Fetch national statistics (latest year averages)
  const { data: nationalStats } = useQuery({
    queryKey: ['mii-national-stats'],
    queryFn: async () => {
      // Get all latest year results
      const { data: allResults, error } = await supabase
        .from('mii_results')
        .select('assessment_year, overall_score, dimension_scores')
        .eq('is_published', true)
        .order('assessment_year', { ascending: false });

      if (error) throw error;
      if (!allResults || allResults.length === 0) return null;

      // Get latest year's results
      const latestYear = allResults[0]?.assessment_year;
      const latestResults = allResults.filter(r => r.assessment_year === latestYear);

      // Calculate overall average
      const avgScore = latestResults.reduce((sum, r) => sum + (r.overall_score || 0), 0) / latestResults.length;

      // Calculate dimension averages
      const dimensionAverages = {};
      const dimensionCodes = ['LEADERSHIP', 'STRATEGY', 'CULTURE', 'PARTNERSHIPS', 'CAPABILITIES', 'IMPACT'];

      dimensionCodes.forEach(code => {
        const scores = latestResults
          .map(r => r.dimension_scores?.[code]?.score)
          .filter(s => s !== null && s !== undefined);
        if (scores.length > 0) {
          dimensionAverages[code] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        }
      });

      return {
        averageScore: Math.round(avgScore * 10) / 10,
        totalMunicipalities: latestResults.length,
        latestYear,
        dimensionAverages
      };
    },
    staleTime: 1000 * 60 * 15 // 15 minutes
  });

  // Compute radar chart data from dimensions and latest result
  const radarData = dimensions.map(dim => {
    const dimScore = latestResult?.dimension_scores?.[dim.code]?.score || 0;
    const nationalAvg = nationalStats?.dimensionAverages?.[dim.code] || 0;

    return {
      dimension: dim.name_en,
      dimensionAr: dim.name_ar,
      code: dim.code,
      value: Math.round(dimScore),
      nationalAvg: Math.round(nationalAvg),
      weight: dim.weight,
      fullMark: 100
    };
  });

  // Compute trend data for line chart
  const trendData = history.map(h => ({
    year: h.assessment_year,
    score: Math.round(h.overall_score || 0),
    rank: h.rank
  }));

  // Compute YoY growth (comparing latest 2 years)
  const yoyGrowth = history.length >= 2
    ? Math.round((history[history.length - 1].overall_score - history[history.length - 2].overall_score) * 10) / 10
    : null;

  // Compute rank change (positive = improved, negative = declined)
  const rankChange = latestResult?.previous_rank && latestResult?.rank
    ? latestResult.previous_rank - latestResult.rank
    : null;

  // Get trend direction
  const trend = latestResult?.trend || 'stable';

  // Get strengths and improvement areas
  const strengths = Array.isArray(latestResult?.strengths)
    ? latestResult.strengths
    : [];

  const improvementAreas = Array.isArray(latestResult?.improvement_areas)
    ? latestResult.improvement_areas
    : [];

  return {
    // Raw data
    dimensions,
    latestResult,
    history,
    nationalStats,

    // Computed data for charts
    radarData,
    trendData,

    // Computed metrics
    yoyGrowth,
    rankChange,
    trend,
    strengths,
    improvementAreas,

    // Loading states
    isLoading: loadingDimensions || loadingResult || loadingHistory,
    hasData: !!latestResult
  };
}

export function useMIIBenchmarking() {
  return useQuery({
    queryKey: ['all-mii-results-latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mii_results')
        .select('municipality_id, overall_score, dimension_scores, assessment_year')
        .eq('is_published', true)
        .order('assessment_year', { ascending: false });
      if (error) throw error;

      // Get only the latest result per municipality
      const latestByMunicipality = {};
      data?.forEach(r => {
        if (!latestByMunicipality[r.municipality_id]) {
          latestByMunicipality[r.municipality_id] = r;
        }
      });
      return Object.values(latestByMunicipality);
    }
  });
}

export function useMIIMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (municipalityId) => {
      const { data, error } = await supabase.functions.invoke('calculate-mii', {
        body: { municipality_id: municipalityId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, municipalityId) => {
      queryClient.invalidateQueries(['municipality', municipalityId]);
      queryClient.invalidateQueries(['mii-latest-result', municipalityId]);
      queryClient.invalidateQueries(['mii-history', municipalityId]);
    }
  });
}
export function useAllMIIResults() {
  return useQuery({
    queryKey: ['all-mii-results-raw'],
    queryFn: async () => {
      const { data, error } = await supabase.from('mii_results').select('*');
      if (error) throw error;
      return data || [];
    }
  });
}
