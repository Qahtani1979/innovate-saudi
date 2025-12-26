import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

export function useMunicipalityMutations(onCreateSuccess) {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    const createMunicipality = useMutation({
        mutationFn: async (formDataInput) => {
            const { data, error } = await supabase
                .from('municipalities')
                .insert({
                    name_en: formDataInput.name_en,
                    name_ar: formDataInput.name_ar,
                    region: formDataInput.region,
                    city_type: formDataInput.city_type,
                    population: formDataInput.population || null,
                    contact_person: formDataInput.contact_person || null,
                    contact_email: formDataInput.contact_email || null,
                    mii_score: formDataInput.mii_score || 50,
                    mii_rank: formDataInput.mii_rank || 0,
                    is_active: true,
                    is_deleted: false
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['municipalities'] });
            queryClient.invalidateQueries({ queryKey: ['municipalities-with-visibility'] });
            toast.success(t({ en: 'Municipality created', ar: 'تم إنشاء البلدية' }));
            if (onCreateSuccess) onCreateSuccess(data);
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create municipality', ar: 'فشل إنشاء البلدية' }));
            console.error('Create error:', error);
        }
    });

    const updateMunicipality = useMutation({
        /**
         * @param {{ id: string } & Record<string, any>} params
         */
        mutationFn: async ({ id, ...data }) => {
            const { data: updated, error } = await supabase
                .from('municipalities')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return updated;
        },
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['municipalities-with-visibility'] });
            // Invalidate specific municipality query if it exists (e.g. from useMunicipality or list find)
            queryClient.invalidateQueries({ queryKey: ['municipality', updated.id] });
            toast.success(t({ en: 'Municipality updated successfully', ar: 'تم تحديث البلدية بنجاح' }));
        },
        onError: (error) => {
            console.error('Error updating municipality:', error);
            toast.error(t({ en: 'Failed to update municipality', ar: 'فشل تحديث البلدية' }));
        }
    });

    return {
        createMunicipality,
        updateMunicipality
    };
}

export default useMunicipalityMutations;

