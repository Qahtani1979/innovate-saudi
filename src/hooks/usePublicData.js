import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch public challenges
 */
export function usePublicChallenges() {
    return useQuery({
        queryKey: ['public-challenges-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*, municipalities(name_en, name_ar)')
                .eq('is_published', true)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch public programs
 */
export function usePublicPrograms() {
    return useQuery({
        queryKey: ['public-programs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).filter(p =>
                p.is_published &&
                ['applications_open', 'active', 'planning'].includes(p.status)
            );
        }
    });
}

/**
 * Hook to fetch municipalities for public view
 */
export function usePublicMunicipalities() {
    return useQuery({
        queryKey: ['public-municipalities'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('municipalities')
                .select('*')
                .eq('is_active', true)
                .order('name_en');
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch sectors for public view
 */
export function usePublicSectors() {
    return useQuery({
        queryKey: ['public-sectors'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sectors')
                .select('*')
                .order('name_en');
            if (error) throw error;
            return data || [];
        }
    });
}


/**
 * Hook to fetch public pilots for map
 */
export function usePublicPilots() {
    return useQuery({
        queryKey: ['public-pilots-map'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .eq('is_published', true)
                .not('coordinates', 'is', null);
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch public challenges for map (with coordinates)
 */
export function usePublicMapChallenges() {
    return useQuery({
        queryKey: ['public-challenges-map'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('is_published', true)
                .not('coordinates', 'is', null);
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch a public user profile
 */
export function usePublicProfile(userId) {
    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['public-profile', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_profiles')
                .select(`
          id,
          user_id,
          full_name,
          full_name_en,
          full_name_ar,
          avatar_url,
          cover_image_url,
          bio_en,
          bio_ar,
          title_en,
          title_ar,
          job_title,
          job_title_en,
          job_title_ar,
          department,
          department_en,
          department_ar,
          organization_en,
          organization_ar,
          skills,
          expertise_areas,
          linkedin_url,
          location_city,
          location_region,
          languages,
          verified,
          is_public,
          contribution_count,
          profile_completion_percentage,
          created_at,
          user_email
        `)
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!userId
    });

    const { data: achievements = [] } = useQuery({
        queryKey: ['public-profile-achievements', profile?.user_email],
        queryFn: async () => {
            const { data } = await supabase
                .from('user_achievements')
                .select(`
          *,
          achievement:achievements(*)
        `)
                .eq('user_email', profile.user_email);
            return data || [];
        },
        enabled: !!profile?.user_email
    });

    const { data: citizenBadges = [] } = useQuery({
        queryKey: ['public-profile-badges', profile?.user_email],
        queryFn: async () => {
            const { data } = await supabase
                .from('citizen_badges')
                .select('*')
                .eq('user_email', profile.user_email);
            return data || [];
        },
        enabled: !!profile?.user_email
    });

    return { profile, achievements, citizenBadges, isLoading, error };
}

/**
 * Hook to fetch public solutions
 */
export function usePublicSolutions() {
    return useQuery({
        queryKey: ['public-solutions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('solutions')
                .select('*')
                .eq('is_published', true)
                .eq('is_archived', false);
            if (error) throw error;
            return data;
        }
    });
}

/**
 * Hook to fetch successful pilots (public deployments)
 */
export function usePublicSuccessfulDeployments() {
    return useQuery({
        queryKey: ['successful-deployments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .in('stage', ['completed', 'scaled'])
                .eq('recommendation', 'scale')
                .eq('is_published', true)
                .order('updated_at', { ascending: false })
                .limit(6);
            if (error) throw error;
            return data;
        }
    });
}

/**
 * Hook to fetch a single public pilot for feedback
 */
export function usePublicPilot(pilotId) {
    return useQuery({
        queryKey: ['public-pilot', pilotId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .eq('id', pilotId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!pilotId
    });
}

import { useMutation } from '@/hooks/useAppQueryClient';
import { toast } from 'sonner';

/**
 * Hook to submit public feedback
 */
export function usePublicFeedbackMutation() {
    return useMutation({
        mutationFn: async ({ pilotId, ...data }) => {
            const { error } = await supabase
                .from('citizen_feedback')
                .insert({
                    pilot_id: pilotId,
                    ...data
                });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Thank you for your feedback!');
        },
        onError: (error) => {
            console.error('Feedback submission error:', error);
            toast.error('Failed to submit feedback');
        }
    });
}

