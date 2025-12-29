import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';

/**
 * Domain Adapter: Navigation
 * Registers tools for page navigation.
 */
export function useNavigationTools() {
    const { registerTool } = useCopilotTools();
    const navigate = useNavigate();

    useEffect(() => {
        const unregister = registerTool({
            name: 'navigate',
            description: 'Navigate to a specific page or dashboard path.',
            schema: z.object({
                path: z.string().describe('The URL path to navigate to (e.g., /dashboard, /pilots/create)'),
                reason: z.string().optional().describe('Why we are navigating there')
            }),
            safety: 'safe',
            execute: async ({ path, reason }) => {
                navigate(path);
                return {
                    success: true,
                    message: `Navigated to ${path}. ${reason || ''}`
                };
            }
        });

        return () => unregister();
    }, [registerTool, navigate]);
}
