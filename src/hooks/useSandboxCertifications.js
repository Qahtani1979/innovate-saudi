import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

export function useSandboxCertifications(sandboxId) {
    return useQuery({
        queryKey: ['sandbox-certifications', sandboxId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sandbox_certifications')
                .select('*')
                .eq('sandbox_id', sandboxId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!sandboxId
    });
}

export function useSandboxCertificationMutations() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const createCertification = useMutation({
        mutationFn: async (data) => {
            const { data: cert, error } = await supabase
                .from('sandbox_certifications')
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            return cert;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-certifications'] });
            toast.success(t({ en: 'Solution certified!', ar: 'تم اعتماد الحل!' }));
        },
        onError: (error) => {
            console.error('Error creating certification:', error);
            toast.error(t({ en: 'Failed to certify solution', ar: 'فشل اعتماد الحل' }));
        }
    });

    return { createCertification };
}
