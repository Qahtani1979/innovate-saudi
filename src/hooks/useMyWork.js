/**
 * Hook for fetching "My Work" items
 * Aggregates challenges, pilots, and tasks for the user dashboard.
 */

import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { buildWorkPrioritizerPrompt, WORK_PRIORITIZER_SCHEMA } from '@/lib/ai/prompts/core/workPrioritizer';
import { useState } from 'react';

export function useMyWork() {
    const { user } = useAuth();

    const { data: myChallenges = [], isLoading: loadingChallenges } = useQuery({
        queryKey: ['my-challenges', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('is_deleted', false)
                .eq('created_by', user.email);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });

    const { data: myPilots = [], isLoading: loadingPilots } = useQuery({
        queryKey: ['my-pilots', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .eq('is_deleted', false)
                .eq('created_by', user.email);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });

    const { data: myTasks = [], isLoading: loadingTasks } = useQuery({
        queryKey: ['my-tasks', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('assigned_to', user.email)
                .neq('status', 'completed');

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });

    // AI Prioritization Logic
    const [aiPriorities, setAiPriorities] = useState(null);
    const { invokeAI, isLoading: isAIAnalyzing, isAvailable: isAIAvailable, status: aiStatus, error: aiError, rateLimitInfo } = useAIWithFallback();

    const generatePriorities = async () => {
        // Build context from work items
        const context = {
            challenges: myChallenges,
            pilots: myPilots,
            tasks: myTasks
        };

        const { success, data } = await invokeAI({
            prompt: buildWorkPrioritizerPrompt(context),
            response_json_schema: WORK_PRIORITIZER_SCHEMA
        });

        if (success && data) {
            setAiPriorities(data);
        }
    };

    return {
        myChallenges,
        myPilots,
        myTasks,
        isLoading: loadingChallenges || loadingPilots || loadingTasks,
        // AI Exports
        aiPriorities,
        generatePriorities,
        isAIAnalyzing,
        isAIAvailable,
        aiStatus,
        aiError,
        rateLimitInfo
    };
}

