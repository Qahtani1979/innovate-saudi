import { useEffect } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';

/**
 * Domain Adapter: Programs
 */
export function useProgramTools() {
    const { registerTool } = useCopilotTools();

    // Data Source
    const { programs, isLoading } = useProgramsWithVisibility({ limit: 20 });
    // Note: older hook might return object, newer returns array directly in data property?
    // In `useProgramsWithVisibility.js`: returns `useQuery` object. 
    // const { data } = useProgramsWithVisibility()
    // Let's correct usage:
    const query = useProgramsWithVisibility({ limit: 20 });
    const data = query.data || [];

    useEffect(() => {
        const unregister = registerTool({
            name: 'list_programs',
            description: 'List innovation programs available for application.',
            schema: z.object({
                status: z.enum(['active', 'open', 'completed']).optional(),
                type: z.string().optional()
            }),
            safety: 'safe',
            execute: async ({ status, type }) => {
                if (query.isLoading) return "Loading programs...";

                let result = data;
                if (status) result = result.filter(p => p.status === status);
                if (type) result = result.filter(p => p.program_type === type);

                return {
                    type: 'data_list',
                    entity: 'program',
                    items: result.map(p => ({
                        id: p.id,
                        name: p.title_en || p.name_en || p.title,
                        status: p.status,
                        deadline: p.application_deadline
                    }))
                };
            }
        });

        // --- Tool: Create Program (Draft) ---
        registerTool({
            name: 'create_program',
            description: 'Create a new innovation program.',
            schema: z.object({
                title: z.string().describe('Program Title'),
                type: z.enum(['accelerator', 'incubator', 'grant']).describe('Program Type'),
                budget: z.number().optional()
            }),
            safety: 'unsafe',
            execute: async (args) => {
                return {
                    type: 'confirmation_request',
                    message: `I can draft this program: "${args.title}".`,
                    payload: {
                        action: 'create_program',
                        data: { ...args, status: 'draft' }
                    }
                };
            }
        });

        return () => unregister();
    }, [registerTool, data, query.isLoading]);
}
