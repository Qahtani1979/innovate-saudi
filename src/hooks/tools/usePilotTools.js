import { useEffect } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { usePilotMutations } from '@/hooks/usePilotMutations';

/**
 * Domain Adapter: Pilot Logic
 */
export function usePilotTools() {
    const { registerTool } = useCopilotTools();
    const { createPilot } = usePilotMutations();

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
}
