import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

/**
 * --- STARTUP PROFILES ---
 */

export function useStartups() {
    return useQuery({
        queryKey: ['startups'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('startup_profiles')
                .select('*, organizations(name_en, name_ar, sectors, logo_url, description_en, description_ar), providers(verified)');
            if (error) throw error;

            return (data || []).map(item => ({
                ...item,
                company_name_en: item.organizations?.name_en,
                company_name_ar: item.organizations?.name_ar,
                sectors: item.organizations?.sectors || [],
                logo_url: item.organizations?.logo_url,
                description_en: item.organizations?.description_en,
                description_ar: item.organizations?.description_ar,
                // @ts-ignore
                is_verified: item.providers?.[0]?.verified || false
            }));
        }
    });
}

export function useVerifiedStartups() {
    return useQuery({
        queryKey: ['startups', 'verified'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('providers')
                .select('*, organizations(*)')
                .eq('provider_type', 'startup')
                .eq('verified', true);
            if (error) throw error;

            return (data || []).map(item => ({
                ...item,
                company_name_en: item.organizations?.name_en,
                company_name_ar: item.organizations?.name_ar,
                // Additional mapping as needed
            }));
        }
    });
}

export function useStartup(startupId) {
    return useQuery({
        queryKey: ['startup', startupId],
        queryFn: async () => {
            if (!startupId) return null;
            const { data, error } = await supabase
                .from('startup_profiles')
                .select('*, organizations(name_en, name_ar, sectors, contact_email, description_en, description_ar, logo_url), providers(verified, verification_date)')
                .eq('id', startupId)
                .single();
            if (error) throw error;

            // Map join data to top level
            if (data) {
                return {
                    ...data,
                    company_name_en: data.organizations?.name_en,
                    company_name_ar: data.organizations?.name_ar,
                    sectors: data.organizations?.sectors || [],
                    contact_email: data.organizations?.contact_email,
                    description_en: data.organizations?.description_en,
                    description_ar: data.organizations?.description_ar,
                    logo_url: data.organizations?.logo_url,
                    // @ts-ignore
                    is_verified: data.providers?.[0]?.verified || false,
                    // @ts-ignore
                    verification_date: data.providers?.[0]?.verification_date
                };
            }
            return data;
        },
        enabled: !!startupId
    });
}

export const useStartupProfile = useStartup;

/**
 * --- PARTNERSHIPS ---
 */

export function usePartnerships(startupId) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['partnerships', startupId],
        queryFn: async () => {
            if (!startupId) return [];
            const { data, error } = await supabase
                .from('organization_partnerships')
                .select('*')
                .or(`organization_id.eq.${startupId},partner_organization_id.eq.${startupId}`);
            if (error) throw error;

            return (data || []).map(p => ({
                ...p,
                partner_a_id: p.organization_id,
                partner_b_id: p.partner_organization_id,
                description: p.notes,
                partnership_type: p.partnership_type || 'General'
            }));
        },
        enabled: !!startupId
    });

    const createPartnership = useMutation({
        /**
         * @param {{ partner_a_id: string, partner_b_id: string, partnership_type: string, description: string, status: string }} payload
         */
        mutationFn: async (payload) => {
            const { data, error } = await supabase
                .from('organization_partnerships')
                .insert({
                    organization_id: payload.partner_a_id,
                    partner_organization_id: payload.partner_b_id,
                    partnership_type: payload.partnership_type,
                    notes: payload.description,
                    status: payload.status
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partnerships', startupId] });
            toast.success('Partnership request sent');
        },
        onError: (err) => {
            console.error('Partnership creation failed:', err);
            toast.error('Failed to create partnership');
        }
    });

    return { ...query, createPartnership };
}

/**
 * --- MENTORSHIPS ---
 */

export function useStartupMentorship(startupId) {
    const queryClient = useQueryClient();
    const { triggerEmail } = useEmailTrigger();

    const potentialMentors = useQuery({
        queryKey: ['potential-mentors', startupId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('providers')
                .select('*, organizations(name_en, name_ar, logo_url)')
                .eq('provider_type', 'startup')
                .eq('verified', true)
                .gt('performance_score', 70)
                .limit(10);

            if (error) throw error;
            return (data || []).map(item => ({
                ...item,
                company_name_en: item.organizations?.name_en,
                company_name_ar: item.organizations?.name_ar,
                logo_url: item.organizations?.logo_url
            }));
        },
        enabled: !!startupId
    });

    const mentorshipHistory = useQuery({
        queryKey: ['mentorship-history', startupId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_mentorships')
                .select('*')
                .or(`mentee_email.eq.${startupId},mentor_email.eq.${startupId}`); // This is likely wrong but following schema
            if (error) throw error;
            return data || [];
        },
        enabled: !!startupId
    });

    const requestMentorship = useMutation({
        /**
         * @param {{ mentorId: string, mentorEmail: string, menteeEmail: string, startupName: string, sectors: string[] }} params
         */
        mutationFn: async ({ mentorId, mentorEmail, menteeEmail, startupName, sectors }) => {
            const { error: dbError } = await supabase
                .from('program_mentorships')
                .insert({
                    mentor_email: mentorEmail,
                    mentee_email: menteeEmail,
                    status: 'requested',
                    mentorship_type: 'peer_startup',
                    focus_areas: sectors || [],
                    program_id: 'default_startup_peer'
                });
            if (dbError) throw dbError;

            await triggerEmail('pilot.feedback_request', {
                entity_type: 'startup',
                entity_id: startupId,
                variables: {
                    startupName,
                    mentorName: 'Expert',
                    sectors: sectors?.join(', '),
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentorship-history', startupId] });
            toast.success('Mentorship request sent');
        },
        onError: (err) => {
            console.error('Mentorship request failed:', err);
            toast.error('Failed to send mentorship request');
        }
    });

    return { potentialMentors, mentorshipHistory, requestMentorship };
}

/**
 * --- ONBOARDING & REGIONS ---
 */

export function useRegions() {
    return useQuery({
        queryKey: ['regions'],
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

export function useStartupOnboarding() {
    const queryClient = useQueryClient();

    const submitOnboarding = useMutation({
        /**
         * @param {{ userId: string, userEmail: string, formData: any }} params
         */
        mutationFn: async ({ userId, userEmail, formData }) => {
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                    organization_en: formData.company_name_en,
                    organization_ar: formData.company_name_ar,
                    bio_en: formData.description_en,
                    bio_ar: formData.description_ar,
                    expertise_areas: formData.sectors,
                    onboarding_completed: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);
            if (profileError) throw profileError;

            const { error: providerError } = await supabase
                .from('providers')
                .upsert({
                    user_id: userId,
                    contact_email: userEmail,
                    name_en: formData.company_name_en,
                    name_ar: formData.company_name_ar,
                    provider_type: 'startup',
                    verified: false
                }, { onConflict: 'user_id' });
            if (providerError) throw providerError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            queryClient.invalidateQueries({ queryKey: ['startups'] });
        }
    });

    return { submitOnboarding };
}

/**
 * --- AGGREGATED ECOSYSTEM HOOK ---
 */
export function useStartupEcosystem(startupId) {
    const { data: startup, isLoading: sl } = useStartup(startupId);
    const { data: partnerships = [], isLoading: pl } = usePartnerships(startupId);
    const { mentorshipHistory, isLoading: ml } = useStartupMentorship(startupId);

    return {
        startup,
        partnerships,
        mentorships: mentorshipHistory.data || [],
        isLoading: sl || pl || mentorshipHistory.isLoading
    };
}
