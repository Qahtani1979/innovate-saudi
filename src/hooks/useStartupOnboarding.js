import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useRegions() {
    return useQuery({
        queryKey: ['regions-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('regions')
                .select('id, name_en, name_ar')
                .order('name_en');
            if (error) throw error;
            return data || [];
        }
    });
}

export function useStartupOnboardingMutations() {
    const queryClient = useQueryClient();

    const submitOnboarding = useMutation({
        /**
         * @param {{ 
         *   userId: string, 
         *   userEmail: string, 
         *   formData: {
         *     company_name_en: string,
         *     company_name_ar: string,
         *     description_en: string,
         *     description_ar: string,
         *     stage: string,
         *     team_size: number,
         *     sectors: string[],
         *     challenge_interests: string[],
         *     geographic_coverage: string[],
         *     website: string,
         *     linkedin_url: string
         *   }
         * }} params
         */
        mutationFn: async ({ userId, userEmail, formData }) => {
            // 1. Update user profile
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                    organization_en: formData.company_name_en || null,
                    organization_ar: formData.company_name_ar || null,
                    bio_en: formData.description_en || null,
                    bio_ar: formData.description_ar || null,
                    expertise_areas: formData.sectors,
                    linkedin_url: formData.linkedin_url || null,
                    onboarding_completed: true,
                    persona_onboarding_completed: true,
                    // @ts-ignore
                    metadata: {
                        company_stage: formData.stage,
                        team_size: formData.team_size,
                        challenge_interests: formData.challenge_interests,
                        geographic_coverage: formData.geographic_coverage
                    },
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (profileError) throw profileError;

            // 2. Create/Update provider profile
            /** @type {any} */
            const providerData = {
                user_id: userId,
                user_email: userEmail,
                company_name_en: formData.company_name_en,
                company_name_ar: formData.company_name_ar,
                description_en: formData.description_en,
                description_ar: formData.description_ar,
                company_stage: formData.stage,
                team_size: formData.team_size,
                sectors: formData.sectors,
                challenge_interests: formData.challenge_interests,
                geographic_coverage: formData.geographic_coverage,
                website: formData.website,
                linkedin_url: formData.linkedin_url,
                is_verified: false,
                status: 'pending_verification'
            };

            const { error: providerError } = await supabase
                .from('providers')
                .upsert(providerData, { onConflict: 'user_id' });

            if (providerError) {
                console.error('Provider profile error:', providerError);
                // Continue mainly because user_profile update succeeded
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            queryClient.invalidateQueries({ queryKey: ['startups'] });
        }
    });

    return {
        submitOnboarding
    };
}
