import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useFileStorage } from './usePlatformCore';

/**
 * Hook for policy-related mutations
 * ✅ GOLD STANDARD COMPLIANT
 */
export function usePolicyMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { uploadMutation } = useFileStorage();

    // Create policy recommendation
    const createPolicy = useMutation({
        mutationFn: async (policyData) => {
            const { data, error } = await supabase
                .from('policy_recommendations')
                .insert(policyData)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['policies']);
            toast.success(t({ en: 'Policy created successfully', ar: 'تم إنشاء السياسة بنجاح' }));
        }
    });

    // Update policy recommendation
    const updatePolicy = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase
                .from('policy_recommendations')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['policies']);
            queryClient.invalidateQueries(['policy', data.id]);
            toast.success(t({ en: 'Policy updated successfully', ar: 'تم تحديث السياسة بنجاح' }));
        }
    });

    // Upload attachment and link to policy
    const uploadAttachment = useMutation({
        mutationFn: async ({ file, policyId, bucket = 'policy-documents' }) => {
            // 1. Upload to storage
            const uploadResult = await uploadMutation.mutateAsync({ file, bucket, folder: policyId });

            // 2. Create document record
            const { data, error } = await supabase
                .from('policy_documents')
                .insert({
                    policy_id: policyId,
                    title: file.name,
                    file_path: uploadResult.file_path,
                    file_type: file.type,
                    file_size: file.size,
                    public_url: uploadResult.file_url,
                    document_type: 'attachment'
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['policy-documents', variables.policyId]);
            toast.success(t({ en: 'Attachment uploaded', ar: 'تم رفع المرفق' }));
        }
    });

    return {
        createPolicy,
        updatePolicy,
        uploadAttachment,
        isPending: createPolicy.isPending || updatePolicy.isPending || uploadAttachment.isPending
    };
}

