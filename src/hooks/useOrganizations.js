import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useOrganizations() {
    return useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('id, name_en, name_ar');
            if (error) return [];
            return data || [];
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

export const useOrganizationsList = useOrganizations;

export function useOrganizationLeaderboard() {
    return useQuery({
        queryKey: ['org-leaderboard'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .order('reputation_score', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });
}



export function useOrganizationByOwner(email) {
    return useQuery({
        queryKey: ['organization', 'owner', email],
        queryFn: async () => {
            if (!email) return null;
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('owner_email', email)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching organization by owner:', error);
            }
            return data || null;
        },
        enabled: !!email,
        staleTime: 5 * 60 * 1000
    });
}

export function useOrganizationById(id) {
    return useQuery({
        queryKey: ['organization', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}

export function useOrganizationPartnerships(organizationId) {
    return useQuery({
        queryKey: ['org-partnerships-full', organizationId],
        queryFn: async () => {
            if (!organizationId) return { partnerships: [], collaborations: [] };

            const { data: partnerships, error: pError } = await supabase
                .from('partnerships')
                .select('*')
                .or(`organization_a_id.eq.${organizationId},organization_b_id.eq.${organizationId}`);

            if (pError) throw pError;

            const { data: collaborations, error: cError } = await supabase
                .from('pilot_collaborations')
                .select('*')
                .or(`organization_a_id.eq.${organizationId},organization_b_id.eq.${organizationId}`);

            if (cError) throw cError;

            return {
                partnerships: partnerships || [],
                collaborations: collaborations || []
            };
        },
        enabled: !!organizationId
    });
}

export function useOrganizationActivities(organizationId) {
    return useQuery({
        queryKey: ['org-activities', organizationId],
        queryFn: async () => {
            if (!organizationId) return [];
            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .eq('entity_id', organizationId)
                .eq('entity_type', 'Organization')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data || [];
        },
        enabled: !!organizationId
    });
}

