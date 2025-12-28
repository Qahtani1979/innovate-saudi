import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useMunicipalityProfileData(urlMunicipalityId) {
    // 1. Get user's municipality from auth context if no ID provided
    const { data: userProfile } = useQuery({
        queryKey: ['current-user-profile-for-municipality'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) return null;
            const { data } = await supabase
                .from('user_profiles')
                .select('municipality_id')
                .eq('user_id', session.user.id)
                .maybeSingle();
            return data;
        },
        enabled: !urlMunicipalityId
    });

    // Use URL param if provided, otherwise fallback to user's municipality
    const municipalityId = urlMunicipalityId || userProfile?.municipality_id;

    // 2. Fetch Municipality Details
    const { data: municipality, isLoading: municipalityLoading, error: municipalityError } = useQuery({
        queryKey: ['municipality', municipalityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('municipalities')
                .select('*')
                .eq('id', municipalityId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!municipalityId,
        staleTime: 5 * 60 * 1000
    });

    // 3. Fetch Challenges
    const { data: challenges = [] } = useQuery({
        queryKey: ['municipality-challenges', municipalityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('municipality_id', municipalityId)
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        },
        enabled: !!municipalityId,
        staleTime: 5 * 60 * 1000
    });

    // 4. Fetch Pilots
    const { data: pilots = [] } = useQuery({
        queryKey: ['municipality-pilots', municipalityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .eq('municipality_id', municipalityId)
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        },
        enabled: !!municipalityId,
        staleTime: 5 * 60 * 1000
    });

    return {
        municipalityId,
        municipality,
        challenges,
        pilots,
        isLoading: municipalityLoading,
        error: municipalityError
    };
}

