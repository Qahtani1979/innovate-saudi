import { TOOL_REGISTRY } from '@/lib/ai/tools/registry';
import { useCopilotStore } from '@/lib/store/copilotStore';

// Access store outside of React Component
const getStore = () => useCopilotStore.getState();

/**
 * The Brain of the Operation.
 * 
 * Flow:
 * 1. receives (text, context)
 * 2. calls LLM (via your existing useAI or direct API if we move to server actions)
 * 3. parses response
 * 4. if Tool Call -> Checks Registry -> Checks Safety -> Returns Instruction
 */
export class CopilotOrchestrator {

    constructor(aiClient) {
        this.ai = aiClient;
        this.executor = null; // func(toolName, args, outputHandler)
    }

    setExecutor(fn) {
        this.executor = fn;
    }

    setCaller(fn) {
        this.caller = fn;
    }

    /**
     * Main Entry Point
     */
    async processMessage(userMessage, systemContext) {
        const store = getStore();
        store.setIsThinking(true);

        try {
            // REAL AI CALL
            let aiResponseText = "";

            if (this.caller) {
                // Call the LLM
                const result = await this.caller(userMessage, systemContext);
                // The result from useAIWithFallback might be complex, assuming text for now:
                aiResponseText = typeof result === 'string' ? result : JSON.stringify(result);
            } else {
                // Fallback Mock (Dev Mode)
                if (userMessage.includes('create pilot')) aiResponseText = '```json\n{ "tool": "create_pilot", "args": { "title": "New Pilot", "sector": "Recycling" } }\n```';
                else if (userMessage.includes('navigate')) aiResponseText = '```json\n{ "tool": "navigate", "args": { "path": "/dashboard" } }\n```';
                else aiResponseText = "I am the Orchestrator. (AI Link Disconnected)";
            }

            // Parse for Tool Calls (Simple JSON Extraction)
            const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/);

            if (jsonMatch) {
                try {
                    const toolCall = JSON.parse(jsonMatch[1]);
                    if (this.executor) {
                        return this.executor(toolCall.tool, toolCall.args);
                    }
                } catch (e) {
                    console.error("Failed to parse tool call", e);
                }
            }

            // Default: Just chat
            store.setIsThinking(false);
            return {
                type: 'text',
                content: aiResponseText.replace(/```json[\s\S]*?```/g, '').trim() || aiResponseText
            };

        } catch (error) {
            store.reportError(error);
            return { type: 'error', content: error.message };
        }
    }

    /**
     * Deprecated: Logic moved to useToolExecutor hook to be closer to context
     */
    handleToolDiscovery(toolName, args) {
        // ...
    }
}

export const orchestrator = new CopilotOrchestrator(null);
