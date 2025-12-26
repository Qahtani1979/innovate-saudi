import { useQuery } from '@tanstack/react-query';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { getCollaborationSuggesterPrompt, collaborationSuggesterSchema } from '@/lib/ai/prompts/portfolio';
import { getSystemPrompt } from '@/lib/saudiContext';

export function useCollaborationSuggestions({ entityType, entityId, entityData }) {
    const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

    const query = useQuery({
        queryKey: ['collaboration-suggestions', entityType, entityId],
        queryFn: async () => {
            const prompt = getCollaborationSuggesterPrompt(entityType, entityData);

            const result = await invokeAI({
                prompt,
                response_json_schema: collaborationSuggesterSchema,
                system_prompt: getSystemPrompt('FULL', true)
            });

            return result.success ? result.data?.suggestions || [] : [];
        },
        enabled: false // Triggered manually
    });

    return {
        suggestions: query.data || [],
        suggestInfo: {
            refetch: query.refetch,
            isLoading: query.isLoading,
            aiLoading,
            status,
            isAvailable,
            rateLimitInfo
        }
    };
}
