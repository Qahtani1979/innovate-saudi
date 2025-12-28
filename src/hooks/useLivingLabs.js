import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export function useLivingLabs() {
    return useQuery({
        queryKey: ['living-labs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('living_labs')
                .select('*')
                .eq('is_deleted', false);
            if (error) throw error;
            return data;
        }
    });
}

export function useMyLivingLabs(userEmail) {
    return useQuery({
        queryKey: ['my-labs', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase.from('living_labs').select('*').eq('is_deleted', false);
            if (error) throw error;
            return data?.filter(l =>
                l.director_email === userEmail ||
                l.manager_email === userEmail ||
                l.created_by === userEmail
            ) || [];
        },
        enabled: !!userEmail
    });
}

export function useLivingLabMutations() {
    const queryClient = useAppQueryClient();
    const { triggerEmail } = useEmailTrigger();

    const createLab = useMutation({
        mutationFn: async (data) => {
            const { data: newLab, error } = await supabase
                .from('living_labs')
                .insert(data)
                .select()
                .single();
            if (error) throw error;
            return newLab;
        },
        onSuccess: async (newLab, variables) => {
            queryClient.invalidateQueries({ queryKey: ['living-labs'] });
            queryClient.invalidateQueries({ queryKey: ['my-labs'] });

            // Trigger email
            try {
                await triggerEmail('livinglab.created', {
                    entity_type: 'living_lab',
                    entity_id: newLab.id,
                    variables: {
                        labName: variables.name_en,
                        labType: variables.lab_type,
                        researchAreas: Array.isArray(variables.research_areas) ? variables.research_areas.join(', ') : variables.research_areas
                    }
                });
            } catch (err) {
                console.error('Failed to trigger email:', err);
            }

            toast.success('Living Lab created successfully');
        },
        onError: (error) => {
            console.error('Error creating living lab:', error);
            toast.error(`Failed to create Living Lab: ${error.message}`);
        }
    });

    const convertProjectToSolution = useMutation({
        mutationFn: async ({ rdProject, livingLabId, solutionData, userEmail }) => {
            // Create Solution
            const { data: solution, error: solError } = await supabase.from('solutions').insert({
                code: `SOL-LAB-${Date.now()}`,
                name_en: solutionData.name_en,
                name_ar: rdProject.title_ar,
                description_en: solutionData.description_en,
                description_ar: rdProject.abstract_ar,
                provider_name: rdProject.institution_en,
                provider_type: 'research_center',
                sectors: [rdProject.research_area_en],
                maturity_level: 'pilot_ready',
                trl: rdProject.trl_current || 6,
                pricing_model: solutionData.pricing_model,
                workflow_stage: 'verification_pending',
                is_verified: false
            }).select().single();
            if (solError) throw solError;

            // Create certification
            const { error: certError } = await supabase.from('lab_solution_certifications').insert({
                living_lab_id: livingLabId,
                solution_id: solution.id,
                certification_type: 'citizen_tested',
                certification_date: new Date().toISOString(),
                citizen_participants_count: rdProject.team_members?.length || 0,
                research_findings: rdProject.abstract_en,
                issued_by: userEmail
            });
            if (certError) throw certError;

            // Update RDProject
            const { error: projError } = await supabase.from('rd_projects').update({
                commercialization_potential_score: 75
            }).eq('id', rdProject.id);
            if (projError) throw projError;

            return solution;
        },
        onSuccess: (solution) => {
            queryClient.invalidateQueries({ queryKey: ['solutions'] });
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
            toast.success('Solution created from research');
        }
    });

    const accreditLab = useMutation({
        mutationFn: async ({ labId, accreditationData }) => {
            const { error } = await supabase.from('living_labs').update(accreditationData).eq('id', labId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['living-labs'] });
            queryClient.invalidateQueries({ queryKey: ['my-labs'] });
            toast.success('Lab accredited successfully');
        }
    });

    const routeToLab = useMutation({
        mutationFn: async ({ entity, entityType, selectedLab }) => {
            // Create RDProject query
            const { data: rdProject, error } = await supabase.from('rd_projects').insert({
                code: `RD-LAB-${Date.now()}`,
                title_en: `Lab Research: ${entity.title_en || entity.name_en}`,
                title_ar: entity.title_ar || entity.name_ar,
                abstract_en: entity.description_en || entity.problem_statement_en,
                living_lab_id: selectedLab,
                research_area_en: entity.sector || 'Municipal Innovation',
                institution_en: 'Municipal Living Lab',
                institution_type: 'government_lab',
                status: 'proposal',
                trl_start: entityType === 'solution' ? entity.trl : 3,
                trl_target: 6
            }).select().single();
            if (error) throw error;

            // Link back to source
            if (entityType === 'challenge') {
                await supabase.from('challenges').update({
                    linked_rd_ids: [...(entity.linked_rd_ids || []), rdProject.id]
                }).eq('id', entity.id);
            } else if (entityType === 'pilot') {
                await supabase.from('pilots').update({
                    linked_rd_ids: [...(entity.linked_rd_ids || []), rdProject.id]
                }).eq('id', entity.id);
            }

            return rdProject;
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
            toast.success('Routed to Living Lab');
        }
    });

    return { createLab, convertProjectToSolution, accreditLab, routeToLab };
}



