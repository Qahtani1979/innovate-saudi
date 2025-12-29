import { z } from 'zod';
import { pilotPrompts } from '../prompts/ecosystem/pilotPrompts';

/**
 * The Central Registry for Agent Tools.
 * Maps "Intent" (Prompt Output) -> "Execution Metadata".
 * 
 * Note: This file is STATIC. It does not contain code execution logic.
 * The logic is in `useToolExecutor.js`.
 */

export const TOOL_REGISTRY = {
    // 1. Navigation (Safe)
    'navigate': {
        description: 'Navigate to a specific page or dashboard.',
        schema: z.object({
            path: z.string().describe('The URL path to navigate to (e.g., /dashboard, /pilots/create)'),
            reason: z.string().optional().describe('Why we are navigating there')
        }),
        safety: 'safe'
    },

    // 2. Pilot Management (Unsafe)
    'create_pilot': {
        description: 'Create a new pilot project in the database.',
        schema: z.object({
            title: z.string().describe('The title of the new pilot'),
            sector: z.string().describe('The sector (e.g., Environment, Transport)'),
            description: z.string().optional().describe('Brief description of the pilot')
        }),
        safety: 'unsafe',
        confirmationMessage: (args) => `Are you sure you want to create a new pilot titled "${args.title}"?`
    },

    // 3. Analysis (Safe)
    'analyze_data': {
        description: 'Run a deep analysis on specific data points.',
        schema: z.object({
            query: z.string(),
            contextIds: z.array(z.string()).optional()
        }),
        safety: 'safe'
    },

    // 4. Reference Data (Safe)
    'list_sectors': {
        description: 'List all available industry and government sectors.',
        schema: z.object({}), // No args needed
        safety: 'safe'
    }
};
