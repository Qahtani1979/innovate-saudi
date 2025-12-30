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
     * @param {string} message - User message
     * @param {Object} systemContext - Context object with tools, systemPrompt, messages
     */
    async processMessage(message, systemContext = {}) {
        console.log('[Orchestrator] Processing message:', message);
        console.log('[Orchestrator] Context:', systemContext);

        const store = getStore();
        store.setIsThinking(true);

        try {
            // 1. Prepare Prompt - use provided context
            const tools = systemContext?.tools || [];
            // Use externally provided prompt OR build default
            const systemPrompt = systemContext?.systemPrompt || this.buildSystemPrompt(tools);

            // 2. Call AI (Real or Mock)
            let aiResponseText = "";
            if (this.caller) {
                // Pass system prompt + user message to the hook/caller
                const result = await this.caller({
                    system: systemPrompt,
                    user: message,
                    tools: tools // Some callers might support native function calling
                });
                aiResponseText = typeof result === 'string' ? result : (result.message || JSON.stringify(result));
            } else {
                // Fallback Mock (Dev Mode) - Dynamic Discovery
                const lowerMsg = message.toLowerCase();

                // 1. Hardcoded fallback for Create Pilot (since it needs args)
                if (lowerMsg.includes('create') && lowerMsg.includes('pilot')) {
                    aiResponseText = '```json\n{ "tool": "create_pilot", "args": { "title": "New Pilot", "sector": "Recycling" } }\n```';
                }
                // 2. Mock for Update Context
                else if (lowerMsg.includes('update') || lowerMsg.includes('set title')) {
                    aiResponseText = '```json\n{ "tool": "update_context", "args": { "entityType": "pilot", "data": { "title": "Mock Pilot Title" } } }\n```';
                }
                else if (lowerMsg.includes('navigate')) {
                    aiResponseText = '```json\n{ "tool": "navigate", "args": { "path": "/dashboard" } }\n```';
                }
                // 3. Try to find a matching tool in the Dynamic Registry
                else {
                    const matchedTool = tools.find(t => {
                        const keywords = t.name.split('_');
                        return keywords.every(k => lowerMsg.includes(k));
                    });

                    if (matchedTool) {
                        console.log("[Orchestrator] Mock found dynamic tool:", matchedTool.name);
                        aiResponseText = `\`\`\`json\n{ "tool": "${matchedTool.name}", "args": {} }\n\`\`\``;
                    }
                    else {
                        // Provide a helpful response listing available tools
                        aiResponseText = tools.length > 0 
                            ? `I can help you with: ${tools.map(t => t.description).join(", ")}. What would you like to do?`
                            : "I'm ready to help! What would you like to do?";
                    }
                }
            }

            // 3. Parse & Execute
            const toolCall = this.parseToolCall(aiResponseText);

            if (toolCall && toolCall.tool) {
                console.log('[Orchestrator] Parsed tool call:', toolCall);
                if (this.executor) {
                    const result = await this.executor(toolCall.tool, toolCall.args);
                    store.setIsThinking(false);
                    return result;
                } else {
                    console.warn("[Orchestrator] Executor not set, returning tool call info");
                    store.setIsThinking(false);
                    return {
                        type: 'text',
                        content: `Tool "${toolCall.tool}" would be executed with args: ${JSON.stringify(toolCall.args)}`
                    };
                }
            }

            // 4. Return Text Response
            store.setIsThinking(false);
            return {
                type: 'text',
                content: aiResponseText.replace(/```json[\s\S]*?```/g, '').trim() || aiResponseText
            };

        } catch (error) {
            console.error('[Orchestrator] Error:', error);
            store.setIsThinking(false);
            store.reportError(error);
            return { 
                type: 'error', 
                content: error?.message || 'An unexpected error occurred. Please try again.'
            };
        }
    }
}

export const orchestrator = new CopilotOrchestrator(null);
