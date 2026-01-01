import { useCopilotStore } from '@/lib/store/copilotStore';
import { validateStructuredResponse, createFallbackStructuredResponse } from '@/lib/ai/schemas/responseSchema';

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
    parseResponse(text, language = 'en') {
        try {
            // 1. Try to extract JSON from code blocks (various formats)
            const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[1].trim());
                    return this.categorizeResponse(parsed, language);
                } catch (e) {
                    console.warn("[Orchestrator] JSON in code block failed to parse:", e);
                }
            }

            // 2. Try raw JSON (if model forgot markdown)
            const trimmed = text.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    return this.categorizeResponse(parsed, language);
                } catch (e) {
                    // Continue to next approach
                }
            }

            // 3. Try to find JSON object anywhere in the response
            // More aggressive regex to find JSON with sections array
            const jsonPatterns = [
                /\{\s*"sections"\s*:\s*\[[\s\S]*\]\s*(?:,\s*"language"\s*:\s*"[^"]*")?\s*\}/,
                /\{\s*"tool"\s*:\s*"[^"]*"\s*,\s*"args"\s*:\s*\{[\s\S]*\}\s*\}/,
                /\{[\s\S]*\}/
            ];

            for (const pattern of jsonPatterns) {
                const jsonMatch = text.match(pattern);
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[0]);
                        // Validate it's a proper response structure
                        if (parsed.sections || parsed.tool) {
                            return this.categorizeResponse(parsed, language);
                        }
                    } catch (e) {
                        // Continue to next pattern
                    }
                }
            }

            // 4. Fallback: treat as plain text and convert to structured format
            console.log("[Orchestrator] No valid JSON found, using fallback parser");
            return {
                type: 'structured',
                data: createFallbackStructuredResponse(text, language)
            };

        } catch (e) {
            console.warn("[Orchestrator] Failed to parse response:", e);
            return {
                type: 'structured',
                data: createFallbackStructuredResponse(text, language)
            };
        }
    }

    /**
     * Categorize parsed JSON response
     * @param {Object} parsed - Parsed JSON object
     * @param {string} language - Current language for fallback
     */
    categorizeResponse(parsed, language = 'en') {
        // Check if it's a tool call
        if (parsed.tool && typeof parsed.tool === 'string') {
            return {
                type: 'tool_call',
                data: parsed
            };
        }

        // Check if it's a structured response with sections
        if (parsed.sections && Array.isArray(parsed.sections)) {
            const validation = validateStructuredResponse(parsed);
            if (!validation.valid) {
                console.warn('[Orchestrator] Structured response validation errors:', validation.errors);
            }
            
            // Ensure language is set
            if (!parsed.language) {
                parsed.language = language;
            }
            
            return {
                type: 'structured',
                data: parsed
            };
        }

        // Unknown format - wrap in a structured response
        console.log("[Orchestrator] Unknown response format, wrapping in structured response");
        return {
            type: 'structured',
            data: {
                sections: [{
                    type: 'paragraph',
                    content: typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
                }],
                language
            }
        };
    }

    /**
     * Main Entry Point
     * @param {string} message - User message
     * @param {Object} systemContext - Context object with tools, systemPrompt, messages, toolResult
     */
    async processMessage(message, systemContext = {}) {
        // Processing message with context

        const store = getStore();
        store.setIsThinking(true);

        try {
            // 1. Prepare Prompt - use provided context
            const tools = systemContext?.tools || [];
            // Use externally provided prompt OR build default
            let systemPrompt = systemContext?.systemPrompt || this.buildSystemPrompt(tools);

            // If we have a tool result, inject it into the context for the LLM
            if (systemContext?.toolResult) {
                const toolResultContext = this.formatToolResultForPrompt(systemContext.toolResult);
                systemPrompt += `\n\n## TOOL EXECUTION RESULT\nThe following data was just retrieved from the system:\n${toolResultContext}\n\nPlease present this information to the user in a helpful, structured way.`;
            }

            // 2. Call AI (Real or Mock)
            let aiResponseText = "";
            if (this.caller) {
                // Get conversation history for context continuity
                const conversationHistory = systemContext?.messages || [];
                
                // Pass system prompt + user message + full history to the hook/caller
                const result = await this.caller({
                    system: systemPrompt,
                    user: message,
                    tools: tools,
                    conversationHistory: conversationHistory
                });
                aiResponseText = typeof result === 'string' ? result : (result.message || JSON.stringify(result));
            } else {
                // Fallback Mock (Dev Mode) - Returns structured responses
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
                // Structured response mocks
                else {
                    const isArabic = systemContext?.language === 'ar';
                    aiResponseText = JSON.stringify({
                        sections: [
                            { 
                                type: 'header', 
                                content: isArabic ? 'مرحباً بك في المساعد الذكي' : 'Welcome to Super Copilot', 
                                metadata: { level: 1, icon: 'sparkles' } 
                            },
                            { 
                                type: 'paragraph', 
                                content: isArabic 
                                    ? 'أنا هنا لمساعدتك في إدارة المشاريع التجريبية والتحديات الابتكارية في منصة الابتكار السعودية.'
                                    : 'I am here to help you manage pilot projects and innovation challenges on the Saudi Innovation platform.'
                            },
                            { type: 'divider' },
                            { 
                                type: 'header', 
                                content: isArabic ? 'ما يمكنني مساعدتك به' : 'How I Can Help', 
                                metadata: { level: 2 } 
                            },
                            { 
                                type: 'bullet_list', 
                                metadata: { 
                                    items: isArabic 
                                        ? ['إنشاء وإدارة المشاريع التجريبية', 'استعراض التحديات الابتكارية', 'تحليل البيانات الاستراتيجية', 'التنقل في المنصة']
                                        : ['Create and manage pilot projects', 'Browse innovation challenges', 'Analyze strategic data', 'Navigate the platform']
                                } 
                            },
                            { 
                                type: 'action_buttons', 
                                content: isArabic ? 'اختر ما تريد القيام به:' : 'Choose what you want to do:',
                                metadata: { 
                                    actions: [
                                        { 
                                            label: isArabic ? 'إنشاء مشروع تجريبي' : 'Create a Pilot', 
                                            action: 'create_pilot', 
                                            prompt: isArabic ? 'أنشئ مشروع تجريبي جديد' : 'Create a new pilot project', 
                                            variant: 'primary' 
                                        },
                                        { 
                                            label: isArabic ? 'استعراض التحديات' : 'Browse Challenges', 
                                            action: 'list_challenges', 
                                            prompt: isArabic ? 'اعرض لي قائمة التحديات' : 'Show me the list of challenges', 
                                            variant: 'secondary' 
                                        },
                                        { 
                                            label: isArabic ? 'عرض لوحة القيادة' : 'View Dashboard', 
                                            action: 'navigate', 
                                            prompt: isArabic ? 'انتقل إلى لوحة القيادة' : 'Navigate to dashboard', 
                                            variant: 'outline' 
                                        }
                                    ]
                                }
                            }
                        ],
                        language: isArabic ? 'ar' : 'en'
                    });
                }
            }

            // 3. Parse Response - pass language for proper fallback handling
            const language = systemContext?.language || 'en';
            const parsedResponse = this.parseResponse(aiResponseText, language);

            // 4. Handle based on response type
            if (parsedResponse.type === 'tool_call') {
                const toolCall = parsedResponse.data;
                
                if (this.executor) {
                    const result = await this.executor(toolCall.tool, toolCall.args);
                    store.setIsThinking(false);
                    
                    // Return tool result with context for follow-up
                    if (result.status === 'pending_confirmation') {
                        return result;
                    }
                    
                    return {
                        type: 'tool_result',
                        toolName: toolCall.tool,
                        args: toolCall.args,
                        data: result
                    };
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

            // 5. Return Structured Response
            store.setIsThinking(false);
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
                type: 'structured', 
                sections: [{
                    type: 'info_box',
                    content: error?.message || 'An unexpected error occurred. Please try again.',
                    metadata: { variant: 'danger', title: 'Error' }
                }]
            };
        }
    }

    /**
     * Format tool result data for injection into LLM prompt
     */
    formatToolResultForPrompt(toolResult) {
        if (!toolResult) return 'No data';
        
        // Handle data_list type (most common from our tools)
        if (toolResult.type === 'data_list' && toolResult.items) {
            const entity = toolResult.entity || 'items';
            const items = toolResult.items;
            
            let formatted = `Entity Type: ${entity}\nTotal Items: ${items.length}\n\nItems:\n`;
            items.forEach((item, i) => {
                const name = item.name_en || item.name || item.title_en || item.title || item.id;
                const nameAr = item.name_ar || item.title_ar || '';
                const status = item.status ? ` (${item.status})` : '';
                const sector = item.sector ? ` - Sector: ${item.sector}` : '';
                formatted += `${i + 1}. ${name}${nameAr ? ` / ${nameAr}` : ''}${status}${sector}\n`;
            });
            
            return formatted;
        }
        
        // Handle confirmation_request type
        if (toolResult.type === 'confirmation_request') {
            return `Action requires confirmation: ${toolResult.message}`;
        }
        
        // Fallback to JSON stringification
        return typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2);
    }
}

export const orchestrator = new CopilotOrchestrator(null);
