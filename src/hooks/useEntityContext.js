/**
 * useEntityContext Hook
 * 
 * Manages entity focus for Copilot conversations.
 * Handles fetching, deep-linking, and context injection.
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { useLanguage } from '@/components/LanguageContext';
import {
    ENTITY_TYPES,
    parseEntityCommand,
    stripEntityCommand,
    buildEntityContextPrompt,
    parseDeepLinkParams
} from '@/lib/copilot/entityContext';

/**
 * Main hook for entity context management
 */
export function useEntityContext() {
    const { language } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const { focusEntity, setFocusEntity, clearFocusEntity } = useCopilotStore();

    // Handle deep link on mount
    useEffect(() => {
        const deepLink = parseDeepLinkParams(searchParams);
        if (deepLink && !focusEntity?.id) {
            // Fetch and set entity from deep link
            fetchAndSetEntity(deepLink.entityType, deepLink.entityId);
        }
    }, [searchParams]);

    // Fetch entity data
    const fetchAndSetEntity = useCallback(async (entityType, entityId) => {
        const config = ENTITY_TYPES[entityType];
        if (!config) {
            console.warn(`Unknown entity type: ${entityType}`);
            return;
        }

        try {
            const { data, error } = await supabase
                .from(config.table)
                .select('*')
                .eq(config.idField, entityId)
                .single();

            if (error) throw error;

            setFocusEntity({
                type: entityType,
                id: entityId,
                data
            });

            // Update URL without navigation
            setSearchParams({ entity: entityType, id: entityId }, { replace: true });
        } catch (err) {
            console.error('Failed to fetch entity:', err);
        }
    }, [setFocusEntity, setSearchParams]);

    // Process message for entity commands
    const processMessage = useCallback((message) => {
        const command = parseEntityCommand(message);
        
        if (command?.clear) {
            clearFocusEntity();
            setSearchParams({}, { replace: true });
            return { processed: true, cleanMessage: '' };
        }

        if (command?.entityType && command?.entityId) {
            fetchAndSetEntity(command.entityType, command.entityId);
            const cleanMessage = stripEntityCommand(message);
            return { processed: true, cleanMessage };
        }

        return { processed: false, cleanMessage: message };
    }, [fetchAndSetEntity, clearFocusEntity, setSearchParams]);

    // Build context prompt injection
    const contextPrompt = useMemo(() => {
        return buildEntityContextPrompt(focusEntity, language);
    }, [focusEntity, language]);

    // Clear context and URL
    const clearContext = useCallback(() => {
        clearFocusEntity();
        setSearchParams({}, { replace: true });
    }, [clearFocusEntity, setSearchParams]);

    return {
        focusEntity,
        setFocusEntity: fetchAndSetEntity,
        clearContext,
        processMessage,
        contextPrompt,
        hasFocus: !!focusEntity?.type
    };
}

/**
 * Hook to fetch recent entities for selector
 */
export function useRecentEntities(limit = 5) {
    const { language } = useLanguage();

    // Fetch recent challenges
    const { data: challenges = [] } = useQuery({
        queryKey: ['recent-challenges', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('id, title_en, title_ar, status, sector')
                .order('updated_at', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data.map(c => ({ ...c, _type: 'challenge' }));
        },
        staleTime: 1000 * 60 * 5
    });

    // Fetch recent pilots
    const { data: pilots = [] } = useQuery({
        queryKey: ['recent-pilots', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('id, title_en, title_ar, status, stage')
                .order('updated_at', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data.map(p => ({ ...p, _type: 'pilot' }));
        },
        staleTime: 1000 * 60 * 5
    });

    // Fetch recent solutions
    const { data: solutions = [] } = useQuery({
        queryKey: ['recent-solutions', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('solutions')
                .select('id, name_en, name_ar, workflow_stage')
                .order('updated_at', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data.map(s => ({ ...s, _type: 'solution', status: s.workflow_stage }));
        },
        staleTime: 1000 * 60 * 5
    });

    // Fetch recent programs
    const { data: programs = [] } = useQuery({
        queryKey: ['recent-programs', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('id, name_en, name_ar, status')
                .order('updated_at', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data.map(p => ({ ...p, _type: 'program' }));
        },
        staleTime: 1000 * 60 * 5
    });

    const allEntities = useMemo(() => {
        return [...challenges, ...pilots, ...solutions, ...programs];
    }, [challenges, pilots, solutions, programs]);

    const isLoading = false; // All queries run in parallel

    return { entities: allEntities, isLoading };
}

/**
 * Hook to search entities by query
 */
export function useEntitySearch(query, entityTypes = ['challenge', 'pilot', 'solution']) {
    const { language } = useLanguage();
    const titleField = language === 'ar' ? 'title_ar' : 'title_en';
    const nameField = language === 'ar' ? 'name_ar' : 'name_en';

    return useQuery({
        queryKey: ['entity-search', query, entityTypes],
        queryFn: async () => {
            if (!query || query.length < 2) return [];

            const results = [];

            // Search challenges
            if (entityTypes.includes('challenge')) {
                const { data } = await supabase
                    .from('challenges')
                    .select('id, title_en, title_ar, status')
                    .or(`title_en.ilike.%${query}%,title_ar.ilike.%${query}%`)
                    .limit(5);
                if (data) results.push(...data.map(c => ({ ...c, _type: 'challenge' })));
            }

            // Search pilots
            if (entityTypes.includes('pilot')) {
                const { data } = await supabase
                    .from('pilots')
                    .select('id, title_en, title_ar, status')
                    .or(`title_en.ilike.%${query}%,title_ar.ilike.%${query}%`)
                    .limit(5);
                if (data) results.push(...data.map(p => ({ ...p, _type: 'pilot' })));
            }

            // Search solutions
            if (entityTypes.includes('solution')) {
                const { data } = await supabase
                    .from('solutions')
                    .select('id, name_en, name_ar, workflow_stage')
                    .or(`name_en.ilike.%${query}%,name_ar.ilike.%${query}%`)
                    .limit(5);
                if (data) results.push(...data.map(s => ({ ...s, _type: 'solution', status: s.workflow_stage })));
            }

            return results;
        },
        enabled: query?.length >= 2,
        staleTime: 1000 * 30
    });
}
