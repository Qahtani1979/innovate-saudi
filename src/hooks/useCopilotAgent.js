import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { TOOL_REGISTRY } from '@/lib/ai/tools/registry';

/**
 * The "Agent" hook. 
 * Wraps the generic useAIWithFallback to provide Copilot-specific schemas and prompting.
 * 
 * Features:
 * - Dynamic Tool Injection from Registry
 * - Context Awareness (URL, Page Title)
 * - Structured JSON Enforcement
 */
export function useCopilotAgent() {
    const { invokeAI, status, isLoading, isAvailable } = useAIWithFallback();
    const location = useLocation();

    // Dynamically build the tool list from the Registry Source of Truth
    const toolDefinitions = useMemo(() => {
        return Object.entries(TOOL_REGISTRY).map(([name, def]) => {
            // Rough schema stringification for the prompt
            const params = Object.keys(def.schema.shape).join(', ');
            return `- ${name}(${params}): ${def.description}`;
        }).join('\n');
    }, []);

    const askBrain = useCallback(async (userMessage, contextData = {}) => {
        // 1. Build the System Prompt Dynamically
        const systemPrompt = `
You are the Super Copilot for Innovate Saudi.
You have access to a Registry of Tools.
Your goal is to help the user govern, navigate, and analyze.

CURRENT CONTEXT:
- Path: ${location.pathname}
- Page Title: ${document.title}

If the user asks to do something available in your tools, you MUST reply with a JSON object describing the tool call.
Use the following format for Tool Calls:
\`\`\`json
{
  "tool": "tool_name",
  "args": { ... }
}
\`\`\`

Available Tools:
${toolDefinitions}

If no tool is needed, just reply with helpful text.
        `.trim();

        // 2. Call the API
        const response = await invokeAI({
            system_prompt: systemPrompt,
            prompt: `User Context: ${JSON.stringify(contextData)}\n\nUser Message: ${userMessage}`
        });

        // 3. Return structured result
        if (!response.success) {
            throw new Error(response.error || 'AI Failed');
        }

        return response.data;
    }, [invokeAI, location.pathname, toolDefinitions]);

    return {
        askBrain,
        status,
        isLoading
    };
}
