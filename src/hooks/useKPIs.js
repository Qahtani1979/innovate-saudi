import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const usePilotKPIDatapoints = (pilotIds) => {
    return useQuery({
        queryKey: ['pilot-kpi-datapoints', { pilotIds }],
        queryFn: async () => {
            if (!pilotIds || pilotIds.length === 0) return [];

            const { data, error } = await supabase.from('pilot_kpi_datapoints')
                .select('*')
                .in('pilot_id', pilotIds);

            if (error) throw error;
            return data || [];
        },
        enabled: !!pilotIds && pilotIds.length > 0,
        staleTime: 1000 * 60 // 1 minute
    });
};

export const useAddKPIDatapoint = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newDatapoint) => {
            const { data, error } = await supabase
                .from('pilot_kpi_datapoints')
                .insert(newDatapoint)
                .select();
            if (error) throw error;
            return data[0];
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pilot-kpi-datapoints']);
            queryClient.invalidateQueries(['pilot-kpis']);
        }
    });
};
