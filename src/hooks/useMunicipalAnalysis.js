import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * useMunicipalAnalysis
 * ✅ GOLD STANDARD COMPLIANT
 * 
 * Provides performance metrics and benchmarking for municipalities.
 */
export function useMunicipalAnalysis(municipalityId) {

    // Fetch benchmarks across all municipalities
    const benchmarks = useQuery({
        queryKey: ['municipality-benchmarks'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('municipalities')
                .select('id, name_en, name_ar, mii_score, population, active_pilots, completed_pilots');

            if (error) throw error;

            const total = data.length || 1;
            const avgMII = (data.reduce((sum, m) => sum + (m.mii_score || 0), 0) / total).toFixed(1);

            return {
                total_municipalities: data.length,
                national_average_mii: avgMII,
                all_raw: data
            };
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    // Fetch entity counts for a specific municipality
    const metrics = useQuery({
        queryKey: ['municipality-metrics', municipalityId],
        queryFn: async () => {
            if (!municipalityId) return null;

            const [challengesRes, pilotsRes] = await Promise.all([
                supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('municipality_id', municipalityId),
                supabase.from('pilots').select('id', { count: 'exact', head: true }).eq('municipality_id', municipalityId)
            ]);

            return {
                challengesCount: challengesRes.count || 0,
                pilotsCount: pilotsRes.count || 0
            };
        },
        enabled: !!municipalityId
    });

    return {
        benchmarks,
        metrics,
        isLoading: benchmarks.isLoading || metrics.isLoading
    };
}

export default useMunicipalAnalysis;
