import { useEffect } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { useCopilotStore } from '@/lib/store/copilotStore';

/**
 * Domain Adapter: Context Router
 * Registers tools for manipulating the progressive context draft.
 */
// --- 1. Entity Schemas (As per Design) ---
const ENTITY_SCHEMAS = {
    pilot: {
        fields: ['title', 'sector', 'description', 'beneficiaries', 'budget'],
        required: ['title', 'sector']
    },
    challenge: {
        fields: ['title', 'sector', 'problem_statement'],
        required: ['title', 'sector', 'problem_statement']
    }
};

/**
 * Domain Adapter: Context Router
 * Registers tools for manipulating the progressive context draft.
 */
export function useContextTools() {
    const { registerTool } = useCopilotTools();
    const store = useCopilotStore();

    useEffect(() => {
        const unregister = registerTool({
            name: 'update_context',
            description: 'Update the current draft context. Returns missing fields to guide next questions.',
            schema: z.object({
                entityType: z.enum(['pilot', 'challenge']).optional(),
                data: z.record(z.any()).describe("Key-value pairs to update in the draft"),
                reference: z.object({ type: z.string(), id: z.string() }).optional()
            }),
            safety: 'safe',
            execute: async (args) => {
                // 1. Update State (as before)
                if (args.entityType) store.setDraftType(args.entityType);
                if (args.data) store.updateDraft(args.data);
                if (args.reference) store.addReference(args.reference);

                // --- 2. Intelligent Analysis (Gap Fixed) ---
                // Get fresh state (optimistic merge for calculation)
                const currentDraft = store.contextDraft;
                const mergedData = { ...currentDraft.data, ...args.data };
                const type = args.entityType || currentDraft.type;

                let analysis = {};
                if (type && ENTITY_SCHEMAS[type]) {
                    const schema = ENTITY_SCHEMAS[type];
                    const presentKeys = Object.keys(mergedData);
                    const missing = schema.required.filter(k => !presentKeys.includes(k));

                    analysis = {
                        entity: type,
                        isValid: missing.length === 0,
                        missingFields: missing,
                        nextAction: missing.length === 0 ? 'SUGGEST_EXECUTION' : 'ASK_USER'
                    };
                }

                return {
                    success: true,
                    message: "Context updated",
                    draft: {
                        type,
                        data: mergedData,
                        analysis // Respond with intelligence
                    }
                };
            }
        });

        return () => unregister();
    }, [registerTool, store]);
}
