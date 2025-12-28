import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing MII dimensions and calculation status
 */
export function useMIIManagement() {
    const queryClient = useAppQueryClient();

    // Fetch MII dimensions
    const dimensions = useQuery({
        queryKey: ['mii-dimensions-admin'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('mii_dimensions')
                .select('*')
                .order('display_order');
            if (error) throw error;
            return data || [];
        }
    });

    // Fetch MII calculation stats
    const calcStats = useQuery({
        queryKey: ['mii-calc-stats'],
        queryFn: async () => {
            const { data: results, error } = await supabase
                .from('mii_results')
                .select('id, assessment_date, municipality_id, overall_score, created_at')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            const uniqueMunicipalities = new Set((results || []).map(r => r.municipality_id)).size;
            const latestCalc = results?.[0]?.created_at;
            const avgScore = results?.length > 0
                ? (results.reduce((sum, r) => sum + (r.overall_score || 0), 0) / results.length).toFixed(1)
                : 0;

            return {
                totalCalculations: results?.length || 0,
                uniqueMunicipalities,
                latestCalculation: latestCalc,
                averageScore: avgScore
            };
        }
    });

    // Fetch municipalities pending recalculation
    const pendingRecalc = useQuery({
        queryKey: ['mii-pending-recalc'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('municipalities')
                .select('id, name_en, name_ar, mii_recalc_pending, mii_last_calculated_at')
                .eq('mii_recalc_pending', true);
            if (error) throw error;
            return data || [];
        }
    });

    // Recalculate all mutation
    const recalculateAll = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.functions.invoke('calculate-mii', {
                body: { calculateAll: true }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mii-calc-stats'] });
            queryClient.invalidateQueries({ queryKey: ['mii-pending-recalc'] });
        }
    });

    // Toggle dimension active status
    const toggleDimension = useMutation({
        mutationFn: async ({ id, isActive }) => {
            const { error } = await supabase
                .from('mii_dimensions')
                .update({ is_active: isActive })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mii-dimensions-admin'] });
            queryClient.invalidateQueries({ queryKey: ['mii-dimensions'] });
        }
    });

    return {
        dimensions,
        calcStats,
        pendingRecalc,
        recalculateAll,
        toggleDimension
    };
}



