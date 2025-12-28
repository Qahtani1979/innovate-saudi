import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useExpertPanels() {
    return useQuery({
        queryKey: ['expert-panels'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_panels')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            return data || [];
        }
    });
}

export function usePanelChallenges() {
    return useQuery({
        queryKey: ['challenges-for-panel'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) throw error;
            return data || [];
        }
    });
}

export function usePanelPilots() {
    return useQuery({
        queryKey: ['pilots-for-panel'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) throw error;
            return data || [];
        }
    });
}

export function usePanelRDProjects() {
    return useQuery({
        queryKey: ['rd-projects-for-panel'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_projects')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) throw error;
            return data || [];
        }
    });
}

export function usePanelScalingPlans() {
    return useQuery({
        queryKey: ['scaling-plans-for-panel'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('scaling_plans')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) throw error;
            return data || [];
        }
    });
}

export function useExpertPanel(panelId) {
    return useQuery({
        queryKey: ['expert-panel', panelId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_panels')
                .select('*')
                .eq('id', panelId)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!panelId
    });
}

export function usePanelEvaluations(entityId, entityType) {
    return useQuery({
        queryKey: ['panel-evaluations', entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!entityId && !!entityType
    });
}

