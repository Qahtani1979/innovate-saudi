import { useToast } from '@/hooks/use-toast';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';

/**
 * The Generic Tool Executor (Kernel Layer).
 * Decoupled from specific domain logic.
 * 
 * Responsibility:
 * 1. Lookup tool in Registry.
 * 2. Handle "Safety" (Confirmation).
 * 3. Execute & Report Status.
 */
export function useToolExecutor() {
    const { toast } = useToast();
    const store = useCopilotStore();
    const { getTool } = useCopilotTools();

    /**
     * Core execution logic
     */
    const executeTool = async (toolName, args, onProgress) => {
        console.log('[Executor] Executing:', toolName, args);
        const tool = getTool(toolName);

        if (!tool) {
            const error = new Error(`Tool '${toolName}' not found in registry.Ensure the Feature Plugin is loaded.`);
            store.reportError(error);
            throw error;
        }

        try {
            // Gap Fix: Schema Validation
            if (tool.schema) {
                // Zod parse will throw if invalid
                tool.schema.parse(args);
            }

            // Execute Implementation
            // Gap Fix: Streaming (pass onProgress if tool supports it)
            const result = await tool.execute(args, onProgress);

            // Success Handler
            store.completeAction(result);

            // Optional: Toast for visibility
            if (!result.silent) {
                toast({ title: "Completed", description: `Executed ${tool.description} ` });
            }

            return result;

        } catch (error) {
            console.error(`[Executor] Error in ${toolName}: `, error);
            store.reportError(error);
            toast({
                title: "Action Failed",
                description: error.message,
                variant: 'destructive'
            });
            throw error;
        }
    };

    /**
     * Safety Wrapper
     */
    const requestExecution = (toolName, args) => {
        console.log('[Executor] Requesting execution for:', toolName, args);
        const tool = getTool(toolName);

        // If tool is missing, we fail fast (or let execute catch it)
        if (!tool) return executeTool(toolName, args);

        if (tool.safety === 'unsafe') {
            console.log('[Executor] Tool unsafe requiring confirmation:', toolName);
            store.requestConfirmation({ name: toolName, args });
            return { status: 'pending_confirmation' };
        } else {
            return executeTool(toolName, args);
        }
    };

    return {
        executeTool,
        requestExecution
    };
}
