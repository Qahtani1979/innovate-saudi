import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useOrganization(id) {
    return useQuery({
        queryKey: ['organization', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}

export function useOrganizationSolutions(organizationId) {
    return useQuery({
        queryKey: ['organization-solutions', organizationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('solutions')
                .select('*')
                .eq('provider_id', organizationId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!organizationId
    });
}

export function useOrganizationPilots(solutionIds = []) {
    return useQuery({
        queryKey: ['organization-pilots', solutionIds.join(',')],
        queryFn: async () => {
            if (!solutionIds.length) return [];
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .in('solution_id', solutionIds);
            if (error) throw error;
            return data || [];
        },
        enabled: solutionIds.length > 0
    });
}

export function useOrganizationRDProjects(organizationName) {
    return useQuery({
        queryKey: ['organization-rd', organizationName],
        queryFn: async () => {
            if (!organizationName) return [];
            const { data, error } = await supabase
                .from('rd_projects')
                .select('*')
                .eq('institution_en', organizationName);
            if (error) throw error;
            return data || [];
        },
        enabled: !!organizationName
    });
}

export function useOrganizationPrograms(organizationId) {
    return useQuery({
        queryKey: ['organization-programs', organizationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('operator_organization_id', organizationId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!organizationId
    });
}
