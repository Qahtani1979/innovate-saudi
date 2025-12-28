import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

/**
 * Hook to convert a challenge into a program (e.g. Accelerator, Hackathon)
 */
export function useConvertChallengeToProgram() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    return useMutation({
        /** @param {{ challenge: any, programData: any }} params */
        mutationFn: async ({ challenge, programData }) => {
            // 1. Create Program
            const { data: program, error: programError } = await supabase.from('programs')
                .insert(programData)
                .select()
                .single();

            if (programError) throw programError;

            // 2. Link Challenge to Program
            await supabase.from('challenges').update({
                linked_program_ids: [...(challenge.linked_program_ids || []), program.id]
            }).eq('id', challenge.id);

            // 3. Create Relation
            // @ts-ignore - challenge_relations might not be in the generated types yet
            await supabase.from('challenge_relations').insert({
                challenge_id: challenge.id,
                related_entity_type: 'program',
                related_entity_id: program.id,
                relation_role: 'informed_by',
                created_via: 'manual'
            });

            // 4. Log Activity
            await supabase.from('system_activities').insert({
                entity_type: 'challenge',
                entity_id: challenge.id,
                activity_type: 'program_created',
                description_en: `Program created from challenge: ${program.name_en}`
            });

            return program;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            toast.success(t({ en: 'Program created successfully', ar: 'تم إنشاء البرنامج بنجاح' }));
        }
    });
}

/**
 * Hook to convert a challenge into an R&D Call
 */
export function useConvertChallengeToRDCall() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    return useMutation({
        /** @param {{ challenge: any, rdCallData: any }} params */
        mutationFn: async ({ challenge, rdCallData }) => {
            // 1. Create RD Call
            const { data: rdCall, error: rdError } = await supabase.from('rd_calls')
                .insert(rdCallData)
                .select()
                .single();

            if (rdError) throw rdError;

            // 2. Create Relation
            // @ts-ignore
            await supabase.from('challenge_relations').insert({
                challenge_id: challenge.id,
                related_entity_type: 'rd_call',
                related_entity_id: rdCall.id,
                relation_role: 'informed_by'
            });

            // 3. Log Activity
            await supabase.from('system_activities').insert({
                activity_type: 'challenge_to_rd_call',
                entity_type: 'challenge',
                entity_id: challenge.id,
                description_en: `Created R&D Call: ${rdCall.title_en}`,
                metadata: { rd_call_id: rdCall.id }
            });

            return rdCall;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            queryClient.invalidateQueries({ queryKey: ['rd-calls'] });
            toast.success(t({ en: 'R&D Call created successfully', ar: 'تم إنشاء دعوة البحث بنجاح' }));
        }
    });
}

/**
 * Hook to convert a challenge proposal into a pilot
 */
export function useConvertProposalToPilot() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { triggerEmail } = useEmailTrigger();

    return useMutation({
        /** @param {{ proposal: any, challenge: any }} params */
        mutationFn: async ({ proposal, challenge }) => {
            const pilotCode = `PLT-${Date.now().toString().slice(-6)}`;

            // 1. Create Pilot
            const { data: pilot, error: pilotError } = await supabase.from('pilots').insert({
                code: pilotCode,
                title_en: `Pilot: ${proposal.proposal_title || proposal.title}`,
                title_ar: proposal.proposal_title || proposal.title,
                challenge_id: challenge.id,
                solution_id: proposal.solution_id,
                municipality_id: challenge.municipality_id,
                sector: challenge.sector,
                description_en: proposal.proposed_solution || proposal.description,
                objective_en: proposal.proposed_solution,
                duration_weeks: proposal.timeline ? parseInt(proposal.timeline) : 12,
                budget: proposal.budget_estimate,
                stage: 'design',
                status: 'draft'
            }).select().single();

            if (pilotError) throw pilotError;

            // 2. Update proposal status
            const { error: propError } = await supabase.from('challenge_proposals').update({
                status: 'accepted'
            }).eq('id', proposal.id);
            if (propError) throw propError;

            // 3. Update challenge with linked pilot
            const { error: challengeError } = await supabase.from('challenges').update({
                linked_pilot_ids: [...(challenge.linked_pilot_ids || []), pilot.id],
                track: 'pilot'
            }).eq('id', challenge.id);
            if (challengeError) throw challengeError;

            // 4. Trigger email notifications
            await triggerEmail('pilot.created', {
                entity_type: 'pilot',
                entity_id: pilot.id,
                variables: {
                    pilot_title: pilot.title_en,
                    pilot_code: pilot.code,
                    challenge_id: challenge.id,
                    proposal_title: proposal.proposal_title
                }
            }).catch(err => console.error('Email trigger failed:', err));

            await triggerEmail('proposal.approved', {
                entity_type: 'challenge_proposal',
                entity_id: proposal.id,
                variables: {
                    proposal_title: proposal.proposal_title,
                    challenge_title: challenge.title_en,
                    pilot_id: pilot.id
                }
            }).catch(err => console.error('Email trigger failed:', err));

            return pilot;
        },
        onSuccess: (pilot) => {
            queryClient.invalidateQueries({ queryKey: ['proposals'] });
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            queryClient.invalidateQueries({ queryKey: ['challenge'] });
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            toast.success(t({ en: 'Pilot created from proposal!', ar: 'تم إنشاء تجربة من المقترح!' }));
        },
        onError: (error) => {
            console.error('Conversion error:', error);
            toast.error(t({ en: 'Failed to create pilot', ar: 'فشل إنشاء التجربة' }));
        }
    });
}

/**
 * Hook to convert a challenge into an R&D Project
 */
export function useChallengeToRDConversion() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    return useMutation({
        /** @param {{ challenge: any, rdData: any, selectedCallId?: string }} params */
        mutationFn: async ({ challenge, rdData, selectedCallId }) => {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Create RD Project
            const { data: rdProject, error: rdError } = await supabase.from('rd_projects').insert({
                title_en: rdData.title,
                abstract_en: challenge.description_en,
                challenge_ids: [challenge.id],
                rd_call_id: selectedCallId || null,
                research_area: challenge.sector,
                status: 'proposal',
                trl_start: 1,
                trl_target: 4,
                created_by: user?.id
            }).select().single();

            if (rdError) throw rdError;

            // 2. Update challenge
            const { error: challengeError } = await supabase.from('challenges').update({
                linked_rd_ids: [...(challenge.linked_rd_ids || []), rdProject.id],
                track: 'r_and_d'
            }).eq('id', challenge.id);

            if (challengeError) throw challengeError;

            // 3. Log Activity
            await supabase.from('system_activities').insert({
                entity_type: 'challenge',
                entity_id: challenge.id,
                activity_type: 'rd_project_created',
                description_en: `R&D project created from challenge: ${rdProject.title_en}`
            });

            return rdProject;
        },
        onSuccess: (rdProject) => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
            toast.success(t({ en: 'R&D project created', ar: 'تم إنشاء مشروع البحث' }));
        },
        onError: (error) => {
            console.error('RD Conversion error:', error);
            toast.error(t({ en: 'Failed to create R&D project', ar: 'فشل إنشاء مشروع البحث' }));
        }
    });
}


