import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePolicies() {
    const usePolicyTemplates = () => useQuery({
        queryKey: ['policy-templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('policy_templates')
                .select('*')
                .order('name_en');

            if (error) throw error;
            if (error) throw error;
            return /** @type {import('@/types/supa_ext').PolicyTemplate[]} */ (data) || [];
        }
    });

    const usePolicy = (id) => useQuery({
        queryKey: ['policy', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('policy_recommendations')
                .select('*')
                .eq('id', id)
                .maybeSingle();
            if (error) throw error;
            if (error) throw error;
            return /** @type {import('@/types/supa_ext').PolicyRecommendation} */ (data);
        },
        enabled: !!id
    });

    return {
        usePolicyTemplates,
        usePolicy
    };
}

export function usePendingLegacyPolicies() {
    return useQuery({
        queryKey: ['policy-approvals-legacy'],
        queryFn: async () => {
            const { data, error } = await supabase.from('policies').select('*').eq('status', 'pending');
            if (error) throw error;
            return data || [];
        }
    });
}
