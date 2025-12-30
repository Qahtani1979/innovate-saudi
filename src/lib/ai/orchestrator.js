import { useCopilotStore } from '@/lib/store/copilotStore';

// Access store outside of React Component
const getStore = () => useCopilotStore.getState();

/**
 * The Brain of the Operation.
 * 
 * Flow:
 * 1. receives (text, context)
 * 2. calls LLM (via your existing useAI or direct API if we move to server actions)
 * 3. parses response - now expecting structured JSON format
 * 4. if Tool Call -> Checks Registry -> Checks Safety -> Returns Instruction
 * 5. if Structured Response -> Returns sections for rich UI rendering
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
            parameters: t.schema ? "See Zod Schema" : {}
        }));

        return `
You are the Super Copilot for the Innovate Saudi Ecosystem.
You have access to the following tools:
${JSON.stringify(toolDefinitions, null, 2)}

Protocol:
1. If the user asks to do something supported by a tool, you MUST reply with a JSON tool call block.
2. Format: \`\`\`json { "tool": "tool_name", "args": { ... } } \`\`\`
3. If information is missing, use the 'update_context' tool to gather it progressively.
4. If no tool matches, answer helpfully using structured JSON format.
        `.trim();
    }

    /**
     * Parse structured response from LLM
     * Handles both tool calls and structured section responses
     */
    parseResponse(text) {
        try {
            // 1. Try to extract JSON from code blocks
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1]);
                return this.categorizeResponse(parsed);
            }

            // 2. Try raw JSON (if model forgot markdown)
            const trimmed = text.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                const parsed = JSON.parse(trimmed);
                return this.categorizeResponse(parsed);
            }

            // 3. Try to find JSON anywhere in the response
            const jsonInText = text.match(/\{[\s\S]*\}/);
            if (jsonInText) {
                try {
                    const parsed = JSON.parse(jsonInText[0]);
                    return this.categorizeResponse(parsed);
                } catch (e) {
                    // Continue to fallback
                }
            }

            // 4. Fallback: treat as plain text
            console.log('[Orchestrator] No JSON found, returning plain text');
            return {
                type: 'chat',
                data: {
                    content: text,
                    widgets: []
                }
            };

        } catch (e) {
            console.warn("[Orchestrator] Failed to parse response:", e);
            return {
                type: 'chat',
                data: {
                    content: text,
                    widgets: []
                }
            };
        }
    }

    /**
     * Categorize parsed JSON response
     */
    categorizeResponse(parsed) {
        // Check if it's a tool call
        if (parsed.tool && typeof parsed.tool === 'string') {
            return {
                type: 'tool_call',
                data: parsed
            };
        }

        // Check if it's a Lovable-style response with content + widgets
        if (parsed.content || parsed.widgets) {
            return {
                type: 'chat',
                data: {
                    content: parsed.content || '',
                    widgets: parsed.widgets || [],
                    language: parsed.language
                }
            };
        }

        // Check if it's a legacy structured response with sections
        if (parsed.sections && Array.isArray(parsed.sections)) {
            return {
                type: 'structured',
                data: parsed
            };
        }

        // Unknown format - wrap as plain text
        console.log('[Orchestrator] Unknown response format, wrapping as plain text');
        return {
            type: 'chat',
            data: {
                content: JSON.stringify(parsed),
                widgets: []
            }
        };
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
                    tools: tools
                });
                aiResponseText = typeof result === 'string' ? result : (result.message || JSON.stringify(result));
            } else {
                // Fallback Mock (Dev Mode) - Returns Lovable-style responses with widgets
                const lowerMsg = message.toLowerCase();

                // Tool call mocks
                if (lowerMsg.includes('create') && lowerMsg.includes('pilot')) {
                    aiResponseText = '```json\n{ "tool": "create_pilot", "args": { "title": "New Pilot", "sector": "Recycling" } }\n```';
                }
                else if (lowerMsg.includes('update') || lowerMsg.includes('set title')) {
                    aiResponseText = '```json\n{ "tool": "update_context", "args": { "entityType": "pilot", "data": { "title": "Mock Pilot Title" } } }\n```';
                }
                else if (lowerMsg.includes('navigate')) {
                    aiResponseText = '```json\n{ "tool": "navigate", "args": { "path": "/dashboard" } }\n```';
                }
                // Lovable-style response mocks with inline widgets
                else {
                    const isArabic = systemContext?.language === 'ar';
                    aiResponseText = JSON.stringify({
                        content: isArabic 
                            ? 'مرحباً بك! أنا هنا لمساعدتك في إدارة المشاريع التجريبية والتحديات الابتكارية. يمكنني مساعدتك في إنشاء مشاريع جديدة، استعراض التحديات، وتحليل البيانات.'
                            : "Welcome! I'm here to help you manage pilot projects and innovation challenges. I can help you create new projects, browse challenges, and analyze data.",
                        widgets: [
                            {
                                type: 'tools_used',
                                count: 3,
                                tools: ['context_analysis', 'user_preferences', 'platform_status']
                            },
                            {
                                type: 'tasks',
                                title: isArabic ? 'المهام' : 'Tasks',
                                items: [
                                    { label: isArabic ? 'تحليل السياق' : 'Analyze context', status: 'done' },
                                    { label: isArabic ? 'تحميل تفضيلات المستخدم' : 'Load user preferences', status: 'done' },
                                    { label: isArabic ? 'التحقق من حالة المنصة' : 'Check platform status', status: 'in_progress' },
                                    { label: isArabic ? 'إعداد التوصيات' : 'Prepare recommendations', status: 'pending' }
                                ]
                            },
                            {
                                type: 'editing',
                                files: ['copilotPrompts.js']
                            },
                            {
                                type: 'actions',
                                items: [
                                    { label: isArabic ? 'إنشاء مشروع تجريبي' : 'Create a Pilot', prompt: 'Create a new pilot project', variant: 'default' },
                                    { label: isArabic ? 'استعراض التحديات' : 'Browse Challenges', prompt: 'Show me the list of challenges', variant: 'outline' }
                                ]
                            }
                        ],
                        language: isArabic ? 'ar' : 'en'
                    });
                }
            }

            // 3. Parse Response
            const parsedResponse = this.parseResponse(aiResponseText);
            console.log('[Orchestrator] Parsed response:', parsedResponse);

            // 4. Handle based on response type
            if (parsedResponse.type === 'tool_call') {
                const toolCall = parsedResponse.data;
                console.log('[Orchestrator] Executing tool call:', toolCall);
                
                if (this.executor) {
                    const result = await this.executor(toolCall.tool, toolCall.args);
                    store.setIsThinking(false);
                    return result;
                } else {
                    console.warn("[Orchestrator] Executor not set, returning tool call info");
                    store.setIsThinking(false);
                    return {
                        type: 'structured',
                        sections: [{
                            type: 'info_box',
                            content: `Tool "${toolCall.tool}" would be executed with args: ${JSON.stringify(toolCall.args)}`,
                            metadata: { variant: 'info', title: 'Tool Call' }
                        }]
                    };
                }
            }

            // 5. Return Chat Response (Lovable-style)
            store.setIsThinking(false);
            if (parsedResponse.type === 'chat') {
                return {
                    type: 'chat',
                    content: parsedResponse.data.content,
                    widgets: parsedResponse.data.widgets,
                    language: parsedResponse.data.language
                };
            }
            
            // Legacy structured response fallback
            return {
                type: 'structured',
                sections: parsedResponse.data.sections,
                language: parsedResponse.data.language
            };

        } catch (error) {
            console.error('[Orchestrator] Error:', error);
            store.setIsThinking(false);
            store.reportError(error);
            return { 
                type: 'chat', 
                content: error?.message || 'An unexpected error occurred. Please try again.',
                widgets: []
            };
        }
    }
}

export const orchestrator = new CopilotOrchestrator(null);
