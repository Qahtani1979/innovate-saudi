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
     * Constructs the System Prompt based on available tools.
     * This defines the "Persona" and "Capabilities" of the AI.
     */
    buildSystemPrompt(tools = []) {
        const toolDefinitions = tools.map(t => ({
            name: t.name,
            description: t.description,
            parameters: t.schema ? "See Zod Schema" : {} // In a real system, we'd convert Zod to JSON Schema here
        }));

        return `
You are the Super Copilot for the Innovate Saudi Ecosystem.
You have access to the following tools:
${JSON.stringify(toolDefinitions, null, 2)}

Protocol:
1. If the user asks to do something supported by a tool, you MUST reply with a JSON tool call block.
2. Format: \`\`\`json { "tool": "tool_name", "args": { ... } } \`\`\`
3. If information is missing, use the 'update_context' tool to gather it progressively.
4. If no tool matches, answer helpfully using your knowledge.
        `.trim();
    }

    /**
     * Robust JSON Parser
     */
    parseToolCall(text) {
        try {
            // 1. Try Code Block regex
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) return JSON.parse(jsonMatch[1]);

            // 2. Try raw JSON (if model forgot markdown)
            if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
                return JSON.parse(text);
            }

            return null;
        } catch (e) {
            console.warn("[Orchestrator] Failed to parse JSON:", e);
            return null;
        }
    }

    /**
     * Main Entry Point
     */
    async processMessage(userMessage, systemContext) {
        const store = getStore();
        store.setIsThinking(true);

        try {
            // 1. Prepare Prompt
            const tools = systemContext?.tools || [];
            const systemPrompt = this.buildSystemPrompt(tools);

            // 2. Call AI (Real or Mock)
            let aiResponseText = "";
            if (this.caller) {
                // Pass system prompt + user message to the hook/caller
                const result = await this.caller({
                    system: systemPrompt,
                    user: userMessage,
                    tools: tools // Some callers might support native function calling
                });
                aiResponseText = typeof result === 'string' ? result : (result.message || JSON.stringify(result));
            } else {
                // Fallback Mock (Dev Mode) - Dynamic Discovery
                const lowerMsg = userMessage.toLowerCase();

                // 1. Try to find a matching tool in the Dynamic Registry
                // Simple heuristic: if message contains "list sectors", look for "list_sectors"
                const matchedTool = tools.find(t => {
                    const keywords = t.name.split('_'); // [list, sectors]
                    return keywords.every(k => lowerMsg.includes(k));
                });

                if (matchedTool) {
                    console.log("[Orchestrator] Mock found dynamic tool:", matchedTool.name);
                    aiResponseText = `\`\`\`json\n{ "tool": "${matchedTool.name}", "args": {} }\n\`\`\``;
                }
                // 2. Hardcoded fallback for Create Pilot (since it needs args)
                else if (lowerMsg.includes('create') && lowerMsg.includes('pilot')) {
                    aiResponseText = '```json\n{ "tool": "create_pilot", "args": { "title": "New Pilot", "sector": "Recycling" } }\n```';
                }
                // 3. Mock for Update Context
                else if (lowerMsg.includes('update') || lowerMsg.includes('set title')) {
                    aiResponseText = '```json\n{ "tool": "update_context", "args": { "entityType": "pilot", "data": { "title": "Mock Pilot Title" } } }\n```';
                }
                else if (lowerMsg.includes('navigate')) {
                    aiResponseText = '```json\n{ "tool": "navigate", "args": { "path": "/dashboard" } }\n```';
                }
                else {
                    aiResponseText = "I am the Orchestrator. (AI Link Disconnected). I have access to: " + tools.map(t => t.name).join(", ");
                }
            }

            // 3. Parse & Execute
            const toolCall = this.parseToolCall(aiResponseText);

            if (toolCall) {
                if (this.executor) {
                    return this.executor(toolCall.tool, toolCall.args);
                } else {
                    console.error("[Orchestrator] Executor not set!");
                }
            }

            // 4. Return Text Response
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
