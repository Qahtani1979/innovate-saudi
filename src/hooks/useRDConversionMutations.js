import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePilotMutations } from './usePilotMutations';
import { usePolicyMutations } from './usePolicyMutations';
import { useSolutionMutations } from './useSolutionMutations';

/**
 * Hook for handling R&D Project conversions/transitions
 */
export function useRDConversionMutations() {
    const queryClient = useAppQueryClient();
    const { createPilot } = usePilotMutations();
    const { createPolicy } = usePolicyMutations();
    const { createSolution } = useSolutionMutations();

    /**
     * Transition to Pilot
     */
    const transitionToPilot = useMutation({
        mutationFn: async ({ pilotData, rdProject }) => {
            // 1. Create Pilot
            const pilot = await createPilot.mutateAsync(pilotData);

            // 2. Link back to R&D Project
            const { error: updateError } = await supabase
                .from('rd_projects')
                .update({
                    pilot_opportunities: [
                        ...(rdProject.pilot_opportunities || []),
                        {
                            description_en: `Pilot created: ${pilot.title_en}`,
                            pilot_id: pilot.id,
                            municipality: pilotData.municipality_id,
                            status: 'created'
                        }
                    ]
                })
                .eq('id', rdProject.id);

            if (updateError) throw updateError;
            return pilot;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
            toast.success('Converted to pilot successfully');
        },
        onError: (error) => {
            toast.error(`Transition failed: ${error.message}`);
        }
    });

    /**
     * Transition to Policy
     */
    const transitionToPolicy = useMutation({
        mutationFn: async ({ policyData, rdProject }) => {
            const policy = await createPolicy.mutateAsync(policyData);

            // Update R&D with policy impact
            const { error: updateError } = await supabase
                .from('rd_projects')
                .update({
                    policy_impact: {
                        ...rdProject.policy_impact,
                        policy_generated_id: policy.id,
                        policy_generated_date: new Date().toISOString()
                    }
                })
                .eq('id', rdProject.id);

            if (updateError) throw updateError;
            return policy;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
        }
    });

    /**
     * Transition to Solution
     */
    const transitionToSolution = useMutation({
        mutationFn: async ({ solutionData, rdProject }) => {
            const solution = await createSolution.mutateAsync(solutionData);

            const { error: updateError } = await supabase
                .from('rd_projects')
                .update({
                    commercialization_notes: `Commercialized as Solution ${solution.id}`,
                    commercialization_solution_id: solution.id
                })
                .eq('id', rdProject.id);

            if (updateError) throw updateError;

            // Log system activity
            await supabase.from('system_activities').insert({
                activity_type: 'rd_commercialized',
                entity_type: 'rd_project',
                entity_id: rdProject.id,
                description_en: `R&D project commercialized as Solution: ${solution.name_en}`,
                metadata: { solution_id: solution.id }
            });

            return solution;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
        }
    });

    /**
     * Transition to Startup Spinoff
     */
    const transitionToStartup = useMutation({
        mutationFn: async ({ spinoffData, rdProject }) => {
            // 1. Create Startup Profile
            const { data: startup, error: startupError } = await supabase
                .from('startup_profiles')
                .insert({
                    name_en: spinoffData.startup_name,
                    description_en: rdProject.abstract_en,
                    stage: 'pre_seed',
                    product_stage: rdProject.trl_current >= 7 ? 'beta' : 'mvp',
                    sectors: [rdProject.research_area_en],
                    source_rd_project_id: rdProject.id
                })
                .select()
                .single();
            if (startupError) throw startupError;

            // 2. Create Solution via useSolutionMutations would be ideal, but here we need to link it to the provider immediately.
            // We can just use the direct insert as it was or try to use createSolution if it supports provider_id overriding.
            // Let's stick to the logic in original file for now but hook-ified.

            const { data: solution, error: solutionError } = await supabase
                .from('solutions')
                .insert({
                    name_en: spinoffData.startup_name,
                    description_en: rdProject.abstract_en,
                    provider_id: startup.id,
                    provider_name: spinoffData.startup_name,
                    provider_type: 'startup',
                    trl: rdProject.trl_current,
                    maturity_level: rdProject.trl_current >= 7 ? 'market_ready' : 'prototype',
                    source_rd_project_id: rdProject.id
                })
                .select()
                .single();
            if (solutionError) throw solutionError;

            const { error: updateError } = await supabase
                .from('rd_projects')
                .update({
                    spinoff_startup_id: startup.id,
                    spinoff_solution_id: solution.id,
                    commercialization_status: 'spinoff_created'
                })
                .eq('id', rdProject.id);
            if (updateError) throw updateError;

            return { startup, solution };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
            toast.success('Startup spinoff created successfully');
        }
    });

    return {
        transitionToPilot,
        transitionToPolicy,
        transitionToSolution,
        transitionToStartup
    };
}



