import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for general KPIs (Plan-based)
 */
export const useKPIs = ({ planId } = {}) => {
    return useQuery({
        queryKey: ['kpis', { planId }],
        queryFn: async () => {
            let query = supabase.from('kpis').select('*');
            if (planId) {
                query = query.eq('plan_id', planId);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Hook for Pilot-specific KPIs
 */
export const usePilotKPIs = (pilotId) => {
    return useQuery({
        queryKey: ['pilot-kpis', pilotId],
        queryFn: async () => {
            if (!pilotId) return [];
            const { data, error } = await supabase
                .from('pilot_kpis')
                .select('*')
                .eq('pilot_id', pilotId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!pilotId,
        staleTime: 1000 * 60 * 5,
    });
};

/**
 * Hook for KPI Datapoints
 */
export const usePilotKPIDatapoints = (pilotId) => {
    return useQuery({
        queryKey: ['kpi-datapoints', pilotId],
        queryFn: async () => {
            if (!pilotId) return [];

            // First get KPI IDs for this pilot
            const { data: kpis } = await supabase
                .from('pilot_kpis')
                .select('id')
                .eq('pilot_id', pilotId);

            if (!kpis || kpis.length === 0) return [];
            const kpiIds = kpis.map(k => k.id);

            const { data, error } = await supabase
                .from('pilot_kpi_datapoints')
                .select('*')
                .in('pilot_kpi_id', kpiIds)
                .order('timestamp', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!pilotId,
        staleTime: 1000 * 60,
    });
};

/**
 * Mutation to record a new KPI datapoint
 */
export const useAddKPIDatapoint = () => {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async ({ kpiId, value, source = 'manual', notes = '', timestamp = new Date().toISOString() }) => {
            // 1. Insert datapoint
            const { data: datapoint, error: dpError } = await supabase
                .from('pilot_kpi_datapoints')
                .insert({
                    pilot_kpi_id: kpiId,
                    value: parseFloat(value),
                    source,
                    notes,
                    timestamp
                })
                .select()
                .single();

            if (dpError) throw dpError;

            // 2. Update KPI current value and status
            const { error: kpiError } = await supabase
                .from('pilot_kpis')
                .update({
                    current_value: parseFloat(value),
                    last_updated: timestamp
                })
                .eq('id', kpiId);

            if (kpiError) throw kpiError;

            return datapoint;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['pilot-kpis']);
            queryClient.invalidateQueries(['kpi-datapoints']);
            queryClient.invalidateQueries(['pilot']);
        }
    });
};

/**
 * Mutation to update KPI configuration
 */
export const useUpdatePilotKPI = () => {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from('pilot_kpis')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['pilot-kpis', data.pilot_id]);
        }
    });
};



