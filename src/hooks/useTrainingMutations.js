import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '../components/LanguageContext';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { useMutation } from '@tanstack/react-query';

export function useTrainingMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { notify } = useNotificationSystem();
    const { logAction } = useAuditLogger();

    const enrollMunicipality = useMutation({
        mutationFn: async ({ municipalityId, programId }) => {
            const { data, error } = await supabase.functions.invoke('municipality-training-enroll', {
                body: {
                    municipalityId,
                    programId,
                    enrollmentDate: new Date().toISOString()
                }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['municipality', variables.municipalityId] });

            notify.success(t({ en: 'Enrolled successfully!', ar: 'تم التسجيل بنجاح!' }), {
                description: t({
                    en: 'You have been enrolled in the training program.',
                    ar: 'تم تسجيلك في البرنامج التدريبي.'
                })
            });

            logAction('training_enrollment', {
                municipalityId: variables.municipalityId,
                programId: variables.programId,
                status: 'success'
            });
        },
        onError: (error, variables) => {
            notify.error(t({ en: 'Enrollment failed', ar: 'فشل التسجيل' }), {
                description: error.message || t({ en: 'Please try again.', ar: 'يرجى المحاولة مرة أخرى.' })
            });

            logAction('training_enrollment_failed', {
                municipalityId: variables.municipalityId,
                programId: variables.programId,
                error: error.message
            });
        }
    });

    return {
        enrollMunicipality
    };
}

