import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { toast } from 'sonner';

/**
 * usePeerComparison: Logic for comparing a pilot with similar entities.
 */
export function usePeerComparison(pilot) {
    const { invokeAI, status, isLoading: analyzing, rateLimitInfo, isAvailable } = useAIWithFallback();

    const compareMutation = useMutation({
        /** @param {{similarPilots: any[], promptBuilder: Function, schema: any, systemPrompt: string}} args */
        mutationFn: async ({ similarPilots, promptBuilder, schema, systemPrompt }) => {
            const response = await invokeAI({
                prompt: promptBuilder(pilot, similarPilots),
                response_json_schema: schema,
                system_prompt: systemPrompt
            });

            if (!response.success) throw new Error(response.error || 'AI Analysis failed');
            return response.data;
        }
    });

    return {
        compareMutation,
        status,
        analyzing,
        rateLimitInfo,
        isAvailable
    };
}

/**
 * useSmartRecommendations: Logic for personalized solution recommendations.
 */
export function useSmartRecommendations({ challenge, userId, solutions = [], userActivity = [], dismissed = [] }) {
    // This logic is currently local scoring, but could be enhanced with AI
    // Moving it here keeps the UI component clean.

    const getScoredRecommendations = (limit = 3) => {
        if (solutions.length === 0) return [];

        const userViewedSolutions = userActivity
            .filter(a => a.activity_type === 'view' && a.entity_type === 'solution')
            .map(a => a.entity_id);

        const userLikedSectors = userActivity
            .filter(a => a.activity_type === 'express_interest')
            .map(a => {
                const sol = solutions.find(s => s.id === a.entity_id);
                return sol?.sectors || [];
            })
            .flat();

        const sectorWeights = {};
        userLikedSectors.forEach(sector => {
            sectorWeights[sector] = (sectorWeights[sector] || 0) + 1;
        });

        return solutions
            .filter(s => s.is_verified && !dismissed.includes(s.id) && !userViewedSolutions.includes(s.id))
            .map(solution => {
                let score = 0;
                score += (solution.average_rating || 0) * 10;
                score += (solution.success_rate || 0) * 0.5;
                score += (solution.deployment_count || 0) * 2;

                const solutionSectors = solution.sectors || [];
                solutionSectors.forEach(sector => {
                    if (sectorWeights[sector]) {
                        score += sectorWeights[sector] * 15;
                    }
                });

                if (challenge) {
                    if (solution.sectors?.includes(challenge.sector)) score += 30;
                    if (solution.maturity_level === 'proven' || solution.maturity_level === 'market_ready') {
                        score += 20;
                    }
                }

                const daysSinceCreated = (new Date().getTime() - new Date(solution.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceCreated < 30) score += 10;

                return { ...solution, recommendation_score: score };
            })
            .sort((a, b) => b.recommendation_score - a.recommendation_score)
            .slice(0, limit);
    };

    return {
        recommendations: getScoredRecommendations()
    };
}

/**
 * usePredictiveInsights: Fetches forecasting data.
 */
export function usePredictiveInsights() {
    return useQuery({
        queryKey: ['predictive-insights'],
        queryFn: async () => {
            // In a real app, this would call an AI model or a specialized view.
            // For now, we simulate structured AI outputs for the dashboard.
            return {
                forecasts: [
                    { month: 'Dec', projected: 72, actual: 68 },
                    { month: 'Jan', projected: 75, actual: null },
                    { month: 'Feb', projected: 78, actual: null },
                    { month: 'Mar', projected: 82, actual: null }
                ],
                keyInsights: [
                    { id: 1, type: 'success', text: '5 pilots projected to reach completion ahead of schedule' },
                    { id: 2, type: 'warning', text: '3 pilots showing early warning signals for budget overrun' },
                    { id: 3, type: 'info', text: 'Transport sector expected to see 40% increase in challenges Q1 2026' }
                ]
            };
        }
    });
}
/**
 * useExecutiveBriefing: Generator for leadership briefings.
 */
export function useExecutiveBriefing() {
    const { invokeAI, status, isLoading: generating, rateLimitInfo, isAvailable } = useAIWithFallback();

    const generateMutation = useMutation({
        /** @param {{period: string, ecosystemData: any, promptBuilder: Function, schema: any, systemPrompt: string}} args */
        mutationFn: async ({ period, ecosystemData, promptBuilder, schema, systemPrompt }) => {
            const result = await invokeAI({
                system_prompt: systemPrompt,
                prompt: promptBuilder(period, ecosystemData),
                response_json_schema: schema
            });

            if (!result.success) throw new Error(result.error || 'Briefing generation failed');
            return result.data;
        }
    });

    return {
        generateMutation,
        status,
        generating,
        rateLimitInfo,
        isAvailable
    };
}

/**
 * useImpactForecaster: Logic for predicting project impact.
 */
export function useImpactForecaster() {
    const { invokeAI, status, isLoading: forecasting, rateLimitInfo, isAvailable } = useAIWithFallback();

    const forecastMutation = useMutation({
        /** @param {{promptBuilder: Function, challenge: any, schema: any, systemPrompt: string}} args */
        mutationFn: async ({ promptBuilder, challenge, schema, systemPrompt }) => {
            const result = await invokeAI({
                prompt: promptBuilder(challenge),
                response_json_schema: schema,
                system_prompt: systemPrompt
            });

            if (!result.success) throw new Error(result.error || 'Forecasting failed');
            return result.data;
        }
    });

    return {
        forecastMutation,
        status,
        forecasting,
        rateLimitInfo,
        isAvailable
    };
}

/**
 * useExemptionSuggester: Suggests regulatory exemptions based on project data.
 */
export function useExemptionSuggester() {
    const { invokeAI, status, isLoading, isAvailable, rateLimitInfo, error } = useAIWithFallback();

    const suggestMutation = useMutation({
        /** @param {{projectData: any, sandbox: any, availableExemptions: any[], promptBuilder: Function, schema: any, systemPrompt: string}} args */
        mutationFn: async ({ projectData, sandbox, availableExemptions, promptBuilder, schema, systemPrompt }) => {
            const response = await invokeAI({
                prompt: promptBuilder(projectData, sandbox, availableExemptions),
                response_json_schema: schema,
                system_prompt: systemPrompt
            });

            if (!response.success) throw new Error(response.error || 'Exemption analysis failed');
            return response.data;
        }
    });

    return {
        suggestMutation,
        status,
        isLoading,
        isAvailable,
        rateLimitInfo,
        error
    };
}

/**
 * useCapacityPredictor: Predicts resource demand and capacity needs.
 */
export function useCapacityPredictor() {
    const { invokeAI, status, isLoading, isAvailable, rateLimitInfo, error } = useAIWithFallback();

    const predictMutation = useMutation({
        /** @param {{sandbox: any, historicalData: any[], promptBuilder: Function, schema: any, systemPrompt: string}} args */
        mutationFn: async ({ sandbox, historicalData, promptBuilder, schema, systemPrompt }) => {
            const { success, data, error: aiError } = await invokeAI({
                prompt: promptBuilder(sandbox, historicalData),
                response_json_schema: schema,
                system_prompt: systemPrompt
            });

            if (!success) throw new Error(aiError || 'Capacity prediction failed');
            return data;
        }
    });

    return {
        predictMutation,
        status,
        isLoading,
        isAvailable,
        rateLimitInfo,
        error
    };
}

/**
 * useCrossEntityRecommender: Logic for connecting disparate entities via AI.
 */
export function useCrossEntityRecommender() {
    const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

    const recommendMutation = useMutation({
        /** @param {{sourceEntity: any, sourceType: string, availableEntities: any, promptBuilder: Function, schema: any, systemPrompt: string}} args */
        mutationFn: async ({ sourceEntity, sourceType, availableEntities, promptBuilder, schema, systemPrompt }) => {
            const result = await invokeAI({
                system_prompt: systemPrompt,
                prompt: promptBuilder(sourceEntity, sourceType, availableEntities),
                response_json_schema: schema
            });

            if (!result.success) throw new Error(result.error || 'Cross-entity recommendation failed');
            return result.data;
        }
    });

    return {
        recommendMutation,
        status,
        isLoading,
        isAvailable,
        rateLimitInfo
    };
}
