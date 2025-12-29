import { useEffect } from 'react';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { z } from 'zod';

export function useChallengeTools() {
    const { registerTool } = useCopilotTools();

    // We can fetch "all" or filtered. 
    // For the tool, we want to allow the AI to search.
    // However, hooks rule: hooks must be top level.
    // So we use the hook to get the *fetcher* or we treat the hook data as the source.
    // Since useChallengesWithVisibility is a useQuery, we can use it to fetch "all" (limit 20) for the context
    // OR we can wrap the fetcher.

    // Better approach for Tools: The executor calls the tool, the tool calls a function.
    // But we are in a hook. We have access to the data *if* we call the hook.

    const { data: challenges, isLoading } = useChallengesWithVisibility({
        limit: 20,
        publishedOnly: true
    });

    useEffect(() => {
        registerTool({
            name: 'list_challenges',
            description: 'List available innovation challenges in the ecosystem. Returns active challenges with their sectors and municipalities.',
            schema: z.object({
                sector: z.string().optional().describe('Filter by sector name (e.g. Housing, Municipal)'),
                status: z.enum(['active', 'completed', 'open']).optional()
            }),
            execute: async ({ sector, status }) => {
                // In a perfect world, we'd trigger a refetch with these params.
                // For MVP, we filter the *already loaded* data or trigger a new fetch?
                // Given the architecture in `useToolExecutor`, we might want to just return the data we have
                // OR allow the executor to call a function.

                // Since this hook runs in the Component (Console), `challenges` is available.
                // We'll return the client-side data for now (fastest).

                if (isLoading) return "Loading challenges...";

                let result = challenges || [];

                if (sector) {
                    result = result.filter(c => c.sector?.name_en?.toLowerCase().includes(sector.toLowerCase()));
                }
                if (status) {
                    result = result.filter(c => c.status === status);
                }

                return {
                    type: 'data_list',
                    entity: 'challenge',
                    items: result.map(c => ({
                        id: c.id,
                        name: c.title,
                        sector: c.sector?.name_en,
                        status: c.status
                    }))
                };
            }
        });

        // --- Tool: Create Challenge (Draft) ---
        registerTool({
            name: 'create_challenge',
            description: 'Create a new innovation challenge.',
            schema: z.object({
                title: z.string().describe('Title in English'),
                sector_id: z.string().optional().describe('Sector UUID'),
                description: z.string().optional()
            }),
            safety: 'unsafe',
            execute: async (args) => {
                // Return a draft proposal UI instead of direct write
                return {
                    type: 'confirmation_request',
                    message: `I can draft this challenge: "${args.title}".`,
                    payload: {
                        action: 'create_challenge',
                        data: { ...args, status: 'draft' }
                    }
                };
            }
        });
    }, [registerTool, challenges, isLoading]);
}
