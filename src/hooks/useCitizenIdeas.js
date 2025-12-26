import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export { useIdeaConversion } from './useCitizenIdeaMutations';

/**
 * Hook for managing citizen ideas (Queries only)
 * ✅ GOLD STANDARD COMPLIANT
 * Mutations moved to useCitizenIdeaMutations.js
 */
export function useCitizenIdeasQuery(options = {}) {
    const { municipalityId, status = 'all', limit = 1000, citizenEmail } = options;

    return useQuery({
        queryKey: ['citizen-ideas', { municipalityId, status, limit, citizenEmail }],
        queryFn: async () => {
            let query = supabase
                .from('citizen_ideas')
                .select('*')
                .order('created_at', { ascending: false });

            if (municipalityId) {
                query = query.eq('municipality_id', municipalityId);
            }

            if (citizenEmail) {
                // @ts-ignore - Type instantiation deep
                query = query.eq('citizen_email', citizenEmail);
            }

            if (status !== 'all') {
                query = query.eq('status', status);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook for fetching a single citizen idea
 */
export function useSingleCitizenIdea(id) {
    return useQuery({
        queryKey: ['citizen-idea', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('citizen_ideas')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}

/**
 * Hook for fetching user's own ideas
 */
export function useMyCitizenIdeas(userId) {
    return useQuery({
        queryKey: ['my-citizen-ideas', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('citizen_ideas')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!userId
    });
}

import { useCitizenIdeaMutations } from './useCitizenIdeaMutations';

export const useCitizenIdeaActions = useCitizenIdeaMutations;

export const useIdea = useSingleCitizenIdea;
export const useIdeaMutations = useCitizenIdeaMutations;

export function useVoteOnIdea() {
    const { voteOnIdea } = useCitizenIdeaMutations();
    return voteOnIdea;
}

export function useCitizenIdeas(options = {}) {
    const ideas = useCitizenIdeasQuery(options);
    const { updateIdea, submitIdea, deleteIdea } = useCitizenIdeaMutations();

    return {
        ideas,
        updateIdea,
        submitIdea,
        deleteIdea
    };
}


