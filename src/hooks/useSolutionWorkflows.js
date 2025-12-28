import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';

/**
 * Hook for Solution Deprecation Workflow
 */
export function useDeprecateSolution() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();

    return useMutation({
        /**
         * @param {{ solution: any, deprecationData: any }} params
         */
        mutationFn: async ({ solution, deprecationData }) => {
            // Update solution
            const { error: updateError } = await supabase.from('solutions').update({
                workflow_stage: 'deprecated',
                is_published: false,
                is_archived: true,
                deprecation_date: new Date().toISOString(),
                deprecation_reason: deprecationData.deprecation_reason,
                end_of_life_date: deprecationData.end_of_life_date,
                replacement_solution_id: deprecationData.replacement_solution_id,
                support_end_date: deprecationData.support_end_date
            }).eq('id', solution.id);

            if (updateError) throw updateError;

            // Get all pilots using this solution
            const { data: activePilots = [] } = await supabase.from('pilots').select('*')
                .eq('solution_id', solution.id)
                .in('stage', ['active', 'monitoring', 'preparation']);

            // Notify all affected municipalities
            for (const pilot of activePilots) {
                if (pilot.created_by) {
                    await supabase.functions.invoke('email-trigger-hub', {
                        body: {
                            trigger: 'solution.deprecated',
                            recipient_email: pilot.created_by,
                            entity_type: 'solution',
                            entity_id: solution.id,
                            variables: {
                                solutionName: solution.name_en,
                                pilotTitle: pilot.title_en,
                                deprecationReason: deprecationData.deprecation_reason,
                                endOfLifeDate: deprecationData.end_of_life_date,
                                supportEndDate: deprecationData.support_end_date || 'Not specified',
                                replacementAvailable: !!deprecationData.replacement_solution_id,
                                migrationSupportOffered: deprecationData.migration_support_offered,
                                notificationMessage: deprecationData.notification_message_en
                            }
                        }
                    });
                }
            }

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'Solution',
                entity_id: solution.id,
                activity_type: 'deprecated',
                description_en: `Solution deprecated: ${deprecationData.deprecation_reason}`,
                metadata: {
                    affected_pilots: activePilots.length,
                    end_of_life_date: deprecationData.end_of_life_date,
                    replacement_solution_id: deprecationData.replacement_solution_id
                }
            });

            await logCrudOperation('DEPRECATE', ENTITY_TYPES.SOLUTION, solution.id, null, { deprecationData });

            return { affectedPilots: activePilots.length };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['solution'] });
            queryClient.invalidateQueries({ queryKey: ['solutions'] });
            toast.success(`Solution deprecated. ${result.affectedPilots} municipalities notified.`);
        },
        onError: (error) => {
            console.error('Deprecation failed:', error);
            toast.error(`Failed to deprecate solution: ${error.message}`);
        }
    });
}

/**
 * Hook for Requesting a Demo
 */
export function useRequestDemo() {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const { data: demoRequest, error } = await supabase
                .from('demo_requests')
                .insert(data)
                .select()
                .single();
            if (error) throw error;

            // Log activity
            await supabase.from('system_activities').insert({
                entity_type: 'Solution',
                entity_id: data.solution_id,
                activity_type: 'demo_requested',
                description: `Demo requested by ${data.requester_name}`,
                metadata: {
                    requester: data.requester_email,
                    municipality: data.municipality_id,
                    demo_type: data.demo_type
                }
            });

            return demoRequest;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solution-activities'] });
            toast.success('Demo request sent to provider!');
        },
        onError: (error) => {
            console.error('Demo request failed:', error);
            toast.error('Failed to send demo request');
        }
    });
}

/**
 * Hook for Creating a Pilot Proposal from a Solution
 */
export function useCreatePilotProposal() {
    const queryClient = useAppQueryClient();

    return useMutation({
        /**
         * @param {{ solution: any, pilotData: any }} params
         */
        mutationFn: async ({ solution, pilotData }) => {
            const { data: pilot, error } = await supabase.from('pilots').insert(pilotData).select().single();
            if (error) throw error;

            await supabase.from('system_activities').insert({
                entity_type: 'solution',
                entity_id: solution.id,
                activity_type: 'proposed_pilot',
                description: `Provider proposed pilot: ${pilot.title_en}`
            });

            return pilot;
        },
        onSuccess: (pilot) => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
        },
        onError: (error) => {
            console.error('Pilot proposal failed:', error);
            toast.error('Failed to create pilot proposal');
        }
    });
}

/**
 * Hook for Creating a Contract
 */
export function useCreateContract() {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async (contractData) => {
            const { data: contract, error } = await supabase.from('contracts').insert(contractData).select().single();
            if (error) throw error;
            return contract;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            toast.success('Contract created successfully');
        },
        onError: (error) => {
            console.error('Contract creation failed:', error);
            toast.error(`Failed to create contract: ${error.message}`);
        }
    });
}

/**
 * Hook for Saving Automated Matches
 */
export function useSaveMatches() {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async (matches) => {
            const { data, error } = await supabase.from('challenge_solution_matches').insert(matches).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-matches'] });
            toast.success('Matches saved successfully');
        },
        onError: (error) => {
            console.error('Failed to save matches:', error);
            toast.error('Failed to save matches');
        }
    });
}

/**
 * Hook for Creating an R&D Project
 */
export function useCreateRDProject() {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase
                .from('rd_projects')
                .insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
            toast.success('R&D proposal created');
        },
        onError: (error) => {
            console.error('Failed to create R&D proposal:', error);
            toast.error(`Failed to create R&D proposal: ${error.message}`);
        }
    });
}



