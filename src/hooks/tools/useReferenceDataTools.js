import { useEffect } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { useSectors } from '@/hooks/useSectors';

/**
 * Domain Adapter: Reference Data
 * Bridges 'useSectors' hook to Copilot Registry.
 */
export function useReferenceDataTools() {
    const { registerTool } = useCopilotTools();
    const { data: sectors } = useSectors();

    useEffect(() => {
        // Register 'list_sectors'
        const unregister = registerTool({
            name: 'list_sectors',
            description: 'List all available industry and government sectors.',
            schema: z.object({}), // No args needed
            safety: 'safe',
            execute: async () => {
                // Return data directly from the hook (RBAC safe)
                return {
                    type: 'data_list', // Signal to UI
                    entity: 'sector',
                    items: sectors || []
                };
            }
        });

        return () => {
            unregister();
        };
    }, [registerTool, sectors]);
}
