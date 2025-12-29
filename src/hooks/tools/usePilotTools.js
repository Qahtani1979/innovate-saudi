import { useEffect } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { usePilotMutations } from '@/hooks/usePilotMutations';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';

/**
 * Domain Adapter: Pilot Logic
 */
export function usePilotTools() {
    const { registerTool } = useCopilotTools();
    const { createPilot } = usePilotMutations();

    const { data: pilots, isLoading } = usePilotsWithVisibility({ limit: 20 }); // Requires manual import

    // Helper: Register Create
    useEffect(() => {
        const unregister = registerTool({
            name: 'create_pilot',
            description: 'Create a new pilot project in the database.',
            schema: z.object({
                title: z.string().describe('The title of the new pilot'),
                sector: z.string().describe('The sector (e.g., Environment, Transport)'),
                description: z.string().optional().describe('Brief description of the pilot')
            }),
            safety: 'unsafe',
            execute: async (args) => {
                return await createPilot.mutateAsync(args);
            }
        });
        return () => unregister();
    }, [registerTool, createPilot]);

    // Helper: Register List
    useEffect(() => {
        const unregister = registerTool({
            name: 'list_pilots',
            description: 'List existing pilot projects and their status.',
            schema: z.object({
                sector: z.string().optional(),
                status: z.string().optional()
            }),
            safety: 'safe',
            execute: async ({ sector, status }) => {
                if (isLoading) return "Loading pilots...";
                let result = pilots || [];
                // Simple client filtering for MVP
                if (sector) result = result.filter(p => p.sector?.name_en?.toLowerCase().includes(sector.toLowerCase()));
                if (status) result = result.filter(p => p.status === status);

                return {
                    type: 'data_list',
                    entity: 'pilot',
                    items: result.map(p => ({
                        id: p.id,
                        name: p.title || p.name_en, // Handle API variance
                        sector: p.sector?.name_en,
                        status: p.status
                    }))
                };
            }
        });
        return () => unregister();
    }, [registerTool, pilots, isLoading]);
}
