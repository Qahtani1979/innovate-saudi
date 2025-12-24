import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../LanguageContext';

/**
 * Hook to convert a challenge into a program (e.g. Accelerator, Hackathon)
 */
export function useConvertChallengeToProgram() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
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
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: async ({ challenge, rdCallData }) => {
            // 1. Create RD Call
            const { data: rdCall, error: rdError } = await supabase.from('rd_calls')
                .insert(rdCallData)
                .select()
                .single();

            if (rdError) throw rdError;

            // 2. Create Relation
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
