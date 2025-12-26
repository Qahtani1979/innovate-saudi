
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

export function useTrainingMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

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
            toast.success(t({ en: 'Enrolled successfully!', ar: 'تم التسجيل بنجاح!' }));
        },
        onError: () => {
            toast.error(t({ en: 'Enrollment failed', ar: 'فشل التسجيل' }));
        }
    });

    return {
        enrollMunicipality
    };
}

