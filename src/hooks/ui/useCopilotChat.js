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
        orchestrator.setExecutor(requestExecution);
    }, [requestExecution]);

    // -- Handle Send --
    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const newMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, newMsg]);
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

        const response = await orchestrator.processMessage(newMsg.content, {
            tools: currentTools,
            systemPrompt: systemPrompt
        });

        if (response.type === 'confirmation_request') {
            // Handled by toolStatus in Store (CopilotConsole renders ProposalCard)
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
            setMessages(prev => [...prev, { role: 'assistant', content: response.content || JSON.stringify(response) }]);
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
