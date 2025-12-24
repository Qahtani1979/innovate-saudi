
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';

/**
 * Hook for global search functionality.
 * Fetches top matches from Challenges, Pilots, Solutions, and Programs.
 * 
 * @param {string} query - The search query term.
 * @param {Object} options - Use query options like enabled.
 */
export function useGlobalSearch(query, options = {}) {
    // Visibility check (optional, but good practice to ensure only active ecosystem content is shown)
    // For "Global Search", simpler might be better: just fetch visible content.
    // However, if we want to respect visibility rules stricly, we might filter. 
    // Given the previous Layout.jsx implementation did simple fetches, we will replicate that securely.

    // We utilize one useQuery for all concurrent fetches to manage loading state.
    return useQuery({
        queryKey: ['global-search', query],
        queryFn: async () => {
            if (!query || query.length < 2) return [];

            const [challenges, pilots, solutions, programs] = await Promise.all([
                supabase.from('challenges').select('id, title_en, title_ar').ilike('title_en', `%${query}%`).order('created_at', { ascending: false }).limit(3).then(res => res.data || []),
                supabase.from('pilots').select('id, title_en, title_ar').ilike('title_en', `%${query}%`).order('created_at', { ascending: false }).limit(3).then(res => res.data || []),
                supabase.from('solutions').select('id, name_en, name_ar').ilike('name_en', `%${query}%`).order('created_at', { ascending: false }).limit(3).then(res => res.data || []),
                supabase.from('programs').select('id, name_en, name_ar').ilike('name_en', `%${query}%`).order('created_at', { ascending: false }).limit(2).then(res => res.data || [])
            ]);

            return [
                ...challenges.map(c => ({ type: 'Challenge', name: c.title_en || c.title_ar, id: c.id, page: 'ChallengeDetail' })),
                ...pilots.map(p => ({ type: 'Pilot', name: p.title_en || p.title_ar, id: p.id, page: 'PilotDetail' })),
                ...solutions.map(s => ({ type: 'Solution', name: s.name_en || s.name_ar, id: s.id, page: 'SolutionDetail' })),
                ...programs.map(p => ({ type: 'Program', name: p.name_en || p.name_ar, id: p.id, page: 'ProgramDetail' }))
            ];
        },
        enabled: !!query && query.length >= 2,
        staleTime: 1000 * 60 * 1, // 1 minute cache for search results
        ...options
    });
}
