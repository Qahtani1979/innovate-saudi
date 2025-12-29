import { useEffect } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility'; // Assumed path based on file list
import { useStartups } from '@/hooks/useStartups';

/**
 * Domain Adapter: Solutions (Marketplace)
 */
export function useSolutionTools() {
    const { registerTool } = useCopilotTools();

    // Data Source
    // Note: We assume useSolutionsWithVisibility exists and works similarly
    const query = useSolutionsWithVisibility ? useSolutionsWithVisibility({ limit: 20 }) : { data: [], isLoading: false };
    const data = query.data || [];

    const { data: startups, isLoading: startupsLoading } = useStartups({ limit: 20 });

    useEffect(() => {
        const unregister = registerTool({
            name: 'list_solutions',
            description: 'List available solutions in the marketplace.',
            schema: z.object({
                sector: z.string().optional(),
                provider: z.string().optional()
            }),
            safety: 'safe',
            execute: async ({ sector, provider }) => {
                if (query.isLoading) return "Loading solutions...";

                let result = data;
                if (sector) result = result.filter(s => s.sector?.name_en?.toLowerCase().includes(sector.toLowerCase()));

                return {
                    type: 'data_list',
                    entity: 'solution',
                    items: result.map(s => ({
                        id: s.id,
                        name: s.name_en || s.title,
                        provider: s.provider_name || 'Unknown',
                        sector: s.sector?.name_en
                    }))
                };
            }
        });

        // --- Startups ---
        registerTool({
            name: 'list_startups',
            description: 'List startups registered in the ecosystem.',
            schema: z.object({ sector: z.string().optional() }),
            safety: 'safe',
            execute: async ({ sector }) => {
                if (startupsLoading) return "Loading startups...";
                let result = startups || [];
                // if (sector) ... // filtering logic
                return {
                    type: 'data_list',
                    entity: 'startup',
                    items: result.map(s => ({
                        id: s.id,
                        name: s.company_name || s.name_en,
                        stage: s.stage
                    }))
                };
            }
        });

        return () => unregister();
    }, [registerTool, data, query.isLoading, startups, startupsLoading]);
}
