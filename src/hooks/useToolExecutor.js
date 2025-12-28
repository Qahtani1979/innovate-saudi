import { useNavigate } from 'react-router-dom';
import { usePilotMutations } from '@/hooks/usePilotMutations';
import { useToast } from '@/hooks/use-toast';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { TOOL_REGISTRY } from '@/lib/ai/tools/registry';

/**
 * The Bridge between "Intent" (Registry) and "Action" (Hooks).
 * This hook is consumed by the Orchestrator/Provider.
 */
export function useToolExecutor() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { createPilot } = usePilotMutations(); // Ensure you have this hook
    const store = useCopilotStore();

    /**
     * core execution function
     */
    const executeTool = async (toolName, args) => {
        const toolDef = TOOL_REGISTRY[toolName];
        if (!toolDef) throw new Error(`Unknown tool: ${toolName}`);

        console.log(`[Executor] Running ${toolName}`, args);

        try {
            let result;

            switch (toolName) {
                // --- Navigation ---
                case 'navigate':
                    navigate(args.path);
                    result = { success: true, message: `Navigated to ${args.path}` };
                    break;

                // --- Pilots ---
                case 'create_pilot':
                    // This is an async mutation
                    result = await createPilot.mutateAsync(args);
                    break;

                // --- Analysis ---
                case 'analyze_data':
                    // Mock for now, Phase 3 will make this real
                    await new Promise(r => setTimeout(r, 1000));
                    result = { analysis: "Deep analysis complete. (Mock)", data: args };
                    break;

                default:
                    throw new Error(`No execution handler for ${toolName}`);
            }

            // Success Handler
            store.completeAction(result);
            toast({ title: "Action Completed", description: `Successfully ran ${toolName}` });
            return result;

        } catch (error) {
            console.error(`[Executor] Error in ${toolName}:`, error);
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
     * Safety Wrapper: Checks confirmation logic
     */
    const requestExecution = (toolName, args) => {
        const toolDef = TOOL_REGISTRY[toolName];

        if (toolDef?.safety === 'unsafe') {
            // Pause and ask UI
            store.requestConfirmation({ name: toolName, args });
            return { status: 'pending_confirmation' };
        } else {
            // Execute immediately
            store.setToolStatus('executing');
            return executeTool(toolName, args);
        }
    };

    return {
        executeTool,
        requestExecution
    };
}
