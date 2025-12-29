import { useEffect } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { useSectors } from '@/hooks/useSectors';
import { useRegions } from '@/hooks/useRegions';
import { useCities } from '@/hooks/useCities';
import { useTaxonomyData } from '@/hooks/useTaxonomyData';

/**
 * Domain Adapter: Reference Data
 * Bridges 'useSectors' hook to Copilot Registry.
 */
export function useReferenceDataTools() {
    const { registerTool } = useCopilotTools();
    const { data: sectors } = useSectors();
    const { data: regions } = useRegions();
    const { data: cities } = useCities();
    // Assuming taxonomy hook structure, or fetching specific type
    const { data: taxonomy } = useTaxonomyData();

    useEffect(() => {
        // --- Sectors ---
        registerTool({
            name: 'list_sectors',
            description: 'List all available industry and government sectors.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                return {
                    type: 'data_list',
                    entity: 'sector',
                    items: sectors || []
                };
            }
        });

        // --- Regions ---
        registerTool({
            name: 'list_regions',
            description: 'List geographic regions.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                return {
                    type: 'data_list',
                    entity: 'region',
                    items: (regions || []).map(r => ({ id: r.id, name: r.name_en }))
                };
            }
        });

        // --- Cities ---
        registerTool({
            name: 'list_cities',
            description: 'List cities within regions.',
            schema: z.object({ region_id: z.string().optional() }),
            safety: 'safe',
            execute: async ({ region_id }) => {
                let result = cities || [];
                if (region_id) result = result.filter(c => c.region_id === region_id);
                return {
                    type: 'data_list',
                    entity: 'city',
                    items: result.map(c => ({ id: c.id, name: c.name_en, region: c.region?.name_en }))
                };
            }
        });

        // --- Taxonomy (Dynamic Classification) ---
        registerTool({
            name: 'list_taxonomy',
            description: 'List classification tags and types.',
            schema: z.object({ type: z.string().optional() }),
            safety: 'safe',
            execute: async ({ type }) => {
                // taxonomy is an object { domains: [], tags: [], ... }
                // We default to displaying 'domains' or 'tags'
                const items = taxonomy?.domains || [];

                return {
                    type: 'data_list',
                    entity: 'taxonomy',
                    items: items.map(t => ({ id: t.id, name: t.name_en, type: 'domain' }))
                };
            }
        });

    }, [registerTool, sectors, regions, cities, taxonomy]);
}
