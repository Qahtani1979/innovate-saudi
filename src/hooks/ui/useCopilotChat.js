import { useState, useEffect } from 'react';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { CopilotOrchestrator } from '@/lib/ai/orchestrator';
import { useCopilotHistory } from '@/hooks/useCopilotHistory';
import { useToolExecutor } from '@/hooks/useToolExecutor';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { useLanguage } from '@/components/LanguageContext';
import { buildSystemPrompt } from '@/lib/ai/prompts/copilotPrompts';
import { useAuth } from '@/lib/AuthContext';
import { COPILOT_UI_TEXT } from '@/lib/copilot/uiConfig';
import { STRUCTURED_RESPONSE_SCHEMA } from '@/lib/ai/schemas/responseSchema';
import { buildEntityContextPrompt } from '@/lib/copilot/entityContext';

const orchestrator = new CopilotOrchestrator();

export function useCopilotChat() {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { getAllTools } = useCopilotTools();
    const { invokeAI } = useAIWithFallback({ showToasts: false });

    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const { activeSessionId, addToHistory } = useCopilotHistory();
    const { status, toolStatus, pendingToolCall, focusEntity } = useCopilotStore();
    const { requestExecution } = useToolExecutor();

    // Wire up the Executor to the Orchestrator
    useEffect(() => {
        if (orchestrator && requestExecution) {
            console.log('[useCopilotChat] Wiring executor to orchestrator');
            orchestrator.setExecutor(requestExecution);
        }
    }, [orchestrator, requestExecution]);

    // Wire up the AI Caller to the Orchestrator with JSON schema enforcement
    useEffect(() => {
        if (orchestrator && invokeAI) {
            console.log('[useCopilotChat] Wiring AI caller to orchestrator with structured schema');
            orchestrator.setCaller(async ({ system, user: userMessage, conversationHistory }) => {
                // Build full messages array including history for context continuity
                const fullMessages = conversationHistory || [];
                
                const result = await invokeAI({
                    system_prompt: system,
                    prompt: userMessage, // Fallback if no history
                    messages: fullMessages,
                    response_json_schema: STRUCTURED_RESPONSE_SCHEMA
                });
                if (result.success && result.data) {
                    // If structured response returned directly as object, stringify for parsing
                    if (typeof result.data === 'object' && result.data.sections) {
                        return JSON.stringify(result.data);
                    }
                    return typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
                }
                throw new Error(result.error?.message || 'AI call failed');
            });
        }
    }, [invokeAI]);

    // -- Handle Send --
    const handleSend = async (directMessage = null) => {
        const content = directMessage || inputValue;
        if (!content.trim()) return;

        console.log('[useCopilotChat] Sending message:', content);

        const userMsg = { role: 'user', content: content };

        // visual update
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        const currentTools = getAllTools();

        // Build entity context if focused
        const entityContext = focusEntity ? buildEntityContextPrompt(focusEntity, language) : '';

        const systemPrompt = buildSystemPrompt({
            user,
            language,
            location: window.location.pathname,
            pageTitle: document.title,
            entityContext,
            toolDefinitions: currentTools.map(t => {
                const params = t.schema ? Object.keys(t.schema.shape).join(', ') : 'none';
                return `- ${t.name}(${params}): ${t.description}`;
            }).join('\n')
        });

        try {
            console.log('[useCopilotChat] Processing message with orchestrator');
            const response = await orchestrator.processMessage(content, {
                tools: currentTools,
                systemPrompt: systemPrompt,
                messages: [...messages, userMsg],
                language: language
            });
            console.log('[useCopilotChat] Orchestrator response:', response);

            if (response.status === 'pending_confirmation') {
                return;
            }

            // Handle tool execution results - these need to be added to context
            // and optionally trigger a follow-up LLM call to generate a proper response
            if (response.type === 'tool_result') {
                const toolResultContent = formatToolResultForContext(response, language);
                
                // Add tool result as a context message (not displayed directly)
                const toolResultMsg = {
                    role: 'tool_result',
                    toolName: response.toolName,
                    content: toolResultContent,
                    data: response.data
                };

                // Now ask the LLM to respond based on the tool result
                const followUpResponse = await orchestrator.processMessage(
                    `[Tool "${response.toolName}" returned data. Please present this to the user in a helpful way.]`,
                    {
                        tools: currentTools,
                        systemPrompt: systemPrompt,
                        messages: [...messages, userMsg, toolResultMsg],
                        language: language,
                        toolResult: response.data // Pass tool result for LLM context
                    }
                );

                if (followUpResponse.type === 'structured' && followUpResponse.sections) {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: '',
                        structured: {
                            sections: followUpResponse.sections,
                            language: followUpResponse.language || language
                        },
                        toolContext: { name: response.toolName, data: response.data }
                    }]);
                } else {
                    // Direct display of tool result with UI
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: '',
                        ui: response.data,
                        toolContext: { name: response.toolName, data: response.data }
                    }]);
                }
                return;
            }

            // Handle structured responses (new format)
            if (response.type === 'structured' && response.sections) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '',
                    structured: {
                        sections: response.sections,
                        language: response.language || language
                    }
                }]);
                return;
            }

            // Handle error responses
            if (response.type === 'error') {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.content || t('errors.generic_error', 'Something went wrong.')
                }]);
                return;
            }

            // Legacy handlers for backward compatibility
            if (response.type === 'data_list') {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: t(COPILOT_UI_TEXT.assistant_intro),
                    ui: { type: 'data_list', entity: response.entity || 'default', items: response.items }
                }]);
            } else if (response.success && response.draft) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.message,
                    ui: { type: 'draft_summary', draft: response.draft }
                }]);
            } else {
                const msgContent = response.content || response.message || '';
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: msgContent || t('copilot.ready_to_help', 'I\'m ready to help.')
                }]);
            }
        } catch (error) {
            console.error('[useCopilotChat] Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: error?.message || t('errors.generic_error', 'An error occurred.')
            }]);
        }
    };

    // Format tool result for conversation context
    function formatToolResultForContext(response, lang) {
        const data = response.data;
        if (!data) return 'No data returned';
        
        if (data.type === 'data_list' && data.items) {
            const itemNames = data.items.slice(0, 10).map(i => 
                lang === 'ar' ? (i.name_ar || i.name || i.title_ar || i.title) : (i.name_en || i.name || i.title_en || i.title)
            ).join(', ');
            return `${data.entity || 'items'}: ${itemNames}${data.items.length > 10 ? '...' : ''}`;
        }
        
        return typeof data === 'string' ? data : JSON.stringify(data);
    }

    return {
        inputValue,
        setInputValue,
        messages,
        setMessages,
        handleSend,
        activeSessionId,
    };
}
