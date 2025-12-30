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

    // -- Handle Send --
    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const content = inputValue;
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
                messages: [...messages, userMsg]
            });
            console.log('[useCopilotChat] Orchestrator response:', response);

            if (response.status === 'pending_confirmation') {
                return;
            }

            // Handle error responses from orchestrator
            if (response.type === 'error') {
                console.warn('[useCopilotChat] Orchestrator returned error:', response.content);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.content || t('errors.generic_error', 'Something went wrong. Please try again.')
                }]);
                return;
            }

            if (response.type === 'confirmation_request') {
                // Handled by toolStatus in Store
            } else if (response.type === 'data_list') {
                // Return Data Payload for UI Component to Render
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: t(COPILOT_UI_TEXT.assistant_intro),
                    ui: {
                        type: 'data_list',
                        entity: response.entity || 'default',
                        items: response.items
                    }
                }]);

            } else if (response.success && response.draft) {
                // Return Draft Payload
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.message,
                    ui: {
                        type: 'draft_summary',
                        draft: response.draft
                    }
                }]);
            } else {
                // Default text response
                const content = response.content || response.message || '';
                if (content) {
                    setMessages(prev => [...prev, { role: 'assistant', content }]);
                } else {
                    console.warn('[useCopilotChat] Empty response from orchestrator:', response);
                    setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: t('copilot.ready_to_help', 'I\'m ready to help. What would you like to do?')
                    }]);
                }
            }
        } catch (error) {
            console.error('[useCopilotChat] Error processing message:', error);
            const errorMessage = error?.message || t('errors.generic_error', 'I encountered an error. Please try again.');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessage
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
