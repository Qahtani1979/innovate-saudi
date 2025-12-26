import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for AI-powered strategy generation Edge Functions
 */
export function useStrategyAIGeneration() {
    const queryClient = useQueryClient();

    /**
     * Generate strategic objectives with AI
     */
    const generateObjectives = useMutation({
        mutationFn: async ({
            strategic_plan_id,
            pillar_name,
            vision_statement,
            objectives_per_pillar,
            include_kpis,
            existing_objectives
        }) => {
            const { data, error } = await supabase.functions.invoke('strategy-objective-generator', {
                body: {
                    strategic_plan_id,
                    pillar_name,
                    vision_statement,
                    objectives_per_pillar,
                    include_kpis,
                    existing_objectives
                }
            });

            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate strategic pillars with AI
     */
    const generatePillars = useMutation({
        mutationFn: async ({
            strategic_plan_id,
            vision_statement,
            municipality_context,
            pillar_count
        }) => {
            const { data, error } = await supabase.functions.invoke('strategy-pillar-generator', {
                body: {
                    strategic_plan_id,
                    vision_statement,
                    municipality_context,
                    pillar_count
                }
            });

            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate challenges with AI
     */
    const generateChallenges = useMutation({
        mutationFn: async ({
            strategic_plan_id,
            objective_ids,
            sector_id,
            challenge_count,
            additional_context
        }) => {
            const { data, error } = await supabase.functions.invoke('strategy-challenge-generator', {
                body: {
                    strategic_plan_id,
                    objective_ids,
                    sector_id,
                    challenge_count,
                    additional_context
                }
            });

            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate pilot designs with AI
     */
    const generatePilots = useMutation({
        mutationFn: async ({
            challenge_id,
            solution_id,
            pilot_duration_months,
            target_participants,
            additional_context
        }) => {
            const { data, error } = await supabase.functions.invoke('strategy-pilot-generator', {
                body: {
                    challenge_id,
                    solution_id,
                    pilot_duration_months,
                    target_participants,
                    additional_context
                }
            });

            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate R&D calls with AI
     */
    const generateRDCalls = useMutation({
        mutationFn: async ({
            challenge_ids,
            budget_range,
            duration_months
        }) => {
            const { data, error } = await supabase.functions.invoke('strategy-rd-call-generator', {
                body: {
                    challenge_ids,
                    budget_range,
                    duration_months
                }
            });

            if (error) throw error;
            return data;
        }
    });

    /**
     * Analyze strategic plan with AI
     */
    const analyzeStrategicPlan = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('analyze-strategic-plan', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Analyze objectives with AI
     */
    const analyzeObjectives = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('analyze-objectives', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate strategy timeline with AI
     */
    const generateTimeline = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-timeline-generator', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate policies with AI
     */
    const generatePolicies = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-policy-generator', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate living labs with AI
     */
    const generateLivingLabs = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-lab-research-generator', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate events with AI
     */
    const generateEvents = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-event-planner', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate campaigns with AI
     */
    const generateCampaigns = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-campaign-generator', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate ownership assignments with AI
     */
    const generateOwnership = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-ownership-ai', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate action plans with AI
     */
    const generateActionPlan = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-action-plan-generator', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Generate sector strategies with AI
     */
    const generateSectorStrategy = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-sector-generator', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Link to national strategies with AI
     */
    const linkNationalStrategy = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-national-linker', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Perform scheduled strategy analysis
     */
    const performScheduledAnalysis = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-scheduled-analysis', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Assess strategy quality with AI
     */
    const assessQuality = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-quality-assessor', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Match partnerships with AI
     */
    const matchPartnerships = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('strategy-partnership-matcher', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Calculate MII (Municipal Innovation Index)
     * Automatically invalidates related queries on success
     */
    const calculateMII = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('calculate-mii', { body });
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            // Automatically invalidate MII-related queries
            const municipalityId = variables.municipality_id;
            if (municipalityId) {
                queryClient.invalidateQueries(['mii-latest-result', municipalityId]);
                queryClient.invalidateQueries(['mii-history', municipalityId]);
                queryClient.invalidateQueries(['municipality', municipalityId]);
            }
        }
    });

    /**
     * Generate AI content
     */
    const generateContent = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('ai-content-generator', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Perform semantic search
     */
    const semanticSearch = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('semantic-search', { body });
            if (error) throw error;
            return data;
        }
    });

    /**
     * Extract file data with AI
     */
    const extractFileData = useMutation({
        mutationFn: async (body) => {
            const { data, error } = await supabase.functions.invoke('extract-file-data', { body });
            if (error) throw error;
            return data;
        }
    });

    return {
        // Original functions
        generateObjectives,
        generatePillars,
        generateChallenges,
        generatePilots,
        generateRDCalls,
        // New AI functions
        analyzeStrategicPlan,
        analyzeObjectives,
        generateTimeline,
        generatePolicies,
        generateLivingLabs,
        generateEvents,
        generateCampaigns,
        generateOwnership,
        generateActionPlan,
        generateSectorStrategy,
        linkNationalStrategy,
        performScheduledAnalysis,
        assessQuality,
        matchPartnerships,
        calculateMII,
        generateContent,
        semanticSearch,
        extractFileData
    };
}
