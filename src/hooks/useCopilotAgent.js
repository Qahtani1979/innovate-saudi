import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { buildSystemPrompt } from '@/lib/ai/prompts/copilotPrompts';

/**
 * The "Agent" hook. 
 * Wraps the generic useAIWithFallback to provide Copilot-specific schemas and prompting.
 * 
 * Features:
 * - Dynamic Tool Injection from Registry (Now Context)
 * - Context Awareness (URL, Page Title, User, Language)
 * - Structured JSON Enforcement
 */
export function useCopilotAgent() {
    const { invokeAI, status, isLoading, isAvailable } = useAIWithFallback();
    const location = useLocation();
    const { getAllTools } = useCopilotTools();
    const { user } = useAuth();
    const { language } = useLanguage();
    // const { permissions } = usePermissions(); // Optional usage

    // Dynamically build the tool list from the Registry Source of Truth
    const toolDefinitions = useMemo(() => {
        const tools = getAllTools();
        return tools.map(t => {
            // Rough schema stringification for the prompt
            const params = t.schema ? Object.keys(t.schema.shape).join(', ') : 'none';
            return `- ${t.name}(${params}): ${t.description}`;
        }).join('\n');
    }, [getAllTools]);

    // Ask the AI...
    const askBrain = useCallback(async (userMessage, contextData = {}) => {
        // 1. Build the System Prompt Dynamically
        const systemPrompt = buildSystemPrompt({
            user,
            language,
            location: location.pathname,
            pageTitle: document.title,
            toolDefinitions
        });

        // 2. Call the API
        const response = await invokeAI({
            system_prompt: systemPrompt,
            prompt: `User Context: ${JSON.stringify(contextData)}\n\nUser Message: ${userMessage}`
        });

        // ...
    }, [invokeAI, location.pathname, toolDefinitions, user, language]);

    return {
        askBrain,
        status,
        isLoading
    };
}
