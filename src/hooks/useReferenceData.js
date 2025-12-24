import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMunicipalities() {
    return useQuery({
        queryKey: ['municipalities'],
        queryFn: async () => {
            const { data, error } = await supabase.from('municipalities').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60 // 1 hour
    });
}

export function useRegions() {
    return useQuery({
        queryKey: ['regions'],
        queryFn: async () => {
            const { data, error } = await supabase.from('regions').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useCities() {
    return useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const { data, error } = await supabase.from('cities').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useServices() {
    return useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const { data, error } = await supabase.from('services').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useSubsectors() {
    return useQuery({
        queryKey: ['subsectors'],
        queryFn: async () => {
            const { data, error } = await supabase.from('subsectors').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useCitizenIdeas() {
    return useQuery({
        queryKey: ['citizen-ideas-approved'],
        queryFn: async () => {
            const { data, error } = await supabase.from('citizen_ideas').select('*').eq('status', 'approved');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5
    });
}

export function useCitizenIdea(id) {
    return useQuery({
        queryKey: ['citizen-idea', id],
        queryFn: async () => {
            const { data, error } = await supabase.from('citizen_ideas').select('*').eq('id', id).maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5
    });
}
