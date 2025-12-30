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

const orchestrator = new CopilotOrchestrator();

export function useCopilotChat() {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { getAllTools } = useCopilotTools();
    const { invokeAI } = useAIWithFallback({ showToasts: false });

    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const { activeSessionId, addToHistory } = useCopilotHistory();
    const { status, toolStatus, pendingToolCall } = useCopilotStore();
    const { requestExecution } = useToolExecutor();

    // Wire up the Executor to the Orchestrator
    useEffect(() => {
        if (orchestrator && requestExecution) {
            console.log('[useCopilotChat] Wiring executor to orchestrator');
            orchestrator.setExecutor(requestExecution);
        }
    }, [orchestrator, requestExecution]);

    // Wire up the AI Caller to the Orchestrator
    useEffect(() => {
        if (orchestrator && invokeAI) {
            console.log('[useCopilotChat] Wiring AI caller to orchestrator');
            orchestrator.setCaller(async ({ system, user: userMessage }) => {
                const result = await invokeAI({
                    system_prompt: system,
                    prompt: userMessage
                });
                if (result.success && result.data) {
                    // Handle string or object response
                    return typeof result.data === 'string' ? result.data : (result.data.message || JSON.stringify(result.data));
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

        const systemPrompt = buildSystemPrompt({
            user,
            language,
            location: window.location.pathname,
            pageTitle: document.title,
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
                const content = response.content || response.message || '';
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: content || t('copilot.ready_to_help', 'I\'m ready to help.')
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

    return {
        inputValue,
        setInputValue,
        messages,
        setMessages,
        handleSend,
        activeSessionId,
    };
}
