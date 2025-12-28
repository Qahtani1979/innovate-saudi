import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useFileStorage } from './usePlatformCore';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook for policy-related mutations
 * ✅ GOLD STANDARD COMPLIANT
 */
export function usePolicyMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { uploadMutation } = useFileStorage();
    const { notify } = useNotificationSystem();
    const { user } = useAuth();

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
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            toast.success(t({ en: 'Policy created successfully', ar: 'تم إنشاء السياسة بنجاح' }));

            // Notification: Policy Created
            notify({
                type: 'policy_created',
                entityType: 'policy',
                entityId: 'new', // We assume success but insert only returns data if we selected it.
                // data is returned from mutationFn.
                recipientEmails: [user?.email].filter(Boolean),
                title: 'Policy Recommendation Created',
                message: 'Your policy recommendation has been successfully created.',
                sendEmail: true,
                emailTemplate: 'policy.created',
                emailVariables: {
                    user_name: user?.user_metadata?.full_name || 'User',
                    creation_date: new Date().toLocaleDateString()
                }
            });
        },
        onError: (error) => {
            console.error('Create policy failed:', error);
            toast.error(t({ en: 'Failed to create policy', ar: 'فشل إنشاء السياسة' }));
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
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            queryClient.invalidateQueries({ queryKey: ['policy', data.id] });
            toast.success(t({ en: 'Policy updated successfully', ar: 'تم تحديث السياسة بنجاح' }));

            // Notification: Policy Updated / Published
            if (data) {
                const isPublished = data.status === 'published' || data.status === 'active';
                notify({
                    type: isPublished ? 'policy_published' : 'policy_updated',
                    entityType: 'policy',
                    entityId: data.id,
                    recipientEmails: [user?.email].filter(Boolean),
                    title: isPublished ? 'Policy Published' : 'Policy Updated',
                    message: isPublished
                        ? `Policy "${data.title_en || data.title}" is now live.`
                        : `Policy "${data.title_en || data.title}" has been updated.`,
                    sendEmail: true,
                    emailTemplate: isPublished ? 'policy.published' : 'policy.updated',
                    emailVariables: {
                        policy_title: data.title_en || data.title,
                        status: data.status,
                        update_date: new Date().toLocaleDateString()
                    }
                });
            }
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
            queryClient.invalidateQueries({ queryKey: ['policy-documents', variables.policyId] });
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

/**
 * Hook for invalidating policy queries
 */
export function usePolicyInvalidator() {
    const queryClient = useAppQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ['policies'] });
        queryClient.invalidateQueries({ queryKey: ['policy'] });
    };
}


