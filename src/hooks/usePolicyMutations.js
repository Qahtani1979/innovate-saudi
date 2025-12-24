import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger } from './useAuditLogger';
import { useLanguage } from '../components/LanguageContext';

/**
 * @typedef {Object} PolicyMetadata
 * @property {string} [title_en]
 * @property {string} [status]
 * @property {string} [priority]
 * @property {string} [source_entity_type]
 * @property {string} [source_entity_id]
 * @property {string} [change_reason]
 */

/**
 * Hook for centralized policy mutations with auditing and notifications.
 */
export function usePolicyMutations() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const { logActivity } = useAuditLogger();

    /**
     * Helper to log policy activities.
     */
    const logPolicyActivity = async (action, policyId, metadata = {}) => {
        await logActivity({
            action,
            entity_id: policyId,
            entity_type: 'policy_recommendation',
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString()
            }
        });

        // Also log to system_activities for broad visibility
        await supabase.from('system_activities').insert({
            activity_type: 'policy_' + action,
            entity_type: 'policy_recommendation',
            entity_id: policyId,
            description: `Policy ${action}: ${metadata.title_en || 'ID: ' + policyId}`,
            metadata
        });
    };

    /**
     * Create a new policy.
     */
    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, Error, any>}
     */
    const createPolicy = useMutation({
        mutationFn: async (data) => {
            const { data: policy, error } = await supabase
                .from('policy_recommendations')
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            return policy;
        },
        onSuccess: async (data) => {
            await logPolicyActivity('created', data.id, { title_en: data.title_en });
            queryClient.invalidateQueries({ queryKey: ['all-policies'] });
            toast.success(t({ en: 'Policy created successfully', ar: 'تم إنشاء السياسة بنجاح' }));
        },
        onError: (error) => {
            console.error('Policy creation failed:', error);
            toast.error(t({ en: 'Failed to create policy', ar: 'فشل إنشاء السياسة' }));
        }
    });

    /**
     * Update an existing policy.
     */
    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, Error, { id: string; data: any; metadata?: any }>}
     */
    const updatePolicy = useMutation({
        mutationFn: async ({ id, data, metadata = {} }) => {
            const { data: updated, error } = await supabase
                .from('policy_recommendations')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { updated, metadata };
        },
        onSuccess: async ({ updated, metadata }) => {
            await logPolicyActivity('updated', updated.id, {
                ...metadata,
                title_en: updated.title_en,
                status: updated.status
            });
            queryClient.invalidateQueries({ queryKey: ['all-policies'] });
            queryClient.invalidateQueries({ queryKey: ['policy', updated.id] });
        },
        onError: (error) => {
            console.error('Policy update failed:', error);
            toast.error(t({ en: 'Failed to update policy', ar: 'فشل تحديث السياسة' }));
        }
    });

    /**
     * Delete a policy.
     */
    /**
     * @type {import('@tanstack/react-query').UseMutationResult<string, Error, string>}
     */
    const deletePolicy = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('policy_recommendations')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: async (id) => {
            await logPolicyActivity('deleted', id);
            queryClient.invalidateQueries({ queryKey: ['all-policies'] });
            toast.success(t({ en: 'Policy deleted', ar: 'تم حذف السياسة' }));
        },
        onError: (error) => {
            console.error('Policy deletion failed:', error);
            toast.error(t({ en: 'Failed to delete policy', ar: 'فشل حذف السياسة' }));
        }
    });

    /**
     * Bulk update policies.
     */
    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, Error, { ids: string[]; data: any; metadata?: any }>}
     */
    const bulkUpdatePolicies = useMutation({
        mutationFn: async ({ ids, data, metadata = {} }) => {
            const { error } = await supabase
                .from('policy_recommendations')
                .update(data)
                .in('id', ids);

            if (error) throw error;
            return { ids, data, metadata };
        },
        onSuccess: async ({ ids, data, metadata }) => {
            for (const id of ids) {
                await logPolicyActivity('bulk_updated', id, { ...metadata, ...data });
            }
            queryClient.invalidateQueries({ queryKey: ['all-policies'] });
            toast.success(t({ en: 'Bulk update complete', ar: 'اكتمل التحديث الجماعي' }));
        },
        onError: (error) => {
            console.error('Bulk update failed:', error);
            toast.error(t({ en: 'Bulk update failed', ar: 'فشل التحديث الجماعي' }));
        }
    });

    /**
     * Bulk delete policies.
     */
    /**
     * @type {import('@tanstack/react-query').UseMutationResult<string[], Error, string[]>}
     */
    const bulkDeletePolicies = useMutation({
        mutationFn: async (ids) => {
            const { error } = await supabase
                .from('policy_recommendations')
                .delete()
                .in('id', ids);

            if (error) throw error;
            return ids;
        },
        onSuccess: async (ids) => {
            for (const id of ids) {
                await logPolicyActivity('bulk_deleted', id);
            }
            queryClient.invalidateQueries({ queryKey: ['all-policies'] });
            toast.success(t({ en: 'Policies deleted', ar: 'تم حذف السياسات' }));
        },
        onError: (error) => {
            console.error('Bulk deletion failed:', error);
            toast.error(t({ en: 'Failed to delete policies', ar: 'فشل حذف السياسات' }));
        }
    });

    return {
        createPolicy,
        updatePolicy,
        deletePolicy,
        bulkUpdatePolicies,
        bulkDeletePolicies,

        // Helper mutations
        /**
         * @type {import('@tanstack/react-query').UseMutationResult<any, Error, any>}
         */
        translatePolicy: useMutation({
            mutationFn: async (data) => {
                const { data: translationResponse, error } = await supabase.functions.invoke('translate-policy', {
                    body: { arabic_fields: data }
                });
                if (error) throw error;
                return translationResponse;
            }
        }),

        /**
         * @type {import('@tanstack/react-query').UseMutationResult<void, Error, void>}
         */
        generateEmbedding: useMutation({
            mutationFn: async () => {
                const { error } = await supabase.functions.invoke('generate-embeddings', {
                    body: {
                        entity_name: 'PolicyRecommendation',
                        mode: 'missing'
                    }
                });
                if (error) throw error;
            }
        }),

        /**
         * @type {import('@tanstack/react-query').UseMutationResult<{name: string, url: string}, Error, File>}
         */
        uploadAttachment: useMutation({
            mutationFn: async (file) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('policy_attachments')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('policy_attachments')
                    .getPublicUrl(filePath);

                return {
                    name: file.name,
                    url: publicUrl
                };
            }
        })
    };
}

/**
 * Hook for invalidating policy queries.
 */
export function usePolicyInvalidator() {
    const queryClient = useQueryClient();

    const invalidatePolicies = () => {
        return queryClient.invalidateQueries({ queryKey: ['all-policies'] });
    };

    const invalidatePolicy = (id) => {
        return queryClient.invalidateQueries({ queryKey: ['policy', id] });
    };

    return {
        invalidatePolicies,
        invalidatePolicy
    };
}
